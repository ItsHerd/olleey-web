'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { X, Sun, Moon } from 'lucide-react';
import { useAuth } from "@/lib/AuthContext";
import { getUserFriendlyErrorMessage } from "@/lib/errorMessages";
import { useThemeContext } from "@/lib/ThemeContext";
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
  const router = useRouter();
  const [internalShowAuth, setInternalShowAuth] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState<'login' | 'register'>('login');
  const [showDemo, setShowDemo] = useState(false);
  const { theme, setTheme } = useThemeContext();

  const showAuth = externalShowAuth ?? internalShowAuth;
  const setShowAuth = externalSetShowAuth ?? setInternalShowAuth;
  const authMode = externalAuthMode ?? internalAuthMode;
  const setAuthMode = externalSetAuthMode ?? setInternalAuthMode;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const accessCode = formData.get('accessCode') as string;

    try {
      if (authMode === 'login') {
        console.log('[HeroAscii] Signing in with Supabase:', email);
        await signIn(email, password);
        console.log('[HeroAscii] ✅ Sign in successful');
      } else {
        // Invite-only validation
        if (!accessCode || accessCode.trim() !== "olleey2026") {
          setError("ERR_AUTH_INVITE: INVALID_ACCESS_CODE");
          setLoading(false);
          return;
        }
        console.log('[HeroAscii] Signing up with Supabase:', email);
        await signUp(email, password, name);
        console.log('[HeroAscii] ✅ Sign up successful');
      }
      if (onAuthenticated) onAuthenticated();
    } catch (err: any) {
      console.error('[HeroAscii] Auth error:', err);
      setError(err.message || getUserFriendlyErrorMessage(err));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      console.log('[HeroAscii] Starting Google sign in');
      await signInWithGoogle();
      // Redirect happens automatically via Supabase
    } catch (err: any) {
      console.error('[HeroAscii] Google sign in error:', err);
      setError(err.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force light theme on landing page
    setTheme('light');
  }, [setTheme]);

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
    return () => {
      // Cleanup mostly handled by window checks, but could remove script if strictly needed
    };
  }, []);


  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
      {/* Top Header - Seamless with Hero */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6 transition-colors duration-300 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Left: Logo Island */}
            <Link href="/" className="flex items-center gap-3 group bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-full pl-2 pr-6 py-2 transition-all hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-white/5">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/translogo.png"
                  alt="Olleey Logo"
                  fill
                  className="object-contain transition-all duration-300"
                />
              </div>
              <span className="text-black dark:text-white text-xl font-medium tracking-tight group-hover:text-black/80 dark:group-hover:text-white/90 transition-colors">
                olleey.com
              </span>
            </Link>

            {/* Center: Nav Links Island */}
            <div className="hidden lg:flex items-center gap-1 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-full p-1.5 shadow-sm">
              {navLinks?.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.label === 'Home') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all rounded-full cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right: Actions Island */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-full p-2 pl-4 shadow-sm">

              <button
                onClick={() => {
                  router.push('/login');
                }}
                className="hidden lg:block px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              >
                Log in
              </button>

              <button
                onClick={() => {
                  router.push('/register');
                }}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-all hover:opacity-90 hover:shadow-lg"
              >
                Get Started
              </button>

              {/* Mobile Menu Button */}
              <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {/* Reusing mobile menu button area for toggle on mobile for simplicity or just keep hamburger */}
                <div className="w-5 h-0.5 bg-black dark:bg-white rounded-full transition-colors"></div>
                <div className="w-4 h-0.5 bg-black/60 dark:bg-white/60 rounded-full transition-colors"></div>
                <div className="w-5 h-0.5 bg-black dark:bg-white rounded-full transition-colors"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-screen items-center">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="relative">

            <AnimatePresence mode="wait">
              {showAuth ? (
                <motion.div
                  key="login-flow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-sm p-8 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl transition-colors duration-300"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-8 min-h-[400px]">
                      {/* Technical Spinner */}
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-t-2 border-black dark:border-white rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                        <div className="absolute inset-3 border-r-2 border-black/50 dark:border-white/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                        <div className="absolute inset-8 border-b-2 border-black/30 dark:border-white/30 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_white]"></div>
                        </div>
                      </div>

                      <div className="text-center space-y-3">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-xs font-mono text-black dark:text-white tracking-[0.3em] font-bold"
                        >
                          Authenticating
                        </motion.div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-mono text-black/40 dark:text-white/40 tracking-widest">
                            Establishing secure uplink
                          </span>
                          <span className="text-[9px] font-mono text-black/30 dark:text-white/30 tracking-widest animate-pulse">
                            Verifying credentials...
                          </span>
                        </div>
                      </div>

                      {/* Fake terminal log */}
                      <div className="w-full max-w-[200px] border-t border-black/10 dark:border-white/10 pt-4 mt-4">
                        <div className="flex flex-col gap-1 opacity-50">
                          <div className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40">
                            <span>&gt; Handshake init</span>
                            <span className="text-green-600 dark:text-green-500">OK</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40">
                            <span>&gt; Key exchange</span>
                            <span className="text-green-600 dark:text-green-500">OK</span>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40"
                          >
                            <span>&gt; Decrypting token</span>
                            <span className="animate-pulse">...</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <div className="flex items-center gap-4 mb-3">
                          <button
                            type="button"
                            onClick={() => setAuthMode('login')}
                            className={`font-mono text-xs tracking-[0.2em] transition-colors py-1 ${authMode === 'login' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'}`}
                          >
                            Login
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className={`font-mono text-xs tracking-[0.2em] transition-colors py-1 ${authMode === 'register' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'}`}
                          >
                            Register
                          </button>
                        </div>
                        <p className="text-[10px] text-black/30 dark:text-white/30 font-mono tracking-wider mb-8">
                          {authMode === 'login' ? 'Authentication Required' : 'Invite Only - Access Code Required'}
                        </p>
                      </div>

                      <form className="space-y-6" onSubmit={handleAuth}>
                        <div className="space-y-4">
                          {authMode === 'register' && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-black/40 dark:text-white/40 tracking-[0.2em] ml-1">Identity token</label>
                              <input
                                name="name"
                                type="text"
                                placeholder="Full name"
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[9px] font-mono text-black/40 dark:text-white/40 tracking-[0.2em] ml-1">Access node</label>
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="Email address"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-mono text-black/40 dark:text-white/40 tracking-[0.2em] ml-1">Security key</label>
                            <input
                              name="password"
                              type="password"
                              required
                              placeholder="Password"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                            />
                          </div>

                          {authMode === 'register' && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-black/40 dark:text-white/40 tracking-[0.2em] ml-1">Access code</label>
                              <input
                                name="accessCode"
                                type="text"
                                required
                                placeholder="Invite code"
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                              />
                            </div>
                          )}
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 font-mono text-[9px] tracking-wider border border-red-500/20 p-3 bg-red-500/5 rounded-lg"
                          >
                            {error}
                          </motion.div>
                        )}

                        <div className="flex flex-col gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs tracking-widest hover:opacity-90 transition-all duration-200 disabled:opacity-50 rounded-xl font-bold"
                          >
                            {loading ? "Initializing..." : authMode === 'login' ? "Login" : "Create account"}
                          </button>

                          <div className="flex items-center gap-3 px-2">
                            <div className="flex-1 h-px bg-black/5 dark:bg-white/5"></div>
                            <span className="text-[8px] font-mono text-black/20 dark:text-white/20 tracking-[0.3em]">Or OAuth</span>
                            <div className="flex-1 h-px bg-black/5 dark:bg-white/5"></div>
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 py-3.5 px-4 flex items-center justify-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 transition-all group text-black dark:text-white rounded-xl"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="font-mono text-[10px] tracking-[0.2em]">Sign in with Google</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowAuth(false)}
                            className="text-[9px] font-mono text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white tracking-widest pt-2 transition-colors"
                          >
                            [ Abort sequence ]
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="hero-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left side: Typography & CTA */}
                    <div className="max-w-xl">
                      <h1 className="text-6xl lg:text-[96px] font-normal tracking-[-0.05em] leading-[0.9] text-zinc-900 dark:text-zinc-50 mb-10 font-sans">
                        Expand your reach <br /> in your own voice
                      </h1>
                      <p className="text-xl lg:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed font-sans max-w-sm">
                        In a world moving faster than ever, Olleey turns global distribution into clarity your team can act on.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => window.open("https://cal.com/ahmad-moltafet-q8mgvt", "_blank", "noopener,noreferrer")}
                          className="px-6 py-3 bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-full font-sans font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-sm"
                        >
                          Request a demo
                        </button>
                      </div>
                    </div>

                    {/* Right side: Product Screenshot */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="hidden lg:block absolute -top-[5%] right-[calc(50%-50vw)] h-[650px] w-[55vw] z-0 pointer-events-none"
                    >
                      <div className="relative h-full w-full bg-white dark:bg-zinc-900 border-y border-l border-zinc-200 dark:border-zinc-800 rounded-l-[2rem] shadow-2xl overflow-hidden ml-auto">
                        <Image
                          src="/herodashboard.png"
                          alt="Olleey dashboard screenshot"
                          fill
                          className="object-cover object-left"
                          priority
                        />
                         {/* Inner shadow for depth */}
                        <div className="absolute inset-0 shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[inset_10px_0_20px_-10px_rgba(255,255,255,0.05)] pointer-events-none" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute left-0 right-0 z-20 border-t border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-colors duration-300" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-black/50 dark:text-white/50 transition-colors duration-300">
            <span className="hidden lg:inline">Live</span>
            <span className="lg:hidden">Live</span>
            <div className="hidden lg:flex gap-1">
              {[12, 8, 14, 6, 10, 16, 5, 11].map((height, i) => (
                <div key={i} className="w-1 h-3 bg-black/30 dark:bg-white/30" style={{ height: `${height}px` }}></div>
              ))}
            </div>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-black/50 dark:text-white/50 transition-colors duration-300">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-black/60 dark:bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-black/40 dark:bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black shadow-2xl overflow-hidden group"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-white/80 tracking-widest">Demo playback.mp4</span>
                </div>
                <button
                  onClick={() => setShowDemo(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <video
                src="/speaker.mp4"
                className="w-full h-full object-cover"
                autoPlay
                controls
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .dither-pattern {
          background-image: 
            repeating-linear-gradient(0deg, transparent 0px, transparent 1px, black 1px, black 2px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 1px, black 1px, black 2px);
          background-size: 3px 3px;
        }
        .dark .dither-pattern {
            background-image: 
            repeating-linear-gradient(0deg, transparent 0px, transparent 1px, white 1px, white 2px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 1px, white 1px, white 2px);
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
