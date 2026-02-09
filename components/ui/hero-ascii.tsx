'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      {/* Video Placeholder - Desktop Right */}
      <div className="hidden lg:flex absolute top-1/2 right-[5%] w-[45%] max-w-[700px] aspect-video -translate-y-1/2 items-center justify-center z-10">
        <div className="w-full h-full bg-white dark:bg-black rounded-3xl border border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.15)] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-colors duration-300" onClick={() => setShowDemo(true)}>
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e20_1px,transparent_1px),linear-gradient(to_bottom,#22c55e20_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 group-hover:opacity-30 transition-opacity" />
            
            {/* Play Button */}
            <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[22px] border-l-green-400 border-b-[12px] border-b-transparent ml-2"></div>
            </div>
            
            <p className="mt-6 text-green-400/80 font-mono text-xs uppercase tracking-[0.2em] group-hover:text-green-400 transition-colors">
                Watch_Demo.mp4
            </p>
        </div>
      </div>

      {/* Mobile stars background */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg opacity-0 dark:opacity-100 transition-opacity duration-300"></div>

      {/* Top Header - Seamless with Hero */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 lg:w-9 lg:h-9 transition-transform group-hover:scale-110">
                <Image
                  src="/images/translogowhite.png"
                  alt="Olleey Logo"
                  fill
                  className="object-contain dark:filter-none invert transition-all duration-300"
                />
              </div>
              <span className="font-mono text-white text-lg lg:text-xl font-bold tracking-wider group-hover:text-white/90 transition-colors">
                olleey
              </span>
            </Link>

            {/* Center: Nav Links - Subtle Pill Style */}
            <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/[0.05] backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-full p-1 transition-colors duration-300">
              {navLinks?.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.label === 'HOME') {
                      e.preventDefault();
                      setShowAuth(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 text-[11px] font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all tracking-wider uppercase rounded-full cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
               {/* Theme Toggle */}
               <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden lg:flex items-center justify-center w-8 h-8"
                  aria-label="Toggle theme"
               >
                  {theme === 'dark' ? 
                    <Moon className="w-4 h-4 text-white" /> : 
                    <Sun className="w-4 h-4 text-black" />
                  }
               </button>

              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuth(true);
                }}
                className="hidden lg:block text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors tracking-wider"
              >
                Log in
              </button>

              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuth(true);
                }}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-bold tracking-wider rounded-full transition-all hover:bg-black/90 dark:hover:bg-white/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
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

      {/* Corner Frame Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-black/30 dark:border-white/30 z-20 transition-colors duration-300"></div>
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-black/30 dark:border-white/30 z-20 transition-colors duration-300"></div>
      <div className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-black/30 dark:border-white/30 z-20 transition-colors duration-300" style={{ bottom: '5vh' }}></div>
      <div className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-black/30 dark:border-white/30 z-20 transition-colors duration-300" style={{ bottom: '5vh' }}></div>

      <div className="relative z-10 flex min-h-screen items-center pt-16 lg:pt-0" style={{ marginTop: '5vh' }}>
        <div className="container mx-auto px-6 lg:px-16 lg:ml-[10%]">
          <div className="max-w-lg relative">
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-black dark:bg-white transition-colors duration-300"></div>
              <span className="text-black dark:text-white text-[10px] font-mono tracking-wider transition-colors duration-300">SYS.INIT.01</span>
              <div className="flex-1 h-px bg-black dark:bg-white transition-colors duration-300"></div>
            </div>

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
                          AUTHENTICATING
                        </motion.div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">
                            Establishing secure uplink
                          </span>
                          <span className="text-[9px] font-mono text-black/30 dark:text-white/30 uppercase tracking-widest animate-pulse">
                            Verifying credentials...
                          </span>
                        </div>
                      </div>

                      {/* Fake terminal log */}
                      <div className="w-full max-w-[200px] border-t border-black/10 dark:border-white/10 pt-4 mt-4">
                        <div className="flex flex-col gap-1 opacity-50">
                          <div className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40">
                            <span>&gt; HANDSHAKE_INIT</span>
                            <span className="text-green-600 dark:text-green-500">OK</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40">
                            <span>&gt; KEY_EXCHANGE</span>
                            <span className="text-green-600 dark:text-green-500">OK</span>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex justify-between text-[8px] font-mono text-black/40 dark:text-white/40"
                          >
                            <span>&gt; DECRYPTING_TOKEN</span>
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
                            LOGIN
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className={`font-mono text-xs tracking-[0.2em] transition-colors py-1 ${authMode === 'register' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'}`}
                          >
                            REGISTER
                          </button>
                        </div>
                        <p className="text-[10px] text-black/30 dark:text-white/30 font-mono tracking-wider uppercase mb-8">
                          {authMode === 'login' ? 'Authentication Required' : 'Invite Only - Access Code Required'}
                        </p>
                      </div>

                      <form className="space-y-6" onSubmit={handleAuth}>
                        <div className="space-y-4">
                          {authMode === 'register' && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-1">Identity_Token</label>
                              <input
                                name="name"
                                type="text"
                                placeholder="FULL NAME"
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-1">Access_Node</label>
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="EMAIL ADDRESS"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-1">Security_Key</label>
                            <input
                              name="password"
                              type="password"
                              required
                              placeholder="PASSWORD"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                            />
                          </div>

                          {authMode === 'register' && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-1">Access_Code</label>
                              <input
                                name="accessCode"
                                type="text"
                                required
                                placeholder="INVITE CODE"
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black/40 dark:focus:border-white/40 focus:bg-black/5 dark:focus:bg-white/5 transition-all placeholder:text-black/20 dark:placeholder:text-white/10"
                              />
                            </div>
                          )}
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 font-mono text-[9px] uppercase tracking-wider border border-red-500/20 p-3 bg-red-500/5 rounded-lg"
                          >
                            {error}
                          </motion.div>
                        )}

                        <div className="flex flex-col gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-200 disabled:opacity-50 rounded-xl font-bold"
                          >
                            {loading ? "INITIALIZING..." : authMode === 'login' ? "Login" : "Create Account"}
                          </button>

                          <div className="flex items-center gap-3 px-2">
                            <div className="flex-1 h-px bg-black/5 dark:bg-white/5"></div>
                            <span className="text-[8px] font-mono text-black/20 dark:text-white/20 uppercase tracking-[0.3em]">OR_OAUTH</span>
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
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Sign in with Google</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowAuth(false)}
                            className="text-[9px] font-mono text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white uppercase tracking-widest pt-2 transition-colors"
                          >
                            [ Abort Sequence ]
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
                >
                  {/* Main Value Prop Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-full backdrop-blur-sm transition-colors duration-300"
                  >
                    <div className="flex -space-x-1">
                      <span className="text-sm">🇺🇸</span>
                      <span className="text-sm">→</span>
                      <span className="text-sm">🇪🇸</span>
                      <span className="text-sm">🇫🇷</span>
                      <span className="text-sm">🇩🇪</span>
                      <span className="text-sm">🇯🇵</span>
                      <span className="text-sm">🇧🇷</span>
                    </div>
                    <span className="text-[10px] font-mono text-black/80 dark:text-white/80 uppercase tracking-wider transition-colors duration-300">+10 Languages</span>
                  </motion.div>

                  {/* Title with dithered accent */}
                  <div className="relative">
                    <div className="hidden lg:block absolute -left-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
                    <h1 className="text-2xl lg:text-5xl font-bold text-black dark:text-white mb-3 lg:mb-4 leading-tight font-mono tracking-wider transition-colors duration-300" style={{ letterSpacing: '0.05em' }}>
                      Your content in 10+ languages —
                      <span className="block bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mt-1 lg:mt-2">
                         in your voice.
                      </span>
                    </h1>
                  </div>

                  {/* Decorative dots pattern - desktop only */}
                  <div className="hidden lg:flex gap-1 mb-3 opacity-40">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="w-0.5 h-0.5 bg-black dark:bg-white rounded-full transition-colors duration-300"></div>
                    ))}
                  </div>

                  {/* Clear Value Proposition */}
                  <div className="relative mb-6">
                    <p className="text-sm lg:text-lg text-black/90 dark:text-white/90 mb-3 leading-relaxed font-mono transition-colors duration-300">
                      Olleey translates your video, generates a natural voice match, and syncs speech timing so it feels native in every market.
                    </p>
                    <p className="text-xs lg:text-sm text-neutral-600 dark:text-gray-400 leading-relaxed font-mono transition-colors duration-300">
                      Built for creators and teams expanding globally.
                    </p>
                  </div>

                  {/* Quick Stats/Trust Indicators */}


                  {/* Buttons with technical accents */}
                  <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">


                    <button
                      onClick={() => setShowDemo(true)}
                      className="relative px-6 py-3 bg-transparent border border-black/30 dark:border-white text-black dark:text-white font-mono text-xs lg:text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 rounded-full"
                    >
                      SEE IT IN ACTION
                    </button>
                  </div>

                  {/* Social Proof */}
                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 transition-colors duration-300">
                    <p className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-wider transition-colors duration-300">
                      Trusted by creators reaching <span className="text-black/70 dark:text-white/70">millions</span> of viewers globally
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom technical notation - desktop only */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-40">
              <span className="text-black dark:text-white text-[9px] font-mono transition-colors duration-300">∞</span>
              <div className="flex-1 h-px bg-black dark:bg-white transition-colors duration-300"></div>
              <span className="text-black dark:text-white text-[9px] font-mono transition-colors duration-300">OLLEEY_AI_ENGINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute left-0 right-0 z-20 border-t border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-colors duration-300" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-black/50 dark:text-white/50 transition-colors duration-300">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <div className="hidden lg:flex gap-1">
              {[12, 8, 14, 6, 10, 16, 5, 11].map((height, i) => (
                <div key={i} className="w-1 h-3 bg-black/30 dark:bg-white/30" style={{ height: `${height}px` }}></div>
              ))}
            </div>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-black/50 dark:text-white/50 transition-colors duration-300">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-black/60 dark:bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-black/40 dark:bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
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
              className="relative w-full max-w-4xl aspect-video bg-black border border-white/20 shadow-2xl overflow-hidden group"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Technical Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/40" />

              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-white/80 tracking-widest">DEMO_PLAYBACK.MP4</span>
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


