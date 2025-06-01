/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/job/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { MagnifyingGlassIcon, BriefcaseIcon, LinkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/contexts/ThemeContext'; // Import useTheme

interface Job {
  id: number;
  requirements: string;
  job_category_id: number;
  level: string;
  link: string;
  allowance: string | null;
  competitive: boolean;
  category: {
    skills: string[];
    name: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
  skills: string[];
  title?: string; // Added for parsed title
  parsedRequirements?: string[]; // Added for parsed requirements
}

interface JobSearchResponse {
  status: string;
  jobs: Job[];
}


const exampleJobData: JobSearchResponse = {
  status: "success",
  jobs: [
    {
      id: 229,
      requirements: "[\"Job Title:\", \"Part-Time Data Specialist (Remote)\", \"Location:\", \"Remote – U.S. Based\", \"Company:\", \"The LEGO Group\", \"Job Type:\", \"Part-Time (20–25 hours/week)\", \"About the LEGO Group:\", \"The LEGO Group is a global company driven by creativity, learning, and imagination. We’re passionate about empowering the builders of tomorrow through purposeful play, and we’re committed to innovation, sustainability, and creating a diverse and inclusive workplace. Join us and help shape the future—brick by brick.\", \"Position Summary:\", \"The LEGO Group is looking for a detail-oriented and tech-savvy\", \"Part-Time Remote Data Specialist\", \"to support our growing operations team. In this role, you’ll be responsible for collecting, cleaning, managing, and analyzing data to help inform key business decisions. This is an exciting opportunity for someone who enjoys working with data in a fast-paced, mission-driven environment.\", \"Key Responsibilities:\", \"Collect, organize, and maintain large sets of data from multiple sources\", \"Clean and validate data to ensure accuracy, completeness, and reliability\", \"Support internal teams by preparing reports, dashboards, and summaries using tools such as Excel, Power BI, or Google Data Studio\", \"Assist with data entry, migration, and database updates\", \"Identify data trends and anomalies to support strategic decision-making\", \"Collaborate with cross-functional teams, including marketing, product development, and operations\", \"Ensure data privacy and compliance with internal policies and industry regulations\", \"Qualifications:\", \"Associate degree or higher in Data Science, Business, Information Systems, or a related field (or equivalent experience)\", \"2+ years of experience working with data in an administrative, operations, or analytical role\", \"Proficiency with Microsoft Excel and/or Google Sheets (pivot tables, VLOOKUP, formulas, etc.)\", \"Familiarity with data visualization tools such as Power BI, Tableau, or Google Data Studio\", \"Strong analytical thinking and attention to detail\", \"Ability to work independently in a remote environment while managing multiple priorities\", \"Preferred Qualifications:\", \"Experience with CRM, ERP, or other business systems (e.g., Salesforce, SAP)\", \"Basic knowledge of SQL or Python for data manipulation\", \"Passion for the LEGO® brand and creativity-driven work\", \"Why Join the LEGO Group?\", \"Be part of a company that brings joy and creativity to millions\", \"Flexible remote work schedule\", \"Competitive part-time compensation\", \"A supportive, inclusive culture that values growth and innovation\", \"Opportunities to contribute to exciting projects and global initiatives\", \"Show more\", \"Show less\"]",
      job_category_id: 2,
      level: "Unknown",
      link: "https://www.linkedin.com/jobs/view/data-specialist-at-the-lego-group-4241080758",
      allowance: null,
      competitive: false,
      category: { skills: ["python", "data analysis"], name: "Data Science / ML", updated_at: "", created_at: "", id: 2 },
      skills: []
    },
    {
      id: 230,
      requirements: "[\"Job Title:\", \"Frontend Developer\", \"Location:\", \"New York, NY\", \"Company:\", \"Web Solutions LLC\", \"Job Type:\", \"Full-Time\", \"Position Summary:\", \"Seeking a skilled Frontend Developer to build engaging user interfaces.\", \"Key Responsibilities:\", \"Develop new user-facing features\", \"Build reusable code and libraries for future use\", \"Ensure the technical feasibility of UI/UX designs\", \"Qualifications:\", \"3+ years of experience with React, Angular, or Vue.js\", \"Proficiency in HTML, CSS, JavaScript\"]",
      job_category_id: 1,
      level: "Mid-Level",
      link: "https://example.com/job/frontend-dev",
      allowance: "$5000 equipment budget",
      competitive: true,
      category: { skills: ["react", "javascript", "css"], name: "Frontend Development", updated_at: "", created_at: "", id: 1 },
      skills: ["React", "JavaScript"]
    },
  ]
};

const parseJobData = (job: Job): Job => {
  try {
    const reqArray: string[] = JSON.parse(job.requirements);
    let title = "Job Details";
    const titleIndex = reqArray.findIndex(item => item.toLowerCase() === "job title:");
    if (titleIndex !== -1 && reqArray[titleIndex + 1]) {
      title = reqArray[titleIndex + 1];
    } else {
      const commonTitle = reqArray.find(item => item.toLowerCase().includes("developer") || item.toLowerCase().includes("engineer") || item.toLowerCase().includes("specialist"));
      if (commonTitle) title = commonTitle;
    }
    return { ...job, title, parsedRequirements: reqArray };
  } catch (e) {
    console.error("Failed to parse job requirements for job ID:", job.id, e);
    return { ...job, title: "Job Details (Parsing Error)", parsedRequirements: [job.requirements] };
  }
};


export default function JobSuggestionPage() {
  const { selectedTheme } = useTheme();
  const [jobTitleQuery, setJobTitleQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundJobs, setFoundJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const handleSearchJobs = async (event: FormEvent) => {
    event.preventDefault();
    if (!jobTitleQuery.trim()) {
      alert("Please enter a job title to search.");
      return;
    }
    setIsLoading(true);
    setFoundJobs([]);
    setSelectedJobId(null);
    console.log("Searching for jobs with title:", jobTitleQuery);

    await new Promise(resolve => setTimeout(resolve, 1500));
    const data: JobSearchResponse = {
        status: "success",
        jobs: exampleJobData.jobs.filter(job =>
            job.requirements.toLowerCase().includes(jobTitleQuery.toLowerCase())
        ).map(parseJobData)
    };

    if (data.status === "success" && data.jobs) {
      setFoundJobs(data.jobs.slice(0, 3).map(parseJobData));
    } else {
      alert("No jobs found or an error occurred.");
      setFoundJobs([]);
    }
    setIsLoading(false);
  };

  const toggleJobDetails = (jobId: number) => {
    setSelectedJobId(selectedJobId === jobId ? null : jobId);
  };

  const formatRequirements = (requirements?: string[]) => {
    if (!requirements) return <p>No details available.</p>;
    
    const sections: { title: string; items: string[] }[] = [];
    let currentSection: { title: string; items: string[] } | null = null;
    const potentialSectionTitles = ["job title:", "location:", "company:", "job type:", "about", "summary:", "responsibilities:", "qualifications:", "preferred qualifications:", "why join"];

    requirements.forEach(item => {
      const lowerItem = item.toLowerCase();
      const isTitle = potentialSectionTitles.some(title => lowerItem.startsWith(title));

      if (isTitle) {
        if (currentSection) sections.push(currentSection);
        const titleEndIndex = item.indexOf(':');
        const title = titleEndIndex !== -1 ? item.substring(0, titleEndIndex + 1) : item;
        const content = titleEndIndex !== -1 ? item.substring(titleEndIndex + 1).trim() : "";
        currentSection = { title: title.trim(), items: [] };
        if (content) currentSection.items.push(content);
      } else if (currentSection) {
        currentSection.items.push(item.trim());
      } else {
        if (!sections.find(s => s.title === "General Information")) {
          sections.push({ title: "General Information", items: [] });
        }
        sections[sections.length - 1].items.push(item.trim());
      }
    });
    if (currentSection) sections.push(currentSection);

    return (
      <div className="space-y-4 text-left">
        {sections.map((section, idx) => (
          section.items.length > 0 && (
            <div key={idx}>
              <h4 className={`text-md font-semibold text-gray-700 mb-1 capitalize`}>
                {section.title.replace(/:$/, '')}
              </h4>
              {section.title.toLowerCase().includes("responsibilities") || section.title.toLowerCase().includes("qualifications") ? (
                <ul className={`list-disc list-inside space-y-1 pl-4 text-sm text-gray-600`}>
                  {section.items.map((detail, i) => <li key={i}>{detail}</li>)}
                </ul>
              ) : (
                <p className={`text-sm text-gray-600 whitespace-pre-line`}>{section.items.join('\n')}</p>
              )}
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="py-10 px-4">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-bold text-gray-800`}>
          <span className={`text-gray-600`}>Job</span> Finding
        </h1>
        <p className={`text-lg text-gray-600 mt-2`}>Search for job titles and explore opportunities.</p>
      </div>

      <form onSubmit={handleSearchJobs} className="max-w-xl mx-auto mb-10">
        <div className={`flex items-center border-2 border-gray-500 rounded-lg shadow-sm overflow-hidden`}>
          <input
            type="text"
            value={jobTitleQuery}
            onChange={(e) => setJobTitleQuery(e.target.value)}
            placeholder="Enter job title (e.g., Software Engineer)"
            className={`w-full p-3 text-gray-700 focus:outline-none bg-white placeholder-gray-400`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !jobTitleQuery.trim()}
            className={`bg-gray-600 hover:bg-gray-700 text-white font-semibold p-3 px-6 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className={`text-center text-gray-700 py-10`}>
          <svg className={`animate-spin h-8 w-8 text-gray-600 mx-auto mb-3`}  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-lg font-semibold">Searching for jobs...</p>
        </div>
      )}

      {!isLoading && foundJobs.length === 0 && jobTitleQuery && (
        <div className={`text-center text-gray-600 py-10`}>
          <BriefcaseIcon className={`h-12 w-12 text-gray-400 mx-auto mb-3`} />
          <p className="text-lg">No jobs found matching your query. Try a different title.</p>
        </div>
      )}

      {!isLoading && foundJobs.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className={`text-2xl font-semibold text-gray-800 text-center mb-6`}>Matching Opportunities</h2>
          {foundJobs.map((job) => (
            <div key={job.id} className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden`}>
              <button
                onClick={() => toggleJobDetails(job.id)}
                className={`w-full flex justify-between items-center p-4 sm:p-5 text-left hover:bg-gray-50 focus:outline-none`}
              >
                <span className={`text-lg font-medium text-gray-700`}>{job.title || "Job Details"}</span>
                {selectedJobId === job.id ? (
                  <ChevronUpIcon className={`h-6 w-6 text-gray-500`} />
                ) : (
                  <ChevronDownIcon className={`h-6 w-6 text-gray-500`} />
                )}
              </button>
              {selectedJobId === job.id && (
                <div className={`p-4 sm:p-6 border-t border-gray-200 bg-gray-50`}>
                  {formatRequirements(job.parsedRequirements)}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition flex items-center`}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" /> View Original Job Posting
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


