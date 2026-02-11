"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewType, SelectedItem } from "./DashboardV2Layout";
import { DashboardView } from "./views/DashboardView";
import { JobDetailView } from "./views/JobDetailView";
import { VideosView } from "./views/VideosView";
import { ChannelsView } from "./views/ChannelsView";
import { VoicesView } from "./views/VoicesView";
import { SettingsView } from "./views/SettingsView";
import { AccountView } from "./views/AccountView";
import { NotificationsView } from "./views/NotificationsView";
import { GuardrailsView } from "./views/GuardrailsView";
import { SupportView } from "./views/SupportView";
import { ManualWorkflowView } from "./views/ManualWorkflowView";
import { ReviewView } from "./views/ReviewView";

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
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";

  // Determine which view to show based on selection
  const renderView = () => {
    // If a job is selected, show job detail view
    if (selectedItem.type === "job" && selectedItem.id) {
      return (
        <JobDetailView
          jobId={selectedItem.id}
          onBack={() => onSelectItem({ type: null, id: null })}
          theme={theme}
        />
      );
    }

    // Otherwise show the main view
    switch (currentView) {
      case "dashboard":
        return <DashboardView onSelectJob={onSelectItem} theme={theme} />;
      case "videos":
        return <VideosView theme={theme} />;
      case "channels":
        return <ChannelsView theme={theme} />;
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
        return <ReviewView onViewChange={onViewChange} theme={theme} />;
      default:
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
    }
  };

  return (
    <div className={`flex-1 overflow-auto ${bgClass}`}>
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
