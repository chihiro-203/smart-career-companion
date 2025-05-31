/* eslint-disable @next/next/no-img-element */
// app/dashboard/page.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  BriefcaseIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  UserIcon as UserSolidIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";

// Reusable Feature Card (more styled)
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link,
}) => {
  const { selectedTheme } = useTheme();
  return (
    <Link
      href={link}
      className="group p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col"
    >
      <div className="flex items-center mb-5">
        <span className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-${selectedTheme}-500 text-white mr-5 group-hover:bg-${selectedTheme}-600 transition-colors`}>
          <div className="h-6 w-6">{icon}</div>
        </span>
        <h3 className={`text-xl lg:text-2xl font-semibold text-${selectedTheme}-900 group-hover:text-${selectedTheme}-600 transition-colors`}>
          {title}
        </h3>
      </div>
      <p className={`text-${selectedTheme}-600 text-sm md:text-base mb-5 flex-grow`}>
        {description}
      </p>
      <div className="mt-auto">
        <span className={`text-${selectedTheme}-600 group-hover:text-${selectedTheme}-700 font-semibold flex items-center text-sm`}>
          Learn More
          <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

const testimonials = [
  {
    name: "Chi N.",
    role: "Fullstack Developer",
    quote:
      "From frontend finesse to backend brilliance, this tool helps me showcase my full-stack power on paper!",
    avatarPlaceholder: "https://placehold.co/100x100/bfdbfe/1e3a8a?text=CN",
  },
  {
    name: "Thang N.",
    role: "Software Engineer",
    quote:
      "Debugging resumes was harder than code! This analyzer simplified it all, letting my skills truly compile.",
    avatarPlaceholder: "https://placehold.co/100x100/a7f3d0/065f46?text=TN",
  },
  {
    name: "Hung N.",
    role: "Product Engineer",
    quote:
      "Building great products starts with a great presentation. This platform ensures my professional story is always compelling.",
    avatarPlaceholder: "https://placehold.co/100x100/4b5563/f9fafb?text=HN",
  },
  {
    name: "Khoa L.",
    role: "DevOps Engineer",
    quote:
      "Streamlining my career pipeline just like I do with CI/CD. The efficiency gains are incredible!",
    avatarPlaceholder: "https://placehold.co/100x100/8b5e3c/f0e6e0?text=KL",
  },
];

export default function DashboardHomePage() {
  const { selectedTheme } = useTheme();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMessage("");
    // TODO: Implement actual form submission logic (e.g., API call)
    console.log("Contact form submitted:", contactForm);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
    setFormMessage("Thank you! Your message has been sent.");
    setContactForm({ name: "", email: "", subject: "", message: "" }); // Reset form
    setFormSubmitting(false);
  };

  const techStack = [
    "Next.js",
    "Python",
    "FastAPI",
    "Supabase",
    "Gemini API",
    "Tailwind CSS",
  ];

  return (
    <div className={`text-${selectedTheme}-800 overflow-x-hidden`}>
      {/* Section 1: Hero */}
      <section className={`relative py-20 md:py-32 bg-${selectedTheme}-50 rounded`}>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-${selectedTheme}-900 mb-6`}>
            Smart Career <span className={`"text-${selectedTheme}-600"`}>Companion</span>
          </h1>
          <p className={`text-lg md:text-xl text-${selectedTheme}-600 max-w-3xl mx-auto mb-10`}>
            Empowering your journey with AI-driven insights for resume
            perfection, job matching, and compelling cover letters.
          </p>
          <Link
            href="/dashboard/resume"
            className={`inline-block bg-${selectedTheme}-700 hover:bg-${selectedTheme}-80 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Section 2: Core Tools */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-${selectedTheme}-900 mb-4`}>
              Elevate Your Career Effortlessly
            </h2>
            <p className={`text-lg text-${selectedTheme}-600 max-w-2xl mx-auto`}>
              Our suite of intelligent tools simplifies your job search and
              professional development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              title="Resume Analyzer"
              description="Optimize your resume with data-driven insights for maximum impact and ATS compatibility."
              icon={<DocumentTextIcon />}
              link="/dashboard/resume"
            />
            <FeatureCard
              title="Job Suggestions"
              description="AI-powered matching to find roles that truly fit your profile and aspirations."
              icon={<BriefcaseIcon />}
              link="/dashboard/job"
            />
            <FeatureCard
              title="Cover Letter Generator"
              description="Craft persuasive, tailored cover letters that capture attention and highlight your strengths."
              icon={<PencilSquareIcon />}
              link="/dashboard/cover-letter"
            />
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className={`py-16 md:py-24 bg-${selectedTheme}-50`}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className={`inline-block p-3 bg-${selectedTheme}-100 text-${selectedTheme}-600 rounded-full mb-4`}>
                <SparklesIcon className="h-8 w-8" />
              </span>
              <h2 className={`text-3xl md:text-4xl font-bold text-${selectedTheme}-900 mb-6`}>
                AI-Powered Career Advancement
              </h2>
              <p className={`text-lg text-${selectedTheme}-600 mb-4`}>
                Leverage the power of artificial intelligence to gain a
                competitive edge. Our tools analyze vast amounts of data to
                provide you with actionable recommendations.
              </p>
              <ul className={`space-y-3 text-${selectedTheme}-600`}>
                <li className="flex items-start">
                  <ArrowRightIcon className="h-5 w-5 text-black mr-2 mt-1 flex-shrink-0" />
                  Personalized job feeds based on deep skill analysis.
                </li>
                <li className="flex items-start">
                  <ArrowRightIcon className="h-5 w-5 text-black mr-2 mt-1 flex-shrink-0" />
                  Keyword optimization for resumes to beat applicant tracking
                  systems.
                </li>
                <li className="flex items-start">
                  <ArrowRightIcon className="h-5 w-5 text-black mr-2 mt-1 flex-shrink-0" />
                  Context-aware suggestions for impactful cover letter content.
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <img
                src="https://placehold.co/600x400/dee2e6/000000?text=AI+Insights+Mockup"
                alt="AI Insights Illustration"
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Tech Stack */}
      <section className="pt-16 md:pt-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-2xl font-semibold text-${selectedTheme}-500 mb-8`}>
            Built with Leading Technologies
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {techStack.map((tech) => (
              <span key={tech} className={`text-${selectedTheme}-600 font-medium`}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Placeholder) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className={`inline-block p-3 bg-${selectedTheme}-100 text-${selectedTheme}-600 rounded-full mb-4`}>
              <ChatBubbleLeftRightIcon className="h-8 w-8" />
            </span>
            <h2 className={`text-3xl md:text-4xl font-bold text-${selectedTheme}-900 mb-4`}>
              Loved by Professionals
            </h2>
            <p className={`text-lg text-${selectedTheme}-600 max-w-2xl mx-auto`}>
              Hear from individuals who&apos;ve transformed their career
              prospects with Smart Career Companion.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="group bg-white p-6 pt-10 rounded-2xl shadow-lg hover:shadow-xl flex flex-col transition-all duration-300 ease-in-out transform hover:-translate-y-2 relative"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-slate-100 group-hover:border-white overflow-hidden shadow-md transition-colors">
                  <img
                    src={testimonial.avatarPlaceholder}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className={`text-${selectedTheme}-600 italic text-center mb-6 text-md flex-grow leading-relaxed`}>
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className={`mt-auto text-center border-t border-${selectedTheme}-200 pt-4`}>
                  <p className={`font-semibold text-${selectedTheme}-900`}>
                    {testimonial.name}
                  </p>
                  <p className={`text-sm text-${selectedTheme}-400 font-medium`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Contact Us */}
      <section className={`py-16 md:py-24 bg-gradient-to-br bg-${selectedTheme}-50 text-white`}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
              Contact Us
            </h2>
            <p className={`text-lg text-${selectedTheme}-700 mb-10`}>
              We&apos;re here to answer your questions or discuss how Smart
              Career Companion can assist you.
            </p>
          </div>
          <div className={`max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-2xl text-${selectedTheme}-800`}>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium text-${selectedTheme}-700 mb-1`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserSolidIcon className={`h-5 w-5 text-${selectedTheme}-400`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 border border-${selectedTheme}-300 rounded-md shadow-sm focus:outline-none focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 sm:text-sm`}
                    placeholder="Your Name"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium text-${selectedTheme}-700 mb-1`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className={`h-5 w-5 text-${selectedTheme}-400`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 border border-${selectedTheme}-300 rounded-md shadow-sm focus:outline-none focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 sm:text-sm`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className={`block text-sm font-medium text-${selectedTheme}-700 mb-1`}
                >
                  Subject
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className={`h-5 w-5 text-${selectedTheme}-400`} />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 border border-${selectedTheme}-300 rounded-md shadow-sm focus:outline-none focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 sm:text-sm`}
                    placeholder="Inquiry about..."
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className={`block text-sm font-medium text-${selectedTheme}-700 mb-1`}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  className={`block w-full p-2.5 border border-${selectedTheme}-300 rounded-md shadow-sm focus:outline-none focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 sm:text-sm`}
                  placeholder="Your message..."
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-${selectedTheme}-600 hover:bg-${selectedTheme}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${selectedTheme}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {formSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
              {formMessage && (
                <p
                  className={`mt-3 text-sm ${
                    formMessage.includes("Thank you")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
