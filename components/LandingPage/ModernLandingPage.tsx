"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Zap,
  Shield,
  Play,
  Check,
  Star,
  Sparkles,
  Video,
  Languages,
  TrendingUp
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface ModernLandingPageProps {
  onNavigation: () => void;
}

export default function ModernLandingPage({ onNavigation }: ModernLandingPageProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Reach audiences in 40+ languages with AI-powered dubbing and translation"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process and publish videos in minutes, not days"
    },
    {
      icon: Shield,
      title: "Studio Quality",
      description: "Maintain your voice, tone, and personality across all languages"
    }
  ];

  const stats = [
    { value: "40+", label: "Languages" },
    { value: "10x", label: "Faster" },
    { value: "95%", label: "Accuracy" },
    { value: "10M+", label: "Videos Processed" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      company: "TechVlog",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      quote: "Olleey helped us reach 5M new viewers across Europe and Asia. Game changer."
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Marketing",
      company: "EduTech Inc",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      quote: "We doubled our international engagement in just 2 months. Incredible ROI."
    },
    {
      name: "Yuki Tanaka",
      role: "YouTube Creator",
      company: "Cooking Channel",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
      quote: "The voice cloning is so natural, my viewers can't tell it's AI-dubbed."
    }
  ];

  const trustedCompanies = [
    "Stripe", "Notion", "Linear", "Vercel", "Retool", "Figma"
  ];

  return (
    <div className="min-h-screen bg-[#e8e8e8] dark:bg-black text-black dark:text-white overflow-hidden">
      <SEO
        title="Olleey | Scale Your Content Globally with AI"
        description="Transform your content for global audiences. AI-powered dubbing, translation, and distribution in 40+ languages."
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#EEB868] to-[#e8a84e] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">Olleey</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#product" className="text-sm font-medium hover:text-[#EEB868] transition-colors">Product</a>
              <a href="#features" className="text-sm font-medium hover:text-[#EEB868] transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-[#EEB868] transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium hover:text-[#EEB868] transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-medium hover:text-[#EEB868] transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:scale-105 transition-transform"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#EEB868]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-black/5 dark:border-white/10 mb-8"
          >
            <Star className="w-4 h-4 text-[#EEB868]" fill="#EEB868" />
            <span className="text-sm font-medium">Used by 10,000+ creators worldwide</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-tight"
          >
            Scale your content
            <br />
            <span className="bg-gradient-to-r from-[#EEB868] to-[#d4924d] bg-clip-text text-transparent">
              globally
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-black/60 dark:text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered dubbing and translation that sounds like you.
            Reach billions in their native language.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => router.push("/register")}
              className="group px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-lg font-semibold hover:scale-105 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push("#demo")}
              className="group px-8 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-xl text-lg font-semibold hover:bg-white/70 dark:hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 flex items-center justify-center gap-8 flex-wrap"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-black/50 dark:text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-medium text-black/40 dark:text-white/40 mb-8 uppercase tracking-wider">
            Trusted by teams at
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            {trustedCompanies.map((company, index) => (
              <div key={index} className="text-2xl font-bold">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Everything you need to
              <br />
              <span className="text-[#EEB868]">go global</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto"
            >
              Professional dubbing, translation, and distribution in one seamless workflow
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 hover:border-[#EEB868]/50 transition-all hover:shadow-2xl"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#EEB868] to-[#d4924d] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-black/60 dark:text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 bg-white dark:bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-center mb-20"
          >
            Loved by creators
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-[#e8e8e8] dark:bg-black rounded-3xl border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#EEB868]" fill="#EEB868" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-black/50 dark:text-white/50">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-16 bg-gradient-to-br from-black to-gray-900 dark:from-white dark:to-gray-100 rounded-[3rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white dark:text-black">
                Ready to go global?
              </h2>
              <p className="text-xl text-white/80 dark:text-black/70 mb-8 max-w-2xl mx-auto">
                Join thousands of creators reaching billions of viewers worldwide
              </p>
              <button
                onClick={() => router.push("/register")}
                className="px-8 py-4 bg-[#EEB868] hover:bg-[#d4924d] text-black rounded-xl text-lg font-semibold hover:scale-105 transition-all shadow-xl"
              >
                Start free trial
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#EEB868] to-[#e8a84e] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">Olleey</span>
              </div>
              <p className="text-sm text-black/50 dark:text-white/50">
                Scale your content globally with AI-powered dubbing
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-black/60 dark:text-white/60">
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-black/60 dark:text-white/60">
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-black/60 dark:text-white/60">
                <li><a href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-black/50 dark:text-white/50">
              © 2024 Olleey. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
