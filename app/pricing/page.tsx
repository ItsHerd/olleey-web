"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import SiteHeader from "@/components/ui/site-header";
import Footer from "@/components/LandingPage/Footer";
import { PricingCalculator } from "@/components/LandingPage/PricingCalculator";

const planHighlights = [
  "Transparent monthly pricing bands",
  "Scales from individual creators to enterprise teams",
  "Quality guardrails and review controls included",
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#07080b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <SiteHeader />

      <section className="pt-32 md:pt-40 px-6 pb-10 md:pb-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Pricing</p>
            <h1 className="mt-3 text-4xl md:text-6xl leading-[0.95] tracking-tight font-semibold">
              Predictable pricing for global video distribution.
            </h1>
            <p className="mt-5 text-base md:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              Choose the usage band that fits your release volume and scale as your multilingual pipeline grows.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {planHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <PricingCalculator onGetStarted={() => router.push("/register")} />
      </section>

      <Footer onGetStarted={() => router.push("/register")} />
    </main>
  );
}
