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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Plan Details */}
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-8 flex flex-col justify-between group hover:border-olleey-yellow/30 transition-all`}>
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em]`}>Subscription</span>
                                <span className="px-3 py-1 rounded-full bg-olleey-yellow/10 text-olleey-yellow text-[10px] font-black uppercase tracking-widest border border-olleey-yellow/20">Pro Tier</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-5xl font-normal ${textClass}`}>$49</span>
                                <span className={`text-lg ${textSecondaryClass}`}>/month</span>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>Billed monthly • Next renewal: Feb 26, 2026</p>
                        </div>

                        <div className={`mt-8 pt-8 border-t ${borderClass} flex items-center justify-between`}>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase`}>Payment Method</span>
                                <span className={`text-sm ${textClass} font-medium`}>•••• 4242</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-olleey-yellow hover:text-olleey-yellow hover:bg-olleey-yellow/10">
                                Update
                            </Button>
                        </div>
                    </div>

                    {/* Usage Metrics */}
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-8 group hover:border-olleey-yellow/30 transition-all`}>
                        <div className="flex items-center justify-between mb-8">
                            <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-[0.2em]`}>Credit Utilization</span>
                            <Zap className="w-5 h-5 text-olleey-yellow" />
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className={`text-5xl font-normal ${textClass}`}>
                                {dashboard?.credits_summary ? Math.round(dashboard.credits_summary.remaining_credits / 60) : 0}h
                            </span>
                            <div className="flex flex-col mb-1.5">
                                <span className={`text-sm font-bold ${textClass}`}>Remaining</span>
                                <span className={`text-[10px] ${textSecondaryClass} uppercase`}>
                                    of {dashboard?.credits_summary ? Math.round((dashboard.credits_summary.used_credits + dashboard.credits_summary.remaining_credits) / 60) : 100}h total
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-8 relative">
                            <div
                                className="absolute inset-0 bg-olleey-yellow/10 blur-md"
                                style={{ width: `${dashboard?.credits_summary ? (dashboard.credits_summary.used_credits / (dashboard.credits_summary.used_credits + dashboard.credits_summary.remaining_credits)) * 100 : 0}%` }}
                            />
                            <div
                                className="h-full bg-olleey-yellow rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)] relative z-10"
                                style={{
                                    width: `${dashboard?.credits_summary ? (dashboard.credits_summary.used_credits / (dashboard.credits_summary.used_credits + dashboard.credits_summary.remaining_credits)) * 100 : 0}%`
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl ${bgClass} border ${borderClass}`}>
                                <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase block mb-1`}>Time Spent</span>
                                <span className={`text-xl font-normal ${textClass}`}>
                                    {dashboard?.credits_summary ? Math.round(dashboard.credits_summary.used_credits / 60) : 0}h
                                </span>
                            </div>
                            <div className={`p-4 rounded-xl ${bgClass} border ${borderClass}`}>
                                <span className={`text-[10px] font-bold ${textSecondaryClass} uppercase block mb-1`}>Videos</span>
                                <span className={`text-xl font-normal ${textClass}`}>{dashboard?.weekly_stats?.videos_completed || 0}</span>
                            </div>
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
