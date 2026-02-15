"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Play, Pause, AlertCircle, CheckCircle, Volume2, SkipBack, SkipForward,
    Sparkles, Wand2, RefreshCw, Eye, Edit3, Type, Save, Activity, Zap,
    ShieldCheck, Youtube, Settings, Baby, Shield, ThumbsUp,
    Rss, ImageIcon, Languages, Loader2, Layout, Maximize2,
    ChevronLeft, MoreVertical, ExternalLink, ChevronRight, HelpCircle, Info,
    Monitor, Smartphone, CheckCircle2, Globe, Copy, Trash2, Plus, MonitorPlay, BrainCog,
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
import { YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION } from "@/lib/mockDemoData";
import { ViewType } from "../DashboardLayout";

const MOCK_CHANNELS = [
    { id: 'ch1', name: 'Olleey Main', handle: '@olleey', icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
    { id: 'ch2', name: 'Global Shorts', handle: '@global_shorts', icon: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop' },
    { id: 'ch3', name: 'Tech Reviews ES', handle: '@tech_es', icon: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=100&fit=crop' },
];

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
    const userId = user?.id || "demo-user";
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
        isApproved
    } = quickCheckState;

    const { videos } = useVideos();

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [isSynchronized, setIsSynchronized] = useState(true);

    const [localizedTitle, setLocalizedTitle] = useState("");
    const [localizedDescription, setLocalizedDescription] = useState("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [step, setStep] = useState<'review' | 'select_channel'>('review');
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch jobs to get target languages
    const { jobs: allJobs } = useDashboardJobs({ user_id: userId });
    const currentJob = allJobs.find(j => j.job_id === jobIdFromUrl);
    const targetLanguages = currentJob?.target_languages || [];

    useEffect(() => {
        if (baseLocalizedTitle) setLocalizedTitle(baseLocalizedTitle);
        if (baseLocalizedDescription) setLocalizedDescription(baseLocalizedDescription);
    }, [baseLocalizedTitle, baseLocalizedDescription]);

    const handleSwitchLanguage = (langCode: string) => {
        if (langCode === languageCode) return;
        
        const video = videos.find(v => v.video_id === videoId);
        const targetVideo = video || (isDemoUser(userId) && videoId === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO : null);
        
        if (!targetVideo) {
            toast("Video data not found", "error");
            return;
        }

        const localization = (videoId === "demo_yc_ceo_video_001" && langCode === "es") 
            ? YC_CEO_SPANISH_TRANSLATION 
            : (targetVideo.localizations as any)?.[langCode];

        openReview({
            videoId: videoId!,
            languageCode: langCode,
            jobId: jobIdFromUrl,
            originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
            dubbedVideoUrl: localization?.dubbed_video_url || "",
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
        setIsGeneratingAI(false);
        toast(`AI ${type} generated successfully!`, "success");
    };

    const handleFinalize = () => {
        toast("Video finalized and scheduled for upload!", "success");
        onViewChange?.("dashboard");
    };

    const handleActionClick = () => {
        if (step === 'review') {
            setStep('select_channel');
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleFinalize();
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
            <main className={cn("flex-1 overflow-hidden flex justify-center", isDark ? "bg-[#0A0A0A]" : "bg-muted/5")}>
                <div className="w-full max-w-[1300px] flex h-full">
                    {/* Left Column: Metadata Editor */}
                    <div 
                        ref={scrollContainerRef}
                        className={cn("w-[380px] border-r flex flex-col overflow-y-auto custom-scrollbar", isDark ? "bg-[#141414] border-white/10" : "bg-card border-border")}
                    >
                        <div className="flex-1 flex flex-col justify-center p-8 space-y-10 min-h-full">
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
                                        className="space-y-10"
                                    >
                                        {/* Metadata Section */}
                                        <section className="space-y-4">
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
                                                                ? "bg-white/5 border-white/20 text-white hover:bg-white/10" 
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

                                            <div className="space-y-3">
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
                                        <section className="space-y-4">
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
                                                            ? "bg-white/5 border-white/20 text-white hover:bg-white/10" 
                                                            : "border-primary/20 text-primary hover:bg-primary/5"
                                                    )}
                                                    onClick={() => handleGenerateMetadataWithAI("thumbnail")}
                                                    disabled={isGeneratingAI}
                                                >
                                                    <Sparkles className={cn("h-2.5 w-2.5 mr-1", isGeneratingAI && "animate-spin")} />
                                                    AI Variant
                                                </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className={cn("aspect-video border-2 rounded-xl relative overflow-hidden group shadow-lg", isDark ? "border-white" : "border-primary")}>
                                                    <img src={thumbnailUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342f22c?auto=format&fit=crop&q=80&w=300&h=169"} alt="Main" className="w-full h-full object-cover" />
                                                    <div className={cn("absolute inset-0", isDark ? "bg-white/10" : "bg-primary/20")} />
                                                    <div className={cn("absolute top-2 right-2 p-1 rounded-full shadow-lg", isDark ? "bg-white text-black" : "bg-primary text-primary-foreground")}><CheckCircle2 className="h-2.5 w-2.5" /></div>
                                                    <div className="absolute bottom-2 left-2 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider">Primary</div>
                                                </button>
                                                
                                                <button className={cn(
                                                    "aspect-video border border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-all group overflow-hidden relative grayscale opacity-60 hover:opacity-100 hover:grayscale-0",
                                                    isDark ? "border-white/10 hover:bg-white/5" : "border-muted-foreground/20 hover:bg-muted/30"
                                                )}>
                                                    <img src={thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=169"} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                                        <Plus className="h-4 w-4 text-white" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Upload</span>
                                                    </div>
                                                </button>
                                            </div>
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
                                            {MOCK_CHANNELS.map((channel) => (
                                                <button
                                                    key={channel.id}
                                                    onClick={() => setSelectedChannel(channel.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all text-left group",
                                                        selectedChannel === channel.id
                                                            ? (isDark ? "bg-white/10 border-white/20 ring-2 ring-white/10" : "bg-primary/5 border-primary ring-2 ring-primary/10")
                                                            : (isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-card border-border hover:bg-muted/50")
                                                    )}
                                                >
                                                    <div className="relative">
                                                        <img src={channel.icon} alt={channel.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-black/10 group-hover:scale-105 transition-transform" />
                                                        <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-lg shadow-lg">
                                                            <Youtube className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col">
                                                        <span className={cn("font-black text-sm", isDark ? "text-white" : "text-foreground")}>{channel.name}</span>
                                                        <span className={cn("text-[10px] font-bold opacity-40 uppercase tracking-tighter", isDark ? "text-white" : "text-muted-foreground")}>{channel.handle}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedChannel === channel.id
                                                            ? (isDark ? "bg-white border-white" : "bg-primary border-primary")
                                                            : (isDark ? "border-white/10" : "border-border")
                                                    )}>
                                                        {selectedChannel === channel.id && <CheckCircle2 className={cn("h-3.5 w-3.5", isDark ? "text-black" : "text-white")} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className={cn("p-6 rounded-3xl border border-dashed flex flex-col items-center gap-4 group cursor-pointer transition-all", isDark ? "border-white/10 hover:bg-white/5" : "border-border hover:bg-primary/5")}>
                                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-90", isDark ? "bg-white/5 text-white" : "bg-muted text-foreground")}>
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest", isDark ? "text-white" : "text-foreground")}>Connect New Channel</span>
                                                <span className={cn("text-[8px] font-bold opacity-30 uppercase tracking-tighter", isDark ? "text-white" : "text-muted-foreground")}>Add destination Hub</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={cn("pt-6 border-t space-y-4 text-center", isDark ? "border-white/5" : "border-muted/10")}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="relative group cursor-help">
                                        <div className={cn("p-1.5 rounded-full transition-all group-hover:scale-110", isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/10 text-emerald-500")}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        
                                        {/* Premium Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 pointer-events-none z-50">
                                            <div className={cn(
                                                "px-3 py-2 rounded-xl text-[10px] font-bold shadow-2xl border whitespace-nowrap",
                                                isDark ? "bg-[#1A1A1A] border-white/10 text-white" : "bg-white border-border text-foreground"
                                            )}>
                                                Neural sync & market readiness validated
                                                <div className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b", isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-border")} />
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", isDark ? "text-white/40" : "text-foreground")}>Quality Verified</h4>
                                </div>
                                <Button 
                                    onClick={handleActionClick} 
                                    className={cn(
                                        "w-full h-12 font-black text-xs transition-all gap-3 rounded-xl shadow-xl",
                                        isDark 
                                            ? "bg-white text-black hover:bg-white/90 shadow-white/5" 
                                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                                    )}
                                >
                                    {step === 'review' ? (
                                        <>Select Channel <ChevronRight className="h-4 w-4" /></>
                                    ) : (
                                        <><Upload className="h-4 w-4" /> Upload</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Video Preview */}
                    <div className={cn("flex-1 flex flex-col relative overflow-hidden border-r", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-background border-border")}>
                        <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                            <div className="w-full max-w-[650px] space-y-6">
                                <div className="space-y-1 pl-1">
                                    <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-white/20" : "text-muted-foreground/30")}>Visual Verification</h3>
                                </div>
                                <div className={cn("rounded-[24px] overflow-hidden border shadow-2xl bg-black", isDark ? "border-white/10" : "dark:border-white/10")}>
                                    {/* Original Video */}
                                    <div 
                                        className="aspect-video relative group cursor-pointer"
                                        onClick={togglePlay}
                                    >
                                        <video 
                                            ref={originalVideoRef} 
                                            src={originalVideoUrl || undefined} 
                                            className="w-full h-full object-contain pointer-events-none" 
                                            muted={originalMuted} 
                                            onTimeUpdate={handleVideoTimeUpdate} 
                                        />
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-tighter h-4.5 px-1 border-dashed bg-black/40 backdrop-blur-md text-white border-white/20">English (Original)</Badge>
                                            <button onClick={(e) => { e.stopPropagation(); setOriginalMuted(!originalMuted); }} className="p-1.5 w-fit rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-md border border-white/10">
                                                {originalMuted ? <Volume2 className="h-3.5 w-3.5 opacity-40" /> : <Volume2 className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <Play className="h-6 w-6 text-white ml-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider Line */}
                                    <div className="h-[1px] w-full bg-white/20" />

                                    {/* Dubbed Video */}
                                    <div 
                                        className="aspect-video relative group cursor-pointer"
                                        onClick={togglePlay}
                                    >
                                        <video 
                                            ref={dubbedVideoRef} 
                                            src={dubbedVideoUrl || undefined} 
                                            className="w-full h-full object-contain pointer-events-none" 
                                            muted={dubbedMuted} 
                                            onTimeUpdate={handleVideoTimeUpdate} 
                                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                        />
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-tighter h-4.5 px-1 border-primary/20 text-primary bg-black/40 backdrop-blur-md">
                                                {languageName} (Neural Output)
                                            </Badge>
                                            <button onClick={(e) => { e.stopPropagation(); setDubbedMuted(!dubbedMuted); }} className="p-1.5 w-fit rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-md border border-white/10">
                                                {dubbedMuted ? <Volume2 className="h-3.5 w-3.5 opacity-40" /> : <Volume2 className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                                                <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-3">
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
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 20px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }`}</style>
        </div>
    );
}
