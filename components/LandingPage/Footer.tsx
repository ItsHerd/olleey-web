import Link from "next/link";
import Image from "next/image";
import {
    Mail,
    MapPin,
    Twitter,
    Globe,
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
                { label: "Workflows", href: "#workflows" },
                { label: "Product", href: "#product" },
                { label: "Pricing", href: "#pricing" },
                { label: "Global Launch", href: "#distribution" },
            ],
        },
        {
            title: "CORPORATE",
            links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={14} className="text-olleey-yellow" />,
            text: "hello@olleey.com",
            href: "mailto:hello@olleey.com",
        },
        {
            icon: <MapPin size={14} className="text-olleey-yellow" />,
            text: "San Francisco, CA",
        },
    ];

    // Social media icons
    const socialLinks = [
        { icon: <Twitter size={16} />, label: "Twitter", href: "#" },
        { icon: <Globe size={16} />, label: "Web", href: "#" },
    ];

    return (
        <footer className="bg-black relative border-t border-olleey-yellow/20 overflow-hidden">
            {/* Background Grid with subtle gold tint */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(238,184,104,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(238,184,104,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Gold radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-olleey-yellow/5 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto p-8 md:p-14 z-10 relative"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12 border-b border-white/10 mb-12">
                    {/* Brand section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/images/translogowhite.png"
                                    alt="Olleey Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-white text-xl font-bold font-mono tracking-widest group">
                                OLL<span className="text-olleey-yellow">EEY</span>
                            </span>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed font-mono max-w-xs">
                            Automated content localization and distribution engine.
                            <br /><span className="text-olleey-yellow/50 tracking-widest font-black uppercase text-[9px]">// V1.0.0 RELEASE</span>
                        </p>
                    </div>

                    {/* Footer link sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-white text-[10px] font-mono font-bold uppercase tracking-widest mb-6 border-l-2 border-olleey-yellow pl-2">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label} className="relative">
                                        <Link
                                            href={link.href!}
                                            className="text-xs text-stone-400 hover:text-olleey-yellow transition-all font-mono hover:pl-2 duration-200 block"
                                        >
                                            <span className="mr-1 opacity-0 hover:opacity-100 transition-opacity text-olleey-yellow">&gt;</span> {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact section */}
                    <div>
                        <h4 className="text-white text-[10px] font-mono font-bold uppercase tracking-widest mb-6 border-l-2 border-olleey-yellow pl-2">
                            SYSTEM_CONTACT
                        </h4>
                        <ul className="space-y-4">
                            {contactInfo.map((item, i) => (
                                <li key={i} className="flex items-center space-x-3 group">
                                    <div className="p-1.5 border border-white/10 group-hover:border-olleey-yellow/50 transition-colors">
                                        {item.icon}
                                    </div>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className="text-xs text-stone-400 hover:text-white transition-colors font-mono"
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-stone-400 font-mono">
                                            {item.text}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs font-mono text-stone-500 space-y-4 md:space-y-0">
                    {/* Social icons */}
                    <div className="flex space-x-4">
                        {socialLinks.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-stone-400 hover:text-black hover:bg-olleey-yellow hover:border-olleey-yellow transition-all duration-300"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-center md:text-left text-[10px] tracking-tight opacity-50 uppercase">
                        [ SYS.TIME: {currentYear} ] © OLLEEY_INC. <span className="text-olleey-yellow/50">ARCHITECTED FOR GLOBAL GROWTH.</span>
                    </p>
                </div>
            </motion.div>

            {/* Premium Text hover effect with gold stroke */}
            <div className="flex h-[20rem] md:h-[30rem] items-center justify-center -mt-24 md:-mt-52 md:-mb-36 pointer-events-none md:pointer-events-auto opacity-20">
                <TextHoverEffect text="OLLEEY" className="z-50 text-[15vw] md:text-[10rem]" />
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}
