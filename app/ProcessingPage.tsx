"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Eye,
  Globe,
  Loader2,
  MessageSquare,
  Mic2,
  Sparkles,
  Wand2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { jobsAPI } from "@/lib/api";

const PIPELINE_STAGES = [
  { id: "downloading", label: "Downloading", icon: CloudUpload },
  { id: "transcribing", label: "Transcribing", icon: MessageSquare },
  { id: "translating", label: "Translating", icon: Globe },
  { id: "voice_cloning", label: "Voice Cloning", icon: Mic2 },
  { id: "dubbing", label: "Dubbing", icon: Sparkles },
  { id: "lip_sync", label: "Lip Sync", icon: Wand2 },
  { id: "uploading", label: "Uploading", icon: CloudUpload },
  { id: "waiting_approval", label: "Ready for Review", icon: CheckCircle2 },
];

interface ProcessingPageProps {
  selectedJob?: any;
  onViewChange?: (view: any) => void;
}

export default function ProcessingPage({ selectedJob, onViewChange }: ProcessingPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathParts = pathname?.split("/") || [];
  const jobIdFromPath = pathParts[3];
  const jobIdFromUrl = selectedJob?.job_id || jobIdFromPath || searchParams.get("job_id");

  const [job, setJob] = useState<any>(selectedJob || null);
  const [loading, setLoading] = useState(!selectedJob);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedJob) {
      setJob(selectedJob);
      setLoading(false);
    }
  }, [selectedJob]);

  useEffect(() => {
    if (selectedJob || !jobIdFromUrl) return;

    const fetchJobStatus = async () => {
      try {
        const jobData = await jobsAPI.getJobById(jobIdFromUrl);
        setJob(jobData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load job");
        setLoading(false);
      }
    };

    fetchJobStatus();

    const interval = setInterval(() => {
      if (job?.status && !["completed", "failed", "waiting_approval"].includes(job.status)) {
        fetchJobStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobIdFromUrl, selectedJob, job?.status]);

  const handleBack = () => {
    if (onViewChange) {
      onViewChange("dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoToReview = () => {
    if (onViewChange) {
      onViewChange("review");
      return;
    }
    if (job?.source_video_id && job?.target_languages?.[0]) {
      router.push(`/workflows/review/${job.source_video_id}?lang=${job.target_languages[0]}&job_id=${jobIdFromUrl}`);
    }
  };

  const getCurrentStageIndex = () => {
    if (!job?.status) return 0;
    const statusToStage: Record<string, number> = {
      pending: 0,
      downloading: 0,
      transcribing: 1,
      translating: 2,
      voice_cloning: 3,
      dubbing: 4,
      lip_sync: 5,
      uploading: 6,
      waiting_approval: 7,
      completed: 7,
      failed: -1,
    };
    return statusToStage[job.status] ?? 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const isFailed = job?.status === "failed";
  const isCompleted = job?.status === "completed" || job?.status === "waiting_approval";
  const totalProgress =
    typeof job?.progress === "number"
      ? job.progress
      : Math.round((Math.max(currentStageIndex, 0) / (PIPELINE_STAGES.length - 1)) * 100);

  if (loading && !job) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleBack} className="w-full">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline">Job: {jobIdFromUrl?.toString().slice(0, 8)}</Badge>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isFailed ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                <h1 className="text-lg font-semibold">{job?.title || "Processing Video"}</h1>
              </div>
              <p className="text-sm text-muted-foreground">Status: {job?.status || "processing"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.max(0, Math.min(100, Math.round(totalProgress)))}%</span>
              </div>
              <Progress value={Math.max(0, Math.min(100, totalProgress))} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Stages</p>
              <div className="space-y-3">
                {PIPELINE_STAGES.map((stage, index) => {
                  const done = !isFailed && index < currentStageIndex;
                  const active = !isFailed && index === currentStageIndex;
                  const Icon = stage.icon;
                  return (
                    <div key={stage.id} className="flex items-center justify-between text-sm py-1">
                      <span className={`flex items-center gap-2 ${done ? "text-emerald-600" : active ? "text-primary" : "text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                        {stage.label}
                      </span>
                      <span>
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : active ? "In Progress" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {isCompleted && (
                <Button onClick={handleGoToReview} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Go To Review
                </Button>
              )}
              <Button variant={isCompleted ? "outline" : "default"} onClick={handleBack} className="flex-1">
                Back To Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
