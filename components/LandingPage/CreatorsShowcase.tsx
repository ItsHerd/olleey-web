"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "audiobooks",
    title: "AUDIOBOOKS",
    description: "Upload your ePub or PDF, pick your characters, direct the delivery, and publish high-quality multi-voice audiobooks.",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop",
      alt: "Audiobooks interface",
    },
    footer: {
      icon: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=32&h=32&fit=crop&crop=faces",
      text: "Publishers use Olleey to narrate books",
      link: "Duolingo",
    }
  },
  {
    id: "video-voiceovers",
    title: "VIDEO VOICEOVERS",
    description: "Select the ideal voice or clone your own. Generate ads, shorts, or films with our AI voice generator.",
    media: {
      type: "video",
      src: "https://assets.mixkit.co/videos/preview/mixkit-night-sky-over-a-city-4384-large.mp4",
      poster: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop",
    },
    footer: {
      brand: "synthesia",
      text: "powers realistic voices for avatars with Olleey",
      action: "CREATE VOICE OVER",
      isBrandLogo: true
    }
  },
  {
    id: "dubbed-videos",
    title: "DUBBED VIDEOS",
    description: "Translate into 30+ languages while preserving the speaker's voice. Dub with one click or use Dubbing Studio for full control.",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
      alt: "Dubbed videos interface",
    },
    footer: {
      text: "Creators reach global audiences",
      link: "MrBeast",
    }
  },
  {
    id: "podcasts",
    title: "PODCASTS",
    description: "Use Voice Isolator to clean up any recording, or Text to Speech to generate short segments or full podcasts with multiple speakers.",
    media: {
      type: "custom_podcast",
      src: "/podcast-mockup.png", // We'll build the UI for this
    },
    footer: {
      icon: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces",
      text: "uses Olleey to make podcasts",
      link: "Seth Godin",
    }
  },
  {
    id: "music",
    title: "MUSIC",
    description: "Generate studio-quality tracks instantly, any genre, any style, vocals or instrumental, in minutes using simple text prompts.",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop",
      alt: "Music generation interface",
    },
    footer: {
      text: "Musicians experiment with new styles",
      link: "Grimes",
    }
  },
];

export default function CreatorsShowcase() {
  const [activeTab, setActiveTab] = useState("video-voiceovers");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-rotate tabs functionality could be added here, but manual selection seems to be the UX in screenshot.
  // The screenshot shows a circular progress indicator on the active item, implying it might be a timed rotation or just visual flair.
  // We'll implement the rotation if user asks, but for now stick to manual + visual indicator.
  
  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px]">
        
        {/* Header */}
        <div className="mb-20">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              For <span className="text-black border-b-2 border-dotted border-black">CREATORS, MEDIA & ENTERTAINMENT</span>
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-normal text-[#1C1D21]">
            Generate high-quality audio with our AI voice <br /> generator for audiobooks, videos, and podcasts
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            {features.map((feature) => (
              <div 
                key={feature.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  activeTab === feature.id ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
                onClick={() => setActiveTab(feature.id)}
              >
                <div className="flex items-center gap-4 mb-3">
                  {activeTab === feature.id && (
                    <div className="w-4 h-4 rounded-full border border-black relative flex items-center justify-center">
                      <div className="w-4 h-4 absolute border-t-2 border-black rounded-full animate-spin duration-[3000ms]" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}></div>
                    </div>
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wide text-black">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-base text-black/80 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column - Media Display */}
          <div className="lg:col-span-7">
            <div className="relative bg-[#F3F4F6] rounded-[32px] overflow-hidden aspect-[4/3] w-full shadow-sm">
              
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
                   <div className="relative w-[280px] md:w-[320px] aspect-[9/19.5] bg-black rounded-[40px] border-[8px] border-black shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
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

                   {/* Right Side Podcast Text Dialog - simulating the screenshot */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 w-[260px] md:w-[300px] z-10 hidden md:block">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
                        <h4 className="font-bold text-sm mb-3">The Secret World of Science</h4>
                        <div className="space-y-3">
                          <div className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-pink-400 flex-shrink-0"></div>
                            <p className="text-xs text-gray-600 leading-snug">
                              Alright, so let's dive into today's <span className="bg-teal-100 px-1 rounded">review</span> topic - Atomic Theory.
                            </p>
                          </div>
                          <div className="flex gap-3 items-start">
                             <div className="w-6 h-6 rounded-full bg-blue-400 flex-shrink-0"></div>
                             <p className="text-xs text-gray-600 leading-snug">
                               Now this is one of my absolute favourite subjects. Where should we begin?
                             </p>
                          </div>
                          <div className="flex gap-3 items-start">
                             <div className="w-6 h-6 rounded-full bg-pink-400 flex-shrink-0"></div>
                             <p className="text-xs text-gray-600 leading-snug">
                               Let's go back to the very beginning with John Dalton in 1803
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

              {['audiobooks', 'dubbed-videos', 'music'].includes(activeFeature.media.type === 'image' ? activeTab : '') && (
                <div className="w-full h-full relative">
                   <Image 
                    src={activeFeature.media.src || ""}
                    alt={activeFeature.media.alt || ""}
                    fill
                    className="object-cover"
                   />
                </div>
              )}

              {/* Bottom Bar Logic */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-full px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  {activeFeature.footer.isBrandLogo ? (
                    <span className="font-bold text-lg tracking-tight flex items-center gap-1">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="w-3 h-3 bg-white rounded-sm"></span>
                      </span> 
                      {activeFeature.footer.brand}
                      <ArrowUpRight className="w-3 h-3 text-black ml-1" />
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                       {activeFeature.footer.icon && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          <Image src={activeFeature.footer.icon} alt="User" width={32} height={32} />
                        </div>
                       )}
                       {activeFeature.footer.link && (
                         <span className="font-bold text-sm flex items-center gap-1">
                           {activeFeature.footer.link}
                           <ArrowUpRight className="w-3 h-3" />
                         </span>
                       )}
                    </div>
                  )}
                  <span className="text-gray-500 text-sm hidden sm:inline-block">
                    {activeFeature.footer.text}
                  </span>
                </div>
                
                {activeFeature.footer.action ? (
                  <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase hover:bg-black/80 transition-colors">
                    {activeFeature.footer.action}
                  </button>
                ) : (
                   <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase hover:bg-black/80 transition-colors">
                     GET STARTED FREE
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
