"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
            <div className="max-w-3xl mx-auto px-6 py-20">
                {/* Navigation */}
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </Link>

                {/* Header */}
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: January 22, 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-12 prose prose-invert prose-violet">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At Olleey, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We collect information you provide directly to us, such as when you create an account, update your profile, or use our video processing features. This may include:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Contact information (email address, full name)</li>
                            <li>Authentication data (via Google OAuth or email/password)</li>
                            <li>Content and media you upload for processing</li>
                            <li>Usage data and preferences</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Google OAuth</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you use Google Sign-In, we receive your email and basic profile information (name and profile picture) as permitted by Google. We use this information solely for account creation and authentication purposes. We do not access your Google Drive or other Google services without explicit permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">4. How We Use Information</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Personalize your experience</li>
                            <li>Communicate with you about updates and security</li>
                            <li>Monitor and analyze trends in usage</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your information from unauthorized access, loss, or disclosure. All sensitive data is encrypted and stored securely.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at support@olleey.com.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground italic">
                        Expanding horizons, securely. &copy; 2026 Olleey Inc.
                    </p>
                </footer>
            </div>
        </div>
    );
}
