"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface OlleeyLoaderProps {
    size?: number;
    className?: string;
}

export function OlleeyLoader({ size = 80, className = "" }: OlleeyLoaderProps) {
    const centerSize = size * 0.4;

    return (
        <div className={cn("flex items-center justify-center relative", className)}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

                {/* 1. Deep Background Glow (Slow Breathing) */}
                <motion.div
                    initial={{ opacity: 0.1, scale: 0.8 }}
                    animate={{
                        opacity: [0.1, 0.25, 0.1],
                        scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-olleey-yellow rounded-full blur-[40px]"
                />

                {/* 2. Outer Scientific Ring (Dashed, Slow Rotation) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/5"
                />

                {/* 3. Primary Orbital Ring (Gradient, Fast Rotation) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0%, transparent 70%, #EEB868 100%)",
                        padding: '2px', // Thin ring effect
                        maskComposite: 'exclude',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                    }}
                />

                {/* 4. Secondary Counter-Ring (Reflective Pulse) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-white/5 border-t-white/20"
                />

                {/* 5. The "Neural Core" (Pulsing Center) */}
                <div className="relative flex items-center justify-center" style={{ width: centerSize, height: centerSize }}>
                    {/* Inner Orbitals */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                                rotate: i * 120 + 360
                            }}
                            transition={{
                                duration: 2 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.5
                            }}
                            className="absolute inset-0 border border-olleey-yellow/30 rounded-full"
                        />
                    ))}

                    {/* Core Light Source */}
                    <div className="w-3 h-3 bg-white rounded-full relative z-10">
                        <div className="absolute inset-0 bg-white rounded-full blur-[4px] animate-pulse" />
                        <div className="absolute -inset-4 bg-olleey-yellow/40 rounded-full blur-[12px] animate-pulse" />
                    </div>

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{
                            top: ["-50%", "150%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute left-[-20%] right-[-20%] h-[2px] bg-olleey-yellow/40 blur-[1px] z-20 pointer-events-none"
                    />
                </div>

                {/* 6. Orbital Particles */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            rotate: { duration: 4 + i, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute"
                        style={{ inset: -2 }}
                    >
                        <div
                            className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: i % 2 === 0 ? '-2px' : 'auto',
                                right: i % 2 !== 0 ? '-2px' : 'auto',
                                transform: 'translateY(-50%)'
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
