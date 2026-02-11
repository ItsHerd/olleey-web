"use client";

import React from "react";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useAuth } from "@/lib/AuthContext";
import { useVideos } from "@/lib/useVideos";
import { useSupabaseChannels } from "@/lib/useSupabase";
import { Loader2, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { ViewType } from "../DashboardV2Layout";

interface ManualWorkflowViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        } as const
    }
};

export function ManualWorkflowView({ onViewChange, theme }: ManualWorkflowViewProps) {
    const { selectedProject } = useProject();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id;
    const isDark = theme === "dark";

    // Fetch data from Supabase ONLY
    const { refetch: refetchVideos } = useVideos({
        project_id: selectedProject?.id,
        user_id: userId
    }, {
        enabled: !!userId && !authLoading
    });

    const {
        channels: supabaseChannels,
        loading: channelsLoading
    } = useSupabaseChannels(
        userId,
        { project_id: selectedProject?.id },
        { enabled: !!userId && !authLoading }
    );

    const isLoading = channelsLoading || authLoading;

    // Build channel list directly from Supabase
    const allChannels = (supabaseChannels || []).map(ch => ({
        id: ch.channel_id,
        name: ch.channel_name,
        language_code: ch.language_code,
        language_name: ch.language_name,
        is_master: ch.is_master || false
    }));

    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center h-full p-8 animate-pulse`}>
                <div className={`w-20 h-20 rounded-[2.5rem] ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"} border flex items-center justify-center mb-8`}>
                    <Loader2 className={`h-10 w-10 animate-spin text-olleey-yellow stroke-[1.5px]`} />
                </div>
                <p className={`text-xs font-black uppercase tracking-[0.4em] ${isDark ? "text-white/30" : "text-gray-400"}`}>Calibrating Engines...</p>
            </div>
        );
    }

    return (
        <div className={`w-full h-full overflow-y-auto pt-6 pb-24 px-8 custom-scrollbar`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* Simplified Header */}
                <motion.div variants={itemVariants} className={`relative group rounded-3xl border ${isDark ? "border-white/5 bg-[#0c0c0c]" : "border-gray-200 bg-white"} p-8 overflow-hidden shadow-2xl`}>
                    <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-gradient-to-br from-gray-50 to-transparent"} pointer-events-none`} />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olleey-yellow/10 border border-olleey-yellow/20 text-[9px] font-black uppercase tracking-[0.2em] text-olleey-yellow mb-4 shadow-sm">
                            <Rocket className="w-3 h-3" /> Deployment
                        </div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2 tracking-tight`}>
                            Manual Ingestion
                        </h1>
                        <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm max-w-xl leading-relaxed`}>
                            Configure your AI dubbing pipeline and launch new localizations.
                        </p>
                    </div>
                </motion.div>

                {/* Main Action View */}
                <motion.div variants={itemVariants} className="relative z-20">
                    <ManualProcessView
                        availableChannels={allChannels}
                        projectId={selectedProject?.id}
                        onSuccess={() => {
                            if (onViewChange) onViewChange("dashboard");
                            refetchVideos();
                        }}
                        onCancel={() => {
                            if (onViewChange) onViewChange("dashboard");
                        }}
                        compact={true}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
