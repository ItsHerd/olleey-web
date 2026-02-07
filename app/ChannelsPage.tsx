"use client";

import React, { useState, useEffect, useMemo } from "react";
import { youtubeAPI, channelsAPI, type MasterNode } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
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
import { LoadingPanda } from "@/components/ui/LoadingPanda";

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
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"all" | "primary" | "unassigned">("all");
  const [graphStats, setGraphStats] = useState({
    total_connections: 0,
    active_connections: 0,
    expired_connections: 0,
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bgClass = isDark ? "bg-[#080808]" : "bg-light-bg";
  const textClass = isDark ? "text-white" : "text-light-text";
  const textSecondaryClass = isDark ? "text-white/40" : "text-light-textSecondary";
  const borderClass = isDark ? "border-white/5" : "border-light-border";

  useEffect(() => {
    loadChannelGraph();
  }, []);

  const loadChannelGraph = async () => {
    try {
      setIsLoading(true);
      const graph = await youtubeAPI.getChannelGraph();
      setChannelGraph(graph.master_nodes || []);
      setGraphStats({
        total_connections: graph.total_connections,
        active_connections: graph.active_connections,
        expired_connections: graph.expired_connections,
      });
    } catch (error) {
      logger.error("Channels", "Failed to load channel graph", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to set ${channelName} as primary`, error);
    }
  };

  const handleRemoveChannel = async (connectionId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to remove ${channelName}? This action cannot be undone.`)) return;
    try {
      await youtubeAPI.disconnectChannel(connectionId);
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to remove ${channelName}`, error);
    }
  };

  const handleUpdateLanguage = async (connectionId: string, languageCode: string) => {
    try {
      await youtubeAPI.updateConnection(connectionId, { language_code: languageCode });
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", "Failed to update language", error);
    }
  };

  const tableData = useMemo(() => {
    const flat: any[] = [];
    channelGraph.forEach(master => {
      flat.push({
        id: master.connection_id,
        type: "master",
        name: master.channel_name,
        avatar: master.channel_avatar_url,
        status: master.status.status,
        language_code: master.language_code,
        language_name: master.language_name,
        is_primary: master.is_primary,
        is_paused: master.is_paused,
        videos: master.total_videos,
        translations: master.total_translations,
        languagesCount: master.language_channels.length,
      });

      master.language_channels.forEach(lang => {
        flat.push({
          id: lang.id,
          type: "satellite",
          name: lang.channel_name,
          avatar: lang.channel_avatar_url,
          status: lang.status.status,
          language_code: lang.language_code,
          language_name: lang.language_name,
          is_paused: lang.is_paused,
          videos: lang.videos_count,
          masterName: master.channel_name,
          masterId: master.connection_id
        });
      });
    });

    return flat.filter(item => {
      if (channelFilter === "primary") return item.is_primary;
      if (channelFilter === "unassigned") return item.type === "master" && item.languagesCount === 0;
      return true;
    });
  }, [channelGraph, channelFilter]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center flex-1 ${bgClass} p-8`}>
        <LoadingPanda size={200} className="mb-8" />
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
          className="relative h-[340px] shrink-0 rounded-[2.5rem] overflow-hidden group shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/20 via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent z-10" />

          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-olleey-yellow/10 border border-olleey-yellow/20 rounded-full">
                    <span className="text-[9px] font-black text-olleey-yellow uppercase tracking-[0.3em]">Network Architecture</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <Globe2 className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">Global Grid v2.4</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tighter leading-[0.9] flex flex-col">
                  <span className="text-olleey-yellow">Channels</span>
                  <span>Management</span>
                </h1>
                <p className="text-base text-white/40 font-light leading-relaxed max-w-xl">
                  Command and control your YouTube channel network. Map primary assets to localized distribution nodes with cinema-grade synchronization.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                <div className="p-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.2rem] flex flex-col justify-between">
                  <TrendingUp className="w-5 h-5 text-olleey-yellow mb-4" />
                  <div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Grid Load</span>
                    <span className="text-2xl font-normal text-white tracking-tighter">{graphStats.total_connections} Channels</span>
                  </div>
                </div>
                <div className="p-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.2rem] flex flex-col justify-between">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-4" />
                  <div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Signal Integrity</span>
                    <span className="text-2xl font-normal text-white tracking-tighter">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Application Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 p-1.5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] backdrop-blur-xl">
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "all" ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"}`}
            >
              All Channels
            </button>
            <button
              onClick={() => setChannelFilter("primary")}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "primary" ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"}`}
            >
              Primary Channels
            </button>
            <button
              onClick={() => setChannelFilter("unassigned")}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${channelFilter === "unassigned" ? "bg-olleey-yellow text-black" : "text-white/40 hover:text-white"}`}
            >
              Unassigned Channels
            </button>
          </div>

          <Button
            onClick={handleAddChannel}
            className="h-14 px-10 bg-white/5 border border-white/10 text-white hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-[0.2em] rounded-full transition-all group"
          >
            <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
            Add Channel
          </Button>
        </div>

        {/* Network Table */}
        <div className="w-full bg-[#0c0c0c]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-white/2">
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Asset Signature</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Role</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Signal Status</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">Temporal Map</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 text-right w-64">Protocols</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                            <div className="relative shrink-0">
                              <div className="absolute inset-0 bg-olleey-yellow/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img
                                src={item.avatar || getInitialsAvatar(item.name || item.id)}
                                alt={item.name}
                                className="relative w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                              />
                              {isMaster && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-olleey-yellow rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                                  <Star className="w-2.5 h-2.5 text-black fill-black" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="text-base font-bold text-white group-hover:text-olleey-yellow transition-colors tracking-tight truncate max-w-[280px]">
                                {item.name}
                              </p>
                              {!isMaster && (
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-white/10" />
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Linked to {item.masterName}</p>
                                </div>
                              )}
                              {isMaster && item.is_primary && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-olleey-yellow/10 border border-olleey-yellow/20 rounded-full">
                                  <Shield className="w-2.5 h-2.5 text-olleey-yellow" />
                                  <span className="text-[9px] font-black text-olleey-yellow uppercase tracking-widest">Primary Command</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isMaster ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/10 text-white/40"}`}>
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
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full w-fit">
                                <Pause className="w-2.5 h-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Protocol Stalled</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-10 py-10">
                          <div className="relative group/select w-64">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <Globe className="w-4 h-4 text-white/20 group-hover/select:text-olleey-yellow/60 transition-colors" />
                            </div>
                            <select
                              value={item.language_code || ""}
                              onChange={(e) => handleUpdateLanguage(item.id, e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[11px] font-black uppercase tracking-widest text-white/60 focus:ring-0 focus:border-olleey-yellow/40 transition-all cursor-pointer appearance-none hover:bg-white/5"
                            >
                              <option value="" className="bg-[#080808]">Initialization Required...</option>
                              {LANGUAGE_OPTIONS.map(l => (
                                <option key={l.code} value={l.code} className="bg-[#080808]">
                                  {l.flag} {l.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/10">
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
                                className="w-11 h-11 rounded-[1.2rem] bg-white/[0.03] border border-white/10 text-white/30 hover:text-olleey-yellow hover:bg-white/5 transition-all"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}

                            {!isMaster && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleReconnect(item.id, item.name); }}
                                variant="ghost"
                                size="icon"
                                className={`w-11 h-11 rounded-[1.2rem] bg-white/[0.03] border border-white/10 text-white/30 hover:text-olleey-yellow hover:bg-white/5 transition-all ${reconnectingId === item.id ? 'animate-spin' : ''}`}
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
                                    await loadChannelGraph();
                                  } catch (e) { logger.error("Channels", "Error toggling pause", e); }
                                };
                                togglePause();
                              }}
                              variant="ghost"
                              size="icon"
                              className={`w-11 h-11 rounded-[1.2rem] bg-white/[0.03] border border-white/10 text-white/30 hover:${item.is_paused ? 'text-emerald-500' : 'text-amber-500'} hover:bg-white/5 transition-all`}
                            >
                              {item.is_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </Button>

                            <Button
                              onClick={(e) => { e.stopPropagation(); handleRemoveChannel(item.id, item.name); }}
                              variant="ghost"
                              size="icon"
                              className="w-11 h-11 rounded-[1.2rem] bg-white/[0.03] border border-white/10 text-white/30 hover:text-red-500 hover:bg-white/5 transition-all"
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
            <div className="p-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 mb-8 opacity-20">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-normal text-white mb-3 tracking-tighter">Zero active connections</h3>
              <p className="text-sm text-white/40 mb-10 max-w-sm mx-auto font-light leading-relaxed">
                Initialize your network by deploying your first satellite node.
              </p>
              <Button
                onClick={handleAddChannel}
                className="h-14 px-12 bg-olleey-yellow text-black hover:opacity-90 font-black uppercase tracking-[0.2em] rounded-full transition-all"
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
