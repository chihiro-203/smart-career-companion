/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Bot, Menu, User, X, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";

const getTailwindColorValue = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    red: "#EF4444", orange: "#F97316", amber: "#F59E0B", yellow: "#EAB308",
    lime: "#84CC16", green: "#22C55E", emerald: "#10B981", teal: "#14B8A6",
    cyan: "#06B6D4", sky: "#0EA5E9", blue: "#3B82F6", indigo: "#6366F1",
    violet: "#8B5CF6", purple: "#A855F7", fuchsia: "#D946EF", pink: "#EC4899",
    rose: "#F43F5E", slate: "#64748B", gray: "#6B7280", zinc: "#71717A",
    neutral: "#737373", stone: "#78716C",
  };
  return colorMap[colorName.toLowerCase()] || "#CCCCCC";
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Use theme from context
  const { selectedTheme, setSelectedTheme, themeColors } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [themeSearchTerm, setThemeSearchTerm] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);

  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const themeToggleButtonRef = useRef<HTMLButtonElement>(null);
  const themeSearchInputRef = useRef<HTMLInputElement>(null);

  // Removed useEffect for loading/saving theme, as it's handled by ThemeProvider

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        setUserEmail(null);
      } else if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
      }
      setIsLoadingUser(false);
    };

    fetchUser();
    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email) {
          setUserEmail(session.user.email);
        } else if (event === "SIGNED_OUT") {
          setUserEmail(null);
        }
      }
    );
    return () => {
      if (authListenerData && authListenerData.subscription) {
        authListenerData.subscription.unsubscribe();
      }
    };
  }, [supabase, router, pathname]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsThemeSelectorOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
    else {
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(target) &&
        mobileMenuPanelRef.current &&
        !mobileMenuPanelRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        isThemeSelectorOpen &&
        themeSelectorRef.current &&
        !themeSelectorRef.current.contains(target) &&
        themeToggleButtonRef.current &&
        !themeToggleButtonRef.current.contains(target)
      ) {
        setIsThemeSelectorOpen(false);
        setThemeSearchTerm("");
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
        if (isThemeSelectorOpen) {
            setIsThemeSelectorOpen(false);
            setThemeSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isMobileMenuOpen, isThemeSelectorOpen]);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/resume", label: "Resume Analyzer" },
    { href: "/dashboard/job", label: "Job Suggestion" },
    { href: "/dashboard/cover-letter", label: "Cover Letter" },
  ];

  const getLinkClass = (path: string, isMobile: boolean = false) => {
    const isActive =
      (path === "/dashboard" && pathname === "/dashboard") ||
      (path !== "/dashboard" && pathname.startsWith(path));

    let baseClasses = "px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out rounded";
    if (isMobile) baseClasses += " block w-full text-left";

    return `${baseClasses} ${
      isActive
        ? `bg-${selectedTheme}-100 text-${selectedTheme}-800 underline font-semibold`
        : `text-${selectedTheme}-600 hover:bg-${selectedTheme}-50 hover:text-${selectedTheme}-700`
    }`;
  };

  const handleThemeSelect = (color: string) => {
    setSelectedTheme(color); // This now calls the function from ThemeContext
    setIsThemeSelectorOpen(false);
    setThemeSearchTerm("");
  };

  const filteredThemeColors = themeColors.filter((color) => // themeColors from context
    color.toLowerCase().includes(themeSearchTerm.toLowerCase())
  );

  const toggleThemeSelector = () => {
    const opening = !isThemeSelectorOpen;
    setIsThemeSelectorOpen(opening);
    if (opening) setTimeout(() => themeSearchInputRef.current?.focus(), 0);
    else setThemeSearchTerm("");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className={`text-2xl font-bold text-${selectedTheme}-800`}>
            <Bot className="block h-8 w-8" aria-hidden="true" />
          </Link>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-1 items-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="md:hidden ml-3">
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md text-${selectedTheme}-600 hover:text-${selectedTheme}-900 hover:bg-${selectedTheme}-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-${selectedTheme}-500`}
                aria-expanded={isMobileMenuOpen}
                aria-label="Open main menu"
                data-testid="mobile-menu-button"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`p-1.5 ml-4 rounded-full border hover:bg-${selectedTheme}-100 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${selectedTheme}-500`}
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
              >
                <User className={`h-8 w-8 text-${selectedTheme}-600`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-50 py-1 ring-1 ring-black ring-opacity-5">
                  {userEmail && (
                    <div className="px-4 py-3">
                      <p className={`text-sm text-${selectedTheme}-500`}>Signed in as</p>
                      <p
                        className={`text-sm font-medium text-${selectedTheme}-900 truncate`}
                        title={userEmail}
                      >
                        {userEmail}
                      </p>
                    </div>
                  )}
                  <div className={`border-t border-${selectedTheme}-100`}></div>
                  
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium text-${selectedTheme}-900`}>Theme</span>
                      <button
                        ref={themeToggleButtonRef}
                        onClick={toggleThemeSelector}
                        className={`flex items-center text-sm text-${selectedTheme}-700 hover:text-${selectedTheme}-900 focus:outline-none p-1 -mr-1 rounded-md hover:bg-${selectedTheme}-100`}
                        aria-expanded={isThemeSelectorOpen}
                        aria-controls="theme-picker-panel"
                      >
                        <span
                          style={{ backgroundColor: getTailwindColorValue(selectedTheme) }}
                          className={`inline-block w-4 h-4 rounded-full mr-2 border border-${selectedTheme}-300`}
                        ></span>
                        {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
                        <ChevronDown
                          className={`ml-1 h-4 w-4 text-${selectedTheme}-500 transform transition-transform duration-150 ${
                            isThemeSelectorOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isThemeSelectorOpen && (
                      <div
                        id="theme-picker-panel"
                        ref={themeSelectorRef}
                        className={`mt-2 p-2 border border-${selectedTheme}-200 rounded-md bg-${selectedTheme}-50 shadow-sm`}
                      >
                        <input
                          ref={themeSearchInputRef}
                          type="text"
                          placeholder="Search color..."
                          value={themeSearchTerm}
                          onChange={(e) => setThemeSearchTerm(e.target.value)}
                          className={`w-full px-2 py-1.5 border border-${selectedTheme}-300 rounded-md text-sm mb-2 focus:ring-1 focus:ring-${selectedTheme}-500 focus:border-${selectedTheme}-500`}
                        />
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {filteredThemeColors.length > 0 ? (
                            filteredThemeColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => handleThemeSelect(color)}
                                className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                                  selectedTheme === color
                                    ? `bg-${selectedTheme}-100 text-${selectedTheme}-700 font-medium`
                                    : `text-${selectedTheme}-700 hover:bg-${selectedTheme}-200`
                                }`}
                                role="option"
                                aria-selected={selectedTheme === color}
                              >
                                <span
                                  style={{ backgroundColor: getTailwindColorValue(color) }}
                                  className={`inline-block w-3 h-3 rounded-full mr-2 border border-${selectedTheme}-400`}
                                ></span>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                                {selectedTheme === color && (
                                  <Check className={`ml-auto h-4 w-4 text-${selectedTheme}-600`} />
                                )}
                              </button>
                            ))
                          ) : (
                            <p className={`text-sm text-${selectedTheme}-500 text-center py-2`}>No colors found.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`border-t border-${selectedTheme}-100`}></div>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm text-${selectedTheme}-700 hover:bg-${selectedTheme}-100 focus:outline-none focus:bg-${selectedTheme}-100`}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            ref={mobileMenuPanelRef}
            className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-30 mx-4 rounded-b-md border border-t-0 border-${selectedTheme}-200`}
            id="mobile-menu"
          >
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClass(link.href, true)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;