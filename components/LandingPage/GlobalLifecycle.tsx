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
        <section id="distribution" className="py-32 bg-black border-t border-white/10 relative overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0 z-0 opacity-10" 
                style={{ 
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} 
            />
            
            <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px] relative z-10">
                {/* Header Text */}
                <div className="mb-24 relative border-l-2 border-white/20 pl-8">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-white/20" />
                     <div className="absolute -left-[5px] bottom-0 w-2 h-2 rounded-full bg-white/20" />
                     
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 border border-white/30 mb-6 bg-black"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white">The Workflow</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[40px] md:text-[60px] leading-[1.1] font-normal tracking-tight text-white font-mono uppercase"
                    >
                        Global growth on <span className="text-white/50">autopilot</span>.
                    </motion.h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">

                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[40px] left-0 right-0 h-px bg-white/20 -z-10 border-t border-dashed border-white/40 opacity-50" />

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
                                <div className="mb-8 relative z-10">
                                    <div className="w-20 h-20 bg-black border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:border-white group-hover:bg-white/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-1">
                                            <div className="w-1.5 h-1.5 border border-white/40" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-1">
                                            <div className="w-1.5 h-1.5 border border-white/40 bg-white/10" />
                                        </div>
                                        
                                        <Icon className="w-8 h-8 text-white/60 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/20 flex items-center justify-center text-[10px] font-mono text-white/50 group-hover:text-white group-hover:border-white transition-all z-20">
                                        0{idx + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="border-l border-white/10 pl-6 group-hover:border-white/40 transition-colors">
                                    <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase tracking-wider group-hover:text-white transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs leading-relaxed font-mono">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action Hint - Technical */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">
                        &gt; SYSTEM_READY_FOR_DEPLOYMENT
                    </p>
                    <div className="flex gap-2 text-[10px] font-mono text-white/30">
                        <span>LATENCY: 12ms</span>
                        <span>|</span>
                        <span>UPTIME: 99.99%</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
