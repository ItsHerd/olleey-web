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
        <section className="bg-black py-24 md:py-32 border-t border-white/10 relative overflow-hidden" id="faq">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="grid gap-8 md:grid-cols-5 md:gap-16">
                    <div className="md:col-span-2">
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 backdrop-blur-sm mb-6 bg-black"
                        >
                            <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">SYS.INFO</span>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-white text-4xl md:text-5xl font-normal font-mono uppercase tracking-tight mb-4"
                        >
                            Protocol <br/>
                            <span className="text-white/50">Details.</span>
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-gray-400 mt-4 text-sm font-mono leading-relaxed"
                        >
                            Operational specifics regarding the Olleey engine and distribution network.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-gray-500 mt-8 hidden md:block font-mono text-xs border-l border-white/20 pl-4 py-2"
                        >
                            Require human assistance? <br/>
                            <Link
                                href="/contact"
                                className="text-white hover:text-white/80 underline decoration-white/30 hover:decoration-white transition-all mt-2 inline-block">
                                OPEN_TICKET &gt;
                            </Link>
                        </motion.div>
                    </div>

                    <div className="md:col-span-3">
                         <div className="relative">
                            {/* Technical corners for the FAQ container */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-white/20" />
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-white/20" />

                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                {faqItems.map((item, index) => (
                                    <AccordionItem
                                        key={item.id}
                                        value={item.id}
                                        className="border-b border-white/10 last:border-0"
                                    >
                                        <AccordionTrigger className="cursor-pointer text-sm md:text-base font-mono text-white hover:text-white/80 hover:no-underline py-6 data-[state=open]:text-white">
                                            <span className="flex text-left">
                                                <span className="mr-4 text-white/30 text-xs mt-1">0{index + 1} //</span>
                                                {item.question}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-400 font-mono text-xs md:text-sm leading-relaxed border-l border-white/10 pl-4 ml-8 mb-6">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>

                    <p className="text-gray-500 mt-6 md:hidden font-mono text-xs">
                        Need more info?{' '}
                        <Link
                            href="/contact"
                            className="text-white hover:underline">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
