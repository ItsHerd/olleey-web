"use client";

import React from "react";

interface QuickStatsProps {
    dashboard: any;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
}

export function QuickStats({
    dashboard,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass
}: QuickStatsProps) {
    return (
        <div className={`mt-6 ${cardClass} border ${borderClass} rounded-2xl p-4 bg-gradient-to-br from-rolleey-yellow/5 to-transparent`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest`}>This Week</h4>
                {dashboard?.weekly_stats?.growth_percentage && (
                    <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                        +{dashboard.weekly_stats.growth_percentage}%
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="text-center">
                    <p className={`text-lg font-bold ${textClass}`}>{dashboard?.weekly_stats?.videos_completed || 0}</p>
                    <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Videos</p>
                </div>
                <div className="h-8 w-[1px] bg-white/5" />
                <div className="text-center">
                    <p className={`text-lg font-bold text-olleey-yellow`}>{dashboard?.weekly_stats?.languages_added || 0}</p>
                    <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Langs</p>
                </div>
                <div className="h-8 w-[1px] bg-white/5" />
                <div className="text-center">
                    <p className={`text-lg font-bold text-indigo-400`}>
                        {dashboard?.credits_summary
                            ? `${Math.round(dashboard.credits_summary.used_credits / 60)}h`
                            : '0h'}
                    </p>
                    <p className={`text-[9px] ${textSecondaryClass} uppercase`}>Usage</p>
                </div>
            </div>
        </div>
    );
}
