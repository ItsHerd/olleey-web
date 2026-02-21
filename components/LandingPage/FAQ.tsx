"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
        <section className="bg-white dark:bg-[#07080b] py-24 md:py-32 border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300" id="faq">
            <div className="mx-auto max-w-[1680px] px-6 lg:px-10 relative z-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-4 py-1 border border-black/30 dark:border-white/30 backdrop-blur-sm mb-6 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse transition-colors duration-300" />
                            <span className="text-[12px] font-semibold uppercase tracking-wider text-black dark:text-white transition-colors duration-300">Support</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-black dark:text-white text-4xl md:text-6xl font-bold font-sans tracking-tight mb-4 transition-colors duration-300"
                        >
                            Frequently Asked Questions
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans leading-relaxed transition-colors duration-300 max-w-3xl"
                        >
                            Operational specifics regarding the Olleey engine, quality workflow, and distribution process.
                        </motion.p>
                    </div>

                    <div className="text-neutral-500 dark:text-neutral-400 font-sans text-sm border-l-2 border-black/10 dark:border-white/10 pl-4 py-2 transition-colors duration-300 shrink-0">
                        Need more info?{" "}
                        <Link
                            href="/#contact"
                            className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 underline decoration-black/30 dark:decoration-white/30 hover:decoration-black dark:hover:decoration-white transition-all ml-1"
                        >
                            Contact Support &rarr;
                        </Link>
                    </div>
                </div>

                <div className="mt-10 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0d0e13] px-6 md:px-10 lg:px-12">
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-b border-black/10 dark:border-white/10 last:border-0 transition-colors duration-300"
                            >
                                <AccordionTrigger className="cursor-pointer text-base md:text-xl font-medium font-sans text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 hover:no-underline py-6 md:py-8 data-[state=open]:text-black dark:data-[state=open]:text-white transition-colors duration-300">
                                    <span className="flex text-left pr-4">
                                        <span className="mr-4 text-black/30 dark:text-white/30 text-sm md:text-base mt-0.5 transition-colors duration-300">0{index + 1}</span>
                                        {item.question}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-neutral-600 dark:text-neutral-400 font-sans text-sm md:text-base leading-relaxed border-l-2 border-black/10 dark:border-white/10 pl-4 md:pl-5 ml-8 mb-8 transition-colors duration-300">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
