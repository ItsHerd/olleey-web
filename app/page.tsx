"use client";

import { ArrowRight, ChevronDown, Plus, X, Check } from "lucide-react";
import Header from "@/components/LandingPage/Header";
import Footer from "@/components/LandingPage/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import { Typewriter } from "@/components/Typewriter";
import FeatureShowcase from "@/components/FeatureShowcase";
import VideoLibraryMockup from "@/components/LandingPage/VideoLibraryMockup";
import IndustryTailored from "@/components/LandingPage/IndustryTailored";

// Pricing Calculator Component
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
      <Header
        onLoginClick={handleNavigation}
        onGetStartedClick={handleNavigation}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#F1F3FF]">
        <div className="relative w-full max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[88px]">
          <div className="max-w-[1744px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
              {/* Left Content */}
              <div className="lg:flex-[1.1] text-left flex flex-col items-start z-10">
                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-[88px] leading-[1.05] font-normal text-black mb-8 md:mb-10 max-w-none tracking-tight">
                  <span className="block mb-2">{"We're born to"}</span>
                  <Typewriter
                    text={[
                      "share",
                      "explore",
                      "stories without barriers",
                    ]}
                    speed={70}
                    className="text-[#5155DC] inline-block border-b-4 border-[#5155DC] pb-2 whitespace-nowrap"
                    waitTime={1500}
                    deleteSpeed={40}
                    cursorChar={"_"}
                  />
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl lg:text-[24px] leading-relaxed font-normal text-gray-500 mb-10 md:mb-12 max-w-xl">
                  One upload, endless languages. Search and understand your videos with AI.
                </p>

                {/* CTA Button */}
                <div className="flex flex-col items-start">
                  <button
                    onClick={handleNavigation}
                    className="bg-black text-white px-10 h-[64px] rounded-full flex items-center justify-center text-[20px] font-medium hover:bg-gray-800 transition-all gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                  <p className="text-sm mt-6 text-gray-400 font-medium">
                    Start for free. No credit card required.
                  </p>
                </div>
              </div>

              {/* Right Content / Hero Video */}
              <div className="lg:flex-[0.9] w-full relative lg:pl-12">
                <div className="relative rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-gray-100 bg-gray-50 aspect-video">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source 
                      src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" 
                      type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Glass overlay effect on bottom */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5155DC] flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Processing global release...</div>
                        <div className="text-white/60 text-xs">Awaiting 12 language tracks</div>
                      </div>
                    </div>
                    <div className="text-white/80 text-xs font-mono">92%</div>
                  </div>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#5155DC]/5 rounded-full -z-10 blur-3xl opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <IndustryTailored />

        {/* Feature Showcase - Scroll-Pinned */}
        <div className="bg-[#F1F3FF]">
          <FeatureShowcase onGetStarted={handleNavigation} />
        </div>

        {/* Business Features Section */}
        <section className="py-[109px] bg-white/90">
          <div className="max-w-[1920px] mx-auto px-[90px]">
            <div className="flex justify-between items-start mb-16">
              <h2 className="text-[63px] leading-[70px] font-normal text-black max-w-[770px]">
                Add anything you need for your business as you go
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                {/* eCommerce Feature (Expanded) */}
                <div className="bg-gray-100 rounded-[38px] p-[50px]">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[28px] font-normal text-black">eCommerce</h3>
                    <X className="w-6 h-6" />
                  </div>
                  <p className="text-base text-black mb-4">
                    <span className="underline">Sell online</span> and manage orders, shipping and more in one place.
                  </p>
                  <a href="#learn-more" className="inline-flex items-center gap-2 text-[15px] hover:opacity-70 border-b border-black pb-1">
                    Learn more
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Other Features (Collapsed) */}
                {['Scheduling', 'Portfolio', 'Blog', 'Online courses', 'Events'].map((feature) => (
                  <div key={feature} className="bg-gray-100 rounded-[38px] px-[50px] py-[15px] flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors">
                    <h3 className="text-[28px] font-normal text-black">{feature}</h3>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="rounded-[33px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[1140/625] shadow-xl">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <p className="text-sm">eCommerce Features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-[100px] bg-white/90">
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
      </div>

      {/* Final CTA Section */}
      <section className="relative py-20 md:py-32 lg:py-[211px] bg-olleey-black">
        <div className="max-w-[1459px] mx-auto px-5 md:px-12 lg:px-[230px] text-center">
          <h2 className="text-4xl md:text-7xl lg:text-[133px] leading-tight md:leading-[140px] font-normal text-white mb-12 md:mb-16 lg:mb-[82px]">
            Your voice. Your story. Your world.
          </h2>
          <button
            onClick={handleNavigation}
            className="bg-olleey-yellow text-olleey-black px-8 md:px-[35px] h-14 md:h-[60px] rounded-full inline-flex items-center justify-center text-xl md:text-[24px] leading-9 hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
