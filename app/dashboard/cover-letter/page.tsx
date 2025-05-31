// app/dashboard/cover-letter/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/app/contexts/ThemeContext";

interface CoverLetterMetadata {
  jobTitleAppliedFor?: string;
  companyName?: string;
  candidateName?: string;
  dateGenerated?: string;
}

interface ContactInfo {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  cityStateZip?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
}

interface OpeningParagraph {
  statementOfPurpose?: string;
  thesisStatement?: string;
}

interface BodyParagraph {
  paragraphNumber: number;
  optional?: boolean;
  focus?: string;
  cvEvidence?: string;
  jdConnection?: string;
}

interface CompanyFitParagraph {
  optional?: boolean;
  statement?: string;
}

interface ClosingParagraph {
  reiterateInterest?: string;
  callToAction?: string;
}

interface GeneratedCoverLetter {
  metadata?: CoverLetterMetadata;
  senderInfo?: ContactInfo;
  date?: string;
  recipientInfo?: {
    hiringManagerName?: string;
    hiringManagerTitle?: string;
    companyName?: string;
    companyAddressLine1?: string;
    companyAddressLine2?: string;
    companyCityStateZip?: string;
  };
  salutation?: string;
  openingParagraph?: OpeningParagraph;
  bodyParagraphs?: BodyParagraph[];
  companyFitParagraph?: CompanyFitParagraph;
  closingParagraph?: ClosingParagraph;
  complimentaryClose?: string;
  signature?: string;
}

interface CoverLetterGenerationResult {
  coverLetterContent?: GeneratedCoverLetter;
}
const exampleCoverLetterData: CoverLetterGenerationResult = {
  coverLetterContent: {
    metadata: {
      jobTitleAppliedFor: "Senior Software Engineer",
      companyName: "Innovatech Solutions",
      candidateName: "John Doe",
      dateGenerated: new Date().toISOString(),
    },
    senderInfo: {
      name: "John Doe",
      addressLine1: "123 Main Street",
      cityStateZip: "Anytown, USA 12345",
      phone: "555-123-4567",
      email: "john.doe@email.com",
      linkedin: "linkedin.com/in/johndoe",
    },
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    recipientInfo: {
      hiringManagerName: "Ms. Jane Smith",
      hiringManagerTitle: "Lead Recruiter",
      companyName: "Innovatech Solutions",
      companyAddressLine1: "456 Tech Park Avenue",
      companyCityStateZip: "Future City, USA 67890",
    },
    salutation: "Dear Ms. Smith,",
    openingParagraph: {
      statementOfPurpose:
        "I am writing to express my enthusiastic interest in the Senior Software Engineer position at Innovatech Solutions, as advertised on your company careers page.",
      thesisStatement:
        "With over 7 years of experience in full-stack development and a proven track record of delivering scalable applications, I am confident that my skills in Python, AWS, and Agile methodologies align perfectly with your requirements and make me a strong candidate to contribute to your team's success.",
    },
    bodyParagraphs: [
      {
        paragraphNumber: 1,
        focus: "Full-Stack Development Expertise & Python/AWS Proficiency",
        cvEvidence:
          "In my previous role as a Software Engineer at Tech Solutions Inc., I was instrumental in developing and deploying a new customer portal using Python, Django, and AWS services. This project involved leading a small team, designing the architecture, and resulted in a 30% increase in user engagement and a 15% reduction in server costs.",
        jdConnection:
          "This experience directly corresponds to your need for a candidate with strong Python and AWS skills, capable of handling both backend logic and cloud infrastructure, as outlined in the job description.",
      },
      {
        paragraphNumber: 2,
        focus: "Agile Methodologies and Collaborative Problem-Solving",
        cvEvidence:
          "Furthermore, I am deeply familiar with Agile development practices, having actively participated in daily stand-ups, sprint planning, and retrospectives for the past four years. My ability to collaborate effectively within cross-functional teams and my proactive approach to problem-solving were key to the on-time delivery of several critical projects.",
        jdConnection:
          "Your emphasis on an Agile environment and collaborative teamwork resonates strongly with my own work style, and I am eager to contribute my skills in fostering efficient and productive development cycles at Innovatech Solutions.",
      },
      {
        paragraphNumber: 3,
        optional: true,
        focus: "Leadership and CI/CD Implementation",
        cvEvidence:
          "I also took the initiative to implement a CI/CD pipeline using Jenkins and Docker, which significantly reduced deployment times and improved code quality through automated testing.",
        jdConnection:
          "This demonstrates my commitment to best practices and continuous improvement, qualities I believe would be valuable to your engineering team.",
      },
    ],
    companyFitParagraph: {
      optional: true,
      statement:
        "I am particularly drawn to Innovatech Solutions' commitment to innovation in the AI space and your recent work on [mention a specific project or area if known, otherwise generic]. My passion for developing cutting-edge solutions and my proactive learning approach align well with your company's forward-thinking culture, and I am excited by the prospect of contributing to such an impactful organization.",
    },
    closingParagraph: {
      reiterateInterest:
        "I am very enthusiastic about the possibility of bringing my technical expertise, leadership experience, and collaborative spirit to the Senior Software Engineer role at Innovatech Solutions.",
      callToAction:
        "My resume, which is attached for your review, provides further detail on my qualifications and accomplishments. Thank you for your time and consideration. I look forward to the opportunity to discuss how my skills and enthusiasm can benefit your team.",
    },
    complimentaryClose: "Sincerely,",
    signature: "John Doe",
  },
};

export default function CoverLetterGeneratorPage() {
  const { selectedTheme } = useTheme();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string>("No CV selected");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] =
    useState<GeneratedCoverLetter | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>(
    "Upload your CV (PDF) to begin."
  );
  const [showJdInput, setShowJdInput] = useState<boolean>(false);

  const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGeneratedLetter(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setCvFile(file);
        setFileName(file.name);
        setUploadMessage(
          `CV "${file.name}" selected. Now, please provide the job description.`
        );
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
      setUploadMessage("Upload your CV (PDF) to begin.");
      setShowJdInput(false);
    }
  };

  const handleGenerateLetter = async (event: FormEvent) => {
    event.preventDefault();
    if (!cvFile) {
      alert("Please upload your CV first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the Job Description.");
      return;
    }

    setIsGenerating(true);
    setGeneratedLetter(null);
    console.log(
      "Generating Cover Letter for CV:",
      cvFile.name,
      "and JD:",
      jobDescription.substring(0, 50) + "..."
    );

    await new Promise((resolve) => setTimeout(resolve, 2500));
    const result = exampleCoverLetterData;
    setGeneratedLetter(result.coverLetterContent || null);
    setIsGenerating(false);
  };

  const formatCoverLetterText = (letter?: GeneratedCoverLetter): string => {
    if (!letter) return "";

    let text = "";

    const appendLine = (line?: string) => {
      if (line) text += line + "\n";
    };
    const appendPara = (para?: string) => {
      if (para) text += para + "\n\n";
    };

    if (letter.senderInfo) {
      appendLine(letter.senderInfo.name);
      appendLine(letter.senderInfo.addressLine1);
      appendLine(letter.senderInfo.addressLine2);
      appendLine(letter.senderInfo.cityStateZip);
      appendLine(letter.senderInfo.email);
      appendLine(letter.senderInfo.phone);
      if (letter.senderInfo.linkedin) appendLine(letter.senderInfo.linkedin);
      text += "\n";
    }

    appendLine(letter.date);
    text += "\n";

    if (letter.recipientInfo) {
      appendLine(letter.recipientInfo.hiringManagerName || "Hiring Team");
      appendLine(letter.recipientInfo.hiringManagerTitle);
      appendLine(letter.recipientInfo.companyName);
      appendLine(letter.recipientInfo.companyAddressLine1);
      appendLine(letter.recipientInfo.companyAddressLine2);
      appendLine(letter.recipientInfo.companyCityStateZip);
      text += "\n";
    }

    appendPara(letter.salutation);

    if (letter.openingParagraph) {
      appendLine(letter.openingParagraph.statementOfPurpose);
      appendPara(letter.openingParagraph.thesisStatement);
    }

    (letter.bodyParagraphs || []).forEach((p) => {
      if (!p.optional || (p.optional && (p.cvEvidence || p.jdConnection))) {
        let paraContent = "";
        if (p.focus) paraContent += `Regarding my experience with ${p.focus}: `;
        if (p.cvEvidence) paraContent += p.cvEvidence + " ";
        if (p.jdConnection) paraContent += p.jdConnection;
        appendPara(paraContent.trim());
      }
    });

    if (
      letter.companyFitParagraph &&
      (!letter.companyFitParagraph.optional ||
        (letter.companyFitParagraph.optional &&
          letter.companyFitParagraph.statement))
    ) {
      appendPara(letter.companyFitParagraph.statement);
    }

    if (letter.closingParagraph) {
      appendLine(letter.closingParagraph.reiterateInterest);
      appendPara(letter.closingParagraph.callToAction);
    }

    appendLine(letter.complimentaryClose);
    text += "\n";
    appendLine(letter.signature);

    return text.trim();
  };

  const copyToClipboard = () => {
    const letterText = formatCoverLetterText(generatedLetter);
    if (letterText) {
      navigator.clipboard
        .writeText(letterText)
        .then(() => alert("Cover letter copied to clipboard!"))
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert(
            "Failed to copy cover letter. Please try again or copy manually."
          );
        });
    } else {
      alert("Nothing to copy.");
    }
  };

  return (
    <div className="py-10 px-4">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-bold text-${selectedTheme}-800`}>
          <span className={`text-${selectedTheme}-600`}>Cover Letter</span> Generator
        </h1>
        <p className={`text-lg text-${selectedTheme}-600 mt-2`}>
          Upload your CV and paste a job description for a detailed analysis.
        </p>
      </div>

      <form
        onSubmit={handleGenerateLetter}
        className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 space-y-6"
      >
        <div>
          <label
            htmlFor="cv-upload"
            className={`block text-md font-medium text-${selectedTheme}-700 mb-1`}
          >
            Upload Your CV (PDF only)
          </label>
          <div className={`mt-1 flex items-center justify-between border-2 border-dashed border-${selectedTheme}-300 p-4 rounded-lg bg-${selectedTheme}-50`}>
            <span
              className={`text-${selectedTheme}-600 truncate max-w-[calc(100%-150px)]`}
              title={fileName}
            >
              {fileName}
            </span>
            <label
              htmlFor="cv-upload-input"
              className={`cursor-pointer bg-${selectedTheme}-700 hover:bg-${selectedTheme}-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition`}
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
              disabled={isGenerating}
            />
          </div>
          <p className={`mt-1 text-xs text-${selectedTheme}-500`}>{uploadMessage}</p>
        </div>

        {showJdInput && (
          <div>
            <label
              htmlFor="job-description"
              className={`block text-md font-medium text-${selectedTheme}-700 mb-1`}
            >
              Paste Job Description
            </label>
            <textarea
              id="job-description"
              name="jobDescription"
              rows={8}
              className={`mt-1 block w-full p-3 border border-${selectedTheme}-300 rounded-md shadow-sm focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 sm:text-sm bg-${selectedTheme}-50 placeholder-${selectedTheme}-400`}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              disabled={isGenerating}
            />
            <p className={`mt-1 text-xs text-${selectedTheme}-500`}>
              Ensure the job description is complete for accurate analysis.
            </p>
          </div>
        )}

        {showJdInput && (
          <button
            type="submit"
            disabled={isGenerating || !cvFile || !jobDescription.trim()}
            className={`w-full bg-${selectedTheme}-600 hover:bg-${selectedTheme}-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isGenerating ? (
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
                Generating Letter...
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-6 w-6 mr-2" />
                Generate Cover Letter
              </>
            )}
          </button>
        )}
      </form>

      {isGenerating && (
        <div className={`text-center text-${selectedTheme}-700 py-10`}>
          <svg
            className={`animate-spin h-10 w-10 text-${selectedTheme}-600 mx-auto mb-4`}
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
          <p className="text-xl font-semibold">Crafting your cover letter...</p>
          <p>Personalizing content based on your CV and the job description.</p>
        </div>
      )}

      {generatedLetter && !isGenerating && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl relative">
          <button
            onClick={copyToClipboard}
            className={`absolute top-4 right-4 bg-${selectedTheme}-200 hover:bg-${selectedTheme}-300 text-${selectedTheme}-700 font-semibold py-2 px-3 rounded-md text-xs flex items-center transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            title="Copy to Clipboard"
          >
            <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" /> Copy
          </button>

          <h2 className={`text-2xl font-semibold text-${selectedTheme}-800 mb-6 border-b pb-3 border-${selectedTheme}-200`}>
            Your Generated Cover Letter
          </h2>

          <div className={`prose prose-sm sm:prose-base max-w-none text-${selectedTheme}-800 whitespace-pre-wrap text-left`}>
            {formatCoverLetterText(generatedLetter)}
          </div>
        </div>
      )}
    </div>
  );
}