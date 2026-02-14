"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  User,
  Plus,
  Radio,
  Shield,
  ChevronRight,
  Sparkles,
  Clock,
  ChevronLeft,
  Settings,
  HelpCircle,
  Globe,
  Share2,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Home,
  Bell,
  MoreHorizontal,
  Trash,
  Edit,
  Star,
  Play,
  Video,
  Pause,
  X,
  PanelLeftClose,
  LogOut
} from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
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
import { cn } from "@/lib/utils";
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
  const { projects, selectedProject, setSelectedProject } = useProject();
  const isDark = theme === "dark";

  const [editChannel, setEditChannel] = React.useState<LanguageChannel | null>(null);
  const [editConnection, setEditConnection] = React.useState<YouTubeConnection | null>(null);
  const [newLanguage, setNewLanguage] = React.useState("");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { channels, loading: channelsLoading, refetch: refetchChannels } = useDashboardChannels({
    projectId: selectedProject?.id,
    user_id: user?.id,
    enabled: !!user?.id && !!user
  });

  const { jobs, loading: jobsLoading } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: user?.id,
    limit: 10,
    enabled: !!user?.id && !!user
  });

  const { videos, loading: videosLoading } = useVideos({
    project_id: selectedProject?.id,
    user_id: user?.id,
  }, { enabled: !!user?.id && !!user });

  const { connections, loading: connectionsLoading, refetch: refetchConnections } = useDashboardConnections({
    enabled: !!user?.id && !!user
  });

  const tabs = [
    { title: "Home", icon: Home },
    { title: "Messages", icon: Bell },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Guardrails", icon: Shield },
  ];

  const getSelectedIndex = () => {
    switch (currentView) {
      case "dashboard": return 0;
      case "notifications": return 1;
      case "settings": return 3;
      case "guardrails": return 4;
      default: return null;
    }
  };

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    const views: ViewType[] = ["dashboard", "notifications", "dashboard", "settings", "guardrails"];
    onViewChange?.(views[index]);
  };

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

  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
  const glassBgClass = isDark ? "bg-white/[0.05]" : "bg-gray-100/50";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";

  return (
    <div
      className={cn(
        "w-80 h-full flex flex-col border-r shrink-0",
        isDark ? "bg-[#09090b] border-white/5" : "bg-neutral-50 border-gray-200"
      )}
    >
      <div className="flex flex-col h-full p-4 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-50" />

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
            className={`p-2 rounded-lg border-2 ${borderClass} hover:bg-white/5 hover:border-white/20 transition-all duration-200 active:scale-95`}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative z-10 mb-6 px-2">
          <ExpandableTabs
            tabs={tabs}
            selected={getSelectedIndex()}
            activeColor="text-primary"
            className="border-border bg-muted/30"
            onChange={handleTabChange}
          />
        </div>

        <div className="relative mb-6 z-10 px-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search videos, channels, jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-10 border-border bg-muted/20 rounded-md focus-visible:ring-primary/20"
          />
        </div>

        {/* Sections Accordion */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-none relative z-10 space-y-4">
          {isSearching ? (
            <div className="space-y-4">
              {filteredVideos.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${mutedTextClass} flex items-center gap-1.5`}>
                    <Video className="w-3 h-3" />
                    Videos
                  </p>
                  {filteredVideos.slice(0, 8).map((video) => (
                    <button
                      key={video.video_id}
                      onClick={() => {
                        onSelectItem({ type: "video", id: video.video_id, data: video });
                        onViewChange("videos");
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-md border transition-all flex items-center gap-2.5",
                        isDark ? "bg-white/[0.05] border-white/10 hover:border-white/20" : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <Video className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${textClass}`}>{video.title || video.video_id}</p>
                        <p className={`text-[10px] truncate ${mutedTextClass}`}>{video.video_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredJobs.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${mutedTextClass} flex items-center gap-1.5`}>
                    <Play className="w-3 h-3 text-blue-500" />
                    Pipeline Runs
                  </p>
                  {filteredJobs.slice(0, 8).map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    return (
                      <button
                        key={job.job_id}
                        onClick={() => navigateFromJob(job)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-md border transition-all flex items-center gap-2.5",
                          isDark ? "bg-white/[0.05] border-white/10 hover:border-white/20" : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                          <Play className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${textClass}`}>{video?.title || job.source_video_id}</p>
                          <p className={`text-[10px] uppercase ${mutedTextClass}`}>{job.status.replace("_", " ")} • {job.progress}%</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredChannels.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${mutedTextClass} flex items-center gap-1.5`}>
                    <Radio className="w-3 h-3 text-primary" />
                    Channels
                  </p>
                  {filteredChannels.slice(0, 8).map((channel) => (
                    <div
                      key={channel.id}
                      className={cn(
                        "w-full p-2.5 rounded-lg border flex items-center gap-2.5",
                        isDark ? "bg-white/[0.05] border-white/10" : "bg-white border-gray-200"
                      )}
                    >
                      <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
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

              {filteredVideos.length === 0 && filteredJobs.length === 0 && filteredChannels.length === 0 && (
                <div className={`p-6 rounded-lg border border-dashed text-center ${borderClass}`}>
                  <p className={`text-xs ${mutedTextClass}`}>No results for "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={["channels", "runs"]} className="space-y-1">
              <AccordionItem value="channels" className="border-none">
                <AccordionTrigger
                  className="text-xs font-bold hover:no-underline py-2.5 px-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-all [&>svg]:w-3.5 [&>svg]:h-3.5"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-primary" />
                    Channels
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
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
                              <button className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${borderClass} ${isDark ? "hover:border-white/20 hover:bg-white/10" : "hover:border-gray-300 hover:bg-gray-50"} transition-all shadow-sm`}>
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
                      className={`w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider ${mutedTextClass} mt-2 py-3 rounded-xl border-2 border-dashed ${borderClass} hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 bg-transparent group`}
                    >
                      <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                      Connect New
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="runs" className="border-none mt-1">
                <AccordionTrigger
                  className="text-xs font-bold hover:no-underline py-2.5 px-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-all [&>svg]:w-3.5 [&>svg]:h-3.5"
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
                <AccordionContent className="pt-2">
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
                                <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
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
                                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
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
                      </>
                    ) : (
                      <div className={`p-6 rounded-xl border ${borderClass} border-dashed text-center opacity-60`}>
                        <p className={`text-xs ${mutedTextClass}`}>No recent activity</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="distributions" className="border-none mt-1">
                <AccordionTrigger className="text-xs font-bold hover:no-underline py-2.5 px-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-all [&>svg]:w-3.5 [&>svg]:h-3.5">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-purple-500" />
                    Active Distributions
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {videosLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className={`h-12 rounded-xl border ${borderClass} animate-pulse bg-white/5`} />
                      ))
                    ) : videos.filter(v => v.status === 'published').slice(0, 5).length > 0 ? (
                      videos.filter(v => v.status === 'published').slice(0, 5).map((video) => (
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
                      <div className={`p-6 rounded-xl border ${borderClass} border-dashed text-center opacity-60`}>
                        <p className={`text-xs ${mutedTextClass}`}>No published videos</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-border/50 relative z-10 space-y-3 px-2">
          <div className="p-3 rounded-md bg-background border border-border flex items-center gap-3 shadow-sm group cursor-pointer hover:border-primary/30 transition-all">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-foreground">Olleey Pro</span>
              <span className="text-[10px] text-muted-foreground">Premium Access</span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              const { signOut } = require("@/lib/AuthContext");
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }
            }}
            className="w-full justify-start gap-3 h-auto p-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Sign Out</span>
          </Button>
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
