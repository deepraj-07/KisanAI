"use client";

import React from "react";
import { CloudRain, Sprout, Scissors } from "lucide-react";

type CalendarEvent = {
  day: number;
  type: "sowing" | "harvest" | "weather";
  label: string;
};

const EVENTS: CalendarEvent[] = [
  { day: 3, type: "sowing", label: "Sowing - Wheat" },
  { day: 11, type: "weather", label: "Heavy Rain Alert" },
  { day: 18, type: "weather", label: "Spray Window" },
  { day: 24, type: "harvest", label: "Harvest Prep" },
];

const typeStyles: Record<CalendarEvent["type"], string> = {
  sowing: "bg-[#2D5016]/35 border-[#2D5016]/60 text-[#F5F0E8]",
  harvest: "bg-[#E86B2E]/25 border-[#E86B2E]/55 text-[#F5F0E8]",
  weather: "bg-[#F4C430]/20 border-[#F4C430]/50 text-[#F4C430]",
};

const typeIcon: Record<CalendarEvent["type"], React.ReactNode> = {
  sowing: <Sprout className="w-3 h-3" />,
  harvest: <Scissors className="w-3 h-3" />,
  weather: <CloudRain className="w-3 h-3" />,
};

export default function FasalCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <section className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Fasal Calendar</h3>
          <p className="text-xs text-[#B8A99A]">{monthLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[10px] text-[#B8A99A] mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          const event = day ? EVENTS.find((e) => e.day === day) : undefined;
          return (
            <div
              key={`${day}-${idx}`}
              className="h-14 rounded-lg border border-[#3B322A] bg-[#1A1A1A] p-1.5"
            >
              {day && (
                <>
                  <p className="text-[10px] text-[#F5F0E8] font-medium">{day}</p>
                  {event && (
                    <div className={`mt-1 inline-flex items-center gap-1 border rounded px-1 py-0.5 text-[9px] ${typeStyles[event.type]}`}>
                      {typeIcon[event.type]}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#B8A99A]">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2D5016]" /> Sowing</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E86B2E]" /> Harvest</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F4C430]" /> Weather Event</span>
      </div>
    </section>
  );
}
