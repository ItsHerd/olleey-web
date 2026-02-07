"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Sparkles, User, RotateCcw, Languages, Image as ImageIcon, Check, Upload, Wand2, RefreshCw, Eye, Edit3, Type, Save, ChevronLeft, Terminal, Activity, Monitor, ShieldCheck, Zap, Info } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS, getFakeLocalizedText } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReviewHubPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoIdFromUrl = searchParams.get("video_id");
    const langFromUrl = searchParams.get("lang");

    const {
        quickCheckState,
        handleApprove: baseHandleApprove,
        handleFlag,
        openReview
    } = useReview();

    const { selectedProject } = useProject();
    const { videos, loading: videosLoading } = useVideos({ project_id: selectedProject?.id });

    // Try to recover state from URL if quickCheckState is empty (e.g. direct link)
    useEffect(() => {
        if (videoIdFromUrl && !quickCheckState.videoId && !videosLoading) {
            const video = videos.find(v => v.video_id === videoIdFromUrl);
            if (video) {
                const langCode = langFromUrl || Object.keys(video.localizations || {})[0] || "es";
                const loc = video.localizations?.[langCode];
                const fakeText = getFakeLocalizedText(langCode);

                openReview({
                    videoId: video.video_id,
                    languageCode: langCode,
                    originalVideoUrl: (video as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    dubbedVideoUrl: loc?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    videoTitle: video.title,
                    videoDescription: video.description,
                    isApproved: loc?.status === "live",
                    approvedAt: video.published_at || (video as any).created_at
                });
            }
        }
    }, [videoIdFromUrl, langFromUrl, quickCheckState.videoId, videos, videosLoading, openReview]);

    const {
        originalVideoUrl,
        dubbedVideoUrl,
        languageCode,
        videoTitle,
        videoDescription,
        isApproved,
        approvedAt
    } = quickCheckState;

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    // Refs for video syncing
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [flagReason, setFlagReason] = useState("");
    const [flagCategory, setFlagCategory] = useState("general");
    const [showFlagInput, setShowFlagInput] = useState(false);
    const [volume, setVolume] = useState(1);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [checklist, setChecklist] = useState({
        lipSync: isApproved,
        translation: isApproved,
        tone: isApproved,
        audioQuality: isApproved
    });
    const [targetLanguage, setTargetLanguage] = useState(languageCode === "es" ? "ES" : "EN");
    const [thumbnailStrategy, setThumbnailStrategy] = useState<"original" | "converted" | "upload" | "generate">("original");
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState(videoTitle || "");
    const [editedDescription, setEditedDescription] = useState(videoDescription || "No description provided.");
    const [isGeneratingInfo, setIsGeneratingInfo] = useState(false);
    const [showInfoPreview, setShowInfoPreview] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [reprocessingItems, setReprocessingItems] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit');
    const [isAiVerifying, setIsAiVerifying] = useState(false);
    const [verifyingItems, setVerifyingItems] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (videoTitle) setEditedTitle(videoTitle);
        if (videoDescription) setEditedDescription(videoDescription);
    }, [videoTitle, videoDescription]);

    const handleRedo = (key: string) => {
        setReprocessingItems(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setReprocessingItems(prev => ({ ...prev, [key]: false }));
            setChecklist(prev => ({ ...prev, [key]: true }));
        }, 3000);
    };

    const handleGenerateThumbnail = () => {
        setThumbnailStrategy("generate");
        setIsGeneratingThumbnail(true);
        setShowThumbnailPreview(false);
        setTimeout(() => {
            setIsGeneratingThumbnail(false);
            setShowThumbnailPreview(true);
        }, 3500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomThumbnail(url);
            setThumbnailStrategy("upload");
            setShowThumbnailPreview(true);
        }
    };

    const handleGenerateInfo = () => {
        setIsGeneratingInfo(true);
        setShowInfoPreview(false);
        setTimeout(() => {
            setIsGeneratingInfo(false);
            setTempTitle(`${videoTitle || "Untitled"} [${targetLanguage === "ES" ? "SPAIN" : "EN"}_LOCALIZED]`);
            setTempDescription(`${videoDescription || "No original description."} \n\nLocalized for global distribution via Olleey AI.`);
            setShowInfoPreview(true);
        }, 2500);
    };

    const handleManualEdit = () => {
        setTempTitle(editedTitle);
        setTempDescription(editedDescription);
        setShowInfoPreview(true);
    };

    const handleApprove = () => {
        // No longer calls baseHandleApprove (publishing) here
        // Just move to the final preview stage
        router.push('/app?page=Preview', { scroll: false });
    };

    const handleCommit = () => {
        // Typically would call an API here to save metadata updates
        router.push('/app?page=Preview', { scroll: false });
    };

    const handleAiVerify = async () => {
        setIsAiVerifying(true);
        const items = Object.keys(checklist);

        for (const item of items) {
            setVerifyingItems(prev => ({ ...prev, [item]: true }));
            await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
            setChecklist(prev => ({ ...prev, [item]: true }));
            setVerifyingItems(prev => ({ ...prev, [item]: false }));
        }

        setIsAiVerifying(false);
    };

    const cardClass = theme === "light" ? "bg-white" : "bg-[#0a0a0a]";
    const textClass = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondaryClass = theme === "light" ? "text-gray-500" : "text-gray-400";

    const togglePlay = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            if (isPlaying) {
                originalVideoRef.current.pause();
                dubbedVideoRef.current.pause();
            } else {
                originalVideoRef.current.play();
                dubbedVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (originalVideoRef.current && dubbedVideoRef.current) {
            originalVideoRef.current.currentTime = time;
            dubbedVideoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const skipTime = (seconds: number) => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            originalVideoRef.current.currentTime = newTime;
            dubbedVideoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const toggleOriginalMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(false);
            setDubbedMuted(true);
            originalVideoRef.current.muted = false;
            dubbedVideoRef.current.muted = true;
        }
    };

    const toggleDubbedMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(true);
            setDubbedMuted(false);
            originalVideoRef.current.muted = true;
            dubbedVideoRef.current.muted = false;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (originalVideoRef.current) originalVideoRef.current.volume = newVolume;
        if (dubbedVideoRef.current) dubbedVideoRef.current.volume = newVolume;
    };

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        if (originalVideoRef.current && dubbedVideoRef.current) {
            originalVideoRef.current.playbackRate = speed;
            dubbedVideoRef.current.playbackRate = speed;
        }
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setCurrentTime(video.currentTime);
        const otherVideo = video === originalVideoRef.current ? dubbedVideoRef.current : originalVideoRef.current;
        if (otherVideo && Math.abs(video.currentTime - otherVideo.currentTime) > 0.1) {
            otherVideo.currentTime = video.currentTime;
        }
    };

    const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(e.currentTarget.duration);
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);

    useEffect(() => {
        if (isApproved) {
            setChecklist({
                lipSync: true,
                translation: true,
                tone: true,
                audioQuality: true
            });
        }
    }, [isApproved]);

    // Derived values for UI
    const progressPercent = (currentTime / duration) * 100 || 0;

    if (!quickCheckState.videoId && videosLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#050505]">
                <div className="relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-2 border-olleey-yellow/20 border-t-olleey-yellow rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-olleey-yellow animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!quickCheckState.videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-white/20" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">System Idle</h2>
                    <p className="text-white/40 text-sm">No production asset is currently selected for review. Please select a video from the media library or dashboard to begin verification.</p>
                    <button
                        onClick={() => router.push('/app?page=All Media')}
                        className="px-6 py-2 bg-olleey-yellow text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                        Browse Media Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#050505] text-white selection:bg-olleey-yellow selection:text-black">
            {/* Status Bar / Industrial Header */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-olleey-yellow/50 group-hover:bg-olleey-yellow/5">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Exit Node</span>
                    </motion.button>

                    <div className="h-4 w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xs font-black uppercase tracking-tighter text-white/90">
                                    Monitor_01::
                                    <span className="text-olleey-yellow">{isApproved ? "LIVE_PROD" : "QUALITY_QA"}</span>
                                </h1>
                                <Badge variant="outline" className={cn(
                                    "rounded-none text-[8px] font-black border-white/10 tracking-[0.2em] px-2 py-0",
                                    isApproved ? "border-green-500/50 text-green-500 bg-green-500/10" : "border-olleey-yellow/30 text-olleey-yellow bg-olleey-yellow/5"
                                )}>
                                    {languageName.toUpperCase()} :: {isApproved ? "MASTER" : "STAGE"}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-white/40 font-medium truncate max-w-[300px]">
                                {videoTitle || "Unnamed stream initialization..."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-8 pr-6 border-r border-white/5">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">System Latency</span>
                            <span className="text-[10px] font-mono text-green-500/80">0.4ms</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Data Stream</span>
                            <span className="text-[10px] font-mono text-olleey-yellow/80">4K_LOCALIZED</span>
                        </div>
                    </div>

                    {!isApproved && (
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleApprove}
                            className="h-10 px-8 bg-green-600 hover:bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 rounded-none"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Verify & Preview
                        </motion.button>
                    )}

                    {isApproved && (
                        <div className="h-10 px-6 border border-green-500/30 bg-green-500/5 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Node Online</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Monitoring Deck */}
                <div className="flex-1 flex flex-col relative bg-black overflow-hidden border-r border-white/5">
                    {/* Dual Monitor Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-px bg-white/5 relative group p-1">
                        {/* Master Feed */}
                        <div className={cn(
                            "group/monitor relative overflow-hidden transition-all duration-700",
                            !originalMuted ? "ring-1 ring-olleey-yellow/50 shadow-[0_0_50px_rgba(251,191,36,0.1)] z-10" : "opacity-40"
                        )}>
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <span className="bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest">
                                    Source_Feed // 01
                                </span>
                            </div>
                            <video
                                ref={originalVideoRef}
                                src={originalVideoUrl}
                                className="w-full h-full object-contain bg-black/50"
                                muted={originalMuted}
                                onTimeUpdate={handleVideoTimeUpdate}
                                onLoadedMetadata={handleVideoLoadedMetadata}
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onClick={toggleOriginalMute}
                            />
                            <div className="absolute inset-0 pointer-events-none border border-white/5 group-hover/monitor:border-white/10 transition-colors" />
                        </div>

                        {/* Production Feed */}
                        <div className={cn(
                            "group/monitor relative overflow-hidden transition-all duration-700",
                            !dubbedMuted ? "ring-1 ring-olleey-yellow/50 shadow-[0_0_50px_rgba(251,191,36,0.1)] z-10" : "opacity-40"
                        )}>
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-olleey-yellow animate-pulse" />
                                <span className="bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-olleey-yellow">
                                    Prod_Monitor // {languageName.toUpperCase()}
                                </span>
                            </div>
                            <video
                                ref={dubbedVideoRef}
                                src={dubbedVideoUrl}
                                className="w-full h-full object-contain bg-black/50"
                                muted={dubbedMuted}
                                onTimeUpdate={handleVideoTimeUpdate}
                                onLoadedMetadata={handleVideoLoadedMetadata}
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onClick={toggleDubbedMute}
                            />
                            <div className="absolute inset-0 pointer-events-none border border-white/5 group-hover/monitor:border-white/10 transition-colors" />
                        </div>

                        {/* Center Play Interaction */}
                        <AnimatePresence>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: isPlaying ? 0 : 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={togglePlay}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-olleey-yellow/10 backdrop-blur-3xl rounded-full border border-olleey-yellow/30 flex items-center justify-center z-30 shadow-[0_0_60px_rgba(251,191,36,0.15)] group-hover:opacity-100 opacity-0 transition-opacity duration-300"
                            >
                                {isPlaying ? <Pause className="w-10 h-10 text-olleey-yellow fill-current" /> : <Play className="w-10 h-10 text-olleey-yellow fill-current ml-1" />}
                            </motion.button>
                        </AnimatePresence>
                    </div>

                    {/* Production Console / Controls */}
                    <div className="h-24 bg-black/60 backdrop-blur-2xl border-t border-white/5 px-8 flex flex-col justify-center gap-2">
                        {/* Scrubber */}
                        <div className="relative h-1.5 flex items-center group/scrub">
                            <div className="absolute inset-0 bg-white/5" />
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-olleey-yellow z-10 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div
                                className="absolute h-4 w-1 bg-white z-30 opacity-0 group-hover/scrub:opacity-100 transition-opacity"
                                style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => skipTime(-10)} className="text-white/40 hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                                    </button>
                                    <button onClick={() => skipTime(10)} className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
                                </div>

                                <div className="h-6 w-px bg-white/10" />

                                <div className="flex items-center gap-4">
                                    <div className="flex bg-white/5 p-1 border border-white/10">
                                        <button
                                            onClick={toggleOriginalMute}
                                            className={cn(
                                                "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all",
                                                !originalMuted ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            Source
                                        </button>
                                        <button
                                            onClick={toggleDubbedMute}
                                            className={cn(
                                                "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all",
                                                !dubbedMuted ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            Dubbed
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Volume2 className="w-4 h-4 text-white/40" />
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1 bg-white/10 appearance-none cursor-pointer accent-olleey-yellow"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 text-[10px] font-mono">
                                <div className="flex items-center gap-3 text-white/40">
                                    <span className="text-white font-bold">{formatTime(currentTime)}</span>
                                    <span>/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                                <div className="h-6 w-px bg-white/10" />
                                <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10">
                                    {[1, 1.5, 2].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => changePlaybackSpeed(speed)}
                                            className={cn(
                                                "px-3 py-1 bg-transparent hover:bg-white/5 transition-all text-[9px] font-black",
                                                playbackSpeed === speed ? "text-olleey-yellow" : "text-white/40"
                                            )}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operational Intelligence (Sidebar) */}
                <aside className="w-[420px] bg-[#050505] overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-8 space-y-10">
                        {/* QA Checklist */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-olleey-yellow" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Verification Protocol</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isApproved && (
                                        <button
                                            onClick={handleAiVerify}
                                            disabled={isAiVerifying}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all border",
                                                isAiVerifying
                                                    ? "border-olleey-yellow/50 text-olleey-yellow bg-olleey-yellow/5"
                                                    : "border-white/10 text-white/40 hover:text-olleey-yellow hover:border-olleey-yellow/30 bg-white/5"
                                            )}
                                        >
                                            {isAiVerifying ? (
                                                <>
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                    Scanning...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    AI Verify
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {isApproved && (
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Verified
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(checklist).map(([key, value]) => (
                                    <motion.button
                                        key={key}
                                        disabled={isApproved}
                                        onClick={() => setChecklist(prev => ({ ...prev, [key]: !value }))}
                                        whileHover={!isApproved ? { x: 4, backgroundColor: "rgba(255,255,255,0.05)" } : {}}
                                        className={cn(
                                            "group flex items-center justify-between p-4 border transition-all duration-300",
                                            value
                                                ? "border-green-500/20 bg-green-500/5"
                                                : "border-white/5 bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-1.5 h-6 transition-all",
                                                value ? "bg-green-500" : (verifyingItems[key] ? "bg-olleey-yellow animate-pulse" : "bg-white/10")
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                value ? "text-white" : (verifyingItems[key] ? "text-olleey-yellow" : "text-white/40")
                                            )}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 border flex items-center justify-center transition-all",
                                            value ? "bg-green-500 border-green-500 text-black" : "border-white/20 text-transparent"
                                        )}>
                                            <Check className="w-3.5 h-3.5 stroke-[4px]" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        <div className="h-px bg-white/5" />

                        {/* Production Assets (Thumbnail) */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-olleey-yellow" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Visual Identity</h2>
                                </div>
                                <div className="flex bg-white/5 p-1 border border-white/5">
                                    {(['original', 'generate', 'upload'] as const).map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => {
                                                setThumbnailStrategy(strategy);
                                                if (strategy === 'upload') fileInputRef.current?.click();
                                                if (strategy === 'generate') handleGenerateThumbnail();
                                            }}
                                            className={cn(
                                                "px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all",
                                                thumbnailStrategy === strategy ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            {strategy}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/thumb aspect-video bg-black/40 border border-white/5 overflow-hidden">
                                {isGeneratingThumbnail ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm z-20">
                                        <RefreshCw className="w-6 h-6 text-olleey-yellow animate-spin" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow animate-pulse">Initializing AI Synthesis...</span>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={thumbnailStrategy === 'upload' && customThumbnail ? customThumbnail : (thumbnailStrategy === 'generate' ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" : (quickCheckState.originalVideoUrl ? "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" : ""))}
                                            alt="Thumbnail Preview"
                                            className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <Badge className="w-fit rounded-none bg-olleey-yellow text-black text-[8px] font-black uppercase">Active Strategy: {thumbnailStrategy}</Badge>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {thumbnailStrategy === 'generate' && !isGeneratingThumbnail && (
                                <motion.button
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleGenerateThumbnail}
                                    className="w-full py-2 border border-olleey-yellow/20 bg-olleey-yellow/5 text-olleey-yellow text-[9px] font-black uppercase tracking-widest hover:bg-olleey-yellow/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Wand2 className="w-3.5 h-3.5" /> Re-Generate Alternative
                                </motion.button>
                            )}
                        </section>

                        <div className="h-px bg-white/5" />

                        {/* Asset Manifest (Title/Desc) */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-olleey-yellow" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Localized Manifest</h2>
                                </div>
                                <Badge variant="outline" className="rounded-none text-[8px] border-white/10 text-white/40 font-black">
                                    EDITABLE_NODE
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="flex h-10 bg-white/5 border border-white/5 p-1 gap-1">
                                    <button
                                        onClick={() => setActiveTab('edit')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center rounded-none text-[8px] font-black uppercase tracking-widest transition-all",
                                            activeTab === 'edit' ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        <Edit3 className="w-3 h-3 mr-2" /> Manual Input
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('ai')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center rounded-none text-[8px] font-black uppercase tracking-widest transition-all",
                                            activeTab === 'ai' ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        <Zap className="w-3 h-3 mr-2 fill-current" /> AI Assistant
                                    </button>
                                </div>

                                {activeTab === 'edit' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2 group/field">
                                            <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-olleey-yellow transition-colors">Output Title</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={editedTitle}
                                                    onChange={(e) => setEditedTitle(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-bold text-white/90 focus:border-olleey-yellow focus:bg-white/[0.07] outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group/field">
                                            <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-olleey-yellow transition-colors">Description Metadata</label>
                                            <div className="relative">
                                                <textarea
                                                    value={editedDescription}
                                                    onChange={(e) => setEditedDescription(e.target.value)}
                                                    className="w-full h-40 bg-white/5 border border-white/10 px-4 py-3 text-xs font-medium text-white/60 focus:border-olleey-yellow focus:bg-white/[0.07] outline-none transition-all resize-none leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 border border-white/5 bg-white/[0.02] space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-4 h-4 text-olleey-yellow" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-white/80">Olleey Intelligence Assistant</p>
                                                <p className="text-[9px] text-white/40 leading-relaxed">I can generate optimized localized metadata based on your production feed and cultural context.</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleGenerateInfo}
                                            disabled={isGeneratingInfo}
                                            className="w-full rounded-none bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[9px] font-black uppercase tracking-widest h-11 gap-2"
                                        >
                                            {isGeneratingInfo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                                            Generate Optimized Assets
                                        </Button>

                                        <AnimatePresence>
                                            {showInfoPreview && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-black uppercase text-olleey-yellow">Suggested Title</span>
                                                            <button onClick={() => setEditedTitle(tempTitle)} className="text-[8px] font-black uppercase text-white/40 hover:text-white transition-colors">Apply</button>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-white/80 bg-black/40 p-3 border border-white/5">{tempTitle}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-black uppercase text-olleey-yellow">Suggested Description</span>
                                                            <button onClick={() => setEditedDescription(tempDescription)} className="text-[8px] font-black uppercase text-white/40 hover:text-white transition-colors">Apply</button>
                                                        </div>
                                                        <p className="text-[10px] text-white/40 bg-black/40 p-3 border border-white/5 leading-relaxed">{tempDescription}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCommit}
                                    className="flex-1 border border-olleey-yellow text-olleey-yellow hover:bg-olleey-yellow hover:text-black text-[9px] font-black uppercase tracking-widest h-11 transition-all"
                                >
                                    Commit Changes
                                </button>
                            </div>
                        </section>

                        {!isApproved && (
                            <section className="pt-4">
                                <AnimatePresence mode="wait">
                                    {showFlagInput ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 bg-red-500/5 border border-red-500/20 space-y-4">
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Incident Report</span>
                                                </div>
                                                <textarea
                                                    value={flagReason}
                                                    onChange={(e) => setFlagReason(e.target.value)}
                                                    placeholder="Describe production anomaly..."
                                                    className="w-full h-24 bg-black border border-white/5 p-3 text-[11px] text-white/80 focus:border-red-500 outline-none transition-colors placeholder:text-white/10"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => { handleFlag(flagReason); setShowFlagInput(false); }}
                                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase h-10 rounded-none"
                                                    >
                                                        Finalize Rejection
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setShowFlagInput(false)}
                                                        className="text-white/40 hover:text-white text-[9px] font-black uppercase"
                                                    >
                                                        Abort
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                                            onClick={() => setShowFlagInput(true)}
                                            className="w-full py-4 border border-white/5 bg-white/[0.01] text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                                        >
                                            <Flag className="w-4 h-4" /> Fail QA Check
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}
                    </div>
                </aside>
            </div>

            {/* System HUD Overlay (Bottom Detail) */}
            <div className="h-6 bg-olleey-yellow flex items-center justify-between px-4 z-50 overflow-hidden">
                <div className="flex gap-6">
                    <span className="text-black text-[8px] font-black uppercase tracking-[0.4em]">Secure_Node_Active</span>
                    <span className="text-black/60 text-[8px] font-mono tracking-widest">{new Date().toISOString()}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                        <span className="text-black text-[8px] font-black uppercase">Sync_Master: OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                        <span className="text-black text-[8px] font-black uppercase">Stream_Health: 100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
