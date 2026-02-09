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
import { useTheme } from "@/lib/useTheme";
import { useToast } from "@/components/ui/use-toast";
import { jobsAPI, videosAPI, type Video } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { logger } from "@/lib/logger";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function ManualProcessView({
    availableChannels,
    projectId,
    onSuccess,
    onCancel,
}: ManualProcessViewProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const userId = user?.id;
    const [activeTab, setActiveTab] = useState<SourceTab>("channel");
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

    // Theme-aware classes
    const cardClass = isDark ? "bg-[#0c0c0c]" : "bg-white";
    const cardAltClass = isDark ? "bg-white/[0.03]" : "bg-gray-50";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-white/40" : "text-gray-500";
    const textTertiaryClass = isDark ? "text-white/20" : "text-gray-600";
    const textQuaternaryClass = isDark ? "text-white/10" : "text-gray-500";
    const borderClass = isDark ? "border-white/5" : "border-gray-200";
    const borderLightClass = isDark ? "border-white/10" : "border-gray-300";
    const hoverBgClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-100";
    const activeBgClass = isDark ? "bg-white/[0.02]" : "bg-gray-50/50";
    const inputBgClass = isDark ? "bg-white/[0.03]" : "bg-gray-50";
    const inputBorderClass = isDark ? "border-white/5" : "border-gray-200";
    const overlayClass = isDark ? "bg-black/20" : "bg-gray-100/50";
    const dividerClass = isDark ? "divide-white/[0.03]" : "divide-gray-100";

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
                    
                    const { data, error: queryError } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('user_id', userId)
                        .or('status.eq.draft,storage_url.not.is.null')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false });
                    
                    if (queryError) throw queryError;
                    
                    console.log('[ManualProcessView] Loaded drafts:', { count: data?.length || 0 });
                    setDraftVideos(data || []);
                } catch (err: any) {
                    logger.error("ManualProcessView", "Failed to load draft videos", err);
                    setError("Failed to load draft videos");
                    setDraftVideos([]);
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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Configuration Flow */}
                <div className="lg:col-span-2 space-y-10">

                    {/* STAGE 01: SOURCE HUB */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-olleey-yellow text-black font-black text-[13px] rounded-2xl shrink-0 transition-transform group-hover:rotate-12">01</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Source Acquisition</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Select the root asset for global synchronization</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className="space-y-6">
                            <div className={`${cardClass} border ${borderClass} rounded-[1.5rem] p-1.5 ${activeBgClass} backdrop-blur-xl`}>
                                <div className="flex items-center gap-1.5">
                                    {(['channel', 'url', 'upload', 'drafts'] as SourceTab[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 relative group/btn ${activeTab === tab
                                                ? 'bg-olleey-yellow text-black'
                                                : `${textSecondaryClass} ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-gray-900 hover:bg-gray-50'}`
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {tab === 'channel' && <Youtube className="w-3.5 h-3.5" />}
                                                {tab === 'url' && <LinkIcon className="w-3.5 h-3.5" />}
                                                {tab === 'upload' && <UploadIcon className="w-3.5 h-3.5" />}
                                                {tab === 'drafts' && <FolderOpen className="w-3.5 h-3.5" />}
                                                {tab}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 lg:p-12 transition-all ${activeBgClass} overflow-hidden relative`}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                    {activeTab === 'channel' && <Youtube className="w-40 h-40" />}
                                    {activeTab === 'url' && <LinkIcon className="w-40 h-40" />}
                                    {activeTab === 'upload' && <UploadIcon className="w-40 h-40" />}
                                    {activeTab === 'drafts' && <FolderOpen className="w-40 h-40" />}
                                </div>

                                {activeTab === 'channel' && (
                                    <div className="space-y-8 relative z-10">
                                        <div className="space-y-2">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Source Repository</label>
                                            <select
                                                value={sourceChannelId}
                                                onChange={(e) => setSourceChannelId(e.target.value)}
                                                className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-olleey-yellow outline-none transition-all appearance-none cursor-pointer ${hoverBgClass}`}
                                            >
                                                <option value="" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Select source hub...</option>
                                                {availableChannels.map(c => <option key={c.id} value={c.id} className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        {sourceChannelId && (
                                            <div className={`border ${borderClass} rounded-[2rem] overflow-hidden max-h-[380px] overflow-y-auto ${overlayClass} custom-scrollbar`}>
                                                {loadingVideos ? (
                                                    <div className="p-24 flex flex-col items-center gap-4">
                                                        <Loader2 className="w-10 h-10 animate-spin text-olleey-yellow stroke-[1.5px]" />
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textTertiaryClass}`}>Accessing Assets...</span>
                                                    </div>
                                                ) : channelVideos.length === 0 ? (
                                                    <div className={`p-20 text-center ${textTertiaryClass}`}>
                                                        <Search className="w-12 h-12 mx-auto mb-4" />
                                                        <p className="text-sm font-bold tracking-tight">Zero assets found in this hub</p>
                                                    </div>
                                                ) : (
                                                    <div className={`divide-y ${dividerClass}`}>
                                                        {channelVideos.map((video, idx) => (
                                                            <div
                                                                key={`${video.video_id}-${idx}`}
                                                            onClick={() => {
                                                                setSelectedVideoId(video.video_id);
                                                                setCustomTitle(video.title);
                                                                setCustomDescription(video.description || '');
                                                                // Don't set thumbnailPreview here - let currentThumbnail compute it
                                                            }}
                                                                className={`flex items-center gap-8 p-6 cursor-pointer transition-all duration-300 group/item ${selectedVideoId === video.video_id ? 'bg-olleey-yellow/10' : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'}`}
                                                            >
                                                                <div className={`relative w-36 aspect-video rounded-xl ${isDark ? 'bg-black' : 'bg-gray-200'} overflow-hidden shrink-0 border ${inputBorderClass} group-hover/item:scale-[1.02] transition-transform`}>
                                                                    {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-700" alt="" />}
                                                                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black/60' : 'bg-gradient-to-t from-gray-900/40'} to-transparent flex items-end justify-end p-2 opacity-0 group-hover/item:opacity-100 transition-opacity`}>
                                                                        <PlayCircle className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-[15px] font-bold ${selectedVideoId === video.video_id ? 'text-olleey-yellow' : isDark ? 'text-white/80' : 'text-gray-700'} ${isDark ? 'group-hover/item:text-white' : 'group-hover/item:text-gray-900'} transition-colors line-clamp-2 leading-tight tracking-tight`}>{video.title}</p>
                                                                    <div className="flex items-center gap-4 mt-3">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>
                                                                            {new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </span>
                                                                        <div className={`w-1 h-1 rounded-full ${inputBorderClass}`} />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow/40">MASTER ASSET</span>
                                                                    </div>
                                                                </div>
                                                                {selectedVideoId === video.video_id && (
                                                                    <div className="w-8 h-8 rounded-full bg-olleey-yellow flex items-center justify-center">
                                                                        <CheckCircle className="w-5 h-5 text-black" />
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
                                    <div className="space-y-8 relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <LinkIcon className="w-4 h-4 text-olleey-yellow" />
                                                <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Video Source URL</label>
                                            </div>
                                            <Input
                                                placeholder="https://example.com/video.mp4 or any video URL..."
                                                value={sourceVideoUrl}
                                                onChange={(e) => setSourceVideoUrl(e.target.value)}
                                                className={`${inputBgClass} ${inputBorderClass} ${textClass} h-16 rounded-2xl px-8 text-[13px] font-medium focus:border-olleey-yellow/40 ${isDark ? 'focus:bg-white/[0.05]' : 'focus:bg-white'} transition-all outline-none ${isDark ? 'placeholder:text-white/10' : 'placeholder:text-gray-400'}`}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Youtube className="w-4 h-4 text-olleey-yellow" />
                                                <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Assign Origin Hub</label>
                                            </div>
                                            <select
                                                value={sourceChannelId}
                                                onChange={(e) => setSourceChannelId(e.target.value)}
                                                className={`w-full ${inputBgClass} border ${inputBorderClass} ${textClass} rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-olleey-yellow outline-none transition-all appearance-none cursor-pointer ${hoverBgClass}`}
                                            >
                                                <option value="" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Select associated channel...</option>
                                                {availableChannels.map(c => <option key={c.id} value={c.id} className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'upload' && (
                                    <div
                                        className={`border-2 border-dashed ${uploadedFile ? 'border-olleey-yellow bg-olleey-yellow/5' : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-gray-50/50'} rounded-[2.5rem] p-24 text-center ${isDark ? 'hover:bg-white/[0.03] hover:border-olleey-yellow/20' : 'hover:bg-gray-100 hover:border-olleey-yellow/30'} transition-all group cursor-pointer relative overflow-hidden`}
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
                                                    className="space-y-8"
                                                >
                                                    <div className="p-10 bg-olleey-yellow text-black inline-flex rounded-3xl">
                                                        <FileVideo className="w-14 h-14" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xl font-bold tracking-tighter ${textClass} mb-2`}>{uploadedFile.name}</p>
                                                        <p className={`text-[11px] font-black uppercase tracking-widest ${textTertiaryClass}`}>{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Deployment Ready</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setUploadedFile(null);
                                                            setCustomTitle('');
                                                        }}
                                                        className={`px-8 py-3 ${isDark ? 'bg-white/5 hover:bg-red-500/10' : 'bg-gray-100 hover:bg-red-50'} text-red-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${isDark ? 'border-red-500/10' : 'border-red-200'}`}
                                                    >
                                                        Discard Asset
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="relative inline-block">
                                                        <div className={`p-10 ${isDark ? 'bg-white/3' : 'bg-gray-100'} inline-flex rounded-[2rem] border ${borderClass} ${isDark ? 'group-hover:bg-white/5' : 'group-hover:bg-gray-200'} transition-all group-hover:border-olleey-yellow/30 group-hover:scale-110 duration-500`}>
                                                            <UploadIcon className={`w-12 h-12 ${isDark ? 'text-white/20' : 'text-gray-500'} group-hover:text-olleey-yellow transition-colors`} />
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-olleey-yellow rounded-2xl flex items-center justify-center text-black scale-0 group-hover:scale-100 transition-transform duration-500">
                                                            <Plus className="w-6 h-6 stroke-[3px]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-lg font-normal ${textClass} tracking-tighter`}>Initiate Local Uplink</p>
                                                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${textQuaternaryClass} mt-2`}>Drag-n-drop high-bitrate media unit</p>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-6 mt-10">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-[9px] font-black ${textTertiaryClass} uppercase tracking-widest`}>Limit</span>
                                                            <span className={`text-xs font-bold ${textSecondaryClass}`}>2.0 GB</span>
                                                        </div>
                                                        <div className={`w-px h-8 ${inputBorderClass}`} />
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-[9px] font-black ${textTertiaryClass} uppercase tracking-widest`}>Formats</span>
                                                            <span className={`text-xs font-bold ${textSecondaryClass}`}>MP4, MOV</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {activeTab === 'drafts' && (
                                    <div className="space-y-8 relative z-10">
                                        <div className="space-y-2">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Storage Vault</label>
                                            <p className={`text-[11px] ${textSecondaryClass} font-medium`}>Select from your uploaded videos in Supabase storage</p>
                                        </div>

                                        <div className={`border ${borderClass} rounded-[2rem] overflow-hidden max-h-[380px] overflow-y-auto ${overlayClass} custom-scrollbar`}>
                                            {loadingVideos ? (
                                                <div className="p-24 flex flex-col items-center gap-4">
                                                    <Loader2 className="w-10 h-10 animate-spin text-olleey-yellow stroke-[1.5px]" />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textTertiaryClass}`}>Loading Drafts...</span>
                                                </div>
                                            ) : draftVideos.length === 0 ? (
                                                <div className={`p-20 text-center ${textTertiaryClass}`}>
                                                    <FolderOpen className="w-12 h-12 mx-auto mb-4" />
                                                    <p className="text-sm font-bold tracking-tight">No draft videos found</p>
                                                    <p className={`text-xs ${textSecondaryClass} mt-2`}>Upload videos to see them here</p>
                                                </div>
                                            ) : (
                                                <div className={`divide-y ${dividerClass}`}>
                                                    {draftVideos.map((video, idx) => (
                                                        <div
                                                            key={`${video.video_id}-${idx}`}
                                                            onClick={() => {
                                                                setSelectedVideoId(video.video_id);
                                                                setCustomTitle(video.title);
                                                                setCustomDescription(video.description || '');
                                                                setSourceChannelId(video.channel_id || availableChannels[0]?.id || '');
                                                                // Don't set thumbnailPreview here - let currentThumbnail compute it
                                                            }}
                                                            className={`flex items-center gap-8 p-6 cursor-pointer transition-all duration-300 group/item ${selectedVideoId === video.video_id ? 'bg-olleey-yellow/10' : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div className={`relative w-36 aspect-video rounded-xl ${isDark ? 'bg-black' : 'bg-gray-200'} overflow-hidden shrink-0 border ${inputBorderClass} group-hover/item:scale-[1.02] transition-transform`}>
                                                                {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-700" alt="" />}
                                                                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black/60' : 'bg-gradient-to-t from-gray-900/40'} to-transparent flex items-end justify-end p-2 opacity-0 group-hover/item:opacity-100 transition-opacity`}>
                                                                    <PlayCircle className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500/80 backdrop-blur-sm rounded text-[8px] font-black uppercase tracking-wider text-white">
                                                                    Draft
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[15px] font-bold ${selectedVideoId === video.video_id ? 'text-olleey-yellow' : isDark ? 'text-white/80' : 'text-gray-700'} ${isDark ? 'group-hover/item:text-white' : 'group-hover/item:text-gray-900'} transition-colors line-clamp-2 leading-tight tracking-tight`}>{video.title}</p>
                                                                <div className="flex items-center gap-4 mt-3">
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>
                                                                        {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                    <div className={`w-1 h-1 rounded-full ${inputBorderClass}`} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400/60">STORAGE VAULT</span>
                                                                </div>
                                                            </div>
                                                            {selectedVideoId === video.video_id && (
                                                                <div className="w-8 h-8 rounded-full bg-olleey-yellow flex items-center justify-center">
                                                                    <CheckCircle className="w-5 h-5 text-black" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* STAGE 02: ANALYSIS & NEURAL PARAMS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 text-white font-black text-[13px] rounded-2xl shrink-0 transition-transform group-hover:rotate-12">02</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Neural Configuration</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Define linguistic context and metadata layers</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 ${activeBgClass} space-y-10 backdrop-blur-3xl`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Globe className="w-4 h-4 text-indigo-400" />
                                        <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Source Linguistics</label>
                                    </div>
                                    <select
                                        value={sourceLanguage}
                                        onChange={(e) => setSourceLanguage(e.target.value)}
                                        className={`w-full ${inputBgClass} border ${inputBorderClass} ${textClass} rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer ${hoverBgClass}`}
                                    >
                                        <option value="" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Auto-detect by neural engine</option>
                                        {LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code} className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>{l.flag} {l.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Layers className="w-4 h-4 text-indigo-400" />
                                        <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Public Registry Title</label>
                                    </div>
                                    <Input
                                        placeholder="Target publication title..."
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        className={`${inputBgClass} ${inputBorderClass} ${textClass} h-[62px] rounded-2xl px-6 text-[13px] font-medium focus:border-indigo-400/40 ${isDark ? 'focus:bg-white/[0.05]' : 'focus:bg-white'} transition-all outline-none`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass}`}>Global Distribution Description</label>
                                </div>
                                <textarea
                                    rows={5}
                                    placeholder="Enter descriptive metadata for the global versions..."
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    className={`w-full ${inputBgClass} border ${inputBorderClass} ${isDark ? 'text-white/70' : 'text-gray-700'} rounded-[2rem] p-8 text-sm font-medium focus:border-indigo-400 outline-none resize-none transition-all ${hoverBgClass} leading-relaxed`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* STAGE 03: GLOBAL DEPLOYMENT */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white font-black text-[13px] rounded-2xl shrink-0 transition-transform group-hover:rotate-12">03</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Distribution Targets</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Select international deployment hubs</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 ${activeBgClass} backdrop-blur-3xl`}>
                            <div className="space-y-6">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass} mb-4 block`}>Select Synchronization Nodes <span className="text-emerald-500 ml-2 font-bold opacity-50 underline underline-offset-4">CRITICAL STEP</span></label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => toggleTargetChannel(c.id)}
                                            className={`relative group/node flex flex-col p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${selectedTargetChannels.includes(c.id)
                                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                                : isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'}`}
                                        >
                                            <div className={`absolute top-0 right-0 p-6 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'} pointer-events-none group-hover/node:scale-110 transition-transform`}>
                                                <Globe className="w-20 h-20" />
                                            </div>

                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl transition-all ${selectedTargetChannels.includes(c.id) ? 'bg-emerald-500 text-white scale-110' : isDark ? 'bg-white/5 opacity-40 group-hover/node:opacity-100 group-hover/node:bg-white/10' : 'bg-gray-100 opacity-60 group-hover/node:opacity-100 group-hover/node:bg-gray-200'}`}>
                                                        {c.language_code ? getLanguageFlag(c.language_code) : '🌐'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[15px] font-bold tracking-tight leading-none ${selectedTargetChannels.includes(c.id) ? textClass : isDark ? 'text-white/40 group-hover/node:text-white/70' : 'text-gray-500 group-hover/node:text-gray-700'}`}>{c.name}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass} mt-1.5`}>{c.language_name || 'Generic Sync Hub'}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${selectedTargetChannels.includes(c.id) ? 'border-emerald-500 bg-emerald-500' : isDark ? 'border-white/10' : 'border-gray-300'}`}>
                                                    {selectedTargetChannels.includes(c.id) && <CheckCircle className="w-4 h-4 text-black stroke-[3px]" />}
                                                </div>
                                            </div>

                                            {!c.language_code && selectedTargetChannels.includes(c.id) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-2 space-y-3"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Define Sync Language</label>
                                                    <select
                                                        value={targetLanguageOverrides[c.id] || ""}
                                                        onChange={(e) => setTargetLanguageOverrides(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                        className={`w-full ${isDark ? 'bg-black/40' : 'bg-gray-100'} border border-emerald-500/20 ${textClass} rounded-xl px-4 py-3 text-[11px] font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer`}
                                                    >
                                                        <option value="">Choose linguistic target...</option>
                                                        {LANGUAGE_OPTIONS.map(l => (
                                                            <option key={l.code} value={l.code} className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>{l.flag} {l.name}</option>
                                                        ))}
                                                    </select>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                    {availableChannels.filter(c => c.id !== sourceChannelId).length === 0 && (
                                        <div className={`col-span-full space-y-6`}>
                                            <div className={`p-12 text-center rounded-[2rem] border border-dashed ${isDark ? 'border-white/10 bg-white/[0.01]' : 'border-gray-200 bg-gray-50'}`}>
                                                <div className={`p-6 ${isDark ? 'bg-white/3' : 'bg-gray-100'} inline-flex rounded-3xl mb-6 ${textTertiaryClass}`}>
                                                    <Globe className="w-10 h-10" />
                                                </div>
                                                <p className={`text-base font-normal ${textSecondaryClass} tracking-tighter mb-2`}>No channels connected</p>
                                                <p className={`text-xs ${textTertiaryClass} mb-6`}>Select target languages below to create drafts</p>
                                            </div>

                                            {/* Direct Language Selection */}
                                            <div className="space-y-4">
                                                <label className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass} block`}>
                                                    Select Target Languages <span className="text-emerald-500 ml-2">For Drafts</span>
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${selectedTargetChannels.includes(`lang_${lang.code}`)
                                                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                                                : isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="text-2xl">{lang.flag}</span>
                                                            <span className={`text-xs font-bold ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{lang.name}</span>
                                                            {selectedTargetChannels.includes(`lang_${lang.code}`) && (
                                                                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: EXECUTION COMMAND CENTER */}
                <div className="space-y-6 sticky top-8 h-fit">
                    <div className={`${cardClass} border ${borderLightClass} rounded-[2.5rem] p-10 relative overflow-hidden ${activeBgClass} backdrop-blur-[40px]`}>
                        <div className={`absolute top-0 right-0 p-8 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'} pointer-events-none`}>
                            <Cpu className="w-32 h-32" />
                        </div>

                        <div className={`flex items-center gap-3 mb-10 pb-6 border-b ${inputBorderClass}`}>
                            <div className="w-2 h-2 rounded-full bg-olleey-yellow animate-pulse" />
                            <h3 className={`text-sm font-black uppercase tracking-[0.25em] ${textClass}`}>
                                Preview
                            </h3>
                        </div>

                        <div className="space-y-8">
                            {/* Cinematic Thumbnail Preview */}
                            <div className={`relative aspect-video rounded-3xl border ${borderLightClass} overflow-hidden group ${isDark ? 'bg-black' : 'bg-gray-200'}`}>
                                {currentThumbnail ? (
                                    <>
                                        <img src={currentThumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]" alt="Preview" />
                                        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black' : 'bg-gradient-to-t from-gray-900/60'} via-transparent to-transparent opacity-60`} />
                                        <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <label className="px-5 py-2 bg-olleey-yellow text-black hover:bg-white transition-all rounded-full font-black text-[9px] uppercase tracking-widest cursor-pointer">
                                                Replace Visual
                                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                            </label>
                                            {thumbnailPreview && (
                                                <button
                                                    onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                    className={`w-10 h-10 flex items-center justify-center ${isDark ? 'bg-black/80' : 'bg-gray-900/80'} text-white rounded-full border ${isDark ? 'border-white/20' : 'border-gray-600'} hover:bg-red-500 transition-all`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-300/30'}`}>
                                        <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-white/3' : 'bg-gray-300'} flex items-center justify-center border ${borderLightClass} mb-4 group-hover:scale-110 transition-all duration-500`}>
                                            <ImageIcon className={`w-8 h-8 ${isDark ? 'text-white/10' : 'text-gray-500'} group-hover:text-olleey-yellow transition-colors`} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${textTertiaryClass} group-hover:text-olleey-yellow/40 transition-colors`}>Assign asset visual</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                    </label>
                                )}

                                <div className="absolute top-4 left-4">
                                    <div className={`px-2.5 py-1.5 ${isDark ? 'bg-black/60' : 'bg-gray-900/70'} backdrop-blur-xl rounded-lg border ${borderLightClass} flex items-center gap-2`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className={`text-[9px] font-black ${isDark ? 'text-white/80' : 'text-white'} uppercase tracking-widest`}>Feed Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={`flex justify-between items-center py-5 border-b ${inputBorderClass} group/line`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${textQuaternaryClass} group-hover/line:${textTertiaryClass} transition-colors`}>Acquisition Mode</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${textClass} uppercase tracking-tight`}>{activeTab}</span>
                                        <div className="w-1 h-1 rounded-full bg-olleey-yellow" />
                                    </div>
                                </div>
                                <div className={`flex justify-between items-center py-5 border-b ${inputBorderClass} group/line`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${textQuaternaryClass} group-hover/line:${textTertiaryClass} transition-colors`}>Global Fanout</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-olleey-yellow">{selectedTargetChannels.length} Hubs</span>
                                        <Radio className="w-3.5 h-3.5 text-olleey-yellow animate-pulse" />
                                    </div>
                                </div>
                                <div className={`flex justify-between items-center py-5 border-b ${inputBorderClass} group/line`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${textQuaternaryClass} group-hover/line:${textTertiaryClass} transition-colors`}>Neural Optimizer</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-olleey-yellow">Turbo-XL V9</span>
                                        <Zap className="w-3.5 h-3.5 text-olleey-yellow" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 group/line">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${textQuaternaryClass} group-hover/line:${textTertiaryClass} transition-colors`}>Linguistic Matrix</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{sourceLanguage ? getLanguageFlag(sourceLanguage) : "🌐"}</span>
                                        <ArrowRight className={`w-3.5 h-3.5 ${textQuaternaryClass} group-hover/line:text-olleey-yellow/40 transition-colors`} />
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
                                                <span className={`text-xs font-black ${textQuaternaryClass} uppercase tracking-widest`}>Awaiting Nodes</span>
                                            )}
                                            {selectedTargetChannels.length > 4 && (
                                                <div className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#0c0c0c] bg-white/5' : 'border-white bg-gray-100'} flex items-center justify-center text-[9px] font-black ${textSecondaryClass}`}>
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
                                        className={`space-y-4 p-8 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'} border ${borderLightClass} rounded-[2rem]`}
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
                                        <p className={`text-[9px] font-bold ${textTertiaryClass} uppercase tracking-[0.2em] text-center mt-4`}>Calibrating Transcoding Nodes...</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className={`flex items-start gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-xl`}>
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Security / Handshake Failure</span>
                                        <p className="text-xs font-medium text-red-400 leading-tight opacity-80">{error}</p>
                                    </div>
                                </div>
                            ) || isSuccessState && (
                                <div className={`flex items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-xl`}>
                                    <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pipeline Authenticated</span>
                                        <p className="text-xs font-medium text-emerald-400 opacity-80">Execution commenced.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 pt-6">
                                <Button
                                    size="lg"
                                    onClick={(e) => handleSubmit(e, false)}
                                    disabled={isSubmitting || isSuccessState}
                                    className={`w-full h-14 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 rounded-[1.5rem] relative overflow-hidden group/submit ${isSuccessState
                                        ? 'bg-emerald-500 text-white'
                                        : `bg-olleey-yellow text-black active:scale-95 ${isDark ? 'hover:bg-amber-300' : 'hover:bg-amber-400'}`
                                        }`}
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
                                            className={`w-full h-12 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 rounded-[1.5rem] relative overflow-hidden group/draft ${
                                                isDark 
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
                                            className={`w-full h-10 text-[10px] font-black uppercase tracking-widest ${
                                                isDark 
                                                    ? 'text-white/20 hover:text-red-400 hover:bg-red-500/5' 
                                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                            } transition-all rounded-full border border-transparent ${
                                                isDark ? 'hover:border-red-500/10' : 'hover:border-red-200'
                                            }`}
                                        >
                                            Abort Operation
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
