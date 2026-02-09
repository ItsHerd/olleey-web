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
            <div className={`relative px-6 sm:px-10 py-10 border-b ${borderClass} overflow-hidden`}>
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
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center">
                                    <Shield className="w-3.5 h-3.5 text-olleey-yellow" />
                                </div>
                                <span className="text-[9px] uppercase font-black tracking-[0.3em] text-olleey-yellow/60 font-mono">Protocol Console</span>
                            </div>
                            <h1 className={`text-2xl md:text-3xl font-300 ${textClass} tracking-tight leading-tight`}>
                                System <span className="font-bold">Guardrails</span>
                            </h1>
                            <p className={`text-sm ${textSecondaryClass} max-w-xl leading-relaxed ${isDark ? 'opacity-70' : ''}`}>
                                Configure automated safety filters, quality gates, and deployment protocols to maintain brand integrity across all localized content.
                            </p>
                        </div>

                        <div className={`flex items-center gap-4 ${cardClass} p-4 rounded-2xl border ${borderClass} shadow-2xl backdrop-blur-3xl`}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono">System Integrity</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                        <div className="absolute inset-0 rounded-full bg-olleey-yellow animate-ping opacity-20" />
                                    </div>
                                    <span className={`text-[10px] font-bold ${textClass} tracking-tight uppercase`}>Active Monitoring</span>
                                </div>
                            </div>
                            <div className={`w-[1px] h-8 ${borderClass}`} />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono">Last Sync</span>
                                <span className={`text-[10px] font-bold ${textClass} font-mono tracking-tighter`}>T-0.42ms</span>
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
                                <div className="w-8 h-8 rounded-xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                    <Clock className="w-4 h-4 text-olleey-yellow" />
                                </div>
                                <h2 className={`text-xl font-bold ${textClass} tracking-tight`}>Automation Controls</h2>
                            </div>
                            <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="space-y-1">
                                    <h3 className={`text-sm font-bold ${textClass} flex items-center gap-2`}>
                                        Scheduling Defaults
                                        <span className="text-[8px] uppercase tracking-widest opacity-20 font-mono">Sync_Policy</span>
                                    </h3>
                                    <p className={`text-xs ${textSecondaryClass} max-w-xs leading-relaxed ${isDark ? 'opacity-60' : ''}`}>
                                        Asset synchronization priority for new localized workflows.
                                    </p>
                                </div>
                                <div className={`flex ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100/50 border-gray-200'} p-1 rounded-xl border`}>
                                    {["Immediate", "Scheduled", "Manual"].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSchedulingDefault(v)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${schedulingDefault === v
                                                ? "bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/10"
                                                : `${textSecondaryClass} hover:${textClass} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 flex items-center justify-between gap-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="space-y-1">
                                    <h3 className={`text-sm font-bold ${textClass}`}>YouTube Auto-Publishing</h3>
                                    <p className={`text-xs ${textSecondaryClass} max-w-xs leading-relaxed ${isDark ? 'opacity-60' : ''}`}>
                                        Distribute localized content after successful quality verification.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${autoPublish ? 'text-olleey-yellow' : 'opacity-20'}`}>
                                        {autoPublish ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <Switch checked={autoPublish} onCheckedChange={setAutoPublish} className="data-[state=checked]:bg-olleey-yellow" />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quality Gates */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                    <Scale className="w-4 h-4 text-olleey-yellow" />
                                </div>
                                <h2 className={`text-xl font-bold ${textClass} tracking-tight`}>Quality Gates</h2>
                            </div>
                            <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 flex items-center justify-between gap-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="space-y-1">
                                    <h3 className={`text-sm font-bold ${textClass}`}>Universal Manual Review</h3>
                                    <p className={`text-xs ${textSecondaryClass} max-w-xs leading-relaxed ${isDark ? 'opacity-60' : ''}`}>
                                        Mandate human verification for every localized asset.
                                    </p>
                                </div>
                                <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} className="data-[state=checked]:bg-olleey-yellow" />
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 space-y-6 group hover:border-olleey-yellow/20 transition-all duration-500`}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className={`text-sm font-bold ${textClass}`}>AI Confidence Threshold</h3>
                                        <p className={`text-xs ${textSecondaryClass} leading-relaxed max-w-xs ${isDark ? 'opacity-60' : ''}`}>
                                            Manual review trigger if neural confidence falls below target.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className={`text-2xl font-bold text-olleey-yellow font-mono`}>{qualityThreshold}</span>
                                            <span className="text-[10px] font-black text-olleey-yellow/40 font-mono">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={qualityThreshold}
                                        onChange={(e) => setQualityThreshold(parseInt(e.target.value))}
                                        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-olleey-yellow ${isDark ? 'bg-white/10 border-white/5' : 'bg-gray-200 border-gray-300'} border`}
                                    />
                                    <div className="flex justify-between mt-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'opacity-20' : 'text-gray-400'} font-mono italic`}>Efficiency Mode</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-olleey-yellow/40' : 'text-olleey-yellow/80'} font-mono italic`}>Studio Grade</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Content Safety Card */}
                    <motion.div variants={itemVariants} className="relative group">
                        <div className="absolute inset-0 bg-olleey-yellow/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                        <div className={`${cardClass} relative z-10 p-8 border ${borderClass} rounded-2xl overflow-hidden`}>
                            <div className="space-y-6 relative z-20">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                            <Lock className="w-4 h-4 text-olleey-yellow" />
                                        </div>
                                        <span className="text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-olleey-yellow/60 border border-olleey-yellow/20">Secure_Mode</span>
                                    </div>
                                    <h3 className={`text-lg font-bold ${textClass} tracking-tight`}>
                                        Safety <span className="text-olleey-yellow">Filters</span>
                                    </h3>
                                    <p className={`text-xs ${textSecondaryClass} leading-relaxed ${isDark ? 'opacity-60' : ''}`}>
                                        Neural semantic scans for profanity and cultural resonance. Adapts to your niche automatically.
                                    </p>
                                </div>

                                <div className={`space-y-2 pt-4 border-t ${borderClass}`}>
                                    {[
                                        "Semantic Analysis",
                                        "Cultural Sensitivity",
                                        "Brand Alignment"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-olleey-yellow opacity-40" />
                                            <span className={`text-[9px] uppercase font-bold tracking-widest ${isDark ? 'opacity-40' : 'text-gray-500'}`}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full h-11 bg-white text-black hover:bg-olleey-yellow transition-all font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg">
                                    Protocol Config <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={itemVariants} className={`p-8 border ${borderClass} ${isDark ? 'bg-white/[0.01]' : 'bg-red-50/50'} rounded-2xl space-y-4`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500/40" />
                            <h3 className={`text-[10px] font-black ${isDark ? 'text-white/40' : 'text-red-900/40'} uppercase tracking-widest font-mono`}>Archive Protocol</h3>
                        </div>
                        <p className={`text-[10px] ${isDark ? 'text-white/20' : 'text-red-900/40'} leading-relaxed font-medium`}>
                            Revert all parameters to factory defaults. This action is terminal and affects active runs.
                        </p>
                        <button className={`w-full py-3 rounded-xl border ${borderClass} ${isDark ? 'text-white/20 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5' : 'text-red-900/40 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200'} transition-all text-[9px] font-black uppercase tracking-widest font-mono`}>
                            Reset Policy
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

