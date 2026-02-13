"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { jobsAPI } from "@/lib/api";

const PIPELINE_STAGES = [
    { id: 'downloading', label: 'Downloading' },
    { id: 'transcribing', label: 'Transcribing' },
    { id: 'translating', label: 'Translating' },
    { id: 'dubbing', label: 'Dubbing' },
    { id: 'lip_sync', label: 'Lip Syncing' },
    { id: 'uploading', label: 'Uploading' },
    { id: 'waiting_approval', label: 'Complete' },
];

interface ProcessingPageProps {
    selectedJob?: any;
    onViewChange?: (view: any) => void;
}

export default function ProcessingPage({ selectedJob, onViewChange }: ProcessingPageProps = {}) {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { quickCheckState } = useReview();

    // Extract job ID from selected job or URL
    const pathParts = pathname?.split('/') || [];
    const videoIdFromPath = pathParts[3];
    const jobIdFromUrl = selectedJob?.job_id || videoIdFromPath || searchParams.get("job_id");

    const [job, setJob] = useState<any>(selectedJob || null);
    const [loading, setLoading] = useState(!selectedJob);
    const [error, setError] = useState<string | null>(null);

    // Initialize from selectedJob prop if available
    useEffect(() => {
        if (selectedJob) {
            console.log('[ProcessingPage] Using selectedJob prop:', selectedJob);
            setJob(selectedJob);
            setLoading(false);
        }
    }, [selectedJob]);

    // Fetch job status
    useEffect(() => {
        // If we already have job from props, don't fetch
        if (selectedJob) return;
        if (!jobIdFromUrl) return;

        const fetchJobStatus = async () => {
            try {
                console.log('[ProcessingPage] Fetching job:', jobIdFromUrl);
                const jobData = await jobsAPI.getJobById(jobIdFromUrl);
                setJob(jobData);
                setLoading(false);
            } catch (err: any) {
                console.error("Failed to fetch job:", err);
                setError(err.message || "Failed to load job");
                setLoading(false);
            }
        };

        fetchJobStatus();

        // Poll every 3 seconds if job is still processing
        const interval = setInterval(() => {
            if (job?.status && !['completed', 'failed', 'waiting_approval'].includes(job.status)) {
                fetchJobStatus();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobIdFromUrl, selectedJob, job?.status]);

    const handleCancel = async () => {
        if (!jobIdFromUrl) return;

        try {
            // await jobsAPI.cancelJob(jobIdFromUrl);
            if (onViewChange) {
                onViewChange('dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Failed to cancel job:", err);
        }
    };

    const handleGoToReview = () => {
        if (onViewChange) {
            // Stay within dashboard
            onViewChange('review');
        } else if (job?.source_video_id && job?.target_languages?.[0]) {
            // Fallback to URL navigation if not in dashboard
            router.push(`/workflows/review/${job.source_video_id}?lang=${job.target_languages[0]}&job_id=${jobIdFromUrl}`);
        }
    };

    // Map job status to stage
    const getCurrentStageIndex = () => {
        if (!job?.status) return 0;
        const statusToStage: Record<string, number> = {
            'pending': 0,
            'downloading': 0,
            'transcribing': 1,
            'translating': 2,
            'voice_cloning': 3,
            'dubbing': 3,
            'lip_sync': 4,
            'uploading': 5,
            'waiting_approval': 6,
            'completed': 6,
            'failed': -1,
        };
        return statusToStage[job.status] ?? 0;
    };

    const currentStageIndex = getCurrentStageIndex();
    const totalProgress = job?.progress || (currentStageIndex / PIPELINE_STAGES.length) * 100;

    const videoTitle = job?.title || quickCheckState.videoTitle || "Processing Video";
    const targetLanguages = job?.target_languages || [];

    if (loading && !job) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background p-6">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-destructive" />
                            Error Loading Job
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button onClick={() => onViewChange ? onViewChange('dashboard') : router.push('/dashboard')} className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isProcessing = job?.status && !['completed', 'failed', 'waiting_approval'].includes(job.status);
    const isFailed = job?.status === 'failed';
    const isCompleted = job?.status === 'completed' || job?.status === 'waiting_approval';

    return (
        <div className="w-full h-full flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewChange ? onViewChange('dashboard') : router.push('/dashboard')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    {isCompleted && (
                        <Button onClick={handleGoToReview}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review Video
                        </Button>
                    )}
                </div>

                {/* Main Card */}
                <Card>
                    <CardHeader className="text-center pb-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold">{videoTitle}</h1>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {targetLanguages.map((lang: string) => {
                                    const langInfo = LANGUAGE_OPTIONS.find(l => l.code === lang);
                                    return (
                                        <Badge key={lang} variant="outline">
                                            {langInfo?.flag} {langInfo?.name || lang}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex justify-center">
                            {isProcessing && (
                                <Badge variant="secondary" className="animate-pulse px-4 py-2">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing
                                </Badge>
                            )}
                            {isCompleted && (
                                <Badge className="bg-emerald-500 px-4 py-2">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Complete
                                </Badge>
                            )}
                            {isFailed && (
                                <Badge variant="destructive" className="px-4 py-2">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Failed
                                </Badge>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {isCompleted ? 'Completed' :
                                     isFailed ? 'Failed' :
                                     PIPELINE_STAGES[currentStageIndex]?.label || 'Processing'}
                                </span>
                                <span className="font-semibold">{Math.round(totalProgress)}%</span>
                            </div>
                            <Progress value={totalProgress} className="h-2" />
                        </div>

                        {/* Pipeline Steps */}
                        <div className="flex justify-between items-center pt-2">
                            {PIPELINE_STAGES.map((stage, index) => {
                                const isActive = index === currentStageIndex && isProcessing;
                                const isComplete = index < currentStageIndex || isCompleted;
                                const isStageFailed = job?.status === 'failed' && index === currentStageIndex;

                                return (
                                    <div key={stage.id} className="flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                            isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                                            isComplete && "bg-emerald-500 text-white",
                                            isStageFailed && "bg-destructive text-destructive-foreground",
                                            !isActive && !isComplete && !isStageFailed && "bg-muted text-muted-foreground"
                                        )}>
                                            {isComplete ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : isActive ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isStageFailed ? (
                                                <XCircle className="w-4 h-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] text-center max-w-[60px] leading-tight",
                                            isActive && "text-primary font-medium",
                                            isComplete && "text-emerald-600",
                                            !isActive && !isComplete && "text-muted-foreground"
                                        )}>
                                            {stage.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Error Alert */}
                        {isFailed && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {job?.error_message || 'An error occurred during processing. Please try again or contact support.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Actions */}
                        {isProcessing && (
                            <div className="pt-4 flex justify-center">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel Processing
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
