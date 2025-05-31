// contexts/ThemeContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export const availableApplicationThemes = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink",
  "rose", "slate", "gray", "zinc", "neutral", "stone",
];

interface ThemeContextType {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  themeColors: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTheme, setSelectedThemeState] = useState<string>("gray"); // Default theme

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme"); // <--- CHANGED TO "theme"
    if (storedTheme && availableApplicationThemes.includes(storedTheme)) {
      setSelectedThemeState(storedTheme);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  const setSelectedTheme = (theme: string) => {
    if (availableApplicationThemes.includes(theme)) {
        setSelectedThemeState(theme);
        localStorage.setItem("theme", theme); // <--- CHANGED TO "theme"
    } else {
        console.warn(`Attempted to set an invalid theme: ${theme}. Available: ${availableApplicationThemes.join(', ')}`);
    }
  };


  return (
    <ThemeContext.Provider value={{ selectedTheme, setSelectedTheme, themeColors: availableApplicationThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};