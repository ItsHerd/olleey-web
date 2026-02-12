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
  Moon
} from "lucide-react";
import { ViewType } from "./DashboardV2Layout";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useDashboardChannels } from "@/lib/useDashboardChannels";
import { useDashboardConnections } from "@/lib/useDashboardConnections";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useVideos } from "@/lib/useVideos";
import { useTheme } from "@/lib/useTheme";
import { API_BASE_URL } from "@/lib/api";
import { Input } from "@/components/ui/input";
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
  DropdownMenuLabel
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
import { MoreHorizontal, Trash, Edit, Star, Play, Pause, X } from "lucide-react";

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
  const { selectedProject } = useProject();
  const { setTheme } = useTheme();
  const isDark = theme === "dark";

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

  const { videos } = useVideos({
    project_id: selectedProject?.id,
    user_id: user?.id,
  }, { enabled: !!user?.id && !!user });

  // Need to destructure refetch from hooks to use them
  const { connections, loading: connectionsLoading, refetch: refetchConnections } = useDashboardConnections({
    enabled: !!user?.id && !!user
  });

  const [editChannel, setEditChannel] = React.useState<LanguageChannel | null>(null);
  const [editConnection, setEditConnection] = React.useState<YouTubeConnection | null>(null);
  const [newLanguage, setNewLanguage] = React.useState("");

  const handleUpdateChannelLanguage = async () => {
    if (!editChannel || !newLanguage) return;
    try {
      await channelsAPI.updateChannel(editChannel.id, { language_code: newLanguage });
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
      await channelsAPI.updateChannel(channel.id, { is_paused: !channel.is_paused });
      refetchChannels();
    } catch (e) {
      console.error("Failed to toggle pause", e);
    }
  };

  const handleSetPrimary = async (connectionId: string) => {
    try {
      await youtubeAPI.setPrimaryConnection(connectionId);
      window.location.reload();
    } catch (e) {
      console.error("Failed to set primary", e);
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



  const bgClass = isDark ? "bg-[#0D0D0D]" : "bg-[#EBEBDC]";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
  const glassBgClass = isDark ? "bg-white/[0.05]" : "bg-gray-100/50";

  return (
    <div
      className={`w-80 h-full ${bgClass} border-r ${borderClass} flex flex-col p-6 overflow-hidden relative`}
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#D97757]/5 to-transparent pointer-events-none" />

      {/* Header Profile */}
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div
          className="flex flex-col cursor-pointer group"
          onClick={() => onViewChange("account")}
        >
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedTextClass} mb-1 group-hover:text-[#D97757] transition-colors`}>Workspace</span>
          <h2 className={`text-2xl font-serif ${textClass} tracking-tight group-hover:text-[#D97757] transition-colors`}>
            {user?.email?.split('@')[0] || "User"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg border-2 ${borderClass} hover:bg-white/5 hover:border-white/20 transition-all duration-200 active:scale-95`}
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Search Bar - Integrated style */}
      <div className="relative mb-6 z-10">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass} opacity-60`} />
        <Input
          placeholder="Jump to..."
          className={`pl-10 h-11 ${isDark ? "border-white/5 focus-visible:ring-white/10 bg-white/[0.02]" : "border-gray-200 focus-visible:ring-gray-300 bg-white/50"} rounded-xl`}
        />
      </div>

      {/* Sections Accordion */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 scrollbar-none relative z-10">
        <Accordion type="multiple" defaultValue={["channels", "runs"]} className="space-y-1 relative">
          <AccordionItem value="channels" className="border-none">
            <AccordionTrigger
              onClick={() => onViewChange("channels")}
              className={`text-sm font-bold hover:no-underline py-3 px-4 rounded-xl border ${borderClass} ${isDark ? "bg-white/[0.02] hover:bg-white/[0.05]" : "bg-white/20 hover:bg-white/40"} ${textClass} [&>svg]:w-4 [&>svg]:h-4 [&>svg]:transition-transform [&>svg]:duration-300 transition-all duration-200`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#D97757]" />
                Channels
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-2">
                {channelsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`h-12 rounded-xl border ${borderClass} animate-pulse bg-white/5`} />
                  ))
                ) : channels.length > 0 ? (
                  channels.map((channel) => (
                    <motion.div
                      key={channel.id}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        onSelectItem({ type: "channel", id: channel.id, data: channel });
                        onViewChange("channels");
                      }}
                      className={`group w-full p-2.5 rounded-xl border ${borderClass} ${glassBgClass} flex items-center justify-between ${isDark ? "hover:border-white/20" : "hover:border-gray-300 shadow-none"} transition-all cursor-pointer ${isDark ? 'shadow-sm' : 'shadow-none'}`}
                    >
                      <div className="flex items-center gap-3 w-full overflow-hidden">
                        <div className="relative shrink-0">
                          {channel.channel_avatar_url ? (
                            <img src={channel.channel_avatar_url} className={`w-8 h-8 rounded-lg object-cover border ${isDark ? "border-white/10" : "border-gray-200"}`} alt="" />
                          ) : (
                            <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} border flex items-center justify-center`}>
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0A0A0A]' : 'border-white'} ${channel.status?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`text-[13px] font-medium ${textClass} truncate opacity-90 group-hover:opacity-100 transition-opacity leading-tight`}>
                            {channel.channel_name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {channel.language_name && (
                              <span className={`text-[10px] ${mutedTextClass} opacity-70 truncate`}>
                                {channel.language_name}
                              </span>
                            )}

                            {(channel.videos_count !== undefined || channel.language_name) && (
                              <span className={`text-[10px] ${mutedTextClass} opacity-40`}>•</span>
                            )}

                            <span className={`text-[10px] ${mutedTextClass} opacity-70 whitespace-nowrap`}>
                              {channel.videos_count || 0} videos
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${borderClass} ${isDark ? "hover:border-white/20 hover:bg-white/10" : "hover:border-gray-300 hover:bg-gray-50"} transition-all shadow-sm mt-1`}>
                              <MoreHorizontal className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Channel Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTogglePause(channel)}>
                              {channel.is_paused ? <Play className="w-3.5 h-3.5 mr-2" /> : <Pause className="w-3.5 h-3.5 mr-2" />}
                              {channel.is_paused ? "Resume Publication" : "Pause Publication"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditChannel(channel);
                              setNewLanguage(channel.language_code || "");
                            }}>
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Change Language
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDeleteChannel(channel.id)}>
                              <Trash className="w-3.5 h-3.5 mr-2" />
                              Remove Channel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`p-8 text-center rounded-xl border border-dashed ${borderClass}`}>
                    <p className={`text-xs ${mutedTextClass}`}>No channels connected</p>
                  </div>
                )}

                <button className={`w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider ${mutedTextClass} mt-2 py-3 rounded-xl border-2 border-dashed ${borderClass} hover:border-[#D97757]/50 hover:text-[#D97757] hover:bg-[#D97757]/5 transition-all duration-200 bg-transparent group`}>
                  <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                  Connect New
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="runs" className="border-none">
            <AccordionTrigger
              className={`text-sm font-bold hover:no-underline py-3 px-4 rounded-2xl border ${borderClass} ${isDark ? "bg-white/[0.02] hover:bg-white/[0.05]" : "bg-gray-50/50 hover:bg-gray-100/50"} ${textClass} [&>svg]:w-4 [&>svg]:h-4 [&>svg]:transition-transform [&>svg]:duration-300 transition-all duration-200`}
              onClick={() => onViewChange("dashboard")}
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-blue-400" />
                Pipeline Runs
                {activeJobsCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                    {activeJobsCount}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-2.5">
                {jobsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`h-16 rounded-2xl border ${borderClass} animate-pulse bg-white/5`} />
                  ))
                ) : jobs.length > 0 ? (
                  jobs.map((job) => {
                    const video = getJobVideo(job.source_video_id);
                    return (
                      <motion.div
                        key={job.job_id}
                        whileHover={{ x: 4, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                        onClick={() => {
                          onSelectItem({ type: "job", id: job.job_id, data: job });
                          if (job.status === 'waiting_approval') {
                            onViewChange("review");
                          } else {
                            onViewChange("dashboard");
                          }
                        }}
                        className={`p-3 rounded-2xl border ${borderClass} ${glassBgClass} transition-all cursor-pointer group shadow-sm`}
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
                  })
                ) : (
                  <div className={`p-6 rounded-2xl border ${borderClass} border-dashed text-center opacity-60`}>
                    <p className={`text-xs ${mutedTextClass}`}>No recent activity</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="distributions" className="border-none">
            <AccordionTrigger className={`text-sm font-bold hover:no-underline py-3 px-4 rounded-2xl border ${borderClass} ${isDark ? "bg-white/[0.02] hover:bg-white/[0.05]" : "bg-gray-50/50 hover:bg-gray-100/50"} ${textClass} [&>svg]:w-4 [&>svg]:h-4 [&>svg]:transition-transform [&>svg]:duration-300 transition-all duration-200`}>
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-purple-400" />
                Active Distributions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {connectionsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`h-12 rounded-2xl border ${borderClass} animate-pulse bg-white/5`} />
                  ))
                ) : connections.length > 0 ? (
                  connections.map((connection) => (
                    <motion.div
                      key={connection.connection_id}
                      whileHover={{ x: 4 }}
                      className={`group w-full p-2.5 rounded-2xl border ${borderClass} ${glassBgClass} flex items-center justify-between hover:border-white/20 transition-all cursor-default shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {connection.channel_avatar_url ? (
                            <img src={connection.channel_avatar_url} className={`w-8 h-8 rounded-lg object-cover border ${isDark ? "border-white/10" : "border-gray-200"}`} alt="" />
                          ) : (
                            <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} border flex items-center justify-center`}>
                              <Globe className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0A0A0A]' : 'border-white'} ${connection.is_primary ? 'bg-purple-500' : 'bg-gray-500'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-medium ${textClass} truncate max-w-[140px] opacity-90 group-hover:opacity-100 transition-opacity`}>
                            {connection.youtube_channel_name}
                          </span>
                          <span className={`text-[10px] ${mutedTextClass} opacity-60`}>
                            {connection.connection_type === 'master' ? 'Primary' : 'Satellite'} Node
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2`}>
                        {connection.is_primary && (
                          <div className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'} border border-purple-500/20 flex items-center gap-1`}>
                            <span className="text-[9px] font-mono text-purple-400">PRIMARY</span>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${borderClass} ${isDark ? "hover:border-white/20 hover:bg-white/10" : "hover:border-gray-300 hover:bg-gray-50"} transition-all shadow-sm`}>
                              <MoreHorizontal className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Distribution Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!connection.is_primary && (
                              <DropdownMenuItem onClick={() => handleSetPrimary(connection.connection_id)}>
                                <Star className="w-3.5 h-3.5 mr-2" />
                                Make Primary
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setEditConnection(connection);
                              setNewLanguage(connection.language_code || "");
                            }}>
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Change Language
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDisconnect(connection.connection_id)}>
                              <Trash className="w-3.5 h-3.5 mr-2" />
                              Disconnect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`p-6 rounded-2xl border ${borderClass} border-dashed text-center opacity-60`}>
                    <p className={`text-xs ${mutedTextClass}`}>No active distributions</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 relative z-10 space-y-4">
        {/* Theme Toggle */}
        <div className={`p-1.5 rounded-2xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'} border ${borderClass} flex items-center gap-1.5`}>
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 ${!isDark ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-400'
              }`}
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : ''}`} />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 ${isDark ? 'bg-[#1A1A1A] shadow-sm text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : ''}`} />
            Dark
          </button>
        </div>

        <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#D97757]/5' : 'bg-gray-50'} border ${borderClass} border-[#D97757]/10 flex items-center gap-3`}>
          <div className="w-8 h-8 rounded-full bg-[#D97757]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#D97757]" />
          </div>
          <div className="flex flex-col">
            <span className={`text-[11px] font-bold ${textClass} opacity-90`}>Olleey Pro</span>
            <span className={`text-[10px] ${mutedTextClass}`}>Unlimited translations</span>
          </div>
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

      {/* Edit Connection Language Dialog */}
      <Dialog open={!!editConnection} onOpenChange={(open) => !open && setEditConnection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Distribution Language</DialogTitle>
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
            <Button variant="outline" onClick={() => setEditConnection(null)}>Cancel</Button>
            <Button onClick={() => {
              handleUpdateConnectionLanguage();
              refetchConnections();
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

