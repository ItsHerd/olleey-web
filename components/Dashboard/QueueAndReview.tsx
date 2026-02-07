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
import { jobsAPI, type Job } from "@/lib/api";
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
    getOverallVideoStatus: (localizations: any) => string;
    onNavigate: (videoId: string) => void;
}

export function QueueAndReview({
    videosLoading,
    filteredVideos,
    isDark,
    textClass,
    textSecondaryClass,
    getOverallVideoStatus,
    onNavigate
}: QueueAndReviewProps) {
    const [selectedWorkflowJobId, setSelectedWorkflowJobId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const response = await jobsAPI.listJobs();
                setJobs(response.jobs || []);
            } catch (err) {
                logger.error("QueueAndReview", "Failed to load jobs", err);
            }
        };
        loadJobs();
    }, []);

    const activeVideos = filteredVideos.filter(v =>
        ["queued", "draft", "processing"].includes(getOverallVideoStatus(v.localizations || {}))
    );

    return (
        <>
            <div className="space-y-3 p-4">
                {videosLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-[2rem] border border-white/5 border-dashed">
                        <RefreshCw className="h-8 w-8 animate-spin text-olleey-yellow mb-4 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Synchronizing Neural Grid...</p>
                    </div>
                ) : activeVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                        <LayoutGrid className="h-8 w-8 text-white/10 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Pipeline Idle</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeVideos.map((video, idx) => {
                            const status = getOverallVideoStatus(video.localizations || {});
                            const isQueued = status === "queued";
                            const isReview = status === "draft";
                            const isProcessing = status === "processing";
                            const activeLangs = Object.keys(video.localizations || {})
                                .filter(l => ["queued", "draft", "processing"].includes(video.localizations?.[l]?.status || ''));

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
                                    onClick={() => onNavigate(video.video_id)}
                                    className={`group relative bg-white/[0.03] border border-white/5 rounded-3xl p-4 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-2xl hover:shadow-black/40 cursor-pointer overflow-hidden`}
                                >
                                    {/* Active Processing Glow */}
                                    {isProcessing && (
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-olleey-yellow/40 to-transparent animate-pulse" />
                                    )}

                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        {/* Thumbnail with Status Overlay */}
                                        <div className="relative w-full md:w-32 aspect-video rounded-2xl overflow-hidden bg-black/40 shrink-0 border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                                            {video.thumbnail_url ? (
                                                <img
                                                    src={video.thumbnail_url}
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
                                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-lg border border-white/10">
                                                    <span className="text-[9px] font-black text-white/80 tracking-widest leading-none">
                                                        {formatDuration(video.duration)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content & Metadata */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-olleey-yellow uppercase tracking-[0.2em] opacity-40 italic">Module::{isProcessing ? 'Processing' : isReview ? 'Validation' : 'Staging'}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-olleey-yellow animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' : isReview ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                                                </div>
                                                <h4 className="text-sm font-bold text-white tracking-tight truncate leading-none group-hover:text-olleey-yellow transition-colors">
                                                    {video.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-medium text-white/30 italic">
                                                    <span>{video.channel_name || 'Neural Node'}</span>
                                                    <span className="opacity-20">•</span>
                                                    <span>{getRelativeTime(video.published_at)}</span>
                                                </div>
                                            </div>

                                            {/* Status & Languages */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {isProcessing ? (
                                                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[8px] font-black text-olleey-yellow/60 uppercase tracking-widest leading-none">Resource Load</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                    <div className="h-full bg-olleey-yellow w-[68%] rounded-full shadow-[0_0_8px_rgba(251,191,36,0.3)] animate-[shimmer_2s_infinite]" />
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
                                                        {isReview ? <FileCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{isReview ? 'Review Protocol' : 'Staged for Ingestion'}</span>
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
                                                            <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#0c0c0c] ${video.localizations?.[lang].status === 'queued' ? 'bg-purple-500' :
                                                                video.localizations?.[lang].status === 'draft' ? 'bg-emerald-400' :
                                                                    'bg-olleey-yellow animate-pulse shadow-[0_0_5px_rgba(251,191,36,0.5)]'
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
                                                    if (isQueued || isReview) {
                                                        onNavigate(video.video_id);
                                                        return;
                                                    }
                                                    const job = jobs.find(j => j.source_video_id === video.video_id);
                                                    if (job) setSelectedWorkflowJobId(job.job_id);
                                                    else onNavigate(video.video_id);
                                                }}
                                                className={`w-full md:w-32 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isReview
                                                    ? 'bg-olleey-yellow text-black hover:bg-white hover:text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)]'
                                                    : isQueued
                                                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_10px_20px_rgba(147,51,234,0.2)]'
                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                                    }`}
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
                jobStatus={jobs.find(j => j.job_id === selectedWorkflowJobId)?.status || 'pending'}
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
                videoThumbnail={activeVideos.find(v => {
                    const job = jobs.find(j => j.job_id === selectedWorkflowJobId);
                    return v.video_id === job?.source_video_id;
                })?.thumbnail_url}
                onApprove={async () => {
                    if (!selectedWorkflowJobId) return;
                    try {
                        await jobsAPI.approveJob(selectedWorkflowJobId);
                        setSelectedWorkflowJobId(null);
                        const response = await jobsAPI.listJobs();
                        setJobs(response.jobs || []);
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
