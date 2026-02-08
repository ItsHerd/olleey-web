"use client";

import { ReviewProvider } from "@/lib/ReviewContext";
import { DemoProvider } from "@/lib/DemoContext";
import { ProjectProvider } from "@/lib/ProjectContext";
import DashboardLayout from "@/components/DashboardLayout";

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <DemoProvider>
        <ReviewProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ReviewProvider>
      </DemoProvider>
    </ProjectProvider>
  );
}
