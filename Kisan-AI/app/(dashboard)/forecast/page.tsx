"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/core/firebase/auth-context";
import { useLocation } from "@/hooks/useLocation";
import type { ExtendedWeatherData } from "@/services/weather";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import WeatherAnimation from "@/components/weather/WeatherAnimation";

const HINDI_DAY_NAMES = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivaar"];

function mapConditionToWeatherCode(conditionCode: string): number {
  if (conditionCode === "sunny") return 0;
  if (conditionCode === "partly-cloudy") return 2;
  if (conditionCode === "overcast") return 3;
  if (conditionCode === "drizzle") return 53;
  if (conditionCode === "rain") return 63;
  return 2;
}

function TrafficLight({ active }: { active: "red" | "yellow" | "green" }) {
  return (
    <svg width="44" height="120" viewBox="0 0 44 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="4" width="24" height="112" rx="10" fill="#1F2937" stroke="#374151" />
      {[{ id: "red", cy: 26, color: "#ef4444" }, { id: "yellow", cy: 60, color: "#f59e0b" }, { id: "green", cy: 94, color: "#22c55e" }].map((light) => (
        <circle key={light.id} cx="22" cy={light.cy} r="8" fill={light.color} opacity={active === light.id ? 1 : 0.25} style={active === light.id ? { filter: `drop-shadow(0 0 6px ${light.color})` } : undefined} />
      ))}
    </svg>
  );
}

function WaterDropGauge({ level }: { level: number }) {
  return <div className="relative w-10 h-14 border border-[#3B322A] rounded-[20px] overflow-hidden bg-[#1A1A1A]"><div className="absolute bottom-0 left-0 right-0 bg-blue-500/70 transition-all duration-700" style={{ height: `${Math.max(8, Math.min(100, level))}%` }} /></div>;
}

function Thermometer({ risk }: { risk: "low" | "medium" | "high" }) {
  const color = risk === "high" ? "#ef4444" : risk === "medium" ? "#f59e0b" : "#22c55e";
  const height = risk === "high" ? 80 : risk === "medium" ? 55 : 30;
  return <div className="w-8 h-16 border border-[#3B322A] rounded-full relative bg-[#1A1A1A]"><div className="absolute bottom-1 left-1 right-1 rounded-full" style={{ height: `${height}%`, background: color }} /></div>;
}

export default function WeatherPage() {
  const { user } = useAuth();
  const { location, loading: locationLoading, refresh: refreshLocation } = useLocation(user?.uid);
  const [weather, setWeather] = useState<ExtendedWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!location) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/forecast?lat=${location.lat}&lng=${location.lng}&label=${encodeURIComponent(location.label)}`);
        const data = await res.json();
        if (data.success) setWeather(data.data as ExtendedWeatherData);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    run();
  }, [location]);

  const onRefresh = () => { setRefreshing(true); refreshLocation(); };
  const sprayLight = useMemo<"red" | "yellow" | "green">(() => !weather ? "yellow" : weather.windSpeed > 20 || weather.humidity > 80 ? "red" : weather.windSpeed > 14 || weather.humidity > 70 ? "yellow" : "green", [weather]);
  const irrigationLevel = useMemo(() => !weather ? 50 : 100 - weather.soilMoisture, [weather]);
  const frostRisk = useMemo<"low" | "medium" | "high">(() => !weather ? "low" : weather.temperature <= 5 ? "high" : weather.temperature <= 10 ? "medium" : "low", [weather]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-white">Mausam</h1><p className="text-sm text-[#B8A99A] inline-flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {locationLoading ? "Location detect ho rahi hai..." : location?.label ?? "Location"}</p></div>
          <button onClick={onRefresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2B241F] border border-[#3B322A] text-[#F5F0E8]"><RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh</button>
        </div>

        {(loading || locationLoading || !weather) && <div className="rounded-xl bg-white/5 border border-white/10 p-10 flex items-center justify-center text-[#B8A99A] gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Live weather load ho raha hai...</div>}

        {weather && !loading && !locationLoading && (
          <>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6"><div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4 items-center"><div><p className="text-xs text-[#B8A99A] uppercase tracking-wider">Current Temperature</p><p className="text-6xl md:text-7xl font-black text-white leading-none mt-1">{weather.temperature}°C</p><p className="text-lg text-[#B8A99A] mt-2">Feels like {weather.feelsLike}°C</p><p className="text-sm text-[#F4C430] mt-2">{weather.condition}</p></div><div className="flex justify-center"><WeatherAnimation weatherCode={mapConditionToWeatherCode(weather.conditionCode)} size={120} /></div></div></div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-5"><h2 className="text-lg font-semibold text-white mb-3">Pichhle 7 Din</h2><div className="flex gap-3 overflow-x-auto pb-2">{(weather.forecast ?? []).slice(0, 7).map((day) => { const d = new Date(day.date); const hindiDay = HINDI_DAY_NAMES[d.getDay()]; const code = mapConditionToWeatherCode(day.conditionCode); return (<div key={day.date} className="min-w-[150px] rounded-lg bg-[#1A1A1A] border border-[#3B322A] p-3"><p className="text-xs text-[#B8A99A]">{hindiDay}</p><div className="my-2"><WeatherAnimation weatherCode={code} size={40} /></div><p className="text-sm text-white font-semibold">{day.high}°C / {day.low}°C</p><div className="mt-2 h-2 rounded-full bg-[#2B241F] overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${day.precipitationChance}%` }} /></div><p className="text-[10px] text-[#B8A99A] mt-1">Rain {day.precipitationChance}%</p></div>); })}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"><TrafficLight active={sprayLight} /><div><p className="text-xs text-[#B8A99A]">Spray Window</p><p className="text-sm text-white font-semibold">{sprayLight === "green" ? "Safe to spray" : sprayLight === "yellow" ? "Careful timing" : "Avoid spray"}</p></div></div><div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"><WaterDropGauge level={irrigationLevel} /><div><p className="text-xs text-[#B8A99A]">Irrigation Needed</p><p className="text-sm text-white font-semibold">{irrigationLevel > 60 ? "High" : irrigationLevel > 35 ? "Medium" : "Low"}</p></div></div><div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"><Thermometer risk={frostRisk} /><div><p className="text-xs text-[#B8A99A]">Frost Risk</p><p className="text-sm text-white font-semibold">{frostRisk === "high" ? "High" : frostRisk === "medium" ? "Medium" : "Low"}</p></div></div><div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"><div className="relative w-10 h-10"><svg viewBox="0 0 24 24" className="w-10 h-10 text-rose-500 animate-pulse" fill="currentColor"><path d="M12 2 1 21h22L12 2zm0 6.5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1zm0 9a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" /></svg></div><div><p className="text-xs text-[#B8A99A]">Hazard</p><p className="text-sm text-white font-semibold">{(weather.forecast?.[0]?.precipitationChance ?? 0) > 70 ? "High rain alert" : "No severe hazard"}</p></div></div></div>
          </>
        )}
      </div>
    </AppShell>
  );
}