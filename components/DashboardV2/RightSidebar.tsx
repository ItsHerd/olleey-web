"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Clock, AlertCircle, Home, Bell, Settings, Shield, HelpCircle } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { SelectedItem, ViewType } from "./DashboardV2Layout";
import { Button } from "@/components/ui/button";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { API_BASE_URL } from "@/lib/api";

interface RightSidebarProps {
  selectedItem: SelectedItem;
  currentView: ViewType;
  onClose: () => void;
  theme: string;
  onViewChange?: (view: any) => void;
}

export function RightSidebar({
  selectedItem,
  currentView,
  onClose,
  theme,
  onViewChange
}: RightSidebarProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = user?.id;
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]/80" : "bg-white/80";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
  const glassBgClass = isDark ? "bg-white/[0.03] backdrop-blur-md" : "bg-gray-50/50 backdrop-blur-md";

  const { jobs, loading, error: jobsError } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId && !!user
  });

  const { videos, error: videosError } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId && !!user });

  // If there's an auth error, show a message
  if (jobsError?.includes("access token") || videosError?.includes("access token")) {
    return (
      <div className={`h-full ${bgClass} backdrop-blur-xl flex flex-col items-center justify-center p-6`}>
        <div className="text-center">
          <p className={`text-sm ${mutedTextClass} mb-4`}>Please log in to view status</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const getJobVideo = (videoId: string) => {
    return videos.find(v => v.video_id === videoId);
  };

  const needsReviewJobs = jobs.filter(j => j.status === 'waiting_approval');
  const processingJobs = jobs.filter(j =>
    ['pending', 'downloading', 'processing', 'uploading'].includes(j.status)
  );

  const tabs = [
    { title: "Home", icon: Home },
    { title: "Messages", icon: Bell },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Guardrails", icon: Shield },
    { title: "Support", icon: HelpCircle },
  ];

  const getSelectedIndex = () => {
    switch (currentView) {
      case "dashboard": return 0;
      case "notifications": return 1;
      case "settings": return 3;
      case "guardrails": return 4;
      case "support": return 5;
      default: return null;
    }
  };

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    const views: ViewType[] = ["dashboard", "notifications", "dashboard", "settings", "guardrails", "support"];
    onViewChange?.(views[index]);
  };

  return (
    <div className={`h-full ${bgClass} backdrop-blur-xl flex flex-col p-6 space-y-6 overflow-hidden relative`}>
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      {/* Navigation Tabs */}
      <div className="relative z-10">
        <ExpandableTabs
          tabs={tabs}
          selected={getSelectedIndex()}
          activeColor={isDark ? "text-white" : "text-gray-900"}
          className={isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50/50"}
          onChange={handleTabChange}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedTextClass} mb-1`}>Pipeline</span>
          <h3 className={`font-serif text-2xl ${textClass} tracking-tight`}>Live Status</h3>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-xl border-2 ${borderClass} hover:bg-white/5 hover:border-white/20 transition-all duration-200 active:scale-95`}
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar -mx-2 px-2 relative z-10">
        {/* Table for videos that need review */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${textClass} tracking-tight`}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              Need Review
            </h4>
            {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${mutedTextClass} opacity-60`}>{needsReviewJobs.length} videos</span>}
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-16 rounded-2xl border ${borderClass} animate-pulse bg-white/5`} />
                ))}
              </div>
            ) : needsReviewJobs.length > 0 ? (
              needsReviewJobs.map((job) => {
                const video = getJobVideo(job.source_video_id);
                return (
                  <motion.div
                    key={job.job_id}
                    whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                    className={`p-3 rounded-2xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group shadow-sm`}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90 group-hover:opacity-100`}>
                          {video?.title || job.source_video_id}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] ${mutedTextClass} opacity-60`}>
                            {job.target_languages?.join(' • ')}
                          </span>
                          {video?.duration && (
                            <>
                              <span className="text-[10px] text-gray-700">•</span>
                              <span className={`text-[9px] font-mono ${mutedTextClass} opacity-60`}>
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className={`p-8 rounded-3xl border border-dashed ${borderClass} flex flex-col items-center justify-center text-center opacity-40`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>All caught up!</p>
                <div className="mt-4 w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table for jobs processing */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${textClass} tracking-tight`}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              Processing
            </h4>
            {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${mutedTextClass} opacity-60`}>{processingJobs.length} active</span>}
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-20 rounded-2xl border ${borderClass} animate-pulse bg-white/5`} />
                ))}
              </div>
            ) : processingJobs.length > 0 ? (
              processingJobs.map((job) => {
                const video = getJobVideo(job.source_video_id);
                return (
                  <motion.div
                    key={job.job_id}
                    whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                    className={`p-3 rounded-2xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group shadow-sm`}
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90`}>
                          {video?.title || job.source_video_id}
                        </span>
                        <span className={`text-[10px] ${mutedTextClass} mt-0.5 opacity-60`}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-tighter text-blue-400`}>
                          {job.status}
                        </span>
                        <span className={`text-[10px] font-mono ${textClass} opacity-40`}>
                          {job.progress}%
                        </span>
                      </div>
                      <div className={`w-full h-1 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-full overflow-hidden`}>
                        <motion.div
                          className="h-full bg-blue-500/50"
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className={`p-8 rounded-3xl border border-dashed ${borderClass} flex flex-col items-center justify-center text-center opacity-40`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>Quiet for now</p>
                <div className="mt-4 w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                  <Play className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Workflow Button */}
      <div className={`pt-4 border-t ${isDark ? "border-white/5" : "border-gray-100"} z-10`}>
        <Button
          variant="outline"
          onClick={() => onViewChange?.("manual_workflow")}
          className={`w-full flex items-center justify-center gap-2 h-10 border-dashed ${isDark ? "border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white" : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900"} transition-all text-xs font-medium uppercase tracking-wider`}
        >
          <div className={`w-4 h-4 rounded-full border ${isDark ? "border-white/30" : "border-gray-400"} flex items-center justify-center`}>
            <span className="text-[9px] leading-none">+</span>
          </div>
          Manual Workflow
        </Button>
      </div>
    </div>
  );
}

