"use client";

import { useState, useEffect, useMemo } from "react";
import { youtubeAPI, channelsAPI, type MasterNode, type LanguageChannel } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { Loader2, Youtube, Plus, RefreshCw, CheckCircle, XCircle, AlertCircle, Radio, ChevronRight, Video, Globe2, Pause, Play, Trash2, Star, Check, Languages } from "lucide-react";

type ConnectionStatus = "active" | "expired" | "restricted" | "disconnected";

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  pt: "🇵🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  hi: "🇮🇳",
  ar: "🇸🇦",
  ru: "🇷🇺",
  it: "🇮🇹",
  zh: "🇨🇳",
};

const getStatusConfig = (status: ConnectionStatus) => {
  switch (status) {
    case "active":
      return {
        icon: CheckCircle,
        label: "Active",
        emoji: "🟢",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        dotColor: "bg-green-500",
      };
    case "expired":
      return {
        icon: XCircle,
        label: "Token Expired",
        emoji: "🔴",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        dotColor: "bg-red-500",
      };
    case "restricted":
      return {
        icon: AlertCircle,
        label: "Restricted Access",
        emoji: "🟡",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        dotColor: "bg-yellow-500",
      };
    case "disconnected":
      return {
        icon: XCircle,
        label: "Disconnected",
        emoji: "⚫",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        dotColor: "bg-gray-500",
      };
  }
};

const getLanguageFlag = (langCode: string): string => {
  return LANGUAGE_FLAGS[langCode] || "🌍";
};

type ChannelFilter = "all" | "primary" | "unassigned";

export default function ChannelsPage() {
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterNode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [graphStats, setGraphStats] = useState({
    total_connections: 0,
    active_connections: 0,
    expired_connections: 0,
  });
  const { theme } = useTheme();

  // Theme tokens
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const isDark = theme === "dark";
  const hoverClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-50/50";

  useEffect(() => {
    loadChannelGraph();
  }, []);

  const loadChannelGraph = async () => {
    try {
      setIsLoadingConnections(true);
      const graph = await youtubeAPI.getChannelGraph();
      setChannelGraph(graph.master_nodes || []);
      setGraphStats({
        total_connections: graph.total_connections,
        active_connections: graph.active_connections,
        expired_connections: graph.expired_connections,
      });

      // Preserve selected channel or auto-select first
      if (graph.master_nodes && graph.master_nodes.length > 0) {
        if (selectedMaster) {
          // Find the updated version of the currently selected channel
          const updatedSelected = graph.master_nodes.find(
            (node) => node.connection_id === selectedMaster.connection_id
          );
          if (updatedSelected) {
            // Update with fresh data
            setSelectedMaster(updatedSelected);
          } else {
            // Selected channel was removed, select first available
            setSelectedMaster(graph.master_nodes[0]);
          }
        } else {
          // No selection yet, auto-select first
          setSelectedMaster(graph.master_nodes[0]);
        }
      } else {
        // No channels available
        setSelectedMaster(null);
      }
    } catch (error) {
      logger.error("Channels", "Failed to load channel graph", error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const handleReconnect = async (connectionId: string, channelName: string) => {
    try {
      setReconnectingId(connectionId);
      const currentOrigin = window.location.origin;
      const successRedirectUri = `${currentOrigin}/youtube/connect/success?connection_type=reconnect&connection_id=${connectionId}&redirect_to=/channels`;

      const response = await youtubeAPI.initiateConnection(successRedirectUri);

      if (response.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      logger.error("Channels", `Failed to reconnect ${channelName}`, error);
      setReconnectingId(null);
    }
  };

  const handleAddChannel = async () => {
    try {
      const currentOrigin = window.location.origin;
      const successRedirectUri = `${currentOrigin}/youtube/connect/success?connection_type=satellite&redirect_to=/channels`;

      const response = await youtubeAPI.initiateConnection(successRedirectUri);

      if (response.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      logger.error("Channels", "Failed to add channel", error);
    }
  };

  const handleSetPrimary = async (connectionId: string, channelName: string) => {
    try {
      await youtubeAPI.setPrimaryConnection(connectionId);
      logger.info("Channels", `Set ${channelName} as primary`);
      // Reload the graph to reflect changes
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to set ${channelName} as primary`, error);
    }
  };

  const handleRemoveChannel = async (connectionId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to remove ${channelName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await youtubeAPI.disconnectChannel(connectionId);
      logger.info("Channels", `Removed ${channelName}`);
      // Reload the graph (will handle selection automatically)
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to remove ${channelName}`, error);
    }
  };

  const handleUpdateLanguage = async (connectionId: string, languageCode: string) => {
    try {
      await youtubeAPI.updateConnection(connectionId, { language_code: languageCode });
      logger.info("Channels", `Updated language to ${languageCode}`);
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", "Failed to update language", error);
    }
  };

  // Flatten the graph for a table view
  const tableData = useMemo(() => {
    const flat: any[] = [];
    channelGraph.forEach(master => {
      // Add master
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
        masterName: null
      });

      // Add satellites
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

    // Apply filter
    return flat.filter(item => {
      if (channelFilter === "primary") return item.is_primary;
      if (channelFilter === "unassigned") return item.type === "master" && item.languagesCount === 0;
      return true;
    });
  }, [channelGraph, channelFilter]);

  if (isLoadingConnections) {
    return (
      <div className={`flex items-center justify-center h-full ${bgClass}`}>
        <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass}`} />
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${bgClass}`}>
      {/* Header */}
      <div className={`relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 border-b ${borderClass} overflow-hidden`}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-20"
            alt=""
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-dark-bg via-dark-bg/80 to-transparent' : 'from-light-bg via-light-bg/80 to-transparent'}`} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-300 ${textClass} mb-2 tracking-tight`}>Channel Network</h1>
              <p className={`text-sm sm:text-base ${textSecondaryClass} max-w-2xl`}>
                Manage your YouTube channel connections and secure your global infrastructure with ease.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className={`flex items-center gap-4 sm:gap-8 text-xs sm:text-sm ${textSecondaryClass}`}>
                <div className="flex flex-col">
                  <span className="opacity-60 uppercase text-[9px] font-bold tracking-widest mb-1">Total Assets</span>
                  <span className={`text-lg font-semibold ${textClass}`}>{graphStats.total_connections}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="opacity-60 uppercase text-[9px] font-bold tracking-widest mb-1">Health</span>
                  <span className="text-lg font-semibold text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4">
        {channelGraph.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <Youtube className={`h-16 w-16 ${textSecondaryClass} mb-4`} />
            <h2 className={`text-xl font-semibold ${textClass} mb-2`}>No Channels Connected</h2>
            <p className={`${textSecondaryClass} mb-6`}>
              Connect your YouTube channels to start managing your global content distribution.
            </p>
            <button
              onClick={handleAddChannel}
              className={`inline-flex items-center gap-2 bg-olleey-yellow text-black px-6 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all`}
            >
              <Plus className="h-5 w-5" />
              Connect First Channel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 ${cardClass} border ${borderClass} rounded-lg p-1 shadow-sm w-fit`}>
                <button
                  onClick={() => setChannelFilter("all")}
                  className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${channelFilter === "all"
                    ? "bg-olleey-yellow text-black"
                    : `${textSecondaryClass} hover:opacity-80`
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChannelFilter("primary")}
                  className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${channelFilter === "primary"
                    ? "bg-olleey-yellow text-black"
                    : `${textSecondaryClass} hover:opacity-80`
                    }`}
                >
                  Primary
                </button>
                <button
                  onClick={() => setChannelFilter("unassigned")}
                  className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${channelFilter === "unassigned"
                    ? "bg-olleey-yellow text-black"
                    : `${textSecondaryClass} hover:opacity-80`
                    }`}
                >
                  Unassigned
                </button>
              </div>

              <button
                onClick={handleAddChannel}
                className="inline-flex items-center gap-2 bg-olleey-yellow text-black px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-olleey-yellow/10"
              >
                <Plus className="h-4 w-4" />
                Add Connection
              </button>
            </div>

            {/* Table */}
            <div className={`${cardClass} border ${borderClass} rounded-2xl overflow-hidden shadow-sm`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50'} border-b ${borderClass}`}>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Channel</th>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Role</th>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Language</th>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>Status</th>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest text-center`}>Content</th>
                      <th className={`px-6 py-4 text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderClass} ${textClass}`}>
                    {tableData.map((item: any) => {
                      const statusConfig = getStatusConfig(item.status);
                      const isMaster = item.type === "master";

                      return (
                        <tr key={item.id} className={`border-b ${borderClass} ${hoverClass} transition-all group last:border-0`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {item.avatar ? (
                                  <img src={item.avatar} alt={item.name} className={`w-10 h-10 rounded-full object-cover border ${borderClass}`} />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full ${cardAltClass} border ${borderClass} flex items-center justify-center`}>
                                    <Youtube className={`h-5 w-5 ${textSecondaryClass}`} />
                                  </div>
                                )}
                                {!isMaster && (
                                  <span className="absolute -bottom-1 -right-1 text-base bg-white dark:bg-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                    {getLanguageFlag(item.language_code)}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium ${textClass} truncate max-w-[200px]`}>
                                  {item.name}
                                </p>
                                {isMaster && item.is_primary && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-olleey-yellow">
                                    PRIMARY
                                  </span>
                                )}
                                {!isMaster && (
                                  <p className={`text-[11px] ${textSecondaryClass} truncate`}>
                                    via {item.masterName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${isMaster ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" : "bg-olleey-yellow/10 text-olleey-yellow border border-olleey-yellow/20"}`}>
                              {isMaster ? "Master" : "Satellite"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                            <select
                              value={item.language_code || ""}
                              onChange={(e) => handleUpdateLanguage(item.id, e.target.value)}
                              className={`w-full bg-white/5 border ${borderClass} text-[11px] font-bold ${item.language_code ? 'text-olleey-yellow' : textSecondaryClass} rounded-lg px-3 py-2 focus:border-olleey-yellow outline-none appearance-none cursor-pointer transition-all hover:bg-white/10`}
                            >
                              <option value="" className={isDark ? "bg-dark-bg" : "bg-white"}>Assign Language...</option>
                              {LANGUAGE_OPTIONS.map(l => (
                                <option key={l.code} value={l.code} className={isDark ? "bg-dark-bg" : "bg-white text-black"}>
                                  {l.flag} {l.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                              <span className={`text-sm ${statusConfig.color} font-medium`}>{statusConfig.label}</span>
                              {item.is_paused && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center gap-1">
                                  <Pause className="h-2.5 w-2.5" /> PAUSED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span className={`text-sm font-semibold ${textClass}`}>{item.videos}</span>
                              <span className={`text-[10px] ${textSecondaryClass} uppercase`}>Videos</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isMaster && !item.is_primary && (
                                <button
                                  onClick={() => handleSetPrimary(item.id, item.name)}
                                  className={`p-2 rounded-lg ${cardAltClass} ${textSecondaryClass} hover:text-olleey-yellow transition-colors`}
                                  title="Set as Primary"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                              )}
                              {item.status !== "active" && (
                                <button
                                  onClick={() => handleReconnect(item.id, item.name)}
                                  className={`p-2 rounded-lg ${cardAltClass} ${textSecondaryClass} hover:text-olleey-yellow transition-colors`}
                                  title="Reconnect"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (isMaster) {
                                    // Handle master pause toggle (logic from existing handleMasterPauseToggle)
                                    const togglePause = async () => {
                                      try {
                                        if (item.is_paused) await channelsAPI.unpauseChannel(item.id);
                                        else await channelsAPI.pauseChannel(item.id);
                                        await loadChannelGraph();
                                      } catch (e) { logger.error("Channels", "Error toggling pause", e); }
                                    };
                                    togglePause();
                                  } else {
                                    // Handle satellite pause toggle (logic from existing handlePauseToggle)
                                    const togglePause = async () => {
                                      try {
                                        if (item.is_paused) await channelsAPI.unpauseChannel(item.id);
                                        else await channelsAPI.pauseChannel(item.id);
                                        await loadChannelGraph();
                                      } catch (e) { logger.error("Channels", "Error toggling pause", e); }
                                    };
                                    togglePause();
                                  }
                                }}
                                className={`p-2 rounded-lg ${cardAltClass} ${textSecondaryClass} hover:${item.is_paused ? 'text-green-500' : 'text-amber-500'} transition-colors`}
                                title={item.is_paused ? "Resume" : "Pause"}
                              >
                                {item.is_paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleRemoveChannel(isMaster ? item.id : item.id, item.name)}
                                className={`p-2 rounded-lg ${cardAltClass} ${textSecondaryClass} hover:text-red-500 transition-colors`}
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
