"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/LandingPage/Footer";
import { motion } from "framer-motion";

export default function ContactPage() {
    const navLinks = [
        { label: 'HOME', href: '/' },
        { label: 'WORKFLOWS', href: "/#workflows" },
        { label: 'PRODUCT', href: '/#product' },
        { label: 'PRICING', href: '/#pricing' },
    ];

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        alert("Message Transmitted Successfully [ACK_RECEIVED]");
    };

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

                        <div className="grid md:grid-cols-2 gap-16 items-start">
                            <div>
                                <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 mb-8 bg-black">
                                    <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">SYS.COMM.01</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-tight mb-8 leading-tight">
                                    Initialize <br/>
                                    <span className="text-white/50">Contact.</span>
                                </h1>
                                <p className="text-white/70 font-mono text-sm leading-relaxed mb-8">
                                    Ready to automate your global expansion? Our engineers are standing by to architect your pipeline.
                                </p>
                                
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="flex items-center gap-4 text-white/60">
                                        <span className="w-20 uppercase tracking-widest">Email</span>
                                        <span className="text-white">hello@olleey.com</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/60">
                                        <span className="w-20 uppercase tracking-widest">HQ</span>
                                        <span className="text-white">San Francisco, CA</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] block mb-2">Identify User</label>
                                    <input 
                                        type="text" 
                                        placeholder="FULL NAME"
                                        required
                                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] block mb-2">Comms Channel</label>
                                    <input 
                                        type="email" 
                                        placeholder="EMAIL ADDRESS"
                                        required
                                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] block mb-2">Data Packet</label>
                                    <textarea 
                                        placeholder="ENTER YOUR MESSAGE..."
                                        required
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10 resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-white text-black font-mono text-xs uppercase tracking-widest py-3 hover:bg-transparent hover:text-white hover:border border border-transparent hover:border-white transition-all duration-200"
                                >
                                    {loading ? "TRANSMITTING..." : "SEND TRANSMISSION"}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
