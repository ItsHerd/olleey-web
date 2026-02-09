"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/LandingPage/Footer";
import { motion } from "framer-motion";

export default function ContactPage() {
    const navLinks = [
        { label: 'HOME', href: '/' },
        { label: 'WORKFLOWS', href: "/#distribution" },
        { label: 'PRODUCT', href: '/#product' },
        { label: 'FAQ', href: '/#faq' },
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
        <div className="min-h-screen bg-white dark:bg-black font-sans text-black dark:text-white relative flex flex-col transition-colors duration-300">
            {/* Background Grid - Light Mode */}
            <div className="absolute inset-0 z-0 opacity-5 dark:opacity-0 pointer-events-none fixed transition-opacity duration-300"
                style={{
                    backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Background Grid - Dark Mode */}
            <div className="absolute inset-0 z-0 opacity-0 dark:opacity-20 pointer-events-none fixed transition-opacity duration-300"
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
                    <div className="border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-10 md:p-16 relative overflow-hidden group transition-colors duration-300 rounded-3xl shadow-xl dark:shadow-none">
                         {/* Technical markers */}
                        <div className="absolute top-0 left-0 p-2 border-b border-r border-black/20 dark:border-white/20 w-8 h-8 transition-colors duration-300" />
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-black/20 dark:border-white/20 w-8 h-8 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 p-2 border-t border-r border-black/20 dark:border-white/20 w-8 h-8 transition-colors duration-300" />
                        <div className="absolute bottom-0 right-0 p-2 border-t border-l border-black/20 dark:border-white/20 w-8 h-8 transition-colors duration-300" />

                        <div className="grid md:grid-cols-2 gap-16 items-start">
                            <div>
                                <div className="inline-flex items-center gap-3 px-4 py-1 border border-black/30 dark:border-white/30 mb-8 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse transition-colors duration-300" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black dark:text-white transition-colors duration-300">SYS.COMM.01</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-tight mb-8 leading-tight text-black dark:text-white transition-colors duration-300">
                                    Initialize <br/>
                                    <span className="text-black/50 dark:text-white/50 transition-colors duration-300">Contact.</span>
                                </h1>
                                <p className="text-neutral-600 dark:text-white/70 font-mono text-sm leading-relaxed mb-8 transition-colors duration-300">
                                    Ready to automate your global expansion? Our engineers are standing by to architect your pipeline.
                                </p>
                                
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="flex items-center gap-4 text-black/60 dark:text-white/60 transition-colors duration-300">
                                        <span className="w-20 uppercase tracking-widest">Email</span>
                                        <span className="text-black dark:text-white transition-colors duration-300">hello@olleey.com</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-black/60 dark:text-white/60 transition-colors duration-300">
                                        <span className="w-20 uppercase tracking-widest">HQ</span>
                                        <span className="text-black dark:text-white transition-colors duration-300">San Francisco, CA</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-[0.2em] block mb-2 transition-colors duration-300">Identify User</label>
                                    <input 
                                        type="text" 
                                        placeholder="FULL NAME"
                                        required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/60 dark:focus:border-white/60 focus:bg-black/10 dark:focus:bg-white/10 transition-all placeholder:text-black/30 dark:placeholder:text-white/30 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-[0.2em] block mb-2 transition-colors duration-300">Comms Channel</label>
                                    <input 
                                        type="email" 
                                        placeholder="EMAIL ADDRESS"
                                        required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/60 dark:focus:border-white/60 focus:bg-black/10 dark:focus:bg-white/10 transition-all placeholder:text-black/30 dark:placeholder:text-white/30 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-[0.2em] block mb-2 transition-colors duration-300">Data Packet</label>
                                    <textarea 
                                        placeholder="ENTER YOUR MESSAGE..."
                                        required
                                        rows={4}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/60 dark:focus:border-white/60 focus:bg-black/10 dark:focus:bg-white/10 transition-all placeholder:text-black/30 dark:placeholder:text-white/30 resize-none rounded-xl"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs uppercase tracking-widest py-3 hover:opacity-90 transition-all duration-200 rounded-xl font-bold hover:shadow-lg"
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
