"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { SignInPage, type Testimonial } from "@/components/ui/sign-in";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";
import { useTheme } from "@/lib/useTheme";
import { useRouter } from "next/navigation";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const sampleTestimonials: Testimonial[] = [];

import Link from "next/link";

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic client-side validation
    if (!email || !email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (!password || !password.trim()) {
      setError("Please enter your password.");
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email.trim(), password);
      console.log('[Login] ✅ Sign in successful');
      onLoginSuccess();
    } catch (err: any) {
      console.error('[Login] Sign in error:', err);
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(err.message || friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // Redirect happens automatically via Supabase
    } catch (err: any) {
      console.error('[Login] Google sign in error:', err);
      setError(err.message || "Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset with Supabase
    console.log("Reset password clicked");
    alert("Password reset will be implemented soon");
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <Link href="/" className="fixed top-8 left-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Go Home
      </Link>
      <div className="relative z-10 w-full h-full">
        <SignInPage
          title={
            <div className="flex flex-col items-start gap-4 mb-2">
              <span className="font-light text-foreground tracking-tighter">
                Welcome to <span className="font-semibold">olleey</span>
              </span>
            </div>
          }
          description="Sign in to your account and continue your journey with us"
          heroImageSrc="https://wallpapercave.com/wp/wp4975107.jpg"
          testimonials={sampleTestimonials}
          onSignIn={handleSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          googleButtonRef={googleButtonRef}
          onResetPassword={handleResetPassword}
          onCreateAccount={handleCreateAccount}
        />
        {/* Error display overlay */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm shadow-lg z-50 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium mb-1">Sign in failed</p>
                <p className="text-sm leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors flex-shrink-0"
                aria-label="Close error message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-foreground">Signing in...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
