"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { youtubeAPI, type MasterNode } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { Loader2, Zap, LayoutGrid, Rocket } from "lucide-react";
import { motion } from "framer-motion";

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
    const { refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id });
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>(initialChannelGraph || []);
    const [isLoading, setIsLoading] = useState(!initialChannelGraph);

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

    useEffect(() => {
        if (initialChannelGraph) {
            setChannelGraph(initialChannelGraph);
            setIsLoading(false);
            return;
        }
        const loadChannelGraph = async () => {
            try {
                setIsLoading(true);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Loading timeout')), 5000)
                );
                const dataPromise = youtubeAPI.getChannelGraph();
                const graph = await Promise.race([dataPromise, timeoutPromise]) as any;
                setChannelGraph(graph.master_nodes || []);
            } catch (error) {
                logger.error("ManualUploadPage", "Failed to load channel graph", error);
                setChannelGraph([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadChannelGraph();
    }, []);

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

    const allChannels = [
        ...channelGraph.map(m => ({
            id: m.channel_id,
            name: m.channel_name,
            language_code: m.language_code,
            language_name: m.language_name,
            is_master: true
        })),
        ...channelGraph.flatMap((master: MasterNode) =>
            master.language_channels.map((lc: any) => ({
                id: lc.channel_id,
                name: lc.channel_name,
                language_code: lc.language_code,
                language_name: lc.language_name,
                is_master: false
            }))
        )
    ];

    return (
        <div className={`w-full h-full ${bgClass} overflow-y-auto pt-8 pb-32 px-6 custom-scrollbar`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-12"
            >
                {/* Immersive Header */}
                <motion.div variants={itemVariants} className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 min-h-[280px] flex items-end shadow-2xl bg-[#0c0c0c]">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-[10000ms]"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />

                    <div className="relative z-10 p-12 w-full">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-olleey-yellow/10 backdrop-blur-3xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-6 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                            <Rocket className="w-4 h-4 shadow-sm" /> Deployment Interface
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-normal text-white tracking-tighter mb-3 leading-none`}>
                            Manual Ingestion
                        </h1>
                        <p className={`${textSecondaryClass} text-sm md:text-base max-w-2xl font-light tracking-tight opacity-60 leading-relaxed`}>
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
