// app/dashboard/components/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Menu, UserCircleIcon, X } from "lucide-react"; // Using lucide-react icons

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null); // Ref for the mobile menu button
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);   // Ref for the mobile menu panel

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close mobile menu if click is outside the button AND outside the menu panel
      if (
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node) &&
        mobileMenuPanelRef.current &&
        !mobileMenuPanelRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/resume", label: "Resume Analyzer" },
    { href: "/dashboard/job", label: "Job Suggestion" },
    { href: "/dashboard/letter", label: "Cover Letter" },
  ];

  const getLinkClass = (path: string, isMobile: boolean = false) => {
    const isActive =
      (path === "/dashboard" && pathname === "/dashboard") ||
      (path !== "/dashboard" && pathname.startsWith(path));

    let baseClasses = "px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out";
    if (isMobile) {
      baseClasses += " block w-full text-left";
    }

    return `${baseClasses} ${
      isActive
        ? "bg-gray-100 text-gray-800 underline font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
    }`;
  };


  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16"> {/* Fixed height for header */}
          <Link href="/dashboard" className="text-2xl font-bold text-gray-800">
            Logo
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center"> {/* Reduced space-x for desktop */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={getLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
             {/* User Avatar Dropdown (Keep this before mobile menu button in DOM for layering if mobile menu is absolute to header) */}
             <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
              >
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1 ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-3"> {/* Keep ml-3 to space from avatar */}
              <button
                ref={mobileMenuButtonRef} // Add ref to the button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
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
          </div>
        </div>

        {/* Mobile Menu - Absolutely Positioned */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuPanelRef} // Add ref to the panel
            className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-30 mx-4 rounded-b-md border border-t-0 border-gray-200" // Styling for absolute dropdown
            id="mobile-menu"
          >
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClass(link.href, true)} // Pass true for isMobile
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