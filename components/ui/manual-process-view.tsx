"use client";

import React, { useState, useEffect } from "react";
import { X, Upload as UploadIcon, Loader2, CheckCircle, AlertCircle, Youtube, Link as LinkIcon, FileVideo, ImageIcon, ArrowLeft, Send, SlidersHorizontal, ChevronRight } from "lucide-react";
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
    const [selectedTargetChannels, setSelectedTargetChannels] = useState<string[]>([]);
    const [sourceLanguage, setSourceLanguage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessState, setIsSuccessState] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
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

                // 1. Upload the video first
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

            // 2. Create the job with multiple target languages
            const targetLanguages = selectedTargetChannels
                .map(id => availableChannels.find(c => c.id === id)?.language_code)
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

    // Get current preview thumbnail based on tab
    const getPreviewThumbnail = () => {
        if (thumbnailPreview) return thumbnailPreview;
        if (activeTab === 'channel' && selectedVideoId) {
            return channelVideos.find(v => v.video_id === selectedVideoId)?.thumbnail_url;
        }
        if (activeTab === 'url' && sourceVideoUrl) {
            const vid = extractVideoId(sourceVideoUrl);
            if (vid) return `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
        }
        return null;
    };

    const currentThumbnail = getPreviewThumbnail();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Configuration Flow */}
                <div className="lg:col-span-2 space-y-16">

                    {/* STAGE 01: SOURCE SELECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-olleey-yellow text-black font-black text-xs rounded-none shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">01</div>
                            <h3 className={`text-sm font-bold tracking-tight ${textClass}`}>Source Selection</h3>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-10`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-none p-1 shadow-sm`}>
                            <div className="flex items-center gap-1">
                                {(['channel', 'url', 'upload'] as SourceTab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 text-[11px] font-bold rounded-none transition-all ${activeTab === tab
                                            ? 'bg-olleey-yellow text-black'
                                            : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-none p-8 lg:p-10 shadow-sm transition-all`}>
                            {activeTab === 'channel' && (
                                <div className="space-y-6">
                                    <select
                                        value={sourceChannelId}
                                        onChange={(e) => setSourceChannelId(e.target.value)}
                                        className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-6 py-5 text-xs font-medium focus:border-olleey-yellow outline-none transition-all appearance-none`}
                                    >
                                        <option value="">Select source channel...</option>
                                        {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>

                                    {sourceChannelId && (
                                        <div className={`border ${borderClass} rounded-none overflow-hidden max-h-[300px] overflow-y-auto bg-black/5`}>
                                            {loadingVideos ? (
                                                <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-olleey-yellow" /></div>
                                            ) : channelVideos.map(video => (
                                                <div
                                                    key={video.video_id}
                                                    onClick={() => {
                                                        setSelectedVideoId(video.video_id);
                                                        setCustomTitle(video.title);
                                                    }}
                                                    className={`flex items-center gap-6 p-4 cursor-pointer border-b ${borderClass} last:border-0 transition-all ${selectedVideoId === video.video_id ? 'bg-olleey-yellow/10 border-olleey-yellow/30' : 'hover:bg-white/5'}`}
                                                >
                                                    <div className="w-24 aspect-video rounded-none bg-black/20 overflow-hidden shrink-0 border border-white/5">
                                                        {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover" alt="" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-bold ${selectedVideoId === video.video_id ? 'text-olleey-yellow' : textClass} line-clamp-1`}>{video.title}</p>
                                                        <p className={`text-[10px] ${textSecondaryClass} mt-1 font-medium opacity-60`}>
                                                            {new Date(video.published_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'url' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-bold ${textSecondaryClass}`}>Asset Connection URL</label>
                                        <Input
                                            placeholder="Paste YouTube video URL..."
                                            value={sourceVideoUrl}
                                            onChange={(e) => setSourceVideoUrl(e.target.value)}
                                            className={`${cardAltClass} ${borderClass} ${textClass} h-14 rounded-none text-xs font-medium focus:border-olleey-yellow transition-all`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-bold ${textSecondaryClass}`}>Origin Channel Context</label>
                                        <select
                                            value={sourceChannelId}
                                            onChange={(e) => setSourceChannelId(e.target.value)}
                                            className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-6 py-5 text-xs font-medium focus:border-olleey-yellow outline-none transition-all appearance-none`}
                                        >
                                            <option value="">Select channel override...</option>
                                            {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div
                                    className={`border-2 border-dashed ${uploadedFile ? 'border-olleey-yellow bg-olleey-yellow/5' : borderClass + ' bg-black/5'} rounded-none p-16 text-center hover:bg-olleey-yellow/5 transition-all group cursor-pointer relative`}
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
                                    {uploadedFile ? (
                                        <div className="space-y-6">
                                            <div className="p-8 bg-olleey-yellow text-black inline-flex rounded-none shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                                <FileVideo className="w-12 h-12" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold text-olleey-yellow`}>{uploadedFile.name}</p>
                                                <p className={`text-[10px] ${textSecondaryClass} mt-3 font-medium opacity-60`}>{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Upload ready</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-400 border-b border-red-500/20 pb-1"
                                            >
                                                Replace asset
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-8 bg-white/5 inline-flex mb-8 border border-white/10 rounded-none group-hover:border-olleey-yellow/50 transition-all">
                                                <UploadIcon className={`w-10 h-10 ${textSecondaryClass} group-hover:text-olleey-yellow transition-colors`} />
                                            </div>
                                            <p className={`text-xs font-bold ${textClass}`}>Drop local workstation file</p>
                                            <p className={`text-[10px] ${textSecondaryClass} mt-4 font-medium opacity-40`}>MP4 / MOV / AVI (Max 2GB)</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STAGE 02: VIDEO ANALYSIS & METADATA */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white font-black text-xs rounded-none shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">02</div>
                            <h3 className={`text-sm font-bold tracking-tight ${textClass}`}>Analysis & Metadata</h3>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-10`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-none p-8 lg:p-10 shadow-sm space-y-8`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className={`text-[10px] font-bold ${textSecondaryClass}`}>Source Language</label>
                                    <select
                                        value={sourceLanguage}
                                        onChange={(e) => setSourceLanguage(e.target.value)}
                                        className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none px-6 py-4 text-xs font-medium focus:border-olleey-yellow outline-none transition-all appearance-none`}
                                    >
                                        <option value="">Detect automatically...</option>
                                        {LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.name} {l.flag}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className={`text-[10px] font-bold ${textSecondaryClass}`}>Workstation Title</label>
                                    <Input
                                        placeholder="Enter project title..."
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        className={`${cardAltClass} ${borderClass} ${textClass} h-12 rounded-none text-xs font-medium focus:border-olleey-yellow transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className={`text-[10px] font-bold ${textSecondaryClass}`}>Production Notes / Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter workflow metadata..."
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-none p-6 text-xs font-medium focus:border-olleey-yellow outline-none resize-none transition-all`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* STAGE 03: DEPLOYMENT & DISTRIBUTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 text-white font-black text-xs rounded-none shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">03</div>
                            <h3 className={`text-sm font-bold tracking-tight ${textClass}`}>Deployment & Distribution</h3>
                            <div className={`h-[1px] flex-1 ${borderClass} opacity-10`}></div>
                        </div>

                        <div className={`${cardClass} border ${borderClass} rounded-none p-8 lg:p-10 shadow-sm transition-all`}>
                            <div className="space-y-3">
                                <label className={`text-[10px] font-bold ${textSecondaryClass} mb-4 block`}>Target Global Distribution Hubs <span className="text-red-500">*</span></label>
                                <div className={`border ${borderClass} rounded-none bg-black/5 divide-y ${borderClass} max-h-[400px] overflow-y-auto`}>
                                    {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => toggleTargetChannel(c.id)}
                                            className={`flex items-center gap-6 p-6 cursor-pointer transition-all ${selectedTargetChannels.includes(c.id) ? 'bg-olleey-yellow/5' : 'hover:bg-white/5'}`}
                                        >
                                            <div className={`w-6 h-6 border-2 flex-shrink-0 ${selectedTargetChannels.includes(c.id) ? 'border-olleey-yellow bg-olleey-yellow' : 'border-white/20'} flex items-center justify-center transition-all`}>
                                                {selectedTargetChannels.includes(c.id) && <CheckCircle className="w-4 h-4 text-black" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{c.language_code ? LANGUAGE_OPTIONS.find(l => l.code === c.language_code)?.flag : '🌐'}</span>
                                                    <p className={`text-xs font-bold ${selectedTargetChannels.includes(c.id) ? 'text-olleey-yellow' : textClass}`}>
                                                        {c.name}
                                                    </p>
                                                </div>
                                                <p className={`text-[10px] ${textSecondaryClass} font-medium mt-2 opacity-60`}>
                                                    {c.language_name || 'Neural translation'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {availableChannels.filter(c => c.id !== sourceChannelId).length === 0 && (
                                        <div className="p-12 text-center text-xs font-bold opacity-20">No distribution targets available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: execution review */}
                <div className="space-y-8">
                    <div>
                        <div className={`${cardClass} border ${borderClass} rounded-none p-8 shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-md`}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Send className="w-16 h-16" />
                            </div>

                            <h3 className={`text-lg font-bold ${textClass} mb-8 flex items-center gap-3 border-b ${borderClass} pb-6`}>
                                Pipeline Review
                            </h3>

                            <div className="space-y-8">
                                {/* Thumbnail Preview Panel */}
                                <div className={`relative aspect-video rounded-none border ${borderClass} overflow-hidden group hover:border-olleey-yellow transition-all bg-black/40`}>
                                    {currentThumbnail ? (
                                        <>
                                            <img src={currentThumbnail} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="p-3 bg-olleey-yellow text-black cursor-pointer hover:bg-white transition-all rounded-none font-bold text-[10px]">
                                                    REPLACE VISUAL
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                                </label>
                                            </div>
                                            {thumbnailPreview && (
                                                <button
                                                    onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                    className="absolute top-3 right-3 p-2 bg-black text-white rounded-none border border-white/20 hover:bg-olleey-yellow hover:text-black transition-all z-10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                            <ImageIcon className={`w-8 h-8 ${textSecondaryClass} mb-3 group-hover:text-olleey-yellow transition-colors opacity-20`} />
                                            <span className={`text-[10px] font-bold ${textSecondaryClass} group-hover:text-olleey-yellow`}>Assign asset visual</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                        </label>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className={`text-[10px] font-bold ${textSecondaryClass}`}>Asset source</span>
                                        <span className={`text-xs font-bold ${textClass}`}>{activeTab}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className={`text-[10px] font-bold ${textSecondaryClass}`}>Distribution</span>
                                        <span className="text-xs font-bold text-olleey-yellow">{selectedTargetChannels.length} hubs</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4">
                                        <span className={`text-[10px] font-bold ${textSecondaryClass}`}>Neural Engine</span>
                                        <span className="text-xs font-bold text-olleey-yellow">Turbo V4</span>
                                    </div>
                                </div>

                                {isSubmitting && (
                                    <div className="space-y-3 p-6 bg-white/5 border border-white/10 rounded-none">
                                        <div className="flex justify-between text-[10px] font-bold text-olleey-yellow">
                                            <span>Deploying pipeline</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-none overflow-hidden">
                                            <div
                                                className="h-full bg-olleey-yellow transition-all duration-700 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-start gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-none">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-medium text-red-500 leading-relaxed">{error}</p>
                                    </div>
                                ) || isSuccessState && (
                                    <div className="flex items-start gap-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-none">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-medium text-emerald-500 leading-relaxed">Pipeline engaged successfully</p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 pt-4">
                                    <Button
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || isSuccessState}
                                        className={`w-full h-16 text-xs font-bold shadow-2xl transition-all rounded-none ${isSuccessState
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-olleey-yellow text-black hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : isSuccessState ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <>Execute Deployment</>
                                        )}
                                    </Button>
                                    {!isSuccessState && (
                                        <Button
                                            variant="ghost"
                                            onClick={onCancel}
                                            className={`w-full py-4 text-[10px] font-bold ${textSecondaryClass} hover:text-white hover:bg-red-500/10 transition-all rounded-none`}
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
        </div>
    );
}
