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
    const isDark = theme === "dark";

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
            <div className={`relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 border-b ${borderClass} overflow-hidden`}>
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-20"
                        alt=""
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-dark-bg via-dark-bg/80 to-transparent' : 'from-light-bg via-light-bg/80 to-transparent'}`} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className={`text-xl sm:text-2xl md:text-3xl font-300 ${textClass} tracking-tight`}>Workflows</h1>
                        <button
                            onClick={loadJobs}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 ${cardClass} border ${borderClass} rounded-lg hover:opacity-80 transition-all shadow-sm disabled:opacity-50`}
                        >
                            <RefreshCw className={`h-4 w-4 ${textSecondaryClass} ${loading ? 'animate-spin' : ''}`} />
                            <span className={`text-sm font-medium ${textClass}`}>Refresh</span>
                        </button>
                    </div>
                    <p className={`text-sm sm:text-base ${textSecondaryClass} max-w-2xl`}>
                        Monitor processing status and manage your global dubbing pipeline from a centralized production hub.
                    </p>
                </div>
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

                {/* Production Monitor Bar */}
                <div className={`${cardClass} border ${borderClass} rounded-[2rem] p-1 mb-10 shadow-2xl shadow-black/20 overflow-hidden relative group`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-olleey-yellow/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">

                        {/* Monthly Throughput */}
                        <div className="flex-1 px-8 py-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} opacity-60`}>Monthly Flow</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-light tracking-tighter ${textClass}`}>{stats.totalThisMonth}</span>
                                <span className={`text-[10px] font-bold ${textSecondaryClass}`}>TOTAL UNITS</span>
                            </div>
                        </div>

                        {/* Active Processing */}
                        <div className="flex-1 px-8 py-6 flex flex-col justify-center bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80`}>In Production</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-light tracking-tighter text-orange-500`}>{stats.processing}</span>
                                <span className={`text-[10px] font-bold text-orange-500/60`}>ACTIVE PIPELINES</span>
                            </div>
                        </div>

                        {/* Fleet Readiness */}
                        <div className="flex-1 px-8 py-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500/80`}>Fleet Ready</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-light tracking-tighter text-emerald-500`}>{stats.completed}</span>
                                <span className={`text-[10px] font-bold text-emerald-500/60`}>STAGED & LIVE</span>
                            </div>
                        </div>

                        {/* Failed Intercepts */}
                        <div className="flex-1 px-8 py-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-red-500/80`}>System Block</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-light tracking-tighter text-red-500`}>{stats.failed}</span>
                                <span className={`text-[10px] font-bold text-red-500/60`}>FAILED JOBS</span>
                            </div>
                        </div>

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
