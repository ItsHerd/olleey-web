"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Search, LayoutGrid, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectedItem } from "../DashboardV2Layout";
import { JobCard } from "../components/JobCard";
import { NewLocalizationModal } from "../components/NewLocalizationModal";
import { AgentView } from "./AgentView";
import { useDashboardJobs } from "@/lib/useDashboardJobs";
import { useAuth } from "@/lib/AuthContext";
import { useProject } from "@/lib/ProjectContext";

interface DashboardViewProps {
  onSelectJob: (item: SelectedItem) => void;
  theme: string;
  onViewChange?: (view: any) => void;
}

export function DashboardView({ onSelectJob, theme, onViewChange }: DashboardViewProps) {
  const [viewMode, setViewMode] = useState<"agent" | "grid">("agent");
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const userId = user?.id;
  const isDark = theme === "dark";

  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch jobs
  const { jobs, loading } = useDashboardJobs({
    projectId: selectedProject?.id,
    user_id: userId,
    enabled: !!userId
  });

  // Split jobs into active and needs review
  const activeJobs = jobs.filter(j =>
    ['pending', 'downloading', 'processing', 'uploading'].includes(j.status)
  );

  const needsReviewJobs = jobs.filter(j =>
    j.status === 'waiting_approval'
  );

  const completedRecentJobs = jobs.filter(j =>
    j.status === 'completed'
  ).slice(0, 3); // Show last 3 completed

  const textClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  // Show agent view by default
  if (viewMode === "agent") {
    return (
      <div className="h-full flex flex-col">
        <AgentView theme={theme} onViewChange={onViewChange} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-0.5">Control Room</h1>
            <p className={`text-xs ${textSecondaryClass}`}>
              Monitor active pipelines and review completed localizations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("agent")}
              className="gap-2 h-9 px-3 text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Agent View
            </Button>
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold gap-2 h-9 px-4 text-xs border border-amber-400/50 shadow-lg shadow-amber-400/10"
            >
              <Plus className="w-4 h-4" />
              New Localization
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Active Pipelines */}
        {activeJobs.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Active Pipelines</h2>
              <span className={`text-xs ${textSecondaryClass}`}>
                {activeJobs.length} running
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeJobs.map((job, idx) => (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <JobCard
                    job={job}
                    onClick={() =>
                      onSelectJob({ type: "job", id: job.job_id, data: job })
                    }
                    theme={theme}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Needs Review */}
        {needsReviewJobs.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Needs Review</h2>
              <span className="text-xs text-[#FFC107]">
                {needsReviewJobs.length} awaiting approval
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {needsReviewJobs.map((job, idx) => (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <JobCard
                    job={job}
                    onClick={() =>
                      onSelectJob({ type: "job", id: job.job_id, data: job })
                    }
                    theme={theme}
                    highlight="review"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Completed */}
        {completedRecentJobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recently Completed</h2>
              <Button variant="ghost" size="sm" className="text-[#FFC107]">
                View All →
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {completedRecentJobs.map((job, idx) => (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <JobCard
                    job={job}
                    onClick={() =>
                      onSelectJob({ type: "job", id: job.job_id, data: job })
                    }
                    theme={theme}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeJobs.length === 0 && needsReviewJobs.length === 0 && completedRecentJobs.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBgClass} rounded-2xl border border-white/10 p-12 text-center`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-[#FFC107]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Jobs</h3>
            <p className={`${textSecondaryClass} mb-6 max-w-md mx-auto`}>
              Start your first localization to see your pipeline in action. Upload a video
              and select target languages to begin.
            </p>
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold"
            >
              Create First Job
            </Button>
          </motion.div>
        )}
      </div>

      {/* New Localization Modal */}
      <NewLocalizationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        theme={theme}
      />
    </div>
  );
}
