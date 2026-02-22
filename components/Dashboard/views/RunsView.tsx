"use client";

import React from "react";
import { Loader2, Play, CheckCircle2, XCircle, Clock, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { API_BASE_URL, jobsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ViewType } from "../DashboardLayout";
import { resolveClientUserId } from "@/lib/user";

interface RunsViewProps {
  theme: string;
  onSelectItem: (item: any) => void;
  onViewChange: (view: ViewType) => void;
}

export function RunsView({ theme, onSelectItem, onViewChange }: RunsViewProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = resolveClientUserId(user?.id);

  const { jobs, loading, refetch } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    limit: 1000,
    enabled: !!userId
  });

  const { videos } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [languageFilter, setLanguageFilter] = React.useState("all");
  const [pageSize, setPageSize] = React.useState(8);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [cancelledJobIds, setCancelledJobIds] = React.useState<Set<string>>(new Set());
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const cardHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const filtersRef = React.useRef<HTMLDivElement | null>(null);
  const paginationRef = React.useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const handleCancelJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    try {
      setCancelledJobIds(prev => new Set(prev).add(jobId));
      window.dispatchEvent(new CustomEvent('olleey-job-cancelled', { detail: { jobId } }));
      
      await jobsAPI.cancelJob(jobId);
      toast("Job cancelled successfully", "success");
      refetch();
    } catch (err: any) {
      setCancelledJobIds(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast(err.message || "Failed to cancel job", "error");
    }
  };

  const getJobVideo = (videoId: string) => {
    return videos.find(v => v.video_id === videoId);
  };

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-emerald-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      );
    } else if (status === 'waiting_approval') {
      return (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Needs Review
        </Badge>
      );
    } else if (status === 'failed') {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    } else if (status === 'cancelled') {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border">
          <X className="w-3 h-3 mr-1" />
          Cancelled
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

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
      const isCancelled = cancelledJobIds.has(job.job_id);

      return matchesQuery && matchesStatus && matchesLanguage && !isCancelled;
    });
  }, [jobs, searchQuery, statusFilter, languageFilter, videos, cancelledJobIds]);

  const recalculatePageSize = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const rootHeight = rootRef.current?.clientHeight ?? window.innerHeight;
    const headerHeight = cardHeaderRef.current?.offsetHeight ?? 96;
    const filtersHeight = filtersRef.current?.offsetHeight ?? 76;
    const paginationHeight = paginationRef.current?.offsetHeight ?? 52;
    const tableHeaderAndChrome = 56;
    const safetyOffset = 40;

    const rowHeight =
      window.innerWidth < 768
        ? 96
        : window.innerWidth < 1280
          ? 84
          : 76;

    const availableRowsHeight =
      rootHeight -
      headerHeight -
      filtersHeight -
      paginationHeight -
      tableHeaderAndChrome -
      safetyOffset;

    const nextPageSize = Math.max(4, Math.min(16, Math.floor(availableRowsHeight / rowHeight)));
    setPageSize((prev) => (prev === nextPageSize ? prev : nextPageSize));
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, languageFilter]);

  React.useEffect(() => {
    recalculatePageSize();
    if (typeof window === "undefined") return;

    const handleResize = () => recalculatePageSize();
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => recalculatePageSize())
        : null;

    if (observer) {
      if (rootRef.current) observer.observe(rootRef.current);
      if (cardHeaderRef.current) observer.observe(cardHeaderRef.current);
      if (filtersRef.current) observer.observe(filtersRef.current);
      if (paginationRef.current) observer.observe(paginationRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [recalculatePageSize, filteredJobs.length]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedJobs = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const pageStartIndex = filteredJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEndIndex = Math.min(filteredJobs.length, currentPage * pageSize);

  const paginationItems = React.useMemo<(number | "ellipsis-left" | "ellipsis-right")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis-right", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
  }, [currentPage, totalPages]);

  return (
    <div ref={rootRef} className={cn("h-full overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto", theme === "dark" ? "text-white" : "text-gray-900")}>
      <Card className={cn(theme === "dark" ? "border-white/10" : "border-black/10")}>
        <CardHeader ref={cardHeaderRef} className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>All Runs</CardTitle>
              <CardDescription>
                {filteredJobs.length} of {jobs.length} run{jobs.length !== 1 ? 's' : ''} • Showing {pageStartIndex}-{pageEndIndex}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={filtersRef} className="mb-4 grid grid-cols-1 gap-3 rounded-lg bg-muted/20 p-3 md:grid-cols-3">
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
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Video</TableHead>
                    <TableHead className="w-[20%]">Languages</TableHead>
                    <TableHead className="w-[16%]">Status</TableHead>
                    <TableHead className="w-[16%]">Progress</TableHead>
                    <TableHead className="w-[10%]">Created</TableHead>
                    <TableHead className="w-[3%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    const progress = Number(job.progress || 0);
                    const allLanguages = job.target_languages || [];
                    const visibleLanguages = allLanguages.slice(0, 3);
                    return (
                      <TableRow
                        key={job.job_id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(job)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium max-w-[300px]">
                                {video?.title || job.source_video_id}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-[300px]">
                                Job: {job.job_id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {visibleLanguages.map((lang: string) => {
                              const langInfo = LANGUAGE_OPTIONS.find((l) => l.code === lang);
                              return (
                                <Badge key={lang} variant="outline" className="text-[10px]">
                                  {langInfo?.flag} {langInfo?.name || lang.toUpperCase()}
                                </Badge>
                              );
                            })}
                            {allLanguages.length > visibleLanguages.length && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{allLanguages.length - visibleLanguages.length}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  job.status === 'completed' || job.status === 'waiting_approval' ? "bg-emerald-500" :
                                  job.status === 'failed' ? "bg-destructive" :
                                    "bg-primary"
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">{progress}%</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatRelativeTime(job.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {!['completed', 'failed', 'cancelled'].includes(job.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                              onClick={(e) => handleCancelJob(e, job.job_id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div ref={paginationRef} className="mt-4 border-t px-1 py-2.5">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="text-xs text-muted-foreground">
                    Showing {pageStartIndex}-{pageEndIndex} of {filteredJobs.length}
                  </div>

                  <Pagination className="w-full justify-center md:w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage <= 1) return;
                            setCurrentPage((prev) => Math.max(1, prev - 1));
                          }}
                          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>

                      {paginationItems.map((item) => {
                        if (item === "ellipsis-left" || item === "ellipsis-right") {
                          return (
                            <PaginationItem key={item}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href="#"
                              isActive={item === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(item);
                              }}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage >= totalPages) return;
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                          }}
                          className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="flex items-center justify-start gap-2 md:justify-end">
                    <span className="text-xs text-muted-foreground">Auto rows/page:</span>
                    <Badge variant="secondary" className="h-7 px-2.5 text-[11px]">
                      {pageSize}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
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
