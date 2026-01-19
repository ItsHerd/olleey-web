"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CategoryList, Category } from "@/components/ui/category-list";
import { ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useVideos } from "@/lib/useVideos";
import type { Video } from "@/lib/api";

type DetectionState = "no-videos" | "videos-detected" | "processing";

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [detectionState, setDetectionState] = useState<DetectionState>("videos-detected");
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(false);
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos();

  const getStatusIcon = (status: Video["status"]) => {
    switch (status) {
      case "Ready":
        return (
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center" title="Ready">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "In Progress":
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center" title="In Progress">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "Distributed":
        return (
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center" title="Distributed">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center" title="Unknown">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    const colors: Record<string, string> = {
      youtube: "bg-red-500",
      tiktok: "bg-black",
      instagram: "bg-pink-500",
      facebook: "bg-blue-600",
      x: "bg-gray-900"
    };
    return (
      <div
        className={`w-6 h-6 rounded-full ${colors[platform] || "bg-gray-400"} flex items-center justify-center text-white text-xs font-bold`}
      >
        {platform[0].toUpperCase()}
      </div>
    );
  };

  const filteredVideos = useMemo(() => {
    if (!searchQuery) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter((video) =>
      video.title.toLowerCase().includes(query) ||
      video.channel_name?.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  // Mock channel statuses for each video with flags
  const getChannelStatuses = (video: Video) => {
    const channels = [
      { name: "French", flag: "🇫🇷" },
      { name: "Spanish", flag: "🇪🇸" },
      { name: "German", flag: "🇩🇪" },
      { name: "Portuguese", flag: "🇵🇹" },
      { name: "Hindi", flag: "🇮🇳" },
    ];
    return channels.map((channel) => ({
      ...channel,
      status: Math.random() > 0.5 ? "completed" : Math.random() > 0.5 ? "processing" : "pending"
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-yellow-500";
      case "pending": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const handleStartPublish = () => {
    setDetectionState("processing");
    // Simulate processing
    setTimeout(() => {
      setDetectionState("no-videos");
    }, 5000);
  };

  return (
    <div className="flex h-full bg-transparent">
      {/* Main Content - Video List */}
      <div className="flex-1 bg-transparent flex flex-col overflow-hidden">
        {/* Progress Card */}
        <div className="mb-6 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-3xl p-6 shadow-lg w-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 tracking-wider">PROGRESS</h3>
            <button className="w-8 h-8 rounded-full bg-yellow-200/50 hover:bg-yellow-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>

          {/* Big Number with Icon */}
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-12 h-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-7xl font-bold text-gray-900">
              {dashboardLoading ? "..." : dashboard?.completed_jobs || 0}
            </span>
          </div>

          {/* Stats Text */}
          <div className="mb-4">
            <p className="text-sm text-gray-900 font-medium">
              Out of {dashboardLoading ? "..." : dashboard?.total_jobs || 0} jobs
            </p>
            <p className="text-sm text-gray-900 font-medium">
              {dashboardLoading ? "..." : dashboard?.active_jobs || 0} active jobs
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all" 
                style={{ 
                  width: dashboardLoading || !dashboard || dashboard.total_jobs === 0 
                    ? '0%' 
                    : `${(dashboard.completed_jobs / dashboard.total_jobs) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Friend Avatars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-yellow-400 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {String.fromCharCode(64 + i)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar - Independent Widgets */}
      <div className="w-80 bg-transparent border-l border-gray-200 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Quick Stats Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Videos</span>
                <span className="text-sm font-semibold text-gray-900">{videos.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ready</span>
                <span className="text-sm font-semibold text-gray-700">
                  {videos.filter(v => v.status === "Ready").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-semibold text-amber-700">
                  {videos.filter(v => v.status === "In Progress").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Distributed</span>
                <span className="text-sm font-semibold text-green-700">
                  {videos.filter(v => v.status === "Distributed").length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">Video Distributed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">New Upload</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">Translation Complete</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>

          {/* Tips Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Tip</h3>
            <p className="text-sm text-gray-600">
              Upload videos in batches to save time on translation setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
