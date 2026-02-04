"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { youtubeAPI, jobsAPI, dashboardAPI, type MasterNode, type Video, type ActivityItem, type LocalizationInfo } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { QuickCheckModal } from "@/components/SmartTable/QuickCheckModal";
import { JobTerminalPanel } from "@/components/JobTerminalPanel";
import { useToast } from "@/components/ui/use-toast";
import { SEO } from "@/components/SEO";

// Extracted Dashboard Components
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { QueueAndReview } from "@/components/Dashboard/QueueAndReview";
import { ReleasedMedia } from "@/components/Dashboard/ReleasedMedia";
import { ActivityFeed } from "@/components/Dashboard/ActivityFeed";
import { GridDashboard } from "@/components/Dashboard/GridDashboard";
import { DashboardSkeleton } from "@/components/Dashboard/DashboardSkeleton";

interface VideoWithLocalizations extends Video {
  estimated_credits?: number;
}

type LocalizationStatus = "live" | "draft" | "processing" | "not-started";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [selectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja", "it"]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [videoTypeFilter] = useState<"all" | "original" | "processed">("all");
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Quick Check Modal State
  const [quickCheckState, setQuickCheckState] = useState<{
    isOpen: boolean;
    videoId: string | null;
    languageCode: string | null;
    originalVideoUrl?: string;
    dubbedVideoUrl?: string;
    videoTitle?: string;
    videoDescription?: string;
  }>({ isOpen: false, videoId: null, languageCode: null });

  // Terminal Panel State
  const [terminalState, setTerminalState] = useState<{
    isOpen: boolean;
    jobId: string | null;
    videoTitle?: string;
    language?: string;
  }>({ isOpen: false, jobId: null });

  const { selectedProject } = useProject();
  const { dashboard, loading: dashboardLoading, refetch: refetchDashboard } = useDashboard();
  const { toast } = useToast();

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
  const isDark = theme === "dark";

  // 1. Coordinated Channel Synchronization
  useEffect(() => {
    if (!dashboard || !selectedProject) return;

    const urlChannelId = searchParams.get("channel_id");

    // Prioritize URL, then Master Connection, then first available connection
    if (urlChannelId) {
      if (urlChannelId !== selectedChannelId) {
        setSelectedChannelId(urlChannelId);
      }
    } else {
      const master = dashboard.youtube_connections?.find(c => c.connection_id === selectedProject.master_connection_id);
      const primary = dashboard.youtube_connections?.find(c => c.is_primary);
      const fallback = dashboard.youtube_connections?.[0];

      const targetId = master?.youtube_channel_id || primary?.youtube_channel_id || fallback?.youtube_channel_id || "";

      if (targetId && targetId !== selectedChannelId) {
        setSelectedChannelId(targetId);
      }
    }
  }, [dashboard, selectedProject?.id, searchParams]);

  const canFetchContent = !!dashboard && !!selectedProject && !!selectedChannelId;

  // 2. Coordinated Background Fetches (Graph & Activity)
  useEffect(() => {
    if (!canFetchContent) return;

    const loadCoordinatedData = async () => {
      try {
        // Load Activity
        setActivitiesLoading(true);
        const activityData = await dashboardAPI.getActivity(selectedProject.id);
        setActivities(activityData);

        // Load Graph
        const graph = await youtubeAPI.getChannelGraph();
        setChannelGraph(graph.master_nodes || []);
      } catch (error) {
        logger.error("DashboardPage", "Coordinated fetch failed", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadCoordinatedData();
  }, [canFetchContent, selectedProject?.id]);

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedChannelId
      ? { channel_id: selectedChannelId, project_id: selectedProject?.id }
      : { project_id: selectedProject?.id },
    { enabled: canFetchContent }
  );

  useEffect(() => {
    const handleRefresh = async () => {
      console.log("[Dashboard] Coordinated refresh initiated");
      try {
        // Refetch everything in parallel
        await Promise.all([
          refetchDashboard(),
          refetchVideos(),
          (async () => {
            const graph = await youtubeAPI.getChannelGraph();
            setChannelGraph(graph.master_nodes || []);
          })(),
          (async () => {
            const activityData = await dashboardAPI.getActivity(selectedProject?.id);
            setActivities(activityData);
          })()
        ]);
        toast("Dashboard Synchronized", "success");
      } catch (err) {
        logger.error("DashboardPage", "Refresh failed", err);
        toast("Sync partial failure", "error");
      }
    };

    window.addEventListener('olleey-refresh', handleRefresh);
    return () => window.removeEventListener('olleey-refresh', handleRefresh);
  }, [refetchDashboard, refetchVideos, selectedProject?.id]);


  const handleApproveQuickCheck = async () => {
    const { videoId, languageCode } = quickCheckState;
    console.log("[Dashboard] Approving job:", videoId, "language:", languageCode);
    if (videoId) {
      try {
        const result = await jobsAPI.approveJob(videoId);
        console.log("[Dashboard] Approval result:", result);
        toast("Approved! Publishing to channel...", "success");
        // Refresh data after short delay to allow backend to process
        setTimeout(() => {
          refetchDashboard();
          refetchVideos();
        }, 1500);
      } catch (err: any) {
        console.error("[Dashboard] Approval failed:", err);
        logger.error("DashboardPage", "Failed to approve job", err);
        toast(err.message || "Failed to approve", "error");
      }
      setQuickCheckState({ ...quickCheckState, isOpen: false });
    } else {
      console.error("[Dashboard] No videoId for approval");
      toast("Unable to approve - missing job ID", "error");
    }
  };

  const handleFlagQuickCheck = (reason: string) => {
    logger.info("DashboardPage", `Flagged video ${quickCheckState.videoId} (${quickCheckState.languageCode}): ${reason}`);
    setQuickCheckState({ ...quickCheckState, isOpen: false });
  };

  // Memoized Video Processing
  const videosWithLocalizations: VideoWithLocalizations[] = useMemo(() => {
    // Collect all videos first to avoid multiple passes
    const allVideos = videos;

    if (videoTypeFilter === "processed") {
      const processedVideos = allVideos.filter(v => v.video_type === "translated");
      return processedVideos.map(video => ({
        ...video,
        localizations: { [video.language_code || 'processed']: { status: 'live', progress: 100 } },
        estimated_credits: 0,
        global_views: video.view_count,
      }));
    }

    let baseVideos = allVideos;
    if (videoTypeFilter === "original") {
      baseVideos = allVideos.filter(v => v.video_type !== "translated");
    } else if (videoTypeFilter === "all") {
      // In 'all' mode, we favor showing master videos with their localizations,
      // but if a video is 'translated' and lacks a source_video_id in our current set,
      // it should be treated as its own entry.
      const masterVideos = allVideos.filter(v => v.video_type !== "translated");
      const orphanTranslations = allVideos.filter(v =>
        v.video_type === "translated" &&
        !masterVideos.some(mv => mv.video_id === v.source_video_id)
      );
      baseVideos = [...masterVideos, ...orphanTranslations];
    }

    return baseVideos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};

      // First, check if backend provided localizations array (for demo users)
      if (Array.isArray(video.localizations) && video.localizations.length > 0) {
        // Convert backend array to object format
        video.localizations.forEach((loc: any) => {
          if (loc.language_code) {
            localizations[loc.language_code] = {
              status: loc.status as LocalizationStatus,
              progress: loc.status === 'live' ? 100 : loc.status === 'draft' ? 100 : 50,
              job_id: loc.job_id,  // Use actual job_id for approval flow
              video_url: loc.video_url,
            };
          }
        });

        // Add "not-started" for selected languages not in backend data
        selectedLanguages.forEach(lang => {
          if (!localizations[lang]) {
            localizations[lang] = {
              status: "not-started",
              progress: 0,
            };
          }
        });
      } else if (video.video_type === "translated") {
        // If it's a translated video (likely an orphan or from a satellite channel query),
        // it is inherently 'live' in its own right.
        const lang = video.language_code || "processed";
        localizations[lang] = {
          status: "live",
          progress: 100,
          job_id: video.video_id,
          video_url: (video as any).video_url,
        };
      } else {
        // Original logic for non-demo master videos
        const translatedLanguages = video.translated_languages || [];

        selectedLanguages.forEach(lang => {
          const activeJob = (dashboard?.recent_jobs || []).find(j =>
            j.source_video_id === video.video_id &&
            j.target_languages.includes(lang) &&
            j.status !== "completed" && j.status !== "failed"
          );

          if (activeJob) {
            localizations[lang] = {
              status: activeJob.status === "waiting_approval" ? "draft" : "processing",
              progress: activeJob.progress || 0,
              job_id: activeJob.job_id,
              video_url: (activeJob as any).video_url,
            };
          } else if (translatedLanguages.includes(lang)) {
            const translatedVideo = videos.find(v =>
              v.video_type === "translated" &&
              v.source_video_id === video.video_id &&
              v.title.toLowerCase().includes(LANGUAGE_OPTIONS.find(l => l.code === lang)?.name.toLowerCase() || lang)
            );

            localizations[lang] = {
              status: "live",
              progress: 100,
              job_id: translatedVideo?.video_id,
              video_url: (translatedVideo as any).video_url,
            };
          } else {
            localizations[lang] = {
              status: "not-started",
              progress: 0,
            };
          }
        });
      }

      const duration = video.duration || 600;
      const estimated_credits = Math.ceil(duration / 60);
      const global_views = video.global_views || 0;

      return {
        ...video,
        localizations,
        estimated_credits,
        global_views,
      };
    });
  }, [videos, selectedLanguages, videoTypeFilter, dashboard?.recent_jobs]);

  const getOverallVideoStatus = (localizations: Record<string, LocalizationInfo>): LocalizationStatus => {
    const statuses = Object.values(localizations).map(l => l.status);

    // Filter out "not-started" to only check actual localizations
    const activeStatuses = statuses.filter(s => s !== "not-started");

    if (activeStatuses.length === 0) return "not-started";
    if (activeStatuses.some(s => s === "processing")) return "processing";
    if (activeStatuses.some(s => s === "draft")) return "draft";
    if (activeStatuses.every(s => s === "live")) return "live";
    return "not-started";
  };

  const filteredVideos = useMemo(() => {
    let filtered = videosWithLocalizations;
    if (selectedChannelId) {
      filtered = filtered.filter((video) => video.channel_id === selectedChannelId);
    }
    filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return filtered;
  }, [videosWithLocalizations, selectedChannelId]);

  const isInitialLoading = dashboardLoading || (canFetchContent && (videosLoading || (activitiesLoading && activities.length === 0)));

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col pr-3`}>
      <SEO
        title="Dashboard | Olleey"
        description="Manage your global content production, monitor translation jobs, and distribute to international channels from your creative command center."
      />

      <DashboardHeader
        textClass={textClass}
        textSecondaryClass={textSecondaryClass}
        isDark={isDark}
        videosLoading={videosLoading}
        showManualProcessView={false}
        refetchVideos={refetchVideos}
        setShowManualProcessView={() => router.push("/app?page=Manual Upload")}
        totalVideos={filteredVideos.length}
        totalTranslations={filteredVideos.reduce((acc, video) => {
          const localizations = video.localizations || {};
          return acc + Object.values(localizations).filter(l => l.status === "live").length;
        }, 0)}
        userName={dashboard?.name}
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="w-full">
          {isInitialLoading ? (
            <DashboardSkeleton borderClass={borderClass} cardClass={cardClass} />
          ) : (
            <>
              <GridDashboard
                userName={dashboard?.name || "Creator"}
                userEmail={dashboard?.email || "creator@olleey.com"}
                projects={[]}
                selectedProject={selectedProject}
                videos={filteredVideos}
                videosLoading={videosLoading}
                activities={activities}
                activitiesLoading={activitiesLoading}
                getOverallVideoStatus={getOverallVideoStatus}
                isDark={isDark}
                textClass={textClass}
                textSecondaryClass={textSecondaryClass}
                cardClass={cardClass}
                borderClass={borderClass}
                onNavigate={(id) => {
                  const video = filteredVideos.find(v => v.video_id === id);
                  if (!video) return;

                  const status = getOverallVideoStatus(video.localizations || {});
                  if (status === "draft") {
                    const langCode = Object.keys(video.localizations || {}).find(
                      l => video.localizations![l].status === "draft"
                    );
                    const loc = video.localizations?.[langCode || ""];
                    const jobId = loc?.job_id;

                    setQuickCheckState({
                      isOpen: true,
                      videoId: jobId || id,
                      languageCode: langCode || null,
                      originalVideoUrl: (video as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                      dubbedVideoUrl: loc?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                      videoTitle: video.title,
                      videoDescription: (video as any).description || `Reviewing production of "${video.title}"`
                    });
                  } else {
                    router.push("/app?page=Workflows");
                  }
                }}
                onCreateProject={() => router.push("/app?page=Manual Upload")}
                totalVideos={filteredVideos.length}
                totalTranslations={filteredVideos.reduce((acc, video) => {
                  const localizations = video.localizations || {};
                  return acc + Object.values(localizations).filter(l => l.status === "live").length;
                }, 0)}
              />
            </>
          )}
        </div>
      </div>

      <QuickCheckModal
        isOpen={quickCheckState.isOpen}
        onClose={() => setQuickCheckState({ ...quickCheckState, isOpen: false })}
        languageName={LANGUAGE_OPTIONS.find(l => l.code === quickCheckState.languageCode)?.name || ""}
        originalVideoUrl={quickCheckState.originalVideoUrl}
        dubbedVideoUrl={quickCheckState.dubbedVideoUrl}
        videoTitle={quickCheckState.videoTitle}
        videoDescription={quickCheckState.videoDescription}
        onApprove={handleApproveQuickCheck}
        onFlag={handleFlagQuickCheck}
      />

      <JobTerminalPanel
        isOpen={terminalState.isOpen}
        onClose={() => setTerminalState(prev => ({ ...prev, isOpen: false }))}
        jobId={terminalState.jobId || ""}
        videoTitle={terminalState.videoTitle}
        language={terminalState.language}
      />
    </div>
  );
}
