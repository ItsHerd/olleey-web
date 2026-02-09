"use client";

import React, { useState, useEffect } from "react";
import {
    Trash2,
    ExternalLink,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Play,
    ShieldAlert,
    Zap,
    Globe,
    Eye,
    Loader2,
    RefreshCw,
    FileCheck,
    LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getRelativeTime } from "@/lib/utils";
import { WorkflowModal } from "@/components/WorkflowModal";
import { jobsAPI, type Job, API_BASE_URL } from "@/lib/api";
import { LocalizationStatus, JobStatus } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { motion } from "framer-motion";

interface QueueAndReviewProps {
    videosLoading: boolean;
    filteredVideos: any[];
    isDark: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    getOverallVideoStatus: (localizations: any, videoId?: string) => string;
    onNavigate: (videoId: string) => void;
    jobs?: Job[];
}

export function QueueAndReview({
    videosLoading,
    filteredVideos,
    isDark,
    textClass,
    textSecondaryClass,
    getOverallVideoStatus,
    onNavigate,
    jobs: initialJobs
}: QueueAndReviewProps) {
    const [selectedWorkflowJobId, setSelectedWorkflowJobId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>(initialJobs || []);

    // Sync jobs state if initialJobs prop changes
    useEffect(() => {
        if (initialJobs) {
            setJobs(initialJobs);
        }
    }, [initialJobs]);

    // Helper to construct full URL for storage paths
    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const response = await jobsAPI.listJobs();
                setJobs(response.jobs || []);
            } catch (err) {
                logger.error("QueueAndReview", "Failed to load jobs", err);
            }
        };

        // Only load fresh jobs if they weren't provided as a prop
        if (!initialJobs) {
            loadJobs();
        }

        // Listen for refresh events to reload jobs
        const handleRefresh = () => {
            logger.info("QueueAndReview", "Refresh event received, reloading jobs");
            loadJobs();
        };

        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, []);

    const activeVideos = filteredVideos.filter(v =>
        [LocalizationStatus.QUEUED, LocalizationStatus.DRAFT, LocalizationStatus.PROCESSING, LocalizationStatus.NOT_STARTED].includes(getOverallVideoStatus(v.localizations || {}, v.video_id) as LocalizationStatus)
    );

    return (
        <>
            <div className="space-y-3 p-4">
                {videosLoading ? (
                    <div className={`flex flex-col items-center justify-center py-20 ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} rounded-[2rem] border ${isDark ? 'border-white/5' : 'border-gray-200'} border-dashed`}>
                        <RefreshCw className="h-8 w-8 animate-spin text-olleey-yellow mb-4 opacity-50" />
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-gray-500'} italic`}>Synchronizing Neural Grid...</p>
                    </div>
                ) : activeVideos.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-20 ${isDark ? 'bg-white/[0.01]' : 'bg-gray-50'} rounded-[2rem] border ${isDark ? 'border-white/5' : 'border-gray-200'} border-dashed`}>
                        <LayoutGrid className={`h-8 w-8 ${isDark ? 'text-white/10' : 'text-gray-300'} mb-4`} />
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Pipeline Idle</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeVideos.map((video, idx) => {
                            const status = getOverallVideoStatus(video.localizations || {}, video.video_id) as LocalizationStatus;
                            const isQueued = status === LocalizationStatus.QUEUED;
                            const isReview = status === LocalizationStatus.DRAFT;
                            const isProcessing = status === LocalizationStatus.PROCESSING;
                            const activeLangs = Object.keys(video.localizations || {})
                                .filter(l => [LocalizationStatus.QUEUED, LocalizationStatus.DRAFT, LocalizationStatus.PROCESSING].includes(video.localizations?.[l]?.status as LocalizationStatus));

                            const formatDuration = (seconds: number) => {
                                const mins = Math.floor(seconds / 60);
                                const secs = seconds % 60;
                                return `${mins}:${secs.toString().padStart(2, '0')}`;
                            };

                            return (
                                <motion.div
                                    layout
                                    key={`${video.video_id}-${idx}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => {
                                        if (isProcessing) return;
                                        onNavigate(video.video_id);
                                    }}
                                    className={`group relative ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'} border rounded-3xl p-4 transition-all duration-300 ${isProcessing ? 'cursor-not-allowed opacity-80' : isDark ? 'hover:bg-white/[0.06] hover:border-white/10 cursor-pointer' : 'hover:bg-gray-100 hover:border-gray-300 cursor-pointer'} overflow-hidden`}
                                >
                                    {/* Active Processing Glow */}
                                    {isProcessing && (
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-olleey-yellow/40 to-transparent animate-pulse" />
                                    )}

                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        {/* Thumbnail with Status Overlay */}
                                        <div className={`relative w-full md:w-32 aspect-video rounded-2xl overflow-hidden ${isDark ? 'bg-black/40' : 'bg-gray-200'} shrink-0 border ${isDark ? 'border-white/10' : 'border-gray-300'} group-hover:scale-[1.02] transition-transform duration-500`}>
                                            {video.thumbnail_url ? (
                                                <img
                                                    src={getFullUrl(video.thumbnail_url) || video.thumbnail_url}
                                                    className={`w-full h-full object-cover transition-opacity duration-700 ${isProcessing ? 'opacity-30' : 'opacity-60 group-hover:opacity-80'}`}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white/10" />
                                                </div>
                                            )}

                                            {isProcessing && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="relative">
                                                        <RefreshCw className="w-6 h-6 text-olleey-yellow animate-spin" />
                                                        <div className="absolute inset-0 blur-lg bg-olleey-yellow/20 animate-pulse" />
                                                    </div>
                                                </div>
                                            )}

                                            {video.duration && (
                                                <div className={`absolute bottom-2 right-2 px-2 py-0.5 ${isDark ? 'bg-black/80' : 'bg-gray-900'} backdrop-blur-md rounded-lg border ${isDark ? 'border-white/10' : 'border-gray-700'}`}>
                                                    <span className={`text-[9px] font-black ${isDark ? 'text-white/80' : 'text-white'} tracking-widest leading-none`}>
                                                        {formatDuration(video.duration)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content & Metadata */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-olleey-yellow uppercase tracking-[0.2em] opacity-40 italic">Module::{isProcessing ? 'Processing' : isReview ? 'Validation' : status === LocalizationStatus.NOT_STARTED ? 'Awaiting' : 'Staging'}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-olleey-yellow animate-pulse' : isReview ? 'bg-emerald-400' : status === LocalizationStatus.NOT_STARTED ? 'bg-zinc-500' : 'bg-purple-400'}`} />
                                                </div>
                                                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight truncate leading-none group-hover:text-olleey-yellow transition-colors`}>
                                                    {video.title}
                                                </h4>
                                                <div className={`flex items-center gap-2 text-[10px] font-medium ${isDark ? 'text-white/30' : 'text-gray-500'} italic`}>
                                                    <span>{video.channel_name || 'Neural Node'}</span>
                                                    <span className="opacity-20">•</span>
                                                    <span>{getRelativeTime(video.published_at)}</span>
                                                </div>
                                            </div>

                                            {/* Status & Languages */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {isProcessing ? (
                                                    <div className={`flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl px-3 py-1.5 border ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[8px] font-black text-olleey-yellow/60 uppercase tracking-widest leading-none">Resource Load</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-24 h-1 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-full overflow-hidden border ${isDark ? 'border-white/5' : 'border-gray-300'}`}>
                                                                    <div className="h-full bg-olleey-yellow w-[68%] rounded-full animate-[shimmer_2s_infinite]" />
                                                                </div>
                                                                <span className="text-[9px] font-black text-olleey-yellow leading-none">68%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isReview
                                                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                                                        : 'bg-purple-500/5 border-purple-500/10 text-purple-400'
                                                        }`}>
                                                        {isReview ? <FileCheck className="w-3 h-3" /> : status === LocalizationStatus.NOT_STARTED ? <LayoutGrid className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{isReview ? 'Review Protocol' : status === LocalizationStatus.NOT_STARTED ? 'Awaiting Protocol' : 'Staged for Ingestion'}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center -space-x-1.5">
                                                    {activeLangs.map((lang, idx) => (
                                                        <div
                                                            key={lang}
                                                            className="relative w-6 h-6 rounded-full border border-[#0c0c0c] bg-white/5 flex items-center justify-center group/flag transition-transform hover:z-20 hover:scale-110"
                                                            style={{ zIndex: 10 - idx }}
                                                        >
                                                            <span className="text-[10px]">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                            <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#0c0c0c] ${video.localizations?.[lang].status === LocalizationStatus.QUEUED ? 'bg-purple-500' :
                                                                video.localizations?.[lang].status === LocalizationStatus.DRAFT ? 'bg-emerald-400' :
                                                                    'bg-olleey-yellow animate-pulse'
                                                                }`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="shrink-0 w-full md:w-auto">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isProcessing) return;
                                                    if (isQueued || isReview) {
                                                        onNavigate(video.video_id);
                                                        return;
                                                    }
                                                    const job = jobs.find(j => j.source_video_id === video.video_id);
                                                    if (job) setSelectedWorkflowJobId(job.job_id);
                                                    else onNavigate(video.video_id);
                                                }}
                                                disabled={isProcessing}
                                                className={`w-full md:w-32 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isReview
                                                    ? 'bg-olleey-yellow text-black hover:bg-white hover:text-black'
                                                    : isQueued
                                                        ? 'bg-purple-600 text-white hover:bg-purple-500'
                                                        : isProcessing
                                                            ? `${isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-400'}`
                                                            : `${isDark ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`
                                                    } ${isProcessing ? 'cursor-not-allowed grayscale opacity-30' : ''}`}
                                            >
                                                {isReview ? (
                                                    <>Validate <Eye className="w-3 h-3" /></>
                                                ) : isQueued ? (
                                                    <>Deploy <Zap className="w-3 h-3" /></>
                                                ) : (
                                                    <>Status <ChevronRight className="w-3.5 h-3.5" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <WorkflowModal
                isOpen={!!selectedWorkflowJobId}
                onClose={() => setSelectedWorkflowJobId(null)}
                jobId={selectedWorkflowJobId || ""}
                jobStatus={(jobs.find(j => j.job_id === selectedWorkflowJobId)?.status as JobStatus) || JobStatus.PENDING}
                workflowState={jobs.find(j => j.job_id === selectedWorkflowJobId)?.workflow_state || {
                    metadata_extraction: { status: "completed" },
                    translations: {},
                    video_dubbing: {},
                    thumbnails: {},
                    approval_status: { requires_review: false, approved_languages: [], rejected_languages: [] }
                } as any}
                targetLanguages={jobs.find(j => j.job_id === selectedWorkflowJobId)?.target_languages || []}
                channelName={activeVideos.find(v => {
                    const job = jobs.find(j => j.job_id === selectedWorkflowJobId);
                    return v.video_id === job?.source_video_id;
                })?.channel_name}
                videoTitle={activeVideos.find(v => {
                    const job = jobs.find(j => j.job_id === selectedWorkflowJobId);
                    return v.video_id === job?.source_video_id;
                })?.title}
                videoThumbnail={getFullUrl(activeVideos.find(v => {
                    const job = jobs.find(j => j.job_id === selectedWorkflowJobId);
                    return v.video_id === job?.source_video_id;
                })?.thumbnail_url)}
                onApprove={async () => {
                    if (!selectedWorkflowJobId) return;
                    try {
                        await jobsAPI.approveJob(selectedWorkflowJobId);
                        setSelectedWorkflowJobId(null);
                        const response = await jobsAPI.listJobs();
                        setJobs(response.jobs || []);
                        // Dispatch refresh event to update other components
                        window.dispatchEvent(new CustomEvent('olleey-refresh'));
                    } catch (err) {
                        logger.error("QueueAndReview", "Failed to approve job", err);
                    }
                }}
                onReject={() => setSelectedWorkflowJobId(null)}
                onRetry={() => { }}
                onPreview={() => {
                    const job = jobs.find(j => j.job_id === selectedWorkflowJobId);
                    if (job?.source_video_id) {
                        onNavigate(job.source_video_id);
                    }
                }}
            />
        </>
    );
}
