"use client";

import React from "react";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Plan = {
  id: "pro" | "studio" | "enterprise";
  name: string;
  price: number | null;
  priceLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  cta: string;
  ctaHref?: string;
};

const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    price: 149,
    priceLabel: "/month",
    icon: Zap,
    tagline: "For creators scaling into additional language markets.",
    highlight: false,
    features: [
      "120 minutes of synchronized 4K output",
      "Automated publishing pipeline",
      "Speech transcription & translation",
      "Voice synthesis with tone alignment",
      "Lip synchronization & facial motion",
      "YouTube Multi-Language Audio tracks",
      "Up to 10 target languages",
      "Standard support",
    ],
    cta: "Get started",
  },
  {
    id: "studio",
    name: "Studio",
    price: 499,
    priceLabel: "/month",
    icon: Globe,
    tagline: "For high-volume studios managing multi-channel distribution.",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Pro",
      "Higher volume processing",
      "Multi-channel publishing management",
      "Regional sponsor swap automation",
      "Priority processing queue",
      "Up to 30 target languages",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    cta: "Get started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceLabel: "Custom pricing",
    icon: ShieldCheck,
    tagline: "For organizations with large-scale video libraries and compliance needs.",
    highlight: false,
    features: [
      "Everything in Studio",
      "Direct API integration",
      "LMS deployment support",
      "Compliance & audit controls",
      "Custom minute limits",
      "Unlimited target languages",
      "Dedicated account support",
      "SLA guarantees",
    ],
    cta: "Talk to sales",
    ctaHref: "mailto:enterprise@olleey.com?subject=Enterprise%20Inquiry",
  },
];

export function PricingCalculator({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onGetStarted={onGetStarted} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        All plans include a 14-day free trial. No credit card required to start.
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  onGetStarted,
}: {
  plan: Plan;
  onGetStarted: () => void;
}) {
  const Icon = plan.icon;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 md:p-7 transition-all ${
        plan.highlight
          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-xl"
          : "border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0e13]"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ${
              plan.highlight
                ? "bg-white text-black dark:bg-black dark:text-white"
                : "bg-black text-white dark:bg-white dark:text-black"
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-[11px] uppercase tracking-[0.14em] ${
              plan.highlight
                ? "text-white/60 dark:text-black/60"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {plan.name}
          </p>
        </div>
        <Icon
          className={`w-5 h-5 ${
            plan.highlight
              ? "text-white/70 dark:text-black/70"
              : "text-zinc-600 dark:text-zinc-300"
          }`}
        />
      </div>

      <div className="mt-4">
        {plan.price === null ? (
          <p
            className={`text-3xl font-semibold tracking-tight ${
              plan.highlight ? "text-white dark:text-black" : ""
            }`}
          >
            Custom
          </p>
        ) : (
          <div className="flex items-end gap-1.5">
            <p
              className={`text-5xl font-semibold tracking-tight ${
                plan.highlight ? "text-white dark:text-black" : ""
              }`}
            >
              ${plan.price}
            </p>
            <span
              className={`pb-1 text-sm ${
                plan.highlight
                  ? "text-white/60 dark:text-black/60"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              / month
            </span>
          </div>
        )}
        <p
          className={`mt-2 text-sm leading-snug ${
            plan.highlight
              ? "text-white/70 dark:text-black/70"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {plan.tagline}
        </p>
      </div>

      <div
        className={`mt-5 border-t pt-5 ${
          plan.highlight ? "border-white/15 dark:border-black/15" : "border-black/8 dark:border-white/8"
        }`}
      />

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2
              className={`mt-0.5 w-4 h-4 shrink-0 ${
                plan.highlight
                  ? "text-white/80 dark:text-black/80"
                  : "text-emerald-500"
              }`}
            />
            <span
              className={
                plan.highlight
                  ? "text-white/85 dark:text-black/85"
                  : "text-zinc-700 dark:text-zinc-200"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        {plan.ctaHref ? (
          <a
            href={plan.ctaHref}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors ${
              plan.highlight
                ? "border-white/25 dark:border-black/25 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
                : "border-black/20 dark:border-white/20 text-zinc-800 dark:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4" />
          </a>
        ) : (
          <Button
            onClick={onGetStarted}
            className={`h-11 w-full rounded-full text-sm font-medium ${
              plan.highlight
                ? "bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
                : "bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
            }`}
          >
            {plan.cta}
          </Button>
        )}
      </div>
    </div>
  );
}
