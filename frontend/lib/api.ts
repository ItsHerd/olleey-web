// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.0.0.15:8000";

// Simple logger for terminal visibility
const logToTerminal = (message: string, data?: any) => {
  // In Next.js, client-side logs appear in browser console
  // For terminal visibility, we'd need server-side logging
  // For now, comprehensive console.logs will be visible in browser dev tools
  if (data) {
    console.log(`[TERMINAL DEBUG] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[TERMINAL DEBUG] ${message}`);
  }
};

// Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  user_id: string;
  email: string | null;
  name: string | null;
  auth_provider: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Dashboard Types
export interface YouTubeConnection {
  connection_id: string;
  youtube_channel_id: string;
  youtube_channel_name: string;
  is_primary: boolean;
  connected_at: string;
}

export interface ProcessingJob {
  job_id: string;
  source_video_id: string;
  status: string;
  progress: number;
  target_languages: string[];
  created_at: string;
}

export interface LanguageChannel {
  id: string;
  channel_id: string;
  language_code: string;
  channel_name: string;
  created_at: string;
}

export interface DashboardData {
  user_id: string;
  email: string;
  name: string | null;
  auth_provider: string;
  created_at: string;
  youtube_connections: YouTubeConnection[];
  has_youtube_connection: boolean;
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  recent_jobs: ProcessingJob[];
  language_channels: LanguageChannel[];
  total_language_channels: number;
}

// Token Management
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  },
  
  setTokens: (tokens: TokenResponse): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
  },
  
  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  
  isAuthenticated: (): boolean => {
    return tokenStorage.getAccessToken() !== null;
  }
};

// API Functions
export const authAPI = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data: TokenResponse = await response.json();
    tokenStorage.setTokens(data);
    return data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const tokens: TokenResponse = await response.json();
    tokenStorage.setTokens(tokens);
    return tokens;
  },

  /**
   * Get current user info
   */
  getMe: async (): Promise<UserInfo> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenStorage.clearTokens();
      }
      const error = await response.json();
      throw new Error(error.detail || "Failed to get user info");
    }

    return await response.json();
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<TokenResponse> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      const error = await response.json();
      throw new Error(error.detail || "Token refresh failed");
    }

    const tokens: TokenResponse = await response.json();
    tokenStorage.setTokens(tokens);
    return tokens;
  },

  /**
   * Logout (clear tokens)
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenStorage.clearTokens();
      }
      const error = await response.json();
      throw new Error(error.detail || "Failed to load dashboard");
    }

    return await response.json();
  },
};

// Video Types
export interface Video {
  video_id: string;
  title: string;
  description?: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url?: string;
  duration?: number;
  published_at: string;
  view_count?: number;
  like_count?: number;
  status?: string;
}

export interface VideoListResponse {
  videos: Video[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface UploadVideoRequest {
  video_file: File;
  title: string;
  description?: string;
  channel_id?: string;
}

export interface SubscribeRequest {
  channel_id: string;
}

export interface UnsubscribeRequest {
  channel_id: string;
}

/**
 * YouTube Connection API
 * Based on FastAPI docs: http://10.0.0.15:8000/docs#/youtube-connection/
 */
export const youtubeAPI = {
  /**
   * Initiate YouTube OAuth connection
   * GET /youtube/connect - Returns OAuth URL to redirect user to YouTube
   * 
   * Since the backend redirects to Google OAuth, we can't fetch it due to CORS.
   * Instead, we redirect the browser directly to the backend endpoint.
   * The backend will handle OAuth and redirect back to frontend with code.
   * 
   * @param redirectUri - The frontend URL to redirect back to after OAuth (default: http://localhost:3000)
   */
  initiateConnection: async (redirectUri?: string): Promise<{ auth_url: string }> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    // Default redirect URI to localhost:3000
    const frontendRedirectUri = redirectUri || "http://localhost:3000";
    
    // DEBUG: Log redirect URI values (visible in browser console and terminal via Next.js)
    logToTerminal("YouTube OAuth - redirectUri parameter", redirectUri);
    logToTerminal("YouTube OAuth - frontendRedirectUri (final)", frontendRedirectUri);
    logToTerminal("YouTube OAuth - window.location.origin", typeof window !== "undefined" ? window.location.origin : "N/A");
    logToTerminal("YouTube OAuth - window.location.href", typeof window !== "undefined" ? window.location.href : "N/A");
    
    // Build the backend URL with redirect_uri parameter
    const backendUrl = `${API_BASE_URL}/youtube/connect?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`;
    logToTerminal("YouTube OAuth - backendUrl", backendUrl);
    
    // Try to get JSON response first (in case backend returns JSON with auth_url)
    try {
      const response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        redirect: "manual", // Don't follow redirects
      });
      
      logToTerminal("YouTube OAuth - Fetch response status", response.status);
      logToTerminal("YouTube OAuth - Fetch response headers", Object.fromEntries(response.headers.entries()));

      // If we get a redirect response (302/301/307), extract the location
      if (response.status === 302 || response.status === 301 || response.status === 307) {
        const location = response.headers.get("Location");
        if (location) {
          return { auth_url: location };
        }
      }

      // If we get a successful JSON response
      if (response.ok) {
        const data = await response.json();
        if (data.auth_url) {
          return data;
        }
      }

      // If response indicates an error (but not CORS/network error)
      if (!response.ok && response.status !== 0) {
        try {
          const error = await response.json();
          throw new Error(error.detail || "Failed to initiate YouTube connection");
        } catch {
          throw new Error(`Failed to initiate YouTube connection: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      // If it's a network/CORS error (status 0, TypeError, or fetch fails)
      // This is expected when backend redirects to Google OAuth
      // In this case, redirect browser directly to backend endpoint
      if (
        error instanceof TypeError ||
        (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("0")))
      ) {
        // Return backend URL with redirect_uri - browser will redirect there
        // Backend should handle OAuth and redirect back to frontend callback
        return { auth_url: backendUrl };
      }
      // Re-throw other errors
      throw error;
    }

    // Fallback: return backend endpoint URL with redirect_uri
    // Browser will redirect there and backend handles OAuth flow
    return { auth_url: backendUrl };
  },

  /**
   * Complete YouTube connection (OAuth callback)
   * GET /youtube/connect/callback?code=...&state=...
   * 
   * Note: The backend callback endpoint should process the OAuth code and then
   * redirect back to the frontend. If we're calling this from the frontend,
   * it means the backend redirected to the frontend with the code.
   */
  completeConnection: async (code: string, state?: string): Promise<{ success: boolean; connection_id?: string }> => {
    let url = `${API_BASE_URL}/youtube/connect/callback?code=${encodeURIComponent(code)}`;
    if (state) {
      url += `&state=${encodeURIComponent(state)}`;
    }

    logToTerminal("YouTube API - completeConnection URL", url);
    logToTerminal("YouTube API - completeConnection code", code);
    logToTerminal("YouTube API - completeConnection state", state);

    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    logToTerminal("YouTube API - completeConnection response status", response.status);
    logToTerminal("YouTube API - completeConnection response ok", response.ok);

    if (!response.ok) {
      // Try to get error details
      let errorDetail = "Failed to complete YouTube connection";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
        logToTerminal("YouTube API - completeConnection error data", errorData);
      } catch {
        // If response is not JSON, use status text
        errorDetail = `Failed to complete YouTube connection: ${response.status} ${response.statusText}`;
        logToTerminal("YouTube API - completeConnection non-JSON error", { status: response.status, statusText: response.statusText });
      }
      
      // If 404, provide more specific error message
      if (response.status === 404) {
        throw new Error(`Backend callback endpoint not found (404). Please ensure /youtube/connect/callback is configured on the backend. ${errorDetail}`);
      }
      
      throw new Error(errorDetail);
    }

    const result = await response.json();
    logToTerminal("YouTube API - completeConnection success result", result);
    return result;
  },

  /**
   * List all YouTube connections
   * GET /youtube/connect/connections
   */
  listConnections: async (): Promise<YouTubeConnection[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connect/connections`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list YouTube connections");
    }

    return await response.json();
  },

  /**
   * Disconnect YouTube channel
   * DELETE /youtube/connect/connections/{connection_id}
   */
  disconnectChannel: async (connectionId: string): Promise<{ success: boolean }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connect/connections/${connectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to disconnect YouTube channel");
    }

    return await response.json();
  },
};

/**
 * Videos API
 * Based on FastAPI docs: http://10.0.0.15:8000/docs#/videos/
 */
export const videosAPI = {
  /**
   * List videos
   * GET /videos/list
   */
  listVideos: async (params?: { page?: number; page_size?: number; channel_id?: string }): Promise<VideoListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.channel_id) queryParams.append("channel_id", params.channel_id);

    const url = `${API_BASE_URL}/videos/list${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list videos");
    }

    return await response.json();
  },

  /**
   * Upload video
   * POST /videos/upload
   */
  uploadVideo: async (data: UploadVideoRequest): Promise<{ video_id: string; success: boolean }> => {
    const formData = new FormData();
    formData.append("video_file", data.video_file);
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.channel_id) formData.append("channel_id", data.channel_id);

    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to upload video");
    }

    return await response.json();
  },

  /**
   * Subscribe to channel
   * POST /videos/subscribe
   */
  subscribe: async (data: SubscribeRequest): Promise<{ success: boolean }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/videos/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to subscribe to channel");
    }

    return await response.json();
  },

  /**
   * Unsubscribe from channel
   * POST /videos/unsubscribe
   */
  unsubscribe: async (data: UnsubscribeRequest): Promise<{ success: boolean }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/videos/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to unsubscribe from channel");
    }

    return await response.json();
  },
};

/**
 * Make an authenticated API request
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = tokenStorage.getAccessToken();
  
  if (!token) {
    throw new Error("No access token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      await authAPI.refresh();
      // Retry the request with new token
      const newToken = tokenStorage.getAccessToken();
      if (newToken) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    } catch (error) {
      tokenStorage.clearTokens();
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};
