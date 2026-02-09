import React from 'react';
import { motion } from 'framer-motion';

interface ProductCard {
    title: string;
    description: string;
    image: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

interface AIProductsShowcaseProps {
    products?: ProductCard[];
}

export default function AIProductsShowcase({ products }: AIProductsShowcaseProps) {
    // Default products if none provided
    const defaultProducts: ProductCard[] = [
        {
            title: "Zero-Latency Voice Cloning",
            description:
                "Preserve your unique vocal identity across every border. Our neural engine clones your tone, cadence, and emotion with breathtaking accuracy in 40+ languages.",
            image: "https://cdn.dribbble.com/userupload/18293083/file/original-79c28b4f9f64f091b8c5c3fb6e66cb60.png?resize=2048x1536&vertical=center",
            primaryAction: {
                label: "Hear samples",
                onClick: () => console.log("View Voice Samples")
            }
        },
        {
            title: "Regenerative Lip-Sync",
            description:
                "Go beyond basic dubbing. Olleey regenerates your lower-face motion to match each target language's phonemes while preserving your original expression.",
            image: "https://3dwithus.com/wp-content/uploads/2020/04/Lip-Sync-Before-After-Mesh-Editing-in-Blender-2.8.jpg",
            secondaryAction: {
                label: "Watch demo",
                onClick: () => console.log("View lip-sync examples")
            }
        },
        {
            title: "Smart Multi-Track Packaging",
            description:
                "Automatically mux translated audio into YouTube Multi-Language Audio tracks or master them as independent regional video files—ready for instant broadcast.",
            image: "https://cdn.dribbble.com/userupload/44898567/file/ca2fc904f631c548f551cf9efcd5dc2b.jpg?resize=400x0",
            secondaryAction: {
                label: "Export specs",
                onClick: () => console.log("Explore channel integrations")
            }
        },
        {
            title: "Global Hub Analytics",
            description:
                "Track your global performance from a single pane of glass. Monitor RPM, retention, and audience growth across every localized channel in real-time.",
            image: "https://cdn.dribbble.com/userupload/15010682/file/original-a37ebacacb04da8f6467ae2bfd7d53d5.jpg?format=webp&resize=400x300&vertical=center",
            secondaryAction: {
                label: "Visit Hub",
                onClick: () => console.log("View analytics details")
            }
        }
    ];


    const displayProducts = products || defaultProducts;

    return (
        <section className="py-16 md:py-24 bg-white dark:bg-black border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-3 px-3 py-1 border border-black/30 dark:border-white/30 backdrop-blur-sm mb-6 bg-black/5 dark:bg-black transition-colors duration-300 rounded-full"
                    >
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black dark:text-white transition-colors duration-300">Protocol <span className="text-green-600 dark:text-green-400 transition-colors duration-300">Details</span></span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-[48px] leading-[1.1] font-normal text-black dark:text-white font-mono uppercase tracking-tight transition-colors duration-300"
                    >
                        AI is changing how <br />
                        <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent transition-colors duration-300">stories are told.</span>
                    </motion.h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group flex flex-col bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 relative hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors duration-300 rounded-[2rem] overflow-hidden"
                        >
                            {/* Technical Corner Markers */}
                            <div className="absolute top-0 right-0 p-1">
                                <div className="w-1.5 h-1.5 border-t border-r border-black/40 dark:border-white/40 transition-colors duration-300" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-1">
                                <div className="w-1.5 h-1.5 border-b border-l border-black/40 dark:border-white/40 transition-colors duration-300" />
                            </div>

                            {/* Image Frame */}
                            <div className="aspect-[4/3] w-full overflow-hidden mb-6 relative border border-black/10 dark:border-white/10 group-hover:border-black/30 dark:group-hover:border-white/30 transition-colors duration-300 rounded-3xl">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                                <div className="absolute top-2 left-2 text-[9px] font-mono text-white bg-black px-1 border border-white/20 rounded-md">
                                    IMG.0{index + 1}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-black dark:text-white mb-3 font-mono uppercase tracking-wider transition-colors duration-300">
                                    {product.title}
                                </h3>
                                <div className="w-8 h-px bg-black/20 dark:bg-white/20 mb-3 group-hover:w-full transition-all duration-500" />
                                <p className="text-xs text-neutral-600 dark:text-gray-400 mb-6 leading-relaxed flex-1 font-mono transition-colors duration-300">
                                    {product.description}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 mt-auto border-t border-black/10 dark:border-white/10 border-dashed transition-colors duration-300">
                                    {product.primaryAction && (
                                        <button
                                            onClick={product.primaryAction.onClick}
                                            className="text-[10px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black font-bold font-mono px-4 py-2 uppercase tracking-wider dark:hover:bg-white/80 transition-all duration-300 rounded-full"
                                        >
                                            <span className="mr-1">&gt;</span> {product.primaryAction.label}
                                        </button>
                                    )}
                                    {product.secondaryAction && (
                                        <button
                                            onClick={product.secondaryAction.onClick}
                                            className="text-[10px] font-bold font-mono text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-300 uppercase tracking-wider px-3 py-2 border border-black/20 dark:border-white/20 hover:border-black/60 dark:hover:border-white/60 rounded-full"
                                        >
                                            {product.secondaryAction.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
