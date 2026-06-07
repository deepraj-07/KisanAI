/**
 * config/languages.ts
 * Language codes and metadata for Kisan AI
 */

export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  hi: { name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  mr: { name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  te: { name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  ta: { name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  ur: { name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  bn: { name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  or: { name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  as: { name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  sd: { name: "Sindhi", nativeName: "سندھي", flag: "🇵🇰" },
  en_US: { name: "English (US)", nativeName: "English (United States)", flag: "🇺🇸" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const LANGUAGE_VOICE_MAP: Record<LanguageCode, string> = {
  en: "en-IN",
  en_US: "en-US",
  hi: "hi-IN",
  pa: "pa-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ur: "ur-PK",
  bn: "bn-IN",
  or: "or-IN",
  as: "as-IN",
  sd: "sd-PK",
};

export const TTS_SPEEDS = {
  slow: { label: "Slow", value: 0.75 },
  normal: { label: "Normal", value: 1 },
  fast: { label: "Fast", value: 1.5 },
} as const;

export type TTSSpeed = keyof typeof TTS_SPEEDS;
