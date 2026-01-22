"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Mail, Globe, AlertTriangle } from "lucide-react";
import { useActiveJobs } from "@/lib/useActiveJobs";
import { useTheme } from "@/lib/useTheme";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "job" | "channel" | "system">("all");
  const { activeJobs } = useActiveJobs({ interval: 5000, enabled: true });
  
  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const accentClass = theme === "light" ? "bg-light-accent" : "bg-dark-accent";

  // Generate notifications from active jobs and other sources
  useEffect(() => {
    const generatedNotifications: Notification[] = [];

    // Job-related notifications
    activeJobs.forEach((job) => {
      if (job.status === "completed") {
        generatedNotifications.push({
          id: `job-${job.job_id}-completed`,
          type: "success",
          title: "Dubbing Job Completed",
          message: `Your dubbing job for ${job.source_video_id} has been completed successfully.`,
          timestamp: job.updated_at || new Date().toISOString(),
          read: false,
          category: "job",
        });
      } else if (job.status === "failed") {
        generatedNotifications.push({
          id: `job-${job.job_id}-failed`,
          type: "error",
          title: "Dubbing Job Failed",
          message: `Your dubbing job for ${job.source_video_id} encountered an error: ${job.error_message || "Unknown error"}`,
          timestamp: job.updated_at || new Date().toISOString(),
          read: false,
          category: "job",
        });
      }
    });

    // Sort by timestamp (newest first)
    generatedNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setNotifications(generatedNotifications);
  }, [activeJobs]);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "all") return true;
    return notif.category === filter;
  });

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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: Notification["category"]) => {
    switch (category) {
      case "job":
        return <Clock className="h-4 w-4" />;
      case "channel":
        return <Globe className="h-4 w-4" />;
      case "system":
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className={`flex-1 p-6 ${bgClass}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-normal ${textClass}`}>Notifications</h2>
          <p className={`text-sm ${textClass}Secondary mt-1`}>
            Stay updated on your dubbing jobs and channel activity
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className={`px-4 py-2 ${cardClass} ${textClass} rounded-full text-sm font-normal border ${borderClass} hover:${cardClass}Alt`}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className={`mb-6 flex gap-2 border-b ${borderClass}`}>
        {(["all", "unread", "job", "channel", "system"] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 text-sm font-normal border-b-2 transition-colors ${
              filter === filterOption
                ? "border-dark-accent ${textClass}"
                : "border-transparent ${textClass}Secondary hover:${textClass}"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 ${accentClass} text-white rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className={`${cardClass} border ${borderClass} rounded-xl p-12 text-center`}>
          <Bell className={`h-16 w-16 ${textClass}Secondary mx-auto mb-4 opacity-50`} />
          <p className={`${textClass}Secondary text-lg font-normal`}>
            {filter === "unread" ? "No unread notifications" : "No notifications"}
          </p>
          <p className={`${textClass}Secondary text-sm mt-2`}>
            {filter === "unread" 
              ? "You're all caught up!" 
              : "Notifications about your jobs and channels will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`${cardClass} border ${borderClass} rounded-xl p-4 cursor-pointer transition-all hover:${cardClass}Alt ${
                !notif.read ? "border-l-4 border-l-dark-accent" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`text-sm font-normal ${notif.read ? "${textClass}Secondary" : "${textClass}"}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getCategoryIcon(notif.category)}
                      <span className={`text-xs ${textClass}Secondary`}>
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${textClass}Secondary`}>{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 ${accentClass} rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
