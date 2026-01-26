"use client";

import { useState, useEffect, useMemo } from "react";
import { youtubeAPI, channelsAPI, type MasterNode, type LanguageChannel, type YouTubeConnection } from "@/lib/api";
import { useDashboard } from "@/lib/useDashboard";
import { useProject } from "@/lib/ProjectContext";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChannelGraphView } from "@/components/ChannelGraphView";
import { ChannelBoardView } from "@/components/ChannelBoardView";
import { Loader2, Youtube, Plus, RefreshCw, CheckCircle, XCircle, AlertCircle, Radio, ChevronRight, ChevronDown, Video, Globe2, Pause, Play, Trash2, Star, List, GitGraph, Kanban } from "lucide-react";

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


const getLanguageFlag = (langCode: string): string => {
  return LANGUAGE_FLAGS[langCode] || "🌍";
};

type ChannelFilter = "all" | "primary" | "unassigned";

export default function ChannelsPage() {
  const { theme } = useTheme();
  const { selectedProject, isLoading: isProjectLoading } = useProject();
  const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterNode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<{
    connection_id: string;
    channel_id: string;
    channel_name: string;
    is_primary: boolean;
    is_unassigned: boolean;
    parent_master?: MasterNode;
    language_channel?: LanguageChannel;
    master_node?: MasterNode;
  } | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [isChannelListCollapsed, setIsChannelListCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "graph" | "board">("list");

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const [graphStats, setGraphStats] = useState({
    total_connections: 0,
    active_connections: 0,
    expired_connections: 0,
  });

  // Get all connections to detect unassigned channels
  const { dashboard, refetch: refetchDashboard } = useDashboard();

  // Channel assignment modal state (shown after OAuth success)
  const [showAssignChannelModal, setShowAssignChannelModal] = useState(false);
  const [pendingConnectionData, setPendingConnectionData] = useState<{
    connection_id: string;
    channel_id: string;
    channel_name: string;
  } | null>(null);
  const [assignAsPrimary, setAssignAsPrimary] = useState(false);
  const [selectedParentMasterId, setSelectedParentMasterId] = useState<string>("");
  const [isAssigningChannel, setIsAssigningChannel] = useState(false);

  // Language channel creation modal state (shown after assigning to parent)
  const [showLanguageChannelModal, setShowLanguageChannelModal] = useState(false);
  const [pendingChannelData, setPendingChannelData] = useState<{
    channel_id: string;
    channel_name: string;
    master_connection_id: string;
  } | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isCreatingLanguageChannel, setIsCreatingLanguageChannel] = useState(false);

  // Language options for selection
  const LANGUAGE_OPTIONS = [
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  // Find unassigned channels (not primary, not assigned as satellite to any master)
  const unassignedChannels = (() => {
    if (!dashboard?.youtube_connections) return [];

    // Get all YouTube channel IDs that are assigned (primary or satellites)
    const assignedChannelIds = new Set<string>();

    // Add all primary/master channels (by YouTube channel ID)
    channelGraph.forEach(master => {
      assignedChannelIds.add(master.channel_id);
      // Add all language channel YouTube IDs
      master.language_channels.forEach(lang => {
        assignedChannelIds.add(lang.channel_id);
      });
    });

    // Find connections that are not assigned
    return dashboard.youtube_connections.filter(conn => {
      // Skip if it's a primary channel (it's already in channelGraph as a master)
      if (conn.is_primary) return false;

      // Check if this connection's YouTube channel ID is assigned as a satellite
      // Compare YouTube channel IDs, not connection IDs
      const isAssigned = assignedChannelIds.has(conn.youtube_channel_id);

      return !isAssigned;
    });
  })();

  useEffect(() => {
    if (isProjectLoading) return;

    if (selectedProject) {
      loadChannelGraph();
    } else {
      // Clear channel graph when no project is selected
      setChannelGraph([]);
      setSelectedMaster(null);
      setSelectedChannel(null);
      setSelectedLanguage(null);
      setIsLoadingConnections(false);
    }
  }, [selectedProject?.id, isProjectLoading]); // Depend on ID to avoid loop if object ref changes

  // Reload channel graph when page becomes visible (e.g., returning from OAuth)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload graph when page becomes visible (user might have just added a channel)
        loadChannelGraph();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Check for URL parameters indicating successful channel addition
  // Show assign channel modal for ALL new connections
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const connectionId = params.get('connection_id');
    const channelId = params.get('channel_id');
    const channelName = params.get('channel_name');

    // If we have a new connection, show the assign channel modal
    if (connectionId && channelId) {
      logger.info("Channels", "New channel added, showing assign channel modal", {
        connectionId,
        channelId,
        channelName: channelName ? decodeURIComponent(channelName) : null
      });

      // Store pending connection data and show assign channel modal
      setPendingConnectionData({
        connection_id: connectionId,
        channel_id: channelId,
        channel_name: channelName ? decodeURIComponent(channelName) : channelId
      });
      setShowAssignChannelModal(true);
      setAssignAsPrimary(false);
      setSelectedParentMasterId("");

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Reload graph to get latest master channels for the dropdown
      loadChannelGraph();
    }
  }, []); // Only run once on mount

  // Check dashboard data for master_connection_id after it updates (for satellite channels)
  // This is a fallback if master_connection_id wasn't in the URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!dashboard?.youtube_connections) return;

    // Check URL params to see if we just added a channel
    const params = new URLSearchParams(window.location.search);
    const connectionId = params.get('connection_id');
    const type = params.get('type') || params.get('connection_type');

    // Only check for satellite connections
    if (type !== "satellite" && type !== "language") return;

    // Check if we already have a pending master_connection_id
    const pendingMasterId = sessionStorage.getItem("pending_master_connection_id");
    if (pendingMasterId) return; // Already have one

    // If we have a connectionId, check that specific connection
    if (connectionId) {
      const addedConnection = dashboard.youtube_connections.find(
        conn => conn.connection_id === connectionId
      );
      if (addedConnection?.master_connection_id) {
        logger.info("Channels", "Found master_connection_id from dashboard connection data", {
          connectionId: addedConnection.connection_id,
          masterConnectionId: addedConnection.master_connection_id,
          channelName: addedConnection.youtube_channel_name
        });
        sessionStorage.setItem("pending_master_connection_id", addedConnection.master_connection_id);
        // Trigger a reload to re-select the master
        loadChannelGraph();
      }
    }
  }, [dashboard?.youtube_connections?.length]); // Only run when connections count changes

  const loadChannelGraph = async () => {
    try {
      setIsLoadingConnections(true);
      const graph = await youtubeAPI.getChannelGraph(selectedProject?.id);
      const masterNodes = graph.master_nodes || [];
      setChannelGraph(masterNodes);
      setGraphStats({
        total_connections: graph.total_connections,
        active_connections: graph.active_connections,
        expired_connections: graph.expired_connections,
      });

      // Check if we have a pending master connection ID to re-select (from adding a channel)
      const pendingMasterId = sessionStorage.getItem("pending_master_connection_id");

      if (masterNodes.length > 0) {
        let masterToSelect: MasterNode | null = null;

        if (pendingMasterId) {
          // Try to re-select the master we were adding a channel to
          const foundMaster = masterNodes.find(
            (node) => node.connection_id === pendingMasterId
          );
          if (foundMaster) {
            masterToSelect = foundMaster;
            logger.info("Channels", "Re-selecting master channel after adding language channel", {
              masterId: pendingMasterId,
              channelName: masterToSelect.channel_name,
              languageChannelsCount: masterToSelect.language_channels.length,
              languageChannels: masterToSelect.language_channels.map(lc => ({
                id: lc.id,
                channel_name: lc.channel_name,
                language_codes: lc.language_codes
              }))
            });
            // Clear the stored master ID
            sessionStorage.removeItem("pending_master_connection_id");
          } else {
            logger.info("Channels", "Master channel not found for re-selection", {
              masterId: pendingMasterId,
              availableMasters: masterNodes.map(m => ({
                connection_id: m.connection_id,
                channel_name: m.channel_name
              }))
            });
          }
        }

        // If no pending master or pending master not found, preserve current selection
        if (!masterToSelect) {
          if (selectedMaster) {
            // Find the updated version of the currently selected channel
            const updatedSelected = masterNodes.find(
              (node) => node.connection_id === selectedMaster.connection_id
            );
            if (updatedSelected) {
              // Update with fresh data
              masterToSelect = updatedSelected;
            } else {
              // Selected channel was removed or belongs to different project, select first available
              masterToSelect = masterNodes[0];
              // Clear the selected channel since it's not in this project
              setSelectedChannel(null);
              setSelectedLanguage(null);
            }
          } else {
            // No selection yet, auto-select first
            masterToSelect = masterNodes[0];
          }
        }

        setSelectedMaster(masterToSelect);
      } else {
        // No channels available
        setSelectedMaster(null);
        setSelectedChannel(null);
        setSelectedLanguage(null);
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
      const response = await youtubeAPI.initiateConnection();

      if (response.auth_url) {
        // Redirect directly to backend - browser will follow redirects automatically
        window.location.href = response.auth_url;
      }
    } catch (error) {
      logger.error("Channels", `Failed to reconnect ${channelName}`, error);
      setReconnectingId(null);
    }
  };

  const handleAddChannel = async () => {
    // Redirect to the new connections page to select platform
    window.location.href = "/connections/add";
  };

  const handleAssignChannel = async () => {
    if (!pendingConnectionData) {
      logger.error("Channels", "Cannot assign channel: missing connection data");
      return;
    }

    // User must choose: make primary OR assign to parent
    if (!assignAsPrimary && !selectedParentMasterId) {
      alert("Please choose to make this channel primary or assign it to a parent channel");
      return;
    }

    try {
      setIsAssigningChannel(true);

      if (assignAsPrimary) {
        // Make it primary
        logger.info("Channels", "Setting channel as primary", {
          connectionId: pendingConnectionData.connection_id,
          channelName: pendingConnectionData.channel_name
        });

        await youtubeAPI.setPrimaryConnection(pendingConnectionData.connection_id);

        logger.info("Channels", "Channel set as primary successfully");

        // Clear modal and reload graph
        setPendingConnectionData(null);
        setShowAssignChannelModal(false);
        setAssignAsPrimary(false);
        setSelectedParentMasterId("");

        await loadChannelGraph();
      } else if (selectedParentMasterId) {
        // Assign to parent - need to create language channel
        logger.info("Channels", "Assigning channel to parent, showing language channel creation", {
          connectionId: pendingConnectionData.connection_id,
          channelId: pendingConnectionData.channel_id,
          channelName: pendingConnectionData.channel_name,
          parentMasterId: selectedParentMasterId
        });

        // Store data for language channel creation modal
        setPendingChannelData({
          channel_id: pendingConnectionData.channel_id,
          channel_name: pendingConnectionData.channel_name,
          master_connection_id: selectedParentMasterId
        });

        // Close assign modal and show language channel creation modal
        setPendingConnectionData(null);
        setShowAssignChannelModal(false);
        setAssignAsPrimary(false);
        setSelectedParentMasterId("");
        setShowLanguageChannelModal(true);
      }
    } catch (error) {
      logger.error("Channels", "Failed to assign channel", error);
      alert(`Failed to assign channel: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAssigningChannel(false);
    }
  };

  const handleCreateLanguageChannel = async () => {
    if (!pendingChannelData || selectedLanguages.length === 0) {
      logger.error("Channels", "Cannot create language channel: missing data", {
        pendingChannelData,
        selectedLanguages
      });
      return;
    }

    try {
      setIsCreatingLanguageChannel(true);

      logger.info("Channels", "Creating language channel", {
        channelId: pendingChannelData.channel_id,
        languageCodes: selectedLanguages,
        masterConnectionId: pendingChannelData.master_connection_id
      });

      // Create language channel via API
      await channelsAPI.createLanguageChannel({
        channel_id: pendingChannelData.channel_id,
        language_codes: selectedLanguages, // Use language_codes for multi-language support
        channel_name: pendingChannelData.channel_name,
        master_connection_id: pendingChannelData.master_connection_id,
        project_id: selectedProject?.id || "",
      });

      logger.info("Channels", "Language channel created successfully");

      // Store master_connection_id for re-selection
      const masterConnectionId = pendingChannelData.master_connection_id;

      // Clear pending data
      setPendingChannelData(null);
      setSelectedLanguages([]);
      setShowLanguageChannelModal(false);

      // Store master_connection_id for loadChannelGraph to use
      sessionStorage.setItem("pending_master_connection_id", masterConnectionId);

      // Reload graph to show the new language channel
      // loadChannelGraph will automatically re-select the master
      await loadChannelGraph();

      // Clear sessionStorage after re-selection
      sessionStorage.removeItem("pending_master_connection_id");
    } catch (error) {
      logger.error("Channels", "Failed to create language channel", error);
      alert(`Failed to create language channel: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCreatingLanguageChannel(false);
    }
  };

  const handleSetPrimary = async (connectionId: string, channelName: string) => {
    // Check if there is already a primary channel
    const primaryExists = channelGraph.some(m => m.is_primary);

    // Allow if we are setting the current primary (redundant but safe) or if no primary exists
    const isAlreadyPrimary = channelGraph.find(m => m.connection_id === connectionId)?.is_primary;

    if (primaryExists && !isAlreadyPrimary) {
      alert("A primary channel already exists. Please unassign the current primary channel before assigning a new one.");
      return;
    }

    try {
      await youtubeAPI.setPrimaryConnection(connectionId);
      logger.info("Channels", `Set ${channelName} as primary`);
      // Reload the graph to reflect changes
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to set ${channelName} as primary`, error);
    }
  };

  const handleAssignAsSatellite = (connectionId: string, masterConnectionId: string) => {
    // For unassigned channels, show the assign modal
    const connection = dashboard?.youtube_connections?.find(c => c.connection_id === connectionId);
    if (connection) {
      setPendingConnectionData({
        connection_id: connection.connection_id,
        channel_id: connection.youtube_channel_id,
        channel_name: connection.youtube_channel_name
      });
      setAssignAsPrimary(false);
      setSelectedParentMasterId(masterConnectionId); // Pre-select the chosen parent
      setShowAssignChannelModal(true);
    }
  };

  const handleRemoveChannel = async (connectionId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to remove ${channelName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Backend automatically unassigns associated language channels
      // No need to manually delete them - they're preserved and can be reassigned later
      const result = await youtubeAPI.disconnectChannel(connectionId);

      logger.info("Channels", `Removed ${channelName}`, {
        connectionId: result.connection_id,
        connectionType: result.connection_type,
        unassignedLanguageChannels: result.unassigned_language_channels
      });

      // Show message if language channels were unassigned
      if (result.unassigned_language_channels && result.unassigned_language_channels > 0) {
        alert(
          `${result.message}\n\n` +
          `${result.unassigned_language_channels} language channel(s) were unassigned and can be reassigned to a different master later.`
        );
      }

      // Reload the graph (will handle selection automatically)
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to remove ${channelName}`, error);
      alert(`Failed to remove channel: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleUnsetPrimary = async (connectionId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to unset ${channelName} as the primary channel? It will remain connected as a regular master channel.`)) {
      return;
    }

    try {
      await youtubeAPI.unsetPrimaryConnection(connectionId);
      logger.info("Channels", `Unset ${channelName} as primary`);

      // Reload the graph to reflect changes
      await loadChannelGraph();
    } catch (error) {
      logger.error("Channels", `Failed to unset ${channelName} as primary`, error);
      alert(`Failed to unset primary: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Get all unique language channels across all masters (by channel ID)
  const allLanguageChannels = channelGraph.reduce((acc, master) => {
    master.language_channels.forEach(lang => {
      if (!acc.find(l => l.id === lang.id)) {
        acc.push(lang);
      }
    });
    return acc;
  }, [] as LanguageChannel[]);

  // Build unified channel list with metadata
  const unifiedChannels = useMemo(() => {
    if (!dashboard?.youtube_connections) return [];

    return dashboard.youtube_connections.map(conn => {
      // Check if it's a primary/master channel
      const masterNode = channelGraph.find(m => m.connection_id === conn.connection_id);
      if (masterNode) {
        return {
          connection_id: conn.connection_id,
          channel_id: conn.youtube_channel_id,
          channel_name: conn.youtube_channel_name,
          is_primary: conn.is_primary || false,
          is_unassigned: false,
          master_node: masterNode,
          language_channel: undefined,
        };
      }

      // Check if it's a satellite/language channel
      let languageChannel: LanguageChannel | undefined;
      let parentMaster: MasterNode | undefined;

      for (const master of channelGraph) {
        languageChannel = master.language_channels.find(
          lang => lang.channel_id === conn.youtube_channel_id
        );
        if (languageChannel) {
          parentMaster = master;
          break;
        }
      }

      if (languageChannel && parentMaster) {
        return {
          connection_id: conn.connection_id,
          channel_id: conn.youtube_channel_id,
          channel_name: conn.youtube_channel_name,
          is_primary: false,
          is_unassigned: false,
          master_node: undefined,
          language_channel: languageChannel,
          parent_master: parentMaster,
        };
      }

      // Unassigned channel
      return {
        connection_id: conn.connection_id,
        channel_id: conn.youtube_channel_id,
        channel_name: conn.youtube_channel_name,
        is_primary: false,
        is_unassigned: true,
        master_node: undefined,
        language_channel: undefined,
      };
    });
  }, [dashboard?.youtube_connections, channelGraph]);

  if (isLoadingConnections) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className={`h-8 w-8 animate-spin ${textClass}Secondary`} />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${bgClass} overflow-hidden`}>
      {/* Header */}
      <div className={`flex-shrink-0 px-0 py-3 sm:py-4 md:py-6 border-b ${borderClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal ${textClass} mb-1 sm:mb-2 truncate`}>Channel Network</h1>
            <p className={`text-xs sm:text-sm md:text-base ${textClass}Secondary truncate`}>
              Manage your YouTube channel connections and language satellites
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className={`flex items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm ${textClass}Secondary border-r ${borderClass} pr-2 sm:pr-3 md:pr-6 flex-wrap`}>
              <span className="whitespace-nowrap">Total: <strong>{graphStats.total_connections}</strong></span>
              <span className="whitespace-nowrap">Active: <strong className="text-green-500">{graphStats.active_connections}</strong></span>
              {graphStats.expired_connections > 0 && (
                <span className="whitespace-nowrap">Expired: <strong className="text-red-500">{graphStats.expired_connections}</strong></span>
              )}
            </div>

            <div className={`flex items-center p-1 rounded-lg border ${borderClass} mr-2`}>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={`p-2 rounded ${viewMode === "graph" ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                title="Graph View"
              >
                <GitGraph className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`p-2 rounded ${viewMode === "board" ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                title="Board View"
              >
                <Kanban className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => handleAddChannel()}
              className={`inline-flex items-center justify-center gap-2 ${cardClass} ${textClass} px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-normal hover:${cardClass}Alt transition-colors whitespace-nowrap`}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Add Connection</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {unifiedChannels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Youtube className={`h-12 w-12 sm:h-16 sm:w-16 ${textClass}Secondary mx-auto mb-4`} />
            <h2 className={`text-lg sm:text-xl font-normal ${textClass} mb-2`}>No Channels Connected</h2>
            <p className={`text-sm sm:text-base ${textClass}Secondary mb-6`}>
              Connect your YouTube channels to start managing your global content distribution.
            </p>
            <button
              onClick={() => handleAddChannel()}
              className={`inline-flex items-center gap-2 ${cardClass} ${textClass} px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-normal hover:${cardClass}Alt transition-colors`}
            >
              <Plus className="h-5 w-5" />
              Connect First Channel
            </button>
          </div>
        </div>
      ) : viewMode === "graph" ? (
        <div className="flex-1 p-4 overflow-hidden">
          <ChannelGraphView masters={channelGraph} onAddConnection={handleAddChannel} />
        </div>
      ) : viewMode === "board" ? (
        <div className="flex-1 overflow-hidden bg-gray-50/30 dark:bg-gray-900/10">
          <ChannelBoardView masters={channelGraph} onAddConnection={handleAddChannel} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Sidebar - Master Nodes */}
          <aside className={`${isChannelListCollapsed ? "w-16 sm:w-20 p-2" : "w-full lg:w-80 xl:w-96 p-2 sm:p-4 md:p-6"} lg:overflow-y-auto flex-shrink-0 transition-all duration-200`}>
            {/* Collapse Toggle */}
            <div className="mb-4 flex items-center justify-between">
              {!isChannelListCollapsed && (
                <div className={`flex items-center gap-1 ${bgClass} border ${borderClass} rounded-lg p-1 flex-1`}>
                  <button
                    onClick={() => setChannelFilter("all")}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-normal transition-colors ${channelFilter === "all"
                      ? "bg-white text-black"
                      : `${textSecondaryClass} hover:${textClass}`
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setChannelFilter("primary")}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-normal transition-colors ${channelFilter === "primary"
                      ? "bg-white text-black"
                      : `${textSecondaryClass} hover:${textClass}`
                      }`}
                  >
                    Primary
                  </button>
                  <button
                    onClick={() => setChannelFilter("unassigned")}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-normal transition-colors ${channelFilter === "unassigned"
                      ? "bg-white text-black"
                      : `${textSecondaryClass} hover:${textClass}`
                      }`}
                  >
                    Unassigned
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsChannelListCollapsed(!isChannelListCollapsed)}
                className={`${isChannelListCollapsed ? "w-full" : "ml-2"} p-2 rounded-lg ${cardClass} border ${borderClass} hover:${cardClass}Alt transition-colors flex items-center justify-center`}
                title={isChannelListCollapsed ? "Expand" : "Collapse"}
              >
                <ChevronRight className={`h-4 w-4 ${textClass}Secondary transition-transform ${isChannelListCollapsed ? "" : "rotate-180"}`} />
              </button>
            </div>

            {/* Unified Channel List */}
            <div className={`${isChannelListCollapsed ? "space-y-2" : "space-y-3"}`}>
              {(() => {
                // Filter unified channels based on filter
                const filtered = unifiedChannels.filter(channel => {
                  if (channelFilter === "primary") {
                    return channel.is_primary;
                  }
                  if (channelFilter === "unassigned") {
                    return channel.is_unassigned;
                  }
                  return true; // "all"
                });

                if (filtered.length === 0) {
                  return (
                    <div className={`${bgClass} border ${borderClass} rounded-xl p-8 text-center`}>
                      <p className={`${textClass}Secondary text-sm`}>
                        {channelFilter === "primary" && "No primary channels found"}
                        {channelFilter === "unassigned" && "No unassigned channels"}
                        {channelFilter === "all" && "No channels found"}
                      </p>
                    </div>
                  );
                }

                return filtered.map((channel) => {
                  const isSelected = selectedChannel?.connection_id === channel.connection_id;
                  const status = channel.master_node?.status.status || channel.language_channel?.status.status || "active";

                  // Get parent master for satellite channels
                  const parentMaster = channel.parent_master || channel.master_node;

                  // Collapsed view - show only avatar
                  if (isChannelListCollapsed) {
                    return (
                      <div
                        key={channel.connection_id}
                        className={`relative w-full flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isSelected
                          ? `${cardClass} border-olleey-yellow shadow-lg`
                          : `${borderClass} hover:border-gray-600`
                          }`}
                        onClick={() => {
                          const channelData = {
                            connection_id: channel.connection_id,
                            channel_id: channel.channel_id,
                            channel_name: channel.channel_name,
                            is_primary: channel.is_primary,
                            is_unassigned: channel.is_unassigned,
                            parent_master: channel.parent_master,
                            language_channel: channel.language_channel,
                            master_node: channel.master_node,
                          };
                          setSelectedChannel(channelData);
                          if (channel.master_node) {
                            setSelectedMaster(channel.master_node);
                          } else {
                            setSelectedMaster(null);
                          }
                          setSelectedLanguage(null);
                        }}
                        title={channel.channel_name}
                      >
                        {/* Avatar only */}
                        {channel.parent_master?.channel_avatar_url ? (
                          <div className="relative">
                            <img
                              src={channel.parent_master.channel_avatar_url}
                              alt={channel.parent_master.channel_name}
                              className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${isSelected ? "border-olleey-yellow" : "${borderClass}"
                                }`}
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-olleey-yellow rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : channel.master_node?.channel_avatar_url ? (
                          <div className="relative">
                            <img
                              src={channel.master_node.channel_avatar_url}
                              alt={channel.channel_name}
                              className={`w-12 h-12 rounded-full object-cover border-2 transition-colors ${isSelected ? "border-olleey-yellow" : "${borderClass}"
                                }`}
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-olleey-yellow rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full ${cardClass}Alt border-2 flex items-center justify-center transition-colors ${isSelected ? "border-olleey-yellow" : "${borderClass}"
                              }`}>
                              <Youtube className={`h-6 w-6 ${textClass}Secondary`} />
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-olleey-yellow rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Expanded view - show full card
                  return (
                    <div
                      key={channel.connection_id}
                      className={`relative w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                        ? `${cardClass} border-olleey-yellow shadow-lg`
                        : `${borderClass} hover:border-gray-600`
                        }`}
                      onClick={() => {
                        const channelData = {
                          connection_id: channel.connection_id,
                          channel_id: channel.channel_id,
                          channel_name: channel.channel_name,
                          is_primary: channel.is_primary,
                          is_unassigned: channel.is_unassigned,
                          parent_master: channel.parent_master,
                          language_channel: channel.language_channel,
                          master_node: channel.master_node,
                        };
                        setSelectedChannel(channelData);
                        // Only set selectedMaster for master channels (primary or not), not satellites
                        if (channel.master_node) {
                          setSelectedMaster(channel.master_node);
                        } else {
                          setSelectedMaster(null);
                        }
                        setSelectedLanguage(null);
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Avatar - Show parent avatar for satellites */}
                        {channel.parent_master?.channel_avatar_url ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={channel.parent_master.channel_avatar_url}
                              alt={channel.parent_master.channel_name}
                              className={`w-9 h-9 rounded-full object-cover border-2 transition-colors ${isSelected ? "border-olleey-yellow" : `${borderClass}`
                                }`}
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-olleey-yellow rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : channel.master_node?.channel_avatar_url ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={channel.master_node.channel_avatar_url}
                              alt={channel.channel_name}
                              className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${isSelected ? "border-olleey-yellow" : `${borderClass}`
                                }`}
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-olleey-yellow rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full ${cardClass}Alt border-2 flex items-center justify-center transition-colors ${isSelected ? "border-olleey-yellow" : `${borderClass}`
                              }`}>
                              <Youtube className={`h-5 w-5 ${textClass}Secondary`} />
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className={`font-medium ${textClass} truncate text-sm`}>
                              {channel.channel_name}
                            </h3>
                            {/* Badges */}
                            {channel.is_primary && (
                              <span className="inline-flex items-center gap-1 bg-white text-black text-xs font-normal px-2 py-0.5 rounded-full flex-shrink-0">
                                <Radio className="h-3 w-3" />
                                PRIMARY
                              </span>
                            )}
                            {channel.is_unassigned && (
                              <span className="inline-flex items-center gap-1 bg-yellow-500 text-black text-xs font-normal px-2 py-0.5 rounded-full flex-shrink-0">
                                UNASSIGNED
                              </span>
                            )}
                            {channel.parent_master && (
                              <span className={`inline-flex items-center gap-1 text-xs ${textClass}Secondary flex-shrink-0`}>
                                ← {channel.parent_master.channel_name}
                              </span>
                            )}
                          </div>
                          <StatusBadge
                            status={status}
                            isPaused={channel.master_node?.is_paused}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isSelected && (
                            <ChevronRight className="h-4 w-4 text-olleey-yellow" />
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      {(channel.master_node || channel.language_channel) && (
                        <div className={`flex items-center gap-3 text-xs ${textClass}Secondary mt-2 pl-[3.25rem]`}>
                          {channel.master_node && (
                            <>
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                {channel.master_node.total_videos}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe2 className="h-3 w-3" />
                                {channel.master_node.language_channels.length} langs
                              </span>
                            </>
                          )}
                          {channel.language_channel && (
                            <span className="flex items-center gap-1">
                              <Globe2 className="h-3 w-3" />
                              {channel.language_channel.language_codes?.length || 0} languages
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </aside>

          {/* Right Panel - Detail View */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 min-w-0">
            {/* Language Detail View - Highest priority (when viewing a specific language channel) */}
            {selectedLanguage && (
              <LanguageDetailView
                channelId={selectedLanguage}
                allMasters={channelGraph}
                onBack={() => setSelectedLanguage(null)}
                onReloadGraph={loadChannelGraph}
              />
            )}

            {/* Unassigned Channel Detail View - Check before master/satellite */}
            {!selectedLanguage &&
              selectedChannel &&
              selectedChannel.is_unassigned === true &&
              (!selectedMaster || selectedMaster.connection_id !== selectedChannel.connection_id) && (
                <UnassignedChannelDetailView
                  channel={{
                    connection_id: selectedChannel.connection_id,
                    channel_id: selectedChannel.channel_id,
                    channel_name: selectedChannel.channel_name,
                    is_primary: selectedChannel.is_primary || false,
                    is_unassigned: true,
                  }}
                  onBack={() => {
                    setSelectedChannel(null);
                    setSelectedMaster(null);
                  }}
                  onAssign={(assignAsPrimary, parentMasterId) => {
                    setPendingConnectionData({
                      connection_id: selectedChannel.connection_id,
                      channel_id: selectedChannel.channel_id,
                      channel_name: selectedChannel.channel_name
                    });
                    setAssignAsPrimary(assignAsPrimary);
                    setSelectedParentMasterId(parentMasterId || "");
                    setShowAssignChannelModal(true);
                  }}
                  allMasters={channelGraph}
                  onRemove={handleRemoveChannel}
                />
              )}

            {/* Satellite/Child Channel Detail View - Check before master */}
            {!selectedLanguage &&
              selectedChannel &&
              selectedChannel.language_channel &&
              selectedChannel.parent_master &&
              selectedChannel.is_unassigned !== true &&
              selectedChannel.is_primary !== true &&
              (!selectedMaster || selectedMaster.connection_id !== selectedChannel.connection_id) && (
                <SatelliteChannelDetailView
                  channel={selectedChannel}
                  onBack={() => {
                    setSelectedChannel(null);
                    setSelectedMaster(null);
                  }}
                  onReloadGraph={loadChannelGraph}
                  allMasters={channelGraph}
                  projectId={selectedProject?.id || ''}
                />
              )}

            {/* Primary/Master Channel Detail View - Only show when explicitly a primary channel */}
            {!selectedLanguage &&
              selectedMaster &&
              selectedChannel &&
              // Check if the selected channel is a master (its own master_node points to itself)
              selectedChannel.master_node?.connection_id === selectedChannel.connection_id &&
              selectedChannel.is_unassigned !== true &&
              !selectedChannel.language_channel &&
              !selectedChannel.parent_master &&
              selectedMaster.connection_id === selectedChannel.connection_id && (
                <MasterDetailView
                  master={selectedMaster}
                  onSelectLanguage={setSelectedLanguage}
                  allMasters={channelGraph}
                  onAddChannel={handleAddChannel}
                  onSetPrimary={handleSetPrimary}
                  onUnsetPrimary={handleUnsetPrimary}
                  onRemoveChannel={handleRemoveChannel}
                  onReloadGraph={loadChannelGraph}
                />
              )}

            {/* Empty State */}
            {!selectedLanguage && !selectedChannel && !selectedMaster && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Youtube className={`h-16 w-16 ${textClass}Secondary mx-auto mb-4`} />
                  <p className={`${textClass}Secondary`}>Select a channel to view details</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )
      }

      {/* Assign Channel Modal - Shown after OAuth success */}
      {
        showAssignChannelModal && pendingConnectionData && (
          <div className={`fixed inset-0 ${bgClass}/80 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
            <div className={`${cardClass} border ${borderClass} rounded-xl p-4 sm:p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-normal ${textClass}`}>Assign Channel</h2>
                <button
                  onClick={() => {
                    setShowAssignChannelModal(false);
                    setPendingConnectionData(null);
                    setAssignAsPrimary(false);
                    setSelectedParentMasterId("");
                  }}
                  className={`${textClass}Secondary hover:${textClass}`}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className={`text-sm ${textClass}Secondary mb-2`}>New Channel:</p>
                <p className={`${textClass} font-normal text-lg`}>{pendingConnectionData.channel_name}</p>
              </div>

              <div className="mb-6">
                <p className={`text-sm ${textClass}Secondary mb-3`}>Choose how to assign this channel:</p>

                {/* Option 1: Make Primary */}
                <div className="mb-4">
                  <label className={`flex items-center gap-3 p-4 ${cardClass}Alt rounded-lg cursor-pointer hover:${cardClass}Alt transition-colors`}>
                    <input
                      type="radio"
                      name="assignOption"
                      checked={assignAsPrimary}
                      onChange={() => {
                        setAssignAsPrimary(true);
                        setSelectedParentMasterId("");
                      }}
                      className="w-4 h-4 text-olleey-yellow focus:ring-olleey-yellow"
                    />
                    <div className="flex-1">
                      <div className={`${textClass} font-normal`}>Make Primary Channel</div>
                      <div className={`text-xs ${textClass}Secondary mt-1`}>Set this as your main channel</div>
                    </div>
                  </label>
                </div>

                {/* Option 2: Assign to Parent */}
                <div>
                  <label className={`flex items-center gap-3 p-4 ${cardClass}Alt rounded-lg cursor-pointer hover:${cardClass}Alt transition-colors`}>
                    <input
                      type="radio"
                      name="assignOption"
                      checked={!assignAsPrimary && selectedParentMasterId !== ""}
                      onChange={() => {
                        setAssignAsPrimary(false);
                        if (!selectedParentMasterId && channelGraph.length > 0) {
                          setSelectedParentMasterId(channelGraph[0].connection_id);
                        }
                      }}
                      className="w-4 h-4 text-olleey-yellow focus:ring-olleey-yellow"
                    />
                    <div className="flex-1">
                      <div className={`${textClass} font-normal`}>Assign to Parent Channel</div>
                      <div className={`text-xs ${textClass}Secondary mt-1`}>Add as a language channel under a master</div>
                    </div>
                  </label>

                  {!assignAsPrimary && (
                    <div className="mt-3 ml-7">
                      <select
                        value={selectedParentMasterId}
                        onChange={(e) => setSelectedParentMasterId(e.target.value)}
                        className={`w-full ${cardClass} border ${borderClass} ${textClass} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olleey-yellow`}
                      >
                        <option value="">Select a master channel...</option>
                        {channelGraph
                          .filter(master => !master.is_paused) // Only show active masters
                          .map(master => (
                            <option key={master.connection_id} value={master.connection_id}>
                              {master.channel_name} {master.is_primary && "(Primary)"}
                            </option>
                          ))}
                      </select>
                      {channelGraph.length === 0 && (
                        <p className={`text-xs ${textClass}Secondary mt-2`}>
                          No master channels available. Make this channel primary first.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowAssignChannelModal(false);
                    setPendingConnectionData(null);
                    setAssignAsPrimary(false);
                    setSelectedParentMasterId("");
                  }}
                  className={`flex-1 px-4 py-2 ${cardClass}Alt ${textClass} rounded-full hover:${cardClass}Alt transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignChannel}
                  disabled={(!assignAsPrimary && !selectedParentMasterId) || isAssigningChannel}
                  className={`flex-1 px-4 py-2 bg-olleey-yellow ${textClass} rounded-full hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isAssigningChannel ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Assign Channel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Language Channel Creation Modal */}
      {
        showLanguageChannelModal && pendingChannelData && (
          <div className={`fixed inset-0 ${bgClass}/80 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
            <div className={`${cardClass} border ${borderClass} rounded-xl p-4 sm:p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-normal ${textClass}`}>Create Language Channel</h2>
                <button
                  onClick={() => {
                    setShowLanguageChannelModal(false);
                    setPendingChannelData(null);
                    setSelectedLanguages([]);
                  }}
                  className={`${textClass}Secondary hover:${textClass}`}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className={`text-sm ${textClass}Secondary mb-2`}>Channel:</p>
                <p className={`${textClass} font-normal`}>{pendingChannelData.channel_name}</p>
              </div>

              <div className="mb-6">
                <p className={`text-sm ${textClass}Secondary mb-3`}>Select Languages:</p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang.code]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                          ? "bg-olleey-yellow ${textClass}"
                          : "${cardClass}Alt ${textClass}Secondary hover:${cardClass}Alt"
                          }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowLanguageChannelModal(false);
                    setPendingChannelData(null);
                    setSelectedLanguages([]);
                  }}
                  className={`flex-1 px-4 py-2 ${cardClass}Alt ${textClass} rounded-full hover:${cardClass}Alt transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLanguageChannel}
                  disabled={selectedLanguages.length === 0 || isCreatingLanguageChannel}
                  className={`flex-1 px-4 py-2 bg-olleey-yellow ${textClass} rounded-full hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isCreatingLanguageChannel ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Language Channel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

interface MasterDetailViewProps {
  master: MasterNode;
  onSelectLanguage: (langCode: string) => void;
  allMasters: MasterNode[];
  onAddChannel: (masterConnectionId?: string) => void;
  onSetPrimary: (connectionId: string, channelName: string) => void;
  onUnsetPrimary: (connectionId: string, channelName: string) => void;
  onRemoveChannel: (connectionId: string, channelName: string) => void;
  onReloadGraph: () => Promise<void>;
}

function MasterDetailView({ master, onSelectLanguage, allMasters, onAddChannel, onSetPrimary, onUnsetPrimary, onRemoveChannel, onReloadGraph }: MasterDetailViewProps) {
  const { theme } = useTheme();
  const [isPausing, setIsPausing] = useState(false);
  const status = master.status.status;

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

  const handleMasterPauseToggle = async () => {
    setIsPausing(true);
    try {
      // Master channels use the connection_id for pause/unpause
      if (master.is_paused) {
        await channelsAPI.unpauseChannel(master.connection_id);
        logger.info("Channels", `Master channel ${master.channel_name} unpaused`);
      } else {
        await channelsAPI.pauseChannel(master.connection_id);
        logger.info("Channels", `Master channel ${master.channel_name} paused`);
      }
      await onReloadGraph();
    } catch (error) {
      logger.error("Channels", "Failed to toggle master channel pause", error);
    } finally {
      setIsPausing(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {master.channel_avatar_url ? (
              <img
                src={master.channel_avatar_url}
                alt={master.channel_name}
                className={`w-16 h-16 rounded-full object-cover border-2 ${borderClass}`}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${cardClass}Alt border-2 ${borderClass} flex items-center justify-center`}>
                <Youtube className={`h-8 w-8 ${textClass}Secondary`} />
              </div>
            )}
            <div className="flex-1">
              <h2 className={`text-2xl font-normal ${textClass} mb-2 flex items-center gap-3`}>
                {master.channel_name}
                {master.is_primary && (
                  <span className="inline-flex items-center gap-1 bg-white text-black text-sm font-normal px-3 py-1 rounded-full">
                    <Radio className="h-3.5 w-3.5" />
                    PRIMARY
                  </span>
                )}
                {master.is_paused && (
                  <span className="inline-flex items-center gap-1 bg-yellow-900/20 text-yellow-400 text-xs font-normal px-2 py-1 rounded-full">
                    <Pause className="h-3 w-3" />
                    Paused
                  </span>
                )}
              </h2>
              <StatusBadge
                status={status}
                isPaused={master.is_paused}
                size="md"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Pause Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className={`text-sm ${textClass}Secondary group-hover:${textClass} transition-colors`}>
                {master.is_paused ? "Paused" : "Active"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!master.is_paused}
                  onChange={handleMasterPauseToggle}
                  disabled={isPausing}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-200 ${isPausing
                  ? "${cardClass}Alt"
                  : master.is_paused
                    ? "${cardClass}Alt peer-hover:${cardClass}Alt"
                    : "bg-olleey-yellow peer-hover:bg-yellow-400"
                  }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 flex items-center justify-center ${!master.is_paused ? "translate-x-5" : ""
                    }`}>
                    {isPausing ? (
                      <Loader2 className={`h-3 w-3 animate-spin ${textClass}Secondary`} />
                    ) : master.is_paused ? (
                      <Pause className={`h-2.5 w-2.5 ${textClass}Secondary`} />
                    ) : (
                      <Play className="h-2.5 w-2.5 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            </label>

            {!master.is_primary ? (
              <button
                onClick={() => onSetPrimary(master.connection_id, master.channel_name)}
                className={`inline-flex items-center gap-2 ${cardClass} ${textClass} border ${borderClass} px-4 py-2 rounded-full text-sm font-normal hover:${cardClass}Alt transition-colors`}
              >
                <Star className="h-4 w-4" />
                Set as Primary
              </button>
            ) : (
              <button
                onClick={() => onUnsetPrimary(master.connection_id, master.channel_name)}
                className={`inline-flex items-center gap-2 bg-amber-900/20 text-amber-400 border border-amber-800/50 px-4 py-2 rounded-full text-sm font-normal hover:bg-amber-900/30 transition-colors`}
              >
                <Star className="h-4 w-4 fill-current" />
                Unset Primary
              </button>
            )}
            <button
              onClick={() => onRemoveChannel(master.connection_id, master.channel_name)}
              className="inline-flex items-center gap-2 bg-red-900/20 text-red-400 border border-red-800/50 px-4 py-2 rounded-full text-sm font-normal hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`${cardClass} border ${borderClass} rounded-xl p-4`}>
            <div className={`text-sm ${textClass}Secondary mb-1`}>Total Videos</div>
            <div className={`text-2xl font-normal ${textClass}`}>{master.total_videos}</div>
          </div>
          <div className={`${cardClass} border ${borderClass} rounded-xl p-4`}>
            <div className={`text-sm ${textClass}Secondary mb-1`}>Translations</div>
            <div className="text-2xl font-normal text-olleey-yellow">{master.total_translations}</div>
          </div>
          <div className={`${cardClass} border ${borderClass} rounded-xl p-4`}>
            <div className={`text-sm ${textClass}Secondary mb-1`}>Language Channels</div>
            <div className={`text-2xl font-normal ${textClass}`}>{master.language_channels.length}</div>
          </div>
        </div>

      </div>

      {/* Language Channels */}
      {master.is_primary && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-normal ${textClass}`}>
              Connected Language Channels ({master.language_channels.length})
            </h3>
            {master.language_channels.length === 0 && (
              <button
                onClick={() => onAddChannel(master.connection_id)}
                className={`inline-flex items-center gap-2 ${cardClass} ${textClass} border ${borderClass} px-4 py-2 rounded-full text-sm font-normal hover:${cardClass}Alt transition-colors`}
              >
                <Plus className="h-4 w-4" />
                Add Connection
              </button>
            )}
          </div>

          {master.language_channels.length === 0 ? (
            <div className={`${cardClass} border-2 border-dashed ${borderClass} rounded-xl p-12 text-center`}>
              <Youtube className={`h-16 w-16 ${textClass}Secondary mx-auto mb-4`} />
              <h4 className={`text-lg font-normal ${textClass} mb-2`}>No Language Channels Connected</h4>
              <p className={`${textClass}Secondary mb-6 max-w-md mx-auto`}>
                Connect additional YouTube channels for different languages to start dubbing your content globally.
              </p>
              <button
                onClick={() => onAddChannel(master.connection_id)}
                className={`inline-flex items-center gap-2 ${cardClass} ${textClass} border ${borderClass} px-6 py-3 rounded-full text-sm font-normal hover:${cardClass}Alt transition-colors`}
              >
                <Plus className="h-4 w-4" />
                Add Connection
              </button>
            </div>
          ) : (
            <div className={`${cardClass} border ${borderClass} rounded-xl overflow-hidden`}>
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${borderClass}`}>
                    <th className={`text-left py-3 px-4 text-xs font-normal ${textClass}Secondary uppercase tracking-wider`}>Channel</th>
                    <th className={`text-left py-3 px-4 text-xs font-normal ${textClass}Secondary uppercase tracking-wider`}>Languages</th>
                    <th className={`text-left py-3 px-4 text-xs font-normal ${textClass}Secondary uppercase tracking-wider`}>Status</th>
                    <th className={`text-left py-3 px-4 text-xs font-normal ${textClass}Secondary uppercase tracking-wider`}>Videos</th>
                    <th className={`text-right py-3 px-4 text-xs font-normal ${textClass}Secondary uppercase tracking-wider`}></th>
                  </tr>
                </thead>
                <tbody>
                  {master.language_channels.map((lang) => {
                    const langStatus = lang.status.status;
                    const languageCodes = lang.language_codes || (lang.language_code ? [lang.language_code] : []);
                    const languageNames = lang.language_names || (lang.language_name ? [lang.language_name] : []);

                    return (
                      <tr
                        key={lang.id}
                        onClick={() => onSelectLanguage(lang.id)}
                        className={`border-b ${borderClass} hover:${cardClass}Alt/50 cursor-pointer transition-colors`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {lang.channel_avatar_url ? (
                              <img
                                src={lang.channel_avatar_url}
                                alt={lang.channel_name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full ${cardClass}Alt flex items-center justify-center flex-shrink-0`}>
                                <Youtube className={`h-5 w-5 ${textClass}Secondary`} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className={`text-sm font-normal ${textClass} truncate`}>{lang.channel_name}</div>
                              {lang.is_paused && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Pause className="h-3 w-3 text-yellow-400" />
                                  <span className="text-xs text-yellow-400">Paused</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {languageCodes.map((code, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="text-lg">{getLanguageFlag(code)}</span>
                                {languageNames[idx] && (
                                  <span className={`text-sm ${textClass}Secondary`}>{languageNames[idx]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={langStatus} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-sm ${textClass}Secondary`}>{lang.videos_count}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <ChevronRight className={`h-4 w-4 ${textClass}Secondary`} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface LanguageDetailViewProps {
  channelId: string; // Changed from languageCode to channelId
  allMasters: MasterNode[];
  onBack: () => void;
  onReloadGraph: () => Promise<void>;
}

function LanguageDetailView({ channelId, allMasters, onBack, onReloadGraph }: LanguageDetailViewProps) {
  const { theme } = useTheme();
  const [isPausing, setIsPausing] = useState(false);

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

  const handlePauseToggle = async (channelId: string, currentlyPaused: boolean) => {
    setIsPausing(true);
    try {
      if (currentlyPaused) {
        await channelsAPI.unpauseChannel(channelId);
        logger.info("Channels", "Channel unpaused");
      } else {
        await channelsAPI.pauseChannel(channelId);
        logger.info("Channels", "Channel paused");
      }
      await onReloadGraph();
    } catch (error) {
      logger.error("Channels", "Failed to toggle pause", error);
    } finally {
      setIsPausing(false);
    }
  };
  // Find this language channel by ID across all masters
  const connections = allMasters
    .map((master) => {
      const langChannel = master.language_channels.find((l) => l.id === channelId);
      if (langChannel) {
        return { master, langChannel };
      }
      return null;
    })
    .filter((c) => c !== null);

  const firstConnection = connections[0];
  if (!firstConnection) return null;

  const { langChannel } = firstConnection;
  // Get all languages for this channel
  const languageCodes = langChannel.language_codes || (langChannel.language_code ? [langChannel.language_code] : []);
  const languageNames = langChannel.language_names || (langChannel.language_name ? [langChannel.language_name] : []);

  return (
    <div>
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 ${textClass}Secondary hover:${textClass} mb-6`}
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to Master Channel
      </button>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {langChannel.channel_avatar_url ? (
              <div className="relative">
                <img
                  src={langChannel.channel_avatar_url}
                  alt={langChannel.channel_name}
                  className={`w-20 h-20 rounded-full object-cover border-2 ${borderClass}`}
                />
                {/* Show all language flags */}
                <div className="absolute -bottom-1 -right-1 flex gap-0.5 flex-wrap max-w-[80px]">
                  {languageCodes.slice(0, 3).map((code, idx) => (
                    <span key={idx} className="text-2xl">
                      {getLanguageFlag(code)}
                    </span>
                  ))}
                  {languageCodes.length > 3 && (
                    <span className={`text-xs ${textClass}Secondary`}>+{languageCodes.length - 3}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-1">
                {languageCodes.slice(0, 2).map((code, idx) => (
                  <span key={idx} className="text-5xl">
                    {getLanguageFlag(code)}
                  </span>
                ))}
                {languageCodes.length > 2 && (
                  <span className={`text-sm ${textClass}Secondary self-end`}>+{languageCodes.length - 2}</span>
                )}
              </div>
            )}
            <div>
              <h2 className={`text-2xl font-normal ${textClass} mb-1`}>
                {languageNames.length > 0
                  ? `${languageNames.join(", ")} Dubbing`
                  : `${languageCodes.map(c => c.toUpperCase()).join(", ")} Dubbing`}
              </h2>
              <p className={`${textClass}Secondary`}>{langChannel.channel_name}</p>
              {langChannel.is_paused && (
                <span className="inline-flex items-center gap-1 bg-yellow-900/20 text-yellow-400 text-xs font-normal px-2 py-1 rounded-full mt-2">
                  <Pause className="h-3 w-3" />
                  Paused
                </span>
              )}
            </div>
          </div>

          {/* Pause Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className={`text-sm ${textClass}Secondary group-hover:${textClass} transition-colors`}>
                {langChannel.is_paused ? "Paused" : "Active"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!langChannel.is_paused}
                  onChange={() => handlePauseToggle(langChannel.id, langChannel.is_paused || false)}
                  disabled={isPausing}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-200 ${isPausing
                  ? "${cardClass}Alt"
                  : langChannel.is_paused
                    ? "${cardClass}Alt peer-hover:${cardClass}Alt"
                    : "bg-olleey-yellow peer-hover:bg-yellow-400"
                  }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 flex items-center justify-center ${!langChannel.is_paused ? "translate-x-5" : ""
                    }`}>
                    {isPausing ? (
                      <Loader2 className={`h-3 w-3 animate-spin ${textClass}Secondary`} />
                    ) : langChannel.is_paused ? (
                      <Pause className={`h-2.5 w-2.5 ${textClass}Secondary`} />
                    ) : (
                      <Play className="h-2.5 w-2.5 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Connected Masters */}
      <div className={`${cardClass} border ${borderClass} rounded-xl p-6 mb-6`}>
        <h3 className={`text-lg font-normal ${textClass} mb-4`}>
          Connected to {connections.length} Master Channel{connections.length > 1 ? "s" : ""}
        </h3>
        <div className="space-y-3">
          {connections.map(({ master, langChannel }) => {
            const status = langChannel.status.status;

            return (
              <div
                key={master.connection_id}
                className={`flex items-center justify-between p-4 ${bgClass} rounded-lg`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-normal ${textClass}`}>{master.channel_name}</h4>
                    {master.is_primary && (
                      <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-medium">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 text-sm ${textClass}Secondary`}>
                    <span>{langChannel.videos_count} videos</span>
                    <StatusBadge status={status} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
          <div className={`text-sm ${textClass}Secondary mb-2`}>Total Videos</div>
          <div className={`text-3xl font-normal ${textClass}`}>
            {connections.reduce((sum, c) => sum + c.langChannel.videos_count, 0)}
          </div>
        </div>
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
          <div className={`text-sm ${textClass}Secondary mb-2`}>Status</div>
          <div className="flex justify-center">
            <StatusBadge status={langChannel.status.status} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface UnassignedChannelDetailViewProps {
  channel: {
    connection_id: string;
    channel_id: string;
    channel_name: string;
    is_primary: boolean;
    is_unassigned: boolean;
  };
  onBack: () => void;
  onAssign: (assignAsPrimary: boolean, parentMasterId?: string) => void;
  onRemove: (connectionId: string, channelName: string) => void;
  allMasters: MasterNode[];
}

function UnassignedChannelDetailView({ channel, onBack, onAssign, onRemove, allMasters }: UnassignedChannelDetailViewProps) {
  const { theme } = useTheme();

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

  return (
    <div>
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 ${textSecondaryClass} hover:${textClass} mb-6`}
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full ${cardClass}Alt border-2 ${borderClass} flex items-center justify-center`}>
            <Youtube className={`h-8 w-8 ${textClass}Secondary`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className={`text-2xl font-normal ${textClass}`}>{channel.channel_name}</h2>
              <span className="inline-flex items-center gap-1 bg-yellow-500 text-black text-xs font-normal px-2 py-0.5 rounded-full">
                UNASSIGNED
              </span>
            </div>
            <p className={`text-sm ${textClass}Secondary`}>
              This channel is not assigned to any master channel
            </p>
          </div>
        </div>

        {/* Message Card */}
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-normal text-yellow-300 mb-2">
                Channel Not Assigned
              </h3>
              <p className="text-sm text-yellow-400/80 mb-4">
                This channel needs to be assigned before it can be used for dubbing. You can either make it a primary channel or assign it as a satellite to an existing master channel.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 group relative">
              <button
                onClick={() => onAssign(true)}
                disabled={allMasters.some(m => m.is_primary)}
                className={`w-full inline-flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-full text-sm font-normal hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Star className="h-4 w-4" />
                Make Primary Channel
              </button>
              {allMasters.some(m => m.is_primary) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity text-center z-10">
                  A primary channel already exists. Unassign it first.
                </div>
              )}
            </div>
            {allMasters.length > 0 && (
              <div className="flex-1 relative">
                <select
                  onChange={(e) => {
                    const masterId = e.target.value;
                    if (masterId) {
                      onAssign(false, masterId);
                    }
                  }}
                  className={`w-full appearance-none ${cardClass} border ${borderClass} ${textClass} rounded-full px-4 py-3 pr-10 text-sm font-normal hover:${cardClass}Alt cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  defaultValue=""
                >
                  <option value="" disabled>Assign as Satellite...</option>
                  {allMasters.map((master) => (
                    <option key={master.connection_id} value={master.connection_id}>
                      {master.channel_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textClass}Secondary pointer-events-none`} />
              </div>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => onRemove(channel.connection_id, channel.channel_name)}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Remove Channel
          </button>
        </div>
      </div>
    </div>
  );
}

interface SatelliteChannelDetailViewProps {
  channel: {
    connection_id: string;
    channel_id: string;
    channel_name: string;
    is_primary: boolean;
    is_unassigned: boolean;
    parent_master?: MasterNode;
    language_channel?: LanguageChannel;
    master_node?: MasterNode;
  };
  onBack: () => void;
  onReloadGraph: () => Promise<void>;
  allMasters: MasterNode[];
  projectId: string;
}

function SatelliteChannelDetailView({ channel, onBack, onReloadGraph, allMasters, projectId }: SatelliteChannelDetailViewProps) {
  const { theme } = useTheme();
  const [editingLanguages, setEditingLanguages] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    channel.language_channel?.language_codes || []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const [isUnassigning, setIsUnassigning] = useState(false);

  const LANGUAGE_OPTIONS = [
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const handleUpdateLanguages = async () => {
    if (!channel.language_channel || !channel.parent_master) return;

    // Check if languages actually changed
    const currentLanguages = channel.language_channel.language_codes || [];
    const languagesChanged =
      selectedLanguages.length !== currentLanguages.length ||
      selectedLanguages.some(lang => !currentLanguages.includes(lang));

    if (!languagesChanged) {
      setEditingLanguages(false);
      return;
    }

    try {
      setIsUpdating(true);

      // Delete existing language channel
      await channelsAPI.deleteChannel(channel.language_channel.id);

      // Recreate with new languages
      await channelsAPI.createLanguageChannel({
        project_id: projectId,
        channel_id: channel.channel_id,
        language_codes: selectedLanguages,
        channel_name: channel.channel_name,
        master_connection_id: channel.parent_master.connection_id
      });

      await onReloadGraph();
      setEditingLanguages(false);
    } catch (error) {
      logger.error("Channels", "Failed to update languages", error);
      alert(`Failed to update languages: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnassignFromParent = async () => {
    if (!confirm(`Are you sure you want to unassign ${channel.channel_name} from ${channel.parent_master?.channel_name}?`)) {
      return;
    }

    try {
      setIsUnassigning(true);
      // Delete the language channel to unassign it
      if (channel.language_channel) {
        await channelsAPI.deleteChannel(channel.language_channel.id);
      }
      await onReloadGraph();
      onBack();
    } catch (error) {
      logger.error("Channels", "Failed to unassign channel", error);
      alert(`Failed to unassign channel: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUnassigning(false);
    }
  };


  return (
    <div>
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 ${textClass}Secondary hover:${textClass} mb-6`}
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {channel.parent_master?.channel_avatar_url ? (
              <img
                src={channel.parent_master.channel_avatar_url}
                alt={channel.parent_master.channel_name}
                className={`w-16 h-16 rounded-full object-cover border-2 ${borderClass}`}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${cardClass}Alt border-2 ${borderClass} flex items-center justify-center`}>
                <Youtube className={`h-8 w-8 ${textClass}Secondary`} />
              </div>
            )}
            <div>
              <h2 className={`text-2xl font-normal ${textClass} mb-1`}>{channel.channel_name}</h2>
              <p className={`text-sm ${textClass}Secondary`}>
                Satellite of <span className={`${textClass}`}>{channel.parent_master?.channel_name}</span>
              </p>
            </div>
          </div>
          <StatusBadge
            status={channel.language_channel?.status.status || "disconnected"}
            size="sm"
          />
        </div>

        {/* Languages Section */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-normal ${textClass}`}>Assigned Languages</h3>
            {!editingLanguages && (
              <button
                onClick={() => setEditingLanguages(true)}
                className="text-sm text-olleey-yellow hover:text-yellow-500"
              >
                Edit
              </button>
            )}
          </div>

          {editingLanguages ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (isSelected) {
                          if (selectedLanguages.length > 1) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                          }
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang.code]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                        ? "bg-olleey-yellow ${textClass}"
                        : "${cardClass}Alt ${textClass}Secondary hover:${cardClass}Alt"
                        }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpdateLanguages}
                  disabled={isUpdating}
                  className={`px-4 py-2 bg-olleey-yellow ${textClass} rounded-full text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingLanguages(false);
                    setSelectedLanguages(channel.language_channel?.language_codes || []);
                  }}
                  className={`px-4 py-2 ${cardClass}Alt ${textClass} rounded-full text-sm hover:${cardClass}Alt transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.length > 0 ? (
                selectedLanguages.map((langCode) => {
                  const lang = LANGUAGE_OPTIONS.find(l => l.code === langCode);
                  return lang ? (
                    <div
                      key={langCode}
                      className={`flex items-center gap-2 px-3 py-2 ${cardClass}Alt rounded-lg`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className={`text-sm ${textClass}`}>{lang.name}</span>
                    </div>
                  ) : null;
                })
              ) : (
                <p className={`${textClass}Secondary text-sm`}>No languages assigned</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUnassignFromParent}
            disabled={isUnassigning}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUnassigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Unassigning...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Unassign from Parent
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
