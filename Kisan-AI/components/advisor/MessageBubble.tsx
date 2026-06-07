/**
 * components/advisor/MessageBubble.tsx
 * Renders a single chat message - user or AI model.
 * AI messages can embed a DiagnosisCard.
 */

import Image from "next/image";
import { Wheat, Volume2, Square } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/utils";
import DiagnosisCard from "@/components/diagnose/DiagnosisCard";
import type { ChatMessage } from "@/app/(dashboard)/advisor/types";
import { useLanguage } from "@/core/language/context";
import { LANGUAGE_VOICE_MAP, TTS_SPEEDS } from "@/config/languages";
import type { TTSSpeed } from "@/config/languages";

// --- Typing indicator (three animated dots) ---

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-1 text-[#B8A99A] text-xs">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#B8A99A] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "800ms" }}
        />
      ))}
      <span>Soch raha hoon...</span>
    </div>
  );
}

// --- Timestamp formatter ---

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MessageBubbleProps {
  message: ChatMessage;
}

function extractVishwasScore(raw: string): { cleaned: string; score: number | null } {
  const match = raw.match(/vishwas\s*score\s*:\s*(\d{1,3})\s*\/\s*100/i);
  const score = match ? Math.max(0, Math.min(100, Number(match[1]))) : null;
  const cleaned = raw
    .replace(/\n?\s*vishwas\s*score\s*:\s*\d{1,3}\s*\/\s*100\s*/gi, "")
    .trim();
  return { cleaned, score };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { language, ttsSpeed, setTtsSpeed, t, isSpeaking, setIsSpeaking } = useLanguage();
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const isUser = message.role === "user";
  const parsed = extractVishwasScore(message.content || "");

  const badge =
    parsed.score === null
      ? null
      : parsed.score > 75
      ? {
          text: `✓ ${parsed.score}% bharosemand`,
          classes: "bg-green-900/40 border-green-700/50 text-green-300",
        }
      : parsed.score >= 50
      ? {
          text: `~ ${parsed.score}% theek hai`,
          classes: "bg-yellow-900/40 border-yellow-700/50 text-yellow-300",
        }
      : {
          text: `⚠ ${parsed.score}% sure nahi`,
          classes: "bg-rose-900/40 border-rose-700/50 text-rose-300",
        };

  const speakMessage = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !parsed.cleaned) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(parsed.cleaned);
    const targetLang = LANGUAGE_VOICE_MAP[language as keyof typeof LANGUAGE_VOICE_MAP] ?? "en-IN";
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
    if (matchingVoice) utterance.voice = matchingVoice;
    
    utterance.rate = TTS_SPEEDS[ttsSpeed].value;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // â”€â”€ User message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isUser) {
    return (
      <div className="flex justify-end px-4 md:px-6 group">
        <div className="max-w-[72%] flex flex-col items-end gap-1">
          {/* Image attachment preview */}
          {message.imagePreviewUrl && (
            <Image
              src={message.imagePreviewUrl}
              alt="Attached crop photo"
              width={240}
              height={160}
              unoptimized
              className="rounded-xl max-w-[240px] border border-[#3B322A] mb-1"
            />
          )}
          {/* Bubble */}
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#E86B2E] to-[#F4C430] text-[#0F0F0F]">
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          </div>
          {/* Time */}
          <span className="text-[10px] text-[#B8A99A] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // â”€â”€ AI model message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex items-start gap-3 px-4 md:px-6 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2B241F] border border-[#E86B2E]/30 flex items-center justify-center mt-0.5">
        <Wheat className="w-4 h-4 text-[#F5F0E8]" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Streaming / typing indicator */}
        {message.isStreaming && !message.content ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl rounded-tl-sm px-4 py-3 inline-block">
            <TypingIndicator />
          </div>
        ) : (
          <>
            {/* Text bubble */}
            {message.content && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{parsed.cleaned}</p>
                {badge && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] border ${badge.classes}`}>
                      {badge.text}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#3B322A] bg-[#2B241F] text-[#B8A99A]">Based on: Live Weather</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#3B322A] bg-[#2B241F] text-[#B8A99A]">Mandi Data</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={speakMessage}
                    disabled={isSpeaking}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#B8A99A] hover:text-[#F5F0E8] disabled:opacity-50 transition-colors"
                    title={t("chat.listen")}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {t("chat.listen")}
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#B8A99A] hover:text-amber-400 transition-colors"
                    title={t("chat.stop")}
                  >
                    <Square className="w-3 h-3" />
                    {t("chat.stop")}
                  </button>
                  
                  {/* Speed selector */}
                  <div className="relative">
                    <button
                      onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                      className="inline-flex items-center gap-1.5 text-[10px] text-[#B8A99A] hover:text-[#F5F0E8] transition-colors"
                      title={t("chat.speed")}
                    >
                      <span>{TTS_SPEEDS[ttsSpeed].label}</span>
                    </button>
                    
                    {speedMenuOpen && (
                      <div className="absolute bottom-full right-0 mb-1 bg-[#1F1B18] border border-[#3B322A] rounded shadow-lg z-10">
                        {Object.entries(TTS_SPEEDS).map(([key, { label }]) => (
                          <button
                            key={key}
                            onClick={async () => {
                              await setTtsSpeed(key as TTSSpeed);
                              setSpeedMenuOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-1.5 text-[10px] ${
                              ttsSpeed === key
                                ? "bg-[#E86B2E]/20 text-[#F4C430]"
                                : "text-[#B8A99A] hover:bg-[#2B241F] hover:text-[#F5F0E8]"
                            } transition-colors`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis card (embedded in AI message) */}
            {message.diagnosisResult && (
              <DiagnosisCard result={message.diagnosisResult} />
            )}
          </>
        )}

        {/* Time */}
        <span className="text-[10px] text-[#B8A99A] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}