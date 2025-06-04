/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/cover-letter/page.tsx
"use client";

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
  DocumentMagnifyingGlassIcon,
  DocumentCheckIcon,
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

// This interface matches the 'result' field from CoverLetterStatusResponse when successful
// It now expects a nested 'coverLetterContent'
interface BackendPollingResult {
  coverLetterContent?: GeneratedCoverLetter; // The actual letter is nested here
  // Potentially other fields if your backend sends more in the 'result' object
}

interface CoverLetterTaskResponse {
  task_id: string;
  status_endpoint: string;
}

interface CoverLetterStatusResponse {
  task_id: string;
  status: string;
  result?: BackendPollingResult | null; // 'result' from API now contains 'coverLetterContent'
  error?: string | null;
  detail?: string | any;
}

interface StoredTaskInfo {
  taskId: string;
  status: string;
}

const LOCAL_STORAGE_KEY_PREFIX = "coverLetterTask_";

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

export default function CoverLetterGeneratorPage() {
  const { selectedTheme } = useTheme();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string>("No CV selected");

  const [isSubmittingTaskId, setIsSubmittingTaskId] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);

  const [generatedLetter, setGeneratedLetter] =
    useState<GeneratedCoverLetter | null>(null);
  const [userMessage, setUserMessage] = useState<string>(
    "Upload your CV (PDF) to begin."
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
    return `${LOCAL_STORAGE_KEY_PREFIX}${file.name}_${file.size}_${jdHash}`;
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
              `Found saved Task ID: ${storedInfo.taskId} (Status: ${storedInfo.status}). You can try to fetch the result.`
            );
          }
        } else {
          setTaskId(null);
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e);
        setTaskId(null);
      }
    }
  }, [cvFile, jobDescription, isSubmittingTaskId, isFetchingResult]);

  const stopPolling = (
    clearStoredTaskKey?: string | null,
    finalStatus?: string
  ) => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setIsFetchingResult(false);
    currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;

    if (clearStoredTaskKey && finalStatus) {
      const upperFinalStatus = finalStatus.toUpperCase();
      if (
        upperFinalStatus === "FAILURE" ||
        upperFinalStatus === "FAILED" ||
        upperFinalStatus === "TIMEOUT" ||
        upperFinalStatus === "UNKNOWN" ||
        upperFinalStatus === "ERROR_POLLING" ||
        upperFinalStatus === "INPUT_CHANGED"
      ) {
        try {
          localStorage.removeItem(clearStoredTaskKey);
          console.log(
            "Cleared stored task from localStorage due to failure/timeout/error/input change:",
            clearStoredTaskKey
          );
        } catch (e) {
          console.error("Failed to clear task from localStorage:", e);
        }
      }
    }
    actionInProgressRef.current = false;
  };

  const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGeneratedLetter(null);
    setTaskId(null);
    if (currentInputsKey) stopPolling(currentInputsKey, "INPUT_CHANGED");
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
      setUserMessage("Upload your CV (PDF) to begin.");
      setShowJdInput(false);
    }
  };

  const handleJdChange = (newJd: string) => {
    setJobDescription(newJd);
    if ((isFetchingResult || isSubmittingTaskId) && taskId) {
      if (currentInputsKey) stopPolling(currentInputsKey, "INPUT_CHANGED");
      setTaskId(null);
      setGeneratedLetter(null);
      setUserMessage("Inputs changed. Please get a new Task ID if needed.");
    }
    actionInProgressRef.current = false;
  };

  const handleSubmitForTaskId = async (event?: FormEvent) => {
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
    setGeneratedLetter(null);
    setUserMessage("Requesting Task ID...");
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
            `Using existing Task ID for these inputs: ${storedInfo.taskId} (Status: ${storedInfo.status}).`
          );
          setIsSubmittingTaskId(false);
          actionInProgressRef.current = false;
          return;
        }
      }
    } catch (e) {
      console.error("Error checking localStorage for existing task:", e);
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("cv_file", cvFile);

    try {
      const submitUrl = "http://10.238.37.27:8000/cover_letter/generate";
      const response = await fetch(submitUrl, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const taskResponseData:
        | CoverLetterTaskResponse
        | CoverLetterStatusResponse = await response.json();

      if (!response.ok) {
        const errorDetail =
          (taskResponseData as CoverLetterStatusResponse).detail ||
          (taskResponseData as any).error;
        throw new Error(
          typeof errorDetail === "string"
            ? errorDetail
            : JSON.stringify(errorDetail || `API Error: ${response.status}`)
        );
      }

      const receivedTaskId = (taskResponseData as CoverLetterTaskResponse)
        .task_id;
      if (receivedTaskId) {
        setTaskId(receivedTaskId);
        setUserMessage(
          `Task ID received: ${receivedTaskId}. You can now fetch the cover letter.`
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
          console.error("Failed to save new task to localStorage:", e);
        }
      } else {
        throw new Error("Task ID not received from server.");
      }
    } catch (error) {
      console.error("Error submitting for Task ID:", error);
      setUserMessage(
        `Error getting Task ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingTaskId(false);
      actionInProgressRef.current = false;
    }
  };

  const handleFetchCoverLetter = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    actionInProgressRef.current = true;

    if (!taskId) {
      setUserMessage("No Task ID available. Please get a Task ID first.");
      actionInProgressRef.current = false;
      return;
    }
    if (isFetchingResult) {
      setUserMessage("Already fetching results for this task ID.");
      actionInProgressRef.current = false;
      return;
    }

    setIsFetchingResult(true);
    setGeneratedLetter(null);
    setUserMessage(`Fetching results for Task ID: ${taskId}...`);
    pollingAttemptsRef.current = 0;
    currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;

    pollTaskStatus(taskId, currentInputsKey);
  };

  const pollTaskStatus = async (
    currentPollTaskId: string,
    storageKey: string | null
  ) => {
    if (!isFetchingResult && pollingAttemptsRef.current > 0) {
      console.log("Polling stopped externally for task:", currentPollTaskId);
      return;
    }
    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      setUserMessage("Timeout: Cover letter retrieval took too long.");
      stopPolling(storageKey, "TIMEOUT");
      return;
    }

    pollingAttemptsRef.current++;
    const attemptInfo = `(Attempt ${
      pollingAttemptsRef.current
    }/${MAX_POLLING_ATTEMPTS}, next in ~${Math.round(
      currentPollingIntervalMsRef.current / 1000
    )}s)`;
    // Only set fetching message if we are indeed fetching
    if (isFetchingResult)
      setUserMessage(`Fetching (Task: ${currentPollTaskId})... ${attemptInfo}`);

    try {
      const resultUrl = `http://10.238.37.27:8000/cover_letter/result/${currentPollTaskId}`;
      const response = await fetch(resultUrl);

      if (response.status === 429) {
        currentPollingIntervalMsRef.current = Math.min(
          currentPollingIntervalMsRef.current * 1.5 + 2000,
          MAX_POLLING_INTERVAL_MS
        );
        if (isFetchingResult)
          setUserMessage(
            `Rate limited. Retrying... ${attemptInfo.replace(
              "next in",
              "next try in"
            )}`
          );
        pollingTimeoutRef.current = setTimeout(
          () => pollTaskStatus(currentPollTaskId, storageKey),
          currentPollingIntervalMsRef.current
        );
        return;
      }

      const data: CoverLetterStatusResponse = await response.json();

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
          console.error("Failed to update localStorage status:", e);
        }
      }

      currentPollingIntervalMsRef.current = INITIAL_POLLING_INTERVAL_MS;
      console.log(
        `Polling status for task ${currentPollTaskId}:`,
        currentStatus
      );

      if (currentStatus === "SUCCESS" || currentStatus === "SUCCESSFUL") {
        console.log("Task successful. Raw result from API:", data.result);

        const letterContent = data.result?.coverLetterContent; // Access nested content

        if (letterContent) {
          setGeneratedLetter(letterContent as GeneratedCoverLetter);
          setUserMessage(
            `Cover letter generated successfully for Task ID: ${currentPollTaskId}!`
          );
        } else {
          setGeneratedLetter(null);
          setUserMessage(
            `Task ${currentPollTaskId} successful, but no letter data (or unexpected structure) received.`
          );
          console.error(
            "Task successful but 'result.coverLetterContent' is missing or null for task ID:",
            currentPollTaskId,
            "Raw result:",
            data.result
          );
        }
        stopPolling(storageKey, currentStatus);
      } else if (currentStatus === "FAILURE" || currentStatus === "FAILED") {
        setUserMessage(
          `Task ${currentPollTaskId} failed: ${
            data.error || "Unknown processing error"
          }`
        );
        stopPolling(storageKey, currentStatus);
      } else if (["PENDING", "STARTED", "RETRY"].includes(currentStatus)) {
        if (!isFetchingResult && pollingTimeoutRef.current) {
          console.log(
            "Polling stopped while status was PENDING for task:",
            currentPollTaskId
          );
          return;
        }
        if (isFetchingResult)
          setUserMessage(
            `Fetching (Task: ${currentPollTaskId}, Status: ${data.status})... ${attemptInfo}`
          );
        pollingTimeoutRef.current = setTimeout(
          () => pollTaskStatus(currentPollTaskId, storageKey),
          currentPollingIntervalMsRef.current
        );
      } else {
        setUserMessage(
          `Unknown status for Task ${currentPollTaskId}: ${data.status}. Stopping.`
        );
        stopPolling(storageKey, "UNKNOWN");
      }
    } catch (error) {
      console.error("Error polling task status:", error);
      setUserMessage(
        `Error fetching result for Task ${currentPollTaskId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      stopPolling(storageKey, "ERROR_POLLING");
    }
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
    const letterArg = generatedLetter === null ? undefined : generatedLetter;
    const letterText = formatCoverLetterText(letterArg);
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
        <h1 className={`text-4xl font-bold text-gray-800`}>
          <span className={`text-gray-600`}>Cover Letter</span> Generator
        </h1>
        <p className={`text-lg text-gray-600 mt-2`}>
          Step 1: Get a Task ID. Step 2: Fetch your Cover Letter.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 space-y-6">
        <div>
          <label
            htmlFor="cv-upload"
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
              disabled={isSubmittingTaskId || isFetchingResult}
            />
          </div>
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
          <div className="text-center p-2 bg-indigo-50 rounded-md border border-indigo-200">
            <p className="text-sm text-indigo-700">
              Current Task ID:{" "}
              <strong className="font-mono bg-indigo-100 px-1 rounded">
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
            onClick={handleSubmitForTaskId}
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
                Getting ID...{" "}
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
            onClick={handleFetchCoverLetter}
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
                Fetching Letter...{" "}
              </>
            ) : (
              <>
                {" "}
                <DocumentCheckIcon className="h-6 w-6 mr-2" /> Fetch Cover
                Letter{" "}
              </>
            )}
          </button>
        </div>
      )}

      {isFetchingResult && !generatedLetter && (
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
          <p className="text-xl font-semibold">Fetching your cover letter...</p>
        </div>
      )}

      {generatedLetter && !isFetchingResult && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl relative">
          <button
            onClick={copyToClipboard}
            className={`absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-md text-xs flex items-center transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            title="Copy to Clipboard"
          >
            <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" /> Copy
          </button>
          <h2
            className={`text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200`}
          >
            Your Generated Cover Letter
          </h2>
          <div
            className={`prose prose-sm sm:prose-base max-w-none text-gray-800 whitespace-pre-wrap text-left`}
          >
            {formatCoverLetterText(generatedLetter)}
          </div>
        </div>
      )}
    </div>
  );
}
