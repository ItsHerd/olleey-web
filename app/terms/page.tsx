"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ban, FileCheck2, Gavel, Globe2, Shield } from "lucide-react";

import Footer from "@/components/LandingPage/Footer";
import SiteHeader from "@/components/ui/site-header";

const summaryCards = [
  {
    title: "Account and Eligibility",
    description: "You must provide accurate account information and be authorized to use any connected channels and content.",
    icon: FileCheck2,
  },
  {
    title: "Acceptable Use",
    description: "Use the platform lawfully and avoid prohibited content, abuse, security bypass, or unauthorized automation.",
    icon: Ban,
  },
  {
    title: "Ownership and Licensing",
    description: "You keep ownership of your content and grant Olleey limited rights to process it to provide the service.",
    icon: Shield,
  },
  {
    title: "Liability and Changes",
    description: "The service is provided under defined limits of liability, and terms may be updated as the product evolves.",
    icon: Gavel,
  },
];

const termsSections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms of Service govern your use of Olleey and related services. By creating an account or using the platform, you agree to these terms.",
      "If you do not agree, you must stop using the service.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility and Accounts",
    bullets: [
      "You must have authority to create an account and use connected channels, assets, and integrations.",
      "You are responsible for account credentials and all activity under your account.",
      "You must provide accurate and current information.",
    ],
  },
  {
    id: "services",
    title: "3. Service Description",
    paragraphs: [
      "Olleey provides workflow tools for video localization and distribution, including translation, dubbing, lip-sync, quality review, and publishing controls.",
    ],
  },
  {
    id: "responsibilities",
    title: "4. User Responsibilities",
    bullets: [
      "Comply with applicable laws, platform policies, and third-party terms.",
      "Ensure you have rights to upload and process submitted content.",
      "Do not use Olleey to create or distribute unlawful, deceptive, or infringing content.",
      "Do not attempt to interfere with platform security or service reliability.",
    ],
  },
  {
    id: "ip",
    title: "5. Content and Intellectual Property",
    paragraphs: [
      "You retain ownership of your original content. You grant Olleey a limited, non-exclusive license to host, process, and transform content solely to provide the service.",
      "Olleey retains ownership of its software, models, product design, and platform IP.",
    ],
  },
  {
    id: "third-parties",
    title: "6. Third-Party Services",
    paragraphs: [
      "Olleey integrates with third-party services (such as channel platforms, storage, and AI providers). Your use of these integrations may be subject to separate third-party terms.",
    ],
  },
  {
    id: "billing",
    title: "7. Fees and Billing",
    paragraphs: [
      "Paid features, if applicable, are billed according to your selected plan. You authorize applicable charges and are responsible for taxes and related fees unless otherwise stated.",
    ],
  },
  {
    id: "termination",
    title: "8. Suspension and Termination",
    paragraphs: [
      "We may suspend or terminate access for violations of these terms, legal risk, abuse, or security threats. You may stop using the service at any time.",
    ],
  },
  {
    id: "disclaimer",
    title: "9. Disclaimers",
    paragraphs: [
      "The service is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted service, specific output quality, or universal availability of third-party integrations.",
    ],
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, Olleey is not liable for indirect, incidental, special, consequential, or punitive damages arising from platform use.",
    ],
  },
  {
    id: "updates",
    title: "11. Changes to Terms",
    paragraphs: [
      "We may update these terms to reflect product and legal changes. Continued use after updates means you accept the revised terms.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact",
    paragraphs: [
      "For legal questions about these terms, contact legal@olleey.com.",
    ],
  },
];

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl">
            These terms define the agreement between you and Olleey when using our platform, features, and integrations.
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
          {termsSections.map((section, index) => (
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
              Legal questions:{" "}
              <a href="mailto:legal@olleey.com" className="font-medium underline underline-offset-2 hover:opacity-80">
                legal@olleey.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
