"use client";

import { useEffect, useMemo, useState } from "react";
import { Wheat } from "lucide-react";

interface LoadingScreenProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "kisanai_first_load_completed";

export default function LoadingScreen({ children }: LoadingScreenProps) {
  const [showLoader, setShowLoader] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY) === "true";
    setHydrated(true);
    if (!seen) setShowLoader(true);
  }, []);

  useEffect(() => {
    if (!showLoader) return;

    const totalDurationMs = 3000;
    const intervalMs = 30;
    const steps = totalDurationMs / intervalMs;
    const increment = 100 / steps;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + increment);
        if (next >= 100) {
          window.clearInterval(interval);
          setIsFading(true);
          window.localStorage.setItem(STORAGE_KEY, "true");
          window.setTimeout(() => setShowLoader(false), 320);
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [showLoader]);

  const progressLabel = useMemo(() => `${Math.round(progress)}%`, [progress]);

  return (
    <>
      {children}
      {hydrated && showLoader && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F0F] transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
          aria-live="polite"
          aria-label="App loading screen"
        >
          <div className="w-[90%] max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E86B2E]/35 bg-[#E86B2E]/15">
              <Wheat className="h-8 w-8 text-[#E86B2E]" strokeWidth={2} />
            </div>

            <p className="text-lg font-semibold text-[#F5F0E8]">खेत की तरफ बढ़ रहे हैं...</p>
            <p className="mt-1 text-sm text-[#B8A99A]">Kisan AI is loading your farm data...</p>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#2B241F]">
              <div
                className="h-full rounded-full bg-[#E86B2E] transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-[#B8A99A]">{progressLabel}</p>
          </div>
        </div>
      )}
    </>
  );
}
