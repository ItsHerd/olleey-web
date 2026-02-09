"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Globe,
    CheckCircle2,
    Copy,
    Monitor,
    Layout,
    Zap,
    Download,
    RefreshCw,
    Languages,
    ChevronLeft,
    Youtube,
    Play,
    Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { jobsAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Save, Loader2 } from "lucide-react";

export default function PreviewPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { quickCheckState, handleApprove, openReview } = useReview();
    const { toast } = useToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Fetch full video data to get all localizations
    const { selectedProject } = useProject();
    
    // Get userId directly from localStorage
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined;
    const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id, user_id: userId });

    // Get video ID and language from URL parameters
    const videoIdFromUrl = searchParams.get("video_id");
    const langFromUrl = searchParams.get("lang") || "es";

    // Find current video from the videos list
    const currentVideo = videos.find(v => v.video_id === (quickCheckState.videoId || videoIdFromUrl));

    // Listen for global refresh events
    useEffect(() => {
        const handleRefresh = async () => {
            console.log('[PreviewPage] Refresh event received');
            await refetchVideos();
        };

        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, [refetchVideos]);

    // Sync state with video data when available
    useEffect(() => {
        if (currentVideo && videoIdFromUrl && !quickCheckState.videoId) {
            // If we have video data but quickCheckState is empty, populate it
            const loc = currentVideo.localizations?.[langFromUrl];
            openReview({
                videoId: currentVideo.video_id,
                languageCode: langFromUrl,
                originalVideoUrl: (currentVideo as any).storage_url || (currentVideo as any).video_url,
                dubbedVideoUrl: loc?.video_url,
                videoTitle: currentVideo.title,
                videoDescription: currentVideo.description,
                thumbnailUrl: getFullUrl(currentVideo.thumbnail_url),
                isApproved: loc?.status === "live",
                approvedAt: currentVideo.published_at
            });
        }
    }, [currentVideo, videoIdFromUrl, langFromUrl, quickCheckState.videoId, openReview]);

    const [viewMode, setViewMode] = useState<'dubbed' | 'original'>('dubbed');

    // Get video info from quickCheckState or fallback to current video
    const videoTitle = quickCheckState.videoTitle || currentVideo?.title || "Unnamed Video";
    const videoDescription = quickCheckState.videoDescription || currentVideo?.description || "";
    const dubbedVideoUrl = quickCheckState.dubbedVideoUrl || currentVideo?.localizations?.[langFromUrl]?.video_url || "";
    const originalVideoUrl = quickCheckState.originalVideoUrl || (currentVideo as any)?.storage_url || (currentVideo as any)?.video_url || "";
    const languageCode = quickCheckState.languageCode || langFromUrl;
    const isApproved = quickCheckState.isApproved !== undefined ? quickCheckState.isApproved : (currentVideo?.localizations?.[langFromUrl]?.status === "live");

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    // Simulate some metadata
    const [stats] = useState({
        qualityScore: "98.4",
        syncDrift: "0.02ms",
        culturalMatch: "High",
        aiProcessing: "Full Opt"
    });

    const [copied, setCopied] = useState(false);

    const handlePublish = async () => {
        setIsPublishing(true);
        const videoId = quickCheckState.videoId || videoIdFromUrl;
        const lang = quickCheckState.languageCode || langFromUrl;

        if (!videoId || !lang) {
            toast("Missing video information", "error");
            setIsPublishing(false);
            return;
        }

        try {
            await jobsAPI.publishToYouTube(videoId, lang);
            toast("Successfully published to YouTube!", "success");

            // Refresh data via global event
            window.dispatchEvent(new CustomEvent('olleey-refresh'));

            // Navigate back to library
            router.push('/app?page=All Media', { scroll: false });
        } catch (error: any) {
            console.error("Publishing error:", error);
            toast(error.message || "Failed to publish to YouTube", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSavingDraft(true);
        const videoId = quickCheckState.videoId || videoIdFromUrl;
        const lang = quickCheckState.languageCode || langFromUrl;

        if (!videoId || !lang) {
            toast("Missing video information", "error");
            setIsSavingDraft(false);
            return;
        }

        try {
            await jobsAPI.saveDraft(videoId, lang);
            toast("Saved as draft for later publishing", "success");

            // Refresh data via global event
            window.dispatchEvent(new CustomEvent('olleey-refresh'));

            // Navigate back to library
            router.push('/app?page=All Media', { scroll: false });
        } catch (error: any) {
            console.error("Save draft error:", error);
            toast(error.message || "Failed to save draft", "error");
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };


    const handleSwitchToDub = (code: string, loc: any) => {
        if (!currentVideo) return;

        openReview({
            videoId: currentVideo.video_id,
            languageCode: code,
            originalVideoUrl: (currentVideo as any).video_url || originalVideoUrl,
            dubbedVideoUrl: loc.video_url,
            videoTitle: loc.title || currentVideo.title,
            videoDescription: loc.description || currentVideo.description,
            thumbnailUrl: getFullUrl(loc.thumbnail_url || currentVideo.thumbnail_url),
            isApproved: loc.status === "live",
            approvedAt: currentVideo.published_at || (currentVideo as any).created_at
        });
        setViewMode('dubbed');
    };

    // Helper to construct full URL for storage paths
    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    // Theme-aware classes matching Dashboard
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
    const isDark = theme === "dark";

    // Show loading state while fetching video data
    if (videosLoading && !currentVideo) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-olleey-yellow" />
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Loading video...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col overflow-hidden ${bgClass} ${textClass} selection:bg-olleey-yellow selection:text-black transition-colors duration-500`}>
            {/* Action Toolbar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${borderClass} shrink-0`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <h1 className="text-lg font-bold tracking-tight truncate max-w-[180px] sm:max-w-md">
                        {videoTitle || "Unnamed_Asset"}
                    </h1>

                    {viewMode === 'original' ? (
                        <Badge className={`${isDark ? "bg-white/10 text-white" : "bg-gray-100 text-black"} border-none text-[7px] h-4 font-black uppercase rounded-full px-2 tracking-tighter`}>Source</Badge>
                    ) : isApproved ? (
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[7px] h-4 font-black uppercase rounded-full px-2 tracking-tighter">Live</Badge>
                    ) : (
                        <Badge className="bg-blue-500/10 text-blue-500 border-none text-[7px] h-4 font-black uppercase rounded-full px-2 tracking-tighter">Ready</Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Unified View Switch */}
                    <div className={`flex items-center ${isDark ? "bg-white/[0.03]" : "bg-gray-100"} border ${borderClass} rounded-full p-1 hidden sm:flex`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('original')}
                            className={cn(
                                "h-7 px-4 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'original'
                                    ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : (isDark ? "text-white/30 hover:text-white" : "text-black/40 hover:text-black")
                            )}
                        >
                            Original
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('dubbed')}
                            className={cn(
                                "h-7 px-4 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'dubbed'
                                    ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : (isDark ? "text-white/30 hover:text-white" : "text-black/40 hover:text-black")
                            )}
                        >
                            Localized
                        </Button>
                    </div>

                    <div className={`h-4 w-px ${isDark ? "bg-white/10" : "bg-gray-200"} mx-1 hidden sm:block`} />

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`w-9 h-9 border ${borderClass} rounded-full transition-all hover:border-olleey-yellow/30 group hidden xs:flex`}
                        title="Export Master"
                    >
                        <Download className={`w-4 h-4 ${isDark ? "text-white/40" : "text-black/40"} group-hover:text-olleey-yellow transition-colors`} />
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                        className={cn(
                            "rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.1em] h-9 px-6 transition-all",
                            viewMode === 'original' && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        {isSavingDraft ? (
                            <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-3.5 h-3.5 mr-2" />
                        )}
                        {isSavingDraft ? "Saving..." : "Save Draft"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={isPublishing || isSavingDraft || viewMode === 'original'}
                        className={cn(
                            "rounded-full bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[10px] font-black uppercase tracking-[0.1em] h-9 px-6 shadow-lg hover:shadow-olleey-yellow/10 transition-all",
                            viewMode === 'original' && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        {isPublishing ? (
                            <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                            <Youtube className="w-3.5 h-3.5 mr-2" />
                        )}
                        {isPublishing ? "Publishing..." : "Launch to YouTube"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Viewport */}
                <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isDark ? "bg-[#0a0a0b]" : "bg-gray-50/50"} relative p-8 lg:p-12`}>
                    {/* Subtle Background Aesthetic */}
                    {isDark && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-olleey-yellow/5 to-transparent pointer-events-none opacity-50 blur-[120px]" />
                    )}

                    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                        {/* Video Player Section */}
                        <section
                            className={`relative aspect-video ${isDark ? "bg-black" : "bg-white"} border ${borderClass} group overflow-hidden rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] cursor-pointer`}
                            onClick={togglePlay}
                        >
                            <video
                                ref={videoRef}
                                key={viewMode === 'original' ? originalVideoUrl : dubbedVideoUrl}
                                src={viewMode === 'original' ? originalVideoUrl : (dubbedVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")}
                                className="w-full h-full object-contain"
                                poster={quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />

                            {/* Center Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: isPlaying ? 0 : 1, scale: 1 }}
                                    whileHover={{ scale: 1.1, opacity: 1 }}
                                    className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlay();
                                    }}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-white fill-current" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white fill-current pl-1" />
                                    )}
                                </motion.div>
                            </div>

                            {/* Cinematic Overlay UI */}
                            <div className="absolute top-8 right-8 flex items-center gap-2 z-10 pointer-events-none">
                                <Badge className="bg-black/70 backdrop-blur-xl border border-olleey-yellow/30 text-olleey-yellow text-[9px] font-bold uppercase px-4 py-2 rounded-full shadow-lg">
                                    {viewMode === 'original' ? "Source Master" : "4K Localized"}
                                </Badge>
                                <Badge className="bg-black/70 backdrop-blur-xl border border-white/10 text-white/90 text-[9px] font-bold uppercase px-4 py-2 rounded-full shadow-lg">
                                    {viewMode === 'original' ? "Original" : languageName}
                                </Badge>
                            </div>
                        </section>

                        {/* Content Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-10">
                                {viewMode === 'original' ? (
                                    /* Original Mode: Show List of Dubbed Versions */
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/20" : "text-black/30"}`}>Global Localization Hub</h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentVideo?.localizations && Object.entries(currentVideo.localizations).map(([code, loc]: [string, any]) => {
                                                const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
                                                return (
                                                    <motion.button
                                                        key={code}
                                                        whileHover={{ scale: 1.005, y: -2 }}
                                                        onClick={() => handleSwitchToDub(code, loc)}
                                                        className={`w-full flex items-center justify-between p-6 rounded-3xl border ${borderClass} ${cardClass} hover:border-olleey-yellow/30 transition-all group text-left shadow-sm hover:shadow-xl`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-12 h-12 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"} flex items-center justify-center text-xl shadow-inner group-hover:bg-olleey-yellow/10 transition-colors`}>
                                                                {lang?.flag || "🌐"}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-bold transition-colors group-hover:text-olleey-yellow">
                                                                    {lang?.name || code.toUpperCase()} Dub
                                                                </h3>
                                                                <p className={`text-[10px] font-medium ${isDark ? "text-white/30" : "text-black/40"} uppercase tracking-wider mt-1`}>
                                                                    Status: {loc.status || "Processing"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-5">
                                                            <Badge className={cn(
                                                                "border px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                                                                loc.status === 'live'
                                                                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                            )}>
                                                                {loc.status === 'live' ? 'Verified' : 'In Review'}
                                                            </Badge>
                                                            <ChevronLeft className={`w-5 h-5 ${isDark ? "text-white/20" : "text-black/20"} rotate-180 group-hover:text-current group-hover:translate-x-1 transition-all`} />
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    /* Dubbed Mode: Show Asset Manifest */
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/20" : "text-black/30"}`}>Asset Manifest</h2>
                                            <button onClick={handleCopy} className={`${isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"} transition-colors flex items-center gap-2 group`}>
                                                <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">{copied ? "Copied" : "Copy Manifest"}</span>
                                            </button>
                                        </div>
                                        <div className={`p-10 border ${borderClass} ${cardClass} space-y-8 rounded-[2.5rem] shadow-xl relative overflow-hidden`}>
                                            {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-olleey-yellow/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />}

                                            <div className="space-y-6 relative z-10">
                                                <div className="flex items-start justify-between gap-6">
                                                    <h3 className="text-2xl font-bold leading-tight tracking-tight">{videoTitle}</h3>
                                                    <Badge variant="outline" className="rounded-full border-green-500/20 text-green-500 bg-green-500/5 text-[9px] font-bold uppercase px-4 py-1 shrink-0">Production Ready</Badge>
                                                </div>

                                                {/* Meta Row */}
                                                <div className="flex flex-wrap gap-4">
                                                    <div className={`flex items-center gap-3 p-2.5 pr-5 ${isDark ? "bg-white/5" : "bg-gray-100"} border ${borderClass} rounded-2xl`}>
                                                        <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-olleey-yellow/10" : "bg-olleey-yellow/20"} flex items-center justify-center border border-olleey-yellow/10`}>
                                                            <Youtube className="w-5 h-5 text-olleey-yellow" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/30"}`}>Target Feed</span>
                                                            <span className="text-sm font-bold">Olleey Global Labs</span>
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center gap-3 p-2.5 pr-5 ${isDark ? "bg-white/5" : "bg-gray-100"} border ${borderClass} rounded-2xl`}>
                                                        <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-500/20"} flex items-center justify-center border border-blue-500/10`}>
                                                            <Globe className="w-5 h-5 text-blue-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/30"}`}>Local Audience</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold">{languageName}</span>
                                                                <span className="text-sm">{LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.flag}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`h-px ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
                                            <p className={`text-base leading-relaxed font-medium ${isDark ? "text-white/50" : "text-black/60"} relative z-10`}>
                                                {videoDescription || "No localized description available for this production cycle. The automated synthesis engine has processed the visual layer with high-fidelity alignment."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Industrial Metrics */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                                    {[
                                        { label: "Sync Fidelity", value: stats.qualityScore + "%", icon: Zap, color: "text-olleey-yellow" },
                                        { label: "Vocal Latency", value: stats.syncDrift, icon: Monitor, color: "text-blue-400" },
                                        { label: "Cultural Tone", value: stats.culturalMatch, icon: Globe, color: "text-purple-400" },
                                        { label: "AI Synthesis", value: stats.aiProcessing, icon: Layout, color: "text-green-400" }
                                    ].map((metric, i) => (
                                        <div key={i} className={`p-5 border ${borderClass} ${cardClass} space-y-3 rounded-3xl shadow-sm hover:shadow-md transition-shadow`}>
                                            <div className={`flex items-center gap-2 ${isDark ? "text-white/20" : "text-black/30"}`}>
                                                <metric.icon className="w-3.5 h-3.5" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">{metric.label}</span>
                                            </div>
                                            <p className={`text-sm font-bold tracking-tight ${metric.color}`}>{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/20" : "text-black/30"}`}>Visual Identity</h2>
                                    <div className={`aspect-video border-2 ${borderClass} overflow-hidden group/thumb relative rounded-[2.5rem] shadow-2xl transition-all hover:border-olleey-yellow/40`}>
                                        <img
                                            src={quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                                            alt="Localized Thumbnail"
                                            className="w-full h-full object-cover transition-all duration-[2000ms] group-hover/thumb:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/thumb:opacity-40 transition-opacity" />
                                        <div className="absolute inset-x-0 bottom-0 p-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">Active Production Cover</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-8 border-2 border-olleey-yellow/20 bg-olleey-yellow/[0.03] space-y-6 relative overflow-hidden group rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(251,191,36,0.1)]`}>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-olleey-yellow/10 rounded-full -mr-24 -mt-24 blur-[60px] group-hover:bg-olleey-yellow/20 transition-colors" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-olleey-yellow/20 flex items-center justify-center border border-olleey-yellow/30">
                                                <CheckCircle2 className="w-5 h-5 text-olleey-yellow" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-olleey-yellow">Verification Hub</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed font-medium ${isDark ? "text-white/50" : "text-black/60"}`}>
                                            Synthesis protocol completed. This asset is ready for deployment across verified global channels.
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={handlePublish}
                                                disabled={isPublishing || isSavingDraft || viewMode === 'original'}
                                                className="w-full rounded-full bg-olleey-yellow hover:bg-olleey-yellow-dark text-black text-[10px] font-black uppercase tracking-widest h-14 shadow-xl hover:shadow-olleey-yellow/20 transition-all hover:-translate-y-0.5"
                                            >
                                                {isPublishing ? (
                                                    <><RefreshCw className="w-4 h-4 mr-3 animate-spin" /> Publishing...</>
                                                ) : (
                                                    <><Youtube className="w-4 h-4 mr-3" /> Launch to YouTube</>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={handleSaveDraft}
                                                disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                                                className={cn(
                                                    "w-full rounded-full text-[10px] font-black uppercase tracking-widest h-12 transition-all",
                                                    isDark
                                                        ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                                                        : "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black"
                                                )}
                                            >
                                                {isSavingDraft ? (
                                                    <><RefreshCw className="w-4 h-4 mr-3 animate-spin" /> Saving...</>
                                                ) : (
                                                    <><Save className="w-4 h-4 mr-3" /> Save as Draft</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Bottom HUD */}
            <footer className={`h-12 border-t ${borderClass} ${isDark ? "bg-[#050505]" : "bg-white"} flex items-center justify-between px-8 shrink-0 transition-colors`}>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute opacity-40" />
                            <div className="w-2 h-2 rounded-full bg-green-500 relative" />
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-white/40" : "text-black/40"}`}>Production Core: Nominal</span>
                    </div>
                    <span className={`text-[8px] font-mono ${isDark ? "text-white/20" : "text-black/20"} uppercase tracking-widest`}>Asset ID: OLX_{Math.floor(Math.random() * 99999)}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Languages className={`w-3.5 h-3.5 ${isDark ? "text-white/20" : "text-black/20"}`} />
                        <span className={`text-[8px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-white/40" : "text-black/40"}`}>Live Synthesis Active</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
