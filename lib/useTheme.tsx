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
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await settingsAPI.getSettings();
        setThemeState(settings.theme);
      } catch (error) {
        console.error("Failed to load theme:", error);
        // Default to dark if loading fails
        setThemeState("dark");
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
    // Save to backend (only when user explicitly changes theme)
    try {
      await settingsAPI.updateSettings({ theme: newTheme });
    } catch (error) {
      console.error("Failed to save theme:", error);
      // Revert on error
      const currentSettings = await settingsAPI.getSettings().catch(() => null);
      if (currentSettings) {
        setThemeState(currentSettings.theme);
      }
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
