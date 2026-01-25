"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, type Job } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Loader2, CheckCircle, AlertCircle, Clock, Play, Pause, XCircle, RefreshCw } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";

export default function JobsPage() {
    const { theme } = useTheme();
    const { selectedProject } = useProject();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Theme-aware classes
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
            setJobs(response.jobs || []);
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

    const getStatusBadge = (status: Job["status"]) => {
        switch (status) {
            case "completed":
                return {
                    icon: CheckCircle,
                    label: "Completed",
                    color: "text-green-300",
                    bgColor: "bg-green-500/30",
                    borderColor: "border-green-500/50"
                };
            case "ready":
                return {
                    icon: CheckCircle,
                    label: "Ready",
                    color: "text-blue-300",
                    bgColor: "bg-blue-500/30",
                    borderColor: "border-blue-500/50"
                };
            case "processing":
            case "downloading":
            case "voice_cloning":
            case "lip_sync":
            case "uploading":
                return {
                    icon: Loader2,
                    label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
                    color: "text-yellow-300",
                    bgColor: "bg-yellow-500/30",
                    borderColor: "border-yellow-500/50"
                };
            case "failed":
                return {
                    icon: XCircle,
                    label: "Failed",
                    color: "text-red-300",
                    bgColor: "bg-red-500/30",
                    borderColor: "border-red-500/50"
                };
            case "pending":
            default:
                return {
                    icon: Clock,
                    label: "Pending",
                    color: "text-gray-300",
                    bgColor: "bg-gray-500/30",
                    borderColor: "border-gray-500/50"
                };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className={`w-full h-full ${bgClass} flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass} mx-auto mb-4`} />
                    <p className={textSecondaryClass}>Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${bgClass} flex flex-col`}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className={`text-2xl md:text-3xl font-normal ${textClass}`}>Queued Jobs</h1>
                    <button
                        onClick={loadJobs}
                        className={`flex items-center gap-2 px-4 py-2 ${cardClass} border ${borderClass} rounded-lg hover:bg-white/5 transition-colors`}
                    >
                        <RefreshCw className={`h-4 w-4 ${textClass}`} />
                        <span className={`text-sm ${textClass}`}>Refresh</span>
                    </button>
                </div>
                <p className={`text-sm md:text-base ${textSecondaryClass}`}>
                    Track and manage your video dubbing jobs
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-500">Error loading jobs</p>
                        <p className="text-xs text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            {jobs.length === 0 ? (
                <div className={`flex-1 flex items-center justify-center ${cardClass} border ${borderClass} rounded-lg`}>
                    <div className="text-center py-12">
                        <Clock className={`h-12 w-12 ${textSecondaryClass} mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium ${textClass} mb-2`}>No jobs yet</h3>
                        <p className={`text-sm ${textSecondaryClass}`}>
                            Start a manual process to create your first dubbing job
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => {
                        const statusBadge = getStatusBadge(job.status);
                        const StatusIcon = statusBadge.icon;
                        const isProcessing = ["processing", "downloading", "voice_cloning", "lip_sync", "uploading"].includes(job.status);

                        return (
                            <div
                                key={job.job_id}
                                className={`${cardClass} border ${borderClass} rounded-lg p-4 hover:border-indigo-500/50 transition-colors`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Job Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-base font-medium ${textClass} truncate`}>
                                                Video: {job.source_video_id}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color} ${statusBadge.bgColor} ${statusBadge.borderColor}`}
                                            >
                                                <StatusIcon className={`h-3 w-3 ${isProcessing ? "animate-spin" : ""}`} />
                                                {statusBadge.label}
                                            </span>
                                        </div>

                                        <div className={`text-sm ${textSecondaryClass} space-y-1`}>
                                            <p>Job ID: {job.job_id}</p>
                                            {job.source_channel_id && <p>Source Channel: {job.source_channel_id}</p>}
                                            <p>Target Languages: {job.target_languages.join(", ").toUpperCase()}</p>
                                            <p>Created: {formatDate(job.created_at)}</p>
                                            {job.completed_at && <p>Completed: {formatDate(job.completed_at)}</p>}
                                        </div>

                                        {/* Progress Bar */}
                                        {isProcessing && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs ${textSecondaryClass}`}>Progress</span>
                                                    <span className={`text-xs ${textClass} font-medium`}>{job.progress}%</span>
                                                </div>
                                                <div className={`w-full h-2 ${bgClass} rounded-full overflow-hidden`}>
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {job.error_message && (
                                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                                                {job.error_message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
