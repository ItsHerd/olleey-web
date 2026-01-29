import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LandingHeader } from '../LandingPage/LandingHeader';

interface MinimalistHeroProps {
    logoText: string;
    navLinks: { label: string; href: string }[];
    mainText: string;
    readMoreLink: string;
    imageSrc: string;
    imageAlt: string;
    overlayText: {
        part1: string;
        part2: string;
    };
    socialLinks: { icon: LucideIcon; href: string }[];
    languageFlags?: string[];
    totalLanguages?: number;
    className?: string;
    onSignIn?: () => void;
    onSignUp?: () => void;
    onGetStarted?: () => void;
}

export const MinimalistHero = ({
    logoText,
    navLinks,
    mainText,
    readMoreLink,
    imageSrc,
    imageAlt,
    overlayText,
    socialLinks,
    languageFlags = [],
    totalLanguages = 40,
    className,
    onSignIn,
    onSignUp,
    onGetStarted,
}: MinimalistHeroProps) => {
    return (
        <div
            className={cn(
                'relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-white text-black p-8 font-sans md:p-12',
                className
            )}
        >
            <LandingHeader
                logoText={logoText}
                navLinks={navLinks}
                onSignIn={onSignIn}
                onSignUp={onSignUp}
            />

            {/* Main Content Area */}

            {/* Main Content Area */}
            <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center md:grid-cols-3">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="z-20 order-2 md:order-1 text-center md:text-left"
                >
                    <p className="mx-auto max-w-xs text-md leading-relaxed text-black/80 md:mx-0">{mainText}</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center md:items-start">

                        <a
                            href="https://cal.com/ahmad-moltafet-q8mgvt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border-2 border-black px-8 py-3 text-sm font-medium tracking-widest text-black transition-all hover:bg-black hover:text-white"
                        >
                            SCHEDULE A DEMO
                        </a>
                    </div>
                </motion.div>

                {/* Center Image with Circle */}
                <div className="relative order-1 md:order-2 flex justify-center items-center h-full">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="absolute z-0 h-[300px] w-[300px] rounded-full bg-yellow-400/90 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]"
                    ></motion.div>
                    <motion.img
                        src={imageSrc}
                        alt={imageAlt}
                        className="relative z-10 h-auto w-56 object-cover md:w-64 scale-150 lg:w-72"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://placehold.co/400x600/eab308/ffffff?text=Image+Not+Found`;
                        }}
                    />
                </div>

                {/* Right Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="z-20 order-3 flex items-center justify-center text-center md:justify-start"
                >
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-black md:text-8xl lg:text-9xl">
                        {overlayText.part1}
                        <br />
                        {overlayText.part2}
                    </h1>
                </motion.div>
            </div>

            {/* Footer Elements */}
            <footer className="z-30 flex w-full max-w-7xl items-center justify-between">


            </footer>
        </div>
    );
};
