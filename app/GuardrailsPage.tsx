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

export default function GuardrailsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Theme tokens
    const bgClass = isDark ? "bg-dark-bg" : "bg-light-bg";
    const cardClass = isDark ? "bg-dark-card" : "bg-light-card";
    const textClass = isDark ? "text-dark-text" : "text-light-text";
    const textSecondaryClass = isDark ? "text-dark-textSecondary" : "text-light-textSecondary";
    const borderClass = isDark ? "border-dark-border" : "border-light-border";

    const [schedulingDefault, setSchedulingDefault] = useState("Immediate");
    const [autoPublish, setAutoPublish] = useState(false);
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [qualityThreshold, setQualityThreshold] = useState(85);

    return (
        <div className={`h-full flex flex-col ${bgClass}`}>
            {/* Header */}
            <div className={`relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 border-b ${borderClass} overflow-hidden`}>
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-20"
                        alt=""
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-dark-bg via-dark-bg/80 to-transparent' : 'from-light-bg via-light-bg/80 to-transparent'}`} />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-2 sm:px-4">
                        <div>
                            <h1 className={`text-xl sm:text-2xl md:text-3xl font-300 ${textClass} mb-2 tracking-tight`}>System Guardrails</h1>
                            <p className={`text-sm sm:text-base ${textSecondaryClass} max-w-2xl`}>
                                Define safety protocols and automated thresholds for the global dubbing pipeline.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-none border border-white/10 shadow-lg">
                            <div className="flex flex-col">
                                <span className="opacity-60 uppercase text-[9px] font-black tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className={`text-xs font-bold ${textClass}`}>Active Security</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 md:px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Scheduling & Automation */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-olleey-yellow" />
                            <h2 className={`text-lg font-bold ${textClass}`}>Scheduling & Automation</h2>
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-none p-6 flex items-center justify-between shadow-sm`}>
                                <div className="space-y-1">
                                    <p className={`font-semibold ${textClass}`}>Scheduling Defaults</p>
                                    <p className={`text-xs ${textSecondaryClass}`}>Default behavior for new workflow runs</p>
                                </div>
                                <div className={`flex ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'} p-1 rounded-none border`}>
                                    {["Immediate", "Scheduled", "Manual"].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSchedulingDefault(v)}
                                            className={`px-4 py-2 rounded-none text-xs font-bold transition-all ${schedulingDefault === v
                                                ? "bg-olleey-yellow text-black shadow-lg shadow-yellow-500/20"
                                                : `${textSecondaryClass} hover:${textClass}`
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-none p-6 flex items-center justify-between shadow-sm`}>
                                <div className="space-y-1">
                                    <p className={`font-semibold ${textClass}`}>Enable Auto-Publishing</p>
                                    <p className={`text-xs ${textSecondaryClass}`}>Automatically upload to YouTube once dubbing is completed</p>
                                </div>
                                <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
                            </div>
                        </div>
                    </section>

                    {/* Quality & Approvals */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h2 className={`text-lg font-bold ${textClass}`}>Quality & Approvals</h2>
                        </div>

                        <div className="grid gap-4">
                            <div className={`${cardClass} border ${borderClass} rounded-none p-6 flex items-center justify-between shadow-sm`}>
                                <div className="space-y-1">
                                    <p className={`font-semibold ${textClass}`}>Manual Review Required</p>
                                    <p className={`text-xs ${textSecondaryClass}`}>Always require approval before final distribution</p>
                                </div>
                                <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
                            </div>

                            <div className={`${cardClass} border ${borderClass} rounded-none p-6 shadow-sm`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-1">
                                        <p className={`font-semibold ${textClass}`}>AI Quality Threshold</p>
                                        <p className={`text-xs ${textSecondaryClass}`}>Trigger manual review if confidence score is below {qualityThreshold}%</p>
                                    </div>
                                    <span className={`text-lg font-bold text-olleey-yellow`}>{qualityThreshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={qualityThreshold}
                                    onChange={(e) => setQualityThreshold(parseInt(e.target.value))}
                                    className={`w-full h-1.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'} rounded-none appearance-none cursor-pointer accent-olleey-yellow`}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Content Safety */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <Lock className="w-5 h-5 text-emerald-500" />
                            <h2 className={`text-lg font-bold ${textClass}`}>Content Safety</h2>
                        </div>

                        <div className={`p-6 border ${borderClass} rounded-none bg-gradient-to-br from-olleey-yellow/5 to-transparent relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-24 h-24 text-olleey-yellow" />
                            </div>
                            <div className="relative z-10">
                                <h3 className={`font-bold ${textClass} mb-2 flex items-center gap-2`}>
                                    Smart Safety Filter
                                    <span className="bg-olleey-yellow/20 text-olleey-yellow text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-olleey-yellow/30">Active</span>
                                </h3>
                                <p className={`text-sm ${textSecondaryClass} mb-6 max-w-md`}>
                                    Our AI automatically scans translations for profanity, cultural sensitivities, and brand misalignments based on your channel niche.
                                </p>
                                <Button variant="outline" className={`border-olleey-yellow/30 text-olleey-yellow hover:bg-olleey-yellow/10 font-bold text-xs flex items-center gap-2`}>
                                    Custom Sensitivity Settings <ArrowRight className="w-3" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <div className="pt-8 mt-8 border-t border-red-500/10">
                        <div className="bg-red-500/5 border border-red-500/10 rounded-none p-6 flex items-center justify-between">
                            <div>
                                <p className={`font-bold text-red-500 mb-1`}>Reset Guardrails</p>
                                <p className={`text-xs text-red-500/60`}>Revert all safety and automation settings to platform defaults.</p>
                            </div>
                            <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 font-bold">Reset</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
