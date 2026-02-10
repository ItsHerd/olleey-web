"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, Globe2, Play, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Upload,
        title: "Voice Cloning",
        description: "Our neural engine isolates and reconstructs your unique vocal biomarkers in 40+ languages.",
        detail: "Identity Preservation",
        color: "from-blue-500 to-cyan-500",
    },
    {
        number: "02",
        icon: Sparkles,
        title: "Lipsync AI",
        description: "Regenerates lower-face geometry to match new phonemes, ensuring perfect visual synchronization.",
        detail: "Visual Coherence",
        color: "from-purple-500 to-pink-500",
    },
    {
        number: "03",
        icon: Globe2,
        title: "Liquid Context",
        description: "Smart translation that adapts idioms, humor, and cultural references for maximum local impact.",
        detail: "Cultural Resonance",
        color: "from-green-500 to-emerald-500",
    },
];

interface HowItWorksProps {
    onGetStarted?: () => void;
}

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
    return (
        <section id="workflows" className="relative pt-16 pb-24 lg:pt-20 lg:pb-32 bg-white dark:bg-black overflow-hidden border-t border-black/10 dark:border-white/10 transition-colors duration-300">
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-[90px] relative z-10">
                {/* Header */}
                <div className="text-center mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/20 dark:border-white/20 backdrop-blur-sm mb-6 bg-black/5 dark:bg-white/5 rounded-full transition-colors duration-300"
                    >
                        <Play size={12} className="text-green-600 dark:text-green-400" fill="currentColor" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/80 dark:text-white/80 transition-colors duration-300">Under the Hood</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold font-mono text-black dark:text-white mb-6 tracking-tight transition-colors duration-300"
                    >
                        Built on <br/>
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">State-of-the-Art AI</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-sm md:text-base text-neutral-600 dark:text-gray-400 font-mono max-w-xl mx-auto transition-colors duration-300"
                    >
                        Four core technologies working in harmony to deliver perfect localization.
                    </motion.p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                            className="group relative"
                        >
                            {/* Connection Line (desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-full w-full h-px z-0">
                                    <div className="h-full w-full bg-gradient-to-r from-black/20 dark:from-white/20 to-transparent transition-colors duration-300" />
                                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20 transition-colors duration-300" />
                                </div>
                            )}

                            <div className="relative ring-0 ring-black/20 border border-black bg-[#f1ede6] dark:bg-[#25292f] rounded-2xl p-xl flex items-center transition-all duration-300">
                                {/* Step Number */}
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-full transition-colors duration-300">
                                    <span className="text-[10px] font-mono text-black/60 dark:text-white/60 tracking-widest transition-colors duration-300">STEP {step.number}</span>
                                </div>

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} p-[1px] mb-6`}>
                                    <div className="w-full h-full bg-white dark:bg-black rounded-xl flex items-center justify-center transition-colors duration-300">
                                        <step.icon className="w-6 h-6 text-black dark:text-white transition-colors duration-300" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold font-mono text-black dark:text-white mb-3 tracking-wide uppercase transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-gray-400 font-mono leading-relaxed mb-4 transition-colors duration-300">
                                    {step.description}
                                </p>

                                {/* Detail Tag */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full transition-colors duration-300">
                                    <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-500 rounded-full animate-pulse transition-colors duration-300" />
                                    <span className="text-[10px] font-mono text-black/60 dark:text-white/60 uppercase tracking-wider transition-colors duration-300">
                                        {step.detail}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center"
                >
                    <button
                        onClick={onGetStarted}
                        className="group relative px-8 py-4 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-mono text-sm uppercase tracking-widest hover:dark:bg-white/90 transition-all duration-300 rounded-full font-bold inline-flex items-center gap-3 shadow-lg"
                    >
                        Start Your First Pipeline
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-4 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-wider transition-colors duration-300">
                        No credit card required • Free 14-day trial
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
