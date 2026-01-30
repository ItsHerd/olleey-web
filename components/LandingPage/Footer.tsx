import Link from "next/link";
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Twitter,
    Dribbble,
    Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/hover-footer";

export default function Footer({ onGetStarted }: { onGetStarted?: () => void }) {
    const currentYear = new Date().getFullYear();

    // Footer link data
    const footerLinks = [
        {
            title: "PLATFORM",
            links: [
                { label: "Join Today", onClick: onGetStarted },
                { label: "Engine", href: "#workflows" },
                { label: "Studio", href: "#product" },
                { label: "Distribution", href: "#distribution" },
            ],
        },
        {
            title: "CORPORATE",
            links: [
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Legal", href: "#" },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={14} className="text-white" />,
            text: "hello@olleey.com",
            href: "mailto:hello@olleey.com",
        },
        {
            icon: <Phone size={14} className="text-white" />,
            text: "+1 (555) 000-0000",
            href: "tel:+15550000000",
        },
        {
            icon: <MapPin size={14} className="text-white" />,
            text: "San Francisco, CA",
        },
    ];

    // Social media icons
    const socialLinks = [
        { icon: <Twitter size={16} />, label: "Twitter", href: "#" },
        { icon: <Globe size={16} />, label: "Web", href: "#" },
    ];

    return (
        <footer className="bg-black relative border-t border-white/10 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto p-8 md:p-14 z-40 relative"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12 border-b border-white/10 mb-12">
                    {/* Brand section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white flex items-center justify-center">
                                <div className="w-4 h-4 bg-black" />
                            </div>
                            <span className="text-white text-xl font-bold font-mono tracking-widest">OLLEEY</span>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed font-mono max-w-xs">
                            Automated content localization and distribution engine.
                            <br /><span className="text-white/50">// V1.0.0 RELEASE</span>
                        </p>
                    </div>

                    {/* Footer link sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-white text-[10px] font-mono font-bold uppercase tracking-widest mb-6 border-l-2 border-white/20 pl-2">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label} className="relative">
                                        {link.onClick ? (
                                            <button
                                                onClick={link.onClick}
                                                className="text-xs text-stone-400 hover:text-white transition-colors font-mono hover:pl-2 duration-200 text-left w-full"
                                            >
                                                <span className="mr-1 opacity-0 hover:opacity-100 transition-opacity">&gt;</span> {link.label}
                                            </button>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-xs text-stone-400 hover:text-white transition-colors font-mono hover:pl-2 duration-200"
                                            >
                                                <span className="mr-1 opacity-0 hover:opacity-100 transition-opacity">&gt;</span> {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact section */}
                    <div>
                        <h4 className="text-white text-[10px] font-mono font-bold uppercase tracking-widest mb-6 border-l-2 border-white/20 pl-2">
                            SYSTEM_CONTACT
                        </h4>
                        <ul className="space-y-4">
                            {contactInfo.map((item, i) => (
                                <li key={i} className="flex items-center space-x-3">
                                    <div className="p-1.5 border border-white/20">
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
                                        <span className="text-xs text-stone-400 hover:text-white transition-colors font-mono">
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
                    <div className="flex space-x-6">
                        {socialLinks.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="hover:text-white transition-colors border border-white/10 p-2 hover:bg-white hover:text-black"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-center md:text-left">
                        [ SYS.TIME: {currentYear} ] © OLLEEY_INC. ALL_RIGHTS_RESERVED.
                    </p>
                </div>
            </motion.div>

            {/* Text hover effect */}
            <div className="flex h-[20rem] md:h-[30rem] items-center justify-center -mt-24 md:-mt-52 md:-mb-36 pointer-events-none md:pointer-events-auto">
                <TextHoverEffect text="OLLEEY" className="z-50 text-[15vw] md:text-[10rem]" />
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}
