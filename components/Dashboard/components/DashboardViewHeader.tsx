"use client";

import React from "react";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewType } from "../DashboardLayout";

interface DashboardViewHeaderProps {
  view: ViewType;
  theme: string;
  onBackHome: () => void;
}

const VIEW_COPY: Record<ViewType, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Home",
    subtitle: "Overview of your localization workspace",
  },
  videos: {
    title: "Videos",
    subtitle: "Browse source and localized media",
  },
  channels: {
    title: "Channels",
    subtitle: "Manage connected YouTube channels",
  },
  voices: {
    title: "Voices",
    subtitle: "Configure voice profiles and models",
  },
  preferences: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
  },
  settings: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Recent activity and delivery events",
  },
  account: {
    title: "Account",
    subtitle: "Profile and session controls",
  },
  analytics: {
    title: "Analytics",
    subtitle: "Performance and workflow metrics",
  },
  guardrails: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
  },
  support: {
    title: "Support",
    subtitle: "Help resources and support options",
  },
  manual_workflow: {
    title: "Manual Ingestion",
    subtitle: "Create and launch localization jobs manually",
  },
  review: {
    title: "Review",
    subtitle: "Inspect and approve localized output",
  },
  preview: {
    title: "Preview",
    subtitle: "Final verification before publishing",
  },
  processing: {
    title: "Processing",
    subtitle: "Track active localization jobs",
  },
  runs: {
    title: "Pipeline Runs",
    subtitle: "Monitor all job executions",
  },
  detected_uploads: {
    title: "Detected Uploads",
    subtitle: "New videos detected from your channels",
  },
};

export function DashboardViewHeader({ view, theme, onBackHome }: DashboardViewHeaderProps) {
  const isDark = theme === "dark";
  const copy = VIEW_COPY[view] || VIEW_COPY.dashboard;
  const isHome = view === "dashboard";

  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b px-6 py-4 md:px-8",
        isDark ? "border-white/10 bg-[#141414]/95" : "border-black/10 bg-[#F7F6EE]/95",
        "backdrop-blur supports-[backdrop-filter]:backdrop-blur"
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="min-w-0">
          {!isHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackHome}
              className={cn(
                "mb-3 h-7 -ml-1 gap-1.5 px-2 text-xs font-medium",
                isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/[0.05]"
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <Home className="h-3.5 w-3.5" />
              Back to Home
            </Button>
          )}
          <h1 className={cn("truncate text-4xl leading-none tracking-tight md:text-5xl", isDark ? "text-white" : "text-black", "font-light")}>
            {copy.title}
          </h1>
          <p className={cn("mt-2 text-sm", isDark ? "text-white/60" : "text-black/60")}>{copy.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
