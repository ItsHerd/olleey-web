"use client";

import React from "react";
import Navbar from "@/components/ui/navbar";
import { Careers4 } from "@/components/ui/careers-4";
import Footer from "@/components/LandingPage/Footer";
import { motion } from "framer-motion";

export default function CareersPage() {
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
                onSignIn={() => {}} // Placeholder or redirect to login
                onSignUp={() => {}} // Placeholder
            />
            
            <main className="flex-grow flex items-center justify-center pt-32 pb-32 px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl"
                >
                    <div className="border border-white/10 bg-black/50 backdrop-blur-md p-8 md:p-12 relative overflow-hidden group">
                         {/* Technical markers */}
                        <div className="absolute top-0 left-0 p-2 border-b border-r border-white/20 w-8 h-8" />
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 left-0 p-2 border-t border-r border-white/20 w-8 h-8" />
                        <div className="absolute bottom-0 right-0 p-2 border-t border-l border-white/20 w-8 h-8" />

                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 mb-6 bg-black">
                                <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">HIRING_PORTAL</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-tight mb-4">Join The Mission</h1>
                            <p className="text-white/60 font-mono text-sm max-w-lg mx-auto">Help us build the future of global content distribution.</p>
                        </div>
                        
                        <div className="relative">
                            <Careers4 
                                heading="" 
                                jobs={[]} 
                            />
                            
                            {/* Override the empty state visually since we passed empty jobs */}
                            <div className="text-center font-mono text-white/50 text-sm mt-8 border-t border-dashed border-white/20 pt-12">
                                <p className="mb-4 text-white uppercase tracking-widest text-lg animate-pulse">[ NO_ACTIVE_POSITIONS ]</p>
                                <p className="max-w-md mx-auto leading-relaxed">Our engineering and design teams are currently at full capacity. We update this portal every Monday at 09:00 UTC.</p>
                                
                                <button className="mt-8 px-6 py-2 border border-white/20 hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest">
                                    Notify Me of Openings
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
