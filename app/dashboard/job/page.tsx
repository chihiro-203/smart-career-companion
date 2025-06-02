// app/dashboard/job/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface JobCategoryFromFrontend {
  name: string;
}

interface JobUIData {
  id: number | string;
  title: string;
  link: string;
  source?: string;
  requirements: string;
  skills?: string[];
  level?: string;
  allowance?: string | number | null;
  competitive?: boolean | number | null;
  category?: string | JobCategoryFromFrontend;
  parsedRequirements?: string[];
}

interface JobSearchAPIResponseFromNext {
  status: string;
  jobs: JobUIData[];
  message?: string;
}

const processJobDataForUI = (job: JobUIData): JobUIData => {
  let parsedRequirements: string[] = [];
  try {
    const reqArray: string[] = JSON.parse(job.requirements);
    if (Array.isArray(reqArray)) {
      parsedRequirements = reqArray;
    } else {
      console.warn(
        "Parsed requirements is not an array for job:",
        job.title,
        reqArray
      );
      parsedRequirements = ["Requirements format from API is unexpected."];
    }
  } catch (e) {
    console.warn(
      `UI: Could not parse requirements for job: ${
        job.title
      }. Raw: ${job.requirements.substring(0, 100)}... Error: ${
        (e as Error).message
      }`
    );
    if (typeof job.requirements === "string") {
      const lines = job.requirements
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (
        lines.length > 0 &&
        !(lines.length === 1 && lines[0] === job.requirements)
      ) {
        parsedRequirements = lines;
      } else {
        parsedRequirements = [
          "Detailed requirements could not be fully parsed. Please check the original link.",
        ];
      }
    } else {
      parsedRequirements = [
        "Requirements data unavailable or in an unexpected format.",
      ];
    }
  }
  return { ...job, parsedRequirements };
};

export default function JobSuggestionPage() {
  const [jobTitleQuery, setJobTitleQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundJobs, setFoundJobs] = useState<JobUIData[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(
    null
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchJobs = async (event: FormEvent) => {
    event.preventDefault();
    if (!jobTitleQuery.trim()) {
      setSearchError("Please enter a job title to search.");
      return;
    }
    setIsLoading(true);
    setFoundJobs([]);
    setSelectedJobId(null);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/search-jobs?title=${encodeURIComponent(jobTitleQuery.trim())}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Search failed with an unknown error." }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      const data: JobSearchAPIResponseFromNext = await response.json();

      if (data.status === "success" && data.jobs) {
        const processed = data.jobs.map(processJobDataForUI);
        setFoundJobs(processed);
        if (processed.length === 0) {
          setSearchError(
            "No jobs found matching your query. Try different keywords or broaden your search."
          );
        }
      } else {
        setSearchError(
          data.message ||
            "No jobs found or an error occurred during the search."
        );
      }
    } catch (error) {
      setSearchError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJobDetails = (jobId: number | string) => {
    setSelectedJobId(selectedJobId === jobId ? null : jobId);
  };

  const formatRequirements = (requirements?: string[]) => {
    if (!requirements || requirements.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          No detailed requirements available. Please check the original job
          posting.
        </p>
      );
    }
    const sections: { title: string; items: string[]; isList?: boolean }[] = [];
    let currentSectionTitle: string | null = null;
    let currentItems: string[] = [];
    const potentialSectionTitles = [
      "job title",
      "location",
      "company",
      "job type",
      "about",
      "summary",
      "overview",
      "responsibilities",
      "key responsibilities",
      "duties",
      "what you'll do",
      "your role",
      "qualifications",
      "requirements",
      "skills",
      "experience",
      "education",
      "what you bring",
      "preferred qualifications",
      "nice to have",
      "bonus points",
      "ideal candidate",
      "why join",
      "benefits",
      "what we offer",
      "perks",
      "As a Web Developer, You Will",
      "We Are Looking For Someone With",
      "B.E./ B.Tech/ BCA/ MCA",
      "Following Aspects Would Be a Plus",
      "",
    ];

    requirements.forEach((item) => {
      const trimmedItem = item.trim();
      if (!trimmedItem) return;
      let isNewSectionLead = false;
      for (const title of potentialSectionTitles) {
        if (trimmedItem.toLowerCase().startsWith(title.toLowerCase())) {
          const potentialHeadingPattern = new RegExp(
            `^${title}(\\s*:\\s*|\\s+[^a-z\\d]*$)`,
            "i"
          );
          if (
            potentialHeadingPattern.test(trimmedItem) ||
            trimmedItem.length < title.length + 25
          ) {
            if (currentSectionTitle !== null && currentItems.length > 0) {
              sections.push({
                title: currentSectionTitle,
                items: currentItems,
                isList: [
                  "responsibilities",
                  "qualifications",
                  "skills",
                  "duties",
                  "requirements",
                  "benefits",
                  "perks",
                  "key responsibilities",
                  "preferred qualifications",
                  "what you bring",
                ].some((s) => currentSectionTitle!.toLowerCase().includes(s)),
              });
            }
            currentSectionTitle = trimmedItem.replace(/:$/, "").trim();
            currentItems = [];
            isNewSectionLead = true;
            const colonIndex = trimmedItem.indexOf(":");
            if (
              colonIndex !== -1 &&
              trimmedItem.substring(colonIndex + 1).trim()
            ) {
              currentItems.push(trimmedItem.substring(colonIndex + 1).trim());
            }
            break;
          }
        }
      }
      if (!isNewSectionLead) {
        if (currentSectionTitle === null) currentSectionTitle = "Details";
        currentItems.push(trimmedItem);
      }
    });
    if (currentSectionTitle !== null && currentItems.length > 0) {
      sections.push({
        title: currentSectionTitle,
        items: currentItems,
        isList: [
          "responsibilities",
          "qualifications",
          "skills",
          "duties",
          "requirements",
          "benefits",
          "perks",
          "key responsibilities",
          "preferred qualifications",
          "what you bring",
        ].some((s) => currentSectionTitle!.toLowerCase().includes(s)),
      });
    }
    if (sections.length === 0 && requirements.length > 0) {
      return (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {requirements.join("\n")}
        </div>
      );
    }
    return (
      <div className="space-y-5 text-left">
        {sections.map(
          (section, idx) =>
            section.items.length > 0 && (
              <div key={idx}>
                <h4 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                  {section.title}
                </h4>
                {section.isList ? (
                  <ul className="list-disc list-inside space-y-1 pl-5 text-sm text-gray-700">
                    {section.items.map((detail, i) => (
                      <li key={i} className="leading-relaxed">
                        {detail}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {section.items.join("\n")}
                  </p>
                )}
              </div>
            )
        )}
      </div>
    );
  };

  return (
    <div className="py-10 px-4">
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-bold text-gray-800`}>
          <span className={`text-gray-600`}>Job</span> Finder
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Search for job titles and explore relevant opportunities.
        </p>
      </div>
      <form onSubmit={handleSearchJobs} className="max-w-xl mx-auto mb-12">
        <label htmlFor="job-title-search" className="sr-only">
          Job Title
        </label>
        <div className="flex items-center border-2 border-gray-600 rounded-xl shadow-md overflow-hidden bg-white">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mx-3 flex-shrink-0" />
          <input
            id="job-title-search"
            type="text"
            value={jobTitleQuery}
            onChange={(e) => setJobTitleQuery(e.target.value)}
            placeholder="Enter job title (e.g., Software Engineer)"
            className="w-full p-3 text-gray-700 focus:outline-none placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !jobTitleQuery.trim()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-5 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center text-gray-700 py-10">
          <svg
            className="animate-spin h-10 w-10 text-gray-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-xl font-semibold">Searching for jobs...</p>
        </div>
      )}
      {searchError && !isLoading && (
        <div className="max-w-xl mx-auto text-center text-red-700 py-8 bg-red-50 p-6 rounded-xl shadow border border-red-200">
          <BriefcaseIcon className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-semibold">Search Issue</p>
          <p className="text-sm">{searchError}</p>
        </div>
      )}

      {!isLoading && !searchError && foundJobs.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Found {foundJobs.length} Matching Opportunity
            {foundJobs.length === 1 ? "y" : "ies"}
          </h2>
          {foundJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleJobDetails(job.id)}
                className="w-full flex justify-between items-center p-4 sm:p-6 text-left hover:bg-gray-50 focus:outline-none"
                aria-expanded={selectedJobId === job.id}
                aria-controls={`job-details-${job.id}`}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className="text-lg md:text-xl font-semibold text-gray-700 block truncate"
                    title={job.title}
                  >
                    {job.title}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    Source: {job.source || "N/A"} • Level: {job.level || "N/A"}{" "}
                    • Category:{" "}
                    {
                      // Explicitly handle the category display
                      job.category
                        ? typeof job.category === "string"
                          ? job.category
                          : job.category.name
                        : "N/A"
                    }
                  </span>
                </div>
                {selectedJobId === job.id ? (
                  <ChevronUpIcon className="h-6 w-6 text-gray-500 flex-shrink-0 ml-3" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6 text-gray-500 flex-shrink-0 ml-3" />
                )}
              </button>
              {selectedJobId === job.id && (
                <div
                  id={`job-details-${job.id}`}
                  className="p-4 sm:p-6 border-t border-gray-200 bg-slate-50"
                >
                  {formatRequirements(job.parsedRequirements)}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition shadow hover:shadow-md"
                  >
                    <LinkIcon className="h-5 w-5 mr-2" /> View Original Job
                    Posting
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
