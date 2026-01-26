"use client";

export const runtime = 'edge';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Maximize,
  TrendingUp,
  Loader2,
  Plus,
  RefreshCw
} from "lucide-react";
import { useVideos } from "@/lib/useVideos";
import { useDashboard } from "@/lib/useDashboard";
import { useProject } from "@/lib/ProjectContext";
import { jobsAPI, youtubeAPI, videosAPI, type LanguageChannel } from "@/lib/api";
import { useJobPolling } from "@/lib/useJobPolling";
import { logger } from "@/lib/logger";
import { LANGUAGE_OPTIONS } from "@/lib/languages";

// Smart Components
import { SatelliteRow } from "@/components/SmartTable/SatelliteRow";
import { QuickCheckModal } from "@/components/SmartTable/QuickCheckModal";
import { JobTerminalPanel } from "@/components/JobTerminalPanel";
import { ManualProcessModal } from "@/components/ui/manual-process-modal";
import { useToast } from "@/components/ui/use-toast";

export default function VideoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedProject } = useProject();
  const { refetch: refetchVideos } = useVideos();
  const { dashboard, refetch: refetchDashboard } = useDashboard();
  const { toast } = useToast();

  const [video, setVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDubbingModal, setShowDubbingModal] = useState(false);

  // Player State
  const [audioMode, setAudioMode] = useState<"original" | "dubbed">("original");

  // Terminal & Preview State
  const [terminalState, setTerminalState] = useState<{
    isOpen: boolean;
    jobId: string | null;
    videoTitle?: string;
    language?: string;
  }>({ isOpen: false, jobId: null });

  const [quickCheckState, setQuickCheckState] = useState<{
    isOpen: boolean;
    videoId?: string;
    languageCode?: string;
  }>({ isOpen: false });

  // Creation State
  const [activeTab, setActiveTab] = useState<"original" | "dubbed">("original");
  const [availableLanguageChannels, setAvailableLanguageChannels] = useState<LanguageChannel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | undefined>(undefined);

  // Load available language channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoadingChannels(true);
        if (!selectedProject) return;

        const graph = await youtubeAPI.getChannelGraph(selectedProject.id);
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
    if (selectedProject) {
      loadChannels();
    }
  }, [selectedProject]);

  // Fetch video details
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoadingVideo(true);
        const videoId = Array.isArray(params.video_id) ? params.video_id[0] : params.video_id;
        if (!videoId) return;

        const fetchedVideo = await videosAPI.getVideoById(videoId);
        setVideo(fetchedVideo);
      } catch (error) {
        logger.error("VideoDetail", "Failed to fetch video details", error);
      } finally {
        setLoadingVideo(false);
      }
    };
    fetchVideoDetails();
  }, [params.video_id]);

  // Poll for created job
  useJobPolling(createdJobId, {
    enabled: !!createdJobId,
    onComplete: async (job) => {
      logger.info("VideoDetail", "Dubbing job completed", job);
      await refetchVideos();
      await refetchDashboard();
      setCreatedJobId(null);
      toast("Job completed successfully!", "success");
    },
    onFail: (job) => {
      logger.error("VideoDetail", "Dubbing job failed", job);
      toast("Dubbing job failed", "error");
    },
  });

  // Calculate Language Rows
  const languageRows = useMemo(() => {
    if (!video || !dashboard) return [];

    // Merge recent jobs into status
    const activeJobs = dashboard.recent_jobs?.filter(
      job => job.source_video_id === video.video_id && job.status !== "completed" && job.status !== "failed"
    ) || [];

    return LANGUAGE_OPTIONS.map(lang => {
      // Check for active job
      const activeJob = activeJobs.find(j => j.target_languages.includes(lang.code));

      // Check for completed video (mock logic based on previous implementation or real data structure)
      // In a real scenario, video.localizations or similar would hold this.
      // For now, we'll assume if it's in video.translated_languages, it is done.
      const isTranslated = video.translated_languages?.includes(lang.code);

      let status: "live" | "draft" | "processing" | "not-started" | "failed" = "not-started";
      let videoId = undefined;

      if (activeJob) {
        status = "processing";
        videoId = activeJob.job_id; // Use job ID for processing
      } else if (isTranslated) {
        status = "live";
        videoId = `${video.video_id}-${lang.code}`; // Dummy ID or real one if avail
      }

      return {
        code: lang.code,
        name: lang.name,
        flag: lang.flag,
        status,
        videoId,
        jobId: activeJob?.job_id
      };
    });
  }, [video, dashboard]);

  // Handlers
  const handlePreview = (langCode: string, videoId?: string) => {
    setQuickCheckState({ isOpen: true, videoId, languageCode: langCode });
  };

  const handlePublish = async (langCode: string, videoId?: string) => {
    if (!videoId) return;
    setProcessingId(videoId);

    // Simulate Publish
    setTimeout(() => {
      setProcessingId(undefined);
      toast(`Published ${langCode.toUpperCase()} version!`, "success");
    }, 1500);
  };

  const handleManualSuccess = () => {
    refetchDashboard();
    refetchVideos();
  };

  const handleViewDetails = (jobId: string, videoTitle: string, language: string) => {
    setTerminalState({
      isOpen: true,
      jobId,
      videoTitle,
      language
    });
  };

  if (loadingVideo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 px-6 py-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-medium truncate">{video.title}</h1>
          <div className="flex items-center gap-3 ml-auto text-sm text-gray-400">
            <span className="px-2 py-1 bg-white/5 rounded text-xs border border-white/10">Original</span>
            <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto p-8">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Left Column: Player & Stats */}
            <div className="space-y-6">
              <div className="aspect-video bg-black/50 rounded-xl border border-white/10 overflow-hidden relative group">
                {video.thumbnail_url && (
                  <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all transform hover:scale-105">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Total Views</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{video.view_count?.toLocaleString() || "0"}</span>
                    <span className="text-green-400 text-xs flex items-center mb-1"><TrendingUp className="w-3 h-3 mr-1" /> 12%</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Languages Live</p>
                  <span className="text-2xl font-bold">
                    {languageRows.filter(l => l.status === "live").length}
                    <span className="text-gray-500 font-normal text-base ml-1">/ {languageRows.length}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Deployment Matrix */}
            <div className="flex flex-col h-full min-h-[500px] bg-[#111] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold">Deployment Status</h2>
                <button
                  onClick={() => setShowDubbingModal(true)}
                  className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Dub
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {languageRows.map(row => (
                    <SatelliteRow
                      key={row.code}
                      languageCode={row.code}
                      languageName={row.name}
                      flag={row.flag}
                      localization={{
                        status: row.status,
                        video_id: row.videoId,
                        title: row.status === "live" ? `${video.title} [${row.code.toUpperCase()}]` : "",
                        originalTitle: video.title
                      }}
                      isSelected={false}
                      onToggleSelect={() => { }}
                      onPreview={handlePreview}
                      onPublish={handlePublish}
                      onUpdateTitle={() => { }}
                      isProcessingAction={processingId === row.videoId}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ManualProcessModal
        isOpen={showDubbingModal}
        onClose={() => setShowDubbingModal(false)}
        availableChannels={availableLanguageChannels.map(c => ({
          id: c.channel_id,
          name: c.channel_name,
          language_code: c.language_code,
          language_name: c.language_name
        }))}
        projectId={selectedProject?.id}
        onSuccess={handleManualSuccess}
      />

      <QuickCheckModal
        isOpen={quickCheckState.isOpen}
        onClose={() => setQuickCheckState({ ...quickCheckState, isOpen: false })}
        languageName={LANGUAGE_OPTIONS.find(l => l.code === quickCheckState.languageCode)?.name || "Target Language"}
        originalVideoUrl={video.thumbnail_url}
        dubbedVideoUrl={video.thumbnail_url}
        onApprove={async () => {
          if (quickCheckState.videoId) {
            try {
              await jobsAPI.approveJob(quickCheckState.videoId);
              toast("Approved! Publishing to channel...", "success");
              refetchDashboard();
            } catch (err) {
              toast("Failed to approve job", "error");
            }
          }
          setQuickCheckState({ ...quickCheckState, isOpen: false });
        }}
        onFlag={(reason) => {
          setQuickCheckState({ ...quickCheckState, isOpen: false });
          toast("Flagged for regeneration.", "info");
        }}
      />

      <JobTerminalPanel
        isOpen={terminalState.isOpen}
        onClose={() => setTerminalState(prev => ({ ...prev, isOpen: false }))}
        jobId={terminalState.jobId || ""}
        videoTitle={video.title}
        language={terminalState.language}
      />
    </div>
  );
}
