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
    Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/useTheme";
import { useToast } from "@/components/ui/use-toast";
import { jobsAPI, videosAPI, type Video } from "@/lib/api";
import { logger } from "@/lib/logger";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

type SourceTab = "channel" | "url" | "upload";

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
    const [activeTab, setActiveTab] = useState<SourceTab>("channel");
    const [sourceVideoUrl, setSourceVideoUrl] = useState("");
    const [sourceChannelId, setSourceChannelId] = useState("");
    const [selectedVideoId, setSelectedVideoId] = useState("");
    const [channelVideos, setChannelVideos] = useState<Video[]>([]);
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
    const borderClass = isDark ? "border-white/5" : "border-gray-200";

    // Load videos when channel is selected
    useEffect(() => {
        const loadChannelVideos = async () => {
            if (activeTab === "channel" && sourceChannelId) {
                try {
                    setLoadingVideos(true);
                    setError(null);
                    const response = await videosAPI.listVideos({ channel_id: sourceChannelId });
                    setChannelVideos(response.videos);
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
    }, [sourceChannelId, activeTab]);

    const extractVideoId = (url: string): string | null => {
        try {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                /^([a-zA-Z0-9_-]{11})$/,
            ];
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) return match[1];
            }
            return null;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        let videoId: string | null = null;
        try {
            setIsSubmitting(true);

            if (activeTab === "channel") {
                if (!sourceChannelId || !selectedVideoId) {
                    setError("Please select a source channel and video");
                    setIsSubmitting(false);
                    return;
                }
                videoId = selectedVideoId;
            } else if (activeTab === "url") {
                videoId = extractVideoId(sourceVideoUrl.trim());
                if (!videoId || !sourceChannelId) {
                    setError("Please enter a valid YouTube URL and select a source channel");
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
                    channel_id: sourceChannelId || availableChannels[0]?.id
                });
                videoId = uploadRes.video_id;
                setUploadProgress(50);
            }

            if (selectedTargetChannels.length === 0) {
                setError("Please select at least one target channel");
                setIsSubmitting(false);
                return;
            }

            const targetLanguages = selectedTargetChannels
                .map(id => {
                    const ch = availableChannels.find(c => c.id === id);
                    return targetLanguageOverrides[id] || ch?.language_code;
                })
                .filter(Boolean) as string[];

            await jobsAPI.createJob({
                source_video_id: videoId!,
                source_channel_id: sourceChannelId || availableChannels[0]?.id,
                target_languages: targetLanguages,
                project_id: projectId || "",
                title: customTitle,
                description: customDescription,
                is_simulation: true,
            });

            setUploadProgress(100);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccessState(true);
                toast(`🚀 Production Pipeline Started! Processing "${customTitle || 'Video'}"`, "success");
                setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);
            }, 1000);

        } catch (err: any) {
            setError(err.message || "Failed to initiate pipeline");
            setIsSubmitting(false);
        }
    };

    const currentThumbnail = (() => {
        if (thumbnailPreview) return thumbnailPreview;
        if (activeTab === 'channel' && selectedVideoId) {
            return channelVideos.find(v => v.video_id === selectedVideoId)?.thumbnail_url;
        }
        if (activeTab === 'url' && sourceVideoUrl) {
            const vid = extractVideoId(sourceVideoUrl);
            if (vid) return `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
        }
        return null;
    })();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Configuration Flow */}
                <div className="lg:col-span-2 space-y-16">

                    {/* STAGE 01: SOURCE HUB */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-olleey-yellow text-black font-black text-[13px] rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)] shrink-0 transition-transform group-hover:rotate-12">01</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Source Acquisition</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Select the root asset for global synchronization</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className="space-y-6">
                            <div className={`${cardClass} border ${borderClass} rounded-[1.5rem] p-1.5 shadow-2xl bg-white/[0.02] backdrop-blur-xl`}>
                                <div className="flex items-center gap-1.5">
                                    {(['channel', 'url', 'upload'] as SourceTab[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 relative group/btn ${activeTab === tab
                                                ? 'bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/20'
                                                : `${textSecondaryClass} hover:text-white hover:bg-white/5`
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {tab === 'channel' && <Youtube className="w-3.5 h-3.5" />}
                                                {tab === 'url' && <LinkIcon className="w-3.5 h-3.5" />}
                                                {tab === 'upload' && <UploadIcon className="w-3.5 h-3.5" />}
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
                                className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 lg:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all bg-white/[0.01] overflow-hidden relative`}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                    {activeTab === 'channel' && <Youtube className="w-40 h-40" />}
                                    {activeTab === 'url' && <LinkIcon className="w-40 h-40" />}
                                    {activeTab === 'upload' && <UploadIcon className="w-40 h-40" />}
                                </div>

                                {activeTab === 'channel' && (
                                    <div className="space-y-8 relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Source Repository</label>
                                            <select
                                                value={sourceChannelId}
                                                onChange={(e) => setSourceChannelId(e.target.value)}
                                                className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-olleey-yellow outline-none transition-all appearance-none cursor-pointer hover:bg-white/5`}
                                            >
                                                <option value="" className="bg-[#0a0a0a]">Select source hub...</option>
                                                {availableChannels.map(c => <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>)}
                                            </select>
                                        </div>

                                        {sourceChannelId && (
                                            <div className={`border ${borderClass} rounded-[2rem] overflow-hidden max-h-[380px] overflow-y-auto bg-black/20 custom-scrollbar`}>
                                                {loadingVideos ? (
                                                    <div className="p-24 flex flex-col items-center gap-4">
                                                        <Loader2 className="w-10 h-10 animate-spin text-olleey-yellow stroke-[1.5px]" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Accessing Assets...</span>
                                                    </div>
                                                ) : channelVideos.length === 0 ? (
                                                    <div className="p-20 text-center opacity-20">
                                                        <Search className="w-12 h-12 mx-auto mb-4" />
                                                        <p className="text-sm font-bold tracking-tight">Zero assets found in this hub</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-white/[0.03]">
                                                        {channelVideos.map((video, idx) => (
                                                            <div
                                                                key={`${video.video_id}-${idx}`}
                                                                onClick={() => {
                                                                    setSelectedVideoId(video.video_id);
                                                                    setCustomTitle(video.title);
                                                                }}
                                                                className={`flex items-center gap-8 p-6 cursor-pointer transition-all duration-300 group/item ${selectedVideoId === video.video_id ? 'bg-olleey-yellow/10' : 'hover:bg-white/[0.04]'}`}
                                                            >
                                                                <div className="relative w-36 aspect-video rounded-xl bg-black overflow-hidden shrink-0 border border-white/5 shadow-2xl group-hover/item:scale-[1.02] transition-transform">
                                                                    {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-700" alt="" />}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-end p-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                        <PlayCircle className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-[15px] font-bold ${selectedVideoId === video.video_id ? 'text-olleey-yellow' : 'text-white/80'} group-hover/item:text-white transition-colors line-clamp-2 leading-tight tracking-tight`}>{video.title}</p>
                                                                    <div className="flex items-center gap-4 mt-3">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest text-white/20`}>
                                                                            {new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </span>
                                                                        <div className="w-1 h-1 rounded-full bg-white/5" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow/40">MASTER ASSET</span>
                                                                    </div>
                                                                </div>
                                                                {selectedVideoId === video.video_id && (
                                                                    <div className="w-8 h-8 rounded-full bg-olleey-yellow flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)]">
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
                                    <div className="space-y-10 relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <LinkIcon className="w-4 h-4 text-olleey-yellow" />
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Endpoint URL</label>
                                            </div>
                                            <Input
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={sourceVideoUrl}
                                                onChange={(e) => setSourceVideoUrl(e.target.value)}
                                                className={`bg-white/[0.03] border-white/5 text-white h-16 rounded-2xl px-8 text-[13px] font-medium focus:border-olleey-yellow/40 focus:bg-white/[0.05] transition-all outline-none placeholder:text-white/10`}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Youtube className="w-4 h-4 text-olleey-yellow" />
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Assign Origin Hub</label>
                                            </div>
                                            <select
                                                value={sourceChannelId}
                                                onChange={(e) => setSourceChannelId(e.target.value)}
                                                className={`w-full bg-white/[0.03] border border-white/5 text-white rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-olleey-yellow outline-none transition-all appearance-none cursor-pointer hover:bg-white/5`}
                                            >
                                                <option value="" className="bg-[#0a0a0a]">Select associated channel...</option>
                                                {availableChannels.map(c => <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'upload' && (
                                    <div
                                        className={`border-2 border-dashed ${uploadedFile ? 'border-olleey-yellow bg-olleey-yellow/5' : 'border-white/5 bg-white/[0.01]'} rounded-[2.5rem] p-24 text-center hover:bg-white/[0.03] hover:border-olleey-yellow/20 transition-all group cursor-pointer relative overflow-hidden`}
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
                                                    <div className="p-10 bg-olleey-yellow text-black inline-flex rounded-3xl shadow-[0_20px_40px_rgba(251,191,36,0.3)]">
                                                        <FileVideo className="w-14 h-14" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold tracking-tighter text-white mb-2">{uploadedFile.name}</p>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Deployment Ready</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                                                        className="px-8 py-3 bg-white/5 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-red-500/10"
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
                                                        <div className="p-10 bg-white/3 inline-flex rounded-[2rem] border border-white/5 group-hover:bg-white/5 transition-all group-hover:border-olleey-yellow/30 group-hover:scale-110 duration-500">
                                                            <UploadIcon className={`w-12 h-12 text-white/20 group-hover:text-olleey-yellow transition-colors`} />
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-olleey-yellow rounded-2xl flex items-center justify-center text-black shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                                            <Plus className="w-6 h-6 stroke-[3px]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-normal text-white tracking-tighter">Initiate Local Uplink</p>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/10 mt-2">Drog-n-drop high-bitrate media unit</p>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-6 mt-10">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Limit</span>
                                                            <span className="text-xs font-bold text-white/40">2.0 GB</span>
                                                        </div>
                                                        <div className="w-px h-8 bg-white/5" />
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Formats</span>
                                                            <span className="text-xs font-bold text-white/40">MP4, MOV</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* STAGE 02: ANALYSIS & NEURAL PARAMS */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 text-white font-black text-[13px] rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 transition-transform group-hover:rotate-12">02</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Neural Configuration</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Define linguistic context and metadata layers</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 shadow-2xl bg-white/[0.01] space-y-12 backdrop-blur-3xl`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Globe className="w-4 h-4 text-indigo-400" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Source Linguistics</label>
                                    </div>
                                    <select
                                        value={sourceLanguage}
                                        onChange={(e) => setSourceLanguage(e.target.value)}
                                        className={`w-full bg-white/[0.03] border border-white/5 text-white rounded-2xl px-6 py-5 text-[13px] font-medium focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer hover:bg-white/5`}
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Auto-detect by neural engine</option>
                                        {LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code} className="bg-[#0a0a0a]">{l.flag} {l.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Layers className="w-4 h-4 text-indigo-400" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Public Registry Title</label>
                                    </div>
                                    <Input
                                        placeholder="Target publication title..."
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        className="bg-white/[0.03] border-white/5 text-white h-[62px] rounded-2xl px-6 text-[13px] font-medium focus:border-indigo-400/40 focus:bg-white/[0.05] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Global Distribution Description</label>
                                </div>
                                <textarea
                                    rows={5}
                                    placeholder="Enter descriptive metadata for the global versions..."
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    className={`w-full bg-white/[0.02] border border-white/5 text-white/70 rounded-[2rem] p-8 text-sm font-medium focus:border-indigo-400 outline-none resize-none transition-all hover:bg-white/[0.03] leading-relaxed`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* STAGE 03: GLOBAL DEPLOYMENT */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white font-black text-[13px] rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 transition-transform group-hover:rotate-12">03</div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>Distribution Targets</h3>
                                <p className={`text-[11px] ${textSecondaryClass} font-medium tracking-tight opacity-50`}>Select international deployment hubs</p>
                            </div>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-20 mx-4`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 shadow-2xl bg-white/[0.01] backdrop-blur-3xl`}>
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 block">Select Synchronization Nodes <span className="text-emerald-500 ml-2 font-bold opacity-50 underline underline-offset-4">CRITICAL STEP</span></label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                    {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => toggleTargetChannel(c.id)}
                                            className={`relative group/node flex flex-col p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${selectedTargetChannels.includes(c.id)
                                                ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.1)]'
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'}`}
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover/node:scale-110 transition-transform">
                                                <Globe className="w-20 h-20" />
                                            </div>

                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all ${selectedTargetChannels.includes(c.id) ? 'bg-emerald-500 text-white scale-110' : 'bg-white/5 opacity-40 group-hover/node:opacity-100 group-hover/node:bg-white/10'}`}>
                                                        {c.language_code ? getLanguageFlag(c.language_code) : '🌐'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[15px] font-bold tracking-tight leading-none ${selectedTargetChannels.includes(c.id) ? 'text-white' : 'text-white/40 group-hover/node:text-white/70'}`}>{c.name}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1.5">{c.language_name || 'Generic Sync Hub'}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${selectedTargetChannels.includes(c.id) ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-white/10'}`}>
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
                                                        className={`w-full bg-black/40 border border-emerald-500/20 text-white rounded-xl px-4 py-3 text-[11px] font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer`}
                                                    >
                                                        <option value="">Choose linguistic target...</option>
                                                        {LANGUAGE_OPTIONS.map(l => (
                                                            <option key={l.code} value={l.code} className="bg-[#0a0a0a]">{l.flag} {l.name}</option>
                                                        ))}
                                                    </select>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                    {availableChannels.filter(c => c.id !== sourceChannelId).length === 0 && (
                                        <div className={`col-span-full p-12 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.01]`}>
                                            <div className="p-6 bg-white/3 inline-flex rounded-3xl mb-6 opacity-20">
                                                <Radio className="w-10 h-10 text-white" />
                                            </div>
                                            <p className="text-base font-normal text-white/40 tracking-tighter mb-4">Zero synchronized hubs connected</p>
                                            <Button
                                                variant="outline"
                                                className="h-12 px-8 rounded-full border-white/10 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-widest text-[10px]"
                                                onClick={() => router.push('/connections/add')}
                                            >
                                                Add Distribution Hub
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: EXECUTION COMMAND CENTER */}
                <div className="space-y-8 sticky top-8 h-fit">
                    <div className={`${cardClass} border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden bg-white/[0.02] backdrop-blur-[40px]`}>
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Cpu className="w-32 h-32" />
                        </div>

                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                            <div className="w-2 h-2 rounded-full bg-olleey-yellow animate-pulse shadow-[0_0_10px_#fbbf24]" />
                            <h3 className={`text-sm font-black uppercase tracking-[0.25em] text-white`}>
                                Mission Control
                            </h3>
                        </div>

                        <div className="space-y-10">
                            {/* Cinematic Thumbnail Preview */}
                            <div className={`relative aspect-video rounded-3xl border border-white/10 overflow-hidden group shadow-2xl bg-black`}>
                                {currentThumbnail ? (
                                    <>
                                        <img src={currentThumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]" alt="Preview" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                        <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <label className="px-5 py-2 bg-olleey-yellow text-black hover:bg-white transition-all rounded-full font-black text-[9px] uppercase tracking-widest cursor-pointer shadow-xl">
                                                Replace Visual
                                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                            </label>
                                            {thumbnailPreview && (
                                                <button
                                                    onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                    className="w-10 h-10 flex items-center justify-center bg-black/80 text-white rounded-full border border-white/20 hover:bg-red-500 transition-all shadow-xl"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-white/5">
                                        <div className="w-16 h-16 rounded-full bg-white/3 flex items-center justify-center border border-white/10 mb-4 group-hover:scale-110 transition-all duration-500">
                                            <ImageIcon className={`w-8 h-8 text-white/10 group-hover:text-olleey-yellow transition-colors`} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-olleey-yellow/40 transition-colors`}>Assign asset visual</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                    </label>
                                )}

                                <div className="absolute top-4 left-4">
                                    <div className="px-2.5 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Feed Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-5 border-b border-white/[0.03] group/line">
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-white/10 group-hover/line:text-white/20 transition-colors`}>Acquisition Mode</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold text-white uppercase tracking-tight`}>{activeTab}</span>
                                        <div className="w-1 h-1 rounded-full bg-olleey-yellow" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-white/[0.03] group/line">
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-white/10 group-hover/line:text-white/20 transition-colors`}>Global Fanout</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-olleey-yellow">{selectedTargetChannels.length} Hubs</span>
                                        <Radio className="w-3.5 h-3.5 text-olleey-yellow animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-white/[0.03] group/line">
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-white/10 group-hover/line:text-white/20 transition-colors`}>Neural Optimizer</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-olleey-yellow">Turbo-XL V9</span>
                                        <Zap className="w-3.5 h-3.5 text-olleey-yellow" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-5 group/line">
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-white/10 group-hover/line:text-white/20 transition-colors`}>Linguistic Matrix</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl shadow-lg">{sourceLanguage ? getLanguageFlag(sourceLanguage) : "🌐"}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover/line:text-olleey-yellow/40 transition-colors" />
                                        <div className="flex items-center -space-x-1.5 translate-x-1 group-hover/line:translate-x-0 transition-transform">
                                            {selectedTargetChannels.length > 0 ? (
                                                selectedTargetChannels.slice(0, 4).map(id => {
                                                    const ch = availableChannels.find(c => c.id === id);
                                                    const langCode = targetLanguageOverrides[id] || ch?.language_code;
                                                    return (
                                                        <div key={id} className="w-8 h-8 rounded-full border-2 border-[#0c0c0c] bg-white/5 flex items-center justify-center shadow-xl">
                                                            <span className="text-sm" title={ch?.name}>
                                                                {langCode ? getLanguageFlag(langCode) : "❓"}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs font-black text-white/10 uppercase tracking-widest">Awaiting Nodes</span>
                                            )}
                                            {selectedTargetChannels.length > 4 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c0c] bg-white/5 flex items-center justify-center text-[9px] font-black text-white/40">
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
                                        className="space-y-4 p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] shadow-inner"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5 animate-spin-slow" />
                                                Synchronizing Pipeline
                                            </span>
                                            <span className="text-xs font-black text-olleey-yellow font-mono">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                className="h-full bg-olleey-yellow shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] text-center mt-4">Calibrating Transcoding Nodes...</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className="flex items-start gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-xl">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Security / Handshake Failure</span>
                                        <p className="text-xs font-medium text-red-400 leading-tight opacity-80">{error}</p>
                                    </div>
                                </div>
                            ) || isSuccessState && (
                                <div className="flex items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-xl">
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
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isSuccessState}
                                    className={`w-full h-20 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 rounded-[1.5rem] relative overflow-hidden group/submit ${isSuccessState
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-olleey-yellow text-black hover:bg-white hover:scale-[1.03] hover:shadow-[0_40px_80px_-20px_rgba(251,191,36,0.5)] active:scale-95'
                                        }`}
                                >
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 pointer-events-none" />
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
                                    <Button
                                        variant="ghost"
                                        onClick={onCancel}
                                        className={`w-full h-12 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 hover:bg-red-500/5 transition-all rounded-full border border-transparent hover:border-red-500/10`}
                                    >
                                        Abort Operation
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
