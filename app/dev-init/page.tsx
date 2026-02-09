'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Development page to initialize the demo user
 * Visit /dev-init to automatically set the userId in localStorage
 * and redirect to the dashboard
 */
export default function DevInitPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set the demo user ID
      localStorage.setItem('userId', 'test_user_001');
      console.log('[Dev Init] ✓ Set userId to test_user_001 (demo@olleey.com)');
      
      // Optional: Clear any stale cache
      console.log('[Dev Init] ✓ Clearing any stale data...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        console.log('[Dev Init] ✓ Redirecting to dashboard...');
        router.push('/app');
      }, 1000);
    }
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080808]">
      <div className="text-center space-y-6 p-12 bg-white/5 border border-white/10 rounded-3xl max-w-md">
        <div className="w-16 h-16 bg-olleey-yellow/10 rounded-2xl flex items-center justify-center mx-auto border border-olleey-yellow/20">
          <svg 
            className="w-8 h-8 text-olleey-yellow animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Initializing Demo User
          </h1>
          <p className="text-sm text-white/40 font-light">
            Setting up test_user_001
          </p>
          <p className="text-xs text-white/20 font-mono">
            demo@olleey.com
          </p>
        </div>
        
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Authenticating
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
