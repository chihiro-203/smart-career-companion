"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    console.log("User registered: ", { email, password });
    // TODO: Add Firebase Auth logic here
  };

  return (
    <div className="flex h-screen">
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

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="w-full max-w-lg space-y-4">
          <input
            type="email"
            className="w-full p-2 border rounded-md bg-gray-100"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-2 border rounded-md bg-gray-100"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Log In
          </button>
        </form>

        <div className="w-full max-w-sm flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="mx-2 text-gray-500 text-sm">OR CONTINUE WITH</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="flex space-x-4">
          <button className="p-2 border rounded-md flex items-center cursor-pointer">
            <FaGithub className="mr-2" /> GitHub
          </button>
          <button className="p-2 border rounded-md flex items-center cursor-pointer">
            <FaGoogle className="mr-2" /> Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
