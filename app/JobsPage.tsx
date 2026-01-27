"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, type Job, type JobWorkflowState } from "@/lib/api";
import { useVideos } from "@/lib/useVideos";
import { logger } from "@/lib/logger";
import { Loader2, AlertCircle, RefreshCw, Circle, CheckCircle, FileText, Sparkles } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { JobsTable } from "@/components/JobsTable";
import { WorkflowModal } from "@/components/WorkflowModal";

type JobFilter = "all" | "processing" | "completed" | "failed" | "waiting";

export default function JobsPage() {
    const router = useRouter();
    const { selectedProject } = useProject();
    const { videos } = useVideos();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGraphJobId, setSelectedGraphJobId] = useState<string | null>(null);
    const [filter, setFilter] = useState<JobFilter>("all");
    const { theme } = useTheme();

    // Theme tokens
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject?.id]);

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalThisMonth = jobs.filter(job => new Date(job.created_at) >= firstDayOfMonth).length;
        const processing = jobs.filter(job =>
            ['processing', 'downloading', 'transcribing', 'voice_cloning', 'lip_sync', 'pending'].includes(job.status)
        ).length;
        const completed = jobs.filter(job =>
            ['completed', 'ready'].includes(job.status)
        ).length;
        const failed = jobs.filter(job => job.status === 'failed').length;

        return {
            totalThisMonth,
            processing,
            completed,
            failed
        };
    }, [jobs]);

    // Filter jobs based on selected filter
    const filteredJobs = useMemo(() => {
        switch (filter) {
            case "processing":
                return jobs.filter(job =>
                    ['processing', 'downloading', 'transcribing', 'voice_cloning', 'lip_sync', 'pending'].includes(job.status)
                );
            case "completed":
                return jobs.filter(job => ['completed', 'ready'].includes(job.status));
            case "failed":
                return jobs.filter(job => job.status === 'failed');
            case "waiting":
                return jobs.filter(job => job.status === 'waiting_approval');
            default:
                return jobs;
        }
    }, [jobs, filter]);

    if (loading && jobs.length === 0) {
        return (
            <div className={`w-full h-full ${bgClass} flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass} mx-auto mb-4`} />
                    <p className={`${textSecondaryClass} animate-pulse`}>Loading workflows...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${bgClass} flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className={`px-0 py-3 sm:py-4 md:py-6 border-b ${borderClass}`}>
                <div className="flex items-center justify-between mb-2 px-2 sm:px-4">
                    <h1 className={`text-xl sm:text-2xl font-semibold ${textClass}`}>Workflows</h1>
                    <button
                        onClick={loadJobs}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 ${cardClass} border ${borderClass} rounded-lg hover:opacity-80 transition-all shadow-sm disabled:opacity-50`}
                    >
                        <RefreshCw className={`h-4 w-4 ${textSecondaryClass} ${loading ? 'animate-spin' : ''}`} />
                        <span className={`text-sm font-medium ${textClass}`}>Refresh</span>
                    </button>
                </div>
                <p className={`text-sm ${textSecondaryClass} px-2 sm:px-4`}>
                    Monitor processing status and manage dubbing pipeline
                </p>
            </div>

            <div className="flex-1 overflow-auto px-4 md:px-6 py-6">
                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">Failed to load workflows</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                            <button
                                onClick={loadJobs}
                                className="text-sm font-medium text-red-600 mt-2 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-indigo-500" />
                            </div>
                            <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>
                                Monthly Total
                            </span>
                        </div>
                        <p className={`text-3xl font-bold ${textClass}`}>{stats.totalThisMonth}</p>
                    </div>

                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <RefreshCw className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>
                                Processing
                            </span>
                        </div>
                        <p className={`text-3xl font-bold ${textClass}`}>{stats.processing}</p>
                    </div>

                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                            </div>
                            <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>
                                Completed
                            </span>
                        </div>
                        <p className={`text-3xl font-bold ${textClass}`}>{stats.completed}</p>
                    </div>

                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-5 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                            <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>
                                Failed
                            </span>
                        </div>
                        <p className={`text-3xl font-bold ${textClass}`}>{stats.failed}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className={`border-b ${borderClass}`}>
                        <div className="flex gap-8">
                            {[
                                { id: "all", label: "All Workflows" },
                                { id: "processing", label: "Processing" },
                                { id: "completed", label: "Completed" },
                                { id: "failed", label: "Failed" },
                                { id: "waiting", label: "Pending Approval" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as JobFilter)}
                                    className={`pb-3 px-1 text-sm font-bold transition-all relative ${filter === tab.id
                                        ? textClass
                                        : `${textSecondaryClass} hover:${textClass} opacity-60 hover:opacity-100`
                                        }`}
                                >
                                    {tab.label}
                                    {filter === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olleey-yellow rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="flex-1">
                    <JobsTable
                        jobs={filteredJobs}
                        onViewWorkflow={(jobId) => setSelectedGraphJobId(jobId)}
                    />
                </div>

                {/* Workflow Modal */}
                <WorkflowModal
                    isOpen={!!selectedGraphJobId}
                    onClose={() => setSelectedGraphJobId(null)}
                    jobId={selectedGraphJobId || ""}
                    jobStatus={jobs.find(j => j.job_id === selectedGraphJobId)?.status || 'pending'}
                    workflowState={jobs.find(j => j.job_id === selectedGraphJobId)?.workflow_state || {
                        metadata_extraction: { status: "completed" },
                        translations: {},
                        video_dubbing: {},
                        thumbnails: {},
                        approval_status: { requires_review: false, approved_languages: [], rejected_languages: [] }
                    } as any}
                    targetLanguages={jobs.find(j => j.job_id === selectedGraphJobId)?.target_languages || []}
                    channelName={videos.find(v => v.video_id === jobs.find(j => j.job_id === selectedGraphJobId)?.source_video_id)?.channel_name}
                    videoTitle={videos.find(v => v.video_id === jobs.find(j => j.job_id === selectedGraphJobId)?.source_video_id)?.title}
                    videoThumbnail={videos.find(v => v.video_id === jobs.find(j => j.job_id === selectedGraphJobId)?.source_video_id)?.thumbnail_url}
                    onApprove={(lang: string) => console.log('Approved via modal:', lang)}
                    onReject={(lang: string) => console.log('Rejected via modal:', lang)}
                    onRetry={() => console.log('Retry via modal')}
                    onPreview={() => console.log('Preview via modal')}
                />
            </div>
        </div>
    );
}
