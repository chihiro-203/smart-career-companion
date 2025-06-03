/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
// import { FaGithub, FaGoogle } from "react-icons/fa"; // Optional: If you want OAuth on register page
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import NotificationPopup from "../components/NotificationPopup"; // Adjust path if needed
import { useTheme } from "../contexts/ThemeContext"; // Import useTheme

const RegisterPage = () => {
  const { selectedTheme } = useTheme(); // Get the selected theme
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      showNotification("All fields are required.", "error");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      showNotification("Passwords do not match.", "error");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      showNotification(signUpError.message, "error");
    } else if (data.user) {
      if (data.session === null && data.user) {
        showNotification(
          `Confirmation email sent to ${data.user.email}. Please check your inbox.`,
          "success"
        );
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else if (data.session) {
        showNotification("Registration successful! Redirecting...", "success");
        router.push("/dashboard");
        router.refresh();
      } else {
         showNotification("Please check your email to confirm your account.", "info");
      }
    } else {
        showNotification("An unexpected error occurred. Please try again.", "error");
    }
    setLoading(false);
  };


  return (
    <div className="flex flex-col md:flex-row h-screen">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Left Section */}
      <div className={`w-full md:w-1/2 bg-gray-900 text-white flex flex-col items-center justify-center p-8 lg:p-12 order-1 md:order-1 h-1/2 md:h-full`}>
        <div className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl lg:text-4xl font-bold text-gray-200`}>
            Join Smart Career Companion
          </h1>
          <p className={`text-md lg:text-lg text-gray-300 mt-2`}>
            Start your journey to a brighter professional future.
          </p>
        </div>
        <div className="w-full max-w-md lg:max-w-lg aspect-[4/3] relative">
          <Image
            src="/robotics.svg"
            alt="Career Companion Illustration"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 order-2 md:order-2 h-1/2 md:h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h2 className={`text-3xl sm:text-4xl font-bold text-gray-800`}>Create your account</h2>
            <p className={`text-gray-500 mt-2`}>Let&apos;s get you started!</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email-register" className="sr-only">Email address</label>
              <input
                id="email-register"
                type="email"
                name="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-gray-400 text-gray-900`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password-register" className="sr-only">Password</label>
              <input
                id="password-register"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-gray-400 text-gray-900`}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700`}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password-register" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password-register"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-gray-400 text-gray-900`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700`}
              >
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className={`mt-10 text-center text-sm text-gray-600`}>
            Already have an account?{" "}
            <Link href="/login" className={`font-medium text-gray-600 hover:text-gray-500 hover:underline`}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;