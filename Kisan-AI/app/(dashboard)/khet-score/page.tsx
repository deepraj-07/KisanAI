"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";

const segments = [
  { label: "Soil", score: 21, color: "#2D5016" },
  { label: "Weather", score: 19, color: "#F4C430" },
  { label: "Activity", score: 22, color: "#E86B2E" },
  { label: "Market", score: 18, color: "#B8A99A" },
];

export default function KhetScorePage() {
  const total = segments.reduce((a, b) => a + b.score, 0);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Khet Score</h1>
          <p className="text-sm text-[#B8A99A] mt-1">Overall farm health score with AI-backed improvement tips.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 text-center">
            <div className="mx-auto w-40 h-40 rounded-full border-8 border-[#3B322A] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#E86B2E ${total * 3.6}deg, #3B322A 0deg)` }} />
              <div className="w-28 h-28 rounded-full bg-[#1A1A1A] border border-[#3B322A] flex flex-col items-center justify-center z-10">
                <span className="text-3xl font-bold text-white">{total}</span>
                <span className="text-[10px] text-[#B8A99A] uppercase">out of 100</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-[#F5F0E8] font-medium">Farm status is stable with improvement scope.</p>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 space-y-4">
            {segments.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#B8A99A]">{item.label}</span>
                  <span className="text-white font-semibold">{item.score}/25</span>
                </div>
                <div className="h-2 rounded-full bg-[#0F0F0F] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.score / 25) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-[#3B322A]">
              <h2 className="text-sm font-semibold text-white mb-2">AI Recommendations</h2>
              <ul className="space-y-2 text-sm text-[#B8A99A]">
                <li>- Add one moisture-check activity this week to improve Soil score.</li>
                <li>- Track pesticide logs in Khet Diary to boost Activity score.</li>
                <li>- Set mandi price alerts for wheat and mustard to improve Market score.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
