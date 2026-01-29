"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Zap, Globe, ShieldCheck, Sparkles } from "lucide-react";
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
                <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2.5 bg-black rounded-2xl">
                                <Zap className="w-5 h-5 text-rolleey-yellow" />
                            </div>
                            <h3 className="text-2xl font-normal tracking-tight">Usage Estimator</h3>
                        </div>

                        <div className="space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-6xl md:text-8xl font-normal tracking-tighter text-black tabular-nums">
                                            {minutes}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Minutes per month</span>
                                    </div>
                                    <div className="hidden sm:block text-right">
                                        <span className="text-sm font-medium text-zinc-400">Average production cycle</span>
                                    </div>
                                </div>

                                {/* Refined Slider */}
                                <div className="relative pt-4 px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={minutes}
                                        onChange={(e) => setMinutes(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-black transition-all hover:h-2"
                                        style={{
                                            background: `linear-gradient(to right, #000 0%, #000 ${(minutes / 500) * 100}%, #f4f4f5 ${(minutes / 500) * 100}%, #f4f4f5 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between mt-6 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        <span>Single Video</span>
                                        <span>Global Studio</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-zinc-100 grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scale Support</p>
                            <p className="text-sm text-zinc-600 leading-relaxed">Need more than 500 minutes? Our enterprise team can build a custom buffer for your fleet.</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end justify-end">
                            <button className="group text-sm font-bold text-black inline-flex items-center gap-2 hover:opacity-70 transition-all">
                                Contact Sales <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Dynamic Plan Card */}
                <div className="relative group perspective-1000">
                    <div className="h-full bg-black rounded-[3rem] p-10 md:p-14 text-white shadow-[0_48px_80px_-20px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-all duration-700 hover:scale-[1.01] overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rolleey-yellow/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-rolleey-yellow/20 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rolleey-yellow/60">Current Selection</span>
                                    <h3 className="text-3xl font-normal tracking-tight italic">{tier.name}</h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <TierIcon className="w-6 h-6 text-rolleey-yellow" />
                                </div>
                            </div>

                            <div className="mb-10">
                                {tier.price !== null ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-7xl font-light tracking-tighter tabular-nums">${tier.price}</span>
                                        <span className="text-lg font-medium text-white/40">/mo</span>
                                    </div>
                                ) : (
                                    <div className="text-4xl font-light tracking-tighter">Custom Quota</div>
                                )}
                            </div>

                            <p className="text-lg text-white/50 leading-relaxed mb-12 max-w-xs">
                                {tier.description}
                            </p>

                            <div className="space-y-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Capabilities Include</p>
                                <ul className="grid gap-4">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-sm font-medium text-white/80">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rolleey-yellow" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="relative z-10 mt-14">
                            <Button
                                onClick={onGetStarted}
                                className="w-full bg-rolleey-yellow text-black hover:bg-white h-16 rounded-2xl text-base font-bold transition-all shadow-2xl shadow-rolleey-yellow/20"
                            >
                                Deploy Pipeline
                            </Button>
                            <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest mt-4">
                                Cancel or upgrade anytime
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
