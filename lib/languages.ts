export interface LanguageOption {
    code: string;
    name: string;
    flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: "en", name: "English (USA)", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

export const LANGUAGE_FLAGS: Record<string, string> = {
    en: "🇺🇸",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇵🇹",
    ja: "🇯🇵",
    ko: "🇰🇷",
    hi: "🇮🇳",
    ar: "🇸🇦",
    ru: "🇷🇺",
    it: "🇮🇹",
    zh: "🇨🇳",
};

export const getLanguageFlag = (langCode: string): string => {
    return LANGUAGE_FLAGS[langCode] || "🌍";
};

export const getLanguageName = (langCode: string): string => {
    return LANGUAGE_OPTIONS.find(l => l.code === langCode)?.name || langCode.toUpperCase();
};

export const FAKE_LOCALIZED_TEXT: Record<string, { title: string, description: string }> = {
    es: {
        title: "Estrategias de Crecimiento Global para Creadores",
        description: "Aprende cómo escalar tu audiencia internacional utilizando inteligencia artificial para el doblaje y la distribución automatizada de contenidos en múltiples plataformas."
    },
    fr: {
        title: "Stratégies de Croissance Mondiale pour les Créateurs",
        description: "Découvrez comment élargir votre audience internationale en utilisant l'intelligence artificielle pour le doublage et la distribution automatisée de contenu sur plusieurs plateformes."
    },
    de: {
        title: "Globale Wachstumsstrategien für Content-Ersteller",
        description: "Erfahren Sie, wie Sie Ihr internationales Publikum vergrößern können, indem Sie künstliche Intelligenz für Synchronisation und automatisierte Inhaltsverteilung nutzen."
    },
    ja: {
        title: "クリエイターのためのグローバル成長戦略",
        description: "AIによる吹き替えと複数プラットフォームへの自動コンテンツ配信を活用して、国際的な視聴者を拡大する方法を学びましょう。"
    },
    it: {
        title: "Strategie di Crescita Globale per i Creatori",
        description: "Scopri come ampliare il tuo pubblico internazionale utilizzando l'intelligenza artificiale per il doppiaggio e la distribuzione automatizzata dei contenuti su più piattaforme."
    },
    pt: {
        title: "Estratégias de Crescimento Global para Criadores",
        description: "Aprenda como expandir sua audiência internacional usando inteligência artificial para dublagem e distribuição automatizada de conteúdo em múltiplas plataformas."
    }
};

export const getFakeLocalizedText = (langCode: string) => {
    return FAKE_LOCALIZED_TEXT[langCode] || {
        title: "Global Content Strategy Preview",
        description: "Experience your content in a new dimension with high-fidelity AI dubbing and seamless cross-platform distribution."
    };
};
