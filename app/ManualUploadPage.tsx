"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { youtubeAPI, type MasterNode } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useAuth } from "@/lib/AuthContext";
import { useVideos } from "@/lib/useVideos";
import { useSupabaseChannels } from "@/lib/useSupabase";
import { Loader2, Zap, LayoutGrid, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { resolveClientUserId } from "@/lib/user";

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

interface ManualUploadPageProps {
    channelGraph?: MasterNode[];
}

export default function ManualUploadPage({ channelGraph: initialChannelGraph }: ManualUploadPageProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { selectedProject } = useProject();
    const { user, loading: authLoading } = useAuth();
    const userId = resolveClientUserId(user?.id);
    
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

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    
    // Add console logging for debugging
    console.log('[ManualUploadPage] State:', {
        channelsCount: supabaseChannels?.length || 0,
        loading: isLoading,
        userId,
        authLoading,
        selectedProject: selectedProject?.id
    });

    // Build channel list directly from Supabase
    const allChannels = (supabaseChannels || []).map(ch => ({
        id: ch.channel_id,
        name: ch.channel_name,
        language_code: ch.language_code,
        language_name: ch.language_name,
        is_master: ch.is_master || false
    }));
    
    console.log('[ManualUploadPage] Available channels:', {
        total: allChannels.length,
        masters: allChannels.filter(ch => ch.is_master).length,
        satellites: allChannels.filter(ch => !ch.is_master).length
    });

    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center h-full ${bgClass} p-8 animate-pulse`}>
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <Loader2 className={`h-10 w-10 animate-spin text-olleey-yellow stroke-[1.5px]`} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Calibrating Engines...</p>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${bgClass} overflow-y-auto pt-6 pb-24 px-6 custom-scrollbar`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Immersive Header */}
                <motion.div variants={itemVariants} className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 min-h-[200px] flex items-end bg-[#0c0c0c]">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-[10000ms]"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />

                    <div className="relative z-10 p-8 w-full">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-olleey-yellow/10 backdrop-blur-3xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-4">
                            <Rocket className="w-4 h-4" /> Deployment Interface
                        </div>
                        <h1 className={`text-3xl md:text-5xl font-normal text-white tracking-tighter mb-2 leading-none`}>
                            Manual Ingestion
                        </h1>
                        <p className={`${textSecondaryClass} text-sm md:text-base max-w-2xl font-light tracking-tight leading-relaxed`}>
                            Bridge the gap between languages. Configure your AI dubbing pipeline, define audio-visual synthesis parameters, and scale your content for international markets.
                        </p>
                    </div>
                </motion.div>

                {/* Main Action View */}
                <motion.div variants={itemVariants} className="relative z-20">
                    <ManualProcessView
                        availableChannels={allChannels}
                        projectId={selectedProject?.id}
                        onSuccess={() => {
                            router.push("/app?page=Dashboard");
                            refetchVideos();
                        }}
                        onCancel={() => router.push("/app?page=Dashboard")}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
