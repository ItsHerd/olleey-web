"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { settingsAPI, type UserSettings } from "@/lib/api";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get from localStorage first (to prevent flash)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      if (saved) return saved;
      // Then check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    }
    return "light"; // Default to light for server/initial render to be neutral, or match system pref logic?
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await settingsAPI.getSettings();
        setThemeState(settings.theme);
        // Sync to local storage
        localStorage.setItem("theme", settings.theme);
      } catch (error) {
        console.error("Failed to load theme:", error);
        // Fallback to localStorage or system pref if not already set correctly
        // We already initialized from LS/System, so we can just leave it as is
        // unless we want to explicitely re-check system pref here
        if (typeof window !== "undefined" && !localStorage.getItem("theme")) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          setThemeState(systemTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Save to backend (only when user explicitly changes theme)
    try {
      await settingsAPI.updateSettings({ theme: newTheme });
    } catch (error) {
      console.error("Failed to save theme:", error);
      // Revert on error? Or just keep local state? 
      // Keeping local state is better UX, maybe retry later. 
      // For now, if backend fails, at least UI stays consistant.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
