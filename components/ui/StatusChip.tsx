import React from "react";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Sparkles,
    Download,
    Mic,
    Smile,
    Upload,
    X,
    Play,
    Tag,
    Globe2,
    Music,
    Tent,
    Plane,
    Shirt,
    Book,
    GraduationCap,
    Bike,
    TrendingUp
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export type StatusType =
    | "ready" | "completed" | "live"
    | "processing" | "downloading" | "uploading" | "voice_cloning" | "lip_sync"
    | "draft" | "waiting_approval" | "needs_review"
    | "failed" | "error"
    | "pending" | "queued"
    | "active" | "disconnected" | "expired"
    | "original" | "translated"
    | "music" | "camping" | "travel" | "fashion" | "books" | "learning" | "sports" | "stocks";

interface StatusChipProps {
    status: StatusType | string;
    label?: string;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "light" | "solid" | "ghost";
    showIcon?: boolean;
    onClose?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
}

const getStatusConfig = (status: string, theme: "light" | "dark") => {
    const isDark = theme === "dark";

    switch (status) {
        case "ready":
        case "completed":
        case "live":
        case "active":
            return {
                icon: CheckCircle,
                label: "Live",
                color: "text-green-600 dark:text-green-400",
                solidBg: "bg-green-600 dark:bg-green-500",
                lightBg: "bg-green-50 dark:bg-green-500/10",
                iconContainer: "bg-white dark:bg-green-500/20",
                animated: false
            };

        case "processing":
        case "downloading":
            return {
                icon: Sparkles,
                label: status === "processing" ? "AI Dubbing" : "Importing",
                color: "text-indigo-600 dark:text-indigo-400",
                solidBg: "bg-indigo-600 dark:bg-indigo-500",
                lightBg: "bg-indigo-50 dark:bg-indigo-500/10",
                iconContainer: "bg-white dark:bg-indigo-500/20",
                animated: true
            };

        case "voice_cloning":
        case "lip_sync":
            return {
                icon: Mic,
                label: status === "voice_cloning" ? "Cloning" : "Syncing",
                color: "text-purple-600 dark:text-purple-400",
                solidBg: "bg-purple-600 dark:bg-purple-500",
                lightBg: "bg-purple-50 dark:bg-purple-500/10",
                iconContainer: "bg-white dark:bg-purple-500/20",
                animated: true
            };

        case "draft":
        case "waiting_approval":
        case "needs_review":
            return {
                icon: AlertCircle,
                label: "Needs Review",
                color: "text-olleey-yellow",
                solidBg: "bg-olleey-yellow",
                lightBg: "bg-olleey-yellow/10",
                iconContainer: "bg-white dark:bg-olleey-yellow/20",
                animated: true
            };

        case "failed":
        case "error":
            return {
                icon: XCircle,
                label: "Failed",
                color: "text-red-600 dark:text-red-400",
                solidBg: "bg-red-600 dark:bg-red-500",
                lightBg: "bg-red-50 dark:bg-red-500/10",
                iconContainer: "bg-white dark:bg-red-500/20",
                animated: false
            };

        case "original":
            return {
                icon: Play,
                label: "Original",
                color: "text-blue-600 dark:text-blue-400",
                solidBg: "bg-blue-600 dark:bg-blue-500",
                lightBg: "bg-blue-50 dark:bg-blue-500/10",
                iconContainer: "bg-white dark:bg-blue-500/20",
                animated: false
            };

        // Reference Chip Icons from user image
        case "music":
            return { icon: Music, label: "Music", color: "text-orange-500", lightBg: "bg-orange-50 dark:bg-orange-500/10", iconContainer: "bg-white", solidBg: "bg-orange-600", animated: false };
        case "camping":
            return { icon: Tent, label: "Camping", color: "text-green-600", lightBg: "bg-green-50 dark:bg-green-500/10", iconContainer: "bg-white", solidBg: "bg-green-600", animated: false };
        case "travel":
            return { icon: Plane, label: "Travel", color: "text-blue-600", lightBg: "bg-blue-50 dark:bg-blue-500/10", iconContainer: "bg-white", solidBg: "bg-blue-600", animated: false };
        case "fashion":
            return { icon: Shirt, label: "Fashion", color: "text-pink-500", lightBg: "bg-pink-50 dark:bg-pink-500/10", iconContainer: "bg-white", solidBg: "bg-pink-600", animated: false };
        case "books":
            return { icon: Book, label: "Books", color: "text-blue-800", lightBg: "bg-blue-50 dark:bg-blue-800/10", iconContainer: "bg-white", solidBg: "bg-blue-800", animated: false };
        case "learning":
            return { icon: GraduationCap, label: "Learning", color: "text-amber-600", lightBg: "bg-amber-50 dark:bg-amber-500/10", iconContainer: "bg-white", solidBg: "bg-amber-600", animated: false };
        case "sports":
            return { icon: Bike, label: "Sports", color: "text-blue-500", lightBg: "bg-blue-50 dark:bg-blue-500/10", iconContainer: "bg-white", solidBg: "bg-blue-500", animated: false };
        case "stocks":
            return { icon: TrendingUp, label: "Stocks", color: "text-red-800", lightBg: "bg-red-50 dark:bg-red-800/10", iconContainer: "bg-white", solidBg: "bg-red-800", animated: false };

        default:
            return {
                icon: status.includes("lang:") ? Globe2 : Tag,
                label: status.replace("lang:", "").toUpperCase(),
                color: "text-slate-600 dark:text-slate-400",
                solidBg: "bg-slate-600 dark:bg-slate-500",
                lightBg: "bg-slate-50 dark:bg-slate-500/10",
                iconContainer: "bg-white dark:bg-slate-500/20",
                animated: false
            };
    }
};

export function StatusChip({
    status,
    label,
    className,
    size = "sm",
    variant = "light",
    showIcon = true,
    onClose,
    onClick
}: StatusChipProps) {
    const { theme } = useTheme();
    const config = getStatusConfig(status, theme as "light" | "dark");
    const Icon = config.icon || Tag;

    const sizeStyles = {
        xs: "h-6 px-1.5 gap-1.5 text-[10px]",
        sm: "h-8 px-2 gap-2 text-xs",
        md: "h-10 px-2.5 gap-2.5 text-sm",
        lg: "h-12 px-3 gap-3 text-base",
    };

    const iconContainerSizes = {
        xs: "w-4 h-4",
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-9 h-9",
    };

    const iconSizes = {
        xs: "h-2.5 w-2.5",
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "inline-flex items-center rounded-full font-bold transition-all duration-200 select-none group/chip border border-transparent shadow-sm",
                onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                variant === "light" && cn(config.lightBg, config.color, "border-white/5 dark:border-white/5"),
                variant === "solid" && cn(config.solidBg, "text-white shadow-md"),
                variant === "ghost" && "bg-transparent border-slate-200 dark:border-slate-800",
                sizeStyles[size],
                className
            )}
        >
            {showIcon && (
                <div className={cn(
                    "flex items-center justify-center rounded-full shadow-sm shrink-0",
                    variant === "light" ? config.iconContainer : "bg-white/20",
                    variant === "ghost" && "bg-slate-100 dark:bg-slate-800",
                    iconContainerSizes[size]
                )}>
                    <Icon className={cn(
                        iconSizes[size],
                        config.animated && "animate-pulse",
                        variant === "light" ? config.color : "text-white"
                    )} />
                </div>
            )}

            <span className="truncate pr-1">
                {label || config.label}
            </span>

            {onClose && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(e);
                    }}
                    className={cn(
                        "p-0.5 rounded-full transition-colors shrink-0",
                        variant === "light" ? "hover:bg-black/5 text-current/50" : "hover:bg-white/20 text-white/70"
                    )}
                >
                    <X className={iconSizes[size]} />
                </button>
            )}
        </div>
    );
}
