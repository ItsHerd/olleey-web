"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Zap, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function PricingCalculator({ onGetStarted }: { onGetStarted: () => void }) {
    const [minutes, setMinutes] = useState(60);

    // Calculate pricing tier based on minutes
    const getPricingTier = (mins: number) => {
        if (mins === 0) {
            return {
                name: "Discovery",
                price: 0,
                icon: Sparkles,
                description: "Experience the power of professional dubbing with our entry-level tier.",
                features: [
                    "Manual localization",
                    "5 minutes processing",
                    "2 target languages",
                    "Community support"
                ]
            };
        } else if (mins <= 60) {
            return {
                name: "Starter Hub",
                price: 29,
                icon: Zap,
                description: "Perfect for growing creators looking to establish a global presence.",
                features: [
                    "Full automation engine",
                    "60 minutes processing",
                    "5 target languages",
                    "Standard resolution",
                    "Email support"
                ]
            };
        } else if (mins <= 300) {
            return {
                name: "Creator Suite",
                price: 99,
                icon: Globe,
                description: "Comprehensive solution for high-volume international distribution.",
                features: [
                    "Ultra-low latency",
                    "300 minutes processing",
                    "15 target languages",
                    "4K output support",
                    "Priority processing",
                    "Advanced analytics"
                ]
            };
        } else {
            return {
                name: "Studio Fleet",
                price: null,
                icon: ShieldCheck,
                description: "Built for massive production houses and enterprise-scale networks.",
                features: [
                    "Unlimited Everything",
                    "Custom processing limits",
                    "Uncapped languages",
                    "White-label options",
                    "API access",
                    "Dedicated manager",
                    "Custom SLAs"
                ]
            };
        }
    };

    const tier = getPricingTier(minutes);
    const TierIcon = tier.icon;

    return (
        <div className="max-w-[1200px] mx-auto">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
                {/* Left Side - Interactive Hub */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-black dark:bg-white border border-white/20 dark:border-black/20 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group rounded-[2.5rem] transition-colors duration-300"
                >
                    {/* Corner Markers */}
                    <div className="absolute top-0 left-0 p-2 border-b border-r border-white/20 dark:border-black/20 w-8 h-8 transition-colors duration-300" />
                    <div className="absolute bottom-0 right-0 p-2 border-t border-l border-white/20 dark:border-black/20 w-8 h-8 transition-colors duration-300" />

                    <div>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 dark:border-black/10 pb-4 transition-colors duration-300">
                            <div className="p-2 bg-white/10 dark:bg-black/10 transition-colors duration-300">
                                <Zap className="w-4 h-4 text-white dark:text-black transition-colors duration-300" />
                            </div>
                            <h3 className="text-sm font-mono uppercase tracking-widest text-white dark:text-black transition-colors duration-300">Usage Estimator</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-8">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-5xl md:text-6xl font-mono font-light tracking-tighter text-white dark:text-black tabular-nums transition-colors duration-300">
                                            {minutes}
                                        </span>
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 dark:text-black/40 transition-colors duration-300">Minutes per month</span>
                                    </div>
                                    <div className="hidden sm:block text-right">
                                        <span className="text-[10px] font-mono text-white/40 dark:text-black/40 uppercase tracking-wider transition-colors duration-300">Avg. Production Cycle</span>
                                    </div>
                                </div>

                                {/* Refined Slider - Technical */}
                                <div className="relative pt-4 px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={minutes}
                                        onChange={(e) => setMinutes(Number(e.target.value))}
                                        className="w-full h-1 bg-white/10 dark:bg-black/10 appearance-none cursor-pointer transition-colors duration-300"
                                        style={{
                                            background: `linear-gradient(to right, currentColor 0%, currentColor ${(minutes / 500) * 100}%, transparent ${(minutes / 500) * 100}%, transparent 100%)`
                                        }}
                                    />
                                    <style jsx>{`
                                        input[type=range] {
                                            color: white;
                                        }
                                        :global(.dark) input[type=range] {
                                            color: black;
                                        }
                                        input[type=range]::-webkit-slider-thumb {
                                            -webkit-appearance: none;
                                            height: 16px;
                                            width: 16px;
                                            background: #000;
                                            border: 2px solid white;
                                            cursor: pointer;
                                            transition: all 0.2s;
                                        }
                                        :global(.dark) input[type=range]::-webkit-slider-thumb {
                                            background: #fff;
                                            border: 2px solid black;
                                        }
                                        input[type=range]::-webkit-slider-thumb:hover {
                                            background: white;
                                        }
                                        :global(.dark) input[type=range]::-webkit-slider-thumb:hover {
                                            background: black;
                                        }
                                    `}</style>
                                    <div className="flex justify-between mt-6 text-[9px] font-mono text-white/40 dark:text-black/40 uppercase tracking-widest transition-colors duration-300">
                                        <span>Single Video</span>
                                        <span>Global Studio</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 dark:border-black/10 grid sm:grid-cols-2 gap-6 transition-colors duration-300">
                        <div className="space-y-2">
                            <p className="text-[9px] font-mono uppercase tracking-widest text-white/60 dark:text-black/60 transition-colors duration-300">Scale Support</p>
                            <p className="text-xs font-mono text-white/40 dark:text-black/40 leading-relaxed transition-colors duration-300">Need more than 500 minutes? Our enterprise team can build a custom buffer for your fleet.</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end justify-end">
                            <button className="group text-xs font-mono font-bold text-white dark:text-black inline-flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all uppercase tracking-wider px-4 py-2 border border-white/20 dark:border-black/20 rounded-full">
                                Contact Sales <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Dynamic Plan Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative group"
                >
                    <div className="h-full bg-white dark:bg-black border border-black dark:border-white p-6 md:p-8 text-black dark:text-white flex flex-col justify-between transition-all duration-700 relative overflow-hidden rounded-[2.5rem]">
                        {/* Technical Grid Background */}
                        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none transition-opacity duration-300"
                            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6 border-b border-black/10 dark:border-white/10 pb-4 transition-colors duration-300">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/60 dark:text-white/60 transition-colors duration-300">Current Selection</span>
                                    <h3 className="text-2xl font-mono uppercase tracking-widest font-bold">{tier.name}</h3>
                                </div>
                                <div className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center transition-colors duration-300">
                                    <TierIcon className="w-4 h-4 text-black dark:text-white transition-colors duration-300" />
                                </div>
                            </div>

                            <div className="mb-6">
                                {tier.price !== null ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-mono font-bold tracking-tighter tabular-nums text-black dark:text-white transition-colors duration-300">${tier.price}</span>
                                        <span className="text-sm font-mono text-black/40 dark:text-white/40 transition-colors duration-300">/mo</span>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-mono font-bold tracking-tighter text-black dark:text-white uppercase transition-colors duration-300">Custom Quota</div>
                                )}
                            </div>

                            <p className="text-sm font-mono text-black/60 dark:text-white/60 leading-relaxed mb-6 max-w-xs border-l-2 border-black/10 dark:border-white/10 pl-4 transition-colors duration-300">
                                {tier.description}
                            </p>

                            <div className="space-y-6">
                                <p className="text-[9px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40 transition-colors duration-300">Capabilities Include</p>
                                <ul className="grid gap-3">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-xs font-mono font-bold text-black dark:text-white uppercase tracking-wide transition-colors duration-300">
                                            <div className="w-1 h-1 bg-black dark:bg-white transition-colors duration-300" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            <Button
                                onClick={onGetStarted}
                                className="w-full bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 h-14 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-all border border-transparent hover:border-black dark:hover:border-white shadow-none"
                            >
                                Deploy Pipeline
                            </Button>
                            <p className="text-center text-black/40 dark:text-white/40 text-[9px] font-mono uppercase tracking-widest mt-4 transition-colors duration-300">
                                Cancel or upgrade anytime
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
