"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Eye, Globe2, Lock, ShieldCheck } from "lucide-react";

import Footer from "@/components/LandingPage/Footer";
import SiteHeader from "@/components/ui/site-header";

const summaryCards = [
  {
    title: "What We Collect",
    description: "Account details, workspace settings, uploaded media, and service usage events needed to operate Olleey.",
    icon: Database,
  },
  {
    title: "How We Use It",
    description: "To run localization workflows, improve reliability, provide support, and meet legal and security obligations.",
    icon: ShieldCheck,
  },
  {
    title: "Who Can Access",
    description: "Only authorized staff and vetted processors supporting core features like storage, auth, and integrations.",
    icon: Eye,
  },
  {
    title: "Your Controls",
    description: "You can request data access, correction, or deletion by contacting us at privacy@olleey.com.",
    icon: Lock,
  },
];

const policySections = [
  {
    id: "scope",
    title: "1. Scope",
    paragraphs: [
      "This Privacy Policy explains how Olleey collects, uses, stores, and shares information when you use our platform and related services.",
      "By accessing Olleey, you agree to this policy and to the processing practices described below.",
    ],
  },
  {
    id: "data-collected",
    title: "2. Information We Collect",
    bullets: [
      "Account information: name, email, authentication identifiers, and workspace membership.",
      "Platform content: uploaded videos, audio tracks, transcripts, metadata, and generated localized assets.",
      "Operational data: logs, processing status, device/browser information, and usage analytics.",
      "Billing and transaction metadata handled through payment partners (we do not store full card numbers).",
    ],
  },
  {
    id: "usage",
    title: "3. How We Use Information",
    bullets: [
      "Deliver localization features including translation, dubbing, lip-sync, review, and publishing workflows.",
      "Maintain account security, prevent abuse, and detect incidents.",
      "Support customer operations and troubleshoot service issues.",
      "Comply with legal requirements and enforce platform terms.",
    ],
  },
  {
    id: "sharing",
    title: "4. Data Sharing and Processors",
    paragraphs: [
      "We share data with service providers only when needed to operate the platform. Providers are contractually required to protect your information.",
    ],
    bullets: [
      "Infrastructure and storage providers.",
      "Authentication and identity providers.",
      "AI/media processing integrations used in your workflow.",
      "Analytics and observability tools for service quality.",
    ],
  },
  {
    id: "retention",
    title: "5. Retention and Security",
    paragraphs: [
      "We retain information for as long as needed to provide services, meet legal obligations, resolve disputes, and enforce agreements.",
      "We apply technical and organizational safeguards appropriate to the sensitivity of the data we process.",
    ],
  },
  {
    id: "rights",
    title: "6. Your Rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, export, restrict, or delete personal data. You may also object to certain processing.",
      "To exercise rights requests, email privacy@olleey.com. We may need to verify your identity before fulfilling requests.",
    ],
  },
  {
    id: "transfers",
    title: "7. International Transfers",
    paragraphs: [
      "If data is transferred across regions, we use appropriate safeguards required by applicable law.",
    ],
  },
  {
    id: "updates",
    title: "8. Policy Updates",
    paragraphs: [
      "We may update this policy to reflect product, legal, or operational changes. The latest version will always be published on this page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.1] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px]" />

      <SiteHeader />

      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-16 pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-6xl leading-[0.95] tracking-tight text-zinc-900 dark:text-zinc-100">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl">
            This policy explains what information we process, why we process it, and how you can manage your data when using Olleey.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 px-4 py-2 text-xs text-zinc-600 dark:text-zinc-300">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Last updated: February 16, 2026</span>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/75 dark:bg-zinc-950/60 p-5"
              >
                <div className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{card.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-16 pb-14">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/75 dark:bg-zinc-950/60 p-6 md:p-8 lg:p-10 space-y-8">
          {policySections.map((section, index) => (
            <motion.article
              id={section.id}
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              className="border-b border-zinc-200 dark:border-white/10 last:border-b-0 pb-7 last:pb-0"
            >
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {section.title}
              </h3>

              {section.paragraphs && (
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((text) => (
                    <p key={text} className="text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {text}
                    </p>
                  ))}
                </div>
              )}

              {section.bullets && (
                <ul className="mt-3 space-y-2 text-sm md:text-base text-zinc-700 dark:text-zinc-300">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.article>
          ))}

          <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/60 px-5 py-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Privacy requests and questions:{" "}
              <a href="mailto:privacy@olleey.com" className="font-medium underline underline-offset-2 hover:opacity-80">
                privacy@olleey.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
