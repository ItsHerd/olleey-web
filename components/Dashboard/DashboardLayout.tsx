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
import { SettingsProvider, useSettings } from "@/lib/SettingsContext";
import { resolveClientUserId } from "@/lib/user";
import { AgentView } from "./views/AgentView";

export type ViewType = "dashboard" | "videos" | "channels" | "voices" | "preferences" | "settings" | "notifications" | "account" | "analytics" | "guardrails" | "support" | "manual_workflow" | "review" | "preview" | "processing" | "runs" | "detected_uploads" | "batch_upload" | "invite_users";
export type DetailViewType = "job-detail" | "video-detail" | "channel-detail" | null;

export interface SelectedItem {
  type: "job" | "video" | "channel" | null;
  id: string | null;
  data?: any;
}


export default function DashboardLayout() {
  return (
    <SettingsProvider>
      <DashboardLayoutInner />
    </SettingsProvider>
  );
}

function DashboardLayoutInner() {
  const { theme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { selectedProject } = useProject();
  const userId = resolveClientUserId(user?.id);
  const isDark = theme === "dark";
  const bgClass = theme === "light" ? "bg-[#e8e8e8]" : "bg-[#0A0A0A]";
  const { isEnterprise } = useSettings();

  // Navigation state - must be declared before any conditional returns
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: null, id: null });
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Auto-collapse sidebars on review view
  const prevViewRef = React.useRef<ViewType>(currentView);
  React.useEffect(() => {
    if (currentView === "review") {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    } else if (prevViewRef.current === "review") {
      // Restore sidebars when leaving review mode
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
    }
    prevViewRef.current = currentView;
  }, [currentView]);

  // Fetch active jobs for badge count
  const { jobs } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId
  });

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={`flex h-screen w-screen items-center justify-center ${isDark ? "bg-[#0A0A0A]" : "bg-[#e8e8e8]"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login only if no authenticated user and no resolved fallback user.
  if (!user && !userId) {
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
            animate={{ width: 336, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`h-full border-r ${isDark ? "border-white/5" : "border-gray-200/80"}`}
          >
            <LeftSidebar
              currentView={currentView}
              onViewChange={(view) => {
                setCurrentView(view);
                if (view === "runs" || view === "batch_upload") setRightSidebarOpen(false);
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
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-r-lg ${isDark ? "bg-[#1A1A1A] hover:bg-[#222]" : "bg-white hover:bg-gray-50"
              } border-r border-t border-b ${isDark ? "border-white/5" : "border-gray-200"} transition-all shadow-xl active:scale-95`}
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
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-l-lg ${isDark ? "bg-[#1A1A1A] hover:bg-[#222]" : "bg-white hover:bg-gray-50"
              } border-l border-t border-b ${isDark ? "border-white/5" : "border-gray-200"} transition-all shadow-xl active:scale-95`}
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
            animate={{ width: 396, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`h-full border-l ${isDark ? "bg-[#111111] border-white/5" : "bg-[#FAFAFA] border-gray-200"}`}
          >
            {isEnterprise && currentView === "dashboard" ? (
              <div className="h-full flex flex-col">
                <AgentView theme={theme} onViewChange={(view) => setCurrentView(view)} compact />
              </div>
            ) : (
              <RightSidebar
                selectedItem={selectedItem}
                currentView={currentView}
                onClose={() => setRightSidebarOpen(false)}
                theme={theme}
                onViewChange={(view) => {
                  setCurrentView(view);
                }}
                onSelectItem={setSelectedItem}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
