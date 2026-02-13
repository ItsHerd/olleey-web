"use client";

import React from "react";
import { ArrowLeft, Loader2, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { ViewType } from "../DashboardLayout";

interface RunsViewProps {
  theme: string;
  onSelectItem: (item: any) => void;
  onViewChange: (view: ViewType) => void;
}

export function RunsView({ theme, onSelectItem, onViewChange }: RunsViewProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = user?.id;

  const { jobs, loading } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    limit: 1000,
    enabled: !!userId && !!user
  });

  const { videos } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId && !!user });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [languageFilter, setLanguageFilter] = React.useState("all");

  const getJobVideo = (videoId: string) => {
    return videos.find(v => v.video_id === videoId);
  };

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'waiting_approval') {
      return (
        <Badge className="bg-emerald-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      );
    } else if (status === 'failed') {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    }
  };

  const handleRowClick = (job: any) => {
    console.log('[RunsView] Row clicked:', job.job_id, 'status:', job.status);
    onSelectItem({ type: "job", id: job.job_id, data: job });

    // Navigate based on job status
    if (job.status === 'waiting_approval' || job.status === 'completed') {
      onViewChange("review");
    } else if (['pending', 'downloading', 'processing', 'transcribing', 'translating', 'dubbing', 'voice_cloning', 'lip_sync', 'uploading'].includes(job.status)) {
      onViewChange("processing");
    } else {
      onViewChange("dashboard");
    }
  };

  const availableStatuses = React.useMemo(
    () => Array.from(new Set(jobs.map((job) => job.status))).sort(),
    [jobs]
  );

  const availableLanguages = React.useMemo(
    () => Array.from(new Set(jobs.flatMap((job) => job.target_languages || []))).sort(),
    [jobs]
  );

  const filteredJobs = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const video = getJobVideo(job.source_video_id);
      const matchesQuery = !query || [
        video?.title,
        job.job_id,
        job.source_video_id,
        job.status,
        (job.target_languages || []).join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesLanguage = languageFilter === "all" || (job.target_languages || []).includes(languageFilter);

      return matchesQuery && matchesStatus && matchesLanguage;
    });
  }, [jobs, searchQuery, statusFilter, languageFilter, videos]);

  return (
    <div className={cn("p-8 max-w-7xl mx-auto space-y-6", theme === "dark" ? "text-white" : "text-gray-900")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-semibold">Pipeline Runs</h1>
          </div>
          <p className="text-muted-foreground mt-2">All your video processing jobs</p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Runs</CardTitle>
          <CardDescription>
            {filteredJobs.length} of {jobs.length} run{jobs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, job ID, source ID..."
              className="md:col-span-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                {availableLanguages.map((lang) => {
                  const langInfo = LANGUAGE_OPTIONS.find((l) => l.code === lang);
                  return (
                    <SelectItem key={lang} value={lang}>
                      {langInfo?.flag} {langInfo?.name || lang.toUpperCase()}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const video = getJobVideo(job.source_video_id);
                  return (
                    <TableRow
                      key={job.job_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(job)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                            {video?.thumbnail_url ? (
                              <img
                                src={getFullUrl(video.thumbnail_url)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="truncate max-w-[300px]">
                            {video?.title || job.source_video_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {job.target_languages?.map((lang: string) => {
                            const langInfo = LANGUAGE_OPTIONS.find(l => l.code === lang);
                            return (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {langInfo?.flag} {langInfo?.code?.toUpperCase() || lang}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                job.status === 'completed' || job.status === 'waiting_approval' ? "bg-emerald-500" :
                                job.status === 'failed' ? "bg-destructive" :
                                "bg-primary"
                              )}
                              style={{ width: `${job.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {job.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {jobs.length > 0 ? "No runs match your filters" : "No pipeline runs yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
