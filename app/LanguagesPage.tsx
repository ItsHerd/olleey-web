"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Clock, Download, Sparkles, Mic, Smile, Upload, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";

export default function QueuedJobsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { videos } = useVideos();
  const { selectedProject } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

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
    const statusMap: Record<string, { label: string; color: string; borderColor: string; icon: any; animated: boolean }> = {
      pending: {
        label: "Queued",
        color: "text-orange-400 bg-orange-900/20",
        borderColor: "border-orange-700/30",
        icon: Clock,
        animated: false
      },
      downloading: {
        label: "Importing...",
        color: "text-blue-400 bg-blue-900/20",
        borderColor: "border-blue-700/30",
        icon: Download,
        animated: true
      },
      processing: {
        label: "AI Dubbing...",
        color: "text-blue-400 bg-blue-900/20",
        borderColor: "border-blue-700/30",
        icon: Sparkles,
        animated: true
      },
      voice_cloning: {
        label: "Cloning Voice...",
        color: "text-purple-400 bg-purple-900/20",
        borderColor: "border-purple-700/30",
        icon: Mic,
        animated: true
      },
      lip_sync: {
        label: "Syncing Lips...",
        color: "text-cyan-400 bg-cyan-900/20",
        borderColor: "border-cyan-700/30",
        icon: Smile,
        animated: true
      },
      uploading: {
        label: "Uploading...",
        color: "text-indigo-400 bg-indigo-900/20",
        borderColor: "border-indigo-700/30",
        icon: Upload,
        animated: true
      },
      ready: {
        label: "Ready",
        color: "text-green-400 bg-green-900/20",
        borderColor: "border-green-700/30",
        icon: CheckCircle,
        animated: false
      },
      completed: {
        label: "Completed",
        color: "text-green-400 bg-green-900/20",
        borderColor: "border-green-700/30",
        icon: CheckCircle,
        animated: false
      },
      failed: {
        label: "Failed",
        color: "text-red-400 bg-red-900/20",
        borderColor: "border-red-700/30",
        icon: XCircle,
        animated: false
      },
    };
    return statusMap[status] || {
      label: status,
      color: `${textSecondaryClass} bg-gray-900/20`,
      borderColor: "border-gray-700/30",
      icon: AlertCircle,
      animated: false
    };
  };

  // Filter jobs based on search and status
  const filteredJobs = allJobs.filter(job => {
    // Project filter
    if (selectedProject && job.project_id && job.project_id !== selectedProject.id) {
      return false;
    }

    // Status filter
    if (statusFilter === "active") {
      const activeStatuses = ["pending", "downloading", "processing", "voice_cloning", "lip_sync", "uploading"];
      if (!activeStatuses.includes(job.status)) return false;
    } else if (statusFilter === "completed") {
      const completedStatuses = ["completed", "ready", "failed"];
      if (!completedStatuses.includes(job.status)) return false;
    }

    // Search filter
    if (searchQuery) {
      const video = videos.find(v => v.video_id === job.source_video_id);
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = video?.title?.toLowerCase().includes(searchLower);
      const jobIdMatch = job.job_id.toLowerCase().includes(searchLower);
      return titleMatch || jobIdMatch;
    }

    return true;
  });

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

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondaryClass}`} />
            <input
              type="text"
              placeholder="Search jobs by video title or job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${borderClass} ${cardClass} ${textClass} placeholder:${textSecondaryClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "all"
                ? theme === "light"
                  ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-200"
                  : "bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/30"
                : `${cardClass} ${textSecondaryClass} border ${borderClass} hover:${textClass}`
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "active"
                ? theme === "light"
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-blue-500/20 text-blue-400 border-2 border-blue-500/30"
                : `${cardClass} ${textSecondaryClass} border ${borderClass} hover:${textClass}`
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "completed"
                ? theme === "light"
                  ? "bg-green-50 text-green-600 border-2 border-green-200"
                  : "bg-green-500/20 text-green-400 border-2 border-green-500/30"
                : `${cardClass} ${textSecondaryClass} border ${borderClass} hover:${textClass}`
                }`}
            >
              Completed
            </button>
          </div>
        </div>

        {dashboardLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className={`h-8 w-8 animate-spin ${textClass}Secondary`} />
          </div>
        ) : allJobs.length === 0 ? (
          <div className={`${cardClass} rounded-2xl border ${borderClass} p-16 text-center`}>
            <Clock className={`h-16 w-16 ${textSecondaryClass} mx-auto mb-4`} />
            <h3 className={`text-xl font-normal ${textClass} mb-2`}>No Jobs Yet</h3>
            <p className={`${textSecondaryClass}`}>
              Your video translation jobs will appear here
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={`${cardClass} rounded-2xl border ${borderClass} p-16 text-center`}>
            <Search className={`h-16 w-16 ${textSecondaryClass} mx-auto mb-4`} />
            <h3 className={`text-xl font-normal ${textClass} mb-2`}>No Matching Jobs</h3>
            <p className={`${textSecondaryClass}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className={`${cardClass} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className={`${bgClass}`}>
                  <tr className="border-b border-border/50">
                    <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>
                      Video
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>
                      Languages
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>
                      Progress
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, index) => {
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
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${index !== filteredJobs.length - 1 ? 'border-b border-border/30' : ''}`}
                      >
                        {/* Video Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`relative w-24 h-14 flex-shrink-0 rounded-md overflow-hidden ${cardAltClass}`}>
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
                                <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${textClass} text-sm mb-0.5 line-clamp-1`}>
                                {video?.title || `Video ${job.source_video_id?.slice(0, 8)}`}
                              </p>
                              <p className={`text-xs ${textSecondaryClass}`}>
                                Job {job.job_id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusDisplay.color} ${statusDisplay.borderColor} border-2`}>
                            <statusDisplay.icon className={`h-3.5 w-3.5 ${statusDisplay.animated ? "animate-pulse" : ""}`} />
                            {statusDisplay.label}
                          </div>
                        </td>

                        {/* Target Languages Column - Show 2 avatars + count */}
                        <td className="px-4 py-3">
                          <div className="flex items-center -space-x-2">
                            {flags.slice(0, 2).map((flag, idx) => (
                              <div
                                key={idx}
                                className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-sm"
                                style={{ zIndex: 2 - idx }}
                              >
                                <span className="text-sm">{flag}</span>
                              </div>
                            ))}
                            {flags.length > 2 && (
                              <div
                                className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm"
                                title={`${flags.length - 2} more languages`}
                              >
                                <span className="text-[10px] font-bold text-amber-400">+{flags.length - 2}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Progress Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 w-32 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${job.progress || 0}%` }}
                              />
                            </div>
                            <span className={`text-xs ${textSecondaryClass} font-medium w-10 text-right`}>
                              {job.progress || 0}%
                            </span>
                          </div>
                        </td>

                        {/* Started Column */}
                        <td className="px-4 py-3">
                          <div className={`text-xs ${textSecondaryClass}`}>
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
