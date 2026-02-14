"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/SettingsContext";
import { useVideos } from "@/lib/useVideos";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { jobsAPI, videosAPI } from "@/lib/api";
import { ViewType } from "../DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Rss } from "lucide-react";

interface DetectedUploadsViewProps {
  theme: string;
  onViewChange?: (view: ViewType) => void;
}

export function DetectedUploadsView({ theme, onViewChange }: DetectedUploadsViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { detectedUploadWindow } = useSettings();
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const userId = user?.id;

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    { user_id: userId },
    { enabled: !!userId }
  );
  const { jobs, loading: jobsLoading, refetch: refetchJobs } = useDashboardJobs({
    user_id: userId,
    enabled: !!userId,
    limit: 200,
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
        return inWindow && isSourceVideo;
      })
      .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
  }, [videos, windowMs]);

  const getPreStartJob = (videoId: string) =>
    jobs.find((j) => j.source_video_id === videoId && j.status === "waiting_approval" && (j.progress || 0) === 0);

  const formatPublished = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const handleBeginProcessing = async (jobId: string) => {
    if (!jobId || startingJobId) return;
    setStartingJobId(jobId);
    try {
      await jobsAPI.approveAndStart(jobId);
      await Promise.all([refetchJobs(), refetchVideos()]);
      toast("Processing started", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to start processing", "error");
    } finally {
      setStartingJobId(null);
    }
  };

  const getWindowDays = () => {
    if (detectedUploadWindow === "last_1_day") return 1;
    if (detectedUploadWindow === "last_31_days") return 31;
    return 7;
  };

  const handleSyncRecent = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const summary = await videosAPI.syncRecentDetectedUploads(getWindowDays(), 20);
      await Promise.all([refetchJobs(), refetchVideos()]);
      toast(
        `Sync complete: ${summary.jobs_created} queued from ${summary.videos_seen} recent uploads`,
        "success"
      );
    } catch (error: any) {
      toast(error?.message || "Failed to sync recent uploads", "error");
    } finally {
      setSyncing(false);
    }
  };

  const isLoading = videosLoading || jobsLoading;

  return (
    <div className={`h-full overflow-auto custom-scrollbar ${theme === "dark" ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rss className="w-4 h-4" />
                Detected Uploads
              </CardTitle>
              <CardDescription>
                Showing uploads in window: {detectedUploadWindow === "last_1_day" ? "Last 1 Day" : detectedUploadWindow === "last_31_days" ? "Last 31 Days" : "Last 7 Days"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSyncRecent} disabled={syncing}>
                {syncing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                {syncing ? "Syncing..." : "Sync Recent Uploads"}
              </Button>
              <Button variant="outline" onClick={() => onViewChange?.("dashboard")}>Back To AI View</Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                  const preStartJob = getPreStartJob(video.video_id);
                  const canStart = !!preStartJob?.job_id;
                  const isStarting = preStartJob?.job_id && startingJobId === preStartJob.job_id;
                  return (
                    <TableRow key={video.video_id}>
                      <TableCell className="font-medium">{video.title || video.video_id}</TableCell>
                      <TableCell>{video.channel_name || video.channel_id || "-"}</TableCell>
                      <TableCell>{formatPublished(video.published_at)}</TableCell>
                      <TableCell>
                        <Badge variant={canStart ? "secondary" : "outline"}>
                          {canStart ? "Pending Start" : "No Pending Job"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => preStartJob?.job_id && handleBeginProcessing(preStartJob.job_id)}
                          disabled={!canStart || !!startingJobId}
                        >
                          {isStarting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                          {isStarting ? "Starting..." : "Begin Processing"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
