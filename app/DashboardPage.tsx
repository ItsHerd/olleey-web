"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/useDashboard";
import { useDashboardStats } from "@/lib/useDashboardStats";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useDashboardProjects } from "@/lib/useDashboardProjects";
import { useDashboardChannels } from "@/lib/useDashboardChannels";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { useDemo } from "@/lib/DemoContext";
import { useAuth } from "@/lib/AuthContext";
import { DemoStateManager } from "@/lib/demoStateManager";
import { LANGUAGE_OPTIONS, getFakeLocalizedText } from "@/lib/languages";
import { youtubeAPI, jobsAPI, dashboardAPI, type MasterNode, type Video, type ActivityItem, type LocalizationInfo } from "@/lib/api";
import { VideoStatus, LocalizationStatus, JobStatus, VideoType } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { JobTerminalPanel } from "@/components/JobTerminalPanel";
import { useToast } from "@/components/ui/use-toast";
import { useReview } from "@/lib/ReviewContext";
import { SEO } from "@/components/SEO";

// Extracted Dashboard Components
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { QueueAndReview } from "@/components/Dashboard/QueueAndReview";
import { ReleasedMedia } from "@/components/Dashboard/ReleasedMedia";
import { ActivityFeed } from "@/components/Dashboard/ActivityFeed";
import { GridDashboard } from "@/components/Dashboard/GridDashboard";
import { DashboardSkeleton } from "@/components/Dashboard/DashboardSkeleton";
import { OlleeyLoader } from "@/components/ui/OlleeyLoader";

interface VideoWithLocalizations extends Video {
  estimated_credits?: number;
}

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

  // Global Review State
  const { openReview } = useReview();

  // Terminal Panel State
  const [terminalState, setTerminalState] = useState<{
    isOpen: boolean;
    jobId: string | null;
    videoTitle?: string;
    language?: string;
  }>({ isOpen: false, jobId: null });

  const { selectedProject, projects, isLoading: projectLoading } = useProject();
  const { user, loading: authLoading } = useAuth();

  // Get userId from auth context (not localStorage)
  const userId = user?.id;

  console.log('[DashboardPage] Auth state:', { userId, authLoading, hasUser: !!user });

  // Individual dashboard data queries - load independently
  const { dashboard, loading: dashboardLoading, refetch: refetchDashboard } = useDashboard({
    projectId: selectedProject?.id,
    enabled: !!userId && !authLoading
  });
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats({
    projectId: selectedProject?.id,
    enabled: !!userId && !authLoading
  });
  const { jobs: dashboardJobs, loading: jobsLoading, refetch: refetchJobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    limit: 20,
    user_id: userId,
    enabled: !!userId && !authLoading
  });
  const { projects: dashboardProjects, loading: projectsLoading, refetch: refetchProjects } = useDashboardProjects({
    enabled: !!userId && !authLoading
  });
  const { channels: dashboardChannels, loading: channelsLoading, refetch: refetchChannels } = useDashboardChannels({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId && !authLoading
  });

  console.log('[DashboardPage] Dashboard jobs:', {
    count: dashboardJobs?.length || 0,
    jobs: dashboardJobs,
    loading: jobsLoading
  });

  const { isDemoMode, getVideoState, startProcessing, refreshTrigger } = useDemo();
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
    if (!dashboard) return;

    const urlChannelId = searchParams.get("channel_id");
    let targetId = "";

    if (urlChannelId) {
      targetId = urlChannelId;
    } else {
      const master = selectedProject ? dashboard.youtube_connections?.find(c => c.connection_id === selectedProject.master_connection_id) : null;
      const primary = dashboard.youtube_connections?.find(c => c.is_primary);
      const fallback = dashboard.youtube_connections?.[0];
      targetId = master?.youtube_channel_id || primary?.youtube_channel_id || fallback?.youtube_channel_id || "";
    }

    if (targetId && targetId !== selectedChannelId) {
      setSelectedChannelId(targetId);
    }
  }, [dashboard, selectedProject?.id, searchParams, selectedChannelId]);

  // Initial fetch for coordinated data
  useEffect(() => {
    if (!dashboard) return;

    const loadCoordinatedData = async () => {
      try {
        setActivitiesLoading(true);
        const activityData = await dashboardAPI.getActivity(selectedProject?.id);
        setActivities(activityData);

        const graph = await youtubeAPI.getChannelGraph(selectedProject?.id);
        setChannelGraph(graph.master_nodes || []);
      } catch (error) {
        logger.error("DashboardPage", "Coordinated fetch failed", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadCoordinatedData();
  }, [dashboard, selectedProject?.id]);

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    useMemo(() => {
      // Build query params - only user_id and optionally project_id
      const params: any = { user_id: userId };

      // Only add project filter if a SPECIFIC project is selected
      // If selectedProject is null/undefined (All Projects mode), don't filter by project
      if (selectedProject?.id) {
        params.project_id = selectedProject.id;
      }

      // NO channel filtering on dashboard - removed entirely

      return params;
    }, [selectedProject?.id, userId]),
    { enabled: !!userId && !authLoading } // Only fetch when we have a userId and auth is loaded
  );

  // Force initial fetch on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchVideos();
      refetchDashboard();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Global refresh listener
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        await Promise.all([
          refetchDashboard(),
          refetchStats(),
          refetchJobs(),
          refetchProjects(),
          refetchChannels(),
          refetchVideos(),
        ]);
        toast("Dashboard Synchronized", "success");
      } catch (err) {
        logger.error("DashboardPage", "Refresh failed", err);
        toast("Sync partial failure", "error");
      }
    };

    window.addEventListener('olleey-refresh', handleRefresh);
    return () => window.removeEventListener('olleey-refresh', handleRefresh);
  }, [refetchDashboard, refetchStats, refetchJobs, refetchProjects, refetchChannels, refetchVideos]);

  // Helper to get overall video status
  const getOverallVideoStatus = useCallback((localizations: Record<string, LocalizationInfo>, videoId?: string): LocalizationStatus => {
    if (isDemoMode && videoId && typeof window !== 'undefined') {
      try {
        const demoState = getVideoState(videoId, 'es');
        if (demoState?.status === 'queued') return LocalizationStatus.QUEUED;
      } catch (error) {
        console.warn('[Demo] Failed to get video state:', error);
      }
    }

    const statuses = Object.values(localizations).map(l => l.status);
    const activeStatuses = statuses.filter(s => s !== LocalizationStatus.NOT_STARTED);

    if (activeStatuses.length === 0) return LocalizationStatus.NOT_STARTED;
    if (activeStatuses.some(s => s === LocalizationStatus.FAILED)) return LocalizationStatus.FAILED;
    if (activeStatuses.some(s => s === LocalizationStatus.PROCESSING)) return LocalizationStatus.PROCESSING;
    if (activeStatuses.some(s => s === LocalizationStatus.QUEUED)) return LocalizationStatus.QUEUED;
    if (activeStatuses.some(s => s === LocalizationStatus.DRAFT)) return LocalizationStatus.DRAFT;
    if (activeStatuses.every(s => s === LocalizationStatus.LIVE)) return LocalizationStatus.LIVE;
    return LocalizationStatus.NOT_STARTED;
  }, [isDemoMode, getVideoState]);

  // Merge videos with their processing status / localizations
  const videosWithLocalizations: VideoWithLocalizations[] = useMemo(() => {
    return videos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};

      // Handle actual localizations from the video object
      if (video.localizations) {
        Object.entries(video.localizations).forEach(([lang, loc]) => {
          localizations[lang] = {
            ...loc,
            status: loc.status as LocalizationStatus
          };
        });
      }

      // Overlay active jobs
      selectedLanguages.forEach(lang => {
        const activeJob = (dashboard?.recent_jobs || []).find(j =>
          j.source_video_id === video.video_id &&
          j.target_languages.includes(lang) &&
          j.status !== JobStatus.COMPLETED && j.status !== JobStatus.FAILED
        );

        if (activeJob) {
          const isDraftStatus = activeJob.status === JobStatus.WAITING_APPROVAL || activeJob.status === JobStatus.READY;
          localizations[lang] = {
            status: isDraftStatus ? LocalizationStatus.DRAFT : LocalizationStatus.PROCESSING,
            progress: activeJob.progress || (isDraftStatus ? 100 : 0),
            job_id: activeJob.job_id,
            video_url: (activeJob as any).video_url,
          };
        } else if (!localizations[lang]) {
          localizations[lang] = {
            status: LocalizationStatus.NOT_STARTED,
            progress: 0
          };
        }
      });

      const duration = video.duration || 600;
      return {
        ...video,
        localizations,
        estimated_credits: Math.ceil(duration / 60),
        global_views: video.global_views || video.view_count || 0,
      };
    });
  }, [videos, selectedLanguages, dashboard?.recent_jobs]);

  const filteredVideos = useMemo(() => {
    // NO filtering at all - Supabase does it all
    // Just sort by published date (most recent first)
    let result = [...videosWithLocalizations];
    result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return result;
  }, [videosWithLocalizations]);

  const onNavigate = useCallback((id: string) => {
    const video = filteredVideos.find(v => v.video_id === id);
    if (!video) return;

    const status = getOverallVideoStatus(video.localizations || {}, video.video_id);
    const langCode = Object.keys(video.localizations || {}).find(l => {
      const s = video.localizations![l].status;
      if (status === LocalizationStatus.DRAFT) return s === LocalizationStatus.DRAFT;
      if (status === LocalizationStatus.PROCESSING) return s === LocalizationStatus.PROCESSING;
      if (status === LocalizationStatus.LIVE) return s === LocalizationStatus.LIVE;
      return false;
    }) || Object.keys(video.localizations || {})[0];

    const loc = video.localizations?.[langCode || ""];

    if (isDemoMode) {
      const demoState = getVideoState(video.video_id, langCode || 'es');
      if (demoState?.status === 'queued') {
        startProcessing(video.video_id, loc?.job_id || video.video_id, langCode || 'es');
        return;
      }
    }

    openReview({
      videoId: loc?.job_id || id,
      languageCode: langCode || "",
      status: status === LocalizationStatus.PROCESSING ? 'processing' : undefined,
      originalVideoUrl: (video as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      dubbedVideoUrl: loc?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      videoTitle: video.title,
      videoDescription: video.description || "",
      isApproved: status === LocalizationStatus.LIVE,
      approvedAt: video.published_at
    });
  }, [filteredVideos, getOverallVideoStatus, isDemoMode, getVideoState, startProcessing, openReview]);

  const isInitialLoading = useMemo(() => {
    if (projectLoading && projects.length === 0) return true;
    if (dashboardLoading && !dashboard) return true;
    return false;
  }, [projectLoading, projects.length, dashboardLoading, dashboard]);

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col pr-3 pt-8`}>
      <SEO
        title="Dashboard | Olleey"
        description="Manage your global content production center."
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="w-full">
          {isInitialLoading ? (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
              <OlleeyLoader size={120} className="mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olleey-yellow animate-pulse">Initializing Synthesis Hub...</p>
              <div className="w-full max-w-6xl mt-12 opacity-30 blur-[2px] pointer-events-none">
                <DashboardSkeleton borderClass={borderClass} cardClass={cardClass} />
              </div>
            </div>
          ) : (
            <GridDashboard
              userName={dashboard?.name || "Creator"}
              userEmail={dashboard?.email || "creator@olleey.com"}
              projects={dashboardProjects || []}
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
              onNavigate={onNavigate}
              onCreateProject={() => router.push("/app?page=Manual Upload")}
              totalVideos={videos.length}
              totalTranslations={stats?.completed_jobs || 0}
              channels={dashboardChannels}
              jobs={dashboardJobs}
            />
          )}
        </div>
      </div>

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
