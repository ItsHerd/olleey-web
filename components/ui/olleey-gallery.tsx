"use client";

import {
    ContainerAnimated,
    ContainerScroll,
    ContainerStagger,
    ContainerSticky,
    GalleryCol,
    GalleryContainer
} from "@/components/ui/animated-gallery"
import { Button } from "@/components/ui/button"
import { Globe, Zap, Users } from "lucide-react"

// Video dubbing themed images
const IMAGES_1 = [
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=60",
]
const IMAGES_2 = [
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&auto=format&fit=crop&q=60",
]
const IMAGES_3 = [
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&auto=format&fit=crop&q=60",
]

export default function OlleeyGallery() {
    return (
        <div className="relative bg-black rounded-t-[60px] overflow-hidden">
            <ContainerStagger className="relative z-[9999] -mb-12 place-self-center px-6 pt-16 text-center">
                <ContainerAnimated>
                    <h1 className="font-sans text-4xl font-bold text-white md:text-5xl">
                        What Can{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            You Do?
                        </span>
                    </h1>
                </ContainerAnimated>

                <ContainerAnimated className="my-6">
                    <p className="text-base leading-relaxed text-gray-300">
                        Transform your content into a global phenomenon with AI-powered video dubbing
                    </p>
                </ContainerAnimated>

                {/* 3 Key Features */}
                <ContainerAnimated className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="p-2 rounded-full bg-blue-500/20">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">40+ Languages</h3>
                        <p className="text-xs text-gray-400 text-center">
                            Reach global audiences with natural-sounding voiceovers
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="p-3 rounded-full bg-purple-500/20">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Lightning Fast</h3>
                        <p className="text-sm text-gray-400 text-center">
                            Upload once and get dubbed videos in minutes, not days or weeks
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="p-3 rounded-full bg-pink-500/20">
                            <Users className="w-6 h-6 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Lip Sync Perfect</h3>
                        <p className="text-sm text-gray-400 text-center">
                            Advanced AI ensures your dubbed videos look as natural as the original
                        </p>
                    </div>
                </ContainerAnimated>
            </ContainerStagger>

            <div className="pointer-events-none absolute z-10 h-[70vh] w-full"
                style={{
                    background: "linear-gradient(to right, #1e3a8a, #7c3aed, #2563eb)",
                    filter: "blur(84px)",
                    mixBlendMode: "screen",
                }}
            />

            <ContainerScroll className="relative h-[200vh]">
                <ContainerSticky className="h-[60vh]">
                    <GalleryContainer className="rounded-3xl">
                        <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
                            {IMAGES_1.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-xl"
                                    src={imageUrl}
                                    alt="Video content creation"
                                />
                            ))}
                        </GalleryCol>
                        <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
                            {IMAGES_2.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-xl"
                                    src={imageUrl}
                                    alt="Global content distribution"
                                />
                            ))}
                        </GalleryCol>
                        <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
                            {IMAGES_3.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-xl"
                                    src={imageUrl}
                                    alt="AI video dubbing"
                                />
                            ))}
                        </GalleryCol>
                    </GalleryContainer>
                </ContainerSticky>
            </ContainerScroll>
        </div>
    )
}
