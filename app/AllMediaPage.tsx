"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/DemoContext";
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
  Layers,
  Sparkles
} from "lucide-react";
import { formatViews, getRelativeTime } from "@/lib/utils";
import type { Video as VideoType } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "grid" | "list";
type SortBy = "date" | "views" | "title" | "status";
type FilterStatus = "all" | "live" | "draft" | "processing";

interface LocalizationInfo {
  status: "live" | "draft" | "processing" | "not-started";
  progress: number;
  job_id?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AllMediaPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedProject } = useProject();
  const { dashboard } = useDashboard();
  const { videos, loading: videosLoading } = useVideos(
    selectedProject?.id ? { project_id: selectedProject.id } : {}
  );
  const { isDemoMode, updateVideoState, refreshTrigger } = useDemo();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages] = useState<string[]>(["es", "fr", "de", "pt", "ja", "it"]);

  // Theme classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";

  // Process videos with localizations
  const videosWithLocalizations = useMemo(() => {
    return videos.map(video => {
      const localizations: Record<string, LocalizationInfo> = {};

      // Check if backend provided localizations array (for demo users)
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
  }, [videos, selectedLanguages, dashboard?.recent_jobs]);

  const getOverallVideoStatus = (localizations: Record<string, LocalizationInfo>): FilterStatus => {
    const statuses = Object.values(localizations).map(l => l.status);
    const activeStatuses = statuses.filter(s => s !== "not-started");

    if (activeStatuses.length === 0) return "all";
    if (activeStatuses.some(s => s === "processing")) return "processing";
    if (activeStatuses.some(s => s === "draft")) return "draft";
    if (activeStatuses.every(s => s === "live")) return "live";
    return "all";
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videosWithLocalizations;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.channel_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(v => {
        const s = getOverallVideoStatus(v.localizations);
        if (filterStatus === "live") return s === "live" || Object.values(v.localizations || {}).some((l: any) => l.status === "live");
        return s === filterStatus;
      });
    }

    // Sort
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
          const statusOrder = { live: 0, draft: 1, processing: 2, all: 3 };
          const aStatus = getOverallVideoStatus(a.localizations);
          const bStatus = getOverallVideoStatus(b.localizations);
          comparison = statusOrder[aStatus] - statusOrder[bStatus];
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [videosWithLocalizations, searchQuery, filterStatus, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = videosWithLocalizations.length;
    const live = videosWithLocalizations.filter(v => Object.values(v.localizations || {}).some((l: any) => l.status === "live")).length;
    const draft = videosWithLocalizations.filter(v => getOverallVideoStatus(v.localizations) === "draft").length;
    const processing = videosWithLocalizations.filter(v => getOverallVideoStatus(v.localizations) === "processing").length;

    return { total, live, draft, processing };
  }, [videosWithLocalizations]);

  return (
    <div className={`w-full min-h-screen ${bgClass} flex flex-col pl-3 pr-6 pb-20`}>
      {/* Header with Mesh Gradient */}
      <div className="relative mb-8 pt-6 group overflow-hidden bg-black/5 border-b border-white/5 pb-8 -mx-6 px-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-olleey-yellow/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-olleey-yellow/10 border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-widest text-olleey-yellow mb-4">
                <Layers className="w-3.5 h-3.5" /> Media Library
              </div>
              <h1 className="text-3xl md:text-5xl font-normal text-white tracking-tighter mb-2 leading-none">
                All Assets
              </h1>
              <p className={`text-sm ${textSecondaryClass} max-w-lg font-light tracking-tight`}>
                Manage and monitor your global content library across all projects and connected channels.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-4 invisible md:visible">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Storage Used</span>
                <span className="text-xl font-normal text-white">4.2 TB</span>
              </div>
              <Button
                onClick={() => {
                  window.location.href = "/app?page=Manual Upload";
                }}
                className="h-12 px-6 bg-olleey-yellow text-black hover:bg-olleey-yellow/90 font-black uppercase tracking-widest rounded-none shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
                Upload New Video
              </Button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
            {[
              { label: "Total Assets", value: stats.total, icon: Video, color: "text-white/40", bg: "bg-white/5", border: "border-white/5" },
              { label: "Released", value: stats.live, icon: Radio, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", pulse: true },
              { label: "Pending Review", value: stats.draft, icon: CheckCircle, color: "text-olleey-yellow", bg: "bg-olleey-yellow/10", border: "border-olleey-yellow/20" },
              { label: "Processing", value: stats.processing, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${cardClass} border ${item.border} ${item.bg} rounded-none p-5 flex flex-col justify-between group/card relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -mr-8 -mt-8 rounded-full blur-2xl group-hover/card:bg-white/[0.05] transition-colors" />
                <div className="flex items-center justify-between relative z-10 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/card:text-white/60 transition-colors">
                    {item.label}
                  </span>
                  <div className={`p-2 rounded-none ${item.bg} border ${item.border}`}>
                    <item.icon className={`w-4 h-4 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className={`text-4xl font-normal ${item.color.includes('white') ? 'text-white' : item.color}`}>
                    {item.value}
                  </span>
                  <span className="text-[10px] text-white/20 font-black uppercase">Units</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-md py-4 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative min-w-[300px] group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-olleey-yellow transition-colors`} />
            <input
              type="text"
              placeholder="Filter library by title or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-none text-sm text-white focus:ring-0 focus:border-olleey-yellow/50 transition-all outline-none placeholder:text-white/20"
            />
          </div>

          <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />

          {/* Filters */}
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All" },
              { id: "live", label: "Live" },
              { id: "draft", label: "Needs Review" },
              { id: "processing", label: "Active Jobs" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${filterStatus === f.id
                  ? 'bg-olleey-yellow border-olleey-yellow text-black'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mr-2">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0 cursor-pointer hover:text-white"
            >
              <option value="date" className="bg-[#0a0a0a]">Date Published</option>
              <option value="views" className="bg-[#0a0a0a]">View Count</option>
              <option value="title" className="bg-[#0a0a0a]">Alphabetical</option>
              <option value="status" className="bg-[#0a0a0a]">Job Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-none">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-all ${viewMode === "grid" ? 'bg-olleey-yellow text-black' : 'text-white/40 hover:text-white'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-all ${viewMode === "list" ? 'bg-olleey-yellow text-black' : 'text-white/40 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode + filterStatus + sortBy + sortOrder + searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {videosLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-olleey-yellow/20 rounded-full animate-ping absolute inset-0" />
                <Loader2 className="w-16 h-16 animate-spin text-olleey-yellow relative z-10 stroke-[1px]" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mt-8">Syncing Cloud Media...</p>
            </div>
          ) : filteredAndSortedVideos.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-none p-24 text-center mt-4 bg-white/[0.02]">
              <div className="p-4 bg-white/5 border border-white/10 inline-flex rounded-sm mb-6 opacity-40">
                <Video className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-normal text-white mb-2 tracking-tight">Zero matching assets found</p>
              <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto font-light">
                {searchQuery ? "Your current filters are excluding all media. Try broadening your search terms." : "Your library is ready but empty. Connect a source to begin processing."}
              </p>
              <Button
                onClick={() => router.push("/app?page=Manual Upload")}
                className="h-11 px-8 bg-white/5 border border-white/20 text-white hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-widest rounded-none transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Initiate Upload
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedVideos.map((video) => {
                const status = getOverallVideoStatus(video.localizations);
                const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                return (
                  <motion.div
                    key={video.video_id}
                    variants={itemVariants}
                    onClick={() => router.push(`/app?page=Workflows&video=${video.video_id}`)}
                    className={`${cardClass} border border-white/5 rounded-none overflow-hidden cursor-pointer hover:border-olleey-yellow/40 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Thumbnail Area */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                      />

                      {/* Overlay Overlays */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {hasLive && (
                          <div className="px-2 py-1 bg-green-500/90 backdrop-blur-md rounded-none flex items-center gap-1 shadow-lg">
                            <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live</span>
                          </div>
                        )}
                        {status === "draft" && (
                          <div className="px-2 py-1 bg-olleey-yellow/90 backdrop-blur-md rounded-none flex items-center gap-1 shadow-lg">
                            <CheckCircle className="w-2.5 h-2.5 text-black" />
                            <span className="text-[8px] font-black text-black uppercase tracking-tighter">Review</span>
                          </div>
                        )}
                        {status === "processing" && (
                          <div className="px-2 py-1 bg-blue-500/90 backdrop-blur-md rounded-none flex items-center gap-1 shadow-lg">
                            <Clock className="w-2.5 h-2.5 text-white animate-spin" />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Running</span>
                          </div>
                        )}
                      </div>

                      {/* Duration Tag */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/90 backdrop-blur-sm rounded-none border border-white/10">
                          <span className="text-[9px] font-black text-white/80">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}

                      {/* Play Button Icon on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-150 group-hover:scale-100">
                        <div className="w-12 h-12 bg-olleey-yellow rounded-full flex items-center justify-center shadow-2xl">
                          <ChevronRight className="w-6 h-6 text-black" />
                        </div>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-5 border-t border-white/5 relative bg-white/[0.01]">
                      <div className="flex flex-col gap-1 mb-4">
                        <h3 className="text-sm font-bold text-white/90 truncate group-hover:text-olleey-yellow transition-colors tracking-tight">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {video.channel_name || 'Generic Source'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-white/20" />
                          <span className="text-[10px] font-medium text-white/30 lowercase">
                            {formatViews(video.view_count || 0)} views
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-white/30 lowercase italic">
                          {getRelativeTime(video.published_at)}
                        </span>
                      </div>

                      {/* Multi-language visualization */}
                      <div className="flex items-center gap-1 mt-4">
                        {Object.keys(video.localizations || {})
                          .filter(l => video.localizations?.[l]?.status !== 'not-started')
                          .slice(0, 6)
                          .map(lang => (
                            <div
                              key={lang}
                              className="w-5 h-5 rounded-full border border-white/5 bg-white/5 flex items-center justify-center relative group/lang"
                              title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                            >
                              <span className="text-[10px]">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                              <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${video.localizations?.[lang]?.status === 'live' ? 'bg-green-500' :
                                video.localizations?.[lang]?.status === 'draft' ? 'bg-olleey-yellow' :
                                  'bg-blue-500 animate-pulse'
                                }`} />
                            </div>
                          ))}
                        {Object.keys(video.localizations || {}).filter(l => video.localizations?.[l]?.status !== 'not-started').length > 6 && (
                          <span className="text-[8px] font-black text-white/20 ml-1">
                            +{Object.keys(video.localizations || {}).filter(l => video.localizations?.[l]?.status !== 'not-started').length - 6}
                          </span>
                        )}
                      </div>

                      {/* Demo Interactive Controls */}
                      {isDemoMode && Object.keys(video.localizations || {}).some(l => video.localizations?.[l]?.status !== 'not-started') && (
                        <div className="mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow/60 mb-2">Demo Controls</div>
                          <div className="flex flex-col gap-1">
                            {Object.keys(video.localizations || {})
                              .filter(l => video.localizations?.[l]?.status !== 'not-started')
                              .slice(0, 3)
                              .map(lang => {
                                const localization = video.localizations?.[lang];
                                if (!localization || !localization.job_id) return null;
                                
                                return (
                                  <div key={lang} className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-white/40 w-8">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                    {localization.status === 'processing' && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateVideoState(video.video_id, localization.job_id!, lang, 'draft')}
                                        className="h-6 px-2 text-[9px] bg-white/5 hover:bg-olleey-yellow hover:text-black"
                                      >
                                        → Draft
                                      </Button>
                                    )}
                                    {localization.status === 'draft' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => updateVideoState(video.video_id, localization.job_id!, lang, 'live')}
                                          className="h-6 px-2 text-[9px] bg-green-600 hover:bg-green-500"
                                        >
                                          ✓ Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => updateVideoState(video.video_id, localization.job_id!, lang, 'processing')}
                                          className="h-6 px-2 text-[9px] bg-white/5 hover:bg-blue-500"
                                        >
                                          ↻ Reprocess
                                        </Button>
                                      </>
                                    )}
                                    {localization.status === 'live' && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateVideoState(video.video_id, localization.job_id!, lang, 'draft')}
                                        className="h-6 px-2 text-[9px] bg-white/5 hover:bg-orange-500"
                                      >
                                        ← Unpublish
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Premium List View */
            <div className="w-full bg-white/[0.02] border border-white/10 rounded-none overflow-hidden overflow-x-auto shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Primary Asset Info</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Local Deployment</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Distributions</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Traffic</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredAndSortedVideos.map((video) => {
                    const status = getOverallVideoStatus(video.localizations);
                    const activeLangs = Object.keys(video.localizations || {})
                      .filter(l => video.localizations?.[l]?.status !== 'not-started');
                    const hasLive = Object.values(video.localizations || {}).some((l: any) => l.status === "live");

                    return (
                      <tr
                        key={video.video_id}
                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => router.push(`/app?page=Workflows&video=${video.video_id}`)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 aspect-video rounded-none overflow-hidden bg-black shrink-0 border border-white/5">
                              <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex items-end justify-end">
                                <span className="text-[8px] font-black text-white/60">{Math.floor((video.duration || 0) / 60)}:{(video.duration || 0) % 60}</span>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white group-hover:text-olleey-yellow transition-colors truncate tracking-tight mb-1">
                                {video.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                  {video.channel_name || 'Generic'}
                                </span>
                                <span className="text-white/10">•</span>
                                <span className="text-[10px] font-medium text-white/20 italic">
                                  {getRelativeTime(video.published_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            {hasLive && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
                              </div>
                            )}
                            {status === "draft" && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-olleey-yellow/10 border border-olleey-yellow/20 text-olleey-yellow">
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Review Required</span>
                              </div>
                            )}
                            {status === "processing" && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                <Clock className="w-2.5 h-2.5 animate-spin" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Global Syncing</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            {activeLangs.slice(0, 8).map(lang => (
                              <div
                                key={lang}
                                className="w-6 h-6 rounded-full border border-white/5 bg-white/5 flex items-center justify-center shadow-sm relative"
                                title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                              >
                                <span className="text-[10px]">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${video.localizations?.[lang]?.status === 'live' ? 'bg-green-500' :
                                  video.localizations?.[lang]?.status === 'draft' ? 'bg-olleey-yellow' :
                                    'bg-blue-500 animate-pulse'
                                  }`} />
                              </div>
                            ))}
                            {activeLangs.length > 8 && (
                              <span className="text-[9px] font-black text-white/20 ml-2">+{activeLangs.length - 8} MORE</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-white tracking-tight">{formatViews(video.view_count || 0)}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Organic Views</span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Button
                            variant="ghost"
                            className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-olleey-yellow hover:bg-white/5 rounded-none"
                          >
                            Open Workflow
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
