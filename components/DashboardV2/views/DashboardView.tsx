"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  LayoutGrid,
  MessageSquare,
  Activity,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    } as const
  }
};

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
  ).slice(0, 3);

  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-transparent";
  const shadowClass = isDark ? "shadow-sm" : "shadow-none";

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
      {viewMode === "agent" ? (
        <div className="h-full flex flex-col">
          <AgentView theme={theme} onViewChange={onViewChange} />
        </div>
      ) : (
        <>
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC107]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className={`px-8 py-6 ${isDark ? 'border-b border-white/10' : ''} relative z-10 backdrop-blur-sm bg-opacity-80`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-[#FFC107]" />
                  <h1 className={`text-2xl font-black tracking-tight ${textClass}`}>Olleey Control</h1>
                </div>
                <p className={`text-xs font-medium uppercase tracking-widest ${textSecondaryClass} opacity-80`}>
                  Quantum localizations pipeline monitor
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center p-1 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} border ${borderClass}`}>
                  <button
                    onClick={() => setViewMode("agent")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(viewMode as string) === 'agent' ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/10' : `${textSecondaryClass} hover:${isDark ? 'text-white' : 'text-gray-900'}`}`}
                  >
                    Agent
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(viewMode as string) === 'grid' ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/10' : `${textSecondaryClass} hover:${isDark ? 'text-white' : 'text-gray-900'}`}`}
                  >
                    Grid
                  </button>
                </div>
                <Button
                  onClick={() => setShowNewModal(true)}
                  className="bg-white hover:bg-gray-100 text-black font-black px-6 h-11 rounded-2xl text-[10px] uppercase tracking-widest gap-2 border-2 border-gray-100 transition-all active:scale-95 shadow-xl shadow-black/5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                  Initialize
                </Button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondaryClass}`} />
                <input
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isDark ? 'bg-white/[0.03]' : 'bg-white'} border ${borderClass} rounded-xl h-12 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#FFC107]/40 transition-all`}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border ${borderClass} ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 custom-scrollbar relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-7xl mx-auto space-y-12"
            >
              {/* Quick Stats Header (Visual only) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Nodes", value: activeJobs.length, icon: Zap, color: "text-blue-400" },
                  { label: "Awaiting Review", value: needsReviewJobs.length, icon: Clock, color: "text-[#FFC107]" },
                  { label: "Success Rate", value: "98.4%", icon: TrendingUp, color: "text-green-400" },
                  { label: "Total Capacity", value: "1.2 TB", icon: Activity, color: "text-purple-400" }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`${cardBgClass} border ${borderClass} p-5 rounded-2xl group hover:border-[#FFC107]/20 transition-all cursor-default ${shadowClass}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <ChevronRight className={`w-3 h-3 ${textSecondaryClass} opacity-0 group-hover:opacity-100 transition-all`} />
                    </div>
                    <div className={`text-2xl font-black ${textClass}`}>{stat.value}</div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${textSecondaryClass} mt-1`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Active Pipelines */}
              {activeJobs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-blue-500 rounded-full" />
                      <h2 className={`text-xl font-black ${textClass} tracking-tight`}>Active Pipelines</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
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
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-[#FFC107] rounded-full" />
                      <h2 className={`text-xl font-black ${textClass} tracking-tight`}>Human in the Loop</h2>
                    </div>
                    <button
                      onClick={() => onViewChange?.("review")}
                      className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] bg-[#FFC107]/10 px-3 py-1 rounded-full border border-[#FFC107]/20 hover:bg-[#FFC107]/20 transition-all cursor-pointer"
                    >
                      {needsReviewJobs.length} Review Requested
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {needsReviewJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
                        <JobCard
                          job={job}
                          onClick={() => {
                            onSelectJob({ type: "job", id: job.job_id, data: job });
                            if (job.status === 'waiting_approval') {
                              onViewChange?.("review");
                            } else {
                              onViewChange?.("dashboard");
                            }
                          }}
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-green-500 rounded-full" />
                      <h2 className={`text-xl font-black ${textClass} tracking-tight`}>Operation History</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-[#D97757] hover:underline">
                      Terminal Log →
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {completedRecentJobs.map((job) => (
                      <motion.div variants={itemVariants} key={job.job_id}>
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
                  variants={itemVariants}
                  className={`${cardBgClass} rounded-[2rem] border ${borderClass} p-20 text-center relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FFC107]/5 to-transparent opacity-50 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-[1.5rem] bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 ${isDark ? 'shadow-2xl shadow-[#FFC107]/10' : ''}">
                      <Zap className="w-12 h-12 text-[#FFC107]" />
                    </div>
                    <h3 className={`text-3xl font-black mb-4 tracking-tighter ${textClass}`}>Digital Void Detected</h3>
                    <p className={`text-base ${textSecondaryClass} mb-12 max-w-md mx-auto font-medium leading-relaxed`}>
                      No active localization streams detected in this project. Initialize your first neural node to begin global synchronization.
                    </p>
                    <Button
                      onClick={() => setShowNewModal(true)}
                      className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-black px-12 h-14 rounded-2xl text-sm uppercase tracking-[0.1em] shadow-2xl shadow-[#FFC107]/20 transition-all active:scale-95"
                    >
                      Initialize First Pipeline
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* New Localization Modal */}
      <NewLocalizationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        theme={theme}
      />
    </div>
  );
}
