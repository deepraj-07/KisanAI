/**
 * app/home/page.tsx - Real Firebase + Weather API integration
 */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts";
import { MapPin, Droplets, Wind, TrendingUp, CloudRain, ClipboardList, MessageSquare, ScanSearch, Store, BrainCircuit, Loader2, RefreshCw, Activity, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/core/firebase/auth-context";
import { getUserActivityLogs, type ActivityLogEntry } from "@/core/firebase/activity-log";
import { useLocation } from "@/hooks/useLocation";
import FasalCalendar from "@/components/dashboard/FasalCalendar";
import type { MarketPrice } from "@/models";
import type { ExtendedWeatherData } from "@/services/weather";

const QUICK_ACTIONS = [
  { href: "/khet-diary",   icon: ClipboardList, label: "Log Activity",  bg: "bg-blue-900/40  border-blue-800/40",  ic: "text-blue-400"  },
  { href: "/advisor",           icon: MessageSquare, label: "Ask AI",        bg: "bg-[#E86B2E]/15 border-[#E86B2E]/30", ic: "text-[#F5F0E8]" },
  { href: "/diagnose", icon: ScanSearch,    label: "Scan Pest",     bg: "bg-rose-900/40  border-rose-800/40",  ic: "text-rose-400"  },
  { href: "/markets",         icon: Store,         label: "Check Mandi",   bg: "bg-amber-900/40 border-amber-800/40", ic: "text-amber-400" },
];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-[#3B322A] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-[#B8A99A] mb-1 font-medium">{label}</p>
      {(payload as Array<{ name?: string; value?: number; color?: string }>).map((p) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}{String(p.name).includes("Moisture") ? "%" : "mm"}
        </p>
      ))}
    </div>
  );
}

const ACT_ICONS: Record<string, LucideIcon> = {
  pest_diagnosis: ScanSearch, chat_message: MessageSquare,
  crop_recommendation: BrainCircuit, market_query: TrendingUp,
  weather_check: CloudRain, scheme_search: ClipboardList, default: Activity,
};
const ACT_COLORS: Record<string, string> = {
  pest_diagnosis: "text-rose-400 bg-rose-400/10", chat_message: "text-[#F5F0E8] bg-[#E86B2E]/10",
  crop_recommendation: "text-amber-400 bg-amber-400/10", market_query: "text-blue-400 bg-blue-400/10",
  weather_check: "text-sky-400 bg-sky-400/10",
};

function timeAgo(entry: ActivityLogEntry): string {
  const ts = entry.createdAt as { toDate?: () => Date; seconds?: number } | undefined;
  const date = ts?.toDate?.() ?? (ts?.seconds ? new Date(ts.seconds * 1000) : new Date());
  const diff = Date.now() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}

const CHART_DATA = [
  { day:"Day 1",  "Rainfall (mm)":18, "Moisture Content (%)":42 },
  { day:"Day 5",  "Rainfall (mm)":12, "Moisture Content (%)":55 },
  { day:"Day 10", "Rainfall (mm)":22, "Moisture Content (%)":48 },
  { day:"Day 15", "Rainfall (mm)":30, "Moisture Content (%)":68 },
  { day:"Day 20", "Rainfall (mm)":8,  "Moisture Content (%)":60 },
  { day:"Day 25", "Rainfall (mm)":25, "Moisture Content (%)":72 },
  { day:"Day 30", "Rainfall (mm)":15, "Moisture Content (%)":65 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [weather,    setWeather]    = useState<ExtendedWeatherData | null>(null);
  const [prices,     setPrices]     = useState<MarketPrice[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [chartView,  setChartView]  = useState<"Month"|"Week">("Month");
  const [loadingW,   setLoadingW]   = useState(true);
  const [loadingP,   setLoadingP]   = useState(true);
  const { location, loading: locationLoading } = useLocation(user?.uid);

  // Load activity logs
  useEffect(() => {
    if (!user) return;
    getUserActivityLogs(user.uid, 5).then((logs: import('@/core/firebase/activity-log').ActivityLogEntry[]) => setActivities(logs));
  }, [user]);

  // Fetch weather when location is ready
  useEffect(() => {
    if (!location) return;
    setLoadingW(true);
    fetch(`/api/forecast?lat=${location.lat}&lng=${location.lng}&label=${encodeURIComponent(location.label)}`)
      .then(r => r.json()).then(d => { if (d.success) setWeather(d.data); })
      .catch(console.error).finally(() => setLoadingW(false));
  }, [location]);

  useEffect(() => {
    setLoadingP(true);
    fetch("/api/mandi?type=current")
      .then(r => r.json()).then(d => { if (d.success) setPrices(d.data.slice(0, 4)); })
      .catch(console.error).finally(() => setLoadingP(false));
  }, []);

  const wheatPrice = prices.find((p: import('@/models').MarketPrice) => p.cropName === "Wheat");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "नमस्ते" : hour < 17 ? "नमस्ते" : "नमस्ते";
  const quotes = [
    "बीज बोने का सही समय ही फसल की ताकत तय करता है।",
    "Healthy soil today means better yield tomorrow.",
    "सही जानकारी, सही समय, सही निर्णय।",
  ];
  const quote = quotes[new Date().getDate() % quotes.length];
  const displayName = user?.displayName?.split(" ")[0] ?? "Farmer";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
        <div>
          <span className="inline-flex items-center rounded-full border border-[#E86B2E]/40 bg-[#E86B2E]/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#F4C430]">Khet Overview</span>
          <h1 className="text-xl font-bold text-white">{greeting}, {displayName}!</h1>
          <p className="text-xs text-[#B8A99A] mt-0.5">{new Date().toLocaleDateString("hi-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} • {new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}</p>
          <p className="text-sm text-[#F4C430] mt-2">{quote}</p>
        </div>

        {/* Weather + AI Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl px-6 py-5">
            {(loadingW || locationLoading) ? (
              <div className="flex items-center gap-3 h-28"><Loader2 className="w-5 h-5 text-[#F5F0E8] animate-spin" /><p className="text-sm text-[#B8A99A]">{locationLoading ? "Detecting your location..." : "Fetching live weather..."}</p></div>
            ) : weather ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5 text-[#F5F0E8]" strokeWidth={2}/><span className="text-xs font-medium text-[#B8A99A]">{location?.label ?? weather.location} • Today</span></div>
                  <p className="text-5xl md:text-6xl font-black text-white leading-none mb-1.5 tracking-tight">{weather.temperature}°C</p>
                  <p className="text-sm text-[#B8A99A] mb-5">{weather.condition}</p>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-sm"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-[#B8A99A]">{weather.humidity}% Humidity</span></div>
                    <div className="flex items-center gap-1.5 text-sm"><Wind className="w-4 h-4 text-[#B8A99A]" /><span className="text-[#B8A99A]">{weather.windSpeed} km/h NW</span></div>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-xl bg-[#2B241F] border border-[#3B322A] flex items-center justify-center">
                  <CloudRain className="w-10 h-10 text-[#F5F0E8]" strokeWidth={1}/>
                </div>
              </div>
            ) : <p className="text-sm text-[#B8A99A]">Weather unavailable</p>}
          </div>

          <div className="rounded-xl p-5 relative overflow-hidden" style={{background:"linear-gradient(135deg,#2D5016 0%,#2D5016 100%)",border:"1px solid rgba(139,92,246,0.24)"}}>
            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#E86B2E]/20 text-[#B8A99A] border border-[#E86B2E]/30 mb-3">AI Recommendation</span>
            <p className="text-sm font-semibold text-white leading-relaxed mb-4">
              {weather?.precipitation && weather.precipitation > 5
                ? `Rain expected (${weather.precipitation}mm). Delay spray operations and check drainage.`
                : "Conditions are suitable for field operations. Optimal time for fertiliser application."}
            </p>
            <Link href="/forecast" className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/20 text-white text-xs font-medium hover:bg-white/10 transition-colors">View Detailed Analysis</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-4">
            <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">Wheat MSP</span>
            <p className="text-[10px] text-[#B8A99A] uppercase tracking-wider mt-2 mb-1">Current Market Price</p>
            {loadingP ? <div className="shimmer h-7 w-24 rounded" /> : (
              <>
                <p className="text-2xl font-bold text-white">₹{wheatPrice?.currentPrice?.toLocaleString("en-IN") ?? "--"}/q</p>
                <p className={cn("text-xs mt-1 flex items-center gap-1",(wheatPrice?.priceChangePercent ?? 0)>=0?"text-[#F5F0E8]":"text-rose-400")}>
                  <TrendingUp className="w-3 h-3" />{(wheatPrice?.priceChangePercent ?? 0).toFixed(1)}% vs MSP
                </p>
              </>
            )}
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-4">
            <p className="text-[10px] text-[#B8A99A] uppercase tracking-wider mb-1">Mausam Alert</p>
            <p className="text-2xl font-bold text-white">{weather ? `${weather.precipitation}mm` : "--"}</p>
            {weather && <div className="flex gap-1 mt-2">{(weather?.forecast ?? []).slice(0,5).map((d: import('@/models').WeatherForecastDay, i: number)=>(<div key={i} className="flex-1 h-8 bg-[#3B322A] rounded-sm overflow-hidden flex items-end"><div className="w-full bg-[#E86B2E]/60 rounded-sm" style={{height:`${d.precipitationChance}%`}}/></div>))}</div>}
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-4">
            <p className="text-[10px] text-[#B8A99A] uppercase tracking-wider mb-1">Fasal Score</p>
            <p className="text-2xl font-bold text-[#F5F0E8]">84 / 100</p>
            <p className="text-xs text-[#B8A99A] mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3"/>Scanned {activities.filter((a: import('@/core/firebase/activity-log').ActivityLogEntry)=>a.type==="pest_diagnosis").length > 0 ? "recently" : "never"}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-4">
            <p className="text-[10px] text-[#B8A99A] uppercase tracking-wider mb-1">Mitti Ka Hal</p>
            <p className="text-2xl font-bold text-white">{weather ? `${weather.soilMoisture}%` : "--"}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#3B322A] overflow-hidden"><div className="h-full rounded-full bg-[#E86B2E]" style={{width: `${weather?.soilMoisture ?? 0}%`}}/></div>
          </div>
        </div>

        {/* Quick actions + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({href,icon:Icon,label,bg,ic})=>(
                <Link key={href} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5",bg)}>
                  <div className="w-10 h-10 rounded-xl bg-[#0F0F0F]/40 flex items-center justify-center"><Icon className={cn("w-5 h-5",ic)} strokeWidth={2}/></div>
                  <span className="text-xs font-medium text-[#B8A99A]">{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A] mb-4">Recent Activity</p>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Activity className="w-8 h-8 text-[#3B322A] mb-2" strokeWidth={1}/>
                <p className="text-xs text-[#3d4d3e]">No activity yet</p>
                <p className="text-[10px] text-[#3B322A] mt-1">Start using the AI tools</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((a: import('@/core/firebase/activity-log').ActivityLogEntry) => {
                  const Icon = ACT_ICONS[a.type] ?? ACT_ICONS.default;
                  const col  = ACT_COLORS[a.type] ?? "text-[#F5F0E8] bg-[#E86B2E]/10";
                  return (
                    <div key={a.id} className="flex items-start gap-2.5">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",col)}><Icon className="w-3 h-3" strokeWidth={2}/></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{a.title}</p>
                        <p className="text-[10px] text-[#B8A99A]">{timeAgo(a)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/khet-diary" className="block mt-3 text-xs font-medium text-[#F5F0E8] hover:text-[#B8A99A] text-center">View All Activity</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
            <h2 className="text-sm font-semibold text-white">Aaj Ki Salah</h2>
            <p className="text-sm text-[#B8A99A] mt-2">Aaj shaam ke baad halki baarish sambhav hai. Spraying ko kal subah ke slot me shift karein aur drainage channels saaf rakhein.</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
            <h2 className="text-sm font-semibold text-white">Sarkari Khabar</h2>
            <ul className="mt-2 space-y-2 text-sm text-[#B8A99A]">
              <li>• PM-KISAN eKYC deadline: 12 days remaining</li>
              <li>• Soil Health Card camp starts next Monday</li>
              <li>• KCC interest rebate window open in your district</li>
            </ul>
          </div>
        </div>

        <FasalCalendar />

        {/* Chart */}
        <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div><h2 className="text-sm font-semibold text-white">Moisture &amp; Rainfall Analysis</h2><p className="text-xs text-[#B8A99A] mt-0.5">Historical data for the last 30 days</p></div>
            <div className="flex rounded-lg overflow-hidden border border-[#3B322A]">
              {(["Month","Week"] as const).map(v=>(
                <button key={v} onClick={()=>setChartView(v)} className={cn("px-3 py-1.5 text-xs font-medium transition-colors",chartView===v?"bg-gradient-to-r from-[#E86B2E] to-[#2D5016] text-white":"text-[#B8A99A] hover:text-[#F5F0E8]")}>{v}</button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} margin={{top:5,right:5,left:-25,bottom:0}} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B322A" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:10,fill:"#B8A99A"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#B8A99A"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(139,92,246,0.10)"}}/>
                <Bar dataKey="Rainfall (mm)" fill="#94a3b8" radius={[3,3,0,0]}/>
                <Bar dataKey="Moisture Content (%)" fill="#E86B2E" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#94a3b8]"/><span className="text-xs text-[#B8A99A]">Rainfall (mm)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#E86B2E]"/><span className="text-xs text-[#B8A99A]">Moisture Content (%)</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
