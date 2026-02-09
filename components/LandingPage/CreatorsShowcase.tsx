"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Globe2, Sparkles } from "lucide-react";

const languages = [
    { code: "ES", name: "Spanish", flag: "🇪🇸", phrase: "Tu contenido, en mi idioma", position: { top: "10%", left: "15%" } },
    { code: "FR", name: "French", flag: "🇫🇷", phrase: "Votre contenu, dans ma langue", position: { top: "25%", right: "10%" } },
    { code: "DE", name: "German", flag: "🇩🇪", phrase: "Dein Inhalt, in meiner Sprache", position: { top: "60%", left: "8%" } },
    { code: "JP", name: "Japanese", flag: "🇯🇵", phrase: "あなたのコンテンツを私の言語で", position: { bottom: "25%", right: "15%" } },
    { code: "PT", name: "Portuguese", flag: "🇧🇷", phrase: "Seu conteúdo, no meu idioma", position: { bottom: "15%", left: "20%" } },
    { code: "KR", name: "Korean", flag: "🇰🇷", phrase: "당신의 콘텐츠를 내 언어로", position: { top: "45%", right: "5%" } },
    { code: "IT", name: "Italian", flag: "🇮🇹", phrase: "Il tuo contenuto, nella mia lingua", position: { top: "5%", right: "30%" } },
    { code: "AR", name: "Arabic", flag: "🇸🇦", phrase: "محتواك بلغتي", position: { bottom: "35%", left: "5%" } },
];

const centerPhrases = [
    { lang: "English", text: "Your content, in my language", flag: "🇺🇸" },
    { lang: "Spanish", text: "Tu contenido, en mi idioma", flag: "🇪🇸" },
    { lang: "French", text: "Votre contenu, dans ma langue", flag: "🇫🇷" },
    { lang: "Japanese", text: "あなたのコンテンツを私の言語で", flag: "🇯🇵" },
    { lang: "German", text: "Dein Inhalt, in meiner Sprache", flag: "🇩🇪" },
    { lang: "Portuguese", text: "Seu conteúdo, no meu idioma", flag: "🇧🇷" },
];

export default function CreatorsShowcase() {
    const [activePhrase, setActivePhrase] = useState(0);
    const [isHovered, setIsHovered] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePhrase((prev) => (prev + 1) % centerPhrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="product" className="relative py-24 lg:py-32 bg-white dark:bg-black overflow-hidden border-t border-black/10 dark:border-white/10 transition-colors duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10 dark:opacity-100 transition-opacity duration-300">
                {/* Radial gradient pulse */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_50%)]" />
                
                {/* Orbiting rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-black/10 dark:border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-black/10 dark:border-white/5 rounded-full animate-[spin_90s_linear_infinite_reverse]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-green-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/20 dark:border-white/20 backdrop-blur-sm mb-6 bg-black/5 dark:bg-white/5 rounded-full transition-colors duration-300"
                    >
                        <Globe2 size={12} className="text-green-600 dark:text-green-400 transition-colors duration-300" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/80 dark:text-white/80 transition-colors duration-300">Global Reach</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold font-mono text-black dark:text-white mb-4 tracking-tight transition-colors duration-300"
                    >
                        One Voice.
                        <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2 transition-colors duration-300">
                            Every Language.
                        </span>
                    </motion.h2>
                </div>

                {/* Central Showcase */}
                <div className="relative h-[500px] lg:h-[600px]">
                    {/* Floating Language Cards */}
                    {languages.map((lang, index) => (
                        <motion.div
                            key={lang.code}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            animate={{
                                y: [0, -10, 0],
                            }}
                            style={{
                                position: "absolute",
                                ...lang.position,
                                animationDelay: `${index * 0.3}s`,
                            }}
                            className="hidden lg:block"
                            onMouseEnter={() => setIsHovered(lang.code)}
                            onMouseLeave={() => setIsHovered(null)}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                                className={`
                                    group cursor-pointer p-4 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border rounded-2xl
                                    transition-all duration-300 hover:scale-110 hover:bg-black/5 dark:hover:bg-white/10 shadow-lg dark:shadow-none
                                    ${isHovered === lang.code ? "border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]" : "border-black/10 dark:border-white/10"}
                                `}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div>
                                        <div className="text-xs font-mono text-black dark:text-white font-bold transition-colors duration-300">{lang.name}</div>
                                        <div className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase transition-colors duration-300">{lang.code}</div>
                                    </div>
                                    <Volume2 className="w-3 h-3 text-green-600 dark:text-green-500 opacity-0 group-hover:opacity-100 transition-all ml-auto" />
                                </div>
                                <AnimatePresence>
                                    {isHovered === lang.code && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-[10px] font-mono text-black/60 dark:text-white/60 max-w-[150px] transition-colors duration-300"
                                        >
                                            "{lang.phrase}"
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Center Content - The WOW factor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full scale-150" />
                        
                        {/* Main Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-black/10 dark:border-white/20 rounded-3xl p-8 lg:p-10 shadow-2xl transition-colors duration-300"
                        >
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500/50 rounded-tl-3xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500/50 rounded-tr-3xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500/50 rounded-bl-3xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500/50 rounded-br-3xl" />

                            {/* Animated Phrase */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                                    <span className="text-[10px] font-mono text-green-600 dark:text-green-400 uppercase tracking-widest transition-colors duration-300">Live Translation</span>
                                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activePhrase}
                                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-6"
                                    >
                                        <div className="text-5xl mb-4">{centerPhrases[activePhrase].flag}</div>
                                        <p className="text-xl lg:text-2xl font-mono text-black dark:text-white font-bold leading-relaxed transition-colors duration-300">
                                            "{centerPhrases[activePhrase].text}"
                                        </p>
                                        <p className="text-xs font-mono text-black/40 dark:text-white/40 mt-3 uppercase tracking-widest transition-colors duration-300">
                                            {centerPhrases[activePhrase].lang}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Progress dots */}
                                <div className="flex justify-center gap-2">
                                    {centerPhrases.map((_, index) => (
                                        <motion.div
                                            key={index}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                index === activePhrase ? "w-6 bg-green-600 dark:bg-green-500" : "w-2 bg-black/20 dark:bg-white/20"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Audio Waveform Animation */}
                            <div className="mt-8 flex items-center justify-center gap-1">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [10, 30, 10],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                            ease: "easeInOut",
                                        }}
                                        className="w-1 bg-gradient-to-t from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-400 rounded-full transition-colors duration-300"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile Language Pills */}
                    <div className="lg:hidden flex flex-wrap justify-center gap-2 mt-8">
                        {languages.slice(0, 6).map((lang, index) => (
                            <motion.div
                                key={lang.code}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * index }}
                                className="flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full transition-colors duration-300"
                            >
                                <span>{lang.flag}</span>
                                <span className="text-xs font-mono text-black/80 dark:text-white/80 transition-colors duration-300">{lang.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 lg:mt-0 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
                >
                    {[
                        { value: "10+", label: "Languages" },
                        { value: "1:1", label: "Voice Match" },
                        { value: "24hr", label: "Turnaround" },
                    ].map((stat, index) => (
                        <div key={stat.label} className="text-center p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl transition-colors duration-300">
                            <div className="text-2xl lg:text-3xl font-bold font-mono text-black dark:text-white mb-1 transition-colors duration-300">{stat.value}</div>
                            <div className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider transition-colors duration-300">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
