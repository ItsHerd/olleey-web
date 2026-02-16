"use client";

import React, { useState, useEffect, useMemo } from "react";
import { youtubeAPI, channelsAPI, type MasterNode, type LanguageChannel } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useAuth } from "@/lib/AuthContext";
import { useSupabaseChannels } from "@/lib/useSupabase";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import {
  Loader2,
  Youtube,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Radio,
  Video,
  Globe,
  Pause,
  Play,
  Trash2,
  Star,
  Activity,
  Layers,
  Shield,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Zap,
  Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getInitialsAvatar } from "@/lib/utils";
import { OlleeyLoader } from "@/components/ui/OlleeyLoader";
import { resolveClientUserId } from "@/lib/user";

type ConnectionStatus = "active" | "expired" | "restricted" | "disconnected";

const getStatusConfig = (status: ConnectionStatus) => {
  switch (status) {
    case "active":
      return {
        label: "Operational",
        color: "text-emerald-400",
        dotColor: "bg-emerald-500",
        glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]"
      };
    case "expired":
      return {
        label: "Token Expired",
        color: "text-red-400",
        dotColor: "bg-red-500",
        glow: "shadow-[0_0_12px_rgba(239,68,68,0.3)]"
      };
    case "restricted":
      return {
        label: "Limited Scope",
        color: "text-olleey-yellow",
        dotColor: "bg-olleey-yellow",
        glow: "shadow-[0_0_12px_rgba(251,191,36,0.3)]"
      };
    default:
      return {
        label: "Offline",
        color: "text-zinc-500",
        dotColor: "bg-zinc-500",
        glow: "shadow-none"
      };
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

export default function ChannelsPage() {
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"all" | "primary" | "unassigned">("all");
  const { theme } = useTheme();
  const { selectedProject } = useProject();
  const { user, loading: authLoading } = useAuth();
  const userId = resolveClientUserId(user?.id);

  // Fetch channels from Supabase ONLY
  const {
    channels: allChannels,
    loading: channelsLoading,
    error: channelsError,
    refetch: refetchChannels
  } = useSupabaseChannels(
    userId,
    { project_id: selectedProject?.id },
    { enabled: !!userId && !authLoading }
  );

  const isLoading = channelsLoading;
  const isDark = theme === "dark";

  const bgClass = isDark ? "bg-[#080808]" : "bg-light-bg";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/40" : "text-gray-500";
  const borderClass = isDark ? "border-white/5" : "border-gray-200";
  const cardClass = isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-gray-200";
  const tableHeaderClass = isDark ? "bg-white/2 border-white/5" : "bg-gray-50/80 border-gray-200";
  const inputBgClass = isDark ? "bg-white/[0.03] border-white/10 hover:bg-white/5" : "bg-white border-gray-200 hover:border-gray-300";

  // Calculate stats from Supabase channels
  const graphStats = useMemo(() => {
    const total = allChannels?.length || 0;
    const active = allChannels?.filter(ch => !(ch as any).is_paused && !(ch as any).deleted_at)?.length || 0;
    const paused = allChannels?.filter(ch => (ch as any).is_paused)?.length || 0;

    return {
      total_connections: total,
      active_connections: active,
      expired_connections: paused,
    };
  }, [allChannels]);

  // Add console logging for debugging
  console.log('[ChannelsPage] State:', {
    channelsCount: allChannels?.length || 0,
    loading: isLoading,
    error: channelsError,
    userId,
    authLoading,
    selectedProject: selectedProject?.id,
    stats: graphStats
  });

  const handleReconnect = async (connectionId: string, channelName: string) => {
    try {
      setReconnectingId(connectionId);
      const response = await youtubeAPI.initiateConnection(
        `${window.location.origin}/youtube/connect/success?connection_type=reconnect&connection_id=${connectionId}&redirect_to=/channels`
      );
      if (response.auth_url) window.location.href = response.auth_url;
    } catch (error) {
      logger.error("Channels", `Failed to reconnect ${channelName}`, error);
      setReconnectingId(null);
    }
  };

  const handleAddChannel = async () => {
    try {
      const response = await youtubeAPI.initiateConnection(
        `${window.location.origin}/youtube/connect/success?connection_type=satellite&redirect_to=/channels`
      );
      if (response.auth_url) window.location.href = response.auth_url;
    } catch (error) {
      logger.error("Channels", "Failed to add channel", error);
    }
  };

  const handleSetPrimary = async (connectionId: string, channelName: string) => {
    try {
      await youtubeAPI.setPrimaryConnection(connectionId);
      await refetchChannels(); // Refetch from Supabase
    } catch (error) {
      logger.error("Channels", `Failed to set ${channelName} as primary`, error);
    }
  };

  const handleRemoveChannel = async (connectionId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to remove ${channelName}? This action cannot be undone.`)) return;
    try {
      await youtubeAPI.disconnectChannel(connectionId);
      await refetchChannels(); // Refetch from Supabase
    } catch (error) {
      logger.error("Channels", `Failed to remove ${channelName}`, error);
    }
  };

  const handleUpdateLanguage = async (connectionId: string, languageCode: string) => {
    try {
      await youtubeAPI.updateConnection(connectionId, { language_code: languageCode });
      await refetchChannels(); // Refetch from Supabase
    } catch (error) {
      logger.error("Channels", "Failed to update language", error);
    }
  };

  const tableData = useMemo(() => {
    console.log('[ChannelsPage] Building table data from Supabase:', {
      supabaseChannels: allChannels?.length || 0
    });

    const flat: any[] = [];

    // Build table data directly from Supabase channels
    allChannels?.forEach(channel => {
      const isMaster = channel.is_master || false;

      flat.push({
        id: channel.channel_id,
        type: isMaster ? "master" : "satellite",
        name: channel.channel_name,
        avatar: channel.thumbnail_url,
        status: "active", // Default status from Supabase
        language_code: channel.language_code,
        language_name: channel.language_name,
        is_paused: (channel as any).is_paused || false,
        is_primary: isMaster, // Master channels are primary
        videos: channel.video_count || 0,
        isOrphan: !isMaster && !channel.master_channel_id,
        masterName: channel.master_channel_id,
        languagesCount: 0, // Could calculate from satellite channels if needed
        subscriber_count: channel.subscriber_count || 0,
      });
    });

    const filtered = flat.filter(item => {
      if (channelFilter === "primary") return item.is_primary;
      if (channelFilter === "unassigned") {
        if (item.isOrphan) return true;
        return item.type === "master" && item.languagesCount === 0;
      }
      return true;
    });

    console.log('[ChannelsPage] Table data built:', {
      totalItems: flat.length,
      filteredItems: filtered.length,
      filter: channelFilter,
      masters: flat.filter(i => i.type === "master").length,
      satellites: flat.filter(i => i.type === "satellite").length
    });

    return filtered;
  }, [allChannels, channelFilter]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center flex-1 ${bgClass} p-8`}>
        <OlleeyLoader size={100} className="mb-8" />
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olleey-yellow animate-pulse">Syncing Global Grid...</p>
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-4 bg-olleey-yellow/20 rounded-full overflow-hidden">
                <motion.div
                  className="w-full bg-olleey-yellow"
                  animate={{ height: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto custom-scrollbar ${bgClass}`}>
      <div className={`flex flex-col p-4 sm:p-6 md:p-10 space-y-10`}>
        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative h-[340px] shrink-0 rounded-3xl overflow-hidden group ${isDark ? 'shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]' : 'border border-gray-100 bg-white'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/20 via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
            className={`absolute inset-0 w-full h-full object-cover ${isDark ? 'grayscale opacity-40' : 'grayscale opacity-20'} group-hover:scale-105 transition-transform duration-[10s] ease-linear`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#080808] via-[#080808]/60' : 'from-white via-white/80'} to-transparent z-10`} />

          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-olleey-yellow/10 border border-olleey-yellow/20 rounded-lg">
                    <span className="text-[9px] font-black text-olleey-yellow uppercase tracking-[0.3em]">Network Architecture</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} border rounded-lg`}>
                    <Globe2 className={`w-3.5 h-3.5 ${textSecondaryClass}`} />
                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.3em]`}>Global Grid v2.4</span>
                  </div>
                </div>
                <h1 className={`text-4xl md:text-6xl font-normal ${textClass} tracking-tighter leading-[0.9] flex flex-col`}>
                  <span className="text-olleey-yellow">Channels</span>
                  <span>Management</span>
                </h1>
                <p className={`text-base ${textSecondaryClass} font-light leading-relaxed max-w-xl`}>
                  Command and control your YouTube channel network. Map primary assets to localized distribution nodes with cinema-grade synchronization.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                <div className={`p-6 ${cardClass} backdrop-blur-3xl rounded-2xl flex flex-col justify-between`}>
                  <TrendingUp className="w-5 h-5 text-olleey-yellow mb-4" />
                  <div>
                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.2em] block mb-1`}>Grid Load</span>
                    <span className={`text-2xl font-normal ${textClass} tracking-tighter`}>{graphStats.total_connections} Channels</span>
                  </div>
                </div>
                <div className={`p-6 ${cardClass} backdrop-blur-3xl rounded-2xl flex flex-col justify-between`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-4" />
                  <div>
                    <span className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.2em] block mb-1`}>Signal Integrity</span>
                    <span className={`text-2xl font-normal ${textClass} tracking-tighter`}>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Application Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className={`flex items-center gap-3 p-1.5 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-200'} border rounded-2xl backdrop-blur-xl`}>
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "all" ? "bg-olleey-yellow text-black" : `${textSecondaryClass} hover:${textClass}`}`}
            >
              All Channels
            </button>
            <button
              onClick={() => setChannelFilter("primary")}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "primary" ? "bg-olleey-yellow text-black" : `${textSecondaryClass} hover:${textClass}`}`}
            >
              Primary Channels
            </button>
            <button
              onClick={() => setChannelFilter("unassigned")}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "unassigned" ? "bg-olleey-yellow text-black" : `${textSecondaryClass} hover:${textClass}`}`}
            >
              Unassigned Channels
            </button>
          </div>

          <Button
            onClick={handleAddChannel}
            className={`h-14 px-10 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black text-white border-transparent'} border hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-[0.2em] rounded-xl transition-all group`}
          >
            <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
            Add Channel
          </Button>
        </div>

        {/* Network Table */}
        <div className={`w-full ${isDark ? 'bg-[#0c0c0c]/40 border-white/10 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]' : 'bg-white border-gray-200'} backdrop-blur-3xl border rounded-3xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className={tableHeaderClass}>
                  <th className={`px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} border-b ${borderClass}`}>Asset Signature</th>
                  <th className={`px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} border-b ${borderClass}`}>Role</th>
                  <th className={`px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} border-b ${borderClass}`}>Signal Status</th>
                  <th className={`px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} border-b ${borderClass}`}>Temporal Map</th>
                  <th className={`px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} border-b ${borderClass} text-right w-64`}>Protocols</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                <AnimatePresence mode="popLayout">
                  {tableData.map((item: any, idx) => {
                    const statusConfig = getStatusConfig(item.status);
                    const isMaster = item.type === "master";

                    return (
                      <motion.tr
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: idx * 0.05 }}
                        className={`group ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'} transition-colors`}
                      >
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                            <div className="relative shrink-0">
                              <div className="absolute inset-0 bg-olleey-yellow/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img
                                src={item.avatar || getInitialsAvatar(item.name || item.id)}
                                alt={item.name}
                                className={`relative w-14 h-14 rounded-xl object-cover ${isDark ? 'border-white/10 shadow-2xl' : 'border-gray-200'} border grayscale group-hover:grayscale-0 transition-all duration-500`}
                              />
                              {isMaster && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-olleey-yellow rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                                  <Star className="w-2.5 h-2.5 text-black fill-black" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className={`text-base font-bold ${textClass} group-hover:text-olleey-yellow transition-colors tracking-tight truncate max-w-[280px]`}>
                                {item.name}
                              </p>
                              {!isMaster && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                                  <p className={`text-[10px] font-black ${textSecondaryClass} opacity-60 uppercase tracking-widest`}>
                                    {item.isOrphan ? "Unassigned Satellite" : `Linked to ${item.masterName}`}
                                  </p>
                                </div>
                              )}
                              {isMaster && item.is_primary && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-olleey-yellow/10 border border-olleey-yellow/20 rounded-md">
                                  <Shield className="w-2.5 h-2.5 text-olleey-yellow" />
                                  <span className="text-[9px] font-black text-olleey-yellow uppercase tracking-widest">Primary Command</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className={`inline-flex items-center px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${isMaster ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : `${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-gray-100 border-gray-200 text-gray-500'}`}`}>
                            {isMaster ? <Cpu className="w-3 h-3 mr-2" /> : <Layers className="w-3 h-3 mr-2" />}
                            {isMaster ? "Command Node" : "Satellite"}
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${statusConfig.glow} ${item.status === 'active' ? 'animate-pulse' : ''}`} />
                              <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${statusConfig.color}`}>{statusConfig.label}</span>
                            </div>
                            {item.is_paused && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md w-fit">
                                <Pause className="w-2.5 h-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Protocol Stalled</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className="relative group/select w-48">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <Globe className={`w-4 h-4 ${isDark ? 'text-white/20' : 'text-gray-400'} group-hover/select:text-olleey-yellow/60 transition-colors`} />
                            </div>
                            <select
                              value={item.language_code || ""}
                              onChange={(e) => handleUpdateLanguage(item.id, e.target.value)}
                              className={`w-full ${inputBgClass} rounded-xl pl-12 pr-6 py-4 text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-gray-600'} focus:ring-0 focus:border-olleey-yellow/40 transition-all cursor-pointer appearance-none`}
                            >
                              <option value="" className={isDark ? "bg-[#080808]" : "bg-white"}>Map...</option>
                              {LANGUAGE_OPTIONS.map(l => (
                                <option key={l.code} value={l.code} className={isDark ? "bg-[#080808]" : "bg-white"}>
                                  {l.flag} {l.name}
                                </option>
                              ))}
                            </select>
                            <div className={`absolute inset-y-0 right-4 flex items-center pointer-events-none ${isDark ? 'text-white/10' : 'text-gray-300'}`}>
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className="flex items-center justify-end gap-3">
                            {isMaster && !item.is_primary && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleSetPrimary(item.id, item.name); }}
                                variant="ghost"
                                size="icon"
                                className={`w-11 h-11 rounded-lg ${inputBgClass} ${textSecondaryClass} hover:text-olleey-yellow transition-all`}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}

                            {!isMaster && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleReconnect(item.id, item.name); }}
                                variant="ghost"
                                size="icon"
                                className={`w-11 h-11 rounded-lg ${inputBgClass} ${textSecondaryClass} hover:text-olleey-yellow transition-all ${reconnectingId === item.id ? 'animate-spin' : ''}`}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                const togglePause = async () => {
                                  try {
                                    if (item.is_paused) await channelsAPI.unpauseChannel(item.id);
                                    else await channelsAPI.pauseChannel(item.id);
                                    await refetchChannels();
                                  } catch (e) { logger.error("Channels", "Error toggling pause", e); }
                                };
                                togglePause();
                              }}
                              variant="ghost"
                              size="icon"
                              className={`w-11 h-11 rounded-lg ${inputBgClass} ${textSecondaryClass} hover:${item.is_paused ? 'text-emerald-500' : 'text-amber-500'} transition-all`}
                            >
                              {item.is_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </Button>

                            <Button
                              onClick={(e) => { e.stopPropagation(); handleRemoveChannel(item.id, item.name); }}
                              variant="ghost"
                              size="icon"
                              className={`w-11 h-11 rounded-lg ${inputBgClass} ${textSecondaryClass} hover:text-red-500 transition-all`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {tableData.length === 0 && (
            <div className={`p-32 text-center flex flex-col items-center ${textClass}`}>
              <div className={`w-24 h-24 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-3xl flex items-center justify-center border mb-8 opacity-20`}>
                <Radio className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-normal mb-3 tracking-tighter">Zero active connections</h3>
              <p className={`text-sm ${textSecondaryClass} mb-10 max-w-sm mx-auto font-light leading-relaxed`}>
                Initialize your network by deploying your first satellite node.
              </p>
              <Button
                onClick={handleAddChannel}
                className="h-14 px-12 bg-olleey-yellow text-black hover:opacity-90 font-black uppercase tracking-[0.2em] rounded-xl transition-all"
              >
                Add a channel
              </Button>
            </div>
          )}
        </div>
        {/* Spacer for bottom */}
        <div className="h-20 shrink-0" />
      </div>
    </div>
  );
}
