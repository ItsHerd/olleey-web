import { Rocket, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

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

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 max-w-4xl mx-auto">
            <div className={`bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-full mb-8`}>
                <Rocket className="w-12 h-12 text-indigo-500" />
            </div>

            <h1 className={`text-4xl font-bold mb-2 ${textClass}`}>{title}</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Coming Soon
            </div>

            {description && (
                <p className={`text-xl ${textSecondaryClass} max-w-2xl mb-8 leading-relaxed`}>
                    {description}
                </p>
            )}

            <div className="grid md:grid-cols-2 gap-6 w-full text-left">
                {value && (
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className={`font-semibold text-lg ${textClass}`}>The Value</h3>
                        </div>
                        <p className={`${textSecondaryClass} leading-relaxed`}>
                            {value}
                        </p>
                    </div>
                )}

                {features && features.length > 0 && (
                    <div className={`${cardClass} border ${borderClass} rounded-2xl p-6 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className={`font-semibold text-lg ${textClass}`}>Planned Features</h3>
                        </div>
                        <ul className="space-y-3">
                            {features.map((feature, idx) => (
                                <li key={idx} className={`flex items-start gap-2 ${textSecondaryClass}`}>
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
