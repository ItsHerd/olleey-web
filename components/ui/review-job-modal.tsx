"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Play, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";
import { StatusChip } from "@/components/ui/StatusChip";
import { jobsAPI, videosAPI, channelsAPI, type LocalizedVideo, type Job, type Video, type LanguageChannel } from "@/lib/api";
import { logger } from "@/lib/logger";

interface ReviewJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string | null;
    onApproved?: () => void;
}

const LANGUAGE_FLAGS: Record<string, string> = {
    es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", pt: "🇵🇹",
    ja: "🇯🇵", ko: "🇰🇷", hi: "🇮🇳", ar: "🇸🇦",
    ru: "🇷🇺", it: "🇮🇹", zh: "🇨🇳", en: "🇺🇸",
};

export function ReviewJobModal({
    isOpen,
    onClose,
    jobId,
    onApproved,
}: ReviewJobModalProps) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState<LocalizedVideo[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [sourceVideo, setSourceVideo] = useState<Video | null>(null);
    const [languageChannels, setLanguageChannels] = useState<LanguageChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    // Fetch videos when modal opens
    useEffect(() => {
        if (isOpen && jobId) {
            loadVideos(jobId);
        } else {
            setVideos([]);
            setJob(null);
            setSourceVideo(null);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, jobId]);

    const loadVideos = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch job info first to get source_video_id
            const jobData = await jobsAPI.getJobById(id);
            setJob(jobData);

            // Fetch everything else in parallel
            const [videoData, sourceVideoData, channelsData] = await Promise.all([
                jobsAPI.getJobVideos(id),
                videosAPI.getVideoById(jobData.source_video_id),
                channelsAPI.listChannels(jobData.project_id)
            ]);

            setVideos(videoData);
            setSourceVideo(sourceVideoData);
            setLanguageChannels(channelsData);
        } catch (err: any) {
            logger.error("ReviewJobModal", "Failed to load job details", err);
            setError("Failed to load job details and previews.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!jobId) return;

        try {
            setApproving(true);
            setError(null);
            await jobsAPI.approveJob(jobId);
            setSuccess(true);

            // Wait for animation then close/notify
            setTimeout(() => {
                onClose();
                if (onApproved) onApproved();
            }, 1500);
        } catch (err: any) {
            logger.error("ReviewJobModal", "Failed to approve job", err);
            setError(err.message || "Failed to approve job");
        } finally {
            setApproving(false);
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
                className={`relative ${cardClass} border ${borderClass} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col`}
            >
                {/* Header */}
                <div className={`flex-shrink-0 ${cardClass} border-b ${borderClass} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex-1">
                        <h2 className={`text-xl font-semibold ${textClass}`}>
                            Review & Approve
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${textSecondaryClass}`}>Source:</span>
                                {sourceVideo?.channel_id ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded-full bg-olleey-yellow flex items-center justify-center text-[10px] font-bold">
                                            {sourceVideo.channel_name?.charAt(0)}
                                        </div>
                                        <span className={`text-sm font-medium ${textClass}`}>{sourceVideo.channel_name}</span>
                                    </div>
                                ) : (
                                    <span className={`text-sm font-medium ${textClass}`}>Manual Upload</span>
                                )}
                            </div>
                            <div className="w-px h-3 bg-white/10" />
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${textSecondaryClass}`}>ID:</span>
                                <span className={`text-sm font-mono ${textClass}`}>{jobId?.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${textSecondaryClass} hover:${textClass} transition-colors`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass}`} />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button onClick={() => jobId && loadVideos(jobId)} variant="outline">
                                Retry
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-12">
                            <p className={textSecondaryClass}>No videos found for this job.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Deployment Targets Summary */}
                            <div className={`${cardAltClass} p-4 rounded-xl border ${borderClass} shadow-sm`}>
                                <h3 className={`text-xs font-bold uppercase tracking-widest ${textSecondaryClass} mb-4 flex items-center gap-2`}>
                                    <Globe2 className="h-3.5 w-3.5" />
                                    Deployment Destinations
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {job?.target_languages.map(langCode => {
                                        const channel = languageChannels.find(c => c.language_code === langCode);
                                        return (
                                            <div key={langCode} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                                                    {LANGUAGE_FLAGS[langCode] || "🌍"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondaryClass}`}>
                                                        {langCode} channel
                                                    </p>
                                                    <p className={`text-sm font-medium ${textClass} truncate`}>
                                                        {channel?.channel_name || `${langCode.toUpperCase()} Content`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Video Previews */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {videos.map((video) => {
                                    const targetChannel = languageChannels.find(c => c.language_code === video.language_code);

                                    return (
                                        <div key={video.id} className={`${cardAltClass} rounded-2xl overflow-hidden border ${borderClass} flex flex-col shadow-lg hover:shadow-xl transition-all duration-300`}>
                                            {/* Video Player */}
                                            <div className="aspect-video bg-black relative group">
                                                {video.storage_url ? (
                                                    <video
                                                        controls
                                                        className="w-full h-full"
                                                        src={video.storage_url}
                                                        poster={video.thumbnail_url}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/50">
                                                        <Loader2 className="h-8 w-8 animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-2xl shadow-inner">
                                                            {LANGUAGE_FLAGS[video.language_code] || "🌍"}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold ${textClass} capitalize`}>
                                                                {video.language_code} Version
                                                            </h4>
                                                            <p className={`text-[10px] font-medium ${textSecondaryClass} flex items-center gap-1`}>
                                                                To: <span className="text-olleey-yellow">{targetChannel?.channel_name || "Assigned Channel"}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusChip status={video.status === "ready" ? "completed" : "draft"} size="xs" />
                                                </div>

                                                {/* Translated Metadata */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className={`text-[10px] uppercase font-bold tracking-widest ${textSecondaryClass} mb-1.5`}>Translated Title</p>
                                                        <p className={`text-sm ${textClass} font-medium leading-relaxed`}>
                                                            {video.title || "No title available"}
                                                        </p>
                                                    </div>

                                                    {video.description && (
                                                        <div>
                                                            <p className={`text-[10px] uppercase font-bold tracking-widest ${textSecondaryClass} mb-1.5`}>Description</p>
                                                            <p className={`text-xs ${textSecondaryClass} line-clamp-2 leading-relaxed italic bg-white/5 p-2 rounded-lg`}>
                                                                "{video.description}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex-shrink-0 ${cardClass} border-t ${borderClass} px-6 py-4 flex items-center justify-between`}>
                    <p className={`text-sm ${textSecondaryClass} flex items-center gap-2`}>
                        <div className="flex items-center -space-x-2">
                            {job?.target_languages.map((lang, idx) => (
                                <div key={idx} className="w-6 h-6 rounded-full border border-white/10 bg-black flex items-center justify-center text-xs" style={{ zIndex: 10 - idx }}>
                                    {LANGUAGE_FLAGS[lang] || "🌍"}
                                </div>
                            ))}
                        </div>
                        <span className="font-medium ml-1">Deploying {videos.length} videos</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={approving || success}
                            className="px-6 bg-transparent border border-gray-300 text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={approving || success || loading || videos.length === 0}
                            className={`px-6 ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'}`}
                        >
                            {approving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approved!
                                </>
                            ) : (
                                "Approve & Publish"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
