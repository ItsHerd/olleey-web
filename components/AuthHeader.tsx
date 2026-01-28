"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function AuthHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const logoText = "olleey";
    const navLinks = [
        { label: "PRODUCT", href: "/#product" },
        { label: "SOLUTIONS", href: "/#solutions" },
        { label: "RESOURCES", href: "/#resources" },
        { label: "PRICING", href: "/#pricing" }
    ];

    return (
        <>
            <header className="z-50 fixed top-0 left-0 right-0 flex h-20 w-full items-center bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-olleey-yellow flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:scale-105 transition-transform">
                                O
                            </div>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-xl font-bold tracking-tighter text-gray-900"
                            >
                                {logoText}.com
                            </motion.span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-10 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[10px] font-black tracking-[0.2em] text-gray-400 transition-colors hover:text-black"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Menu Button for Mobile */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col space-y-1.5 md:hidden z-50"
                        aria-label="Toggle menu"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className={cn("block h-0.5 w-6 bg-black transition-transform", isMobileMenuOpen && "rotate-45 translate-y-2")}></span>
                        <span className={cn("block h-0.5 w-6 bg-black transition-opacity", isMobileMenuOpen && "opacity-0")}></span>
                        <span className={cn("block h-0.5 w-5 bg-black transition-transform", isMobileMenuOpen && "-rotate-45 -translate-y-2 w-6")}></span>
                    </motion.button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white p-8 md:hidden"
                >
                    <div className="flex flex-col items-center space-y-8 text-sm font-black tracking-widest text-gray-400">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="transition-colors hover:text-black"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </>
    );
}
