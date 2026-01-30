"use client";

import React from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/LandingPage/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
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
            
            <main className="flex-grow flex items-center justify-center pt-32 pb-32 px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-5xl"
                >
                    <div className="border border-white/10 bg-black/80 backdrop-blur-md p-10 md:p-16 relative overflow-hidden group">
                         {/* Technical markers */}
                        <div className="absolute top-0 left-0 p-2 border-b border-r border-white/20 w-8 h-8" />
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 left-0 p-2 border-t border-r border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 right-0 p-2 border-t border-l border-white/20 w-8 h-8" />

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 mb-8 bg-black">
                                    <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">SYS.ABOUT.01</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-mono uppercase tracking-tight mb-8 leading-tight">
                                    Decoding <br/>
                                    <span className="text-white/50">Language.</span>
                                </h1>
                                <p className="text-white/70 font-mono text-sm leading-relaxed mb-6">
                                    We believe that language shouldn't be a barrier to great stories. 
                                    Olleey was initialized to bridge the gap between creators and the world.
                                </p>
                                <p className="text-white/70 font-mono text-sm leading-relaxed">
                                    By building the world's most advanced AI localization engine, we empower you 
                                    to speak to every corner of the globe with your own voice, natively and instantly.
                                </p>
                            </div>

                            <div className="relative aspect-square border border-white/10 p-4">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-scan pointer-events-none" />
                                <div className="h-full w-full bg-white/5 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                     {/* Abstract Representation of Connection */}
                                     <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                         <div className="w-[120%] h-[1px] bg-white rotate-45 absolute" />
                                         <div className="w-[120%] h-[1px] bg-white -rotate-45 absolute" />
                                         <div className="w-[80%] h-[80%] border border-white rounded-full absolute" />
                                         <div className="w-[40%] h-[40%] border border-white rounded-full absolute" />
                                     </div>
                                     <div className="text-center z-10">
                                         <div className="text-5xl font-mono font-bold mb-2">INF</div>
                                         <div className="text-[10px] uppercase tracking-widest text-white/50">Infinite Reach</div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
