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
import { ViewType } from "../DashboardLayout";

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
            <div className={`flex flex-col items-center justify-center h-full p-8`}>
                <Loader2 className={`h-8 w-8 animate-spin text-[#D97757] mb-4`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/30" : "text-gray-400"}`}>Calibrating Engines...</p>
            </div>
        );
    }

    return (
        <div className={`w-full h-full overflow-y-auto pt-6 pb-24 px-8 custom-scrollbar`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Compact Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Rocket className="w-4 h-4 text-[#D97757]" />
                            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} tracking-tight`}>
                                Manual Ingestion
                            </h1>
                        </div>
                        <p className={`${isDark ? "text-gray-500" : "text-gray-500"} text-xs font-medium uppercase tracking-widest`}>
                            Configure your AI dubbing pipeline
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
