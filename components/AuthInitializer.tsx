'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Auth Initializer
 * Monitors auth state and provides debug info
 */
export function AuthInitializer() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      console.log('[AuthInit] Loading auth state...');
      return;
    }

    if (user) {
      console.log('[AuthInit] ✅ User authenticated:', {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name
      });
    } else {
      console.log('[AuthInit] No user authenticated');
    }
  }, [user, loading]);

  return null;
}
