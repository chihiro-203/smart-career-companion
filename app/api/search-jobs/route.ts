/* eslint-disable prefer-const */
// app/api/search-jobs/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_PUBLIC_URL || "https://scc.up.railway.app";

interface FastAPIJobCategory {
  id: number;
  name: string;
  skills?: string[];
}
interface FastAPIJobSkill {
  id: number;
  name: string;
}
interface FastAPIJob {
  id: number;
  requirements: string;
  level: string | null;
  allowance: string | number | null;
  competitive: boolean | number | null;
  link: string;
  category: FastAPIJobCategory | null;
  skills: FastAPIJobSkill[];
}
interface FrontendJob {
  id: number | string;
  title: string;
  link: string;
  source?: string;
  requirements: string;
  skills?: string[];
  level?: string;
  allowance?: string | number | null;
  competitive?: boolean | number | null;
  category?: string;
}

function extractTitleFromRequirements(
  requirementsString: string,
  jobLink: string,
  jobCategoryName?: string | null
): string {
  let extractedTitle = "Job Details"; // Default
  try {
    if (
      typeof requirementsString !== "string" ||
      !requirementsString.startsWith("[")
    ) {
      // Not a JSON array string, might be a plain description or already a title
      const firstMeaningfulLine =
        requirementsString
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)[0] || requirementsString;
      if (firstMeaningfulLine.length < 100 && firstMeaningfulLine.length > 2) {
        // Heuristic for title-like line
        extractedTitle = firstMeaningfulLine;
      } else {
        // Fallback for very long plain strings
        extractedTitle =
          requirementsString.substring(0, 70).trim() +
          (requirementsString.length > 70 ? "..." : "");
      }
      // console.log(`Extracted title (non-JSON path) for ${jobLink}: ${extractedTitle}`);
      return extractedTitle;
    }

    const reqArray: string[] = JSON.parse(requirementsString);
    const titleIndex = reqArray.findIndex(
      (item) => item.toLowerCase().trim() === "job title:"
    );
    if (titleIndex !== -1 && reqArray[titleIndex + 1]) {
      extractedTitle = reqArray[titleIndex + 1].trim();
      // console.log(`Extracted title (Job Title: path) for ${jobLink}: ${extractedTitle}`);
      return extractedTitle;
    }

    // Fallback: Try to find a title-like line if "Job Title:" is missing
    const companyIndex = reqArray.findIndex(
      (item) => item.toLowerCase().trim() === "company:"
    );
    let companyNameSuffix = "";
    if (companyIndex !== -1 && reqArray[companyIndex + 1]) {
      companyNameSuffix = ` at ${reqArray[companyIndex + 1].trim()}`;
    }

    const commonTitleLine = reqArray.find(
      (item) =>
        [
          "developer",
          "engineer",
          "specialist",
          "manager",
          "analyst",
          "designer",
          "lead",
          "architect",
        ].some((term) => item.toLowerCase().includes(term) && item.length < 100) // Heuristic: title lines are usually not too long
    );

    if (commonTitleLine) {
      extractedTitle = commonTitleLine.trim() + companyNameSuffix;
    } else if (jobCategoryName) {
      // If no specific title found in requirements, use the category name as a fallback title
      extractedTitle = jobCategoryName + companyNameSuffix;
    }
    // console.log(`Extracted title (fallback path) for ${jobLink}: ${extractedTitle}`);
    return extractedTitle;
  } catch (e) {
    console.warn(
      `Could not parse/extract title from requirements for ${jobLink}. Error: ${
        (e as Error).message
      }. Raw: ${requirementsString.substring(0, 100)}...`
    );
    if (typeof requirementsString === "string") {
      // If parsing failed but it's a string
      return (
        requirementsString.substring(0, 70).trim() +
        (requirementsString.length > 70 ? "..." : "")
      );
    }
  }
  return extractedTitle; // Return default or last known good value
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const titleQuery = searchParams.get("title");

  if (!FASTAPI_BASE_URL) {
    return NextResponse.json(
      { status: "error", message: "Server config error." },
      { status: 500 }
    );
  }
  if (!titleQuery) {
    /* ... error handling ... */ return NextResponse.json(
      { status: "error", message: "Job title query required." },
      { status: 400 }
    );
  }

  try {
    const scrapeUrl = `${FASTAPI_BASE_URL}/job-scraper?title=${encodeURIComponent(
      titleQuery
    )}`;
    const scrapeResponse = await fetch(scrapeUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!scrapeResponse.ok) {
      /* ... error handling ... */ throw new Error(
        `Scraping failed: ${scrapeResponse.statusText}`
      );
    }
    const scrapeResult = await scrapeResponse.json();
    if (scrapeResult.status !== "success")
      throw new Error(scrapeResult.message || "Scraping error.");
    console.log(
      `API: FastAPI scraped ${scrapeResult.count || 0} jobs for: ${titleQuery}`
    );

    // Fetch using category_name derived from titleQuery
    const categoryToFetch = titleQuery; // Use the search query directly as category for now
    const limitForFetch = 10;
    let fetchJobsUrl = `${FASTAPI_BASE_URL}/job-scraper?limit=${limitForFetch}&offset=0&category_name=${encodeURIComponent(
      categoryToFetch
    )}`;
    console.log(`API: Calling FastAPI GET (category): ${fetchJobsUrl}`);
    let fetchJobsResponse = await fetch(fetchJobsUrl, {
      headers: { Accept: "application/json" },
    });
    let fetchedData = await fetchJobsResponse.json();

    // Fallback if category search yields no results or fails (but not a network error)
    if (
      !fetchJobsResponse.ok ||
      fetchedData.status !== "success" ||
      !fetchedData.jobs ||
      fetchedData.jobs.length === 0
    ) {
      console.log(
        `API: Category fetch for "${categoryToFetch}" yielded no/few results or failed. Trying generic fetch.`
      );
      const genericFetchUrl = `${FASTAPI_BASE_URL}/job-scraper?limit=20&offset=0`; // Fetch more for generic
      console.log(`API: Calling FastAPI GET (generic): ${genericFetchUrl}`);
      fetchJobsResponse = await fetch(genericFetchUrl, {
        headers: { Accept: "application/json" },
      });
      if (!fetchJobsResponse.ok)
        throw new Error(
          `Generic job fetch also failed: ${fetchJobsResponse.statusText}`
        );
      fetchedData = await fetchJobsResponse.json();
      if (fetchedData.status !== "success" || !fetchedData.jobs) {
        throw new Error(
          fetchedData.message ||
            "Generic job fetch did not return successful data."
        );
      }
    }

    const jobsForFrontend: FrontendJob[] = fetchedData.jobs.map(
      (fj: FastAPIJob) => ({
        id: fj.id,
        title: extractTitleFromRequirements(
          fj.requirements,
          fj.link,
          fj.category?.name
        ), // Pass category name
        link: fj.link,
        source: fj.category?.name || "Database",
        requirements: fj.requirements,
        skills: fj.skills?.map((s) => s.name) || [],
        level: fj.level || "N/A",
        allowance: fj.allowance,
        competitive: fj.competitive,
        category: fj.category?.name || "N/A",
      })
    );

    const normalizedTitleQuery = titleQuery.toLowerCase();
    const queryTerms = normalizedTitleQuery
      .split(" ")
      .filter((term) => term.length > 2); // Split query into terms

    const filteredAndLimitedJobs = jobsForFrontend
      .filter((job) => {
        const jobTitleLower = job.title.toLowerCase();
        const jobCategoryLower =
          typeof job.category === "string" ? job.category.toLowerCase() : "";

        // Check if extracted title contains any of the query terms
        const titleMatches = queryTerms.some((term) =>
          jobTitleLower.includes(term)
        );
        // Check if category name contains any of the query terms
        const categoryMatches = jobCategoryLower
          ? queryTerms.some((term) => jobCategoryLower.includes(term))
          : false;

        let requirementsMatch = false;
        try {
          const parsedReqs = JSON.parse(job.requirements);
          if (Array.isArray(parsedReqs)) {
            // Check if requirements contain any of the query terms
            requirementsMatch = parsedReqs.some(
              (r: string) =>
                typeof r === "string" &&
                queryTerms.some((term) => r.toLowerCase().includes(term))
            );
          }
        } catch (e) {
          console.error(e);
          const skillsMatch =
            job.skills &&
            job.skills.some((s) =>
              queryTerms.some((term) => s.toLowerCase().includes(term))
            );

          return (
            titleMatches || categoryMatches || requirementsMatch || skillsMatch
          );
        }
      })
      .slice(0, 3);

    console.log(
      `API: Returning ${filteredAndLimitedJobs.length} jobs to frontend for query: ${titleQuery}`
    );
    return NextResponse.json({
      status: "success",
      jobs: filteredAndLimitedJobs,
    });
  } catch (error) {
    console.error("Next.js API Route /api/search-jobs Uncaught Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: (error as Error).message || "Error searching jobs.",
      },
      { status: 500 }
    );
  }
}
