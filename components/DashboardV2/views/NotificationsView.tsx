"use client";

import React from "react";
import { Bell, Check, Info, AlertTriangle, Clock } from "lucide-react";

export function NotificationsView({ theme }: { theme: string }) {
    const isDark = theme === "dark";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
    const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-gray-50";
    const borderClass = isDark ? "border-white/10" : "border-gray-200";

    const notifications = [
        {
            id: 1,
            type: "success",
            title: "Video Dubbing Complete",
            desc: "Your video 'Summer Highlights' has been successfully dubbed into Spanish and French.",
            time: "2 hours ago",
            icon: Check,
            iconColor: "text-green-500",
            iconBg: "bg-green-500/10"
        },
        {
            id: 2,
            type: "info",
            title: "New Channel Connected",
            desc: "Successfully linked '@tech_reviews' YouTube channel to your workspace.",
            time: "5 hours ago",
            icon: Info,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10"
        },
        {
            id: 3,
            type: "warning",
            title: "Credit Balance Low",
            desc: "You have less than 50 minutes of dubbing time remaining in your current plan.",
            time: "Yesterday",
            icon: AlertTriangle,
            iconColor: "text-[#FFC107]",
            iconBg: "bg-[#FFC107]/10"
        },
        {
            id: 4,
            type: "info",
            title: "System Update",
            desc: "We've added 5 new voice models for Japanese and Korean localizations.",
            time: "2 days ago",
            icon: Clock,
            iconColor: "text-purple-500",
            iconBg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className={`text-3xl font-serif ${textClass} mb-2`}>Notifications</h1>
                    <p className={mutedTextClass}>Stay updated with your pipeline activity and system alerts</p>
                </div>
                <button className={`text-sm font-semibold text-[#D97757] hover:underline`}>
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-5 rounded-2xl border ${borderClass} ${cardBgClass} flex gap-5 ${isDark ? "hover:border-white/20" : "hover:border-gray-300 hover:bg-white"} transition-all cursor-pointer group`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${notif.iconBg} flex items-center justify-center shrink-0`}>
                            <notif.icon className={`w-6 h-6 ${notif.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold ${textClass}`}>{notif.title}</h3>
                                <span className={`text-xs ${mutedTextClass}`}>{notif.time}</span>
                            </div>
                            <p className={`text-sm ${mutedTextClass} leading-relaxed`}>{notif.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="py-20 text-center">
                    <div className={`w-16 h-16 ${isDark ? "bg-white/5" : "bg-gray-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Bell className={`w-8 h-8 ${mutedTextClass}`} />
                    </div>
                    <h3 className={`text-lg font-semibold ${textClass}`}>No new notifications</h3>
                    <p className={mutedTextClass}>We'll let you know when something important happens.</p>
                </div>
            )}
        </div>
    );
}
