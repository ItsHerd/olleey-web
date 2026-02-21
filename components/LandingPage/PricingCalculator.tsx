"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Zap, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tier = {
  id: "discovery" | "starter" | "creator" | "studio";
  name: string;
  price: number | null;
  maxMinutes: number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "discovery",
    name: "Discovery",
    price: 0,
    maxMinutes: 0,
    icon: Sparkles,
    subtitle: "For testing and initial setup",
    features: ["5 processing minutes", "2 target languages", "Manual workflow"],
  },
  {
    id: "starter",
    name: "Starter Hub",
    price: 29,
    maxMinutes: 60,
    icon: Zap,
    subtitle: "For teams publishing consistently",
    features: ["60 processing minutes", "5 target languages", "Automated pipeline"],
  },
  {
    id: "creator",
    name: "Creator Suite",
    price: 99,
    maxMinutes: 300,
    icon: Globe,
    subtitle: "For high-volume regional launches",
    features: ["300 processing minutes", "15 target languages", "Priority processing"],
  },
  {
    id: "studio",
    name: "Studio Fleet",
    price: null,
    maxMinutes: 99999,
    icon: ShieldCheck,
    subtitle: "For enterprise-scale operations",
    features: ["Custom minute limits", "API + advanced controls", "Dedicated support"],
  },
];

export function PricingCalculator({ onGetStarted }: { onGetStarted: () => void }) {
  const [minutes, setMinutes] = useState(60);

  const activeTier = useMemo(() => {
    if (minutes === 0) return TIERS[0];
    if (minutes <= 60) return TIERS[1];
    if (minutes <= 300) return TIERS[2];
    return TIERS[3];
  }, [minutes]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0e13] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Monthly usage</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl md:text-6xl font-semibold tracking-tight">{minutes}</span>
              <span className="pb-2 text-sm text-zinc-500 dark:text-zinc-400">minutes</span>
            </div>

            <div className="mt-7">
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full accent-black dark:accent-white"
              />
              <div className="mt-2 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>0</span>
                <span>60</span>
                <span>300</span>
                <span>500+</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <span
                  key={tier.id}
                  className={`rounded-full border px-3 py-1 text-xs ${tier.id === activeTier.id
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300"
                    }`}
                >
                  {tier.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Recommended plan</p>
                <h4 className="mt-1 text-2xl font-semibold tracking-tight">{activeTier.name}</h4>
              </div>
              <activeTier.icon className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            </div>

            <div className="mt-5">
              {activeTier.price === null ? (
                <p className="text-3xl font-semibold tracking-tight">Custom pricing</p>
              ) : (
                <div className="flex items-end gap-1.5">
                  <p className="text-4xl font-semibold tracking-tight">${activeTier.price}</p>
                  <span className="pb-1 text-sm text-zinc-500 dark:text-zinc-400">/ month</span>
                </div>
              )}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{activeTier.subtitle}</p>
            </div>

            <ul className="mt-5 space-y-2.5">
              {activeTier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={onGetStarted}
                className="h-11 rounded-full px-6 bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
              >
                Start with {activeTier.name}
              </Button>
              <a
                href="mailto:enterprise@olleey.com?subject=Custom%20Pricing"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/20 dark:border-white/20 px-5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
              >
                Custom quote
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
