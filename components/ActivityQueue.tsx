"use client";

import { useRouter } from "next/navigation";
import { Play, Loader2, Sparkles } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useActiveJobs } from "@/lib/useActiveJobs";
import { useTheme } from "@/lib/useTheme";

export default function ActivityQueue() {
  const router = useRouter();
  const { theme } = useTheme();
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { videos } = useVideos();
  const { activeJobs, isLoading: jobsLoading, hasActiveJobs } = useActiveJobs({
    interval: 5000, // Poll every 5 seconds
    enabled: true,  // Only poll when there are active jobs
  });
  
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

  // Humanize job status
  const getJobStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string; animated: boolean }> = {
      pending: { label: "Queued", color: "text-orange-600 bg-orange-50", icon: "🟠", animated: false },
      downloading: { label: "Importing from YouTube...", color: "text-blue-600 bg-blue-50", icon: "🔵", animated: true },
      processing: { label: "AI Dubbing...", color: "text-blue-600 bg-blue-50", icon: "🔵", animated: true },
      voice_cloning: { label: "Cloning Voice...", color: "text-purple-600 bg-purple-50", icon: "🟣", animated: true },
      lip_sync: { label: "Syncing Lips...", color: "text-blue-600 bg-blue-50", icon: "🔵", animated: true },
      uploading: { label: "Pushing to Drafts...", color: "text-indigo-600 bg-indigo-50", icon: "🔵", animated: true },
      ready: { label: "Ready for Review", color: "text-green-600 bg-green-50", icon: "🟢", animated: false },
      completed: { label: "Completed", color: "text-green-600 bg-green-50", icon: "✅", animated: false },
      failed: { label: "Failed", color: "text-red-600 bg-red-50", icon: "🔴", animated: false },
    };
    return statusMap[status] || { label: status, color: `${textSecondaryClass} ${cardClass}`, icon: "⚪️", animated: false };
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
              {dashboardLoading || jobsLoading ? "…" : activeJobs.length}
            </span>
          </div>
          {dashboardLoading || jobsLoading ? (
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
                      if (job.source_video_id) {
                        router.push(`/content/${job.source_video_id}`);
                      }
                    }}
                    className={`w-full ${cardClass} border ${borderClass} rounded-xl overflow-hidden hover:${borderClass} hover:shadow-lg transition-all text-left group`}
                  >
                    <div className="flex gap-3 p-3">
                      {/* Thumbnail */}
                      <div className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden ${cardClass}`}>
                        {video?.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className={`h-6 w-6 ${textClass}Secondary`} />
                          </div>
                        )}
                        {statusDisplay.animated && (
                          <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className={`font-normal ${textClass} text-sm mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors`}>
                          {video?.title || `Video ${job.source_video_id?.slice(0, 8)}`}
                        </h4>

                        {/* Status */}
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${statusDisplay.color}`}>
                          <span className={statusDisplay.animated ? "animate-pulse" : ""}>
                            {statusDisplay.icon}
                          </span>
                          {statusDisplay.label}
                        </div>

                        {/* Target Languages */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`${textClass}Secondary text-xs`}>Targets:</span>
                          <div className="flex gap-1">
                            {flags.map((flag, idx) => (
                              <span key={idx} className="text-lg">
                                {flag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Time */}
                        {job.created_at && (
                          <div className={`text-xs ${textClass}Secondary mt-1`}>
                            Started {getRelativeTime(job.created_at)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {job.progress !== undefined && job.progress > 0 && (
                      <div className={`h-1 w-full ${cardClass}`}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
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
    </aside>
  );
}
