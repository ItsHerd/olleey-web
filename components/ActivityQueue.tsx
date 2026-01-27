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
import { StatusChip } from "@/components/ui/StatusChip";

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

  const [reviewJobId, setReviewJobId] = useState<string | null>(null);

  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";



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
                const flags = getLanguageFlags(job.target_languages || []);

                // Find the video for thumbnail
                const video = videos.find(v => v.video_id === job.source_video_id);

                return (
                  <div
                    key={job.job_id}
                    className={`w-full ${cardClass} border ${borderClass} rounded-xl overflow-hidden hover:shadow-md transition-all group`}
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex gap-4 items-start">
                        {/* Thumbnail */}
                        <div className={`relative w-24 h-14 flex-shrink-0 rounded-lg overflow-hidden ${cardAltClass} border ${borderClass}`}>
                          {video?.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className={`h-5 w-5 ${textSecondaryClass}`} />
                            </div>
                          )}
                        </div>

                        {/* Title and Time */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${textClass} text-sm line-clamp-2 leading-snug cursor-pointer hover:text-olleey-yellow transition-colors`}
                            onClick={() => {
                              if (job.source_video_id) {
                                router.push(`/content/${job.source_video_id}`);
                              }
                            }}
                          >
                            {video?.title || `Video ${job.source_video_id?.slice(0, 8)}`}
                          </h4>
                          {job.created_at && (
                            <div className={`text-[10px] ${textSecondaryClass} mt-1 flex items-center gap-1`}>
                              <Clock className="h-2.5 w-2.5" />
                              {getRelativeTime(job.created_at)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Metadata Row */}
                      <div className="flex flex-col gap-2 pt-1 border-t border-white/5 mt-1">
                        <div className="flex items-center justify-between">
                          <StatusChip status={job.status} size="xs" />
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className={`${textSecondaryClass} text-[10px] shrink-0`}>To:</span>
                            <div className="flex items-center -space-x-1.5 shrink-0">
                              {flags.slice(0, 3).map((flag, idx) => (
                                <div
                                  key={idx}
                                  className={`relative flex items-center justify-center w-5 h-5 rounded-full border ${borderClass} ${cardAltClass} shadow-sm`}
                                  style={{ zIndex: 10 - idx }}
                                >
                                  <span className="text-[10px]">{flag}</span>
                                </div>
                              ))}
                              {flags.length > 3 && (
                                <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border ${borderClass} ${cardAltClass} shadow-sm`}>
                                  <span className={`text-[9px] font-bold ${textClass}`}>
                                    +{flags.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {job.status === "waiting_approval" && (
                          <button
                            onClick={() => setReviewJobId(job.job_id)}
                            className="w-full py-1.5 bg-olleey-yellow text-black text-[11px] rounded-lg font-bold hover:bg-yellow-500 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Sparkles className="h-3 w-3" />
                            Review & Approve
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {job.progress !== undefined && job.progress > 0 && (
                      <div className={`h-1 w-full ${cardAltClass}`}>
                        <div
                          className="h-full bg-olleey-yellow transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={`text-base font-normal ${textClass}`}>Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${textClass}Secondary`}>Completed</span>
              <span className={`text-base font-medium ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                {dashboardLoading ? "…" : dashboard?.completed_jobs ?? 0}
              </span>
            </div>
            <div className={`flex justify-between items-center pt-3 border-t ${borderClass}`}>
              <span className={`text-xs ${textClass}Secondary`}>Credits Used</span>
              <span className="text-base font-medium text-olleey-yellow">
                {dashboardLoading ? "…" : "14m"}
              </span>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-5 shadow-sm`}>
          <h3 className={`text-base font-normal ${textClass} mb-4`}>Usage</h3>
          <div className="space-y-5">
            {/* Credits Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs ${textClass}Secondary`}>Credits</span>
                <span className={`text-xs font-medium ${textClass}`}>
                  {dashboardLoading ? "…" : "2,450 / 10,000"}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${cardClass}Alt overflow-hidden border ${borderClass}`}>
                <div
                  className="h-full bg-olleey-yellow transition-all shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                  style={{ width: "24.5%" }}
                />
              </div>
              <p className={`text-[10px] ${textClass}Secondary mt-1.5`}>7,550 credits remaining</p>
            </div>

            {/* Additional Metrics */}
            <div className={`pt-4 border-t ${borderClass} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${textClass}Secondary`}>Videos Processed</span>
                <span className={`text-xs font-medium ${textClass}`}>
                  {dashboardLoading ? "…" : "127"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${textClass}Secondary`}>Minutes Dubbed</span>
                <span className={`text-xs font-medium ${textClass}`}>
                  {dashboardLoading ? "…" : "1,834"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${textClass}Secondary`}>Languages Active</span>
                <span className={`text-xs font-medium ${textClass}`}>
                  {dashboardLoading ? "…" : "5"}
                </span>
              </div>
            </div>

            {/* Plan Info */}
            <div className={`pt-4 border-t ${borderClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-olleey-yellow animate-pulse" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textClass}Secondary`}>Pro Plan</span>
                </div>
                <button className="text-[10px] text-olleey-yellow hover:text-yellow-500 font-bold uppercase tracking-wider transition-colors">
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


    </aside >
  );
}
