/**
 * components/advisor/MessageBubble.tsx
 * Renders a single chat message â€” user or AI model.
 * AI messages can embed a DiagnosisCard.
 */

import Image from "next/image";
import { Wheat } from "lucide-react";
import { cn } from "@/utils/utils";
import DiagnosisCard from "@/components/diagnose/DiagnosisCard";
import type { ChatMessage } from "@/app/(dashboard)/advisor/types";
import { Volume2, Square } from "lucide-react";

// â”€â”€â”€ Typing indicator (three animated dots) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Timestamp formatter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-[#B8A99A] mb-1">
                    <span>Confidence</span>
                    <span className="text-[#F5F0E8] font-medium">Medium</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#2B241F] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E86B2E] to-[#F4C430]" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#3B322A] bg-[#2B241F] text-[#B8A99A]">Based on: Live Weather</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#3B322A] bg-[#2B241F] text-[#B8A99A]">Mandi Data</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={speakMessage}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#B8A99A] hover:text-[#F5F0E8]"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#B8A99A] hover:text-amber-400"
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
        <span className="text-[10px] text-[#B8A99A] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}