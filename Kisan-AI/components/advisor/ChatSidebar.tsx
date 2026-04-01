/**
 * components/advisor/ChatSidebar.tsx
 * Left panel showing chat history sessions and a "New Advice Session" button.
 * Matches the design: "CHAT HISTORY" header, session list with title + date.
 */

"use client";

import { cn } from "@/utils/utils";
import { Plus, MessageSquare, ScanSearch, Lightbulb } from "lucide-react";
import type { ChatSession } from "@/app/(dashboard)/advisor/types";

// â”€â”€â”€ Date label helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function sessionDateLabel(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  }
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

// â”€â”€â”€ Mode icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ModeIcon({ mode }: { mode: ChatSession["mode"] }) {
  const props = { className: "w-3 h-3", strokeWidth: 2 as const };
  if (mode === "pest_diagnosis") return <ScanSearch {...props} />;
  if (mode === "crop_advisor")   return <Lightbulb  {...props} />;
  return <MessageSquare {...props} />;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-[#1A1A1A] border-r border-[#3B322A]">
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-3">
          Salah History
        </p>

        {/* New Advice Session button */}
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #E86B2E 0%, #F4C430 100%)",
            boxShadow: "0 2px 8px rgba(232,107,46,0.28)",
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Naya Salah Session
        </button>
      </div>

      {/* â”€â”€ Session list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg transition-all duration-150 group",
                isActive
                  ? "bg-[#332B23] border border-[#E86B2E]/40"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              {/* Title row */}
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    "flex-shrink-0",
                    isActive ? "text-[#F5F0E8]" : "text-[#B8A99A] group-hover:text-[#B8A99A]"
                  )}
                >
                  <ModeIcon mode={session.mode} />
                </span>
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-white" : "text-[#B8A99A] group-hover:text-white"
                  )}
                >
                  {session.title}
                </span>
              </div>

              {/* Date */}
              <p
                className={cn(
                  "text-[11px] pl-5",
                  isActive ? "text-[#B8A99A]" : "text-[#3d4d3e]"
                )}
              >
                {sessionDateLabel(session.updatedAt)}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}