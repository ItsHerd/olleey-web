"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewType, SelectedItem } from "./DashboardLayout";
import { DashboardView } from "./views/DashboardView";
import { VideosView } from "./views/VideosView";
import { RunsView } from "./views/RunsView";
import { VoicesView } from "./views/VoicesView";
import { SettingsView } from "./views/SettingsView";
import { AccountView } from "./views/AccountView";
import { NotificationsView } from "./views/NotificationsView";
import { GuardrailsView } from "./views/GuardrailsView";
import { SupportView } from "./views/SupportView";
import { ManualWorkflowView } from "./views/ManualWorkflowView";
import { ReviewView } from "./views/ReviewView";
import { PreviewView } from "./views/PreviewView";
import { DetectedUploadsView } from "./views/DetectedUploadsView";
import ProcessingPage from "@/app/ProcessingPage";

interface CenterPanelProps {
  currentView: ViewType;
  selectedItem: SelectedItem;
  onSelectItem: (item: SelectedItem) => void;
  onViewChange: (view: ViewType) => void;
  theme: string;
}

export function CenterPanel({
  currentView,
  selectedItem,
  onSelectItem,
  onViewChange,
  theme
}: CenterPanelProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]";
  const viewsWithOwnBackNav: ViewType[] = ["processing", "review", "preview", "manual_workflow"];
  const showAiQuickSwitch = currentView !== "dashboard" && !viewsWithOwnBackNav.includes(currentView);

  const getViewLabel = (view: ViewType) => {
    const labels: Record<ViewType, string> = {
      dashboard: "Dashboard",
      videos: "Videos",
      channels: "Channels",
      voices: "Voices",
      settings: "Settings",
      notifications: "Notifications",
      account: "Account",
      guardrails: "Guardrails",
      support: "Support",
      manual_workflow: "Manual Workflow",
      review: "Review",
      preview: "Preview",
      processing: "Processing",
      runs: "Runs",
      detected_uploads: "Detected Uploads",
    };
    return labels[view] || "Current";
  };

  // Determine which view to show based on currentView
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
      case "videos":
        return <VideosView theme={theme} />;
      case "channels":
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
      case "voices":
        return <VoicesView theme={theme} />;
      case "settings":
        return <SettingsView theme={theme} />;
      case "account":
        return <AccountView theme={theme} />;
      case "notifications":
        return <NotificationsView theme={theme} />;
      case "guardrails":
        return <GuardrailsView theme={theme} />;
      case "support":
        return <SupportView theme={theme} />;
      case "support":
        return <SupportView theme={theme} />;
      case "manual_workflow":
        return <ManualWorkflowView onViewChange={onViewChange} theme={theme} />;
      case "review":
        return <ReviewView onViewChange={onViewChange} theme={theme} selectedJob={selectedItem.type === "job" ? selectedItem.data : null} />;
      case "preview":
        return <PreviewView onViewChange={onViewChange} theme={theme} />;
      case "processing":
        return <ProcessingPage selectedJob={selectedItem.type === "job" ? selectedItem.data : null} onViewChange={onViewChange} />;
      case "runs":
        return <RunsView theme={theme} onSelectItem={onSelectItem} onViewChange={onViewChange} />;
      case "detected_uploads":
        return <DetectedUploadsView theme={theme} onViewChange={onViewChange} />;
      default:
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
    }
  };

  return (
    <div className={`flex-1 overflow-auto relative ${bgClass}`}>
      {showAiQuickSwitch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center rounded-xl border border-border bg-background/95 backdrop-blur-sm p-1 shadow-md">
            <button
              onClick={() => onViewChange("dashboard")}
              className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back To AI View
            </button>
            <button
              className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/80 bg-muted"
              aria-current="page"
            >
              Current: {getViewLabel(currentView)}
            </button>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedItem.id || currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
