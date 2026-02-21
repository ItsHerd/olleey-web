"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabaseHelpers } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export default function ContactUs() {
    const { toast } = useToast()
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        
        try {
            await supabaseHelpers.sendContactMessage(formData)
            setIsSubmitting(false)
            setIsSubmitted(true)
            toast('Message sent successfully! We will get back to you soon.', 'success')
            setFormData({ name: '', email: '', message: '' })
            // Keep the success state for a bit longer to show the success UI
            setTimeout(() => setIsSubmitted(false), 8000)
        } catch (err: any) {
            console.error('Error sending message:', err)
            const errMsg = err.message || 'Failed to send message. Please try again.'
            setError(errMsg)
            toast(errMsg, 'error')
            setIsSubmitting(false)
        }
    }

    return (
        <section className="bg-[#FAFAFA] dark:bg-[#07080b] py-24 md:py-32 border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300" id="contact">
            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="grid gap-12 md:grid-cols-2 md:gap-16">
                    {/* Left Column: Info */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-4 py-1 border border-black/30 dark:border-white/30 backdrop-blur-sm mb-6 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse transition-colors duration-300" />
                            <span className="text-[12px] font-semibold uppercase tracking-wider text-black dark:text-white transition-colors duration-300">Contact</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-black dark:text-white text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 transition-colors duration-300"
                        >
                            Get in touch
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-neutral-600 dark:text-neutral-400 mt-4 text-base md:text-lg font-sans leading-relaxed transition-colors duration-300 mb-8"
                        >
                            Have questions about Olleey&apos;s AI dubbing or distribution network? We&apos;re here to help you expand your global reach.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="space-y-6"
                        >
                            <a href="mailto:hello@olleey.com" className="group flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300">
                                <div className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-black dark:text-white">Email Us</h4>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">hello@olleey.com</p>
                                </div>
                            </a>

                            <div className="group flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300">
                                <div className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-black dark:text-white">Support</h4>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Response time within 24h</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Technical corners */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-black/20 dark:border-white/20 transition-colors duration-300" />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-black/20 dark:border-white/20 transition-colors duration-300" />

                        <div className="border border-black/10 dark:border-white/10 p-6 md:p-8 bg-white dark:bg-[#0A0A0A] transition-colors duration-300 min-h-[400px] flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!isSubmitted ? (
                                    <motion.form
                                        key="contact-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-1.5">Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-black/30 dark:placeholder-white/30"
                                                placeholder="Jane Doe"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-black/30 dark:placeholder-white/30"
                                                placeholder="jane@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-black dark:text-white mb-1.5">Message</label>
                                            <textarea
                                                id="message"
                                                rows={4}
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-black/30 dark:placeholder-white/30 resize-none"
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full group mt-2 flex items-center justify-between px-6 py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="font-semibold uppercase tracking-wider text-sm">
                                                {isSubmitting ? 'Sending...' : 'Send Message'}
                                            </span>
                                            <ArrowRight className={`w-5 h-5 transition-transform ${isSubmitting ? '' : 'group-hover:translate-x-1'}`} />
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="success-message"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-8 text-center"
                                    >
                                        <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-8 h-8 text-white dark:text-black" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Message Sent!</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400 max-w-[280px] mx-auto">
                                            Thank you for reaching out. Our team will review your message and get back to you shortly.
                                        </p>
                                        <button 
                                            onClick={() => setIsSubmitted(false)}
                                            className="mt-8 text-sm font-semibold uppercase tracking-wider text-black dark:text-white hover:underline underline-offset-4"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
