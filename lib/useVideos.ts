import { useState, useEffect, useRef, useCallback } from "react";
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

// Module-level in-flight request tracking (prevents duplicate simultaneous requests)
const inflightRequests = new Map<string, Promise<VideoListResponse>>();

// Generate cache key from params
function getCacheKey(params?: { page?: number; page_size?: number; channel_id?: string; project_id?: string }): string {
  const key = JSON.stringify({
    page: params?.page || 1,
    page_size: params?.page_size || 50,
    channel_id: params?.channel_id || "all",
    project_id: params?.project_id || "all",
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

export function useVideos(params?: { page?: number; page_size?: number; channel_id?: string; project_id?: string }, options: { enabled?: boolean } = { enabled: true }) {
  const { enabled = true } = options;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const paramsRef = useRef(params);
  const isInitialMountRef = useRef(true);

  // Update params ref when params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params?.page, params?.page_size, params?.channel_id, params?.project_id]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

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

      // Check if there's already an in-flight request for this key
      const existingRequest = inflightRequests.get(cacheKey);
      if (existingRequest) {
        console.log('[useVideos] Reusing in-flight request for:', cacheKey);
        try {
          setLoading(true);
          const data = await existingRequest;
          setVideos(data.videos || []);
          setTotal(data.total || 0);
          setLoading(false);
          isInitialMountRef.current = false;
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load videos");
          console.error("Videos error:", err);
          setLoading(false);
          isInitialMountRef.current = false;
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        // Create and store the promise for this request
        const requestPromise = videosAPI.listVideos(currentParams);
        inflightRequests.set(cacheKey, requestPromise);

        const data: VideoListResponse = await requestPromise;

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
        // Remove from in-flight requests
        inflightRequests.delete(cacheKey);
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
  }, [enabled, params?.page, params?.page_size, params?.channel_id, params?.project_id]);

  // Debug logging
  useEffect(() => {
    console.log('[useVideos] State updated:', {
      videosCount: videos.length,
      loading,
      error,
      total,
      params: paramsRef.current,
      cacheKey: getCacheKey(paramsRef.current),
      hasCachedData: cacheStore.has(getCacheKey(paramsRef.current))
    });
  }, [videos, loading, error, total]);

  // Refetch function that forces refresh - memoized to prevent constant re-renders
  const refetch = useCallback(async () => {
    const currentParams = paramsRef.current;
    const cacheKey = getCacheKey(currentParams);

    // Check if there's already an in-flight request for this key
    const existingRequest = inflightRequests.get(cacheKey);
    if (existingRequest) {
      console.log('[useVideos] Refetch reusing in-flight request');
      try {
        setLoading(true);
        const data = await existingRequest;
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Videos error:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create and store the promise for this request
      const requestPromise = videosAPI.listVideos(currentParams);
      inflightRequests.set(cacheKey, requestPromise);

      const data: VideoListResponse = await requestPromise;

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
      // Remove from in-flight requests
      inflightRequests.delete(cacheKey);
      setLoading(false);
    }
  }, []);

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
