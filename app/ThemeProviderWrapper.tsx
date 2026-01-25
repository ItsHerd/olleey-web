"use client";

import { ThemeProvider } from "@/lib/useTheme";
import { ProjectProvider } from "@/lib/ProjectContext";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </ThemeProvider>
  );
}
