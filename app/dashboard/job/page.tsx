// app/dashboard/resume/page.tsx
"use client"; // Likely a client component for file uploads etc.

import React, { useState } from 'react';

export default function JobPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("Try uploading a file");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setMessage(selectedFile.name);
      } else {
        setFile(null);
        setMessage("Please upload a PDF file.");
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    // TODO: Implement actual file upload logic to your backend/Supabase storage
    console.log("Uploading file:", file.name);
    setMessage(`Uploading ${file.name}...`);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMessage(`${file.name} uploaded successfully! (Simulation)`);
    // setFile(null); // Optionally clear file after upload
  };


  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-8 uppercase">Job Suggestion</h1>
      <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between border-2 border-dashed border-gray-300 p-6 rounded-md mb-4 bg-white">
          <span className="text-gray-500 truncate max-w-[calc(100%-150px)]">
            {file ? file.name : message}
          </span>
          <label htmlFor="resume-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-md transition duration-150 ease-in-out">
            Choose file
          </label>
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf"
          />
        </div>
        {file && (
            <p className="text-xs text-gray-500 mb-6">{/* cv.pdf placeholder, now handled by file.name */}</p>
        )}
        {file && (
            <button
                onClick={handleUpload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out"
            >
                Analyze Resume
            </button>
        )}
      </div>
    </div>
  );
}