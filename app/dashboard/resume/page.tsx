/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/resume/page.tsx
"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import React, {
  ChangeEvent,
  FC,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

// --- Your existing interfaces for DetailedAnalysisResult ---
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

// --- New Interfaces for API communication ---
interface AnalyzerTaskResponse {
  task_id: string;
  // status_endpoint?: string; // Only if your backend sends it from /analyze
}

interface AnalyzerStatusResponse {
  task_id: string;
  status: string;
  result?: DetailedAnalysisResult | null; // This is where the DetailedAnalysisResult is expected
  error?: string | null;
  detail?: string | any;
}

interface StoredTaskInfo {
  taskId: string;
  status: string;
}

const LOCAL_STORAGE_KEY_PREFIX_CV = "cvAnalyzerTask_";

const INITIAL_POLLING_INTERVAL_MS = 5000;
const MAX_POLLING_INTERVAL_MS = 60000;
const MAX_POLLING_ATTEMPTS = 24;

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
};

export default function ResumePage() {
  const { selectedTheme } = useTheme();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string>("No CV selected");

  const [isSubmittingTaskId, setIsSubmittingTaskId] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);

  const [analysisResult, setAnalysisResult] =
    useState<DetailedAnalysisResult | null>(null);
  const [userMessage, setUserMessage] = useState<string>(
    "Upload your CV (PDF) to get started."
  );
  const [showJdInput, setShowJdInput] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [currentInputsKey, setCurrentInputsKey] = useState<string | null>(null);

  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef<number>(0);
  const currentPollingIntervalMsRef = useRef<number>(
    INITIAL_POLLING_INTERVAL_MS
  );
  const actionInProgressRef = useRef(false);

  const getInputsStorageKey = (
    file: File | null,
    jd: string
  ): string | null => {
    if (!file || !jd.trim()) return null;
    const jdHash = simpleHash(jd.trim());
    return `${LOCAL_STORAGE_KEY_PREFIX_CV}${file.name}_${file.size}_${jdHash}`;
  };

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const key = getInputsStorageKey(cvFile, jobDescription);
    setCurrentInputsKey(key);

    if (
      key &&
      !actionInProgressRef.current &&
      !isSubmittingTaskId &&
      !isFetchingResult
    ) {
      try {
        const storedInfoRaw = localStorage.getItem(key);
        if (storedInfoRaw) {
          const storedInfo: StoredTaskInfo = JSON.parse(storedInfoRaw);
          if (storedInfo.taskId) {
            setTaskId(storedInfo.taskId);
            setUserMessage(
              `Found saved Task ID: ${storedInfo.taskId} (Status: ${storedInfo.status}). Click 'Fetch Analysis' to check result.`
            );
          }
        } else {
          setTaskId(null);
          if (cvFile && jobDescription.trim()) {
            setUserMessage(
              "Inputs ready. Click 'Get/Verify Task ID' to start analysis."
            );
          } else if (cvFile) {
            setUserMessage(
              `CV "${cvFile.name}" selected. Please provide the job description.`
            );
          }
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e);
        setTaskId(null);
      }
    }
  }, [cvFile, jobDescription, isSubmittingTaskId, isFetchingResult]);

  const stopPolling = (
    clearStoredTaskKey?: string | null,
    finalStatus?: string,
    serverMessage?: string
  ) => {
    setIsFetchingResult(false);

    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (serverMessage && !analysisResult) {
      // Only update userMessage if no result is displayed
      setUserMessage(serverMessage);
    } else if (
      !analysisResult &&
      finalStatus?.toUpperCase() !== "SUCCESS" &&
      finalStatus?.toUpperCase() !== "SUCCESSFUL"
    ) {
      // If polling stopped without success and no specific message, provide generic one
      if (finalStatus === "TIMEOUT")
        setUserMessage("Analysis retrieval timed out.");
      else if (finalStatus?.startsWith("ERROR"))
        setUserMessage("An error occurred while fetching analysis.");
    }

    currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;

    if (clearStoredTaskKey && finalStatus) {
      const upperFinalStatus = finalStatus.toUpperCase();
      if (
        [
          "FAILURE",
          "FAILED",
          "TIMEOUT",
          "UNKNOWN",
          "ERROR_POLLING",
          "INPUT_CHANGED",
        ].includes(upperFinalStatus)
      ) {
        try {
          localStorage.removeItem(clearStoredTaskKey);
          console.log(
            "Cleared CV Analyzer stored task from localStorage due to:",
            finalStatus,
            clearStoredTaskKey
          );
        } catch (e) {
          console.error(
            "Failed to clear CV Analyzer task from localStorage:",
            e
          );
        }
      }
    }
    actionInProgressRef.current = false;
  };

  const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnalysisResult(null);
    setTaskId(null);
    if (currentInputsKey)
      stopPolling(
        currentInputsKey,
        "INPUT_CHANGED",
        "CV changed. Please get a new Task ID if needed."
      );
    actionInProgressRef.current = false;

    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setCvFile(file);
        setFileName(file.name);
        setUserMessage(
          `CV "${file.name}" selected. Now, please provide the job description.`
        );
        setShowJdInput(true);
      } else {
        setCvFile(null);
        setFileName("Invalid file type (PDF only)");
        setUserMessage("Please upload a PDF file for your CV.");
        setShowJdInput(false);
        alert("Please upload a PDF file.");
      }
    } else {
      setCvFile(null);
      setFileName("No CV selected");
      setUserMessage("Upload your CV (PDF) to get started.");
      setShowJdInput(false);
    }
  };

  const handleJdChange = (newJd: string) => {
    setAnalysisResult(null);
    setJobDescription(newJd);
    if ((isFetchingResult || isSubmittingTaskId) && taskId) {
      if (currentInputsKey)
        stopPolling(
          currentInputsKey,
          "INPUT_CHANGED",
          "Job Description changed. Please 'Get/Verify Task ID' again."
        );
      setTaskId(null);
    }
    actionInProgressRef.current = false;
  };

  const handleSubmitForCvAnalysisTaskId = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    actionInProgressRef.current = true;

    if (!cvFile || !jobDescription.trim()) {
      alert("Please ensure CV is uploaded and Job Description is filled.");
      actionInProgressRef.current = false;
      return;
    }

    const keyForStorage = getInputsStorageKey(cvFile, jobDescription);
    if (!keyForStorage) {
      setUserMessage("Error preparing inputs. Please try again.");
      actionInProgressRef.current = false;
      return;
    }

    setIsSubmittingTaskId(true);
    setAnalysisResult(null);
    setUserMessage("Submitting for Analysis Task ID...");
    setTaskId(null);

    try {
      const storedInfoRaw = localStorage.getItem(keyForStorage);
      if (storedInfoRaw) {
        const storedInfo: StoredTaskInfo = JSON.parse(storedInfoRaw);
        const PENDING_STATUSES = ["PENDING", "STARTED", "RETRY"];
        if (
          storedInfo.taskId &&
          PENDING_STATUSES.includes(storedInfo.status.toUpperCase())
        ) {
          setTaskId(storedInfo.taskId);
          setUserMessage(
            `Using existing Task ID for these inputs: ${storedInfo.taskId} (Status: ${storedInfo.status}). Click 'Fetch Analysis'.`
          );
          setIsSubmittingTaskId(false);
          actionInProgressRef.current = false;
          return;
        }
      }
    } catch (e) {
      console.error(
        "Error checking localStorage for existing CV analysis task:",
        e
      );
    }

    const formData = new FormData();
    // **CRITICAL**: Ensure these field names match your backend API for '/cv_analyzer/analyze'
    formData.append("cv_file", cvFile);
    formData.append("job_description", jobDescription);

    try {
      const submitUrl = "http://10.238.37.27:8000/cv_analyzer/analyze";
      const response = await fetch(submitUrl, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const taskResponseData: AnalyzerTaskResponse | AnalyzerStatusResponse =
        await response.json();

      if (!response.ok) {
        setIsSubmittingTaskId(false); // Set to false before throwing error
        const errorDetail =
          (taskResponseData as AnalyzerStatusResponse).detail ||
          (taskResponseData as any).error;
        throw new Error(
          typeof errorDetail === "string"
            ? errorDetail
            : JSON.stringify(errorDetail || `API Error: ${response.status}`)
        );
      }

      // If response is OK, set isSubmittingTaskId to false here
      setIsSubmittingTaskId(false);
      const receivedTaskId = (taskResponseData as AnalyzerTaskResponse).task_id;

      if (receivedTaskId) {
        setTaskId(receivedTaskId);
        console.log(
          "New CV Analysis Task ID received:",
          receivedTaskId,
          "for key:",
          keyForStorage
        );
        try {
          localStorage.setItem(
            keyForStorage,
            JSON.stringify({
              taskId: receivedTaskId,
              status: "PENDING",
            } as StoredTaskInfo)
          );
        } catch (e) {
          console.error(
            "Failed to save new CV analysis task to localStorage:",
            e
          );
        }

        setUserMessage(
          `Analysis Task ID ${receivedTaskId} received. Click 'Fetch Analysis Report'.`
        );
        // Removed auto-fetch. User will click the "Fetch Analysis Report" button.
      } else {
        throw new Error("Task ID not received from CV Analyzer server.");
      }
    } catch (error) {
      console.error("Error submitting for CV Analysis Task ID:", error);
      setUserMessage(
        `Error getting CV Analysis Task ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmittingTaskId(false); // Ensure this is set to false in case of error
    } finally {
      actionInProgressRef.current = false;
    }
  };

  const handleFetchCvAnalysisResult = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    actionInProgressRef.current = true;

    if (!taskId) {
      setUserMessage(
        "No Task ID available for CV Analysis. Please get a Task ID first."
      );
      actionInProgressRef.current = false;
      return;
    }
    if (isFetchingResult) {
      setUserMessage("Already fetching CV analysis results for this task ID.");
      actionInProgressRef.current = false;
      return;
    }
    if (isSubmittingTaskId) {
      setUserMessage(
        "CV Analysis Task ID submission in progress. Please wait."
      );
      actionInProgressRef.current = false;
      return;
    }

    setIsFetchingResult(true);
    setAnalysisResult(null);
    setUserMessage(`Fetching CV analysis for Task ID: ${taskId}...`);
    pollingAttemptsRef.current = 0;
    currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;

    pollCvAnalyzerTaskStatus(taskId, currentInputsKey);
  };

  const pollCvAnalyzerTaskStatus = async (
    currentPollTaskId: string,
    storageKey: string | null
  ) => {
    if (!isFetchingResult && pollingAttemptsRef.current > 0) {
      console.log(
        "CV Analysis polling stopped externally for task:",
        currentPollTaskId
      );
      return;
    }
    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      stopPolling(
        storageKey,
        "TIMEOUT",
        `Timeout: CV Analysis retrieval for Task ID ${currentPollTaskId} took too long.`
      );
      return;
    }

    pollingAttemptsRef.current++;
    const attemptInfo = `(Attempt ${
      pollingAttemptsRef.current
    }/${MAX_POLLING_ATTEMPTS}, next in ~${Math.round(
      currentPollingIntervalMsRef.current / 1000
    )}s)`;
    if (isFetchingResult)
      setUserMessage(
        `Fetching Analysis (Task: ${currentPollTaskId})... ${attemptInfo}`
      );

    try {
      const resultUrl = `http://10.238.37.27:8000/cv_analyzer/result/${currentPollTaskId}`;
      const response = await fetch(resultUrl);

      if (response.status === 429) {
        currentPollingIntervalMsRef.current = Math.min(
          currentPollingIntervalMsRef.current * 1.5 + 2000,
          MAX_POLLING_INTERVAL_MS
        );
        if (isFetchingResult)
          setUserMessage(
            `Rate limited. Retrying Analysis... ${attemptInfo.replace(
              "next in",
              "next try in"
            )}`
          );
        if (isFetchingResult)
          pollingTimeoutRef.current = setTimeout(
            () => pollCvAnalyzerTaskStatus(currentPollTaskId, storageKey),
            currentPollingIntervalMsRef.current
          );
        return;
      }

      const data: AnalyzerStatusResponse = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error || data.detail || `API Error: ${response.status}`;
        throw new Error(
          typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)
        );
      }

      const currentStatus = data.status.toUpperCase();
      if (storageKey) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              taskId: currentPollTaskId,
              status: currentStatus,
            } as StoredTaskInfo)
          );
        } catch (e) {
          console.error("Failed to update CV Analyzer localStorage status:", e);
        }
      }

      currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;
      console.log(
        `CV Analysis polling status for task ${currentPollTaskId}:`,
        currentStatus
      );

      if (currentStatus === "SUCCESS" || currentStatus === "SUCCESSFUL") {
        console.log(
          "CV Analysis Task successful. Raw result from API:",
          data.result
        );

        const analysisData = data.result; // Assuming DetailedAnalysisResult is directly in data.result
        // If nested, e.g., data.result.analyzerReport, change this line.

        if (analysisData) {
          setAnalysisResult(analysisData as DetailedAnalysisResult);
          setUserMessage(
            `CV Analysis successful for Task ID: ${currentPollTaskId}!`
          );
        } else {
          setAnalysisResult(null);
          setUserMessage(
            `CV Analysis Task ${currentPollTaskId} successful, but no analysis data received.`
          );
          console.error(
            "CV Analysis Task successful but 'result' is missing or null:",
            currentPollTaskId,
            "Raw result:",
            data.result
          );
        }
        stopPolling(storageKey, currentStatus);
      } else if (currentStatus === "FAILURE" || currentStatus === "FAILED") {
        stopPolling(
          storageKey,
          currentStatus,
          `CV Analysis Task ${currentPollTaskId} failed: ${
            data.error || "Unknown processing error"
          }`
        );
      } else if (["PENDING", "STARTED", "RETRY"].includes(currentStatus)) {
        if (!isFetchingResult && pollingTimeoutRef.current) {
          console.log(
            "CV Analysis polling was externally stopped while status was PENDING for task:",
            currentPollTaskId
          );
          return;
        }
        if (isFetchingResult)
          setUserMessage(
            `Fetching Analysis (Task: ${currentPollTaskId}, Status: ${data.status})... ${attemptInfo}`
          );
        if (isFetchingResult)
          pollingTimeoutRef.current = setTimeout(
            () => pollCvAnalyzerTaskStatus(currentPollTaskId, storageKey),
            currentPollingIntervalMsRef.current
          );
      } else {
        stopPolling(
          storageKey,
          "UNKNOWN",
          `Unknown status for CV Analysis Task ${currentPollTaskId}: ${data.status}. Stopping.`
        );
      }
    } catch (error) {
      console.error("Error polling CV Analysis task status:", error);
      stopPolling(
        storageKey,
        "ERROR_POLLING",
        `Error fetching CV Analysis for Task ${currentPollTaskId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const renderList = (items?: string[], itemClass?: string, title?: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        {title && (
          <h4 className={`text-md font-semibold text-gray-600 mb-1`}>
            {title}
          </h4>
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
          Step 1: Get a Task ID for analysis. Step 2: Fetch the analysis report.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 space-y-6">
        <div>
          <label
            htmlFor="cv-upload-analyzer"
            className={`block text-md font-medium text-gray-700 mb-1`}
          >
            Upload Your CV (PDF only)
          </label>
          <div
            className={`mt-1 flex items-center justify-between border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50`}
          >
            <span
              className={`text-gray-600 truncate max-w-[calc(100%-150px)]`}
              title={fileName}
            >
              {fileName}
            </span>
            <label
              htmlFor="cv-upload-input-analyzer"
              className={`cursor-pointer bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition`}
            >
              <ArrowUpTrayIcon className="h-5 w-5 inline-block mr-2" /> Upload
              CV
            </label>
            <input
              id="cv-upload-input-analyzer"
              type="file"
              className="hidden"
              onChange={handleCvFileChange}
              accept=".pdf"
              disabled={isSubmittingTaskId || isFetchingResult}
            />
          </div>
        </div>

        {showJdInput && (
          <div>
            <label
              htmlFor="job-description-analyzer"
              className={`block text-md font-medium text-gray-700 mb-1`}
            >
              Paste Job Description
            </label>
            <textarea
              id="job-description-analyzer"
              name="jobDescription"
              rows={8}
              className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-gray-50 placeholder-gray-400`}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => handleJdChange(e.target.value)}
              required
              disabled={isSubmittingTaskId || isFetchingResult}
            />
            <p className={`mt-1 text-xs text-gray-500`}>
              Ensure the job description is complete for accurate analysis.
            </p>
          </div>
        )}
        <p className={`mt-2 text-sm text-gray-700 text-center font-medium`}>
          {userMessage}
        </p>
        {taskId && (
          <div className="text-center p-2 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">
              Current Analysis Task ID:{" "}
              <strong className="font-mono bg-gray-100 px-1 rounded">
                {taskId}
              </strong>
            </p>
          </div>
        )}
      </div>

      {showJdInput && (
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-0 sm:flex sm:space-x-4 mb-10">
          <button
            type="button"
            onClick={handleSubmitForCvAnalysisTaskId}
            disabled={
              isSubmittingTaskId ||
              isFetchingResult ||
              !cvFile ||
              !jobDescription.trim()
            }
            className={`w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isSubmittingTaskId ? (
              <>
                {" "}
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>{" "}
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>{" "}
                </svg>{" "}
                Getting Task ID...{" "}
              </>
            ) : (
              <>
                {" "}
                <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-2" />{" "}
                Get/Verify Task ID{" "}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFetchCvAnalysisResult}
            disabled={isFetchingResult || isSubmittingTaskId || !taskId}
            className={`w-full sm:w-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isFetchingResult ? (
              <>
                {" "}
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>{" "}
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>{" "}
                </svg>{" "}
                Fetching Analysis...{" "}
              </>
            ) : (
              <>
                {" "}
                <DocumentCheckIcon className="h-6 w-6 mr-2" /> Fetch Analysis
                Report{" "}
              </>
            )}
          </button>
        </div>
      )}

      {isFetchingResult && !analysisResult && (
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
          <p className="text-xl font-semibold">
            Fetching your analysis report...
          </p>
        </div>
      )}

      {analysisResult && !isFetchingResult && (
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
              <div
                className={`md:col-span-2 p-6 bg-gray-50 rounded-lg text-center shadow`}
              >
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
                    ? "md:col-span-3 bg-slate-50"
                    : `md:col-span-5 bg-gray-50`
                }`}
              >
                <h3
                  className={`text-xl font-semibold text-gray-700 mb-2 flex items-center`}
                >
                  <InformationCircleIcon
                    className={`h-6 w-6 mr-2 text-gray-500`}
                  />{" "}
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
              <h3
                className={`text-2xl font-semibold text-gray-800 mb-4 pt-6 border-t border-gray-200`}
              >
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
                  "text-blue-700",
                  "Additional Skills from CV:"
                )}
              </div>
            </section>
          )}

          {analysisResult.experienceAnalysis && (
            <section>
              <h3
                className={`text-2xl font-semibold text-gray-800 mb-4 pt-6 border-t border-gray-200`}
              >
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
                  "text-red-700",
                  "Experience Gaps Noted:"
                )}
              </div>
            </section>
          )}

          <div
            className={`grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200`}
          >
            {analysisResult.educationAnalysis && (
              <section>
                <h3
                  className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}
                >
                  <AcademicCapIcon className={`h-6 w-6 mr-2 text-gray-500`} />
                  Education
                </h3>
                <div
                  className={`p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 text-sm`}
                >
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
                <h3
                  className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}
                >
                  <ClipboardDocumentCheckIcon
                    className={`h-6 w-6 mr-2 text-gray-500`}
                  />
                  Certifications
                </h3>
                <div
                  className={`p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 text-sm`}
                >
                  {renderList(
                    analysisResult.certificationAnalysis
                      .desiredCertificationsFromJD,
                    `text-gray-700`,
                    "Desired from JD:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis
                      .candidateCertificationsFromCV,
                    `text-gray-700`,
                    "Found in CV:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis.matchedCertifications,
                    "text-green-700",
                    "Matched/Related:"
                  )}
                  {renderList(
                    analysisResult.certificationAnalysis.missingCertifications,
                    "text-red-700",
                    "Missing from JD:"
                  )}
                </div>
              </section>
            )}
          </div>

          {analysisResult.strengths && analysisResult.strengths.length > 0 && (
            <section className={`pt-6 border-t border-gray-200`}>
              <h3
                className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}
              >
                <SparklesIcon className="h-6 w-6 mr-2 text-green-500" />
                Key Strengths
              </h3>
              {renderList(analysisResult.strengths, `text-gray-700`)}
            </section>
          )}
          {analysisResult.areasForImprovementOrClarification &&
            analysisResult.areasForImprovementOrClarification.length > 0 && (
              <section className={`pt-6 border-t border-gray-200`}>
                <h3
                  className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}
                >
                  <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-yellow-500" />
                  Areas for Improvement/Clarification
                </h3>
                {renderList(
                  analysisResult.areasForImprovementOrClarification,
                  `text-gray-700`
                )}
              </section>
            )}
          {analysisResult.questionsToAskCandidate &&
            analysisResult.questionsToAskCandidate.length > 0 && (
              <section className={`pt-6 border-t border-gray-200`}>
                <h3
                  className={`text-xl font-semibold text-gray-800 mb-3 flex items-center`}
                >
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
            <div
              className={`mt-8 pt-6 border-t border-gray-200 p-4 bg-gray-600 text-white rounded-lg shadow-lg`}
            >
              <h3 className="text-xl font-semibold mb-2 text-center">
                Final Recommendation
              </h3>
              <p className={`text-gray-100 text-center text-lg`}>
                {analysisResult.finalRecommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
