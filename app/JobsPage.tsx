"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, type Job, type JobWorkflowState, API_BASE_URL } from "@/lib/api";
import { useVideos } from "@/lib/useVideos";
import { useSupabaseJobs } from "@/lib/useSupabase";
import { useAuth } from "@/lib/AuthContext";
import { logger } from "@/lib/logger";
import {
    Loader2,
    AlertCircle,
    RefreshCw,
    Circle,
    CheckCircle,
    FileText,
    Sparkles,
    Activity,
    Zap,
    Globe,
    Radio,
    BarChart3,
    Layers,
    ArrowRight
} from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { JobsTable } from "@/components/JobsTable";
import { WorkflowModal } from "@/components/WorkflowModal";
import { useToast } from "@/components/ui/use-toast";
import { useReview } from "@/lib/ReviewContext";
import { getFakeLocalizedText } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

type JobFilter = "all" | "processing" | "completed" | "failed" | "waiting";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        } as const
    }
};

export default function JobsPage() {
    const router = useRouter();
    const { selectedProject } = useProject();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id;

    // Fetch videos and jobs from Supabase
    const { videos } = useVideos({ user_id: userId }, { enabled: !!userId && !authLoading });
    const {
        jobs: supabaseJobs,
        loading: jobsLoading,
        error: jobsError,
        refetch: refetchJobs
    } = useSupabaseJobs(
        userId,
        { project_id: selectedProject?.id },
        { enabled: !!userId && !authLoading }
    );

    const [selectedGraphJobId, setSelectedGraphJobId] = useState<string | null>(null);
    const [filter, setFilter] = useState<JobFilter>("all");
    const { theme } = useTheme();
    const { toast } = useToast();
    const { openReview } = useReview();

    // Convert Supabase jobs to legacy Job format
    const jobs = useMemo(() => {
        console.log('[JobsPage] Supabase jobs received:', {
            count: supabaseJobs?.length || 0,
            jobs: supabaseJobs,
            userId,
            authLoading,
            selectedProject: selectedProject?.id
        });
        return (supabaseJobs || []).map(job => ({
            ...job,
            job_id: job.job_id || job.id,
            source_video_id: job.source_video_id,
            status: job.status as any, // Cast status to match expected Job status enum
            workflow_state: (job.workflow_state || {}) as JobWorkflowState,
        })) as Job[];
    }, [supabaseJobs, userId, authLoading, selectedProject?.id]);

    const loading = jobsLoading;
    const error = jobsError;

    console.log('[JobsPage] State:', {
        jobsCount: jobs.length,
        loading,
        error,
        userId,
        authLoading,
        selectedProject: selectedProject?.id
    });

    // Theme tokens
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const isDark = theme === "dark";

    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    // Handle refresh events
    useEffect(() => {
        const handleRefresh = () => refetchJobs();
        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, [refetchJobs]);

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

        return { totalThisMonth, processing, completed, failed };
    }, [jobs]);

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

    const handlePreview = (job: Job) => {
        if (!job) {
            toast("Job data not available", "error");
            return;
        }

        const video = videos.find(v => v.video_id === job?.source_video_id);

        // Debug logging
        logger.info("JobsPage", "Preview attempt", {
            jobId: job.job_id,
            sourceVideoId: job.source_video_id,
            videoFound: !!video,
            totalVideos: videos.length,
            videoIds: videos.map(v => v.video_id)
        });

        // If video not found, log info but continue with job data
        if (!video) {
            logger.info("JobsPage", "Video not found in videos array", {
                sourceVideoId: job.source_video_id
            });
        }

        const langCode = job.target_languages[0] || "es";

        openReview({
            videoId: job.source_video_id,
            languageCode: langCode,
            originalVideoUrl: video ? ((video as any).storage_url || (video as any).video_url) : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            dubbedVideoUrl: (job as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            videoTitle: video?.title || `Video ${job.source_video_id}`,
            videoDescription: video?.description || "",
            isApproved: job.status === "completed",
            status: job.status,
            approvedAt: job.updated_at
        });
    };

    if (loading && jobs.length === 0) {
        return (
            <div className={`w-full h-full ${bgClass} p-8`}>
                <div className={`h-40 w-full ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} rounded-[2.5rem] mb-12 animate-pulse flex flex-col justify-center p-12`}>
                    <div className={`h-10 w-48 ${isDark ? 'bg-white/10' : 'bg-black/10'} rounded-full mb-4`} />
                    <div className={`h-4 w-96 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-full`} />
                </div>
                <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={`flex items-center gap-6 p-6 border ${isDark ? 'border-white/[0.03] bg-white/[0.01]' : 'border-black/[0.03] bg-black/[0.01]'} rounded-[2.5rem] animate-pulse`}>
                            <div className={`w-24 h-14 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-xl shrink-0`} />
                            <div className="flex-1 space-y-3">
                                <div className={`h-4 ${isDark ? 'bg-white/10' : 'bg-black/10'} rounded-full w-1/3`} />
                                <div className={`h-3 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-full w-1/4`} />
                            </div>
                            <div className={`w-32 h-8 ${isDark ? 'bg-white/10' : 'bg-black/10'} rounded-full`} />
                            <div className={`w-40 h-8 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-full`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${bgClass} overflow-y-auto custom-scrollbar pr-6 pl-3 pt-8 pb-20`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10"
            >
                {/* Cinema-grade Header */}
                <motion.div
                    variants={itemVariants}
                    className={`relative group rounded-[2.5rem] overflow-hidden border ${borderClass} min-h-[320px] flex items-end shadow-2xl ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}
                >
                    <img
                        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000"
                        className={`absolute inset-0 w-full h-full object-cover ${isDark ? 'brightness-[0.4]' : 'brightness-[0.8] opacity-20'} group-hover:scale-110 transition-transform duration-[8000ms] blur-[2px] group-hover:blur-0`}
                        alt=""
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#0a0a0a] via-[#0a0a0a]/40' : 'from-gray-100 via-gray-100/40'} to-transparent`} />
                    <div className={`absolute inset-x-0 bottom-0 h-full bg-gradient-to-r ${isDark ? 'from-[#0a0a0a]' : 'from-gray-100'} via-transparent to-transparent`} />

                    <div className="relative z-10 p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-olleey-yellow/10 backdrop-blur-3xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-6 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                                <Zap className="w-3.5 h-3.5 shadow-sm" /> Production Core
                            </div>
                            <h1 className={`text-4xl md:text-6xl font-normal ${textClass} tracking-tighter mb-3 leading-none`}>
                                Workflows
                            </h1>
                            <p className={`text-sm md:text-base ${textSecondaryClass} max-w-2xl font-light tracking-tight opacity-60 leading-relaxed`}>
                                Orchestrating the global dubbing pipeline. Monitor real-time transcription, voice synthesis, and visual lip-sync synchronization from a unified command hub.
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden xl:flex flex-col items-end opacity-40 hover:opacity-100 transition-opacity">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-500'}`}>Network Status</span>
                                <span className="text-xl font-normal text-emerald-400">OPTIMIZED</span>
                            </div>
                            <Button
                                onClick={refetchJobs}
                                className={`w-14 h-14 rounded-full ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'} border transition-all flex items-center justify-center p-0 group`}
                            >
                                <RefreshCw className={`w-5 h-5 group-active:rotate-180 transition-transform duration-500`} />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Error State */}
                {error && (
                    <motion.div variants={itemVariants} className="p-6 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] flex items-start gap-4 backdrop-blur-xl">
                        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-red-400 uppercase tracking-widest">System Incident Reported</p>
                            <p className="text-sm text-red-300 mt-1 opacity-80">{error}</p>
                            <Button
                                onClick={refetchJobs}
                                variant="outline"
                                size="sm"
                                className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-full"
                            >
                                Re-initiate Handshake
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Glassmorphic Production Monitor */}
                <motion.div
                    variants={itemVariants}
                    className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-1 shadow-2xl shadow-black/40 overflow-hidden relative group ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-olleey-yellow/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className={`relative flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x ${isDark ? 'divide-white/[0.05]' : 'divide-slate-200'}`}>
                        <div className={`flex-1 px-10 py-8 flex flex-col justify-center ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-white'} transition-colors group/stat`}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <BarChart3 className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover/stat:opacity-100 transition-opacity" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.25em] ${textSecondaryClass} opacity-40`}>Cycle Throughput</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-light tracking-tighter ${textClass}`}>{stats.totalThisMonth}</span>
                                <span className={`text-[10px] font-bold ${textSecondaryClass} opacity-30 uppercase tracking-widest`}>Units</span>
                            </div>
                        </div>

                        <div className={`flex-1 px-10 py-8 flex flex-col justify-center ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.05]' : 'bg-white hover:bg-slate-50'} transition-colors group/stat`}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <Activity className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.25em] text-orange-500/60`}>Live Pipelines</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-light tracking-tighter text-orange-500`}>{stats.processing}</span>
                                <span className={`text-[10px] font-bold text-orange-500/30 uppercase tracking-widest`}>Active</span>
                            </div>
                        </div>

                        <div className={`flex-1 px-10 py-8 flex flex-col justify-center ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-white'} transition-colors group/stat`}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <Globe className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover/stat:opacity-100 transition-opacity" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500/60`}>System Readiness</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-light tracking-tighter text-emerald-500`}>{stats.completed}</span>
                                <span className={`text-[10px] font-bold text-emerald-500/30 uppercase tracking-widest`}>Verified</span>
                            </div>
                        </div>

                        <div className={`flex-1 px-10 py-8 flex flex-col justify-center ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-white'} transition-colors group/stat`}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 opacity-60 group-hover/stat:opacity-100 transition-opacity" />
                                <span className={`text-[11px] font-black uppercase tracking-[0.25em] text-red-500/60`}>Failed Intercepts</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-light tracking-tighter text-red-500`}>{stats.failed}</span>
                                <span className={`text-[10px] font-bold text-red-500/30 uppercase tracking-widest`}>Incidents</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filter Controls & Table Area */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b ${borderClass} pb-6`}>
                        <div className={`flex items-center gap-2 p-1 ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-100 border-slate-200'} border rounded-full overflow-x-auto custom-scrollbar no-scrollbar`}>
                            {[
                                { id: "all", label: "Master Log" },
                                { id: "processing", label: "Active Pipelines" },
                                { id: "completed", label: "Released" },
                                { id: "failed", label: "Failure Journal" },
                                { id: "waiting", label: "Staged" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as JobFilter)}
                                    className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 relative whitespace-nowrap ${filter === tab.id
                                        ? "bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/20"
                                        : `${isDark ? 'text-white/30 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className={`flex items-center gap-4 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Global Ops Feed</span>
                        </div>
                    </div>

                    {/* Jobs Table Container */}
                    <div className={`flex-1 min-h-[600px] border ${borderClass} rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-white/[0.01]' : 'bg-white'} shadow-2xl`}>
                        <JobsTable
                            jobs={filteredJobs}
                            videos={videos}
                            projectId={selectedProject?.id}
                            onViewWorkflow={(jobId) => setSelectedGraphJobId(jobId)}
                            onPreview={handlePreview}
                        />
                    </div>
                </motion.div>

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
                    videoThumbnail={getFullUrl(videos.find(v => v.video_id === jobs.find(j => j.job_id === selectedGraphJobId)?.source_video_id)?.thumbnail_url)}
                    onApprove={async (lang: string) => {
                        if (!selectedGraphJobId) return;
                        try {
                            await jobsAPI.approveJob(selectedGraphJobId);
                            toast("Workflow approved successfully!", "success");
                            refetchJobs();
                            setSelectedGraphJobId(null);
                        } catch (err: any) {
                            logger.error("JobsPage", "Failed to approve job", err);
                            toast(err.message || "Failed to approve workflow", "error");
                        }
                    }}
                    onReject={async (lang: string) => {
                        if (!selectedGraphJobId) return;
                        try {
                            logger.info("JobsPage", `Rejected workflow ${selectedGraphJobId} for ${lang}`);
                            toast("Workflow rejected. Our team will review the issues.", "info");
                            setSelectedGraphJobId(null);
                        } catch (err) {
                            logger.error("JobsPage", "Failed to reject job", err);
                        }
                    }}
                    onRetry={() => {
                        if (!selectedGraphJobId) return;
                        refetchJobs();
                        toast("Retrying production pipeline...", "info");
                    }}
                    onPreview={() => {
                        const job = jobs.find(j => j.job_id === selectedGraphJobId);
                        if (job) handlePreview(job);
                    }}
                />
            </motion.div>
        </div>
    );
}
