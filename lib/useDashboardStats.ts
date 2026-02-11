import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authenticatedFetch } from "./api";

export interface DashboardStats {
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_language_channels: number;
  weekly_stats: {
    videos_completed: number;
    languages_added: number;
    growth_percentage: number;
  };
  credits: {
    used: number;
    limit: number;
    reset_date: string;
  };
}

export function useDashboardStats(params: { projectId?: string; enabled?: boolean } = {}) {
  const { projectId, enabled = true } = params;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!enabled) return;

    console.log('[useDashboardStats] Loading stats...', { projectId });
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (projectId) queryParams.append("project_id", projectId);

      const url = `${API_BASE_URL}/dashboard/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await authenticatedFetch(url, { method: "GET" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load stats: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useDashboardStats] Stats loaded:', data);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load stats";
      setError(errorMessage);
      console.error("[useDashboardStats] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, enabled]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  };
}
