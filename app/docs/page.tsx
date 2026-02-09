"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    ChevronLeft, 
    Terminal, 
    Cpu, 
    Zap, 
    Globe, 
    Layers, 
    Mic,
    Waves,
    Languages,
    Shield,
    CheckCircle,
    Lock,
    FileVideo
} from "lucide-react";

// Types for navigation
type Section = {
    id: string;
    title: string;
    icon: React.ElementType;
};

const sections: Section[] = [
    { id: "overview", title: "How It Works", icon: Zap },
    { id: "pipeline", title: "The Pipeline", icon: Layers },
    { id: "voice", title: "Voice & Tone", icon: Mic },
    { id: "sync", title: "Visual Sync", icon: Waves },
    { id: "translation", title: "Smart Translation", icon: Languages },
    { id: "security", title: "Security & Trust", icon: Shield },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll to highlight active section
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            
            // Simple spy logic
            const sectionElements = sections.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 200;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const element = sectionElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30 selection:text-green-200 font-sans">
            {/* Background Grid & Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-green-500/5 to-transparent blur-3xl" />
            </div>

            {/* Navbar */}
            <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-white/10" : "bg-transparent border-transparent"}`}>
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                            <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                            <span className="text-xs font-mono text-white/60 group-hover:text-white transition-colors">BACK_TO_HOME</span>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-green-500" />
                            <span className="font-mono font-bold tracking-tight">OLLEEY_ENGINE_DOCS</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-mono">v1.0</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-20 px-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
                
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block sticky top-32 h-[calc(100vh-160px)]">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all duration-200 group ${
                                    activeSection === section.id 
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                        : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-green-400" : "text-white/40 group-hover:text-white"}`} />
                                {section.title}
                                {activeSection === section.id && (
                                    <motion.div layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="text-xs font-mono text-white/50 uppercase mb-3 text-center">Creator Trust Score</h4>
                        <div className="flex justify-center mb-2">
                            <div className="text-3xl font-bold text-green-400 font-mono">100%</div>
                        </div>
                        <p className="text-[10px] text-center text-white/40">Your content remains 100% yours. We never train public models on your private data.</p>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="space-y-24">
                    
                    {/* Hero / Overview */}
                    <section id="overview" className="relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 text-green-400 font-mono text-xs mb-4">
                                <span className="opacity-50">Docs</span>
                                <span>/</span>
                                <span>Overview</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-mono tracking-tight text-white">
                                Under the Hood
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mb-10 font-light">
                                Olleey is an automated localization workflow designed for high-end creators.
                                We orchestrate the world's best AI models to translate, dub, and visually sync your videos, maximizing quality while minimizing the "uncanny valley" effect.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Voice Retention", value: "Studio Grade", icon: Mic },
                                    { label: "Turnaround", value: "< 24 Hours", icon: Zap },
                                    { label: "Lip Sync", value: "Native Feel", icon: CheckCircle },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-4">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <stat.icon className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{stat.label}</div>
                                            <div className="text-lg font-mono text-white">{stat.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    {/* Pipeline / Architecture */}
                    <section id="pipeline">
                        <SectionHeader title="The Production Pipeline" icon={Layers} />
                        <div className="relative p-8 bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            
                            <p className="text-gray-400 mb-8 max-w-2xl">
                                When you upload a video, it goes through a multi-stage refinement process. This isn't just a simple "convert" button—it's a production chain.
                            </p>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 overflow-x-auto pb-4 md:pb-0">
                                <ArchitectureNode title="Ingest" icon={FileVideo} subtext="Quality Check" />
                                <ArchitectureArrow />
                                <ArchitectureNode title="Analyze" icon={Cpu} subtext="Speaker ID" active />
                                <ArchitectureArrow />
                                <ArchitectureNode title="Clone" icon={Mic} subtext="Voice Model" />
                                <ArchitectureArrow />
                                <ArchitectureNode title="Sync" icon={Waves} subtext="Visual Match" />
                                <ArchitectureArrow />
                                <ArchitectureNode title="Export" icon={Globe} subtext="4K Render" />
                            </div>
                        </div>
                    </section>

                    {/* Voice & Tone */}
                    <section id="voice">
                        <SectionHeader title="Voice & Tone Preservation" icon={Mic} />
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div>
                                <h3 className="text-xl text-white font-bold mb-4 font-mono">It Sounds Like YOU.</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Most dubbing sounds robotic or generic. We solve this by training a temporary, high-fidelity voice model on your specific video data.
                                </p>
                                <ul className="space-y-4 mb-6">
                                    <li className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs">1</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Sample Selection</h4>
                                            <p className="text-xs text-gray-500">We isolate your cleanest audio segments (no background music/noise) to use as reference data.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs">2</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Emotion Mapping</h4>
                                            <p className="text-xs text-gray-500">Our engine maps your emotional range—excitement, whispers, rigorous explanations—so the translated audio matches the energy of the original.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <div className="text-xs font-mono text-white/50 mb-4 uppercase tracking-widest">Audio Frequency Analysis</div>
                                <div className="flex items-end justify-between h-32 gap-1 mb-4">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-full bg-gradient-to-t from-green-500/20 to-green-400 rounded-sm"
                                            initial={{ height: "20%" }}
                                            whileInView={{ height: `${Math.random() * 80 + 20}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-white/30">
                                    <span>Original (English)</span>
                                    <span>Generated (Spanish)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Visual Sync */}
                    <section id="sync">
                        <SectionHeader title="Visual Sync Technology" icon={Waves} />
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl text-white font-bold mb-4 font-mono">No More "Bad Kung-Fu Movie" Dubs</h3>
                            <p className="text-gray-400 leading-relaxed max-w-3xl mb-8">
                                Bad dubbing breaks immersion. When the lips don't match the words, viewers click away. 
                                We use generative AI to subtly reshape the mouth movements in the video frames to match the new language's phonemes perfectly.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
                                    <div className="text-red-400 font-mono text-xs mb-2">BEFORE (Standard Dub)</div>
                                    <p className="text-sm text-white/60 italic mb-2">"Audio says 'Hola', lips say 'Hello'"</p>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-red-500/50" />
                                    </div>
                                    <p className="text-[10px] text-red-500 mt-2 text-right">Sync Mismatch: High</p>
                                </div>
                                <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-xl">
                                    <div className="text-green-400 font-mono text-xs mb-2">AFTER (Olleey Sync)</div>
                                    <p className="text-sm text-white/60 italic mb-2">"Audio says 'Hola', lips form 'O-L-A'"</p>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-green-500" />
                                    </div>
                                    <p className="text-[10px] text-green-400 mt-2 text-right">Sync Match: 99.8%</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Translation */}
                    <section id="translation">
                        <SectionHeader title="Smart Translation" icon={Languages} />
                        <div className="space-y-6">
                            <p className="text-gray-400 max-w-4xl">
                                A direct translation often kills the vibe. We prioritize <strong>Cultural Relevance</strong> over literal accuracy.
                                Our system understands context, slang, and your specific niche (Gaming, Tech, Lifestyle, etc.).
                            </p>
                            
                            <div className="grid gap-4">
                                <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                                    <div className="flex-1">
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Input (English)</div>
                                        <div className="text-lg font-mono text-white">"This tech is absolute fire, no cap."</div>
                                    </div>
                                    <div className="hidden md:flex items-center text-white/20">→</div>
                                    <div className="flex-1">
                                        <div className="text-xs text-green-400/60 uppercase tracking-widest mb-1">Output (Spanish - Gen Z Style)</div>
                                        <div className="text-lg font-mono text-green-400">"Esta tecnología está increíble, en serio."</div>
                                        <div className="text-xs text-white/30 mt-1">*Preserves the enthusiastic/slang tone instead of a formal translation.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Security */}
                    <section id="security" className="pb-20">
                         <SectionHeader title="Your Data & Security" icon={Shield} />
                         <div className="grid md:grid-cols-2 gap-8">
                             <div>
                                 <p className="text-gray-400 mb-6">
                                     We know your content is your IP. We take security seriously to ensure your voice is never misused.
                                 </p>
                                 <ul className="space-y-4">
                                     <li className="flex items-start gap-3">
                                         <Lock className="w-5 h-5 text-green-400 mt-0.5" />
                                         <div>
                                             <h4 className="text-white font-bold text-sm">Private Voice Models</h4>
                                             <p className="text-xs text-gray-500">Your voice clone is isolated. It is used ONLY for your requested projects and never shared with other users.</p>
                                         </div>
                                     </li>
                                     <li className="flex items-start gap-3">
                                          <FileVideo className="w-5 h-5 text-green-400 mt-0.5" />
                                         <div>
                                             <h4 className="text-white font-bold text-sm">Content Ownership</h4>
                                             <p className="text-xs text-gray-500">You retain 100% ownership of the localized output files. We claim no rights to your content.</p>
                                         </div>
                                     </li>
                                 </ul>
                             </div>
                             <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                                 <Shield className="w-12 h-12 text-green-400 mb-4" />
                                 <h4 className="text-white font-bold mb-2">Enterprise-Grade Encryption</h4>
                                 <p className="text-xs text-gray-500">
                                     All files are encrypted at rest and in transit. When a job is done, temporary processing files are securely wiped.
                                 </p>
                             </div>
                         </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-12">
                <div className="max-w-[1400px] mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                         <Zap className="w-5 h-5 text-green-400" />
                        <span className="font-mono font-bold text-white/60 tracking-wider">POWERED BY OLLEEY</span>
                    </div>
                    <p className="text-xs text-white/20 font-mono">
                        Ready to go global?
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Subcomponents

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
    return (
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-white tracking-tight">{title}</h2>
        </div>
    );
}

function ArchitectureNode({ title, icon: Icon, subtext, active = false }: { title: string; icon: any; subtext: string; active?: boolean }) {
    return (
        <div className={`relative flex flex-col items-center gap-3 min-w-[120px] p-4 rounded-xl border transition-all duration-300 ${active ? "bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : "bg-black/40 border-white/10"}`}>
            {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            <div className={`p-3 rounded-full ${active ? "bg-green-500 text-black" : "bg-white/5 text-white/60"}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-center">
                <div className={`text-sm font-bold font-mono ${active ? "text-green-400" : "text-white"}`}>{title}</div>
                <div className="text-[10px] text-white/40 mt-1">{subtext}</div>
            </div>
        </div>
    );
}

function ArchitectureArrow() {
    return (
        <div className="hidden md:block text-white/20 animate-pulse">
             <ChevronLeft className="w-6 h-6 rotate-180" />
        </div>
    );
}
