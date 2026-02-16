"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

export default function FAQ() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How accurate is the AI translation/dubbing?',
            answer: "Olleey's engine doesn't just translate text; it recontextualizes content. We use advanced LLMs to adapt idioms, slang, and cultural nuances, ensuring your message lands effectively in every region with 99.8% semantic accuracy.",
        },
        {
            id: 'item-2',
            question: 'Can I review the content before publishing?',
            answer: 'Absolutely. Our "Intelligent Quality Gates" flag any low-confidence segments for human review. You maintain full creative control and can edit scripts, regenerate audio segments, or adjust lip-sync before final deployment.',
        },
        {
            id: 'item-3',
            question: 'What happens if there are multiple speakers?',
            answer: "Olleey's multi-speaker detection handles this seamlessly. We identify distinct speakers and languages, applying unique voice clones and translation logic to each person independently.",
        },
        {
            id: 'item-4',
            question: 'How fast is the turnaround time?',
            answer: "Near-instant. For a typical 10-minute video, our automated pipeline completes transcription, translation, voice cloning, and lip-syncing in under 15 minutes.",
        },
        {
            id: 'item-5',
            question: 'Do you support localized ad insertion?',
            answer: 'Yes. Our "Regional Monetization" workflow allows you to swap out-stream ad segments or sponsor reads dynamically, ensuring your sponsors are relevant to the specific audience watching.',
        },
    ]

    return (
        <section className="bg-[#FAFAFA] dark:bg-black py-24 md:py-32 border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300" id="faq">
            {/* Background Grid - Light Mode */}
            <div className="absolute inset-0 z-0 opacity-5 dark:opacity-0 transition-opacity duration-300"
                style={{
                    backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Background Grid - Dark Mode */}
            <div className="absolute inset-0 z-0 opacity-0 dark:opacity-20 transition-opacity duration-300"
                style={{
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="grid gap-8 md:grid-cols-5 md:gap-16">
                    <div className="md:col-span-2">
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-4 py-1 border border-black/30 dark:border-white/30 backdrop-blur-sm mb-6 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse transition-colors duration-300" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black dark:text-white transition-colors duration-300">Info</span>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-black dark:text-white text-4xl md:text-5xl font-normal font-mono uppercase tracking-tight mb-4 transition-colors duration-300"
                        >
                            Protocol <br/>
                            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent transition-colors duration-300">Details.</span>
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-neutral-600 dark:text-gray-400 mt-4 text-sm font-mono leading-relaxed transition-colors duration-300"
                        >
                            Operational specifics regarding the Olleey engine and distribution network.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-neutral-500 dark:text-gray-500 mt-8 hidden md:block font-mono text-xs border-l border-black/20 dark:border-white/20 pl-4 py-2 transition-colors duration-300"
                        >
                            Require human assistance? <br/>
                            <Link
                                href="/contact"
                                className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 underline decoration-black/30 dark:decoration-white/30 hover:decoration-black dark:hover:decoration-white transition-all mt-2 inline-block">
                                OPEN_TICKET &gt;
                            </Link>
                        </motion.div>
                    </div>

                    <div className="md:col-span-3">
                         <div className="relative">
                            {/* Technical corners for the FAQ container */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-black/20 dark:border-white/20 transition-colors duration-300" />
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-black/20 dark:border-white/20 transition-colors duration-300" />

                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                {faqItems.map((item, index) => (
                                    <AccordionItem
                                        key={item.id}
                                        value={item.id}
                                        className="border-b border-black/10 dark:border-white/10 last:border-0 transition-colors duration-300"
                                    >
                                        <AccordionTrigger className="cursor-pointer text-sm md:text-base font-mono text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 hover:no-underline py-6 data-[state=open]:text-black dark:data-[state=open]:text-white transition-colors duration-300">
                                            <span className="flex text-left">
                                                <span className="mr-4 text-black/30 dark:text-white/30 text-xs mt-1 transition-colors duration-300">0{index + 1} //</span>
                                                {item.question}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-neutral-600 dark:text-gray-400 font-mono text-xs md:text-sm leading-relaxed border-l border-black/10 dark:border-white/10 pl-4 ml-8 mb-6 transition-colors duration-300">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>

                    <p className="text-neutral-500 dark:text-gray-500 mt-6 md:hidden font-mono text-xs transition-colors duration-300">
                        Need more info?{' '}
                        <Link
                            href="/contact"
                            className="text-black dark:text-white hover:underline transition-colors duration-300">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
