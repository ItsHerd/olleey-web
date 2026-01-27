"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageBadge } from "@/components/ui/LanguageBadge";
import { StatusChip } from "@/components/ui/StatusChip";
import { Play, Globe2, Eye, Clock, ChevronDown, Plus, Loader2, ArrowLeft, ArrowRight, Grid3x3, List, X, Radio, Youtube, CheckCircle, XCircle, AlertCircle, Pause, Sparkles, RefreshCw, Filter, SlidersHorizontal, Check, MessageSquare, Star, Zap, History, FileCheck, Search, Menu, TrendingUp, ChevronRight } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { youtubeAPI, jobsAPI, dashboardAPI, type MasterNode, type Video, type Job, type ActivityItem, type LocalizationInfo } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { QuickCheckModal } from "@/components/SmartTable/QuickCheckModal";
import { JobTerminalPanel } from "@/components/JobTerminalPanel";
import { useToast } from "@/components/ui/use-toast";
import { SEO } from "@/components/SEO";

type ViewMode = "carousel" | "table";

interface VideoWithLocalizations extends Video {
  estimated_credits?: number;
}

type LocalizationStatus = "live" | "draft" | "processing" | "not-started";


const DASHBOARD_ACTIVITIES = [
  { id: 1, type: 'detection', message: 'Your video "The Future of AI" was detected', time: '5m ago', icon: <Youtube className="w-3.5 h-3.5" />, color: 'bg-red-500' },
  { id: 2, type: 'completion', message: 'Spanish version completed', time: '12m ago', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-green-500' },
  { id: 3, type: 'review', message: '3 languages require review', time: '45m ago', icon: <FileCheck className="w-3.5 h-3.5" />, color: 'bg-olleey-yellow' },
  { id: 4, type: 'published', message: 'Portuguese published to @CreatorBR', time: '1h ago', icon: <Globe2 className="w-3.5 h-3.5" />, color: 'bg-indigo-500' },
  { id: 5, type: 'update', message: 'Lip-sync model updated – rerender recommended', time: '2h ago', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-purple-500' },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja"]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [videoTypeFilter, setVideoTypeFilter] = useState<"all" | "original" | "processed">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [videoTypeDropdownOpen, setVideoTypeDropdownOpen] = useState(false);
  const [additionalFiltersOpen, setAdditionalFiltersOpen] = useState(false);
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [latestJob, setLatestJob] = useState<Job | null>(null);
  const [latestJobLoading, setLatestJobLoading] = useState(false);
  const [showManualProcessView, setShowManualProcessView] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Quick Check Modal State
  const [quickCheckState, setQuickCheckState] = useState<{
    isOpen: boolean;
    videoId: string | null;
    languageCode: string | null;
  }>({ isOpen: false, videoId: null, languageCode: null });

  // Processing state for optimistic updates
  const [processingId, setProcessingId] = useState<string | undefined>(undefined);

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
  // Pass channel_id to useVideos for server-side filtering and per-channel caching
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedChannelId
      ? { channel_id: selectedChannelId, project_id: selectedProject?.id }
      : { project_id: selectedProject?.id }
  );

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";

  // Load channel graph for avatars
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

  // Load latest processed job
  useEffect(() => {
    const loadLatestJob = async () => {
      try {
        setLatestJobLoading(true);
        if (!selectedProject) return;
        const response = await jobsAPI.listJobsWithLimit(1, selectedProject.id);
        if (response.jobs && response.jobs.length > 0) {
          // Only set if the job has a completed status (ready, completed, or has live localizations)
          const job = response.jobs[0];
          if (job.status === "ready" || job.status === "completed") {
            setLatestJob(job);
          }
        }
      } catch (error) {
        logger.error("DashboardPage", "Failed to load latest job", error);
      } finally {
        setLatestJobLoading(false);
      }
    };

    if (selectedProject) {
      loadLatestJob();
    }
  }, [selectedProject?.id]);

  // Fetch Activity Feed
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

  // Update channel selection when project changes
  useEffect(() => {
    if (selectedProject && dashboard?.youtube_connections) {
      const master = dashboard.youtube_connections.find(c => c.connection_id === selectedProject.master_connection_id);
      if (master) {
        setSelectedChannelId(master.youtube_channel_id);
      } else if (dashboard.youtube_connections.length > 0) {
        // Fallback to first available if master not found (e.g. legacy project)
        setSelectedChannelId(dashboard.youtube_connections[0].youtube_channel_id);
      }
    }
  }, [selectedProject?.id, dashboard?.youtube_connections]);

  // Set default channel to primary channel on load or from URL
  useEffect(() => {
    if (dashboard?.youtube_connections && dashboard.youtube_connections.length > 0) {
      // Check for URL param first
      const urlChannelId = searchParams.get("channel_id");

      if (urlChannelId) {
        if (urlChannelId !== selectedChannelId) {
          setSelectedChannelId(urlChannelId);
        }
      } else if (!selectedChannelId) {
        // Fallback to primary or first
        const primaryChannel = dashboard.youtube_connections.find(c => c.is_primary);
        const defaultChannel = primaryChannel || dashboard.youtube_connections[0];
        setSelectedChannelId(defaultChannel.youtube_channel_id);
      }
    }
  }, [dashboard?.youtube_connections?.length, searchParams]); // Removed selectedChannelId to prevent multiple calls

  // Handle channel selection update to URL
  const handleChannelSelect = (channelId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("channel_id", channelId);
    // Build the full URL path with /app prefix
    const newUrl = `/app?${params.toString()}`;
    router.push(newUrl);
    setChannelDropdownOpen(false);
  };

  // Smart Table Handlers
  const handlePreview = (langCode: string, videoId?: string) => {
    if (!videoId) return;
    setQuickCheckState({ isOpen: true, videoId, languageCode: langCode });
  };

  const handlePublish = async (langCode: string, videoId?: string) => {
    if (!videoId) return;
    setProcessingId(videoId);

    // Simulate API call
    setTimeout(() => {
      // Here we would call the API to publish
      logger.info("DashboardPage", `Published ${langCode} version of video ${videoId}`);
      setProcessingId(undefined);
      alert(`Successfully published ${LANGUAGE_OPTIONS.find(l => l.code === langCode)?.name} version! (Simulation)`);
    }, 1500);
  };

  const handleUpdateTitle = (langCode: string, videoId: string, newTitle: string) => {
    logger.info("DashboardPage", `Updated title for ${videoId} (${langCode}): ${newTitle}`);
    // Here we would call API to update metadata
  };

  const handleApproveQuickCheck = async () => {
    const { videoId, languageCode } = quickCheckState;
    if (videoId && languageCode) {
      try {
        // In simulation mode, videoId is the jobId
        await jobsAPI.approveJob(videoId);
        toast("Approved! Publishing to channel...", "success");
        refetchDashboard();
      } catch (err) {
        // Fallback or handle error (might not be a job ID)
        handlePublish(languageCode, videoId);
      }
      setQuickCheckState({ ...quickCheckState, isOpen: false });
    }
  };

  const handleFlagQuickCheck = (reason: string) => {
    logger.info("DashboardPage", `Flagged video ${quickCheckState.videoId} (${quickCheckState.languageCode}): ${reason}`);
    setQuickCheckState({ ...quickCheckState, isOpen: false });
    alert("Issue reported to AI engine. We'll regenerate this segment. (Simulation)");
  };

  const handleShowTerminal = (jobId: string, videoTitle: string, language: string) => {
    setTerminalState({
      isOpen: true,
      jobId,
      videoTitle,
      language
    });
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (additionalFiltersOpen && !target.closest('.additional-filters-dropdown')) {
        setAdditionalFiltersOpen(false);
      }
      if (videoTypeDropdownOpen && !target.closest('.video-type-dropdown')) {
        setVideoTypeDropdownOpen(false);
      }
      if (channelDropdownOpen && !target.closest('.channel-dropdown')) {
        setChannelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [channelDropdownOpen, videoTypeDropdownOpen, additionalFiltersOpen]);

  // Process videos with real localization data from backend
  const videosWithLocalizations: VideoWithLocalizations[] = useMemo(() => {
    if (videoTypeFilter === "processed") {
      // Processed videos view - show videos that are results of translation
      const processedVideos = videos.filter(v => v.video_type === "translated");
      return processedVideos.map(video => ({
        ...video,
        localizations: { 'processed': { status: 'live', progress: 100 } }, // Dummy localization to show "Live" status
        estimated_credits: 0,
        global_views: video.view_count,
      }));
    }

    // Filter based on videoTypeFilter
    let baseVideos = videos;
    if (videoTypeFilter === "original") {
      baseVideos = videos.filter(v => v.video_type !== "translated");
    } else if (videoTypeFilter === "all") {
      // For "all", we might still want to mostly show originals as parents?
      // Or literally everything. Let's assume originals for now to maintain the smart table logic.
      baseVideos = videos.filter(v => v.video_type !== "translated");
    }

    return baseVideos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};
      const translatedLanguages = video.translated_languages || [];

      // Build localization status for each selected language
      selectedLanguages.forEach(lang => {
        // Check for active job first
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
          // Not yet translated - mark as not started
          localizations[lang] = {
            status: "not-started",
            progress: 0,
          };
        }
      });

      const duration = video.duration || 600; // Default 10 minutes
      const estimated_credits = Math.ceil(duration / 60); // 1 credit per minute
      const global_views = video.global_views || 0;

      return {
        ...video,
        localizations,
        estimated_credits,
        global_views,
      };
    });
  }, [videos, selectedLanguages, videoTypeFilter]);

  const getOverallVideoStatus = (localizations: Record<string, LocalizationInfo>): LocalizationStatus => {
    const statuses = Object.values(localizations).map(l => l.status);

    // If any are processing, overall is processing
    if (statuses.some(s => s === "processing")) return "processing";
    // If any are draft, overall needs review
    if (statuses.some(s => s === "draft")) return "draft";
    // If all are live, overall is live
    if (statuses.every(s => s === "live")) return "live";
    // Otherwise, ready to dub
    return "not-started";
  };

  const filteredVideos = useMemo(() => {
    let filtered = videosWithLocalizations;

    // Channel filter - filter by selected channel
    if (selectedChannelId) {
      filtered = filtered.filter((video) => video.channel_id === selectedChannelId);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(query) ||
        video.channel_name?.toLowerCase().includes(query)
      );
    }

    // Default Sort (Recent)
    filtered.sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    return filtered;
  }, [videosWithLocalizations, selectedChannelId, searchQuery]);



  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
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

  // Get channel avatar from channel graph
  const getChannelAvatar = (channelId: string) => {
    const masterNode = channelGraph.find((m: MasterNode) => m.channel_id === channelId);
    return masterNode?.channel_avatar_url;
  };

  const getJobVideoInfo = (job: any) => {
    const video = videos.find(v => v.video_id === job.source_video_id);
    return {
      title: video?.title || `Video ${job.source_video_id?.slice(0, 8) || 'Unknown'}`,
      thumbnail: video?.thumbnail_url
    };
  };

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col overflow-hidden`}>
      <SEO
        title="Dashboard | Olleey"
        description="Manage your global content production, monitor translation jobs, and distribute to international channels from your creative command center."
      />
      {/* Header */}
      <div className={`flex-shrink-0 px-0 py-3 sm:py-4 md:py-6`}>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal ${textClass} mb-1 sm:mb-2 truncate`}>
                Dashboard
              </h1>
              <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate`}>
                Manage your videos and track translation progress across languages
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchVideos()}
                disabled={videosLoading}
                className={`h-10 w-10 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200'}`}
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${videosLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                onClick={() => setShowManualProcessView(!showManualProcessView)}
                className={`gap-2 h-10 px-4 transition-all duration-300 ${showManualProcessView
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black')
                  : 'bg-olleey-yellow text-black font-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  }`}
              >
                {showManualProcessView ? (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start Manual Process
                  </>
                )}
              </Button>
            </div>
          </div>





          <div className={`flex items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm ${textClass}Secondary flex-shrink-0 flex-wrap ml-auto`}>
            <span className="whitespace-nowrap">Total Videos: <strong className={`${textClass}`}>{filteredVideos.length}</strong></span>
            <span className="whitespace-nowrap">Translations: <strong className="text-indigo-400">
              {filteredVideos.reduce((acc, video) => {
                const localizations = video.localizations || {};
                return acc + Object.values(localizations).filter(l => l.status === "live").length;
              }, 0)}
            </strong></span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full flex flex-col px-2 sm:px-4">

          {showManualProcessView ? (
            <ManualProcessView
              availableChannels={
                channelGraph.flatMap((master: MasterNode) =>
                  master.language_channels.map((lc: any) => ({
                    id: lc.channel_id,
                    name: lc.channel_name,
                    language_code: lc.language_code,
                    language_name: lc.language_name
                  }))
                )
              }
              projectId={selectedProject?.id}
              onSuccess={() => {
                setShowManualProcessView(false);
                refetchVideos();
              }}
              onCancel={() => setShowManualProcessView(false)}
            />
          ) : (
            /* Main Dashboard Grid */
            <div className="flex flex-col lg:flex-row gap-8 mb-12">

              {/* Left Column: Extensive Production View */}
              <div className="flex-1 min-w-0 space-y-16">
                {/* Active Queue & Review Section */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-olleey-yellow/10 rounded-2xl shadow-sm border border-olleey-yellow/20">
                        <Clock className="w-6 h-6 text-olleey-yellow" />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-300 ${textClass} tracking-tight`}>Queue & Review</h2>
                        <p className={`text-[11px] ${textSecondaryClass} font-medium`}>Active processing and pending approvals</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-full border border-white/5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-olleey-yellow animate-pulse" />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${textClass}`}>
                        {filteredVideos.filter(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {}))).length} Production Active
                      </span>
                    </div>
                  </div>

                  {videosLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-white/5">
                      <Loader2 className={`h-10 w-10 animate-spin text-olleey-yellow mb-4 opacity-50`} />
                      <p className={`text-sm font-medium ${textSecondaryClass}`}>Syncing with production servers...</p>
                    </div>
                  ) : filteredVideos.filter(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {}))).length === 0 ? (
                    <div className={`${cardClass} border-2 border-dashed ${borderClass} rounded-3xl p-16 text-center group transition-all hover:bg-white/[0.01]`}>
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <CheckCircle className={`w-10 h-10 ${textSecondaryClass} opacity-20`} />
                      </div>
                      <p className={`${textClass} text-lg font-bold mb-2`}>Queue Clear</p>
                      <p className={`text-sm ${textSecondaryClass} max-w-xs mx-auto`}>
                        No videos currently in processing. New content from your connected channels will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className={`${cardClass} border ${borderClass} rounded-3xl shadow-2xl shadow-black/10 overflow-hidden`}>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50/50'} border-b ${borderClass}`}>
                            <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Asset & Source</th>
                            <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Stage</th>
                            <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Distribution</th>
                            <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest text-right`}>Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {filteredVideos
                            .filter(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {})))
                            .map((video) => {
                              const status = getOverallVideoStatus(video.localizations || {});
                              const isReview = status === "draft";
                              const isProcessing = status === "processing";

                              return (
                                <tr
                                  key={video.video_id}
                                  className={`group hover:${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} transition-all cursor-pointer`}
                                  onClick={() => router.push(`/content/${video.video_id}`)}
                                >
                                  <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-gray-900 shrink-0 shadow-lg border border-white/5">
                                        {video.thumbnail_url && <img src={video.thumbnail_url} className={`w-full h-full object-cover ${isProcessing ? 'opacity-40' : ''}`} alt="" />}
                                        {isProcessing && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                            <RefreshCw className="w-5 h-5 text-olleey-yellow animate-spin" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-sm font-bold ${textClass} truncate max-w-[280px] mb-1.5 group-hover:text-olleey-yellow transition-colors`}>
                                          {video.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-tight`}>
                                            {video.channel_name}
                                          </span>
                                          <span className="text-[10px] text-white/10">•</span>
                                          <span className={`text-[10px] font-bold ${textSecondaryClass}`}>
                                            {getRelativeTime(video.published_at)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-6">
                                    {isReview ? (
                                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-olleey-yellow/10 text-olleey-yellow text-[10px] font-black uppercase tracking-widest border border-olleey-yellow/20 shadow-sm">
                                        <FileCheck className="w-3.5 h-3.5" />
                                        Review
                                      </span>
                                    ) : (
                                      <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between gap-6">
                                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rendering</span>
                                          <span className="text-[10px] font-black text-olleey-yellow">85%</span>
                                        </div>
                                        <div className="w-36 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                                          <div className="h-full bg-olleey-yellow animate-[shimmer_2s_infinite_linear] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent w-[85%] rounded-full" />
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-6">
                                    <div className="flex items-center -space-x-2.5">
                                      {Object.keys(video.localizations || {})
                                        .filter(l => ["draft", "processing"].includes(video.localizations?.[l]?.status || ''))
                                        .slice(0, 6)
                                        .map(lang => (
                                          <div
                                            key={lang}
                                            className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} bg-white/5 flex items-center justify-center shadow-lg relative z-0 hover:z-10 transition-all hover:scale-125 hover:-translate-y-1`}
                                            title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                                          >
                                            <span className="text-xl">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${video.localizations?.[lang].status === 'draft' ? 'bg-olleey-yellow' : 'bg-blue-500 animate-pulse'}`} />
                                          </div>
                                        ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-6 text-right">
                                    <Button
                                      variant={isReview ? "default" : "ghost"}
                                      size="sm"
                                      className={`h-10 px-6 text-[11px] font-black uppercase tracking-widest transition-all ${isReview
                                        ? 'bg-olleey-yellow text-black hover:bg-olleey-yellow/90 hover:scale-105 shadow-xl shadow-olleey-yellow/20'
                                        : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                    >
                                      {isReview ? "Review Now" : "Manage"}
                                      <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Recently Completed Section */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 rounded-2xl shadow-sm border border-green-500/20">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-300 ${textClass} tracking-tight`}>Released Media</h2>
                        <p className={`text-[11px] ${textSecondaryClass} font-medium`}>Recently published global distribution</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className={`h-10 px-6 text-[11px] font-black uppercase tracking-widest ${textSecondaryClass} hover:${textClass} hover:bg-white/5`}>
                      View All Media
                    </Button>
                  </div>

                  {filteredVideos.filter(v => getOverallVideoStatus(v.localizations || {}) === "live").length === 0 ? (
                    <div className={`${cardClass} border border-dashed ${borderClass} rounded-3xl p-16 text-center shadow-inner`}>
                      <p className={`text-sm font-medium ${textSecondaryClass}`}>Your completed productions will be showcased here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {filteredVideos
                        .filter(v => getOverallVideoStatus(v.localizations || {}) === "live")
                        .slice(0, 6)
                        .map((video) => (
                          <div
                            key={video.video_id}
                            onClick={() => router.push(`/content/${video.video_id}`)}
                            className={`${cardClass} border ${borderClass} rounded-3xl p-6 flex flex-col gap-5 cursor-pointer hover:border-olleey-yellow/40 transition-all hover:translate-y-[-6px] hover:shadow-2xl hover:shadow-olleey-yellow/5 group relative overflow-hidden`}
                          >
                            <div className="w-full aspect-video rounded-2xl bg-gray-900 shrink-0 overflow-hidden shadow-xl relative border border-white/5">
                              <img src={video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="" />
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent transition-opacity" />
                              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                                <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                                  {formatViews(video.global_views)} Global Views
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-lg font-bold ${textClass} truncate mb-3 group-hover:text-olleey-yellow transition-colors`}>{video.title}</h4>
                              <div className="flex items-center justify-between border-t border-white/[0.04] pt-5 mt-2">
                                <div className="flex items-center gap-2.5">
                                  {Object.keys(video.localizations || {})
                                    .filter(l => video.localizations?.[l].status === 'live')
                                    .slice(0, 5)
                                    .map(lang => (
                                      <div key={lang} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg hover:scale-125 hover:-translate-y-1 transition-all" title={lang}>
                                        <span className="text-lg">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                      </div>
                                    ))}
                                </div>
                                <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-tighter`}>{getRelativeTime(video.published_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Activity Feed */}
              <div className="w-full lg:w-64 shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-olleey-yellow" />
                  <h2 className={`text-xl font-300 ${textClass}`}>Activity Feed</h2>
                </div>

                <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 space-y-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-olleey-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                  <div className="relative space-y-6">
                    {activitiesLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-olleey-yellow opacity-40" />
                      </div>
                    ) : activities.length > 0 ? (
                      activities.map((activity, idx) => (
                        <div key={activity.id} className="flex gap-4 items-start">
                          <div className={`w-8 h-8 flex items-center justify-center shrink-0`}>
                            {activity.icon === 'check' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                              activity.icon === 'upload' ? <Radio className="w-4 h-4 text-olleey-yellow" /> :
                                activity.icon === 'plus' ? <Plus className="w-4 h-4 text-blue-500" /> :
                                  activity.icon === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> :
                                    <Zap className="w-4 h-4 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${textClass} font-medium leading-snug mb-1`}>
                              {activity.message}
                            </p>
                            <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-tight`}>
                              {activity.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className={`text-xs ${textSecondaryClass}`}>No recent activity</p>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" className={`w-full text-xs font-bold ${textSecondaryClass} hover:${textClass} mt-4`}>
                    View Full History
                  </Button>
                </div>

                {/* Quick Stats Mini-Widget */}
                <div className={`mt-6 ${cardClass} border ${borderClass} rounded-2xl p-4 bg-gradient-to-br from-rolleey-yellow/5 to-transparent`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>This Week</h4>
                    {dashboard?.weekly_stats?.growth_percentage && (
                      <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                        +{dashboard.weekly_stats.growth_percentage}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className={`text-lg font-bold ${textClass}`}>{dashboard?.weekly_stats?.videos_completed || 0}</p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Videos</p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="text-center">
                      <p className={`text-lg font-bold text-olleey-yellow`}>{dashboard?.weekly_stats?.languages_added || 0}</p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Langs</p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="text-center">
                      <p className={`text-lg font-bold text-indigo-400`}>
                        {dashboard?.credits_summary
                          ? `${Math.round(dashboard.credits_summary.used_credits / 60)}h`
                          : '0h'}
                      </p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Usage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div >
      </div >

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
    </div >
  );
}
