/**
 * components/advisor/DiagnosisCard.tsx
 * Renders the structured pest/disease diagnosis result inside a chat message.
 * Matches the design: disease name, scientific name, severity badge,
 * confidence score bar, urgent treatment steps, and full report button.
 */

"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  FlaskConical,
  ShieldAlert,
  Sprout,
} from "lucide-react";
import { cn, severityToColor } from "@/utils/utils";
import type { PestDiagnosisResult } from "@/models";

// Severity dot color

function SeverityDot({ severity }: { severity: PestDiagnosisResult["severity"] }) {
  const dot: Record<string, string> = {
    Low:      "bg-green-400",
    Moderate: "bg-amber-400",
    High:     "bg-orange-500",
    Critical: "bg-rose-500",
  };
  const text: Record<string, string> = {
    Low:      "text-green-400",
    Moderate: "text-amber-400",
    High:     "text-orange-500",
    Critical: "text-rose-500",
  };
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-semibold", text[severity])}>
      <span className={cn("w-2 h-2 rounded-full animate-pulse", dot[severity])} />
      {severity} Severity
    </span>
  );
}

// Confidence bar

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-[#E86B2E]" :
    value >= 60 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">
          Confidence Score
        </span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#3B322A] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Main component

interface DiagnosisCardProps {
  result: PestDiagnosisResult;
}

export default function DiagnosisCard({ result }: DiagnosisCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isHealthy = result.diseaseName === "Healthy Plant";
  const isUnknown = result.diseaseName === "Unable to Diagnose";

  return (
    <div className="mt-3 rounded-xl border border-[#3B322A] bg-[#1A1A1A] overflow-hidden w-full max-w-[520px]">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#3B322A]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {result.diseaseName}
            </h3>
            {result.scientificName && (
              <p className="text-xs text-[#B8A99A] italic mt-0.5">
                {result.scientificName}
              </p>
            )}
          </div>
          <SeverityDot severity={result.severity} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">

        {/* Confidence bar */}
        {!isUnknown && (
          <ConfidenceBar value={result.confidencePercent} />
        )}

        {/* Affected area */}
        {result.affectedArea && result.affectedArea !== "None" && (
          <div className="flex items-center gap-2 text-xs text-[#B8A99A]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Affected area: <span className="font-medium text-white">{result.affectedArea}</span></span>
          </div>
        )}

        {/* Immediate treatment steps (always visible) */}
        {result.treatment.immediate.length > 0 && !isHealthy && !isUnknown && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">
              Urgent Treatment Steps
            </p>
            <ol className="space-y-2">
              {result.treatment.immediate.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#332B23] border border-[#3B322A] flex items-center justify-center text-[10px] font-bold text-[#F5F0E8]">
                    {i + 1}
                  </span>
                  <span className="text-xs text-[#B8A99A] leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {!isHealthy && !isUnknown && (
          <div className="rounded-lg border border-[#3B322A] bg-[#2B241F] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2">Treatment Timeline</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-[#1A1A1A] border border-[#3B322A] p-2">
                <p className="text-[10px] text-[#B8A99A]">Day 1</p>
                <p className="text-xs text-[#F5F0E8]">Fungicide Spray</p>
              </div>
              <div className="rounded-md bg-[#1A1A1A] border border-[#3B322A] p-2">
                <p className="text-[10px] text-[#B8A99A]">Day 3</p>
                <p className="text-xs text-[#F5F0E8]">Field Review</p>
              </div>
              <div className="rounded-md bg-[#1A1A1A] border border-[#3B322A] p-2">
                <p className="text-[10px] text-[#B8A99A]">Day 7</p>
                <p className="text-xs text-[#F5F0E8]">Recovery Check</p>
              </div>
            </div>
          </div>
        )}

        {!isHealthy && !isUnknown && (
          <div className="rounded-lg border border-[#3B322A] bg-[#2B241F] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-1">Nearest Pesticide Shop</p>
            <p className="text-xs text-[#B8A99A]">Placeholder: Add geo lookup integration to show nearest verified agri-input store.</p>
          </div>
        )}

        {/* Healthy plant message */}
        {isHealthy && (
          <div className="flex items-center gap-2 py-2">
            <CheckCircle2 className="w-4 h-4 text-[#F5F0E8]" />
            <span className="text-sm text-[#F5F0E8] font-medium">
              No disease symptoms detected
            </span>
          </div>
        )}

        {/* Expandable full report */}
        {!isUnknown && !isHealthy && (
          <>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center justify-between w-full text-xs font-medium text-[#B8A99A] hover:text-[#F5F0E8] transition-colors pt-1"
            >
              <span>{expanded ? "Hide" : "Show"} full details</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expanded && (
              <div className="space-y-4 pt-1 border-t border-[#3B322A]">

                {/* Symptoms */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2 flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" /> Observed Symptoms
                  </p>
                  <ul className="space-y-1.5">
                    {result.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#B8A99A]">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#F4C430] flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preventive measures */}
                {result.treatment.preventive.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3" /> Preventive Measures
                    </p>
                    <ul className="space-y-1.5">
                      {result.treatment.preventive.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#B8A99A]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended pesticides */}
                {result.treatment.recommendedPesticides &&
                  result.treatment.recommendedPesticides.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-2 flex items-center gap-1.5">
                      <Sprout className="w-3 h-3" /> Recommended Products
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.treatment.recommendedPesticides.map((p, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#2B241F] border border-[#3B322A] text-[#B8A99A]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[10px] text-[#B8A99A] italic border-t border-[#3B322A] pt-3 leading-relaxed">
                  {result.disclaimer}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      {!isUnknown && !isHealthy && (
        <div className="px-5 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-[#F5F0E8] border border-[#E86B2E]/35 hover:bg-[#E86B2E]/10 transition-all duration-150">
              Share
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-[#F5F0E8] border border-[#2D5016]/45 hover:bg-[#2D5016]/20 transition-all duration-150">
              Save to Diary
            </button>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#B8A99A] border border-[#3B322A] hover:border-[#F4C430] hover:text-[#F5F0E8] hover:bg-white/5 transition-all duration-150">
            <FileText className="w-4 h-4" />
            View Full Biological Report
          </button>
        </div>
      )}
    </div>
  );
}