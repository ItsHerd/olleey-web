"use client";

import React from "react";
import {
    History,
    Loader2,
    CheckCircle,
    Radio,
    Plus,
    Youtube,
    Zap,
    Upload,
    FileCheck,
    Play,
    ArrowRight,
    Sparkles,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityItem } from "@/lib/api";
import { motion } from "framer-motion";

interface ActivityFeedProps {
    activitiesLoading: boolean;
    activities: ActivityItem[];
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
}

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

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
                return <Plus className="w-3.5 h-3.5 text-olleey-yellow" />;
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
                return 'bg-green-500/10 border-green-500/10';
            case 'upload':
                return 'bg-blue-500/10 border-blue-500/10';
            case 'plus':
                return 'bg-olleey-yellow/10 border-olleey-yellow/10';
            case 'youtube':
                return 'bg-red-500/10 border-red-500/10';
            case 'alert':
                return 'bg-yellow-500/10 border-yellow-500/10';
            default:
                return 'bg-olleey-yellow/10 border-olleey-yellow/10';
        }
    };

    return (
        <div className="w-full">
            <div className={`${cardClass} border-none rounded-none p-6 relative overflow-hidden bg-black/10`}>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-olleey-yellow/5 rounded-full -mr-24 -mt-24 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-[60px] pointer-events-none" />

                <div className="relative">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/5 border border-white/10 rounded-none">
                                <History className="w-4 h-4 text-white/40" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                                Global Activity Log
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-500/70">Live</span>
                        </div>
                    </div>

                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-16 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

                    {activitiesLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-olleey-yellow opacity-40 stroke-[1px]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Polling Feed...</p>
                        </div>
                    ) : activities.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                            className="space-y-8"
                        >
                            {activities.slice(0, 8).map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    variants={itemVariants}
                                    className="relative flex gap-5 items-start group"
                                >
                                    {/* Icon Container with multi-layered border */}
                                    <div className="relative shrink-0">
                                        <div className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-none border border-white/5 ${getIconBgColor(activity.icon)} backdrop-blur-md transition-all group-hover:border-olleey-yellow/50 group-hover:scale-105 duration-500 shadow-xl`}>
                                            {getIconComponent(activity.icon)}
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute -inset-1 bg-olleey-yellow/5 rounded-none blur-sm animate-pulse pointer-events-none" />
                                        )}
                                    </div>

                                    {/* Content area */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-baseline justify-between gap-4 mb-2">
                                            <p className="text-xs font-bold text-white/80 leading-relaxed tracking-tight group-hover:text-white transition-colors">
                                                {activity.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-white/20" />
                                                <span className="text-[10px] font-medium text-white/30 lowercase italic">
                                                    {activity.time}
                                                </span>
                                            </div>

                                            {activity.type && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${activity.type === 'success' ? 'text-green-500/60' :
                                                            activity.type === 'warning' ? 'text-olleey-yellow/60' :
                                                                activity.type === 'error' ? 'text-red-500/60' :
                                                                    'text-blue-500/60'
                                                        }`}>
                                                        {activity.type}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pt-2 pr-2">
                                        <ArrowRight className="w-3 h-3 text-olleey-yellow" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-none bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-40">
                                <History className={`w-8 h-8 ${textSecondaryClass} stroke-[1px]`} />
                            </div>
                            <p className="text-sm font-normal text-white mb-1 tracking-tight">System event log is empty</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Operational stream offline</p>
                        </div>
                    )}
                </div>

                {activities.length > 8 && (
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <Button
                            variant="ghost"
                            className="w-full h-12 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-olleey-yellow transition-all flex items-center justify-center gap-2 group"
                        >
                            Open Activity Vault
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
