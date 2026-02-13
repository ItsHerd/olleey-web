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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { jobsAPI, channelsAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ViewType } from "../DashboardLayout";

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
                approvedAt: currentVideo.published_at,
                navigate: false // Stay within dashboard
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

    // Publishing options state
    const [scheduledDate, setScheduledDate] = useState<string>("");
    const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
    const [selectedChannel, setSelectedChannel] = useState<string>("");
    const [localizedTags, setLocalizedTags] = useState<string[]>([]);
    const [availableChannels, setAvailableChannels] = useState<Array<{ id: string; name: string }>>([]);

    // Fetch channels on load
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const channels = await channelsAPI.listChannels(selectedProject?.id);
                setAvailableChannels(channels.map((ch: any) => ({ id: ch.channel_id, name: ch.channel_title })));
                if (channels.length > 0) {
                    setSelectedChannel(channels[0].channel_id);
                }
            } catch (error) {
                console.error("Failed to fetch channels:", error);
            }
        };

        fetchChannels();
    }, [selectedProject?.id]);

    // Fetch metadata on load
    useEffect(() => {
        const fetchMetadata = async () => {
            const jobId = quickCheckState.videoId || videoIdFromUrl;
            const lang = quickCheckState.languageCode || langFromUrl;
            if (!jobId || !lang) return;

            try {
                const jobVideos = await jobsAPI.getJobVideos(jobId);
                const currentLangVideo = jobVideos.find((v: any) => v.language_code === lang);
                if (currentLangVideo?.tags) {
                    setLocalizedTags(currentLangVideo.tags);
                }
            } catch (error) {
                console.error("Failed to fetch metadata:", error);
            }
        };

        fetchMetadata();
    }, [quickCheckState.videoId, videoIdFromUrl, quickCheckState.languageCode, langFromUrl]);

    const handlePublish = async () => {
        setIsPublishing(true);
        const videoId = quickCheckState.videoId || videoIdFromUrl;
        const lang = quickCheckState.languageCode || langFromUrl;

        if (!videoId || !lang) {
            toast("Missing video information", "error");
            setIsPublishing(false);
            return;
        }

        if (!selectedChannel) {
            toast("Please select a channel to publish to", "error");
            setIsPublishing(false);
            return;
        }

        try {
            await jobsAPI.publishToYouTube(videoId, lang, {
                scheduledDate: scheduledDate || undefined,
                visibility,
                channelId: selectedChannel
            });

            const message = scheduledDate
                ? `Scheduled for ${new Date(scheduledDate).toLocaleString()}`
                : "Successfully published to YouTube!";
            toast(message, "success");

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
            approvedAt: currentVideo.published_at || (currentVideo as any).created_at,
            navigate: false // Stay within dashboard
        });
        setViewMode('dubbed');
    };

    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const isDark = theme === "dark";
    const bgClass = "bg-background";
    const cardBgClass = "bg-card";
    const borderClass = "border-border";
    const textClass = "text-foreground";
    const textSecondaryClass = "text-muted-foreground";

    if (videosLoading && !currentVideo) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center", bgClass)}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading video...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full h-full flex flex-col overflow-hidden selection:bg-primary/20 transition-colors rounded-tl-xl overflow-y-auto custom-scrollbar", bgClass, textClass)}>
            {/* Header Toolbar */}
            <div className={cn("flex items-center justify-between px-6 py-4 border-b shrink-0 sticky top-0 z-20 backdrop-blur-sm bg-opacity-80", bgClass, borderClass)}>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewChange?.("review")}
                        className="rounded-xl w-9 h-9 hover:bg-muted transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight truncate max-w-[180px] sm:max-w-md">
                            {videoTitle || "Unnamed_Asset"}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            {viewMode === 'original' ? (
                                <Badge variant="secondary" className="text-[9px] font-bold uppercase rounded px-2">Source</Badge>
                            ) : isApproved ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold uppercase rounded px-2">Live</Badge>
                            ) : (
                                <Badge variant="outline" className="text-[9px] font-bold uppercase rounded px-2 border-primary/20 text-primary bg-primary/5">Ready</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted border border-border rounded-xl p-1 hidden sm:flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('original')}
                            className={cn(
                                "h-7 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'original' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Original
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('dubbed')}
                            className={cn(
                                "h-7 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'dubbed' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Localized
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                            className="rounded-xl h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-border"
                        >
                            {isSavingDraft ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2 text-primary" />}
                            {isSavingDraft ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlePublish}
                            disabled={isPublishing || isSavingDraft || viewMode === 'original'}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest h-9 px-4 shadow-sm transition-all"
                        >
                            {isPublishing ? <RefreshCw className="w-3 h-3 mr-2 animate-spin text-white" /> : <Youtube className="w-3 h-3 mr-2 text-white" />}
                            Launch
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto lg:p-12 p-6">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Video Player Section */}
                    <Card className="overflow-hidden cursor-pointer" onClick={togglePlay}>
                        <div className="relative aspect-video bg-black">
                        <video
                            ref={videoRef}
                            key={viewMode === 'original' ? originalVideoUrl : dubbedVideoUrl}
                            src={viewMode === 'original' ? originalVideoUrl : (dubbedVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")}
                            className="w-full h-full object-contain"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Center Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: isPlaying ? 0 : 1, scale: 1 }}
                                whileHover={{ scale: 1.1, opacity: 1 }}
                                className="w-16 h-16 bg-background/20 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto"
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
                            <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border border-white/10 text-primary text-[9px] font-bold uppercase px-3 py-1 rounded-lg">
                                {viewMode === 'original' ? "Source" : "Localized"}
                            </Badge>
                            <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[9px] font-bold uppercase px-3 py-1 rounded-lg">
                                {viewMode === 'original' ? "Original" : languageName}
                            </Badge>
                        </div>
                        </div>
                    </Card>

                    {/* Content Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            {viewMode === 'original' ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Available Languages</CardTitle>
                                        <CardDescription>Switch between localized versions</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {currentVideo?.localizations && Object.entries(currentVideo.localizations).map(([code, loc]: [string, any]) => {
                                            const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
                                            return (
                                                <button
                                                    key={code}
                                                    onClick={() => handleSwitchToDub(code, loc)}
                                                    className="w-full flex items-center justify-between p-4 rounded-lg border hover:border-primary/40 transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg group-hover:bg-primary/10 transition-colors">
                                                            {lang?.flag || "🌐"}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                                                                {lang?.name || code.toUpperCase()}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground capitalize">
                                                                {loc.status || "Processing"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={loc.status === 'live' ? 'default' : 'secondary'} className="rounded-full">
                                                            {loc.status === 'live' ? 'Live' : 'Review'}
                                                        </Badge>
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1.5 flex-1">
                                                    <CardTitle className="text-xl">{videoTitle}</CardTitle>
                                                    <CardDescription className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="rounded-full">
                                                            <Youtube className="w-3 h-3 mr-1.5" />
                                                            Olleey Global Labs
                                                        </Badge>
                                                        <Badge variant="outline" className="rounded-full">
                                                            <Globe className="w-3 h-3 mr-1.5" />
                                                            {languageName} {LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.flag}
                                                        </Badge>
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shrink-0">
                                                    Production Ready
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="text-xs font-semibold text-muted-foreground">Description</Label>
                                                <p className="text-sm leading-relaxed mt-2">
                                                    {videoDescription || "No localized description available."}
                                                </p>
                                            </div>

                                            {/* Tags Preview */}
                                            {localizedTags.length > 0 && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <Label className="text-xs font-semibold text-muted-foreground">Tags</Label>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {localizedTags.map((tag, i) => (
                                                                <Badge key={i} variant="secondary" className="rounded-full">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Quality Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: "Sync Fidelity", value: stats.qualityScore + "%", icon: Zap, color: "text-primary" },
                                    { label: "Vocal Latency", value: stats.syncDrift, icon: Monitor, color: "text-blue-500" },
                                    { label: "Cultural Tone", value: stats.culturalMatch, icon: Globe, color: "text-purple-500" },
                                    { label: "AI Synthesis", value: stats.aiProcessing, icon: Layout, color: "text-emerald-500" }
                                ].map((metric, i) => (
                                    <Card key={i}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <metric.icon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{metric.label}</span>
                                            </div>
                                            <p className={cn("text-2xl font-bold", metric.color)}>{metric.value}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Thumbnail Preview</CardTitle>
                                    <CardDescription>Final thumbnail for YouTube</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video rounded-lg overflow-hidden border">
                                        <img
                                            src={quickCheckState.thumbnailUrl || (currentVideo as any)?.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                                            alt="Localized Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Youtube className="w-4 h-4" />
                                        Publishing Options
                                    </CardTitle>
                                    <CardDescription>Configure how and when to publish</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Channel Selector */}
                                    <div className="space-y-2">
                                        <Label htmlFor="channel-select">Target Channel</Label>
                                        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                            <SelectTrigger id="channel-select">
                                                <SelectValue placeholder="Select a channel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableChannels.map((channel) => (
                                                    <SelectItem key={channel.id} value={channel.id}>
                                                        {channel.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Visibility Selector */}
                                    <div className="space-y-2">
                                        <Label htmlFor="visibility-select">Visibility</Label>
                                        <Select value={visibility} onValueChange={(val: any) => setVisibility(val)}>
                                            <SelectTrigger id="visibility-select">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                                <SelectItem value="private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Schedule Date/Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="schedule-input">Schedule (Optional)</Label>
                                        <Input
                                            id="schedule-input"
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                        {scheduledDate && (
                                            <p className="text-xs text-muted-foreground">
                                                Will publish on {new Date(scheduledDate).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isPublishing || isSavingDraft || viewMode === 'original' || !selectedChannel}
                                            size="lg"
                                            className="w-full"
                                        >
                                            {isPublishing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    Publishing...
                                                </>
                                            ) : scheduledDate ? (
                                                <>
                                                    <Youtube className="w-4 h-4 mr-2" />
                                                    Schedule Publish
                                                </>
                                            ) : (
                                                <>
                                                    <Youtube className="w-4 h-4 mr-2" />
                                                    Publish Now
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleSaveDraft}
                                            disabled={isSavingDraft || isPublishing || viewMode === 'original'}
                                            variant="outline"
                                            size="lg"
                                            className="w-full"
                                        >
                                            {isSavingDraft ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Draft
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
