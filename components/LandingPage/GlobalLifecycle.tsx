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
        <section id="distribution" className="py-32 bg-white dark:bg-black border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
             {/* Grid Background - Light Mode */}
             <div className="absolute inset-0 z-0 opacity-5 dark:opacity-0 transition-opacity duration-300" 
                style={{ 
                    backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} 
            />
            {/* Grid Background - Dark Mode */}
            <div className="absolute inset-0 z-0 opacity-0 dark:opacity-10 transition-opacity duration-300" 
               style={{ 
                   backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                   backgroundSize: '40px 40px'
               }} 
           />
            
            <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px] relative z-10">
                {/* Header Text */}
                <div className="mb-24 relative border-l-2 border-black/20 dark:border-white/20 pl-8 transition-colors duration-300">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-black/20 dark:border-white/20 transition-colors duration-300" />
                     <div className="absolute -left-[5px] bottom-0 w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 transition-colors duration-300" />
                     
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 border border-black/30 dark:border-white/30 mb-6 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse transition-colors duration-300" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black dark:text-white transition-colors duration-300">The Workflow</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[40px] md:text-[60px] leading-[1.1] font-normal tracking-tight text-black dark:text-white font-mono uppercase transition-colors duration-300"
                    >
                        How it <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent transition-colors duration-300">works</span>.
                    </motion.h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">

                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[40px] left-0 right-0 h-px bg-black/20 dark:bg-white/20 -z-10 border-t border-dashed border-black/40 dark:border-white/40 opacity-50 transition-colors duration-300" />

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
                                    <div className="w-20 h-20 bg-white dark:bg-black border border-black/20 dark:border-white/20 flex items-center justify-center transition-all duration-300 group-hover:border-black dark:group-hover:border-white group-hover:bg-black/5 dark:group-hover:bg-white/10 relative overflow-hidden rounded-full md:rounded-none">
                                        <div className="absolute top-0 right-0 p-1">
                                            <div className="w-1.5 h-1.5 border border-black/40 dark:border-white/40 transition-colors duration-300" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-1">
                                            <div className="w-1.5 h-1.5 border border-black/40 dark:border-white/40 bg-black/10 dark:bg-white/10 transition-colors duration-300" />
                                        </div>
                                        
                                        <Icon className="w-8 h-8 text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-black border border-black/20 dark:border-white/20 flex items-center justify-center text-[10px] font-mono text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white group-hover:border-black dark:group-hover:border-white transition-all z-20 rounded-full md:rounded-none">
                                        0{idx + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="border-l border-black/10 dark:border-white/10 pl-6 group-hover:border-black/40 dark:group-hover:border-white/40 transition-colors duration-300">
                                    <h3 className="text-sm font-bold text-black dark:text-white mb-3 font-mono uppercase tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                                        {step.title}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-gray-500 text-xs leading-relaxed font-mono transition-colors duration-300">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action Hint - Technical */}

            </div>
        </section>
    );
};
