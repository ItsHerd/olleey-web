"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mic, Languages, Waves, Cpu, Zap, ArrowRight } from "lucide-react";

const technologies = [
    {
        icon: Mic,
        title: "Content Creators",
        description: "Launch official multi-language channels instantly. Multiply your views without filming a single extra second.",
        stats: "10x Reach",
        color: "from-red-500 to-orange-500",
        delay: 0,
    },
    {
        icon: Brain,
        title: "EdTech & Learning",
        description: "Democratize knowledge.translate technical lectures and courses with perfect terminology accuracy.",
        stats: "Global Access",
        color: "from-blue-500 to-cyan-500",
        delay: 0.1,
    },
    {
        icon: Languages,
        title: "News & Media",
        description: "Break news faster. Automatically dub reporter segments for international broadcasts in real-time.",
        stats: "Speed to Air",
        color: "from-yellow-500 to-amber-500",
        delay: 0.2,
    },
    {
        icon: Zap,
        title: "Enterprise & Ads",
        description: "Consistent brand voice across every market. Localize ad spots and internal comms at scale.",
        stats: "Brand Safety",
        color: "from-purple-500 to-indigo-500",
        delay: 0.3,
    },
];

const pipelineSteps = [
    { label: "Upload", icon: "📤" },
    { label: "Analyze", icon: "🔍" },
    { label: "Clone Voice", icon: "🎙️" },
    { label: "Translate", icon: "🌐" },
    { label: "Lip-Sync", icon: "👄" },
    { label: "Render", icon: "🎬" },
    { label: "Publish", icon: "🚀" },
];

export default function TechnologyShowcase() {
    return (
        <section id="technology" className="relative py-24 lg:py-32 bg-white dark:bg-black overflow-hidden border-t border-black/10 dark:border-white/10 transition-colors duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Circuit-like pattern */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M10 10 L90 10 L90 90 L10 90 Z" fill="none" className="stroke-black/10 dark:stroke-white transition-colors duration-300" strokeWidth="0.5" />
                                <circle cx="10" cy="10" r="3" className="fill-black/10 dark:fill-white transition-colors duration-300" />
                                <circle cx="90" cy="10" r="3" className="fill-black/10 dark:fill-white transition-colors duration-300" />
                                <circle cx="90" cy="90" r="3" className="fill-black/10 dark:fill-white transition-colors duration-300" />
                                <circle cx="10" cy="90" r="3" className="fill-black/10 dark:fill-white transition-colors duration-300" />
                                <circle cx="50" cy="50" r="5" className="fill-black/10 dark:fill-white transition-colors duration-300" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit)" />
                    </svg>
                </div>
                
                {/* Gradient orbs */}
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/20 dark:border-white/20 backdrop-blur-sm mb-6 bg-black/5 dark:bg-white/5 rounded-full transition-colors duration-300"
                    >
                        <Cpu size={12} className="text-green-600 dark:text-green-400 transition-colors duration-300" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/80 dark:text-white/80 transition-colors duration-300">Under the Hood</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold font-mono text-black dark:text-white mb-4 tracking-tight transition-colors duration-300"
                    >
                        Built for
                        <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2 transition-colors duration-300">
                            Every Storyteller
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-neutral-600 dark:text-white/60 font-mono text-sm max-w-2xl mx-auto transition-colors duration-300"
                    >
                        Whether you&apos;re a solo YouTuber or a global media house, Olleey scales your voice to the world.
                    </motion.p>
                </div>

                {/* Content Header - Removing pipeline animation */}
                <div className="text-center mb-12">
                    {/* Placeholder for spacing if needed, or remove completely */}
                </div>

                {/* Technology Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {technologies.map((tech, index) => (
                        <motion.div
                            key={tech.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: tech.delay }}
                            className="group relative"
                        >
                            {/* Card glow on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`} />
                            
                            <div className="relative bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 h-full">
                                {/* Icon with gradient background */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 bg-gradient-to-br ${tech.color} rounded-xl`}>
                                        <tech.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full transition-colors duration-300">
                                        <span className="text-[10px] font-mono text-green-600 dark:text-green-400 uppercase tracking-wider transition-colors duration-300">
                                            {tech.stats}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg lg:text-xl font-bold font-mono text-black dark:text-white mb-2 transition-colors duration-300">
                                    {tech.title}
                                </h3>
                                <p className="text-sm font-mono text-neutral-600 dark:text-white/50 leading-relaxed transition-colors duration-300">
                                    {tech.description}
                                </p>

                                {/* Animated accent line */}
                                <div className="mt-4 h-0.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden transition-colors duration-300">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${tech.color} w-0 group-hover:w-full transition-all duration-700`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <Link href="/docs" className="inline-flex items-center gap-3 px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full hover:border-green-500/50 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer group shadow-lg">
                        <Brain className="w-5 h-5 text-green-600 dark:text-green-400 transition-colors duration-300" />
                        <span className="text-sm font-mono text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                            Explore the full technical documentation
                        </span>
                        <ArrowRight className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
