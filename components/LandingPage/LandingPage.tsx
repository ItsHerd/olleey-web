"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroAscii from "@/components/ui/hero-ascii";
import Footer from "./Footer";
import VideoDubbingShowcase from "./VideoDubbingShowcase";
import { GlobalLifecycle } from "./GlobalLifecycle";
import { SEO } from "@/components/SEO";
import FAQ from "./FAQ";

interface LandingPageProps {
    onNavigation: () => void;
    initialAuthMode?: 'login' | 'register';
    autoShowAuth?: boolean;
}

export default function LandingPage({ onNavigation, initialAuthMode = 'login', autoShowAuth = false }: LandingPageProps) {
    const [showAuth, setShowAuth] = React.useState(autoShowAuth);
    const [authMode, setAuthMode] = React.useState<'login' | 'register'>(initialAuthMode);

    const triggerAuth = (mode: 'login' | 'register') => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setAuthMode(mode);
        setShowAuth(true);
    };

    const navLinks = [
        { label: 'HOME', href: '#' },
        { label: 'WORKFLOWS', href: "#distribution" },
        { label: 'PRODUCT', href: '#product' },
        { label: 'FAQ', href: '#faq' },
    ];


    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 selection:text-black dark:selection:text-white transition-colors duration-300">
            <SEO
                title="Olleey | Translate & Distribute Your Content Globally"
                description="The ultimate AI-powered workflow for creators. Build automated pipelines that translate and distribute your content to 10+ languages instantly."
            />
            {/* Hero Section - Ascii Design */}
            <HeroAscii
                navLinks={navLinks}
                onAuthenticated={onNavigation}
                showAuth={showAuth}
                setShowAuth={setShowAuth}
                authMode={authMode}
                setAuthMode={setAuthMode}
            />

            <GlobalLifecycle />
            <VideoDubbingShowcase />


            <FAQ />

            <Footer onGetStarted={() => triggerAuth('register')} />
        </div>
    );
}
