"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle, AlertCircle, Play, Globe2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";
import { StatusChip } from "@/components/ui/StatusChip";
import { jobsAPI, videosAPI, channelsAPI, type LocalizedVideo, type Job, type Video, type LanguageChannel } from "@/lib/api";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!isOpen || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={`relative ${cardClass} border ${borderClass} rounded-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden`}
                    >
                        {/* Gradient Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-olleey-yellow via-olleey-orange to-red-500 z-10" />

                        {/* Header */}
                        <div className={`flex-shrink-0 ${cardClass} border-b ${borderClass} px-8 py-6 flex items-center justify-between relative`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className={`text-2xl font-bold tracking-tight ${textClass}`}>
                                        Review & Approve
                                    </h2>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-olleey-yellow/10 border border-olleey-yellow/20">
                                        <Sparkles className="h-3 w-3 text-olleey-yellow" />
                                        <span className="text-[10px] font-bold text-olleey-yellow uppercase tracking-wider">Ready for Review</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] uppercase font-bold tracking-widest opacity-40 ${textSecondaryClass}`}>Source:</span>
                                        {sourceVideo?.channel_id ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-olleey-yellow flex items-center justify-center text-[10px] font-bold text-black border border-white/10 shadow-sm">
                                                    {sourceVideo.channel_name?.charAt(0)}
                                                </div>
                                                <span className={`text-sm font-semibold ${textClass}`}>{sourceVideo.channel_name}</span>
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-semibold underline decoration-olleey-yellow/30 underline-offset-4 ${textClass}`}>Manual Upload</span>
                                        )}
                                    </div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] uppercase font-bold tracking-widest opacity-40 ${textSecondaryClass}`}>Job ID:</span>
                                        <span className={`text-sm font-mono font-medium ${textClass}`}>{jobId?.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full hover:bg-white/5 ${textSecondaryClass} hover:${textClass} transition-all active:scale-95`}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            <div className="p-8 space-y-10">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                                        <div className="relative">
                                            <Loader2 className={`h-12 w-12 animate-spin text-olleey-yellow`} />
                                            <div className="absolute inset-0 blur-xl bg-olleey-yellow/20 rounded-full" />
                                        </div>
                                        <p className={`text-sm font-medium ${textSecondaryClass} animate-pulse`}>Fetching localized assets...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                                            <AlertCircle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <h3 className={`text-lg font-bold ${textClass} mb-2`}>Oops! Something went wrong</h3>
                                        <p className="text-red-500/80 mb-6 max-w-sm">{error}</p>
                                        <Button onClick={() => jobId && loadVideos(jobId)} variant="outline" className="rounded-full px-8">
                                            Try Again
                                        </Button>
                                    </div>
                                ) : videos.length === 0 ? (
                                    <div className="text-center py-24">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <Play className={`h-8 w-8 ${textSecondaryClass} opacity-20`} />
                                        </div>
                                        <p className={`${textSecondaryClass} font-medium`}>No videos found for this job.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {/* Deployment Targets Summary */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`${cardAltClass} p-6 rounded-2xl border ${borderClass} shadow-sm backdrop-blur-sm bg-opacity-50`}
                                        >
                                            <h3 className={`text-xs font-bold uppercase tracking-[0.2em] ${textSecondaryClass} mb-6 flex items-center gap-2.5 opacity-60`}>
                                                <Globe2 className="h-4 w-4" />
                                                Deployment Target Matrix
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {job?.target_languages.map((langCode, index) => {
                                                    const channel = languageChannels.find(c => c.language_code === langCode);
                                                    return (
                                                        <motion.div
                                                            key={langCode}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="flex flex-col items-center text-center gap-2 group"
                                                        >
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-olleey-yellow/10 group-hover:border-olleey-yellow/30 transition-all duration-300 shadow-sm">
                                                                    {LANGUAGE_FLAGS[langCode] || "🌍"}
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-dark-bg flex items-center justify-center">
                                                                    <CheckCircle className="h-3 w-3 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`text-[10px] font-black uppercase tracking-widest ${textSecondaryClass} opacity-40`}>
                                                                    {langCode}
                                                                </p>
                                                                <p className={`text-[11px] font-bold ${textClass} truncate max-w-[100px]`}>
                                                                    {channel?.channel_name?.split(' ')[0] || "Channel"}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>

                                        {/* Video Previews Grid */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className={`text-xs font-bold uppercase tracking-[0.2em] ${textSecondaryClass} opacity-60 flex items-center gap-2.5`}>
                                                    <Play className="h-4 w-4" />
                                                    Localized Preview Assets ({videos.length})
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {videos.map((video, index) => {
                                                    const targetChannel = languageChannels.find(c => c.language_code === video.language_code);

                                                    return (
                                                        <motion.div
                                                            key={video.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className={`${cardAltClass} rounded-2xl overflow-hidden border ${borderClass} flex flex-col shadow-lg hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 group relative`}
                                                        >
                                                            {/* Video Player Section */}
                                                            <div className="aspect-video bg-black relative overflow-hidden">
                                                                {video.storage_url ? (
                                                                    <video
                                                                        controls
                                                                        className="w-full h-full object-cover"
                                                                        src={video.storage_url}
                                                                        poster={video.thumbnail_url}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black to-zinc-900">
                                                                        <Loader2 className="h-8 w-8 animate-spin text-olleey-yellow/40" />
                                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">Processing Player</span>
                                                                    </div>
                                                                )}

                                                                {/* Hover Badge */}
                                                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                                        {LANGUAGE_FLAGS[video.language_code]} {video.language_code} Version
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Info Section */}
                                                            <div className="p-6 flex-1 flex flex-col">
                                                                <div className="flex items-start justify-between mb-5">
                                                                    <div className="flex items-center gap-3.5">
                                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/5">
                                                                            {LANGUAGE_FLAGS[video.language_code] || "🌍"}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className={`font-bold ${textClass} text-lg leading-tight uppercase tracking-tight`}>
                                                                                {video.language_code}
                                                                            </h4>
                                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-40 ${textSecondaryClass}`}>Dest:</span>
                                                                                <span className="text-[10px] font-bold text-olleey-yellow uppercase tracking-widest truncate max-w-[120px]">
                                                                                    {targetChannel?.channel_name || "Assigned"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="scale-90 origin-right">
                                                                        <StatusChip status={video.status === "ready" ? "completed" : "draft"} size="xs" />
                                                                    </div>
                                                                </div>

                                                                {/* Metadata */}
                                                                <div className="space-y-5 flex-1">
                                                                    <div className="relative p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-olleey-yellow/20 transition-colors">
                                                                        <p className={`text-[9px] uppercase font-black tracking-[0.2em] ${textSecondaryClass} opacity-30 mb-2`}>Optimized Title</p>
                                                                        <p className={`text-sm ${textClass} font-semibold leading-snug line-clamp-2 italic`}>
                                                                            "{video.title || "No title generated yet"}"
                                                                        </p>
                                                                    </div>

                                                                    {video.description && (
                                                                        <div className="relative p-3 rounded-xl bg-black/20 border border-white/5">
                                                                            <p className={`text-[9px] uppercase font-black tracking-[0.2em] ${textSecondaryClass} opacity-30 mb-2`}>Localized Description</p>
                                                                            <p className={`text-[11px] ${textSecondaryClass} line-clamp-3 leading-relaxed font-medium opacity-70`}>
                                                                                {video.description}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondaryClass} opacity-40`}>Review Status: PASS</span>
                                                                    </div>
                                                                    <button className="text-[10px] font-bold text-olleey-yellow uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-1 group/btn">
                                                                        Edit Details
                                                                        <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`flex-shrink-0 ${cardClass} border-t ${borderClass} px-8 py-6 flex items-center justify-between bg-opacity-80 backdrop-blur-xl relative z-20`}>
                            <div className={`hidden sm:flex items-center gap-4`}>
                                <div className="flex items-center -space-x-3">
                                    {job?.target_languages.slice(0, 5).map((lang, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="w-8 h-8 rounded-full border-2 border-dark-bg bg-zinc-900 flex items-center justify-center text-sm shadow-xl"
                                            style={{ zIndex: 10 - idx }}
                                        >
                                            {LANGUAGE_FLAGS[lang] || "🌍"}
                                        </motion.div>
                                    ))}
                                    {job?.target_languages.length! > 5 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-dark-bg bg-olleey-yellow flex items-center justify-center text-[10px] font-black text-black z-0 shadow-xl">
                                            +{job!.target_languages.length - 5}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className={`text-xs font-bold ${textClass} tracking-tight`}>
                                        Ready to Deploy
                                    </p>
                                    <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-[0.1em] opacity-40`}>
                                        {videos.length} localized variations
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    disabled={approving || success}
                                    variant="outline"
                                    className="rounded-full px-8 h-12 border-white/10 hover:bg-white/5 font-bold transition-all"
                                >
                                    Review Later
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={approving || success || loading || videos.length === 0}
                                    className={`rounded-full px-10 h-12 font-black tracking-wide transition-all shadow-xl shadow-rolleey-yellow/10 ${success ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-olleey-yellow text-black hover:bg-olleey-yellow/90 hover:scale-105 active:scale-95 border-none'}`}
                                >
                                    {approving ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Deploying...</span>
                                        </div>
                                    ) : success ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Published!</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span>Approve & Publish</span>
                                            <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">{videos.length}</div>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
