"use client";

import React, { useState, useEffect } from "react";
import { X, Upload as UploadIcon, Loader2, CheckCircle, AlertCircle, Youtube, Link as LinkIcon, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, videosAPI, type Video } from "@/lib/api";
import { logger } from "@/lib/logger";

const LANGUAGE_OPTIONS = [
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
];

type SourceTab = "channel" | "url" | "upload";

interface ChannelWithLanguages {
    id: string;
    name: string;
    languages?: string[]; // Language codes like ["es", "fr", "de"]
}

interface ManualProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableChannels: ChannelWithLanguages[];
    projectId?: string;
    onSuccess?: () => void;
}

export function ManualProcessModal({
    isOpen,
    onClose,
    availableChannels,
    projectId,
    onSuccess,
}: ManualProcessModalProps) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<SourceTab>("channel");
    const [sourceVideoUrl, setSourceVideoUrl] = useState("");
    const [sourceChannelId, setSourceChannelId] = useState("");
    const [selectedVideoId, setSelectedVideoId] = useState("");
    const [channelVideos, setChannelVideos] = useState<Video[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedTargetChannel, setSelectedTargetChannel] = useState<string>(""); // Changed to single selection
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab("channel");
            setSourceVideoUrl("");
            setSourceChannelId("");
            setSelectedVideoId("");
            setChannelVideos([]);
            setUploadedFile(null);
            setSelectedTargetChannel("");
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

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
                    logger.error("ManualProcessModal", "Failed to load channel videos", err);
                    setError("Failed to load videos for this channel");
                    setChannelVideos([]);
                } finally {
                    setLoadingVideos(false);
                }
            }
        };
        loadChannelVideos();
    }, [sourceChannelId, activeTab]);



    // Extract video ID from YouTube URL
    const extractVideoId = (url: string): string | null => {
        try {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        } catch {
            return null;
        }
    };

    // Handle file drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("video/")) {
                setUploadedFile(file);
                setError(null);
            } else {
                setError("Please upload a video file");
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("video/")) {
                setUploadedFile(file);
                setError(null);
            } else {
                setError("Please upload a video file");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        let videoId: string | null = null;

        // Validation based on active tab
        if (activeTab === "channel") {
            if (!sourceChannelId) {
                setError("Please select a source channel");
                return;
            }
            if (!selectedVideoId) {
                setError("Please select a video");
                return;
            }
            videoId = selectedVideoId;
        } else if (activeTab === "url") {
            if (!sourceVideoUrl.trim()) {
                setError("Please enter a YouTube video URL");
                return;
            }
            videoId = extractVideoId(sourceVideoUrl.trim());
            if (!videoId) {
                setError("Invalid YouTube URL. Please enter a valid YouTube video URL or video ID.");
                return;
            }
            if (!sourceChannelId) {
                setError("Please select a source channel");
                return;
            }
        } else if (activeTab === "upload") {
            if (!uploadedFile) {
                setError("Please upload a video file");
                return;
            }
            // TODO: Handle file upload - for now show error
            setError("File upload is not yet implemented. Please use YouTube URL or select from channel.");
            return;
        }

        if (!selectedTargetChannel) {
            setError("Please select a target channel");
            return;
        }

        if (!projectId) {
            setError("No project selected");
            return;
        }

        if (!videoId) {
            setError("No video selected");
            return;
        }

        try {
            setIsSubmitting(true);

            // Call the jobs API with target channels
            // Note: The backend API currently expects target_languages, but based on the architecture
            // it should accept target_channel_ids. Each channel has its own language configuration.
            const response = await jobsAPI.createJob({
                source_video_id: videoId,
                source_channel_id: sourceChannelId,
                target_languages: [selectedTargetChannel], // TODO: Backend should accept target_channel_ids
                project_id: projectId,
            });

            logger.info("ManualProcessModal", "Job created successfully", response);
            setSuccess(true);

            // Close modal after a brief delay
            setTimeout(() => {
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            }, 1500);
        } catch (err: any) {
            logger.error("ManualProcessModal", "Failed to create job", err);
            setError(err.message || "Failed to create job. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative ${cardClass} border ${borderClass} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
                {/* Header */}
                <div className={`sticky top-0 ${cardClass} border-b ${borderClass} px-6 py-4 flex items-center justify-between z-10`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${textClass}`}>
                            Start Manual Process
                        </h2>
                        <p className={`text-sm ${textSecondaryClass} mt-1`}>
                            Process a YouTube video for dubbing
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${textSecondaryClass} hover:${textClass} transition-colors`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Source Tabs */}
                    <div>
                        <label className={`block text-sm font-medium ${textClass} mb-3`}>
                            Source <span className="text-red-500">*</span>
                        </label>
                        <div className={`flex items-center gap-2 ${cardAltClass} border ${borderClass} rounded-lg p-1`}>
                            <button
                                type="button"
                                onClick={() => setActiveTab("channel")}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === "channel"
                                    ? "bg-white text-black shadow-sm"
                                    : `${textSecondaryClass} hover:${textClass}`
                                    }`}
                            >
                                <Youtube className="h-4 w-4" />
                                From Channel
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("url")}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === "url"
                                    ? "bg-white text-black shadow-sm"
                                    : `${textSecondaryClass} hover:${textClass}`
                                    }`}
                            >
                                <LinkIcon className="h-4 w-4" />
                                YouTube URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("upload")}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === "upload"
                                    ? "bg-white text-black shadow-sm"
                                    : `${textSecondaryClass} hover:${textClass}`
                                    }`}
                            >
                                <FileVideo className="h-4 w-4" />
                                Upload File
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {/* From Channel Tab */}
                        {activeTab === "channel" && (
                            <div className="space-y-4">
                                {/* Channel Selector */}
                                <div>
                                    <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                        Select Channel <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={sourceChannelId}
                                        onChange={(e) => {
                                            setSourceChannelId(e.target.value);
                                            setSelectedVideoId(""); // Reset video selection
                                        }}
                                        className={`w-full ${cardClass} border ${borderClass} ${textClass} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        disabled={isSubmitting || success}
                                    >
                                        <option value="">Select a channel</option>
                                        {availableChannels.map((channel) => (
                                            <option key={channel.id} value={channel.id}>
                                                {channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Video Selector */}
                                {sourceChannelId && (
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                            Select Video <span className="text-red-500">*</span>
                                        </label>
                                        {loadingVideos ? (
                                            <div className={`flex items-center justify-center py-8 border ${borderClass} rounded-lg`}>
                                                <Loader2 className={`h-6 w-6 animate-spin ${textSecondaryClass}`} />
                                            </div>
                                        ) : channelVideos.length === 0 ? (
                                            <div className={`text-center py-8 border ${borderClass} rounded-lg`}>
                                                <p className={`text-sm ${textSecondaryClass}`}>No videos found for this channel</p>
                                            </div>
                                        ) : (
                                            <div className={`border ${borderClass} rounded-lg max-h-64 overflow-y-auto`}>
                                                {channelVideos.map((video) => (
                                                    <label
                                                        key={video.video_id}
                                                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b ${borderClass} last:border-b-0 ${selectedVideoId === video.video_id
                                                            ? "bg-indigo-500/10"
                                                            : "hover:bg-white/5"
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="video"
                                                            value={video.video_id}
                                                            checked={selectedVideoId === video.video_id}
                                                            onChange={(e) => setSelectedVideoId(e.target.value)}
                                                            className="w-4 h-4"
                                                            disabled={isSubmitting || success}
                                                        />
                                                        {video.thumbnail_url && (
                                                            <img
                                                                src={video.thumbnail_url}
                                                                alt={video.title}
                                                                className="w-20 h-12 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium ${textClass} line-clamp-2`}>
                                                                {video.title}
                                                            </p>
                                                            <p className={`text-xs ${textSecondaryClass}`}>
                                                                {video.view_count ? `${video.view_count.toLocaleString()} views` : "No views"}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* YouTube URL Tab */}
                        {activeTab === "url" && (
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                        YouTube Video URL <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="https://youtu.be/dQw4w9WgXcQ"
                                        value={sourceVideoUrl}
                                        onChange={(e) => setSourceVideoUrl(e.target.value)}
                                        className={`w-full ${cardClass} ${borderClass} ${textClass}`}
                                        disabled={isSubmitting || success}
                                    />
                                    <p className={`text-xs ${textSecondaryClass} mt-1`}>
                                        Enter the full YouTube URL of the video you want to process
                                    </p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                        Source Channel <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={sourceChannelId}
                                        onChange={(e) => setSourceChannelId(e.target.value)}
                                        className={`w-full ${cardClass} border ${borderClass} ${textClass} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        disabled={isSubmitting || success}
                                    >
                                        <option value="">Select a channel</option>
                                        {availableChannels.map((channel) => (
                                            <option key={channel.id} value={channel.id}>
                                                {channel.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className={`text-xs ${textSecondaryClass} mt-1`}>
                                        The channel that owns the source video
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Upload File Tab */}
                        {activeTab === "upload" && (
                            <div className="space-y-4">
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed ${borderClass} rounded-lg p-8 text-center transition-colors ${isDragging ? "border-indigo-500 bg-indigo-500/10" : ""
                                        }`}
                                >
                                    <input
                                        type="file"
                                        id="video-upload"
                                        accept="video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isSubmitting || success}
                                    />
                                    {uploadedFile ? (
                                        <div className="space-y-3">
                                            <FileVideo className={`h-12 w-12 mx-auto ${textClass}`} />
                                            <div>
                                                <p className={`text-sm font-medium ${textClass}`}>{uploadedFile.name}</p>
                                                <p className={`text-xs ${textSecondaryClass}`}>
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setUploadedFile(null)}
                                                className={`text-sm ${textSecondaryClass} hover:${textClass} underline`}
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <UploadIcon className={`h-12 w-12 mx-auto ${textSecondaryClass}`} />
                                            <div>
                                                <p className={`text-sm font-medium ${textClass} mb-1`}>
                                                    Click or drag to upload video
                                                </p>
                                                <p className={`text-xs ${textSecondaryClass}`}>
                                                    Supports MP4, MOV, AVI and other video formats
                                                </p>
                                            </div>
                                            <label
                                                htmlFor="video-upload"
                                                className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 cursor-pointer transition-colors"
                                            >
                                                Choose File
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target Channel */}
                    <div>
                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Target Channel <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedTargetChannel}
                            onChange={(e) => setSelectedTargetChannel(e.target.value)}
                            className={`w-full ${cardClass} border ${borderClass} ${textClass} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            disabled={isSubmitting || success}
                        >
                            <option value="">Select a target channel</option>
                            {availableChannels
                                .filter((channel) => channel.id !== sourceChannelId) // Don't show source channel
                                .map((channel) => {
                                    const languageDisplay = channel.languages && channel.languages.length > 0
                                        ? ` (${channel.languages.join(', ').toUpperCase()})`
                                        : '';
                                    return (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.name}{languageDisplay}
                                        </option>
                                    );
                                })}
                        </select>
                        <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Select the channel where dubbed versions will be published
                        </p>

                        {/* Show selected channel's languages with flags */}
                        {selectedTargetChannel && (() => {
                            const selectedChannel = availableChannels.find(c => c.id === selectedTargetChannel);
                            if (selectedChannel?.languages && selectedChannel.languages.length > 0) {
                                return (
                                    <div className={`mt-3 p-3 ${cardAltClass} border ${borderClass} rounded-lg`}>
                                        <p className={`text-xs font-medium ${textClass} mb-2`}>
                                            This channel will dub to:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedChannel.languages.map((langCode) => {
                                                const langInfo = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                                                return langInfo ? (
                                                    <span
                                                        key={langCode}
                                                        className={`inline-flex items-center gap-1.5 px-2 py-1 ${cardClass} border ${borderClass} rounded text-xs ${textClass}`}
                                                    >
                                                        <span className="text-base">{langInfo.flag}</span>
                                                        {langInfo.name}
                                                    </span>
                                                ) : (
                                                    <span
                                                        key={langCode}
                                                        className={`inline-flex items-center gap-1.5 px-2 py-1 ${cardClass} border ${borderClass} rounded text-xs ${textClass}`}
                                                    >
                                                        {langCode.toUpperCase()}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Project ID (read-only) */}
                    {projectId && (
                        <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                Project ID
                            </label>
                            <Input
                                type="text"
                                value={projectId}
                                readOnly
                                className={`w-full ${cardClass} ${borderClass} ${textSecondaryClass} cursor-not-allowed`}
                            />
                        </div>
                    )}


                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-500">
                                Job created successfully! Redirecting...
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting || success}
                            className="px-6 bg-white text-black border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || success}
                            className="px-6 bg-black text-white hover:bg-gray-800"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Job...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Success!
                                </>
                            ) : (
                                "Create Job"
                            )}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
