"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, Languages, Moon, ShieldCheck, Sparkles, Sun, Users, Handshake, TrendingUp } from "lucide-react";
import { useThemeContext } from "@/lib/ThemeContext";
import Footer from "@/components/LandingPage/Footer";

const principles = [
  {
    title: "Meaning First",
    description:
      "Localization should preserve intent, tone, and context, not just words.",
    icon: Languages,
  },
  {
    title: "Human Control",
    description:
      "Automation should accelerate teams while keeping clear review and approval gates.",
    icon: ShieldCheck,
  },
  {
    title: "Global By Default",
    description:
      "Publishing in multiple languages should be standard for every release.",
    icon: Globe2,
  },
];

const commitments = [
  {
    title: "Protect creator voice and identity",
    detail:
      "We design every step to preserve tone, emotion, and storytelling intent so localized versions still feel like the original creator, not a generic translation.",
  },
  {
    title: "Compress timelines from days to minutes",
    detail:
      "We automate repetitive production work so teams can go from upload to localized review quickly, ship faster, and stay consistent across releases.",
  },
  {
    title: "Make quality standards visible and enforceable",
    detail:
      "Our guardrails expose confidence, safety, and compliance signals before publish so teams can review with clarity and avoid silent quality regressions.",
  },
  {
    title: "Keep global publishing accessible",
    detail:
      "We build for lean teams as well as large organizations, with workflows that scale without adding operational complexity or requiring localization specialists.",
  },
];

const globalImpact = [
  {
    title: "More Voices, More Access",
    description:
      "People can access educational, cultural, and practical content in their native language instead of being excluded by default.",
    icon: Users,
  },
  {
    title: "Cultural Exchange At Scale",
    description:
      "Creators can share local stories globally while preserving context and meaning, helping regions understand each other better.",
    icon: Handshake,
  },
  {
    title: "Economic Opportunity",
    description:
      "Small teams and independent creators can enter new markets without the cost and delay of traditional localization pipelines.",
    icon: TrendingUp,
  },
];

export default function MissionPage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeContext();

  return (
    <main className="relative min-h-screen bg-[#FAFAFA] dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.1] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Background Image Overlay */}
      <div
        className="fixed top-0 bottom-0 right-0 z-0 w-full md:w-1/2 bg-no-repeat bg-right opacity-30 dark:opacity-40 pointer-events-none bg-contain md:bg-[length:auto_100%]"
        style={{ backgroundImage: `url('https://store-images.s-microsoft.com/image/apps.22527.14241444633392716.d6c44b65-031f-4f2a-851c-57ad619710a4.56f38a83-7224-4d82-8eec-6a52ab513be9?h=1280')` }}
      />

      <header className="fixed top-0 left-0 right-0 z-50 p-4 lg:py-4 lg:px-10 transition-colors duration-300 pointer-events-none bg-[#FAFAFA]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-10 xl:gap-14">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-black dark:bg-white flex items-center justify-center">
                  <Image
                    src="/favicon/android-chrome-192x192.png"
                    alt="Olleey Logo"
                    fill
                    className="object-cover p-[5px] invert dark:invert-0"
                  />
                </div>
                <span className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
                  olleey.
                </span>
              </Link>

              {/* Center: Nav Links */}
              <div className="hidden lg:flex items-center gap-8">
                <Link href="/#showcase" className="text-[15px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                  Product
                </Link>
                <Link href="/#workflow-stages" className="text-[15px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                  Workflows
                </Link>
                <Link href="/mission" className="text-[15px] font-medium text-black dark:text-white transition-colors">
                  Mission
                </Link>
                <Link href="/#faq" className="text-[15px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-black" />}
              </button>

              <button
                onClick={() => router.push('/register')}
                className="hidden lg:block text-[15px] font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
              >
                Get started
              </button>

              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[15px] font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-all"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px] pt-40 pb-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-5">Olleey Mission</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.04em] mb-8">
            We build the global
            <br />
            publishing layer for
            <br />
            modern creators.
          </h1>
          <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
            Teams should not have to choose between speed and quality. Olleey exists to make multilingual distribution as simple as pressing publish once.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start with Olleey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-10">
        <div className="grid md:grid-cols-3 gap-4">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.45 }}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 p-6"
              >
                <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 p-8 md:p-10"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              What We Commit To
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {commitments.map((item, index) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/50 p-5"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-2">
                  Commitment 0{index + 1}
                </p>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 p-8 md:p-10"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">
            Global Impact
          </p>
          <h2 className="text-3xl md:text-5xl tracking-tight mb-8">
            The impact this can have on the world
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {globalImpact.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/50 p-5"
                >
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
                    <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <Footer onGetStarted={() => router.push("/register")} />
    </main>
  );
}
