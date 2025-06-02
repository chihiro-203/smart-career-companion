// app/api/search-jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.FASTAPI_PUBLIC_URL; // Ensure this is in .env.local (e.g., FASTAPI_PUBLIC_URL=https://scc.up.railway.app)

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
  requirements: string; // EXPECTED: A JSON string representing an array of strings, e.g., "[\"Req 1\", \"Req 2\"]"
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
  requirements: string; // Passed through as the JSON string of an array for frontend to parse
  skills?: string[];
  level?: string;
  allowance?: string | number | null;
  competitive?: boolean | number | null;
  category?: string;
}

function extractTitleFromRequirements(requirementsString: string, jobLink: string): string {
    try {
        // This function now strictly expects requirementsString to be a JSON parsable array string
        const reqArray: string[] = JSON.parse(requirementsString);
        if (!Array.isArray(reqArray)) { // Should not happen if backend sends correct JSON array string
            throw new Error("Parsed requirements is not an array.");
        }

        const titleIndex = reqArray.findIndex(item => typeof item === 'string' && item.toLowerCase().trim() === "job title:");
        if (titleIndex !== -1 && reqArray[titleIndex + 1]) {
            return reqArray[titleIndex + 1].trim();
        }

        const companyIndex = reqArray.findIndex(item => typeof item === 'string' && item.toLowerCase().trim() === "company:");
        let companyName = "";
        if (companyIndex !== -1 && reqArray[companyIndex + 1]) {
            companyName = ` at ${reqArray[companyIndex + 1].trim()}`;
        }
        
        const commonTitleKeywords = ["developer", "engineer", "specialist", "manager", "analyst", "designer", "lead", "architect"];
        const commonTitle = reqArray.find(item =>
            typeof item === 'string' && commonTitleKeywords.some(keyword => item.toLowerCase().includes(keyword)) && item.length < 100
        );
        if (commonTitle) return commonTitle.trim() + companyName;

    } catch (e) {
        console.warn(`API Route: Could not extract title from requirements for ${jobLink}. Error: ${(e as Error).message}. Raw: ${String(requirementsString).substring(0,100)}...`);
        // Fallback if it's not a parsable JSON array string, but just a plain string (should be rare if backend is fixed)
        if (typeof requirementsString === 'string') {
            const firstLine = requirementsString.split('\n')[0].trim();
            if(firstLine.length > 3 && firstLine.length < 100) return firstLine; // Assume it's title-like
            return requirementsString.substring(0, 70).trim() + (requirementsString.length > 70 ? "..." : "");
        }
    }
    return "Job Details";
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const titleQuery = searchParams.get('title');

  if (!FASTAPI_BASE_URL) {
    console.error("FATAL API Route: FASTAPI_PUBLIC_URL environment variable is not set.");
    return NextResponse.json({ status: 'error', message: 'Server configuration error: Backend URL missing.' }, { status: 500 });
  }

  if (!titleQuery) {
    return NextResponse.json({ status: 'error', message: 'Job title query parameter is required.' }, { status: 400 });
  }

  try {
    const scrapeUrl = `${FASTAPI_BASE_URL}/job-scraper?title=${encodeURIComponent(titleQuery)}`;
    console.log(`API Route: Calling FastAPI POST to scrape: ${scrapeUrl}`);
    const scrapeResponse = await fetch(scrapeUrl, { method: 'POST', headers: { 'Accept': 'application/json' } });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      let errorDetail = `Scraping initiation failed: ${scrapeResponse.statusText || scrapeResponse.status}`;
      try { const errorData = JSON.parse(errorText); errorDetail = errorData.detail?.[0]?.msg || errorData.message || errorDetail; }
      catch (e) { console.warn("API Route: FastAPI POST error response was not valid JSON:", errorText); }
      console.error("API Route: FastAPI POST /job-scraper error:", scrapeResponse.status, errorDetail);
      throw new Error(errorDetail);
    }
    const scrapeResult = await scrapeResponse.json();
    if (scrapeResult.status !== 'success') throw new Error(scrapeResult.message || "Scraping process on backend reported an issue.");
    console.log(`API Route: FastAPI scraped and saved ${scrapeResult.count || 0} jobs for: ${titleQuery}`);

    const limitForFetch = 20;
    const fetchJobsUrl = `${FASTAPI_BASE_URL}/job-scraper?limit=${limitForFetch}&offset=0`;
    console.log(`API Route: Calling FastAPI GET to fetch jobs: ${fetchJobsUrl}`);
    const fetchJobsResponse = await fetch(fetchJobsUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });

    if (!fetchJobsResponse.ok) {
      const errorText = await fetchJobsResponse.text();
      let errorDetail = `Fetching jobs failed: ${fetchJobsResponse.statusText || fetchJobsResponse.status}`;
      try { const errorData = JSON.parse(errorText); errorDetail = errorData.detail?.[0]?.msg || errorData.message || errorDetail; }
      catch (e) { console.warn("API Route: FastAPI GET error response was not valid JSON:", errorText); }
      console.error("API Route: FastAPI GET /job-scraper error:", fetchJobsResponse.status, errorDetail);
      throw new Error(errorDetail);
    }
    const fetchedData = await fetchJobsResponse.json();
    if (fetchedData.status !== 'success' || !fetchedData.jobs) throw new Error(fetchedData.message || "FastAPI GET /job-scraper did not return successful job data.");

    const jobsForFrontend: FrontendJob[] = fetchedData.jobs.map((fj: FastAPIJob) => ({
      id: fj.id,
      title: extractTitleFromRequirements(fj.requirements, fj.link),
      link: fj.link,
      source: fj.category?.name || "Database",
      requirements: fj.requirements, // This is the JSON string of an array
      skills: fj.skills?.map(s => s.name) || [],
      level: fj.level || "N/A",
      allowance: fj.allowance,
      competitive: fj.competitive,
      category: fj.category?.name || "N/A",
    }));

    const normalizedTitleQuery = titleQuery.toLowerCase().trim();
    const filteredAndLimitedJobs = jobsForFrontend.filter(job => {
        const jobTitleLower = job.title.toLowerCase();
        let requirementsMatch = false;
        try {
            if (typeof job.requirements === 'string' && job.requirements.trim().startsWith('[')) {
                const parsedReqs = JSON.parse(job.requirements);
                if (Array.isArray(parsedReqs)) {
                    requirementsMatch = parsedReqs.some((r: string) => typeof r === 'string' && r.toLowerCase().includes(normalizedTitleQuery));
                }
            } else if (typeof job.requirements === 'string') { // Fallback for plain string requirements
                 requirementsMatch = job.requirements.toLowerCase().includes(normalizedTitleQuery);
            }
        } catch (e) {
            if (typeof job.requirements === 'string') {
                requirementsMatch = job.requirements.toLowerCase().includes(normalizedTitleQuery);
            }
            console.warn(`API Route Filtering: Could not parse reqs for job ID ${job.id}. Raw search. Error: ${(e as Error).message}`);
        }
        const skillsMatch = job.skills && job.skills.some(s => s.toLowerCase().includes(normalizedTitleQuery));
        return jobTitleLower.includes(normalizedTitleQuery) || requirementsMatch || skillsMatch;
    }).slice(0, 3);

    console.log(`API Route: Returning ${filteredAndLimitedJobs.length} jobs to frontend for query: ${titleQuery}`);
    return NextResponse.json({ status: 'success', jobs: filteredAndLimitedJobs });

  } catch (error) {
    console.error("API Route /api/search-jobs Uncaught Error:", error);
    const errorMessage = (error as Error).message || 'An unexpected error occurred.';
    if ((error as any).cause?.code === 'ECONNREFUSED') {
        return NextResponse.json({ status: 'error', message: `Could not connect to backend at ${FASTAPI_BASE_URL}. Ensure it's running.` }, { status: 503 });
    }
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}