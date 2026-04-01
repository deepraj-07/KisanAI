"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

const STEPS = [
  { title: "Step 1", label: "Select state + district" },
  { title: "Step 2", label: "Add primary crops" },
  { title: "Step 3", label: "Enter land size" },
  { title: "Step 4", label: "Select language" },
  { title: "Step 5", label: "Tour of features" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-white">Welcome to Kisan AI</h1>
        <p className="text-sm text-[#B8A99A] mt-1">Complete your farmer profile in 5 simple steps.</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-5 gap-2">
          {STEPS.map((s, i) => {
            const idx = i + 1;
            const done = idx < step;
            const active = idx === step;
            return (
              <div key={s.title} className={`rounded-lg border px-2 py-2 text-center ${active ? "border-[#E86B2E]/50 bg-[#E86B2E]/12" : "border-[#3B322A] bg-[#1A1A1A]"}`}>
                <div className="flex items-center justify-center mb-1">
                  <span className={`w-5 h-5 rounded-full border text-[10px] inline-flex items-center justify-center ${done ? "bg-[#2D5016] border-[#2D5016] text-white" : "border-[#B8A99A] text-[#B8A99A]"}`}>
                    {done ? <Check className="w-3 h-3" /> : idx}
                  </span>
                </div>
                <p className="text-[10px] text-[#B8A99A]">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-[#3B322A] bg-[#1A1A1A] p-4">
          <p className="text-xs text-[#B8A99A]">{STEPS[step - 1].title}</p>
          <h2 className="text-base font-semibold text-white mt-1">{STEPS[step - 1].label}</h2>
          <p className="text-sm text-[#B8A99A] mt-2">This is a guided placeholder flow. Connect it with profile APIs to persist onboarding data.</p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => setStep((p) => Math.max(1, p - 1))} className="btn-secondary">Back</button>
          <button onClick={() => setStep((p) => Math.min(5, p + 1))} className="btn-primary">{step === 5 ? "Finish" : "Next"}</button>
        </div>
      </div>
    </div>
  );
}
