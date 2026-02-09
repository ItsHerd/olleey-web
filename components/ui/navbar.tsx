"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useThemeContext } from "@/lib/ThemeContext";
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  navLinks?: { label: string; href: string }[];
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function Navbar({ navLinks, onSignIn, onSignUp }: NavbarProps) {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6 transition-all duration-300">
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
              <span className="font-mono text-black dark:text-white text-lg lg:text-xl font-bold tracking-wider group-hover:text-black/90 dark:group-hover:text-white/90 transition-colors">
                olleey
              </span>
            </Link>

            {/* Center: Nav Links - Subtle Pill Style */}
            <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/[0.05] backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-full p-1 transition-colors duration-300">
              {navLinks?.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[11px] font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all tracking-wider uppercase rounded-full cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
               {/* Theme Toggle */}
               <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center w-8 h-8"
                  aria-label="Toggle theme"
               >
                  {theme === 'dark' ? 
                    <Moon className="w-4 h-4 text-white" /> : 
                    <Sun className="w-4 h-4 text-black" />
                  }
               </button>

              <button
                onClick={onSignIn}
                className="hidden lg:block text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors tracking-wider"
              >
                Log in
              </button>

              <button
                onClick={onSignUp}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-bold tracking-wider rounded-full transition-all hover:bg-black/90 dark:hover:bg-white/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
