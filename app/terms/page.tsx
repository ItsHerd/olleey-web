"use client";

import React from 'react';
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/LandingPage/Footer";
import { motion } from "framer-motion";

export default function TermsOfService() {
    const navLinks = [
        { label: 'HOME', href: '/' },
        { label: 'WORKFLOWS', href: "/#workflows" },
        { label: 'PRODUCT', href: '/#product' },
        { label: 'PRICING', href: '/#pricing' },
    ];

    return (
        <div className="min-h-screen bg-black font-sans text-white relative flex flex-col">
            {/* Background Grid */}
             <div className="absolute inset-0 z-0 opacity-20 pointer-events-none fixed" 
                style={{ 
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} 
            />

            <Navbar
                navLinks={navLinks}
                onSignIn={() => {}} 
                onSignUp={() => {}} 
            />

            <main className="flex-grow flex justify-center pt-32 pb-32 px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl"
                >
                    <div className="border border-white/10 bg-black/80 backdrop-blur-md p-10 md:p-16 relative overflow-hidden group">
                         {/* Technical markers */}
                        <div className="absolute top-0 left-0 p-2 border-b border-r border-white/20 w-8 h-8" />
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 left-0 p-2 border-t border-r border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 right-0 p-2 border-t border-l border-white/20 w-8 h-8" />

                        <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 mb-8 bg-black">
                            <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">SYS.LEGAL.TERMS</span>
                        </div>

                        <header className="mb-12 border-b border-white/10 pb-8">
                            <h1 className="text-3xl md:text-5xl font-mono uppercase tracking-tight mb-4">Terms of Service</h1>
                            <div className="flex flex-col gap-1 font-mono text-xs text-white/50">
                                <p>LAST_UPDATED: 2026.01.23</p>
                                <p>EFFECTIVE: 2026.01.23</p>
                            </div>
                        </header>

                        <div className="space-y-12 font-mono text-sm leading-relaxed text-white/80">
                            {/* Content Sections */}
                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4 border-l-2 border-white pl-4">1. Acceptance of Terms</h2>
                                <p className="mb-4">
                                    Welcome to Olleey. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and Olleey Inc. regarding your use of our platform.
                                </p>
                                <p>
                                    By creating an account, you agree to these Terms. If you do not agree, you are prohibited from using the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4 border-l-2 border-white pl-4">2. Description of Service</h2>
                                <p className="mb-4">Olleey provides AI-driven video localization, including:</p>
                                <ul className="list-disc pl-5 space-y-2 text-white/60">
                                    <li>AI Transcription & Translation</li>
                                    <li>Voice Dubbing</li>
                                    <li>Lip-Sync Processing</li>
                                    <li>YouTube Integration</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4 border-l-2 border-white pl-4">3. User Obligations</h2>
                                <p className="mb-4">You agree to:</p>
                                <ul className="list-disc pl-5 space-y-2 text-white/60">
                                    <li>Maintain account security.</li>
                                    <li>Use the service lawfully.</li>
                                    <li>Not upload prohibited content (illegal, hate speech, etc.).</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4 border-l-2 border-white pl-4">4. Intellectual Property</h2>
                                <p className="mb-4">
                                    You retain ownership of your content. You grant Olleey a license to process your content solely for providing the Service. Olleey retains all rights to its software and AI models.
                                </p>
                            </section>
                            
                            <section className="bg-white/5 p-6 border border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Legal Contact</h2>
                                <p className="mb-2">For legal inquiries:</p>
                                <a href="mailto:legal@olleey.com" className="text-white underline hover:text-white/80">legal@olleey.com</a>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
