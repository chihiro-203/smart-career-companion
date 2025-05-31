"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import NotificationPopup from "../components/NotificationPopup"; // Adjust path if needed
import { useTheme } from "../contexts/ThemeContext";

const LoginPage = () => {
  const { selectedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    setLoading(false);
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
    <div className="flex flex-col md:flex-row h-screen">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Left Section: Illustration*/}
      <div className={`w-full md:w-1/2 bg-${selectedTheme}-900 text-white flex flex-col items-center justify-center p-8 lg:p-12 order-1 md:order-1 h-1/2 md:h-full`}>
        <div className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl lg:text-4xl font-bold text-${selectedTheme}-400`}>
            Smart Career Companion
          </h1>
          <p className={`text-md lg:text-lg text-${selectedTheme}-300 mt-2`}>
            Unlock your professional potential.
          </p>
        </div>
        <div className="w-full max-w-md lg:max-w-lg aspect-[4/3] relative">
          <Image
            src="/robotics.svg"
            alt="Career Companion Illustration"
            fill // Replaces layout="fill"
            style={{ objectFit: "contain" }} // Replaces objectFit="contain"
            priority
          />
        </div>
      </div>

      {/* Right Section: Login Form*/}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 order-2 md:order-2 h-1/2 md:h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h2 className={`text-3xl sm:text-4xl font-bold text-${selectedTheme}-800`}>Welcome back!</h2>
            <p className={`text-${selectedTheme}-500 mt-2`}>Nice to see you again!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email or phone number</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border border-${selectedTheme}-300 rounded-lg bg-${selectedTheme}-50 focus:ring-2 focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 outline-none placeholder-${selectedTheme}-400 text-${selectedTheme}-900`}
                placeholder="Email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 border border-${selectedTheme}-300 rounded-lg bg-${selectedTheme}-50 focus:ring-2 focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500 outline-none placeholder-${selectedTheme}-400 text-${selectedTheme}-900`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-${selectedTheme}-500 hover:text-${selectedTheme}-700`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`${
                    rememberMe ? `bg-${selectedTheme}-600` : `bg-${selectedTheme}-200`
                  } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${selectedTheme}-500`}
                  role="switch"
                  aria-checked={rememberMe}
                >
                  <span className="sr-only">Remember me</span>
                  <span
                    className={`${
                      rememberMe ? 'translate-x-6' : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                  />
                </button>
                <label htmlFor="remember-me-button" onClick={() => setRememberMe(!rememberMe)} className={`ml-2 block text-${selectedTheme}-700 cursor-pointer`}>
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className={`font-medium text-${selectedTheme}-600 hover:text-${selectedTheme}-500 hover:underline`}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 bg-${selectedTheme}-800 text-white font-semibold rounded-lg hover:bg-${selectedTheme}-900 focus:outline-none focus:ring-2 focus:ring-${selectedTheme}-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t border-${selectedTheme}-300`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 bg-white text-${selectedTheme}-500`}>Or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin("github")}
                className={`w-full inline-flex justify-center py-2 px-4 border border-${selectedTheme}-300 rounded-md shadow-sm bg-white text-sm font-medium text-${selectedTheme}-500 hover:bg-${selectedTheme}-50 disabled:opacity-60`}
                disabled={loading}
              >
                <span className="sr-only">Sign in with GitHub</span>
                <FaGithub className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOAuthLogin("google")}
                className={`w-full inline-flex justify-center py-2 px-4 border border-${selectedTheme}-300 rounded-md shadow-sm bg-white text-sm font-medium text-${selectedTheme}-500 hover:bg-${selectedTheme}-50 disabled:opacity-60`}
                disabled={loading}
              >
                <span className="sr-only">Sign in with Google</span>
                <FaGoogle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className={`mt-10 text-center text-sm text-${selectedTheme}-600`}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className={`font-medium text-${selectedTheme}-600 hover:text-${selectedTheme}-500 hover:underline`}>
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;