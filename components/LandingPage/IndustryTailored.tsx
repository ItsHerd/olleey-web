"use client";

import { useState, useEffect, useRef } from "react";

const industries = [
  { id: "media", label: "Media & Entertainment" },
  { id: "advertising", label: "Advertising" },
  { id: "govt", label: "Govt. & Security" },
  { id: "automotive", label: "Automotive" },
];

const featuresByIndustry: Record<string, { title: string; description: string }[]> = {
  media: [
    {
      title: "Automated Clip Generation",
      description: "Create instant clips from longer content to use in social media and marketing.",
    },
    {
      title: "Scene Selection",
      description: "Quickly find and categorize key scenes. Choose the best takes and curate moments easily.",
    },
    {
      title: "Bloopers and BTS Content",
      description: "Get auto-curated highlight reels featuring the best of BTS or other special footage.",
    },
    {
      title: "Automatic Tagging",
      description: "Easily access and manage content in a vast video library — no manual tagging needed.",
    },
    {
      title: "Content Summarization",
      description: "Generate high-quality summaries and headlines to communicate the core message quickly.",
    },
    {
      title: "Content Discovery",
      description: "Find any key moment in footage easily — or help customers discover them too.",
    },
    {
      title: "Real-Time Scene Classification",
      description: "Get editorial support mid-workflow for seamless, swift production.",
    },
    {
      title: "Ad Matching",
      description: "Use contextual ad placement to ensure your customers' attention and engagement.",
    },
  ],
  advertising: [
    {
      title: "Contextual Ad Targeting",
      description: "Analyze video content in real-time to place the most relevant ads for maximum conversion.",
    },
    {
      title: "Brand Safety Analysis",
      description: "Ensure your ads never appear next to sensitive or inappropriate content with AI-driven detection.",
    },
    {
      title: "Product Placement Discovery",
      description: "Identify perfect moments for product integration within existing video libraries.",
    },
    {
      title: "Campaign Attribution",
      description: "Connect video engagement directly to purchase intent through advanced AI tracking.",
    },
  ],
  govt: [
    {
      title: "Automated Surveillance Review",
      description: "Process thousands of hours of footage to identify specific individuals or activities instantly.",
    },
    {
      title: "Secure Evidence Management",
      description: "Maintain a chain of custody for digital evidence with encrypted, searchable archives.",
    },
    {
      title: "Emergency Response Optimization",
      description: "Real-time analysis of live feeds to coordinate first responders during critical incidents.",
    },
    {
      title: "Public Safety Analytics",
      description: "Predict trends and identify risks through large-scale analysis of urban video networks.",
    },
  ],
  automotive: [
    {
      title: "Telematics Visualization",
      description: "Overlay vehicle performance data onto driving footage for advanced driver training.",
    },
    {
      title: "ADAS Development",
      description: "Train and validate self-driving algorithms with massive datasets of real-world scenarios.",
    },
    {
      title: "Smart Traffic Management",
      description: "Analyze intersection flows to optimize city-wide traffic signals and reduce congestion.",
    },
    {
      title: "Remote Fleet Inspection",
      description: "Use AI to detect vehicle damage or maintenance needs through automated video walkrounds.",
    },
  ],
};

export default function IndustryTailored() {
  const [activeIndustry, setActiveIndustry] = useState("media");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const currentFeatures = featuresByIndustry[activeIndustry] || [];

  return (
    <section ref={sectionRef} className="py-24 bg-[#F8F8F8]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-[90px]">
        {/* Header Section */}
        <div className={`flex flex-col items-center text-center mb-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <span className="px-3 py-1 border border-black/20 rounded-lg text-[10px] font-medium tracking-widest text-[#1C1D21] mb-8">
            TOP USES
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[64px] font-normal text-[#1C1D21] mb-12">
            Tailored for your industry.
          </h2>

          {/* industry Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setActiveIndustry(industry.id)}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeIndustry === industry.id
                    ? "bg-[#1C1D21] text-white border-[#1C1D21]"
                    : "bg-transparent text-[#1C1D21] border-[#1C1D21]/20 hover:border-[#1C1D21]/40"
                }`}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-[1400px] mx-auto px-8 mt-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-16">
            {currentFeatures.map((feature, index) => (
              <div
                key={index}
                className={`px-8 border-l border-r border-black/10 transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-normal text-[#1C1D21] mb-4 min-h-[56px] flex items-center">
                  {feature.title}
                </h3>
                <p className="text-base text-[#1C1D21]/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
