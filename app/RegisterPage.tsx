"use client";

import { useState, useRef, useEffect } from "react";
import { authAPI, type RegisterData } from "@/lib/api";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";
import { useGoogleSignIn } from "@/lib/useGoogleSignIn";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

interface RegisterPageProps {
    onRegisterSuccess: () => void;
}

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Basic client-side validation
        if (!email || !email.trim()) {
            setError("Please enter your email address.");
            setIsLoading(false);
            return;
        }

        if (!password || !password.trim()) {
            setError("Please enter a password.");
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const registerData: RegisterData = {
                email: email.trim(),
                password,
                name: name?.trim() || undefined,
            };
            await authAPI.register(registerData);
            onRegisterSuccess();
        } catch (err) {
            const friendlyMessage = getUserFriendlyErrorMessage(err);
            setError(friendlyMessage);

            // Only show alert for network errors
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
            onRegisterSuccess();
        } catch (err) {
            const friendlyMessage = getUserFriendlyErrorMessage(err);
            setError(friendlyMessage);
            console.error("Google authentication error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google registration failed. Please try again.");
        setIsLoading(false);
    };

    // Initialize Google Sign-In
    const { renderButton, showOneTap } = useGoogleSignIn({
        clientId: GOOGLE_CLIENT_ID,
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        context: 'signup',
        uxMode: 'redirect', // Full-screen experience
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

    const handleGoogleSignUp = () => {
        if (GOOGLE_CLIENT_ID) {
            const authUrl = authAPI.getGoogleAuthUrl(GOOGLE_CLIENT_ID);
            window.location.href = authUrl;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            {/* Back to Home Button */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-background/80 border border-border/50"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center">
                            <img src="/logo-transparent.png" alt="" className="w-auto h-24" />

                        </div>
                        <h1 className="text-3xl xl:text-4xl font-300 leading-tight mb-2">
                            Welcome to Olleey
                        </h1>
                        <p className="text-muted-foreground">
                            Join olleey and start reaching global audiences
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form className="space-y-5" onSubmit={handleRegister}>
                        {/* Name Field */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Full Name (Optional)
                            </label>
                            <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Email Address
                            </label>
                            <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Password
                            </label>
                            <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password (min. 8 characters)"
                                        className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Confirm Password
                            </label>
                            <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center">
                        <span className="w-full border-t border-border"></span>
                        <span className="px-4 text-sm text-muted-foreground bg-background absolute">
                            Or continue with
                        </span>
                    </div>

                    {/* Google Sign-Up Button */}
                    <button
                        onClick={handleGoogleSignUp}
                        className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C37.023 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                    </button>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/app"
                            className="text-violet-400 hover:underline transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>

                    <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground/60">
                        <Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Error display overlay */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm shadow-lg z-50 max-w-md">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <p className="font-medium mb-1">Registration failed</p>
                            <p className="text-sm leading-relaxed">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors flex-shrink-0"
                            aria-label="Close error message"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-4">
                        <svg
                            className="animate-spin h-8 w-8 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
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
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="text-foreground">Creating your account...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
