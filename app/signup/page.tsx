"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import NotificationPopup from "../components/NotificationPopup";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [error, setError] = useState(""); // We'll use notification state for errors too
  // const [message, setMessage] = useState(""); // We'll use notification state for messages

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null); // Clear previous notifications
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
      email: email.trim(), // Good practice to trim email
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      showNotification(signUpError.message, "error");
    } else if (data.user) {
      // Check if email confirmation is required (user exists but no session means confirmation pending for new user)
      if (data.session === null && data.user) {
        // This is the primary case for "Confirm email sent"
        showNotification(
          `Confirmation email sent to ${data.user.email}. Please check your inbox.`,
          "success"
        );
        // Optionally clear form fields
        // setEmail("");
        // setPassword("");
        // setConfirmPassword("");
      } else if (data.session) {
        // User is signed up and logged in (if email confirmation is disabled or auto-confirmed by provider)
        showNotification("Signup successful! Redirecting...", "success");
        router.push("/dashboard");
        router.refresh();
      } else if (data.user.identities && data.user.identities.length === 0) {
        // This case from before: user exists but is not confirmed (e.g., re-typed email of unconfirmed user)
        showNotification(
          "User already exists but is not confirmed. Please check your email to confirm your account or try logging in.",
          "info"
        );
      }
    } else {
      // Fallback for unexpected response
      showNotification("An unexpected error occurred during signup.", "error");
    }
    setLoading(false);
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
          Join us to analyze your CV and practice mock interviews.
        </p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 relative"> {/* Added relative for positioning if needed by advanced popups */}
        <h2 className="text-2xl font-bold mb-2">Create your account</h2>
        <p className="text-gray-500 mb-6">
          Get started by creating a new account.
        </p>

        {/* Form-specific errors can still be shown here if preferred over a popup for some cases */}
        {/* {error && <p className="text-red-500 mb-3 text-center">{error}</p>} */}
        {/* {message && <p className="text-green-500 mb-3 text-center">{message}</p>} */}

        <form onSubmit={handleSignup} className="w-full max-w-lg space-y-4">
          <input
            type="email"
            className="w-full p-2 border rounded-md bg-gray-100"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            className="w-full p-2 border rounded-md bg-gray-100"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            className="w-full p-2 border rounded-md bg-gray-100"
            placeholder="confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;