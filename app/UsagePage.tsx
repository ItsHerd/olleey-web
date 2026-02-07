"use client";

import React from "react";
import {
    CreditCard,
    Zap,
    TrendingUp,
    ArrowUpRight,
    BarChart3,
    Clock,
    ShieldCheck,
    Globe,
    Rocket,
    Activity,
    Layers,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        } as const
    }
};

export default function UsagePage() {
    const { theme } = useTheme();
    const { dashboard, loading } = useDashboard();

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-[#0c0c0c]";
    const textClass = theme === "light" ? "text-light-text" : "text-white";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-white/40";
    const borderClass = theme === "light" ? "border-light-border" : "border-white/5";

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center flex-1 ${bgClass} p-8 animate-pulse`}>
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <BarChart3 className="w-10 h-10 text-olleey-yellow stroke-[1.5px]" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Aggregating Consumption...</p>
            </div>
        );
    }

    return (
        <div className={`h-full flex-1 p-3 pr-6 pb-32 ${bgClass} overflow-y-auto custom-scrollbar pt-8`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto space-y-16"
            >
                {/* Cinema Header */}
                <motion.div variants={itemVariants} className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 min-h-[240px] flex items-end shadow-2xl bg-[#0c0c0c]">
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-[10000ms]"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />

                    <div className="relative z-10 p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-olleey-yellow/10 backdrop-blur-3xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-6 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                                <CreditCard className="w-4 h-4 shadow-sm" /> Billing & Logistics
                            </div>
                            <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tighter mb-3 leading-none">
                                Usage Hub
                            </h1>
                            <p className={`${textSecondaryClass} text-sm md:text-base max-w-2xl font-light tracking-tight opacity-60 leading-relaxed`}>
                                Comprehensive overview of your neural credit consumption, processing throughput, and production scalability.
                            </p>
                        </div>
                        <Button className="h-14 px-10 bg-olleey-yellow text-black hover:bg-white transition-all font-black uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_20px_40px_rgba(251,191,36,0.2)]">
                            Upgrade Pipeline
                        </Button>
                    </div>
                </motion.div>

                {/* Subscription Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            id: "free",
                            name: "Foundation",
                            price: "0",
                            type: "Free Tier",
                            desc: "Core neural access for startups",
                            benefit: "Standard priority",
                            color: "text-white/40",
                            active: true
                        },
                        {
                            id: "pro",
                            name: "Momentum",
                            price: "PAYG",
                            type: "Pro Hub",
                            desc: "Scalable credits for growth-mode",
                            benefit: "High priority sync",
                            color: "text-olleey-yellow",
                            glow: "border-olleey-yellow/30 bg-olleey-yellow/[0.03]",
                            badge: "Growth"
                        },
                        {
                            id: "max",
                            name: "Dominion",
                            price: "200",
                            type: "Enterprise",
                            desc: "Unlimited multi-channel deployment",
                            benefit: "Instant processing",
                            color: "text-indigo-400",
                        }
                    ].map((tier, idx) => (
                        <motion.div
                            key={tier.id}
                            variants={itemVariants}
                            className={`${cardClass} border ${tier.glow || borderClass} rounded-[2.5rem] p-10 flex flex-col justify-between group hover:border-olleey-yellow/40 transition-all duration-500 relative overflow-hidden h-full shadow-2xl`}
                        >
                            {tier.badge && (
                                <div className="absolute top-0 right-0 bg-olleey-yellow px-6 py-2 text-[10px] font-black text-black uppercase tracking-[0.25em] rounded-bl-3xl shadow-lg">
                                    {tier.badge}
                                </div>
                            )}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all">
                                <Rocket className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-12">
                                    <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.3em]`}>Tier Status</span>
                                    <span className={`px-4 py-1.5 rounded-full bg-white/5 ${tier.color} text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-inner`}>
                                        {tier.type}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 mb-6">
                                    <h3 className="text-xl font-bold text-white/50 group-hover:text-white transition-colors">{tier.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-6xl font-light tracking-tighter ${tier.color.includes('white') ? 'text-white' : tier.color}`}>
                                            {tier.price.includes('PAYG') ? '' : '$'}{tier.price}
                                        </span>
                                        {tier.id !== 'pro' && <span className={`text-xl ${textSecondaryClass} font-light tracking-tight opacity-40`}>/mo</span>}
                                    </div>
                                </div>
                                <p className={`text-[13px] ${textSecondaryClass} font-medium tracking-tight leading-relaxed opacity-60 mb-2`}>{tier.desc}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow/40">{tier.benefit}</p>
                            </div>

                            <div className={`mt-12 pt-10 border-t ${borderClass}`}>
                                <Button
                                    variant={tier.active ? "ghost" : "default"}
                                    className={`w-full h-14 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] ${tier.active
                                        ? 'text-white/20 hover:text-olleey-yellow hover:bg-white/5'
                                        : tier.id === 'pro'
                                            ? 'bg-olleey-yellow text-black hover:bg-white shadow-[0_15px_30px_rgba(251,191,36,0.2)]'
                                            : 'border border-white/5 hover:border-white/20 bg-transparent text-white/60'
                                        }`}
                                >
                                    {tier.active ? "Current Deployment" : `Authorize ${tier.id.toUpperCase()}`}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Production Insights & Consumption Stats */}
                <motion.div
                    variants={itemVariants}
                    className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-12 lg:p-16 relative overflow-hidden bg-white/[0.01] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]`}
                >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-64 h-64" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-16">
                            <h3 className={`text-2xl font-normal ${textClass} flex items-center gap-4 tracking-tighter`}>
                                <div className="w-10 h-10 rounded-2xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                    <BarChart3 className="w-5 h-5 text-olleey-yellow" />
                                </div>
                                Production Analytics
                            </h3>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    Real-time Feed
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            <div className="space-y-4 group">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} opacity-40 group-hover:opacity-100 transition-opacity`}>Growth Factor</span>
                                <div className="flex items-center gap-4">
                                    <span className={`text-5xl font-light tracking-tighter text-emerald-500`}>+{dashboard?.weekly_stats?.growth_percentage || 0}%</span>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg">
                                        <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black tracking-widest opacity-20`}>Temporal Delta (7d)</p>
                            </div>

                            <div className="space-y-4 group">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} opacity-40 group-hover:opacity-100 transition-opacity`}>Global Expansion</span>
                                <div className="flex items-center gap-4">
                                    <span className={`text-5xl font-light tracking-tighter ${textClass}`}>{dashboard?.weekly_stats?.languages_added || 0}</span>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                        <Globe className="w-6 h-6 text-white/40" />
                                    </div>
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black tracking-widest opacity-20`}>Localized Nodes</p>
                            </div>

                            <div className="space-y-4 group">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} opacity-40 group-hover:opacity-100 transition-opacity`}>Volume Output</span>
                                <div className="flex items-center gap-4">
                                    <span className={`text-5xl font-light tracking-tighter ${textClass}`}>{dashboard?.weekly_stats?.videos_completed || 0}</span>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                        <Layers className="w-6 h-6 text-white/40" />
                                    </div>
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black tracking-widest opacity-20`}>Released Masters</p>
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={`mt-20 p-8 rounded-[2rem] bg-olleey-yellow/[0.03] border border-olleey-yellow/10 flex items-center gap-8 shadow-inner`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-olleey-yellow/10 flex items-center justify-center shrink-0 border border-olleey-yellow/20">
                                <Sparkles className="w-7 h-7 text-olleey-yellow animate-pulse" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-olleey-yellow/50">Production Forecast</h4>
                                <p className={`text-sm ${textClass} font-light leading-relaxed tracking-tight`}>
                                    Your output is exceeding projections by <span className="text-emerald-500 font-bold">12%</span>. To maintain optimal throughput, we recommend scaling to <span className="text-olleey-yellow font-bold uppercase tracking-widest">Enterprise Mode</span> for unlimited neural access.
                                </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-olleey-yellow/30" />
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
