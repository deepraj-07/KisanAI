/**
 * components/advisor/ChatInputBar.tsx
 * Rich input bar at the bottom of the chat.
 * Features: image attach (AI image analysis), file clip, voice mic, send button.
 * Matches the design screenshot exactly.
 */

"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type ChangeEvent, useEffect } from "react";
import {
  ImagePlus,
  Paperclip,
  Mic,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { cn, fileToBase64, getImageMimeType } from "@/utils/utils";

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ChatInputBarProps {
  onSend: (text: string, image?: { base64: string; mimeType: string; previewUrl: string }) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  language?: string;
}

type SpeechRecognitionEventLike = Event & {
  results: {
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
    length: number;
  };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export default function ChatInputBar({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Ask about soil health, pest control, or yields...",
  language = "en",
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [transcript, setTranscript] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseTextRef = useRef("");

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // â”€â”€ Image selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const previewUrl = URL.createObjectURL(file);
    const base64 = await fileToBase64(file);
    const mimeType = getImageMimeType(file);

    setImagePreview(previewUrl);
    setImageData({ base64, mimeType });
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageData(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // â”€â”€ Send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imageData) return;
    if (isLoading) return;

    onSend(
      trimmed || "Please diagnose the disease in this image.",
      imageData && imagePreview
        ? { ...imageData, previewUrl: imagePreview }
        : undefined
    );

    setText("");
    clearImage();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // â”€â”€ Enter to send (Shift+Enter = newline) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // â”€â”€ Auto-resize textarea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setText((prev) => `${prev}${prev ? "\n" : ""}[Voice input works best in Chrome browser.]`);
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    const speechLangMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      pa: "pa-IN",
      mr: "mr-IN",
      te: "te-IN",
      ta: "ta-IN",
    };
    recognition.lang = speechLangMap[language] ?? "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    speechBaseTextRef.current = text.trim();

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      const spoken = transcript.trim();
      setTranscript(spoken);
      const base = speechBaseTextRef.current;
      const combined = base && spoken ? `${base} ${spoken}` : (spoken || base);
      setText(combined);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setText((prev) => `${prev}${prev ? "\n" : ""}[Mic permission blocked. Allow microphone access in Chrome.]`);
      } else if (event.error === "network") {
        setText((prev) => `${prev}${prev ? "\n" : ""}[Network issue during voice input. Please try again.]`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const canSend = (text.trim().length > 0 || imageData !== null) && !isLoading && !disabled;

  return (
    <div className="px-4 md:px-6 pb-4 pt-2">
      {/* â”€â”€ Image preview strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {imagePreview && (
        <div className="mb-2 flex items-start gap-2">
          <div className="relative inline-block">
            <Image
              src={imagePreview}
              alt="Image to analyse"
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 object-cover rounded-xl border border-[#3B322A]"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#0F0F0F] border border-[#3B322A] flex items-center justify-center text-[#B8A99A] hover:text-rose-400 transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-xs text-[#B8A99A] mt-2">
            Image attached â€” AI will analyse it
          </span>
        </div>
      )}
      {isListening && transcript && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2B241F] border border-[#E86B2E]/40 text-xs text-[#F5F0E8]">
          <span className="w-2 h-2 rounded-full bg-[#E86B2E] animate-pulse" />
          {transcript}
        </div>
      )}

      {/* â”€â”€ Input container â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={cn(
          "flex items-end gap-2 px-3 py-2.5 rounded-2xl border transition-colors duration-150",
          "bg-[#1A1A1A] border-[#3B322A]",
          "focus-within:border-[#5A4636]"
        )}
      >
        {/* Left actions */}
        <div className="flex items-center gap-1 pb-0.5">
          <button
            disabled={disabled}
            onClick={() => setText((prev) => `${prev}${prev ? " " : ""}Hey Kisan`)}
            className="px-2 py-1 rounded-lg text-[10px] text-[#F5F0E8] bg-[#E86B2E]/15 border border-[#E86B2E]/30 hover:bg-[#E86B2E]/25 transition-all disabled:opacity-40"
            title="Wake word placeholder"
          >
            Hey Kisan
          </button>

          {/* AI image analysis */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-all disabled:opacity-40"
            title="Attach image for AI analysis"
          >
            <ImagePlus className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          {/* File clip */}
          <button
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-all disabled:opacity-40"
            title="Attach file"
          >
            <Paperclip className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-sm text-white placeholder:text-[#3d4d3e]",
            "outline-none resize-none leading-relaxed py-0.5",
            "disabled:opacity-50",
            "min-h-[24px] max-h-[140px]"
          )}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1 pb-0.5">
          {/* Voice (placeholder) */}
          <button
            onClick={handleVoiceInput}
            disabled={disabled}
            className={cn(
              "p-1.5 rounded-lg transition-all disabled:opacity-40",
              isListening
                ? "text-rose-400 bg-[#332B23] animate-pulse"
                : "text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5"
            )}
            title={isListening ? "Stop voice input" : "Start voice input"}
          >
            <Mic className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "p-2 rounded-xl transition-all duration-150 active:scale-95",
              canSend
                ? "bg-gradient-to-r from-[#E86B2E] to-[#F4C430] text-[#0F0F0F] hover:scale-105 hover:brightness-110 shadow-[0_2px_10px_rgba(232,107,46,0.28)]"
                : "bg-[#2B241F] text-[#3d4d3e] cursor-not-allowed"
            )}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* â”€â”€ Footer note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[10px] text-[#3d4d3e] flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#E86B2E] inline-block" />
          {isListening ? "Listening... speak clearly in Chrome" : "AI analysis backed by regional agricultural datasets"}
        </p>
        <div className="flex items-center gap-1">
          {(["slow", "normal", "fast"] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setVoiceSpeed(speed)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] border transition-colors",
                voiceSpeed === speed
                  ? "bg-[#E86B2E]/20 border-[#E86B2E]/40 text-[#F5F0E8]"
                  : "border-[#3B322A] text-[#B8A99A]"
              )}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
        }}
      />
    </div>
  );
}