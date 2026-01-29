"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroAscii from "@/components/ui/hero-ascii";
import Footer from "./Footer";
import { FlowchartAnimation } from "@/components/FlowchartAnimation";
import CreatorsShowcase from "./CreatorsShowcase";
import { GlobalLifecycle } from "./GlobalLifecycle";
import AIProductsShowcase from "./AIProductsShowcase";
import { PricingCalculator } from "./PricingCalculator";
import { SEO } from "@/components/SEO";

interface LandingPageProps {
    onNavigation: () => void;
}

export default function LandingPage({ onNavigation }: LandingPageProps) {
    const navLinks = [
        { label: 'HOME', href: '#' },
        { label: 'WORKFLOWS', href: "#workflows" },
        { label: 'PRODUCT', href: '#product' },
        { label: 'PRICING', href: '#pricing' },
    ];


    return (
        <div className="min-h-screen bg-white font-sans">
            <SEO
                title="Olleey | Translate & Distribute Your Content Globally"
                description="The ultimate AI-powered workflow for creators. Build automated pipelines that translate and distribute your content to 10+ languages instantly."
            />
            {/* Hero Section - Ascii Design */}
            <HeroAscii 
                navLinks={navLinks}
                onSignIn={onNavigation}
                onSignUp={onNavigation}
                onGetStarted={onNavigation}
            />

            <FlowchartAnimation onGetStarted={onNavigation} />
            <CreatorsShowcase />
            <GlobalLifecycle />

            {/* Pricing Section - Technical */}
            <section id="pricing" className="relative py-32 overflow-hidden bg-black border-t border-white/10">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px] relative z-10">
                    <div className="text-center mb-20">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 backdrop-blur-sm mb-6 bg-black"
                        >
                             <div className="w-1.5 h-1.5 bg-white animate-pulse" />
                             <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Scaling Solutions</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-6xl font-normal text-white mb-8 px-4 font-mono uppercase tracking-tight"
                        >
                            One price. <br/>
                            <span className="text-white/50">All features.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-mono"
                        >
                            Scale your global distribution with transparent, usage-based pricing designed to grow with your audience.
                        </motion.p>
                    </div>


                    <div className="animate-element animate-delay-300">
                        <PricingCalculator onGetStarted={onNavigation} />
                    </div>
                </div>
            </section>
            <AIProductsShowcase />

            <Footer />
        </div>
    );
}
