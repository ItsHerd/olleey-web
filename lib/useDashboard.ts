import { useState, useEffect, useCallback } from "react";
import { dashboardAPI, type DashboardData } from "./api";

export function useDashboard(params: { projectId?: string; enabled?: boolean } = {}) {
  const { projectId, enabled = true } = params;
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    console.log('[useDashboard] Loading dashboard...', { projectId, enabled });
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getDashboard(projectId);
      console.log('[useDashboard] Dashboard data received:', data);
      console.log('[useDashboard] Data summary:', {
        total_jobs: data.total_jobs,
        active_jobs: data.active_jobs,
        recent_jobs: data.recent_jobs?.length,
        projects: data.projects?.length,
        youtube_connections: data.youtube_connections?.length,
        language_channels: data.language_channels?.length,
      });
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("[useDashboard] Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, enabled]);

  useEffect(() => {
    console.log('[useDashboard] useEffect triggered', { enabled, projectId });
    if (enabled) {
      loadDashboard();
    } else {
      console.log('[useDashboard] Skipping load (disabled)');
    }
  }, [enabled, loadDashboard, projectId]);

  return {
    dashboard,
    loading,
    error,
    refetch: loadDashboard,
  };
}
