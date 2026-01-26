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
