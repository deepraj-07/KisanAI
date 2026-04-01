/**
 * app/diagnose/page.tsx â€” v2
 * Rebuilt to match design Image 4 exactly.
 *
 * All TypeScript errors fixed:
 *  - React explicitly imported (fixes TS2503 React namespace errors)
 *  - data.structured cast via `as unknown as PestDiagnosisResult` (fixes TS2352)
 *  - All onChange/onClick/onDrag handlers fully typed with React.ChangeEvent<T>
 *  - TreatmentStep key uses React.Fragment wrapper (avoids TS2322 key prop error)
 *  - err caught as `unknown` and narrowed with instanceof
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import {
  Upload, ScanSearch, X, Loader2, AlertCircle,
  Info, FileText, Download, BarChart2, ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { cn, fileToBase64, getImageMimeType } from "@/utils/utils";
import type { PestDiagnosisResult, GeminiRequestBody, GeminiResponseBody } from "@/models";

// â”€â”€â”€ Pre-loaded mock result (matches design screenshot) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MOCK_RESULT: PestDiagnosisResult = {
  diseaseName: "Yellow Rust",
  scientificName: "Puccinia striiformis",
  confidencePercent: 92,
  severity: "Moderate",
  affectedArea: "~25% of leaf area",
  symptoms: [
    "Stripes of yellow-to-orange pustules parallel to leaf veins",
    "Powdery spore masses on upper leaf surface",
    "Stunted growth and premature leaf death",
  ],
  treatment: {
    immediate: [
      "Apply Fungicide â€” Apply a triazole-based fungicide immediately to halt pustule development.",
      "Isolate Affected Area â€” Restrict machinery movement through infected plots to prevent spore transfer.",
      "Monitor Neighbouring Crops â€” Scout downwind fields daily for early signs of yellow stippling.",
    ],
    preventive: [
      "Plant rust-resistant wheat varieties next season.",
      "Avoid excessive nitrogen fertilisation.",
    ],
    recommendedPesticides: ["Tilt 250 EC (Propiconazole)", "Folicur (Tebuconazole)"],
  },
  disclaimer: "Consult a local agronomist for confirmation before applying treatments.",
};

const CROP_TYPES: string[]  = ["Winter Wheat","Rice","Maize","Cotton","Soybean","Mustard","Sugarcane","Tomato"];
const CROP_STAGES: string[] = ["Germination","Seedling","Vegetative","Tillering","Flowering","Grain Fill","Maturity"];

// â”€â”€â”€ TreatmentStep sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Note: key is NOT in the props interface â€” React strips it.
// At the call-site we use <React.Fragment key={i}> as the keyed wrapper.

function TreatmentStep({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E86B2E]/20 border border-[#E86B2E]/30 flex items-center justify-center text-xs font-bold text-[#F5F0E8]">
        {num}
      </span>
      <div>
        <p className="text-sm font-semibold text-white leading-snug">{title}</p>
        <p className="text-xs text-[#B8A99A]/60 mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// â”€â”€â”€ Page Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PestDiagnosisPage() {
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning,   setIsScanning]   = useState(false);
  const [observations, setObservations] = useState(
    "Yellow spots on leaves, circular patterns observed on upper canopy. Wilted stems in some clusters."
  );
  const [cropType,  setCropType]  = useState("Winter Wheat");
  const [cropStage, setCropStage] = useState("Flowering");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [result,    setResult]    = useState<PestDiagnosisResult | null>(null);
  const [analysisId]              = useState("CWP-992-B");
  const inputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ File selection handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setIsScanning(true);
    setScanProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 4;
      setScanProgress(p);
      if (p >= 72) { clearInterval(iv); setIsScanning(false); setScanProgress(72); }
    }, 80);
  }, []);

  // â”€â”€ Drag-and-drop handler (fully typed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // â”€â”€ AI diagnosis handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDiagnose = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const base64   = await fileToBase64(imageFile);
      const mimeType = getImageMimeType(imageFile);
      const prompt   = [
        "Diagnose any disease or pest issues.",
        `Crop: ${cropType}.`,
        `Stage: ${cropStage}.`,
        observations && `Symptoms: ${observations}`,
      ].filter(Boolean).join(" ");

      const body: GeminiRequestBody = {
        prompt,
        mode: "pest_diagnosis",
        imageBase64: base64,
        imageMimeType: mimeType,
      };

      const res = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data: GeminiResponseBody = await res.json();
      if (!data.success || !data.structured) {
        throw new Error(data.error ?? "Diagnosis failed.");
      }

      const diagResult = data.structured as unknown as PestDiagnosisResult;
      setResult(diagResult);
      // Log to Firebase
      const { logActivity } = await import("@/core/firebase/activity-log");
      const { auth } = await import("@/core/firebase/client");
      const uid = auth.currentUser?.uid;
      if (uid) {
        await logActivity({ userId: uid, type: "pest_diagnosis", title: `Diagnosed: ${diagResult.diseaseName}`, description: `${diagResult.severity} severity â€” ${diagResult.confidencePercent}% confidence`, metadata: { disease: diagResult.diseaseName, severity: diagResult.severity, confidence: diagResult.confidencePercent } });
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // â”€â”€ Severity colour helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const severityColor = (s: string): string =>
    ({ Low: "text-[#F5F0E8]", Moderate: "text-amber-400", High: "text-orange-400", Critical: "text-rose-400" })[s as "Low" | "Moderate" | "High" | "Critical"] ?? "text-[#B8A99A]";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* â”€â”€ Row 1: Image Analysis + Symptom Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* â”€â”€ Image Analysis card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="card space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Rog Pahchan</h2>
              <p className="text-xs text-[#B8A99A] mt-0.5">
                Fasal ki photo khinchein ya upload karein.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(_e: React.DragEvent<HTMLDivElement>) => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !imagePreview && inputRef.current?.click()}
              className={cn(
                "relative h-64 rounded-xl border-2 overflow-hidden transition-all duration-200",
                imagePreview
                  ? "border-[#3B322A] cursor-default"
                  : isDragging
                    ? "border-[#E86B2E] bg-[#E86B2E]/5 cursor-copy scale-[1.01]"
                    : "border-dashed border-[#3B322A] bg-[#1A1A1A] cursor-pointer hover:border-[#5A4636]"
              )}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Uploaded crop"
                    fill
                    unoptimized
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning progress overlay */}
                  {(isScanning || scanProgress > 0) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F0F]/65 backdrop-blur-sm">
                      <div className="w-14 h-14 rounded-xl bg-[#2B241F] border border-[#3B322A] flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-[#B8A99A]" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-bold text-white mb-0.5">Scanning in progress...</p>
                      <p className="text-[10px] text-[#B8A99A] mb-4 text-center px-6">
                        Drop high-resolution leaf or stem images here<br />(JPEG, PNG up to 20MB)
                      </p>
                      <div className="w-48">
                        <div className="h-1.5 w-full rounded-full bg-[#3B322A] overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full bg-[#E86B2E] transition-all duration-200"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                        <p className="text-center text-[10px] font-semibold text-[#B8A99A] uppercase tracking-widest">
                          {scanProgress}% Analysed
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageFile(null);
                      setScanProgress(0);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-[#0F0F0F]/80 border border-[#3B322A] flex items-center justify-center text-[#B8A99A] hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-colors",
                    isDragging ? "bg-[#E86B2E]/15 border-[#E86B2E]/30" : "bg-[#2B241F] border-[#3B322A]"
                  )}>
                    <Upload className={cn("w-6 h-6", isDragging ? "text-[#F5F0E8]" : "text-[#B8A99A]")} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-[#B8A99A]">
                    Fasal ki photo khinchein ya upload karein
                  </p>
                  <p className="text-xs text-[#B8A99A]">(JPEG, PNG up to 20MB)</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="text-xs font-medium text-[#F5F0E8] underline underline-offset-2 hover:text-[#B8A99A]"
                    >
                      Browse files
                    </button>
                    <label className="text-xs px-2 py-1 rounded border border-[#E86B2E]/30 bg-[#E86B2E]/10 text-[#F5F0E8] cursor-pointer hover:bg-[#E86B2E]/20">
                      Camera Capture
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Verified badge */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1">
                <span className="w-6 h-6 rounded-full bg-[#E86B2E]/20 border border-[#E86B2E]/40 flex items-center justify-center text-[9px] font-bold text-[#F5F0E8]">
                  AI
                </span>
                <span className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-800/40 flex items-center justify-center text-[9px] font-bold text-blue-400">
                  RH
                </span>
              </div>
              <p className="text-xs text-[#B8A99A]">
                Verified by Plant Pathology Model v4.2 and Regional Experts
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {/* â”€â”€ Symptom Profile panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="space-y-4">
            <div className="card space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F5F0E8]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-white">Symptom Profile</h2>
              </div>

              {/* Visual observations textarea */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                  Visual Observations
                </p>
                <textarea
                  rows={4}
                  value={observations}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservations(e.target.value)}
                  className="input-field text-sm resize-none"
                  placeholder="Describe what you see..."
                />
              </div>

              {/* Crop Type + Stage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Crop Type
                  </p>
                  <select
                    className="input-field text-sm"
                    value={cropType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCropType(e.target.value)}
                  >
                    {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
                    Stage
                  </p>
                  <select
                    className="input-field text-sm"
                    value={cropStage}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCropStage(e.target.value)}
                  >
                    {CROP_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-900/20 border border-rose-800/40">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300">{error}</p>
                </div>
              )}

              {/* CTA button */}
              <button
                type="button"
                onClick={handleDiagnose}
                disabled={!imageFile || isLoading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                ) : (
                  <><BarChart2 className="w-4 h-4" /> Run Diagnostic Report</>
                )}
              </button>
            </div>

            {/* Diagnosis tip card */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
              <div className="w-7 h-7 rounded-full bg-blue-900/30 border border-blue-800/40 flex items-center justify-center flex-shrink-0">
                <Info className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Diagnosis Tip</p>
                <p className="text-xs text-[#B8A99A] leading-relaxed">
                  Include the underside of leaves and a shot of the whole plant for 30% higher accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Row 2: Diagnostic Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {result && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Diagnostic Results</h2>
              <p className="text-xs text-[#B8A99A]">Analysis ID: #{analysisId}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-5">

              {/* â”€â”€ Disease details card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="card space-y-5">
                <div className="flex items-start gap-5">
                  {/* Thumbnail with severity badge */}
                  <div className="flex-shrink-0 w-36 h-36 rounded-xl overflow-hidden border border-[#3B322A] bg-[#2B241F] flex items-center justify-center relative">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Crop"
                        fill
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ScanSearch className="w-8 h-8 text-[#3d4d3e]" strokeWidth={1} />
                    )}
                    <div className="absolute bottom-0 inset-x-0 px-2 pb-2 flex justify-center">
                      <span className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F0F0F]/85 backdrop-blur-sm",
                        severityColor(result.severity)
                      )}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {result.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                  </div>

                  {/* Disease name + confidence */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-1">
                      Disease Name
                    </p>
                    <h3 className="text-2xl font-bold text-white">{result.diseaseName}</h3>
                    {result.scientificName && (
                      <p className="text-sm italic text-[#B8A99A] mt-0.5">({result.scientificName})</p>
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">
                          AI Confidence
                        </p>
                        <p className="text-xs font-bold text-white">
                          {result.confidencePercent}% Match
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#3B322A] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E86B2E] transition-all duration-700"
                          style={{ width: `${result.confidencePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description paragraph */}
                <p className="text-sm text-[#B8A99A] leading-relaxed">
                  Yellow rust is a fungal disease that affects cereal crops. It is characterised by
                  stripes of yellow to orange pustules on the leaves. If left untreated, it can reduce
                  yield by up to 40% through reduced grain weight and shrivelled seeds.
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-1 border-t border-[#3B322A]">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3B322A] text-sm text-[#B8A99A] hover:border-[#F4C430] hover:text-[#F5F0E8] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Report
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3B322A] text-sm text-[#B8A99A] hover:border-[#F4C430] hover:text-[#F5F0E8] transition-colors"
                  >
                    View Similar Cases
                  </button>
                </div>
              </div>

              {/* â”€â”€ Treatment Protocol card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className="rounded-xl p-5 relative overflow-hidden flex flex-col gap-5"
                style={{
                  background: "linear-gradient(145deg, #2D5016 0%, #2D5016 100%)",
                  border: "1px solid rgba(139,92,246,0.24)",
                }}
              >
                {/* Grid texture background */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(77,194,77,1) 1px, transparent 1px), linear-gradient(90deg, rgba(77,194,77,1) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative z-10 flex-1 space-y-4">
                  <h3 className="text-base font-bold text-white">Treatment Protocol</h3>

                  {/* Treatment steps â€” key on Fragment, not on TreatmentStep props */}
                  {result.treatment.immediate.slice(0, 3).map((step: string, i: number) => {
                    const parts = step.split(" â€” ");
                    const title = parts.length > 1
                      ? parts[0]
                      : ["Apply Fungicide", "Isolate Affected Area", "Monitor Neighbouring Crops"][i];
                    const body = parts.length > 1 ? parts.slice(1).join(" â€” ") : step;
                    return (
                      <React.Fragment key={i}>
                        <TreatmentStep num={String(i + 1).padStart(2, "0")} title={title} body={body} />
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Order supplies CTA */}
                <button
                  type="button"
                  className="relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> Order Recommended Supplies
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}