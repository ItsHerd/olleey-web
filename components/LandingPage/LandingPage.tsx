"use client";

import Header from "./Header";
import Hero from "./Hero";

interface LandingPageProps {
    onLoginClick: () => void;
    onGetStartedClick: () => void;
}

export default function LandingPage({ onLoginClick, onGetStartedClick }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
            <Header onLoginClick={onLoginClick} onGetStartedClick={onGetStartedClick} />
            <Hero onGetStartedClick={onGetStartedClick} />

            {/* Footer Placeholder */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-2xl font-bold tracking-tighter text-black mb-4 md:mb-0">olleey</div>
                        <div className="text-sm text-gray-500">
                            &copy; 2026 Olleey Inc. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
