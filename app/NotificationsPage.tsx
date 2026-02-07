"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  Globe,
  AlertTriangle,
  Inbox,
  Settings,
  MoreVertical,
  Trash2,
  Check,
  Zap,
  Shield,
  Layout,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveJobs } from "@/lib/useActiveJobs";
import { useTheme } from "@/lib/useTheme";
import { dashboardAPI, type ActivityItem } from "@/lib/api";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { LoadingPanda } from "@/components/ui/LoadingPanda";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "job" | "channel" | "system";
}

export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "job" | "channel" | "system">("all");
  const { jobs } = useActiveJobs({ enabled: true });
  const { selectedProject, isLoading: projectLoading } = useProject();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Load activities
  useEffect(() => {
    // We allow fetching even if !selectedProject?.id to show global logs if needed,
    // though the API usually expects it. If projectLoading is true, we wait.
    if (projectLoading) return;

    const loadActivities = async () => {
      try {
        setIsLoadingActivities(true);
        // Fallback to undefined (global) if no project selected
        const activityData = await dashboardAPI.getActivity(selectedProject?.id);
        setActivities(activityData || []);
      } catch (error) {
        console.error("Failed to load activities for notifications:", error);
        setActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadActivities();
  }, [selectedProject?.id, projectLoading]);

  // Theme-aware classes
  const bgClass = isDark ? "bg-[#0c0c0c]" : "bg-[#f8f9fa]";
  const cardClass = isDark ? "bg-white/[0.05] backdrop-blur-2xl" : "bg-white border-gray-100 shadow-sm";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/40" : "text-gray-500";
  const borderClass = isDark ? "border-white/5" : "border-gray-200";

  const isInitialLoading = projectLoading || (isLoadingActivities && activities.length === 0);

  // Generate notifications from active jobs and other sources
  useEffect(() => {
    const generatedNotifications: Notification[] = [];

    // 1. Job-related notifications (from all jobs)
    if (Array.isArray(jobs)) {
      jobs.forEach((job) => {
        if (job.status === "completed") {
          generatedNotifications.push({
            id: `job-${job.job_id}-completed`,
            type: "success",
            title: "Dubbing Completion Alpha",
            message: `Neural pipeline synchronized. Video asset ${job.source_video_id} successfully localized.`,
            timestamp: job.updated_at || new Date().toISOString(),
            read: false,
            category: "job",
          });
        } else if (job.status === "failed") {
          generatedNotifications.push({
            id: `job-${job.job_id}-failed`,
            type: "error",
            title: "Synapse Synthesis Failure",
            message: `Neural corruption detected in ${job.source_video_id}. Error: ${job.error_message || "Unknown protocol breach"}`,
            timestamp: job.updated_at || new Date().toISOString(),
            read: false,
            category: "job",
          });
        }
      });
    }

    // 2. System Heartbeat / Activities
    if (Array.isArray(activities)) {
      activities.forEach((activity, index) => {
        const type: Notification["type"] =
          activity.icon === 'alert' ? "warning" :
            activity.icon === 'check' ? "success" : "info";

        let category: Notification["category"] = "system";
        if (['youtube', 'upload', 'channel'].includes(activity.icon)) {
          category = "channel";
        }

        const timestamp = (activity.timestamp && activity.timestamp !== "None")
          ? activity.timestamp
          : new Date().toISOString();

        generatedNotifications.push({
          id: `activity-${activity.id || index}`,
          type,
          title: activity.type ? activity.type.toUpperCase() : "HEARTBEAT",
          message: activity.message,
          timestamp,
          read: true,
          category,
        });
      });
    }

    // Always ensure at least ONE item exists for the "Log" to not be "Empty"
    // but only if we are done loading.
    if (!isInitialLoading && generatedNotifications.length === 0) {
      generatedNotifications.push({
        id: "sys-baseline",
        type: "info",
        title: "NEURAL GRID ACTIVE",
        message: "Olleey core systems are operational. Monitoring global neural streams for incoming signals.",
        timestamp: new Date().toISOString(),
        read: true,
        category: "system",
      });
    }

    // Sort by timestamp (newest first)
    generatedNotifications.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return (timeB || 0) - (timeA || 0);
    });

    setNotifications(generatedNotifications);
  }, [jobs, activities, isInitialLoading]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (filter === "unread") return !notif.read;
      if (filter === "all") return true;
      return notif.category === filter;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><CheckCircle className="h-4 w-4 text-emerald-500" /></div>;
      case "error":
        return <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20"><XCircle className="h-4 w-4 text-red-500" /></div>;
      case "warning":
        return <div className="p-2 rounded-xl bg-olleey-yellow/10 border border-olleey-yellow/20"><AlertTriangle className="h-4 w-4 text-olleey-yellow" /></div>;
      case "info":
        return <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><AlertCircle className="h-4 w-4 text-blue-500" /></div>;
    }
  };

  const getCategoryTheme = (category: Notification["category"]) => {
    switch (category) {
      case "job":
        return { icon: <RefreshCw className="h-3 w-3" />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" };
      case "channel":
        return { icon: <Globe className="h-3 w-3" />, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" };
      case "system":
        return { icon: <Shield className="h-3 w-3" />, color: "text-olleey-yellow", bg: "bg-olleey-yellow/10", border: "border-olleey-yellow/20" };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "T-0s";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className={`h-full overflow-y-auto custom-scrollbar ${bgClass}`}>
      <SEO
        title="Notifications Hub | Olleey"
        description="Monitor neural pipeline status, channel synchronizations, and system alerts."
      />

      {/* Narrative Header */}
      <div className={`relative px-6 sm:px-10 py-16 border-b ${borderClass} overflow-hidden`}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-[0.07] scale-110"
            alt=""
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-transparent to-dark-bg' : 'from-transparent to-light-bg'}`} />
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-olleey-yellow/5 rounded-full blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-olleey-yellow" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-olleey-yellow font-mono">Transmission Hub</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-300 ${textClass} tracking-tight leading-tight`}>
              Signal <span className="font-bold">Log</span>
            </h1>
            <p className={`text-base ${textSecondaryClass} max-w-lg leading-relaxed`}>
              Real-time telemetry from the global neural network. Monitor asset localization and system integrity.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                className="rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest px-6 py-6 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Check className="w-3 h-3" />
                Clear Matrix
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 p-0"
            >
              <Settings className="w-4 h-4 text-white/40" />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-8">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 font-mono ml-4">Filter Feed</span>
            <div className="space-y-1">
              {(["all", "unread", "job", "channel", "system"] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${filter === filterOption
                    ? "bg-olleey-yellow text-black font-bold shadow-lg shadow-yellow-500/10"
                    : `hover:bg-white/5 ${textSecondaryClass} hover:${textClass}`
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {filterOption === "all" && <Inbox className="w-4 h-4" />}
                    {filterOption === "unread" && <Zap className="w-4 h-4" />}
                    {filterOption === "job" && <RefreshCw className="w-4 h-4" />}
                    {filterOption === "channel" && <Globe className="w-4 h-4" />}
                    {filterOption === "system" && <Shield className="w-4 h-4" />}
                    <span className="text-xs uppercase tracking-widest font-black">{filterOption}</span>
                  </div>
                  {filterOption === "unread" && unreadCount > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filter === "unread" ? "bg-black text-olleey-yellow" : "bg-olleey-yellow text-black"}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={`${cardClass} border ${borderClass} rounded-3xl p-6 space-y-4`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Live Sync</span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-60 italic font-mono uppercase tracking-tighter">
              Awaiting next cycle... [4.2s]
            </p>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1">
          {isInitialLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-24 space-y-8">
              <LoadingPanda size={180} />
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olleey-yellow animate-pulse">Syncing Neural Signals...</p>
                <div className="flex items-center justify-center gap-2 opacity-20">
                  <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${cardClass} border ${borderClass} rounded-[3rem] p-24 text-center space-y-6`}
            >
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />
                <div className="relative z-10 w-full h-full bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center">
                  <Bell className={`h-10 w-10 ${textSecondaryClass} opacity-20`} />
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textClass} tracking-tight`}>
                  {filter === "unread" ? "Matrix Clear" : "Zero Signals"}
                </h3>
                <p className={`text-sm ${textSecondaryClass} mt-3 max-w-xs mx-auto leading-relaxed`}>
                  {filter === "unread"
                    ? "Every transmission has been verified and acknowledged."
                    : "The grid is silent. Check back after your next pipeline update."}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif) => {
                  const themeData = getCategoryTheme(notif.category);
                  return (
                    <motion.div
                      layout
                      key={notif.id}
                      variants={itemVariants}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={() => markAsRead(notif.id)}
                      className={`${cardClass} border ${borderClass} rounded-[2rem] p-6 cursor-pointer group transition-all duration-500 hover:border-olleey-yellow/20 relative overflow-hidden ${!notif.read ? 'ring-1 ring-olleey-yellow/10' : ''}`}
                    >
                      {/* Active indicator */}
                      {!notif.read && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-olleey-yellow shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                      )}

                      <div className="flex items-start gap-5">
                        <div className="shrink-0 relative">
                          {getIcon(notif.type)}
                          {!notif.read && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-olleey-yellow rounded-full border-2 border-dark-bg animate-pulse shadow-lg shadow-yellow-500/40" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-sm tracking-tight transition-colors ${notif.read ? textSecondaryClass : `font-bold ${textClass}`}`}>
                                {notif.title}
                              </h3>
                              <div className={`px-2 py-0.5 rounded-md border ${themeData?.bg} ${themeData?.border} flex items-center gap-1.5`}>
                                <div className={themeData?.color}>{themeData?.icon}</div>
                                <span className={`text-[9px] uppercase font-black tracking-widest ${themeData?.color}`}>{notif.category}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-black uppercase tracking-tighter opacity-30 shrink-0">
                              {formatTimestamp(notif.timestamp)}
                            </span>
                          </div>

                          <p className={`text-sm leading-relaxed transition-opacity ${notif.read ? 'opacity-40' : 'opacity-70 group-hover:opacity-100 italic'}`}>
                            {notif.message}
                          </p>
                        </div>

                        <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" className="w-10 h-10 rounded-xl hover:bg-white/5 p-0">
                            <MoreVertical className="w-4 h-4 text-white/20" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}

