"use client";

import React from "react";
import { History, Loader2, CheckCircle, Radio, Plus, Youtube, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityItem } from "@/lib/api";

interface ActivityFeedProps {
    activitiesLoading: boolean;
    activities: ActivityItem[];
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
}

export function ActivityFeed({
    activitiesLoading,
    activities,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass
}: ActivityFeedProps) {
    return (
        <div className="w-full lg:w-64 shrink-0">
            <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-olleey-yellow" />
                <h2 className={`text-xl font-300 ${textClass}`}>Activity Feed</h2>
            </div>

            <div className={`${cardClass} border ${borderClass} rounded-none p-5 space-y-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-olleey-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                <div className="relative space-y-6">
                    {activitiesLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-olleey-yellow opacity-40" />
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4 items-start">
                                <div className={`w-8 h-8 flex items-center justify-center shrink-0`}>
                                    {activity.icon === 'check' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                        activity.icon === 'upload' ? <Radio className="w-4 h-4 text-olleey-yellow" /> :
                                            activity.icon === 'plus' ? <Plus className="w-4 h-4 text-blue-500" /> :
                                                activity.icon === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> :
                                                    <Zap className="w-4 h-4 text-purple-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${textClass} font-medium leading-snug mb-1`}>
                                        {activity.message}
                                    </p>
                                    <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-tight`}>
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className={`text-xs ${textSecondaryClass}`}>No recent activity</p>
                        </div>
                    )}
                </div>

                <Button variant="ghost" className={`w-full text-xs font-bold ${textSecondaryClass} hover:${textClass} mt-4`}>
                    View Full History
                </Button>
            </div>
        </div>
    );
}
