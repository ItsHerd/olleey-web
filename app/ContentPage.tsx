"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Globe2, Eye, Clock, ChevronDown, Plus, Loader2, ArrowLeft, ArrowRight, Grid3x3, List, X, Radio, Youtube } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import { youtubeAPI, type MasterNode, type Video } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type StatusFilter = "all" | "ready-to-dub" | "processing" | "needs-review" | "published";
type SortOption = "recent" | "duration";
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
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja"]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);

  const { dashboard, loading: dashboardLoading } = useDashboard();
  // Pass channel_id to useVideos for server-side filtering and per-channel caching
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedChannelId ? { channel_id: selectedChannelId } : undefined
  );

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
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

  // Set default channel to primary channel on load
  useEffect(() => {
    if (dashboard?.youtube_connections && dashboard.youtube_connections.length > 0 && !selectedChannelId) {
      // Find primary channel or use first channel
      const primaryChannel = dashboard.youtube_connections.find(c => c.is_primary);
      const defaultChannel = primaryChannel || dashboard.youtube_connections[0];
      setSelectedChannelId(defaultChannel.youtube_channel_id);
    }
  }, [dashboard, selectedChannelId]);

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

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

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

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(video => {
        const localizations = video.localizations || {};
        const overallStatus = getOverallVideoStatus(localizations);

        switch (statusFilter) {
          case "ready-to-dub":
            return overallStatus === "not-started";
          case "processing":
            return overallStatus === "processing";
          case "needs-review":
            return overallStatus === "draft";
          case "published":
            return overallStatus === "live";
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case "duration":
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [videosWithLocalizations, searchQuery, statusFilter, sortBy, selectedChannelId]);

  const getStatusBadge = (status: LocalizationStatus) => {
    switch (status) {
      case "live":
        return { icon: "🟢", label: "Live", color: "bg-green-50 text-green-700 border-green-200" };
      case "draft":
        return { icon: "🟡", label: "Draft", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
      case "processing":
        return { icon: "⚪️", label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "not-started":
        return { icon: "⚫️", label: "Not Started", color: "${cardClass} ${textClass}Secondary border-gray-200" };
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
                            setSelectedChannelId(channel.youtube_channel_id);
                            setChannelDropdownOpen(false);
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
            <div className={`mb-4 mt-4 flex items-center gap-4 px-5 py-3 ${cardClass}/50 border ${borderClass} rounded-lg`}>
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
              <span className={`text-sm ${textClass}Secondary flex-1`}>
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

          {/* Filter Bar */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-[120px] sm:w-48 ${cardClass} ${borderClass} ${textClass} placeholder:${textClass}Secondary text-sm h-9`}
              />

              {/* Status Filter */}
              <div className="relative flex-shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className={`appearance-none ${cardClass} border ${borderClass} ${textClass} rounded-lg px-2 sm:px-3 py-2 pr-6 sm:pr-8 text-xs sm:text-sm hover:${cardClass}Alt cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px]`}
                >
                  <option value="all">All Status</option>
                  <option value="ready-to-dub">Ready to Dub</option>
                  <option value="processing">Processing</option>
                  <option value="needs-review">Needs Review</option>
                  <option value="published">Published</option>
                </select>
                <ChevronDown className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 ${textClass}Secondary pointer-events-none`} />
              </div>

              {/* Sort By */}
              <div className="relative flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={`appearance-none ${cardClass} border ${borderClass} ${textClass} rounded-lg px-2 sm:px-3 py-2 pr-6 sm:pr-8 text-xs sm:text-sm hover:${cardClass}Alt cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px]`}
                >
                  <option value="recent">Upload Date</option>
                  <option value="duration">Duration</option>
                </select>
                <ChevronDown className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 ${textClass}Secondary pointer-events-none`} />
              </div>

              {/* Language Multi-Select */}
              <div className="relative language-dropdown flex-shrink-0">
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 ${cardClass} border ${borderClass} ${textClass} rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm hover:${cardClass}Alt focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap`}
                >
                  <Globe2 className={`h-3.5 w-3.5 ${textClass}Secondary`} />
                  <span>{selectedLanguages.length} Languages</span>
                  <ChevronDown className={`h-3.5 w-3.5 ${textClass}Secondary`} />
                </button>

                {/* Language Dropdown */}
                {languageDropdownOpen && (
                  <div className={`absolute top-full left-0 mt-1 w-64 ${cardClass} border ${borderClass} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}>
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                        <span className={`text-xs ${textClass}Secondary font-normal uppercase`}>Select Languages</span>
                        <button
                          onClick={() => setLanguageDropdownOpen(false)}
                          className={`${textClass}Secondary hover:${textClass}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = selectedLanguages.includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              if (isSelected) {
                                // Don't allow deselecting if it's the last language
                                if (selectedLanguages.length > 1) {
                                  setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                                }
                              } else {
                                setSelectedLanguages([...selectedLanguages, lang.code]);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${isSelected
                              ? "${cardClass}Alt ${textClass}"
                              : "${textClass}Secondary hover:${cardClass}Alt hover:${textClass}"
                              }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="flex-1 text-left">{lang.name}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
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

              <div className={`ml-auto text-sm ${textClass}Secondary`}>
                {filteredVideos.length} videos
              </div>
            </div>
          </div>

          {/* View Toggle & Navigation Controls */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Carousel Navigation Controls - Only show in carousel mode */}
            {viewMode === "carousel" ? (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollPrev()}
                  disabled={!canScrollPrev}
                  className={`h-9 w-9 rounded-full disabled:opacity-30 ${textClass} hover:${textClass}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={!canScrollNext}
                  className={`h-9 w-9 rounded-full disabled:opacity-30 ${textClass} hover:${textClass}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div />
            )}

            {/* View Mode Toggle - Right Side */}
            <div className={`flex items-center gap-1 ${cardClass} border ${borderClass} rounded-lg p-1 ml-auto`}>
              <button
                onClick={() => setViewMode("carousel")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-normal transition-colors ${viewMode === "carousel"
                  ? "bg-white text-black"
                  : "${textClass}Secondary hover:${textClass}"
                  }`}
              >
                <Grid3x3 className="h-4 w-4" />
                Gallery
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-normal transition-colors ${viewMode === "table"
                  ? "bg-white text-black"
                  : "${textClass}Secondary hover:${textClass}"
                  }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
            </div>
          </div>

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
              <div className={`${cardClass} rounded-xl border ${borderClass} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${bgClass} border-b ${borderClass}`}>
                      <tr>
                        <th className={`text-left px-6 py-4 text-sm font-normal ${textClass}Secondary uppercase`}>Video</th>
                        <th className={`text-left px-6 py-4 text-sm font-normal ${textClass}Secondary uppercase`}>Status</th>
                        <th className={`text-left px-6 py-4 text-sm font-normal ${textClass}Secondary uppercase`}>Languages</th>
                        <th className={`text-left px-6 py-4 text-sm font-normal ${textClass}Secondary uppercase`}>Stats</th>
                        <th className={`text-left px-6 py-4 text-sm font-normal ${textClass}Secondary uppercase`}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVideos.map((video) => {
                        const localizations = video.localizations || {};
                        const completedCount = Object.values(localizations).filter(l => l.status === "live").length;
                        const totalCount = selectedLanguages.length;
                        const overallStatus = getOverallVideoStatus(localizations);
                        const overallBadge = getStatusBadge(overallStatus);

                        return (
                          <tr
                            key={video.video_id}
                            onClick={() => router.push(`/content/${video.video_id}`)}
                            className={`border-b ${borderClass} hover:${cardClass}Alt cursor-pointer transition-colors`}
                          >
                            {/* Video Column */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className={`relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden ${cardClass}Alt`}>
                                  {video.thumbnail_url ? (
                                    <img
                                      src={video.thumbnail_url}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Play className={`h-8 w-8 ${textClass}Secondary`} />
                                    </div>
                                  )}
                                  <div className={`absolute bottom-1 right-1 ${bgClass}/80 ${textClass} text-xs px-1.5 py-0.5 rounded`}>
                                    {formatDuration(video.duration)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-normal ${textClass} text-base mb-1 line-clamp-2`}>
                                    {video.title}
                                  </h3>
                                  <p className={`text-sm ${textClass}Secondary`}>{video.channel_name}</p>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-normal ${overallBadge.color}`}>
                                {overallBadge.icon} {overallBadge.label}
                              </span>
                            </td>

                            {/* Languages Column */}
                            <td className="px-6 py-4">
                              <div className="flex gap-1.5">
                                {selectedLanguages.map(langCode => {
                                  const langOption = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                                  const localization = localizations[langCode];
                                  const status = localization?.status || "not-started";

                                  return (
                                    <div
                                      key={langCode}
                                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${status === "live"
                                        ? "border-green-500 ${cardClass}Alt"
                                        : status === "draft"
                                          ? "border-yellow-500 ${cardClass}Alt"
                                          : status === "processing"
                                            ? "border-blue-500 ${cardClass}Alt"
                                            : "${borderClass} ${cardClass} opacity-50 grayscale"
                                        }`}
                                      title={`${langOption?.name} - ${status}`}
                                    >
                                      <span className="text-sm">{langOption?.flag}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Stats Column */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 text-sm">
                                <div className={`flex items-center gap-1.5 ${textClass}Secondary`}>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>{formatViews(video.view_count)}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${textClass}Secondary`}>
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{formatDuration(video.duration)}</span>
                                </div>
                              </div>
                            </td>

                            {/* Progress Column */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`flex-1 h-2 rounded-full ${cardClass}Alt overflow-hidden`}>
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs ${textClass}Secondary font-normal w-12 text-right`}>
                                    {completedCount}/{totalCount}
                                  </span>
                                </div>
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
              /* Carousel View */
              <div className="w-full">
                <Carousel
                  setApi={setCarouselApi}
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {filteredVideos.map((video) => {
                      const localizations = video.localizations || {};
                      const completedCount = Object.values(localizations).filter(l => l.status === "live").length;
                      const totalCount = selectedLanguages.length;
                      const overallStatus = getOverallVideoStatus(localizations);
                      const overallBadge = getStatusBadge(overallStatus);

                      return (
                        <CarouselItem key={video.video_id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <button
                            onClick={() => router.push(`/content/${video.video_id}`)}
                            className="group w-full h-full"
                          >
                            <div className={`relative h-full min-h-[450px] overflow-hidden rounded-xl ${cardClass} border-2 ${borderClass} hover:border-indigo-500 transition-all hover:shadow-xl`}>
                              {/* Thumbnail with Gradient Overlay */}
                              <div className="relative h-60 overflow-hidden">
                                {video.thumbnail_url ? (
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${cardClass}`}>
                                    <Play className={`h-16 w-16 ${textClass}Secondary`} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                                <div className={`absolute bottom-3 right-3 ${bgClass}/80 ${textClass} text-xs font-normal px-2 py-1 rounded`}>
                                  {formatDuration(video.duration)}
                                </div>
                                {video.video_type === "original" && (
                                  <div className={`absolute top-3 left-3 ${cardClass} ${textClass} text-xs font-normal px-2 py-1 rounded-full`}>
                                    Original
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-5 flex flex-col gap-4">
                                {/* Title & Stats */}
                                <div>
                                  <h3 className={`font-normal ${textClass} text-lg mb-2 line-clamp-2 text-left`}>
                                    {video.title}
                                  </h3>
                                  <div className={`flex items-center gap-3 text-sm ${textClass}Secondary`}>
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      <span>{formatViews(video.view_count)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{formatDuration(video.duration)}</span>
                                    </div>
                                  </div>
                                  <div className={`mt-1 text-xs ${textClass}Secondary text-left`}>
                                    {video.channel_name}
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs ${textClass}Secondary`}>
                                    {completedCount}/{totalCount} languages
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${overallBadge.color}`}>
                                    {overallBadge.icon} {overallBadge.label}
                                  </span>
                                </div>

                                {/* Language Avatars */}
                                <div className={`flex gap-2 flex-wrap justify-center pt-2 border-t ${borderClass}`}>
                                  {selectedLanguages.map(langCode => {
                                    const langOption = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                                    const localization = localizations[langCode];
                                    const status = localization?.status || "not-started";

                                    return (
                                      <div key={langCode} className="flex flex-col items-center gap-1">
                                        <div
                                          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${status === "live"
                                            ? "border-green-500 ${cardClass}Alt shadow-md"
                                            : status === "draft"
                                              ? "border-yellow-500 ${cardClass}Alt"
                                              : status === "processing"
                                                ? "border-blue-500 ${cardClass}Alt"
                                                : "${borderClass} ${cardClass} opacity-50 grayscale"
                                            }`}
                                          title={`${langOption?.name} - ${status === "live" ? "Live" : status === "draft" ? "Draft" : status === "processing" ? "Processing" : "Not Started"}`}
                                        >
                                          <span className="text-xl">{langOption?.flag}</span>
                                          {status === "not-started" && (
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${cardClass} flex items-center justify-center shadow-sm`}>
                                              <Plus className={`w-2 h-2 ${textClass}`} strokeWidth={2.5} />
                                            </div>
                                          )}
                                          {status === "live" && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                                              <Play className={`w-1.5 h-1.5 ${textClass}`} fill="white" strokeWidth={0} />
                                            </div>
                                          )}
                                          {status === "processing" && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                                              <Loader2 className={`w-2 h-2 ${textClass} animate-spin`} strokeWidth={2.5} />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </button>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>

                {/* Pagination Dots */}
                <div className="mt-6 flex justify-center gap-2">
                  {filteredVideos.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all ${currentSlide === index ? "bg-white w-6" : "${cardClass}Alt hover:${cardClass}0"
                        }`}
                      onClick={() => carouselApi?.scrollTo(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
