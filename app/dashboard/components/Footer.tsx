// app/dashboard/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
// import { FaGithub } from 'react-icons/fa'; // If you use react-icons

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 pt-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Logo</h2>
          <p className="text-sm">Empowering your career journey.</p>
          {/* <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <FaGithub className="h-6 w-6 hover:text-white" />
          </a> */}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">About Us</h3>
          <p className="text-sm">
            This is a short introduction about our team and project goals. We aim to help you succeed.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-white">Home</Link></li>
            <li><Link href="/dashboard/resume" className="hover:text-white">Resume Scoring</Link></li>
            <li><Link href="/dashboard/job" className="hover:text-white">Job Suggestion</Link></li>
            <li><Link href="/dashboard/cover-letter" className="hover:text-white">Cover Letter Generator</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 py-4 border-t border-gray-700 text-center text-sm">
        <p>© {new Date().getFullYear()} Smart Career Companion. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;