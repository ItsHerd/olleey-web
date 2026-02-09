"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { useDashboard } from "@/lib/useDashboard";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/useTheme";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/DemoContext";
import { useReview } from "@/lib/ReviewContext";
import { getFakeLocalizedText } from "@/lib/languages";
import {
  Loader2,
  Video,
  Search,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Radio,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  ChevronRight,
  TrendingUp,
  Shield,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  Globe,
  PlayCircle,
  HardDrive,
  ChevronDown,
  Filter
} from "lucide-react";
import { formatViews, getRelativeTime } from "@/lib/utils";
import type { Video as VideoType, MasterNode, LocalizationInfo } from "@/lib/api";
import { LocalizationStatus, JobStatus, VideoStatus } from "@/lib/schema";
import { motion, AnimatePresence } from "framer-motion";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { X } from "lucide-react";
import { OlleeyLoader } from "@/components/ui/OlleeyLoader";

type ViewMode = "grid" | "list";
type SortBy = "date" | "views" | "title" | "status";
type FilterStatus = "all" | "live" | "draft";



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    } as const
  }
};

interface AllMediaPageProps {
  channelGraph?: MasterNode[];
}

export default function AllMediaPage({ channelGraph = [] }: AllMediaPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedVideoId = searchParams.get("video_id");
  const { theme } = useTheme();
  const { selectedProject } = useProject();
  const { dashboard } = useDashboard();
  const { user, loading: authLoading } = useAuth();

  // Get userId from auth context
  const userId = user?.id;

  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    useMemo(() => {
      // Build query params - only user_id and optionally project_id
      const params: any = { user_id: userId };

      // Only add project filter if a SPECIFIC project is selected
      // If selectedProject is null/undefined (All Projects mode), don't filter by project
      if (selectedProject?.id) {
        params.project_id = selectedProject.id;
      }

      // NO channel filtering on All Media page

      return params;
    }, [selectedProject?.id, userId]),
    { enabled: !!userId && !authLoading }
  );
  const { isDemoMode, updateVideoState, refreshTrigger } = useDemo();

  // Helper to construct full URL for storage paths
  // Supabase videos should have complete URLs already
  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    // Already a complete URL (http/https or supabase storage)
    if (url.startsWith('http')) return url;
    // Fallback for any relative paths (shouldn't happen with Supabase)
    return url;
  };

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja", "it"]);
  const { openReview } = useReview();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);

  // Determine if we're in initial loading state
  const isInitialLoading = videosLoading && videos.length === 0;

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = async () => {
      console.log('[AllMediaPage] Refresh event received');
      await refetchVideos();
    };

    window.addEventListener('olleey-refresh', handleRefresh);
    return () => window.removeEventListener('olleey-refresh', handleRefresh);
  }, [refetchVideos]);

  // Auto-refetch immediately if library is empty after initial load
  useEffect(() => {
    if (!videosLoading && (!videos || videos.length === 0) && !hasAttemptedRefetch) {
      console.log('[AllMediaPage] Videos empty after load, triggering refetch');
      setHasAttemptedRefetch(true);
      refetchVideos();
    }
  }, [videosLoading, videos?.length, hasAttemptedRefetch, refetchVideos]);

  // Force initial fetch on mount - aggressive approach
  useEffect(() => {
    console.log('[AllMediaPage] Component mounted, triggering immediate fetch');
    console.log('[AllMediaPage] Current state:', {
      videosCount: videos?.length || 0,
      videosLoading,
      selectedProject: selectedProject?.id
    });

    // Always trigger refetch on mount to ensure fresh data
    const timer = setTimeout(() => {
      console.log('[AllMediaPage] Executing forced refetch on mount');
      refetchVideos();
    }, 50); // Very short delay, just enough to let component initialize

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Also refetch when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (!videos || videos.length === 0)) {
        console.log('[AllMediaPage] Page became visible, refetching');
        refetchVideos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [videos, refetchVideos]);

  // Handle scrolling to highlighted video
  useEffect(() => {
    if (highlightedVideoId && !videosLoading) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`video-${highlightedVideoId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightedVideoId, videosLoading]);

  // Theme classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";

  // Merge videos with their processing status / localizations
  const videosWithLocalizations = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    return videos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};

      // Map existing localizations from the video object
      if (video.localizations) {
        Object.entries(video.localizations).forEach(([lang, loc]) => {
          localizations[lang] = {
            status: loc.status as LocalizationStatus,
            progress: loc.status === LocalizationStatus.LIVE ? 100 : loc.status === LocalizationStatus.DRAFT ? 100 : 50,
            job_id: loc.job_id,
            video_url: (loc as any).video_url || (loc as any).storage_url,
          };
        });
      }

      // Overlay active jobs from dashboard for real-time state
      const recentJobs = dashboard?.recent_jobs || [];
      const translatedLanguages = video.translated_languages || [];

      (selectedLanguages || ['es', 'de', 'fr', 'pt', 'ja']).forEach(lang => {
        const activeJob = recentJobs.find(j =>
          j.source_video_id === video.video_id &&
          j.target_languages.includes(lang) &&
          j.status !== JobStatus.COMPLETED && j.status !== JobStatus.FAILED
        );

        if (activeJob) {
          const isDraftStatus = activeJob.status === JobStatus.WAITING_APPROVAL || activeJob.status === JobStatus.READY;
          localizations[lang] = {
            status: isDraftStatus ? LocalizationStatus.DRAFT : LocalizationStatus.PROCESSING,
            progress: activeJob.progress || (isDraftStatus ? 100 : 0),
            job_id: activeJob.job_id,
            video_url: (activeJob as any).video_url || (activeJob as any).storage_url,
          };
        } else if (translatedLanguages.includes(lang)) {
          if (!localizations[lang]) {
            localizations[lang] = {
              status: LocalizationStatus.LIVE,
              progress: 100,
            };
          }
        } else if (!localizations[lang]) {
          localizations[lang] = {
            status: LocalizationStatus.NOT_STARTED,
            progress: 0,
          };
        }
      });

      return { ...video, localizations };
    });
  }, [videos, selectedLanguages, dashboard, refreshTrigger]);

  const getOverallVideoStatus = (localizations: Record<string, LocalizationInfo>): FilterStatus | LocalizationStatus.QUEUED | LocalizationStatus.FAILED | LocalizationStatus.PROCESSING => {
    const statuses = Object.values(localizations).map(l => l.status);
    const activeStatuses = statuses.filter(s => s !== LocalizationStatus.NOT_STARTED);

    if (activeStatuses.length === 0) return "all";
    if (activeStatuses.some(s => s === LocalizationStatus.FAILED)) return LocalizationStatus.FAILED;
    if (activeStatuses.some(s => s === LocalizationStatus.PROCESSING)) return LocalizationStatus.PROCESSING;
    if (activeStatuses.some(s => s === LocalizationStatus.QUEUED)) return LocalizationStatus.QUEUED;
    if (activeStatuses.some(s => s === LocalizationStatus.DRAFT)) return "draft";
    if (activeStatuses.every(s => s === LocalizationStatus.LIVE)) return "live";
    return "all";
  };

  const filteredAndSortedVideos = useMemo(() => {
    // If videos are loading or empty, return empty
    if (!videosWithLocalizations || videosWithLocalizations.length === 0) return [];

    let filtered = [...videosWithLocalizations];

    // 1. Search Filter (keep for UX)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        (v.title && v.title.toLowerCase().includes(query)) ||
        (v.channel_name && v.channel_name.toLowerCase().includes(query))
      );
    }

    // 2. Status Filter - Show videos based on user selection
    // Include: live, draft, not-started (exclude: processing, queued, failed)
    filtered = filtered.filter(v => {
      const s = getOverallVideoStatus(v.localizations);
      const hasLive = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.LIVE);
      const hasDraft = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.DRAFT);
      const hasNotStarted = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.NOT_STARTED);

      // Filter by dropdown selection
      if (filterStatus === "all") {
        // Show live, draft, or not-started videos
        return hasLive || hasDraft || hasNotStarted;
      }

      if (filterStatus === "live") {
        return hasLive;
      }

      if (filterStatus === "draft") {
        return hasDraft;
      }

      return false;
    });

    // 3. Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime();
          break;
        case "views":
          comparison = (a.view_count || 0) - (b.view_count || 0);
          break;
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "status":
          const statusOrder: Record<string, number> = {
            [LocalizationStatus.LIVE]: 0,
            [LocalizationStatus.DRAFT]: 1,
            [LocalizationStatus.PROCESSING]: 2,
            [LocalizationStatus.QUEUED]: 3,
            [LocalizationStatus.FAILED]: 4,
            "all": 5
          };
          const aStatus = getOverallVideoStatus(a.localizations);
          const bStatus = getOverallVideoStatus(b.localizations);
          comparison = (statusOrder[aStatus as string] || 99) - (statusOrder[bStatus as string] || 99);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // 4. Unique check (safety)
    const seen = new Set();
    return filtered.filter(v => {
      if (seen.has(v.video_id)) return false;
      seen.add(v.video_id);
      return true;
    });
  }, [videosWithLocalizations, searchQuery, filterStatus, sortBy, sortOrder]);

  const stats = useMemo(() => {
    // Total: videos that are live, draft, or not-started
    const total = videosWithLocalizations.filter(v => {
      const hasLive = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.LIVE);
      const hasDraft = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.DRAFT);
      const hasNotStarted = Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.NOT_STARTED);
      return hasLive || hasDraft || hasNotStarted;
    }).length;
    const live = videosWithLocalizations.filter(v => Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.LIVE)).length;
    const draft = videosWithLocalizations.filter(v => Object.values(v.localizations || {}).some((l: any) => l.status === LocalizationStatus.DRAFT)).length;
    return { total, live, draft };
  }, [videosWithLocalizations]);

  const statsItems = [
    { label: "Archived Units", value: stats.total, icon: Video, color: isDark ? "text-white/40" : "text-slate-400", bg: isDark ? "bg-white/3" : "bg-slate-50", border: isDark ? "border-white/5" : "border-slate-200" },
    { label: "Distributed", value: stats.live, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10", pulse: true },
    { label: "Awaiting QA", value: stats.draft, icon: Sparkles, color: "text-olleey-yellow", bg: "bg-olleey-yellow/5", border: "border-olleey-yellow/10" }
  ];

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col pl-3 pr-6 pt-6 pb-20 overflow-y-auto custom-scrollbar`}>
      {/* Cinematic Header Section */}
      <div className={`relative pt-12 min-h-[300px] flex items-end group overflow-hidden ${isDark ? 'bg-[#0c0c0c] border-white/5 shadow-2xl' : 'bg-white border-black/5'} rounded-[2.5rem] border mb-10 mx-0 transition-colors duration-500`}>
        <img
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2000"
          className={`absolute inset-0 w-full h-full object-cover ${isDark ? 'brightness-[0.35]' : 'brightness-[1] opacity-10'} group-hover:scale-105 transition-all duration-[5000ms] ease-out`}
          alt="Media Banner"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#0c0c0c]' : 'from-white'} via-transparent to-transparent`} />
        <div className={`absolute inset-x-0 bottom-0 h-full bg-gradient-to-r ${isDark ? 'from-[#0c0c0c] via-[#0c0c0c]/40' : 'from-white via-white/10'} to-transparent`} />

        <div className="relative z-10 p-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-olleey-yellow/10 backdrop-blur-2xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.35em] text-olleey-yellow shadow-[0_0_40px_rgba(251,191,36,0.1)]">
                <Layers className="w-4 h-4 animate-pulse" /> Content Repository
              </div>
              <h1 className={`text-4xl md:text-6xl font-normal ${textClass} tracking-tighter leading-none transition-colors`}>
                All Assets
              </h1>
              <p className={`text-sm md:text-base ${textSecondaryClass} max-w-xl font-light tracking-tight opacity-60 leading-relaxed transition-colors`}>
                Centralized command for global content distribution. Monitor processing states, manage library metadata, and validate multilingual deployments.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden lg:flex flex-col items-end group">
                <div className={`flex items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity ${textClass}`}>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]">Cloud Volume</span>
                </div>
                <span className={`text-2xl font-normal ${textClass} tracking-tighter transition-colors`}>4.8 <span className={`text-xs font-bold ${isDark ? 'text-white/30' : 'text-black/30'} uppercase tracking-widest ml-1`}>PB</span></span>
              </div>
              <div className={`w-px h-12 ${isDark ? 'bg-white/5' : 'bg-black/5'} hidden lg:block`} />
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="h-14 px-10 bg-olleey-yellow text-black hover:bg-white hover:scale-105 font-black uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_20px_40px_rgba(251,191,36,0.2)] transition-all active:scale-[0.98] group"
              >
                <Plus className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Upload Video
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Stats Bar - Glassmorphic */}
      <div className={`flex flex-col gap-6 py-10 border-b ${isDark ? 'border-white/5 bg-transparent' : 'border-slate-200 bg-transparent'} mb-10`}>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statsItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${cardClass} border ${item.border} ${item.bg} rounded-[1.5rem] p-5 flex items-center justify-between group/card relative overflow-hidden transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100 hover:border-slate-300'}`}
            >
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20 group-hover:text-white/40' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-3xl font-normal tracking-tighter ${item.color.includes('white') ? (isDark ? 'text-white' : 'text-slate-900') : (item.color.includes('slate') ? (isDark ? 'text-white' : 'text-slate-900') : item.color)}`}>
                    {item.value}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${item.bg} border ${item.border} group-hover/card:scale-110 ${isDark ? 'group-hover/card:bg-white/5' : 'group-hover/card:bg-white'} transition-all duration-500`}>
                <item.icon className={`w-5 h-5 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Command-style Search */}
            <div className="relative min-w-[340px] group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/20' : 'text-slate-400'} group-focus-within:text-olleey-yellow transition-colors`} />
              <input
                type="text"
                placeholder="Search repository by title, connection or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-14 pr-6 py-4 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-2xl text-[13px] focus:ring-0 focus:border-olleey-yellow/30 transition-all outline-none font-light tracking-tight`}
              />
            </div>

            <div className={`h-10 w-px ${isDark ? 'bg-white/5' : 'bg-slate-200'} mx-2 hidden lg:block`} />

            {/* Dropdown Filter */}
            <div className="relative group/filter">
              <Filter className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/20' : 'text-slate-400'} pointer-events-none z-10`} />
              <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/20' : 'text-slate-400'} pointer-events-none z-10`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className={`appearance-none pl-14 pr-14 py-4 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'} border rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] focus:ring-0 focus:border-olleey-yellow/30 transition-all outline-none cursor-pointer min-w-[240px]`}
              >
                <option value="all" className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}>All Videos</option>
                <option value="live" className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}>Published</option>
                <option value="draft" className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}>Ready for Review</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className={`bg-transparent border-none text-[11px] font-black uppercase tracking-[0.1em] ${isDark ? 'text-white/60' : 'text-slate-600'} focus:ring-0 cursor-pointer hover:text-olleey-yellow transition-colors outline-none`}
              >
                <option value="date" className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>Date</option>
                <option value="views" className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>Views</option>
                <option value="title" className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>Title</option>
                <option value="status" className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${isDark ? 'bg-white/3 border-white/5 text-white/40 hover:text-white hover:bg-white/5' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <div className={`h-8 w-px ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />

            {/* View Scopes */}
            <div className={`flex items-center gap-1.5 p-1.5 ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-2xl border`}>
              <button
                onClick={() => setViewMode("grid")}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === "grid" ? (isDark ? 'bg-white/10' : 'bg-white shadow-sm') + ' text-olleey-yellow shadow-inner' : (isDark ? 'text-white/20 hover:text-white' : 'text-slate-400 hover:text-slate-900')}`}
              >
                <Grid3x3 className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === "list" ? (isDark ? 'bg-white/10' : 'bg-white shadow-sm') + ' text-olleey-yellow shadow-inner' : (isDark ? 'text-white/20 hover:text-white' : 'text-slate-400 hover:text-slate-900')}`}
              >
                <List className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content View with Framer Motion Stagger */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode + filterStatus + sortBy + sortOrder + searchQuery}
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="w-full mt-10 relative z-10"
        >
          {isInitialLoading ? (
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-20">
              <OlleeyLoader size={100} className="mb-8" />
              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olleey-yellow animate-pulse">Syncing Asset Metadata...</p>
                <p className={`text-[9px] font-medium uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-black/20'}`}>Olleey_Library_Node_01</p>
              </div>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mt-16 opacity-20 blur-[1px] pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`${cardClass} border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'} rounded-[2.5rem] overflow-hidden min-h-[320px]`}>
                    <div className={`aspect-video ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                    <div className="p-8 space-y-5">
                      <div className={`h-4 ${isDark ? 'bg-white/10' : 'bg-black/10'} rounded-full w-3/4`} />
                      <div className={`h-3 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-full w-1/2`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredAndSortedVideos.length === 0 ? (
            <div className={`border border-dashed ${isDark ? 'border-white/10 bg-white/[0.01]' : 'border-black/10 bg-slate-50/30'} rounded-[2.5rem] p-32 text-center mt-4`}>
              <div className={`p-6 ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'} inline-flex rounded-3xl mb-8 opacity-20`}>
                <Video className={`w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
              </div>
              <p className={`text-2xl font-normal ${isDark ? 'text-white' : 'text-black'} mb-3 tracking-tighter`}>Zero matching assets in scope</p>
              <p className={`text-sm ${textSecondaryClass} mb-10 max-w-sm mx-auto font-light leading-relaxed opacity-50`}>
                {searchQuery ? "Your active search filters are excluding all media. Try widening your capture parameters." : "Your content repository is currently offline or empty."}
              </p>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className={`h-12 px-10 ${isDark ? 'bg-white/5 border-white/10 text-white sm:hover:bg-olleey-yellow sm:hover:text-black sm:hover:border-olleey-yellow' : 'bg-black/5 border-black/10 text-black hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow'} border font-black uppercase tracking-widest rounded-full transition-all`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload First Video
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredAndSortedVideos.map((video) => {
                const status = getOverallVideoStatus(video.localizations);
                const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                return (
                  <motion.div
                    key={video.video_id}
                    id={`video-${video.video_id}`}
                    variants={itemVariants}
                    onClick={() => {
                      const status = getOverallVideoStatus(video.localizations);
                      const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === LocalizationStatus.LIVE);

                      if (status === LocalizationStatus.PROCESSING) {
                        // Navigate to Workflows page to see real-time progress
                        router.push(`/app?page=Workflows&video=${video.video_id}`);
                        return;
                      }

                      if (status === "draft") {
                        const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === LocalizationStatus.DRAFT) || "es";
                        const loc = video.localizations[langCode];
                        const fakeText = getFakeLocalizedText(langCode);
                        openReview({
                          videoId: loc?.job_id || video.video_id,
                          languageCode: langCode,
                          originalVideoUrl: getFullUrl((video as any).storage_url || (video as any).video_url),
                          dubbedVideoUrl: getFullUrl((loc as any).video_url || (loc as any).storage_url),
                          videoTitle: loc?.title || video.title || fakeText.title,
                          videoDescription: loc?.description || video.description || fakeText.description,
                          thumbnailUrl: getFullUrl(loc?.thumbnail_url || video.thumbnail_url),
                          isApproved: false,
                          approvedAt: (video as any).published_at
                        });
                      } else if (hasLive) {
                        const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === LocalizationStatus.LIVE) || "es";
                        const loc = video.localizations[langCode];
                        const fakeText = getFakeLocalizedText(langCode);
                        openReview({
                          videoId: loc?.job_id || video.video_id,
                          languageCode: langCode,
                          originalVideoUrl: getFullUrl((video as any).storage_url || (video as any).video_url),
                          dubbedVideoUrl: getFullUrl((loc as any).video_url || (loc as any).storage_url),
                          videoTitle: loc?.title || video.title,
                          videoDescription: loc?.description || video.description || fakeText.description,
                          thumbnailUrl: getFullUrl(loc?.thumbnail_url || video.thumbnail_url),
                          isApproved: true,
                          approvedAt: (video as any).published_at
                        });
                      } else {
                        router.push(`/app?page=Workflows&video=${video.video_id}`);
                      }
                    }}
                    className={`relative ${cardClass} border rounded-[2.5rem] overflow-hidden transition-all duration-500 group ${status === "processing" ? 'cursor-not-allowed opacity-80' : `cursor-pointer hover:border-olleey-yellow/30 ${isDark ? 'hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]' : ''} hover:-translate-y-2`} ${highlightedVideoId === video.video_id
                      ? 'border-olleey-yellow ring-1 ring-olleey-yellow/20 bg-olleey-yellow/[0.02]'
                      : borderClass
                      }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-white/[0.03] to-transparent' : 'from-black/[0.02] to-transparent'} pointer-events-none`} />

                    {/* High-fidelity Thumbnail with gloss effect */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={getFullUrl(video.thumbnail_url) || video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms] grayscale-[0.2] group-hover:grayscale-0"
                      />

                      {/* Interactive Reflection / Shimmer */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />

                      {/* Premium Status Micro-Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {hasLive && (
                          <div className={`px-3 py-1.5 bg-emerald-500/80 backdrop-blur-xl rounded-full flex items-center gap-2 ${isDark ? 'shadow-2xl' : ''} border border-emerald-400/20`}>
                            <Radio className="w-3 h-3 text-white animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
                          </div>
                        )}
                        {status === "draft" && (
                          <div className={`px-3 py-1.5 bg-olleey-yellow/90 backdrop-blur-xl rounded-full flex items-center gap-2 ${isDark ? 'shadow-2xl' : ''} border border-white/10`}>
                            <Sparkles className="w-3 h-3 text-black" />
                            <span className="text-[9px] font-black text-black uppercase tracking-widest">Needs QA</span>
                          </div>
                        )}
                        {status === LocalizationStatus.PROCESSING && (
                          <div className={`px-3 py-1.5 bg-blue-500/80 backdrop-blur-xl rounded-full flex items-center gap-2 ${isDark ? 'shadow-2xl' : ''} border border-white/10`}>
                            <Activity className="w-3 h-3 text-white animate-spin" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Syncing</span>
                          </div>
                        )}
                      </div>

                      {/* Action trigger overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                        <div className="w-14 h-14 bg-olleey-yellow rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.5)] transform scale-50 group-hover:scale-100 transition-transform duration-500">
                          <ChevronRight className="w-8 h-8 text-black stroke-[2.5px]" />
                        </div>
                      </div>

                      {typeof video.duration === 'number' && (
                        <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/80 backdrop-blur-lg rounded-lg border border-white/10 shadow-2xl">
                          <span className="text-[10px] font-black text-white/90 font-mono">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Area */}
                    <div className={`p-8 relative ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50'}`}>
                      <div className="space-y-2 mb-8">
                        <h3 className={`text-base font-normal ${textClass} group-hover:text-olleey-yellow transition-colors tracking-tight leading-snug line-clamp-2`}>
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textClass} opacity-20`}>
                            {video.channel_name || 'Generic'}
                          </span>
                        </div>
                      </div>

                      {/* Performance metrics micro-row */}
                      <div className={`flex items-center justify-between pb-6 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${textClass} opacity-10`}>Reach</span>
                          <span className={`text-sm font-bold ${textClass} opacity-40`}>{formatViews(video.view_count || 0)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${textClass} opacity-10`}>Age</span>
                          <span className={`text-sm font-medium ${textClass} opacity-40`}>{getRelativeTime(video.published_at)}</span>
                        </div>
                      </div>

                      {/* Language Fabric visualization */}
                      <div className="flex items-center justify-between pt-6">
                        <div className="flex items-center gap-1.5">
                          {Object.keys(video.localizations || {})
                            .filter(l => video.localizations?.[l]?.status !== 'not-started')
                            .slice(0, 5)
                            .map(lang => (
                                <div
                                  key={lang}
                                  className={`w-7 h-7 rounded-lg border ${isDark ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5 hover:bg-black/10'} flex items-center justify-center relative transition-colors`}
                                >
                                <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 ${isDark ? 'border-[#0c0c0c]' : 'border-white'} ${video.localizations?.[lang]?.status === LocalizationStatus.LIVE ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                  video.localizations?.[lang]?.status === LocalizationStatus.DRAFT ? 'bg-olleey-yellow' :
                                    'bg-blue-500 animate-pulse'
                                  }`} />
                              </div>
                            ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full border ${isDark ? 'border-white/5 text-white/20 hover:bg-white/5' : 'border-black/5 text-black/20 hover:bg-black/5'} hover:text-olleey-yellow`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Premium High-Gloss List View */
            <div className={`w-full ${isDark ? 'bg-[#0c0c0c]/40 border-white/10 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]' : 'bg-white border-slate-200'} backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className={isDark ? "bg-white/2" : "bg-slate-50 border-b border-slate-200"}>
                      <th className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20 border-white/5' : 'text-slate-500 border-slate-100'} border-b`}>Primary Asset</th>
                      <th className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20 border-white/5' : 'text-slate-500 border-slate-100'} border-b`}>Deployment State</th>
                      <th className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20 border-white/5' : 'text-slate-500 border-slate-100'} border-b`}>Localized Nodes</th>
                      <th className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20 border-white/5' : 'text-slate-500 border-slate-100'} border-b text-right`}>Traffic Index</th>
                      <th className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20 border-white/5' : 'text-slate-500 border-slate-100'} border-b text-right`}>Operations</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/[0.02]' : 'divide-slate-100'}`}>
                    {filteredAndSortedVideos.map((video) => {
                      const status = getOverallVideoStatus(video.localizations);
                      const activeLangs = Object.keys(video.localizations || {})
                        .filter(l => video.localizations?.[l]?.status !== 'not-started');
                      const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                      return (
                        <tr
                          key={video.video_id}
                          id={`video-row-${video.video_id}`}
                          className={`group transition-all duration-300 ${status === "processing" ? 'cursor-not-allowed opacity-80' : `cursor-pointer ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`} ${highlightedVideoId === video.video_id
                            ? 'bg-olleey-yellow/5 border-l-2 border-olleey-yellow'
                            : ''
                            }`}
                          onClick={() => {
                            const status = getOverallVideoStatus(video.localizations);
                            const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                            if (status === "processing") {
                              // Items processing in production pipeline should not be clickable
                              return;
                            }

                            if (status === "draft") {
                              const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === "draft") || "es";
                              const loc = video.localizations[langCode];
                              const fakeText = getFakeLocalizedText(langCode);
                              openReview({
                                videoId: loc?.job_id || video.video_id,
                                languageCode: langCode,
                                originalVideoUrl: getFullUrl((video as any).storage_url || (video as any).video_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                dubbedVideoUrl: getFullUrl((loc as any).video_url || (loc as any).storage_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                videoTitle: loc?.title || video.title || fakeText.title,
                                videoDescription: loc?.description || video.description || fakeText.description,
                                thumbnailUrl: getFullUrl(loc?.thumbnail_url || video.thumbnail_url),
                                isApproved: false,
                                approvedAt: (video as any).published_at
                              });
                            } else if (hasLive) {
                              const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === "live") || "es";
                              const loc = video.localizations[langCode];
                              const fakeText = getFakeLocalizedText(langCode);
                              openReview({
                                videoId: loc?.job_id || video.video_id,
                                languageCode: langCode,
                                originalVideoUrl: getFullUrl((video as any).storage_url || (video as any).video_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                dubbedVideoUrl: getFullUrl((loc as any).video_url || (loc as any).storage_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                videoTitle: loc?.title || video.title,
                                videoDescription: loc?.description || video.description || fakeText.description,
                                thumbnailUrl: getFullUrl(loc?.thumbnail_url || video.thumbnail_url),
                                isApproved: true,
                                approvedAt: (video as any).published_at
                              });
                            } else {
                              router.push(`/app?page=Workflows&video=${video.video_id}`);
                            }
                          }}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-6">
                              <div className={`p-4 rounded-3xl overflow-hidden aspect-video border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                <img
                                  src={getFullUrl(video.thumbnail_url) || video.thumbnail_url}
                                  className="w-full h-full object-cover rounded-xl opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                  alt={video.title}
                                />
                              </div>
                              <div className="min-w-0 space-y-1.5">
                                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-olleey-yellow transition-colors truncate tracking-tight`}>
                                  {video.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{video.channel_name || 'Generic'}</span>
                                  <span className={`text-[10px] font-medium ${isDark ? 'text-white/20' : 'text-slate-400'} italic`}>{getRelativeTime(video.published_at)}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Deployment State Status */}
                          <td className={`px-8 py-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} w-1/5`}>
                            <div className="flex flex-col gap-2">
                              {hasLive ? (
                                <div className="inline-flex items-center gap-2">
                                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-700'}`}>Live</span>
                                </div>
                              ) : status === "draft" ? (
                                <div className="inline-flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-olleey-yellow" />
                                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-700'}`}>In QA</span>
                                </div>
                              ) : status === "processing" ? (
                                <div className="inline-flex items-center gap-2">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-700'}`}>Syncing</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 opacity-40">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-slate-400'}`} />
                                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-500'}`}>Queued</span>
                                </div>
                              )}
                              <div className={`h-1 w-24 ${isDark ? 'bg-white/10' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                <div
                                  className={`h-full ${hasLive ? 'bg-emerald-500' : status === 'draft' ? 'bg-olleey-yellow' : status === 'processing' ? 'bg-blue-500' : isDark ? 'bg-white/20' : 'bg-slate-300'}`}
                                  style={{ width: hasLive ? '100%' : status === 'draft' ? '100%' : status === 'processing' ? '60%' : '0%' }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Localized Nodes */}
                          <td className={`px-8 py-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-1.5">
                              {/* Always show active langs first */}
                              {activeLangs.length > 0 ? (
                                activeLangs.slice(0, 4).map(lang => (
                                  <div
                                    key={lang}
                                    className={`w-6 h-6 rounded border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} flex items-center justify-center relative`}
                                    title={`Language: ${lang}`}
                                  >
                                    <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag || lang}</span>
                                    <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border ${isDark ? 'border-[#0c0c0c]' : 'border-white'} ${video.localizations?.[lang]?.status === "live" ? 'bg-emerald-500' :
                                      video.localizations?.[lang]?.status === "draft" ? 'bg-olleey-yellow' : 'bg-blue-500'}`} />
                                  </div>
                                ))
                              ) : (
                                <span className={`text-[10px] font-medium ${isDark ? 'text-white/20' : 'text-slate-400'} italic`}>No active nodes</span>
                              )}
                              {activeLangs.length > 4 && (
                                <div className={`w-6 h-6 rounded border ${isDark ? 'border-white/5 bg-white/5 text-white/40' : 'border-slate-200 bg-white text-slate-400'} flex items-center justify-center text-[9px] font-bold`}>
                                  +{activeLangs.length - 4}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Traffic Index */}
                          <td className={`px-8 py-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} text-right`}>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-base font-normal ${isDark ? 'text-white' : 'text-slate-900'} tracking-tighter`}>{formatViews(video.view_count || 0)}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-black font-mono tracking-tighter ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                                  {Math.floor(Math.random() * 90) + 10}%
                                </span>
                                <TrendingUp className={`w-3 h-3 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                              </div>
                            </div>
                          </td>

                          {/* Operations Actions */}
                          <td className={`px-8 py-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} text-right`}>
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const status = getOverallVideoStatus(video.localizations);
                                  const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                                  // Same logic as grid view click
                                  if (status === "processing") {
                                    router.push(`/app?page=Workflows&video=${video.video_id}`);
                                  } else if (status === "draft") {
                                    const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === "draft") || "es";
                                    const loc = video.localizations[langCode];
                                    const fakeText = getFakeLocalizedText(langCode);
                                    openReview({
                                      videoId: loc?.job_id || video.video_id,
                                      languageCode: langCode,
                                      originalVideoUrl: getFullUrl((video as any).storage_url || (video as any).video_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                      dubbedVideoUrl: getFullUrl((loc as any).video_url || (loc as any).storage_url) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                      videoTitle: loc?.title || video.title || fakeText.title,
                                      videoDescription: loc?.description || video.description || fakeText.description,
                                      thumbnailUrl: getFullUrl(loc?.thumbnail_url || video.thumbnail_url),
                                      isApproved: false,
                                      approvedAt: (video as any).published_at
                                    });
                                  } else {
                                    router.push(`/app?page=Workflows&video=${video.video_id}`);
                                  }
                                }}

                                className={`h-10 px-6 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30 hover:bg-white/5 hover:border-olleey-yellow/20 hover:text-olleey-yellow bg-transparent border-transparent' : 'text-white bg-black hover:bg-neutral-800 border-black shadow-lg shadow-black/10'} rounded-full border transition-all duration-300 group/btn`}
                              >
                                Manage Asset
                                <ChevronRight className={`w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform ${isDark ? '' : 'text-white'}`} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* High-Fidelity Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-6xl max-h-full ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/10'} border rounded-[3rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col`}
            >
              <div className={`flex items-center justify-between px-10 py-6 border-b ${isDark ? 'border-white/5 bg-black/50' : 'border-black/5 bg-white/50'}`}>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/40 hover:text-black hover:bg-black/10'} border flex items-center justify-center transition-all cursor-pointer`}
                  >
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'} tracking-tight`}>Upload Asset</h2>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-black/30'}`}>Global Content Ingestion Pipeline</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/40 hover:text-black hover:bg-black/10'} border flex items-center justify-center transition-all`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                <ManualProcessView
                  availableChannels={[
                    ...channelGraph.map(m => ({
                      id: m.channel_id,
                      name: m.channel_name,
                      language_code: m.language_code,
                      language_name: m.language_name,
                      is_master: true
                    })),
                    ...channelGraph.flatMap((master: any) =>
                      master.language_channels.map((lc: any) => ({
                        id: lc.channel_id,
                        name: lc.channel_name,
                        language_code: lc.language_code,
                        language_name: lc.language_name,
                        is_master: false
                      }))
                    )
                  ]}
                  projectId={selectedProject?.id}
                  onSuccess={() => {
                    setIsUploadModalOpen(false);
                    refetchVideos();
                  }}
                  onCancel={() => setIsUploadModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
