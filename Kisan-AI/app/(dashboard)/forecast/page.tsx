/**
 * app/forecast/page.tsx
 * Weather Intelligence - uses browser GPS for actual location.
 * Falls back to profile state -> default (Bhopal) if GPS denied.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from "recharts";
import {
  MapPin, RefreshCw, Download, Sun, Cloud, CloudRain,
  CloudDrizzle, Wind, Eye, Droplets, Sunrise, Sunset,
  ChevronLeft, ChevronRight, AlertTriangle, Droplet,
  Zap, Gauge, Sparkles, Loader2, LocateFixed,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/core/firebase/auth-context";
import { useLocation } from "@/hooks/useLocation";
import type { WeatherForecastDay } from "@/models";
import type { ExtendedWeatherData } from "@/services/weather";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ AI Alerts (dynamic based on real weather data) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function buildAlerts(w: ExtendedWeatherData) {
  const alerts = [];
  const rainTomorrow = w.forecast[1]?.precipitationChance ?? 0;
  const rainToday    = w.forecast[0]?.precipitationChance ?? 0;

  // Spray window
  const goodSpray = w.windSpeed < 15 && w.humidity < 70 && rainToday < 30;
  alerts.push({
    category:      "Spray Window",
    categoryColor: "text-[#F5F0E8]",
    accent:        "border-l-[#E86B2E]",
    message:       goodSpray
      ? "Optimal Spray Window: 08:00 AM - 11:00 AM"
      : "Avoid spraying - high wind or rain expected today",
  });

  // Irrigation tip
  alerts.push({
    category:      "Irrigation Tip",
    categoryColor: "text-amber-400",
    accent:        "border-l-amber-500",
    message:       rainTomorrow > 60
      ? `Skip Irrigation: ${w.forecast[1]?.precipitationChance}% rain expected in 24h`
      : w.soilMoisture < 35
        ? "Irrigate now - soil moisture below optimal level"
        : "Soil moisture adequate - no irrigation needed today",
  });

  // Hazard alert
  const maxRain = Math.max(...w.forecast.slice(0, 3).map(d => d.precipitationChance));
  alerts.push({
    category:      "Hazard Alert",
    categoryColor: maxRain > 70 ? "text-rose-400" : "text-[#B8A99A]",
    accent:        maxRain > 70 ? "border-l-rose-500" : "border-l-[#3B322A]",
    message:       maxRain > 70
      ? `Rain Alert: High probability (${maxRain}%) in next 3 days`
      : "No hazard alerts for the next 72 hours",
  });

  return alerts;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Weather condition icon Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function ConditionIcon({ code, className }: { code: string; className?: string }) {
  const p = { className: cn("w-5 h-5", className), strokeWidth: 1.5 as const };
  switch (code) {
    case "sunny":        return <Sun       {...p} />;
    case "rain":         return <CloudRain {...p} />;
    case "drizzle":      return <CloudDrizzle {...p} />;
    default:             return <Cloud     {...p} />;
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Chart tooltip Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const temp = (payload as Array<{ dataKey: string; value: number; color?: string }>).find(p => p.dataKey === "temp")?.value;
  const rain = (payload as Array<{ dataKey: string; value: number; color?: string }>).find(p => p.dataKey === "rain")?.value;
  return (
    <div className="bg-[#1A1A1A] border border-[#3B322A] rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-[10px] text-[#B8A99A] mb-1.5 font-medium">{label}</p>
      {temp !== undefined && <p className="text-xs font-semibold text-white">Temp: {temp}\u00B0C</p>}
      {rain !== undefined && <p className="text-xs font-semibold text-blue-400">Rain: {rain}%</p>}
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Forecast card Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

interface ForecastCardProps {
  key?: React.Key;
  day: WeatherForecastDay;
  isActive: boolean;
  onClick: () => void;
}

function ForecastCard({ day, isActive, onClick }: ForecastCardProps) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex-shrink-0 w-36 flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-all duration-200",
        isActive ? "bg-[#2B241F] border-[#E86B2E]/50 shadow-[0_0_16px_rgba(139,92,246,0.16)]"
                 : "bg-[#242424] border-[#3B322A] hover:border-[#5A4636]"
      )}>
      <p className={cn("text-xs font-semibold", isActive ? "text-white" : "text-[#B8A99A]")}>
        {day.dayName}
      </p>
      <ConditionIcon code={day.conditionCode}
        className={cn("!w-8 !h-8", isActive ? "text-[#F5F0E8]" : "text-[#B8A99A]")} />
      <div className="text-center">
        <p className={cn("text-base font-bold leading-none", isActive ? "text-white" : "text-[#B8A99A]")}>
          {day.high}\u00B0 / {day.low}\u00B0
        </p>
        <p className="text-[10px] text-[#B8A99A] mt-1 uppercase tracking-wider">
          {day.precipitationChance}% Precip
        </p>
      </div>
    </button>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export default function WeatherPage() {
  const { user }   = useAuth();
  const { location, loading: locationLoading, error: gpsError, refresh: refreshLocation } = useLocation(user?.uid);
  const [weather,      setWeather]      = useState<ExtendedWeatherData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [refreshing,   setRefreshing]   = useState(false);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Reverse geocode coordinates Ã¢â€ â€™ city name Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data.address;
      const city = addr.city || addr.town || addr.village || addr.county || "";
      const state = addr.state || "";
      return city && state ? `${city}, ${state}` : state || "Your Location";
    } catch {
      return "Your Location";
    }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Fetch weather for given coords Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const fetchWeather = useCallback(async (lat: number, lng: number, label: string) => {
    setLoading(true);
    try {
      const res  = await fetch(
        `/api/forecast?lat=${lat}&lng=${lng}&label=${encodeURIComponent(label)}`
      );
      const data = await res.json();
      if (data.success) setWeather(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch weather when location detected
  useEffect(() => {
    if (!location) return;
    fetchWeather(location.lat, location.lng, location.label);
  }, [location, fetchWeather]);

  const handleRefresh = async () => {
    setRefreshing(true);
    refreshLocation();
  };

  const alerts   = weather ? buildAlerts(weather) : [];
  const chartData = weather
    ? (weather.hourlyTemp ?? []).map((temp: number, i: number) => ({
        time: weather.hourlyTime?.[i] ?? `${i}:00`,
        temp: Math.round(temp),
        rain: weather.hourlyRain?.[i] ?? 0,
      })).filter((_: unknown, i: number) => i % 2 === 0) // every 2 hours
    : [];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Mausam Jaankari</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#B8A99A]" />
              <p className="text-sm text-[#B8A99A]">
                {locationLoading ? "Detecting your location..." : location?.label || "Loading..."}
                {weather && ` • Last updated ${new Date(weather.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
              </p>
              {gpsError && (
                <span className="text-[10px] text-amber-400 ml-1">({gpsError})</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs py-2 gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
            <button onClick={handleRefresh} disabled={refreshing}
              className="btn-primary text-xs py-2 gap-1.5 disabled:opacity-60">
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Loading state */}
        {(loading || locationLoading) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LocateFixed className="w-8 h-8 text-[#F5F0E8] animate-pulse" />
            <p className="text-sm text-[#B8A99A]">Detecting your location and fetching live weather...</p>
            <Loader2 className="w-5 h-5 text-[#F5F0E8] animate-spin" />
          </div>
        )}

        {!loading && !locationLoading && weather && (
          <>
            {/* Ã¢â€â‚¬Ã¢â€â‚¬ Live conditions + AI alerts Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

              {/* Live conditions */}
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#2B241F] border border-[#3B322A] text-[#B8A99A] mb-4">
                      Live Conditions
                    </span>
                    <div className="flex items-end gap-3 mb-1">
                      <span className="text-6xl md:text-7xl font-black tracking-tight text-white leading-none">
                        {weather.temperature}\u00B0C
                      </span>
                      <div className="pb-2">
                        <p className="text-lg font-semibold text-[#B8A99A]">{weather.condition}</p>
                        <p className="text-sm text-[#B8A99A]">Feels like {weather.feelsLike}\u00B0C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-5">
                      {[
                        { icon: Droplets, label: "Humidity",   value: `${weather.humidity}%`         },
                        { icon: Wind,     label: "Wind",       value: `${weather.windSpeed}km/h NW`   },
                        { icon: Eye,      label: "Visibility", value: `${weather.visibility}km`       },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Icon className="w-3.5 h-3.5 text-[#B8A99A]" strokeWidth={2} />
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">{label}</p>
                          </div>
                          <p className="text-base font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#3B322A]">
                      <div className="flex items-center gap-2 text-sm text-[#B8A99A]">
                        <Sunrise className="w-4 h-4 text-amber-400" strokeWidth={2} />
                        Sunrise: <span className="text-[#B8A99A] font-medium ml-1">06:12 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#B8A99A]">
                        <Sunset className="w-4 h-4 text-orange-400" strokeWidth={2} />
                        Sunset: <span className="text-[#B8A99A] font-medium ml-1">06:45 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-28 h-28 rounded-xl bg-[#2B241F] border border-[#3B322A] flex items-center justify-center">
                    <ConditionIcon code={weather.conditionCode} className="!w-14 !h-14 text-[#F5F0E8]" />
                  </div>
                </div>
              </div>

              {/* AI Agronomist Alerts Ã¢â‚¬â€ dynamic based on real data */}
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F5F0E8]" strokeWidth={2} />
                  <h2 className="text-sm font-semibold text-white">AI Agronomist Alerts</h2>
                </div>
                <div className="flex-1 space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.category}
                      className={cn("flex flex-col gap-1 pl-3 py-2.5 border-l-2 rounded-r-lg bg-[#1A1A1A]", alert.accent)}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", alert.categoryColor)}>
                        {alert.category}
                      </p>
                      <p className="text-sm font-medium text-white leading-snug">{alert.message}</p>
                    </div>
                  ))}
                </div>
                <button className="text-xs font-medium text-[#F5F0E8] hover:text-[#B8A99A] transition-colors text-center">
                  View All Recommendations
                </button>
              </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ 7-Day Forecast Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">7-Day Local Forecast</h2>
                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded-lg border border-[#3B322A] bg-[#2B241F] flex items-center justify-center text-[#B8A99A] hover:text-[#F5F0E8] hover:border-[#5A4636] transition-colors">
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-[#3B322A] bg-[#2B241F] flex items-center justify-center text-[#B8A99A] hover:text-[#F5F0E8] hover:border-[#5A4636] transition-colors">
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {(weather.forecast ?? []).map((day: WeatherForecastDay, i: number) => (
                  <ForecastCard key={day.date} day={day} isActive={i === activeDayIdx}
                    onClick={() => setActiveDayIdx(i)} />
                ))}
              </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ 24h Hourly Trend Chart (real data) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-sm font-semibold text-white">24h Environmental Trends</h2>
                  <p className="text-xs text-[#B8A99A] mt-0.5">Temperature (\u00B0C) and Precipitation Probability (%)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E86B2E]" />
                    <span className="text-xs text-[#B8A99A]">Temperature</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8A99A]" />
                    <span className="text-xs text-[#B8A99A]">Rain Probability</span>
                  </div>
                </div>
              </div>
              <div className="h-52 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#E86B2E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#E86B2E" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#B8A99A" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#B8A99A" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3B322A" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#B8A99A" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "#B8A99A" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3B322A", strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="temp" stroke="#E86B2E" strokeWidth={2} fill="url(#tempGrad)" dot={false}
                      activeDot={{ r: 4, fill: "#F4C430", stroke: "#0F0F0F", strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="rain" stroke="#B8A99A" strokeWidth={1.5} strokeDasharray="5 3"
                      fill="url(#rainGrad)" dot={false} activeDot={{ r: 3, fill: "#B8A99A", stroke: "#0F0F0F", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ Bottom metric cards (real soil data) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Droplet, label: "Soil Moisture",
                  value: `${weather.soilMoisture}%`,
                  sub: weather.soilMoisture > 60 ? "Healthy" : weather.soilMoisture > 30 ? "Moderate" : "Dry",
                  subColor: weather.soilMoisture > 60 ? "text-[#F5F0E8]" : weather.soilMoisture > 30 ? "text-amber-400" : "text-rose-400",
                  iconColor: "text-blue-400 bg-blue-900/30 border-blue-800/40",
                },
                {
                  icon: Zap, label: "Solar Intensity",
                  value: `${weather.solarRadiation}`,
                  sub: "kWh/m\u00B2",
                  subColor: "text-[#B8A99A]",
                  iconColor: "text-amber-400 bg-amber-900/30 border-amber-800/40",
                },
                {
                  icon: Gauge, label: "Evapotranspiration",
                  value: `${weather.evapotranspiration}`,
                  sub: "mm/day",
                  subColor: "text-[#B8A99A]",
                  iconColor: "text-[#F5F0E8] bg-[#E86B2E]/10 border-[#E86B2E]/20",
                },
              ].map(({ icon: Icon, label, value, sub, subColor, iconColor }) => (
                <div key={label} className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0", iconColor)}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">{label}</p>
                    <p className="text-xl font-bold text-white leading-tight">
                      {value}
                      <span className={cn("text-sm font-medium ml-1.5", subColor)}>{sub}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !locationLoading && !weather && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <CloudRain className="w-10 h-10 text-[#3B322A]" strokeWidth={1} />
            <p className="text-sm text-[#3d4d3e]">Weather data unavailable</p>
            <button onClick={handleRefresh} className="btn-primary text-xs py-2 mt-2">
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

      </div>
    </AppShell>
  );
}

