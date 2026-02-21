"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Handshake,
  Languages,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import SiteHeader from "@/components/ui/site-header";
import Footer from "@/components/LandingPage/Footer";

const principles = [
  {
    title: "Voice Integrity",
    description:
      "Every localization should preserve intent, tone, and identity so creators and teams are represented authentically.",
    icon: Languages,
  },
  {
    title: "Responsible Distribution",
    description:
      "Quality and safety checks should happen before content is distributed, not after issues appear in-market.",
    icon: ShieldCheck,
  },
  {
    title: "Global Access",
    description:
      "Knowledge, stories, and ideas should not be limited by language barriers or publishing complexity.",
    icon: Globe2,
  },
];

const commitments = [
  {
    title: "Protect authenticity across languages",
    detail:
      "We design for translation quality that keeps original meaning and creator identity intact across every localized version.",
  },
  {
    title: "Make quality visible and accountable",
    detail:
      "We expose guardrails and review checkpoints so teams can approve content with confidence, not guesswork.",
  },
  {
    title: "Reduce friction to global storytelling",
    detail:
      "We simplify workflows so multilingual publishing is practical for small teams and large organizations alike.",
  },
  {
    title: "Build for long-term trust",
    detail:
      "Reliability, transparency, and user control guide product decisions across every part of the platform.",
  },
];

const impact = [
  {
    title: "Education Without Language Limits",
    description:
      "Training, tutorials, and educational content can reach broader communities in formats people understand natively.",
    icon: Users,
  },
  {
    title: "More Inclusive Global Conversation",
    description:
      "Local voices and perspectives can travel further while retaining context and cultural nuance.",
    icon: Handshake,
  },
  {
    title: "Higher Quality At Global Scale",
    description:
      "Teams can expand distribution without sacrificing review standards, clarity, or consistency.",
    icon: CheckCircle2,
  },
];

export default function MissionPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#07080b] text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <SiteHeader />

      <section className="relative z-10 pt-32 md:pt-40 pb-14 md:pb-20 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Our Mission</span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight font-semibold">
              Help every story travel
              <br className="hidden md:block" />
              with its meaning intact.
            </h1>
            <p className="mt-6 text-base md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Olleey exists to remove language barriers without removing identity. We are building infrastructure that makes multilingual publishing trustworthy, clear, and accessible.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Start with Olleey
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => router.push("/enterprise")}
                className="inline-flex items-center justify-center rounded-full border border-black/15 dark:border-white/15 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Visit enterprise page
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-12 md:py-14 border-y border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#0b0c11] px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0f1117] p-3">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
              <Image
                src="/images/worlds.png"
                alt="Global reach illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">Global reach, local relevance</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">We want high-quality stories to move across borders without losing context.</p>
          </article>

          <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0f1117] p-3">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
              <Image
                src="/images/photo1.png"
                alt="Team collaboration visual"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">Built for real teams</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Creators, operators, and reviewers can collaborate around one trusted workflow.</p>
          </article>
        </div>
      </section>

      <section className="relative z-10 py-16 md:py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10">
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">Principles</p>
            <h2 className="mt-3 text-3xl md:text-5xl tracking-tight font-semibold">How we make decisions</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.06 * index }}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0e13] p-6"
                >
                  <div className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 md:py-20 border-y border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#0b0c11] px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2">
              <Languages className="w-4 h-4" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">Commitments</p>
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl tracking-tight font-semibold">What we commit to</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commitments.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 * index }}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0f1117] p-6 md:p-7"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  Commitment {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 md:py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">Global Impact</p>
            <h2 className="mt-3 text-3xl md:text-5xl tracking-tight font-semibold">The change we want to enable</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impact.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.06 * index }}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0e13] p-6"
                >
                  <div className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer onGetStarted={() => router.push("/register")} />
    </main>
  );
}
