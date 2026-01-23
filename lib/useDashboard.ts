import { useState, useEffect } from "react";
import { dashboardAPI, type DashboardData } from "./api";

export function useDashboard(options: { enabled?: boolean } = { enabled: true }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options.enabled) {
      loadDashboard();
    }
  }, [options.enabled]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboard,
    loading,
    error,
    refetch: loadDashboard,
  };
}
