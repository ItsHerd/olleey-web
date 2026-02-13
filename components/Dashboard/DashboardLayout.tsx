"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/useTheme";
import { LeftSidebar } from "./LeftSidebar";
import { CenterPanel } from "./CenterPanel";
import { RightSidebar } from "./RightSidebar";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";
import { useDashboardJobs } from "@/lib/useDashboardJobs";

export type ViewType = "dashboard" | "videos" | "channels" | "voices" | "settings" | "notifications" | "account" | "guardrails" | "support" | "manual_workflow" | "review" | "preview" | "processing" | "runs";
export type DetailViewType = "job-detail" | "video-detail" | "channel-detail" | null;

export interface SelectedItem {
  type: "job" | "video" | "channel" | null;
  id: string | null;
  data?: any;
}


export default function DashboardLayout() {
  const { theme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { selectedProject } = useProject();
  const userId = user?.id;
  const isDark = theme === "dark";
  const bgClass = theme === "light" ? "bg-[#EBEBDC]" : "bg-[#0A0A0A]";

  // Navigation state - must be declared before any conditional returns
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: null, id: null });
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Fetch active jobs for badge count
  const { jobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId && !!user
  });

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={`flex h-screen w-screen items-center justify-center ${isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const activeJobsCount = jobs.filter(j =>
    ['pending', 'downloading', 'processing', 'uploading'].includes(j.status)
  ).length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${bgClass}`}>
      {/* Left Sidebar - Persistent Navigation (Collapsible) */}
      <AnimatePresence mode="wait">
        {leftSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`h-full border-r ${isDark ? "border-white/10" : "border-gray-200"}`}
          >
            <LeftSidebar
              currentView={currentView}
              onViewChange={(view) => {
                setCurrentView(view);
                // Don't clear selectedItem here - job card clicks depend on the selected item data
              }}
              onSelectItem={setSelectedItem}
              activeJobsCount={activeJobsCount}
              theme={theme}
              onClose={() => setLeftSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Panel - Primary Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle button for left sidebar when closed */}
        {!leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-r-lg ${isDark ? "bg-[#1A1A1A] hover:bg-[#222]" : "bg-[#EBEBDC] hover:bg-gray-200/50"
              } border-r border-t border-b ${isDark ? "border-white/10" : "border-gray-200"} transition-all shadow-xl active:scale-95`}
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-gray-400" />
          </button>
        )}

        <CenterPanel
          currentView={currentView}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          onViewChange={(view) => {
            setCurrentView(view);
          }}
          theme={theme}
        />

        {/* Toggle button for right sidebar when closed */}
        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-l-lg ${isDark ? "bg-[#1A1A1A] hover:bg-[#222]" : "bg-[#EBEBDC] hover:bg-gray-200/50"
              } border-l border-t border-b ${isDark ? "border-white/10" : "border-gray-200"} transition-all shadow-xl active:scale-95`}
            title="Show details"
          >
            <PanelRightOpen className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Right Sidebar - Contextual Detail (Collapsible) */}
      <AnimatePresence mode="wait">
        {rightSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-l ${isDark ? "border-white/10" : "border-gray-200"}`}
          >
            <RightSidebar
              selectedItem={selectedItem}
              currentView={currentView}
              onClose={() => setRightSidebarOpen(false)}
              theme={theme}
              onViewChange={(view) => {
                setCurrentView(view);
                // Don't clear selectedItem here - RightSidebar navigations depend on the selected item
              }}
              onSelectItem={setSelectedItem}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
