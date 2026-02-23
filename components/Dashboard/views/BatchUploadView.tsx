"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Trash2,
  Radio,
  ChevronDown,
  Search,
  X,
  ListVideo,
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
import { API_BASE_URL, videosAPI } from "@/lib/api";
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

type CardStatus = "ready" | "autofilling" | "submitting" | "done" | "error";

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
  aiApplied?: boolean;
}

const MAX_BATCH = 15;

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

  // Auto-select first channel
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
    toast(`${toAdd.length} video${toAdd.length > 1 ? "s" : ""} added to batch`, "success");
  };

  // ── Languages ─────────────────────────────────────────────────
  const [targetLanguages, setTargetLanguages] = React.useState<string[]>([]);
  const toggleLanguage = (code: string) =>
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );

  // ── AI autofill ───────────────────────────────────────────────
  const [isAutofilling, setIsAutofilling] = React.useState(false);

  const autofillAll = async () => {
    if (batchCards.length === 0) return;
    setIsAutofilling(true);
    setBatchCards((prev) => prev.map((c) => ({ ...c, status: "autofilling" as CardStatus })));
    try {
      const res = await fetch(`${API_BASE_URL}/batch/autofill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: batchCards.map((c) => ({
            video_id: c.video_id,
            title: c.editedTitle || c.title,
            description: c.editedDescription || c.description,
            thumbnail_url: c.thumbnail_url,
            channel_title: c.channel_title,
            url: `https://www.youtube.com/watch?v=${c.video_id}`,
          })),
          target_languages: targetLanguages,
          source_language: "en",
        }),
      });
      if (!res.ok) throw new Error("Autofill failed");
      const data = await res.json();
      const map: Record<string, { title: string; description: string }> = {};
      for (const v of data.videos ?? []) map[v.video_id] = { title: v.suggested_title, description: v.suggested_description };
      setBatchCards((prev) =>
        prev.map((c) => ({
          ...c,
          editedTitle: map[c.video_id]?.title ?? c.editedTitle,
          editedDescription: map[c.video_id]?.description ?? c.editedDescription,
          status: "ready" as CardStatus,
          aiApplied: true,
        }))
      );
      toast("AI autofill applied to all videos", "success");
    } catch (err: any) {
      setBatchCards((prev) => prev.map((c) => ({ ...c, status: "ready" as CardStatus })));
      toast(err.message || "Autofill failed", "error");
    } finally {
      setIsAutofilling(false);
    }
  };

  const autofillOne = async (videoId: string) => {
    const card = batchCards.find((c) => c.video_id === videoId);
    if (!card) return;
    updateCard(videoId, { status: "autofilling" });
    try {
      const res = await fetch(`${API_BASE_URL}/batch/autofill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: [{ video_id: card.video_id, title: card.editedTitle, description: card.editedDescription, thumbnail_url: card.thumbnail_url, channel_title: card.channel_title, url: `https://www.youtube.com/watch?v=${card.video_id}` }],
          target_languages: targetLanguages,
          source_language: "en",
        }),
      });
      if (!res.ok) throw new Error("Autofill failed");
      const data = await res.json();
      const v = data.videos?.[0];
      if (v) updateCard(videoId, { editedTitle: v.suggested_title, editedDescription: v.suggested_description, status: "ready", aiApplied: true });
      else updateCard(videoId, { status: "ready" });
    } catch {
      updateCard(videoId, { status: "ready" });
    }
  };

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

  // ── Styles ────────────────────────────────────────────────────
  const bg = isDark ? "bg-[#141414]" : "bg-[#F4F4F4]";
  const panelBg = isDark ? "bg-[#1A1A1A] border-white/8" : "bg-white border-gray-200";
  const inputCls = isDark ? "bg-[#111] border-white/10 text-white placeholder:text-white/30" : "";
  const mutedText = isDark ? "text-white/40" : "text-gray-400";

  const readyCount = batchCards.filter((c) => c.status === "ready").length;
  const doneCount = batchCards.filter((c) => c.status === "done").length;

  // ── Done screen ───────────────────────────────────────────────
  if (batchDone && doneCount === batchCards.length && batchCards.length > 0) {
    return (
      <div className={cn("h-full overflow-y-auto flex items-center justify-center", bg)}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>Batch Queued!</h2>
          <p className={cn("text-sm mb-8", mutedText)}>{doneCount} video{doneCount > 1 ? "s" : ""} are now in the pipeline.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setBatchCards([]); setBatchDone(false); setSelectedIds(new Set()); }}>
              New Batch
            </Button>
            <Button onClick={() => onViewChange("runs")} className="gap-2">
              <Rocket className="w-4 h-4" /> View Runs
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("h-full overflow-hidden flex flex-col", bg)}>
      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Channel browser ──────────────────────────── */}
        <div className={cn("flex flex-col w-[55%] border-r overflow-hidden", isDark ? "border-white/8" : "border-gray-200")}>

          {/* Channel selector */}
          <div className={cn("px-5 py-4 border-b shrink-0", isDark ? "border-white/8" : "border-gray-100")}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {channelsLoading ? (
                  <div className={cn("h-9 rounded-lg animate-pulse", isDark ? "bg-white/5" : "bg-gray-100")} />
                ) : masterChannels.length === 0 ? (
                  <div className={cn("text-sm rounded-lg px-3 py-2 border", isDark ? "border-white/8 text-white/40" : "border-gray-200 text-gray-400")}>
                    No source channels connected
                  </div>
                ) : (
                  <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                    <SelectTrigger className={cn("h-9", inputCls)}>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterChannels.map((ch) => (
                        <SelectItem key={ch.channel_id} value={ch.channel_id}>
                          <span className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-primary shrink-0" />
                            {ch.channel_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Batch count badge */}
              <Badge variant={batchCards.length > 0 ? "default" : "secondary"} className="shrink-0 text-xs">
                {batchCards.length} / {MAX_BATCH} queued
              </Badge>
            </div>

            {/* Search + select-all row */}
            {selectedChannelId && !loadingVideos && channelVideos.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5", mutedText)} />
                  <Input
                    value={videoSearch}
                    onChange={(e) => setVideoSearch(e.target.value)}
                    placeholder="Search videos…"
                    className={cn("pl-8 h-8 text-xs", inputCls)}
                  />
                  {videoSearch && (
                    <button onClick={() => setVideoSearch("")} className={cn("absolute right-2.5 top-1/2 -translate-y-1/2", mutedText)}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={toggleAll}
                  disabled={availableForSelection.length === 0 || batchCards.length >= MAX_BATCH}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0",
                    allSelected
                      ? "border-primary text-primary"
                      : isDark
                      ? "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                      : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                  )}
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
            )}
          </div>

          {/* Video grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingVideos && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className={cn("w-7 h-7 animate-spin", mutedText)} />
                <p className={cn("text-sm", mutedText)}>Loading videos…</p>
              </div>
            )}

            {videoError && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <p className="text-sm text-destructive">{videoError}</p>
              </div>
            )}

            {!loadingVideos && !videoError && !selectedChannelId && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Radio className={cn("w-10 h-10", mutedText)} />
                <p className={cn("text-sm", mutedText)}>Select a channel to browse videos</p>
              </div>
            )}

            {!loadingVideos && !videoError && selectedChannelId && filteredVideos.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <ListVideo className={cn("w-8 h-8", mutedText)} />
                <p className={cn("text-sm", mutedText)}>
                  {videoSearch ? `No videos matching "${videoSearch}"` : "No videos in this channel"}
                </p>
              </div>
            )}

            {!loadingVideos && !videoError && filteredVideos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {filteredVideos.map((video) => {
                  const alreadyAdded = batchCards.some((c) => c.video_id === video.video_id);
                  const isSelected = selectedIds.has(video.video_id);
                  const atLimit = batchCards.length >= MAX_BATCH;

                  return (
                    <motion.button
                      key={video.video_id}
                      layout
                      onClick={() => !alreadyAdded && !atLimit && toggleVideo(video.video_id)}
                      disabled={alreadyAdded || (atLimit && !isSelected)}
                      className={cn(
                        "relative rounded-xl border overflow-hidden text-left transition-all",
                        alreadyAdded
                          ? "opacity-50 cursor-default"
                          : atLimit && !isSelected
                          ? "opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "border-primary ring-2 ring-primary/25 shadow-md"
                          : isDark
                          ? "border-white/8 hover:border-white/25 hover:shadow-md"
                          : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted overflow-hidden relative">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}

                        {/* Selection indicator */}
                        <div className={cn(
                          "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          alreadyAdded
                            ? "bg-emerald-500 border-emerald-500"
                            : isSelected
                            ? "bg-primary border-primary"
                            : isDark
                            ? "bg-black/50 border-white/40"
                            : "bg-white/70 border-gray-400"
                        )}>
                          {(isSelected || alreadyAdded) && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>

                        {alreadyAdded && (
                          <div className="absolute bottom-0 inset-x-0 py-1 bg-emerald-900/60 flex items-center justify-center">
                            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">In Batch</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className={cn("px-3 py-2", isDark ? "bg-[#1E1E1E]" : "bg-white")}>
                        <p className={cn("text-[11px] font-medium leading-snug line-clamp-2", isDark ? "text-white/80" : "text-gray-800")}>
                          {video.title || video.video_id}
                        </p>
                        {video.view_count != null && (
                          <p className={cn("text-[10px] mt-0.5", mutedText)}>
                            {video.view_count.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add selected footer */}
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("px-5 py-3 border-t shrink-0 flex items-center justify-between gap-3", isDark ? "border-white/8 bg-[#1A1A1A]" : "border-gray-100 bg-gray-50")}
            >
              <span className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>
                {selectedIds.size} video{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <Button size="sm" onClick={handleAddSelected} className="gap-1.5">
                Add to Batch →
              </Button>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Batch queue ─────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Header */}
          <div className={cn("px-5 py-4 border-b shrink-0", isDark ? "border-white/8" : "border-gray-100")}>
            <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
              Batch Queue
            </h2>
            <p className={cn("text-[11px] mt-0.5", mutedText)}>
              {batchCards.length === 0
                ? "Select videos from your channel on the left"
                : `${readyCount} ready to launch`}
            </p>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {batchCards.map((card) => (
                <motion.div
                  key={card.video_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "rounded-xl border overflow-hidden",
                    panelBg,
                    card.status === "done" && "opacity-60",
                    card.status === "error" && "border-destructive/40"
                  )}
                >
                  {/* Thumbnail + title row */}
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                      {card.thumbnail_url ? (
                        <img src={card.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      {(card.status === "submitting" || card.status === "autofilling") && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}
                      {card.status === "done" && (
                        <div className="absolute inset-0 bg-emerald-900/70 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <Input
                          value={card.editedTitle}
                          onChange={(e) => updateCard(card.video_id, { editedTitle: e.target.value })}
                          placeholder="Title"
                          className={cn("h-7 text-xs font-medium flex-1", inputCls)}
                          disabled={card.status === "done" || card.status === "submitting"}
                        />
                        <button
                          onClick={() => autofillOne(card.video_id)}
                          disabled={card.status !== "ready"}
                          title="Autofill with AI"
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-lg border shrink-0 transition-all",
                            card.status === "autofilling"
                              ? "border-violet-500/40 bg-violet-500/10"
                              : isDark
                              ? "border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10"
                              : "border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                          )}
                        >
                          {card.status === "autofilling" ? (
                            <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-violet-400" />
                          )}
                        </button>
                        <button
                          onClick={() => removeCard(card.video_id)}
                          disabled={card.status === "submitting"}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-lg border shrink-0 transition-all",
                            isDark
                              ? "border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-white/30 hover:text-red-400"
                              : "border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500"
                          )}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <Textarea
                        value={card.editedDescription}
                        onChange={(e) => updateCard(card.video_id, { editedDescription: e.target.value })}
                        placeholder="Description (optional)"
                        rows={2}
                        className={cn("text-[11px] resize-none", inputCls)}
                        disabled={card.status === "done" || card.status === "submitting"}
                      />

                      {/* Status chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {card.aiApplied && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-500">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                        {card.status === "done" && (
                          <Badge variant="outline" className="text-[10px] h-4 border-emerald-500/40 text-emerald-500 px-1.5">Queued</Badge>
                        )}
                        {card.status === "error" && (
                          <span className="text-[10px] text-destructive flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />{card.errorMsg || "Error"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {batchCards.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                <ListVideo className={cn("w-10 h-10", mutedText)} />
                <p className={cn("text-sm text-center", mutedText)}>
                  Select videos from your channel<br />and add them here
                </p>
              </div>
            )}
          </div>

          {/* ── Controls footer ───────────────────────────────── */}
          {batchCards.length > 0 && (
            <div className={cn("px-5 py-4 border-t space-y-4 shrink-0", isDark ? "border-white/8 bg-[#181818]" : "border-gray-100 bg-gray-50/80")}>
              {/* Language pills */}
              <div>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", mutedText)}>
                  Target Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.filter((l) => l.code !== "en").map((lang) => {
                    const on = targetLanguages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all",
                          on
                            ? "bg-primary text-primary-foreground border-primary"
                            : isDark
                            ? "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
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

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={autofillAll}
                  disabled={isAutofilling || isSubmitting}
                  className="gap-1.5"
                >
                  {isAutofilling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-violet-500" />}
                  {isAutofilling ? "Autofilling…" : "Autofill All"}
                </Button>

                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isAutofilling || readyCount === 0 || targetLanguages.length === 0}
                  className="gap-1.5 ml-auto"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                  {isSubmitting ? "Launching…" : `Launch ${readyCount} Video${readyCount !== 1 ? "s" : ""}`}
                </Button>
              </div>

              {targetLanguages.length === 0 && (
                <p className="text-[11px] text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Pick at least one target language
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
