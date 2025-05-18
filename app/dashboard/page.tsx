// app/dashboard/page.tsx
import React from "react";

export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
      <p className="mb-4">
        This is your central hub. From here, you can access various tools to
        help you advance your career.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Resume Analyzer</h2>
          <p className="text-gray-700">
            Upload your resume to get feedback and see how it scores against job
            descriptions.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Job Suggestions</h2>
          <p className="text-gray-700">
            Find job roles that match your skills and experience based on your
            profile and resume.
          </p>
        </div>
      </div>
    </div>
  );
}
