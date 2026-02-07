"use client";

import React, { useState, useEffect } from "react";
import { Trash2, ExternalLink, ChevronRight, Clock, CheckCircle, AlertCircle, Sparkles, Play, ShieldAlert, Zap, Globe, Eye, Loader2, RefreshCw, FileCheck, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getRelativeTime } from "@/lib/utils";
import { WorkflowModal } from "@/components/WorkflowModal";
import { jobsAPI, type Job } from "@/lib/api";
import { logger } from "@/lib/logger";

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
    cardClass,
    borderClass,
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
            <section>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-olleey-yellow/10 rounded-none shadow-sm border border-olleey-yellow/20">
                            <Clock className="w-4 h-4 text-olleey-yellow" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-300 ${textClass} tracking-tight`}>Queue & Review</h2>
                            <p className={`text-[9px] ${textSecondaryClass} font-medium`}>Active processing and pending approvals</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-none border border-white/5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow animate-pulse" />
                        <span className={`text-[9px] font-bold ${textClass}`}>
                            {activeVideos.length} active
                        </span>
                    </div>
                </div>

                {videosLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-none border border-white/5">
                        <Loader2 className={`h-10 w-10 animate-spin text-olleey-yellow mb-4 opacity-50`} />
                        <p className={`text-sm font-medium ${textSecondaryClass}`}>Syncing with production servers...</p>
                    </div>
                ) : activeVideos.length === 0 ? (
                    null
                ) : (
                    <div className={`${cardClass} border ${borderClass} rounded-none shadow-2xl shadow-black/10 overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed">
                                <tbody className="divide-y divide-white/[0.02]">
                                    {activeVideos.map((video) => {
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

                                        const formatViews = (views: number) => {
                                            if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
                                            if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
                                            return views.toString();
                                        };

                                        return (
                                            <tr
                                                key={video.video_id}
                                                className={`group hover:${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} transition-all cursor-pointer`}
                                                onClick={() => onNavigate(video.video_id)}
                                            >
                                                <td className="px-2 py-2" colSpan={4}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-16 aspect-video rounded-sm overflow-hidden bg-gray-900 shrink-0 shadow-md border border-white/5">
                                                            {video.thumbnail_url && <img src={video.thumbnail_url} className={`w-full h-full object-cover ${isProcessing ? 'opacity-40' : ''}`} alt="" />}
                                                            {isProcessing && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                                    <RefreshCw className="w-3 h-3 text-olleey-yellow animate-spin" />
                                                                </div>
                                                            )}
                                                            {video.duration && (
                                                                <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/80 rounded-sm">
                                                                    <span className="text-[7px] font-bold text-white">
                                                                        {formatDuration(video.duration)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[11px] font-bold ${textClass} truncate mb-0.5 group-hover:text-olleey-yellow transition-colors`}>
                                                                {video.title}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <span className={`text-[9px] font-medium ${textSecondaryClass}`}>
                                                                    {video.channel_name || 'Demo Channel'}
                                                                </span>
                                                                <span className="text-[9px] text-white/10">•</span>
                                                                <span className={`text-[9px] font-medium ${textSecondaryClass}`}>
                                                                    {getRelativeTime(video.published_at)}
                                                                </span>
                                                                {video.view_count && (
                                                                    <>
                                                                        <span className="text-[9px] text-white/10">•</span>
                                                                        <span className={`text-[9px] font-medium ${textSecondaryClass}`}>
                                                                            {formatViews(video.view_count)} views
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isQueued ? (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-400 text-[8px] font-bold border border-purple-500/20">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        Queued - Click to Start
                                                                    </span>
                                                                ) : isReview ? (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-olleey-yellow/10 text-olleey-yellow text-[8px] font-bold border border-olleey-yellow/20">
                                                                        <FileCheck className="w-2.5 h-2.5" />
                                                                        Ready for Review
                                                                    </span>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[8px] font-bold text-blue-400">Processing</span>
                                                                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-olleey-yellow w-[85%] rounded-full animate-pulse" />
                                                                        </div>
                                                                        <span className="text-[8px] font-bold text-olleey-yellow">85%</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-0.5 ml-1">
                                                                    {activeLangs.slice(0, 5).map(lang => (
                                                                        <div
                                                                            key={lang}
                                                                            className={`w-5 h-5 rounded-full border ${isDark ? 'border-[#0a0a0a]' : 'border-white'} bg-white/5 flex items-center justify-center shadow-sm relative`}
                                                                            title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                                                                        >
                                                                            <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                                            <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${video.localizations?.[lang].status === 'queued' ? 'bg-purple-500' :
                                                                                video.localizations?.[lang].status === 'draft' ? 'bg-olleey-yellow' :
                                                                                    'bg-blue-500 animate-pulse'
                                                                                }`} />
                                                                        </div>
                                                                    ))}
                                                                    {activeLangs.length > 5 && (
                                                                        <span className={`text-[8px] font-bold ${textSecondaryClass} ml-0.5`}>
                                                                            +{activeLangs.length - 5}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            <Button
                                                                variant={isReview ? "default" : "ghost"}
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // For queued or review-ready videos, use the main navigation (Review Modal / Start Proc)
                                                                    if (isQueued || isReview) {
                                                                        onNavigate(video.video_id);
                                                                        return;
                                                                    }
                                                                    // For other statuses (processing/failed), try to find job and open technical modal
                                                                    const job = jobs.find(j => j.source_video_id === video.video_id);
                                                                    if (job) {
                                                                        setSelectedWorkflowJobId(job.job_id);
                                                                    } else {
                                                                        onNavigate(video.video_id);
                                                                    }
                                                                }}
                                                                className={`h-7 px-3 text-[9px] font-black transition-all ${isReview
                                                                    ? 'bg-olleey-yellow text-black hover:bg-olleey-yellow/90 shadow-lg shadow-olleey-yellow/20'
                                                                    : isQueued
                                                                        ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20'
                                                                        : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`
                                                                    }`}
                                                            >
                                                                {isQueued ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span>Start Processing</span>
                                                                    </div>
                                                                ) : isReview ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Eye className="w-3 h-3" />
                                                                        <span>Review</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span>Monitor Job</span>
                                                                        <ChevronRight className="w-3 h-3" />
                                                                    </div>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* Workflow Insight Modal */}
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
                        // Refresh jobs
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
