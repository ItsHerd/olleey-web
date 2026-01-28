import { Rocket, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck, Globe, Cpu } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

interface ComingSoonPageProps {
    title: string;
    description?: string;
    value?: string;
    features?: string[];
}

export function ComingSoonPage({ title, description, value, features }: ComingSoonPageProps) {
    const { theme } = useTheme();

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const isDark = theme === "dark";

    // Default features if none provided to make the page look busy and professional
    const defaultFeatures = features && features.length > 0 ? features : [
        "Real-time AI Processing",
        "Multi-language Neural Sync",
        "Edge-layer Distribution",
        "Advanced Content Guardrails"
    ];

    return (
        <div className={`relative flex flex-col items-center justify-center min-h-[85vh] p-8 overflow-hidden`}>
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-olleey-yellow/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full opacity-30" />
            </div>

            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-olleey-yellow mb-12 shadow-2xl">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olleey-yellow opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-olleey-yellow"></span>
                    </span>
                    Prototope Active • Alpha Release
                </div>

                {/* Main Heading */}
                <h1 className={`text-4xl md:text-6xl lg:text-7xl font-normal ${textClass} tracking-tighter mb-6 text-center leading-tight`}>
                    {title}
                </h1>

                {description && (
                    <p className={`text-lg md:text-xl lg:text-2xl ${textSecondaryClass} max-w-3xl mb-12 text-center leading-relaxed font-medium opacity-60 italic`}>
                        "{description}"
                    </p>
                )}

                {/* Features Grid - Glassmorphic */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-16">
                    {defaultFeatures.map((feature, idx) => (
                        <div key={idx} className={`${cardClass} border ${borderClass} rounded-2xl p-6 backdrop-blur-3xl shadow-2xl hover:border-olleey-yellow/30 transition-all group`}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-olleey-yellow/10 transition-colors">
                                {idx % 4 === 0 && <Globe className="w-5 h-5 text-olleey-yellow" />}
                                {idx % 4 === 1 && <Cpu className="w-5 h-5 text-olleey-yellow" />}
                                {idx % 4 === 2 && <ShieldCheck className="w-5 h-5 text-olleey-yellow" />}
                                {idx % 4 === 3 && <Zap className="w-5 h-5 text-olleey-yellow" />}
                            </div>
                            <h3 className={`text-sm font-bold ${textClass} mb-2`}>{feature}</h3>
                            <div className="h-1 w-8 bg-white/10 rounded-full group-hover:w-full transition-all duration-500" />
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button className="h-14 px-10 bg-olleey-yellow text-black hover:bg-white transition-all font-black uppercase tracking-[0.1em] text-xs rounded-full shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                        Register for Beta Access <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${textSecondaryClass} opacity-40`}>
                        Deployment Scheduled: Q3 2026
                    </p>
                </div>

                {/* Value Section if provided */}
                {value && (
                    <div className={`mt-20 p-8 ${cardClass} border ${borderClass} rounded-[2rem] max-w-2xl w-full text-center relative overflow-hidden group`}>
                        <div className="relative z-10">
                            <Sparkles className="w-8 h-8 text-olleey-yellow mx-auto mb-4 opacity-50" />
                            <h4 className={`text-lg font-bold ${textClass} mb-4`}>The Strategic Advantage</h4>
                            <p className={`${textSecondaryClass} text-sm leading-relaxed`}>{value}</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </div>
    );
}
