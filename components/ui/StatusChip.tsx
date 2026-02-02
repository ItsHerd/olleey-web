"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle, Clock, PauseCircle, Sparkles, Upload } from "lucide-react";

type StatusType = "queued" | "uploading" | "processing" | "completed" | "failed" | "waiting_approval" | string;

interface StatusChipProps {
  status: StatusType;
  size?: "xs" | "sm" | "md";
  label?: string;
  className?: string;
}

export function StatusChip({ status, size = "sm", label, className }: StatusChipProps) {
  const normalizedStatus = status?.toLowerCase() || "unknown";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
        };
      case "processing":
        return {
          label: "Processing",
          icon: Loader2,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          animate: true,
        };
      case "uploading":
        return {
          label: "Uploading",
          icon: Upload,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          animate: true,
        };
      case "queued":
        return {
          label: "Queued",
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
        };
      case "failed":
        return {
          label: "Failed",
          icon: AlertCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
        };
      case "waiting_approval":
        return {
          label: "Needs Review",
          icon: Sparkles,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/20",
        };
      case "paused":
        return {
          label: "Paused",
          icon: PauseCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/20",
        };
      default:
        return {
          label: status.replace("_", " "),
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);
  const Icon = config.icon;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full font-medium transition-colors",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], config.animate && "animate-spin")} />
      <span className="capitalize whitespace-nowrap">{label || config.label}</span>
    </div>
  );
}
