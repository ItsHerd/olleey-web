"use client";

import React from "react";
import {
    MessageCircle,
    BookOpen,
    FileCode,
    LifeBuoy,
    Search,
    ChevronRight,
    Mail,
    ExternalLink,
    Clock,
    Shield
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
    const { theme } = useTheme();

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    const supportCategories = [
        {
            title: "Help Center",
            description: "Browse articles and guides for every feature.",
            icon: <BookOpen className="w-6 h-6 text-olleey-yellow" />,
            link: "Documentation"
        },
        {
            title: "API Status",
            description: "Monitor real-time system performance and uptime.",
            icon: <Clock className="w-6 h-6 text-olleey-yellow" />,
            link: "Status"
        },
        {
            title: "Developer Portal",
            description: "Technical documentation for API integration.",
            icon: <FileCode className="w-6 h-6 text-olleey-yellow" />,
            link: "Docs"
        },
        {
            title: "Security & Privacy",
            description: "Our commitment to keeping your data secure.",
            icon: <Shield className="w-6 h-6 text-olleey-yellow" />,
            link: "Security"
        }
    ];

    const commonQuestions = [
        "How do I connect a new YouTube channel?",
        "Can I use custom voice clones?",
        "What are the resolution limits for processing?",
        "How does the automated credit system work?",
        "Is my content protected by guardrails?"
    ];

    return (
        <div className={`flex-1 p-8 ${bgClass} overflow-y-auto`}>
            <div className="max-w-5xl mx-auto w-full">
                {/* Header Section */}
                <div className="text-center mb-16 pt-8">
                    <h2 className={`text-4xl md:text-5xl font-normal ${textClass} tracking-tighter mb-4`}>Creative Support</h2>
                    <p className={`text-lg ${textSecondaryClass} max-w-2xl mx-auto opacity-70`}>
                        Our specialized engineering team is here to ensure your global distribution flows without friction.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-olleey-yellow transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for documentation, guides, or troubleshooting..."
                            className={`w-full h-14 pl-16 pr-6 ${cardClass} border ${borderClass} rounded-full text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-olleey-yellow/20 transition-all shadow-2xl`}
                        />
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className={`group p-8 ${cardClass} border ${borderClass} rounded-[2rem] hover:border-olleey-yellow/30 transition-all flex items-start gap-6`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-olleey-yellow/10 transition-colors">
                            <MessageCircle className="w-7 h-7 text-olleey-yellow" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold ${textClass} mb-2`}>Priority Ticket</h3>
                            <p className={`${textSecondaryClass} text-sm leading-relaxed mb-6 italic opacity-60`}>
                                Average response time: &lt; 2 hours for Pro Members.
                            </p>
                            <Button className="bg-olleey-yellow text-black hover:bg-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-full">
                                Open New Ticket
                            </Button>
                        </div>
                    </div>

                    <div className={`group p-8 ${cardClass} border ${borderClass} rounded-[2rem] hover:border-olleey-yellow/30 transition-all flex items-start gap-6`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-olleey-yellow/10 transition-colors">
                            <Mail className="w-7 h-7 text-olleey-yellow" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold ${textClass} mb-2`}>Direct Support</h3>
                            <p className={`${textSecondaryClass} text-sm leading-relaxed mb-6 italic opacity-60`}>
                                Enterprise customers receive a dedicated Slack channel.
                            </p>
                            <Button variant="ghost" className={`${textClass} border ${borderClass} hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-full`}>
                                Contact Sales
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {supportCategories.map((cat, idx) => (
                        <div key={idx} className={`${cardClass} border ${borderClass} rounded-2xl p-6 hover:translate-y-[-4px] transition-all cursor-pointer group`}>
                            <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                {cat.icon}
                            </div>
                            <h4 className={`text-sm font-bold ${textClass} mb-2`}>{cat.title}</h4>
                            <p className={`text-[11px] ${textSecondaryClass} mb-4 leading-relaxed`}>{cat.description}</p>
                            <div className="flex items-center text-olleey-yellow text-[10px] font-black uppercase tracking-tighter gap-1">
                                Go to {cat.link} <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className={`${cardClass} border ${borderClass} rounded-[2rem] p-10 overflow-hidden relative`}>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <LifeBuoy className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <h3 className={`text-2xl font-normal ${textClass} mb-8 tracking-tight`}>Popular Resources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {commonQuestions.map((q, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/5 transition-all group`}>
                                    <span className={`text-sm ${textSecondaryClass} group-hover:text-white transition-colors`}>{q}</span>
                                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-olleey-yellow transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Support Info */}
                <div className="text-center mt-16 pt-8 border-t border-white/5">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${textSecondaryClass} opacity-40`}>
                        Official Olleey Ecosystem Support • Operating 24/7 Global Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
}
