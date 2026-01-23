import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

const cardVariants = cva(
    "relative grid h-full w-full transform-gpu overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ease-in-out group",
    {
        variants: {},
        defaultVariants: {},
    }
);

export interface DestinationCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    /** The URL for the background image of the card. */
    imageUrl: string;
    /** The category or region text displayed above the main title. */
    category: string;
    /** The main title of the destination. */
    title: string;
    /** A callback function to be invoked when the like button is clicked. */
    onLike?: () => void;
    /** Determines if the destination is marked as liked. */
    isLiked?: boolean;
    /** Array of flag emojis to display. */
    flags?: string[];
}

const DestinationCard = React.forwardRef<
    HTMLDivElement,
    DestinationCardProps
>(
    (
        {
            className,
            imageUrl,
            category,
            title,
            onLike,
            isLiked = false,
            flags = [],
            ...props
        },
        ref
    ) => {
        const displayFlags = flags.slice(0, 3);
        const extraCount = flags.length - 3;

        return (
            <div
                ref={ref}
                className={cn(cardVariants({ className }))}
                {...props}
            >
                {/* Background Image with Hover Animation */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = `https://placehold.co/600x800/2d3748/ffffff?text=Image+Not+Found`;
                    }}
                />
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Like Button */}
                {onLike && (
                    <button
                        aria-label={isLiked ? "Unlike destination" : "Like destination"}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent card click events if any
                            e.stopPropagation();
                            onLike();
                        }}
                        className={cn(
                            "absolute top-4 right-4 z-20 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        )}
                    >
                        <Heart
                            className={cn(
                                "h-6 w-6 text-white transition-all",
                                isLiked && "fill-red-500 text-red-500"
                            )}
                        />
                    </button>
                )}

                {/* Text Content with Hover Animation */}
                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-2">
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-200">
                        - {category} -
                    </p>
                    <h2 className="mt-1 text-3xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                        {title}
                    </h2>

                    {/* Flags Section */}
                    {flags.length > 0 && (
                        <div className="flex items-center mt-3 ml-2">
                            {displayFlags.map((flag, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm -ml-3 first:ml-0 z-10"
                                    title="Language"
                                >
                                    <span className="text-lg leading-none pt-0.5">{flag}</span>
                                </div>
                            ))}
                            {extraCount > 0 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 shadow-sm -ml-3 z-0">
                                    <span className="text-xs font-medium text-white">+{extraCount}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
