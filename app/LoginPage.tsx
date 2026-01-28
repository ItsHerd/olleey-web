"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { authAPI, type LoginCredentials } from "@/lib/api";
import { SignInPage, type Testimonial } from "@/components/ui/sign-in";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";
import { useGoogleSignIn } from "@/lib/useGoogleSignIn";
import { useTheme } from "@/lib/useTheme";
import { useRouter } from "next/navigation";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const sampleTestimonials: Testimonial[] = [

];

import Link from "next/link";

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { theme } = useTheme();
  const router = useRouter();

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
      const credentials: LoginCredentials = { email: email.trim(), password };
      await authAPI.login(credentials);
      onLoginSuccess();
    } catch (err) {
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyMessage);

      // Only show alert for network errors (since they might need user attention)
      if (isNetworkError(err)) {
        alert(friendlyMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In response
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setIsLoading(true);

    try {
      // Send the Google ID token to your backend
      // Backend handles both login and registration automatically
      await authAPI.googleAuth(credentialResponse.credential);
      onLoginSuccess();
    } catch (err) {
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyMessage);
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
    setIsLoading(false);
  };

  // Initialize Google Sign-In
  const { renderButton, showOneTap } = useGoogleSignIn({
    clientId: GOOGLE_CLIENT_ID,
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    context: 'signin',
    uxMode: 'redirect', // This provides the full-screen experience
  });

  // Render Google Sign-In button when component mounts
  useEffect(() => {
    if (googleButtonRef.current && GOOGLE_CLIENT_ID) {
      renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 400,
        logo_alignment: 'center'
      });
    }
  }, [renderButton]);

  const handleGoogleSignIn = () => {
    if (GOOGLE_CLIENT_ID) {
      // Trigger full-screen redirect to Google
      const authUrl = authAPI.getGoogleAuthUrl(GOOGLE_CLIENT_ID);
      window.location.href = authUrl;
    } else {
      setError("Google Sign-In is not configured.");
    }
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset
    console.log("Reset password clicked");
    alert("Password reset will be implemented soon");
  };

  const handleCreateAccount = () => {
    // Navigate to registration page
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
          heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
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
