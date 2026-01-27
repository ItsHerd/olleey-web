// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Simple logger for terminal visibility
// Sends logs to server API route which logs to terminal
const logToTerminal = async (message: string, data?: any) => {
  // Log to browser console
  if (data) {
    console.log(`[API DEBUG] ${message}`, data);
  } else {
    console.log(`[API DEBUG] ${message}`);
  }

  // Also send to server for terminal visibility
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'API', message, data }),
      }).catch(() => { }); // Silently fail if endpoint doesn't exist
    } catch {
      // Ignore errors
    }
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
  language_code?: string;
  language_name?: string;
  is_primary: boolean;
  connected_at: string;
  connection_type?: "master" | "satellite"; // Type of connection
  master_connection_id?: string; // For satellite connections, the master they belong to
}

export interface ChannelStatus {
  status: "active" | "expired" | "restricted" | "disconnected";
  last_checked: string;
  token_expires_at: string | null;
  permissions: string[];
}

export interface ChannelStatistics {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  hiddenSubscriberCount: boolean;
}

export interface LanguageChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_avatar_url?: string;
  language_code: string;
  language_name: string;
  created_at: string;
  status: {
    status: "active" | "expired" | "restricted" | "disconnected";
    permissions: string[];
  };
  statistics?: ChannelStatistics;
  videos_count: number;
  last_upload: string | null;
  is_paused?: boolean;
}

export interface MasterNode {
  connection_id: string;
  channel_id: string;
  channel_name: string;
  channel_avatar_url?: string;
  language_code?: string;
  language_name?: string;
  is_primary: boolean;
  is_paused?: boolean;
  connected_at: string;
  status: ChannelStatus;
  statistics?: ChannelStatistics;
  language_channels: LanguageChannel[];
  total_videos: number;
  total_translations: number;
}

export interface Project {
  id: string;
  name: string;
  master_connection_id?: string;
  created_at: string;
}

export interface ChannelGraphResponse {
  master_nodes: MasterNode[];
  total_connections: number;
  active_connections: number;
  expired_connections: number;
}

export interface ProcessingJob {
  job_id: string;
  source_video_id: string;
  status: string;
  progress: number;
  target_languages: string[];
  created_at: string;
  project_id?: string;
}

// Note: LanguageChannel interface is defined above with full details
// This is kept for reference - DashboardData uses the full LanguageChannel interface

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
  weekly_stats?: {
    videos_completed: number;
    languages_added: number;
    growth_percentage: number;
  };
  credits_summary?: {
    total_credits: number;
    used_credits: number;
    remaining_credits: number;
  };
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  icon: string;
  color: string;
  type?: string;
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
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
    } catch (fetchError) {
      // Network error (no response from server)
      const networkError = new Error("NETWORK_ERROR");
      (networkError as any).originalError = fetchError;
      throw networkError;
    }

    if (!response.ok) {
      let errorDetail = "Login failed";
      let errorCode: string | undefined;

      try {
        const error = await response.json();
        errorDetail = error.detail || error.message || errorDetail;
        errorCode = error.code || error.error_code;
      } catch {
        // If response is not JSON, use status text
        errorDetail = response.statusText || `HTTP ${response.status}`;
      }

      const error = new Error(errorCode || errorDetail);
      (error as any).code = errorCode;
      (error as any).status = response.status;
      throw error;
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
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenStorage.clearTokens();
      }
      const error = await response.json();
      throw new Error(error.detail || "Failed to change password");
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
   * Logout (clear tokens and session cache)
   */
  logout: (): void => {
    tokenStorage.clearTokens();
    // Clear sessionStorage to remove any cached data
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  },

  /**
   * Authenticate with Google OAuth (handles both login and registration)
   * @param idToken - Google ID token from Google Sign-In
   * Backend automatically handles whether this is a login or registration
   */
  googleAuth: async (idToken: string): Promise<TokenResponse> => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
      });
    } catch (fetchError) {
      // Network error (no response from server)
      const networkError = new Error("NETWORK_ERROR");
      (networkError as any).originalError = fetchError;
      throw networkError;
    }

    if (!response.ok) {
      let errorDetail = "Google authentication failed";
      let errorCode: string | undefined;

      try {
        const error = await response.json();
        errorDetail = error.detail || error.message || errorDetail;
        errorCode = error.code || error.error_code;
      } catch {
        // If response is not JSON, use status text
        errorDetail = response.statusText || `HTTP ${response.status}`;
      }

      const error = new Error(errorCode || errorDetail);
      (error as any).code = errorCode;
      (error as any).status = response.status;
      throw error;
    }

    const data: TokenResponse = await response.json();
    tokenStorage.setTokens(data);
    return data;
  },

  /**
   * Generates the Google OAuth2 authorization URL for custom buttons
   */
  getGoogleAuthUrl: (clientId: string): string => {
    const redirectUri = window.location.origin + '/app';
    const scope = 'openid profile email';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2);

    // Using Google Identity Services redirect endpoint
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${nonce}`;
  },
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  /**
   * Get dashboard data
   */
  getDashboard: async (projectId?: string): Promise<DashboardData> => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append("project_id", projectId);

    const url = `${API_BASE_URL}/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
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

  /**
   * Get global activity feed
   */
  getActivity: async (projectId?: string): Promise<ActivityItem[]> => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append("project_id", projectId);

    const url = `${API_BASE_URL}/dashboard/activity${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to load activity feed");
    }

    return await response.json();
  },
};

// Video Types
export interface LocalizationInfo {
  status: "not-started" | "processing" | "draft" | "live";
  progress: number;
  video_url?: string;
  job_id?: string;
}

export interface Video {
  video_id: string;
  title: string;
  description?: string;
  channel_id: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: number;
  published_at: string;
  view_count?: number;
  global_views?: number;
  like_count?: number;
  status?: string;
  video_type?: "original" | "translated";
  source_video_id?: string | null;
  translated_languages?: string[];
  localizations?: Record<string, LocalizationInfo>;
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
 * Projects API
 */
export const projectsAPI = {
  listProjects: async (): Promise<Project[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/projects`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list projects");
    }

    return await response.json();
  },

  createProject: async (data: { name: string; master_connection_id?: string }): Promise<Project> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create project");
    }

    return await response.json();
  },
};

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
  /**
   * Initiate YouTube OAuth connection
   * Redirects to backend with token - backend handles OAuth flow and redirects back
   * @param options - Optional parameters for OAuth connection
   * @param options.master_connection_id - Master connection ID to associate language channel with (for satellite connections)
   */
  initiateConnection: async (options?: string | { master_connection_id?: string; redirect_to?: string }): Promise<{ auth_url: string }> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    // Build the backend URL with token as query parameter
    // Backend will handle redirect_uri configuration internally
    const url = new URL(`${API_BASE_URL}/youtube/connect`);
    url.searchParams.set("token", token);

    // Handle options (either string redirect_to or object with options)
    if (typeof options === "string") {
      url.searchParams.set("redirect_to", options);
    } else if (options) {
      if (options.master_connection_id) {
        url.searchParams.set("master_connection_id", options.master_connection_id);
      }
      if (options.redirect_to) {
        url.searchParams.set("redirect_to", options.redirect_to);
      }
    }

    const backendUrl = url.toString();
    logToTerminal("YouTube OAuth - Redirecting to backend", backendUrl);

    // Return the backend URL - the frontend will redirect to it
    // Browser will automatically follow redirects from backend → Google → backend → frontend
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
   * 
   * Response includes:
   * - message: Success message with details about unassigned language channels
   * - connection_id: The disconnected connection ID
   * - connection_type: Type of connection (master/satellite)
   * - unassigned_language_channels: Number of language channels that were unassigned
   */
  disconnectChannel: async (connectionId: string): Promise<{
    message: string;
    connection_id: string;
    connection_type?: "master" | "satellite";
    unassigned_language_channels?: number;
  }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connect/connections/${connectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to disconnect YouTube channel");
    }

    return await response.json();
  },

  /**
   * Get channel graph (hub & spoke visualization data)
   * GET /channels/graph - Returns master nodes with satellite language channels
   */
  getChannelGraph: async (projectId?: string): Promise<ChannelGraphResponse> => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append("project_id", projectId);

    const url = `${API_BASE_URL}/youtube/channel_graph${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get channel graph");
    }

    return await response.json();
  },

  /**
   * Set primary YouTube connection
   * PUT /youtube/connections/{connection_id}/set-primary
   */
  setPrimaryConnection: async (connectionId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connections/${connectionId}/set-primary`, {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to set primary connection");
    }

    return await response.json();
  },

  /**
   * Unset primary YouTube connection
   * DELETE /youtube/connections/{connection_id}/unset-primary
   */
  unsetPrimaryConnection: async (connectionId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connections/${connectionId}/unset-primary`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to unset primary connection");
    }

    return await response.json();
  },

  /**
   * Update YouTube connection (e.g., change language)
   * PATCH /youtube/connections/{connection_id}
   */
  updateConnection: async (connectionId: string, data: { language_code?: string }): Promise<YouTubeConnection> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/youtube/connections/${connectionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update connection");
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
  listVideos: async (params?: { page?: number; page_size?: number; channel_id?: string; project_id?: string; video_type?: "all" | "original" | "translated" }): Promise<VideoListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.channel_id) queryParams.append("channel_id", params.channel_id);
    if (params?.project_id) queryParams.append("project_id", params.project_id);
    if (params?.video_type) queryParams.append("video_type", params.video_type);

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
    // Note: uploadVideo typically takes channel_id which is linked to a project, so project_id might not be strictly needed in body if channel implies it.
    // But if creating a raw video without channel?
    // User said "Everything... is scoped to a Project."
    // Let's assume channel_id context covers it for upload as channel belongs to project. 

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

  /**
   * Get video by ID
   * GET /videos/{video_id}
   */
  getVideoById: async (videoId: string): Promise<Video> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get video");
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

/**
 * Voice API
 * For voice cloning and training
 */
export interface VoiceUploadResponse {
  voice_id: string;
  status: string;
  message: string;
}

export interface VoiceQualityCheck {
  passed: boolean;
  duration: number;
  quality_score: number;
  issues?: string[];
}

export const voiceAPI = {
  /**
   * Upload voice sample for training
   * POST /voice/upload
   */
  uploadVoiceSample: async (file: File): Promise<VoiceUploadResponse> => {
    const formData = new FormData();
    formData.append("voice_file", file);

    const response = await authenticatedFetch(`${API_BASE_URL}/voice/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to upload voice sample");
    }

    return await response.json();
  },

  /**
   * Check voice quality
   * POST /voice/check-quality
   */
  checkVoiceQuality: async (file: File): Promise<VoiceQualityCheck> => {
    const formData = new FormData();
    formData.append("voice_file", file);

    const response = await authenticatedFetch(`${API_BASE_URL}/voice/check-quality`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to check voice quality");
    }

    return await response.json();
  },
};

/**
 * Preferences API
 * User preferences and autopilot settings
 */
export interface UserPreferences {
  auto_draft: boolean;
  tone_match: "strict" | "loose";
  vocabulary: "genz" | "professional" | "neutral";
}

export const preferencesAPI = {
  /**
   * Save user preferences
   * POST /preferences
   */
  savePreferences: async (preferences: UserPreferences): Promise<{ success: boolean }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save preferences");
    }

    return await response.json();
  },

  /**
   * Get user preferences
   * GET /preferences
   */
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/preferences`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get preferences");
    }

    return await response.json();
  },
};

/**
 * Channels API
 * Language channel management
 */
export interface CreateLanguageChannelRequest {
  channel_id: string; // YouTube channel ID
  language_code: string;
  channel_name?: string;
  master_connection_id: string; // Master connection ID to associate with
  project_id: string;
}

export const channelsAPI = {
  /**
   * List language channels
   * GET /channels
   */
  listChannels: async (projectId?: string): Promise<LanguageChannel[]> => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append("project_id", projectId);

    const url = `${API_BASE_URL}/channels${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list channels");
    }

    return await response.json();
  },

  /**
   * Create a language channel
   * POST /channels
   */
  createLanguageChannel: async (data: CreateLanguageChannelRequest): Promise<LanguageChannel> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create language channel");
    }

    return await response.json();
  },

  /**
   * Pause a language channel
   * PUT /channels/{channel_id}/pause
   */
  pauseChannel: async (channelId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/channels/${channelId}/pause`, {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to pause channel");
    }

    return await response.json();
  },

  /**
   * Unpause a language channel
   * PUT /channels/{channel_id}/unpause
   */
  unpauseChannel: async (channelId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/channels/${channelId}/unpause`, {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to unpause channel");
    }

    return await response.json();
  },

  /**
   * Update language channel
   * PATCH /channels/{channel_id}
   */
  updateChannel: async (channelId: string, data: { channel_name?: string; is_paused?: boolean; language_code?: string }): Promise<LanguageChannel> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/channels/${channelId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update channel");
    }

    return await response.json();
  },

  /**
   * Delete a language channel
   * DELETE /channels/{channel_id}
   */
  deleteChannel: async (channelId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/channels/${channelId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete language channel");
    }

    return await response.json();
  },
};

/**
 * Jobs API
 * Processing job management
 */
export interface CreateJobRequest {
  source_video_id: string;
  source_channel_id: string;
  target_languages: string[];
  project_id: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  is_simulation?: boolean;
}

export interface JobWorkflowState {
  metadata_extraction: {
    status: "pending" | "processing" | "completed" | "failed";
    title?: string;
    description?: string;
    completed_at?: string;
  };
  translations: Record<string, {
    title_status: "pending" | "processing" | "completed" | "failed";
    description_status: "pending" | "processing" | "completed" | "failed";
    title_text?: string;
    description_text?: string;
    completed_at?: string;
  }>;
  video_dubbing: Record<string, {
    status: "pending" | "downloading" | "transcribing" | "voice_cloning" | "lip_sync" | "completed" | "failed";
    progress: number;
    video_url?: string;
    completed_at?: string;
  }>;
  thumbnails: Record<string, {
    status: "pending" | "generating" | "completed" | "failed";
    thumbnail_url?: string;
    completed_at?: string;
  }>;
  approval_status: {
    requires_review: boolean;
    approved_languages: string[];
    rejected_languages: string[];
  };
}

export interface Job {
  job_id: string;
  source_video_id: string;
  source_channel_id?: string;
  status: "pending" | "downloading" | "processing" | "voice_cloning" | "lip_sync" | "uploading" | "waiting_approval" | "ready" | "completed" | "failed";
  progress: number;
  target_languages: string[];
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  error_message?: string;
  project_id?: string;
  workflow_state?: JobWorkflowState;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
}

export interface LocalizedVideo {
  id: string;
  job_id: string;
  language_code: string;
  storage_url: string; // URL for preview
  status: string;
  created_at: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
}

export const jobsAPI = {
  /**
   * Create a new dubbing job
   * POST /jobs
   */
  createJob: async (data: CreateJobRequest): Promise<Job> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create job");
    }

    return await response.json();
  },

  /**
   * List all jobs
   * GET /jobs
   */
  listJobs: async (projectId?: string): Promise<JobListResponse> => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append("project_id", projectId);

    const url = `${API_BASE_URL}/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list jobs");
    }

    return await response.json();
  },

  /**
   * List jobs with limit
   * GET /jobs?limit={limit}
   */
  listJobsWithLimit: async (limit: number, projectId?: string): Promise<JobListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    if (projectId) queryParams.append("project_id", projectId);

    const response = await authenticatedFetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list jobs");
    }

    return await response.json();
  },

  /**
   * Get job by ID
   * GET /jobs/{job_id}
   */
  getJobById: async (jobId: string): Promise<Job> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get job");
    }

    return await response.json();
  },

  /**
   * Get localized videos for a job
   * GET /jobs/{job_id}/videos
   */
  getJobVideos: async (jobId: string): Promise<LocalizedVideo[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${jobId}/videos`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get job videos");
    }

    return await response.json();
  },

  /**
   * Approve a job
   * POST /jobs/{job_id}/approve
   */
  approveJob: async (jobId: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${jobId}/approve`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to approve job");
    }

    return await response.json();
  },
};

/**
 * User Settings API
 */
export interface UserSettings {
  theme: "light" | "dark";
  timezone: string; // IANA timezone string, e.g. "America/Los_Angeles"
  notifications: {
    email_notifications: boolean;
    distribution_updates: boolean;
    error_alerts: boolean;
  };
}

export const settingsAPI = {
  /**
   * Get current user settings
   * GET /settings
   */
  getSettings: async (): Promise<UserSettings> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/settings`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to load settings");
    }

    return await response.json();
  },

  /**
   * Update user settings
   * PATCH /settings
   */
  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save settings");
    }

    return await response.json();
  },
};
