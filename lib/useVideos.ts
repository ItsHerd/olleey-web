import { useState, useEffect, useRef } from "react";
import { videosAPI, type Video, type VideoListResponse } from "./api";

// Cache configuration
const CACHE_TTL = 30000; // 30 seconds
const CACHE_KEY_PREFIX = "videos_cache_";

interface CacheEntry {
  data: VideoListResponse;
  timestamp: number;
}

// Module-level cache storage
const cacheStore = new Map<string, CacheEntry>();

// Generate cache key from params
function getCacheKey(params?: { page?: number; page_size?: number; channel_id?: string }): string {
  const key = JSON.stringify({
    page: params?.page || 1,
    page_size: params?.page_size || 50,
    channel_id: params?.channel_id || "all",
  });
  return `${CACHE_KEY_PREFIX}${key}`;
}

// Check if cache entry is valid
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

// Clear expired cache entries
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cacheStore.entries()) {
    if (now - entry.timestamp >= CACHE_TTL) {
      cacheStore.delete(key);
    }
  }
}

export function useVideos(params?: { page?: number; page_size?: number; channel_id?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const paramsRef = useRef(params);
  const isInitialMountRef = useRef(true);

  // Update params ref when params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params?.page, params?.page_size, params?.channel_id]);

  useEffect(() => {
    const loadVideos = async (forceRefresh: boolean = false) => {
      const currentParams = paramsRef.current;
      const cacheKey = getCacheKey(currentParams);
      const cached = cacheStore.get(cacheKey);
      
      // Use cache if valid and not forcing refresh
      if (!forceRefresh && cached && isCacheValid(cached)) {
        setVideos(cached.data.videos || []);
        setTotal(cached.data.total || 0);
        setLoading(false);
        isInitialMountRef.current = false;
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data: VideoListResponse = await videosAPI.listVideos(currentParams);
        
        // Update cache
        cacheStore.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
        
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Videos error:", err);
      } finally {
        setLoading(false);
        isInitialMountRef.current = false;
      }
    };

    // Check cache first on initial mount
    const cacheKey = getCacheKey(paramsRef.current);
    const cached = cacheStore.get(cacheKey);
    
    if (cached && isCacheValid(cached) && isInitialMountRef.current) {
      // Use cached data on initial mount
      setVideos(cached.data.videos || []);
      setTotal(cached.data.total || 0);
      setLoading(false);
      isInitialMountRef.current = false;
      return;
    }

    // Clear expired entries periodically
    clearExpiredCache();
    
    // Fetch fresh data
    loadVideos(false);
  }, [params?.page, params?.page_size, params?.channel_id]);

  // Refetch function that forces refresh
  const refetch = async () => {
    const loadVideos = async () => {
      const currentParams = paramsRef.current;
      const cacheKey = getCacheKey(currentParams);
      
      try {
        setLoading(true);
        setError(null);
        const data: VideoListResponse = await videosAPI.listVideos(currentParams);
        
        // Update cache
        cacheStore.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
        
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Videos error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    await loadVideos();
  };

  return {
    videos,
    loading,
    error,
    total,
    refetch,
  };
}

// Export function to clear cache (useful for manual cache invalidation)
export function clearVideosCache() {
  cacheStore.clear();
}
