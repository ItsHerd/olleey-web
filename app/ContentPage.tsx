"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/components/ui/DestinationCard";
import { Play, Globe2, Eye, Clock, ChevronDown, Plus, Loader2, ArrowLeft, ArrowRight, Grid3x3, List, X, Radio, Youtube, CheckCircle, XCircle, AlertCircle, Pause, Sparkles } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { youtubeAPI, jobsAPI, type MasterNode, type Video, type Job } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
// Carousel imports removed as we switched to Grid layout


type ViewMode = "carousel" | "table";

const LANGUAGE_OPTIONS = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
];

type LocalizationStatus = "live" | "draft" | "processing" | "not-started";

interface LocalizationInfo {
  status: LocalizationStatus;
  url?: string;
  views?: number;
  video_id?: string;
}

interface VideoWithLocalizations extends Video {
  localizations?: Record<string, LocalizationInfo>;
  estimated_credits?: number;
  global_views?: number;
}

export default function ContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja"]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [latestJob, setLatestJob] = useState<Job | null>(null);
  const [latestJobLoading, setLatestJobLoading] = useState(false);


  const { dashboard, loading: dashboardLoading } = useDashboard();
  // Pass channel_id to useVideos for server-side filtering and per-channel caching
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedChannelId ? { channel_id: selectedChannelId } : undefined
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
        logger.error("ContentPage", "Failed to load channel graph", error);
      }
    };
    loadChannelGraph();
  }, []);

  // Load latest processed job
  useEffect(() => {
    const loadLatestJob = async () => {
      try {
        setLatestJobLoading(true);
        const response = await jobsAPI.listJobsWithLimit(1);
        if (response.jobs && response.jobs.length > 0) {
          // Only set if the job has a completed status (ready, completed, or has live localizations)
          const job = response.jobs[0];
          if (job.status === "ready" || job.status === "completed") {
            setLatestJob(job);
          }
        }
      } catch (error) {
        logger.error("ContentPage", "Failed to load latest job", error);
      } finally {
        setLatestJobLoading(false);
      }
    };
    loadLatestJob();
  }, []);

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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (languageDropdownOpen && !target.closest('.language-dropdown')) {
        setLanguageDropdownOpen(false);
      }
      if (channelDropdownOpen && !target.closest('.channel-dropdown')) {
        setChannelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageDropdownOpen, channelDropdownOpen]);

  // Carousel effect removed

  // Process videos with real localization data from backend
  const videosWithLocalizations: VideoWithLocalizations[] = useMemo(() => {
    // Only show original videos in the main list
    const originalVideos = videos.filter(v => v.video_type !== "translated");

    return originalVideos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};
      const translatedLanguages = video.translated_languages || [];

      // Build localization status for each selected language
      selectedLanguages.forEach(lang => {
        if (translatedLanguages.includes(lang)) {
          // This language has been translated - mark as live
          // In production, you could fetch the actual translated video details
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
  }, [videos, selectedLanguages]);

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

  const getStatusBadge = (status: LocalizationStatus) => {
    switch (status) {
      case "live":
        return {
          icon: CheckCircle,
          label: "Live",
          color: "text-green-400",
          bgColor: "bg-green-900/20",
          borderColor: "border-green-700/30"
        };
      case "draft":
        return {
          icon: AlertCircle,
          label: "Draft",
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/20",
          borderColor: "border-yellow-700/30"
        };
      case "processing":
        return {
          icon: Loader2,
          label: "Processing",
          color: "text-blue-400",
          bgColor: "bg-blue-900/20",
          borderColor: "border-blue-700/30"
        };
      case "not-started":
        return {
          icon: XCircle,
          label: "Not Started",
          color: "text-gray-400",
          bgColor: "bg-gray-900/20",
          borderColor: "border-gray-700/30"
        };
    }
  };

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

  // Get channel avatar from channel graph
  const getChannelAvatar = (channelId: string) => {
    const masterNode = channelGraph.find(m => m.channel_id === channelId);
    return masterNode?.channel_avatar_url;
  };

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`flex-shrink-0 px-0 py-3 sm:py-4 md:py-6 border-b ${borderClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal ${textClass} mb-1 sm:mb-2 truncate`}>Content Library</h1>
            <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate`}>
              Manage your videos and track translation progress across languages
            </p>
          </div>
          <div className={`flex items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm ${textClass}Secondary flex-shrink-0 flex-wrap`}>
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
          {/* Channel Selector */}
          {dashboard?.youtube_connections && dashboard.youtube_connections.length > 0 && (
            <div className="mb-4 mt-4 relative channel-dropdown">
              <button
                onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                className={`w-full sm:w-auto flex items-center gap-3 ${cardClass} border ${borderClass} ${textClass} rounded-lg px-4 py-2.5 text-sm hover:${cardClass}Alt cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
              >
                {selectedChannelId && getChannelAvatar(selectedChannelId) ? (
                  <img
                    src={getChannelAvatar(selectedChannelId)}
                    alt="Channel"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full ${cardClass}Alt flex items-center justify-center`}>
                    <Youtube className={`h-3 w-3 ${textClass}Secondary`} />
                  </div>
                )}
                <span className="flex-1 text-left">
                  {dashboard.youtube_connections.find(c => c.youtube_channel_id === selectedChannelId)?.youtube_channel_name ||
                    dashboard.youtube_connections.find(c => c.is_primary)?.youtube_channel_name ||
                    "Select Channel"}
                  {dashboard.youtube_connections.find(c => c.youtube_channel_id === selectedChannelId)?.is_primary && (
                    <span className={`ml-2 text-xs ${textClass}Secondary`}>(Main)</span>
                  )}
                </span>
                <ChevronDown className={`h-4 w-4 ${textClass}Secondary transition-transform ${channelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Channel Dropdown */}
              {channelDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 w-full sm:w-64 ${cardClass} border ${borderClass} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}>
                  <div className="py-1">
                    {dashboard.youtube_connections.map((channel) => {
                      const avatarUrl = getChannelAvatar(channel.youtube_channel_id);
                      const isSelected = channel.youtube_channel_id === selectedChannelId;

                      return (
                        <button
                          key={channel.youtube_channel_id}
                          onClick={() => {
                            handleChannelSelect(channel.youtube_channel_id);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                            ? "${cardClass}Alt ${textClass}"
                            : "${textClass}Secondary hover:${cardClass}Alt hover:${textClass}"
                            }`}
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={channel.youtube_channel_name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${cardClass}Alt flex items-center justify-center flex-shrink-0`}>
                              <Youtube className={`h-4 w-4 ${textClass}Secondary`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{channel.youtube_channel_name || channel.youtube_channel_id}</span>
                              {channel.is_primary && (
                                <span className="text-xs bg-white text-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  PRIMARY
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listening Animation */}
          {!videosLoading && (
            <div className={`mb-4 mt-4 flex items-center gap-4 px-6 py-4 ${cardClass}/50 border ${borderClass} rounded-lg`}>
              {/* Radar Animation */}
              <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                {/* Outer pulse ring */}
                <div className="absolute w-5 h-5 rounded-full border-2 border-indigo-500/30 animate-ping"></div>
                {/* Inner pulse ring */}
                <div className="absolute w-3 h-3 rounded-full border border-indigo-500/50 animate-ping"></div>
                {/* Center dot */}
                <div className="relative w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              </div>

              {/* Micro-copy */}
              <span className={`text-sm ${textSecondaryClass} flex-1`}>
                Watching{" "}
                <span className={`${textClass}`}>
                  @{dashboard?.youtube_connections?.find(c => c.youtube_channel_id === selectedChannelId)?.youtube_channel_name ||
                    dashboard?.youtube_connections?.find(c => c.is_primary)?.youtube_channel_name ||
                    "your channel"}
                </span>
                {" "}for new uploads...
              </span>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => refetchVideos()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-normal transition-colors underline"
                >
                  Check Now
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement manual process trigger
                    console.log("Start manual process");
                  }}
                  className={`text-xs ${cardClass}Alt ${textClass} px-3 py-1.5 rounded-full font-normal hover:${cardClass}Alt transition-colors`}
                >
                  Start Manual Process
                </button>
              </div>
            </div>
          )}

          {/* Search Bar & View Toggle - Combined Row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Search Bar - Left Side */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${cardClass} ${borderClass} ${textClass} placeholder:${textSecondaryClass} text-sm h-10`}
              />
            </div>

            {/* View Mode Toggle - Right Side */}
            <div className={`flex items-center gap-1 ${cardClass} border ${borderClass} rounded-lg p-1`}>
              <button
                onClick={() => setViewMode("carousel")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-normal transition-colors ${viewMode === "carousel"
                  ? "bg-white text-black"
                  : `${textSecondaryClass} hover:${textClass}`
                  }`}
              >
                <Grid3x3 className="h-4 w-4" />
                Gallery
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-normal transition-colors ${viewMode === "table"
                  ? "bg-white text-black"
                  : `${textSecondaryClass} hover:${textClass}`
                  }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
            </div>
          </div>

          {/* Latest Video Processed Card - Above Table/Grid */}
          {!videosLoading && filteredVideos.length > 0 && (() => {
            // Find the most recently processed video (has at least one live localization)
            const videosWithLive = filteredVideos.filter(video => {
              const localizations = video.localizations || {};
              return Object.values(localizations).some(l => l.status === "live");
            });

            const latestProcessed = videosWithLive[0];

            // Show empty state if no processed videos
            if (!latestProcessed) {
              return (
                <div className="mb-6">
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
                        <button
                          onClick={() => {
                            // Navigate to first video to start processing
                            if (filteredVideos[0]) {
                              router.push(`/content/${filteredVideos[0].video_id}`);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                        >
                          <Sparkles className="h-4 w-4" />
                          Start Processing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
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
                    <div className="relative aspect-video md:w-64 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
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
              /* Table View */
              <div className={`${cardClass} rounded-xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${bgClass}`}>
                      <tr className="border-b border-border/50">
                        <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>Video</th>
                        <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>Status</th>
                        <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>Languages</th>
                        <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>Views</th>
                        <th className={`text-left px-4 py-3 text-xs font-medium ${textSecondaryClass} uppercase tracking-wider`}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVideos.map((video, index) => {
                        const localizations = video.localizations || {};
                        const completedCount = Object.values(localizations).filter(l => l.status === "live").length;
                        const totalCount = selectedLanguages.length;
                        const overallStatus = getOverallVideoStatus(localizations);
                        const overallBadge = getStatusBadge(overallStatus);

                        // Get live language flags for display
                        const liveLanguages = selectedLanguages
                          .filter(langCode => localizations[langCode]?.status === "live")
                          .map(langCode => LANGUAGE_OPTIONS.find(l => l.code === langCode))
                          .filter(Boolean);

                        return (
                          <tr
                            key={video.video_id}
                            onClick={() => router.push(`/content/${video.video_id}`)}
                            className={`hover:bg-white/5 cursor-pointer transition-colors ${index !== filteredVideos.length - 1 ? 'border-b border-border/30' : ''}`}
                          >
                            {/* Video Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`relative w-24 h-14 flex-shrink-0 rounded-md overflow-hidden ${cardClass}Alt`}>
                                  {video.thumbnail_url ? (
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
                                  <div className={`absolute bottom-0.5 right-0.5 ${bgClass}/90 ${textClass} text-[10px] px-1 py-0.5 rounded`}>
                                    {formatDuration(video.duration)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-medium ${textClass} text-sm mb-0.5 line-clamp-1`}>
                                    {video.title}
                                  </h3>
                                  <p className={`text-xs ${textSecondaryClass}`}>{video.channel_name}</p>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${overallBadge.bgColor} ${overallBadge.color} border-2 ${overallBadge.borderColor}`}>
                                <overallBadge.icon className="h-3.5 w-3.5" />
                                {overallBadge.label}
                              </span>
                            </td>

                            {/* Languages Column - Show 2 avatars + count */}
                            <td className="px-4 py-3">
                              <div className="flex items-center -space-x-2">
                                {liveLanguages.slice(0, 2).map((lang, idx) => (
                                  <div
                                    key={lang?.code || idx}
                                    className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm`}
                                    title={lang?.name}
                                    style={{ zIndex: 2 - idx }}
                                  >
                                    <span className="text-sm">{lang?.flag}</span>
                                  </div>
                                ))}
                                {liveLanguages.length > 2 && (
                                  <div
                                    className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm`}
                                    title={`${liveLanguages.length - 2} more languages`}
                                  >
                                    <span className="text-[10px] font-bold text-amber-400">+{liveLanguages.length - 2}</span>
                                  </div>
                                )}
                                {liveLanguages.length === 0 && (
                                  <span className={`text-xs ${textSecondaryClass} italic`}>None</span>
                                )}
                              </div>
                            </td>

                            {/* Views Column */}
                            <td className="px-4 py-3">
                              <div className={`flex items-center gap-1.5 text-sm ${textClass}`}>
                                <Eye className={`h-3.5 w-3.5 ${textSecondaryClass}`} />
                                <span className="font-medium">{formatViews(video.view_count)}</span>
                              </div>
                            </td>

                            {/* Progress Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`flex-1 h-2 rounded-full bg-white/5 overflow-hidden`}>
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                  />
                                </div>
                                <span className={`text-xs ${textSecondaryClass} font-medium w-10 text-right`}>
                                  {completedCount}/{totalCount}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
                    const overallBadge = getStatusBadge(overallStatus);

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
                        <div className="relative aspect-video w-full bg-gray-900">
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
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${overallBadge.bgColor} ${overallBadge.borderColor} ${overallBadge.color}`}>
                              <overallBadge.icon className="h-2.5 w-2.5" />
                              {overallBadge.label}
                            </span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
