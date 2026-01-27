"use client";

import React from "react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Footer from "./Footer";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { FlowchartAnimation } from "@/components/FlowchartAnimation";
import CreatorsShowcase from "./CreatorsShowcase";
import AIProductsShowcase from "./AIProductsShowcase";
import { PricingCalculator } from "./PricingCalculator";
import { SEO } from "@/components/SEO";

interface LandingPageProps {
    onNavigation: () => void;
}

export default function LandingPage({ onNavigation }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white font-sans">
            <SEO
                title="Olleey | Clone, Translate & Distribute Your Content Globally"
                description="The ultimate AI-powered workflow for creators. Build automated pipelines that clone your voice, translate videos, and distribute to 10+ languages instantly."
            />
            {/* Hero Section - Minimalist Design */}
            <MinimalistHero
                logoText=""
                navLinks={[
                    { label: 'HOME', href: '#' },
                    { label: 'PRODUCT', href: '#product' },
                    { label: 'PRICING', href: '#pricing' },
                ]}
                mainText="Build automated workflows that clone, translate, and distribute your content to 10+ languages instantly."
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

            <FlowchartAnimation />
            <CreatorsShowcase />
            <AIProductsShowcase />

            {/* Pricing Section */}
            <section id="pricing" className="bg-white pb-20 mb-20 mt-10">
                <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
                    <div className="text-center mb-16">
                        <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide text-center font-bold">Pricing</p>
                        <h2 className="text-[50px] md:text-[60px] leading-tight font-normal text-black mt-4 mb-6 text-center">
                            One price, all the things
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center leading-relaxed">
                            Scale your content globally with transparent pricing based on your usage.
                        </p>
                    </div>

                    <PricingCalculator onGetStarted={onNavigation} />
                </div>
            </section>

            <Footer />
        </div>
    );
}
