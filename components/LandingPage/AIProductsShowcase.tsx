import React from 'react';

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
            title: "Olleey Workflows: One Upload, Worldwide Release",
            description:
                "Plug Olleey into your main channel and turn every new upload into a fully automated multi-language release—without adding a single step to your process.",
            image: "https://cdn.dribbble.com/userupload/18293083/file/original-79c28b4f9f64f091b8c5c3fb6e66cb60.png?resize=2048x1536&vertical=center",
            primaryAction: {
                label: "View Demo",
                onClick: () => console.log("View Olleey Workflows")
            }
        },
        {
            title: "Regenerative Lip-Sync: Native in Every Language",
            description:
                "Go beyond basic dubbing. Olleey regenerates lower-face motion to match each target language while preserving your original performance and emotion.",
            image: "https://3dwithus.com/wp-content/uploads/2020/04/Lip-Sync-Before-After-Mesh-Editing-in-Blender-2.8.jpg",
            secondaryAction: {
                label: "View examples",
                onClick: () => console.log("View lip-sync examples")
            }
        },
        {
            title: "Zero-Touch Channel Automation",
            description:
                "From transcription and translation to packaging and publishing, Olleey runs in the background—auto-routing content to MLA tracks and regional channels.",
            image: "https://cdn.dribbble.com/userupload/44898567/file/ca2fc904f631c548f551cf9efcd5dc2b.jpg?resize=400x0",
            secondaryAction: {
                label: "Explore integrations",
                onClick: () => console.log("Explore channel integrations")
            }
        },
        {
            title: "Language Performance Analytics",
            description:
                "Compare retention, watch time, and RPM across languages so you know exactly where to double down and which markets to unlock next.",
            image: "https://cdn.dribbble.com/userupload/15010682/file/original-a37ebacacb04da8f6467ae2bfd7d53d5.jpg?format=webp&resize=400x300&vertical=center",
            secondaryAction: {
                label: "See analytics",
                onClick: () => console.log("View analytics details")
            }
        }
    ];


    const displayProducts = products || defaultProducts;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-[48px] leading-[1.1] font-normal text-[#1C1D21]">
                        AI is changing how stories are told,<br />
                        how each word is processed and<br />
                        how each emotion is predicted.
                    </h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, index) => (
                        <div
                            key={index}
                            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                                    {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-1">
                                    {product.description}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    {product.primaryAction && (
                                        <button
                                            onClick={product.primaryAction.onClick}
                                            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            {product.primaryAction.label}
                                        </button>
                                    )}
                                    {product.secondaryAction && (
                                        <button
                                            onClick={product.secondaryAction.onClick}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors underline underline-offset-4"
                                        >
                                            {product.secondaryAction.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
