"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, Maximize2, SkipBack, SkipForward, Sparkles, User, RotateCcw, Languages, Image as ImageIcon, Check, Upload, Wand2, RefreshCw, Eye, Edit3, Type, Save, ArrowLeft, Terminal, Activity, ChevronRight, Zap, Info, ShieldCheck, Monitor } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS, getFakeLocalizedText } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobsAPI, videosAPI, API_BASE_URL } from "@/lib/api";

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

    // Synchronize state with backend when video_id or lang changes in URL
    useEffect(() => {
        if (!videoIdFromUrl || videosLoading) return;

        const isCurrentVideo = quickCheckState.videoId === videoIdFromUrl &&
            quickCheckState.languageCode === (langFromUrl || quickCheckState.languageCode);

        // If we don't have the video loaded in state, or if we want to ensure freshness
        if (!isCurrentVideo || !quickCheckState.originalVideoUrl) {
            // First try to find as a video_id in the already loaded videos list
            let video = videos.find(v => v.video_id === videoIdFromUrl);
            console.log('[ReviewHubPage] Initial lookup:', {
                videoIdFromUrl,
                foundInList: !!video,
                totalVideos: videos.length,
                videoData: video ? {
                    title: video.title,
                    storage_url: (video as any).storage_url,
                    video_url: (video as any).video_url
                } : null
            });

            // Fetch sequence to ensure we have the most accurate backend data
            (async () => {
                try {
                    let targetVideo = video;
                    let targetJob: any = null;
                    let jobVideos: any[] = [];

                    // Try to get job data - first as job_id, then by finding job with source_video_id
                    try {
                        // First, try as a job_id
                        targetJob = await jobsAPI.getJobById(videoIdFromUrl);
                        jobVideos = await jobsAPI.getJobVideos(videoIdFromUrl);

                        // If it's a job, the source video is what we want for "original"
                        if (!targetVideo) {
                            targetVideo = videos.find(v => v.video_id === targetJob.source_video_id);
                        }
                    } catch (e) {
                        // Not a job_id, treat as video_id and find associated job
                        console.log("Not a job ID, treating as video ID and finding associated job");

                        try {
                            // Find job by source_video_id
                            const jobsResponse = await jobsAPI.listJobs();
                            const associatedJob = jobsResponse.jobs.find(j => j.source_video_id === videoIdFromUrl);

                            if (associatedJob) {
                                targetJob = associatedJob;
                                jobVideos = await jobsAPI.getJobVideos(associatedJob.job_id);
                                console.log("Found associated job:", associatedJob.job_id);
                            }
                        } catch (jobError) {
                            console.log("Could not find associated job, using video data only");
                        }
                    }

                    // If we still don't have the video, try to fetch it directly
                    if (!targetVideo && videoIdFromUrl) {
                        try {
                            console.log("Fetching video directly by ID:", videoIdFromUrl);
                            const videoData = await videosAPI.getVideoById(videoIdFromUrl);
                            targetVideo = videoData;
                            console.log("Fetched video data:", videoData);
                        } catch (err) {
                            console.error("Failed to fetch video directly:", err);
                        }
                    }

                    if (targetVideo) {
                        const langCode = langFromUrl || targetJob?.target_languages?.[0] || Object.keys(targetVideo.localizations || {})[0] || "es";

                        // Find localization info (either from jobVideos for active jobs or video.localizations for existing)
                        const localizedVideo = jobVideos.find(jv => jv.language_code === langCode);
                        const loc = targetVideo.localizations?.[langCode];

                        // Helper to construct full URL for storage paths
                        const getFullUrl = (url: string | undefined) => {
                            if (!url) return undefined;
                            if (url.startsWith('http')) return url;
                            return `${API_BASE_URL}${url}`;
                        };

                        // Get source video URL - favor storage_url for uploaded videos, then video_url
                        const sourceVideoUrl = getFullUrl((targetVideo as any).storage_url || (targetVideo as any).video_url) ||
                            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

                        // Get dubbed video URL - favor storage_url from the localized video (can be empty if not ready)
                        const dubbedVideoUrl = getFullUrl(localizedVideo?.storage_url || loc?.video_url) || "";

                        // Get localized metadata (for the Localized Metadata section)
                        const localizedTitle = localizedVideo?.title || loc?.title || "";
                        const localizedDescription = localizedVideo?.description || loc?.description || "";

                        // Debug logging
                        console.log('[ReviewHubPage] Video data:', {
                            videoId: videoIdFromUrl,
                            langCode,
                            hasJobVideos: jobVideos.length > 0,
                            sourceVideo: {
                                title: targetVideo.title,
                                storage_url: (targetVideo as any).storage_url,
                                video_url: (targetVideo as any).video_url,
                                thumbnail_url: targetVideo.thumbnail_url
                            },
                            localizedVideo: localizedVideo ? {
                                title: localizedVideo.title,
                                storage_url: localizedVideo.storage_url,
                                thumbnail_url: localizedVideo.thumbnail_url
                            } : null,
                            locFromVideo: loc ? {
                                title: loc.title,
                                video_url: loc.video_url,
                                thumbnail_url: loc.thumbnail_url
                            } : null,
                            constructedUrls: {
                                sourceVideoUrl,
                                dubbedVideoUrl: dubbedVideoUrl || '(empty - not ready)',
                                sourceThumbnail: getFullUrl(targetVideo.thumbnail_url)
                            }
                        });

                        openReview({
                            videoId: videoIdFromUrl,
                            languageCode: langCode,
                            originalVideoUrl: sourceVideoUrl,
                            dubbedVideoUrl: dubbedVideoUrl,
                            videoTitle: targetVideo.title, // Use SOURCE video title for header
                            videoDescription: targetVideo.description || "", // Use SOURCE description
                            thumbnailUrl: getFullUrl(targetVideo.thumbnail_url), // Use SOURCE thumbnail
                            localizedTitle: localizedTitle, // Add localized metadata
                            localizedDescription: localizedDescription,
                            isApproved: localizedVideo?.status === "published" || loc?.status === "live",
                            approvedAt: targetVideo.published_at || (targetVideo as any).created_at
                        });
                    }
                } catch (error) {
                    console.error("Failed to synchronize video details:", error);
                }
            })();
        }
    }, [videoIdFromUrl, langFromUrl, videos, videosLoading, openReview, quickCheckState.videoId, quickCheckState.languageCode, quickCheckState.originalVideoUrl]);

    const {
        originalVideoUrl,
        dubbedVideoUrl,
        languageCode,
        videoTitle,
        videoDescription,
        localizedTitle,
        localizedDescription,
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
    const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editedTitle, setEditedTitle] = useState(localizedTitle || "");
    const [editedDescription, setEditedDescription] = useState(localizedDescription || "No description provided.");
    const [isGeneratingInfo, setIsGeneratingInfo] = useState(false);
    const [showInfoPreview, setShowInfoPreview] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [reprocessingItems, setReprocessingItems] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit');
    const [isAiVerifying, setIsAiVerifying] = useState(false);
    const [verifyingItems, setVerifyingItems] = useState<Record<string, boolean>>({});
    const [selectedFocus, setSelectedFocus] = useState<"source" | "prod">("prod");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (localizedTitle) setEditedTitle(localizedTitle);
        if (localizedDescription) setEditedDescription(localizedDescription);
    }, [localizedTitle, localizedDescription]);

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
            setCustomThumbnailFile(file);
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

    const handleApprove = async () => {
        setIsSaving(true);

        try {
            // Check if there are any changes to save
            const titleChanged = editedTitle !== (localizedTitle || "");
            const descriptionChanged = editedDescription !== (localizedDescription || "");
            const thumbnailChanged = thumbnailStrategy === "upload" && customThumbnailFile;

            if (titleChanged || descriptionChanged || thumbnailChanged) {
                // We need the job_id to save changes
                // Try to find it from the video_id
                const jobsResponse = await jobsAPI.listJobs();
                const job = jobsResponse.jobs.find(j => j.source_video_id === quickCheckState.videoId);

                if (job && languageCode) {
                    console.log('[ReviewHubPage] Saving changes:', {
                        titleChanged,
                        descriptionChanged,
                        thumbnailChanged,
                        job_id: job.job_id,
                        language_code: languageCode
                    });

                    await jobsAPI.updateLocalizedVideo(job.job_id, languageCode, {
                        title: titleChanged ? editedTitle : undefined,
                        description: descriptionChanged ? editedDescription : undefined,
                        thumbnailFile: thumbnailChanged ? customThumbnailFile : undefined,
                    });

                    console.log('[ReviewHubPage] Changes saved successfully');

                    // Trigger refresh
                    window.dispatchEvent(new CustomEvent('olleey-refresh'));
                } else {
                    console.warn('[ReviewHubPage] Could not find job to save changes');
                }
            }

            // Navigate to Preview page
            router.push(`/app?page=Preview&video_id=${quickCheckState.videoId}&lang=${languageCode}`, { scroll: false });
        } catch (error) {
            console.error('[ReviewHubPage] Failed to save changes:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
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

    // Theme-aware classes matching Dashboard
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
    const isDark = theme === "dark";

    // Derived values for UI
    const progressPercent = (currentTime / duration) * 100 || 0;

    if (!quickCheckState.videoId && videosLoading) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
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
            <div className={`w-full h-full flex items-center justify-center p-8 ${bgClass}`}>
                <div className="max-w-md w-full text-center space-y-6">
                    <div className={`w-20 h-20 bg-white/5 border ${borderClass} rounded-[2.5rem] flex items-center justify-center mx-auto`}>
                        <RefreshCw className={`w-8 h-8 ${textSecondaryClass} opacity-50`} />
                    </div>
                    <div className="space-y-2">
                        <h2 className={`text-xl font-medium ${textClass} tracking-tight`}>Review Hub Empty</h2>
                        <p className={`${textSecondaryClass} text-sm opacity-60`}>Select a production asset from the media library to begin the review process.</p>
                    </div>
                    <Button
                        onClick={() => router.push('/app?page=All Media')}
                        className="h-10 px-8 bg-olleey-yellow text-black hover:bg-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full"
                    >
                        Browse Library
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col ${bgClass} ${textClass} overflow-hidden`}>
            {/* Header */}
            <header className="h-20 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className={`w-10 h-10 ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} rounded-full`}
                    >
                        <ArrowLeft className="w-5 h-5 opacity-60" />
                    </Button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-normal tracking-tight">Review Studio</h1>
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${isApproved ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-olleey-yellow/30 text-olleey-yellow bg-olleey-yellow/5"}`}>
                                {isApproved ? "Live Master" : "Quality Check"}
                            </Badge>
                        </div>
                        <p className={`text-xs ${textSecondaryClass} font-medium tracking-wide opacity-60 truncate max-w-md mt-0.5`}>
                            {videoTitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isApproved && (
                        <>
                            <Button
                                onClick={async () => {
                                    if (confirm("Cancel this review? The job will be cancelled and removed from the pipeline.")) {
                                        try {
                                            if (quickCheckState.videoId) {
                                                await jobsAPI.cancelJob(quickCheckState.videoId);
                                            }
                                            // Trigger refresh
                                            window.dispatchEvent(new CustomEvent('olleey-refresh'));
                                            router.push('/app?page=All Media');
                                        } catch (error) {
                                            console.error("Failed to cancel job:", error);
                                            alert("Failed to cancel job. Please try again.");
                                        }
                                    }
                                }}
                                variant="outline"
                                className={`h-10 px-6 rounded-full bg-transparent hover:bg-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/40 text-[10px] font-black uppercase tracking-[0.2em]`}
                            >
                                <X className="w-3.5 h-3.5 mr-2" /> Cancel Review
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={isSaving}
                                className={`h-10 px-6 rounded-full bg-green-600 hover:bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSaving ? (
                                    <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><CheckCircle className="w-3.5 h-3.5 mr-2" /> Verify & Preview</>
                                )}
                            </Button>
                        </>
                    )}
                    {isApproved && (
                        <div className="h-10 px-6 rounded-full border border-green-500/20 bg-green-500/5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Asset Verified</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden p-6 pt-0 gap-6">
                {/* Main Content Area - Video Player */}
                <div className={`flex-1 flex flex-col relative rounded-[2.5rem] border ${borderClass} bg-[#0c0c0c] overflow-hidden shadow-2xl`}>

                    {/* Video Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-px bg-white/5 relative group">
                        {/* Source Feed */}
                        <div
                            onClick={() => setSelectedFocus("source")}
                            className={cn(
                                "relative overflow-hidden transition-all duration-500 bg-black/40 cursor-pointer rounded-tl-[2.5rem]",
                                !originalMuted ? "opacity-100" : "opacity-60",
                                selectedFocus === "source" ? "border-2 border-olleey-yellow z-10 shadow-[0_0_30px_rgba(234,179,8,0.2)]" : "border-transparent borderHover"
                            )}
                        >
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
                                <Badge className={cn(
                                    "backdrop-blur-md border px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full pointer-events-none transition-colors",
                                    selectedFocus === "source"
                                        ? "bg-olleey-yellow text-black border-olleey-yellow"
                                        : "bg-black/40 text-white/50 border-white/10"
                                )}>
                                    Original Source
                                </Badge>
                            </div>
                            <video
                                ref={originalVideoRef}
                                src={originalVideoUrl}
                                className="w-full h-full object-contain"
                                muted={originalMuted}
                                onTimeUpdate={handleVideoTimeUpdate}
                                onLoadedMetadata={handleVideoLoadedMetadata}
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOriginalMute();
                                    setSelectedFocus("source");
                                }}
                            />
                        </div>

                        {/* Dubbed Feed */}
                        <div
                            onClick={() => setSelectedFocus("prod")}
                            className={cn(
                                "relative overflow-hidden transition-all duration-500 bg-black/40 cursor-pointer rounded-tr-[2.5rem]",
                                !dubbedMuted ? "opacity-100" : "opacity-60",
                                selectedFocus === "prod" ? "border-2 border-olleey-yellow z-10 shadow-[0_0_30px_rgba(234,179,8,0.2)]" : "border-transparent borderHover"
                            )}
                        >
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 ">
                                <Badge className={cn(
                                    "backdrop-blur-md border px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full pointer-events-none transition-colors",
                                    selectedFocus === "prod"
                                        ? "bg-olleey-yellow text-black border-olleey-yellow"
                                        : "bg-black/40 text-white/50 border-white/10"
                                )}>
                                    {languageName} Output
                                </Badge>
                            </div>
                            {dubbedVideoUrl ? (
                                <video
                                    ref={dubbedVideoRef}
                                    src={dubbedVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={dubbedMuted}
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDubbedMute();
                                        setSelectedFocus("prod");
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center space-y-3">
                                        <RefreshCw className="w-8 h-8 text-white/20 animate-spin mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            Localized Output Processing
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Center Play Button Overlay */}
                        <AnimatePresence>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: isPlaying ? 0 : 1, scale: 1 }}
                                whileHover={{ scale: 1.1, opacity: 1 }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent ensuring focus logic triggers if we just want to play/pause
                                    togglePlay();
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center z-30 shadow-2xl transition-all duration-300 hover:bg-white/20 hover:scale-105"
                            >
                                {isPlaying ? (
                                    <Pause className="w-8 h-8 text-white fill-current" />
                                ) : (
                                    <Play className="w-8 h-8 text-white fill-current pl-1" />
                                )}
                            </motion.button>
                        </AnimatePresence>
                    </div>

                    {/* Controls Bar */}
                    <div className="h-20 bg-white/[0.02] backdrop-blur-xl border-t border-white/5 px-8 flex flex-col justify-center gap-3">
                        {/* Scrubber */}
                        <div className="relative h-1.5 flex items-center group/scrub cursor-pointer">
                            <div className="absolute inset-0 bg-white/10 rounded-full" />
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-olleey-yellow rounded-full z-10"
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
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => skipTime(-5)} className="w-8 h-8 rounded-full hover:bg-white/5 text-white/60 hover:text-white">
                                        <SkipBack className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white"
                                    >
                                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => skipTime(5)} className="w-8 h-8 rounded-full hover:bg-white/5 text-white/60 hover:text-white">
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium tracking-widest ${!originalMuted ? 'text-white' : 'text-white/40'} cursor-pointer hover:text-white transition-colors`} onClick={toggleOriginalMute}>Source</span>
                                    <span className="text-white/20">/</span>
                                    <span className={`text-xs font-medium tracking-widest ${!dubbedMuted ? 'text-olleey-yellow' : 'text-white/40'} cursor-pointer hover:text-olleey-yellow transition-colors`} onClick={toggleDubbedMute}>Prod</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-mono text-white/40">
                                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                                    {[1, 1.5, 2].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => changePlaybackSpeed(speed)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-bold transition-all",
                                                playbackSpeed === speed ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
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

                {/* Sidebar */}
                <aside className={`w-[400px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2`}>

                    {/* Checklist Panel */}
                    <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                    <ShieldCheck className="w-4 h-4 text-olleey-yellow" />
                                </div>
                                <h3 className="text-sm font-medium tracking-tight">Quality Assurance</h3>
                            </div>

                            {!isApproved && (
                                <Button
                                    size="sm"
                                    onClick={handleAiVerify}
                                    disabled={isAiVerifying}
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    {isAiVerifying ? <RefreshCw className="w-3 h-3 animate-spin mr-1.5" /> : <Zap className="w-3 h-3 fill-current mr-1.5" />}
                                    AI Check
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(checklist).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 pl-4 rounded-2xl border transition-all duration-300 group",
                                        value
                                            ? "bg-green-500/10 border-green-500/20"
                                            : (reprocessingItems[key] ? "bg-olleey-yellow/5 border-olleey-yellow/20" : "bg-white/[0.03] border-white/5")
                                    )}
                                >
                                    <button
                                        disabled={isApproved || reprocessingItems[key]}
                                        onClick={() => setChecklist(prev => ({ ...prev, [key]: !value }))}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full transition-all shrink-0",
                                            value ? "bg-green-500" : (reprocessingItems[key] || verifyingItems[key] ? "bg-olleey-yellow animate-pulse" : "bg-white/20")
                                        )} />
                                        <span className={cn(
                                            "text-xs font-semibold tracking-wide capitalize",
                                            value ? "text-white" : "text-white/60 group-hover:text-white"
                                        )}>
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {reprocessingItems[key] ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow animate-pulse mr-2">Fixing...</span>
                                        ) : value ? (
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-green-500" />
                                            </div>
                                        ) : (
                                            !isApproved && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRedo(key);
                                                    }}
                                                    className="h-8 px-4 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white text-white/40 rounded-full border border-white/5 hover:border-white/10 transition-all"
                                                >
                                                    Redo
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thumbnail Panel */}
                    <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                </div>
                                <h3 className="text-sm font-medium tracking-tight">Thumbnail</h3>
                            </div>
                            <div className="flex bg-white/5 rounded-full p-0.5 border border-white/5">
                                {(['original', 'generate', 'upload'] as const).map((strategy) => (
                                    <button
                                        key={strategy}
                                        onClick={() => {
                                            setThumbnailStrategy(strategy);
                                            if (strategy === 'upload') fileInputRef.current?.click();
                                            if (strategy === 'generate') handleGenerateThumbnail();
                                        }}
                                        className={cn(
                                            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                            thumbnailStrategy === strategy ? "bg-white text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        {strategy}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative group/thumb aspect-video bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                            {isGeneratingThumbnail ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm z-20">
                                    <RefreshCw className="w-6 h-6 text-olleey-yellow animate-spin" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow animate-pulse">Synthesizing...</span>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={thumbnailStrategy === 'upload' && customThumbnail ? customThumbnail : (thumbnailStrategy === 'generate' ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" : (quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"))}
                                        alt="Thumbnail Preview"
                                        className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <Badge className="w-fit rounded-full bg-white text-black text-[8px] font-black uppercase border-none">Active: {thumbnailStrategy}</Badge>
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
                            <Button
                                onClick={handleGenerateThumbnail}
                                className="w-full rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-black uppercase tracking-widest h-9"
                            >
                                <Wand2 className="w-3.5 h-3.5 mr-2" /> Re-Generate
                            </Button>
                        )}
                    </div>

                    {/* Metadata Panel */}
                    <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Type className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-sm font-medium tracking-tight">Localized Metadata</h3>
                            </div>
                            <div className="flex bg-white/5 rounded-full p-0.5 border border-white/5">
                                <button
                                    onClick={() => setActiveTab('edit')}
                                    className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'edit' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'ai' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                                >
                                    AI Assist
                                </button>
                            </div>
                        </div>

                        {activeTab === 'edit' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Title</label>
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-olleey-yellow/50 focus:bg-black/40 outline-none transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Description</label>
                                    <textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-olleey-yellow/50 focus:bg-black/40 outline-none transition-all resize-none leading-relaxed placeholder:text-white/20"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-4 text-center">
                                <div className="p-3 bg-olleey-yellow/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-olleey-yellow/20">
                                    <Sparkles className="w-5 h-5 text-olleey-yellow" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-white">AI Optimization</h4>
                                    <p className="text-xs text-white/40">Generate SEO-optimized titles and descriptions for this locale.</p>
                                </div>
                                <Button
                                    onClick={handleGenerateInfo}
                                    disabled={isGeneratingInfo}
                                    className="w-full rounded-full bg-white hover:bg-white/90 text-black font-bold h-10 mt-2"
                                >
                                    {isGeneratingInfo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                    Generate
                                </Button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Dashboard Layout Optimization */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
