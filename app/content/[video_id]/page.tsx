"use client";

export const runtime = 'edge';

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Maximize,
  Sparkles,
  Plus,
  X,
  Check,
  ExternalLink,
  TrendingUp,
  Loader2,
  Edit2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useVideos } from "@/lib/useVideos";
import { useDashboard } from "@/lib/useDashboard";
import { jobsAPI, youtubeAPI, type LanguageChannel } from "@/lib/api";
import { useJobPolling } from "@/lib/useJobPolling";
import { logger } from "@/lib/logger";

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
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

type LanguageState = "empty" | "processing" | "review" | "published";

interface LanguageCardData {
  code: string;
  state: LanguageState;
  progress?: number;
  phase?: string;
  confidenceScore?: number;
  url?: string;
  views?: number;
}

export default function VideoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos();
  const { dashboard, refetch: refetchDashboard } = useDashboard();

  const [video, setVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDubbingModal, setShowDubbingModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<"original" | "dubbed">("original");
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [availableLanguageChannels, setAvailableLanguageChannels] = useState<LanguageChannel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Mock language states - in real app, fetch from backend
  const [languageCards, setLanguageCards] = useState<LanguageCardData[]>([
    { code: "de", state: "review", confidenceScore: 98 },
    { code: "es", state: "processing", progress: 75, phase: "Syncing Lips..." },
    { code: "fr", state: "published", url: "https://tiktok.com", views: 45200 },
  ]);

  // Load available language channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoadingChannels(true);
        const graph = await youtubeAPI.getChannelGraph();
        // Get all active (non-paused) language channels
        const activeChannels = graph.master_nodes
          .flatMap(master => master.language_channels)
          .filter(channel => !channel.is_paused && channel.status.status === "active");
        setAvailableLanguageChannels(activeChannels);
      } catch (error) {
        logger.error("VideoDetail", "Failed to load language channels", error);
      } finally {
        setIsLoadingChannels(false);
      }
    };
    loadChannels();
  }, []);

  useEffect(() => {
    if (!videosLoading && videos.length > 0) {
      const foundVideo = videos.find(v => v.video_id === params.video_id);
      setVideo(foundVideo);
      if (foundVideo) {
        setVideoTitle(foundVideo.title);
      }
    }
  }, [videos, videosLoading, params.video_id]);

  // Poll for the created job
  const { job: createdJob, isPolling: isPollingJob } = useJobPolling(createdJobId, {
    enabled: !!createdJobId,
    interval: 8000,
    onComplete: async (job) => {
      logger.info("VideoDetail", "Dubbing job completed", job);
      // Refresh videos and dashboard to show updated status
      await refetchVideos();
      await refetchDashboard();
      setCreatedJobId(null);
    },
    onFail: (job) => {
      logger.error("VideoDetail", "Dubbing job failed", job);
      setJobError(job.error_message || "Dubbing job failed");
    },
  });

  // Get active jobs for this video
  const videoJobs = dashboard?.recent_jobs?.filter(
    job => job.source_video_id === params.video_id && job.status !== "completed"
  ) || [];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleStartDubbing = () => {
    setShowDubbingModal(true);
  };

  const handleConfirmDubbing = async () => {
    if (!video || selectedLanguages.length === 0) return;

    setIsCreatingJob(true);
    setJobError(null);

    try {
      // Get the source channel ID from video or dashboard
      const sourceChannelId = video.channel_id || video.source_channel_id;

      if (!sourceChannelId) {
        // Try to find from dashboard connections
        const videoChannel = dashboard?.youtube_connections?.find(
          c => c.youtube_channel_id === video.channel_id
        );
        const fallbackChannelId = videoChannel?.youtube_channel_id;

        if (!fallbackChannelId) {
          throw new Error("No source channel found. Please ensure the video is from a connected YouTube channel.");
        }

        // Use fallback
        const job = await jobsAPI.createJob({
          source_video_id: video.video_id,
          source_channel_id: fallbackChannelId,
          target_languages: selectedLanguages,
        });

        logger.info("VideoDetail", "Dubbing job created", job);
        setCreatedJobId(job.job_id);
        setShowDubbingModal(false);
        setSelectedLanguages([]);
        await refetchDashboard();
        return;
      }

      // Create the dubbing job
      const job = await jobsAPI.createJob({
        source_video_id: video.video_id,
        source_channel_id: sourceChannelId,
        target_languages: selectedLanguages,
      });

      logger.info("VideoDetail", "Dubbing job created", job);

      // Start polling for this job
      setCreatedJobId(job.job_id);

      // Close modal and reset
      setShowDubbingModal(false);
      setSelectedLanguages([]);

      // Refresh dashboard to show new job
      await refetchDashboard();
    } catch (error: any) {
      // Extract error message from backend response
      let errorMessage = "Failed to create dubbing job";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific backend error messages
        if (errorMessage.includes("No active language channels found")) {
          const availableMatch = errorMessage.match(/Available: \[(.*?)\]/);
          if (availableMatch) {
            const available = availableMatch[1].replace(/['"]/g, '').split(', ');
            errorMessage = `Selected languages don't have active channels. Available languages: ${available.join(', ').toUpperCase()}`;
          } else {
            errorMessage = "No active language channels found for selected languages. Please connect language channels first.";
          }
        }
      }

      logger.error("VideoDetail", "Failed to create dubbing job", error);
      setJobError(errorMessage);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const toggleLanguageSelection = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getStateConfig = (state: LanguageState) => {
    switch (state) {
      case "empty":
        return { border: "border-dashed border-gray-300", bg: "bg-white", icon: <Plus className="h-5 w-5" /> };
      case "processing":
        return { border: "border-blue-500", bg: "bg-blue-50", icon: <Loader2 className="h-5 w-5 animate-spin" /> };
      case "review":
        return { border: "border-yellow-500", bg: "bg-yellow-50", icon: <Edit2 className="h-5 w-5" /> };
      case "published":
        return { border: "border-green-500", bg: "bg-green-50", icon: <Check className="h-5 w-5" /> };
    }
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dark-textSecondary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-normal text-gray-900 mb-2">Video Not Found</h1>
          <p className="text-dark-textSecondary mb-4">The video you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-4 py-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </button>
        </div>
      </div>
    );
  }

  const hasPublishedVersions = languageCards.some(l => l.state === "published");
  const processingJobs = languageCards.filter(l => l.state === "processing");
  const hasNoTranslations = languageCards.length === 0;

  return (
    <div className="h-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex-shrink-0 border-b border-dark-border px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.push("/")}
              className="text-dark-textSecondary hover:text-dark-text transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {isEditingTitle ? (
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                className="flex-1 text-lg font-normal text-dark-text border-b border-dark-border focus:border-white outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <h1
                className="text-lg sm:text-xl font-normal text-dark-text truncate cursor-pointer hover:text-dark-textSecondary transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {videoTitle}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-dark-textSecondary">
            <span className="hidden sm:inline">Source: <strong>YouTube (Main)</strong></span>
            <span>Duration: <strong>{formatDuration(video.duration)}</strong></span>
            {video.video_type === "original" && (
              <span className="px-2 py-1 bg-dark-card text-dark-text text-xs rounded-full">
                Original
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Job Progress Banner */}
      {(createdJob || isPollingJob || jobError) && (
        <div className={`flex-shrink-0 border-b border-dark-border px-4 sm:px-6 md:px-8 py-3 ${jobError ? "bg-red-900/20" : "bg-indigo-900/20"
          }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {isPollingJob && (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              )}
              {jobError && (
                <X className="h-4 w-4 text-red-400" />
              )}
              {createdJob && !jobError && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-normal text-dark-text">
                      Dubbing in progress: {createdJob.target_languages.map(lang => {
                        const langOption = LANGUAGE_OPTIONS.find(l => l.code === lang);
                        return langOption ? `${langOption.flag} ${langOption.name}` : lang;
                      }).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-dark-cardAlt rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${createdJob.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-dark-textSecondary min-w-[40px]">
                      {createdJob.progress || 0}%
                    </span>
                    <span className="text-xs text-dark-textSecondary capitalize">
                      {createdJob.status}
                    </span>
                  </div>
                </div>
              )}
              {jobError && (
                <div className="flex-1">
                  <span className="text-sm font-normal text-red-400">
                    Error: {jobError}
                  </span>
                </div>
              )}
            </div>
            {(jobError || (createdJob && (createdJob.status === "completed" || createdJob.status === "failed"))) && (
              <button
                onClick={() => {
                  setCreatedJobId(null);
                  setJobError(null);
                }}
                className="text-dark-textSecondary hover:text-dark-text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Player Section */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-dark-bg p-4 sm:p-6 md:p-8">
          {/* Video Player */}
          <div className="relative aspect-video bg-dark-bg rounded-xl overflow-hidden mb-6">
            {video.thumbnail_url && (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Player Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Top Controls - Audio Toggle */}
              {activeLanguage && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center bg-dark-bg/80 backdrop-blur-sm rounded-full p-1">
                    <button
                      onClick={() => setAudioMode("original")}
                      className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${audioMode === "original"
                        ? "bg-white text-gray-900"
                        : "text-dark-text hover:text-dark-textSecondary"
                        }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setAudioMode("dubbed")}
                      className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${audioMode === "dubbed"
                        ? "bg-white text-gray-900"
                        : "text-dark-text hover:text-dark-textSecondary"
                        }`}
                    >
                      Dubbed
                    </button>
                  </div>
                </div>
              )}

              {/* Center Play Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900" />
                  ) : (
                    <Play className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900 ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="text-dark-text hover:text-dark-textSecondary transition-colors">
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>
                <button className="text-dark-text hover:text-dark-textSecondary transition-colors">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Global Performance (State 4) */}
          {hasPublishedVersions && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-normal text-gray-900">Global Performance</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-dark-card rounded-lg">
                  <p className="text-2xl font-normal text-gray-900 mb-1">1.2M</p>
                  <p className="text-sm text-dark-textSecondary">Total Views</p>
                </div>
                <div className="text-center p-4 bg-dark-card rounded-lg">
                  <p className="text-2xl font-normal text-green-600 mb-1">+156%</p>
                  <p className="text-sm text-dark-textSecondary">vs Original</p>
                </div>
                <div className="text-center p-4 bg-dark-card rounded-lg">
                  <p className="text-2xl font-normal text-gray-900 mb-1">3</p>
                  <p className="text-sm text-dark-textSecondary">Languages Live</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-900">
                  💡 <strong>Insight:</strong> Your German dub is outperforming the Original by 15%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dubbing Matrix Sidebar */}
        <aside className="w-80 sm:w-96 border-l border-dark-border bg-dark-bg overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-normal text-dark-text">Dubbing Matrix</h3>
              {languageCards.length > 0 && (
                <span className="text-xs sm:text-sm text-dark-textSecondary">
                  {languageCards.filter(l => l.state === "published").length}/{languageCards.length}
                </span>
              )}
            </div>

            {/* State 1: Empty State */}
            {hasNoTranslations && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-dark-textSecondary mx-auto mb-4" />
                <p className="text-dark-textSecondary mb-6">No dubbed versions created yet</p>
                <button
                  onClick={handleStartDubbing}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-dark-text px-6 py-3 rounded-full font-normal hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Start New Dub
                </button>
              </div>
            )}

            {/* Language Cards */}
            <div className="space-y-3">
              {languageCards.map((card) => {
                const lang = LANGUAGE_OPTIONS.find(l => l.code === card.code);
                const config = getStateConfig(card.state);
                const isActive = activeLanguage === card.code;

                return (
                  <button
                    key={card.code}
                    onClick={() => {
                      if (card.state === "review" || card.state === "published") {
                        setActiveLanguage(card.code);
                        if (card.state === "review") {
                          setShowScriptEditor(true);
                        }
                      }
                    }}
                    className={`w-full text-left border-2 ${config.border} ${config.bg} rounded-xl p-4 transition-all hover:shadow-md ${isActive ? "ring-2 ring-indigo-500" : ""
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang?.flag}</span>
                        <span className="font-normal text-gray-900">{lang?.name}</span>
                      </div>
                      {config.icon}
                    </div>

                    {/* Processing State */}
                    {card.state === "processing" && (
                      <>
                        <div className="text-xs text-dark-textSecondary mb-2">
                          Phase 3/4: {card.phase}
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${card.progress}%` }}
                          />
                        </div>
                      </>
                    )}

                    {/* Review State */}
                    {card.state === "review" && (
                      <div className="mt-2">
                        <div className="text-xs text-yellow-700 mb-1">
                          🟡 Needs Review
                        </div>
                        <div className="text-xs text-dark-textSecondary">
                          Confidence: {card.confidenceScore}% Match
                        </div>
                      </div>
                    )}

                    {/* Published State */}
                    {card.state === "published" && card.url && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-green-700">
                          🟢 Published
                        </div>
                        <a
                          href={card.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {card.state === "published" && card.views && (
                      <div className="text-xs text-dark-textSecondary mt-1">
                        {formatViews(card.views)} views
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Add New Language Card */}
              {languageCards.length > 0 && (
                <button
                  onClick={handleStartDubbing}
                  className="w-full border-2 border-dashed border-gray-300 bg-white rounded-xl p-4 hover:border-gray-400 hover:bg-dark-card transition-all"
                >
                  <div className="flex items-center justify-center gap-2 text-dark-textSecondary">
                    <Plus className="h-5 w-5" />
                    <span className="font-normal">Add Language</span>
                  </div>
                </button>
              )}
            </div>

            {/* Processing Toast */}
            {processingJobs.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-gray-700">
                  💡 You can leave this page. We'll email you when drafts are ready.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Script Editor Panel (State 3) */}
      {showScriptEditor && activeLanguage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 z-50"
          style={{ height: "40vh" }}>
          <div className="h-full flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowScriptEditor(false)}
                  className="text-dark-textSecondary hover:text-gray-900"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <h3 className="text-base font-normal text-gray-900">Script Editor</h3>
                <span className="text-xs text-dark-textSecondary">
                  {LANGUAGE_OPTIONS.find(l => l.code === activeLanguage)?.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-dark-card rounded-full transition-colors">
                  <X className="h-4 w-4" />
                  Discard
                </button>
                <button className="inline-flex items-center gap-2 bg-green-600 text-dark-text px-4 py-2 rounded-full text-sm hover:bg-green-700 transition-colors">
                  <Check className="h-4 w-4" />
                  Approve & Push to Drafts
                </button>
              </div>
            </div>

            {/* Script Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="p-4 bg-dark-card rounded-lg hover:bg-dark-card transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-dark-textSecondary">00:00 - 00:05</span>
                    <button className="text-xs text-indigo-600 hover:text-indigo-700">
                      Regenerate
                    </button>
                  </div>
                  <p className="text-sm text-gray-900">
                    Hey everyone! Today I'm going to show you something amazing...
                  </p>
                </div>

                <div className="p-4 bg-dark-card rounded-lg hover:bg-dark-card transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-dark-textSecondary">00:05 - 00:12</span>
                    <button className="text-xs text-indigo-600 hover:text-indigo-700">
                      Regenerate
                    </button>
                  </div>
                  <p className="text-sm text-gray-900">
                    This technique will completely change how you think about video production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dubbing Config Modal */}
      {showDubbingModal && (
        <div className="fixed inset-0 bg-dark-bg/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-gray-900">Start New Dub</h2>
                  {video && (
                    <p className="text-sm text-dark-textSecondary mt-1 line-clamp-1">{video.title}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDubbingModal(false);
                    setSelectedLanguages([]);
                    setJobError(null);
                  }}
                  className="text-dark-textSecondary hover:text-dark-textSecondary"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Language Selection */}
              <div className="mb-6">
                <h3 className="text-base font-normal text-gray-900 mb-3">Select Languages</h3>
                {isLoadingChannels ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-dark-textSecondary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = selectedLanguages.includes(lang.code);
                        const alreadyExists = languageCards.some(l => l.code === lang.code);
                        const hasActiveChannel = availableLanguageChannels.some(
                          ch => ch.language_code === lang.code
                        );
                        const isAvailable = hasActiveChannel && !alreadyExists;

                        return (
                          <button
                            key={lang.code}
                            onClick={() => isAvailable && toggleLanguageSelection(lang.code)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-xl border-2 transition-all relative ${!isAvailable
                              ? "border-gray-200 bg-dark-card opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-gray-300"
                              }`}
                            title={
                              !hasActiveChannel
                                ? "No active language channel for this language"
                                : alreadyExists
                                  ? "Translation already exists"
                                  : undefined
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{lang.flag}</span>
                              <span className="text-sm text-gray-900">{lang.name}</span>
                            </div>
                            {!hasActiveChannel && (
                              <span className="absolute top-1 right-1 text-xs text-dark-textSecondary">
                                ⚠️
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {availableLanguageChannels.length === 0 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-900">
                          ⚠️ No active language channels found. Please connect language channels in Settings first.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-dark-card rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-normal text-gray-900">Voice Model</p>
                      <p className="text-xs text-dark-textSecondary">Clone My Voice (Recommended)</p>
                    </div>
                    <div className="w-12 h-6 bg-dark-card rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-dark-card rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-normal text-gray-900">Lip Sync</p>
                      <p className="text-xs text-dark-textSecondary">Match mouth movements</p>
                    </div>
                    <div className="w-12 h-6 bg-dark-card rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Check */}
              {selectedLanguages.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <p className="text-sm text-gray-900">
                    💳 This will cost approximately <strong>{selectedLanguages.length * 12} credits</strong>
                  </p>
                </div>
              )}

              {/* No Languages Selected Warning */}
              {selectedLanguages.length === 0 && !isLoadingChannels && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <p className="text-sm text-blue-900">
                    ℹ️ Please select at least one language to start dubbing
                  </p>
                </div>
              )}

              {/* Error Display */}
              {jobError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <p className="text-sm text-red-900">
                    ❌ {jobError}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDubbingModal(false);
                    setSelectedLanguages([]);
                    setJobError(null);
                  }}
                  className="flex-1 px-6 py-3 bg-dark-card text-gray-900 rounded-full font-normal hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDubbing}
                  disabled={selectedLanguages.length === 0 || isCreatingJob || isLoadingChannels}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-dark-text rounded-full font-normal hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={selectedLanguages.length === 0 ? "Please select at least one language" : undefined}
                >
                  {isCreatingJob ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Job...
                    </>
                  ) : isLoadingChannels ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Start Dubbing"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
