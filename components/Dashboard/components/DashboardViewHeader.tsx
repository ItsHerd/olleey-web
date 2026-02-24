"use client";

import React from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  Eye,
  FileCheck2,
  Home,
  Layers,
  LifeBuoy,
  Radio,
  Rss,
  Settings2,
  UploadCloud,
  UserCircle2,
  Video,
  Volume2,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewType } from "../DashboardLayout";

interface DashboardViewHeaderProps {
  view: ViewType;
  theme: string;
  onBackHome: () => void;
}

const VIEW_COPY: Record<ViewType, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  dashboard: {
    title: "Home",
    subtitle: "Overview of your localization workspace",
    icon: Home,
  },
  videos: {
    title: "Videos",
    subtitle: "Browse source and localized media",
    icon: Video,
  },
  channels: {
    title: "Channels",
    subtitle: "Manage connected YouTube channels",
    icon: Radio,
  },
  voices: {
    title: "Voices",
    subtitle: "Configure voice profiles and models",
    icon: Volume2,
  },
  preferences: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
    icon: Settings2,
  },
  settings: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
    icon: Settings2,
  },
  notifications: {
    title: "Notifications",
    subtitle: "Recent activity and delivery events",
    icon: Bell,
  },
  account: {
    title: "Account",
    subtitle: "Profile and session controls",
    icon: UserCircle2,
  },
  analytics: {
    title: "Analytics",
    subtitle: "Performance and workflow metrics",
    icon: BarChart3,
  },
  guardrails: {
    title: "Preferences",
    subtitle: "Workflow, quality, and notification settings",
    icon: Settings2,
  },
  support: {
    title: "Support",
    subtitle: "Help resources and support options",
    icon: LifeBuoy,
  },
  manual_workflow: {
    title: "Single Upload",
    subtitle: "Translate and dub one video at a time",
    icon: UploadCloud,
  },
  review: {
    title: "Review",
    subtitle: "Inspect and approve localized output",
    icon: FileCheck2,
  },
  preview: {
    title: "Preview",
    subtitle: "Final verification before publishing",
    icon: Eye,
  },
  processing: {
    title: "Processing",
    subtitle: "Track active localization jobs",
    icon: Activity,
  },
  runs: {
    title: "Pipeline Runs",
    subtitle: "Monitor all job executions",
    icon: Workflow,
  },
  detected_uploads: {
    title: "Detected Uploads",
    subtitle: "New videos detected from your channels",
    icon: Rss,
  },
  batch_upload: {
    title: "Batch Upload",
    subtitle: "Translate and dub multiple videos at once",
    icon: Layers,
  },
};

const VIEW_ICON_STYLES: Record<
  ViewType,
  { lightContainer: string; darkContainer: string; lightIcon: string; darkIcon: string }
> = {
  dashboard: {
    lightContainer: "border-emerald-200 bg-emerald-50/90",
    darkContainer: "border-emerald-500/30 bg-emerald-500/10",
    lightIcon: "text-emerald-600",
    darkIcon: "text-emerald-300",
  },
  videos: {
    lightContainer: "border-sky-200 bg-sky-50/90",
    darkContainer: "border-sky-500/30 bg-sky-500/10",
    lightIcon: "text-sky-600",
    darkIcon: "text-sky-300",
  },
  channels: {
    lightContainer: "border-indigo-200 bg-indigo-50/90",
    darkContainer: "border-indigo-500/30 bg-indigo-500/10",
    lightIcon: "text-indigo-600",
    darkIcon: "text-indigo-300",
  },
  voices: {
    lightContainer: "border-violet-200 bg-violet-50/90",
    darkContainer: "border-violet-500/30 bg-violet-500/10",
    lightIcon: "text-violet-600",
    darkIcon: "text-violet-300",
  },
  preferences: {
    lightContainer: "border-amber-200 bg-amber-50/90",
    darkContainer: "border-amber-500/30 bg-amber-500/10",
    lightIcon: "text-amber-600",
    darkIcon: "text-amber-300",
  },
  settings: {
    lightContainer: "border-amber-200 bg-amber-50/90",
    darkContainer: "border-amber-500/30 bg-amber-500/10",
    lightIcon: "text-amber-600",
    darkIcon: "text-amber-300",
  },
  notifications: {
    lightContainer: "border-rose-200 bg-rose-50/90",
    darkContainer: "border-rose-500/30 bg-rose-500/10",
    lightIcon: "text-rose-600",
    darkIcon: "text-rose-300",
  },
  account: {
    lightContainer: "border-teal-200 bg-teal-50/90",
    darkContainer: "border-teal-500/30 bg-teal-500/10",
    lightIcon: "text-teal-600",
    darkIcon: "text-teal-300",
  },
  analytics: {
    lightContainer: "border-fuchsia-200 bg-fuchsia-50/90",
    darkContainer: "border-fuchsia-500/30 bg-fuchsia-500/10",
    lightIcon: "text-fuchsia-600",
    darkIcon: "text-fuchsia-300",
  },
  guardrails: {
    lightContainer: "border-amber-200 bg-amber-50/90",
    darkContainer: "border-amber-500/30 bg-amber-500/10",
    lightIcon: "text-amber-600",
    darkIcon: "text-amber-300",
  },
  support: {
    lightContainer: "border-cyan-200 bg-cyan-50/90",
    darkContainer: "border-cyan-500/30 bg-cyan-500/10",
    lightIcon: "text-cyan-600",
    darkIcon: "text-cyan-300",
  },
  manual_workflow: {
    lightContainer: "border-orange-200 bg-orange-50/90",
    darkContainer: "border-orange-500/30 bg-orange-500/10",
    lightIcon: "text-orange-600",
    darkIcon: "text-orange-300",
  },
  review: {
    lightContainer: "border-lime-200 bg-lime-50/90",
    darkContainer: "border-lime-500/30 bg-lime-500/10",
    lightIcon: "text-lime-600",
    darkIcon: "text-lime-300",
  },
  preview: {
    lightContainer: "border-blue-200 bg-blue-50/90",
    darkContainer: "border-blue-500/30 bg-blue-500/10",
    lightIcon: "text-blue-600",
    darkIcon: "text-blue-300",
  },
  processing: {
    lightContainer: "border-yellow-200 bg-yellow-50/90",
    darkContainer: "border-yellow-500/30 bg-yellow-500/10",
    lightIcon: "text-yellow-700",
    darkIcon: "text-yellow-300",
  },
  runs: {
    lightContainer: "border-purple-200 bg-purple-50/90",
    darkContainer: "border-purple-500/30 bg-purple-500/10",
    lightIcon: "text-purple-600",
    darkIcon: "text-purple-300",
  },
  detected_uploads: {
    lightContainer: "border-red-200 bg-red-50/90",
    darkContainer: "border-red-500/30 bg-red-500/10",
    lightIcon: "text-red-600",
    darkIcon: "text-red-300",
  },
  batch_upload: {
    lightContainer: "border-violet-200 bg-violet-50/90",
    darkContainer: "border-violet-500/30 bg-violet-500/10",
    lightIcon: "text-violet-600",
    darkIcon: "text-violet-300",
  },
};

export function DashboardViewHeader({ view, theme, onBackHome }: DashboardViewHeaderProps) {
  const isDark = theme === "dark";
  const copy = VIEW_COPY[view] || VIEW_COPY.dashboard;
  const iconStyles = VIEW_ICON_STYLES[view] || VIEW_ICON_STYLES.dashboard;
  const Icon = copy.icon;
  const isHome = view === "dashboard";

  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b px-6 py-4 md:px-8",
        isDark ? "border-white/10 bg-[#141414]/95" : "border-black/8 bg-[#F4F4F4]/95",
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
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("rounded-md border p-1.5", isDark ? iconStyles.darkContainer : iconStyles.lightContainer)}>
              <Icon className={cn("h-5 w-5", isDark ? iconStyles.darkIcon : iconStyles.lightIcon)} />
            </div>
            <h1 className={cn("truncate text-2xl leading-none tracking-tight md:text-3xl", isDark ? "text-white" : "text-black", "font-light")}>
              {copy.title}
            </h1>
          </div>
          <p className={cn("mt-1.5 text-xs", isDark ? "text-white/60" : "text-black/60")}>{copy.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
