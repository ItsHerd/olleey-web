"use client";

import React from "react";

export function DashboardSkeleton({ borderClass, cardClass }: { borderClass: string; cardClass: string }) {
    return (
        <div className="w-full h-auto pb-20 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Hero Skeleton - Optimized for 2.5rem corners */}
                <div className={`col-span-1 md:col-span-2 min-h-[480px] border ${borderClass} bg-white/[0.03] rounded-[2.5rem] overflow-hidden flex flex-col p-12`}>
                    <div className="w-48 h-10 bg-white/10 rounded-full mb-10" />
                    <div className="space-y-4 mb-10">
                        <div className="h-16 w-3/4 bg-white/10 rounded-2xl" />
                        <div className="h-4 w-1/4 bg-white/5 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5">
                        <div className="space-y-3">
                            <div className="h-3 w-20 bg-white/5 rounded-full" />
                            <div className="h-12 w-24 bg-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 w-20 bg-white/5 rounded-full" />
                            <div className="h-12 w-24 bg-white/10 rounded-xl" />
                        </div>
                    </div>
                    <div className="mt-auto flex gap-4">
                        <div className="h-12 w-40 bg-white/10 rounded-full" />
                        <div className="h-12 w-40 bg-white/5 rounded-full" />
                    </div>
                </div>

                {/* Queue Skeleton */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4 min-h-[480px]">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded-full" />
                                <div className="h-2 w-20 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className={`flex-1 border ${borderClass} bg-white/[0.02] rounded-[2.5rem] p-6 space-y-4`}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/[0.02] last:border-0">
                                <div className="w-16 h-10 bg-white/10 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                                    <div className="h-2 w-1/4 bg-white/5 rounded-full" />
                                </div>
                                <div className="w-20 h-8 bg-white/10 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Released Media Skeleton */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4 min-h-[480px]">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded-full" />
                                <div className="h-2 w-20 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className={`flex-1 border ${borderClass} bg-white/[0.02] rounded-[2.5rem] p-8`}>
                        <div className="grid grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-video bg-white/10 rounded-2xl" />
                                    <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Feed Skeleton */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4 min-h-[480px]">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded-full" />
                                <div className="h-2 w-20 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className={`flex-1 border ${borderClass} bg-white/[0.02] rounded-[2.5rem] p-6 space-y-6`}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 p-2">
                                <div className="w-10 h-10 bg-white/10 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-3 w-2/3 bg-white/10 rounded-full" />
                                    <div className="h-2 w-20 bg-white/5 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
