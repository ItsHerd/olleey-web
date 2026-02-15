"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Eye,
  Globe,
  Languages,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { jobsAPI } from "@/lib/api";
import { getLanguageName } from "@/lib/languages";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

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
  isModal?: boolean;
}

interface LanguageRow {
  languageCode: string;
  languageName: string;
  status: string;
  progress: number;
}

export default function ProcessingPage({ selectedJob, onViewChange, isModal = false }: ProcessingPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathParts = pathname?.split("/") || [];
  const jobIdFromPath = pathParts[3];
  const jobIdFromUrl = selectedJob?.job_id || jobIdFromPath || searchParams.get("job_id");

  const [job, setJob] = useState<any>(selectedJob || null);
  const [jobVideos, setJobVideos] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(!selectedJob && Boolean(jobIdFromUrl));
  const [error, setError] = useState<string | null>(null);
  const [simulatedJob, setSimulatedJob] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const activeJob = simulatedJob || job;

  useEffect(() => {
    if (selectedJob) {
      setJob(selectedJob);
      setLoading(false);
    }
  }, [selectedJob]);

  useEffect(() => {
    setSimulatedJob(null);
    setSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  }, [jobIdFromUrl]);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!jobIdFromUrl) {
      if (!selectedJob) {
        setLoading(false);
      }
      return;
    }

    const fetchJobStatus = async () => {
      try {
        setLoading(true);
        const [jobData, localizedVideos] = await Promise.all([
          jobsAPI.getJobById(jobIdFromUrl),
          jobsAPI.getJobVideos(jobIdFromUrl).catch(() => []),
        ]);
        setJob(jobData);
        setJobVideos(Array.isArray(localizedVideos) ? localizedVideos : []);
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
    if (activeJob?.source_video_id && activeJob?.target_languages?.[0]) {
      router.push(`/workflows/review/${activeJob.source_video_id}?lang=${activeJob.target_languages[0]}&job_id=${jobIdFromUrl}`);
    }
  };

  const handleCancelProcessing = async () => {
    if (!jobIdFromUrl || cancelling) return;

    setCancelling(true);
    
    // Stop simulation if active
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulating(false);

    try {
      window.dispatchEvent(new CustomEvent('olleey-job-cancelled', { detail: { jobId: jobIdFromUrl.toString() } }));
      await jobsAPI.cancelJob(jobIdFromUrl.toString());
      toast("Processing job canceled", "success");
      handleBack();
    } catch (err: any) {
      toast(err?.message || "Failed to cancel processing job", "error");
    } finally {
      setCancelling(false);
    }
  };

  const handleSimulateProcessing = () => {
    if (!activeJob || simulating) return;

    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    const targetLanguages = Array.isArray(activeJob.target_languages) ? activeJob.target_languages : [];
    let progress = Math.max(0, Math.min(100, Number(activeJob.progress) || 0));

    setSimulatedJob(activeJob);
    setSimulating(true);

    simulationIntervalRef.current = setInterval(() => {
      progress = Math.min(progress + 8, 100);

      const stageIndex = Math.min(
        Math.floor((progress / 100) * (PIPELINE_STAGES.length - 1)),
        PIPELINE_STAGES.length - 1
      );
      const stageStatus = PIPELINE_STAGES[stageIndex]?.id || "processing";
      const nextStatus = progress >= 100 ? "waiting_approval" : stageStatus;

      setSimulatedJob((prev: any) => {
        const source = prev || activeJob;
        const workflowState = {
          ...(source?.workflow_state || {}),
          video_dubbing: { ...(source?.workflow_state?.video_dubbing || {}) },
        };

        targetLanguages.forEach((lang: string) => {
          workflowState.video_dubbing[lang] = {
            ...(workflowState.video_dubbing[lang] || {}),
            status: nextStatus,
            progress,
          };
        });

        return {
          ...source,
          status: nextStatus,
          progress,
          workflow_state: workflowState,
        };
      });

      if (progress >= 100) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setSimulating(false);
        toast("Simulation complete: ready for review", "success");
      }
    }, 850);
  };

  const getStageIndexFromStatus = (status?: string) => {
    if (!status) return 0;
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
    return statusToStage[status] ?? 0;
  };

  const currentStageIndex = getStageIndexFromStatus(activeJob?.status);
  const isFailed = activeJob?.status === "failed";
  const isCompleted = activeJob?.status === "completed" || activeJob?.status === "waiting_approval";
  const totalProgress =
    typeof activeJob?.progress === "number"
      ? activeJob.progress
      : Math.round((Math.max(currentStageIndex, 0) / (PIPELINE_STAGES.length - 1)) * 100);

  useEffect(() => {
    if (!isModal || !activeJob || isFailed || isCompleted || simulating || simulatedJob) return;
    handleSimulateProcessing();
  }, [isModal, activeJob, isFailed, isCompleted, simulating, simulatedJob]);

  const getDisplayStatus = (status?: string) => {
    if (!status) return "Pending";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusBadgeVariant = (status?: string): "secondary" | "destructive" | "default" | "outline" => {
    if (!status) return "secondary";
    if (status === "failed") return "destructive";
    if (["waiting_approval", "completed", "live", "published"].includes(status)) return "default";
    if (["transcribing", "translating", "voice_cloning", "dubbing", "lip_sync", "uploading", "downloading"].includes(status)) {
      return "outline";
    }
    return "secondary";
  };

  const getLanguageProgress = (lang: string, status?: string) => {
    const workflowProgress = activeJob?.workflow_state?.video_dubbing?.[lang]?.progress;
    if (typeof workflowProgress === "number") return Math.max(0, Math.min(100, workflowProgress));

    if (status === "waiting_approval" || status === "completed" || status === "live" || status === "published") {
      return 100;
    }
    if (status === "failed") return 0;
    if (typeof activeJob?.progress === "number") return Math.max(0, Math.min(99, activeJob.progress));
    return 0;
  };

  const languageRows: LanguageRow[] = (Array.isArray(activeJob?.target_languages) ? activeJob.target_languages : []).map((lang: string) => {
    const localized = jobVideos.find((v) => v.language_code === lang);
    const workflowStatus = activeJob?.workflow_state?.video_dubbing?.[lang]?.status;
    const status = localized?.status || workflowStatus || activeJob?.status || "pending";
    const progress = getLanguageProgress(lang, status);
    return {
      languageCode: lang,
      languageName: getLanguageName(lang),
      status,
      progress,
    };
  });

  useEffect(() => {
    if (languageRows.length === 0) {
      setSelectedLanguage(null);
      return;
    }

    if (!selectedLanguage || !languageRows.some((row) => row.languageCode === selectedLanguage)) {
      setSelectedLanguage(languageRows[0].languageCode);
    }
  }, [languageRows, selectedLanguage]);

  const activeLanguageRow = languageRows.find((row) => row.languageCode === selectedLanguage) || null;
  const activeLanguageStageIndex = activeLanguageRow ? getStageIndexFromStatus(activeLanguageRow.status) : -1;
  const activeLanguageStage = activeLanguageStageIndex >= 0 ? PIPELINE_STAGES[activeLanguageStageIndex] : null;
  const ActiveLanguageStageIcon = activeLanguageStage?.icon;

  if (loading && !activeJob) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && !activeJob && !jobIdFromUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No processing job selected.</p>
            <Button onClick={handleBack} className="w-full">
              Back
            </Button>
          </CardContent>
        </Card>
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
    <div className={`w-full ${isModal ? "max-h-[80vh]" : "h-full"} overflow-y-auto custom-scrollbar ${isModal ? "p-4 sm:p-5" : "p-6"}`}>
      <div className={`w-full ${isModal ? "max-w-none" : "max-w-4xl mx-auto"} space-y-4`}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline">Job: {jobIdFromUrl?.toString().slice(0, 8)}</Badge>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className={`${isModal ? "p-4 sm:p-5 space-y-5" : "p-6 space-y-6"}`}>
            <section className="rounded-lg bg-card/50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isFailed ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    <h1 className="text-lg font-semibold">{activeJob?.title || "Processing Video"}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">Track job progress across all selected languages.</p>
                </div>
                <Badge variant={getStatusBadgeVariant(activeJob?.status)}>{getDisplayStatus(activeJob?.status || "processing")}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{Math.max(0, Math.min(100, Math.round(totalProgress)))}%</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, totalProgress))} />
              </div>
            </section>

            <section className="rounded-lg bg-card/50 p-4 space-y-3">
              <p className="text-sm font-medium">Language Status</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className={`rounded-md bg-background/70 ${isModal ? "max-h-[320px] overflow-auto" : "overflow-hidden"}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Language</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {languageRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                            No target languages configured for this job.
                          </TableCell>
                        </TableRow>
                      ) : (
                        languageRows.map((row: LanguageRow) => {
                          const isActive = row.languageCode === selectedLanguage;
                          return (
                            <TableRow
                              key={row.languageCode}
                              className={`cursor-pointer ${isActive ? "bg-muted/60" : ""}`}
                              onClick={() => setSelectedLanguage(row.languageCode)}
                            >
                              <TableCell className="font-medium">{row.languageName}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(row.status)}>{getDisplayStatus(row.status)}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-md bg-background/70 p-4 space-y-4 min-h-[220px]">
                  {!activeLanguageRow ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Select a language to view details.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Language</p>
                        <p className="text-base font-semibold flex items-center gap-2">
                          <Languages className="w-4 h-4 text-muted-foreground" />
                          {activeLanguageRow.languageName}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                        <Badge variant={getStatusBadgeVariant(activeLanguageRow.status)}>
                          {getDisplayStatus(activeLanguageRow.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pipeline Stage</p>
                        {activeLanguageStage ? (
                          <div className="rounded-md bg-background/80 px-3 py-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium">
                              {ActiveLanguageStageIcon ? <ActiveLanguageStageIcon className="w-4 h-4 text-primary" /> : null}
                              {activeLanguageStage.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activeLanguageStageIndex + 1} / {PIPELINE_STAGES.length}
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-md bg-background/80 px-3 py-2.5 text-sm text-destructive">
                            Failed
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(activeLanguageRow.progress)}%</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, activeLanguageRow.progress))} className="h-2" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <div className="pt-2 flex flex-wrap justify-end gap-2">
              {!isCompleted && !isFailed && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={!jobIdFromUrl || cancelling}
                      className="min-w-[150px]"
                    >
                      {cancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {cancelling ? "Cancelling..." : "Cancel Processing"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel processing job?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop the current processing run for this video. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={cancelling}>Keep Processing</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelProcessing}
                        disabled={cancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Job"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {isCompleted && (
                <Button onClick={handleGoToReview} className="min-w-[150px]">
                  <Eye className="w-4 h-4 mr-2" />
                  Go To Review
                </Button>
              )}
              <Button variant={isCompleted ? "outline" : "default"} onClick={handleBack} className="min-w-[150px]">
                Back To Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
