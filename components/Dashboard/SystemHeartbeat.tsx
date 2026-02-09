"use client";

import React from "react";
import { History, BarChart3, Activity } from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";
import { RowSkeleton } from "./DashboardSkeletons";
import { motion } from "framer-motion";

interface SystemHeartbeatProps {
    activities: any[];
    activitiesLoading: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    isDark: boolean;
    itemVariants: any;
}

export function SystemHeartbeat({
    activities,
    activitiesLoading,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    isDark,
    itemVariants
}: SystemHeartbeatProps) {
    return (
        <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4 min-h-[480px]"
        >
            <div className="flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                        <History className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-normal ${textClass} tracking-tight leading-none`}>System Heartbeat</h3>
                        <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest opacity-40 mt-1`}>Audit trail</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-500/5 rounded-full border border-blue-500/10">
                        <BarChart3 className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">{activities.length} Events</span>
                    </div>
                </div>
            </div>

            <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] to-transparent pointer-events-none" />
                <div className="flex-1 overflow-hidden">
                    {!activitiesLoading && activities.length === 0 ? (
                        <div className="flex flex-col h-full items-center justify-center opacity-30 p-12">
                            <Activity className="w-8 h-8 opacity-20 mb-4" />
                            <p className={`text-[10px] font-white text-blue-400 uppercase tracking-[0.2em]`}>Awaiting system interaction</p>
                        </div>
                    ) : activitiesLoading ? (
                        <div className="p-4 h-full">
                            <RowSkeleton count={5} isDark={isDark} />
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-y-auto custom-scrollbar">
                            <ActivityFeed
                                activitiesLoading={activitiesLoading}
                                activities={activities.slice(0, 10)}
                                textClass={textClass}
                                textSecondaryClass={textSecondaryClass}
                                cardClass="bg-transparent"
                                borderClass="border-none"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
