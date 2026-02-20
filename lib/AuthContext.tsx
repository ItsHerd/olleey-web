'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[SupabaseAuth] Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      // Sync access tokens for authenticatedFetch
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
        console.log('[SupabaseAuth] ✅ Synced Supabase tokens to localStorage');
      }

      // Sync userId to localStorage for backward compatibility
      if (session?.user) {
        localStorage.setItem('userId', session.user.id);
        console.log('[SupabaseAuth] ✅ Set userId in localStorage:', session.user.id);

        // Sync user to users table
        syncUserToDatabase(session.user);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[SupabaseAuth] Auth state changed:', _event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      // Sync access tokens
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }

      // Sync userId to localStorage
      if (session?.user) {
        localStorage.setItem('userId', session.user.id);
        console.log('[SupabaseAuth] ✅ Updated userId in localStorage:', session.user.id);

        // Sync user to users table (important for OAuth sign-ins)
        if (_event === 'SIGNED_IN') {
          syncUserToDatabase(session.user);
        }
      } else {
        localStorage.removeItem('userId');
        console.log('[SupabaseAuth] Removed userId from localStorage');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for global session expiration from legacy API
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[SupabaseAuth] ⚠️ Session expired event received, signing out...');
      signOut();
    };

    window.addEventListener('olleey-session-expired', handleSessionExpired);
    return () => window.removeEventListener('olleey-session-expired', handleSessionExpired);
  }, []);

  // Helper function to sync user to database
  const syncUserToDatabase = async (user: User) => {
    try {
      console.log('[SupabaseAuth] Syncing user to database:', user.id);

      const { error } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
          is_active: true,
          preferences: { theme: 'dark', language: 'en' },
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('[SupabaseAuth] Could not sync user to users table:', error);
      } else {
        console.log('[SupabaseAuth] ✅ User synced to database');
      }
    } catch (err) {
      console.error('[SupabaseAuth] Error syncing user:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[SupabaseAuth] Signing in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[SupabaseAuth] Sign in error:', error);
      throw error;
    }

    console.log('[SupabaseAuth] ✅ Sign in successful:', data.user?.id);

    // Store userId in localStorage
    if (data.user && data.session) {
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('access_token', data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      // Also ensure user exists in users table
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          user_id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          is_active: true,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.warn('[SupabaseAuth] Could not sync user to users table:', upsertError);
      }
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    console.log('[SupabaseAuth] Signing up:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Sign up error:', error);
      throw error;
    }

    console.log('[SupabaseAuth] ✅ Sign up successful:', data.user?.id);

    // Store userId in localStorage
    if (data.user && data.session) {
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('access_token', data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      // Create user in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          name: name || data.user.email?.split('@')[0],
          is_active: true,
          preferences: { theme: 'dark', language: 'en' },
        });

      if (insertError) {
        console.warn('[SupabaseAuth] Could not create user in users table:', insertError);
      }
    }
  };

  const signOut = async () => {
    console.log('[SupabaseAuth] Signing out');
    await supabase.auth.signOut();
    localStorage.removeItem('userId');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('[SupabaseAuth] ✅ Signed out, cleared userId');
    window.location.href = '/';
  };

  const signInWithGoogle = async () => {
    console.log('[SupabaseAuth] Signing in with Google');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Google sign in error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
