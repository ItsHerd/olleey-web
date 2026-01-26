"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setTheme as setReduxTheme, syncTheme } from "@/lib/store/features/uiSlice";

type Theme = "light" | "dark";

// Maintain the same interface as before for compatibility
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isLoading = !useAppSelector((state) => state.ui.isThemeInitialized);

  const setTheme = (newTheme: Theme) => {
    // Optimistic update
    dispatch(setReduxTheme(newTheme));
    // Trigger sync side-effect (localStorage + API)
    dispatch(syncTheme(newTheme));
  };

  return { theme, setTheme, isLoading };
}

// Deprecated: No longer needed as Redux handles state
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
