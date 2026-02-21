"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, Layers3, Sparkles, TrendingUp, Workflow } from "lucide-react";

import SiteHeader from "@/components/ui/site-header";
import Footer from "@/components/LandingPage/Footer";

const foundationalBlocks = [
  {
    title: "Built for scale",
    description:
      "Unify detection, localization, review, and publishing into a single operational system.",
    icon: Layers3,
  },
  {
    title: "Powered by people + AI",
    description:
      "Automation handles repetitive processing while teams stay in control of critical approval points.",
    icon: Boxes,
  },
  {
    title: "Designed for repeatability",
    description:
      "Create consistent release motion across regions with clear ownership, quality checks, and routing.",
    icon: TrendingUp,
  },
];

const workflowSurfaces = [
  {
    title: "Make localization operations self-driving",
    description:
      "Turn incoming uploads and market requests into structured workflows that are routed, reviewed, and published by the right team.",
    step: "1.0 Intake",
    image: "/herodashboard.png",
    imageAlt: "Enterprise workflow intake",
  },
  {
    title: "Define and execute release direction",
    description:
      "Plan launches by language and channel, align stakeholders around milestones, and move from strategy to distribution without fragmentation.",
    step: "2.0 Plan",
    image: "/herodashboard.png",
    imageAlt: "Enterprise release planning",
  },
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#07080b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <SiteHeader />

      <section className="pt-32 md:pt-40 px-6 pb-10 md:pb-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Enterprise</p>
            <h1 className="mt-3 text-4xl md:text-6xl leading-[0.95] tracking-tight font-semibold">
              One asset. Multiple markets. No additional headcount.
            </h1>
            <p className="mt-5 text-base md:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              Purpose-built for teams running high-volume global releases with strict quality and governance standards.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:enterprise@olleey.com?subject=Book%20an%20Enterprise%20Demo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-white/15 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {foundationalBlocks.map((block, index) => {
              const Icon = block.icon;
              return (
                <motion.article
                  key={block.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.05 * index }}
                  className="py-10 md:py-12 px-0 md:px-8"
                >
                  <div className="h-36 rounded-xl border border-black/10 dark:border-white/10 bg-transparent flex items-center justify-center">
                    <Icon className="w-16 h-16 text-zinc-500 dark:text-zinc-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{block.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{block.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {workflowSurfaces.map((surface, index) => (
        <section
          key={surface.step}
          className=""
        >
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-5"
              >
                <h2 className="text-3xl md:text-5xl leading-[0.98] tracking-tight font-semibold">
                  {surface.title}
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="lg:col-span-7"
              >
                <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  {surface.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                  <Workflow className="w-3.5 h-3.5" />
                  {surface.step}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-8 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0c0d12] p-3"
            >
              <div className="h-8 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#101117] flex items-center px-3">
                <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                  Enterprise surface {index + 1}
                </span>
              </div>
              <div className="relative mt-3 aspect-[16/8] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                <Image src={surface.image} alt={surface.imageAlt} fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      <section className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0e13] p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Trusted workflow</p>
              <h3 className="mt-2 text-3xl md:text-4xl tracking-tight font-semibold">
                Built for teams shipping into multiple markets every week.
              </h3>
              <p className="mt-3 text-sm md:text-base text-zinc-600 dark:text-zinc-300 max-w-3xl">
                Coordinate teams, enforce quality standards, and keep release velocity high without fragmenting your process.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="mailto:enterprise@olleey.com?subject=Book%20an%20Enterprise%20Demo"
                className="inline-flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Book a demo
              </a>
              <Link
                href="/mission"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-white/15 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Read our mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
