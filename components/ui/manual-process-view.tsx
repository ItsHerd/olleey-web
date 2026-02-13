"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Upload as UploadIcon,
    Loader2,
    CheckCircle,
    AlertCircle,
    Youtube,
    Link as LinkIcon,
    FileVideo,
    ImageIcon,
    ArrowLeft,
    ArrowRight,
    Send,
    SlidersHorizontal,
    ChevronRight,
    Zap,
    Globe,
    Radio,
    Layers,
    Sparkles,
    Search,
    Activity,
    ShieldCheck,
    Cpu,
    Plus,
    PlayCircle,
    Rocket,
    FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/useTheme";
import { useToast } from "@/components/ui/use-toast";
import { jobsAPI, videosAPI, type Video } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { logger } from "@/lib/logger";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMockDraftVideos, simulateProcessing, isDemoUser, YC_CEO_SPANISH_TRANSLATION } from "@/lib/mockDemoData";

type SourceTab = "channel" | "url" | "upload" | "drafts";

interface ChannelWithLanguages {
    id: string;
    name: string;
    language_code?: string;
    language_name?: string;
}

interface ManualProcessViewProps {
    availableChannels: ChannelWithLanguages[];
    projectId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    compact?: boolean;
}

export function ManualProcessView({
    availableChannels,
    projectId,
    onSuccess,
    onCancel,
    compact = false,
}: ManualProcessViewProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const userId = user?.id;
    const [activeTab, setActiveTab] = useState<SourceTab>("channel");
    const [currentStep, setCurrentStep] = useState(1);
    const [sourceVideoUrl, setSourceVideoUrl] = useState("");
    const [sourceChannelId, setSourceChannelId] = useState("");
    const [selectedVideoId, setSelectedVideoId] = useState("");
    const [channelVideos, setChannelVideos] = useState<Video[]>([]);
    const [draftVideos, setDraftVideos] = useState<Video[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);

    // Metadata fields
    const [customTitle, setCustomTitle] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedTargetChannels, setSelectedTargetChannels] = useState<string[]>([]);
    const [targetLanguageOverrides, setTargetLanguageOverrides] = useState<{ [channelId: string]: string }>({});
    const [sourceLanguage, setSourceLanguage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessState, setIsSuccessState] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const isDark = theme === "dark";

    const steps = [
        { id: 1, name: "Source", icon: Radio },
        { id: 2, name: "Configure", icon: SlidersHorizontal },
        { id: 3, name: "Targets", icon: Globe },
    ];

    // Load videos when channel is selected
    useEffect(() => {
        const loadChannelVideos = async () => {
            if (activeTab === "channel" && sourceChannelId && userId) {
                try {
                    setLoadingVideos(true);
                    setError(null);
                    console.log('[ManualProcessView] Loading channel videos from Supabase:', { sourceChannelId, userId });

                    const { data, error: queryError } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('channel_id', sourceChannelId)
                        .eq('user_id', userId)
                        .is('deleted_at', null)
                        .order('published_at', { ascending: false });

                    if (queryError) throw queryError;

                    console.log('[ManualProcessView] Loaded videos:', { count: data?.length || 0 });
                    setChannelVideos(data || []);
                } catch (err: any) {
                    logger.error("ManualProcessView", "Failed to load channel videos", err);
                    setError("Failed to load videos for this channel");
                    setChannelVideos([]);
                } finally {
                    setLoadingVideos(false);
                }
            }
        };
        loadChannelVideos();
    }, [sourceChannelId, activeTab, userId]);

    // Load draft videos
    useEffect(() => {
        const loadDraftVideos = async () => {
            if (activeTab === "drafts" && userId) {
                try {
                    setLoadingVideos(true);
                    setError(null);
                    console.log('[ManualProcessView] Loading draft videos from Supabase');

                    // Get mock videos if demo user
                    const mockVideos = getMockDraftVideos(userId);

                    const { data, error: queryError } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('user_id', userId)
                        .or('status.eq.draft,storage_url.not.is.null')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false });

                    if (queryError) throw queryError;

                    // Combine mock videos with real data
                    const combinedData = [...mockVideos, ...(data || [])];

                    console.log('[ManualProcessView] Loaded drafts:', {
                        count: combinedData.length,
                        mockCount: mockVideos.length,
                        realCount: data?.length || 0
                    });
                    setDraftVideos(combinedData);
                } catch (err: any) {
                    logger.error("ManualProcessView", "Failed to load draft videos", err);
                    setError("Failed to load draft videos");
                    // Still show mock videos even if query fails
                    const mockVideos = getMockDraftVideos(userId);
                    setDraftVideos(mockVideos);
                } finally {
                    setLoadingVideos(false);
                }
            }
        };
        loadDraftVideos();
    }, [activeTab, userId]);

    const extractVideoId = (url: string): string | null => {
        try {
            // Accept any URL or video ID
            const trimmed = url.trim();
            if (!trimmed) return null;

            // Check if it's a YouTube URL and extract the ID
            const youtubePatterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                /^([a-zA-Z0-9_-]{11})$/,
            ];
            for (const pattern of youtubePatterns) {
                const match = trimmed.match(pattern);
                if (match && match[1]) return match[1];
            }

            // For any other URL or identifier, return as-is
            return trimmed;
        } catch { return null; }
    };

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setUploadedThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setCustomTitle(file.name.split('.')[0]);
        }
    };

    const toggleTargetChannel = (channelId: string) => {
        setSelectedTargetChannels(prev =>
            prev.includes(channelId)
                ? prev.filter(id => id !== channelId)
                : [...prev, channelId]
        );
    };

    const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
        e.preventDefault();
        setError(null);

        let videoId: string | null = null;
        try {
            setIsSubmitting(true);

            if (activeTab === "channel" || activeTab === "drafts") {
                if (!selectedVideoId) {
                    setError(`Please select a video from ${activeTab === "channel" ? "the channel" : "your drafts"}`);
                    setIsSubmitting(false);
                    return;
                }
                videoId = selectedVideoId;

                // Check if this is the demo YC CEO video
                if (videoId === "demo_yc_ceo_video_001" && isDemoUser(userId) && !saveAsDraft) {
                    // Special handling for demo video
                    console.log('[ManualProcessView] Demo video detected, starting simulation');

                    if (selectedTargetChannels.length === 0) {
                        setError("Please select at least one target language/channel");
                        setIsSubmitting(false);
                        return;
                    }

                    // Get target language (assume Spanish for demo)
                    const targetLang = 'es';

                    // Show processing state
                    toast("⚙️ Processing video...", "info");
                    setUploadProgress(30);

                    // Simulate the 3-4 second processing
                    const result = await simulateProcessing(videoId, targetLang);

                    setUploadProgress(100);

                    // Navigate to review page after processing
                    setTimeout(() => {
                        setIsSubmitting(false);
                        setIsSuccessState(true);
                        toast("✅ Processing complete! Ready for review", "success");

                        // Navigate to review page with the result
                        setTimeout(() => {
                            if (typeof window !== 'undefined') {
                                window.location.href = `/workflows/review/${videoId}?lang=${targetLang}`;
                            }
                        }, 1000);
                    }, 500);

                    return; // Exit early for demo flow
                }
            } else if (activeTab === "url") {
                videoId = extractVideoId(sourceVideoUrl.trim());
                if (!videoId || !sourceChannelId) {
                    setError("Please enter a valid video URL or ID and select a source channel");
                    setIsSubmitting(false);
                    return;
                }
            } else if (activeTab === "upload") {
                if (!uploadedFile) {
                    setError("Please upload a video file");
                    setIsSubmitting(false);
                    return;
                }

                setUploadProgress(10);
                const uploadRes = await videosAPI.uploadVideo({
                    video_file: uploadedFile,
                    title: customTitle || uploadedFile.name,
                    description: customDescription,
                    channel_id: sourceChannelId || availableChannels[0]?.id,
                    thumbnail_file: uploadedThumbnail || undefined
                });
                videoId = uploadRes.video_id;
                setUploadProgress(50);
            }

            if (selectedTargetChannels.length === 0) {
                setError("Please select at least one target language/channel");
                setIsSubmitting(false);
                return;
            }

            const targetLanguages = selectedTargetChannels
                .map(id => {
                    // Check if it's a direct language selection (starts with "lang_")
                    if (id.startsWith('lang_')) {
                        return targetLanguageOverrides[id] || id.replace('lang_', '');
                    }
                    // Otherwise, it's a channel ID
                    const ch = availableChannels.find(c => c.id === id);
                    return targetLanguageOverrides[id] || ch?.language_code;
                })
                .filter(Boolean) as string[];

            if (targetLanguages.length === 0) {
                setError("No valid languages found. Please configure language channels or select valid targets.");
                setIsSubmitting(false);
                return;
            }

            // Create job directly in Supabase
            console.log('[ManualProcessView] Creating job in Supabase:', {
                userId,
                projectId,
                videoId,
                sourceChannelId,
                targetLanguages,
                saveAsDraft
            });

            if (!userId) {
                throw new Error('User not authenticated');
            }

            const jobData = {
                user_id: userId,
                project_id: projectId || null,
                source_video_id: videoId!,
                source_channel_id: sourceChannelId || availableChannels[0]?.id || "uploaded",
                target_languages: targetLanguages,
                status: saveAsDraft ? 'draft' : 'pending',
                progress: 0,
                started_at: null,
                completed_at: null,
                workflow_state: {
                    metadata_extraction: { status: saveAsDraft ? 'draft' : 'pending', progress: 0 },
                    translations: Object.fromEntries(
                        targetLanguages.map(lang => [lang, { status: saveAsDraft ? 'draft' : 'pending', progress: 0 }])
                    ),
                    video_dubbing: Object.fromEntries(
                        targetLanguages.map(lang => [lang, { status: saveAsDraft ? 'draft' : 'pending', progress: 0 }])
                    ),
                    thumbnails: Object.fromEntries(
                        targetLanguages.map(lang => [lang, { status: saveAsDraft ? 'draft' : 'pending', progress: 0 }])
                    )
                }
            };

            console.log('[ManualProcessView] Job data to insert:', jobData);

            const { data: job, error: jobError } = await supabase
                .from('processing_jobs')
                .insert(jobData)
                .select()
                .single();

            if (jobError) {
                console.error('[ManualProcessView] Job creation error:', jobError);
                throw new Error(`Failed to create job: ${jobError.message}`);
            }

            console.log('[ManualProcessView] Job created successfully:', {
                jobId: job?.id,
                videoId: job?.source_video_id,
                targetLanguages: job?.target_languages,
                status: job?.status
            });

            setUploadProgress(100);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccessState(true);
                const message = saveAsDraft
                    ? `💾 Saved as Draft: "${customTitle || 'Video'}" ready for later processing`
                    : `🚀 Production Pipeline Started! Processing "${customTitle || 'Video'}"`;
                toast(message, "success");
                setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);
            }, 1000);

        } catch (err: any) {
            setError(err.message || "Failed to initiate pipeline");
            setIsSubmitting(false);
        }
    };

    const currentThumbnail = (() => {
        // Priority: User uploaded thumbnail > Selected video thumbnail > Default
        if (thumbnailPreview) return thumbnailPreview;

        // For channel tab - use selected video's thumbnail
        if (activeTab === 'channel' && selectedVideoId) {
            const video = channelVideos.find(v => v.video_id === selectedVideoId);
            if (video?.thumbnail_url) return video.thumbnail_url;
        }

        // For drafts tab - use selected draft video's thumbnail
        if (activeTab === 'drafts' && selectedVideoId) {
            const video = draftVideos.find(v => v.video_id === selectedVideoId);
            if (video?.thumbnail_url) return video.thumbnail_url;
        }

        // For URL tab - try to generate YouTube thumbnail
        if (activeTab === 'url' && sourceVideoUrl) {
            const vid = extractVideoId(sourceVideoUrl);
            // Only generate YouTube thumbnail if it's a valid YouTube ID (11 chars)
            if (vid && vid.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(vid)) {
                return `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
            }
        }

        return null;
    })();

    return (
        <div className={`w-full mx-auto ${compact ? 'py-0' : 'py-2 max-w-6xl'}`}>
            {/* Compact Stepper */}
            <div className="flex items-center justify-between mb-4 px-0">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <React.Fragment key={step.id}>
                            <div
                                onClick={() => isCompleted && setCurrentStep(step.id)}
                                className={cn(
                                    "flex items-center gap-3 cursor-pointer transition-all",
                                    isActive ? "opacity-100" : isCompleted ? "opacity-60 hover:opacity-100" : "opacity-30"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all",
                                    isActive ? "border-primary bg-primary/10 text-primary" :
                                        isCompleted ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" :
                                            "border-border bg-transparent"
                                )}>
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest",
                                        isActive ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        Step 0{step.id}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-bold tracking-tight",
                                        isActive ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn("flex-1 h-[1px] mx-4", isCompleted ? "bg-emerald-500/30" : "bg-border")} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-start`}>
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <Card className="border bg-card shadow-sm rounded-lg">
                                    <CardContent className="p-3">
                                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SourceTab)} className="w-full">
                                            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 h-10">
                                                <TabsTrigger value="channel" className="text-[10px] uppercase font-bold tracking-widest">
                                                    <Youtube className="w-3.5 h-3.5 mr-2" /> Hub
                                                </TabsTrigger>
                                                <TabsTrigger value="url" className="text-[10px] uppercase font-bold tracking-widest">
                                                    <LinkIcon className="w-3.5 h-3.5 mr-2" /> URL
                                                </TabsTrigger>
                                                <TabsTrigger value="upload" className="text-[10px] uppercase font-bold tracking-widest">
                                                    <UploadIcon className="w-3.5 h-3.5 mr-2" /> File
                                                </TabsTrigger>
                                                <TabsTrigger value="drafts" className="text-[10px] uppercase font-bold tracking-widest">
                                                    <FolderOpen className="w-3.5 h-3.5 mr-2" /> Drafts
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
                                        <CardContent className={cn("relative p-4 lg:p-5", compact && "p-4")}>
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                                {activeTab === 'channel' && <Youtube className="w-24 h-24" />}
                                                {activeTab === 'url' && <LinkIcon className="w-24 h-24" />}
                                                {activeTab === 'upload' && <UploadIcon className="w-24 h-24" />}
                                                {activeTab === 'drafts' && <FolderOpen className="w-24 h-24" />}
                                            </div>

                                            {activeTab === 'channel' && (
                                                <div className="space-y-4 relative z-10">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Repository</label>
                                                        <Select value={sourceChannelId} onValueChange={setSourceChannelId}>
                                                            <SelectTrigger className="h-11 rounded-lg border-border bg-background text-xs font-medium focus:ring-primary/20">
                                                                <SelectValue placeholder="Select source hub..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableChannels.map(c => (
                                                                    <SelectItem key={c.id} value={c.id}>
                                                                        {c.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {sourceChannelId && (
                                                        <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto bg-background custom-scrollbar">
                                                            {loadingVideos ? (
                                                                <div className="p-24 flex flex-col items-center gap-4">
                                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Assets...</span>
                                                                </div>
                                                            ) : channelVideos.length === 0 ? (
                                                                <div className="p-20 text-center text-muted-foreground">
                                                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                                    <p className="text-sm font-bold tracking-tight">Zero assets found in this hub</p>
                                                                </div>
                                                            ) : (
                                                                <div className="divide-y divide-border/50">
                                                                    {channelVideos.map((video, idx) => (
                                                                        <div
                                                                            key={`${video.video_id}-${idx}`}
                                                                            onClick={() => {
                                                                                setSelectedVideoId(video.video_id);
                                                                                setCustomTitle(video.title);
                                                                                setCustomDescription(video.description || '');
                                                                            }}
                                                                        className={cn(
                                                                                "flex items-center gap-3 p-3 cursor-pointer transition-all duration-300 group/item",
                                                                                selectedVideoId === video.video_id ? "bg-primary/5" : "hover:bg-muted/50"
                                                                            )}
                                                                        >
                                                                            <div className="relative w-28 aspect-video rounded-md overflow-hidden shrink-0 border border-border group-hover/item:scale-[1.02] transition-transform">
                                                                                {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover transition-all duration-700" alt="" />}
                                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                    <PlayCircle className="w-6 h-6 text-white" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={cn(
                                                                                    "text-sm font-semibold truncate leading-tight tracking-tight mb-2",
                                                                                    selectedVideoId === video.video_id ? "text-primary" : "text-foreground"
                                                                                )}>
                                                                                    {video.title}
                                                                                </p>
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                                        {new Date(video.published_at).toLocaleDateString()}
                                                                                    </span>
                                                                                    <Badge variant="outline" className="text-[8px] h-4 font-bold uppercase tracking-tighter opacity-50">MASTER ASSET</Badge>
                                                                                </div>
                                                                            </div>
                                                                            {selectedVideoId === video.video_id && (
                                                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                                                    <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'url' && (
                                                <div className="space-y-4 relative z-10">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <LinkIcon className="w-3.5 h-3.5 text-primary" />
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Source URL</label>
                                                        </div>
                                                        <Input
                                                            placeholder="https://example.com/video.mp4 or YouTube URL..."
                                                            value={sourceVideoUrl}
                                                            onChange={(e) => setSourceVideoUrl(e.target.value)}
                                                            className="h-11 rounded-lg border-border bg-background text-sm font-medium focus:ring-primary/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Youtube className="w-3.5 h-3.5 text-primary" />
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assign Origin Hub</label>
                                                        </div>
                                                        <Select value={sourceChannelId} onValueChange={setSourceChannelId}>
                                                            <SelectTrigger className="h-11 rounded-lg border-border bg-background text-xs font-medium focus:ring-primary/20">
                                                                <SelectValue placeholder="Select associated channel..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableChannels.map(c => (
                                                                    <SelectItem key={c.id} value={c.id}>
                                                                        {c.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'upload' && (
                                                <div
                                                    className={cn(
                                                        "border-2 border-dashed rounded-xl p-8 text-center transition-all group cursor-pointer relative overflow-hidden",
                                                        uploadedFile ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
                                                    )}
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                        const file = e.dataTransfer.files?.[0];
                                                        if (file) {
                                                            setUploadedFile(file);
                                                            setCustomTitle(file.name.split('.')[0]);
                                                        }
                                                    }}
                                                    onClick={() => document.getElementById('video-upload')?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        id="video-upload"
                                                        className="hidden"
                                                        accept="video/*"
                                                        onChange={handleFileSelect}
                                                    />
                                                    <AnimatePresence mode="wait">
                                                        {uploadedFile ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="space-y-4"
                                                            >
                                                                <div className="p-4 bg-primary text-primary-foreground inline-flex rounded-lg">
                                                                    <FileVideo className="w-10 h-10" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-bold tracking-tight mb-1">{uploadedFile.name}</p>
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Deployment Ready</p>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setUploadedFile(null);
                                                                        setCustomTitle('');
                                                                    }}
                                                                    className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10"
                                                                >
                                                                    Discard Asset
                                                                </Button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="space-y-4 py-4"
                                                            >
                                                                <div className="relative inline-block">
                                                                    <div className="p-5 bg-muted inline-flex rounded-lg border border-border group-hover:scale-110 transition-all duration-500">
                                                                        <UploadIcon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    </div>
                                                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground scale-0 group-hover:scale-100 transition-transform duration-500">
                                                                        <Plus className="w-5 h-5 stroke-[3px]" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-bold tracking-tight">Initiate Local Uplink</p>
                                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">Drag-n-drop high-bitrate media unit</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {activeTab === 'drafts' && (
                                                <div className="space-y-4 relative z-10">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Storage Vault</label>
                                                        <p className="text-xs text-muted-foreground/60">Select from your uploaded videos in storage</p>
                                                    </div>

                                                    <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto bg-background custom-scrollbar">
                                                        {loadingVideos ? (
                                                            <div className="p-24 flex flex-col items-center gap-4">
                                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Loading Vault...</span>
                                                            </div>
                                                        ) : draftVideos.length === 0 ? (
                                                            <div className="p-20 text-center text-muted-foreground">
                                                                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                                <p className="text-sm font-bold tracking-tight">No draft videos found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y divide-border/50">
                                                                {draftVideos.map((video, idx) => (
                                                                    <div
                                                                        key={`${video.video_id}-${idx}`}
                                                                        onClick={() => {
                                                                            setSelectedVideoId(video.video_id);
                                                                            setCustomTitle(video.title);
                                                                            setCustomDescription(video.description || '');
                                                                            setSourceChannelId(video.channel_id || '');
                                                                        }}
                                                                        className={cn(
                                                                            "flex items-center gap-3 p-3 cursor-pointer transition-all duration-300 group/item",
                                                                            selectedVideoId === video.video_id ? "bg-primary/5" : "hover:bg-muted/50"
                                                                        )}
                                                                    >
                                                                        <div className="relative w-28 aspect-video rounded-md overflow-hidden shrink-0 border border-border group-hover/item:scale-[1.02] transition-transform">
                                                                            {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-700" alt="" />}
                                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                <PlayCircle className="w-6 h-6 text-white" />
                                                                            </div>
                                                                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary/90 rounded text-[7px] font-bold uppercase tracking-wider text-primary-foreground">
                                                                                Draft
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={cn(
                                                                                "text-sm font-semibold truncate leading-tight tracking-tight mb-2",
                                                                                selectedVideoId === video.video_id ? "text-primary" : "text-foreground"
                                                                            )}>
                                                                                {video.title}
                                                                            </p>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                                    {new Date((video as Video & { created_at?: string }).created_at || video.published_at || Date.now()).toLocaleDateString()}
                                                                                </span>
                                                                                <Badge variant="secondary" className="text-[8px] h-4 font-bold uppercase tracking-tighter opacity-50">PRODUCTION UNIT</Badge>
                                                                            </div>
                                                                        </div>
                                                                        {selectedVideoId === video.video_id && (
                                                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                                                <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
                                            <CardContent className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 p-5 lg:p-6", compact && "p-4 gap-4")}>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Globe className="w-4 h-4 text-primary" />
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Linguistics</label>
                                                    </div>
                                                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                                                        <SelectTrigger className="h-11 rounded-lg border-border bg-background text-xs font-medium focus:ring-primary/20">
                                                            <SelectValue placeholder="Auto-detect by neural engine" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {LANGUAGE_OPTIONS.map(l => (
                                                                <SelectItem key={l.code} value={l.code}>
                                                                    {l.flag} {l.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Layers className="w-4 h-4 text-primary" />
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Public Registry Title</label>
                                                    </div>
                                                    <Input
                                                        placeholder="Target publication title..."
                                                        value={customTitle}
                                                        onChange={(e) => setCustomTitle(e.target.value)}
                                                        className="h-11 rounded-lg border-border bg-background text-sm font-medium focus:ring-primary/20"
                                                    />
                                                </div>

                                            <div className="space-y-4 md:col-span-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Distribution Description</label>
                                                </div>
                                                <textarea
                                                    rows={5}
                                                    placeholder="Enter descriptive metadata for the global versions..."
                                                    value={customDescription}
                                                    onChange={(e) => setCustomDescription(e.target.value)}
                                                    className="w-full bg-background border border-border text-foreground rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all leading-relaxed"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
                                    <CardContent className={cn("space-y-4 p-5 lg:p-6", compact && "p-4")}>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Synchronization Nodes</label>
                                            <Badge variant="outline" className="text-[8px] h-4 font-bold uppercase tracking-tighter text-teal-500 border-teal-500/20 bg-teal-500/5">CRITICAL STEP</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => toggleTargetChannel(c.id)}
                                                    className={cn(
                                                        "relative group/node flex flex-col p-4 rounded-lg border transition-all duration-500 cursor-pointer overflow-hidden",
                                                        selectedTargetChannels.includes(c.id)
                                                            ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                            : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover/node:scale-110 transition-transform">
                                                        <Globe className="w-20 h-20" />
                                                    </div>

                                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all",
                                                                selectedTargetChannels.includes(c.id) ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {c.language_code ? getLanguageFlag(c.language_code) : '🌐'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={cn(
                                                                    "text-[15px] font-bold tracking-tight leading-none",
                                                                    selectedTargetChannels.includes(c.id) ? "text-primary" : "text-foreground/70"
                                                                )}>{c.name}</span>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">{c.language_name || 'Generic Sync Hub'}</span>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center",
                                                            selectedTargetChannels.includes(c.id) ? "border-primary bg-primary" : "border-border"
                                                        )}>
                                                            {selectedTargetChannels.includes(c.id) && <CheckCircle className="w-4 h-4 text-primary-foreground stroke-[3px]" />}
                                                        </div>
                                                    </div>

                                                    {!c.language_code && selectedTargetChannels.includes(c.id) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-2 space-y-3"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Define Sync Language</label>
                                                            <Select
                                                                value={targetLanguageOverrides[c.id] || ""}
                                                                onValueChange={(val) => setTargetLanguageOverrides(prev => ({ ...prev, [c.id]: val }))}
                                                            >
                                                                <SelectTrigger className="h-10 rounded-xl border-border bg-background/50 text-[10px] font-bold focus:ring-primary/20">
                                                                    <SelectValue placeholder="Choose linguistic target..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {LANGUAGE_OPTIONS.map(l => (
                                                                        <SelectItem key={l.code} value={l.code}>
                                                                            {l.flag} {l.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                            {availableChannels.filter(c => c.id !== sourceChannelId).length === 0 && (
                                                <div className="col-span-full space-y-4">
                                                    <div className="p-6 text-center rounded-lg border border-dashed border-border bg-muted/20">
                                                        <div className="p-4 bg-muted inline-flex rounded-lg mb-4 text-muted-foreground">
                                                            <Globe className="w-10 h-10" />
                                                        </div>
                                                        <p className="text-base font-semibold tracking-tight mb-2">No channels connected</p>
                                                        <p className="text-xs text-muted-foreground mb-6">Select target languages below to create drafts</p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                                                            Select Target Languages <span className="text-primary ml-2">For Drafts</span>
                                                        </label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {LANGUAGE_OPTIONS.slice(0, 12).map(lang => (
                                                                <div
                                                                    key={lang.code}
                                                                    onClick={() => {
                                                                        const langId = `lang_${lang.code}`;
                                                                        if (selectedTargetChannels.includes(langId)) {
                                                                            setSelectedTargetChannels(prev => prev.filter(id => id !== langId));
                                                                            setTargetLanguageOverrides(prev => {
                                                                                const newOverrides = { ...prev };
                                                                                delete newOverrides[langId];
                                                                                return newOverrides;
                                                                            });
                                                                        } else {
                                                                            setSelectedTargetChannels(prev => [...prev, langId]);
                                                                            setTargetLanguageOverrides(prev => ({ ...prev, [langId]: lang.code }));
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                                                                        selectedTargetChannels.includes(`lang_${lang.code}`)
                                                                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                                                            : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
                                                                    )}
                                                                >
                                                                    <span className="text-2xl">{lang.flag}</span>
                                                                    <span className="text-xs font-bold text-foreground/70">{lang.name}</span>
                                                                    {selectedTargetChannels.includes(`lang_${lang.code}`) && (
                                                                        <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <Button
                            onClick={() => {
                                if (currentStep < 3) {
                                    setCurrentStep(prev => prev + 1);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 h-10 px-6 rounded-lg font-bold uppercase tracking-widest text-[10px]",
                                currentStep === 3 ? "hidden" : "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: EXECUTION COMMAND CENTER */}
                <div className="lg:col-span-4 space-y-3 sticky top-4">
                    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
                        <CardContent className={cn("p-5 relative", compact && "p-4")}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Cpu className="w-32 h-32" />
                            </div>

                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                                <Activity className="w-4 h-4 text-primary animate-pulse" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                                    Live Preview
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Cinematic Thumbnail Preview */}
                                <div className="relative aspect-video rounded-lg border border-border overflow-hidden group bg-muted">
                                    {currentThumbnail ? (
                                        <>
                                            <img src={currentThumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]" alt="Preview" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                            <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                <label className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-md font-bold text-[9px] uppercase tracking-widest cursor-pointer">
                                                    Replace Visual
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                                </label>
                                                {thumbnailPreview && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                        className="w-8 h-8 rounded-md bg-black/80 hover:bg-red-600 border border-white/20"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-primary/5">
                                            <div className="w-14 h-14 rounded-lg bg-background border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-500">
                                                <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Assign asset visual</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                        </label>
                                    )}

                                    <div className="absolute top-4 left-4">
                                        <Badge variant="outline" className="bg-black/60 backdrop-blur-xl border-white/20 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">Feed Active</span>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-3 border-b border-border group/line">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover/line:text-foreground transition-colors">Acquisition Mode</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground uppercase tracking-tight">{activeTab}</span>
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                        </div>
                                    </div>
                                    <div className={`flex justify-between items-center py-3 border-b ${isDark ? "border-white/10" : "border-gray-200"} group/line`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"} ${isDark ? "group-hover/line:text-white/60" : "group-hover/line:text-gray-600"} transition-colors`}>Global Fanout</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-olleey-yellow">{selectedTargetChannels.length} Hubs</span>
                                            <Radio className="w-3.5 h-3.5 text-olleey-yellow animate-pulse" />
                                        </div>
                                    </div>
                                    <div className={`flex justify-between items-center py-3 border-b ${isDark ? "border-white/10" : "border-gray-200"} group/line`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"} ${isDark ? "group-hover/line:text-white/60" : "group-hover/line:text-gray-600"} transition-colors`}>Neural Optimizer</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-olleey-yellow">Turbo-XL V9</span>
                                            <Zap className="w-3.5 h-3.5 text-olleey-yellow" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 group/line">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"} ${isDark ? "group-hover/line:text-white/60" : "group-hover/line:text-gray-600"} transition-colors`}>Linguistic Matrix</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{sourceLanguage ? getLanguageFlag(sourceLanguage) : "🌐"}</span>
                                            <ArrowRight className={`w-3.5 h-3.5 ${isDark ? "text-white/40" : "text-gray-500"} group-hover/line:text-olleey-yellow/40 transition-colors`} />
                                            <div className="flex items-center -space-x-1.5 translate-x-1 group-hover/line:translate-x-0 transition-transform">
                                                {selectedTargetChannels.length > 0 ? (
                                                    selectedTargetChannels.slice(0, 4).map(id => {
                                                        const ch = availableChannels.find(c => c.id === id);
                                                        const langCode = targetLanguageOverrides[id] || ch?.language_code;
                                                        return (
                                                            <div key={id} className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#0c0c0c] bg-white/5' : 'border-white bg-gray-100'} flex items-center justify-center`}>
                                                                <span className="text-sm" title={ch?.name}>
                                                                    {langCode ? getLanguageFlag(langCode) : "❓"}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className={`text-xs font-black ${isDark ? "text-white/40" : "text-gray-500"} uppercase tracking-widest`}>Awaiting Nodes</span>
                                                )}
                                                {selectedTargetChannels.length > 4 && (
                                                    <div className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#0c0c0c] bg-white/5' : 'border-white bg-gray-100'} flex items-center justify-center text-[9px] font-black ${isDark ? "text-white/70" : "text-gray-700"}`}>
                                                        +{selectedTargetChannels.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isSubmitting && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`space-y-3 p-4 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'} border ${isDark ? "border-white/10" : "border-gray-200"} rounded-lg`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 animate-spin-slow" />
                                                    Synchronizing Pipeline
                                                </span>
                                                <span className="text-xs font-black text-olleey-yellow font-mono">{uploadProgress}%</span>
                                            </div>
                                            <div className={`w-full h-2 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                    className="h-full bg-olleey-yellow"
                                                />
                                            </div>
                                            <p className={`text-[9px] font-bold ${isDark ? "text-white/60" : "text-gray-600"} uppercase tracking-[0.2em] text-center mt-4`}>Calibrating Transcoding Nodes...</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {error && (
                                    <div className={`flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg`}>
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Security / Handshake Failure</span>
                                            <p className="text-xs font-medium text-red-400 leading-tight opacity-80">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {isSuccessState && (
                                    <div className={`flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg`}>
                                        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pipeline Authenticated</span>
                                            <p className="text-xs font-medium text-emerald-400 opacity-80">Execution commenced.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pt-3">
                                    <Button
                                        size="lg"
                                        onClick={(e) => handleSubmit(e, false)}
                                        disabled={isSubmitting || isSuccessState}
                                        className={`w-full h-12 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-lg relative overflow-hidden group/submit border ${isSuccessState
                                            ? 'bg-emerald-500 text-white border-emerald-400/50'
                                            : `bg-olleey-yellow text-black border-olleey-yellow/50 active:scale-95 ${isDark ? 'hover:bg-amber-300 hover:border-amber-400' : 'hover:bg-amber-400 hover:border-amber-500'}`
                                            } shadow-xl`}
                                    >
                                        <div className={`absolute inset-x-0 top-0 h-[1px] ${isDark ? 'bg-white/20' : 'bg-black/10'} pointer-events-none`} />
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-4">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span>Transmitting</span>
                                            </div>
                                        ) : isSuccessState ? (
                                            <div className="flex items-center gap-4">
                                                <CheckCircle className="w-6 h-6" />
                                                <span>Deployed</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-3">
                                                <Rocket className="w-5 h-5 group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" />
                                                Execute Deployment
                                            </span>
                                        )}
                                    </Button>
                                    {!isSuccessState && (
                                        <>
                                            <Button
                                                size="lg"
                                                onClick={(e) => handleSubmit(e, true)}
                                                disabled={isSubmitting || isSuccessState}
                                                className={`w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-lg relative overflow-hidden group/draft ${isDark
                                                    ? 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-300'
                                                    } active:scale-95`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <FolderOpen className="w-4 h-4 group-hover/draft:scale-110 transition-transform" />
                                                    Save to Drafts
                                                </span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={onCancel}
                                                className={`w-full h-9 text-[10px] font-black uppercase tracking-widest ${isDark
                                                    ? 'text-white/20 hover:text-red-400 hover:bg-red-500/5'
                                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                    } transition-all rounded-md border border-transparent ${isDark ? 'hover:border-red-500/10' : 'hover:border-red-200'
                                                    }`}
                                            >
                                                Abort Operation
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
