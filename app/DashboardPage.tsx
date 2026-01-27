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
import { youtubeAPI, jobsAPI, type MasterNode, type Video, type Job } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { SmartVideoTable } from "@/components/SmartTable/SmartVideoTable";
import { QuickCheckModal } from "@/components/SmartTable/QuickCheckModal";
import { JobTerminalPanel } from "@/components/JobTerminalPanel";
import { useToast } from "@/components/ui/use-toast";
// Removed duplicate StatusChip import


type ViewMode = "carousel" | "table";



type LocalizationStatus = "live" | "draft" | "processing" | "not-started";

interface LocalizationInfo {
  status: LocalizationStatus;
  url?: string;
  views?: number;
  video_id?: string;
  confidence?: number;
}

interface VideoWithLocalizations extends Video {
  localizations?: Record<string, LocalizationInfo>;
  estimated_credits?: number;
  global_views?: number;
}

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
  }, [selectedProject]);

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
        localizations: { 'processed': { status: 'live' } }, // Dummy localization to show "Live" status
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
            video_id: activeJob.job_id,
            confidence: 94, // Mock confidence
          };
        } else if (translatedLanguages.includes(lang)) {
          const translatedVideo = videos.find(v =>
            v.video_type === "translated" &&
            v.source_video_id === video.video_id &&
            v.title.toLowerCase().includes(LANGUAGE_OPTIONS.find(l => l.code === lang)?.name.toLowerCase() || lang)
          );

          localizations[lang] = {
            status: "live",
            url: translatedVideo ? `https://youtube.com/watch?v=${translatedVideo.video_id}` : undefined,
            views: translatedVideo?.view_count,
            video_id: translatedVideo?.video_id,
          };
        } else {
          // Not yet translated - mark as not started
          localizations[lang] = {
            status: "not-started",
          };
        }
      });

      const duration = video.duration || 600; // Default 10 minutes
      const estimated_credits = Math.ceil(duration / 60); // 1 credit per minute
      const global_views = Object.values(localizations).reduce((sum, loc) => sum + (loc.views || 0), 0);

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
    const masterNode = channelGraph.find(m => m.channel_id === channelId);
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
                  : 'bg-olleey-yellow text-black font-bold hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
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

          {/* No Processed Videos Yet - Show right after subtitle when applicable */}
          {!videosLoading && (videoTypeFilter === "all" || videoTypeFilter === "original") && filteredVideos.length > 0 && (() => {
            // Find the most recently processed video (has at least one live localization)
            const videosWithLive = filteredVideos.filter(video => {
              const localizations = video.localizations || {};
              return Object.values(localizations).some(l => l.status === "live");
            });

            const latestProcessed = videosWithLive[0];

            // Show empty state if no processed videos
            if (!latestProcessed) {
              return (
                <div className="mt-6">
                  <div className={`${cardClass} rounded-xl border-2 border-dashed ${borderClass} overflow-hidden relative`}>
                    <div className="flex flex-col md:flex-row gap-4 p-6 items-center text-center md:text-left">
                      <div className={`w-24 h-24 rounded-full ${cardAltClass} flex items-center justify-center flex-shrink-0`}>
                        <Sparkles className={`h-12 w-12 ${textSecondaryClass}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${textClass} text-base mb-2`}>
                          No Processed Videos Yet
                        </h3>
                        <p className={`text-sm ${textSecondaryClass} mb-3`}>
                          Start dubbing your videos to see your latest processed content here
                        </p>
                        <Button
                          onClick={() => {
                            if (filteredVideos[0]) {
                              router.push(`/content/${filteredVideos[0].video_id}`);
                            }
                          }}
                          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm"
                        >
                          <Sparkles className="h-4 w-4" />
                          Start Processing
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}



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
                channelGraph.flatMap(master =>
                  master.language_channels.map(lc => ({
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
            <div className="flex flex-col lg:flex-row gap-8 mb-8">

              {/* Left Column: Queue & Reviews */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${textClass} flex items-center gap-2`}>
                    <Clock className="w-5 h-5 text-olleey-yellow" />
                    Queue & Review
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rolleey-yellow animate-pulse" />
                      <span className={`text-xs font-bold ${textClass}`}>{dashboard?.active_jobs || 0} Active</span>
                    </div>
                    <span className={`text-xs font-medium ${textSecondaryClass}`}>
                      {filteredVideos.length} total videos
                    </span>
                  </div>
                </div>

                {videosLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className={`h-8 w-8 animate-spin text-olleey-yellow`} />
                    <p className={`text-sm ${textSecondaryClass}`}>Syncing your library...</p>
                  </div>
                ) : filteredVideos.length === 0 ? (
                  <div className={`${cardClass} border-2 border-dashed ${borderClass} rounded-2xl p-12 text-center`}>
                    <p className={`${textSecondaryClass} text-lg mb-2`}>No videos found</p>
                    <p className={`text-sm ${textSecondaryClass}`}>
                      Your YouTube content will appear here once connected.
                    </p>
                  </div>
                ) : (
                  <div className={`${cardClass} border ${borderClass} rounded-2xl overflow-hidden shadow-sm`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50/50'} border-b ${borderClass}`}>
                          <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Video</th>
                          <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Status</th>
                          <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Languages</th>
                          <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest text-right`}>Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {/* Combined & Sorted Videos: Priority to Needs Review and Processing */}
                        {[
                          ...filteredVideos.filter(v => getOverallVideoStatus(v.localizations || {}) === "draft"),
                          ...filteredVideos.filter(v => getOverallVideoStatus(v.localizations || {}) === "processing"),
                          ...filteredVideos.filter(v => getOverallVideoStatus(v.localizations || {}) !== "draft" && getOverallVideoStatus(v.localizations || {}) !== "processing").slice(0, 10)
                        ].map((video) => {
                          const status = getOverallVideoStatus(video.localizations || {});
                          const isReview = status === "draft";
                          const isProcessing = status === "processing";

                          return (
                            <tr
                              key={video.video_id}
                              className={`group hover:${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} transition-colors cursor-pointer`}
                              onClick={() => router.push(`/content/${video.video_id}`)}
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-16 aspect-video rounded-md overflow-hidden bg-gray-900 shrink-0 shadow-sm" style={{ zIndex: 0 }}>
                                    {video.thumbnail_url && <img src={video.thumbnail_url} className={`w-full h-full object-cover ${isProcessing ? 'opacity-50' : ''}`} alt="" />}
                                    {isProcessing && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <RefreshCw className="w-3 h-3 text-olleey-yellow animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-semibold ${textClass} truncate max-w-[200px] mb-0.5`}>
                                      {video.title}
                                    </p>
                                    <p className={`text-[10px] ${textSecondaryClass} truncate`}>
                                      {video.channel_name} • {getRelativeTime(video.published_at)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {isReview ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-olleey-yellow/10 text-olleey-yellow text-[10px] font-bold uppercase tracking-wider border border-olleey-yellow/20">
                                    <FileCheck className="w-3 h-3" />
                                    Needs Review
                                  </span>
                                ) : isProcessing ? (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      Processing
                                    </span>
                                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-olleey-yellow animate-[shimmer_2s_infinite_linear] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent w-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                    <CheckCircle className="w-3 h-3" />
                                    Published
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center -space-x-1">
                                  {Object.keys(video.localizations || {})
                                    .filter(l => video.localizations?.[l].status === 'live' || video.localizations?.[l].status === 'draft')
                                    .slice(0, 4)
                                    .map(lang => (
                                      <div
                                        key={lang}
                                        className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-dark-card' : 'border-white'} ${video.localizations?.[lang].status === 'draft' ? 'bg-olleey-yellow/20 ring-1 ring-olleey-yellow' : 'bg-white/5'} flex items-center justify-center shadow-sm`}
                                        title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                                      >
                                        <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                      </div>
                                    ))}
                                  {Object.keys(video.localizations || {}).length > 4 && (
                                    <div className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-dark-card' : 'border-white'} bg-white/5 flex items-center justify-center text-[8px] font-bold ${textSecondaryClass}`}>
                                      +{Object.keys(video.localizations || {}).length - 4}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <Button
                                  variant={isReview ? "default" : "ghost"}
                                  size="sm"
                                  className={`h-8 px-3 text-[10px] font-bold uppercase tracking-wider ${isReview ? 'bg-olleey-yellow text-black hover:bg-olleey-yellow/90' : `${textSecondaryClass} hover:${textClass}`}`}
                                >
                                  {isReview ? "Review" : "Details"}
                                  <ArrowRight className="w-3 h-3 ml-1.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Activity Feed */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-olleey-yellow" />
                  <h2 className={`text-xl font-bold ${textClass}`}>Activity Feed</h2>
                </div>

                <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 space-y-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-olleey-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                  <div className="relative space-y-6">
                    {DASHBOARD_ACTIVITIES.map((activity, idx) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        {idx !== DASHBOARD_ACTIVITIES.length - 1 && (
                          <div className={`absolute left-[13px] top-7 bottom-[-24px] w-[1px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                        )}
                        <div className={`w-7 h-7 rounded-full ${activity.color} flex items-center justify-center text-white shrink-0 z-10 shadow-lg shadow-black/10`}>
                          {activity.icon}
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
                    ))}
                  </div>

                  <Button variant="ghost" className={`w-full text-xs font-bold ${textSecondaryClass} hover:${textClass} mt-4`}>
                    View Full History
                  </Button>
                </div>

                {/* Quick Stats Mini-Widget */}
                <div className={`mt-6 ${cardClass} border ${borderClass} rounded-2xl p-4 bg-gradient-to-br from-rolleey-yellow/5 to-transparent`}>
                  <h4 className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest mb-3`}>This Week</h4>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className={`text-lg font-bold ${textClass}`}>12</p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Videos</p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="text-center">
                      <p className={`text-lg font-bold text-olleey-yellow`}>48</p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Langs</p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="text-center">
                      <p className={`text-lg font-bold text-indigo-400`}>1.2M</p>
                      <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Views</p>
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
