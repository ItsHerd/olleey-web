"use client";

import React from "react";
import { History, Loader2, CheckCircle, Radio, Plus, Youtube, Zap, Upload, FileCheck, Play } from "lucide-react";
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
    const getIconComponent = (icon: string) => {
        switch (icon) {
            case 'check':
                return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
            case 'upload':
                return <Upload className="w-3.5 h-3.5 text-blue-500" />;
            case 'plus':
                return <Plus className="w-3.5 h-3.5 text-purple-500" />;
            case 'youtube':
                return <Youtube className="w-3.5 h-3.5 text-red-500" />;
            case 'alert':
                return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
            default:
                return <Radio className="w-3.5 h-3.5 text-olleey-yellow" />;
        }
    };

    const getIconBgColor = (icon: string) => {
        switch (icon) {
            case 'check':
                return 'bg-green-500/10 border-green-500/20';
            case 'upload':
                return 'bg-blue-500/10 border-blue-500/20';
            case 'plus':
                return 'bg-purple-500/10 border-purple-500/20';
            case 'youtube':
                return 'bg-red-500/10 border-red-500/20';
            case 'alert':
                return 'bg-yellow-500/10 border-yellow-500/20';
            default:
                return 'bg-olleey-yellow/10 border-olleey-yellow/20';
        }
    };

    return (
        <div className="w-full">
            <div className={`${cardClass} border-none rounded-sm p-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-olleey-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-white/5" />

                    {activitiesLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-olleey-yellow opacity-40" />
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="space-y-6">
                            {activities.slice(0, 8).map((activity, index) => (
                                <div key={activity.id} className="relative flex gap-3 items-start group">
                                    {/* Icon */}
                                    <div className={`relative z-10 w-8 h-8 flex items-center justify-center shrink-0 rounded-full border-2 ${getIconBgColor(activity.icon)} backdrop-blur-sm transition-all group-hover:scale-110`}>
                                        {getIconComponent(activity.icon)}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 min-w-0 pb-2 ${index !== activities.length - 1 ? 'border-b border-white/5' : ''}`}>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className={`text-[8px] ${textClass} font-medium leading-relaxed`}>
                                                {activity.message}
                                            </p>
                                            <span className={`text-[9px] font-medium ${textSecondaryClass} whitespace-nowrap`}>
                                                {activity.time}
                                            </span>
                                        </div>
                                        
                                        {/* Optional: Add detail badge based on type */}
                                        {activity.type && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider ${
                                                activity.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                activity.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                activity.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                                {activity.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                                <History className={`w-6 h-6 ${textSecondaryClass}`} />
                            </div>
                            <p className={`text-xs ${textSecondaryClass}`}>No recent activity</p>
                            <p className={`text-[10px] ${textSecondaryClass} mt-1`}>Your workflow actions will appear here</p>
                        </div>
                    )}
                </div>

                {activities.length > 8 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <Button variant="ghost" className={`w-full text-[10px] font-bold ${textSecondaryClass} hover:${textClass} hover:bg-white/5 h-8 transition-all`}>
                            View All Activities
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
