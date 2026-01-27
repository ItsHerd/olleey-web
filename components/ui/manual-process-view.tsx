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
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 shadow-sm`}>
                        <h3 className={`text-lg font-bold ${textClass} mb-4 flex items-center gap-2`}>
                            <Youtube className="w-5 h-5 text-red-500" />
                            Source Configuration
                        </h3>

                        {/* Source Selection */}
                        <div className={`p-1 ${cardAltClass} border ${borderClass} rounded-xl flex items-center gap-1 mb-6`}>
                            {(['channel', 'url', 'upload'] as SourceTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                        ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                                        : `${textSecondaryClass} hover:${textClass}`
                                        }`}
                                >
                                    {tab === 'channel' && <span className="flex items-center justify-center gap-2"><Youtube className="w-3.5 h-3.5" /> Channel</span>}
                                    {tab === 'url' && <span className="flex items-center justify-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> URL</span>}
                                    {tab === 'upload' && <span className="flex items-center justify-center gap-2"><FileVideo className="w-3.5 h-3.5" /> Upload</span>}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'channel' && (
                            <div className="space-y-4">
                                <select
                                    value={sourceChannelId}
                                    onChange={(e) => setSourceChannelId(e.target.value)}
                                    className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-olleey-yellow outline-none transition-all`}
                                >
                                    <option value="">Select source channel...</option>
                                    {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>

                                {sourceChannelId && (
                                    <div className={`border ${borderClass} rounded-xl overflow-hidden max-h-[320px] overflow-y-auto`}>
                                        {loadingVideos ? (
                                            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-olleey-yellow" /></div>
                                        ) : channelVideos.map(video => (
                                            <div
                                                key={video.video_id}
                                                onClick={() => {
                                                    setSelectedVideoId(video.video_id);
                                                    setCustomTitle(video.title);
                                                }}
                                                className={`flex items-center gap-4 p-3 cursor-pointer border-b ${borderClass} last:border-0 transition-all ${selectedVideoId === video.video_id ? 'bg-olleey-yellow/10' : 'hover:bg-rolleey-yellow/5'}`}
                                            >
                                                <div className="w-20 aspect-video rounded bg-black/20 overflow-hidden shrink-0">
                                                    {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover" />}
                                                </div>
                                                <p className={`text-sm font-medium ${textClass} line-clamp-1`}>{video.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'url' && (
                            <div className="space-y-4">
                                <Input
                                    placeholder="Paste YouTube Video URL..."
                                    value={sourceVideoUrl}
                                    onChange={(e) => setSourceVideoUrl(e.target.value)}
                                    className={`${cardAltClass} border-${borderClass} h-12 rounded-xl`}
                                />
                                <select
                                    value={sourceChannelId}
                                    onChange={(e) => setSourceChannelId(e.target.value)}
                                    className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-olleey-yellow outline-none transition-all`}
                                >
                                    <option value="">Select source channel override...</option>
                                    {availableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        {activeTab === 'upload' && (
                            <div className={`border-2 border-dashed ${borderClass} rounded-2xl p-12 text-center hover:bg-olleey-yellow/5 transition-colors group cursor-pointer`}>
                                <FileVideo className={`w-12 h-12 mx-auto mb-4 ${textSecondaryClass} group-hover:text-olleey-yellow transition-colors`} />
                                <p className={`text-sm font-bold ${textClass}`}>Drop your video file here</p>
                                <p className={`text-xs ${textSecondaryClass} mt-1`}>Supported formats: MP4, MOV, AVI (Max 2GB)</p>
                            </div>
                        )}
                    </div>

                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 shadow-sm`}>
                        <h3 className={`text-lg font-bold ${textClass} mb-4 flex items-center gap-2`}>
                            <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                            Job Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest pl-1`}>Target Channel <span className="text-red-500">*</span></label>
                                    <select
                                        value={selectedTargetChannel}
                                        onChange={(e) => setSelectedTargetChannel(e.target.value)}
                                        className={`w-full ${cardAltClass} border ${borderClass} ${textClass} rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-olleey-yellow outline-none h-11 transition-all`}
                                    >
                                        <option value="">Select target channel...</option>
                                        <option value="none">No target (Draft mode)</option>
                                        {availableChannels.filter(c => c.id !== sourceChannelId).map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.language_name ? `(${c.language_name})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                {activeTab === 'upload' && (
                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest pl-1`}>Custom Title</label>
                                        <Input
                                            placeholder="Enter localized title..."
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            className={`${cardAltClass} border-${borderClass} rounded-xl h-11`}
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
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 shadow-sm`}>
                        <h3 className={`text-lg font-bold ${textClass} mb-4 flex items-center gap-2`}>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Final Review
                        </h3>

                        <div className="space-y-6">
                            {/* Thumbnail Upload/Preview - Only for Upload Tab */}
                            {activeTab === 'upload' && (
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest pl-1`}>Thumbnail (Optional)</label>
                                    <div className={`relative aspect-video rounded-xl border-2 border-dashed ${borderClass} overflow-hidden group hover:border-olleey-yellow transition-all`}>
                                        {thumbnailPreview ? (
                                            <>
                                                <img src={thumbnailPreview} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => { setUploadedThumbnail(null); setThumbnailPreview(null); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                                <ImageIcon className={`w-8 h-8 ${textSecondaryClass} mb-2 group-hover:text-olleey-yellow transition-colors`} />
                                                <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase group-hover:text-olleey-yellow`}>Upload Thumbnail</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                                            </label>
                                        )}
                                    </div>
                                    <p className={`text-[9px] ${textSecondaryClass} mt-2 italic px-1`}>
                                        Upload a custom thumbnail for the localized version.
                                    </p>
                                </div>
                            )}

                            <div className={`p-4 ${cardAltClass} rounded-xl space-y-3`}>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={textSecondaryClass}>Video ID</span>
                                    <span className={`font-mono ${textClass}`}>{selectedVideoId || '---'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={textSecondaryClass}>Neural Engine</span>
                                    <span className="text-olleey-yellow font-bold uppercase">Turbo v4</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={textSecondaryClass}>Estimated Cost</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className={`font-bold ${textClass}`}>Free Tier</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-500 leading-tight">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isSuccessState}
                                    className={`w-full h-12 text-sm font-bold uppercase tracking-widest shadow-xl transition-all ${isSuccessState
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-olleey-yellow text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : isSuccessState ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <><Send className="w-4 h-4 mr-2" /> Start Processing</>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onCancel}
                                    className={`w-full text-[10px] font-bold uppercase tracking-widest ${textSecondaryClass} hover:${textClass}`}
                                >
                                    Discard Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

