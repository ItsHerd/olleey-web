"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Globe2, Languages, Rocket, ShieldCheck } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Detect New Uploads",
    description:
      "Olleey watches your connected channel and detects newly published videos automatically.",
    icon: Globe2,
  },
  {
    id: "02",
    title: "Choose Languages & Mode",
    description:
      "Select one or multiple target languages and choose dubbing or lip-sync before processing starts.",
    icon: Languages,
  },
  {
    id: "03",
    title: "Process With Guardrails",
    description:
      "Transcription, translation, dubbing, and quality checks run in one pipeline with your guardrails applied.",
    icon: ShieldCheck,
  },
  {
    id: "04",
    title: "Review & Approve",
    description:
      "Review localized metadata, thumbnails, and final output. Approve when it matches your quality bar.",
    icon: CheckCircle2,
  },
  {
    id: "05",
    title: "Publish Globally",
    description:
      "Send approved versions to your selected channels as drafts or ready-to-publish releases.",
    icon: Rocket,
  },
];

export const GlobalLifecycle = () => {
  return (
    <section
      id="distribution"
      className="py-24 lg:py-28 bg-white dark:bg-[#141414] border-t border-black/5 dark:border-white/5 relative z-10 overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px] relative z-10">
        <div className="mb-14 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
              The Workflow
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-4xl md:text-6xl leading-[1.05] tracking-tight text-black dark:text-white"
          >
            How It Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-3xl text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed"
          >
            A simple five-step system from upload detection to global publishing, built for speed,
            quality, and control.
          </motion.p>
        </div>

        <div className="relative">
          <div className="hidden xl:block absolute top-7 left-12 right-12 h-px border-t border-dashed border-black/20 dark:border-white/20 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.06 * index }}
                  className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/60 p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full text-[10px] font-mono tracking-[0.18em] uppercase border border-black/20 dark:border-white/20 text-black/70 dark:text-white/70">
                      {step.id}
                    </span>
                    <div className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-black/70 dark:text-white/80" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-black dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {step.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
