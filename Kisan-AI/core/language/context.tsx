"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { LanguageCode, TTSSpeed } from "@/config/languages";
import { DEFAULT_LANGUAGE, TTS_SPEEDS } from "@/config/languages";
import { getTranslation } from "@/config/translations";
import { getUserProfile, updateUserProfile } from "@/core/firebase/user-profile";
import { useAuth } from "@/core/firebase/auth-context";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
  ttsSpeed: TTSSpeed;
  setTtsSpeed: (speed: TTSSpeed) => Promise<void>;
  isLoading: boolean;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [ttsSpeed, setTtsSpeedState] = useState<TTSSpeed>("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load user preferences from Firebase
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        if (!user?.uid) {
          setIsLoading(false);
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (profile?.preferredLanguage) {
          setLanguageState(profile.preferredLanguage as LanguageCode);
        }
        if (profile?.ttsSpeed) {
          setTtsSpeedState(profile.ttsSpeed as TTSSpeed);
        }
      } catch (error) {
        console.error("Failed to load language preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserLanguage();
  }, [user?.uid]);

  const setLanguage = useCallback(
    async (lang: LanguageCode) => {
      setLanguageState(lang);
      try {
        if (user?.uid) {
          await updateUserProfile(user.uid, { preferredLanguage: lang });
        }
      } catch (error) {
        console.error("Failed to save language preference:", error);
      }
    },
    [user?.uid]
  );

  const setTtsSpeed = useCallback(
    async (speed: TTSSpeed) => {
      setTtsSpeedState(speed);
      try {
        if (user?.uid) {
          await updateUserProfile(user.uid, { ttsSpeed: speed });
        }
      } catch (error) {
        console.error("Failed to save TTS speed preference:", error);
      }
    },
    [user?.uid]
  );

  const t = useCallback(
    (key: string) => {
      return getTranslation(language, key);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        ttsSpeed,
        setTtsSpeed,
        isLoading,
        isSpeaking,
        setIsSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
