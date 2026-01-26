"use client";

import { ThemeManager } from "@/components/ThemeManager";
import { ProjectProvider } from "@/lib/ProjectContext";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeManager />
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </>
  );
}
