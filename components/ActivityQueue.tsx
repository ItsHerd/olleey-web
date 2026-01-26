"use client";

import { useRouter } from "next/navigation";
import { Play, Loader2, Sparkles, Clock, Download, Mic, Smile, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useActiveJobs } from "@/lib/useActiveJobs";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { ReviewJobModal } from "@/components/ui/review-job-modal";
import { useState } from "react";

import { logger } from "@/lib/logger";

export default function ActivityQueue() {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedProject } = useProject();
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { videos } = useVideos();
  const { jobs, activeJobs, isLoading: jobsLoading, hasActiveJobs } = useActiveJobs({
    enabled: true,
  });

  // Debug logging
  if (activeJobs.length > 0) {
    logger.debug("ActivityQueue", "Rendering active jobs", {
      count: activeJobs.length,
      statuses: activeJobs.map(j => j.status)
    });
  } else {
    logger.debug("ActivityQueue", "No active jobs to render");
  }

  const [reviewJobId, setReviewJobId] = useState<string | null>(null);

  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

  // Humanize job status
  const getJobStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; borderColor: string; icon: any; animated: boolean }> = {
      pending: {
        label: "Queued",
        color: theme === "light" ? "text-orange-600 bg-orange-50" : "text-orange-400 bg-orange-900/20",
        borderColor: theme === "light" ? "border-orange-200" : "border-orange-700/30",
        icon: Clock,
        animated: false
      },
      downloading: {
        label: "Importing...",
        color: theme === "light" ? "text-blue-600 bg-blue-50" : "text-blue-400 bg-blue-900/20",
        borderColor: theme === "light" ? "border-blue-200" : "border-blue-700/30",
        icon: Download,
        animated: true
      },
      processing: {
        label: "AI Dubbing...",
        color: theme === "light" ? "text-blue-600 bg-blue-50" : "text-blue-400 bg-blue-900/20",
        borderColor: theme === "light" ? "border-blue-200" : "border-blue-700/30",
        icon: Sparkles,
        animated: true
      },
      voice_cloning: {
        label: "Cloning Voice...",
        color: theme === "light" ? "text-purple-600 bg-purple-50" : "text-purple-400 bg-purple-900/20",
        borderColor: theme === "light" ? "border-purple-200" : "border-purple-700/30",
        icon: Mic,
        animated: true
      },
      lip_sync: {
        label: "Syncing Lips...",
        color: theme === "light" ? "text-cyan-600 bg-cyan-50" : "text-cyan-400 bg-cyan-900/20",
        borderColor: theme === "light" ? "border-cyan-200" : "border-cyan-700/30",
        icon: Smile,
        animated: true
      },
      uploading: {
        label: "Uploading...",
        color: theme === "light" ? "text-indigo-600 bg-indigo-50" : "text-indigo-400 bg-indigo-900/20",
        borderColor: theme === "light" ? "border-indigo-200" : "border-indigo-700/30",
        icon: Upload,
        animated: true
      },
      ready: {
        label: "Ready",
        color: theme === "light" ? "text-green-600 bg-green-50" : "text-green-400 bg-green-900/20",
        borderColor: theme === "light" ? "border-green-200" : "border-green-700/30",
        icon: CheckCircle,
        animated: false
      },
      completed: {
        label: "Completed",
        color: theme === "light" ? "text-green-600 bg-green-50" : "text-green-400 bg-green-900/20",
        borderColor: theme === "light" ? "border-green-200" : "border-green-700/30",
        icon: CheckCircle,
        animated: false
      },
      failed: {
        label: "Failed",
        color: theme === "light" ? "text-red-600 bg-red-50" : "text-red-400 bg-red-900/20",
        borderColor: theme === "light" ? "border-red-200" : "border-red-700/30",
        icon: XCircle,
        animated: false
      },
      waiting_approval: {
        label: "Needs Review",
        color: theme === "light" ? "text-amber-600 bg-amber-50" : "text-amber-400 bg-amber-900/20",
        borderColor: theme === "light" ? "border-amber-200" : "border-amber-700/30",
        icon: AlertCircle,
        animated: true // Pulsing to attract attention
      },
    };
    return statusMap[status] || {
      label: status,
      color: `${textSecondaryClass} ${cardClass}`,
      borderColor: borderClass,
      icon: Clock,
      animated: false
    };
  };

  // Get language flags
  const getLanguageFlags = (languages: string[]) => {
    const flagMap: Record<string, string> = {
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      pt: "🇵🇹",
      ja: "🇯🇵",
      ko: "🇰🇷",
      hi: "🇮🇳",
      ar: "🇸🇦",
      ru: "🇷🇺",
      it: "🇮🇹",
      zh: "🇨🇳",
      en: "🇺🇸",
    };
    return languages.map(lang => flagMap[lang.toLowerCase()] || "🌍");
  };

  // Get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <aside className={`w-80 lg:w-96 ${bgClass} border-l ${borderClass} pl-4 sm:pl-6 md:pl-8 pr-3 sm:pr-4 py-6 sm:py-8 h-full flex flex-col`}>
      <div className="space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Activity Queue */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-normal ${textClass}`}>Activity Queue</h3>
              {hasActiveJobs && (
                <Loader2 className={`h-3 w-3 animate-spin ${textSecondaryClass}`} />
              )}
            </div>
            <span className={`inline-flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1.5 sm:px-2 text-xs sm:text-sm font-normal ${textClass} ${cardClass} rounded-full`}>
              {dashboardLoading ? "…" : activeJobs.length}
            </span>
          </div>
          {dashboardLoading ? (
            <div className={`flex items-center justify-center py-12 ${textSecondaryClass} text-base`}>
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeJobs.length === 0 ? (
            <div className={`${cardClass} border ${borderClass} rounded-xl p-8 text-center`}>
              <Sparkles className={`h-10 w-10 ${textSecondaryClass} mx-auto mb-3`} />
              <p className={`text-base ${textSecondaryClass} font-medium`}>All caught up!</p>
              <p className={`text-sm ${textSecondaryClass} mt-1`}>No active jobs right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => {
                const statusDisplay = getJobStatusDisplay(job.status);
                const flags = getLanguageFlags(job.target_languages || []);

                // Find the video for thumbnail
                const video = videos.find(v => v.video_id === job.source_video_id);

                return (
                  <button
                    key={job.job_id}
                    onClick={() => {
                      if (job.status === "waiting_approval") {
                        setReviewJobId(job.job_id);
                      } else if (job.source_video_id) {
                        router.push(`/content/${job.source_video_id}`);
                      }
                    }}
                    className={`w-full ${cardClass} border ${borderClass} rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-md transition-all text-left group`}
                  >
                    <div className="flex gap-3 p-3.5">
                      {/* Thumbnail */}
                      <div className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden ${cardAltClass}`}>
                        {video?.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className={`h-6 w-6 ${textSecondaryClass}`} />
                          </div>
                        )}
                        {statusDisplay.animated && (
                          <div className="absolute inset-0 bg-indigo-500 opacity-10 animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Title */}
                        <h4 className={`font-medium ${textClass} text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors`}>
                          {video?.title || `Video ${job.source_video_id?.slice(0, 8)}`}
                        </h4>

                        {/* Status */}
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border-2 ${statusDisplay.color} ${statusDisplay.borderColor}`}>
                          <statusDisplay.icon className={`h-3 w-3 ${statusDisplay.animated ? "animate-pulse" : ""}`} />
                          {statusDisplay.label}
                        </div>

                        {/* Target Languages - Compact with 2 flags + count */}
                        <div className="flex items-center gap-1.5">
                          <span className={`${textSecondaryClass} text-xs`}>To:</span>
                          <div className="flex items-center -space-x-1">
                            {flags.slice(0, 2).map((flag, idx) => (
                              <div
                                key={idx}
                                className="relative flex items-center justify-center w-5 h-5 rounded-full border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-blue-500/10"
                                style={{ zIndex: 2 - idx }}
                              >
                                <span className="text-xs">{flag}</span>
                              </div>
                            ))}
                            {flags.length > 2 && (
                              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                                <span className={`text-[10px] font-semibold ${textClass}`}>
                                  +{flags.length - 2}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Time */}
                        {job.created_at && (
                          <div className={`text-xs ${textSecondaryClass}`}>
                            {getRelativeTime(job.created_at)}
                          </div>
                        )}
                      </div>

                      {/* Review Action Button for waiting_approval status */}
                      {job.status === "waiting_approval" && (
                        <div className="absolute right-3 bottom-3 sm:right-auto sm:bottom-auto sm:relative self-center">
                          <span className="hidden sm:inline-block px-3 py-1 bg-black text-white text-xs rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200">
                            Review
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {job.progress !== undefined && job.progress > 0 && (
                      <div className={`h-1.5 w-full ${cardAltClass}`}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-5`}>
          <h3 className={`text-base font-normal ${textClass} mb-4`}>Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${textClass}Secondary`}>Completed</span>
              <span className="text-lg font-normal text-green-500">
                {dashboardLoading ? "…" : dashboard?.completed_jobs ?? 0}
              </span>
            </div>
            <div className={`flex justify-between items-center pt-3 border-t ${borderClass}`}>
              <span className={`text-sm ${textClass}Secondary`}>Credits Used</span>
              <span className="text-lg font-normal text-indigo-400">
                {dashboardLoading ? "…" : "14m"}
              </span>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className={`bg-gradient-to-br ${theme === "light" ? "from-gray-100 to-gray-200" : "from-gray-900 to-black"} border ${borderClass} rounded-xl p-5`}>
          <h3 className={`text-base font-normal ${textClass} mb-4`}>Usage</h3>
          <div className="space-y-4">
            {/* Credits Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${textClass}Secondary`}>Credits</span>
                <span className={`text-sm font-normal ${textClass}`}>
                  {dashboardLoading ? "…" : "2,450 / 10,000"}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${cardClass}Alt overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: "24.5%" }}
                />
              </div>
              <p className={`text-xs ${textClass}Secondary mt-1`}>7,550 credits remaining</p>
            </div>

            {/* Additional Metrics */}
            <div className={`pt-3 border-t ${borderClass} space-y-2`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textClass}Secondary`}>Videos Processed</span>
                <span className={`text-sm font-normal ${textClass}`}>
                  {dashboardLoading ? "…" : "127"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textClass}Secondary`}>Minutes Dubbed</span>
                <span className={`text-sm font-normal ${textClass}`}>
                  {dashboardLoading ? "…" : "1,834"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textClass}Secondary`}>Languages Active</span>
                <span className={`text-sm font-normal ${textClass}`}>
                  {dashboardLoading ? "…" : "5"}
                </span>
              </div>
            </div>

            {/* Plan Info */}
            <div className={`pt-3 border-t ${borderClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textClass}Secondary`}>Pro Plan</span>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-normal transition-colors">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReviewJobModal
        isOpen={!!reviewJobId}
        onClose={() => setReviewJobId(null)}
        jobId={reviewJobId}
        onApproved={() => {
          // Refresh jobs list logic if needed, but polling should handle it eventually
          // If we want immediate feedback we might need to refetchActiveJobs
          // But useActiveJobs uses polling, so it will update.
          setReviewJobId(null);
        }}
      />

      {/* Temporary Debug Info */}
      <div className="p-4 text-xs font-mono bg-black/5 dark:bg-white/5 border-t border-red-500 overflow-x-auto">
        <p className="font-bold text-red-500">DEBUG INFO:</p>
        <p>Selected Project: {selectedProject?.id || 'None'}</p>
        <p>Total Jobs: {jobs?.length || 0}</p>
        <p>Active Jobs: {activeJobs?.length || 0}</p>
        <div className="mt-2 space-y-1">
          {jobs?.map(j => (
            <div key={j.job_id} className={j.status === 'waiting_approval' ? 'text-green-500 font-bold' : ''}>
              [{j.status}] {j.job_id.slice(0, 8)}...
            </div>
          ))}
        </div>
      </div>
    </aside >
  );
}
