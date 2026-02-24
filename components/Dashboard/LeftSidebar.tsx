"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  User,
  Plus,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  ChevronLeft,
  HelpCircle,
  Globe,
  Share2,
  Sun,
  Moon,
  ChevronDown,
  Check,
  MoreHorizontal,
  Trash,
  Edit,
  Star,
  Play,
  Video,
  Pause,
  X,
  PanelLeftClose,
  Layers,
  Upload
} from "lucide-react";
import { ViewType } from "./DashboardLayout";
import { CreateProjectModal } from "@/components/ui/create-project-modal";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useDashboardChannels } from "@/lib/useDashboardChannels";
import { useDashboardConnections } from "@/lib/useDashboardConnections";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useVideos } from "@/lib/useVideos";
import { API_BASE_URL } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, getInitialsAvatar } from "@/lib/utils";
import { resolveClientUserId } from "@/lib/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { channelsAPI, youtubeAPI, LanguageChannel, YouTubeConnection } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";

interface LeftSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSelectItem: (item: any) => void;
  activeJobsCount: number;
  theme: string;
  onClose: () => void;
}

export function LeftSidebar({
  currentView,
  onViewChange,
  onSelectItem,
  activeJobsCount,
  theme,
  onClose
}: LeftSidebarProps) {
  const { user } = useAuth();
  const userId = resolveClientUserId(user?.id);
  const { projects, selectedProject, setSelectedProject } = useProject();
  const isDark = theme === "dark";

  const [editChannel, setEditChannel] = React.useState<LanguageChannel | null>(null);
  const [editConnection, setEditConnection] = React.useState<YouTubeConnection | null>(null);
  const [newLanguage, setNewLanguage] = React.useState("");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openSidebarSection, setOpenSidebarSection] = React.useState("channels");

  const { channels, loading: channelsLoading, refetch: refetchChannels } = useDashboardChannels({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId
  });

  const { jobs, loading: jobsLoading } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    limit: 10,
    enabled: !!userId
  });

  const { videos, loading: videosLoading } = useVideos({
    project_id: selectedProject?.id,
    user_id: userId,
  }, { enabled: !!userId });

  const { connections, loading: connectionsLoading, refetch: refetchConnections } = useDashboardConnections({
    enabled: !!userId
  });

  const handleUpdateChannelLanguage = async () => {
    if (!editChannel || !newLanguage) return;
    try {
      const apiChannelId = editChannel.channel_id || editChannel.id;
      await channelsAPI.updateChannel(apiChannelId, { language_code: newLanguage });
      setEditChannel(null);
      setNewLanguage("");
      refetchChannels();
    } catch (e) {
      console.error("Failed to update channel language", e);
    }
  };

  const handleUpdateConnectionLanguage = async () => {
    if (!editConnection || !newLanguage) return;
    try {
      await youtubeAPI.updateConnection(editConnection.connection_id, { language_code: newLanguage });
      setEditConnection(null);
      setNewLanguage("");
      refetchConnections();
    } catch (e) {
      console.error("Failed to update connection language", e);
    }
  };

  const handleChangeConnectionLanguage = async (connectionId: string, languageCode: string) => {
    try {
      await youtubeAPI.updateConnection(connectionId, { language_code: languageCode });
      refetchConnections();
    } catch (e) {
      console.error("Failed to update connection language", e);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Are you sure you want to remove this channel?")) return;
    try {
      await channelsAPI.deleteChannel(id);
      refetchChannels();
    } catch (e) {
      console.error("Failed to delete channel", e);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this distribution?")) return;
    try {
      await youtubeAPI.disconnectChannel(id);
      window.location.reload();
    } catch (e) {
      console.error("Failed to disconnect", e);
    }
  };

  const handleTogglePause = async (channel: LanguageChannel) => {
    try {
      const apiChannelId = channel.channel_id || channel.id;
      await channelsAPI.updateChannel(apiChannelId, { is_paused: !channel.is_paused });
      refetchChannels();
    } catch (e) {
      console.error("Failed to toggle pause", e);
    }
  };

  const handleSetPrimary = async (connectionId: string) => {
    try {
      await youtubeAPI.setPrimaryConnection(connectionId);
      await refetchConnections();
    } catch (e) {
      console.error("Failed to set primary", e);
    }
  };

  const getConnectionId = (connection: YouTubeConnection) =>
    connection.connection_id || (connection as any).id;

  const isConnectionExpired = (connection: YouTubeConnection) => {
    const rawExpiry =
      (connection as any).token_expiry ||
      (connection as any).token_expires_at ||
      (connection as any).status?.token_expires_at;
    if (!rawExpiry) return false;
    const expiryMs = new Date(rawExpiry).getTime();
    if (Number.isNaN(expiryMs)) return false;
    return Date.now() > expiryMs;
  };

  const isWebhookExpired = (connection: YouTubeConnection) => {
    if (connection.webhook_expired === true) return true;
    const rawExpiry = connection.webhook_expires_at;
    if (!rawExpiry) return false;
    const expiryMs = new Date(rawExpiry).getTime();
    if (Number.isNaN(expiryMs)) return false;
    return Date.now() > expiryMs;
  };

  const handleConnectNewChannel = async () => {
    try {
      const response = await youtubeAPI.initiateConnection(
        `${window.location.origin}/youtube/connect/success?connection_type=satellite&redirect_to=/dashboard`
      );
      if (response.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (e) {
      console.error("Failed to connect new channel", e);
    }
  };

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const getJobVideo = (videoId: string) => {
    return videos.find(v => v.video_id === videoId);
  };

  const navigateFromJob = (job: any) => {
    onSelectItem({ type: "job", id: job.job_id, data: job });
    if (job.status === "waiting_approval" || job.status === "completed") {
      onViewChange("review");
    } else if (["pending", "downloading", "processing", "transcribing", "translating", "dubbing", "voice_cloning", "lip_sync", "uploading"].includes(job.status)) {
      onViewChange("processing");
    } else {
      onViewChange("dashboard");
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const filteredVideos = isSearching
    ? videos.filter((video) =>
      [video.title, video.description, video.video_id]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(normalizedSearch))
    )
    : [];

  const filteredChannels = isSearching
    ? channels.filter((channel) =>
      [channel.channel_name, channel.language_name, channel.language_code]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(normalizedSearch))
    )
    : [];

  const filteredJobs = isSearching
    ? jobs.filter((job) => {
      const video = getJobVideo(job.source_video_id);
      return [
        video?.title,
        job.source_video_id,
        job.job_id,
        job.status,
        job.target_languages?.join(" "),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(normalizedSearch));
    })
    : [];
  const totalSearchResults = filteredVideos.length + filteredJobs.length + filteredChannels.length;

  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
  const glassBgClass = isDark ? "bg-white/[0.05]" : "bg-gray-100/50";
  const borderClass = isDark ? "border-zinc-700" : "border-gray-300";
  const searchPanelClass = isDark ? "bg-white/[0.02] border-white/10" : "bg-white/80 border-gray-200";
  const searchItemClass = isDark
    ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300";
  const sidebarBgClass = isDark ? "bg-[#111111]" : "bg-[#FAFAFA]";
  const accountName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const accountEmail = user?.email || "";
  const accountAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    getInitialsAvatar(accountName);

  return (
    <div
      className={cn(
        "w-[336px] h-full flex flex-col border shrink-0",
        sidebarBgClass,
        isDark ? "border-white/5" : "border-gray-200/80"
      )}
    >
      <div className="flex flex-col h-full p-4 relative overflow-hidden">
        {/* Header Profile */}
        <div className="flex items-center justify-between mb-8 relative z-10 px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-col cursor-pointer group">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {selectedProject?.name || "Workspace"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {user?.email?.split('@')[0] || "User"}
                </h2>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-lg shadow-lg border p-1 z-[100]">
              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 opacity-70">
                Change Instance
              </DropdownMenuLabel>
              <div className="space-y-1">
                <DropdownMenuItem
                  onClick={() => setSelectedProject(null)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                    selectedProject === null
                      ? (isDark ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary font-bold')
                      : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100/50')
                  )}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedProject === null ? 'bg-primary shadow-[0_0_8px_rgba(217,119,87,0.6)]' : (isDark ? 'bg-white/10' : 'bg-gray-300'))} />
                  <span className="truncate text-xs font-semibold font-mono">All Instances</span>
                  {selectedProject === null && <Check className="ml-auto w-3.5 h-3.5" />}
                </DropdownMenuItem>

                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                      selectedProject?.id === project.id
                        ? (isDark ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary font-bold')
                        : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100/50')
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full", selectedProject?.id === project.id ? 'bg-primary shadow-[0_0_8px_rgba(217,119,87,0.6)]' : (isDark ? 'bg-white/10' : 'bg-gray-300'))} />
                    <span className="truncate text-xs font-semibold font-mono">{project.name}</span>
                    {selectedProject?.id === project.id && <Check className="ml-auto w-3.5 h-3.5" />}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-primary hover:bg-primary/10 font-bold transition-all group/new"
              >
                <Plus className="w-4 h-4 group-hover/new:rotate-90 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest font-mono">Create New Instance</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border ${borderClass} ${isDark ? "hover:bg-white/5 hover:border-zinc-500" : "hover:bg-gray-100 hover:border-gray-400"} transition-all duration-200 active:scale-95`}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-6 z-10 px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search videos, channels, jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-10 border-border/70 bg-muted/20 rounded-lg focus-visible:ring-primary/20"
          />
        </div>

        {/* Quick actions */}
        <div className="px-2 mb-2 space-y-1">
          <button
            onClick={() => onViewChange("batch_upload")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all",
              currentView === "batch_upload"
                ? "bg-primary/10 border-primary/30 text-primary"
                : isDark
                  ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white/80 hover:bg-white/5"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            Batch Upload
            <span className={cn("ml-auto text-[10px] font-normal", isDark ? "text-white/25" : "text-gray-400")}>
              Up to 15 videos
            </span>
          </button>
          <button
            onClick={() => onViewChange("manual_workflow")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all",
              currentView === "manual_workflow"
                ? "bg-primary/10 border-primary/30 text-primary"
                : isDark
                  ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white/80 hover:bg-white/5"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            Single Upload
            <span className={cn("ml-auto text-[10px] font-normal", isDark ? "text-white/25" : "text-gray-400")}>
              1 video
            </span>
          </button>
        </div>

        {/* Sections Accordion */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-none relative z-10 space-y-4">
          {isSearching ? (
            <div className="space-y-3">
              <div className={cn("rounded-xl border p-3", searchPanelClass)}>
                <div className="flex items-center justify-between">
                  <p className={cn("text-[11px] font-semibold", textClass)}>Search results</p>
                  <Badge variant="secondary" className="h-5 text-[10px] font-medium">
                    {totalSearchResults}
                  </Badge>
                </div>
                <p className={cn("mt-1 truncate text-[10px]", mutedTextClass)}>
                  &quot;{searchQuery}&quot;
                </p>
              </div>

              {filteredVideos.length > 0 && (
                <div className={cn("space-y-1.5 rounded-xl border p-2.5", searchPanelClass)}>
                  <div className={`flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest ${mutedTextClass}`}>
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3 h-3" />
                      Videos
                    </span>
                    <span>{filteredVideos.length}</span>
                  </div>
                  {filteredVideos.slice(0, 8).map((video) => (
                    <button
                      key={video.video_id}
                      onClick={() => {
                        onSelectItem({ type: "video", id: video.video_id, data: video });
                        onViewChange("videos");
                      }}
                      className={cn(
                        "group w-full rounded-lg border p-2.5 text-left transition-all duration-200 flex items-center gap-2.5",
                        searchItemClass
                      )}
                    >
                      <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <Video className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${textClass}`}>{video.title || video.video_id}</p>
                        <p className={`text-[10px] truncate ${mutedTextClass}`}>ID: {video.video_id}</p>
                      </div>
                      <ChevronRight className={`ml-auto h-3.5 w-3.5 shrink-0 ${mutedTextClass} opacity-0 transition-opacity group-hover:opacity-100`} />
                    </button>
                  ))}
                </div>
              )}

              {filteredJobs.length > 0 && (
                <div className={cn("space-y-1.5 rounded-xl border p-2.5", searchPanelClass)}>
                  <div className={`flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest ${mutedTextClass}`}>
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-blue-500" />
                      Pipeline Runs
                    </span>
                    <span>{filteredJobs.length}</span>
                  </div>
                  {filteredJobs.slice(0, 8).map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    return (
                      <button
                        key={job.job_id}
                        onClick={() => navigateFromJob(job)}
                        className={cn(
                          "group w-full rounded-lg border p-2.5 text-left transition-all duration-200 flex items-center gap-2.5",
                          searchItemClass
                        )}
                      >
                        <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                          <Play className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${textClass}`}>{video?.title || job.source_video_id}</p>
                          <p className={`text-[10px] uppercase ${mutedTextClass}`}>{job.status.replace(/_/g, " ")} • {job.progress}%</p>
                        </div>
                        <ChevronRight className={`ml-auto h-3.5 w-3.5 shrink-0 ${mutedTextClass} opacity-0 transition-opacity group-hover:opacity-100`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredChannels.length > 0 && (
                <div className={cn("space-y-1.5 rounded-xl border p-2.5", searchPanelClass)}>
                  <div className={`flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest ${mutedTextClass}`}>
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-primary" />
                      Channels
                    </span>
                    <span>{filteredChannels.length}</span>
                  </div>
                  {filteredChannels.slice(0, 8).map((channel) => (
                    <div
                      key={channel.id}
                      className={cn(
                        "w-full rounded-lg border p-2.5 flex items-center gap-2.5",
                        searchItemClass
                      )}
                    >
                      <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <Radio className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${textClass}`}>{channel.channel_name}</p>
                        <p className={`text-[10px] truncate ${mutedTextClass}`}>
                          {channel.language_name || channel.language_code || "No language set"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalSearchResults === 0 && (
                <div className={`p-6 rounded-xl border border-dashed text-center ${borderClass}`}>
                  <p className={`text-xs ${mutedTextClass}`}>No results for "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openSidebarSection}
              onValueChange={(value) => setOpenSidebarSection(value)}
              className="space-y-1"
            >
              <AccordionItem value="channels" className="border-none">
                <AccordionTrigger
                  className={cn(
                    "text-xs font-bold hover:no-underline py-3 px-3.5 h-10 rounded-lg border transition-all [&>svg]:w-3.5 [&>svg]:h-3.5",
                    openSidebarSection === "channels"
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-primary" />
                    Channels
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 ml-2 pl-3 border-l border-border/50">
                  <div className="space-y-3">
                    {connectionsLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className={`h-12 rounded-lg border ${borderClass} animate-pulse bg-white/5`} />
                      ))
                    ) : connections.length > 0 ? (
                      connections.map((connection) => (
                        <motion.div
                          key={getConnectionId(connection)}
                          whileHover={{ x: 4 }}
                          className={cn(
                            "group w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-default shadow-sm",
                            isDark ? "bg-white/[0.05] border-white/5 hover:border-white/20" : "bg-white/50 border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full overflow-hidden">
                            <div className="relative shrink-0">
                              {connection.channel_avatar_url ? (
                                <img src={connection.channel_avatar_url} className={`w-8 h-8 rounded-lg object-cover border ${isDark ? "border-white/10" : "border-gray-200"}`} alt="" />
                              ) : (
                                <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} border flex items-center justify-center`}>
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                              )}
                              <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2", isDark ? 'border-[#0A0A0A]' : 'border-white', connection.is_primary ? 'bg-green-500' : 'bg-gray-500')} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={`text-[13px] font-medium ${textClass} truncate opacity-90 group-hover:opacity-100 transition-opacity leading-tight`}>
                                {connection.youtube_channel_name || connection.channel_name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                                {isConnectionExpired(connection) && (
                                  <>
                                    <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase tracking-widest">
                                      Expired
                                    </Badge>
                                    <span className={`${mutedTextClass} opacity-40`}>•</span>
                                  </>
                                )}
                                {isWebhookExpired(connection) && (
                                  <>
                                    <Badge variant="outline" className="h-4 px-1.5 text-[9px] uppercase tracking-widest border-amber-500/50 text-amber-500">
                                      Webhook Expired
                                    </Badge>
                                    <span className={`${mutedTextClass} opacity-40`}>•</span>
                                  </>
                                )}
                                {connection.video_count !== undefined && (
                                  <>
                                    <span className={`${mutedTextClass} opacity-70 whitespace-nowrap`}>
                                      {connection.video_count} videos
                                    </span>
                                    <span className={`${mutedTextClass} opacity-40`}>•</span>
                                  </>
                                )}
                                <span className={`${mutedTextClass} opacity-60`}>
                                  {connection.connection_type === 'master' ? 'Master' : 'Satellite'}
                                </span>
                                {connection.language_code && (
                                  <>
                                    <span className={`${mutedTextClass} opacity-40`}>•</span>
                                    <span className={`${mutedTextClass} opacity-70 uppercase`}>
                                      {connection.language_code}
                                    </span>
                                  </>
                                )}
                                {channels.filter(ch => ch.youtube_connection_id === connection.connection_id).length > 0 && (
                                  <>
                                    <span className={`${mutedTextClass} opacity-40`}>•</span>
                                    <span className={`${mutedTextClass} opacity-70`}>
                                      {channels.filter(ch => ch.youtube_connection_id === connection.connection_id).map(ch => ch.language_code).join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={`h-6 w-6 flex items-center justify-center rounded-full border ${borderClass} ${isDark ? "hover:border-zinc-500 hover:bg-white/10" : "hover:border-gray-300 hover:bg-gray-50"} transition-all shadow-sm`}>
                                <MoreHorizontal className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Connection Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {!connection.is_primary && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const connectionId = getConnectionId(connection);
                                    if (!connectionId) return;
                                    handleSetPrimary(connectionId);
                                  }}
                                >
                                  <Star className="w-3.5 h-3.5 mr-2" />
                                  Set as Primary
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Globe className="w-3.5 h-3.5 mr-2" />
                                  Change Language
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                  {LANGUAGE_OPTIONS.map((lang) => (
                                    <DropdownMenuItem
                                      key={lang.code}
                                      onClick={() => {
                                        const connectionId = getConnectionId(connection);
                                        if (!connectionId) return;
                                        handleChangeConnectionLanguage(connectionId, lang.code);
                                      }}
                                      className={cn(
                                        connection.language_code === lang.code && "bg-primary/10 font-semibold"
                                      )}
                                    >
                                      <span className="mr-2">{lang.flag}</span>
                                      <span>{lang.name}</span>
                                      {connection.language_code === lang.code && (
                                        <Check className="ml-auto w-3.5 h-3.5" />
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => {
                                  const connectionId = getConnectionId(connection);
                                  if (!connectionId) return;
                                  handleDisconnect(connectionId);
                                }}
                              >
                                <Trash className="w-3.5 h-3.5 mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      ))
                    ) : (
                      <div className={`p-8 text-center rounded-lg border border-dashed ${borderClass}`}>
                        <p className={`text-xs ${mutedTextClass}`}>No channels connected</p>
                      </div>
                    )}

                    <button
                      onClick={handleConnectNewChannel}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all mt-2",
                        isDark
                          ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white/80 hover:bg-white/5"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      Connect YouTube Channel
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="runs" className="border-none mt-1">
                <AccordionTrigger
                  className={cn(
                    "text-xs font-bold hover:no-underline py-3 px-3.5 h-10 rounded-lg border transition-all [&>svg]:w-3.5 [&>svg]:h-3.5",
                    openSidebarSection === "runs"
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                  onClick={() => onViewChange("dashboard")}
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-blue-500" />
                    Pipeline Runs
                    {activeJobsCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 text-[9px] font-bold">
                        {activeJobsCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 ml-2 pl-3 border-l border-border/50">
                  <div className="space-y-2.5">
                    {jobsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`h-16 rounded-xl border ${borderClass} animate-pulse bg-white/5`} />
                      ))
                    ) : jobs.length > 0 ? (
                      <>
                        {jobs.slice(0, 5).map((job) => {
                          const video = getJobVideo(job.source_video_id);
                          return (
                            <motion.div
                              key={job.job_id}
                              whileHover={{ x: 4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                              onClick={() => navigateFromJob(job)}
                              className={cn("p-3 rounded-xl border transition-all cursor-pointer group shadow-sm", isDark ? "bg-white/[0.05] border-white/5" : "bg-white/50 border-gray-200")}
                            >
                              <div className="flex gap-3 mb-2.5">
                                <div className={`w-16 aspect-video rounded-lg overflow-hidden ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-100 border border-gray-200"} shrink-0`}>
                                  {video?.thumbnail_url ? (
                                    <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Play className="w-3 h-3 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className={`text-[12px] font-semibold ${textClass} truncate opacity-90 group-hover:opacity-100`}>
                                    {video?.title || job.source_video_id}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`text-[10px] ${mutedTextClass} opacity-60`}>
                                      {job.target_languages?.join(' • ')}
                                    </span>
                                    {video?.duration && (
                                      <>
                                        <span className="text-[10px] text-gray-700">•</span>
                                        <span className={`text-[9px] font-mono ${mutedTextClass} opacity-60`}>
                                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${job.status === 'completed' ? 'bg-green-500' :
                                      job.status === 'failed' ? 'bg-red-500' :
                                        'bg-blue-500 animate-pulse'
                                      }`} />
                                    <span className={`text-[9px] ${mutedTextClass} font-bold uppercase tracking-widest opacity-60`}>
                                      {job.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] font-mono ${textClass} opacity-40`}>
                                    {job.progress}%
                                  </span>
                                </div>
                                {job.status !== 'completed' && job.status !== 'failed' && (
                                  <div className={`w-full h-1 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-full overflow-hidden`}>
                                    <motion.div
                                      className="h-full bg-blue-500/50"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${job.progress}%` }}
                                      transition={{ duration: 1 }}
                                    />
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                        {jobs.length > 5 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewChange("runs")}
                            className="w-full"
                          >
                            Show all
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewChange("batch_upload")}
                          className={cn(
                            "w-full gap-1.5",
                            currentView === "batch_upload"
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : ""
                          )}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Batch Upload
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewChange("manual_workflow")}
                          className={cn(
                            "w-full gap-1.5",
                            currentView === "manual_workflow"
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : ""
                          )}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Single Upload
                        </Button>
                      </>
                    ) : (
                      <div className={`p-6 rounded-xl border ${borderClass} border-dashed text-center ${isDark ? "opacity-60" : "opacity-80"}`}>
                        <p className={`text-xs ${mutedTextClass}`}>No recent activity</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="distributions" className="border-none mt-1">
                <AccordionTrigger
                  className={cn(
                    "text-xs font-bold hover:no-underline py-3 px-3.5 h-10 rounded-lg border transition-all [&>svg]:w-3.5 [&>svg]:h-3.5",
                    openSidebarSection === "distributions"
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-purple-500" />
                    Active Distributions
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 ml-2 pl-3 border-l border-border/50">
                  <div className="space-y-3">
                    {videosLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className={`h-12 rounded-xl border ${borderClass} animate-pulse bg-white/5`} />
                      ))
                    ) : videos.filter(v => (v.status as string) === 'published').slice(0, 5).length > 0 ? (
                      videos.filter(v => (v.status as string) === 'published').slice(0, 5).map((video) => (
                        <motion.div
                          key={video.video_id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            onSelectItem({ type: "video", id: video.video_id, data: video });
                            onViewChange("videos");
                          }}
                          className={cn("group w-full p-2.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer shadow-sm", isDark ? "bg-white/[0.05] border-white/5 hover:border-white/20" : "bg-white/50 border-gray-200 hover:border-gray-300")}
                        >
                          <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
                            {video.thumbnail_url ? (
                              <img src={getFullUrl(video.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-[13px] font-medium ${textClass} truncate opacity-90 group-hover:opacity-100 transition-opacity leading-tight`}>
                              {video.title}
                            </span>
                            <span className={`text-[10px] ${mutedTextClass} opacity-60`}>
                              {video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Recently published'}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className={`p-6 rounded-xl border ${borderClass} border-dashed text-center ${isDark ? "opacity-60" : "opacity-80"}`}>
                        <p className={`text-xs ${mutedTextClass}`}>No published videos</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        <div className="mt-auto pt-6 relative z-10 space-y-3 px-2">
          <button
            onClick={() => onViewChange("preferences")}
            className={cn(
              "w-full p-3 rounded-md border flex items-center gap-3 shadow-sm transition-all text-left",
              currentView === "preferences" || currentView === "settings" || currentView === "guardrails"
                ? "bg-primary/10 border-primary/30"
                : "bg-background border-border hover:border-primary/30 hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">Preferences</span>
              <span className="text-[10px] text-muted-foreground truncate">Settings and guardrails</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="uppercase tracking-wider">Open</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => onViewChange("account")}
            className={cn(
              "w-full p-3 rounded-md border flex items-center gap-3 shadow-sm transition-all text-left",
              currentView === "account"
                ? "bg-primary/10 border-primary/30"
                : "bg-background border-border hover:border-primary/30 hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
              <img
                src={accountAvatar}
                alt={accountName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">{accountName}</span>
              <span className="text-[10px] text-muted-foreground truncate">{accountEmail}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="uppercase tracking-wider">Account</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Edit Channel Language Dialog */}
      <Dialog open={!!editChannel} onOpenChange={(open) => !open && setEditChannel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel Language</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Language Code (e.g. 'es', 'fr')</Label>
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="es"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditChannel(null)}>Cancel</Button>
            <Button onClick={handleUpdateChannelLanguage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSuccess={() => {
          setIsCreateProjectModalOpen(false);
        }}
      />
    </div>
  );
}
