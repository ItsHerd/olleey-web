"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
            <div className="max-w-4xl mx-auto px-6 py-20">
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
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: January 23, 2026</p>
                    <p className="text-muted-foreground mt-2">Effective date: January 23, 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-12 prose prose-invert prose-violet max-w-none">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Welcome to Olleey. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Olleey Inc. ("Olleey," "we," "us," or "our") governing your access to and use of our AI-powered video localization and dubbing platform, including our website, applications, and all related services (collectively, the "Service").
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By creating an account, accessing, or using any part of the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you do not agree to all of these Terms, you are expressly prohibited from using the Service and must discontinue use immediately.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content. You represent and warrant that you have the legal capacity to enter into these Terms and that you are at least 13 years of age (or the age of majority in your jurisdiction).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Olleey provides an AI-driven platform for video content processing, localization, and dubbing. Our Service includes, but is not limited to:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.1 Core Features</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Video Upload and Management:</strong> Upload, store, and organize your video content</li>
                            <li><strong>AI Transcription:</strong> Automatic speech-to-text transcription of video audio</li>
                            <li><strong>Translation Services:</strong> AI-powered translation of transcripts into multiple languages</li>
                            <li><strong>Voice Dubbing:</strong> AI-generated voice dubbing using advanced text-to-speech technology</li>
                            <li><strong>Lip-Sync Processing:</strong> Visual synchronization of lip movements with dubbed audio</li>
                            <li><strong>YouTube Integration:</strong> Direct connection with your YouTube channels for seamless content management</li>
                            <li><strong>Analytics Dashboard:</strong> Track processing status, view analytics, and manage projects</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.2 Service Modifications</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We reserve the right to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Modify, suspend, or discontinue any part of the Service at any time</li>
                            <li>Add or remove features without prior notice</li>
                            <li>Impose limits on certain features or restrict access to parts of the Service</li>
                            <li>Update our AI models and processing algorithms to improve quality</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We will make reasonable efforts to notify you of material changes that significantly impact your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">3.1 Account Creation</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            To use certain features of the Service, you must create an account. You may register using:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Email and Password:</strong> Provide a valid email address and create a secure password</li>
                            <li><strong>Google OAuth:</strong> Authenticate using your Google account</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">3.2 Account Security</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You are responsible for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized access or security breach</li>
                            <li>Ensuring your account information is accurate and up-to-date</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree to use a strong, unique password and enable two-factor authentication when available. We are not liable for any loss or damage arising from your failure to maintain account security.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">3.3 Account Restrictions</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>You may only create one account per person or entity</li>
                            <li>You may not share your account with others</li>
                            <li>You may not create an account using false or misleading information</li>
                            <li>You may not create an account if you have been previously banned</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Acceptable Use Policy</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.1 Prohibited Content</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Upload content that infringes on intellectual property rights of others</li>
                            <li>Process content containing hate speech, violence, or illegal activities</li>
                            <li>Upload sexually explicit, pornographic, or obscene material</li>
                            <li>Process content that promotes terrorism, extremism, or harmful activities</li>
                            <li>Upload content containing personal information of others without consent</li>
                            <li>Process deepfakes or misleading content intended to deceive</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.2 Prohibited Activities</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                            <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                            <li>Use automated systems (bots, scrapers) without written permission</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                            <li>Circumvent any security features or usage limitations</li>
                            <li>Resell or redistribute the Service without authorization</li>
                            <li>Use the Service to spam, phish, or distribute malware</li>
                            <li>Impersonate any person or entity</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.3 AI Model Usage</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>You may not attempt to extract, copy, or replicate our AI models</li>
                            <li>You may not use our Service to train competing AI models</li>
                            <li>You may not abuse the Service to generate excessive or wasteful processing requests</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.4 Enforcement</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to investigate violations of these Terms and take appropriate action, including removing content, suspending or terminating accounts, and reporting illegal activity to law enforcement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Intellectual Property Rights</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">5.1 Your Content</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You retain all ownership rights to the content you upload to Olleey ("Your Content"). By uploading content, you:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Represent and warrant that you own or have the necessary rights to Your Content</li>
                            <li>Represent that Your Content does not violate any third-party rights</li>
                            <li>Grant Olleey a worldwide, non-exclusive, royalty-free license to process, store, and modify Your Content solely to provide the Service</li>
                            <li>Understand that processed content (translations, dubs, etc.) is provided to you under your ownership</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">5.2 Our Intellectual Property</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            The Service and its original content, features, and functionality are and will remain the exclusive property of Olleey. This includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Software, algorithms, and AI models</li>
                            <li>User interface design and layout</li>
                            <li>Trademarks, logos, and branding</li>
                            <li>Documentation and training materials</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            The Service is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">5.3 Feedback</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            If you provide us with feedback, suggestions, or ideas about the Service, you grant us an unrestricted, perpetual, irrevocable license to use, modify, and incorporate such feedback without compensation or attribution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.1 Disclaimer of Damages</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            IN NO EVENT SHALL OLLEEY, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                            <li>Loss of profits, revenue, data, or use</li>
                            <li>Loss of or damage to business reputation or goodwill</li>
                            <li>Business interruption or loss of business opportunity</li>
                            <li>Any damages arising from third-party services (Google, ElevenLabs, SyncLabs)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.2 Liability Cap</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Our total liability to you for any claims arising from or related to these Terms or the Service shall not exceed the greater of:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>The amount you paid to Olleey in the 12 months preceding the claim, or</li>
                            <li>$100 USD</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.3 Exceptions</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Governing Law and Jurisdiction</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Delaware, and you irrevocably consent to personal jurisdiction and venue in such courts.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            If you are a consumer in the European Union, you may also have the right to bring proceedings in the courts of your country of residence.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Payment and Billing</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.1 Subscription Plans</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Olleey offers various subscription plans with different features and usage limits. By subscribing, you agree to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Pay all fees associated with your selected plan</li>
                            <li>Provide accurate and complete billing information</li>
                            <li>Update your payment information promptly if it changes</li>
                            <li>Authorize us to charge your payment method on a recurring basis</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.2 Billing Cycle</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Frequency:</strong> Fees are billed in advance on a monthly or annual basis, depending on your plan</li>
                            <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date</li>
                            <li><strong>Payment Date:</strong> Charges occur on the same day each billing period</li>
                            <li><strong>Failed Payments:</strong> If payment fails, we may retry charging or suspend your account</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.3 Pricing Changes</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>We reserve the right to change our pricing at any time</li>
                            <li>Price changes will be communicated at least 30 days in advance</li>
                            <li>Existing subscribers will be grandfathered at their current rate for one billing cycle</li>
                            <li>Continued use after price change constitutes acceptance</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.4 Refunds</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>All fees are non-refundable except as required by law</li>
                            <li>No refunds or credits for partial months or unused processing credits</li>
                            <li>Refunds may be issued at our sole discretion for service outages or errors</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.5 Taxes</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for all applicable taxes (sales tax, VAT, GST, etc.). If we are required to collect taxes, they will be added to your invoice. You agree to provide any tax identification information we reasonably request.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Cancellation and Termination</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.1 Cancellation by You</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You may cancel your subscription at any time:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Cancel through your account settings</li>
                            <li>Cancellation takes effect at the end of your current billing period</li>
                            <li>You will retain access to paid features until the end of the billing period</li>
                            <li>No refunds for the current billing period</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.2 Account Deletion</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You may delete your account at any time:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>All your content will be permanently deleted within 30 days</li>
                            <li>This action is irreversible</li>
                            <li>Outstanding balances must be paid before deletion</li>
                            <li>We may retain certain data as required by law</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.3 Termination by Us</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We may suspend or terminate your account immediately, without prior notice, if:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>You violate these Terms or our Acceptable Use Policy</li>
                            <li>Your payment fails or account is past due</li>
                            <li>We suspect fraudulent, abusive, or illegal activity</li>
                            <li>We are required to do so by law</li>
                            <li>We discontinue the Service (with 30 days notice)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.4 Effect of Termination</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Upon termination, your right to use the Service immediately ceases. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Warranties and Disclaimers</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">10.1 Service Provided "AS IS"</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                            <li>Warranties that the Service will be uninterrupted, timely, secure, or error-free</li>
                            <li>Warranties regarding the accuracy, reliability, or quality of AI-generated content</li>
                            <li>Warranties that defects will be corrected</li>
                            <li>Warranties regarding results obtained from using the Service</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">10.2 AI Content Disclaimer</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Our AI-powered features are provided for convenience and efficiency. However:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>AI-generated translations may contain errors or inaccuracies</li>
                            <li>Dubbed voices may not perfectly match original tone or emotion</li>
                            <li>Lip-sync may not be perfect in all cases</li>
                            <li>You are responsible for reviewing and verifying all AI-generated content</li>
                            <li>We are not liable for any consequences of using AI-generated content</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">10.3 Third-Party Services</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We integrate with third-party services (Google, YouTube, ElevenLabs, SyncLabs). We are not responsible for the availability, accuracy, or reliability of these services. Your use of third-party services is subject to their respective terms and policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Indemnification</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree to defend, indemnify, and hold harmless Olleey and its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Your violation of these Terms or any applicable law or regulation</li>
                            <li>Your violation of any third-party rights, including intellectual property rights</li>
                            <li>Your Content or any content you upload to the Service</li>
                            <li>Your use or misuse of the Service</li>
                            <li>Any claim that Your Content caused damage to a third party</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed">
                            This indemnification obligation will survive termination of these Terms and your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Content Ownership and Licensing</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.1 Your Rights</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You retain complete ownership of all content you upload to Olleey, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Original video files</li>
                            <li>Audio tracks and transcripts</li>
                            <li>Processed content (translations, dubs, lip-synced videos)</li>
                            <li>Any derivative works created using our Service</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.2 License to Olleey</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By uploading content, you grant Olleey a limited, worldwide, non-exclusive, royalty-free license to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Store, process, and transmit your content</li>
                            <li>Modify and adapt your content solely to provide the Service</li>
                            <li>Generate transcripts, translations, and dubbed versions</li>
                            <li>Create backups and temporary copies for processing</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            This license exists solely to enable us to provide the Service and terminates when you delete your content or account.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.3 Your Representations</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By uploading content, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>You own all rights to the content or have obtained all necessary permissions</li>
                            <li>The content does not infringe any third-party intellectual property rights</li>
                            <li>The content complies with all applicable laws and regulations</li>
                            <li>You have obtained all necessary consents from individuals appearing in videos</li>
                            <li>The content does not violate our Acceptable Use Policy</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.4 Content Removal</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to remove any content that violates these Terms, infringes third-party rights, or is otherwise objectionable. We may also remove content in response to valid legal requests or court orders.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Dispute Resolution</h2>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.1 Informal Resolution</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Before filing a formal dispute, you agree to first contact us at <a href="mailto:legal@olleey.com" className="text-violet-400 hover:text-violet-300 underline">legal@olleey.com</a> to attempt to resolve the issue informally. We will work in good faith to resolve your concerns within 30 days.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.2 Binding Arbitration</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            If informal resolution fails, any dispute arising from these Terms or the Service shall be resolved through binding arbitration, except as provided below:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Arbitration will be conducted by the American Arbitration Association (AAA)</li>
                            <li>Arbitration will follow AAA's Commercial Arbitration Rules</li>
                            <li>Arbitration will be conducted in English</li>
                            <li>The arbitrator's decision will be final and binding</li>
                            <li>Judgment on the award may be entered in any court of competent jurisdiction</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.3 Class Action Waiver</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            YOU AND OLLEEY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.4 Exceptions</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Either party may seek injunctive or other equitable relief in court to protect intellectual property rights. Small claims court actions are also exempt from arbitration requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Modifications to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We reserve the right to modify these Terms at any time. When we make material changes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>We will update the "Last updated" date at the top of these Terms</li>
                            <li>We will notify you via email or prominent notice on the Service</li>
                            <li>Material changes will take effect 30 days after notification</li>
                            <li>Your continued use of the Service after changes take effect constitutes acceptance</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed">
                            If you do not agree to the modified Terms, you must stop using the Service and may cancel your account. We recommend reviewing these Terms periodically for changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Severability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If any provision of these Terms is found to be unenforceable, invalid, or illegal by a court of competent jurisdiction, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect. The unenforceable provision will be replaced with an enforceable provision that most closely reflects the original intent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">16. Entire Agreement</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            These Terms of Service, together with our Privacy Policy and any other legal notices or agreements published by us on the Service, constitute the entire agreement between you and Olleey regarding your use of the Service and supersede all prior agreements, understandings, and communications, whether written or oral.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term. Our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">17. Assignment</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You may not assign or transfer these Terms or your rights and obligations under these Terms without our prior written consent. We may assign these Terms without restriction. Any attempted assignment in violation of this section shall be void.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">18. Force Majeure</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We shall not be liable for any failure to perform our obligations under these Terms where such failure results from circumstances beyond our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">19. Contact Information</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            For questions, concerns, or notices regarding these Terms of Service, please contact us:
                        </p>
                        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">Legal Department</p>
                                <a href="mailto:legal@olleey.com" className="text-violet-400 hover:text-violet-300 underline">legal@olleey.com</a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">General Support</p>
                                <a href="mailto:support@olleey.com" className="text-violet-400 hover:text-violet-300 underline">support@olleey.com</a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">Business Inquiries</p>
                                <a href="mailto:business@olleey.com" className="text-violet-400 hover:text-violet-300 underline">business@olleey.com</a>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mt-6">
                            We aim to respond to all inquiries within 5 business days. For urgent legal matters, please mark your email as "URGENT" in the subject line.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground italic">
                        Connecting stories across borders. © 2026 Olleey Inc.
                    </p>
                </footer>
            </div>
        </div>
    );
}
