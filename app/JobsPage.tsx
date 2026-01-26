"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, type Job } from "@/lib/api";
import { useVideos } from "@/lib/useVideos";
import { logger } from "@/lib/logger";
import { Loader2, CheckCircle, AlertCircle, Clock, Play, Pause, XCircle, RefreshCw, Sparkles, Download, Mic, Smile, Upload, ChevronRight } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { StatusChip } from "@/components/ui/StatusChip";

export default function JobsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { selectedProject } = useProject();
    const { videos } = useVideos();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await jobsAPI.listJobs(selectedProject?.id);
            // Sort by created_at descending
            const sortedJobs = (response.jobs || []).sort((a: Job, b: Job) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setJobs(sortedJobs);
        } catch (err: any) {
            logger.error("JobsPage", "Failed to load jobs", err);
            setError(err.message || "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [selectedProject?.id]);



    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const getLanguageFlags = (languages: string[]) => {
        const flagMap: Record<string, string> = {
            es: "🇪🇸",
            fr: "🇫🇷",
            de: "🇩🇪",
            pt: "🇵🇹",
            ja: "🇯🇵",
            ko: "🇰🇷",
            hi: "🇮🇳",
            ar: "🇸🇦",
            ru: "🇷🇺",
            it: "🇮🇹",
            zh: "🇨🇳",
            en: "🇺🇸",
        };
        return languages.map(lang => flagMap[lang.toLowerCase()] || "🌍");
    };

    if (loading && jobs.length === 0) {
        return (
            <div className={`w-full h-full ${bgClass} flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-8 w-8 animate-spin text-olleey-yellow mx-auto mb-4`} />
                    <p className={`${textSecondaryClass} animate-pulse`}>Fetching latest updates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${bgClass} flex flex-col p-6 md:p-10 max-w-7xl mx-auto`}>
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className={`text-4xl font-normal ${textClass} mb-3 tracking-tight`}>Queued Jobs</h1>
                    <p className={`text-lg ${textSecondaryClass}`}>
                        Monitor processing status, review sync quality, and manage dubbing pipeline.
                    </p>
                </div>
                <button
                    onClick={loadJobs}
                    className={`flex items-center gap-2 px-5 py-2.5 ${cardClass} border ${borderClass} rounded-full hover:border-olleey-yellow/50 transition-all shadow-sm group active:scale-95`}
                >
                    <RefreshCw className={`h-4 w-4 ${textClass} group-hover:rotate-180 transition-transform duration-500`} />
                    <span className={`text-sm font-medium ${textClass}`}>Refresh Queue</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-base font-bold text-red-500">Queue Synchronization Error</p>
                        <p className="text-sm text-red-400/80 mt-1">{error}</p>
                        <button onClick={loadJobs} className="text-xs font-bold uppercase tracking-widest text-red-500 mt-3 hover:underline">Retry Connection</button>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            {jobs.length === 0 ? (
                <div className={`flex-1 flex items-center justify-center ${cardClass} border ${borderClass} rounded-3xl p-20 shadow-inner`}>
                    <div className="text-center max-w-sm">
                        <div className={`w-20 h-20 rounded-full ${cardAltClass} flex items-center justify-center mx-auto mb-6 shadow-sm border ${borderClass}`}>
                            <Sparkles className={`h-10 w-10 text-olleey-yellow/40`} />
                        </div>
                        <h3 className={`text-2xl font-normal ${textClass} mb-3`}>Clear Skies</h3>
                        <p className={`text-base ${textSecondaryClass} leading-relaxed`}>
                            No active processing jobs found. Your pipeline is empty and waiting for new content.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => {
                        const video = videos.find(v => v.video_id === job.source_video_id);
                        const isProcessing = ["processing", "downloading", "voice_cloning", "lip_sync", "uploading"].includes(job.status);
                        const flags = getLanguageFlags(job.target_languages || []);
                        const createdTime = getRelativeTime(job.created_at);

                        return (
                            <div
                                key={job.job_id}
                                className={`${cardClass} border ${borderClass} rounded-2xl p-4 md:p-6 hover:shadow-xl hover:border-olleey-yellow/30 transition-all duration-300 group relative overflow-hidden`}
                            >
                                {isProcessing && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-olleey-yellow animate-pulse" />
                                )}

                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Left: Thumbnail and Title */}
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className={`relative w-32 h-20 md:w-40 md:h-24 flex-shrink-0 rounded-xl overflow-hidden ${cardAltClass} border ${borderClass} shadow-sm group-hover:scale-105 transition-transform duration-500`}>
                                            {video?.thumbnail_url ? (
                                                <img
                                                    src={video.thumbnail_url}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className={`h-8 w-8 ${textSecondaryClass}`} />
                                                </div>
                                            )}
                                            {isProcessing && (
                                                <div className="absolute inset-0 bg-olleey-yellow/10 animate-pulse" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold tracking-widest uppercase ${textSecondaryClass} bg-white/5 px-2 py-0.5 rounded shadow-sm`}>
                                                    ID: {job.job_id.slice(0, 8)}
                                                </span>
                                                <span className={`text-[10px] ${textSecondaryClass}`}>•</span>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondaryClass}`}>Source:</span>
                                                    <span className={`text-[10px] font-medium ${textClass}`}>
                                                        {video?.channel_name || "Manual Upload"}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] ${textSecondaryClass}`}>•</span>
                                                <span className={`text-[10px] ${textSecondaryClass}`}>{createdTime}</span>
                                            </div>
                                            <h3
                                                className={`text-lg md:text-xl font-medium ${textClass} truncate cursor-pointer hover:text-olleey-yellow transition-colors group-hover:translate-x-1 duration-300 flex items-center gap-2`}
                                                onClick={() => router.push(`/content/${job.source_video_id}`)}
                                            >
                                                {video?.title || `Processing Video...`}
                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                            </h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {flags.map((flag, idx) => (
                                                    <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 ${cardAltClass} border ${borderClass} rounded-lg text-xs`}>
                                                        <span>{flag}</span>
                                                        <span className={textClass}>{job.target_languages[idx].toUpperCase()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Status and Progress */}
                                    <div className="flex flex-col lg:items-center justify-center lg:w-64 gap-3 lg:border-x lg:border-white/5 px-6">
                                        <StatusChip status={job.status} size="sm" />

                                        {isProcessing && job.progress !== undefined && (
                                            <div className="w-full max-w-[160px]">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondaryClass}`}>Progress</span>
                                                    <span className={`text-xs ${textClass} font-bold`}>{job.progress}%</span>
                                                </div>
                                                <div className={`w-full h-1.5 ${cardAltClass} rounded-full overflow-hidden border ${borderClass}`}>
                                                    <div
                                                        className="h-full bg-olleey-yellow transition-all duration-1000 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions and Info */}
                                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:w-48 gap-4">
                                        <div className="text-right flex flex-col items-end">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondaryClass} mb-1`}>Completed At</span>
                                            <span className={`text-sm ${textClass}`}>
                                                {job.completed_at ? formatDate(job.completed_at) : "---"}
                                            </span>
                                        </div>

                                        {job.status === "waiting_approval" && (
                                            <button
                                                onClick={() => router.push(`/content/${job.source_video_id}`)}
                                                className="px-6 py-2 bg-olleey-yellow text-black rounded-full text-sm font-bold hover:bg-yellow-500 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                            >
                                                Review Dubbing
                                            </button>
                                        )}

                                        {job.status === "completed" && (
                                            <button
                                                onClick={() => router.push(`/content/${job.source_video_id}`)}
                                                className={`px-6 py-2 ${cardAltClass} border ${borderClass} ${textClass} rounded-full text-sm font-bold hover:bg-white/5 transition-all whitespace-nowrap`}
                                            >
                                                View Content
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {job.error_message && (
                                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-3">
                                        <XCircle className="h-4 w-4 flex-shrink-0" />
                                        <span className="font-medium">{job.error_message}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
