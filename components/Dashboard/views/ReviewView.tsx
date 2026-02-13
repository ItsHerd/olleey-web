"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Play, Pause, AlertCircle, CheckCircle, Volume2, SkipBack, SkipForward,
    Sparkles, Wand2, RefreshCw, Eye, Edit3, Type, Save, Activity, Zap,
    ShieldCheck, Youtube, Settings, Baby, Shield, ThumbsUp,
    Rss, ImageIcon, Languages, Loader2, Layout, Maximize2,
    ChevronLeft, MoreVertical, ExternalLink
} from "lucide-react";
import { AudioPreviewPlayer } from "../components/AudioPreviewPlayer";
import { EditableTranscript } from "../components/EditableTranscript";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { jobsAPI, videosAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { LocalizationStatus, JobStatus } from "@/lib/schema";
import { YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION, isDemoUser, saveToDrafts } from "@/lib/mockDemoData";
import { useAuth } from "@/lib/AuthContext";
import { ViewType } from "../DashboardLayout";

// Demo AI-generated thumbnail URL
const DEMO_THUMBNAIL = "https://tii.imgix.net/production/articles/7643/03e02ef7-f12e-4faf-8551-37d5c5785586-UQ6LXV.jpg?auto=compress&fit=crop&auto=format";

interface ReviewViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
    selectedJob?: any; // Job data passed from dashboard
}

export function ReviewView({ onViewChange, theme, selectedJob }: ReviewViewProps) {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const userId = user?.id;

    // Get params from URL or selected job (when navigating from dashboard)
    const videoIdFromUrl = selectedJob?.source_video_id || searchParams.get("video_id");
    const langFromUrl = selectedJob?.target_languages?.[0] || searchParams.get("lang");
    const jobIdFromUrl = selectedJob?.job_id || searchParams.get("job_id");

    const {
        quickCheckState,
        openReview
    } = useReview();

    const { selectedProject } = useProject();
    const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id, user_id: userId });

    // Synchronize state with backend when video_id or lang changes in URL
    useEffect(() => {
        if (!videoIdFromUrl || videosLoading) return;

        const isCurrentVideo = quickCheckState.videoId === videoIdFromUrl &&
            quickCheckState.languageCode === (langFromUrl || quickCheckState.languageCode);

        if (!isCurrentVideo || !quickCheckState.originalVideoUrl) {
            let video = videos.find(v => v.video_id === videoIdFromUrl);

            if (videoIdFromUrl === "demo_yc_ceo_video_001" && isDemoUser(userId)) {
                const langCode = langFromUrl || "es";
                openReview({
                    videoId: videoIdFromUrl,
                    languageCode: langCode,
                    originalVideoUrl: YC_CEO_DEMO_VIDEO.storage_url,
                    dubbedVideoUrl: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url,
                    videoTitle: YC_CEO_DEMO_VIDEO.title,
                    videoDescription: YC_CEO_DEMO_VIDEO.description,
                    thumbnailUrl: YC_CEO_DEMO_VIDEO.thumbnail_url,
                    localizedTitle: YC_CEO_SPANISH_TRANSLATION.title,
                    localizedDescription: YC_CEO_SPANISH_TRANSLATION.description,
                    isApproved: false,
                    approvedAt: YC_CEO_DEMO_VIDEO.published_at,
                    navigate: false // Stay within dashboard
                });
                return;
            }

            (async () => {
                try {
                    let targetVideo = video;
                    if (!targetVideo && videoIdFromUrl) {
                        const videoData = await videosAPI.getVideoById(videoIdFromUrl);
                        targetVideo = videoData;
                    }

                    if (targetVideo) {
                        const langCode = langFromUrl || Object.keys(targetVideo.localizations || {})[0] || "es";
                        openReview({
                            videoId: videoIdFromUrl,
                            languageCode: langCode,
                            originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
                            dubbedVideoUrl: targetVideo.localizations?.[langCode]?.video_url || "",
                            videoTitle: targetVideo.title,
                            videoDescription: targetVideo.description || "",
                            thumbnailUrl: targetVideo.thumbnail_url,
                            localizedTitle: targetVideo.localizations?.[langCode]?.title || "",
                            localizedDescription: targetVideo.localizations?.[langCode]?.description || "",
                            isApproved: false,
                            approvedAt: targetVideo.published_at,
                            navigate: false // Stay within dashboard
                        });
                    }
                } catch (error) {
                    console.error("Failed to sync video details:", error);
                }
            })();
        }
    }, [videoIdFromUrl, langFromUrl, videos, videosLoading, openReview, selectedJob]);


    const {
        originalVideoUrl,
        dubbedVideoUrl,
        languageCode,
        videoTitle,
        videoDescription,
        localizedTitle: baseLocalizedTitle,
        localizedDescription: baseLocalizedDescription,
        isApproved,
    } = quickCheckState;

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    // Refs
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedFocus, setSelectedFocus] = useState<"source" | "prod">("prod");

    // Feature-specific state
    const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "toggle">("side-by-side");
    const [isSynchronized, setIsSynchronized] = useState(true);
    const [videoQuality, setVideoQuality] = useState<"720p" | "1080p">("1080p");
    const [lipSyncAccuracy, setLipSyncAccuracy] = useState(94); // Mocked percentage
    const [sidebarTab, setSidebarTab] = useState<"quality" | "transcript" | "metadata">("quality");
    const [transcriptLayout, setTranscriptLayout] = useState<"sidebar" | "bottom">("sidebar");
    const [transcript, setTranscript] = useState<any>(null);
    const [translation, setTranslation] = useState<any>(null);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [transcriptError, setTranscriptError] = useState<string | null>(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(true);
    const [dubbedAudioUrl, setDubbedAudioUrl] = useState<string | null>(null);

    // Metadata state
    const [localizedTitle, setLocalizedTitle] = useState("");
    const [localizedDescription, setLocalizedDescription] = useState("");
    const [localizedTags, setLocalizedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [metadataSaving, setMetadataSaving] = useState(false);

    // Load metadata from quickCheckState
    useEffect(() => {
        if (quickCheckState.localizedTitle) {
            setLocalizedTitle(quickCheckState.localizedTitle);
        }
        if (quickCheckState.localizedDescription) {
            setLocalizedDescription(quickCheckState.localizedDescription);
        }
        // Tags would come from metadata if available
    }, [quickCheckState]);

    // UI Helpers
    const isDark = theme === "dark";

    // Playback Handlers
    const togglePlay = () => {
        const videosToUpdate = [];
        if (originalVideoRef.current) videosToUpdate.push(originalVideoRef.current);
        if (dubbedVideoRef.current) videosToUpdate.push(dubbedVideoRef.current);

        if (isPlaying) {
            videosToUpdate.forEach(v => v.pause());
        } else {
            videosToUpdate.forEach(v => v.play());
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (isSynchronized) {
            if (originalVideoRef.current) originalVideoRef.current.currentTime = time;
            if (dubbedVideoRef.current) dubbedVideoRef.current.currentTime = time;
        } else {
            if (selectedFocus === "source" && originalVideoRef.current) originalVideoRef.current.currentTime = time;
            if (selectedFocus === "prod" && dubbedVideoRef.current) dubbedVideoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    };

    const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (selectedFocus === "source" && video === originalVideoRef.current) setCurrentTime(video.currentTime);
        if (selectedFocus === "prod" && video === dubbedVideoRef.current) setCurrentTime(video.currentTime);

        if (isSynchronized) {
            const otherVideo = video === originalVideoRef.current ? dubbedVideoRef.current : originalVideoRef.current;
            if (otherVideo && Math.abs(video.currentTime - otherVideo.currentTime) > 0.05) {
                otherVideo.currentTime = video.currentTime;
            }
        }
    };

    const changeSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        if (originalVideoRef.current) originalVideoRef.current.playbackRate = speed;
        if (dubbedVideoRef.current) dubbedVideoRef.current.playbackRate = speed;
    };

    const frameForward = () => {
        const fps = 30; // Assuming 30fps
        const frameTime = 1 / fps;
        if (originalVideoRef.current) originalVideoRef.current.currentTime += frameTime;
        if (dubbedVideoRef.current) dubbedVideoRef.current.currentTime += frameTime;
        setCurrentTime(prev => prev + frameTime);
    };

    const frameBackward = () => {
        const fps = 30;
        const frameTime = 1 / fps;
        if (originalVideoRef.current) originalVideoRef.current.currentTime -= frameTime;
        if (dubbedVideoRef.current) dubbedVideoRef.current.currentTime -= frameTime;
        setCurrentTime(prev => Math.max(0, prev - frameTime));
    };


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        const container = document.getElementById('review-video-container');
        if (container) {
            if (!document.fullscreenElement) {
                container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    const handleSaveMetadata = async () => {
        const jobId = jobIdFromUrl || (quickCheckState as any)?.jobId;
        const lang = languageCode || langFromUrl || "es";
        if (!jobId) return;

        setMetadataSaving(true);
        try {
            await jobsAPI.updateLocalizedVideo(jobId, lang, {
                title: localizedTitle,
                description: localizedDescription
            });
            toast("Metadata saved successfully", "success");
        } catch (err: any) {
            toast(err.message || "Failed to save metadata", "error");
        } finally {
            setMetadataSaving(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !localizedTags.includes(tagInput.trim())) {
            setLocalizedTags([...localizedTags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setLocalizedTags(localizedTags.filter(tag => tag !== tagToRemove));
    };

    // Load Transcript Data...
    useEffect(() => {
        const jobId = jobIdFromUrl || (quickCheckState as any)?.jobId;
        if (!jobId) return;

        (async () => {
            setTranscriptLoading(true);
            try {
                const [transcriptData, translationData, jobVideos] = await Promise.all([
                    jobsAPI.getJobTranscript(jobId),
                    jobsAPI.getJobTranslation(jobId, languageCode || langFromUrl || "es"),
                    jobsAPI.getJobVideos(jobId)
                ]);
                setTranscript(transcriptData);
                setTranslation(translationData);
                const currentLangVideo = jobVideos.find((v: any) => v.language_code === (languageCode || langFromUrl || "es")) as any;
                if (currentLangVideo?.dubbed_audio_url) setDubbedAudioUrl(currentLangVideo.dubbed_audio_url);
            } catch (err: any) {
                console.error("Failed to fetch data:", err);
                setTranscriptError(err.message || "Failed to load data");
            } finally {
                setTranscriptLoading(false);
            }
        })();
    }, [jobIdFromUrl, quickCheckState, languageCode, langFromUrl]);

    if (!videoIdFromUrl && !quickCheckState.videoId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 border">
                    <RefreshCw className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No review session active</h2>
                <Button onClick={() => onViewChange?.("dashboard")} variant="outline" size="sm">Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">
            {/* Shadcn Header */}
            <header className="flex h-14 items-center justify-between border-b px-6 bg-card shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewChange?.("dashboard")}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate max-w-[300px]">{videoTitle || "Untitled Video"}</span>
                        <Badge variant="secondary" className="text-[10px] font-medium h-5 px-2 uppercase tracking-tight">
                            {languageName}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="mr-2 flex items-center bg-muted rounded-md p-0.5 border">
                        <Button
                            variant={comparisonMode === "side-by-side" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setComparisonMode("side-by-side")}
                            className="h-7 px-2.5 text-[11px] font-medium"
                        >
                            <Layout className="h-3.5 w-3.5 mr-1.5" /> Stacked
                        </Button>
                        <Button
                            variant={comparisonMode === "toggle" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setComparisonMode("toggle")}
                            className="h-7 px-2.5 text-[11px] font-medium"
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Toggle
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-4 mx-1" />

                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => onViewChange?.("preview")}
                        className="text-[11px] font-bold h-8 px-4"
                    >
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 flex flex-col bg-muted/30 overflow-hidden relative">
                    <div id="review-video-container" className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        {/* Video Player Display */}
                        <Card className="w-full max-w-6xl mx-auto overflow-hidden border shadow-sm bg-black group relative">
                            <div className={cn(
                                "flex flex-col",
                                comparisonMode === "side-by-side" ? "gap-px bg-border" : ""
                            )}>
                                {/* Source Player (Top) */}
                                <div className={cn(
                                    "relative aspect-video bg-black",
                                    comparisonMode === "toggle" && selectedFocus !== "source" && "hidden"
                                )}>
                                    <Badge className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-[10px] font-bold border-none">
                                        ORIGINAL
                                    </Badge>
                                    <video
                                        ref={originalVideoRef}
                                        src={originalVideoUrl}
                                        className="w-full h-full"
                                        muted={originalMuted}
                                        onTimeUpdate={handleVideoTimeUpdate}
                                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                    />
                                </div>

                                {/* Dubbed Player (Bottom) */}
                                <div className={cn(
                                    "relative aspect-video bg-black",
                                    comparisonMode === "toggle" && selectedFocus !== "prod" && "hidden"
                                )}>
                                    <Badge className="absolute top-4 left-4 z-10 bg-primary text-[10px] font-bold border-none">
                                        LOCALIZED
                                    </Badge>
                                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-2 py-1 rounded-md border border-white/10">
                                            <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${lipSyncAccuracy}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-500">{lipSyncAccuracy}%</span>
                                        </div>
                                    </div>
                                    <video
                                        ref={dubbedVideoRef}
                                        src={dubbedVideoUrl}
                                        className="w-full h-full"
                                        muted={dubbedMuted}
                                        onTimeUpdate={handleVideoTimeUpdate}
                                    />
                                    {!dubbedVideoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                            <div className="text-center">
                                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                                                <p className="text-[11px] font-medium text-white/60">Processing Neural Synthesis...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Playback Controls Layer */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: !isPlaying ? 1 : 0 }}
                                    className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto hover:bg-black/60 transition-all"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? <Pause className="h-6 w-6 text-white fill-current" /> : <Play className="h-6 w-6 text-white fill-current translate-x-0.5" />}
                                </motion.button>
                            </div>

                            {/* Bottom Controls Bar */}
                            <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                {/* Seek Bar */}
                                <div className="flex flex-col gap-1 relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 100}
                                        step="0.001"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[10px] font-medium text-white/50 font-mono mt-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={frameBackward} className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                                <SkipBack className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 text-white hover:bg-white/10">
                                                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={frameForward} className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                                <SkipForward className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2 px-3 h-8 bg-white/10 rounded-md">
                                            <Volume2 className="h-3.5 w-3.5 text-white/40" />
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={volume}
                                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-white"
                                            />
                                        </div>

                                        <select
                                            value={playbackSpeed}
                                            onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                                            className="bg-white/10 text-[10px] font-bold text-white h-8 px-2 rounded-md border-none focus:ring-0"
                                        >
                                            <option value="0.25">0.25x</option>
                                            <option value="0.5">0.5x</option>
                                            <option value="1">1.0x</option>
                                            <option value="1.5">1.5x</option>
                                            <option value="2">2.0x</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {comparisonMode === "toggle" && (
                                            <div className="flex items-center bg-white/10 rounded-md p-0.5">
                                                <Button
                                                    size="sm"
                                                    variant={selectedFocus === "source" ? "secondary" : "ghost"}
                                                    className="h-7 px-3 text-[10px] font-bold rounded"
                                                    onClick={() => { setSelectedFocus("source"); setOriginalMuted(false); setDubbedMuted(true); }}
                                                >
                                                    SOURCE
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={selectedFocus === "prod" ? "secondary" : "ghost"}
                                                    className="h-7 px-3 text-[10px] font-bold rounded"
                                                    onClick={() => { setSelectedFocus("prod"); setOriginalMuted(true); setDubbedMuted(false); }}
                                                >
                                                    DUBBED
                                                </Button>
                                            </div>
                                        )}

                                        <select
                                            value={videoQuality}
                                            onChange={(e) => setVideoQuality(e.target.value as any)}
                                            className="bg-white/10 text-[10px] font-bold text-white h-8 px-2 rounded-md border-none focus:ring-0"
                                        >
                                            <option value="1080p">1080p</option>
                                            <option value="720p">720p</option>
                                        </select>

                                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Action Bar */}
                        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-4 bg-card px-4 py-1.5 rounded-lg border shadow-sm">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">Sync Playback</span>
                                <Switch
                                    checked={isSynchronized}
                                    onCheckedChange={setIsSynchronized}
                                    className="h-5 w-9 data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>

                        {/* Audio Preview Hub */}
                        {showAudioPlayer && dubbedAudioUrl && (
                            <div className="w-full max-w-6xl mx-auto mt-4">
                                <AudioPreviewPlayer
                                    audioUrl={dubbedAudioUrl}
                                    title="Reference Localization Audio Feed"
                                    languageCode={languageCode || langFromUrl || "es"}
                                    theme={theme}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* Shadcn Sidebar */}
                <aside className="w-[400px] border-l bg-card flex flex-col shrink-0">
                    <div className="flex border-b p-1">
                        {[
                            { id: 'quality', label: 'Quality Audit' },
                            { id: 'transcript', label: 'Transcript' },
                            { id: 'metadata', label: 'Metadata' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSidebarTab(tab.id as any)}
                                className={cn(
                                    "flex-1 py-2 text-[11px] font-semibold uppercase tracking-tight transition-all rounded-md",
                                    sidebarTab === tab.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {sidebarTab === "quality" && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Analysis Metrics</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Neural Lip Alignment', score: 94, status: 'Nominal', color: 'emerald' },
                                            { label: 'Spectral Audio Clarity', score: 98, status: 'Nominal', color: 'emerald' },
                                            { label: 'Linguistic Tone match', score: 82, status: 'Review Needed', color: 'amber' },
                                        ].map(item => (
                                            <div key={item.label} className="p-3 rounded-lg border bg-muted/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[11px] font-medium">{item.label}</span>
                                                    <span className={cn("text-[11px] font-bold", item.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500')}>{item.score}%</span>
                                                </div>
                                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className={cn("h-full", item.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${item.score}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Reference Thumbnail</h4>
                                    <Card className="overflow-hidden border shadow-sm">
                                        <img src={quickCheckState.thumbnailUrl || DEMO_THUMBNAIL} className="w-full aspect-video object-cover" alt="Review" />
                                    </Card>
                                </div>
                            </div>
                        )}

                        {sidebarTab === "transcript" && (
                            <div className="space-y-6">
                                {transcriptLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-[11px] font-medium text-muted-foreground">Loading Transcript...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {transcript && (
                                            <EditableTranscript
                                                title={`ORIGINAL (${transcript.source_language?.toUpperCase()})`}
                                                text={transcript.transcript_text || ""}
                                                onSave={async (text) => {
                                                    if (!jobIdFromUrl) return;
                                                    await jobsAPI.updateTranscript(jobIdFromUrl, { transcript_text: text });
                                                    setTranscript({ ...transcript, transcript_text: text });
                                                }}
                                                theme={theme}
                                            />
                                        )}
                                        {translation && (
                                            <EditableTranscript
                                                title={`LOCALIZED (${languageCode?.toUpperCase()})`}
                                                text={translation.translated_text || ""}
                                                onSave={async (text) => {
                                                    if (!languageCode || !jobIdFromUrl) return;
                                                    await jobsAPI.updateTranslation(jobIdFromUrl, languageCode, { translated_text: text });
                                                    setTranslation({ ...translation, translated_text: text });
                                                }}
                                                theme={theme}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {sidebarTab === "metadata" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Localized Content</h4>

                                    {/* Title Input */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-medium">Title</label>
                                            <span className={cn(
                                                "text-[10px] font-mono font-bold",
                                                localizedTitle.length > 100 ? "text-red-500" : "text-muted-foreground"
                                            )}>
                                                {localizedTitle.length}/100
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={localizedTitle}
                                            onChange={(e) => setLocalizedTitle(e.target.value)}
                                            placeholder="Enter localized title..."
                                            maxLength={100}
                                            className="w-full bg-muted/50 border rounded-md p-2.5 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        {localizedTitle.length > 100 && (
                                            <p className="text-[10px] text-red-500">Title exceeds YouTube's 100 character limit</p>
                                        )}
                                    </div>

                                    {/* Description Input */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-medium">Description</label>
                                            <span className={cn(
                                                "text-[10px] font-mono font-bold",
                                                localizedDescription.length > 5000 ? "text-red-500" : "text-muted-foreground"
                                            )}>
                                                {localizedDescription.length}/5000
                                            </span>
                                        </div>
                                        <textarea
                                            value={localizedDescription}
                                            onChange={(e) => setLocalizedDescription(e.target.value)}
                                            placeholder="Enter localized description..."
                                            maxLength={5000}
                                            rows={8}
                                            className="w-full bg-muted/50 border rounded-md p-2.5 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        />
                                        {localizedDescription.length > 5000 && (
                                            <p className="text-[10px] text-red-500">Description exceeds YouTube's 5000 character limit</p>
                                        )}
                                    </div>

                                    {/* Tags Input */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium">Tags</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                                placeholder="Add tag..."
                                                className="flex-1 bg-muted/50 border rounded-md px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            <Button
                                                onClick={handleAddTag}
                                                size="sm"
                                                variant="outline"
                                                className="h-9 px-3 text-[11px] font-bold"
                                            >
                                                Add
                                            </Button>
                                        </div>

                                        {/* Tag Chips */}
                                        {localizedTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {localizedTags.map((tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="text-[10px] font-medium px-2 py-1 flex items-center gap-1.5"
                                                    >
                                                        {tag}
                                                        <button
                                                            onClick={() => handleRemoveTag(tag)}
                                                            className="hover:text-destructive transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Thumbnail Preview */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thumbnail</h4>
                                    <Card className="overflow-hidden border shadow-sm">
                                        <img
                                            src={quickCheckState.thumbnailUrl || DEMO_THUMBNAIL}
                                            className="w-full aspect-video object-cover"
                                            alt="Thumbnail preview"
                                        />
                                    </Card>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-[11px] font-medium"
                                        onClick={() => toast("Custom thumbnail upload coming soon", "info")}
                                    >
                                        <ImageIcon className="h-3.5 w-3.5 mr-2" />
                                        Upload Custom Thumbnail
                                    </Button>
                                </div>

                                {/* Save Button */}
                                <Button
                                    onClick={handleSaveMetadata}
                                    disabled={metadataSaving}
                                    className="w-full text-[11px] font-bold"
                                    size="sm"
                                >
                                    {metadataSaving ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5 mr-2" />
                                            Save Metadata
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                </aside>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}
