"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardAPI, type ActivityItem } from "@/lib/api";
import { useProject } from "@/lib/ProjectContext";
import { useAuth } from "@/lib/AuthContext";
import { useDashboardJobs } from "@/lib/useDashboardJobs";

type NotificationType = "success" | "error" | "warning" | "info";
type NotificationCategory = "job" | "channel" | "system";

type NotificationItem = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
};

export function NotificationsView({ theme: _theme }: { theme: string }) {
  const { selectedProject } = useProject();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { jobs, loading: loadingJobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: user?.id,
    enabled: !!user?.id,
    limit: 50,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingActivities(true);
        const data = await dashboardAPI.getActivity(selectedProject?.id, 50);
        setActivities(Array.isArray(data) ? data : []);
      } catch {
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };
    load();
  }, [selectedProject?.id]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    for (const job of jobs || []) {
      const jobAny = job as any;
      if (job.status === "completed") {
        items.push({
          id: `job-${job.job_id}-completed`,
          type: "success",
          category: "job",
          title: "Processing completed",
          message: `Video ${job.source_video_id} is ready for review.`,
          timestamp: jobAny.updated_at || job.created_at || new Date().toISOString(),
        });
      } else if (job.status === "failed") {
        items.push({
          id: `job-${job.job_id}-failed`,
          type: "error",
          category: "job",
          title: "Processing failed",
          message: `Video ${job.source_video_id} failed. ${jobAny.error_message || "Check pipeline details."}`,
          timestamp: jobAny.updated_at || job.created_at || new Date().toISOString(),
        });
      } else if (job.status === "waiting_approval" && (job.progress || 0) === 0) {
        items.push({
          id: `job-${job.job_id}-detected`,
          type: "info",
          category: "channel",
          title: "New upload detected",
          message: `Video ${job.source_video_id} is waiting for start approval.`,
          timestamp: jobAny.updated_at || job.created_at || new Date().toISOString(),
        });
      }
    }

    for (const activity of activities || []) {
      if (!activity.message || activity.message === "Unknown Action") continue;

      const type: NotificationType =
        activity.icon === "alert" ? "warning" : activity.icon === "check" ? "success" : "info";
      const category: NotificationCategory =
        ["youtube", "upload", "channel"].includes(activity.icon) ? "channel" :
          ["plus", "zap"].includes(activity.icon) ? "job" : "system";

      items.push({
        id: `activity-${activity.id}`,
        type,
        category,
        title: activity.type || "System event",
        message: activity.message,
        timestamp: activity.timestamp || new Date().toISOString(),
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, 100);
  }, [jobs, activities]);

  const isLoading = loadingJobs || loadingActivities;
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const iconForType = (type: NotificationType) => {
    if (type === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  const markAsRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllAsRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto p-8 space-y-5">
        <Card>
          <CardHeader className="pb-4 flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Notifications</CardTitle>
              <CardDescription>
                Activity updates from jobs, channels, and system events.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary">
                {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
              </Badge>
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={notifications.length === 0}>
                Mark all as read
              </Button>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Click an item to mark it as read.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {notifications.map((item) => {
                  const unread = !readIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors ${unread ? "border-primary/40 bg-primary/5" : "hover:bg-muted/30"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{iconForType(item.type)}</div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{item.title}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                              <span className="text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
