"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Languages, CheckCircle2, Rocket } from 'lucide-react';

const steps = [
    {
        title: "Your video hits the web.",
        description: "Zero-latency master detection across YouTube, RSS, and storage buckets the moment you upload.",
        icon: Globe,
        color: "text-blue-500",
        delay: 0.1
    },
    {
        title: "Olleey rebuilds it for every language.",
        description: "Simultaneous neural voice cloning and regenerative lip-syncing spin up in parallel for every region.",
        icon: Languages,
        color: "text-purple-500",
        delay: 0.2
    },
    {
        title: "Everything feels native.",
        description: "Preserving 1:1 vocal identity and emotive nuances so your identity remains native globally.",
        icon: Zap,
        color: "text-olleey-yellow",
        delay: 0.3
    },
    {
        title: "Olleey publishes to your destinations.",
        description: "Direct-to-platform distribution via YouTube MLA tracks or regional satellite channels.",
        icon: Rocket,
        color: "text-orange-500",
        delay: 0.4
    },
    {
        title: "You reach the world—hands free.",
        description: "The result: a frictionless global release, every time. Pure automation from end to end.",
        icon: CheckCircle2,
        color: "text-green-500",
        delay: 0.5
    }
];

export const GlobalLifecycle = () => {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
                {/* Header Text */}
                <div className="mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 rounded-full border border-black/5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-olleey-yellow animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">The Workflow</span>
                    </div>
                    <h2 className="text-[40px] md:text-[60px] leading-[1.1] font-normal tracking-tighter text-black max-w-3xl">
                        Global growth on <span className="font-semibold italic">autopilot</span>.
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[40px] left-[5%] right-[5%] h-[2px] bg-zinc-100 -z-10" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: step.delay }}
                                className="relative group"
                            >
                                {/* Step Indicator */}
                                <div className="mb-8 relative">
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-black group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]">
                                        <Icon className="w-8 h-8 text-black group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:border-black group-hover:text-black transition-all">
                                        0{idx + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-4 leading-tight group-hover:text-olleey-yellow transition-colors tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Hover Glow Effect (Mobile hidden) */}
                                <div className="absolute inset-x-0 -bottom-8 h-1 bg-olleey-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left hidden md:block" />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 pt-20 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                        Ready to scale your reach?
                    </p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-zinc-200 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-zinc-200 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-zinc-200 animate-bounce [animation-delay:0.4s]" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
