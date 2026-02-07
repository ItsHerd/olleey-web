"use client";

import { ProjectProvider } from "@/lib/ProjectContext";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      {children}
    </ProjectProvider>
  );
}
