import React from "react";
import { cn } from "@/lib/utils";

interface LanguageBadgeProps {
    flag: string;
    name: string;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
    size?: "sm" | "md";
}

export function LanguageBadge({
    flag,
    name,
    isSelected,
    onClick,
    className,
    size = "md"
}: LanguageBadgeProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex items-center gap-2 rounded-full border transition-all duration-300 select-none shadow-sm",
                size === "md" ? "h-10 pr-4 pl-1" : "h-8 pr-3 pl-1",
                isSelected
                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400",
                className
            )}
        >
            <div className={cn(
                "rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center leading-none border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform shrink-0",
                size === "md" ? "w-8 h-8 text-lg" : "w-6 h-6 text-sm"
            )}>
                {flag}
            </div>
            <span className={cn(
                "font-bold truncate",
                size === "md" ? "text-sm" : "text-xs"
            )}>
                {name}
            </span>
        </button>
    );
}
