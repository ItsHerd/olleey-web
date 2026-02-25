"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  LayoutGrid,
  MessageSquare,
  Activity,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectedItem } from "../DashboardLayout";
import { JobCard } from "../components/JobCard";
import { NewLocalizationModal } from "../components/NewLocalizationModal";
import { AgentView } from "./AgentView";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { cn } from "@/lib/utils";
import { jobsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useReview } from "@/lib/ReviewContext";
import { useVideos } from "@/lib/useVideos";
import { isDemoUser, YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION } from "@/lib/mockDemoData";
import { resolveClientUserId } from "@/lib/user";
import { useSettings } from "@/lib/SettingsContext";
import { EnterprisePipelineStatus } from "./EnterprisePipelineStatus";

interface DashboardViewProps {
  onSelectJob: (item: SelectedItem) => void;
  theme: string;
  onViewChange?: (view: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    } as const
  }
};

export function DashboardView({ onSelectJob, theme, onViewChange }: DashboardViewProps) {
  const [viewMode, setViewMode] = useState<"agent" | "grid">("agent");
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = resolveClientUserId(user?.id);
  const isDark = theme === "dark";
  const { openReview } = useReview();
  const { videos } = useVideos();
  const { isEnterprise } = useSettings();

  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelledJobIds, setCancelledJobIds] = useState<Set<string>>(new Set());

  // Fetch jobs
  const { jobs, loading, refetch } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId
  });

  const { toast } = useToast();

  const handleCancelJob = async (jobId: string) => {
    try {
      // Optimistically mark as cancelled
      setCancelledJobIds(prev => new Set(prev).add(jobId));
      window.dispatchEvent(new CustomEvent('olleey-job-cancelled', { detail: { jobId } }));

      await jobsAPI.cancelJob(jobId);
      toast("Job cancelled successfully", "success");
      refetch();
    } catch (err: any) {
      // Revert optimism on error
      setCancelledJobIds(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast(err.message || "Failed to cancel job", "error");
    }
  };

  const handleReview = (job: any, langCode: string) => {
    // Set selected item first
    onSelectJob({ type: "job", id: job.job_id, data: job });

    const video = videos.find(v => v.video_id === job.source_video_id);
    const targetVideo = video || (isDemoUser(userId || "demo") && job.source_video_id === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO : null);

    if (!targetVideo) {
      toast("Source video not found for this job", "error");
      return;
    }

    const localization = (job.source_video_id === "demo_yc_ceo_video_001" && langCode === "es")
      ? YC_CEO_SPANISH_TRANSLATION
      : (targetVideo.localizations as any)?.[langCode];

    openReview({
      videoId: job.source_video_id,
      languageCode: langCode,
      jobId: job.job_id,
      originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
      dubbedVideoUrl: localization?.dubbed_video_url || localization?.storage_url || localization?.video_url || "",
      videoTitle: targetVideo.title,
      videoDescription: targetVideo.description || "",
      thumbnailUrl: targetVideo.thumbnail_url,
      localizedTitle: localization?.title || "",
      localizedDescription: localization?.description || "",
      isApproved: localization?.status === 'approved',
      approvedAt: targetVideo.published_at,
      navigate: false
    });

    onViewChange?.("review");
  };

  const getJobDisplayTitle = (job: any) => {
    const video = videos.find(v => v.video_id === job.source_video_id);
    if (video?.title) return video.title;

    const metadataTitle = job?.workflow_state?.metadata?.title;
    if (typeof metadataTitle === "string" && metadataTitle.trim().length > 0) {
      return metadataTitle;
    }

    if (job.source_video_id === "demo_yc_ceo_video_001") {
      return YC_CEO_DEMO_VIDEO.title;
    }

    return job.source_video_id;
  };

  // Split jobs into active and needs review, filtering out optimistically cancelled once
  const activeJobs = jobs.filter(j =>
    !cancelledJobIds.has(j.job_id) &&
    ['pending', 'downloading', 'processing', 'uploading'].includes(j.status)
  );

  const needsReviewJobs = jobs.filter((j: any) => {
    if (cancelledJobIds.has(j.job_id)) return false;
    if (j.status !== "waiting_approval") return false;
    const progressReady = Number(j.progress || 0) > 0;
    const stageReady = j.current_stage === "completed";
    const reviewApproved = j?.workflow_state?.review?.status === "approved_manual";
    return progressReady || stageReady || reviewApproved;
  });

  const completedRecentJobs = jobs.filter(j =>
    !cancelledJobIds.has(j.job_id) &&
    j.status === 'completed'
  ).slice(0, 3);

  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const shadowClass = isDark ? "shadow-sm" : "shadow-none";

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-[#F4F4F4]"}`}>
      {isEnterprise ? (
        <div className="h-full flex flex-col overflow-auto custom-scrollbar">
          <div className={`px-8 py-6 ${isDark ? 'border-b border-white/10' : ''} relative z-10`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Overview</h1>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-70">
              Workspace activity at a glance
            </p>
          </div>
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <EnterprisePipelineStatus theme={theme} onViewChange={onViewChange} />
            </div>
          </div>
        </div>
      ) : viewMode === "agent" ? (
        <div className="h-full flex flex-col">
          <AgentView theme={theme} onViewChange={onViewChange} />
        </div>
      ) : (
        <>
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC107]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className={`px-8 py-6 ${isDark ? 'border-b border-white/10' : ''} relative z-10 backdrop-blur-sm bg-opacity-80`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Olleey Control</h1>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-70">
                  Localization Pipeline Monitor
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 rounded-xl bg-muted border border-border">
                  <button
                    onClick={() => setViewMode("agent")}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-muted-foreground hover:text-foreground"
                  >
                    Agent
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-background text-foreground shadow-sm"
                  >
                    Grid
                  </button>
                </div>
                <Button
                  onClick={() => setShowNewModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10 rounded-xl text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Initialize
                </Button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl h-11 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest border-border">
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 custom-scrollbar relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-7xl mx-auto space-y-12"
            >
              {/* Quick Stats Header (Visual only) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Nodes", value: activeJobs.length, icon: Zap, color: "text-blue-500" },
                  { label: "Awaiting Review", value: needsReviewJobs.length, icon: Clock, color: "text-amber-500" },
                  { label: "Success Rate", value: "98.4%", icon: TrendingUp, color: "text-emerald-500" },
                  { label: "Total Capacity", value: "1.2 TB", icon: Activity, color: "text-purple-500" }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="bg-card border border-border p-5 rounded-xl group hover:border-primary/20 transition-all cursor-default shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                      <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Active Pipelines */}
              {activeJobs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Active Pipelines</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
                        <JobCard
                          job={job}
                          videoTitle={getJobDisplayTitle(job)}
                          onClick={() =>
                            onSelectJob({ type: "job", id: job.job_id, data: job })
                          }
                          theme={theme}
                          onCancel={() => handleCancelJob(job.job_id)}
                          onSelectLanguage={(lang) => handleReview(job, lang)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Needs Review */}
              {needsReviewJobs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Human in the Loop</h2>
                    </div>
                    <button
                      onClick={() => onViewChange?.("review")}
                      className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      {needsReviewJobs.length} Review Requested
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {needsReviewJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
                        <JobCard
                          job={job}
                          videoTitle={getJobDisplayTitle(job)}
                          onClick={() => {
                            onSelectJob({ type: "job", id: job.job_id, data: job });
                            // Now we prefer language-specific review
                            // but keep this for backwards compatibility
                            if (job.status === 'waiting_approval') {
                              handleReview(job, job.target_languages[0] || "es");
                            } else {
                              onViewChange?.("dashboard");
                            }
                          }}
                          theme={theme}
                          highlight="review"
                          onCancel={() => handleCancelJob(job.job_id)}
                          onSelectLanguage={(lang) => handleReview(job, lang)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recently Completed */}
              {completedRecentJobs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Operation History</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80">
                      Terminal Log →
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {completedRecentJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
                        <JobCard
                          job={job}
                          videoTitle={getJobDisplayTitle(job)}
                          onClick={() =>
                            onSelectJob({ type: "job", id: job.job_id, data: job })
                          }
                          theme={theme}
                          onCancel={() => handleCancelJob(job.job_id)}
                          onSelectLanguage={(lang) => handleReview(job, lang)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {activeJobs.length === 0 && needsReviewJobs.length === 0 && completedRecentJobs.length === 0 && !loading && (
                <motion.div
                  variants={itemVariants}
                  className={`${cardBgClass} rounded-[2rem] border ${borderClass} p-20 text-center relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FFC107]/5 to-transparent opacity-50 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-[1.5rem] bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 ${isDark ? 'shadow-2xl shadow-[#FFC107]/10' : ''}">
                      <Zap className="w-12 h-12 text-[#FFC107]" />
                    </div>
                    <h3 className={`text-3xl font-black mb-4 tracking-tighter ${textClass}`}>Digital Void Detected</h3>
                    <p className={`text-base ${textSecondaryClass} mb-12 max-w-md mx-auto font-medium leading-relaxed`}>
                      No active localization streams detected in this project. Initialize your first neural node to begin global synchronization.
                    </p>
                    <Button
                      onClick={() => setShowNewModal(true)}
                      className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-black px-12 h-14 rounded-2xl text-sm uppercase tracking-[0.1em] shadow-2xl shadow-[#FFC107]/20 transition-all active:scale-95"
                    >
                      Initialize First Pipeline
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* New Localization Modal */}
      <NewLocalizationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        theme={theme}
      />
    </div>
  );
}
