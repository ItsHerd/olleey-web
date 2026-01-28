"use client";

import React from "react";
import { CreditCard, Zap, TrendingUp, ArrowUpRight, BarChart3, Clock } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

export default function UsagePage() {
    const { theme } = useTheme();
    const { dashboard, loading } = useDashboard();

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    if (loading) {
        return (
            <div className={`flex items-center justify-center flex-1 ${bgClass}`}>
                <BarChart3 className="w-8 h-8 text-olleey-yellow animate-pulse" />
            </div>
        );
    }

    return (
        <div className={`flex-1 p-8 ${bgClass} overflow-y-auto`}>
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className={`text-3xl font-normal ${textClass} tracking-tight`}>Plan & Usage</h2>
                        <p className={`text-sm ${textSecondaryClass} mt-2`}>Monitor your credit consumption and distribution metrics</p>
                    </div>
                    <Button className="bg-olleey-yellow text-black hover:bg-olleey-yellow/90 font-bold rounded-full px-8">
                        Upgrade Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Subscription Tier: Free */}
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-8 flex flex-col justify-between group hover:border-olleey-yellow/30 transition-all`}>
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em]`}>Subscription</span>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/10">Free Tier</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-5xl font-normal ${textClass}`}>$0</span>
                                <span className={`text-lg ${textSecondaryClass}`}>/month</span>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>Starter access • Standard processing</p>
                        </div>

                        <div className={`mt-8 pt-8 border-t ${borderClass}`}>
                            <Button variant="ghost" className="w-full text-olleey-yellow hover:bg-olleey-yellow/10 font-bold uppercase tracking-widest text-xs">
                                Current Plan
                            </Button>
                        </div>
                    </div>

                    {/* Subscription Tier: Pro */}
                    <div className={`${cardClass} border-olleey-yellow/30 bg-olleey-yellow/[0.02] rounded-2xl p-8 flex flex-col justify-between group hover:border-olleey-yellow/60 transition-all relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 bg-olleey-yellow px-4 py-1 text-[10px] font-black text-black uppercase tracking-widest">Growth</div>
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em]`}>Subscription</span>
                                <span className="px-3 py-1 rounded-full bg-olleey-yellow/10 text-olleey-yellow text-[10px] font-black uppercase tracking-widest border border-olleey-yellow/20">Pro Tier</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-5xl font-normal ${textClass}`}>PAYG</span>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>Pay-as-you-go • Priority access</p>
                        </div>

                        <div className={`mt-8 pt-8 border-t ${borderClass}`}>
                            <Button className="w-full bg-olleey-yellow text-black hover:bg-white transition-all font-black uppercase tracking-widest text-xs">
                                Upgrade to Pro
                            </Button>
                        </div>
                    </div>

                    {/* Subscription Tier: Max */}
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-8 flex flex-col justify-between group hover:border-olleey-yellow/30 transition-all`}>
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em]`}>Subscription</span>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10">Max Tier</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-5xl font-normal ${textClass}`}>$200</span>
                                <span className={`text-lg ${textSecondaryClass}`}>/month</span>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>High volume production • API access</p>
                        </div>

                        <div className={`mt-8 pt-8 border-t ${borderClass}`}>
                            <Button variant="ghost" className="w-full text-white border border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs">
                                Upgrade to Max
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Growth Statistics */}
                <div className={`${cardClass} border ${borderClass} rounded-2xl p-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <h3 className={`text-lg font-normal ${textClass} mb-8 flex items-center gap-2`}>
                            <TrendingUp className="w-5 h-5 text-olleey-yellow" />
                            Production Insights
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <span className={`text-xs ${textSecondaryClass}`}>Growth Factor</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-bold text-emerald-500`}>+{dashboard?.weekly_stats?.growth_percentage || 0}%</span>
                                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black`}>Vs Previous Week</p>
                            </div>

                            <div className="space-y-2">
                                <span className={`text-xs ${textSecondaryClass}`}>Global reach</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-normal ${textClass}`}>{dashboard?.weekly_stats?.languages_added || 0}</span>
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black`}>New Languages</p>
                            </div>

                            <div className="space-y-2">
                                <span className={`text-xs ${textSecondaryClass}`}>Total Output</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-normal ${textClass}`}>{dashboard?.weekly_stats?.videos_completed || 0}</span>
                                </div>
                                <p className={`text-[10px] ${textSecondaryClass} uppercase font-black`}>Completed Credits</p>
                            </div>
                        </div>

                        <div className={`mt-10 p-4 rounded-xl bg-olleey-yellow/5 border border-olleey-yellow/10 flex items-center gap-4`}>
                            <Clock className="w-5 h-5 text-olleey-yellow shrink-0" />
                            <p className={`text-xs ${textClass}`}>
                                You are on track to exceed last month's production by **12%**. Consider moving to the **Enterprise plan** for unlimited API access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
