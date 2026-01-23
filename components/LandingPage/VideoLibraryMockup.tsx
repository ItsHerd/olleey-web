"use client";

import React from "react";
import { Play } from "lucide-react";

export default function VideoLibraryMockup() {
  const videos = [
    { name: "MEO_POR_0315032525.mov", date: "03/28/2025", thumbnail: "https://images.unsplash.com/photo-1542204172-658a09b6050a?q=80&w=200&auto=format&fit=crop" },
    { name: "MEO_POR_0316032525.mov", date: "03/28/2025", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop" },
    { name: "MEO_POR_0317032525.mov", date: "03/28/2025", thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=200&auto=format&fit=crop" },
    { name: "MEO_POR_0318032525.mov", date: "03/28/2025", thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=200&auto=format&fit=crop" },
    { name: "BBP_AUS_0415042825.mp4", date: "05/02/2025", thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=200&auto=format&fit=crop" },
    { name: "BBP_AUS_0420042825.mp4", date: "05/02/2025", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop" },
  ];

  return (
    <div className="relative">
      <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden w-full max-w-[640px] mx-auto lg:mx-0">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-400">
            <span className="flex items-center gap-1">
              Name <span className="text-[10px]">▼</span>
            </span>
            <span>Date Added</span>
          </div>

          <div className="space-y-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <span className="text-[13px] md:text-sm text-gray-700 font-medium truncate max-w-[150px] md:max-w-none">
                    {video.name}
                  </span>
                </div>
                <span className="text-[13px] md:text-sm text-gray-400">
                  {video.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tooltip-like badge */}
      <div className="absolute -bottom-4 right-12 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 animate-bounce">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-xs font-medium text-gray-600">Your raw video library</span>
      </div>
    </div>
  );
}
