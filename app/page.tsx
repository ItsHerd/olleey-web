"use client";

import { ArrowRight, ChevronDown, Plus, X, Check } from "lucide-react";
import Header from "@/components/LandingPage/Header";
import Footer from "@/components/LandingPage/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import { Typewriter } from "@/components/Typewriter";

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
      <section className="relative pt-24 md:pt-32 lg:pt-[137px] pb-20 md:pb-28 lg:pb-[134px] overflow-hidden">
        {/* Gradient Background */}
        {/* Background */}
        <div className="absolute inset-0 bg-white" />

        <div className="relative max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[88px]">
          <div className="max-w-[1744px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left Content */}
              <div className="flex-1 text-left flex flex-col items-start">
                {/* Headline */}
                <h1 className="text-4xl md:text-6xl lg:text-[78px] leading-tight md:leading-[1.1] font-normal text-olleey-black mb-8 md:mb-12 max-w-4xl whitespace-pre-wrap">
                  <span>{"We're born to "}</span>
                  <Typewriter
                    text={[
                      "share",
                      "explore",
                      "stories without barriers",
                    ]}
                    speed={70}
                    className="text-olleey-yellow"
                    waitTime={1500}
                    deleteSpeed={40}
                    cursorChar={"_"}
                  />
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl lg:text-[22px] leading-relaxed font-normal text-[#1C1D21] mb-8 md:mb-10 max-w-xl">
                  One upload, endless languages.
                </p>

                {/* CTA Button */}
                <div className="flex flex-col items-start mb-0">
                  <button
                    onClick={handleNavigation}
                    className="bg-olleey-black text-white px-8 md:px-[38px] h-12 md:h-[54px] rounded-full flex items-center justify-center text-lg md:text-[20px] hover:opacity-90 transition-opacity gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-sm mt-4 md:mt-[22px] text-gray-500">
                    Start for free. No credit card required.
                  </p>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block w-px h-96 bg-gray-200 flex-shrink-0" />

              {/* Right Content / Hero Image */}
              <div className="flex-1 w-full relative">
                <div className="relative w-full max-w-[800px] mx-auto lg:mx-0 lg:ml-auto">
                  <div className="rounded-[10px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[1048/597] shadow-xl">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {/* Placeholder for hero image */}
                      <div className="text-center">
                        <p className="text-sm">Website Preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wrapper for Background Image Sections */}
      <div className="bg-cover bg-center" style={{ backgroundImage: "url(/images/background.jpg)" }}>
        {/* Customization Section */}
        <section className="py-[115px] bg-white/90">
          <div className="max-w-[1920px] mx-auto px-[94px]">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-[549px]">
                <h2 className="text-[62px] leading-[70px] font-normal text-black mb-[54px]">
                  You are ignoring 95% of the world.
                </h2>

                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-[28px] leading-[28px] font-normal text-black mb-4 flex items-center gap-3">
                      <ArrowRight className="w-6 h-6" />
                      Don't let language barriers limit your growth
                    </h3>
                    <p className="text-[17px] leading-[25px] text-black ml-9">
                      The biggest creators run regional channels. Now, you can too.
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-[28px] leading-[28px] font-normal text-black">
                      Built-in AI tools
                    </h3>
                  </div>

                  <div>
                    <h3 className="text-[28px] leading-[28px] font-normal text-[#1C1D21]">
                      New audiences, new revenue streams
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleNavigation}
                  className="mt-12 bg-black text-white px-[36px] h-[54px] rounded-full inline-flex items-center justify-center text-[20px] hover:opacity-90 transition-opacity gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <div className="rounded-[20px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[1050/581] shadow-2xl">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <p className="text-sm">Customization Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
        <section className="py-[100px] bg-white/90">
          <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
            <div className="text-center mb-16">
              <h2 className="text-[50px] leading-[60px] font-normal text-black mb-6">
                Pricing Plans
              </h2>
              <p className="text-xl text-gray-600">
                Choose the perfect plan for your global expansion.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-[32px] p-10 border border-gray-200 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-normal text-black mb-4">Starter</h3>
                <div className="text-[40px] font-normal text-black mb-6">
                  Free
                </div>
                <p className="text-gray-600 mb-8">
                  Perfect for testing the waters.
                </p>
                <button onClick={handleNavigation} className="w-full py-3 rounded-full border border-black text-black hover:bg-gray-50 transition-colors mb-8">
                  Get Started
                </button>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-olleey-black" />
                    1 Language
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-olleey-black" />
                    5 minutes / month
                  </li>
                </ul>
              </div>

              {/* Creator Plan */}
              <div className="bg-olleey-black rounded-[32px] p-10 flex flex-col relative overflow-hidden shadow-xl transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-olleey-yellow text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <h3 className="text-2xl font-normal text-white mb-4">Creator</h3>
                <div className="text-[40px] font-normal text-white mb-6">
                  $29<span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400 mb-8">
                  For growing channels.
                </p>
                <button onClick={handleNavigation} className="w-full py-3 rounded-full bg-olleey-yellow text-black hover:opacity-90 transition-opacity mb-8">
                  Get Started
                </button>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-olleey-yellow" />
                    3 Languages
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-olleey-yellow" />
                    60 minutes / month
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-olleey-yellow" />
                    No Watermark
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-[32px] p-10 border border-gray-200 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-normal text-black mb-4">Global</h3>
                <div className="text-[40px] font-normal text-black mb-6">
                  $99<span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-gray-600 mb-8">
                  For world domination.
                </p>
                <button onClick={handleNavigation} className="w-full py-3 rounded-full border border-black text-black hover:bg-gray-50 transition-colors mb-8">
                  Get Started
                </button>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-olleey-black" />
                    Unlimited Languages
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-olleey-black" />
                    300 minutes / month
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-olleey-black" />
                    Priority Support
                  </li>
                </ul>
              </div>
            </div>
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
