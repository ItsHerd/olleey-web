"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Play, Clock, PanelRightClose, Loader2, Rss, Bell, X } from "lucide-react";
import { SelectedItem, ViewType } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { useReview } from "@/lib/ReviewContext";
import { API_BASE_URL, jobsAPI, settingsAPI, videosAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/SettingsContext";
import { LANGUAGE_OPTIONS, getLanguageFlag } from "@/lib/languages";
import { isDemoUser, YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION } from "@/lib/mockDemoData";
import { resolveClientUserId } from "@/lib/user";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RightSidebarProps {
  selectedItem: SelectedItem;
  currentView: ViewType;
  onClose: () => void;
  theme: string;
  onViewChange?: (view: any) => void;
  onSelectItem?: (item: SelectedItem) => void;
}

type ProcessingMode = "dubbing" | "lip_sync";
const DETECTED_UPLOAD_PREFERENCES_KEY = "olleey_detected_upload_preferences";
type StoredDetectedUploadPreferences = {
  enabled: boolean;
  languages: string[];
  mode: ProcessingMode;
};
const autoSyncRunGuard = new Set<string>();

export function RightSidebar({
  selectedItem,
  currentView,
  onClose,
  theme,
  onViewChange,
  onSelectItem
}: RightSidebarProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { openReview } = useReview();
  const { toast } = useToast();
  const { detectedUploadWindow } = useSettings();
  const userId = resolveClientUserId(user?.id);
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#111111]" : "bg-[#FAFAFA]";
  const borderClass = isDark ? "border-[#2A2A2A]" : "border-gray-300/50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";
  const glassBgClass = isDark ? "bg-white/[0.03]" : "bg-white/60";

  const { jobs, loading, error: jobsError, refetch: refetchJobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    limit: 1000,
    enabled: !!userId
  });

  const { videos, error: videosError, refetch: refetchVideos } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId });
  const {
    videos: allUserVideos,
    loading: allUserVideosLoading,
    refetch: refetchAllUserVideos
  } = useVideos({
    user_id: userId,
  }, { enabled: !!userId });
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingAutoApprove, setSavingAutoApprove] = useState(false);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const [expandingVideoId, setExpandingVideoId] = useState<string | null>(null);
  const [selectedLanguageByVideo, setSelectedLanguageByVideo] = useState<Record<string, string[]>>({});
  const [selectedModeByVideo, setSelectedModeByVideo] = useState<Record<string, ProcessingMode>>({});
  const [rememberPreferences, setRememberPreferences] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState<{ languages: string[]; mode: ProcessingMode } | null>(null);
  const [creatingVideoId, setCreatingVideoId] = useState<string | null>(null);
  const [dismissedDetectedVideoIds, setDismissedDetectedVideoIds] = useState<string[]>([]);
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const [autoSyncingDetected, setAutoSyncingDetected] = useState(false);
  const [cancelledJobIds, setCancelledJobIds] = useState<Set<string>>(new Set());
  const [ephemeralJobs, setEphemeralJobs] = useState<Record<string, any>>({});
  const [jobOverrides, setJobOverrides] = useState<Record<string, Partial<any>>>({});
  const inFlightRefreshJobsRef = useRef<Set<string>>(new Set());
  const lastRefreshAtByJobRef = useRef<Record<string, number>>({});

  const upsertEphemeralJob = (job: any) => {
    if (!job?.job_id) return;
    setEphemeralJobs((prev) => {
      const current = prev[job.job_id] || {};
      const merged = {
        ...current,
        ...job,
      };
      const changed = Object.keys(job).some(
        (key) => (current as any)[key] !== (merged as any)[key]
      );
      if (!changed) return prev;
      return {
        ...prev,
        [job.job_id]: merged,
      };
    });
  };

  const patchJobOverride = (jobId: string, patch: Partial<any>) => {
    setJobOverrides((prev) => {
      const current = prev[jobId] || {};
      const next = {
        ...current,
        ...patch,
      };
      const changed = Object.keys(patch).some(
        (key) => (current as any)[key] !== (next as any)[key]
      );
      if (!changed) return prev;
      return {
        ...prev,
        [jobId]: next,
      };
    });
  };

  const mergedJobs = useMemo(() => {
    const byId = new Map<string, any>();
    jobs.forEach((job) => byId.set(job.job_id, { ...job }));
    Object.values(ephemeralJobs).forEach((job: any) => {
      if (!job?.job_id) return;
      byId.set(job.job_id, {
        ...(byId.get(job.job_id) || {}),
        ...job,
      });
    });

    return Array.from(byId.values()).map((job: any) => ({
      ...job,
      ...(jobOverrides[job.job_id] || {}),
    }));
  }, [jobs, ephemeralJobs, jobOverrides]);

  const scheduleSimulationSectionUpdate = (jobId: string) => {
    if (typeof window === "undefined") return;
    window.setTimeout(async () => {
      try {
        const latest = await jobsAPI.getJobById(jobId);
        if (latest?.job_id) {
          upsertEphemeralJob(latest);
          patchJobOverride(jobId, {
            status: latest.status,
            progress: latest.progress,
            current_stage: (latest as any).current_stage,
          });
          return;
        }
      } catch {
        // Fallback optimistic move to review state.
      }
      patchJobOverride(jobId, {
        status: "waiting_approval",
        progress: 100,
        current_stage: "completed",
      });
    }, 6200);
  };

  const getVideoTitleForJob = (job: any) => {
    const video = videos.find(v => v.video_id === job.source_video_id);
    if (video?.title) return video.title;

    const metadataTitle = job?.workflow_state?.metadata?.title;
    if (typeof metadataTitle === "string" && metadataTitle.trim().length > 0) {
      return metadataTitle;
    }

    if (job.source_video_id === "demo_yc_ceo_video_001") {
      return YC_CEO_DEMO_VIDEO.title;
    }

    return job.source_video_id;
  };

  const handleReview = (job: any, langCode: string) => {
    // Set selected item first
    onSelectItem?.({ type: "job", id: job.job_id, data: job });

    const video = videos.find(v => v.video_id === job.source_video_id);
    const targetVideo = video || (isDemoUser(userId || "demo") && job.source_video_id === "demo_yc_ceo_video_001" ? YC_CEO_DEMO_VIDEO : null);

    if (!targetVideo) {
      toast("Source video not found for this job", "error");
      return;
    }

    const localization = (job.source_video_id === "demo_yc_ceo_video_001" && langCode === "es")
      ? YC_CEO_SPANISH_TRANSLATION
      : (targetVideo.localizations as any)?.[langCode];

    openReview({
      videoId: job.source_video_id,
      languageCode: langCode,
      jobId: job.job_id,
      originalVideoUrl: (targetVideo as any).storage_url || (targetVideo as any).video_url,
      dubbedVideoUrl: localization?.dubbed_video_url || localization?.storage_url || localization?.video_url || "",
      videoTitle: targetVideo.title,
      videoDescription: targetVideo.description || "",
      thumbnailUrl: targetVideo.thumbnail_url,
      localizedTitle: localization?.title || "",
      localizedDescription: localization?.description || "",
      isApproved: localization?.status === 'approved',
      approvedAt: targetVideo.published_at,
      navigate: false
    });

    onViewChange?.("review");
  };

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      if (!userId || !user) return;
      setSettingsLoading(true);
      try {
        const settings = await settingsAPI.getSettings();
        if (mounted) {
          setAutoApproveEnabled(Boolean(settings.auto_approve_jobs));
        }
      } catch {
        // Sidebar still functions even if settings fail to load.
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };

    loadSettings();
    return () => {
      mounted = false;
    };
  }, [userId, user]);

  useEffect(() => {
    const handleCancelled = (e: any) => {
      const { jobId } = e.detail;
      setCancelledJobIds(prev => {
        if (!jobId || prev.has(jobId)) return prev;
        return new Set(prev).add(jobId);
      });
    };
    const handleRefresh = async (e: any) => {
      const jobId = e?.detail?.jobId;
      if (!jobId) return;
      const now = Date.now();
      const lastRefreshedAt = lastRefreshAtByJobRef.current[jobId] || 0;
      if (now - lastRefreshedAt < 500) return;
      if (inFlightRefreshJobsRef.current.has(jobId)) return;
      inFlightRefreshJobsRef.current.add(jobId);
      lastRefreshAtByJobRef.current[jobId] = now;
      try {
        const latest = await jobsAPI.getJobById(jobId);
        if (latest?.job_id) {
          upsertEphemeralJob(latest);
        }
      } catch {
        // Ignore best-effort update failures.
      } finally {
        inFlightRefreshJobsRef.current.delete(jobId);
      }
    };
    const handleJobSectionUpdate = (e: any) => {
      const { jobId, status, progress, current_stage } = e?.detail || {};
      if (!jobId) return;
      if (status === undefined && progress === undefined && current_stage === undefined) return;
      patchJobOverride(jobId, { status, progress, current_stage });
    };

    window.addEventListener('olleey-job-cancelled', handleCancelled);
    window.addEventListener('olleey-refresh', handleRefresh);
    window.addEventListener('olleey-job-section-update', handleJobSectionUpdate);
    return () => {
      window.removeEventListener('olleey-job-cancelled', handleCancelled);
      window.removeEventListener('olleey-refresh', handleRefresh);
      window.removeEventListener('olleey-job-section-update', handleJobSectionUpdate);
    };
  }, []);

  // If there's an auth error, show a message
  if (jobsError?.includes("access token") || videosError?.includes("access token")) {
    return (
      <div className={`h-full ${bgClass} border ${isDark ? "border-white/10" : "border-gray-200"} flex flex-col items-center justify-center p-6`}>
        <div className="text-center">
          <p className={`text-sm ${mutedTextClass} mb-4`}>Please log in to view status</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const getJobVideo = (videoId: string) => {
    return videos.find(v => v.video_id === videoId);
  };

  // Convert window string to milliseconds
  const getWindowMs = () => {
    switch (detectedUploadWindow) {
      case "last_1_day":
        return 1 * 24 * 60 * 60 * 1000;
      case "last_31_days":
        return 31 * 24 * 60 * 60 * 1000;
      case "last_7_days":
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };
  const getWindowDays = () => {
    switch (detectedUploadWindow) {
      case "last_1_day":
        return 1;
      case "last_31_days":
        return 31;
      case "last_7_days":
      default:
        return 7;
    }
  };

  const windowMs = getWindowMs();

  const seededDetectedSourceVideos = (() => {
    if (!isDemoUser(userId)) return allUserVideos;
    const exists = allUserVideos.some((video) => video.video_id === YC_CEO_DEMO_VIDEO.video_id);
    if (exists) return allUserVideos;

    const seededPublishedAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    return [
      {
        ...(YC_CEO_DEMO_VIDEO as any),
        published_at: seededPublishedAt,
        created_at: seededPublishedAt,
        updated_at: seededPublishedAt,
      },
      ...allUserVideos,
    ];
  })();

  const detectedVideos = seededDetectedSourceVideos
    .filter((video) => {
      if (!video?.published_at) return false;
      const publishedAt = new Date(video.published_at).getTime();
      if (Number.isNaN(publishedAt)) return false;

      const ageMs = Date.now() - publishedAt;
      const inWindow = ageMs >= 0 && ageMs <= windowMs;
      const isSourceVideo = !video.source_video_id || video.source_video_id === video.video_id;
      if (!inWindow || !isSourceVideo) return false;

      const videoJobs = mergedJobs.filter((j) => !cancelledJobIds.has(j.job_id) && j.source_video_id === video.video_id);
      const activeJobs = videoJobs.filter((j) => !["cancelled", "failed"].includes(j.status));
      const hasPreStartJob = activeJobs.some(
        (j) => j.status === "waiting_approval" && Number(j.progress || 0) === 0
      );
      const hasAnyActiveJob = activeJobs.length > 0;
      const shouldShow = !hasAnyActiveJob || hasPreStartJob;

      return shouldShow && !dismissedDetectedVideoIds.includes(video.video_id);
    })
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());

  const getPreStartJobForVideo = (videoId: string) =>
    mergedJobs.find((j) => !cancelledJobIds.has(j.job_id) && j.source_video_id === videoId && j.status === "waiting_approval" && Number(j.progress || 0) === 0);

  const getAnyActiveJobForVideo = (videoId: string) =>
    mergedJobs.find((j) => !cancelledJobIds.has(j.job_id) && j.source_video_id === videoId && !["cancelled", "failed"].includes(j.status));

  const handleCancelJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    try {
      // Optimistically mark as cancelled
      setCancelledJobIds(prev => {
        if (prev.has(jobId)) return prev;
        return new Set(prev).add(jobId);
      });
      window.dispatchEvent(new CustomEvent('olleey-job-cancelled', { detail: { jobId } }));

      await jobsAPI.cancelJob(jobId);
      patchJobOverride(jobId, { status: "cancelled", progress: 0 });
      toast("Job cancelled successfully", "success");
    } catch (err: any) {
      // Revert optimism on error
      setCancelledJobIds(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast(err.message || "Failed to cancel job", "error");
    }
  };

  const needsReviewJobs = mergedJobs.filter((j: any) => {
    if (cancelledJobIds.has(j.job_id)) return false;
    if (j.status !== "waiting_approval") return false;
    const progressReady = Number(j.progress || 0) > 0;
    const stageReady = j.current_stage === "completed";
    const reviewApproved = j?.workflow_state?.review?.status === "approved_manual";
    return progressReady || stageReady || reviewApproved;
  });
  const processingJobs = mergedJobs.filter(j =>
    !cancelledJobIds.has(j.job_id) &&
    ['pending', 'downloading', 'processing', 'transcribing', 'translating', 'voice_cloning', 'dubbing', 'lip_sync', 'uploading'].includes(j.status)
  );

  const enableAutoApprove = async () => {
    if (savingAutoApprove) return;
    setSavingAutoApprove(true);
    try {
      await settingsAPI.updateSettings({ auto_approve_jobs: true });
      setAutoApproveEnabled(true);
      toast("Auto-approve enabled for new detected uploads", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to enable auto-approve", "error");
    } finally {
      setSavingAutoApprove(false);
    }
  };

  const beginDetectedJob = async (videoId: string, jobId: string) => {
    if (startingJobId) return;
    const existingJob = mergedJobs.find((job) => job.job_id === jobId) || null;
    setStartingJobId(jobId);
    try {
      await jobsAPI.approveAndStart(jobId, { simulate: true });
      const startedJob = await jobsAPI
        .getJobById(jobId)
        .catch(() => (existingJob ? { ...existingJob, status: "pending" } : null));
      if (startedJob?.job_id) {
        upsertEphemeralJob({
          ...startedJob,
          status: "processing",
          progress: Math.max(10, Number(startedJob.progress || 0)),
          current_stage: (startedJob as any).current_stage || "processing",
        });
      } else if (existingJob?.job_id) {
        patchJobOverride(jobId, { status: "processing", progress: 10, current_stage: "processing" });
      }
      scheduleSimulationSectionUpdate(jobId);
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

  const createAndStartDetectedJob = async (video: any) => {
    if (creatingVideoId) return;
    const selectedLanguages = selectedLanguageByVideo[video.video_id] || [];
    const selectedMode = selectedModeByVideo[video.video_id] || "dubbing";
    const lipSyncLanguages = selectedMode === "lip_sync" ? selectedLanguages : [];
    const languageProcessingModes = Object.fromEntries(
      selectedLanguages.map((code) => [code, selectedMode])
    );
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
        include_lip_sync: lipSyncLanguages.length > 0,
        language_processing_modes: languageProcessingModes,
        lip_sync_languages: lipSyncLanguages,
        is_simulation: true,
      };
      if (projectId) {
        createPayload.project_id = projectId;
      }
      const createdJob = await jobsAPI.createJob(createPayload);
      if (createdJob?.job_id) {
        upsertEphemeralJob({
          ...createdJob,
          source_video_id: video.video_id,
          target_languages: selectedLanguages,
          project_id: projectId,
          status: "processing",
          progress: Math.max(10, Number(createdJob.progress || 0)),
          current_stage: (createdJob as any).current_stage || "processing",
          created_at: createdJob.created_at || new Date().toISOString(),
        });
        scheduleSimulationSectionUpdate(createdJob.job_id);
      }
      setDismissedDetectedVideoIds((prev) => (prev.includes(video.video_id) ? prev : [...prev, video.video_id]));
      setExpandingVideoId(null);
      toast(`Processing started for ${selectedLanguages.length} language${selectedLanguages.length === 1 ? "" : "s"}`, "success");
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

  const setLanguageSelectedForVideo = (videoId: string, languageCode: string, selected: boolean) => {
    setSelectedLanguageByVideo((prev) => {
      const current = prev[videoId] || [];
      if (!selected) {
        return { ...prev, [videoId]: current.filter((code) => code !== languageCode) };
      }
      return {
        ...prev,
        [videoId]: current.includes(languageCode) ? current : [...current, languageCode],
      };
    });
  };

  const setModeForVideo = (videoId: string, mode: ProcessingMode) => {
    setSelectedModeByVideo((prev) => ({ ...prev, [videoId]: mode }));
  };

  const saveDetectedUploadPreferences = (
    enabled: boolean,
    languages: string[],
    mode: ProcessingMode
  ) => {
    if (typeof window === "undefined") return;
    if (!enabled) {
      window.localStorage.removeItem(DETECTED_UPLOAD_PREFERENCES_KEY);
      setSavedPreferences(null);
      return;
    }
    const payload: StoredDetectedUploadPreferences = {
      enabled: true,
      languages,
      mode,
    };
    window.localStorage.setItem(DETECTED_UPLOAD_PREFERENCES_KEY, JSON.stringify(payload));
    setSavedPreferences({ languages, mode });
  };

  const applySavedPreferencesToVideo = (videoId: string) => {
    if (!rememberPreferences || !savedPreferences) return;
    if (savedPreferences.languages.length > 0) {
      setSelectedLanguageByVideo((prev) => {
        if ((prev[videoId] || []).length > 0) return prev;
        return { ...prev, [videoId]: savedPreferences.languages };
      });
    }
    setSelectedModeByVideo((prev) => {
      if (prev[videoId]) return prev;
      return { ...prev, [videoId]: savedPreferences.mode };
    });
  };

  const setRememberPreferencesForVideo = (videoId: string, checked: boolean) => {
    setRememberPreferences(checked);
    if (!checked) {
      saveDetectedUploadPreferences(false, [], "dubbing");
      return;
    }
    const languages = selectedLanguageByVideo[videoId] || [];
    const mode = selectedModeByVideo[videoId] || "dubbing";
    saveDetectedUploadPreferences(true, languages, mode);
  };

  const getSelectedLanguageCodes = (videoId: string) => {
    return selectedLanguageByVideo[videoId] || [];
  };

  const getJobLanguageNames = (codes?: string[]) => {
    if (!Array.isArray(codes) || codes.length === 0) return ["Spanish"];
    return codes.map((code) => LANGUAGE_OPTIONS.find((lang) => lang.code === code)?.name || code.toUpperCase());
  };
  const isSelectingDetectedLanguages = expandingVideoId !== null;

  useEffect(() => {
    const autoSyncGuardKey = `${userId || "anon"}:${selectedProject?.id || "all"}:${detectedUploadWindow}`;
    if (currentView === "detected_uploads") return;
    if (autoSyncRunGuard.has(autoSyncGuardKey)) {
      if (!autoSyncAttempted) setAutoSyncAttempted(true);
      return;
    }
    if (!userId || loading || allUserVideosLoading || autoSyncAttempted || autoSyncingDetected || detectedVideos.length > 0) return;

    let cancelled = false;
    const runAutoSync = async () => {
      autoSyncRunGuard.add(autoSyncGuardKey);
      setAutoSyncAttempted(true);
      setAutoSyncingDetected(true);
      try {
        const summary = await videosAPI.syncRecentDetectedUploads(getWindowDays(), 20);
        await Promise.all([refetchJobs(), refetchVideos(), refetchAllUserVideos()]);
        if (!cancelled && (summary.videos_seen > 0 || summary.jobs_created > 0)) {
          toast(`Detected uploads synced: ${summary.videos_seen} found`, "success");
        }
      } catch {
        // Silent fallback - user can still trigger sync from detected uploads view.
      } finally {
        if (!cancelled) setAutoSyncingDetected(false);
      }
    };

    runAutoSync();
    return () => {
      cancelled = true;
    };
  }, [currentView, userId, selectedProject?.id, detectedUploadWindow, loading, allUserVideosLoading, autoSyncAttempted, autoSyncingDetected, detectedVideos.length, refetchJobs, refetchVideos, refetchAllUserVideos, toast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DETECTED_UPLOAD_PREFERENCES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredDetectedUploadPreferences>;
      if (!parsed.enabled) return;
      const languages = Array.isArray(parsed.languages)
        ? parsed.languages.filter((code) => LANGUAGE_OPTIONS.some((lang) => lang.code === code))
        : [];
      const mode: ProcessingMode = parsed.mode === "lip_sync" ? "lip_sync" : "dubbing";
      setRememberPreferences(true);
      setSavedPreferences({ languages, mode });
    } catch {
      // Ignore malformed local preference state.
    }
  }, []);

  useEffect(() => {
    if (!rememberPreferences || !expandingVideoId) return;
    const languages = selectedLanguageByVideo[expandingVideoId] || [];
    const mode = selectedModeByVideo[expandingVideoId] || "dubbing";
    saveDetectedUploadPreferences(true, languages, mode);
  }, [rememberPreferences, expandingVideoId, selectedLanguageByVideo, selectedModeByVideo]);

  return (
    <div className={`h-full ${bgClass} flex flex-col p-6 space-y-6 overflow-hidden relative border ${isDark ? "border-white/5" : "border-gray-200/80"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border ${borderClass} ${isDark ? "hover:bg-white/5 hover:border-zinc-500" : "hover:bg-gray-100 hover:border-gray-400"} transition-all duration-200 active:scale-95`}
            title="Close sidebar"
          >
            <PanelRightClose className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </button>
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedTextClass} mb-1`}>Pipeline</span>
            <h3 className={`font-serif text-2xl ${textClass} tracking-tight`}>Live Status</h3>
          </div>
        </div>
        <button
          onClick={() => onViewChange?.("notifications")}
          className={`p-2 rounded-lg border ${borderClass} ${isDark ? "hover:bg-white/5 hover:border-zinc-500" : "hover:bg-gray-100 hover:border-gray-400"} transition-all duration-200 active:scale-95`}
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
        </button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar -mx-2 px-2 relative z-10">
        {/* Newly detected uploads awaiting start */}
        <div className="flex flex-col">
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between">
              <h4 className={`text-base font-semibold flex items-center gap-2 ${textClass} tracking-tight`}>
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                Detected Uploads ({detectedUploadWindow === "last_1_day" ? "Last 1 Day" : detectedUploadWindow === "last_31_days" ? "Last 31 Days" : "Last 7 Days"})
              </h4>
              <Button
                variant="outline"
                onClick={() => onViewChange?.("detected_uploads")}
                className={`h-7 px-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? "bg-transparent border-zinc-700 text-white/80 hover:bg-white/10" : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                See All
              </Button>
            </div>
            {!loading && (
              <span className={`block mt-1 text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>
                {detectedVideos.length} videos
              </span>
            )}
          </div>

          <div className={`mb-3 p-3 rounded-xl border ${borderClass} ${glassBgClass}`}>
            <p className={`text-[11px] ${mutedTextClass} mb-2`}>
              New videos were detected from your connected channel.
            </p>
            <Button
              onClick={enableAutoApprove}
              disabled={autoApproveEnabled || savingAutoApprove || settingsLoading}
              className={`w-full h-8 text-[10px] font-bold uppercase tracking-wider border ${autoApproveEnabled ? "bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-600" : isDark ? "bg-transparent border-gray-500 text-gray-300 hover:bg-white/5 hover:border-gray-400" : "bg-white border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500"}`}
            >
              {settingsLoading ? "Checking settings..." : autoApproveEnabled ? "Auto-Approve Enabled" : savingAutoApprove ? "Enabling..." : "Enable Auto-Approve"}
            </Button>
          </div>

          <div className="space-y-2">
            {loading || allUserVideosLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`h-20 rounded-xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                ))}
              </div>
            ) : detectedVideos.length > 0 ? (
              detectedVideos.map((video) => {
                const preStartJob = getPreStartJobForVideo(video.video_id);
                const hasAnyActiveJob = !!getAnyActiveJobForVideo(video.video_id);
                const canCreate = !preStartJob?.job_id && !hasAnyActiveJob;
                const thisJobStarting = preStartJob?.job_id ? startingJobId === preStartJob.job_id : false;
                const thisJobCreating = creatingVideoId === video.video_id;
                const isExpanded = expandingVideoId === video.video_id;
                const selectedLanguages = getSelectedLanguageCodes(video.video_id);
                const selectedMode = selectedModeByVideo[video.video_id] || "dubbing";
                return (
                  <div key={video.video_id} className={`relative p-3 rounded-xl border ${borderClass} ${glassBgClass}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.video_id}`, "_blank", "noopener,noreferrer")}
                      className={`absolute top-2 right-2 h-6 px-1 text-[10px] font-bold uppercase tracking-wider border-0 ${isDark ? "text-gray-300 hover:bg-transparent" : "text-gray-600 hover:bg-transparent"}`}
                    >
                      View
                    </Button>
                    <div className="flex gap-3 mb-2 pr-14">
                      <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                        {video?.thumbnail_url ? (
                          <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-semibold truncate ${textClass}`}>
                          {video?.title || video.video_id}
                        </p>
                        <p className={`text-[10px] ${mutedTextClass} truncate`}>
                          {video?.channel_name || video?.channel_id || "Connected channel"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {preStartJob?.job_id && (
                        <Button
                          onClick={() => beginDetectedJob(video.video_id, preStartJob.job_id)}
                          disabled={Boolean(startingJobId)}
                          className="w-full h-8 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          {thisJobStarting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
                          {thisJobStarting ? "Starting..." : "Begin Processing"}
                        </Button>
                      )}

                      {canCreate && !isExpanded && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            applySavedPreferencesToVideo(video.video_id);
                            setExpandingVideoId(video.video_id);
                          }}
                          className={`w-full h-8 text-[10px] font-bold uppercase tracking-wider ${isDark ? "bg-transparent border-gray-500 text-gray-300 hover:bg-white/5" : "bg-transparent border-gray-400 text-gray-700 hover:bg-gray-50"}`}
                        >
                          Select Languages
                        </Button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {isExpanded && canCreate && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className={`mt-2 p-2 rounded-lg border ${borderClass} ${isDark ? "bg-white/[0.02]" : "bg-white/70"}`}>
                            <div className="space-y-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-8 justify-between text-[11px] font-medium w-full"
                                  >
                                    Select Languages
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                  <DropdownMenuLabel>Target Languages</DropdownMenuLabel>
                                  {LANGUAGE_OPTIONS.map((lang) => (
                                    <DropdownMenuCheckboxItem
                                      key={lang.code}
                                      checked={selectedLanguages.includes(lang.code)}
                                      onSelect={(e) => e.preventDefault()}
                                      onCheckedChange={(checked) => setLanguageSelectedForVideo(video.video_id, lang.code, checked === true)}
                                    >
                                      {lang.flag} {lang.name}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {selectedLanguages.length > 0 && (
                                <div className={`space-y-2 rounded-md border ${borderClass} ${isDark ? "bg-white/[0.02]" : "bg-white/60"} p-2`}>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="h-5 text-[10px]">
                                      {selectedLanguages.length} selected
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-medium ${mutedTextClass}`}>Mode</span>
                                      <div className="inline-flex rounded-md border border-border overflow-hidden">
                                        <button
                                          type="button"
                                          className={`h-6 px-2 text-[9px] ${selectedMode === "dubbing" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                                          onClick={() => setModeForVideo(video.video_id, "dubbing")}
                                        >
                                          Dubbing
                                        </button>
                                        <button
                                          type="button"
                                          className={`h-6 px-2 text-[9px] border-l border-border ${selectedMode === "lip_sync" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                                          onClick={() => setModeForVideo(video.video_id, "lip_sync")}
                                        >
                                          Lip-sync
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                    {selectedLanguages.map((code) => {
                                      const lang = LANGUAGE_OPTIONS.find((option) => option.code === code);
                                      return (
                                        <Badge key={code} variant="secondary" className="text-[9px]">
                                          {lang?.flag} {lang?.name || code.toUpperCase()}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <label className={`flex items-center gap-2 text-[10px] ${mutedTextClass} cursor-pointer`}>
                                <Checkbox
                                  checked={rememberPreferences}
                                  onCheckedChange={(checked) =>
                                    setRememberPreferencesForVideo(video.video_id, checked === true)
                                  }
                                />
                                Remember my preferences for future uploads
                              </label>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider"
                                  onClick={() => setExpandingVideoId(null)}
                                  disabled={thisJobCreating}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider"
                                  onClick={() => createAndStartDetectedJob(video)}
                                  disabled={thisJobCreating || selectedLanguages.length === 0}
                                >
                                  {thisJobCreating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                  {thisJobCreating ? "Starting..." : "Start"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className={`p-6 rounded-2xl border border-dashed ${isDark ? "border-white/20 bg-white/[0.02]" : "border-gray-300 bg-gray-50/50"} flex flex-col items-center justify-center text-center`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? mutedTextClass : "text-gray-600"}`}>No new detections</p>
              </div>
            )}
          </div>

        </div>

        {!isSelectingDetectedLanguages && (
          <>
            {/* Table for videos that need review */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className={`text-base font-semibold flex items-center gap-2 ${textClass} tracking-tight`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                  Need Review
                </h4>
                {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>{needsReviewJobs.length} videos</span>}
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className={`h-16 rounded-xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                    ))}
                  </div>
                ) : needsReviewJobs.length > 0 ? (
                  needsReviewJobs.map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    return (
                      <motion.div
                        key={job.job_id}
                        whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                        onClick={() => {
                          console.log('[RightSidebar] Card clicked:', job.job_id, 'status:', job.status);
                          const firstTargetLang = job.target_languages?.[0] || "es";

                          // Set selected item
                          onSelectItem?.({ type: "job", id: job.job_id, data: job });

                          // Navigate based on job status
                          if (job.status === 'waiting_approval' || job.status === 'completed') {
                            console.log('[RightSidebar] Navigating to review');
                            handleReview(job, firstTargetLang);
                          } else if (['pending', 'downloading', 'processing', 'transcribing', 'translating', 'dubbing', 'voice_cloning', 'lip_sync', 'uploading'].includes(job.status)) {
                            console.log('[RightSidebar] Navigating to processing view');
                            onViewChange?.("processing");
                          } else {
                            console.log('[RightSidebar] Navigating to dashboard');
                            onViewChange?.("dashboard");
                          }
                        }}
                        className={`p-3 rounded-xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group ${isDark ? 'shadow-sm' : 'shadow-none'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                            {video?.thumbnail_url ? (
                              <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90 group-hover:opacity-100`}>
                              {getVideoTitleForJob(job)}
                            </span>

                            <div className="flex flex-wrap gap-1 mt-1.5 pb-1">
                              {job.target_languages?.map((lang: string) => (
                                <button
                                  key={lang}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReview(job, lang);
                                  }}
                                  className={`h-5 px-1.5 flex items-center gap-1 rounded-md text-[9px] font-bold transition-all hover:ring-1 hover:ring-primary/50 active:scale-95 ${isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-white"}`}
                                >
                                  <span>{getLanguageFlag(lang)}</span>
                                  {lang.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className={`p-8 rounded-3xl border border-dashed ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-300 bg-gray-50/50"} flex flex-col items-center justify-center text-center`}>
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? mutedTextClass : "text-gray-600"}`}>All caught up!</p>
                    <div className={`mt-4 w-10 h-10 rounded-full border ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-400 bg-white/60"} flex items-center justify-center`}>
                      <Clock className={`w-4 h-4 ${isDark ? "text-gray-600" : "text-gray-500"}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table for jobs processing */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className={`text-base font-semibold flex items-center gap-2 ${textClass} tracking-tight`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  Processing
                </h4>
                {!loading && <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"}`}>{processingJobs.length} active</span>}
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className={`h-20 rounded-2xl border ${borderClass} animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200/50"}`} />
                    ))}
                  </div>
                ) : processingJobs.length > 0 ? (
                  processingJobs.map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    const languageNames = getJobLanguageNames(job.target_languages);
                    return (
                      <motion.div
                        key={job.job_id}
                        whileHover={{ x: -4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                        onClick={() => {
                          console.log('[RightSidebar] Processing card clicked:', job.job_id, 'status:', job.status);
                          onSelectItem?.({ type: "job", id: job.job_id, data: job });

                          // Navigate based on job status
                          if (job.status === 'waiting_approval' || job.status === 'completed') {
                            console.log('[RightSidebar] Navigating to review');
                            const firstTargetLang = job.target_languages?.[0] || "es";
                            handleReview(job, firstTargetLang);
                          } else if (['pending', 'downloading', 'processing', 'transcribing', 'translating', 'dubbing', 'voice_cloning', 'lip_sync', 'uploading'].includes(job.status)) {
                            console.log('[RightSidebar] Navigating to processing view');
                            onViewChange?.("processing");
                          } else {
                            console.log('[RightSidebar] Navigating to dashboard');
                            onViewChange?.("dashboard");
                          }
                        }}
                        className={`p-3 rounded-xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group ${isDark ? 'shadow-sm' : 'shadow-none'}`}
                      >
                        <div className="flex gap-3 mb-3">
                          <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                            {video?.thumbnail_url ? (
                              <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Clock className={`w-3 h-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-[12px] font-semibold truncate ${textClass} opacity-90`}>
                              {getVideoTitleForJob(job)}
                            </span>
                            <span className={`text-[10px] ${isDark ? "text-gray-500 opacity-60" : "text-gray-500"} mt-0.5`}>
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {languageNames.slice(0, 3).map((name) => (
                                <Badge
                                  key={`${job.job_id}-${name}`}
                                  variant="secondary"
                                  className={`text-[9px] px-1.5 py-0 h-4 font-medium ${isDark ? "bg-white/10 text-gray-200 hover:bg-white/15" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                  {name}
                                </Badge>
                              ))}
                              {languageNames.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className={`text-[9px] px-1.5 py-0 h-4 font-medium ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                                >
                                  +{languageNames.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold uppercase tracking-tighter text-blue-400`}>
                              {job.status}
                            </span>
                            <span className={`text-[10px] font-mono ${isDark ? "text-white opacity-40" : "text-gray-600"}`}>
                              {job.progress}%
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleCancelJob(e, job.job_id)}
                              className="h-6 w-6 rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                              title="Cancel Job"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <div className={`w-full h-1 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-full overflow-hidden`}>
                            <motion.div
                              className="h-full bg-blue-500/50"
                              initial={{ width: 0 }}
                              animate={{ width: `${job.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className={`p-8 rounded-3xl border border-dashed ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-300 bg-gray-50/50"} flex flex-col items-center justify-center text-center`}>
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? mutedTextClass : "text-gray-600"}`}>Quiet for now</p>
                    <div className={`mt-4 w-10 h-10 rounded-full border ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-400 bg-white/60"} flex items-center justify-center`}>
                      <Play className={`w-4 h-4 ${isDark ? "text-gray-600" : "text-gray-500"}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>


    </div>
  );
}
