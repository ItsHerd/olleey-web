"use client";

import { useState } from "react";
import { authAPI, type LoginCredentials } from "@/lib/api";
import { SignInPage, type Testimonial } from "@/components/ui/sign-in";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const sampleTestimonials: Testimonial[] = [

];

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log("Google sign-in clicked");
    alert("Google sign-in will be implemented soon");
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset
    console.log("Reset password clicked");
    alert("Password reset will be implemented soon");
  };

  const handleCreateAccount = () => {
    // TODO: Navigate to registration page
    console.log("Create account clicked");
    alert("Account creation will be implemented soon");
  };

  return (
    <div className="bg-background text-foreground">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-background/80 border border-border/50"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
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
  );
}
