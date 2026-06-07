"use client";

import React, { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Loader2, MapPin, Sprout } from "lucide-react";
import type { CropRecommendation, CropAdvisorFormData, GeminiRequestBody, GeminiResponseBody } from "@/models";
import { INDIA_STATES, getDistrictsByState } from "@/constants/india-locations";

const SOIL_TYPES = [
  "Alluvial Soil",
  "Black Cotton Soil (Regur)",
  "Red & Laterite Soil",
  "Loamy Soil",
  "Sandy Soil",
  "Clay Soil",
];

const WATER_SOURCES = ["Irrigated", "Rainfed", "Drip Irrigation", "Sprinkler"];

type FormState = Partial<CropAdvisorFormData> & {
  district?: string;
};

function ResultCard({ rec }: { rec: CropRecommendation }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Top Beej Salah</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-[#2D5016] text-[#F5F0E8] border border-[#E86B2E]/30">
          {rec.suitabilityScore}% confidence
        </span>
      </div>
      <div>
        <span className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-[#2B241F] border border-[#3B322A] text-[#F4C430]">
          {rec.suitabilityScore}% sahi ho sakti hai yeh salah
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#2B241F] border border-[#3B322A] flex items-center justify-center">
          <Sprout className="w-5 h-5 text-[#F5F0E8]" />
        </div>
        <div>
          <p className="text-xl font-bold text-white">{rec.cropName}</p>
          <p className="text-xs text-[#B8A99A]">Expected yield: {rec.expectedYield}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-[#1A1A1A] border border-[#3B322A] p-3">
          <p className="text-[#B8A99A] text-xs">Investment / acre</p>
          <p className="text-white font-semibold">₹{rec.estimatedROI.investmentPerAcre.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg bg-[#1A1A1A] border border-[#3B322A] p-3">
          <p className="text-[#B8A99A] text-xs">Profit / acre</p>
          <p className="text-[#F5F0E8] font-semibold">₹{rec.estimatedROI.profitPerAcre.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-[#B8A99A] mb-1">Why this crop?</p>
        <ul className="list-disc ml-4 text-sm text-white/90 space-y-1">
          {rec.reasonsForRecommendation.slice(0, 3).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CropAdvisorPage() {
  const [form, setForm] = useState<FormState>({
    season: "Kharif",
    waterSource: "Irrigated",
  });
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districts = useMemo(() => getDistrictsByState(form.state), [form.state]);

  const setField = (key: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onStateChange = (state: string) => {
    setForm((prev) => ({ ...prev, state, district: "" }));
  };

  const handleGenerate = async () => {
    if (!form.state || !form.district || !form.soilType) {
      setError("State, district, and soil type are required.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const contextStr = [
        `State: ${form.state}`,
        `District: ${form.district}`,
        form.soilType && `Soil type: ${form.soilType}`,
        form.season && `Season: ${form.season}`,
        form.landArea && `Land area: ${form.landArea} acres`,
        form.waterSource && `Water source: ${form.waterSource}`,
        form.previousCrop && `Previous crop: ${form.previousCrop}`,
        form.budget && `Budget: ₹${form.budget}`,
      ]
        .filter(Boolean)
        .join(". ");

      const body: GeminiRequestBody = {
        mode: "crop_advisor",
        prompt: `Recommend top 3 crops for this farmer. Make the advice district-specific for ${form.district}, ${form.state}. Include practical sowing window, irrigation, expected local market suitability, and a concise Hindi summary. ${contextStr}`,
        context: contextStr,
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: GeminiResponseBody = await res.json();
      if (!data.success || !data.structured) throw new Error(data.error ?? "No result");

      const parsed = data.structured as { recommendations?: CropRecommendation[] };
      setResult(parsed.recommendations?.[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate crop recommendation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 space-y-4 h-fit">
          <div>
            <h1 className="text-xl font-bold text-white">Beej Salah</h1>
            <p className="text-xs text-[#B8A99A] mt-1">Linked state-district analysis for better crop suitability.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#B8A99A]">State</label>
            <select
              value={form.state ?? ""}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">State select karein</option>
              {INDIA_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#B8A99A]">District</label>
            <select
              value={form.district ?? ""}
              disabled={!form.state}
              onChange={(e) => setField("district", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{form.state ? "District select karein" : "Pehle state chunein"}</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#B8A99A]">Soil Type</label>
            <select
              value={form.soilType ?? ""}
              onChange={(e) => setField("soilType", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Soil type select karein</option>
              {SOIL_TYPES.map((soil) => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-[#B8A99A]">Season</label>
              <select
                value={form.season ?? "Kharif"}
                onChange={(e) => setField("season", e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#B8A99A]">Land (acres)</label>
              <input
                type="number"
                value={form.landArea ?? ""}
                onChange={(e) => setField("landArea", Number(e.target.value))}
                className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#B8A99A]">Water Source</label>
            <select
              value={form.waterSource ?? "Irrigated"}
              onChange={(e) => setField("waterSource", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
            >
              {WATER_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#B8A99A]">Budget (₹)</label>
            <input
              type="number"
              value={form.budget ?? ""}
              onChange={(e) => setField("budget", Number(e.target.value))}
              className="w-full bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. 50000"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#E86B2E] hover:bg-[#d45f25] text-white text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            District-wise Crop Recommendation
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            <ResultCard rec={result} />
          ) : (
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 text-center text-[#B8A99A]">
              <p className="text-sm">State + district choose karke Beej Salah generate karein.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
