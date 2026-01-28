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
import { QuickStats } from "@/components/Dashboard/QuickStats";
import { GridDashboard } from "@/components/Dashboard/GridDashboard";

interface VideoWithLocalizations extends Video {
  estimated_credits?: number;
}

type LocalizationStatus = "live" | "draft" | "processing" | "not-started";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [selectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja"]);
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

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedChannelId
      ? { channel_id: selectedChannelId, project_id: selectedProject?.id }
      : { project_id: selectedProject?.id }
  );

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";

  // Data Fetching Hooks
  useEffect(() => {
    const loadChannelGraph = async () => {
      try {
        const graph = await youtubeAPI.getChannelGraph();
        setChannelGraph(graph.master_nodes || []);
      } catch (error) {
        logger.error("DashboardPage", "Failed to load channel graph", error);
      }
    };
    loadChannelGraph();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const data = await dashboardAPI.getActivity(selectedProject?.id);
        setActivities(data);
      } catch (err) {
        logger.error("DashboardPage", "Failed to fetch activities", err);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (dashboard) {
      fetchActivities();
    }
  }, [dashboard, selectedProject?.id]);

  useEffect(() => {
    if (selectedProject && dashboard?.youtube_connections) {
      const master = dashboard.youtube_connections.find(c => c.connection_id === selectedProject.master_connection_id);
      if (master) {
        setSelectedChannelId(master.youtube_channel_id);
      } else if (dashboard.youtube_connections.length > 0) {
        setSelectedChannelId(dashboard.youtube_connections[0].youtube_channel_id);
      }
    }
  }, [selectedProject?.id, dashboard?.youtube_connections]);

  useEffect(() => {
    if (dashboard?.youtube_connections && dashboard.youtube_connections.length > 0) {
      const urlChannelId = searchParams.get("channel_id");
      if (urlChannelId && urlChannelId !== selectedChannelId) {
        setSelectedChannelId(urlChannelId);
      } else if (!selectedChannelId) {
        const primaryChannel = dashboard.youtube_connections.find(c => c.is_primary);
        const defaultChannel = primaryChannel || dashboard.youtube_connections[0];
        setSelectedChannelId(defaultChannel.youtube_channel_id);
      }
    }
  }, [dashboard?.youtube_connections?.length, searchParams]);

  useEffect(() => {
    const handleRefresh = () => {
      refetchDashboard();
      refetchVideos();
      // Also reload channel graph
      const loadChannelGraph = async () => {
        try {
          const graph = await youtubeAPI.getChannelGraph();
          setChannelGraph(graph.master_nodes || []);
        } catch (error) {
          logger.error("DashboardPage", "Failed to load channel graph", error);
        }
      };
      loadChannelGraph();
    };

    window.addEventListener('olleey-refresh', handleRefresh);
    return () => window.removeEventListener('olleey-refresh', handleRefresh);
  }, [refetchDashboard, refetchVideos]);


  const handleApproveQuickCheck = async () => {
    const { videoId, languageCode } = quickCheckState;
    if (videoId && languageCode) {
      try {
        await jobsAPI.approveJob(videoId);
        toast("Approved! Publishing to channel...", "success");
        refetchDashboard();
      } catch (err) {
        logger.error("DashboardPage", "Failed to approve job", err);
      }
      setQuickCheckState({ ...quickCheckState, isOpen: false });
    }
  };

  const handleFlagQuickCheck = (reason: string) => {
    logger.info("DashboardPage", `Flagged video ${quickCheckState.videoId} (${quickCheckState.languageCode}): ${reason}`);
    setQuickCheckState({ ...quickCheckState, isOpen: false });
  };

  // Memoized Video Processing
  const videosWithLocalizations: VideoWithLocalizations[] = useMemo(() => {
    if (videoTypeFilter === "processed") {
      const processedVideos = videos.filter(v => v.video_type === "translated");
      return processedVideos.map(video => ({
        ...video,
        localizations: { 'processed': { status: 'live', progress: 100 } },
        estimated_credits: 0,
        global_views: video.view_count,
      }));
    }

    let baseVideos = videos;
    if (videoTypeFilter === "original") {
      baseVideos = videos.filter(v => v.video_type !== "translated");
    } else if (videoTypeFilter === "all") {
      baseVideos = videos.filter(v => v.video_type !== "translated");
    }

    return baseVideos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};
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
          };
        } else {
          localizations[lang] = {
            status: "not-started",
            progress: 0,
          };
        }
      });

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
    if (statuses.some(s => s === "processing")) return "processing";
    if (statuses.some(s => s === "draft")) return "draft";
    if (statuses.every(s => s === "live")) return "live";
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

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col pl-3 pr-6 pb-4`}>
      <SEO
        title="Dashboard | Olleey"
        description="Manage your global content production, monitor translation jobs, and distribute to international channels from your creative command center."
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full flex-1 flex flex-col px-0">
          <DashboardHeader
            textClass={textClass}
            textSecondaryClass={textSecondaryClass}
            isDark={isDark}
            userName={dashboard?.name}
            videosLoading={videosLoading}
            showManualProcessView={false}
            refetchVideos={refetchVideos}
            setShowManualProcessView={() => {
              router.push("/app?page=Manual Upload");
            }}
            totalVideos={filteredVideos.length}
            totalTranslations={filteredVideos.reduce((acc, video) => {
              const localizations = video.localizations || {};
              return acc + Object.values(localizations).filter(l => l.status === "live").length;
            }, 0)}
          />
          <GridDashboard
            userName={dashboard?.name || "Creator"}
            userEmail={dashboard?.email || "creator@olleey.com"}
            projects={[]} // Replace with actual projects if available
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
            onNavigate={(id) => router.push(`/content/${id}`)}
            onCreateProject={() => router.push("/app?page=Manual Upload")}
            totalVideos={filteredVideos.length}
            totalTranslations={filteredVideos.reduce((acc, video) => {
              const localizations = video.localizations || {};
              return acc + Object.values(localizations).filter(l => l.status === "live").length;
            }, 0)}
          />
        </div>
      </div>

      <QuickCheckModal
        isOpen={quickCheckState.isOpen}
        onClose={() => setQuickCheckState({ ...quickCheckState, isOpen: false })}
        languageName={LANGUAGE_OPTIONS.find(l => l.code === quickCheckState.languageCode)?.name || ""}
        originalVideoUrl={quickCheckState.videoId ? (
          videos.find(v => v.video_id === quickCheckState.videoId)?.thumbnail_url ||
          videos.find(v => {
            const job = (dashboard?.recent_jobs || []).find(j => j.job_id === quickCheckState.videoId);
            return job?.source_video_id === v.video_id;
          })?.thumbnail_url
        ) : undefined}
        dubbedVideoUrl={quickCheckState.videoId ? (
          videos.find(v => v.video_id === quickCheckState.videoId)?.thumbnail_url ||
          videos.find(v => {
            const job = (dashboard?.recent_jobs || []).find(j => j.job_id === quickCheckState.videoId);
            return job?.source_video_id === v.video_id;
          })?.thumbnail_url
        ) : undefined}
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
