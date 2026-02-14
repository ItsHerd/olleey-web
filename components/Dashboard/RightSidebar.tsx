"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Clock, PanelRightClose, Loader2, Rss } from "lucide-react";
import { SelectedItem, ViewType } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { useReview } from "@/lib/ReviewContext";
import { API_BASE_URL, jobsAPI, settingsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/SettingsContext";

interface RightSidebarProps {
  selectedItem: SelectedItem;
  currentView: ViewType;
  onClose: () => void;
  theme: string;
  onViewChange?: (view: any) => void;
  onSelectItem?: (item: SelectedItem) => void;
}

export function RightSidebar({
  selectedItem,
  currentView,
  onClose,
  theme,
  onViewChange,
  onSelectItem
}: RightSidebarProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { openReview } = useReview();
  const { toast } = useToast();
  const { detectedUploadWindow } = useSettings();
  const userId = user?.id;
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#09090b]" : "bg-[#ECE9DA]";
  const borderClass = isDark ? "border-[#2A2A2A]" : "border-gray-300/50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";
  const glassBgClass = isDark ? "bg-white/[0.03]" : "bg-white/60";

  const { jobs, loading, error: jobsError, refetch: refetchJobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId && !!user
  });

  const { videos, error: videosError, refetch: refetchVideos } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId && !!user });
  const {
    videos: allUserVideos,
    loading: allUserVideosLoading,
    refetch: refetchAllUserVideos
  } = useVideos({
    user_id: userId,
  }, { enabled: !!userId && !!user });
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingAutoApprove, setSavingAutoApprove] = useState(false);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      if (!userId || !user) return;
      setSettingsLoading(true);
      try {
        const settings = await settingsAPI.getSettings();
        if (mounted) {
          setAutoApproveEnabled(Boolean(settings.auto_approve_jobs));
        }
      } catch {
        // Sidebar still functions even if settings fail to load.
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };

    loadSettings();
    return () => {
      mounted = false;
    };
  }, [userId, user]);

  // If there's an auth error, show a message
  if (jobsError?.includes("access token") || videosError?.includes("access token")) {
    return (
      <div className={`h-full ${bgClass} border ${isDark ? "border-white/10" : "border-gray-200"} flex flex-col items-center justify-center p-6`}>
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

  // Convert window string to milliseconds
  const getWindowMs = () => {
    switch (detectedUploadWindow) {
      case "last_1_day":
        return 1 * 24 * 60 * 60 * 1000;
      case "last_31_days":
        return 31 * 24 * 60 * 60 * 1000;
      case "last_7_days":
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const windowMs = getWindowMs();

  const detectedVideos = allUserVideos
    .filter((video) => {
      if (!video?.published_at) return false;
      const publishedAt = new Date(video.published_at).getTime();
      if (Number.isNaN(publishedAt)) return false;

      const ageMs = Date.now() - publishedAt;
      const inWindow = ageMs >= 0 && ageMs <= windowMs;
      const isSourceVideo = !video.source_video_id || video.source_video_id === video.video_id;

      return inWindow && isSourceVideo;
    })
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());

  const getPreStartJobForVideo = (videoId: string) =>
    jobs.find((j) => j.source_video_id === videoId && j.status === "waiting_approval" && (j.progress || 0) === 0);

  const needsReviewJobs = jobs.filter(j => j.status === 'waiting_approval' && (j.progress || 0) > 0);
  const processingJobs = jobs.filter(j =>
    ['pending', 'downloading', 'processing', 'uploading'].includes(j.status)
  );

  const enableAutoApprove = async () => {
    if (savingAutoApprove) return;
    setSavingAutoApprove(true);
    try {
      await settingsAPI.updateSettings({ auto_approve_jobs: true });
      setAutoApproveEnabled(true);
      toast("Auto-approve enabled for new detected uploads", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to enable auto-approve", "error");
    } finally {
      setSavingAutoApprove(false);
    }
  };

  const beginDetectedJob = async (jobId: string) => {
    if (startingJobId) return;
    setStartingJobId(jobId);
    try {
      await jobsAPI.approveAndStart(jobId);
      await Promise.all([refetchJobs(), refetchVideos(), refetchAllUserVideos()]);
      toast("Processing started", "success");
      onViewChange?.("processing");
    } catch (error: any) {
      toast(error?.message || "Failed to start processing", "error");
    } finally {
      setStartingJobId(null);
    }
  };

  return (
    <div className={`h-full ${bgClass} flex flex-col p-6 space-y-6 overflow-hidden relative border ${isDark ? "border-white/10" : "border-gray-200"}`}>
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={onClose}
          className={`p-2 rounded-lg border-2 ${borderClass} ${isDark ? "hover:bg-white/5 hover:border-white/20" : "hover:bg-gray-100 hover:border-gray-400"} transition-all duration-200 active:scale-95`}
          title="Close sidebar"
        >
          <PanelRightClose className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
        </button>
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedTextClass} mb-1`}>Pipeline</span>
          <h3 className={`font-serif text-2xl ${textClass} tracking-tight`}>Live Status</h3>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar -mx-2 px-2 relative z-10">
        {/* Newly detected uploads awaiting start */}
        <div className="flex flex-col">
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-400 flex items-center gap-2 ${textClass} tracking-tight`}>
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                Detected Uploads ({detectedUploadWindow === "last_1_day" ? "Last 1 Day" : detectedUploadWindow === "last_31_days" ? "Last 31 Days" : "Last 7 Days"})
              </h4>
              <Button
                variant="outline"
                onClick={() => onViewChange?.("detected_uploads")}
                className={`h-7 px-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? "bg-transparent border-white/20 text-white/80 hover:bg-white/10" : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                See All
              </Button>
            </div>
            {!loading && (
              <span className={`block mt-1 text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>
                {detectedVideos.length} videos
              </span>
            )}
          </div>

          <div className={`mb-3 p-3 rounded-xl border ${borderClass} ${glassBgClass}`}>
            <p className={`text-[11px] ${mutedTextClass} mb-2`}>
              New videos were detected from your connected channel.
            </p>
            <Button
              onClick={enableAutoApprove}
              disabled={autoApproveEnabled || savingAutoApprove || settingsLoading}
              className={`w-full h-8 text-[10px] font-bold uppercase tracking-wider border ${autoApproveEnabled ? "bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-600" : isDark ? "bg-transparent border-gray-500 text-gray-300 hover:bg-white/5 hover:border-gray-400" : "bg-white border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500"}`}
            >
              {settingsLoading ? "Checking settings..." : autoApproveEnabled ? "Auto-Approve Enabled" : savingAutoApprove ? "Enabling..." : "Enable Auto-Approve"}
            </Button>
          </div>

          <div className="space-y-2">
            {loading || allUserVideosLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-20 rounded-xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                ))}
              </div>
            ) : detectedVideos.length > 0 ? (
              detectedVideos.map((video) => {
                const preStartJob = getPreStartJobForVideo(video.video_id);
                const thisJobStarting = preStartJob?.job_id ? startingJobId === preStartJob.job_id : false;
                return (
                  <div key={video.video_id} className={`p-3 rounded-xl border ${borderClass} ${glassBgClass}`}>
                    <div className="flex gap-3 mb-2">
                      <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-semibold truncate ${textClass}`}>
                          {video?.title || video.video_id}
                        </p>
                        <p className={`text-[10px] ${mutedTextClass} truncate`}>
                          {video?.channel_name || video?.channel_id || "Connected channel"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => preStartJob?.job_id && beginDetectedJob(preStartJob.job_id)}
                      disabled={!preStartJob?.job_id || Boolean(startingJobId)}
                      className={`w-full h-8 text-[10px] font-bold uppercase tracking-wider ${preStartJob?.job_id ? "bg-blue-600 hover:bg-blue-500 text-white" : isDark ? "bg-transparent border border-gray-500 text-gray-400 hover:bg-transparent" : "bg-white border border-gray-400 text-gray-600 hover:bg-transparent"}`}
                    >
                      {thisJobStarting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
                      {thisJobStarting ? "Starting..." : preStartJob?.job_id ? "Begin Processing" : "No Pending Job"}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className={`p-6 rounded-2xl border border-dashed ${borderClass} flex flex-col items-center justify-center text-center opacity-50`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>No new detections</p>
              </div>
            )}
          </div>

        </div>

        {/* Table for videos that need review */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className={`text-sm font-400 flex items-center gap-2 ${textClass} tracking-tight`}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              Need Review
            </h4>
            {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>{needsReviewJobs.length} videos</span>}
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-16 rounded-xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                ))}
              </div>
            ) : needsReviewJobs.length > 0 ? (
              needsReviewJobs.map((job) => {
                const video = getJobVideo(job.source_video_id);
                return (
                  <motion.div
                    key={job.job_id}
                    whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                    onClick={() => {
                      console.log('[RightSidebar] Card clicked:', job.job_id, 'status:', job.status);
                      const firstTargetLang = job.target_languages?.[0] || "es";

                      // Set selected item
                      onSelectItem?.({ type: "job", id: job.job_id, data: job });

                      // Navigate based on job status
                      if (job.status === 'waiting_approval' || job.status === 'completed') {
                        console.log('[RightSidebar] Navigating to review');
                        // Open review with proper data
                        openReview({
                          videoId: job.source_video_id,
                          languageCode: firstTargetLang,
                          jobId: job.job_id,
                          originalVideoUrl: (video as any)?.storage_url || (video as any)?.video_url || "",
                          dubbedVideoUrl: "", // Will be fetched in ReviewView
                          videoTitle: video?.title || job.source_video_id,
                          videoDescription: video?.description || "",
                          thumbnailUrl: video?.thumbnail_url || "",
                          localizedTitle: "",
                          localizedDescription: "",
                          isApproved: false,
                          approvedAt: video?.published_at || undefined,
                          navigate: false // Stay within dashboard
                        });
                        onViewChange?.("review");
                      } else if (['pending', 'downloading', 'processing', 'transcribing', 'translating', 'dubbing', 'voice_cloning', 'lip_sync', 'uploading'].includes(job.status)) {
                        console.log('[RightSidebar] Navigating to processing view');
                        onViewChange?.("processing");
                      } else {
                        console.log('[RightSidebar] Navigating to dashboard');
                        onViewChange?.("dashboard");
                      }
                    }}
                    className={`p-3 rounded-xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group ${isDark ? 'shadow-sm' : 'shadow-none'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90 group-hover:opacity-100`}>
                          {video?.title || job.source_video_id}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>
                            {job.target_languages?.join(' • ')}
                          </span>
                          {video?.duration && (
                            <>
                              <span className={`text-[10px] ${isDark ? "text-gray-700" : "text-gray-400"}`}>•</span>
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
              <div className={`p-8 rounded-3xl border border-dashed ${isDark ? "border-[#2A2A2A]" : "border-gray-400"} flex flex-col items-center justify-center text-center ${isDark ? "opacity-40" : "opacity-70"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>All caught up!</p>
                <div className={`mt-4 w-10 h-10 rounded-full border ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-300 bg-white/60"} flex items-center justify-center`}>
                  <Clock className={`w-4 h-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
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
            {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>{processingJobs.length} active</span>}
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-20 rounded-2xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                ))}
              </div>
            ) : processingJobs.length > 0 ? (
              processingJobs.map((job) => {
                const video = getJobVideo(job.source_video_id);
                return (
                  <motion.div
                    key={job.job_id}
                    whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                    onClick={() => {
                      console.log('[RightSidebar] Processing card clicked:', job.job_id, 'status:', job.status);
                      onSelectItem?.({ type: "job", id: job.job_id, data: job });

                      // Navigate based on job status
                      if (job.status === 'waiting_approval' || job.status === 'completed') {
                        console.log('[RightSidebar] Navigating to review');
                        const video = getJobVideo(job.source_video_id);
                        const firstTargetLang = job.target_languages?.[0] || "es";
                        openReview({
                          videoId: job.source_video_id,
                          languageCode: firstTargetLang,
                          jobId: job.job_id,
                          originalVideoUrl: (video as any)?.storage_url || (video as any)?.video_url || "",
                          dubbedVideoUrl: "",
                          videoTitle: video?.title || job.source_video_id,
                          videoDescription: video?.description || "",
                          thumbnailUrl: video?.thumbnail_url || "",
                          localizedTitle: "",
                          localizedDescription: "",
                          isApproved: false,
                          approvedAt: video?.published_at || undefined,
                          navigate: false
                        });
                        onViewChange?.("review");
                      } else if (['pending', 'downloading', 'processing', 'transcribing', 'translating', 'dubbing', 'voice_cloning', 'lip_sync', 'uploading'].includes(job.status)) {
                        console.log('[RightSidebar] Navigating to processing view');
                        onViewChange?.("processing");
                      } else {
                        console.log('[RightSidebar] Navigating to dashboard');
                        onViewChange?.("dashboard");
                      }
                    }}
                    className={`p-3 rounded-xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group ${isDark ? 'shadow-sm' : 'shadow-none'}`}
                  >
                    <div className="flex gap-3 mb-3">
                      <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clock className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90`}>
                          {video?.title || job.source_video_id}
                        </span>
                        <span className={`text-[10px] ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"} mt-0.5`}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-tighter text-blue-400`}>
                          {job.status}
                        </span>
                        <span className={`text-[10px] font-mono ${isDark ? "text-white opacity-40" : "text-gray-600"}`}>
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
              <div className={`p-8 rounded-3xl border border-dashed ${isDark ? "border-[#2A2A2A]" : "border-gray-400"} flex flex-col items-center justify-center text-center ${isDark ? "opacity-40" : "opacity-70"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>Quiet for now</p>
                <div className={`mt-4 w-10 h-10 rounded-full border ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-300 bg-white/60"} flex items-center justify-center`}>
                  <Play className={`w-4 h-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
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
          className={`w-full flex items-center justify-center gap-2 h-10 border-dashed ${isDark ? "border-[#2A2A2A] hover:border-white/40 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white" : "border-gray-400/50 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900"} transition-all text-xs font-medium uppercase tracking-wider`}
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
