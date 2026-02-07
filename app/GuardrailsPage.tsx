"use client";

import { useState } from "react";
import { useTheme } from "@/lib/useTheme";
import {
    Shield,
    Clock,
    Globe,
    Activity,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Zap,
    Scale,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function GuardrailsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // State
    const [schedulingDefault, setSchedulingDefault] = useState("Immediate");
    const [autoPublish, setAutoPublish] = useState(false);
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [qualityThreshold, setQualityThreshold] = useState(85);

    // Theme tokens
    const bgClass = isDark ? "bg-dark-bg" : "bg-light-bg";
    const cardClass = isDark ? "bg-white/[0.03] backdrop-blur-xl" : "bg-gray-50/80 backdrop-blur-md";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-white/50" : "text-gray-500";
    const borderClass = isDark ? "border-white/5" : "border-gray-200";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className={`h-full overflow-y-auto custom-scrollbar ${bgClass}`}>
            <SEO
                title="Guardrails | Olleey"
                description="Configure automated safety checks, quality thresholds, and publication protocols for your global dubbing pipeline."
            />

            {/* Cinematic Header */}
            <div className={`relative px-6 sm:px-10 py-16 sm:py-24 border-b ${borderClass} overflow-hidden`}>
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-20 scale-110"
                        alt=""
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-transparent via-dark-bg/50 to-dark-bg' : 'from-transparent via-light-bg/50 to-light-bg'}`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-dark-bg via-dark-bg/80 to-transparent' : 'from-light-bg via-light-bg/80 to-transparent'}`} />

                    {/* Animated Glows */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-olleey-yellow/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-7xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-olleey-yellow" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-olleey-yellow font-mono">Protocol Console</span>
                            </div>
                            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-300 ${textClass} tracking-tight leading-tight`}>
                                System <span className="font-bold">Guardrails</span>
                            </h1>
                            <p className={`text-lg ${textSecondaryClass} max-w-xl leading-relaxed`}>
                                Configure automated safety filters, quality gates, and deployment protocols to maintain brand integrity across all localized content.
                            </p>
                        </div>

                        <div className={`flex items-center gap-6 ${cardClass} p-6 rounded-3xl border ${borderClass} shadow-2xl backdrop-blur-3xl`}>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 font-mono">System Integrity</span>
                                <div className="flex items-center gap-2.5">
                                    <div className="relative">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                                    </div>
                                    <span className={`text-sm font-bold ${textClass} tracking-tight`}>Active Monitoring</span>
                                </div>
                            </div>
                            <div className={`w-[1px] h-10 ${borderClass}`} />
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 font-mono">Last Sync</span>
                                <span className={`text-sm font-bold ${textClass} font-mono tracking-tighter`}>T-0.42ms</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-6 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
                <div className="lg:col-span-8 space-y-12">
                    {/* Scheduling & Automation */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                </div>
                                <h2 className={`text-xl font-bold ${textClass} tracking-tight`}>Scheduling & Automation</h2>
                            </div>
                            <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-[2rem] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="space-y-2">
                                    <h3 className={`font-bold ${textClass} flex items-center gap-2`}>
                                        Scheduling Defaults
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-[9px] uppercase tracking-widest opacity-40 font-mono">Pipeline Core</span>
                                    </h3>
                                    <p className={`text-sm ${textSecondaryClass} max-w-xs leading-relaxed`}>
                                        Default behavior for synchronization of new localized workflows.
                                    </p>
                                </div>
                                <div className={`flex ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-100/50 border-gray-200'} p-1.5 rounded-2xl border backdrop-blur-md`}>
                                    {["Immediate", "Scheduled", "Manual"].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSchedulingDefault(v)}
                                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${schedulingDefault === v
                                                ? "bg-olleey-yellow text-black shadow-xl shadow-yellow-500/20"
                                                : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-[2rem] p-8 flex items-center justify-between gap-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="space-y-2">
                                    <h3 className={`font-bold ${textClass}`}>YouTube Auto-Publishing</h3>
                                    <p className={`text-sm ${textSecondaryClass} max-w-xs leading-relaxed`}>
                                        Automatically distribute localized content once quality gates are passed.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${autoPublish ? 'text-olleey-yellow' : 'opacity-20'}`}>
                                        {autoPublish ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quality Gates */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Scale className="w-4 h-4 text-blue-500" />
                                </div>
                                <h2 className={`text-xl font-bold ${textClass} tracking-tight`}>Quality Control Gates</h2>
                            </div>
                            <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-[2rem] p-8 flex items-center justify-between gap-6 group hover:border-blue-500/20 transition-all duration-500`}>
                                <div className="space-y-2">
                                    <h3 className={`font-bold ${textClass}`}>Universal Manual Review</h3>
                                    <p className={`text-sm ${textSecondaryClass} max-w-xs leading-relaxed`}>
                                        Mandate manual sign-off for every localized asset before publication.
                                    </p>
                                </div>
                                <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 space-y-8 group hover:border-blue-500/20 transition-all duration-500`}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h3 className={`font-bold ${textClass}`}>Dynamic Quality Threshold</h3>
                                        <p className={`text-sm ${textSecondaryClass} leading-relaxed max-w-md`}>
                                            Automatically trigger technical review if AI confidence falls below target.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-3xl font-bold text-olleey-yellow font-mono`}>{qualityThreshold}</span>
                                            <span className="text-xs font-black text-olleey-yellow/50 font-mono">%</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow/40 font-mono">Confidence Gate</span>
                                    </div>
                                </div>

                                <div className="relative pt-2">
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={qualityThreshold}
                                        onChange={(e) => setQualityThreshold(parseInt(e.target.value))}
                                        className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-olleey-yellow bg-white/5 border border-white/5`}
                                    />
                                    <div className="flex justify-between mt-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 font-mono italic">Safe Mode (50%)</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow opacity-60 font-mono italic">Studio Grade (100%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Content Safety Card */}
                    <motion.div variants={itemVariants} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/20 via-indigo-500/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                        <div className={`${cardClass} relative z-10 p-10 border border-white/10 rounded-[3rem] overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:rotate-0">
                                <Shield className="w-48 h-48 text-white" />
                            </div>

                            <div className="space-y-8 relative z-20">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Lock className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter font-black border border-emerald-500/20 backdrop-blur-sm">System Secure</span>
                                    </div>
                                    <h3 className={`text-2xl font-bold ${textClass} tracking-tight`}>
                                        Smart Safety <span className="text-olleey-yellow underline underline-offset-8 decoration-olleey-yellow/30">Filters</span>
                                    </h3>
                                    <p className={`text-sm ${textSecondaryClass} leading-relaxed`}>
                                        Real-time neural scans for profanity, cultural sensitivities, and brand resonance. Our guardrails adapt to your specific channel niche automatically.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    {[
                                        "Neural Semantic Analysis",
                                        "Cultural Sensitivity Mapping",
                                        "Blacklist Enforcement (Hate Speech)",
                                        "Brand Alignment Monitoring"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold tracking-widest opacity-60`}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full bg-white text-black hover:bg-olleey-yellow transition-colors font-black uppercase text-[10px] tracking-widest py-6 rounded-2xl shadow-xl">
                                    Configure Sensitivity <ArrowRight className="ml-2 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={itemVariants} className="p-8 border border-red-500/10 bg-red-500/[0.02] rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest font-mono">System Reset</h3>
                        </div>
                        <p className="text-xs text-red-500/50 leading-relaxed font-medium">
                            Revert all protocol parameters to global defaults. This will immediately affect all active pipeline runs.
                        </p>
                        <Button variant="outline" className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase text-[9px] tracking-[0.2em] py-5 rounded-2xl transition-all active:scale-95">
                            Reset Guardrail Policy
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

