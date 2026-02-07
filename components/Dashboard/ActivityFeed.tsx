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
        <div className="w-full p-4">
            <div className="relative">
                {/* Visual Flair */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-olleey-yellow/5 rounded-full blur-[80px] pointer-events-none" />

                {activitiesLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                        <Loader2 className="w-8 h-8 animate-spin text-olleey-yellow opacity-40 stroke-[1px]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Polling Neural Streams...</p>
                    </div>
                ) : activities.length > 0 ? (
                    <div className="relative space-y-3">
                        {/* Timeline Connector */}
                        <div className="absolute left-[34px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-white/10 via-white/[0.05] to-transparent pointer-events-none" />

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
                            className="space-y-3"
                        >
                            {activities.slice(0, 10).map((activity, index) => (
                                <motion.div
                                    key={`${activity.id}-${index}`}
                                    variants={itemVariants}
                                    className="relative flex gap-4 items-center group cursor-pointer"
                                >
                                    {/* Icon Container with multi-layered design */}
                                    <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                                        <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-xl border border-white/5 ${getIconBgColor(activity.icon)} backdrop-blur-xl transition-all duration-500 group-hover:scale-110 shadow-lg`}>
                                            {getIconComponent(activity.icon)}
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute inset-0 bg-olleey-yellow/10 rounded-full blur-xl animate-pulse pointer-events-none" />
                                        )}
                                    </div>

                                    {/* Content area */}
                                    <div className="flex-1 min-w-0 bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all duration-300 group-hover:bg-white/[0.05] group-hover:border-white/10 group-hover:px-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] italic">Stream::{activity.type || 'Event'}</span>
                                                    {activity.type === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />}
                                                </div>
                                                <p className="text-[11px] font-bold text-white/80 leading-snug tracking-tight group-hover:text-olleey-yellow transition-colors">
                                                    {activity.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Clock className="w-3 h-3 text-white/10" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">
                                                    {activity.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                        <History className="w-8 h-8 mx-auto mb-4 text-white/10 stroke-[1px]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Log Empty</p>
                    </div>
                )}
            </div>

            {activities.length > 10 && (
                <div className="mt-6 px-4">
                    <Button
                        variant="ghost"
                        className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                        Access Archives
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            )}
        </div>
    );
}
