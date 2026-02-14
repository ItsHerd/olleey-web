"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MoreVertical,
  Pause,
  Play,
  X,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { ProcessingJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobCardProps {
  job: ProcessingJob;
  onClick: () => void;
  theme: string;
  highlight?: "review" | "error";
}

const statusConfig = {
  pending: { label: "Queued", color: "text-gray-500", icon: Clock },
  downloading: { label: "Downloading", color: "text-blue-500", icon: Loader2 },
  processing: { label: "Processing", color: "text-[#FFC107]", icon: Loader2 },
  uploading: { label: "Uploading", color: "text-green-500", icon: Loader2 },
  waiting_approval: { label: "Needs Review", color: "text-[#FFC107]", icon: AlertCircle },
  completed: { label: "Completed", color: "text-green-500", icon: CheckCircle },
  failed: { label: "Failed", color: "text-red-500", icon: AlertCircle },
};

export function JobCard({ job, onClick, theme, highlight }: JobCardProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";
  const textClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";

  const statusInfo = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  // Calculate stage label
  const getStageLabel = () => {
    if (job.status === 'completed') return `${job.target_languages.length} languages`;
    if (job.status === 'waiting_approval') return `Ready for review`;

    // Extract from status
    const stages = {
      downloading: "Downloading video",
      processing: `Dubbing — ${job.target_languages.join(", ")}`,
      uploading: "Publishing",
    };

    return stages[job.status as keyof typeof stages] || statusInfo.label;
  };

  const borderClass = highlight === "review"
    ? "border-[#FFC107]/50 shadow-lg shadow-[#FFC107]/10"
    : highlight === "error"
      ? "border-red-500/50"
      : isDark ? "border-white/10" : "border-gray-200";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${cardBgClass} rounded-lg border ${borderClass} overflow-hidden cursor-pointer transition-all ${isDark ? 'shadow-sm' : ''}`}
    >
      {/* Thumbnail & Overlay */}
      <div className={`relative aspect-video ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-200 to-gray-300"}`}>
        {/* Placeholder thumbnail - replace with actual video thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full backdrop-blur-md bg-black/50 flex items-center gap-1.5`}>
          <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color} ${statusInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
          <span className="text-xs font-medium text-white">{statusInfo.label}</span>
        </div>

        {/* Progress Bar (if active) */}
        {['downloading', 'processing', 'uploading'].includes(job.status) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              className="h-full bg-[#FFC107]"
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold truncate mb-0.5 ${textClass}`}>
              {job.source_video_id || "Untitled Video"}
            </h3>
            <p className={`text-[10px] ${textSecondaryClass}`}>
              {getStageLabel()}
            </p>
          </div>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 border ${isDark ? "border-white/5 hover:border-white/20 hover:bg-white/10" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"} transition-all`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="w-4 h-4 mr-2" />
                Pause Job
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                <X className="w-4 h-4 mr-2" />
                Cancel Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(job.created_at).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
