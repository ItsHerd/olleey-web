"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Play, Pause, AlertCircle, CheckCircle, SkipBack, SkipForward,
    Sparkles, Wand2, RefreshCw, Eye, Edit3, Type, Save, Activity, Zap,
    Youtube, Settings, Baby, Shield, ThumbsUp,
    Rss, ImageIcon, Languages, Loader2, Layout, Maximize2,
    ChevronLeft, MoreVertical, ExternalLink, ChevronRight, HelpCircle, Info,
    Monitor, Smartphone, CheckCircle2, Globe, Copy, Trash2, MonitorPlay, BrainCog,
    Calendar, Clock, Lock, ShieldAlert, ChevronDown, Upload
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobsAPI, videosAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { isDemoUser } from "@/lib/mockDemoData";
import { useAuth } from "@/lib/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useDashboardConnections } from "@/lib/useDashboardConnections";
import { YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION } from "@/lib/mockDemoData";
import { resolveClientUserId } from "@/lib/user";
import { ViewType } from "../DashboardLayout";

const AI_GENERATED_THUMBNAIL_URL =
    "https://upload.wikimedia.org/wikipedia/commons/1/13/Garry_Tan%2C_Web_Summit_2018%2C_November_6_SD5_6949_%2845700698642%29%28portrait_4x3_crop%29.jpg";

interface ReviewViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
    selectedJob?: any; 
}

export function ReviewView({ onViewChange, theme, selectedJob }: ReviewViewProps) {
    const searchParams = useSearchParams();
    const jobIdFromUrl = searchParams.get("job_id") || selectedJob?.job_id;
    const videoIdFromUrl = searchParams.get("video_id") || selectedJob?.video_id;
    const langFromUrl = searchParams.get("lang");
    const { user } = useAuth();
    const userId = resolveClientUserId(user?.id) || "demo-user";
    const { toast } = useToast();
    const isDark = theme === "dark";
    
    // State from ReviewContext
    const { 
        quickCheckState,
        openReview 
    } = useReview();

    const {
        videoId, 
        languageCode, 
        originalVideoUrl, 
        dubbedVideoUrl, 
        videoTitle, 
        videoDescription,
        thumbnailUrl,
        localizedTitle: baseLocalizedTitle,
        localizedDescription: baseLocalizedDescription,
        isApproved,
        jobId: quickCheckJobId
    } = quickCheckState;

    const { videos } = useVideos();
    const { connections } = useDashboardConnections({ enabled: !!userId });

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";
    const activeVideoId = videoId || videoIdFromUrl || null;
    const activeJobId = quickCheckJobId || jobIdFromUrl || selectedJob?.job_id || activeVideoId;
    const selectedVideo =
        videos.find((v) => v.video_id === activeVideoId) ||
        (isDemoUser(userId) && activeVideoId === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO as any : null);
    const selectedLocalization = languageCode
        ? ((selectedVideo?.localizations as any)?.[languageCode] || null)
        : null;
    const resolvedOriginalVideoUrl =
        originalVideoUrl ||
        (selectedVideo as any)?.storage_url ||
        (selectedVideo as any)?.video_url ||
        "";
    const resolvedDubbedVideoUrl =
        dubbedVideoUrl ||
        selectedLocalization?.dubbed_video_url ||
        selectedLocalization?.storage_url ||
        selectedLocalization?.video_url ||
        "";

    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeAudioSource, setActiveAudioSource] = useState<"original" | "dubbed">("dubbed");
    const [isSynchronized, setIsSynchronized] = useState(true);

    const [localizedTitle, setLocalizedTitle] = useState("");
    const [localizedDescription, setLocalizedDescription] = useState("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isPostingDraft, setIsPostingDraft] = useState(false);
    const [isDiscardingReview, setIsDiscardingReview] = useState(false);
    const [showAiGeneratedThumbnail, setShowAiGeneratedThumbnail] = useState(false);
    const [activeThumbnailSource, setActiveThumbnailSource] = useState<"primary" | "ai">("primary");
    const [step, setStep] = useState<'review' | 'select_channel'>('review');
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch jobs to get target languages
    const { jobs: allJobs } = useDashboardJobs({ user_id: userId });
    const currentJob = allJobs.find(j => j.job_id === (quickCheckJobId || jobIdFromUrl || selectedJob?.job_id));
    const targetLanguages = currentJob?.target_languages || [];
    const actionableJobId = currentJob?.job_id || quickCheckJobId || jobIdFromUrl || selectedJob?.job_id || null;

    useEffect(() => {
        if (baseLocalizedTitle) setLocalizedTitle(baseLocalizedTitle);
        if (baseLocalizedDescription) setLocalizedDescription(baseLocalizedDescription);
    }, [baseLocalizedTitle, baseLocalizedDescription]);

    useEffect(() => {
        if (!selectedLocalization) return;
        if (!baseLocalizedTitle && selectedLocalization.title) {
            setLocalizedTitle(selectedLocalization.title);
        }
        if (!baseLocalizedDescription && selectedLocalization.description) {
            setLocalizedDescription(selectedLocalization.description);
        }
    }, [selectedLocalization, baseLocalizedTitle, baseLocalizedDescription]);

    useEffect(() => {
        if (!selectedChannel && connections.length > 0) {
            setSelectedChannel(connections[0].youtube_channel_id);
        }
    }, [connections, selectedChannel]);

    useEffect(() => {
        setShowAiGeneratedThumbnail(false);
        setActiveThumbnailSource("primary");
    }, [activeVideoId, languageCode]);

    useEffect(() => {
        if (!resolvedDubbedVideoUrl && activeAudioSource === "dubbed") {
            setActiveAudioSource("original");
        }
    }, [resolvedDubbedVideoUrl, activeAudioSource]);

    useEffect(() => {
        if (originalVideoRef.current) {
            originalVideoRef.current.muted = activeAudioSource !== "original";
        }
        if (dubbedVideoRef.current) {
            dubbedVideoRef.current.muted = activeAudioSource !== "dubbed";
        }
    }, [activeAudioSource, resolvedOriginalVideoUrl, resolvedDubbedVideoUrl]);

    const handleSwitchLanguage = (langCode: string) => {
        if (langCode === languageCode) return;
        if (!activeVideoId) {
            toast("Video data not found", "error");
            return;
        }
        
        const resolvedVideoId = activeVideoId;
        const video = videos.find(v => v.video_id === resolvedVideoId);
        const targetVideo = video || (isDemoUser(userId) && resolvedVideoId === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO : null);
        
        if (!targetVideo) {
            toast("Video data not found", "error");
            return;
        }

        const localization = (resolvedVideoId === "demo_yc_ceo_video_001" && langCode === "es")
            ? YC_CEO_SPANISH_TRANSLATION 
            : (targetVideo.localizations as any)?.[langCode];

        openReview({
            videoId: resolvedVideoId!,
            languageCode: langCode,
            jobId: jobIdFromUrl,
            originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
            dubbedVideoUrl: localization?.dubbed_video_url || localization?.storage_url || localization?.video_url || "",
            videoTitle: targetVideo.title,
            videoDescription: targetVideo.description || "",
            thumbnailUrl: targetVideo.thumbnail_url,
            localizedTitle: localization?.title || "",
            localizedDescription: localization?.description || "",
            isApproved: localization?.status === 'approved',
            approvedAt: targetVideo.published_at,
            navigate: false
        });
        
        // Reset local state for title/description
        setLocalizedTitle(localization?.title || "");
        setLocalizedDescription(localization?.description || "");
        
        toast(`Switched to ${LANGUAGE_OPTIONS.find(l => l.code === langCode)?.name}`, "success");
    };

    const togglePlay = () => {
        const vids = [];
        if (originalVideoRef.current) vids.push(originalVideoRef.current);
        if (dubbedVideoRef.current) vids.push(dubbedVideoRef.current);

        if (isPlaying) {
            vids.forEach(v => v.pause());
        } else {
            vids.forEach(v => v.play());
        }
        setIsPlaying(!isPlaying);
    };

    const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (isSynchronized) {
            const otherVideo = video === originalVideoRef.current ? dubbedVideoRef.current : originalVideoRef.current;
            if (otherVideo && Math.abs(video.currentTime - otherVideo.currentTime) > 0.1) {
                otherVideo.currentTime = video.currentTime;
            }
        }
        if (video === dubbedVideoRef.current) {
            setCurrentTime(video.currentTime);
        }
    };

    const handleGenerateMetadataWithAI = async (type: "title" | "description" | "thumbnail") => {
        setIsGeneratingAI(true);
        toast(`Generating ${type} with AI...`);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        if (type === "title") setLocalizedTitle(`${videoTitle || "Localized Video"} - ${languageName} Edition`);
        if (type === "description") setLocalizedDescription(`${videoDescription || "Localized description."}\n\nProcessed by Olleey for ${languageName} audience.`);
        if (type === "thumbnail") {
            setShowAiGeneratedThumbnail(true);
            setActiveThumbnailSource("ai");
        }
        setIsGeneratingAI(false);
        toast(`AI ${type} generated successfully!`, "success");
    };

    const handleFinalize = async () => {
        if (!activeJobId || !languageCode) {
            toast("Missing review context for draft posting", "error");
            return;
        }
        if (!selectedChannel) {
            toast("Select a destination channel first", "error");
            return;
        }

        setIsPostingDraft(true);
        try {
            await jobsAPI.updateLocalizedVideo(activeJobId, languageCode, {
                title: localizedTitle,
                description: localizedDescription,
            });
            await jobsAPI.saveDraft(activeJobId, languageCode, {
                channelId: selectedChannel,
                postToYouTube: true,
            });
            window.dispatchEvent(new CustomEvent('olleey-refresh'));
            toast("Posted to YouTube as draft", "success");
            onViewChange?.("dashboard");
        } catch (error: any) {
            toast(error?.message || "Failed to post draft", "error");
        } finally {
            setIsPostingDraft(false);
        }
    };

    const handleActionClick = async () => {
        if (step === 'review') {
            setStep('select_channel');
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            await handleFinalize();
        }
    };

    const handleDiscardReview = async () => {
        if (!actionableJobId || !languageCode) {
            toast("Missing job context for discarding review", "error");
            return;
        }

        const confirmed = window.confirm(
            `Discard ${languageName} review? This will mark it as rejected and remove it from review queue.`
        );
        if (!confirmed) return;

        setIsDiscardingReview(true);
        try {
            await jobsAPI.rejectVideos(actionableJobId, {
                language_codes: [languageCode],
                reason: "discarded_in_review",
                feedback: "Discarded by user from review view",
            });

            window.dispatchEvent(new CustomEvent("olleey-job-section-update", { detail: { jobId: actionableJobId } }));
            window.dispatchEvent(new CustomEvent("olleey-refresh"));
            toast("Review discarded", "success");
            onViewChange?.("dashboard");
        } catch (error: any) {
            toast(error?.message || "Failed to discard review", "error");
        } finally {
            setIsDiscardingReview(false);
        }
    };

    if (!videoIdFromUrl && !quickCheckState.videoId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 border"><RefreshCw className="w-6 h-6 text-muted-foreground" /></div>
                <h2 className="text-lg font-semibold mb-2">No review session active</h2>
                <Button onClick={() => onViewChange?.("dashboard")} variant="outline" size="sm">Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden relative" id="review-video-container">
            {/* Main Content */}
            <main className={cn("flex-1 min-h-0 overflow-hidden flex justify-center", isDark ? "bg-[#0A0A0A]" : "bg-muted/5")}>
                <div className="w-full max-w-[1300px] flex h-full min-h-0">
                    {/* Left Column: Metadata Editor */}
                    <div 
                        ref={scrollContainerRef}
                        className={cn("w-[360px] border-r flex flex-col overflow-hidden min-h-0", isDark ? "bg-[#141414] border-white/10" : "bg-card border-border")}
                    >
                        <div className="flex-1 flex flex-col justify-between p-5 lg:p-6 space-y-5 min-h-0">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <button 
                                        onClick={() => onViewChange?.("dashboard")}
                                        className={cn(
                                            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mb-2 group",
                                            isDark ? "text-white/20 hover:text-white" : "text-muted-foreground/40 hover:text-primary"
                                        )}
                                    >
                                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                                        Dashboard
                                    </button>
                                    <h2 className={cn("text-xl font-black tracking-tight uppercase leading-none", isDark ? "text-white" : "text-foreground")}>Review</h2>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className={cn(
                                            "flex items-center gap-1.5 focus:outline-none group h-7 px-2 rounded-lg border transition-colors",
                                            isDark 
                                                ? "border-white/10 bg-white/5 hover:bg-white/10" 
                                                : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                                        )}>
                                            <span className={cn("text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5", isDark ? "text-white" : "text-primary")}>
                                                {getLanguageFlag(languageCode || 'es')} {languageName}
                                            </span>
                                            <ChevronDown className={cn("h-2.5 w-2.5 opacity-50 transition-transform group-data-[state=open]:rotate-180", isDark ? "text-white" : "text-primary")} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className={cn("w-56 shadow-2xl rounded-2xl p-1.5 z-[100]", isDark ? "bg-[#141414] border-white/10" : "bg-card border-border")}>
                                        <div className={cn("px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-b mb-1.5", isDark ? "text-white/40 border-white/5" : "text-muted-foreground/40 border-border/50")}>Switch Language</div>
                                        <div className="space-y-0.5">
                                            {targetLanguages.map(lang => (
                                                <DropdownMenuItem 
                                                    key={lang} 
                                                    onClick={() => handleSwitchLanguage(lang)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all",
                                                        lang === languageCode 
                                                            ? isDark ? "bg-white/10 text-white" : "bg-primary/10 text-primary" 
                                                            : isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-muted"
                                                    )}
                                                >
                                                    <span className="text-lg leading-none filter drop-shadow-sm">{getLanguageFlag(lang)}</span>
                                                    <div className="flex flex-col">
                                                        <span className="leading-tight">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.name || lang.toUpperCase()}</span>
                                                        <span className="text-[9px] opacity-50 font-medium uppercase tracking-tighter">Target Market</span>
                                                    </div>
                                                    {lang === languageCode && <CheckCircle2 className={cn("h-4 w-4 ml-auto fill-current", isDark ? "text-white" : "text-primary")} />}
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 'review' ? (
                                    <motion.div 
                                        key="review-step"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-6"
                                    >
                                        {/* Metadata Section */}
                                        <section className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <h3 className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white/40" : "text-muted-foreground")}>Localized Metadata</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className={cn(
                                                            "h-7 text-[8px] font-black uppercase tracking-wider border-dashed px-2",
                                                            isDark 
                                                                ? "bg-white/5 border-zinc-700 text-white hover:bg-white/10 hover:border-zinc-500" 
                                                                : "border-primary/20 text-primary hover:bg-primary/5"
                                                        )}
                                                        onClick={() => handleGenerateMetadataWithAI("title")}
                                                        disabled={isGeneratingAI}
                                                    >
                                                        <Sparkles className={cn("h-2.5 w-2.5 mr-1", isGeneratingAI && "animate-spin")} /> 
                                                        AI Variant
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <div className={cn(
                                                    "p-4 rounded-xl border transition-all",
                                                    isDark 
                                                        ? "bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-white/10" 
                                                        : "bg-muted/30 border-border focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20"
                                                )}>
                                                    <label className={cn("text-[9px] font-black uppercase tracking-[0.2em] block mb-2", isDark ? "text-white/30" : "text-muted-foreground/50")}>Meta Title</label>
                                                    <textarea 
                                                        className={cn(
                                                            "w-full bg-transparent border-none focus:ring-0 text-base font-black resize-none outline-none leading-tight",
                                                            isDark ? "text-white placeholder:text-white/20" : "text-foreground placeholder:text-muted-foreground/20"
                                                        )} 
                                                        rows={1}
                                                        value={localizedTitle} 
                                                        onChange={(e) => setLocalizedTitle(e.target.value)} 
                                                        placeholder="Enter translated title..."
                                                    />
                                                    <div className={cn("flex justify-end pt-1.5 border-t", isDark ? "border-white/5" : "border-muted/10")}>
                                                        <span className={cn("text-[8px] font-bold font-mono", isDark ? "text-white/20" : "text-muted-foreground/40")}>{localizedTitle.length}/100</span>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "p-4 rounded-xl border transition-all",
                                                    isDark 
                                                        ? "bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-white/10" 
                                                        : "bg-muted/30 border-border focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20"
                                                )}>
                                                    <label className={cn("text-[9px] font-black uppercase tracking-[0.2em] block mb-2", isDark ? "text-white/30" : "text-muted-foreground/50")}>Meta Description</label>
                                                    <textarea 
                                                        className={cn(
                                                            "w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium resize-none outline-none leading-relaxed",
                                                            isDark ? "text-white/80 placeholder:text-white/20" : "text-foreground placeholder:text-muted-foreground/20"
                                                        )} 
                                                        rows={5}
                                                        value={localizedDescription} 
                                                        onChange={(e) => setLocalizedDescription(e.target.value)} 
                                                        placeholder="Enter translated description..."
                                                    />
                                                    <div className={cn("flex justify-end pt-1.5 border-t", isDark ? "border-white/5" : "border-muted/10")}>
                                                        <span className={cn("text-[8px] font-bold font-mono", isDark ? "text-white/20" : "text-muted-foreground/40")}>{localizedDescription.length}/5000</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Thumbnail Selector Section */}
                                        <section className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <h3 className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white/40" : "text-muted-foreground")}>Localized Thumbnail</h3>
                                                    <p className={cn("text-[10px] font-bold", isDark ? "text-white/20" : "text-muted-foreground")}>Visual representation</p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    variant="outline"
                                                    className={cn(
                                                        "h-7 font-black text-[8px] uppercase tracking-wider border-dashed px-2",
                                                        isDark 
                                                            ? "bg-white/5 border-zinc-700 text-white hover:bg-white/10 hover:border-zinc-500" 
                                                            : "border-primary/20 text-primary hover:bg-primary/5"
                                                    )}
                                                    onClick={() => handleGenerateMetadataWithAI("thumbnail")}
                                                    disabled={isGeneratingAI}
                                                >
                                                    <Sparkles className={cn("h-2.5 w-2.5 mr-1", isGeneratingAI && "animate-spin")} />
                                                    AI Generate
                                                </Button>
                                            </div>
                                            
                                            <div className={cn("grid gap-3", showAiGeneratedThumbnail ? "grid-cols-2" : "grid-cols-1")}>
                                                <button
                                                    onClick={() => setActiveThumbnailSource("primary")}
                                                    className={cn(
                                                        "aspect-video border-2 rounded-xl relative overflow-hidden group shadow-lg transition-colors",
                                                        activeThumbnailSource === "primary"
                                                            ? (isDark ? "border-white" : "border-primary")
                                                            : (isDark ? "border-white/20" : "border-border")
                                                    )}
                                                >
                                                    <img src={thumbnailUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342f22c?auto=format&fit=crop&q=80&w=300&h=169"} alt="Primary thumbnail" className="w-full h-full object-cover" />
                                                    <div className={cn("absolute inset-0", activeThumbnailSource === "primary" ? (isDark ? "bg-white/10" : "bg-primary/20") : "bg-black/10")} />
                                                    {activeThumbnailSource === "primary" && (
                                                        <div className={cn("absolute top-2 right-2 p-1 rounded-full shadow-lg", isDark ? "bg-white text-black" : "bg-primary text-primary-foreground")}>
                                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 left-2 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider">Primary</div>
                                                </button>

                                                {showAiGeneratedThumbnail && (
                                                    <button
                                                        onClick={() => setActiveThumbnailSource("ai")}
                                                        className={cn(
                                                            "aspect-video border-2 rounded-xl relative overflow-hidden group shadow-lg transition-colors",
                                                            activeThumbnailSource === "ai"
                                                                ? (isDark ? "border-white" : "border-primary")
                                                                : (isDark ? "border-white/20" : "border-border")
                                                        )}
                                                    >
                                                        <img src={AI_GENERATED_THUMBNAIL_URL} alt="AI generated thumbnail" className="w-full h-full object-cover" />
                                                        <div className={cn("absolute inset-0", activeThumbnailSource === "ai" ? (isDark ? "bg-white/10" : "bg-primary/20") : "bg-black/10")} />
                                                        {activeThumbnailSource === "ai" && (
                                                            <div className={cn("absolute top-2 right-2 p-1 rounded-full shadow-lg", isDark ? "bg-white text-black" : "bg-primary text-primary-foreground")}>
                                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-2 left-2 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider">AI Generated</div>
                                                    </button>
                                                )}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-wider",
                                                    isDark
                                                        ? "bg-white/5 border-zinc-700 text-white hover:bg-white/10 hover:border-zinc-500"
                                                        : "bg-card border-border text-foreground hover:bg-muted/40"
                                                )}
                                            >
                                                <Upload className="h-3.5 w-3.5 mr-1.5" />
                                                Upload Thumbnail
                                            </Button>
                                        </section>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="channel-step"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setStep('review')}
                                                className={cn("p-2 rounded-xl border transition-all", isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-muted border-border hover:bg-muted/80")}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <div className="flex flex-col">
                                                <h3 className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white" : "text-muted-foreground")}>Select Channel</h3>
                                                <p className={cn("text-[10px] font-bold", isDark ? "text-white/20" : "text-muted-foreground")}>Destination destination</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {connections.map((channel) => (
                                                <button
                                                    key={channel.youtube_channel_id}
                                                    onClick={() => setSelectedChannel(channel.youtube_channel_id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all text-left group",
                                                        selectedChannel === channel.youtube_channel_id
                                                            ? (isDark ? "bg-white/10 border-white/20 ring-2 ring-white/10" : "bg-primary/5 border-primary ring-2 ring-primary/10")
                                                            : (isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-card border-border hover:bg-muted/50")
                                                    )}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={channel.channel_avatar_url || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop"}
                                                            alt={channel.youtube_channel_name || "YouTube channel"}
                                                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-black/10 group-hover:scale-105 transition-transform"
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-lg shadow-lg">
                                                            <Youtube className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col">
                                                        <span className={cn("font-black text-sm", isDark ? "text-white" : "text-foreground")}>
                                                            {channel.youtube_channel_name || "YouTube Channel"}
                                                        </span>
                                                        <span className={cn("text-[10px] font-bold opacity-40 uppercase tracking-tighter", isDark ? "text-white" : "text-muted-foreground")}>
                                                            {channel.youtube_channel_id}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedChannel === channel.youtube_channel_id
                                                            ? (isDark ? "bg-white border-white" : "bg-primary border-primary")
                                                            : (isDark ? "border-white/10" : "border-border")
                                                    )}>
                                                        {selectedChannel === channel.youtube_channel_id && <CheckCircle2 className={cn("h-3.5 w-3.5", isDark ? "text-black" : "text-white")} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={cn("pt-4 border-t space-y-3 text-center", isDark ? "border-white/5" : "border-muted/10")}>
                                <Button 
                                    onClick={handleActionClick} 
                                    disabled={(step === 'select_channel' && (!selectedChannel || isPostingDraft)) || isPostingDraft}
                                    className={cn(
                                        "w-full h-10 font-black text-[11px] transition-all gap-2.5 rounded-xl shadow-xl",
                                        isDark 
                                            ? "bg-white text-black hover:bg-white/90 shadow-white/5" 
                                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                                    )}
                                >
                                    {step === 'review' ? (
                                        <>Select Channel <ChevronRight className="h-4 w-4" /></>
                                    ) : (
                                        <>{isPostingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Post as Draft</>
                                    )}
                                </Button>
                                {step === 'review' && (
                                    <Button
                                        onClick={handleDiscardReview}
                                        disabled={!actionableJobId || !languageCode || isDiscardingReview}
                                        variant="outline"
                                        className={cn(
                                            "w-full h-10 font-black text-[11px] transition-all gap-2 rounded-xl",
                                            isDark
                                                ? "bg-transparent border-red-400/30 text-red-300 hover:bg-red-500/10 hover:border-red-400/50"
                                                : "bg-transparent border-red-500/30 text-red-600 hover:bg-red-50 hover:border-red-500/50"
                                        )}
                                    >
                                        {isDiscardingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Discard Review
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Video Preview */}
                    <div className={cn("flex-1 flex flex-col relative overflow-hidden border-r min-h-0", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-background border-border")}>
                        <div className="h-full flex items-center justify-center p-5 lg:p-6 overflow-hidden">
                                <div className="w-full max-w-[620px] space-y-4">
                                <div className={cn("rounded-[24px] overflow-hidden border shadow-2xl bg-black", isDark ? "border-white/10" : "dark:border-white/10")}>
                                    {/* Original Video */}
                                    <div 
                                        className={cn(
                                            "aspect-video relative cursor-pointer border-2 rounded-t-[24px] overflow-hidden transition-colors",
                                            activeAudioSource === "original"
                                                ? "border-emerald-400/80"
                                                : "border-transparent"
                                        )}
                                        onClick={() => setActiveAudioSource("original")}
                                    >
                                        <video 
                                            ref={originalVideoRef} 
                                            src={resolvedOriginalVideoUrl || undefined} 
                                            className="w-full h-full object-contain pointer-events-none" 
                                            muted={activeAudioSource !== "original"} 
                                            onTimeUpdate={handleVideoTimeUpdate} 
                                        />
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-tighter h-4.5 px-1 border-dashed bg-black/40 backdrop-blur-md text-white border-white/20">
                                                English (Original){isPlaying && activeAudioSource === "original" ? " • Live" : ""}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Divider Line */}
                                    <div className="h-[1px] w-full bg-white/20" />

                                    {/* Dubbed Video */}
                                    <div 
                                        className={cn(
                                            "aspect-video relative cursor-pointer border-2 rounded-b-[24px] overflow-hidden transition-colors",
                                            activeAudioSource === "dubbed"
                                                ? "border-emerald-400/80"
                                                : "border-transparent"
                                        )}
                                        onClick={() => {
                                            if (!resolvedDubbedVideoUrl) return;
                                            setActiveAudioSource("dubbed");
                                        }}
                                    >
                                        <video 
                                            ref={dubbedVideoRef} 
                                            src={resolvedDubbedVideoUrl || undefined} 
                                            className="w-full h-full object-contain pointer-events-none" 
                                            muted={activeAudioSource !== "dubbed"} 
                                            onTimeUpdate={handleVideoTimeUpdate} 
                                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                        />
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-tighter h-4.5 px-1 border-primary/20 text-primary bg-black/40 backdrop-blur-md">
                                                {languageName} (Neural Output){isPlaying && activeAudioSource === "dubbed" ? " • Live" : ""}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-1.5">
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className={cn(
                                                "h-9 px-3 font-black text-[9px] uppercase tracking-wider rounded-xl gap-2 hover:scale-105 active:scale-95 transition-all",
                                                isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : ""
                                            )}
                                            onClick={togglePlay}
                                        >
                                            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                            {isPlaying ? "Pause" : "Preview"}
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={cn(
                                                    "h-8 font-bold text-[9px] uppercase tracking-wider px-2 gap-1.5", 
                                                    isSynchronized 
                                                        ? isDark ? "text-white" : "text-primary" 
                                                        : isDark ? "text-white/40" : "text-muted-foreground"
                                                )}
                                                onClick={() => setIsSynchronized(!isSynchronized)}
                                            >
                                                <MonitorPlay className="h-3.5 w-3.5" />
                                                {isSynchronized ? "Linked" : "Independent"}
                                            </Button>
                                            <div className={cn(
                                                "h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider",
                                                isDark ? "bg-white/5 border-white/10 text-white/80" : "bg-muted/30 border-border text-muted-foreground"
                                            )}>
                                                <span className={cn("inline-block w-1.5 h-1.5 rounded-full", isPlaying ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
                                                {activeAudioSource === "original" ? "Now Playing: Original" : `Now Playing: ${languageName}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 font-mono text-[9px] font-black px-2 py-1 rounded-md border",
                                        isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-muted/30 border-border text-muted-foreground"
                                    )}>
                                        <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                                        <span className="opacity-30">/</span>
                                        <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
