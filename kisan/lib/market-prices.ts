/**
 * lib/market-prices.ts
 * Hardcoded mandi price fallback (no external market API calls).
 */

import type { MarketPrice, MarketHistoricalPoint } from "@/types";

// ─── MSP 2024-25 (Government of India — fixed, not mocked) ────────────────────
const MSP_2024_25: Record<string, number> = {
  "Wheat": 2275,
  "Rice": 2300,
  "Maize": 2090,
  "Soybean": 4600,
  "Cotton": 7020,
  "Mustard": 5650,
  "Groundnut": 6377,
  "Tur (Arhar)": 7000,
};

export async function fetchMandiPrices(_state?: string): Promise<MarketPrice[]> {
  const now = new Date().toISOString();
  return [
    { cropName: "Wheat", msp: 2275, currentPrice: 2275, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Rice", msp: 2300, currentPrice: 2300, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Maize", msp: 2090, currentPrice: 2090, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Soybean", msp: 4600, currentPrice: 4600, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Cotton", msp: 7020, currentPrice: 7020, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Mustard", msp: 5650, currentPrice: 5650, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Groundnut", msp: 6377, currentPrice: 6377, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
    { cropName: "Tur (Arhar)", msp: 7000, currentPrice: 7000, priceChange: 0, priceChangePercent: 0, unit: "quintal", market: "Fallback Mandi", lastUpdated: now },
  ];
}

export async function fetchHistoricalPrices(
  cropName: string
): Promise<MarketHistoricalPoint[]> {
  return generateFallbackHistorical(cropName);
}

function generateFallbackHistorical(cropName: string): MarketHistoricalPoint[] {
  const msp    = MSP_2024_25[cropName] ?? 2000;
  const points: MarketHistoricalPoint[] = [];
  const base   = msp * 0.95;

  for (let i = 17; i >= 0; i--) {
    const d     = new Date();
    d.setDate(d.getDate() - i * 10);
    const noise = (Math.random() - 0.4) * msp * 0.06;
    points.push({
      date:  d.toISOString().split("T")[0],
      price: Math.round(base + noise + (17 - i) * (msp * 0.003)),
      msp,
    });
  }
  return points;
}