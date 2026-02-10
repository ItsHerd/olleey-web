import Link from "next/link";
import Image from "next/image";
import {
    Mail,
    MapPin,
    Twitter,
    Globe,
    ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/hover-footer";

export default function Footer({ onGetStarted }: { onGetStarted?: () => void }) {
    const currentYear = new Date().getFullYear();

    // Footer link data - Updated to match Nav and existing routes
    const footerLinks = [
        {
            title: "PLATFORM",
            links: [
                { label: "Workflows", href: "#distribution" },
                { label: "Product", href: "#product" },
                { label: "FAQ", href: "#faq" },
            ],
        },
        {
            title: "RESOURCES",
            links: [
                { label: "Support", href: "mailto:ahmad@olleey.com" },
            ],
        },
        {
            title: "LEGAL",
            links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/privacy" },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={12} className="text-zinc-500" />,
            text: "hello@olleey.com",
            href: "mailto:hello@olleey.com",
        },
        {
            icon: <MapPin size={12} className="text-zinc-500" />,
            text: "San Francisco, CA",
        },
    ];

    return (
        <footer className="bg-black relative border-t border-white/5 overflow-hidden">
            {/* Darker, more subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px:32px] pointer-events-none" />

            {/* Sharp white radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-white/[0.03] blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-[1400px] mx-auto p-10 md:p-20 z-10 relative"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 md:gap-12 pb-20">
                    {/* Brand section */}
                    <div className="lg:col-span-2 flex flex-col space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="relative w-10 h-10 bg-white/5 rounded-full p-2 border border-white/10">
                                <Image
                                    src="/logo-transparent.png"
                                    alt="Olleey Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-white text-2xl font-normal tracking-[-0.03em] font-sans">
                                olleey.com
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed font-sans max-w-sm">
                            Platform to expand your reach in your own voice. Automated content localization and distribution engine.
                        </p>

                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">System Status</span>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className={`w-1 h-3 ${i < 7 ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest">Operational V1.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer link sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-zinc-300 text-[11px] font-mono font-bold uppercase tracking-[0.2em] mb-8">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href!}
                                            className="text-xs text-zinc-500 hover:text-white transition-colors font-mono flex items-center gap-2 group"
                                        >
                                            {link.label}
                                            <ExternalLink size={10} className="opacity-0 -translate-y-0.5 group-hover:opacity-40 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-12 text-[10px] font-mono text-zinc-600 uppercase tracking-widest space-y-6 md:space-y-0">
                    <div className="flex items-center gap-8">
                        <p>© {currentYear} Olleey Inc.</p>
                        <div className="hidden md:flex items-center gap-4">
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <a href="#" className="hover:text-white transition-colors">Twitter (X)</a>
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px]">UTC-8 • 14:42</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-emerald-500/80">Edge Global Sync</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Large Text Effect */}
            <div className="flex h-[20rem] md:h-[40rem] items-center justify-center -mt-32 md:-mt-64 md:-mb-48 pointer-events-none opacity-[0.03] transition-opacity hover:opacity-10 duration-1000">
                <TextHoverEffect text="OLLEEY" className="z-0 text-[20vw] font-black" />
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}
