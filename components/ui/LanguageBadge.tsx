import React from "react";
import { cn } from "@/lib/utils";

interface LanguageBadgeProps {
    flag: string;
    name: string;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function LanguageBadge({ flag, name, isSelected, onClick, className }: LanguageBadgeProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex items-center gap-2 pr-4 pl-1 py-1 rounded-full border transition-all duration-200",
                isSelected
                    ? "bg-gray-100 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                    : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-900",
                className
            )}
        >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-lg leading-none border border-gray-100 dark:border-gray-600 group-hover:scale-105 transition-transform">
                {flag}
            </div>
            <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
            )}>
                {name}
            </span>
        </button>
    );
}
