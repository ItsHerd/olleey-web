"use client";

import React from "react";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProductionPipeline } from "./ProductionPipeline";
import { ActiveDistributions } from "./ActiveDistributions";
import { motion } from "framer-motion";

interface GridDashboardProps {
    userName: string;
    userEmail: string;
    projects: any[];
    selectedProject: any;
    videos: any[];
    videosLoading: boolean;
    activities: any[];
    activitiesLoading: boolean;
    getOverallVideoStatus: (localizations: any) => string;
    isDark: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    onNavigate: (videoId: string) => void;
    onCreateProject: () => void;
    totalVideos: number;
    totalTranslations: number;
    channels?: any[];
    jobs?: any[];
}

export function GridDashboard({
    userName,
    userEmail,
    projects,
    selectedProject,
    videos,
    videosLoading,
    activities,
    activitiesLoading,
    getOverallVideoStatus,
    isDark,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    onNavigate,
    onCreateProject,
    totalVideos,
    totalTranslations,
    channels = [],
    jobs = []
}: GridDashboardProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full h-auto pb-20"
        >
            <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {/* Profile Hero Card */}
                <ProfileHeroCard
                    userName={userName}
                    totalVideos={totalVideos}
                    totalTranslations={totalTranslations}
                    isDark={isDark}
                    onCreateProject={onCreateProject}
                    itemVariants={itemVariants}
                />

                {/* Production Pipeline - Extended to fill the right column */}
                <ProductionPipeline
                    videos={videos}
                    videosLoading={videosLoading}
                    jobs={jobs}
                    getOverallVideoStatus={getOverallVideoStatus}
                    onNavigate={onNavigate}
                    isDark={isDark}
                    textClass={textClass}
                    textSecondaryClass={textSecondaryClass}
                    cardClass={cardClass}
                    borderClass={borderClass}
                    itemVariants={itemVariants}
                />

                {/* Active Distributions */}
                <ActiveDistributions
                    videos={videos}
                    videosLoading={videosLoading}
                    getOverallVideoStatus={getOverallVideoStatus}
                    onNavigate={onNavigate}
                    textClass={textClass}
                    textSecondaryClass={textSecondaryClass}
                    cardClass={cardClass}
                    borderClass={borderClass}
                    isDark={isDark}
                    itemVariants={itemVariants}
                />
            </div>

            {/* Dashboard Layout Optimization */}
            <style jsx global>{`
                /* Dark Mode Scrollbar */
                .dark .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                /* Light Mode Scrollbar */
                .light .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .light .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .light .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 20px;
                }
                .light .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </motion.div>
    );
}
