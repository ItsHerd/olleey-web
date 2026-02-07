import { useState, useEffect, useCallback } from "react";
import { dashboardAPI, type DashboardData } from "./api";

export function useDashboard(params: { projectId?: string; enabled?: boolean } = {}) {
  const { projectId, enabled = true } = params;
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getDashboard(projectId);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (enabled) {
      loadDashboard();
    }
  }, [enabled, loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: loadDashboard,
  };
}
