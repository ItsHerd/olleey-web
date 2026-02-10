"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Check,
  Loader2,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveJobs } from "@/lib/useActiveJobs";
import { useTheme } from "@/lib/useTheme";
import { dashboardAPI, type ActivityItem } from "@/lib/api";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { jobs } = useActiveJobs({ enabled: true });
  const { selectedProject } = useProject();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const activityData = await dashboardAPI.getActivity(selectedProject?.id);
        setActivities(Array.isArray(activityData) ? activityData : []);
      } catch (error) {
        console.error("[NotificationsPage] Failed to load activities:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [selectedProject?.id]);

  // Generate notifications from jobs and activities
  useEffect(() => {
    const generatedNotifications: Notification[] = [];

    // Add job notifications
    if (Array.isArray(jobs)) {
      jobs.forEach((job) => {
        if (job.status === "completed") {
          generatedNotifications.push({
            id: `job-${job.job_id}-completed`,
            type: "success",
            title: "Neural Pipeline Complete",
            message: `Video asset ${job.source_video_id} successfully localized and ready for deployment.`,
            timestamp: job.updated_at || new Date().toISOString(),
            read: false,
            category: "job",
          });
        } else if (job.status === "failed") {
          generatedNotifications.push({
            id: `job-${job.job_id}-failed`,
            type: "error",
            title: "Pipeline Error Detected",
            message: `Processing terminated for ${job.source_video_id}. ${job.error_message || "System diagnostics initiated."}`,
            timestamp: job.updated_at || new Date().toISOString(),
            read: false,
            category: "job",
          });
        }
      });
    }

    // Add activity notifications
    if (Array.isArray(activities)) {
      activities.forEach((activity, index) => {
        if (!activity.message || activity.message === "Unknown Action") {
          return;
        }

        const type: Notification["type"] =
          activity.icon === "alert" ? "warning" :
          activity.icon === "check" ? "success" : "info";

        let category: Notification["category"] = "system";
        if (["youtube", "upload", "channel"].includes(activity.icon)) {
          category = "channel";
        } else if (activity.icon === "plus" || activity.icon === "zap") {
          category = "job";
        }

        generatedNotifications.push({
          id: `activity-${activity.id || index}`,
          type,
          title: activity.type ? activity.type.toUpperCase() : "System Event",
          message: activity.message,
          timestamp: activity.timestamp && activity.timestamp !== "None"
            ? activity.timestamp
            : new Date().toISOString(),
          read: false,
          category,
        });
      });
    }

    // Add welcome notifications if empty
    if (!isLoading && generatedNotifications.length === 0) {
      generatedNotifications.push(
        {
          id: "welcome-1",
          type: "info",
          title: "Neural Grid Active",
          message: "Olleey core systems operational. Standing by for content ingestion protocols.",
          timestamp: new Date().toISOString(),
          read: false,
          category: "system",
        },
        {
          id: "welcome-2",
          type: "success",
          title: "Command Center Online",
          message: "All subsystems initialized. Ready to process global localization workflows.",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          read: false,
          category: "system",
        }
      );
    }

    // Sort by timestamp (newest first)
    generatedNotifications.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setNotifications(generatedNotifications);
  }, [jobs, activities, isLoading]);

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
        return (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
        );
      case "error":
        return (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        );
      case "warning":
        return (
          <div className="p-2.5 rounded-xl bg-olleey-yellow/10 border border-olleey-yellow/20 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-olleey-yellow" />
          </div>
        );
      case "info":
        return (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </div>
        );
    }
  };

  const getCategoryIcon = (category: Notification["category"]) => {
    switch (category) {
      case "job":
        return <Zap className="h-3 w-3" />;
      case "channel":
        return <Globe className="h-3 w-3" />;
      case "system":
        return <Shield className="h-3 w-3" />;
    }
  };

  const getCategoryTheme = (category: Notification["category"]) => {
    switch (category) {
      case "job":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "channel":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "system":
        return "bg-olleey-yellow/10 text-olleey-yellow border-olleey-yellow/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "T-0s";
    if (diffMins < 60) return `T-${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `T-${diffHours}h`;
    return `T-${Math.floor(diffHours / 24)}d`;
  };

  const bgClass = isDark ? "bg-[#0c0c0c]" : "bg-[#f8f9fa]";
  const cardClass = isDark ? "bg-white/[0.03] backdrop-blur-2xl border-white/5" : "bg-white border-gray-100";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/40" : "text-gray-500";
  const borderClass = isDark ? "border-white/5" : "border-gray-200";

  return (
    <div className={`h-full overflow-y-auto custom-scrollbar ${bgClass}`}>
      {/* Hero Header */}
      <div className={`relative px-6 sm:px-10 py-8 border-b ${borderClass} overflow-hidden`}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-[0.05] scale-110"
            alt=""
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-transparent via-[#0c0c0c]/80 to-[#0c0c0c]' : 'from-transparent via-gray-50/80 to-gray-50'}`} />
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-olleey-yellow/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center">
                <Bell className="w-2.5 h-2.5 text-olleey-yellow" />
              </div>
              <span className="text-[8px] uppercase font-black tracking-[0.3em] text-olleey-yellow font-mono">Signal Feed</span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-300 ${textClass} tracking-tight leading-tight`}>
              Transmission <span className="font-bold">Hub</span>
            </h1>
            <p className={`text-sm ${textSecondaryClass} max-w-lg leading-relaxed`}>
              {unreadCount > 0
                ? `${unreadCount} incoming signal${unreadCount > 1 ? 's' : ''} awaiting acknowledgment`
                : 'All transmissions verified. Neural grid synchronized.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="rounded-xl bg-olleey-yellow hover:bg-olleey-yellow/90 text-black font-black text-[10px] uppercase tracking-widest px-5 py-5 h-auto shadow-lg shadow-olleey-yellow/20 transition-all hover:shadow-xl hover:shadow-olleey-yellow/30"
            >
              <Check className="w-3.5 h-3.5 mr-2" />
              Clear All Signals
            </Button>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-olleey-yellow/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-olleey-yellow relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olleey-yellow animate-pulse">Synchronizing Neural Feed</p>
              <div className="flex items-center justify-center gap-2 opacity-20">
                <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 rounded-full bg-olleey-yellow animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardClass} border rounded-[3rem] p-20 text-center space-y-6`}
          >
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-olleey-yellow/10 rounded-full blur-2xl animate-pulse" />
              <div className={`relative z-10 w-full h-full ${cardClass} border rounded-full flex items-center justify-center`}>
                <Bell className={`h-10 w-10 ${textSecondaryClass} opacity-30`} />
              </div>
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${textClass} tracking-tight mb-2`}>
                Radio Silence
              </h3>
              <p className={`text-sm ${textSecondaryClass} max-w-sm mx-auto leading-relaxed`}>
                No active transmissions detected. The neural grid is quiet.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, duration: 0.4 }}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "group relative rounded-[2rem] border cursor-pointer transition-all duration-500",
                    cardClass,
                    !notif.read
                      ? "hover:border-olleey-yellow/30 ring-1 ring-olleey-yellow/10"
                      : "hover:border-white/10 opacity-70 hover:opacity-100"
                  )}
                >
                  {/* Unread glow indicator */}
                  {!notif.read && (
                    <>
                      <div className="absolute top-0 left-0 w-1 h-full bg-olleey-yellow rounded-l-[2rem] shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-olleey-yellow rounded-full border-2 border-[#0c0c0c] animate-pulse shadow-lg shadow-olleey-yellow/50" />
                    </>
                  )}

                  <div className="p-6 pl-8">
                    <div className="flex items-start gap-5">
                      {/* Icon */}
                      <div className="shrink-0 mt-1">
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h3 className={cn(
                              "text-sm font-bold tracking-tight transition-colors",
                              !notif.read ? textClass : textSecondaryClass
                            )}>
                              {notif.title}
                            </h3>
                            <p className={cn(
                              "text-sm leading-relaxed transition-all",
                              !notif.read ? textSecondaryClass : `${textSecondaryClass} opacity-60`
                            )}>
                              {notif.message}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider opacity-40 shrink-0">
                            {formatTimestamp(notif.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                            getCategoryTheme(notif.category)
                          )}>
                            {getCategoryIcon(notif.category)}
                            <span>{notif.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className={cn(
                    "absolute inset-0 rounded-[2rem] bg-gradient-to-r from-olleey-yellow/0 via-olleey-yellow/5 to-olleey-yellow/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  )} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Debug Panel - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/90 border border-white/10 rounded-lg p-4 text-xs font-mono text-white max-w-xs backdrop-blur-xl">
          <div className="font-bold mb-2 text-olleey-yellow">Debug Info</div>
          <div className="space-y-1 text-[10px]">
            <div>Jobs: {jobs?.length || 0}</div>
            <div>Activities: {activities.length}</div>
            <div>Notifications: {notifications.length}</div>
            <div>Unread: {unreadCount}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Project: {selectedProject?.name || 'None'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
