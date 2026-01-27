"use client";

import { ArrowRight, ChevronDown, Plus, X, Check, Facebook, Instagram, Twitter, Linkedin, Globe, Zap, Users } from "lucide-react";
import Header from "@/components/LandingPage/Header";
import Footer from "@/components/LandingPage/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { NebulaCube } from "@/components/ui/explorations-with-gsap-and-scroll-trigger";
import { FlowchartAnimation } from "@/components/FlowchartAnimation";
import { cn } from "@/lib/utils";

function PricingCalculator({ onGetStarted }: { onGetStarted: () => void }) {
  const [minutes, setMinutes] = useState(0);

  // Calculate pricing tier based on minutes
  const getPricingTier = (mins: number) => {
    if (mins === 0) {
      return {
        name: "Free",
        price: 0,
        description: "Our free plan allows you to test the waters with basic features. Perfect for trying out our platform.",
        features: [
          "1 Language",
          "5 minutes / month",
          "Basic support"
        ]
      };
    } else if (mins <= 60) {
      return {
        name: "Starter",
        price: 29,
        description: "Perfect for growing creators looking to expand their reach to new audiences.",
        features: [
          "3 Languages",
          "60 minutes / month",
          "No watermark",
          "Email support"
        ]
      };
    } else if (mins <= 300) {
      return {
        name: "Creator",
        price: 99,
        description: "For established creators ready to dominate global markets.",
        features: [
          "10 Languages",
          "300 minutes / month",
          "No watermark",
          "Priority support",
          "Advanced analytics"
        ]
      };
    } else {
      return {
        name: "Enterprise",
        price: null,
        description: "Custom solutions for large-scale operations and creator studios.",
        features: [
          "Unlimited Languages",
          "Unlimited minutes",
          "No watermark",
          "Dedicated account manager",
          "Custom integrations",
          "SLA guarantee"
        ]
      };
    }
  };

  const tier = getPricingTier(minutes);

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-[1100px] mx-auto">
      {/* Left Side - Calculator */}
      <div className="bg-gray-50 rounded-[32px] p-8 md:p-12">
        <h3 className="text-xl md:text-2xl font-normal text-black mb-8">
          Calculate your pricing
        </h3>

        <div className="mb-8">
          <div className="text-4xl md:text-5xl font-normal text-black mb-6">
            {minutes} minutes
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="500"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #272932 0%, #272932 ${(minutes / 500) * 100}%, #e5e7eb ${(minutes / 500) * 100}%, #e5e7eb 100%)`
            }}
          />

          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0</span>
            <span>500+</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-3">Need a custom solution?</p>
          <button className="text-black font-medium text-sm hover:underline inline-flex items-center gap-1">
            Contact us <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right Side - Plan Card */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-lg">
        <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Your plan</p>
        <h3 className="text-4xl md:text-5xl font-normal text-black mb-6">
          {tier.name}
        </h3>

        {tier.price !== null ? (
          <div className="text-3xl md:text-4xl font-normal text-black mb-6">
            ${tier.price}<span className="text-lg text-gray-500">/mo</span>
          </div>
        ) : (
          <div className="text-2xl font-normal text-black mb-6">
            Custom pricing
          </div>
        )}

        <p className="text-gray-600 mb-8 leading-relaxed">
          {tier.description}
        </p>

        <button
          onClick={onGetStarted}
          className="w-full bg-black text-white py-4 rounded-full text-base font-medium hover:opacity-90 transition-opacity mb-8"
        >
          Get started
        </button>

        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import CreatorsShowcase from "@/components/LandingPage/CreatorsShowcase";
import AIProductsShowcase from "@/components/LandingPage/AIProductsShowcase";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /app if already authenticated
    if (tokenStorage.isAuthenticated()) {
      router.push("/app");
    }
  }, [router]);

  const handleNavigation = () => {
    router.push("/app");
  };


  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section - Minimalist Design */}
      <MinimalistHero
        logoText=""
        navLinks={[
          { label: 'HOME', href: '#' },
          { label: 'PRODUCT', href: '#product' },
          { label: 'PRICING', href: '#pricing' },
        ]}
        mainText="Build automated workflows that clone, translate, and distribute your content to 10+ languages instantly."
        readMoreLink="#product"
        imageSrc="/hero-image.png"
        imageAlt="Professional content creator"
        overlayText={{
          part1: 'speak',
          part2: 'global.',
        }}
        socialLinks={[
          { icon: Facebook, href: '#' },
          { icon: Instagram, href: '#' },
          { icon: Twitter, href: '#' },
          { icon: Linkedin, href: '#' },
        ]}
        languageFlags={['🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪']}
        totalLanguages={40}
        onSignIn={handleNavigation}
        onSignUp={handleNavigation}
        onGetStarted={handleNavigation}
      />

      <FlowchartAnimation />
      <CreatorsShowcase />
      <AIProductsShowcase />

      {/* Pricing Section */}
      <section id="pricing" className="bg-white pb-20 mb-20 mt-10">
        <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Pricing</p>
            <h2 className="text-[50px] leading-[60px] font-normal text-black mb-6">
              One price, all the things
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scale your content globally with transparent pricing based on your usage.
            </p>
          </div>

          <PricingCalculator onGetStarted={handleNavigation} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

