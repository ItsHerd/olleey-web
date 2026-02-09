import React from "react";

interface RowSkeletonProps {
    count?: number;
    isDark: boolean;
}

export const RowSkeleton = ({ count = 5, isDark }: RowSkeletonProps) => (
    <div className="flex flex-col w-full divide-y divide-white/[0.02]">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 w-full py-5 px-6 animate-pulse">
                <div className={`w-20 h-11 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-xl shrink-0 border border-white/5 opacity-40`} />
                <div className="flex-1 space-y-3 min-w-0">
                    <div className={`h-2.5 ${isDark ? "bg-white/20" : "bg-gray-300"} rounded-full w-1/4`} />
                    <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full w-1/3 opacity-30`} />
                </div>
                <div className={`w-24 h-8 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded-full shrink-0 border border-white/5`} />
            </div>
        ))}
    </div>
);

interface MediaGridSkeletonProps {
    isDark: boolean;
    borderClass: string;
}

export const MediaGridSkeleton = ({ isDark, borderClass }: MediaGridSkeletonProps) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full p-8">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex flex-col gap-4 p-5 border ${borderClass} bg-white/[0.03] rounded-3xl animate-pulse`}>
                <div className={`aspect-video ${isDark ? "bg-white/10" : "bg-gray-100"} rounded-2xl w-full border border-white/5`} />
                <div className="space-y-3 mt-auto border-t border-white/[0.04] pt-4">
                    <div className={`h-2.5 ${isDark ? "bg-white/20" : "bg-gray-300"} rounded-full w-3/4`} />
                    <div className="flex justify-between items-center">
                        <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full w-1/3 opacity-30`} />
                        <div className={`w-6 h-6 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full opacity-25`} />
                    </div>
                </div>
            </div>
        ))}
    </div>
);
