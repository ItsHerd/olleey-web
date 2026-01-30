"use client";

import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
  navLinks?: { label: string; href: string }[];
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function Navbar({ navLinks, onSignIn, onSignUp }: NavbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Link href="/" className="flex items-center gap-2 lg:gap-4 group">
            <div className="relative w-6 h-6 lg:w-8 lg:h-8 transition-transform group-hover:scale-105">
              <Image
                src="/images/translogowhite.png"
                alt="Olleey Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest group-hover:text-white/90 transition-colors">
              olleey
            </div>
            </Link>
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
              onClick={onSignIn}
              className="text-xs font-mono text-white/80 hover:text-white tracking-wider"
            >
              LOG IN
            </button>
            <button 
              onClick={onSignUp}
              className="px-4 py-1.5 border border-white/40 text-xs font-mono text-white hover:bg-white hover:text-black transition-all duration-200 tracking-wider"
            >
              GET STARTED
            </button>
          </div>

          <div className="lg:hidden text-white font-mono text-xs">Menu</div>
        </div>
      </div>
  );
}
