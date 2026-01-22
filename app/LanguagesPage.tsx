"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Clock } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useTheme } from "@/lib/useTheme";

export default function QueuedJobsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { videos } = useVideos();
  
  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

  // Get all jobs (not just active ones)
  const allJobs = dashboard?.recent_jobs || [];

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
    return statusMap[status] || { label: status, color: "${textClass}Secondary ${cardClass}", icon: "⚪️", animated: false };
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
    <div className={`flex-1 ${bgClass}`}>
      <div className="w-full h-full py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6">
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-normal ${textClass} mb-2`}>Queued Jobs</h2>
          <p className={`text-sm sm:text-base ${textClass}Secondary`}>
            Monitor all video translation jobs and their progress
          </p>
        </div>

        {dashboardLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className={`h-8 w-8 animate-spin ${textClass}Secondary`} />
          </div>
        ) : allJobs.length === 0 ? (
          <div className={`${cardClass} rounded-2xl border ${borderClass} p-16 text-center`}>
            <Clock className={`h-16 w-16 ${textClass}Secondary mx-auto mb-4`} />
            <h3 className={`text-xl font-normal ${textClass} mb-2`}>No Jobs Yet</h3>
            <p className={`${textClass}Secondary`}>
              Your video translation jobs will appear here
            </p>
          </div>
        ) : (
          <div className={`${cardClass} rounded-xl border ${borderClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className={`${bgClass} border-b ${borderClass}`}>
                  <tr>
                    <th className={`text-left px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal ${textClass}Secondary uppercase`}>
                      Video
                    </th>
                    <th className={`text-left px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal ${textClass}Secondary uppercase`}>
                      Status
                    </th>
                    <th className={`text-left px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal ${textClass}Secondary uppercase`}>
                      Target Languages
                    </th>
                    <th className={`text-left px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal ${textClass}Secondary uppercase`}>
                      Progress
                    </th>
                    <th className={`text-left px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal ${textClass}Secondary uppercase`}>
                      Started
                    </th>
                  </tr>
                </thead>
              <tbody>
                {allJobs.map((job) => {
                  const statusDisplay = getJobStatusDisplay(job.status);
                  const flags = getLanguageFlags(job.target_languages || []);
                  const video = videos.find(v => v.video_id === job.source_video_id);

                  return (
                    <tr 
                      key={job.job_id}
                      onClick={() => {
                        if (job.source_video_id) {
                          router.push(`/content/${job.source_video_id}`);
                        }
                      }}
                      className={`border-b ${borderClass} hover:${cardClass}Alt cursor-pointer transition-colors`}
                    >
                      {/* Video Column */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden ${cardClass}Alt`}>
                            {video?.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className={`h-5 w-5 ${textClass}Secondary`} />
                              </div>
                            )}
                            {statusDisplay.animated && (
                              <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-normal ${textClass} truncate`}>
                              {video?.title || `Video ${job.source_video_id?.slice(0, 8)}`}
                            </p>
                            <p className={`text-sm ${textClass}Secondary`}>
                              Job {job.job_id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-normal px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${statusDisplay.color}`}>
                          <span className={statusDisplay.animated ? "animate-pulse" : ""}>
                            {statusDisplay.icon}
                          </span>
                          {statusDisplay.label}
                        </div>
                      </td>

                      {/* Target Languages Column */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex gap-0.5 sm:gap-1">
                          {flags.map((flag, idx) => (
                            <span key={idx} className="text-lg sm:text-xl md:text-2xl">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Progress Column */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`flex-1 h-2 w-20 sm:w-24 md:w-32 rounded-full ${cardClass}Alt overflow-hidden`}>
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${job.progress || 0}%` }}
                            />
                          </div>
                          <span className={`text-xs sm:text-sm ${textClass}Secondary font-normal w-10 sm:w-12 text-right`}>
                            {job.progress || 0}%
                          </span>
                        </div>
                      </td>

                      {/* Started Column */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className={`text-xs sm:text-sm ${textClass}Secondary`}>
                          {job.created_at ? getRelativeTime(job.created_at) : "—"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
