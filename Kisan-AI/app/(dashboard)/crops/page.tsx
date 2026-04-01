/**
 * app/crops/page.tsx
 * ============================================================
 * Crop Advisor Page â€” pixel-matched to design screenshot.
 *
 * Layout:
 *  [Left: Analysis Parameters form] | [Right: Results panel]
 *    - Top recommendation card (crop name, confidence, tags)
 *    - Growth stage timeline (Sowing â†’ Vegetative â†’ Flowering â†’ Maturity)
 *    - Input Cost vs. Profit ROI breakdown
 *    - Action Required CTA card
 * ============================================================
 */

"use client";

import React from "react";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  BarChart2,
  Sprout,
  Droplets,
  TrendingUp,
  CalendarDays,
  Loader2,
  Info,
  Zap,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/utils/utils";
import type { CropRecommendation, CropAdvisorFormData, GeminiRequestBody, GeminiResponseBody } from "@/models";

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const SOIL_TYPES = [
  "Alluvial Soil","Black Cotton Soil (Regur)","Red & Laterite Soil",
  "Arid & Desert Soil","Saline & Alkaline Soil","Peaty & Marshy Soil",
  "Forest & Mountain Soil","Loamy Soil","Sandy Soil","Clay Soil",
];

const WATER_SOURCES = ["Irrigated","Rainfed","Drip Irrigation","Sprinkler"];

const GROWTH_STAGES = [
  { label: "Sowing",     weeks: "Week 1-2"   },
  { label: "Vegetative", weeks: "Week 3-8"   },
  { label: "Flowering",  weeks: "Week 9-14"  },
  { label: "Maturity",   weeks: "Week 15-22" },
];


// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Top recommendation hero card */
function RecommendationHero({ rec }: { rec: CropRecommendation }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6">
      <div className="flex items-start gap-6">
        {/* Crop illustration placeholder */}
        <div className="flex-shrink-0 w-28 h-28 rounded-xl bg-[#2B241F] border border-[#3B322A] flex items-center justify-center">
          <Sprout className="w-12 h-12 text-[#F5F0E8]" strokeWidth={1} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">
              Top Recommendation
            </p>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5016] border border-[#6D4BEA] text-[#F5F0E8] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4C430] animate-pulse" />
              {rec.suitabilityScore}% Confidence
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-2">
            {rec.cropName}
          </h2>
          <p className="text-sm text-[#B8A99A] leading-relaxed">
            Based on your black cotton soil and upcoming monsoon forecasts,
            long-staple hybrid cotton is projected to yield{" "}
            <span className="text-white font-medium">{rec.expectedYield}</span>.
          </p>

          {/* Attribute tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B241F] border border-[#3B322A] text-xs text-[#B8A99A]">
              <CalendarDays className="w-3.5 h-3.5 text-[#B8A99A]" />
              {rec.growingPeriodDays}â€“{rec.growingPeriodDays + 20} Days
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B241F] border border-[#3B322A] text-xs text-[#B8A99A]">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              {rec.waterRequirement} Need
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B241F] border border-[#3B322A] text-xs text-[#F5F0E8]">
              <TrendingUp className="w-3.5 h-3.5" />
              High ROI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Growth stage timeline â€” matches the connected dot design */
function GrowthTimeline({ activeStages = 2 }: { activeStages?: number }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6">
      <h3 className="text-base font-semibold text-white mb-6">
        Growth Stage Timeline
      </h3>

      <div className="relative flex items-center justify-between">
        {/* Connecting line behind nodes */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#3B322A]" />
        {/* Active segment */}
        <div
          className="absolute top-5 left-5 h-0.5 bg-[#E86B2E] transition-all duration-700"
          style={{ width: `${((activeStages - 1) / (GROWTH_STAGES.length - 1)) * 100}%` }}
        />

        {GROWTH_STAGES.map((stage, i) => {
          const isActive = i < activeStages;
          const isCurrent = i === activeStages - 1;
          return (
            <div key={stage.label} className="relative flex flex-col items-center gap-2 z-10">
              {/* Node */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isActive
                    ? isCurrent
                      ? "bg-[#E86B2E] border-[#F4C430] shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                      : "bg-[#6D4BEA] border-[#E86B2E]"
                    : "bg-[#2B241F] border-[#3B322A]"
                )}
              >
                {i === 0 && <Sprout   className={cn("w-4 h-4", isActive ? "text-white" : "text-[#3d4d3e]")} strokeWidth={2} />}
                {i === 1 && <Sprout   className={cn("w-4 h-4", isActive ? "text-white" : "text-[#3d4d3e]")} strokeWidth={2} />}
                {i === 2 && <span    className={cn("text-sm font-bold", isActive ? "text-white" : "text-[#3d4d3e]")}>8</span>}
                {i === 3 && <Sprout  className={cn("w-4 h-4", isActive ? "text-white" : "text-[#3d4d3e]")} strokeWidth={2} />}
              </div>
              {/* Label */}
              <div className="text-center">
                <p className={cn("text-xs font-semibold", isActive ? "text-white" : "text-[#3d4d3e]")}>
                  {stage.label}
                </p>
                <p className={cn("text-[10px]", isActive ? "text-[#B8A99A]" : "text-[#3B322A]")}>
                  {stage.weeks}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Input Cost vs. ROI breakdown â€” matches the horizontal bar design */
function ROIBreakdown({ rec }: { rec: CropRecommendation }) {
  const { investmentPerAcre, expectedRevenuePerAcre, profitPerAcre } = rec.estimatedROI;
  const maxVal = expectedRevenuePerAcre;

  const rows = [
    { label: "Seed & Fertilizer",  value: 24000,                color: "bg-[#E86B2E]",  width: (24000 / maxVal) * 100 },
    { label: "Labor & Irrigation",  value: 18500,               color: "bg-[#F4C430]",  width: (18500 / maxVal) * 100 },
    { label: "Projected Revenue",   value: expectedRevenuePerAcre, color: "bg-[#B8A99A]", width: (expectedRevenuePerAcre / maxVal) * 100 },
  ];

  const profitabilityIndex = (expectedRevenuePerAcre / investmentPerAcre).toFixed(1);

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6">
      <h3 className="text-base font-semibold text-white mb-5">
        Input Cost vs. Profit ROI
      </h3>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-[#B8A99A]">{row.label}</span>
              <span className="text-sm font-semibold text-white">
                â‚¹{row.value.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#3B322A] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", row.color)}
                style={{ width: `${row.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#3B322A] flex items-center justify-between">
        <span className="text-sm text-[#B8A99A]">Net Profitability Index</span>
        <span className="text-2xl font-bold text-[#F5F0E8]">{profitabilityIndex}x</span>
      </div>
    </div>
  );
}

/** Action Required CTA card (dark green, bottom right) */
function ActionCard() {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #2D5016 0%, #2D5016 60%, #061a06 100%)",
        border: "1px solid #E86B2E33",
      }}
    >
      {/* Background texture lines */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #F4C430 0, #F4C430 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
      />

      <div className="relative z-10">
        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#E86B2E]/20 text-[#B8A99A] border border-[#E86B2E]/30 mb-3">
          Action Required
        </span>
        <h3 className="text-lg font-bold text-white mb-2 leading-snug">
          Order Seeds for<br />Kharif Season
        </h3>
        <p className="text-xs text-[#B8A99A]/80 leading-relaxed mb-4">
          Local stocks for Hybrid-4 are depleting. Reserve now to ensure 100% germination rate.
        </p>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white text-[#0F0F0F] text-sm font-semibold hover:bg-[#E5E7EB] transition-colors active:scale-95">
          <MapPin className="w-4 h-4" />
          Locate Supplier Near Nashik
        </button>
      </div>

      {/* Chat bubble icon */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#E86B2E]/20 flex items-center justify-center">
        <MessageSquare className="w-4 h-4 text-[#F5F0E8]" strokeWidth={2} />
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CropAdvisorPage() {
  const [form, setForm] = useState<Partial<CropAdvisorFormData>>({
    season: "Kharif",
    waterSource: "Irrigated",
  });
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CropAdvisorFormData, val: string | number) =>
    setForm((p: Partial<CropAdvisorFormData>) => ({ ...p, [key]: val }));

  const handleGenerate = async () => {
    if (!form.state || !form.soilType) {
      setError("Please select at least State and Soil Type.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const contextStr = [
        form.state     && `State: ${form.state}`,
        form.district  && `District: ${form.district}`,
        form.soilType  && `Soil type: ${form.soilType}`,
        form.season    && `Season: ${form.season}`,
        form.landArea  && `Land area: ${form.landArea} acres`,
        form.waterSource && `Water source: ${form.waterSource}`,
        form.previousCrop && `Previous crop: ${form.previousCrop}`,
        form.budget    && `Budget: â‚¹${form.budget}`,
      ].filter(Boolean).join(". ");

      const body: GeminiRequestBody = {
        prompt: `Recommend the top 3 crops for this farmer profile. ${contextStr}`,
        mode: "crop_advisor",
        context: contextStr,
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: GeminiResponseBody = await res.json();
      if (!data.success || !data.structured) throw new Error(data.error ?? "No result");

      const parsed = data.structured as { recommendations: CropRecommendation[] };
      const topRec = parsed.recommendations?.[0] ?? null;
      setResult(topRec);
      // Log to Firebase
      if (topRec) {
        const { logActivity } = await import("@/core/firebase/activity-log");
        const { auth } = await import("@/core/firebase/client");
        const uid = auth.currentUser?.uid;
        if (uid) {
          await logActivity({ userId: uid, type: "crop_recommendation", title: `Recommended: ${topRec.cropName}`, description: `Suitability: ${topRec.suitabilityScore}%`, metadata: { crop: topRec.cropName, score: topRec.suitabilityScore } });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* â”€â”€ Page header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#F5F0E8]" />
          <span className="text-xs text-[#B8A99A] uppercase tracking-wider font-medium">
            AI-Powered Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* â”€â”€ LEFT: Form panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
              {/* Form header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#E86B2E]/20 flex items-center justify-center">
                  <BarChart2 className="w-3.5 h-3.5 text-[#F5F0E8]" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-semibold text-white">
                  Analysis Parameters
                </h2>
              </div>

              <div className="space-y-4">
                {/* Regional Data */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Regional Data
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="input-field text-sm"
                      value={form.state ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("state", e.target.value)}
                    >
                      <option value="">State</option>
                      {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <select
                      className="input-field text-sm"
                      value={form.district ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("district", e.target.value)}
                    >
                      <option value="">District</option>
                      <option>Nashik</option>
                      <option>Ludhiana</option>
                      <option>Amravati</option>
                      <option>Guntur</option>
                    </select>
                  </div>
                </div>

                {/* Environment */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Environment
                  </p>
                  <select
                    className="input-field text-sm"
                    value={form.soilType ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("soilType", e.target.value)}
                  >
                    <option value="">Soil Type</option>
                    {SOIL_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Area + Season */}
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                        Area (Acres)
                      </p>
                      <input
                        type="number"
                        placeholder="e.g. 5.0"
                        className="input-field text-sm"
                        min={0.5}
                        step={0.5}
                        value={form.landArea ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("landArea", parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                        Season
                      </p>
                      <select
                        className="input-field text-sm"
                        value={form.season ?? "Kharif"}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("season", e.target.value as CropAdvisorFormData["season"])}
                      >
                        <option>Kharif</option>
                        <option>Rabi</option>
                        <option>Zaid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Water Source toggle */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Water Source
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {WATER_SOURCES.slice(0, 2).map((src) => (
                      <button
                        key={src}
                        onClick={() => set("waterSource", src)}
                        className={cn(
                          "py-2.5 rounded-lg text-sm font-medium border transition-all duration-150",
                          form.waterSource === src
                            ? "bg-gradient-to-r from-[#E86B2E] to-[#2D5016] text-white border-[#E86B2E]"
                            : "bg-transparent text-[#B8A99A] border-[#3B322A] hover:border-[#5A4636]"
                        )}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previous crop */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Previous Crop (optional)
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Soybean"
                    className="input-field text-sm"
                    value={form.previousCrop ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("previousCrop", e.target.value)}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-rose-400 bg-rose-900/20 border border-rose-800/40 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all active:scale-95",
                    "text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                  style={{
                    background: isLoading
                      ? "#6D4BEA"
                      : "linear-gradient(135deg, #E86B2E 0%, #6D4BEA 100%)",
                    boxShadow: isLoading ? "none" : "0 4px 14px rgba(99,102,241,0.32)",
                  }}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Generate Recommendation</>
                  )}
                </button>
              </div>
            </div>

            {/* Precision note card */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1A1A1A] border border-[#E86B2E]/20">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#E86B2E]/15 flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-[#F5F0E8]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F5F0E8] mb-1">Precision Note</p>
                <p className="text-xs text-[#B8A99A] leading-relaxed">
                  Data is analysed against 15 years of regional climate patterns and current soil health reports.
                </p>
              </div>
            </div>
          </div>

          {/* â”€â”€ RIGHT: Results panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="space-y-4">
            {isLoading && (
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E86B2E]/10 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-[#F5F0E8] animate-spin-slow" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">Analysing your farm parametersâ€¦</p>
                  <p className="text-xs text-[#B8A99A] mt-1">Checking 15 years of climate data</p>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  {[80, 60, 90].map((w, i) => (
                    <div key={i} className={`shimmer h-3 rounded-full`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex flex-col items-center justify-center h-72 rounded-xl border border-dashed border-[#3B322A] text-center px-6">
                <BarChart2 className="w-10 h-10 text-[#3B322A] mb-3" strokeWidth={1} />
                <p className="text-sm font-medium text-[#3d4d3e]">Recommendation will appear here</p>
                <p className="text-xs text-[#3B322A] mt-1">Fill the form and click Generate</p>
              </div>
            )}

            {!isLoading && result && (
              <div className="space-y-4 animate-fade-in-up">
                {/* Top recommendation card */}
                <RecommendationHero rec={result} />

                {/* Growth stage timeline */}
                <GrowthTimeline activeStages={2} />

                {/* ROI + Action side by side on larger screens */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
                  <ROIBreakdown rec={result} />
                  <ActionCard />
                </div>

                {/* Reasons & Risks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reasons */}
                  <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-3">
                      Why This Crop
                    </p>
                    <ul className="space-y-2">
                      {result.reasonsForRecommendation.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#B8A99A]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#F4C430] flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-3">
                      Risks to Watch
                    </p>
                    <ul className="space-y-2">
                      {result.risks.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#B8A99A]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}