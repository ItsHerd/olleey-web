"use client";

import { ThemeProvider } from "@/lib/useTheme";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
