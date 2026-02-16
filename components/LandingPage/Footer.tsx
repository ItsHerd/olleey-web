"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";

export default function Footer({ onGetStarted }: { onGetStarted?: () => void }) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { label: "Workflows", href: "/#distribution" },
        { label: "Product", href: "/#product" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Mission", href: "/mission" },
        { label: "Contact", href: "/contact" },
        { label: "Support", href: "mailto:hello@olleey.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10 dark:border-black/10 bg-black dark:bg-[#FAFAFA] transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.04] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px]" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-14 md:py-16"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-white/10 dark:bg-black/10 p-2">
                <Image src="/mainlogo.png" alt="Olleey Logo" fill className="object-contain" />
              </div>
              <span className="text-xl tracking-tight text-zinc-100 dark:text-zinc-900">olleey.com</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-300 dark:text-zinc-600">
              Build multilingual distribution pipelines that preserve creator voice, improve quality, and accelerate global publishing.
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-600">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@olleey.com" className="hover:text-zinc-100 dark:hover:text-zinc-900 transition-colors">
                  hello@olleey.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-600">
                <MapPin className="w-4 h-4" />
                <span>Seattle, WA</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-10 md:gap-14">
            {footerLinks.map((section) => (
              <div key={section.title} className="min-w-[140px]">
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-300 dark:text-zinc-700 hover:text-zinc-100 dark:hover:text-zinc-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            {onGetStarted ? (
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-black text-black dark:text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-black text-black dark:text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 dark:border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <p>© {currentYear} Olleey Inc.</p>
          <p>Built for global creators.</p>
        </div>
      </motion.div>
    </footer>
  );
}
