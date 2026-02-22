"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewType, SelectedItem } from "./DashboardLayout";
import { DashboardView } from "./views/DashboardView";
import { VideosView } from "./views/VideosView";
import { RunsView } from "./views/RunsView";
import { VoicesView } from "./views/VoicesView";
import { PreferencesView } from "./views/PreferencesView";
import { AccountView } from "./views/AccountView";
import { AnalyticsView } from "./views/AnalyticsView";
import { NotificationsView } from "./views/NotificationsView";
import { SupportView } from "./views/SupportView";
import { ManualWorkflowView } from "./views/ManualWorkflowView";
import { ReviewView } from "./views/ReviewView";
import { PreviewView } from "./views/PreviewView";
import { DetectedUploadsView } from "./views/DetectedUploadsView";
import ProcessingPage from "@/app/ProcessingPage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DashboardViewHeader } from "./components/DashboardViewHeader";

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
  const bgClass = isDark ? "bg-[#141414]" : "bg-[#F4F4F4]";
  const lastNonProcessingViewRef = useRef<ViewType>("dashboard");

  useEffect(() => {
    if (currentView !== "processing") {
      lastNonProcessingViewRef.current = currentView;
    }
  }, [currentView]);

  const handleCloseProcessingModal = () => {
    onViewChange(lastNonProcessingViewRef.current);
  };

  // Determine which view to show based on view key
  const renderViewFor = (view: ViewType) => {
    switch (view) {
      case "dashboard":
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
      case "videos":
        return <VideosView theme={theme} />;
      case "channels":
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
      case "voices":
        return <VoicesView theme={theme} />;
      case "preferences":
      case "settings":
        return <PreferencesView theme={theme} />;
      case "account":
        return <AccountView theme={theme} onViewChange={onViewChange} />;
      case "analytics":
        return <AnalyticsView theme={theme} />;
      case "notifications":
        return <NotificationsView theme={theme} />;
      case "guardrails":
        return <PreferencesView theme={theme} />;
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
      case "runs":
        return <RunsView theme={theme} onSelectItem={onSelectItem} onViewChange={onViewChange} />;
      case "detected_uploads":
        return <DetectedUploadsView theme={theme} onViewChange={onViewChange} onSelectItem={onSelectItem} />;
      default:
        return <DashboardView onSelectJob={onSelectItem} theme={theme} onViewChange={onViewChange} />;
    }
  };

  const baseView = currentView === "processing" ? lastNonProcessingViewRef.current : currentView;

  return (
    <div className={`relative flex-1 overflow-hidden ${bgClass}`}>
      <div className="flex h-full flex-col">
        {baseView !== "dashboard" && (
          <DashboardViewHeader
            view={baseView}
            theme={theme}
            onBackHome={() => onViewChange("dashboard")}
          />
        )}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id || baseView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderViewFor(baseView)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={currentView === "processing"} onOpenChange={(open) => !open && handleCloseProcessingModal()}>
        <DialogContent className="w-[min(980px,90vw)] max-w-[90vw] max-h-[80vh] p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Processing Job</DialogTitle>
          <ProcessingPage
            selectedJob={selectedItem.type === "job" ? selectedItem.data : null}
            isModal
            onViewChange={(view) => {
              if (view === "dashboard") {
                handleCloseProcessingModal();
                return;
              }
              onViewChange(view);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
