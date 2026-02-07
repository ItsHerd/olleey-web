"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { useDashboard } from "@/lib/useDashboard";
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
  HardDrive
} from "lucide-react";
import { formatViews, getRelativeTime } from "@/lib/utils";
import type { Video as VideoType } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "grid" | "list";
type SortBy = "date" | "views" | "title" | "status";
type FilterStatus = "all" | "live" | "draft" | "processing";

interface LocalizationInfo {
  status: "queued" | "live" | "draft" | "processing" | "not-started" | "failed";
  progress: number;
  job_id?: string;
  video_url?: string;
}

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

export default function AllMediaPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedProject } = useProject();
  const { dashboard } = useDashboard();
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos(
    selectedProject?.id ? { project_id: selectedProject.id } : {}
  );
  const { isDemoMode, updateVideoState, refreshTrigger } = useDemo();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja", "it"]);
  const { openReview } = useReview();

  const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);

  // Determine if we're in initial loading state
  const isInitialLoading = videosLoading && videos.length === 0;

  // Auto-refetch immediately if library is empty after initial load
  useEffect(() => {
    if (!videosLoading && (!videos || videos.length === 0) && !hasAttemptedRefetch) {
      setHasAttemptedRefetch(true);
      refetchVideos();
    }
  }, [videosLoading, videos?.length, hasAttemptedRefetch, refetchVideos]);

  // Theme classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";

  // Process videos with localizations
  const videosWithLocalizations = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    return videos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};

      if (Array.isArray(video.localizations) && video.localizations.length > 0) {
        video.localizations.forEach((loc: any) => {
          if (loc.language_code) {
            localizations[loc.language_code] = {
              status: loc.status as any,
              progress: loc.status === 'live' ? 100 : loc.status === 'draft' ? 100 : 50,
              job_id: loc.video_id,
            };
          }
        });

        selectedLanguages.forEach(lang => {
          if (!localizations[lang]) {
            localizations[lang] = {
              status: "not-started",
              progress: 0,
            };
          }
        });
      } else {
        const translatedLanguages = video.translated_languages || [];
        selectedLanguages.forEach(lang => {
          const activeJob = (dashboard?.recent_jobs || []).find(j =>
            j.source_video_id === video.video_id &&
            j.target_languages.includes(lang) &&
            j.status !== "completed" && j.status !== "failed"
          );

          if (activeJob) {
            localizations[lang] = {
              status: activeJob.status === "waiting_approval" ? "draft" : "processing",
              progress: activeJob.progress || 0,
              job_id: activeJob.job_id,
            };
          } else if (translatedLanguages.includes(lang)) {
            localizations[lang] = {
              status: "live",
              progress: 100,
            };
          } else {
            localizations[lang] = {
              status: "not-started",
              progress: 0,
            };
          }
        });
      }

      return { ...video, localizations };
    });
  }, [videos, selectedLanguages, dashboard, refreshTrigger]);

  const getOverallVideoStatus = (localizations: Record<string, LocalizationInfo>): FilterStatus | "queued" | "failed" => {
    const statuses = Object.values(localizations).map(l => l.status);
    const activeStatuses = statuses.filter(s => s !== "not-started");

    if (activeStatuses.length === 0) return "all";
    if (activeStatuses.some(s => s === "failed")) return "failed";
    if (activeStatuses.some(s => s === "processing")) return "processing";
    if (activeStatuses.some(s => s === "queued")) return "queued";
    if (activeStatuses.some(s => s === "draft")) return "draft";
    if (activeStatuses.every(s => s === "live")) return "live";
    return "all";
  };

  const filteredAndSortedVideos = useMemo(() => {
    const sourceVideos = videosWithLocalizations.length > 0
      ? videosWithLocalizations
      : videos.map(v => ({ ...v, localizations: {} as Record<string, LocalizationInfo> }));

    let filtered = sourceVideos;

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.channel_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(v => {
        const s = getOverallVideoStatus(v.localizations);
        if (filterStatus === "live") return s === "live" || Object.values(v.localizations || {}).some((l: any) => l.status === "live");
        return s === filterStatus;
      });
    }

    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
          break;
        case "views":
          comparison = (a.view_count || 0) - (b.view_count || 0);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          const statusOrder: Record<string, number> = { live: 0, draft: 1, processing: 2, queued: 3, failed: 4, all: 5 };
          const aStatus = getOverallVideoStatus(a.localizations);
          const bStatus = getOverallVideoStatus(b.localizations);
          comparison = statusOrder[aStatus] - statusOrder[bStatus];
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Deduplicate by video_id
    const seen = new Set();
    return filtered.filter(v => {
      if (seen.has(v.video_id)) return false;
      seen.add(v.video_id);
      return true;
    });
  }, [videosWithLocalizations, videos, searchQuery, filterStatus, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = videosWithLocalizations.length;
    const live = videosWithLocalizations.filter(v => Object.values(v.localizations || {}).some((l: any) => l.status === "live")).length;
    const draft = videosWithLocalizations.filter(v => getOverallVideoStatus(v.localizations) === "draft").length;
    const processing = videosWithLocalizations.filter(v => getOverallVideoStatus(v.localizations) === "processing").length;
    return { total, live, draft, processing };
  }, [videosWithLocalizations]);

  const statsItems = [
    { label: "Archived Units", value: stats.total, icon: Video, color: "text-white/40", bg: "bg-white/3", border: "border-white/5" },
    { label: "Distributed", value: stats.live, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10", pulse: true },
    { label: "Awaiting QA", value: stats.draft, icon: Sparkles, color: "text-olleey-yellow", bg: "bg-olleey-yellow/5", border: "border-olleey-yellow/10" },
    { label: "Sync Active", value: stats.processing, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" }
  ];

  return (
    <div className={`w-full h-full ${bgClass} flex flex-col pl-3 pr-6 pt-6 pb-20 overflow-y-auto custom-scrollbar`}>
      {/* Cinematic Header Section */}
      <div className="relative pt-12 min-h-[300px] flex items-end group overflow-hidden bg-[#0c0c0c] rounded-[2.5rem] border border-white/5 mb-10 mx-0 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2000"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-[5000ms] ease-out"
          alt="Media Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-r from-[#0c0c0c] via-[#0c0c0c]/40 to-transparent" />

        <div className="relative z-10 p-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-olleey-yellow/10 backdrop-blur-2xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.35em] text-olleey-yellow shadow-[0_0_40px_rgba(251,191,36,0.1)]">
                <Layers className="w-4 h-4 animate-pulse" /> Content Repository
              </div>
              <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tighter leading-none">
                All Assets
              </h1>
              <p className={`text-sm md:text-base ${textSecondaryClass} max-w-xl font-light tracking-tight opacity-60 leading-relaxed`}>
                Centralized command for global content distribution. Monitor processing states, manage library metadata, and validate multilingual deployments.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden lg:flex flex-col items-end group">
                <div className="flex items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]">Cloud Volume</span>
                </div>
                <span className="text-2xl font-normal text-white tracking-tighter">4.8 <span className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">PB</span></span>
              </div>
              <div className="w-px h-12 bg-white/5 hidden lg:block" />
              <Button
                onClick={() => router.push("/app?page=Manual Upload")}
                className="h-14 px-10 bg-olleey-yellow text-black hover:bg-white hover:scale-105 font-black uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_20px_40px_rgba(251,191,36,0.2)] transition-all active:scale-[0.98] group"
              >
                <Plus className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Ingest Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Stats Bar - Glassmorphic Sticky */}
      <div className="flex flex-col gap-6 sticky top-0 z-30 bg-dark-bg/60 backdrop-blur-2xl py-6 border-b border-white/5 -mx-6 px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${cardClass} border ${item.border} ${item.bg} rounded-[1.5rem] p-5 flex items-center justify-between group/card relative overflow-hidden transition-all hover:bg-white/5`}
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-3xl font-normal tracking-tighter ${item.color.includes('white') ? 'text-white' : item.color}`}>
                    {item.value}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${item.bg} border ${item.border} group-hover/card:scale-110 group-hover/card:bg-white/5 transition-all duration-500`}>
                <item.icon className={`w-5 h-5 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Command-style Search */}
            <div className="relative min-w-[340px] group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-olleey-yellow transition-colors`} />
              <input
                type="text"
                placeholder="Search repository by title, connection or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[13px] text-white focus:ring-0 focus:border-olleey-yellow/30 transition-all outline-none placeholder:text-white/10 font-light tracking-tight"
              />
            </div>

            <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />

            {/* Premium Pill Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/3 rounded-full border border-white/5">
              {[
                { id: "all", label: "Master Log" },
                { id: "live", label: "Live Hub" },
                { id: "draft", label: "QA Queue" },
                { id: "processing", label: "Active Sync" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 ${filterStatus === f.id
                    ? 'bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/20'
                    : 'text-white/30 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Sort Index</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-transparent border-none text-[11px] font-black uppercase tracking-[0.1em] text-white/60 focus:ring-0 cursor-pointer hover:text-olleey-yellow transition-colors outline-none"
              >
                <option value="date" className="bg-[#0a0a0a]">Temporal Sequence</option>
                <option value="views" className="bg-[#0a0a0a]">Audience Impact</option>
                <option value="title" className="bg-[#0a0a0a]">Alphanumeric</option>
                <option value="status" className="bg-[#0a0a0a]">Runtime State</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/3 border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <div className="h-8 w-px bg-white/5" />

            {/* View Scopes */}
            <div className="flex items-center gap-1.5 p-1.5 bg-black/20 rounded-2xl border border-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === "grid" ? 'bg-white/10 text-olleey-yellow shadow-inner' : 'text-white/20 hover:text-white'}`}
              >
                <Grid3x3 className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === "list" ? 'bg-white/10 text-olleey-yellow shadow-inner' : 'text-white/20 hover:text-white'}`}
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
          initial="hidden"
          animate="visible"
          className="w-full mt-10 relative z-10"
        >
          {isInitialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-pulse">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`${cardClass} border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[320px] bg-white/[0.02]`}>
                  <div className="aspect-video bg-white/5" />
                  <div className="p-8 space-y-5">
                    <div className="h-4 bg-white/10 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    <div className="flex gap-3 pt-4">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedVideos.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-[2.5rem] p-32 text-center mt-4 bg-white/[0.01]">
              <div className="p-6 bg-white/3 border border-white/5 inline-flex rounded-3xl mb-8 opacity-20">
                <Video className="w-12 h-12 text-white" />
              </div>
              <p className="text-2xl font-normal text-white mb-3 tracking-tighter">Zero matching assets in scope</p>
              <p className={`text-sm ${textSecondaryClass} mb-10 max-w-sm mx-auto font-light leading-relaxed opacity-50`}>
                {searchQuery ? "Your active search filters are excluding all media. Try widening your capture parameters." : "Your content repository is currently offline or empty."}
              </p>
              <Button
                onClick={() => router.push("/app?page=Manual Upload")}
                className="h-12 px-10 bg-white/5 border border-white/10 text-white hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-widest rounded-full transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Capture New Stream
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
                    variants={itemVariants}
                    onClick={() => {
                      if (status === "draft") {
                        const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === "draft") || "es";
                        const loc = video.localizations[langCode];
                        const fakeText = getFakeLocalizedText(langCode);
                        openReview({
                          videoId: loc?.job_id || video.video_id,
                          languageCode: langCode,
                          originalVideoUrl: (video as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                          dubbedVideoUrl: (loc as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                          videoTitle: fakeText.title,
                          videoDescription: fakeText.description,
                          isApproved: false,
                          approvedAt: (video as any).published_at
                        });
                      } else {
                        router.push(`/app?page=Workflows&video=${video.video_id}`);
                      }
                    }}
                    className={`relative ${cardClass} border border-white/5 rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 hover:border-olleey-yellow/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] group hover:-translate-y-2`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                    {/* High-fidelity Thumbnail with gloss effect */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms] grayscale-[0.2] group-hover:grayscale-0"
                      />

                      {/* Interactive Reflection / Shimmer */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />

                      {/* Premium Status Micro-Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {hasLive && (
                          <div className="px-3 py-1.5 bg-emerald-500/80 backdrop-blur-xl rounded-full flex items-center gap-2 shadow-2xl border border-emerald-400/20">
                            <Radio className="w-3 h-3 text-white animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
                          </div>
                        )}
                        {status === "draft" && (
                          <div className="px-3 py-1.5 bg-olleey-yellow/90 backdrop-blur-xl rounded-full flex items-center gap-2 shadow-2xl border border-white/10">
                            <Sparkles className="w-3 h-3 text-black" />
                            <span className="text-[9px] font-black text-black uppercase tracking-widest">Needs QA</span>
                          </div>
                        )}
                        {status === "processing" && (
                          <div className="px-3 py-1.5 bg-blue-500/80 backdrop-blur-xl rounded-full flex items-center gap-2 shadow-2xl border border-white/10">
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
                    <div className="p-8 relative bg-white/[0.01]">
                      <div className="space-y-2 mb-8">
                        <h3 className="text-base font-normal text-white group-hover:text-olleey-yellow transition-colors tracking-tight leading-snug line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                            {video.channel_name || 'Generic'}
                          </span>
                        </div>
                      </div>

                      {/* Performance metrics micro-row */}
                      <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Reach</span>
                          <span className="text-sm font-bold text-white/40">{formatViews(video.view_count || 0)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Age</span>
                          <span className="text-sm font-medium text-white/40">{getRelativeTime(video.published_at)}</span>
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
                                className="w-7 h-7 rounded-lg border border-white/5 bg-white/3 flex items-center justify-center relative hover:bg-white/10 transition-colors"
                              >
                                <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-[#0c0c0c] ${video.localizations?.[lang]?.status === 'live' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                  video.localizations?.[lang]?.status === 'draft' ? 'bg-olleey-yellow' :
                                    'bg-blue-500 animate-pulse'
                                  }`} />
                              </div>
                            ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-white/5 text-white/20 hover:text-olleey-yellow hover:bg-white/5"
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
            <div className="w-full bg-[#0c0c0c]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Primary Asset</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Deployment State</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Localized Nodes</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 text-right">Traffic Index</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredAndSortedVideos.map((video) => {
                      const status = getOverallVideoStatus(video.localizations);
                      const activeLangs = Object.keys(video.localizations || {})
                        .filter(l => video.localizations?.[l]?.status !== 'not-started');
                      const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                      return (
                        <tr
                          key={video.video_id}
                          className="group hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            if (status === "draft") {
                              const langCode = Object.keys(video.localizations || {}).find(l => video.localizations[l].status === "draft") || "es";
                              const loc = video.localizations[langCode];
                              const fakeText = getFakeLocalizedText(langCode);
                              openReview({
                                videoId: loc?.job_id || video.video_id,
                                languageCode: langCode,
                                originalVideoUrl: (video as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                dubbedVideoUrl: (loc as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                videoTitle: fakeText.title,
                                videoDescription: fakeText.description,
                                isApproved: false,
                                approvedAt: (video as any).published_at
                              });
                            } else {
                              router.push(`/app?page=Workflows&video=${video.video_id}`);
                            }
                          }}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-6">
                              <div className="relative w-32 aspect-video rounded-2xl overflow-hidden bg-black shrink-0 border border-white/5 group-hover:border-olleey-yellow/20 transition-all shadow-xl">
                                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-2.5">
                                  <span className="text-[10px] font-black text-white/40 font-mono tracking-tighter">
                                    {Math.floor((video.duration || 0) / 60)}:{(video.duration || 0) % 60}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 space-y-1.5">
                                <p className="text-sm font-bold text-white group-hover:text-olleey-yellow transition-colors truncate tracking-tight">
                                  {video.title}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">{video.channel_name || 'Generic'}</span>
                                  <div className="w-1 h-1 rounded-full bg-white/5" />
                                  <span className="text-[10px] font-medium text-white/20 italic">{getRelativeTime(video.published_at)}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-2">
                              {hasLive && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full w-fit">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Production Live</span>
                                </div>
                              )}
                              {status === "draft" && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-olleey-yellow/10 border border-olleey-yellow/20 text-olleey-yellow rounded-full w-fit">
                                  <Sparkles className="w-3 h-3" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Validation</span>
                                </div>
                              )}
                              {status === "processing" && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full w-fit">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Internal Processing</span>
                                </div>
                              )}
                              {(!hasLive && status === "all") && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">Offline Cache</span>
                              )}
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <div className="flex items-center -space-x-1.5">
                              {activeLangs.map(lang => (
                                <div
                                  key={lang}
                                  className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center relative shadow-lg group/lang"
                                  title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                                >
                                  <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[#0c0c0c] ${video.localizations?.[lang]?.status === 'live' ? 'bg-emerald-500' :
                                    video.localizations?.[lang]?.status === 'draft' ? 'bg-olleey-yellow' : 'bg-blue-500'}`} />
                                </div>
                              ))}
                              {activeLangs.length === 0 && (
                                <div className="w-8 h-8 rounded-full border border-dashed border-white/5 flex items-center justify-center opacity-20">
                                  <Globe className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-base font-normal text-white tracking-tighter">{formatViews(video.view_count || 0)}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">Audience Units</span>
                            </div>
                          </td>

                          <td className="px-8 py-6 text-right">
                            <Button
                              variant="ghost"
                              className="h-10 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-olleey-yellow hover:bg-white/5 rounded-full border border-transparent hover:border-olleey-yellow/20 group/btn"
                            >
                              {status === "draft" ? "Review Gate" : "Process Log"}
                              <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
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
    </div>
  );
}
