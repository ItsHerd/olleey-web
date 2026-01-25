"use client";

import { ArrowRight, Play } from "lucide-react";

interface HeroProps {
    onGetStartedClick: () => void;
}

export default function Hero({ onGetStartedClick }: HeroProps) {

    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                        Create a website without limits
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
                        Bring your ideas to life with the leading content distribution platform. Dub, distribute, and dominate globally.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStartedClick}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Get Started
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full text-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                            <Play className="h-5 w-5 fill-current" />
                            Watch Demo
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        Start for free. No credit card required.
                    </p>
                </div>

                {/* Hero Dashboard Visual */}
                <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-gray-200/50 max-w-6xl mx-auto">
                    {/* Top Bar Decoration */}
                    <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>

                    <div className="aspect-[16/9] bg-slate-50 relative group cursor-pointer overflow-hidden">
                        {/* Mockup Content - Using CSS to simulate a UI */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2426&q=80')"
                            }}>
                        </div>

                        {/* Floating Elements (Wix style) */}
                        <div className="absolute top-10 left-10 md:top-20 md:left-20 bg-white p-4 rounded-xl shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">John Doe</div>
                                    <div className="text-xs text-gray-500">Content Creator</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[75%]"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-medium">
                                <span className="text-gray-500">Upload Complete</span>
                                <span className="text-green-600">75%</span>
                            </div>
                        </div>

                        <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-2xl border border-white/20 max-w-xs animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                            <div className="text-2xl font-bold text-gray-900 mb-1">+125%</div>
                            <div className="text-sm text-gray-500 mb-4">Engagement Growth</div>
                            <div className="flex gap-1 items-end h-16">
                                <div className="w-4 bg-blue-100 h-[30%] rounded-t-sm"></div>
                                <div className="w-4 bg-blue-200 h-[50%] rounded-t-sm"></div>
                                <div className="w-4 bg-blue-300 h-[40%] rounded-t-sm"></div>
                                <div className="w-4 bg-blue-400 h-[70%] rounded-t-sm"></div>
                                <div className="w-4 bg-blue-500 h-[60%] rounded-t-sm"></div>
                                <div className="w-4 bg-blue-600 h-[85%] rounded-t-sm"></div>
                            </div>
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/50 transition-all shadow-2xl border border-white/40">
                                <Play className="h-8 w-8 text-white fill-current ml-1 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Grid (Below Hero) */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Smart Dubbing", desc: "AI-powered dubbing that captures every nuance of your voice." },
                        { title: "Global Reach", desc: "Distribute your content to 12+ platforms instantly." },
                        { title: "Analytics", desc: "Track performance across all your channels in one dashboard." }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl mb-4 flex items-center justify-center text-blue-600">
                                <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 right-0 h-screen overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl"></div>
                <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/20 blur-3xl"></div>
            </div>
        </div>
    );
}
