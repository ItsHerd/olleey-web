"use client";

import React from "react";
import { useRouter } from "next/navigation";
import HeroAscii from "@/components/ui/hero-ascii";
import Footer from "./Footer";
import VideoDubbingShowcase from "./VideoDubbingShowcase";
import { GlobalLifecycle } from "./GlobalLifecycle";
import { SEO } from "@/components/SEO";
import FAQ from "./FAQ";
import PixelatedGlobe from "./PixelatedGlobe";

interface LandingPageProps {
    onNavigation: () => void;
}

export default function LandingPage({ onNavigation }: LandingPageProps) {
    const router = useRouter();
    const navLinks = [
        { label: 'Home', href: '#' },
        { label: 'Workflows', href: "#distribution" },
        { label: 'Product', href: '#product' },
        { label: 'Mission', href: '/mission' },
        { label: 'FAQ', href: '#faq' },
    ];


    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 selection:text-black dark:selection:text-white transition-colors duration-300">
            <SEO
                title="Olleey | Translate & Distribute Your Content Globally"
                description="The ultimate AI-powered workflow for creators. Build automated pipelines that translate and distribute your content to 10+ languages instantly."
            />
            {/* Hero Section - Ascii Design */}
            <HeroAscii
                navLinks={navLinks}
                onAuthenticated={onNavigation}
            />

            <div className="relative z-20 pt-10">
                <VideoDubbingShowcase />

                <GlobalLifecycle />
                <FAQ />
            </div>

            <PixelatedGlobe />
            <Footer onGetStarted={() => router.push("/register")} />
        </div>
    );
}
