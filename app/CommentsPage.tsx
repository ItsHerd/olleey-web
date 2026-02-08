"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Globe, Languages, Zap, Search, Filter,
    MoreHorizontal, Check, RefreshCw, Send, User, Reply,
    Heart, Share2, AlertCircle, BarChart2, ShieldCheck,
    Sparkles, Edit2, Play, ChevronRight, Hash
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸", color: "blue" },
    { code: "es", name: "Spanish", flag: "🇪🇸", color: "red" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", color: "orange" },
    { code: "jp", name: "Japanese", flag: "🇯🇵", color: "purple" },
];

const INITIAL_COMMENTS = [
    {
        id: "c1",
        author: "Sarah J. Tech",
        avatar: "SJ",
        platform: "YouTube",
        originalLang: "en",
        content: "The production quality of these localized versions is insane. How are you matching the voices so perfectly?",
        time: "2m ago",
        likes: 142,
        sentiment: "positive",
        replies: [
            { id: "r1", author: "Olleey Creator", content: "Thanks Sarah! We use neural voice cloning to match the exact timbre of the original creator.", time: "1m ago" }
        ],
        translations: {
            es: "La calidad de producción es increíble. ¿Cómo logran que las voces coincidan tan bien?",
            hi: "इन स्थानीयकृत संस्करणों की उत्पादन गुणवत्ता पागल कर देने वाली है। आप आवाजों का इतनी बखूबी मिलान कैसे कर रहे हैं?",
            jp: "これらのローカライズ版の制作クオリティは異常です。どうやって声をこれほど完璧に一致させているのですか？"
        }
    },
    {
        id: "c2",
        author: "TechMax ES",
        avatar: "TM",
        platform: "YouTube (ES)",
        originalLang: "es",
        content: "Por fin un canal que se toma en serio el doblaje en español. ¡Gran trabajo!",
        time: "15m ago",
        likes: 89,
        sentiment: "positive",
        replies: [],
        translations: {
            en: "Finally a channel that takes Spanish dubbing seriously. Great work!",
            hi: "अंत में एक ऐसा चैनल जो स्पेनिश डबिंग को गंभीरता से लेता है। शानदार काम!",
            jp: "ついにスペイン語の吹き替えを真剣に考えるチャンネルが現れましたね。素晴らしい仕事です！"
        }
    },
    {
        id: "c3",
        author: "Rajiv K.",
        avatar: "RK",
        platform: "YouTube (IN)",
        originalLang: "hi",
        content: "क्या यह सचमुच हिंदी में है? आवाज बिल्कुल वास्तविक लग रही है।",
        time: "45m ago",
        likes: 24,
        sentiment: "neutral",
        replies: [],
        translations: {
            en: "Is this really in Hindi? The voice sounds so real.",
            es: "¿Es esto realmente en hindi? La voz suena muy real.",
            jp: "これは本当にヒンディー語ですか？ 声がとてもリアルに聞こえます。"
        }
    }
];

export default function CommentsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [selectedLang, setSelectedLang] = useState("en");
    const [comments] = useState(INITIAL_COMMENTS);
    const [searchQuery, setSearchQuery] = useState("");

    const bgClass = isDark ? "bg-dark-bg" : "bg-light-bg";
    const borderClass = isDark ? "border-white/5" : "border-gray-200";
    const cardClass = isDark ? "bg-white/[0.03]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-black";
    const textSecondaryClass = isDark ? "text-white/40" : "text-black/40";

    return (
        <div className={cn("w-full h-full flex flex-col overflow-hidden relative", bgClass, textClass)}>
            {/* Grey Overlay - Makes page non-interactive */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto cursor-not-allowed">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center space-y-4 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-olleey-yellow/20 flex items-center justify-center mx-auto border border-olleey-yellow/30">
                        <MessageSquare className="w-8 h-8 text-olleey-yellow" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Feature In Development</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                        AI Comment Mirroring is currently in early development. This preview showcases the planned interface and capabilities.
                    </p>
                    <Badge className="bg-olleey-yellow/10 text-olleey-yellow border-olleey-yellow/30 text-[9px] font-black uppercase px-4 py-1.5">
                        Coming Soon
                    </Badge>
                </div>
            </div>

            {/* Header */}
            <div className={cn("px-8 py-4 border-b flex items-center justify-between shrink-0 bg-black/5 backdrop-blur-xl", borderClass)}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                        <MessageSquare className="w-5 h-5 text-olleey-yellow" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight">AI Comment Mirroring</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[8px] h-4 font-black uppercase rounded-full border-olleey-yellow/30 text-olleey-yellow bg-olleey-yellow/5">Engine: MirrorSync™</Badge>
                            <span className={cn("text-[10px] uppercase font-mono tracking-widest opacity-40")}>Global Engagement Core</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {LANGUAGES.map(l => (
                                <div key={l.code} className="w-7 h-7 rounded-full border-2 border-dark-bg bg-white/10 flex items-center justify-center text-xs" title={l.name}>
                                    {l.flag}
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">4 Feeds Syncing</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <Button className="h-9 px-6 rounded-xl bg-olleey-yellow text-black hover:bg-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-olleey-yellow/10">
                        Broadcasting: GLOBAL
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar: Analytics & Controls */}
                <aside className={cn("w-[360px] border-r overflow-y-auto custom-scrollbar p-6 space-y-8", borderClass)}>
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Feed Overview</h3>
                            <RefreshCw className="w-3.5 h-3.5 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className={cn("p-4 rounded-3xl border text-center space-y-1", borderClass, isDark ? "bg-white/[0.02]" : "bg-gray-50")}>
                                <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Total Reach</div>
                                <div className="text-xl font-black">2.4M</div>
                            </div>
                            <div className={cn("p-4 rounded-3xl border text-center space-y-1", borderClass, isDark ? "bg-white/[0.02]" : "bg-gray-50")}>
                                <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Engagement</div>
                                <div className="text-xl font-black text-olleey-yellow">+182%</div>
                            </div>
                        </div>

                        {/* Language Health */}
                        <div className="space-y-4">
                            {LANGUAGES.map(lang => (
                                <div key={lang.code} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                            {lang.flag}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold">{lang.name} Feed</div>
                                            <div className="text-[9px] opacity-40 font-mono">0.05ms Latency</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <span className="text-[9px] font-black uppercase opacity-20 group-hover:opacity-100">Syncing</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={cn("p-6 rounded-[2rem] border space-y-4", borderClass, isDark ? "bg-olleey-yellow/[0.03]" : "bg-olleey-yellow/5")}>
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-olleey-yellow" />
                            <h4 className="text-xs font-bold">AI Auto-Responder</h4>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-60 font-medium">
                            Automatically respond to common viewer questions across all channels while maintaining your persona and brand voice.
                        </p>
                        <Button variant="outline" className="w-full h-10 rounded-xl border-olleey-yellow/20 text-olleey-yellow text-[10px] font-black uppercase tracking-widest hover:bg-olleey-yellow/10">
                            Configure Bots
                        </Button>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="opacity-40 uppercase tracking-widest">Safety Shield</span>
                            <span className="text-green-500 font-black">99.8% Efficient</span>
                        </div>
                        <div className="p-4 rounded-2xl border border-white/5 bg-black/10 space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-mono opacity-40">
                                <span>Spam Filtered</span>
                                <span>1,242</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[94%]" />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Active Guardrails</span>
                            </div>
                        </div>
                    </section>
                </aside>

                {/* Main Content: Comment Feed */}
                <main className="flex-1 flex flex-col">
                    {/* Feed Controls */}
                    <div className={cn("p-6 border-b flex items-center justify-between shrink-0", borderClass)}>
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="text"
                                    placeholder="Filter by keyword, author, or sentiment..."
                                    className={cn("w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-olleey-yellow/30 bg-white/5", borderClass)}
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => setSelectedLang(l.code)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            selectedLang === l.code ? "bg-white shadow-xl text-black" : "opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pl-6">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5"><Filter className="w-4 h-4 opacity-40" /></Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5"><Hash className="w-4 h-4 opacity-40" /></Button>
                        </div>
                    </div>

                    {/* Feed List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                        {comments.map((comment, idx) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn("p-8 rounded-[2.5rem] border space-y-6 relative overflow-hidden group", borderClass, cardClass)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-olleey-yellow/20 to-indigo-500/20 flex items-center justify-center font-black text-olleey-yellow border border-white/10 text-lg">
                                            {comment.avatar}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-bold tracking-tight">{comment.author}</h4>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-40 px-0 border-none">
                                                    {comment.platform}
                                                </Badge>
                                            </div>
                                            <div className="text-[10px] opacity-40 font-medium mt-0.5">{comment.time} • Global Mirror ID: OX_{comment.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-[9px] font-black uppercase tracking-tighter opacity-20">Detected Language</div>
                                            <div className="text-xs font-bold uppercase">{LANGUAGES.find(l => l.code === comment.originalLang)?.name}</div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-white/5">
                                            {LANGUAGES.find(l => l.code === comment.originalLang)?.flag}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Grid: Original vs Mirror */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-3">
                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-20">Original Feed</div>
                                        <p className="text-base leading-relaxed font-medium">
                                            {comment.content}
                                        </p>
                                    </div>
                                    <div className={cn("p-6 rounded-3xl border border-olleey-yellow/10 bg-olleey-yellow/[0.02] space-y-3 relative group/mirror")}>
                                        <div className="flex items-center justify-between">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow">AI Mirror ({LANGUAGES.find(l => l.code === selectedLang)?.name})</div>
                                            <Sparkles className="w-3.5 h-3.5 text-olleey-yellow opacity-40" />
                                        </div>
                                        <p className="text-base leading-relaxed font-medium italic opacity-80">
                                            {selectedLang === comment.originalLang ? comment.content : (comment.translations as any)[selectedLang] || "Translation pending..."}
                                        </p>
                                        <button className="absolute bottom-4 right-4 text-[9px] font-black uppercase text-olleey-yellow tracking-widest opacity-0 group-hover/mirror:opacity-100 transition-opacity">Edit Translation</button>
                                    </div>
                                </div>

                                {/* Replies Feed */}
                                {comment.replies.length > 0 && (
                                    <div className="pl-12 space-y-4 border-l-2 border-white/5 ml-6">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black">OC</div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold">{reply.author}</span>
                                                        <span className="text-[9px] opacity-20 font-mono italic">Creator Reply Mirroring Active</span>
                                                    </div>
                                                    <p className="text-xs opacity-60 leading-relaxed max-w-2xl">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 group cursor-pointer">
                                            <Heart className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:text-red-500 transition-all" />
                                            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100">{comment.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 group cursor-pointer">
                                            <Reply className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:text-olleey-yellow transition-all" />
                                            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 uppercase tracking-widest">Reply Across All</span>
                                        </button>
                                        <button className="flex items-center gap-2 group cursor-pointer">
                                            <Share2 className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
                                            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 uppercase tracking-widest">Share Context</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button size="sm" className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                            Flag for Review
                                        </Button>
                                        <Button size="sm" className="h-9 px-6 rounded-xl bg-olleey-yellow text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                                            Suggest Reply
                                        </Button>
                                    </div>
                                </div>

                                {/* Background Aesthetic */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-olleey-yellow/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Reply Bar */}
                    <div className={cn("p-6 border-t bg-black/20 backdrop-blur-3xl shrink-0", borderClass)}>
                        <div className="max-w-4xl mx-auto relative flex gap-4">
                            <div className="flex-1 relative group">
                                <Edit2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                <input
                                    type="text"
                                    placeholder="Select a comment to broadcast a global reply..."
                                    className={cn("w-full pl-14 pr-24 py-5 rounded-[2rem] border text-sm focus:outline-none focus:border-olleey-yellow/30 bg-white/5 font-medium shadow-2xl", borderClass)}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-olleey-yellow animate-pulse" />
                                    <span className="text-[10px] font-black text-olleey-yellow uppercase tracking-widest">AI Assist ON</span>
                                </div>
                            </div>
                            <Button className="h-16 w-16 rounded-[2rem] bg-olleey-yellow text-black hover:bg-white flex items-center justify-center shadow-2xl shadow-olleey-yellow/10 shrink-0">
                                <Send className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </main>

                {/* Right: Global Feed Status */}
                <aside className={cn("w-[400px] border-l overflow-y-auto custom-scrollbar p-8 space-y-8", borderClass)}>
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Global Pulse</h3>
                            <BarChart2 className="w-4 h-4 opacity-20" />
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold">Positive Sentiment</span>
                                    </div>
                                    <span className="text-xs font-mono">82%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[82%]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-olleey-yellow" />
                                        <span className="text-xs font-bold">Inquiry Rate</span>
                                    </div>
                                    <span className="text-xs font-mono">14%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-olleey-yellow w-[14%]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <span className="text-xs font-bold">Flagged / Spam</span>
                                    </div>
                                    <span className="text-xs font-mono">4%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400 w-[4%]" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={cn("p-8 rounded-[2.5rem] border border-white/5 bg-black/20 space-y-6", borderClass)}>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-olleey-yellow" />
                            <h3 className="text-sm font-bold tracking-tight">Recent Synchronizations</h3>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow mt-1.5 shrink-0" />
                                    <div>
                                        <div className="text-[11px] font-bold">YouTube (JP) mirrored YouTube (US)</div>
                                        <div className="text-[10px] opacity-40 mt-1 italic">"The voice sync is perfect!" converted to Japanese.</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Play className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h4 className="text-xs font-bold">Engagement Preview</h4>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-60">
                            Channels using MirrorSync™ see an average of 3x growth in non-English communities within the first 60 days.
                        </p>
                        <Button className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/10">
                            View Case Studies
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
