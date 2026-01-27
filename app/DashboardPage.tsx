"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ManualProcessModal } from "@/components/ui/manual-process-modal";
import { LanguageBadge } from "@/components/ui/LanguageBadge";
import { StatusChip } from "@/components/ui/StatusChip";
import { Play, Globe2, Eye, Clock, ChevronDown, Plus, Loader2, ArrowLeft, ArrowRight, Grid3x3, List, X, Radio, Youtube, CheckCircle, XCircle, AlertCircle, Pause, Sparkles, RefreshCw, Filter, SlidersHorizontal, Check } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
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
  const [isManualProcessModalOpen, setIsManualProcessModalOpen] = useState(false);

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
      <div className={`flex-shrink-0 px-0 py-3 sm:py-4 md:py-6 border-b ${borderClass}`}>
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
                className="h-10 w-10"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${videosLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                onClick={() => setIsManualProcessModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm h-10 px-4"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Start Manual Process</span>
                <span className="sm:hidden">Start</span>
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

          {/* Recent Workflow Runs */}
          {!dashboardLoading && dashboard?.recent_jobs && dashboard.recent_jobs.length > 0 && (
            <div className="mb-8 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${textClass} flex items-center gap-2`}>
                  <Sparkles className="h-5 w-5 text-olleey-yellow" />
                  Recent Workflows
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/workflows')}
                  className={`${textSecondaryClass} hover:${textClass}`}
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {dashboard.recent_jobs.slice(0, 5).map((job) => {
                  const videoInfo = getJobVideoInfo(job);
                  const flags = (job.target_languages || []).map(code =>
                    LANGUAGE_OPTIONS.find(l => l.code === code)?.flag || "🌍"
                  );

                  return (
                    <div
                      key={job.job_id}
                      className={`${cardClass} border ${borderClass} rounded-2xl p-4 hover:shadow-lg hover:border-olleey-yellow/30 transition-all cursor-pointer group flex flex-col h-full`}
                      onClick={() => handleShowTerminal(job.job_id, videoInfo.title, job.target_languages?.[0])}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${cardAltClass} border ${borderClass} shadow-inner`}>
                          {videoInfo.thumbnail ? (
                            <img src={videoInfo.thumbnail} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className={`h-5 w-5 ${textSecondaryClass}`} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-semibold ${textClass} truncate leading-snug mb-1.5`}>
                            {videoInfo.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <StatusChip status={job.status} size="xs" />
                            {job.progress !== undefined && job.progress > 0 && job.status !== 'completed' && job.status !== 'failed' && (
                              <span className={`text-[10px] font-bold ${textSecondaryClass}`}>{job.progress}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                        <div className="flex items-center -space-x-1">
                          {flags.slice(0, 3).map((flag, idx) => (
                            <div key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white/5 border border-white/10`} title={job.target_languages?.[idx]} style={{ zIndex: 10 - idx }}>
                              {flag}
                            </div>
                          ))}
                          {flags.length > 3 && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${textSecondaryClass} bg-white/5 border border-white/10 z-0`}>
                              +{flags.length - 3}
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] ${textSecondaryClass} font-medium`}>
                          {job.created_at ? getRelativeTime(job.created_at) : ""}
                        </span>
                      </div>

                      {job.progress !== undefined && job.progress > 0 && job.status !== 'completed' && job.status !== 'failed' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full overflow-hidden px-4 pb-1">
                          <div className="w-full h-full bg-gray-200/5 dark:bg-gray-800/10 overflow-hidden rounded-full">
                            <div
                              className="h-full bg-olleey-yellow transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}





          {/* Search Bar & Primary Filters - Reorganized Row */}
          <div className="flex items-center gap-3 mb-6">
            {/* 1. Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search your library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${cardClass} ${borderClass} ${textClass} placeholder:${textSecondaryClass} text-sm h-11 pl-10 rounded-xl shadow-sm focus:ring-olleey-yellow`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Eye className={`h-4 w-4 ${textSecondaryClass}`} />
                </div>
              </div>
            </div>

            {/* 2. Channel Selector */}
            {dashboard?.youtube_connections && dashboard.youtube_connections.length > 0 && (
              <div className="relative channel-dropdown">
                <Button
                  variant="outline"
                  onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                  className={`flex items-center gap-2 rounded-xl px-4 h-11 text-sm shadow-sm ${channelDropdownOpen ? "border-olleey-yellow ring-1 ring-olleey-yellow/20" : ""}`}
                >
                  {selectedChannelId && getChannelAvatar(selectedChannelId) ? (
                    <img
                      src={getChannelAvatar(selectedChannelId)}
                      alt="Channel"
                      className="w-5 h-5 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <Youtube className={`h-4 w-4 ${textSecondaryClass}`} />
                  )}
                  <span className="font-medium truncate max-w-[120px]">
                    {dashboard.youtube_connections.find(c => c.youtube_channel_id === selectedChannelId)?.youtube_channel_name || "Channel"}
                  </span>
                  <ChevronDown className={`h-4 w-4 ${textSecondaryClass} transition-transform ${channelDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {channelDropdownOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-72 ${cardClass} border ${borderClass} rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md`}>
                    <div className="p-1 focus:outline-none">
                      {dashboard.youtube_connections.map((channel) => (
                        <Button
                          key={channel.youtube_channel_id}
                          variant={channel.youtube_channel_id === selectedChannelId ? "secondary" : "ghost"}
                          onClick={() => handleChannelSelect(channel.youtube_channel_id)}
                          className="w-full flex items-center justify-start gap-3 px-3 py-6 text-sm rounded-lg"
                        >
                          <img src={getChannelAvatar(channel.youtube_channel_id)} className="w-6 h-6 rounded-full" />
                          <span className="truncate">{channel.youtube_channel_name}</span>
                          {channel.youtube_channel_id === selectedChannelId && <Check className="h-4 w-4 ml-auto text-olleey-yellow" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Video Type Selector */}
            <div className="relative video-type-dropdown">
              <StatusChip
                status={videoTypeFilter === "all" ? "queued" : videoTypeFilter === "processed" ? "translated" : "original"}
                label={videoTypeFilter === "all" ? "All Videos" : videoTypeFilter === "original" ? "Original" : "Processed"}
                onClick={() => setVideoTypeDropdownOpen(!videoTypeDropdownOpen)}
                className="h-11 shadow-sm px-4"
              />

              {videoTypeDropdownOpen && (
                <div className={`absolute top-full left-0 mt-2 w-48 ${cardClass} border ${borderClass} rounded-xl shadow-2xl z-50 overflow-hidden`}>
                  <div className="p-1">
                    {[
                      { id: "all", label: "All Videos", status: "queued" },
                      { id: "original", label: "Original Videos", status: "original" },
                      { id: "processed", label: "Processed Videos", status: "translated" }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => { setVideoTypeFilter(type.id as any); setVideoTypeDropdownOpen(false); }}
                        className={`w-full flex items-center px-1 py-1 rounded-lg transition-colors ${videoTypeFilter === type.id ? `${cardAltClass}` : `hover:${cardAltClass}`}`}
                      >
                        <StatusChip
                          status={type.status}
                          label={type.label}
                          size="sm"
                          variant={videoTypeFilter === type.id ? "solid" : "light"}
                          className="w-full border-none shadow-none"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Additional Filters Dropdown */}
            <div className="relative additional-filters-dropdown">
              <Button
                variant="outline"
                onClick={() => setAdditionalFiltersOpen(!additionalFiltersOpen)}
                className={`flex items-center gap-2 rounded-xl px-4 h-11 text-sm shadow-sm ${additionalFiltersOpen ? "border-olleey-yellow ring-1 ring-olleey-yellow/20" : ""}`}
              >
                <SlidersHorizontal className={`h-4 w-4 ${additionalFiltersOpen ? "text-olleey-yellow" : textSecondaryClass}`} />
                <span className="font-medium">Filters</span>
                {selectedLanguages.length > 0 && (
                  <span className="ml-1 bg-olleey-yellow text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {selectedLanguages.length}
                  </span>
                )}
              </Button>

              {additionalFiltersOpen && (
                <div className={`absolute top-full right-0 mt-2 w-80 ${cardClass} border ${borderClass} rounded-2xl shadow-2xl z-50 p-5 backdrop-blur-md`}>
                  <div className="space-y-6">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-widest ${textSecondaryClass} mb-3`}>Target Languages</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <LanguageBadge
                            key={lang.code}
                            flag={lang.flag}
                            name={lang.name}
                            isSelected={selectedLanguages.includes(lang.code)}
                            onClick={() => {
                              setSelectedLanguages(prev =>
                                prev.includes(lang.code)
                                  ? prev.filter(c => c !== lang.code)
                                  : [...prev, lang.code]
                              );
                            }}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. View Mode Buttons */}
            <div className={`flex items-center gap-1 ${cardClass} border ${borderClass} rounded-xl p-1 shadow-sm`}>
              <Button
                variant={viewMode === "carousel" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("carousel")}
                className="h-9 w-9"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("table")}
                className="h-9 w-9"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Latest Video Processed Card - Only for Original Tab */}
          {!videosLoading && (videoTypeFilter === "all" || videoTypeFilter === "original") && filteredVideos.length > 0 && (() => {
            // Find the most recently processed video (has at least one live localization)
            const videosWithLive = filteredVideos.filter(video => {
              const localizations = video.localizations || {};
              return Object.values(localizations).some(l => l.status === "live");
            });

            const latestProcessed = videosWithLive[0];

            // Show empty state if no processed videos
            if (!latestProcessed) {
              return null;
            }

            const localizations = latestProcessed.localizations || {};
            const liveCount = Object.values(localizations).filter(l => l.status === "live").length;

            return (
              <div className="mb-6">
                <div
                  className={`${cardClass} rounded-xl border-2 border-indigo-500/30 overflow-hidden cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 relative group`}
                  onClick={() => router.push(`/content/${latestProcessed.video_id}`)}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Latest Processed
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 p-4 relative">
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] md:w-64 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
                      {latestProcessed.thumbnail_url ? (
                        <img
                          src={latestProcessed.thumbnail_url}
                          alt={latestProcessed.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className={`h-12 w-12 ${textSecondaryClass}`} />
                        </div>
                      )}
                      {/* Duration Badge */}
                      <div className={`absolute bottom-2 right-2 ${bgClass}/90 ${textClass} text-xs px-2 py-0.5 rounded`}>
                        {formatDuration(latestProcessed.duration)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className={`font-semibold ${textClass} text-base mb-2 line-clamp-2`}>
                          {latestProcessed.title}
                        </h3>
                        <p className={`text-sm ${textSecondaryClass} mb-3`}>
                          {latestProcessed.channel_name}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className={`flex items-center gap-4 text-sm ${textSecondaryClass}`}>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            <span>{formatViews(latestProcessed.view_count)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Globe2 className="h-4 w-4 text-indigo-400" />
                            <span className="text-indigo-400 font-medium">{liveCount} {liveCount === 1 ? 'language' : 'languages'}</span>
                          </div>
                        </div>

                        {/* Language Flags */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {Object.keys(localizations)
                            .filter(langCode => localizations[langCode]?.status === "live")
                            .slice(0, 6)
                            .map(langCode => {
                              const lang = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                              return lang ? (
                                <span key={langCode} className="text-lg" title={lang.name}>
                                  {lang.flag}
                                </span>
                              ) : null;
                            })}
                          {liveCount > 6 && (
                            <span className={`text-xs ${textSecondaryClass} ml-1`}>
                              +{liveCount - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Content Area - Carousel or Table */}
          <div className="flex-1 overflow-hidden">
            {videosLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`h-8 w-8 animate-spin ${textClass}Secondary`} />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className={`${cardClass} rounded-2xl border ${borderClass} p-12 text-center`}>
                <p className={`${textClass}Secondary text-lg mb-2`}>No videos found</p>
                <p className={`text-sm ${textClass}Secondary`}>
                  {searchQuery ? "Try a different search term" : "Your videos will appear here once synced"}
                </p>
              </div>
            ) : viewMode === "table" ? (
              /* Smart Table View */
              <SmartVideoTable
                videos={filteredVideos}
                languageOptions={LANGUAGE_OPTIONS}
                onPreview={handlePreview}
                onPublish={handlePublish}
                onUpdateTitle={handleUpdateTitle}
                isProcessingId={processingId}
                onViewDetails={handleShowTerminal}
              />
            ) : (
              /* Grid View (formerly Carousel) */
              <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {/* Regular Video Cards */}
                  {filteredVideos.map((video) => {
                    const localizations = video.localizations || {};
                    const completedCount = Object.values(localizations).filter(l => l.status === "live").length;
                    const totalCount = selectedLanguages.length;
                    const overallStatus = getOverallVideoStatus(localizations);

                    // Identify flags to show
                    const flags: string[] = [];

                    // Assume original content is English
                    flags.push("🇺🇸");

                    // Add flags for live localizations
                    Object.keys(localizations).forEach(langCode => {
                      const match = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                      if (match && localizations[langCode]?.status === "live") {
                        flags.push(match.flag);
                      }
                    });

                    return (
                      <div
                        key={video.video_id}
                        className={`${cardClass} rounded-xl border ${borderClass} overflow-hidden cursor-pointer transition-colors hover:${cardClass}Alt`}
                        onClick={() => router.push(`/content/${video.video_id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] w-full bg-gray-900">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className={`h-12 w-12 ${textClass}Secondary`} />
                            </div>
                          )}
                          {/* Duration Badge */}
                          <div className={`absolute bottom-2 right-2 ${bgClass}/90 ${textClass} text-xs px-2 py-0.5 rounded`}>
                            {formatDuration(video.duration)}
                          </div>
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <StatusChip status={overallStatus} size="xs" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-2">
                          {/* Title */}
                          <h3 className={`font-medium ${textClass} text-sm line-clamp-2 leading-tight`}>
                            {video.title}
                          </h3>

                          {/* Channel Name */}
                          <p className={`text-xs ${textClass}Secondary truncate`}>
                            {video.channel_name}
                          </p>

                          {/* Stats Row */}
                          <div className={`flex items-center gap-3 text-xs ${textClass}Secondary`}>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatViews(video.view_count)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(video.duration)}</span>
                            </div>
                          </div>

                          {/* Language Flags */}
                          {flags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {flags.slice(0, 5).map((flag, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center justify-center w-6 h-6 rounded-full ${cardClass}Alt border ${borderClass}`}
                                >
                                  <span className="text-sm">{flag}</span>
                                </div>
                              ))}
                              {flags.length > 5 && (
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${cardClass}Alt border ${borderClass}`}>
                                  <span className="text-xs font-medium">+{flags.length - 5}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full ${cardClass}Alt overflow-hidden`}>
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs ${textClass}Secondary font-medium`}>
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div >
        </div >
      </div >

      {/* Manual Process Modal */}
      < ManualProcessModal
        isOpen={isManualProcessModalOpen}
        onClose={() => setIsManualProcessModalOpen(false)}
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
          refetchVideos();
        }}
      />
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
