"use client";

import { useTheme } from "@/lib/useTheme";
import { youtubeAPI } from "@/lib/api";
import { logger } from "@/lib/logger";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SocialIcon } from 'react-social-icons';

export const runtime = 'edge';

export default function AddConnectionPage() {
    const { theme } = useTheme();

    // Hardcoded to match the clean "white" aesthetic of the screenshot for now, 
    // but keeping dark mode support via classes if needed.
    // The screenshot shows a very light gray background with a white card.

    const handleYouTubeConnect = async () => {
        try {
            const response = await youtubeAPI.initiateConnection();
            if (response.auth_url) {
                window.location.href = response.auth_url;
            }
        } catch (error) {
            logger.error("Connections", "Failed to initiate YouTube connection", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-black flex items-center justify-center p-4 pb-32">
            {/* Global Back Button */}
            <Link
                href="/app?page=Channels"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-white/80 dark:hover:bg-black/80"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </Link>

            <div className="w-full max-w-2xl">
                {/* Main Card */}
                <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect a platform</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Select a platform to connect your account and start dubbing your content.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Row 1: YouTube and TikTok */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* YouTube - Active */}
                            <button
                                onClick={handleYouTubeConnect}
                                className="group flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all text-left bg-white dark:bg-[#111]"
                            >
                                <div className="flex-shrink-0">
                                    <SocialIcon network="youtube" style={{ height: 32, width: 32 }} />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                                    YouTube
                                </span>
                                {/* Green active dot similar to screenshot */}
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </button>

                            {/* TikTok - Coming Soon */}
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-70 cursor-not-allowed">
                                <div className="flex-shrink-0">
                                    <SocialIcon network="tiktok" style={{ height: 32, width: 32 }} />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                                    TikTok
                                </span>
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            </div>
                        </div>

                        {/* Row 2: Instagram */}
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-70 cursor-not-allowed">
                            <div className="flex-shrink-0">
                                <SocialIcon network="instagram" style={{ height: 32, width: 32 }} />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    Instagram
                                </span>
                                <span className="ml-2 text-xs text-gray-500">Coming Soon</span>
                            </div>
                        </div>

                        {/* Row 3: More coming soon placeholder */}
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-default">
                            <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border border-dashed border-gray-300 dark:border-gray-600 text-gray-400">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    More platforms
                                </span>
                                <span className="ml-2 text-xs text-gray-500">We are adding more integrations soon</span>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                        <span>Looking for something else?</span>
                        <a href="#" className="underline hover:text-gray-900 dark:hover:text-white">Contact support</a>
                    </div>
                </div>
            </div>

        </div>
    );
}
