"use client";

import React from "react";

export function DashboardSkeleton({ borderClass, cardClass }: { borderClass: string; cardClass: string }) {
    return (
        <div className="w-full h-auto pb-20 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hero Skeleton */}
                <div className={`col-span-1 md:col-span-2 min-h-[400px] border ${borderClass} bg-white/5 rounded-none overflow-hidden flex flex-col`}>
                    <div className="flex-1 bg-white/5" />
                    <div className="p-8 space-y-4">
                        <div className="h-10 w-2/3 bg-white/10" />
                        <div className="h-4 w-1/3 bg-white/5" />
                        <div className="flex gap-2 pt-4">
                            <div className="h-10 w-32 bg-white/10" />
                            <div className="h-10 w-32 bg-white/10" />
                        </div>
                    </div>
                </div>


                {/* Activity Feed Skeleton */}
                <div className={`col-span-1 min-h-[400px] border ${borderClass} bg-white/5 rounded-none p-6`}>
                    <div className="h-4 w-1/2 bg-white/10 mb-8" />
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 bg-white/10 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-3/4 bg-white/10" />
                                    <div className="h-2 w-1/4 bg-white/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Large Bottom Sections Skeletons */}
                <div className={`col-span-1 md:col-span-2 min-h-[500px] border ${borderClass} bg-white/5 rounded-none p-6`}>
                    <div className="flex justify-between mb-8">
                        <div className="h-6 w-48 bg-white/10" />
                        <div className="h-6 w-24 bg-white/10" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 w-full bg-white/5 border border-white/5" />
                        ))}
                    </div>
                </div>

                <div className={`col-span-1 md:col-span-2 min-h-[500px] border ${borderClass} bg-white/5 rounded-none p-6`}>
                    <div className="flex justify-between mb-8">
                        <div className="h-6 w-48 bg-white/10" />
                        <div className="h-6 w-24 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 w-full bg-white/5 border border-white/5" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
