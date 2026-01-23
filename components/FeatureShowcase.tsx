"use client";

import { useState, useEffect, useRef } from "react";

interface FeatureShowcaseProps {
  onGetStarted?: () => void;
}

const features = [
  {
    id: "centralize",
    title: "Centralize your footage",
    description: "Bring all your content into one place. Upload videos from anywhere and manage your entire library in a unified platform built for scale.",
  },
  {
    id: "index",
    title: "Index at scale with AI",
    description: "Our AI automatically analyzes and indexes your content, making every moment searchable and ready for localization.",
  },
  {
    id: "discover",
    title: "Empower anyone to find and create",
    description: "Search through your entire video library instantly. Find the perfect moments and create localized versions with just a few clicks.",
  },
  {
    id: "share",
    title: "Share securely",
    description: "Control who sees what. Share your localized content with teams, partners, or publish directly to your channels with granular permissions.",
  },
  {
    id: "monetize",
    title: "Monetize your media",
    description: "Unlock new revenue streams by reaching global audiences. Track performance across languages and optimize for maximum engagement.",
  },
];

export default function FeatureShowcase({ onGetStarted }: FeatureShowcaseProps) {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "-40% 0px -40% 0px",
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <h2 className="text-[62px] leading-[70px] font-normal text-black mb-24 text-center">
          What can you do with olleey.com?
        </h2>
        
        <div className="flex justify-center gap-20">
          {/* Left Navigation Bar */}
          <div className="hidden lg:block flex-shrink-0 w-48">
            <div className="sticky top-24 pt-16">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-0 top-0 bottom-[-40px] w-px bg-gray-300" />
                
                {/* Sliding yellow indicator */}
                <div 
                  className="absolute -left-px w-1 bg-olleey-yellow transition-all duration-500 ease-in-out"
                  style={{ 
                    height: '32px',
                    top: '0px',
                    transform: `translateY(${activeSection * 56}px)` // h-8 (32) + gap-6 (24)
                  }}
                />

                {/* Navigation items */}
                <nav className="flex flex-col gap-6">
                  {features.map((feature, index) => (
                    <button
                      key={feature.id}
                      onClick={() => scrollToSection(index)}
                      className="group relative block text-left w-full h-8"
                    >
                      <p className={`pl-6 text-xl transition-colors duration-300 ${
                        activeSection === index ? 'text-black font-medium' : 'text-gray-400 font-normal group-hover:text-gray-600'
                      }`}>
                        {feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}
                      </p>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[751px] flex-1">
            {features.map((feature, index) => (
              <div key={feature.id} className="w-full">
                <div
                  ref={el => { sectionRefs.current[index] = el; }}
                  className="py-16"
                >
                  {/* Header and Button Row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="max-w-[500px]">
                      <h3 className="text-[32px] font-normal text-black mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Discover More Button */}
                    <button className="flex-shrink-0 mt-2 px-6 py-2.5 border border-black rounded-md text-base font-medium text-black hover:bg-black hover:text-white transition-colors">
                      Discover more
                    </button>
                  </div>
                  
                  {/* Visual Placeholder/Video - 751px × 434px */}
                  <div 
                    className="bg-gray-100 rounded-[20px] border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm"
                    style={{ width: '751px', height: '434px' }}
                  >
                    <div className="text-gray-400 text-base">Visual Placeholder</div>
                  </div>
                </div>

                {/* Divider Line (except after last section) */}
                {index < features.length - 1 && (
                  <div className="border-t border-gray-100 w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Mobile Section Indicator */}
      <div className="lg:hidden fixed top-24 left-6 text-black text-sm bg-white/90 px-3 py-2 rounded-full z-10 border border-gray-200">
        <span className="font-medium">{features[activeSection].id.charAt(0).toUpperCase() + features[activeSection].id.slice(1)}</span>
      </div>
    </div>
  );
}
