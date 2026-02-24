"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";

import SiteHeader from "@/components/ui/site-header";
import Footer from "@/components/LandingPage/Footer";

export default function ContactPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#141414] text-black dark:text-white font-sans transition-colors duration-300">
      <SiteHeader />

      <section className="relative z-10 pt-32 md:pt-40 pb-16 md:pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0f0f0f] p-8 md:p-10"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">Contact</p>
            <h1 className="mt-3 text-4xl md:text-6xl tracking-tight font-semibold">
              Talk to the Olleey team
            </h1>
            <p className="mt-4 text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
              Reach out for product walkthroughs, enterprise onboarding, or partnership discussions.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <a href="mailto:hello@olleey.com" className="mt-2 inline-block text-neutral-700 dark:text-neutral-200 hover:underline">
                  hello@olleey.com
                </a>
              </div>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Headquarters
                </div>
                <p className="mt-2 text-neutral-700 dark:text-neutral-200">Seattle, WA</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/enterprise"
                className="inline-flex items-center justify-center rounded-full border border-black/15 dark:border-white/15 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Explore enterprise
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer onGetStarted={() => router.push("/register")} />
    </main>
  );
}
