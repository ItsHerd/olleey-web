import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Pause } from "lucide-react";

type ConnectionStatus = "active" | "expired" | "restricted" | "disconnected";

interface StatusBadgeProps {
  status: ConnectionStatus;
  isPaused?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const getStatusConfig = (status: ConnectionStatus, isPaused?: boolean) => {
  if (isPaused) {
    return {
      icon: Pause,
      label: "Paused",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-700/30",
    };
  }

  switch (status) {
    case "active":
      return {
        icon: CheckCircle,
        label: "Active",
        color: "text-green-400",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-700/30",
      };
    case "expired":
      return {
        icon: XCircle,
        label: "Token Expired",
        color: "text-red-400",
        bgColor: "bg-red-900/20",
        borderColor: "border-red-700/30",
      };
    case "restricted":
      return {
        icon: AlertCircle,
        label: "Restricted Access",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        borderColor: "border-yellow-700/30",
      };
    case "disconnected":
      return {
        icon: XCircle,
        label: "Disconnected",
        color: "text-gray-400",
        bgColor: "bg-gray-900/20",
        borderColor: "border-gray-700/30",
      };
  }
};

export function StatusBadge({ status, isPaused, className, size = "sm" }: StatusBadgeProps) {
  const config = getStatusConfig(status, isPaused);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}