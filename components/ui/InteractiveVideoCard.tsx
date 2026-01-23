"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Play, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the InteractiveVideoCard component.
 */
export interface InteractiveVideoCardProps {
    video: {
        title: string;
        description?: string;
        thumbnail_url?: string;
        channel_name?: string;
        duration?: string;
        view_count?: string;
        // Add other video properties as needed
    };
    badges?: React.ReactNode;
    onActionClick: () => void;
    className?: string;
}

/**
 * A responsive and theme-adaptive video card with a 3D tilt effect on hover.
 */
export const InteractiveVideoCard = React.forwardRef<
    HTMLDivElement,
    InteractiveVideoCardProps
>(
    (
        { video, badges, onActionClick, className },
        ref
    ) => {
        // --- 3D Tilt Animation Logic ---
        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        const springConfig = { damping: 15, stiffness: 150 };
        const springX = useSpring(mouseX, springConfig);
        const springY = useSpring(mouseY, springConfig);

        const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
        const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const { width, height, left, top } = rect;
            const mouseXVal = e.clientX - left;
            const mouseYVal = e.clientY - top;
            const xPct = mouseXVal / width - 0.5;
            const yPct = mouseYVal / height - 0.5;
            mouseX.set(xPct);
            mouseY.set(yPct);
        };

        const handleMouseLeave = () => {
            mouseX.set(0);
            mouseY.set(0);
        };

        return (
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={cn(
                    // Base styles for the card container
                    "relative h-[500px] w-full rounded-[32px] bg-[#1c1c1c] shadow-2xl border border-white/10",
                    className
                )}
            >
                <div
                    style={{
                        transform: "translateZ(50px)",
                        transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-0 flex flex-col h-full w-full rounded-[32px] overflow-hidden"
                >
                    {/* Image Section - Top 55% */}
                    <div className="relative h-[55%] w-full overflow-hidden bg-gray-900 group">
                        {video.thumbnail_url ? (
                            <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <Play className="h-16 w-16 text-gray-600" />
                            </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent opacity-60"></div>

                        {/* Video Duration Badge on Image */}
                        {video.duration && (
                            <div
                                style={{ transform: "translateZ(20px)" }}
                                className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1"
                            >
                                <Clock className="w-3 h-3" /> {video.duration}
                            </div>
                        )}
                    </div>

                    {/* Content Section - Bottom 45% */}
                    <div className="flex flex-col justify-between flex-1 p-6 md:p-8 bg-[#1c1c1c] text-white relative z-10">
                        <div>
                            {/* Title */}
                            <motion.h3
                                style={{ transform: "translateZ(30px)" }}
                                className="text-2xl font-bold mb-3 line-clamp-2 leading-tight tracking-tight text-white"
                            >
                                {video.title}
                            </motion.h3>

                            {/* Description/Channel */}
                            <motion.p
                                style={{ transform: "translateZ(20px)" }}
                                className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-normal mb-4"
                            >
                                {video.description || `Uploaded by ${video.channel_name}.`}
                            </motion.p>

                            {/* Badges/Tags Row */}
                            <motion.div
                                style={{ transform: "translateZ(25px)" }}
                                className="flex flex-wrap gap-2 mb-2"
                            >
                                {badges}
                            </motion.div>
                        </div>

                        {/* Bottom Action Area */}
                        <motion.div
                            style={{ transform: "translateZ(40px)" }}
                            className="mt-4"
                        >
                            <button
                                onClick={onActionClick}
                                className="w-full bg-white text-black font-semibold text-base py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg active:scale-95 transform duration-100"
                            >
                                View Details
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        );
    }
);
InteractiveVideoCard.displayName = "InteractiveVideoCard";
