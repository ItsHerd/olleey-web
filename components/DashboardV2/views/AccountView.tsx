"use client";

import React from "react";
import { User, Mail, Shield, Zap, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export function AccountView({ theme }: { theme: string }) {
    const { user } = useAuth();
    const isDark = theme === "dark";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
    const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-gray-50";
    const borderClass = isDark ? "border-white/10" : "border-gray-200";

    const settings = [
        { icon: User, label: "Profile Information", desc: "Update your name and personal details" },
        { icon: Mail, label: "Email Preferences", desc: "Manage your notification emails" },
        { icon: Shield, label: "Security", desc: "Change password and manage 2FA" },
        { icon: Zap, label: "Plan & Usage", desc: "View your current subscription and limits" },
        { icon: CreditCard, label: "Billing", desc: "Manage payment methods and invoices" },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className={`text-3xl font-serif ${textClass} mb-2`}>Account Settings</h1>
                <p className={mutedTextClass}>Manage your personal information and workspace preferences</p>
            </div>

            <div className={`p-6 rounded-2xl border ${borderClass} ${cardBgClass} mb-8 flex items-center gap-6`}>
                <div className="w-20 h-20 rounded-2xl bg-[#D97757]/20 flex items-center justify-center text-3xl font-serif text-[#D97757]">
                    {user?.email?.[0].toUpperCase()}
                </div>
                <div>
                    <h2 className={`text-xl font-semibold ${textClass}`}>{user?.email?.split('@')[0]}</h2>
                    <p className={mutedTextClass}>{user?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active Member
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {settings.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${borderClass} hover:bg-white/[0.02] cursor-pointer transition-all flex items-center justify-between group`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-colors`}>
                                <item.icon className={`w-5 h-5 ${mutedTextClass}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>{item.label}</h3>
                                <p className={`text-sm ${mutedTextClass}`}>{item.desc}</p>
                            </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mutedTextClass} group-hover:text-white transition-colors`}>
                            →
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
