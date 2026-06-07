"use client";

import { useState } from "react";
import { useLanguage } from "@/core/language/context";
import { SUPPORTED_LANGUAGES } from "@/config/languages";
import type { LanguageCode } from "@/config/languages";
import { Globe, Check } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (lang: LanguageCode) => {
    await setLanguage(lang);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2B241F] text-[#B8A99A] text-sm opacity-50 cursor-not-allowed">
        <Globe className="w-4 h-4" />
      </button>
    );
  }

  const currentLanguage = SUPPORTED_LANGUAGES[language];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2B241F] hover:bg-[#3B322A] text-[#F5F0E8] text-sm transition-colors"
        title={t("common.select_language")}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1F1B18] border border-[#3B322A] rounded-lg shadow-xl z-50">
          <div className="p-2">
            <p className="px-3 py-1.5 text-xs font-semibold text-[#B8A99A] uppercase tracking-wide">
              {t("common.language")}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName, flag }]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as LanguageCode)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    language === code
                      ? "bg-[#E86B2E]/20 text-[#F4C430]"
                      : "text-[#B8A99A] hover:bg-[#2B241F] hover:text-[#F5F0E8]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{flag}</span>
                    <span className="text-left">
                      <div className="text-xs">{name}</div>
                      <div className="text-[10px] opacity-75">{nativeName}</div>
                    </span>
                  </span>
                  {language === code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
