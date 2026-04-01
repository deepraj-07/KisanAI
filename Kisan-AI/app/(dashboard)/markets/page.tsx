/**
 * app/markets/page.tsx
 * ============================================================
 * Market Prices Page â€” pixel-matched to design screenshot.
 *
 * Layout:
 *  - AI Advisory banner (MARKET STATUS: HOLD)
 *  - [Left: Mandi Live Feed table] | [Right: Price Trend Recharts chart]
 *  - Bottom: 3 insight cards (Regional Alert, Global Market, Logistics)
 * ============================================================
 */

"use client";
import React, { useState, useEffect } from "react";

import AppShell from "@/components/layout/AppShell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BrainCircuit,
  Download,
  SlidersHorizontal,
  Wifi,
  AlertTriangle,
  Globe,
  Warehouse,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/utils/utils";

// â”€â”€â”€ Crop icon mapping (Lucide only, no emojis) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CropIcon({ name }: { name: string }) {
  // All use TrendingUp-family icons as stylised avatars
  const colors: Record<string, string> = {
    "Wheat":       "bg-amber-900/40  text-amber-400  border-amber-800/40",
    "Rice (Paddy)":"bg-blue-900/40   text-blue-400   border-blue-800/40",
    "Cotton":      "bg-[#2B241F] text-[#F4C430] border-[#3B322A]",
    "Soybean":     "bg-[#E86B2E]/10 text-[#F5F0E8] border-[#E86B2E]/30",
    "Maize":       "bg-orange-900/40 text-orange-400 border-orange-800/40",
    "Mustard":     "bg-yellow-900/40 text-yellow-400 border-yellow-800/40",
  };
  const cls = colors[name] ?? "bg-[#2B241F] text-[#B8A99A] border-[#3B322A]";
  return (
    <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", cls)}>
      <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
    </div>
  );
}

// â”€â”€â”€ Custom Recharts Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-[#B8A99A] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-semibold" style={{ color: entry.color }}>
          â‚¹{(entry.value as number).toLocaleString("en-IN")}
          <span className="text-[10px] font-normal text-[#B8A99A] ml-1">/q</span>
        </p>
      ))}
    </div>
  );
}

// â”€â”€â”€ Insight cards (bottom row) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INSIGHT_CARDS = [
  {
    tag: "Regional Alert",
    tagColor: "text-amber-400 bg-amber-900/30 border-amber-800/40",
    icon: AlertTriangle,
    iconColor: "text-amber-400 bg-amber-900/40 border-amber-800/40",
    title: "Subsidy Deadline",
    body: "Ensure registration for the Price Support Scheme (PSS) by March 30th to lock in MSP benefits.",
    accent: "border-l-amber-500",
  },
  {
    tag: "Global Market",
    tagColor: "text-blue-400 bg-blue-900/30 border-blue-800/40",
    icon: Globe,
    iconColor: "text-blue-400 bg-blue-900/40 border-blue-800/40",
    title: "Export Update",
    body: "Increased demand from Southeast Asian markets likely to support current wheat price floors through Q2.",
    accent: "border-l-blue-500",
  },
  {
    tag: "Logistics",
    tagColor: "text-[#F5F0E8] bg-[#E86B2E]/10 border-[#E86B2E]/30",
    icon: Warehouse,
    iconColor: "text-[#F5F0E8] bg-[#E86B2E]/10 border-[#E86B2E]/20",
    title: "Storage Guidance",
    body: "Silo capacity in North Cluster is at 85%. Advised to book storage slots for peak harvest arrivals.",
    accent: "border-l-[#E86B2E]",
  },
];

// â”€â”€â”€ Mandi table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MandiTable({ activeCrop, onSelect, prices }: { activeCrop: string; onSelect: (n: string) => void; prices: import('@/models').MarketPrice[] }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3B322A]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Mandi Live Feed</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">Live Update</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-5 py-2.5 border-b border-[#3B322A]">
        {["Crop Name", "Current Price", "MSP", "24H Change"].map((h) => (
          <p key={h} className="text-[10px] font-semibold uppercase tracking-wider text-[#B8A99A]">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#3B322A]">
        {prices.map((item: import('@/models').MarketPrice) => {
          const isUp   = item.priceChange > 0;
          const isDown = item.priceChange < 0;
          const isSelected = item.cropName === activeCrop;
          const aboveMSP = item.currentPrice >= item.msp;

          return (
            <button
              key={item.cropName}
              onClick={() => onSelect(item.cropName)}
              className={cn(
                "w-full grid grid-cols-4 items-center px-5 py-3.5 text-left transition-colors",
                isSelected ? "bg-[#2B241F]" : "hover:bg-white/5"
              )}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <CropIcon name={item.cropName} />
                <div>
                  <p className="text-sm font-medium text-white">{item.cropName}</p>
                  {item.cropNameHi && (
                    <p className="text-[10px] text-[#B8A99A]">{item.cropNameHi}</p>
                  )}
                </div>
              </div>

              {/* Current price */}
              <p className={cn("text-sm font-semibold", aboveMSP ? "text-[#F5F0E8]" : "text-rose-400")}>
                â‚¹{item.currentPrice.toLocaleString("en-IN")}/q
              </p>

              {/* MSP */}
              <p className="text-sm text-[#B8A99A]">
                â‚¹{item.msp.toLocaleString("en-IN")}/q
              </p>

              {/* 24h change */}
              <div className={cn(
                "flex items-center gap-1 text-sm font-semibold",
                isUp ? "text-[#F5F0E8]" : isDown ? "text-rose-400" : "text-[#B8A99A]"
              )}>
                {isUp   ? <TrendingUp   className="w-3.5 h-3.5" /> :
                 isDown ? <TrendingDown className="w-3.5 h-3.5" /> :
                          <Minus        className="w-3.5 h-3.5" />}
                {isUp ? "+" : ""}{item.priceChangePercent.toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€â”€ Price trend chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PriceTrendChart({ cropName, historical }: { cropName: string; historical: import('@/models').MarketHistoricalPoint[] }) {
  // Format month labels from ISO date
  const chartData = historical.map((d: import('@/models').MarketHistoricalPoint) => ({
    ...d,
    month: new Date(d.date).toLocaleString("en-IN", { month: "short" }).toUpperCase(),
  }));

  const prices = chartData.map((d) => d.price);
  const marketHigh = Math.max(...prices);
  const firstPrice = prices[0];
  const lastPrice  = prices[prices.length - 1];
  const avgGrowth  = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1);


  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Price Trend</h2>
          <p className="text-xs text-[#B8A99A] mt-0.5">{cropName} (6-Month Historical)</p>
        </div>
        <span className="px-2 py-1 rounded-lg bg-[#2B241F] border border-[#3B322A] text-[10px] text-[#B8A99A] font-medium">
          Past 6 Months
        </span>
      </div>

      {/* Recharts line chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3B322A" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#B8A99A" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "#B8A99A" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `â‚¹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3B322A", strokeWidth: 1 }} />
            {/* MSP reference line */}
            <ReferenceLine
              y={2275}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: "MSP", position: "right", fontSize: 9, fill: "#f59e0b" }}
            />
            {/* Current price dot label */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#E86B2E"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#F4C430", stroke: "#0F0F0F", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#3B322A]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">Market High</p>
          <p className="text-xl font-bold text-white mt-0.5">
            â‚¹{marketHigh.toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">Average Growth</p>
          <p className="text-xl font-bold text-[#F5F0E8] mt-0.5">
            +{avgGrowth}%
          </p>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function MarketPage() {
  const [activeCrop, setActiveCrop] = useState("Wheat");
  const [prices, setPrices]         = useState<import('@/models').MarketPrice[]>([]);
  const [historical, setHistorical] = useState<import('@/models').MarketHistoricalPoint[]>([]);
  const [loadingPrices, setLoadingPrices]   = useState(true);
  const [loadingChart,  setLoadingChart]    = useState(false);

  useEffect(() => {
    fetch("/api/mandi?type=current")
      .then(r => r.json()).then(d => { if (d.success) setPrices(d.data); })
      .catch(console.error).finally(() => setLoadingPrices(false));
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    fetch(`/api/mandi?type=historical&crop=${encodeURIComponent(activeCrop)}`)
      .then(r => r.json()).then(d => { if (d.success) setHistorical(d.data); })
      .catch(console.error).finally(() => setLoadingChart(false));
  }, [activeCrop]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* â”€â”€ Page header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Mandi Bhav</h1>
            <p className="text-sm text-[#B8A99A] mt-1">
              Real-time commodity valuation, MSP comparison, and AI buy/sell insight.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary gap-2 text-xs py-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            <button className="btn-secondary gap-2 text-xs py-2">
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>

        {/* â”€â”€ AI Advisory Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div
          className="relative rounded-xl overflow-hidden border border-[#E86B2E]/20"
          style={{ background: "linear-gradient(120deg, #2B241F 0%, #1A1A1A 50%, #0F0F0F 100%)" }}
        >
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(232,107,46,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(232,107,46,0.25) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative flex items-center gap-5 px-6 py-5">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#E86B2E]/15 border border-[#E86B2E]/30 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#F5F0E8]" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]/60 mb-1">
                AI Advisory
              </p>
              <p className="text-base font-bold text-white">
                MARKET STATUS:{" "}
                <span className="text-[#F5F0E8]">HOLD</span>
              </p>
              <p className="text-xs text-[#B8A99A]/70 mt-0.5 leading-relaxed">
                Market trends indicate a potential price surge of 8â€“12% in the next 15 days due to regional supply constraints.
              </p>
            </div>

            {/* CTA */}
            <button className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#0F0F0F] text-sm font-semibold hover:bg-[#E5E7EB] transition-colors active:scale-95">
              View Full Analysis
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* â”€â”€ Main grid: Table + Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          <MandiTable activeCrop={activeCrop} onSelect={setActiveCrop} prices={prices} />
          <PriceTrendChart cropName={activeCrop} historical={historical} />
        </div>

        {/* â”€â”€ Insight cards (bottom row) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INSIGHT_CARDS.map((card: typeof INSIGHT_CARDS[0]) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={cn(
                  "rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl border-l-4 p-5 space-y-3",
                  card.accent
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", card.iconColor)}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", card.tagColor)}>
                    {card.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-[#B8A99A] leading-relaxed">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}