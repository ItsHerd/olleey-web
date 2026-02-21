"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, X } from "lucide-react";
import { useThemeContext } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";

export default function SiteHeader() {
    const router = useRouter();
    const { theme, setTheme } = useThemeContext();
    const { user, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Product', href: '/#showcase' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Enterprise', href: '/enterprise' },
        { label: 'Mission', href: '/mission' },
    ];

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 lg:py-4 lg:px-10 transition-colors duration-300 pointer-events-none bg-[#FAFAFA]/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
            <div className="max-w-[1400px] mx-auto pointer-events-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-10 xl:gap-14">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-black dark:bg-white flex items-center justify-center">
                                <Image
                                    src="/favicon/android-chrome-192x192.png"
                                    alt="Olleey Logo"
                                    fill
                                    className="object-cover p-[5px] invert dark:invert-0"
                                />
                            </div>
                            <span className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
                                olleey
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} className="text-[15px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-black" />}
                        </button>

                        {!loading && user ? (
                            <Link
                                href="/app"
                                title="go to dashboard"
                                className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                    {user.user_metadata?.avatar_url ? (
                                        <Image src={user.user_metadata.avatar_url} alt="Avatar" width={32} height={32} />
                                    ) : (
                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                            {(user.user_metadata?.name || user.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start pr-2">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {user.user_metadata?.name || user.email?.split('@')[0]}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {user.email}
                                    </span>
                                </div>
                            </Link>
                        ) : !loading ? (
                            <>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="hidden lg:block text-[15px] font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
                                >
                                    Get started
                                </button>

                                <button
                                    onClick={() => router.push('/login')}
                                    className="hidden lg:block px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[15px] font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-all"
                                >
                                    Login
                                </button>
                            </>
                        ) : null}

                        <button
                            className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-black dark:text-white" />
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <div className="w-5 h-[2px] bg-black dark:bg-white rounded-full transition-colors"></div>
                                    <div className="w-5 h-[2px] bg-black dark:bg-white rounded-full transition-colors"></div>
                                    <div className="w-5 h-[2px] bg-black dark:bg-white rounded-full transition-colors"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden mt-3 rounded-2xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-md p-3 shadow-lg"
                        >
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 flex items-center gap-2">
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-full text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </button>
                                {!loading && user ? (
                                    <button
                                        onClick={() => {
                                            router.push('/app');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Go to dashboard
                                    </button>
                                ) : !loading ? (
                                    <button
                                        onClick={() => {
                                            router.push('/login');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Log in
                                    </button>
                                ) : null}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
