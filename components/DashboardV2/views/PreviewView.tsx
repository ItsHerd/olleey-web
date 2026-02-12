"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    Pause,
    Save,
    Loader2,
    ChevronRight,
    ArrowLeft
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
import { ViewType } from "../DashboardV2Layout";

interface PreviewViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
}

export function PreviewView({ onViewChange, theme }: PreviewViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { quickCheckState, handleApprove, openReview } = useReview();
    const { toast } = useToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const { selectedProject } = useProject();
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined;
    const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id, user_id: userId });

    const videoIdFromUrl = searchParams.get("video_id");
    const langFromUrl = searchParams.get("lang") || "es";

    const currentVideo = videos.find(v => v.video_id === (quickCheckState.videoId || videoIdFromUrl));

    useEffect(() => {
        const handleRefresh = async () => {
            await refetchVideos();
        };

        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, [refetchVideos]);

    useEffect(() => {
        if (currentVideo && videoIdFromUrl && !quickCheckState.videoId) {
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

    const videoTitle = quickCheckState.videoTitle || currentVideo?.title || "Unnamed Video";
    const videoDescription = quickCheckState.videoDescription || currentVideo?.description || "";
    const dubbedVideoUrl = quickCheckState.dubbedVideoUrl || currentVideo?.localizations?.[langFromUrl]?.video_url || "";
    const originalVideoUrl = quickCheckState.originalVideoUrl || (currentVideo as any)?.storage_url || (currentVideo as any)?.video_url || "";
    const languageCode = quickCheckState.languageCode || langFromUrl;
    const isApproved = quickCheckState.isApproved !== undefined ? quickCheckState.isApproved : (currentVideo?.localizations?.[langFromUrl]?.status === "live");

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

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
            window.dispatchEvent(new CustomEvent('olleey-refresh'));
            onViewChange?.('dashboard');
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
            window.dispatchEvent(new CustomEvent('olleey-refresh'));
            onViewChange?.('dashboard');
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

    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]";
    const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
    const borderClass = isDark ? "border-white/10" : "border-transparent";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-500";

    if (videosLoading && !currentVideo) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#FFC107]" />
                    <p className={`text-sm ${textSecondaryClass} uppercase tracking-widest font-black`}>Loading video...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col overflow-hidden ${bgClass} ${textClass} selection:bg-[#FFC107] selection:text-black transition-colors rounded-tl-xl overflow-y-auto custom-scrollbar`}>
            {/* Header Toolbar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/5" : "border-black/5"} shrink-0 sticky top-0 ${bgClass} z-20`}>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewChange?.("review")}
                        className={`rounded-xl w-9 h-9 ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"} transition-all`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight truncate max-w-[180px] sm:max-w-md">
                            {videoTitle || "Unnamed_Asset"}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            {viewMode === 'original' ? (
                                <Badge className="bg-white/10 text-white/50 border-none text-[8px] h-4 font-black uppercase rounded-lg px-2 tracking-tighter">Source</Badge>
                            ) : isApproved ? (
                                <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] h-4 font-black uppercase rounded-lg px-2 tracking-tighter">Live</Badge>
                            ) : (
                                <Badge className="bg-[#FFC107]/10 text-[#FFC107] border-none text-[8px] h-4 font-black uppercase rounded-lg px-2 tracking-tighter">Ready</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"} rounded-xl p-1 border hidden sm:flex`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('original')}
                            className={cn(
                                "h-7 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'original'
                                    ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm")
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
                                "h-7 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'dubbed'
                                    ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm")
                                    : (isDark ? "text-white/30 hover:text-white" : "text-black/40 hover:text-black")
                            )}
                        >
                            Localized
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                            className={cn(
                                "rounded-xl border h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                                isDark
                                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                    : "bg-white border-black/5 text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {isSavingDraft ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                            {isSavingDraft ? "Saving..." : "Save Draft"}
                        </Button>

                        <Button
                            size="sm"
                            onClick={handlePublish}
                            disabled={isPublishing || isSavingDraft || viewMode === 'original'}
                            className="rounded-xl bg-[#FFC107] hover:bg-[#FFC107]/90 text-black text-[10px] font-black uppercase tracking-widest h-9 px-4 shadow-lg shadow-[#FFC107]/10 transition-all"
                        >
                            {isPublishing ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Youtube className="w-3 h-3 mr-2" />}
                            Launch
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto lg:p-12 p-6">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Video Player Section */}
                    <section
                        className={`relative aspect-video ${cardBgClass} border ${borderClass} group overflow-hidden rounded-xl shadow-2xl cursor-pointer`}
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
                                className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 text-white fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 text-white fill-current pl-1" />
                                )}
                            </motion.div>
                        </div>

                        {/* Cinematic Overlay UI */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10 pointer-events-none">
                            <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-[#FFC107] text-[8px] font-bold uppercase px-3 py-1 rounded-lg">
                                {viewMode === 'original' ? "Source" : "Localized"}
                            </Badge>
                            <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[8px] font-bold uppercase px-3 py-1 rounded-lg">
                                {viewMode === 'original' ? "Original" : languageName}
                            </Badge>
                        </div>
                    </section>

                    {/* Content Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            {viewMode === 'original' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondaryClass}`}>Localization Hub</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentVideo?.localizations && Object.entries(currentVideo.localizations).map(([code, loc]: [string, any]) => {
                                            const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
                                            return (
                                                <motion.button
                                                    key={code}
                                                    whileHover={{ x: 4 }}
                                                    onClick={() => handleSwitchToDub(code, loc)}
                                                    className={`w-full flex items-center justify-between p-5 rounded-xl border ${borderClass} ${cardBgClass} hover:border-[#FFC107]/40 transition-all group text-left`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"} flex items-center justify-center text-lg group-hover:bg-[#FFC107]/10 transition-colors`}>
                                                            {lang?.flag || "🌐"}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold group-hover:text-[#FFC107] transition-colors">
                                                                {lang?.name || code.toUpperCase()} Dub
                                                            </h3>
                                                            <p className={`text-[9px] font-medium ${textSecondaryClass} uppercase tracking-wider mt-0.5`}>
                                                                Status: {loc.status || "Processing"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Badge className={cn(
                                                            "border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg",
                                                            loc.status === 'live'
                                                                ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                                : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                        )}>
                                                            {loc.status === 'live' ? 'Verified' : 'In Review'}
                                                        </Badge>
                                                        <ChevronRight className={`w-4 h-4 ${textSecondaryClass} group-hover:text-current transition-all`} />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondaryClass}`}>Asset Manifest</h2>
                                        <button onClick={handleCopy} className={`${textSecondaryClass} hover:${textClass} transition-colors flex items-center gap-2 group`}>
                                            <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{copied ? "Copied" : "Copy Manifest"}</span>
                                        </button>
                                    </div>
                                    <div className={`p-8 border ${borderClass} ${cardBgClass} space-y-6 rounded-xl shadow-xl`}>
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between gap-6">
                                                <h3 className="text-xl font-bold leading-tight tracking-tight">{videoTitle}</h3>
                                                <Badge variant="outline" className="rounded-lg border-green-500/20 text-green-500 bg-green-500/5 text-[9px] font-bold uppercase px-3 py-1 shrink-0">Production Ready</Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <div className={`flex items-center gap-3 p-2 pr-4 ${isDark ? "bg-white/5" : "bg-black/5"} rounded-xl`}>
                                                    <Youtube className="w-4 h-4 text-[#FFC107]" />
                                                    <span className="text-xs font-bold">Olleey Global Labs</span>
                                                </div>
                                                <div className={`flex items-center gap-3 p-2 pr-4 ${isDark ? "bg-white/5" : "bg-black/5"} rounded-xl`}>
                                                    <Globe className="w-4 h-4 text-blue-500" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold">{languageName}</span>
                                                        <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.flag}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`h-px ${isDark ? "bg-white/5" : "bg-black/5"}`} />
                                        <p className={`text-sm leading-relaxed font-medium ${textSecondaryClass}`}>
                                            {videoDescription || "No localized description available."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Industrial Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: "Sync Fidelity", value: stats.qualityScore + "%", icon: Zap, color: "text-[#FFC107]" },
                                    { label: "Vocal Latency", value: stats.syncDrift, icon: Monitor, color: "text-blue-400" },
                                    { label: "Cultural Tone", value: stats.culturalMatch, icon: Globe, color: "text-purple-400" },
                                    { label: "AI Synthesis", value: stats.aiProcessing, icon: Layout, color: "text-green-400" }
                                ].map((metric, i) => (
                                    <div key={i} className={`p-4 border ${borderClass} ${cardBgClass} space-y-2 rounded-xl`}>
                                        <div className={`flex items-center gap-2 ${textSecondaryClass}`}>
                                            <metric.icon className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.1em]">{metric.label}</span>
                                        </div>
                                        <p className={`text-xs font-bold tracking-tight ${metric.color}`}>{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondaryClass}`}>Visual Identity</h2>
                                <div className={`aspect-video border ${borderClass} overflow-hidden group/thumb relative rounded-xl shadow-xl transition-all hover:border-[#FFC107]/40`}>
                                    <img
                                        src={quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                                        alt="Localized Thumbnail"
                                        className="w-full h-full object-cover transition-all duration-700 group-hover/thumb:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Production Cover</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 border ${isDark ? "border-[#FFC107]/10" : "border-[#FFC107]/20"} ${isDark ? "bg-[#FFC107]/5" : "bg-[#FFC107]/10"} space-y-6 relative overflow-hidden rounded-xl shadow-xl`}>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#FFC107]/20 flex items-center justify-center border border-[#FFC107]/30">
                                            <CheckCircle2 className="w-5 h-5 text-[#FFC107]" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FFC107]">Verification Hub</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed font-medium ${textSecondaryClass}`}>
                                        Synthesis protocol completed. Ready for deployment.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isPublishing || isSavingDraft || viewMode === 'original'}
                                            className="w-full rounded-xl bg-[#FFC107] hover:bg-[#FFC107]/90 text-black text-[10px] font-black uppercase tracking-widest h-11 transition-all"
                                        >
                                            {isPublishing ? "Publishing..." : "Launch to YouTube"}
                                        </Button>
                                        <Button
                                            onClick={handleSaveDraft}
                                            disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                                            className={`w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-11 transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-black/5 text-black"}`}
                                        >
                                            {isSavingDraft ? "Saving..." : "Save Draft"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
