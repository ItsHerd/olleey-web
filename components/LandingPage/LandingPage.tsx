"use client";

import React from "react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Footer from "./Footer";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
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
            {/* Hero Section - Minimalist Design */}
            <MinimalistHero
                logoText=""
                navLinks={navLinks}
                mainText="Build automated workflows that translate and distribute your content to 10+ languages instantly."
                readMoreLink="#product"
                imageSrc="/hero-image.png"
                imageAlt="Professional content creator"
                overlayText={{
                    part1: 'speak',
                    part2: 'global.',
                }}
                socialLinks={[
                    { icon: Facebook, href: '#' },
                    { icon: Instagram, href: '#' },
                    { icon: Twitter, href: '#' },
                    { icon: Linkedin, href: '#' },
                ]}
                languageFlags={['🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪']}
                totalLanguages={40}
                onSignIn={onNavigation}
                onSignUp={onNavigation}
                onGetStarted={onNavigation}
            />

            <FlowchartAnimation onGetStarted={onNavigation} />
            <CreatorsShowcase />
            <GlobalLifecycle />

            {/* Pricing Section */}
            <section id="pricing" className="relative py-18 overflow-hidden">
                {/* Background Treatment */}
                <div className="absolute inset-0 bg-[#F8F9FA] -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.02)_0%,transparent_50%)] -z-10" />

                <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
                    <div className="text-center mb-20 animate-element animate-delay-100">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 rounded-full border border-black/5 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-rolleey-yellow animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Scaling Solutions</span>
                        </div>
                        <h2 className="text-[50px] md:text-[75px] leading-[1.1] font-normal tracking-tighter text-black mb-8 px-4">
                            One price, <span className="font-semibold italic">all</span> the things.
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                            Scale your global distribution with transparent, usage-based pricing designed to grow with your audience.
                        </p>
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
