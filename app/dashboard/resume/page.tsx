/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/resume/page.tsx
"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import React, { ChangeEvent, FC, FormEvent, useState } from "react";

interface MatchedSkill {
  skill: string;
  matchStrength: "High" | "Moderate" | "Low" | string;
  notes?: string;
  evidence?: string[];
}

interface MissingSkill {
  skill: string;
  criticality: "High" | "Medium" | "Low" | string;
  notes?: string;
}

interface SkillAnalysis {
  requiredSkillsFromJD: string[];
  candidateSkillsFromCV: string[];
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  additionalSkillsFromCV: string[];
}

interface RelevantRole {
  title: string;
  company: string;
  duration: string;
  alignmentNotes: string;
}

interface ExperienceAnalysis {
  requiredExperienceYears: string;
  candidateExperienceYears: string;
  experienceMatch: boolean;
  relevantRoles: RelevantRole[];
  experienceGaps: string[];
}

interface EducationAnalysis {
  requiredEducation: string;
  candidateEducation: string;
  educationMatch: boolean;
  notes?: string;
}

interface CertificationAnalysis {
  desiredCertificationsFromJD: string[];
  candidateCertificationsFromCV: string[];
  matchedCertifications: string[];
  missingCertifications: string[];
}

interface DetailedAnalysisResult {
  candidateName?: string;
  jobTitleAnalyzed?: string;
  overallMatchScore?: number | string;
  summary?: string;
  skillAnalysis?: SkillAnalysis;
  experienceAnalysis?: ExperienceAnalysis;
  educationAnalysis?: EducationAnalysis;
  certificationAnalysis?: CertificationAnalysis;
  strengths?: string[];
  areasForImprovementOrClarification?: string[];
  questionsToAskCandidate?: string[];
  finalRecommendation?: string;
}

export default function ResumePage() {
  const { selectedTheme } = useTheme();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string>("No CV selected");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<DetailedAnalysisResult | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>(
    "Upload your CV (PDF) to get started."
  );
  const [showJdInput, setShowJdInput] = useState<boolean>(false);

  const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnalysisResult(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setCvFile(file);
        setFileName(file.name);
        setUploadMessage(`CV "${file.name}" selected.`);
        setShowJdInput(true);
      } else {
        setCvFile(null);
        setFileName("Invalid file type (PDF only)");
        setUploadMessage("Please upload a PDF file for your CV.");
        setShowJdInput(false);
        alert("Please upload a PDF file.");
      }
    } else {
      setCvFile(null);
      setFileName("No CV selected");
      setUploadMessage("Upload your CV (PDF) to get started.");
      setShowJdInput(false);
    }
  };

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!cvFile) {
      alert("Please upload your CV first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the Job Description.");
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);
    console.log(
      "Analyzing CV:",
      cvFile.name,
      "against JD:",
      jobDescription.substring(0, 50) + "..."
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = exampleAnalysisData;
    setAnalysisResult(data);
    setIsProcessing(false);
  };

  const renderList = (items?: string[], itemClass?: string, title?: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        {title && (
          <h4 className={`text-md font-semibold text-gray-600 mb-1`}>{title}</h4>
        )}
        <ul className="list-disc list-inside space-y-1 pl-1">
          {items.map((item, index) => (
            <li
              key={index}
              className={`text-sm ${itemClass || `text-gray-700`}`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const SkillPill: FC<{
    text: string;
    type: "matched" | "missing" | "additional";
  }> = ({ text, type }) => {
    let bgColor = `bg-gray-100`;
    let textColor = `text-gray-700`;

    if (type === "matched") {
      bgColor = "bg-green-100";
      textColor = "text-green-700";
    }
    if (type === "missing") {
      bgColor = "bg-red-100";
      textColor = "text-red-700";
    }
    if (type === "additional") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-700";
    }

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="py-10 px-4">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-bold text-gray-800`}>
          <span className={`text-gray-600`}>Resume</span> Analyzer
        </h1>
        <p className={`text-lg text-gray-600 mt-2`}>
          Upload your CV and paste a job description for a detailed analysis.
        </p>
      </div>

      <form
        onSubmit={handleAnalyze}
        className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 space-y-6"
      >
        <div>
          <label
            htmlFor="cv-upload"
            className={`block text-md font-medium text-gray-700 mb-1`}
          >
            Upload Your CV (PDF only)
          </label>
          <div className={`mt-1 flex items-center justify-between border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50`}>
            <span
              className={`text-gray-600 truncate max-w-[calc(100%-150px)]`}
              title={fileName}
            >
              {fileName}
            </span>
            <label
              htmlFor="cv-upload-input"
              className={`cursor-pointer bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition`}
            >
              <ArrowUpTrayIcon className="h-5 w-5 inline-block mr-2" /> Upload
              CV
            </label>
            <input
              id="cv-upload-input"
              type="file"
              className="hidden"
              onChange={handleCvFileChange}
              accept=".pdf"
              disabled={isProcessing}
            />
          </div>
          <p className={`mt-1 text-xs text-gray-500`}>{uploadMessage}</p>
        </div>

        {showJdInput && (
          <div>
            <label
              htmlFor="job-description"
              className={`block text-md font-medium text-gray-700 mb-1`}
            >
              Paste Job Description
            </label>
            <textarea
              id="job-description"
              name="jobDescription"
              rows={8}
              className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-gray-50 placeholder-gray-400`}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              disabled={isProcessing}
            />
            <p className={`mt-1 text-xs text-gray-500`}>
              Ensure the job description is complete for accurate analysis.
            </p>
          </div>
        )}

        {showJdInput && (
          <button
            type="submit"
            disabled={isProcessing || !cvFile || !jobDescription.trim()}
            className={`w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Analyzing...
              </>
            ) : (
              <>
                <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-2" />
                Analyze Your CV
              </>
            )}
          </button>
        )}
      </form>

      {isProcessing && (
        <div className={`text-center text-gray-700 py-10`}>
          <svg
            className={`animate-spin h-10 w-10 text-gray-600 mx-auto mb-4`}
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
          <p className="text-xl font-semibold">Processing your documents...</p>
          <p>This might take a moment.</p>
        </div>
      )}

      {analysisResult && !isProcessing && (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-10">
          <div className={`text-center border-b border-gray-200 pb-6 mb-8`}>
            <h2 className={`text-3xl font-bold text-gray-800`}>
              Analysis Report
            </h2>
            {analysisResult.candidateName &&
              analysisResult.candidateName !== "N/A" && (
                <p className={`text-lg text-gray-600 mt-1`}>
                  For: {analysisResult.candidateName}
                </p>
              )}
            {analysisResult.jobTitleAnalyzed && (
              <p className={`text-md text-gray-500`}>
                Against Role: {analysisResult.jobTitleAnalyzed}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-5 gap-6 items-start">
            {analysisResult.overallMatchScore !== undefined && (
              <div className={`md:col-span-2 p-6 bg-gray-50 rounded-lg text-center shadow`}>
                <h3 className={`text-xl font-semibold text-gray-700 mb-2`}>
                  Overall Match
                </h3>
                <p
                  className={`text-6xl font-bold ${
                    typeof analysisResult.overallMatchScore === "number"
                      ? analysisResult.overallMatchScore >= 75
                        ? "text-green-600"
                        : analysisResult.overallMatchScore >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                      : `text-gray-600`
                  }`}
                >
                  {typeof analysisResult.overallMatchScore === "number"
                    ? `${analysisResult.overallMatchScore}%`
                    : analysisResult.overallMatchScore}
                </p>
              </div>
            )}

            {analysisResult.summary && (
              <div
                className={`p-6 rounded-lg ${
                  analysisResult.overallMatchScore !== undefined
                    ? "md:col-span-3 bg-slate-50" // Slate for summary to differentiate, or use selectedTheme-50
                    : `md:col-span-5 bg-gray-50`
                }`}
              >
                <h3 className={`text-xl font-semibold text-gray-700 mb-2 flex items-center`}>
                  <InformationCircleIcon className={`h-6 w-6 mr-2 text-gray-500`} />{" "}
                  Executive Summary
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed`}>
                  {analysisResult.summary}
                </p>
              </div>
            )}
          </div>

          {analysisResult.skillAnalysis && (
            <section>
              <h3 className={`text-2xl font-semibold text-gray-800 mb-4 pt-6 border-t border-gray-200`}>
                Skill Analysis
              </h3>
              <div className={`space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm`}>
                <div>
                  <h4 className={`text-md font-semibold text-gray-700 mb-2`}>
                    Matched Skills:
                  </h4>
                  {analysisResult.skillAnalysis.matchedSkills &&
                  analysisResult.skillAnalysis.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skillAnalysis.matchedSkills.map((s) => (
                        <SkillPill
                          key={s.skill}
                          text={`${s.skill} (${s.matchStrength})`}
                          type="matched"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm text-gray-500`}>
                      No direct skill matches found.
                    </p>
                  )}
                </div>
                <div>
                  <h4 className={`text-md font-semibold text-gray-700 mb-2`}>
                    Missing Skills (from JD):
                  </h4>
                  {analysisResult.skillAnalysis.missingSkills &&
                  analysisResult.skillAnalysis.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skillAnalysis.missingSkills.map((s) => (
                        <SkillPill
                          key={s.skill}
                          text={`${s.skill} (Crit: ${s.criticality})`}
                          type="missing"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm text-gray-500`}>
                      All required skills appear to be covered or not specified
                      in JD.
                    </p>
                  )}
                </div>
                {renderList(
                  analysisResult.skillAnalysis.additionalSkillsFromCV,
                  "text-blue-700", // Keep blue for distinction or make themeable if desired
                  "Additional Skills from CV:"
                )}
              </div>
            </section>
          )}

          {analysisResult.experienceAnalysis && (
            <section>
              <h3 className={`text-2xl font-semibold text-gray-800 mb-4 pt-6 border-t border-gray-200`}>
                Experience Analysis
              </h3>
              <div className={`p-4 bg-gray-50 rounded-lg shadow-sm space-y-3`}>
                <p className="text-sm">
                  <strong>JD Requires:</strong>{" "}
                  {analysisResult.experienceAnalysis.requiredExperienceYears}{" "}
                  years
                </p>
                <p className="text-sm">
                  <strong>Candidate Has:</strong>{" "}
                  {analysisResult.experienceAnalysis.candidateExperienceYears}{" "}
                  years
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      analysisResult.experienceAnalysis.experienceMatch
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {analysisResult.experienceAnalysis.experienceMatch
                      ? "Match"
                      : "Gap"}
                  </span>
                </p>
                {analysisResult.experienceAnalysis.relevantRoles.map(
                  (role, i) => (
                    <div
                      key={i}
                      className={`text-sm border-l-4 border-gray-300 pl-3 py-1`}
                    >
                      <p>
                        <strong>{role.title}</strong> at {role.company} (
                        {role.duration})
                      </p>
                      <p className={`text-gray-600 italic text-xs`}>
                        {role.alignmentNotes}
                      </p>
                    </div>
                  )
                )}
                {renderList(
                  analysisResult.experienceAnalysis.experienceGaps,
                  "text-red-700", // Keep red for distinction
                  "Experience Gaps Noted:"
                )}
              </div>
            </section>
          )}

          <div className={`grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200`}>
            {analysisResult.educationAnalysis && (
              <section>
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}>
                  <AcademicCapIcon className={`h-6 w-6 mr-2 text-gray-500`} />
                  Education
                </h3>
                <div className={`p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 text-sm`}>
                  <p>
                    <strong>JD Requires:</strong>{" "}
                    {analysisResult.educationAnalysis.requiredEducation}
                  </p>
                  <p>
                    <strong>Candidate Has:</strong>{" "}
                    {analysisResult.educationAnalysis.candidateEducation}
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        analysisResult.educationAnalysis.educationMatch
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {analysisResult.educationAnalysis.educationMatch
                        ? "Match"
                        : "Potential Gap"}
                    </span>
                  </p>
                  {analysisResult.educationAnalysis.notes && (
                    <p className={`text-gray-600 italic text-xs`}>
                      Note: {analysisResult.educationAnalysis.notes}
                    </p>
                  )}
                </div>
              </section>
            )}
            {analysisResult.certificationAnalysis && (
              <section>
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}>
                  <ClipboardDocumentCheckIcon className={`h-6 w-6 mr-2 text-gray-500`} />
                  Certifications
                </h3>
                <div className={`p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 text-sm`}>
                  {renderList(
                    analysisResult.certificationAnalysis
                      .desiredCertificationsFromJD,
                    `text-gray-700`, // Use theme color
                    "Desired from JD:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis
                      .candidateCertificationsFromCV,
                    `text-gray-700`, // Use theme color
                    "Found in CV:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis.matchedCertifications,
                    "text-green-700", // Keep green for distinction
                    "Matched/Related:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis.missingCertifications,
                    "text-red-700", // Keep red for distinction
                    "Missing from JD:"
                  )}
                </div>
              </section>
            )}
          </div>

          {renderList(
            analysisResult.strengths,
            "text-green-700", // Keep green for strengths
            "Key Strengths:"
          ) && (
            <section className={`pt-6 border-t border-gray-200`}>
              <h3 className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}>
                <SparklesIcon className="h-6 w-6 mr-2 text-green-500" />
                Key Strengths
              </h3>
              {renderList(analysisResult.strengths, `text-gray-700`)}
            </section>
          )}
          {renderList(
            analysisResult.areasForImprovementOrClarification,
            "text-yellow-700", // Keep yellow for areas of improvement
            "Areas for Improvement/Clarification:"
          ) && (
            <section className={`pt-6 border-t border-gray-200`}>
              <h3 className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}>
                <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-yellow-500" />
                Areas for Improvement/Clarification
              </h3>
              {renderList(
                analysisResult.areasForImprovementOrClarification,
                `text-gray-700`
              )}
            </section>
          )}
          {renderList(
            analysisResult.questionsToAskCandidate,
            "text-blue-700", // Keep blue for questions
            "Suggested Interview Questions:"
          ) && (
            <section className={`pt-6 border-t border-gray-200`}>
              <h3 className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}>
                <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-500" />
                Suggested Interview Questions
              </h3>
              {renderList(
                analysisResult.questionsToAskCandidate,
                `text-gray-700`
              )}
            </section>
          )}

          {analysisResult.finalRecommendation && (
            <div className={`mt-8 pt-6 border-t border-gray-200 p-4 bg-gray-600 text-white rounded-lg shadow-lg`}>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Final Recommendation
              </h3>
              <p className={`text-gray-100 text-center text-lg`}> {/* Themed light text on dark bg */}
                {analysisResult.finalRecommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const exampleAnalysisData: DetailedAnalysisResult = {
  candidateName: "John Doe",
  jobTitleAnalyzed: "Senior Software Engineer",
  overallMatchScore: 75,
  summary:
    "John Doe appears to be a strong candidate for the Senior Software Engineer role, demonstrating significant alignment in required skills and experience. Some minor gaps exist in preferred technologies, but core competencies are well-covered.",
  skillAnalysis: {
    requiredSkillsFromJD: [
      "Python",
      "Java",
      "AWS",
      "SQL",
      "Agile",
      "Problem Solving",
    ],
    candidateSkillsFromCV: [
      "Python",
      "Django",
      "AWS",
      "PostgreSQL",
      "CI/CD",
      "Problem Solving",
      "Team Leadership",
    ],
    matchedSkills: [
      { skill: "Python", matchStrength: "High" },
      { skill: "AWS", matchStrength: "High" },
      {
        skill: "SQL",
        matchStrength: "Moderate",
        notes: "Candidate has PostgreSQL, which is a type of SQL.",
      },
      {
        skill: "Problem Solving",
        matchStrength: "High",
        evidence: [
          "Led troubleshooting efforts...",
          "Resolved critical bugs...",
        ],
      },
    ],
    missingSkills: [
      { skill: "Java", criticality: "High" },
      {
        skill: "Agile",
        criticality: "Medium",
        notes: "No explicit mention, but project descriptions might imply it.",
      },
    ],
    additionalSkillsFromCV: ["Django", "CI/CD", "Team Leadership"],
  },
  experienceAnalysis: {
    requiredExperienceYears: "5+",
    candidateExperienceYears: "7",
    experienceMatch: true,
    relevantRoles: [
      {
        title: "Software Engineer",
        company: "Tech Solutions Inc.",
        duration: "4 years",
        alignmentNotes:
          "Directly relevant to required tech stack (Python, AWS) and responsibilities.",
      },
      {
        title: "Junior Developer",
        company: "Innovate Startups",
        duration: "3 years",
        alignmentNotes:
          "Contributes to overall years of experience; foundational skills developed.",
      },
    ],
    experienceGaps: [
      "No explicit experience leading a team of 5+ engineers as specified in 'preferred qualifications'.",
    ],
  },
  educationAnalysis: {
    requiredEducation: "Bachelor's Degree in Computer Science or related field",
    candidateEducation: "Master's Degree in Software Engineering",
    educationMatch: true,
    notes: "Candidate exceeds minimum education requirement.",
  },
  certificationAnalysis: {
    desiredCertificationsFromJD: ["AWS Certified Developer"],
    candidateCertificationsFromCV: [
      "AWS Certified Solutions Architect Associate",
    ],
    matchedCertifications: [
      "AWS Certified Solutions Architect Associate (related)",
    ],
    missingCertifications: ["AWS Certified Developer (specific)"],
  },
  strengths: [
    "Strong alignment with core technical skills (Python, AWS).",
    "Exceeds years of experience requirement.",
    "Advanced degree in a relevant field.",
    "Demonstrated problem-solving capabilities in past roles.",
  ],
  areasForImprovementOrClarification: [
    "Lack of explicitly mentioned Agile methodology experience.",
    "Missing Java experience, which is listed as a requirement.",
    "Specifics on team leadership scope could be clarified.",
  ],
  questionsToAskCandidate: [
    "Can you describe your experience working within an Agile development environment?",
    "While you have strong Python and AWS experience, the role also requires Java. How comfortable would you be ramping up on Java?",
    "Could you elaborate on the size and structure of teams you've led or mentored?",
  ],
  finalRecommendation:
    "Proceed with interview. Candidate shows strong potential despite minor skill gaps that can be explored further.",
};