import { useState, useEffect } from "react";
import { videosAPI, type Video, type VideoListResponse } from "./api";

export function useVideos(params?: { page?: number; page_size?: number; channel_id?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadVideos();
  }, [params?.page, params?.page_size, params?.channel_id]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: VideoListResponse = await videosAPI.listVideos(params);
      setVideos(data.videos || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
      console.error("Videos error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    total,
    refetch: loadVideos,
  };
}
