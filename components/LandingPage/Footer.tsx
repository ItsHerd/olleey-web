"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin, Linkedin } from "lucide-react";
import { supabaseHelpers } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Footer({
  onGetStarted,
  showContactSection = false,
}: {
  onGetStarted?: () => void;
  showContactSection?: boolean;
}) {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await supabaseHelpers.sendContactMessage(formData);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      toast("Message sent successfully! We will get back to you soon.", "success");
      window.setTimeout(() => setIsSubmitted(false), 6000);
    } catch (error: any) {
      const message = error?.message || "Failed to send message. Please try again.";
      setFormError(message);
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { label: "Workflows", href: "/#distribution" },
        { label: "Product", href: "/#product" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Enterprise", href: "/enterprise" },
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
    <>
      <footer className="relative border-t border-white/10 bg-black transition-colors duration-300 overflow-hidden">
        {showContactSection && (
          <div id="contact" className="relative z-10">
            <div className="mx-auto max-w-[1600px] px-6 lg:px-16 py-12 md:py-14">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Contact</p>
                  <h3 className="mt-3 text-3xl md:text-4xl tracking-tight font-semibold text-zinc-100">
                    Talk to the Olleey team
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-zinc-300 max-w-md leading-relaxed">
                    Share your use case and we will help you design the right multilingual workflow.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  {isSubmitted ? (
                    <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
                      <p className="text-lg font-semibold text-zinc-100">Thanks. We got your message.</p>
                      <p className="mt-2 text-sm text-zinc-400">Our team will reach out shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="grid gap-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                          className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                          className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                        placeholder="How can we help?"
                        className="rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                      {formError && <p className="text-xs text-red-400">{formError}</p>}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-white text-black text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                      >
                        {isSubmitting ? "Sending..." : "Send message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-16 py-14 md:py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 max-w-xl">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl border border-white/15 bg-white/10 p-2.5">
                  <Image src="/favicon/android-chrome-192x192.png" alt="Olleey Logo" fill className="object-contain" />
                </div>
                <span className="text-4xl md:text-5xl leading-none tracking-tight font-semibold text-zinc-100">olleey</span>
              </div>

              <p className="mt-5 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Build multilingual distribution pipelines that preserve creator voice, improve quality, and accelerate global publishing.
              </p>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@olleey.com" className="hover:text-zinc-100 transition-colors">
                    hello@olleey.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <MapPin className="w-4 h-4" />
                  <span>Seattle, WA</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-wrap gap-10 md:gap-12">
              {footerLinks.map((section) => (
                <div key={section.title} className="min-w-[140px]">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-6">
              {onGetStarted ? (
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <a
                href="https://www.linkedin.com/company/olleeylabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2.5 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-300 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400">
            <p>© {currentYear} Olleey Inc.</p>
            <p>Built for global creators.</p>
          </div>
        </motion.div>
      </footer>
    </>
  );
}
