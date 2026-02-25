"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Rss,
    Clock,
    Play,
    Loader2,
    ChevronRight,
    Zap,
    TrendingUp,
    Activity,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useSettings } from "@/lib/SettingsContext";
import { useVideos } from "@/lib/useVideos";
import { resolveClientUserId } from "@/lib/user";
import { isDemoUser as checkIsDemoUser, YC_CEO_DEMO_VIDEO } from "@/lib/mockDemoData";
import { cn } from "@/lib/utils";

interface EnterprisePipelineStatusProps {
    theme: string;
    onViewChange?: (view: any) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 } as const,
    },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function EnterprisePipelineStatus({ theme, onViewChange }: EnterprisePipelineStatusProps) {
    const isDark = theme === "dark";
    const { user } = useAuth();
    const { selectedProject } = useProject();
    const { detectedUploadWindow } = useSettings();
    const userId = resolveClientUserId(user?.id);

    const { jobs, loading } = useDashboardJobs({
        projectId: selectedProject?.id,
        user_id: userId,
        enabled: !!userId,
    });

    const { videos, loading: videosLoading } = useVideos();

    const borderClass = isDark ? "border-white/10" : "border-gray-200";
    const cardBgClass = isDark ? "bg-[#111111]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const mutedTextClass = isDark ? "text-white/60" : "text-gray-500";

    // Compute pipeline sections
    const needsReviewJobs = jobs.filter((j: any) => {
        if (j.status !== "waiting_approval") return false;
        const progressReady = Number(j.progress || 0) > 0;
        const stageReady = j.current_stage === "completed";
        const reviewApproved = j?.workflow_state?.review?.status === "approved_manual";
        return progressReady || stageReady || reviewApproved;
    });

    const processingJobs = jobs.filter((j) =>
        ["pending", "downloading", "processing", "transcribing", "translating", "voice_cloning", "dubbing", "lip_sync", "uploading"].includes(j.status)
    );

    const activeJobs = jobs.filter((j) =>
        ["pending", "downloading", "processing", "uploading"].includes(j.status)
    );

    const completedJobs = jobs.filter((j) => j.status === "completed");

    // Detected uploads
    const windowMs = detectedUploadWindow === "last_1_day"
        ? 1 * 24 * 60 * 60 * 1000
        : detectedUploadWindow === "last_31_days"
            ? 31 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;

    const sourceVideos = (() => {
        if (!checkIsDemoUser(userId)) return videos;
        const exists = videos.some((v: any) => v.video_id === YC_CEO_DEMO_VIDEO.video_id);
        if (exists) return videos;
        const ts = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        return [{ ...(YC_CEO_DEMO_VIDEO as any), published_at: ts, created_at: ts, updated_at: ts }, ...videos];
    })();

    const detectedVideos = sourceVideos.filter((video: any) => {
        if (!video?.published_at) return false;
        const publishedAt = new Date(video.published_at).getTime();
        if (Number.isNaN(publishedAt)) return false;
        const ageMs = Date.now() - publishedAt;
        const inWindow = ageMs >= 0 && ageMs <= windowMs;
        const isSource = !video.source_video_id || video.source_video_id === video.video_id;
        return inWindow && isSource;
    });

    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    const getJobVideo = (videoId: string) => videos.find((v) => v.video_id === videoId);

    const windowLabel = detectedUploadWindow === "last_1_day" ? "Last 1 Day" : detectedUploadWindow === "last_31_days" ? "Last 31 Days" : "Last 7 Days";

    const isLoading = loading || videosLoading;

    const sections = [
        {
            title: "New Uploads",
            subtitle: windowLabel,
            icon: Rss,
            iconColor: "text-amber-400",
            count: detectedVideos.length,
            emptyText: "No new uploads detected",
            viewLink: "detected_uploads",
            items: detectedVideos.slice(0, 4),
            renderItem: (video: any) => (
                <div key={video.video_id} className={`p-3 rounded-xl border ${borderClass} ${isDark ? "bg-white/[0.02]" : "bg-gray-50/50"}`}>
                    <div className="flex gap-3">
                        <div className={`w-14 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                            {video?.thumbnail_url ? (
                                <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-[12px] font-semibold truncate ${textClass}`}>{video?.title || video.video_id}</p>
                            <p className={`text-[10px] ${mutedTextClass} truncate`}>{video?.channel_name || "Connected channel"}</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Awaiting Review",
            subtitle: `${needsReviewJobs.length} pending`,
            icon: Eye,
            iconColor: "text-orange-400",
            count: needsReviewJobs.length,
            emptyText: "Nothing to review — all clear",
            viewLink: "runs",
            items: needsReviewJobs.slice(0, 4),
            renderItem: (job: any) => {
                const video = getJobVideo(job.source_video_id);
                return (
                    <div key={job.job_id} className={`p-3 rounded-xl border ${borderClass} ${isDark ? "bg-white/[0.02]" : "bg-gray-50/50"}`}>
                        <div className="flex gap-3">
                            <div className={`w-14 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                                {video?.thumbnail_url ? (
                                    <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-[12px] font-semibold truncate ${textClass}`}>{video?.title || job.source_video_id}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {job.target_languages?.slice(0, 3).map((lang: string) => (
                                        <Badge key={lang} variant="secondary" className="text-[9px] h-4 px-1">{lang.toUpperCase()}</Badge>
                                    ))}
                                    {(job.target_languages?.length || 0) > 3 && (
                                        <Badge variant="outline" className="text-[9px] h-4 px-1">+{job.target_languages.length - 3}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "In Progress",
            subtitle: `${processingJobs.length} active`,
            icon: Activity,
            iconColor: "text-blue-400",
            count: processingJobs.length,
            emptyText: "No jobs running right now",
            viewLink: "runs",
            items: processingJobs.slice(0, 4),
            renderItem: (job: any) => {
                const video = getJobVideo(job.source_video_id);
                const progress = Number(job.progress || 0);
                return (
                    <div key={job.job_id} className={`p-3 rounded-xl border ${borderClass} ${isDark ? "bg-white/[0.02]" : "bg-gray-50/50"}`}>
                        <div className="flex gap-3">
                            <div className={`w-14 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                                {video?.thumbnail_url ? (
                                    <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-[12px] font-semibold truncate ${textClass}`}>{video?.title || job.source_video_id}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className={`flex-1 h-1 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"} overflow-hidden`}>
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold ${mutedTextClass} tabular-nums`}>{progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { label: "In Progress", value: activeJobs.length, icon: Zap, color: "text-blue-500" },
                    { label: "Pending Review", value: needsReviewJobs.length, icon: Clock, color: "text-amber-500" },
                    { label: "Completion Rate", value: `${completedJobs.length > 0 ? Math.round((completedJobs.length / Math.max(jobs.length, 1)) * 100) : 98}%`, icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Completed", value: completedJobs.length, icon: Activity, color: "text-purple-500" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className={`${cardBgClass} border ${borderClass} p-4 rounded-xl group hover:border-primary/20 transition-all cursor-default shadow-sm`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                            <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-70">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Pipeline Sections */}
            <div className="grid grid-cols-1 gap-4">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <motion.div
                            key={section.title}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className={`${cardBgClass} border ${borderClass} rounded-xl overflow-hidden`}
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between p-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn("w-4 h-4", section.iconColor)} />
                                    <h4 className={`text-sm font-semibold ${textClass} tracking-tight`}>{section.title}</h4>
                                    <Badge variant="secondary" className="text-[9px] h-4">{section.count}</Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewChange?.(section.viewLink)}
                                    className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                >
                                    See All <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>

                            {/* Section Content */}
                            <div className="px-4 pb-4 space-y-2">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className={`h-14 rounded-xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                                        ))}
                                    </div>
                                ) : section.items.length > 0 ? (
                                    section.items.map((item: any) => section.renderItem(item))
                                ) : (
                                    <div className={`p-6 rounded-xl border border-dashed ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-300 bg-gray-50/50"} flex items-center justify-center`}>
                                        <p className={`text-[11px] font-bold uppercase tracking-widest ${mutedTextClass}`}>{section.emptyText}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
