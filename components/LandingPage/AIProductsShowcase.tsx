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
        <section className="py-16 md:py-24 bg-black border-t border-white/10 relative overflow-hidden">
             {/* Background Grid - Visible Boxes */}
             <div className="absolute inset-0 z-0 opacity-20" 
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
                        className="inline-flex items-center gap-3 px-3 py-1 border border-white/30 backdrop-blur-sm mb-6 bg-black"
                    >
                         <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">System Capabilities</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-[48px] leading-[1.1] font-normal text-white font-mono uppercase tracking-tight"
                    >
                        AI is changing how <br/>
                        <span className="text-white/50">stories are told.</span>
                    </motion.h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {displayProducts.map((product, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group flex flex-col bg-black p-6 relative hover:bg-white/5 transition-colors duration-200"
                        >
                            {/* Technical Corner Markers */}
                            <div className="absolute top-0 right-0 p-1">
                                <div className="w-1.5 h-1.5 border-t border-r border-white/40" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-1">
                                <div className="w-1.5 h-1.5 border-b border-l border-white/40" />
                            </div>

                            {/* Image Frame */}
                            <div className="aspect-[4/3] w-full overflow-hidden mb-6 relative border border-white/10 group-hover:border-white/30 transition-colors">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                                <div className="absolute top-2 left-2 text-[9px] font-mono text-white bg-black px-1 border border-white/20">
                                    IMG.0{index + 1}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase tracking-wider group-hover:text-white transition-colors">
                                    {product.title}
                                </h3>
                                <div className="w-8 h-px bg-white/20 mb-3 group-hover:w-full transition-all duration-500" />
                                <p className="text-xs text-gray-400 mb-6 leading-relaxed flex-1 font-mono">
                                    {product.description}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 mt-auto border-t border-white/10 border-dashed">
                                    {product.primaryAction && (
                                        <button
                                            onClick={product.primaryAction.onClick}
                                            className="text-[10px] bg-white text-black font-bold font-mono px-3 py-1.5 uppercase tracking-wider hover:bg-white/80 transition-colors"
                                        >
                                            <span className="mr-1">&gt;</span> {product.primaryAction.label}
                                        </button>
                                    )}
                                    {product.secondaryAction && (
                                        <button
                                            onClick={product.secondaryAction.onClick}
                                            className="text-[10px] font-bold font-mono text-white/60 hover:text-white transition-colors uppercase tracking-wider"
                                        >
                                            [ {product.secondaryAction.label} ]
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
