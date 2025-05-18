"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import NotificationPopup from "../components/NotificationPopup";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // You already have this!
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setLoading(true); 

    if (!email || !password) {
      showNotification("Email and password are required.", "error");
      setLoading(false); 
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (signInError) {
      showNotification(signInError.message, "error");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false); // Reset loading
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    setNotification(null);
    setLoading(true); 
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      showNotification(oauthError.message, "error");
      setLoading(false); 
    }
  };

  return (
    <div className="flex h-screen">
       {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Left Section */}
      <div className="w-1/2 bg-gray-900 text-white flex flex-col justify-between p-8 h-full">
        <h1 className="text-4xl font-bold">Smart Career Companion</h1>
        <p className="text-start text-gray-400 text-xl">
          This is a short description about our project, which includes CV
          Analyzer and Mock Interview.
        </p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-gray-500 mb-6">
          Fill in the form to access your account
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-lg space-y-4">
          <input
            type="email"
            className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} 
          />
          <button
            type="submit"
            className="w-full p-3 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading} 
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="w-full max-w-sm flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="mx-2 text-gray-500 text-sm">OR CONTINUE WITH</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleOAuthLogin("github")}
            className="p-3 border rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            disabled={loading}
          >
            {loading && <SpinnerIcon className="mr-2" />} <FaGithub className="mr-2" /> GitHub
          </button>
          <button
            onClick={() => handleOAuthLogin("google")}
            className="p-3 border rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            disabled={loading}
          >
            {loading && <SpinnerIcon className="mr-2" />} <FaGoogle className="mr-2" /> Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

const SpinnerIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`animate-spin h-5 w-5 text-white ${className}`}
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
);


export default LoginPage;