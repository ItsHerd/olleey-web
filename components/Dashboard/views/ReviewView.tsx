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
    Calendar, Clock, Lock, ShieldAlert
} from "lucide-react";
import { AudioPreviewPlayer } from "../components/AudioPreviewPlayer";
import { EditableTranscript } from "../components/EditableTranscript";
import { useDashboardChannels } from "@/lib/useDashboardChannels";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const { channels } = useDashboardChannels();

    const handleSwitchLanguage = (langCode: string) => {
        if (langCode === languageCode) return;
        
        const video = videos.find(v => v.video_id === videoIdFromUrl);
        const targetVideo = video || (isDemoUser(userId) && videoIdFromUrl === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO : null);
        
        if (!targetVideo) return;

        const localization = (videoIdFromUrl === "demo_yc_ceo_video_001" && langCode === "es") 
            ? YC_CEO_SPANISH_TRANSLATION 
            : (targetVideo.localizations as any)?.[langCode];
            
        if (!localization) return;

        openReview({
            videoId: videoIdFromUrl,
            languageCode: langCode,
            originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
            dubbedVideoUrl: localization.dubbed_video_url || "",
            videoTitle: targetVideo.title,
            videoDescription: targetVideo.description || "",
            thumbnailUrl: targetVideo.thumbnail_url,
            localizedTitle: localization.title || "",
            localizedDescription: localization.description || "",
            isApproved: localization.status === 'approved',
            approvedAt: targetVideo.published_at,
            navigate: false
        });

        toast(`Reviewing ${langCode.toUpperCase()}: Switching to selected localization.`);
    };

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedFocus, setSelectedFocus] = useState<"source" | "prod">("prod");

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

    const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "toggle">("side-by-side");
    const [channelMappings, setChannelMappings] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isForKids, setIsForKids] = useState(false);

    useEffect(() => {
        if (channels.length > 0 && videos.length > 0 && Object.keys(channelMappings).length === 0) {
            const currentVideo = videos.find(v => v.video_id === videoIdFromUrl);
            const availableLangs = currentVideo?.localizations 
                ? Object.keys(currentVideo.localizations)
                : (isDemoUser(userId) && videoIdFromUrl === "demo_yc_ceo_video_001" ? ["es"] : []);
            
            if (availableLangs.length > 0) {
                const newMappings: Record<string, string> = {};
                availableLangs.forEach(lang => {
                    const matchingChannel = channels.find(c => c.language_code === lang);
                    if (matchingChannel) {
                        newMappings[lang] = matchingChannel.id;
                    }
                });
                if (Object.keys(newMappings).length > 0) {
                    setChannelMappings(newMappings);
                }
            }
        }
    }, [channels, videos, videoIdFromUrl, userId, channelMappings]);

    const [isSynchronized, setIsSynchronized] = useState(true);
    const [videoQuality, setVideoQuality] = useState<"720p" | "1080p">("1080p");
    const [lipSyncAccuracy, setLipSyncAccuracy] = useState(94);
    const [transcript, setTranscript] = useState<any>(null);
    const [translation, setTranslation] = useState<any>(null);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [transcriptError, setTranscriptError] = useState<string | null>(null);
    const [dubbedAudioUrl, setDubbedAudioUrl] = useState<string | null>(null);

    const [localizedTitle, setLocalizedTitle] = useState("");
    const [localizedDescription, setLocalizedDescription] = useState("");
    const [hoveredCheck, setHoveredCheck] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
    const [isScheduled, setIsScheduled] = useState(false);
    const [isPremiere, setIsPremiere] = useState(false);

    useEffect(() => {
        if (baseLocalizedTitle) setLocalizedTitle(baseLocalizedTitle);
        if (baseLocalizedDescription) setLocalizedDescription(baseLocalizedDescription);
    }, [baseLocalizedTitle, baseLocalizedDescription]);

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

    const handleFinalize = () => {
        toast("Video finalized and scheduled for upload!", "success");
        onViewChange?.("dashboard");
    };

    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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

    useEffect(() => {
        const jobId = jobIdFromUrl || (quickCheckState as any)?.jobId;
        if (!jobId) return;
        (async () => {
            setTranscriptLoading(true);
            try {
                const [tData, tlData, jobVids] = await Promise.all([
                    jobsAPI.getJobTranscript(jobId),
                    jobsAPI.getJobTranslation(jobId, languageCode || langFromUrl || "es"),
                    jobsAPI.getJobVideos(jobId)
                ]);
                setTranscript(tData);
                setTranslation(tlData);
                const currentLangVideo = jobVids.find((v: any) => v.language_code === (languageCode || langFromUrl || "es")) as any;
                if (currentLangVideo?.dubbed_audio_url) setDubbedAudioUrl(currentLangVideo.dubbed_audio_url);
            } catch (err: any) {
                setTranscriptError(err.message || "Failed to load data");
            } finally {
                setTranscriptLoading(false);
            }
        })();
    }, [jobIdFromUrl, languageCode, langFromUrl]);

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

            <div className="flex-1 flex overflow-hidden bg-muted/5 dark:bg-muted/20 p-6 gap-6">
                <aside className={cn(
                    "w-[300px] bg-card dark:bg-[#121212] rounded-[1.5rem] border border-border/40 dark:border-white/5 p-6 space-y-4 overflow-y-auto custom-scrollbar shrink-0 shadow-sm",
                    "dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)]"
                )}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Distribution</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] h-4 px-1">{Object.keys(channelMappings).length} Languages</Badge>
                            <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(() => {
                            const currVideo = videos.find(v => v.video_id === videoIdFromUrl);
                            const availableLangs = Array.from(new Set([
                                ...(currVideo?.localizations ? Object.keys(currVideo.localizations) : []),
                                ...(languageCode ? [languageCode] : []),
                                ...(isDemoUser(userId) && videoIdFromUrl === "demo_yc_ceo_video_001" ? ["es"] : [])
                            ]));
                            return availableLangs.map((lang) => {
                                const langOption = LANGUAGE_OPTIONS.find(l => l.code === lang);
                                const selectedChannelId = channelMappings[lang] || "none";
                                const isActive = lang === languageCode;
                                return (
                                    <div key={lang} onClick={() => handleSwitchLanguage(lang)} className={cn("p-4 rounded-2xl border transition-all cursor-pointer group relative", isActive ? "bg-background dark:bg-primary/10 border-primary ring-1 ring-primary/10 dark:ring-primary/20 dark:shadow-lg" : "bg-background/40 dark:bg-white/5 border-transparent dark:border-white/5 hover:border-muted-foreground/10")}>
                                        {isActive && <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow-md"><CheckCircle2 className="h-3 w-3" /></div>}
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-xl leading-none">{getLanguageFlag(lang)}</div>
                                            <div className="flex-1 min-w-0"><p className="text-[12px] font-bold truncate">{langOption?.name || lang.toUpperCase()}</p></div>
                                        </div>
                                        <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                                            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">Target Channel</p>
                                            <Select value={selectedChannelId} onValueChange={(val) => setChannelMappings(prev => ({ ...prev, [lang]: val }))}>
                                                <SelectTrigger className="h-9 text-[11px] bg-background/50 border-muted-foreground/10 rounded-xl"><SelectValue placeholder="Do not sync" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-[11px]">Do not sync</SelectItem>
                                                    {channels.map(channel => <SelectItem key={channel.id} value={channel.id} className="text-[11px]">{channel.channel_name} ({channel.language_code})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </aside>

                <main className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar bg-card dark:bg-[#0A0A0A] rounded-[1.5rem] border border-border/40 dark:border-white/5 p-6 shadow-sm",
                    "dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)]"
                )}>
                    <div className="w-full space-y-6 pb-12">
                        <div className="py-2 mb-6 flex items-center justify-between border-b border-border/10">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => onViewChange?.("dashboard")} className="h-8 px-2 text-muted-foreground hover:text-black dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all gap-1.5">
                                    <ChevronLeft className="h-4 w-4" /> 
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Exit Review</span>
                                </Button>
                                <div className="h-4 w-px bg-border mx-2" />
                            </div>
                            <div className="flex items-center justify-center gap-2 flex-1">
                                {[
                                    { id: 1, name: "Details" },
                                    { id: 2, name: "Video elements" },
                                    { id: 3, name: "Initial check" },
                                    { id: 4, name: "Visibility" }
                                ].map((step, idx, arr) => (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                                            <div className={cn("w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center text-[10px] font-bold", currentStep === step.id ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20" : currentStep > step.id ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground bg-muted/50")}>
                                                {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                                            </div>
                                            <span className={cn("text-[9px] font-bold uppercase tracking-wider", currentStep === step.id ? "text-foreground" : "text-muted-foreground text-[8px]")}>{step.name}</span>
                                        </div>
                                        {idx < arr.length - 1 && <div className={cn("h-px w-24 mb-4", currentStep > step.id ? "bg-primary" : "bg-muted-foreground/20")} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[60vh]">
                            {currentStep === 1 && (
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-2xl font-bold">Details</h1>
                                            <Button variant="secondary" size="sm" className="text-[11px] font-bold gap-2 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"><RefreshCw className="h-3.5 w-3.5" /> Reuse details</Button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2 relative">
                                                <div className="flex items-center gap-1">
                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tighter">Title (required)</label>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground/40" />
                                                </div>
                                                 <div className="p-4 rounded-xl border-2 dark:border-white/10 focus-within:border-primary dark:focus-within:border-primary/50 transition-all bg-background dark:bg-white/5 min-h-[100px] flex flex-col">
                                                    <textarea className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium resize-none flex-1 outline-none" value={localizedTitle} onChange={(e) => setLocalizedTitle(e.target.value)} placeholder="Enter a title"/>
                                                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-muted/20">
                                                          <Button 
                                                             variant="outline" 
                                                             size="sm" 
                                                             className="h-7 text-[10px] font-bold gap-1.5 dark:bg-white dark:text-black dark:border-none dark:hover:bg-white/90"
                                                             onClick={() => handleGenerateMetadataWithAI("title")}
                                                             disabled={isGeneratingAI}
                                                          >
                                                             <Zap className={cn("h-3 w-3 fill-current", isGeneratingAI && "animate-pulse")} /> Regenerate with AI
                                                          </Button>
                                                         <span className="text-[10px] text-muted-foreground">{localizedTitle.length}/100</span>
                                                     </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative">
                                                <div className="flex items-center gap-1">
                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tighter">Description</label>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground/40" />
                                                </div>
                                                 <div className="p-4 rounded-xl border-2 dark:border-white/10 focus-within:border-primary dark:focus-within:border-primary/50 transition-all bg-background dark:bg-white/5 min-h-[160px] flex flex-col">
                                                    <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none flex-1 outline-none leading-relaxed" value={localizedDescription} onChange={(e) => setLocalizedDescription(e.target.value)} placeholder="Tell viewers about your video"/>
                                                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-muted/20">
                                                          <Button 
                                                             variant="outline" 
                                                             size="sm" 
                                                             className="h-7 text-[10px] font-bold gap-1.5 dark:bg-white dark:text-black dark:border-none dark:hover:bg-white/90"
                                                             onClick={() => handleGenerateMetadataWithAI("description")}
                                                             disabled={isGeneratingAI}
                                                          >
                                                             <Zap className={cn("h-3 w-3 fill-current", isGeneratingAI && "animate-pulse")} /> Regenerate with AI
                                                          </Button>
                                                         <span className="text-[10px] text-muted-foreground">{localizedDescription.length}/5000</span>
                                                     </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <h3 className="text-sm font-bold">Thumbnail</h3>
                                                <p className="text-[11px] text-muted-foreground">Select or upload a picture. <span className="text-primary hover:underline cursor-pointer">Learn more</span></p>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <button className="aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-all group">
                                                        <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors"><Plus className="h-5 w-5 text-muted-foreground" /></div>
                                                        <span className="text-[10px] font-bold text-muted-foreground">Upload file</span>
                                                    </button>
                                                    <button className="aspect-video border-2 border-primary rounded-xl relative overflow-hidden group">
                                                        <img src={thumbnailUrl || DEMO_THUMBNAIL} alt="AI Gen" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-primary/10" />
                                                        <div className="absolute top-2 left-2 p-1 rounded-md bg-white/20 backdrop-blur-sm"><Sparkles className="h-3 w-3 text-white fill-white" /></div>
                                                    </button>
                                                    <button className="aspect-video border-2 border-transparent rounded-xl overflow-hidden hover:border-muted-foreground/20 transition-all opacity-60 hover:opacity-100"><img src={thumbnailUrl || DEMO_THUMBNAIL} className="w-full h-full object-cover grayscale" /></button>
                                                      <button 
                                                         className="aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-muted/30 transition-all group dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
                                                         onClick={() => handleGenerateMetadataWithAI("thumbnail")}
                                                         disabled={isGeneratingAI}
                                                      >
                                                          <Sparkles className={cn("h-4 w-4 text-primary dark:text-white fill-primary/20", isGeneratingAI && "animate-spin")} />
                                                          <span className="text-[9px] font-bold text-primary dark:text-white">Regenerate with AI</span>
                                                      </button>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <div className="space-y-1"><h3 className="text-sm font-bold">Audience</h3><p className="text-xs font-bold mt-2">Is this video made for kids? (required)</p></div>
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <input type="radio" id="kids-yes" checked={isForKids} onChange={() => setIsForKids(true)} className="w-4 h-4 text-primary"/>
                                                        <label htmlFor="kids-yes" className="text-xs font-medium">Yes, it's made for kids</label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input type="radio" id="kids-no" checked={!isForKids} onChange={() => setIsForKids(false)} className="w-4 h-4 text-primary"/>
                                                        <label htmlFor="kids-no" className="text-xs font-medium">No, it's not made for kids</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                         <div className="sticky top-12 space-y-4">
                                             <Card className={cn("overflow-hidden border-none dark:shadow-2xl bg-black group relative flex flex-col gap-px cursor-pointer shadow-xl")} onClick={togglePlay}>
                                                  <div className="relative aspect-video bg-black border-b border-white/5">
                                                      <video ref={originalVideoRef} src={originalVideoUrl || undefined} className="w-full h-full" muted={originalMuted} onTimeUpdate={handleVideoTimeUpdate} />
                                                      <Badge className="absolute top-2 left-2 z-10 bg-white/10 backdrop-blur-md text-[9px] font-bold border-none uppercase tracking-widest px-1.5 h-4 text-white/70">Original (EN)</Badge>
                                                  </div>
                                                  <div className="relative aspect-video bg-black">
                                                      <video ref={dubbedVideoRef} src={dubbedVideoUrl || undefined} className="w-full h-full" muted={dubbedMuted} onTimeUpdate={handleVideoTimeUpdate} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}/>
                                                      <Badge className="absolute top-2 left-2 z-10 bg-primary/80 backdrop-blur-md text-[9px] font-bold border-none uppercase tracking-widest px-1.5 h-4">Localized ({languageCode?.toUpperCase() || "ES"})</Badge>
                                                  </div>
                                                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center dark:shadow-[0_0_30px_rgb(var(--primary),0.4)]">
                                                         {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                                     </div>
                                                 </div>
                                             </Card>
                                             <Card className={cn("p-4 border dark:border-white/5 dark:bg-white/5 dark:shadow-none space-y-4 shadow-sm")}>
                                                <div className="flex items-center justify-between"><h3 className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Quality Score</h3><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 h-5 font-bold dark:border-white/20">Excellent</Badge></div>
                                                 <div className="space-y-3">
                                                      <div className="flex items-center justify-between bg-blue-500/5 dark:bg-muted/30 p-2.5 rounded-lg border border-blue-500/10 dark:border-transparent"><div className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-blue-500" /><span className="text-[11px] font-bold">Lip Sync Accuracy</span></div><span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{lipSyncAccuracy}%</span></div>
                                                      <div className="flex items-center justify-between bg-orange-500/5 dark:bg-muted/30 p-2.5 rounded-lg border border-orange-500/10 dark:border-transparent"><div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-orange-500" /><span className="text-[11px] font-bold">Linguistic Tone match</span></div><span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">92%</span></div>
                                                      <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-muted/30 p-2.5 rounded-lg border border-emerald-500/10 dark:border-transparent"><div className="flex items-center gap-2"><Languages className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[11px] font-bold">Translation Fidelity</span></div><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">98%</span></div>
                                                 </div>
                                            </Card>

                                            <div className="space-y-4">
                                                <h3 className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest px-1">Transcript Editor</h3>
                                                <div className="space-y-3">
                                                    <EditableTranscript title="Original (EN)" text={transcript?.text || ""} onSave={async (val) => { toast("Source transcript editing coming soon", "info"); }} theme={theme} className="bg-muted/10 border-none shadow-none" />
                                                    <EditableTranscript title={`${languageName} Translation`} text={translation?.translated_text || ""} languageCode={languageCode || "es"} onSave={async (val) => { try { await jobsAPI.updateTranslation(jobIdFromUrl || "", languageCode || "es", { translated_text: val }); toast("Translation saved", "success"); } catch (err) { toast("Failed to save translation", "error"); } }} theme={theme} className="bg-muted/10 border-none shadow-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                             {currentStep === 2 && (
                                 <div className="space-y-6 max-w-4xl mx-auto">
                                     <div className="flex items-center justify-between mb-8">
                                         <div>
                                             <h1 className="text-2xl font-bold">Video elements</h1>
                                             <p className="text-sm text-muted-foreground mt-1">Enhance your video with interactive elements to engage your audience.</p>
                                         </div>
                                          <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-2 dark:border-white/20 dark:hover:bg-white/10 dark:text-white"><Type className="h-3.5 w-3.5" /> Auto-sync captions</Button>
                                     </div>
                                     
                                     <div className="space-y-4">
                                         {/* End Screen Box */}
                                         <div className={cn("flex items-center justify-between p-5 rounded-[1.5rem] border dark:border-white/5 bg-card dark:bg-white/5 hover:border-primary/50 dark:hover:border-primary/50 transition-all group dark:shadow-none shadow-sm")}>
                                             <div className="flex items-center gap-5">
                                                 <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                     <MonitorPlay className="h-7 w-7 text-primary" />
                                                 </div>
                                                 <div>
                                                     <h3 className="font-bold text-sm">Add an end screen</h3>
                                                     <p className="text-[12px] text-muted-foreground mt-0.5">Promote related content at the end of your video</p>
                                                 </div>
                                             </div>
                                              <div className="flex items-center gap-3">
                                                  <Button variant="outline" size="sm" className="font-bold text-[11px] h-9 px-4 border-2 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white rounded-xl shadow-sm">Import from video</Button>
                                                  <Button variant="outline" size="sm" className="font-bold text-[11px] h-9 px-6 border-2 dark:border-white/20 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all dark:text-white">Add</Button>
                                              </div>
                                         </div>

                                         {/* Cards Box */}
                                         <div className={cn("flex items-center justify-between p-5 rounded-[1.5rem] border dark:border-white/5 bg-card dark:bg-white/5 hover:border-primary/50 dark:hover:border-primary/50 transition-all group dark:shadow-none shadow-sm")}>
                                             <div className="flex items-center gap-5">
                                                 <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                     <Layout className="h-7 w-7 text-primary" />
                                                 </div>
                                                 <div>
                                                     <h3 className="font-bold text-sm">Add cards</h3>
                                                     <p className="text-[12px] text-muted-foreground mt-0.5">Promote related content during your video</p>
                                                 </div>
                                             </div>
                                             <Button variant="outline" size="sm" className="font-bold text-[11px] h-9 px-8 border-2 dark:border-white/20 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all dark:text-white">Add</Button>
                                         </div>

                                         {/* Quiz Box */}
                                         <div className={cn("flex items-center justify-between p-5 rounded-[1.5rem] border dark:border-white/5 bg-card dark:bg-white/5 hover:border-primary/50 dark:hover:border-primary/50 transition-all group dark:shadow-none border-dashed border-primary/30 shadow-sm")}>
                                             <div className="flex items-center gap-5">
                                                 <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                     <BrainCog className="h-7 w-7 text-primary" />
                                                 </div>
                                                 <div>
                                                     <div className="flex items-center gap-2">
                                                         <h3 className="font-bold text-sm">Add a quiz</h3>
                                                         <Badge className="bg-primary/10 text-primary border-none text-[8px] uppercase font-black px-1.5 h-4 flex items-center tracking-tighter">New</Badge>
                                                     </div>
                                                     <p className="text-[12px] text-muted-foreground mt-0.5">Make your videos more interactive with quizzes</p>
                                                 </div>
                                             </div>
                                             <Button variant="outline" size="sm" className="font-bold text-[11px] h-9 px-8 border-2 dark:border-white/20 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all dark:text-white">Add</Button>
                                         </div>
                                     </div>
                                 </div>
                             )}
                            {currentStep === 3 && (
                                <div className="space-y-8 shadow-sm">
                                    <div><h1 className="text-2xl font-bold">Initial check</h1><p className="text-sm text-muted-foreground mt-1">We finished checking your video for any issues.</p></div>
                                    <div className={cn("p-6 rounded-2xl border bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30 flex items-start gap-4", "shadow-sm")}><div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle2 className="h-6 w-6 text-white" /></div><div className="space-y-1"><h4 className="text-sm font-bold">Checks complete. No issues found.</h4><p className="text-xs text-muted-foreground">Ad suitability and copyright checks passed.</p></div></div>
                                    <div className="space-y-6"><div className="space-y-2"><h3 className="text-sm font-bold">Copyright</h3><div className={cn("flex items-center justify-between p-4 rounded-xl border bg-muted/20 dark:bg-white/5 dark:border-white/5", "shadow-sm")}><div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-500" /><span className="text-xs">No copyright material detected</span></div><span className="text-[10px] font-bold text-emerald-500 uppercase">Passed</span></div></div></div>
                                </div>
                            )}
                             {currentStep === 4 && (
                                 <div className="space-y-6 max-w-4xl mx-auto">
                                     <div className="flex flex-col gap-1">
                                         <h1 className="text-2xl font-bold">Visibility</h1>
                                         <p className="text-sm text-muted-foreground">Choose when to publish and who can see your video</p>
                                     </div>

                                     <div className="space-y-6">
                                         {/* Save or Publish Section */}
                                         <Card className={cn("rounded-[1.5rem] border dark:border-white/5 overflow-hidden bg-card dark:bg-white/5 dark:shadow-none shadow-sm")}>
                                             <div className="p-6 space-y-4">
                                                 <div className="flex flex-col gap-1">
                                                     <h3 className="font-bold text-lg">Save or publish</h3>
                                                     <p className="text-sm text-muted-foreground">Make your video public, unlisted, or private</p>
                                                 </div>

                                                 <div className="space-y-4 pt-2">
                                                     {[
                                                         { id: 'private', title: 'Private', desc: 'Only you and people you choose can watch your video', icon: Lock },
                                                         { id: 'unlisted', title: 'Unlisted', desc: 'Anyone with the video link can watch your video', icon: ExternalLink },
                                                         { id: 'public', title: 'Public', desc: 'Everyone can watch your video', icon: Globe },
                                                     ].map((option) => (
                                                         <div 
                                                             key={option.id}
                                                             onClick={() => { setVisibility(option.id as any); setIsScheduled(false); }}
                                                             className={cn(
                                                                 "p-4 rounded-[1.25rem] border-2 transition-all cursor-pointer flex items-start gap-4 hover:border-primary/30",
                                                                 visibility === option.id && !isScheduled ? "bg-primary/5 dark:bg-primary/10 border-primary dark:border-primary dark:shadow-none" : "bg-muted/5 dark:bg-white/5 border-transparent dark:border-white/5"
                                                             )}
                                                         >
                                                             <div className={cn(
                                                                 "p-2.5 rounded-xl border transition-colors",
                                                                 visibility === option.id && !isScheduled ? "bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 text-primary" : "bg-card dark:bg-[#121212] border-border dark:border-white/10 text-muted-foreground"
                                                             )}>
                                                                 <option.icon className="h-5 w-5" />
                                                             </div>
                                                             <div className="flex-1">
                                                                 <p className="font-bold text-sm">{option.title}</p>
                                                                 <p className="text-xs text-muted-foreground pt-0.5">{option.desc}</p>
                                                             </div>
                                                             <div className={cn(
                                                                 "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                 visibility === option.id && !isScheduled ? "border-primary bg-primary" : "border-muted-foreground/30"
                                                             )}>
                                                                 {visibility === option.id && !isScheduled && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         </Card>

                                         {/* Schedule Section */}
                                         <Card className={cn("rounded-[1.5rem] border dark:border-white/5 overflow-hidden bg-card dark:bg-white/5 dark:shadow-none shadow-sm")}>
                                             <div className="p-6 space-y-4">
                                                 <div className="flex items-center justify-between">
                                                     <div className="flex flex-col gap-1">
                                                         <h3 className="font-bold text-lg">Schedule</h3>
                                                         <p className="text-sm text-muted-foreground">Select a date to make your video public.</p>
                                                     </div>
                                                     <Switch checked={isScheduled} onCheckedChange={(val) => { setIsScheduled(val); if (val) setVisibility('public'); }} />
                                                 </div>

                                                 {isScheduled && (
                                                     <motion.div 
                                                         initial={{ opacity: 0, height: 0 }}
                                                         animate={{ opacity: 1, height: 'auto' }}
                                                         className="space-y-6 pt-2 border-t mt-6"
                                                     >
                                                         <div className="grid grid-cols-2 gap-4 pt-4">
                                                             <div className="space-y-2">
                                                                 <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Schedule as public</label>
                                                                 <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/5">
                                                                     <Calendar className="h-4 w-4 text-primary" />
                                                                     <span className="text-sm font-bold">Feb 15, 2026</span>
                                                                 </div>
                                                             </div>
                                                             <div className="space-y-2">
                                                                 <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Publish time</label>
                                                                 <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/5">
                                                                     <Clock className="h-4 w-4 text-primary" />
                                                                     <span className="text-sm font-bold">12:00 AM</span>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                         
                                                         <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3">
                                                             <div className="flex items-center justify-between">
                                                                 <div className="flex items-center gap-2">
                                                                     <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Time zone: GMT (UTC +0)</span>
                                                                 </div>
                                                             </div>
                                                             <div className="flex items-start gap-4 pt-1">
                                                                 <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                     <Info className="h-4 w-4" />
                                                                 </div>
                                                                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Video will be private before publishing</p>
                                                             </div>
                                                             <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                                                 <div className="flex flex-col gap-0.5">
                                                                     <p className="text-[11px] font-bold">Set as Premiere</p>
                                                                     <p className="text-[10px] text-muted-foreground">Premiere creates excitement around your video</p>
                                                                 </div>
                                                                 <Switch checked={isPremiere} onCheckedChange={setIsPremiere} />
                                                             </div>
                                                         </div>
                                                     </motion.div>
                                                 )}
                                             </div>
                                         </Card>

                                         {/* Pre-publish Checks Section */}
                                         <div className="pt-8 space-y-6">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-1 h-8 bg-primary rounded-full" />
                                                 <h3 className="font-bold text-lg">Before you publish, check the following:</h3>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                  <div className={cn("p-6 rounded-[1.5rem] border bg-card dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md")}>
                                                      <div className="flex flex-col gap-5">
                                                          <div className="p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 w-fit">
                                                              <ShieldAlert className="h-6 w-6" />
                                                          </div>
                                                          <div className="space-y-2.5">
                                                              <h4 className="font-bold text-sm dark:text-white">Do kids appear in this video?</h4>
                                                              <p className="text-xs text-muted-foreground leading-relaxed">
                                                                  Make sure you follow our policies to protect minors from harm, exploitation, bullying, and violations of labor law.
                                                                  <span className="text-primary dark:text-primary font-bold ml-1 hover:underline cursor-pointer">Learn more</span>
                                                              </p>
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div className={cn("p-6 rounded-[1.5rem] border bg-card dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md")}>
                                                      <div className="flex flex-col gap-5">
                                                          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-fit">
                                                              <ShieldCheck className="h-6 w-6" />
                                                          </div>
                                                          <div className="space-y-2.5">
                                                              <h4 className="font-bold text-sm dark:text-white">Looking for overall content guidance?</h4>
                                                              <p className="text-xs text-muted-foreground leading-relaxed">
                                                                  Our Community Guidelines can help you avoid trouble and ensure that YouTube remains a safe and vibrant community.
                                                                  <span className="text-primary dark:text-primary font-bold ml-1 hover:underline cursor-pointer">Learn more</span>
                                                              </p>
                                                          </div>
                                                      </div>
                                                  </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>

                        <div className="pt-8 border-t flex items-center justify-between mt-8 mb-12">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    {[
                                        { id: 'upload', text: "video upload complete" },
                                        { id: 'processing', text: "video processing complete" },
                                        { id: 'checks', text: "Copyright check complete\nNo issues found\nCommunity Guidelines check complete\nNo issues found" }
                                    ].map((check) => {
                                        return (
                                            <div 
                                                key={check.id}
                                                className="relative"
                                                onMouseEnter={() => setHoveredCheck(check.id)}
                                                onMouseLeave={() => setHoveredCheck(null)}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 cursor-help hover:bg-emerald-500/30 transition-colors">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                </div>
                                                <AnimatePresence>
                                                    {hoveredCheck === check.id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-[60] w-max max-w-[240px] p-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl dark:shadow-2xl text-[10px] text-white font-bold leading-relaxed whitespace-pre-line text-center"
                                                        >
                                                            {check.text}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#1e1e1e]" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                    <span className="text-[11px] font-bold text-foreground/80 ml-1">Checks complete. No issues found.</span>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                 <Button variant="outline" className="h-10 px-6 font-bold text-xs gap-2 dark:border-white/20 dark:hover:bg-white/10 dark:text-white" onClick={() => toast("Draft saved", "success")}>
                                     <Save className="h-4 w-4" /> Save as draft
                                 </Button>
                                 <div className="w-px h-6 bg-border mx-1" />
                                 {currentStep > 1 && <Button variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} className="font-bold text-xs px-8 dark:hover:bg-white/10 dark:text-white">Back</Button>}
                                 {currentStep === 4 && <Button variant="outline" className="h-10 px-8 font-bold text-xs gap-2 border-2 dark:border-white/20 dark:hover:bg-white/10 dark:text-white"><Eye className="h-4 w-4" /> Final Preview</Button>}
                                 <Button 
                                     onClick={() => (currentStep < 4 ? setCurrentStep(prev => prev + 1) : handleFinalize())} 
                                     className="h-10 px-12 font-bold text-xs bg-primary text-primary-foreground dark:shadow-[0_0_30px_rgb(var(--primary),0.3)] hover:bg-primary/90 dark:hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                 >
                                     {currentStep === 4 ? (
                                         <div className="flex items-center gap-2 text-primary-foreground">
                                             <Zap className="h-4 w-4 fill-current" /> Finalize & Upload
                                         </div>
                                     ) : "Next"}
                                 </Button>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 20px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }`}</style>
        </div>
    );
}
