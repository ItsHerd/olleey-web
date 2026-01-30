'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { authAPI } from "@/lib/api";
import { getUserFriendlyErrorMessage } from "@/lib/errorMessages";
import { useGoogleSignIn } from "@/lib/useGoogleSignIn";
import { motion, AnimatePresence } from 'framer-motion';

interface HeroAsciiProps {
  navLinks?: { label: string; href: string }[];
  onAuthenticated?: () => void;
  showAuth?: boolean;
  setShowAuth?: (show: boolean) => void;
  authMode?: 'login' | 'register';
  setAuthMode?: (mode: 'login' | 'register') => void;
}

export default function HeroAscii({
  navLinks,
  onAuthenticated,
  showAuth: externalShowAuth,
  setShowAuth: externalSetShowAuth,
  authMode: externalAuthMode,
  setAuthMode: externalSetAuthMode
}: HeroAsciiProps) {
  const [internalShowAuth, setInternalShowAuth] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState<'login' | 'register'>('login');

  const showAuth = externalShowAuth ?? internalShowAuth;
  const setShowAuth = externalSetShowAuth ?? setInternalShowAuth;
  const authMode = externalAuthMode ?? internalAuthMode;
  const setAuthMode = externalSetAuthMode ?? setInternalAuthMode;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (authMode === 'login') {
        await authAPI.login({ email, password });
      } else {
        await authAPI.register({ email, password, name });
      }
      if (onAuthenticated) onAuthenticated();
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    try {
      await authAPI.googleAuth(credentialResponse.credential);
      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (GOOGLE_CLIENT_ID) {
      const authUrl = authAPI.getGoogleAuthUrl(GOOGLE_CLIENT_ID);
      window.location.href = authUrl;
    } else {
      setError("ERR_OAUTH_CFG: GOOGLE_CLIENT_ID_NOT_SET");
    }
  };

  const { renderButton } = useGoogleSignIn({
    clientId: GOOGLE_CLIENT_ID,
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  useEffect(() => {
    if (showAuth && googleButtonRef.current && GOOGLE_CLIENT_ID) {
      renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: googleButtonRef.current.offsetWidth || 300,
        logo_alignment: 'center'
      });
    }
  }, [showAuth, renderButton, GOOGLE_CLIENT_ID]);

  useEffect(() => {
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    // Add CSS to hide branding elements and crop canvas
    const style = document.createElement('style');
    style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }
      
      [data-us-project] canvas {
        clip-path: inset(0 0 10% 0) !important;
      }
      
      [data-us-project] * {
        pointer-events: none !important;
      }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    // Function to aggressively hide branding
    const hideBranding = () => {
      const projectDiv = document.querySelector('[data-us-project]');
      if (projectDiv) {
        // Find and remove any elements containing branding text
        const allElements = projectDiv.querySelectorAll('*');
        allElements.forEach(el => {
          const text = (el.textContent || '').toLowerCase();
          if (text.includes('made with') || text.includes('unicorn')) {
            el.remove(); // Completely remove the element
          }
        });
      }
    };

    // Run immediately and periodically
    hideBranding();
    const interval = setInterval(hideBranding, 100);

    // Also try after delays
    setTimeout(hideBranding, 1000);
    setTimeout(hideBranding, 3000);
    setTimeout(hideBranding, 5000);

    return () => {
      clearInterval(interval);
      document.head.removeChild(embedScript);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Vitruvian man animation - hidden on mobile */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        <div
          data-us-project="whwOGlfJ5Rz2rHaEUgHl"
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
        />
      </div>

      {/* Mobile stars background */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg"></div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative w-6 h-6 lg:w-8 lg:h-8">
              <Image
                src="/images/translogowhite.png"
                alt="Olleey Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest">
              olleey
            </div>
            <div className="h-3 lg:h-4 w-px bg-white/40"></div>
            <span className="text-white/60 text-[8px] lg:text-[10px] font-mono">GLOBAL TRANSLATION</span>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8">
            {navLinks?.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-mono text-white/70 hover:text-white transition-colors tracking-widest uppercase relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full opacity-50"></span>
              </a>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuth(true);
              }}
              className="text-xs font-mono text-white/80 hover:text-white tracking-wider"
            >
              LOG IN
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuth(true);
              }}
              className="px-4 py-1.5 border border-white/40 text-xs font-mono text-white hover:bg-white hover:text-black transition-all duration-200 tracking-wider"
            >
              GET STARTED
            </button>
          </div>

          {/* Mobile Menu Icon (Placeholder for now if needed, currently hidden on mobile in original design logic, but we can add a simple hamburger if requested later. For now keeping desktop focus as per request 'header') */}
          <div className="lg:hidden text-white font-mono text-xs">Menu</div>
        </div>
      </div>

      {/* Corner Frame Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" style={{ bottom: '5vh' }}></div>
      <div className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" style={{ bottom: '5vh' }}></div>

      <div className="relative z-10 flex min-h-screen items-center pt-16 lg:pt-0" style={{ marginTop: '5vh' }}>
        <div className="container mx-auto px-6 lg:px-16 lg:ml-[10%]">
          <div className="max-w-lg relative">
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">SYS.INIT.01</span>
              <div className="flex-1 h-px bg-white"></div>
            </div>

            <AnimatePresence mode="wait">
              {showAuth ? (
                <motion.div
                  key="login-flow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-sm"
                >
                  <div className="relative mb-6">
                    <div className="hidden lg:block absolute -left-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
                    <div className="flex items-center gap-4 mb-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`font-mono text-xs tracking-[0.2em] transition-colors py-1 ${authMode === 'login' ? 'text-white border-b border-white' : 'text-white/40 hover:text-white/60'}`}
                      >
                        [ Login ]
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`font-mono text-xs tracking-[0.2em] transition-colors py-1 ${authMode === 'register' ? 'text-white border-b border-white' : 'text-white/40 hover:text-white/60'}`}
                      >
                        [ Register ]
                      </button>
                    </div>
                    <p className="text-[10px] text-white/20 font-mono">STATUS: {authMode === 'login' ? 'WAITING_FOR_CREDENTIALS' : 'INITIATING_NEW_PROFILE_COLLECT'}</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleAuth}>
                    {authMode === 'register' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em]">Full_Name</label>
                        <input
                          name="name"
                          type="text"
                          placeholder="ENTER NAME"
                          className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white font-mono text-xs lg:text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em]">User_ID</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="ENTER EMAIL"
                        className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white font-mono text-xs lg:text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em]">Access_Key</label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="ENTER PASSWORD"
                        className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white font-mono text-xs lg:text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder:text-white/10"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 font-mono text-[9px] uppercase tracking-wider animate-pulse border border-red-500/20 p-2 bg-red-500/5"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="relative px-6 py-2.5 bg-white text-black font-mono text-xs lg:text-sm border border-white hover:bg-transparent hover:text-white transition-all duration-200 group overflow-hidden disabled:opacity-50"
                      >
                        {loading ? "PROCESSING..." : authMode === 'login' ? "Login" : "Create Account"}
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em]">SECURE_OAUTH_LINK</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full border border-white/20 bg-white/5 py-2.5 px-3 flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group text-white"
                      >
                        <svg className="w-4 h-4 text-white group-hover:text-black transition-colors" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white group-hover:text-black">Sign in with Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAuth(false)}
                        className="text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
                      >
                        <span>[ CANCEL ]</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="hero-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Title with dithered accent */}
                  <div className="relative">
                    <div className="hidden lg:block absolute -left-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
                    <h1 className="text-2xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight font-mono tracking-wider" style={{ letterSpacing: '0.1em' }}>
                      GLOBAL REACH.
                      <span className="block text-white mt-1 lg:mt-2 opacity-90">
                        NATIVE FEEL.
                      </span>
                    </h1>
                  </div>

                  {/* Decorative dots pattern - desktop only */}
                  <div className="hidden lg:flex gap-1 mb-3 opacity-40">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="w-0.5 h-0.5 bg-white rounded-full"></div>
                    ))}
                  </div>

                  {/* Description with subtle grid pattern */}
                  <div className="relative">
                    <p className="text-xs lg:text-base text-gray-300 mb-5 lg:mb-6 leading-relaxed font-mono opacity-80">
                      The first end-to-end AI localization engine. Clone your voice, sync your lips, and distribute to 10+ languages instantly without lifting a finger.
                    </p>

                    {/* Technical corner accent - desktop only */}
                    <div className="hidden lg:block absolute -right-4 top-1/2 w-3 h-3 border border-white opacity-30" style={{ transform: 'translateY(-50%)' }}>
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white" style={{ transform: 'translate(-50%, -50%)' }}></div>
                    </div>
                  </div>

                  {/* Buttons with technical accents */}
                  <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuth(true);
                      }}
                      className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent text-white font-mono text-xs lg:text-sm border border-white hover:bg-white hover:text-black transition-all duration-200 group"
                    >
                      <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      START PIPELINE
                    </button>

                    <button className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200" style={{ borderWidth: '1px' }}>
                      WATCH DEMO
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom technical notation - desktop only */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-40">
              <span className="text-white text-[9px] font-mono">∞</span>
              <div className="flex-1 h-px bg-white"></div>
              <span className="text-white text-[9px] font-mono">OLLEEY_AI_ENGINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute left-0 right-0 z-20 border-t border-white/20 bg-black/40 backdrop-blur-sm" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <div className="hidden lg:flex gap-1">
              {[12, 8, 14, 6, 10, 16, 5, 11].map((height, i) => (
                <div key={i} className="w-1 h-3 bg-white/30" style={{ height: `${height}px` }}></div>
              ))}
            </div>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dither-pattern {
          background-image: 
            repeating-linear-gradient(0deg, transparent 0px, transparent 1px, white 1px, white 2px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 1px, white 1px, white 2px);
          background-size: 3px 3px;
        }
        
        .stars-bg {
          background-image: 
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(1px 1px at 15% 60%, white, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent);
          background-size: 200% 200%, 180% 180%, 250% 250%, 220% 220%, 190% 190%, 240% 240%, 210% 210%, 230% 230%;
          background-position: 0% 0%, 40% 40%, 60% 60%, 20% 20%, 80% 80%, 30% 30%, 70% 70%, 50% 50%;
          opacity: 0.3;
        }
      `}</style>
    </main>
  );
}

// Add global type declaration for UnicornStudio
declare global {
  interface Window {
    UnicornStudio: any;
  }
}
