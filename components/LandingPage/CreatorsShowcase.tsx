"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Feature {
  id: string;
  title: string;
  description: string;
  media: {
    type: "image" | "video" | "custom_podcast";
    src: string;
    alt?: string;
    poster?: string;
  };
  footer: {
    text: string;
    link?: string;
    action?: string;
    isBrandLogo?: boolean;
    brand?: string;
    icon?: string;
  };
}

const features: Feature[] = [
  {
    id: "zero-touch",
    title: "ZERO-TOUCH INGESTION",
    description: "Connect your YouTube channel once—Olleey handles the rest. We continuously monitor your feed and automatically spin up the localization pipeline the moment your video goes live. No buttons to press, no workflows to remember.",
    media: {
      type: "image",
      src: "/images/photo1.png",
      alt: "Automated monitoring dashboard",
    },
    footer: {
      text: "Set it and forget it",
      link: "Auto-Sync",
    }
  },
  {
    id: "one-to-many",
    title: "THE ONE-TO-MANY ENGINE",
    description: "Turn a single source video into 10+ fully localized, native-feeling versions—instantly. Our parallel processing system runs transcription, translation, voice cloning, and regenerative lip-sync all at once across every target language.",
    media: {
      type: "image",
      src: "/images/photo2.png",
      alt: "Global distribution network",
    },
    footer: {
      text: "1 upload → 10+ languages",
      action: "SEE IT IN ACTION",
    }
  },
  {
    id: "quality-gates",
    title: "INTELLIGENT QUALITY GATES",
    description: "Automate with guardrails. Set rules like \"Auto-publish if Confidence > 95%; otherwise send to Slack for review.\" Every output passes through configurable logic to keep quality high, branding tight, and mistakes out of your feed.",
    media: {
      type: "image",
      src: "/images/photo3.png",
      alt: "Quality control dashboard",
    },
    footer: {
      text: "AI + Human oversight",
      link: "Smart Rules",
    }
  },
  {
    id: "auto-distribution",
    title: "NATIVE AUTO-DISTRIBUTION",
    description: "Never download or re-upload again. Olleey pushes finished videos directly to your YouTube MLA tracks or regional channels—and to TikTok and Instagram—as Drafts or Scheduled Posts. Global publishing becomes a single automated step.",
    media: {
      type: "image",
      src: "/images/photo4.png",
      alt: "Auto distribution dashboard",
    },
    footer: {
      text: "Direct platform publishing",
      link: "Multi-Platform",
    }
  },
];

export default function CreatorsShowcase() {
  const [activeTab, setActiveTab] = useState("zero-touch");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (

    <section id="product" className="py-24 bg-black border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px] relative z-10">

        {/* Header */}
        <div className="mb-20 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex border border-white/20 px-3 py-1"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
              SYS.Mod.03 <span className="text-white mx-2">//</span> CREATORS
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-[56px] leading-[1.1] font-normal text-white font-mono uppercase tracking-tight"
          >
            Master your <br/>
            <span className="text-white/50">Global Footprint.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column - Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-px border border-white/10 bg-white/5"
          >
            {features.map((feature, idx) => (
              <div
                key={feature.id}
                className={cn(
                  "group cursor-pointer p-6 hover:bg-white/5 transition-colors duration-200 border-b border-white/10 last:border-b-0",
                  activeTab === feature.id ? "bg-white/10" : "opacity-60 hover:opacity-100"
                )}
                onClick={() => setActiveTab(feature.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/40">0{idx + 1}</span>
                    <h3 className={cn(
                      "text-xs font-mono uppercase tracking-widest transition-colors",
                      activeTab === feature.id ? "text-white" : "text-white/70 group-hover:text-white"
                    )}>
                      {feature.title}
                    </h3>
                  </div>
                  {activeTab === feature.id && (
                    <div className="w-1.5 h-1.5 bg-white animate-pulse" />
                  )}
                </div>
                {activeTab === feature.id && (
                  <p className="text-xs text-gray-400 leading-relaxed font-mono mt-2 pl-7 border-l border-white/20 ml-1">
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </motion.div>

          {/* Right Column - Media Display */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="relative bg-black border border-white/20 w-full aspect-[4/3] group overflow-hidden">
                {/* Technical Overlay */}
                <div className="absolute top-4 left-4 z-20 flex gap-2 text-[9px] font-mono text-white/60">
                    <span className="border border-white/20 px-1">REC</span>
                    <span className="animate-pulse text-red-500">●</span>
                </div>
                <div className="absolute top-0 right-0 p-2 border-b border-l border-white/20 w-8 h-8" />
                <div className="absolute bottom-0 left-0 p-2 border-t border-r border-white/20 w-8 h-8" />
                
                {/* Crosshairs */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                </div>

              {/* Content Renderers */}
              {activeFeature.media.type === 'video' && (
                <div className="relative w-full h-full group">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={activeFeature.media.poster}
                    src={activeFeature.media.src}
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                      <VolumeX size={16} />
                    </button>
                  </div>
                  {/* Overlay for specific screenshot content if needed */}
                  <div className="absolute inset-x-0 bottom-0 p-8 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <p className="text-xl font-medium mb-2">This stunning mosaic of culture, ambition and hope.</p>
                  </div>
                </div>
              )}

              {activeFeature.media.type === 'custom_podcast' && (
                <div className="w-full h-full flex items-center justify-center bg-white p-6 md:p-12 relative">
                  {/* Phone Mockup Frame */}
                  {/* Phone Mockup Frame - Technical */}
                  <div className="relative w-[280px] md:w-[320px] aspect-[9/19.5] bg-black border border-white/30 p-2 relative z-10">
                    <div className="absolute -inset-1 border border-white/10 opacity-50 pointer-events-none" />
                    <div className="h-full w-full bg-zinc-900 overflow-hidden relative border border-white/10">
                    {/* Dynamic Island */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[25px] w-[100px] bg-black flex items-center justify-center z-20 rounded-b-[16px]"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex flex-col text-black">
                      {/* Status Bar */}
                      <div className="flex justify-between px-6 pt-3 text-[10px] font-bold text-black z-10">
                        <span>11:30</span>
                        <div className="flex gap-1.5 items-center">
                          <span>5G</span>
                          <div className="w-5 h-2.5 bg-green-500 rounded-[2px] relative">
                            <div className="absolute top-0.5 right-0.5 w-0.5 h-1.5 bg-black/20"></div>
                          </div>
                        </div>
                      </div>

                      {/* Podcast UI */}
                      <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <h3 className="text-lg font-bold mb-4">OlleeyLabs</h3>

                        {/* Album Art */}
                        <div className="w-full aspect-square bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-xl mb-6 relative overflow-hidden group">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-xs uppercase tracking-widest opacity-80 mb-1">The Secret World of</div>
                              <div className="text-3xl font-black leading-none  tracking-tighter">SCIENCE</div>
                              <div className="mt-2 text-[10px] opacity-70">EP. 450</div>
                            </div>
                            {/* Rings */}
                            <div className="absolute w-[120%] h-[120%] border-[20px] border-white/10 rounded-full animate-pulse"></div>
                            <div className="absolute w-[80%] h-[80%] border-[20px] border-white/10 rounded-full"></div>
                          </div>
                        </div>

                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Right Side Podcast Text Dialog - Technical */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 w-[260px] md:w-[300px] z-10 hidden md:block">
                    <div className="bg-black/80 backdrop-blur-md p-4 border border-white/20 font-mono">
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <h4 className="text-[10px] text-white uppercase tracking-wider">Transcription Log</h4>
                        <span className="text-[9px] text-green-500">LIVE</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                          <span className="text-[9px] text-white/40 pt-1">00:12</span>
                          <p className="text-[10px] text-white/80 leading-normal font-mono">
                            <span className="text-blue-400">&gt;</span> Alright, so let's dive into today's <span className="bg-white/20 px-1 text-white">review</span> topic...
                          </p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <span className="text-[9px] text-white/40 pt-1">00:15</span>
                          <p className="text-[10px] text-white/80 leading-normal font-mono">
                            <span className="text-blue-400">&gt;</span> Now this is one of my absolute favourite subjects.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-6 left-6 z-10">
                    <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors">
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeFeature.media.type === 'image' && (
                <div className="w-full h-full relative">
                  <Image
                    src={
                        activeTab === 'zero-touch' ? "/images/photo1.png" : 
                        activeTab === 'one-to-many' ? "/images/photo2.png" :
                        activeTab === 'quality-gates' ? "/images/photo3.png" :
                        activeTab === 'auto-distribution' ? "/images/photo4.png" :
                        activeFeature.media.src || ""
                    }
                    alt={activeFeature.media.alt || ""}
                    fill
                    className="opacity-80 object-contain p-8"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                </div>
              )}

              {/* Bottom Bar Logic - Technical */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-white/20 p-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-[9px] text-white/60 uppercase tracking-widest flex items-center gap-2">
                    {activeFeature.footer.isBrandLogo ? (
                         <span className="text-white font-bold">{activeFeature.footer.brand}</span>
                    ) : (
                        <span>{activeFeature.footer.link || 'SYSTEM_DEFAULT'}</span>
                    )}
                    <span className="text-white/20">|</span>
                    <span>{activeFeature.footer.text}</span>
                  </div>
                </div>

                <button className="group flex items-center gap-2 text-[9px] font-mono uppercase text-white hover:text-white/80 transition-colors">
                    {activeFeature.footer.action || 'INITIALIZE'}
                    <span className="w-3 h-3 border border-white/50 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight className="w-2 h-2" />
                    </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
