"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManualProcessView } from "@/components/ui/manual-process-view";
import { youtubeAPI, type MasterNode } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useVideos } from "@/lib/useVideos";
import { Loader2 } from "lucide-react";

export default function ManualUploadPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { selectedProject } = useProject();
    const { refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id });
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

    useEffect(() => {
        const loadChannelGraph = async () => {
            try {
                setIsLoading(true);
                const graph = await youtubeAPI.getChannelGraph();
                setChannelGraph(graph.master_nodes || []);
            } catch (error) {
                logger.error("ManualUploadPage", "Failed to load channel graph", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadChannelGraph();
    }, []);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-full ${bgClass}`}>
                <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass}`} />
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
        <div className={`w-full h-full ${bgClass} overflow-y-auto pt-8 pb-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className={`text-3xl font-normal ${textClass} tracking-tight mb-2`}>Manual Workflow</h1>
                    <p className={`${textSecondaryClass} text-sm`}>
                        Configure your AI dubbing pipeline and international distribution strategy.
                    </p>
                </div>

                <ManualProcessView
                    availableChannels={allChannels}
                    projectId={selectedProject?.id}
                    onSuccess={() => {
                        router.push("/app?page=Dashboard");
                        refetchVideos();
                    }}
                    onCancel={() => router.push("/app?page=Dashboard")}
                />
            </div>
        </div>
    );
}
