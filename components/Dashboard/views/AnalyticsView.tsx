"use client";

import React, { useMemo } from "react";
import { BarChart3, CheckCircle2, Clock3, Globe2, Layers3, PlayCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useDashboardChannels } from "@/lib/useDashboardChannels";
import { useVideos } from "@/lib/useVideos";
import { resolveClientUserId } from "@/lib/user";

interface AnalyticsViewProps {
  theme: string;
}

function startOfDayISO(daysAgo: number) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

export function AnalyticsView({ theme }: AnalyticsViewProps) {
  const isDark = theme === "dark";
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = resolveClientUserId(user?.id);

  const { jobs, loading: jobsLoading } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    limit: 1000,
    enabled: !!userId,
  });

  const { videos, loading: videosLoading } = useVideos(
    { project_id: selectedProject?.id, user_id: userId },
    { enabled: !!userId }
  );

  const { channels, loading: channelsLoading } = useDashboardChannels({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId,
  });

  const isLoading = jobsLoading || videosLoading || channelsLoading;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const job of jobs) counts[job.status] = (counts[job.status] || 0) + 1;
    return counts;
  }, [jobs]);

  const totalJobs = jobs.length;
  const completedJobs = (statusCounts.completed || 0) + (statusCounts.waiting_approval || 0);
  const failedJobs = statusCounts.failed || 0;
  const cancelledJobs = statusCounts.cancelled || 0;
  const activeJobs = jobs.filter((job) =>
    ["pending", "queued", "downloading", "processing", "transcribing", "translating", "dubbing", "uploading", "voice_cloning", "lip_sync", "syncing", "assembling"].includes(job.status)
  ).length;
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
  const totalViews = videos.reduce((sum, video) => sum + Number(video.view_count || 0), 0);

  const jobsByDay = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, idx) => {
      const date = new Date(startOfDayISO(13 - idx));
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { label, count: 0 };
    });
    const dayMap = new Map(days.map((d) => [d.label, d]));

    for (const job of jobs) {
      const createdAt = new Date(job.created_at);
      if (Number.isNaN(createdAt.getTime())) continue;
      const label = `${createdAt.getMonth() + 1}/${createdAt.getDate()}`;
      const entry = dayMap.get(label);
      if (entry) entry.count += 1;
    }
    return days;
  }, [jobs]);

  const topLanguageDemand = useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach((job) => {
      (job.target_languages || []).forEach((lang) => {
        counts.set(lang, (counts.get(lang) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [jobs]);

  const statusRows = useMemo(() => {
    const sorted = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 8);
  }, [statusCounts]);

  const maxJobsByDay = Math.max(1, ...jobsByDay.map((d) => d.count));
  const maxStatus = Math.max(1, ...statusRows.map(([, count]) => count));
  const maxLanguage = Math.max(1, ...topLanguageDemand.map(([, count]) => count));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="mx-auto max-w-7xl p-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <Layers3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{totalJobs}</p>
          </Card>
          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{successRate}%</p>
          </Card>
          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <Clock3 className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{activeJobs}</p>
          </Card>
          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Views</p>
              <PlayCircle className="h-4 w-4 text-sky-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{totalViews.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Card className={cn("border p-5 xl:col-span-7", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Jobs Over Last 14 Days</p>
                <p className="text-xs text-muted-foreground">Created jobs trend</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="h-52 rounded-lg border border-dashed border-border p-3">
              <div className="flex h-full items-end gap-2">
                {jobsByDay.map((day) => (
                  <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <div
                      className="w-full rounded-sm bg-primary/80"
                      style={{ height: `${Math.max(8, (day.count / maxJobsByDay) * 100)}%` }}
                      title={`${day.label}: ${day.count}`}
                    />
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className={cn("border p-5 xl:col-span-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <p className="text-sm font-medium">Pipeline Status Breakdown</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Current job states</p>
            <div className="mt-4 space-y-3">
              {statusRows.map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs capitalize">{status.replaceAll("_", " ")}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <p className="text-sm font-medium">Top Target Languages</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Based on jobs target_languages</p>
            <div className="mt-4 space-y-3">
              {topLanguageDemand.length === 0 && (
                <p className="text-xs text-muted-foreground">No language data yet.</p>
              )}
              {topLanguageDemand.map(([lang, count]) => (
                <div key={lang}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs uppercase">{lang}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(count / maxLanguage) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={cn("border p-5", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10")}>
            <p className="text-sm font-medium">Workspace Snapshot</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Current scale indicators</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Connected channels</p>
                <p className="mt-1 text-2xl font-semibold">{channels.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Source videos</p>
                <p className="mt-1 text-2xl font-semibold">{videos.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Completed</p>
                <p className="mt-1 text-2xl font-semibold">{completedJobs}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Failed / Cancelled</p>
                <p className="mt-1 text-2xl font-semibold">
                  {failedJobs + cancelledJobs}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Completed {completedJobs}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                Failed {failedJobs}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-3 w-3 text-sky-500" />
                Channels {channels.length}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

