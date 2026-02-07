"use client";

import { useThemeContext } from "@/lib/ThemeContext";

// Re-export for compatibility with existing code
export function useTheme() {
  return useThemeContext();
}
