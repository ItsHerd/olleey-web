"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LandingHeaderProps {
    logoText?: string;
    navLinks: { label: string; href: string }[];
    onSignIn?: () => void;
    onSignUp?: () => void;
    isDark?: boolean;
}

const NavLink = ({ href, children, isDark }: { href: string; children: React.ReactNode, isDark?: boolean }) => (
    <a
        href={href}
        className={cn(
            "text-sm font-medium tracking-widest transition-colors",
            isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
        )}
    >
        {children}
    </a>
);

export const LandingHeader = ({
    logoText = "",
    navLinks,
    onSignIn,
    onSignUp,
    isDark = false
}: LandingHeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="z-30 flex w-full max-w-7xl items-center justify-between py-6">
            <div className="flex items-center gap-3">
                <img src={isDark ? "/logo-transparent.png" : "/logo-transparent.png"} alt="" className={cn("w-32", isDark && "brightness-0 invert")} />
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn("text-xl font-bold tracking-wider", isDark ? "text-white" : "text-black")}
                >
                    {logoText}
                </motion.div>
            </div>

            <div className="hidden items-center space-x-8 md:flex">
                {navLinks.map((link) => (
                    <NavLink key={link.label} href={link.href} isDark={isDark}>
                        {link.label}
                    </NavLink>
                ))}
            </div>

            <div className="hidden items-center gap-4 md:flex">
                <button
                    onClick={onSignIn}
                    className={cn(
                        "text-sm font-medium tracking-widest transition-colors",
                        isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                    )}
                >
                    SIGN IN
                </button>
                <button
                    onClick={onSignUp}
                    className={cn(
                        "rounded-full px-6 py-2 text-sm font-medium tracking-widest transition-opacity hover:opacity-90",
                        isDark ? "bg-white text-black" : "bg-black text-white"
                    )}
                >
                    SIGN UP
                </button>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col space-y-1.5 md:hidden z-50"
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span className={cn("block h-0.5 w-6 transition-transform", isDark ? "bg-white" : "bg-black", isMobileMenuOpen && "rotate-45 translate-y-2")}></span>
                <span className={cn("block h-0.5 w-6 transition-opacity", isDark ? "bg-white" : "bg-black", isMobileMenuOpen && "opacity-0")}></span>
                <span className={cn("block h-0.5 w-5 transition-transform", isDark ? "bg-white" : "bg-black", isMobileMenuOpen && "-rotate-45 -translate-y-2 w-6")}></span>
            </motion.button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed inset-0 z-20 flex flex-col items-center justify-center p-8 md:hidden",
                        isDark ? "bg-black" : "bg-white"
                    )}
                >
                    <div className={cn("flex flex-col items-center space-y-8 text-xl font-medium tracking-widest", isDark ? "text-white" : "text-black")}>
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="transition-colors hover:opacity-60"
                            >
                                {link.label}
                            </a>
                        ))}
                        <button onClick={() => { onSignIn?.(); setIsMobileMenuOpen(false); }} className="hover:opacity-60">
                            SIGN IN
                        </button>
                        <button
                            onClick={() => { onSignUp?.(); setIsMobileMenuOpen(false); }}
                            className={cn(
                                "rounded-full px-10 py-3",
                                isDark ? "bg-white text-black" : "bg-black text-white"
                            )}
                        >
                            SIGN UP
                        </button>
                    </div>
                </motion.div>
            )}
        </header>
    );
};
