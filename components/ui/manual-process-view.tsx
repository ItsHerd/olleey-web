"use client";

import React, { useState, useEffect } from "react";
import { X, Upload as UploadIcon, Loader2, CheckCircle, AlertCircle, Youtube, Link as LinkIcon, FileVideo, ImageIcon, ArrowLeft, Send, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/useTheme";
import { useToast } from "@/components/ui/use-toast";
import { jobsAPI, videosAPI, type Video } from "@/lib/api";
import { logger } from "@/lib/logger";
import { LANGUAGE_OPTIONS } from "@/lib/languages";

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
    const [selectedTargetChannel, setSelectedTargetChannel] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessState, setIsSuccessState] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const isDark = theme === "dark";

    // Theme-aware classes
    const cardClass = isDark ? "bg-dark-card" : "bg-white";
    const cardAltClass = isDark ? "bg-white/5" : "bg-gray-50";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-500";
    const borderClass = isDark ? "border-white/10" : "border-gray-200";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        let videoId: string | null = null;
        if (activeTab === "channel") {
            if (!sourceChannelId || !selectedVideoId) {
                setError("Please select a source channel and video");
                return;
            }
            videoId = selectedVideoId;
        } else if (activeTab === "url") {
            videoId = extractVideoId(sourceVideoUrl.trim());
            if (!videoId || !sourceChannelId) {
                setError("Please enter a valid YouTube URL and select a source channel");
                return;
            }
        } else if (activeTab === "upload") {
            if (!uploadedFile) {
                setError("Please upload a video file");
                return;
            }
            setError("Direct file upload is coming soon. Please use YouTube source for now.");
            return;
        }

        if (!selectedTargetChannel) {
            setError("Please select a target channel");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await jobsAPI.createJob({
                source_video_id: videoId!,
                source_channel_id: sourceChannelId,
                target_languages: selectedTargetChannel === "none" ? [] : [selectedTargetChannel],
                project_id: projectId || "",
                title: customTitle,
                description: customDescription,
                is_simulation: true,
            });

            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccessState(true);
                toast(`🚀 Job Started! Processing "${customTitle || 'Video'}"`, "success");
                setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);
            }, 1000);

        } catch (err: any) {
            setError(err.message || "Failed to create job");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Source & Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`${cardClass} border ${borderClass} rounded-none p-8 lg:p-10 shadow-sm relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <SlidersHorizontal className="w-32 h-32" />
                        </div>

                        <h3 className={`text-xl md:text-2xl font-300 ${textClass} mb-8 flex items-center gap-3`}>
                            <div className="w-1.5 h-6 bg-olleey-yellow" />
                            Source Configuration
                        </h3>

                        {/* Source Selection */}
                        <div className={`p-1 ${cardAltClass} border ${borderClass} rounded-none flex items-center gap-1 mb-8`}>
                            {(['channel', 'url', 'upload'] as SourceTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all ${activeTab === tab
                                        ? (isDark ? 'bg-olleey-yellow text-black' : 'bg-olleey-yellow text-black')
                                        : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'channel' && (
                            <div className="space-y-4">
                                <select
                                    value={sourceChannelId}
                                    onChange={(e) => setSourceChannelId(e.target.value)}
                                    className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-4 py-4 text-sm focus:border-olleey-yellow outline-none transition-all appearance-none`}
                                >
                                    <option value="">SELECT SOURCE CHANNEL...</option>
                                    {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                                </select>

                                {sourceChannelId && (
                                    <div className={`border ${borderClass} rounded-none overflow-hidden max-h-[400px] overflow-y-auto bg-black/5`}>
                                        {loadingVideos ? (
                                            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-olleey-yellow" /></div>
                                        ) : channelVideos.map(video => (
                                            <div
                                                key={video.video_id}
                                                onClick={() => {
                                                    setSelectedVideoId(video.video_id);
                                                    setCustomTitle(video.title);
                                                }}
                                                className={`flex items-center gap-6 p-4 cursor-pointer border-b ${borderClass} last:border-0 transition-all ${selectedVideoId === video.video_id ? 'bg-olleey-yellow text-black' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="w-24 aspect-video rounded-none bg-black/20 overflow-hidden shrink-0 border border-white/10">
                                                    {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-xs font-black uppercase tracking-widest ${selectedVideoId === video.video_id ? 'text-black' : textClass} line-clamp-1`}>{video.title}</p>
                                                    <p className={`text-[10px] ${selectedVideoId === video.video_id ? 'text-black/60' : textSecondaryClass} mt-1 uppercase tracking-tight`}>
                                                        PUBLISHED: {new Date(video.published_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'url' && (
                            <div className="space-y-4">
                                <Input
                                    placeholder="PASTE YOUTUBE VIDEO URL..."
                                    value={sourceVideoUrl}
                                    onChange={(e) => setSourceVideoUrl(e.target.value)}
                                    className={`${cardAltClass} border-${borderClass} h-14 rounded-none uppercase text-[10px] tracking-widest font-black`}
                                />
                                <select
                                    value={sourceChannelId}
                                    onChange={(e) => setSourceChannelId(e.target.value)}
                                    className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-4 py-4 text-sm focus:border-olleey-yellow outline-none transition-all appearance-none uppercase text-[10px] tracking-widest font-black`}
                                >
                                    <option value="">SELECT SOURCE CHANNEL OVERRIDE...</option>
                                    {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        )}

                        {activeTab === 'upload' && (
                            <div className={`border-2 border-dashed ${borderClass} rounded-none p-16 text-center hover:bg-olleey-yellow/5 transition-colors group cursor-pointer bg-black/5`}>
                                <div className="p-6 bg-white/5 inline-flex mb-6 border border-white/10 rounded-none">
                                    <FileVideo className={`w-10 h-10 ${textSecondaryClass} group-hover:text-olleey-yellow transition-colors`} />
                                </div>
                                <p className={`text-xs font-black uppercase tracking-[0.3em] ${textClass}`}>Drop local workstation file</p>
                                <p className={`text-[10px] ${textSecondaryClass} mt-3 uppercase tracking-widest opacity-60`}>MP4 / MOV / AVI (MAX 2GB)</p>
                            </div>
                        )}
                    </div>

                    <div className={`${cardClass} border ${borderClass} rounded-none p-8 lg:p-10 shadow-sm relative overflow-hidden`}>
                        <h3 className={`text-xl md:text-2xl font-300 ${textClass} mb-8 flex items-center gap-3`}>
                            <div className="w-1.5 h-6 bg-indigo-500" />
                            Job Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em] mb-3 block`}>Target Distribution <span className="text-red-500">*</span></label>
                                    <select
                                        value={selectedTargetChannel}
                                        onChange={(e) => setSelectedTargetChannel(e.target.value)}
                                        className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-olleey-yellow outline-none h-12 transition-all appearance-none`}
                                    >
                                        <option value="">SELECT TARGET CHANNEL...</option>
                                        <option value="none">LOCAL DRAFT ONLY</option>
                                        {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                            <option key={c.id} value={c.id}>{c.name.toUpperCase()} {c.language_name ? `- ${c.language_name.toUpperCase()}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                {activeTab === 'upload' && (
                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em] mb-3 block`}>Custom Title</label>
                                        <Input
                                            placeholder="ENTER LOCALIZED TITLE..."
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            className={`${cardAltClass} border-${borderClass} rounded-none h-12 text-[10px] font-black uppercase tracking-widest`}
                                        />
                                    </div>
                                )}
                            </div>

                            {activeTab === 'upload' && (
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest pl-1`}>Custom Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Enter localized description..."
                                        value={customDescription}
                                        onChange={(e) => setCustomDescription(e.target.value)}
                                        className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-xl p-4 text-sm focus:ring-2 focus:ring-olleey-yellow outline-none resize-none transition-all`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Action */}
                <div className="space-y-6">
                    <div className={`${cardClass} border ${borderClass} rounded-none p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/5`}>
                        <h3 className={`text-xl font-300 ${textClass} mb-8 flex items-center gap-3`}>
                            <div className="w-1.5 h-6 bg-emerald-500" />
                            Final Review
                        </h3>

                        <div className="space-y-6">
                            {/* Thumbnail Upload/Preview - Only for Upload Tab */}
                            {activeTab === 'upload' && (
                                <div className="space-y-2">
                                    <label className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.2em] mb-3 block`}>Asset Thumbnail</label>
                                    <div className={`relative aspect-video rounded-none border border-white/10 ${borderClass} overflow-hidden group hover:border-olleey-yellow transition-all bg-black/40`}>
                                        {thumbnailPreview ? (
                                            <>
                                                <img src={thumbnailPreview} className="w-full h-full object-cover opacity-80" />
                                                <button
                                                    onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                    className="absolute top-3 right-3 p-2 bg-black text-white rounded-none border border-white/20 hover:bg-olleey-yellow hover:text-black transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                                <ImageIcon className={`w-8 h-8 ${textSecondaryClass} mb-3 group-hover:text-olleey-yellow transition-colors opacity-40`} />
                                                <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-widest group-hover:text-olleey-yellow`}>Upload Asset Visual</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={`p-6 ${cardAltClass} rounded-none border border-white/5 space-y-4`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-widest`}>Asset ID</span>
                                    <span className={`text-xs font-black tracking-tighter ${textClass}`}>{selectedVideoId || 'PENDING'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-widest`}>Neural Processing</span>
                                    <span className="text-[10px] font-black text-olleey-yellow tracking-widest">TURBO V4 ACTIVE</span>
                                </div>
                                <div className="w-full h-[1px] bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-widest`}>Estimated Cost</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className={`text-xs font-black ${textClass} tracking-widest`}>0.00 CREDITS</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-none">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 pt-4">
                                <Button
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isSuccessState}
                                    className={`w-full h-14 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all rounded-none ${isSuccessState
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-olleey-yellow text-black hover:bg-white hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : isSuccessState ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <>START PROCESSING PIPELINE</>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onCancel}
                                    className={`w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all rounded-none`}
                                >
                                    ABORT OPERATION
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

