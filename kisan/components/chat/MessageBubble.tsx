/**
 * components/chat/MessageBubble.tsx
 * Renders a single chat message — user or AI model.
 * AI messages can embed a DiagnosisCard.
 */

import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import DiagnosisCard from "./DiagnosisCard";
import type { ChatMessage } from "@/app/chat/types";
import { Volume2, Square } from "lucide-react";

// ─── Typing indicator (three animated dots) ───────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#5a7460] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "800ms" }}
        />
      ))}
    </div>
  );
}

// ─── Timestamp formatter ──────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
  language?: string;
}

const languageVoiceMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
};

export default function MessageBubble({ message, language = "en" }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const speakMessage = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !message.content) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    const targetLang = languageVoiceMap[language] ?? "en-IN";
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  // ── User message ─────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end px-4 md:px-6 group">
        <div className="max-w-[72%] flex flex-col items-end gap-1">
          {/* Image attachment preview */}
          {message.imagePreviewUrl && (
            <img
              src={message.imagePreviewUrl}
              alt="Attached crop photo"
              className="rounded-xl max-w-[240px] border border-[#2a3d2c] mb-1"
            />
          )}
          {/* Bubble */}
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-[#2ea82e] text-[#0b1410]">
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          </div>
          {/* Time */}
          <span className="text-[10px] text-[#5a7460] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // ── AI model message ─────────────────────────────────────────
  return (
    <div className="flex items-start gap-3 px-4 md:px-6 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#182419] border border-[#2ea82e]/30 flex items-center justify-center mt-0.5">
        <Leaf className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Streaming / typing indicator */}
        {message.isStreaming && !message.content ? (
          <div className="bg-[#111d16] border border-[#2a3d2c] rounded-2xl rounded-tl-sm px-4 py-3 inline-block">
            <TypingIndicator />
          </div>
        ) : (
          <>
            {/* Text bubble */}
            {message.content && (
              <div className="bg-[#111d16] border border-[#2a3d2c] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-[#e8f5e9] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={speakMessage}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#94a896] hover:text-[#4dc24d]"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#94a896] hover:text-amber-400"
                    title="Stop audio"
                  >
                    <Square className="w-3 h-3" />
                    Stop
                  </button>
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
        <span className="text-[10px] text-[#5a7460] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}