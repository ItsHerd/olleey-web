"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/SettingsContext";
import { useVideos } from "@/lib/useVideos";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { API_BASE_URL, jobsAPI, videosAPI } from "@/lib/api";
import { useProject } from "@/lib/ProjectContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { SelectedItem, ViewType } from "../DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Clock3, Loader2, PlayCircle, RefreshCw, Rss, Video } from "lucide-react";

interface DetectedUploadsViewProps {
  theme: string;
  onViewChange?: (view: ViewType) => void;
  onSelectItem?: (item: SelectedItem) => void;
}

export function DetectedUploadsView({ theme, onViewChange, onSelectItem }: DetectedUploadsViewProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const { detectedUploadWindow } = useSettings();
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [expandingVideoId, setExpandingVideoId] = useState<string | null>(null);
  const [selectedLanguageByVideo, setSelectedLanguageByVideo] = useState<Record<string, string[]>>({});
  const [creatingVideoId, setCreatingVideoId] = useState<string | null>(null);
  const [dismissedDetectedVideoIds, setDismissedDetectedVideoIds] = useState<string[]>([]);
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const userId = user?.id;

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    { user_id: userId },
    { enabled: !!userId }
  );
  const { jobs, loading: jobsLoading, refetch: refetchJobs } = useDashboardJobs({
    user_id: userId,
    enabled: !!userId,
    limit: 1000,
  });

  const windowMs = useMemo(() => {
    if (detectedUploadWindow === "last_1_day") return 1 * 24 * 60 * 60 * 1000;
    if (detectedUploadWindow === "last_31_days") return 31 * 24 * 60 * 60 * 1000;
    return 7 * 24 * 60 * 60 * 1000;
  }, [detectedUploadWindow]);

  const detectedVideos = useMemo(() => {
    return videos
      .filter((video) => {
        if (!video?.published_at) return false;
        const publishedAt = new Date(video.published_at).getTime();
        if (Number.isNaN(publishedAt)) return false;
        const ageMs = Date.now() - publishedAt;
        const inWindow = ageMs >= 0 && ageMs <= windowMs;
        const isSourceVideo = !video.source_video_id || video.source_video_id === video.video_id;
        if (!inWindow || !isSourceVideo) return false;

        const videoJobs = jobs.filter((j) => j.source_video_id === video.video_id);
        const activeJobs = videoJobs.filter((j) => !["cancelled", "failed"].includes(j.status));
        const hasPreStartJob = activeJobs.some(
          (j) => j.status === "waiting_approval" && Number(j.progress || 0) === 0
        );
        const hasAnyActiveJob = activeJobs.length > 0;
        const shouldShow = !hasAnyActiveJob || hasPreStartJob;

        return shouldShow && !dismissedDetectedVideoIds.includes(video.video_id);
      })
      .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
  }, [videos, jobs, windowMs, dismissedDetectedVideoIds]);

  const getVideoJobState = (videoId: string) => {
    const videoJobs = jobs
      .filter((j) => j.source_video_id === videoId)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    const preStart = videoJobs.find(
      (j) => j.status === "waiting_approval" && Number(j.progress || 0) === 0
    );
    if (preStart) return { type: "prestart" as const, job: preStart };

    const active = videoJobs.find((j) =>
      ["pending", "downloading", "processing", "uploading"].includes(j.status)
    );
    if (active) return { type: "processing" as const, job: active };

    const review = videoJobs.find(
      (j) => j.status === "waiting_approval" && Number(j.progress || 0) > 0
    );
    if (review) return { type: "review" as const, job: review };

    const completed = videoJobs.find((j) => j.status === "completed");
    if (completed) return { type: "completed" as const, job: completed };

    return { type: "none" as const, job: null };
  };

  const formatPublished = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const formatPublishedRelative = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 31) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  };

  const getLanguageNames = (codes?: string[]) => {
    if (!codes?.length) return [];
    return codes.map((code) => LANGUAGE_OPTIONS.find((lang) => lang.code === code)?.name || code.toUpperCase());
  };

  const handleBeginProcessing = async (videoId: string, jobId: string) => {
    if (!jobId || startingJobId) return;
    const existingJob = jobs.find((job) => job.job_id === jobId) || null;
    setStartingJobId(jobId);
    try {
      await jobsAPI.approveAndStart(jobId);
      const startedJob = await jobsAPI
        .getJobById(jobId)
        .catch(() => (existingJob ? { ...existingJob, status: "pending" } : null));
      await Promise.all([refetchJobs(), refetchVideos()]);
      setDismissedDetectedVideoIds((prev) => (prev.includes(videoId) ? prev : [...prev, videoId]));
      toast("Processing started", "success");
      if (startedJob?.job_id) {
        onSelectItem?.({ type: "job", id: startedJob.job_id, data: startedJob });
      }
      onViewChange?.("processing");
    } catch (error: any) {
      toast(error?.message || "Failed to start processing", "error");
    } finally {
      setStartingJobId(null);
    }
  };

  const handleCreateAndStart = async (video: any) => {
    const selectedLanguages = selectedLanguageByVideo[video.video_id]?.length
      ? selectedLanguageByVideo[video.video_id]
      : [];
    const sourceChannelId = video.channel_id || video.source_channel_id;
    const projectId = selectedProject?.id || video.project_id;

    if (!sourceChannelId) {
      toast("Missing channel context for this upload", "error");
      return;
    }
    if (selectedLanguages.length === 0) {
      toast("Select at least one target language", "error");
      return;
    }

    setCreatingVideoId(video.video_id);
    try {
      const createPayload: any = {
        source_video_id: video.video_id,
        source_channel_id: sourceChannelId,
        target_languages: selectedLanguages,
        is_simulation: false,
      };
      if (projectId) {
        createPayload.project_id = projectId;
      }
      const createdJob = await jobsAPI.createJob(createPayload);
      await Promise.all([refetchJobs(), refetchVideos()]);
      setDismissedDetectedVideoIds((prev) => (prev.includes(video.video_id) ? prev : [...prev, video.video_id]));
      setExpandingVideoId(null);
      toast(`Processing started for ${selectedLanguages.map((l) => l.toUpperCase()).join(", ")}`, "success");
      if (createdJob?.job_id) {
        onSelectItem?.({ type: "job", id: createdJob.job_id, data: createdJob });
      }
      onViewChange?.("processing");
    } catch (error: any) {
      toast(error?.message || "Failed to create processing job", "error");
    } finally {
      setCreatingVideoId(null);
    }
  };

  const toggleLanguageForVideo = (videoId: string, languageCode: string) => {
    setSelectedLanguageByVideo((prev) => {
      const current = prev[videoId] || [];
      const exists = current.includes(languageCode);
      const next = exists ? current.filter((c) => c !== languageCode) : [...current, languageCode];
      return { ...prev, [videoId]: next };
    });
  };

  const getWindowDays = () => {
    if (detectedUploadWindow === "last_1_day") return 1;
    if (detectedUploadWindow === "last_31_days") return 31;
    return 7;
  };
  const windowDays = getWindowDays();

  const handleSyncRecent = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (syncing) return;
    setSyncing(true);
    try {
      const summary = await videosAPI.syncRecentDetectedUploads(windowDays, 20);
      await Promise.all([refetchJobs(), refetchVideos()]);
      if (!silent || summary.videos_seen > 0 || summary.jobs_created > 0) {
        toast(
          `Sync complete: ${summary.jobs_created} queued from ${summary.videos_seen} recent uploads`,
          "success"
        );
      }
    } catch (error: any) {
      if (!silent) {
        toast(error?.message || "Failed to sync recent uploads", "error");
      }
    } finally {
      setSyncing(false);
    }
  };

  const isLoading = videosLoading || jobsLoading;

  useEffect(() => {
    if (!userId || isLoading || syncing || autoSyncAttempted || detectedVideos.length > 0) return;
    setAutoSyncAttempted(true);
    handleSyncRecent({ silent: true });
  }, [userId, isLoading, syncing, autoSyncAttempted, detectedVideos.length]);

  return (
    <div className={`h-full relative overflow-hidden ${theme === "dark" ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, ${theme === "dark" ? "white" : "black"} 1px, transparent 1px), linear-gradient(to bottom, ${theme === "dark" ? "white" : "black"} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="h-full overflow-auto custom-scrollbar relative z-10">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl tracking-tight">
                <Rss className="w-5 h-5" />
                Detected Uploads
              </CardTitle>
              <CardDescription>
                Showing uploads in window: {detectedUploadWindow === "last_1_day" ? "Last 1 Day" : detectedUploadWindow === "last_31_days" ? "Last 31 Days" : "Last 7 Days"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSyncRecent()}
                disabled={syncing}
                className="h-9 px-3 gap-2 text-[11px] font-semibold uppercase tracking-wide"
              >
                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {syncing ? "Syncing..." : `Sync Last ${windowDays} Days`}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && detectedVideos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No recent uploads found for this window.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && detectedVideos.map((video) => {
                  const state = getVideoJobState(video.video_id);
                  const preStartJob = state.type === "prestart" ? state.job : null;
                  const canCreate = state.type === "none";
                  const canStart = !!preStartJob?.job_id;
                  const isStarting = !!preStartJob?.job_id && startingJobId === preStartJob.job_id;
                  const isCreating = creatingVideoId === video.video_id;
                  const isExpanded = expandingVideoId === video.video_id;
                  const selectedLanguages = selectedLanguageByVideo[video.video_id] || [];
                  const selectedLanguageNames = getLanguageNames(selectedLanguages);
                  const stateLanguageNames = getLanguageNames(state.job?.target_languages);
                  const shownLanguageNames = stateLanguageNames.length > 0 ? stateLanguageNames : selectedLanguageNames;

                  const statusLabel =
                    state.type === "prestart"
                      ? "Pending Start"
                      : state.type === "processing"
                        ? "Processing"
                        : state.type === "review"
                          ? "Ready for Review"
                          : state.type === "completed"
                            ? "Completed"
                            : "Not Queued";

                  const StatusIcon =
                    state.type === "completed"
                      ? CheckCircle2
                      : state.type === "processing"
                        ? Loader2
                        : state.type === "prestart"
                          ? Clock3
                          : Video;
                  const statusVariant =
                    state.type === "completed" ? "default" : state.type === "none" ? "outline" : "secondary";

                  const buttonLabel =
                    state.type === "prestart"
                      ? "Begin Processing"
                      : state.type === "none"
                        ? "Begin Processing"
                        : state.type === "processing"
                          ? "In Progress"
                          : state.type === "review"
                            ? "Review Stage"
                            : state.type === "completed"
                              ? "Completed"
                              : "Not Available";
                  return (
                    <React.Fragment key={video.video_id}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-start gap-3 min-w-[320px]">
                            <div className="w-20 h-12 rounded-md overflow-hidden border bg-muted/30 shrink-0">
                              {video.thumbnail_url ? (
                                <img
                                  src={getFullUrl(video.thumbnail_url)}
                                  alt={video.title || video.video_id}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PlayCircle className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{video.title || video.video_id}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {video.channel_name || video.channel_id || "Connected channel"}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{video.video_id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{formatPublishedRelative(video.published_at)}</p>
                            <p className="text-xs text-muted-foreground">{formatPublished(video.published_at)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant} className="inline-flex items-center gap-1">
                            <StatusIcon className={`w-3 h-3 ${state.type === "processing" ? "animate-spin" : ""}`} />
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {shownLanguageNames.slice(0, 2).map((name) => (
                              <Badge key={`${video.video_id}-${name}`} variant="outline" className="text-[10px]">
                                {name}
                              </Badge>
                            ))}
                            {shownLanguageNames.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{shownLanguageNames.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-[10px] uppercase tracking-wider text-muted-foreground"
                              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.video_id}`, "_blank", "noopener,noreferrer")}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (preStartJob?.job_id) {
                                  handleBeginProcessing(video.video_id, preStartJob.job_id);
                                  return;
                                }
                                if (canCreate) {
                                  setExpandingVideoId((prev) => (prev === video.video_id ? null : video.video_id));
                                }
                              }}
                              disabled={(!canStart && !canCreate) || !!startingJobId || !!creatingVideoId}
                            >
                              {isStarting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                              {isStarting ? "Starting..." : buttonLabel}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && canCreate && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/20">
                            <div className="flex items-center justify-between gap-3 py-3">
                              <div className="flex-1">
                                <div className="text-xs text-muted-foreground mb-2">Target languages:</div>
                                <div className="flex flex-wrap gap-2">
                                  {LANGUAGE_OPTIONS.map((lang) => {
                                    const selected = selectedLanguages.includes(lang.code);
                                    return (
                                      <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => toggleLanguageForVideo(video.video_id, lang.code)}
                                        className={`h-7 px-2 rounded-md border text-[11px] ${selected ? "bg-primary/10 border-primary/40 text-foreground" : "bg-background border-border text-muted-foreground"}`}
                                      >
                                        {lang.flag} {lang.code.toUpperCase()}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setExpandingVideoId(null)}
                                  disabled={isCreating}
                                >
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={() => handleCreateAndStart(video)} disabled={isCreating || selectedLanguages.length === 0}>
                                  {isCreating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                  {isCreating ? "Starting..." : "Start Processing"}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
