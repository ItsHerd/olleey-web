"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Trash2,
  Radio,
  ChevronRight,
  Search,
  X,
  ListVideo,
  Plus,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useSupabaseChannels } from "@/lib/useSupabase";
import { resolveClientUserId } from "@/lib/user";
import { videosAPI } from "@/lib/api";
import { ViewType } from "../DashboardLayout";

interface BatchUploadViewProps {
  theme: string;
  onViewChange: (view: ViewType) => void;
}

interface ChannelVideo {
  video_id: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  channel_name?: string;
  published_at?: string;
  view_count?: number;
}

type CardStatus = "ready" | "submitting" | "done" | "error";

interface BatchCard {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  editedTitle: string;
  editedDescription: string;
  status: CardStatus;
  errorMsg?: string;
}

const MAX_BATCH = 15;

type SourceMode = "channel" | "url" | "upload";

function extractVideoId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = trimmed.match(p);
      if (m?.[1]) return m[1];
    }
    return trimmed;
  } catch { return null; }
}

export function BatchUploadView({ theme, onViewChange }: BatchUploadViewProps) {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = resolveClientUserId(user?.id);
  const { toast } = useToast();
  const isDark = theme === "dark";

  // ── Channels ──────────────────────────────────────────────────
  const { channels: supabaseChannels, loading: channelsLoading } = useSupabaseChannels(
    userId,
    { project_id: selectedProject?.id },
    { enabled: !!userId }
  );
  const masterChannels = supabaseChannels.filter((c) => c.is_master);

  const [selectedChannelId, setSelectedChannelId] = React.useState<string>("");

  React.useEffect(() => {
    if (masterChannels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(masterChannels[0].channel_id);
    }
  }, [masterChannels, selectedChannelId]);

  // ── Channel videos ────────────────────────────────────────────
  const [channelVideos, setChannelVideos] = React.useState<ChannelVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = React.useState(false);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [videoSearch, setVideoSearch] = React.useState("");

  React.useEffect(() => {
    if (!selectedChannelId) { setChannelVideos([]); return; }
    let cancelled = false;
    const load = async () => {
      setLoadingVideos(true);
      setVideoError(null);
      setVideoSearch("");
      try {
        const res = await videosAPI.listVideos({ channel_id: selectedChannelId, page_size: 50, video_type: "original" });
        if (!cancelled) setChannelVideos(res?.videos ?? []);
      } catch (err: any) {
        if (!cancelled) setVideoError(err.message || "Failed to load videos");
      } finally {
        if (!cancelled) setLoadingVideos(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedChannelId]);

  // ── Source mode ───────────────────────────────────────────────
  const [sourceMode, setSourceMode] = React.useState<SourceMode>("channel");
  const [singleUrl, setSingleUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // ── Batch queue ───────────────────────────────────────────────
  const [batchCards, setBatchCards] = React.useState<BatchCard[]>([]);

  // ── Selection ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleVideo = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredVideos = channelVideos.filter((v) =>
    !videoSearch || (v.title || "").toLowerCase().includes(videoSearch.toLowerCase())
  );

  const availableForSelection = filteredVideos.filter(
    (v) => !batchCards.some((c) => c.video_id === v.video_id)
  );

  const allSelected =
    availableForSelection.length > 0 &&
    availableForSelection.every((v) => selectedIds.has(v.video_id));

  const toggleAll = () => {
    const slots = MAX_BATCH - batchCards.length;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const toSelect = availableForSelection.slice(0, slots).map((v) => v.video_id);
      setSelectedIds(new Set(toSelect));
    }
  };

  const updateCard = (id: string, patch: Partial<BatchCard>) =>
    setBatchCards((prev) => prev.map((c) => (c.video_id === id ? { ...c, ...patch } : c)));

  const removeCard = (id: string) => {
    setBatchCards((prev) => prev.filter((c) => c.video_id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleAddSelected = () => {
    const ch = masterChannels.find((c) => c.channel_id === selectedChannelId);
    const existingIds = new Set(batchCards.map((c) => c.video_id));
    const slots = MAX_BATCH - batchCards.length;

    const toAdd: BatchCard[] = channelVideos
      .filter((v) => selectedIds.has(v.video_id) && !existingIds.has(v.video_id))
      .slice(0, slots)
      .map((v) => ({
        video_id: v.video_id,
        title: v.title || "",
        description: v.description || "",
        thumbnail_url: v.thumbnail_url || "",
        channel_title: ch?.channel_name || "",
        editedTitle: v.title || "",
        editedDescription: v.description || "",
        status: "ready" as CardStatus,
      }));

    if (toAdd.length === 0) {
      toast("No new videos to add (duplicates or limit reached)", "info");
      return;
    }

    setBatchCards((prev) => [...prev, ...toAdd]);
    setSelectedIds(new Set());
    toast(`${toAdd.length} video${toAdd.length > 1 ? "s" : ""} added`, "success");
  };

  // ── Single URL add ─────────────────────────────────────────────
  const handleAddSingleUrl = () => {
    if (batchCards.length >= MAX_BATCH) { toast("Batch limit reached", "info"); return; }
    const vid = extractVideoId(singleUrl);
    if (!vid) { toast("Please enter a valid YouTube URL or video ID", "error"); return; }
    if (batchCards.some((c) => c.video_id === vid)) { toast("This video is already in the queue", "info"); return; }
    setBatchCards((prev) => [...prev, {
      video_id: vid,
      title: "",
      description: "",
      thumbnail_url: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
      channel_title: "",
      editedTitle: "",
      editedDescription: "",
      status: "ready" as CardStatus,
    }]);
    setSingleUrl("");
    toast("Video added to queue", "success");
  };

  // ── File upload ────────────────────────────────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = MAX_BATCH - batchCards.length;
    const added: BatchCard[] = [];
    for (let i = 0; i < Math.min(files.length, slots); i++) {
      const file = files[i];
      if (!file.type.startsWith("video/")) continue;
      const localId = `local_${Date.now()}_${i}`;
      added.push({
        video_id: localId,
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        thumbnail_url: "",
        channel_title: "Local Upload",
        editedTitle: file.name.replace(/\.[^.]+$/, ""),
        editedDescription: "",
        status: "ready" as CardStatus,
      });
    }
    if (added.length === 0) { toast("No valid video files found", "info"); return; }
    setBatchCards((prev) => [...prev, ...added]);
    toast(`${added.length} file${added.length > 1 ? "s" : ""} added to queue`, "success");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Languages ─────────────────────────────────────────────────
  const [targetLanguages, setTargetLanguages] = React.useState<string[]>([]);
  const toggleLanguage = (code: string) =>
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );

  // ── Submit ────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [batchDone, setBatchDone] = React.useState(false);

  const handleSubmit = async () => {
    if (!userId) { toast("Not authenticated", "error"); return; }
    if (targetLanguages.length === 0) { toast("Select at least one target language", "error"); return; }

    const ready = batchCards.filter((c) => c.status === "ready" || c.status === "error");
    if (ready.length === 0) return;

    setIsSubmitting(true);
    let ok = 0;

    for (const card of ready) {
      updateCard(card.video_id, { status: "submitting" });
      try {
        const { error } = await supabase.from("processing_jobs").insert({
          user_id: userId,
          project_id: selectedProject?.id || null,
          source_video_id: card.video_id,
          source_channel_id: selectedChannelId || "manual_batch",
          target_languages: targetLanguages,
          status: "pending",
          progress: 0,
          started_at: null,
          completed_at: null,
          custom_title: card.editedTitle || card.title || null,
          custom_description: card.editedDescription || card.description || null,
          workflow_state: {
            metadata_extraction: { status: "pending", progress: 0 },
            translations: Object.fromEntries(targetLanguages.map((l) => [l, { status: "pending", progress: 0 }])),
            video_dubbing: Object.fromEntries(targetLanguages.map((l) => [l, { status: "pending", progress: 0 }])),
            thumbnails: Object.fromEntries(targetLanguages.map((l) => [l, { status: "pending", progress: 0 }])),
          },
        });
        if (error) throw new Error(error.message);
        updateCard(card.video_id, { status: "done" });
        ok++;
      } catch (err: any) {
        updateCard(card.video_id, { status: "error", errorMsg: err.message });
      }
    }

    setIsSubmitting(false);
    if (ok > 0) {
      toast(`${ok} job${ok > 1 ? "s" : ""} queued for translation!`, "success");
      setBatchDone(true);
    }
  };

  // ── Derived ───────────────────────────────────────────────────
  const bg = isDark ? "bg-[#0A0A0A]" : "bg-[#F4F4F4]";
  const panelBg = isDark ? "bg-[#141414]/80 backdrop-blur-xl border-white/5" : "bg-white/90 backdrop-blur-md border-gray-200/60";
  const mutedText = isDark ? "text-white/40" : "text-gray-400";
  const readyCount = batchCards.filter((c) => c.status === "ready").length;
  const doneCount = batchCards.filter((c) => c.status === "done").length;

  // ── Done screen ───────────────────────────────────────────────
  if (batchDone && doneCount === batchCards.length && batchCards.length > 0) {
    return (
      <div className={cn("h-full overflow-y-auto flex items-center justify-center p-6 relative", bg)}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-center max-w-md px-8 py-12 rounded-[2rem] border shadow-2xl relative overflow-hidden", panelBg)}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className={cn("text-2xl font-bold mb-2 tracking-tight", isDark ? "text-white" : "text-gray-900")}>
            All Set!
          </h2>
          <p className={cn("text-sm mb-8 leading-relaxed", mutedText)}>
            {doneCount} video{doneCount > 1 ? "s are" : " is"} now being translated and dubbed.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl text-xs font-semibold"
              onClick={() => { setBatchCards([]); setBatchDone(false); setSelectedIds(new Set()); }}
            >
              New Batch
            </Button>
            <Button
              onClick={() => onViewChange("runs")}
              className="h-10 px-5 rounded-xl text-xs font-semibold gap-2"
            >
              <Rocket className="w-3.5 h-3.5" /> View Progress
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────
  return (
    <div className={cn("h-full overflow-hidden flex flex-col relative", bg)}>
      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-[30%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 overflow-hidden relative z-10 px-6 md:px-8 py-6">
        <div className={cn("mx-auto w-full max-w-7xl h-full flex overflow-hidden rounded-xl border", isDark ? "border-white/10" : "border-gray-200")}>


          {/* ── LEFT: Source Library ──────────────────────────────── */}
          <div className={cn("flex flex-col w-1/2 border-r overflow-hidden", isDark ? "border-white/5" : "border-gray-200/60")}>

            {/* Header + Source Toggle */}
            <div className={cn("px-6 py-5 border-b shrink-0", isDark ? "border-white/5" : "border-gray-200/60")}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <ListVideo className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold tracking-tight text-foreground">Your Videos</h2>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pl-6">
                    Pick the videos you want to dub
                  </p>
                </div>
              </div>

              {/* Source mode tabs */}
              <div className={cn("flex p-0.5 rounded-lg border", isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-gray-100")}>
                {(["channel", "url", "upload"] as SourceMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSourceMode(mode)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all",
                      sourceMode === mode
                        ? isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode === "channel" && <><Radio className="w-3 h-3" /> Channel</>}
                    {mode === "url" && <><LinkIcon className="w-3 h-3" /> YouTube URL</>}
                    {mode === "upload" && <><Upload className="w-3 h-3" /> Upload</>}
                  </button>
                ))}
              </div>
            </div>

            {sourceMode === "channel" ? (
              <>
                {/* Channel + Search */}
                <div className="px-6 py-4 space-y-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      {channelsLoading ? (
                        <div className="h-9 rounded-lg animate-pulse bg-muted" />
                      ) : masterChannels.length === 0 ? (
                        <button
                          onClick={() => {
                            // Trigger YouTube connect flow
                            const redirectUrl = `${window.location.origin}/youtube/connect/success?connection_type=master&redirect_to=/dashboard`;
                            import("@/lib/api").then(({ youtubeAPI }) => {
                              youtubeAPI.initiateConnection(redirectUrl).then((res) => {
                                if (res.auth_url) window.location.href = res.auth_url;
                              });
                            });
                          }}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 text-xs font-semibold rounded-lg px-3 py-2.5 border border-dashed transition-all",
                            isDark
                              ? "border-white/10 text-white/40 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                              : "border-gray-200 text-gray-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Connect a YouTube Channel
                        </button>
                      ) : (
                        <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterChannels.map((ch) => (
                              <SelectItem key={ch.channel_id} value={ch.channel_id}>
                                <span className="flex items-center gap-2">
                                  <Radio className="w-3 h-3 text-primary shrink-0" />
                                  {ch.channel_name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Badge variant={batchCards.length > 0 ? "default" : "secondary"} className="shrink-0 text-[10px] font-bold px-2.5 h-7 rounded-lg">
                      {batchCards.length}/{MAX_BATCH}
                    </Badge>
                  </div>

                  {selectedChannelId && !loadingVideos && channelVideos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                        <Input
                          value={videoSearch}
                          onChange={(e) => setVideoSearch(e.target.value)}
                          placeholder="Search videos…"
                          className="pl-9 h-9 text-xs"
                        />
                        {videoSearch && (
                          <button onClick={() => setVideoSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAll}
                        disabled={availableForSelection.length === 0 || batchCards.length >= MAX_BATCH}
                        className={cn("text-[10px] font-bold uppercase tracking-wider h-9 px-4 rounded-lg shrink-0",
                          allSelected && "bg-primary/10 border-primary text-primary")}
                      >
                        {allSelected ? "Clear" : "Select All"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Video Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  {loadingVideos ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Loading videos…</p>
                    </div>
                  ) : videoError ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                      <p className="text-sm text-destructive">{videoError}</p>
                    </div>
                  ) : !selectedChannelId ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                      <Radio className="w-12 h-12 stroke-[1px]" />
                      <p className="text-xs font-medium">Select a channel to browse</p>
                    </div>
                  ) : filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
                      <ListVideo className="w-8 h-8" />
                      <p className="text-xs font-medium">
                        {videoSearch ? `No videos matching "${videoSearch}"` : "No videos in this channel"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredVideos.map((video) => {
                        const alreadyAdded = batchCards.some((c) => c.video_id === video.video_id);
                        const isSelected = selectedIds.has(video.video_id);
                        const atLimit = batchCards.length >= MAX_BATCH;

                        return (
                          <motion.div layout key={video.video_id} className="group">
                            <button
                              onClick={() => !alreadyAdded && !atLimit && toggleVideo(video.video_id)}
                              disabled={alreadyAdded || (atLimit && !isSelected)}
                              className={cn(
                                "w-full text-left rounded-xl border overflow-hidden transition-all duration-200",
                                alreadyAdded
                                  ? "border-emerald-500/30 opacity-60 cursor-default"
                                  : isSelected
                                    ? "border-primary ring-2 ring-primary/20 shadow-lg -translate-y-0.5"
                                    : isDark
                                      ? "border-white/5 hover:border-white/15 hover:shadow-md"
                                      : "border-gray-200 hover:border-primary/30 hover:shadow-md"
                              )}
                            >
                              <div className="aspect-video relative overflow-hidden bg-muted">
                                {video.thumbnail_url ? (
                                  <img
                                    src={video.thumbnail_url}
                                    alt=""
                                    className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                                      alreadyAdded && "opacity-40 grayscale-[0.5]")}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="w-6 h-6 text-muted-foreground/20" />
                                  </div>
                                )}

                                {/* Selection check */}
                                <div className={cn(
                                  "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                  alreadyAdded ? "bg-emerald-500 border-emerald-500"
                                    : isSelected ? "bg-primary border-primary shadow-lg shadow-primary/30"
                                      : "bg-black/30 border-white/40 backdrop-blur-sm"
                                )}>
                                  {(isSelected || alreadyAdded) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>

                                {alreadyAdded && (
                                  <div className="absolute bottom-0 inset-x-0 py-1 bg-emerald-900/60 flex items-center justify-center">
                                    <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">In Queue</span>
                                  </div>
                                )}
                              </div>

                              <div className={cn("px-3 py-2", isDark ? "bg-[#161616]" : "bg-white")}>
                                <p className={cn("text-[11px] font-medium leading-snug line-clamp-2",
                                  isSelected ? "text-primary" : isDark ? "text-white/80" : "text-gray-800")}>
                                  {video.title || video.video_id}
                                </p>
                                {video.view_count != null && (
                                  <p className={cn("text-[10px] mt-0.5", mutedText)}>
                                    {video.view_count.toLocaleString()} views
                                  </p>
                                )}
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selection footer */}
                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 60, opacity: 0 }}
                      className={cn("px-6 py-3 border-t shrink-0 flex items-center justify-between",
                        isDark ? "bg-[#141414]/95 backdrop-blur-xl border-white/5" : "bg-white/95 backdrop-blur-xl border-gray-100")}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {selectedIds.size} video{selectedIds.size > 1 ? "s" : ""} selected
                      </span>
                      <Button size="sm" onClick={handleAddSelected} className="h-8 px-4 rounded-lg text-xs font-semibold gap-1.5">
                        Add to Queue <ChevronRight className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : sourceMode === "url" ? (
              /* ── Single URL Input ──────────────────────────── */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 space-y-4">
                  <Badge variant={batchCards.length > 0 ? "default" : "secondary"} className="text-[10px] font-bold px-2.5 h-7 rounded-lg">
                    {batchCards.length}/{MAX_BATCH}
                  </Badge>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">YouTube Video URL</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                        <Input
                          value={singleUrl}
                          onChange={(e) => setSingleUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && singleUrl.trim()) handleAddSingleUrl(); }}
                          placeholder="https://youtube.com/watch?v=..."
                          className="pl-9 h-9 text-xs font-mono"
                        />
                        {singleUrl && (
                          <button onClick={() => setSingleUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={handleAddSingleUrl}
                        disabled={!singleUrl.trim() || batchCards.length >= MAX_BATCH}
                        className="h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Paste a YouTube URL or video ID and press Add. You can keep adding more videos.
                    </p>
                  </div>
                </div>

                {/* Added URLs preview */}
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                  {batchCards.filter((c) => !c.channel_title || c.channel_title === "").length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">Added via URL</p>
                      {batchCards.filter((c) => !c.channel_title || c.channel_title === "").map((card) => (
                        <div key={card.video_id} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border",
                          isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-gray-50")}>
                          {card.thumbnail_url && (
                            <img src={card.thumbnail_url} alt="" className="w-14 h-8 rounded object-cover bg-muted shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground font-mono truncate flex-1">{card.video_id}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── File Upload ───────────────────────────────── */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 shrink-0">
                  <Badge variant={batchCards.length > 0 ? "default" : "secondary"} className="text-[10px] font-bold px-2.5 h-7 rounded-lg">
                    {batchCards.length}/{MAX_BATCH}
                  </Badge>
                </div>

                <div className="flex-1 px-6 pb-6 flex flex-col">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
                    className={cn(
                      "flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all min-h-[200px]",
                      dragOver
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : isDark
                          ? "border-white/10 hover:border-white/20 bg-white/[0.01]"
                          : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      dragOver ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Upload className={cn("w-6 h-6", dragOver ? "text-primary" : "text-muted-foreground/40")} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {dragOver ? "Drop files here" : "Drag & drop video files"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        or <span className="text-primary font-semibold">click to browse</span> your computer
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50">MP4, MOV, AVI, MKV supported</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Batch Queue ────────────────────────────────── */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Header */}
            <div className={cn("px-6 py-5 border-b flex items-center justify-between shrink-0",
              isDark ? "border-white/5" : "border-gray-200/60")}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Rocket className="w-4 h-4 text-violet-500" />
                  <h2 className="text-sm font-bold tracking-tight text-foreground">Dubbing Queue</h2>
                </div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pl-6">
                  {batchCards.length === 0 ? "No videos added yet" : `${readyCount} video${readyCount !== 1 ? "s" : ""} ready`}
                </p>
              </div>
              {batchCards.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setBatchCards([]); setSelectedIds(new Set()); }}
                  className="text-xs text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {batchCards.map((card, idx) => (
                  <motion.div
                    key={card.video_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "rounded-xl border overflow-hidden transition-all",
                      panelBg,
                      card.status === "done" && "border-emerald-500/30",
                      card.status === "error" && "border-destructive/30"
                    )}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-24 shrink-0">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                          {card.thumbnail_url ? (
                            <img src={card.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-4 h-4 text-muted-foreground/20" />
                            </div>
                          )}
                          {card.status === "submitting" && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            </div>
                          )}
                          {card.status === "done" && (
                            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={card.editedTitle}
                            onChange={(e) => updateCard(card.video_id, { editedTitle: e.target.value })}
                            placeholder="Title"
                            className="h-8 text-xs font-medium flex-1"
                            disabled={card.status === "done" || card.status === "submitting"}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeCard(card.video_id)}
                            disabled={card.status === "submitting"}
                            className="w-8 h-8 rounded-lg shrink-0 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground/40 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <Textarea
                          value={card.editedDescription}
                          onChange={(e) => updateCard(card.video_id, { editedDescription: e.target.value })}
                          placeholder="Description (optional)"
                          rows={2}
                          className="text-[11px] resize-none"
                          disabled={card.status === "done" || card.status === "submitting"}
                        />

                        {/* Status */}
                        {card.status === "error" && (
                          <span className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                            <AlertCircle className="w-3 h-3" /> {card.errorMsg || "Error"}
                          </span>
                        )}
                        {card.status === "done" && (
                          <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/40 text-emerald-500 px-2 rounded-md">
                            Queued
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {batchCards.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center select-none">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border">
                    <Plus className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-sm font-bold mb-1 opacity-70">No Videos Yet</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                    Choose videos from the left panel and add them here to get started.
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer: Language + Launch ────────────────────────── */}
            <AnimatePresence>
              {batchCards.length > 0 && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className={cn("px-6 py-5 border-t space-y-4 shrink-0",
                    isDark ? "bg-[#111] border-white/5" : "bg-white border-gray-100")}
                >
                  {/* Language selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Target Languages
                      </p>
                      {targetLanguages.length > 0 && (
                        <span className="text-[10px] font-bold text-primary">
                          {targetLanguages.length} selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGE_OPTIONS.filter((l) => l.code !== "en").map((lang) => {
                        const on = targetLanguages.includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            onClick={() => toggleLanguage(lang.code)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all",
                              on
                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                : isDark
                                  ? "border-white/8 text-white/40 hover:border-white/20 hover:text-white/70"
                                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                            )}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Launch */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || readyCount === 0 || targetLanguages.length === 0}
                      className={cn(
                        "h-11 flex-1 rounded-xl text-xs font-bold uppercase tracking-wider gap-2 transition-all active:scale-[0.98]",
                        targetLanguages.length > 0 && readyCount > 0
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                          : ""
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isSubmitting ? "Starting…" : `Start Dubbing ${readyCount} Video${readyCount !== 1 ? "s" : ""}`}
                    </Button>
                  </div>

                  {targetLanguages.length === 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-amber-500">
                      <AlertCircle className="w-3 h-3" /> Choose at least one language to translate into
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
