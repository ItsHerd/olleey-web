"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";
import { SignUpPage } from "@/components/ui/sign-in";
import { useTheme } from "@/lib/useTheme";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegisterPageProps {
    onRegisterSuccess: () => void;
}

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const accessCode = formData.get("accessCode") as string;

        // Invite-only validation
        if (!accessCode || accessCode.trim() !== "olleey2026") {
            setError("Invalid or missing invite access code. This platform is currently by invitation only.");
            setIsLoading(false);
            return;
        }

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
            await signUp(email.trim(), password, name?.trim());
            console.log('[Register] ✅ Registration successful');
            onRegisterSuccess();
        } catch (err: any) {
            console.error('[Register] Registration error:', err);
            const friendlyMessage = getUserFriendlyErrorMessage(err);
            setError(err.message || friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            await signInWithGoogle();
            // Redirect happens automatically via Supabase
        } catch (err: any) {
            console.error('[Register] Google sign up error:', err);
            setError(err.message || "Google sign-up failed. Please try again.");
            setIsLoading(false);
        }
    };

    const handleSignInClick = () => {
        router.push("/login");
    };

    return (
        <div className={`min-h-screen ${bgClass} ${textClass}`}>
            <Link href="/" className="fixed top-8 left-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Go Home
            </Link>
            <div className="relative z-10 w-full h-full">

                <SignUpPage
                    title={<span className="font-light text-foreground tracking-tighter">Join <span className="font-semibold">olleey</span></span>}
                    description="Olleey is currently by invitation only. Please enter your invite access code to create your account."
                    heroImageSrc="https://prcdn.freetls.fastly.net/release_image/25003/2706/25003-2706-bc8c6db8376f553272c6165ba6071223-924x1200.jpg?width=1950&height=1350&quality=85%2C65&format=jpeg&auto=webp&fit=bounds&bg-color=fff"
                    onSignUp={handleRegister}
                    onGoogleSignUp={handleGoogleSignUp}
                    onSignInClick={handleSignInClick}
                />

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
                            <p className="text-foreground">Creating account...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
