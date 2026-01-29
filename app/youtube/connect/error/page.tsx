"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, RefreshCcw, Home, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

function YouTubeConnectErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>("Unknown error");

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#050505]" : "bg-gray-50";
  const cardClass = isDark ? "bg-white/5 backdrop-blur-xl" : "bg-white shadow-2xl";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/60" : "text-gray-500";
  const borderClass = isDark ? "border-white/10" : "border-gray-100";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }

    logger.error("YouTube Connect Error", "Error details received", {
      error: errorParam,
      current_url: window.location.href,
    });
  }, [searchParams]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${bgClass}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`relative ${cardClass} border ${borderClass} rounded-[2.5rem] max-w-xl w-full p-10 md:p-16 text-center overflow-hidden`}>
        {/* Subtle Inner Glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        <div className="relative space-y-10">
          {/* Error Icon Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse opacity-25" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full scale-125" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <X className="w-12 h-12 text-white stroke-[3px]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Connection Interrupted</span>
              </div>
              <h1 className={`text-4xl font-300 ${textClass} tracking-tighter`}>
                Link <span className="font-semibold text-red-500">Failed</span>
              </h1>
            </div>

            <div className="py-2">
              <div className={`p-4 ${isDark ? 'bg-red-500/5' : 'bg-red-50'} rounded-2xl border border-red-500/10`}>
                <p className={`text-xs font-bold text-red-500 mb-1 uppercase tracking-widest`}>System Log</p>
                <p className={`text-sm ${textClass} line-clamp-3 font-medium`}>
                  {errorMessage}
                </p>
              </div>
            </div>

            <p className={`text-sm ${textSecondaryClass} max-w-md mx-auto leading-relaxed`}>
              We encountered a synchronization error while attempting to establish a secure handshake with Google's servers.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.push("/app?page=Channels")}
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-full h-12 px-8 font-bold"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>

            <Button
              onClick={() => router.push("/app?page=Channels")}
              className="w-full sm:w-auto bg-olleey-yellow text-black hover:bg-white transition-all rounded-full h-12 px-8 font-bold group"
            >
              <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeConnectErrorPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Diagnosing Error...</p>
        </div>
      </div>
    }>
      <YouTubeConnectErrorContent />
    </Suspense>
  );
}
