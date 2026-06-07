"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Bell, Filter, Loader2, Phone, TrendingDown, TrendingUp, Upload, X } from "lucide-react";
import {
  createCropListing,
  getActiveCropListings,
  getUserActiveListings,
  type CropListing,
} from "@/core/firebase/crop-listings";
import { useAuth } from "@/core/firebase/auth-context";
import { INDIA_STATES, getDistrictsByState } from "@/constants/india-locations";
import type { MarketHistoricalPoint, MarketPrice } from "@/models";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CROP_OPTIONS = ["Wheat", "Rice", "Maize", "Soybean", "Cotton", "Mustard", "Groundnut", "Tur (Arhar)"];
const PRICE_RANGES = [
  { label: "All", min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: "< ₹2,500", min: 0, max: 2499 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "> ₹5,000", min: 5001, max: Number.MAX_SAFE_INTEGER },
];

function getWeeklySummary(points: MarketHistoricalPoint[], crop: string): string {
  if (!points.length) return `Is hafte ${crop} ka bhav stable rahega.`;
  const start = points[0].price;
  const end = points[points.length - 1].price;
  if (end > start + 30) return `Is hafte ${crop} ka bhav badhega.`;
  if (end < start - 30) return `Is hafte ${crop} ka bhav ghatega.`;
  return `Is hafte ${crop} ka bhav stable rahega.`;
}

function getWeeklyConfidence(points: MarketHistoricalPoint[]): number {
  if (points.length < 2) return 62;
  const diffs = points.slice(1).map((p, i) => Math.abs(p.price - points[i].price));
  const avgDelta = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  if (avgDelta <= 20) return 86;
  if (avgDelta <= 45) return 74;
  if (avgDelta <= 80) return 61;
  return 48;
}

type TabKey = "bhav" | "becho" | "kharido";

type SellForm = {
  cropName: string;
  quantity: number;
  quantityUnit: "kg" | "quintal";
  thresholdPrice: number;
  state: string;
  district: string;
  villageOrTown: string;
  contactNumber: string;
  photos: string[];
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MarketPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("bhav");
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [historical, setHistorical] = useState<Record<string, MarketHistoricalPoint[]>>({});
  const [loadingBhav, setLoadingBhav] = useState(true);

  const [sellForm, setSellForm] = useState<SellForm>({
    cropName: "Wheat",
    quantity: 0,
    quantityUnit: "quintal",
    thresholdPrice: 0,
    state: "",
    district: "",
    villageOrTown: "",
    contactNumber: "",
    photos: [],
  });
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellLoading, setSellLoading] = useState(false);

  const [listings, setListings] = useState<CropListing[]>([]);
  const [userListings, setUserListings] = useState<CropListing[]>([]);
  const [filters, setFilters] = useState({
    cropName: "",
    state: "",
    district: "",
    priceRange: "All",
    sort: "newest",
  });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const districts = useMemo(() => getDistrictsByState(sellForm.state), [sellForm.state]);
  const filterDistricts = useMemo(() => getDistrictsByState(filters.state), [filters.state]);

  useEffect(() => {
    const fetchBhav = async () => {
      setLoadingBhav(true);
      try {
        const res = await fetch("/api/mandi?type=current");
        const json = await res.json();
        if (json.success) {
          setPrices(json.data as MarketPrice[]);
          const historyPairs = await Promise.all(
            (json.data as MarketPrice[]).slice(0, 6).map(async (crop) => {
              const h = await fetch(`/api/mandi?type=historical&crop=${encodeURIComponent(crop.cropName)}`);
              const hj = await h.json();
              return [crop.cropName, (hj.success ? hj.data : []) as MarketHistoricalPoint[]] as const;
            })
          );
          setHistorical(Object.fromEntries(historyPairs));
        }
      } finally {
        setLoadingBhav(false);
      }
    };

    fetchBhav();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      const rows = await getActiveCropListings();
      setListings(rows);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    getUserActiveListings(user.uid).then(setUserListings).catch(() => undefined);
  }, [user?.uid]);

  useEffect(() => {
    if (!prices.length || !userListings.length) return;

    const hitAlerts = userListings
      .map((listing) => {
        const mandi = prices.find((p) => p.cropName === listing.cropName);
        if (!mandi) return null;
        if (mandi.currentPrice >= listing.thresholdPrice) {
          return `${listing.cropName}: mandi ₹${mandi.currentPrice}/q reached your threshold ₹${listing.thresholdPrice}/q`;
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (!hitAlerts.length) return;

    setAlerts(hitAlerts);

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        hitAlerts.forEach((msg) => {
          new Notification("Kisan AI Price Alert", { body: msg });
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [prices, userListings]);

  const todayCards = prices.map((p) => {
    const direction = p.priceChange > 0 ? "up" : p.priceChange < 0 ? "down" : "same";
    return { ...p, direction };
  });

  const filteredListings = useMemo(() => {
    let rows = [...listings];

    if (filters.cropName) rows = rows.filter((r) => r.cropName === filters.cropName);
    if (filters.state) rows = rows.filter((r) => r.location.state === filters.state);
    if (filters.district) rows = rows.filter((r) => r.location.district === filters.district);

    const range = PRICE_RANGES.find((r) => r.label === filters.priceRange) ?? PRICE_RANGES[0];
    rows = rows.filter((r) => r.thresholdPrice >= range.min && r.thresholdPrice <= range.max);

    if (filters.sort === "price-low") rows.sort((a, b) => a.thresholdPrice - b.thresholdPrice);
    if (filters.sort === "price-high") rows.sort((a, b) => b.thresholdPrice - a.thresholdPrice);
    if (filters.sort === "newest") rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return rows;
  }, [listings, filters]);

  const onPhotoUpload = async (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const merged = [...sellForm.photos];

    for (const file of incoming) {
      if (merged.length >= 5) break;
      const dataUrl = await toBase64(file);
      merged.push(dataUrl);
    }

    setSellForm((prev) => ({ ...prev, photos: merged }));
  };

  const submitListing = async () => {
    if (!user?.uid) {
      setSellError("Please login first.");
      return;
    }
    if (sellForm.photos.length < 2 || sellForm.photos.length > 5) {
      setSellError("Photo upload: minimum 2 and maximum 5 photos required.");
      return;
    }
    if (!sellForm.state || !sellForm.district || !sellForm.villageOrTown) {
      setSellError("Location is required (state, district, village/town).");
      return;
    }
    if (!sellForm.contactNumber.trim()) {
      setSellError("Contact number is required.");
      return;
    }

    setSellError(null);
    setSellLoading(true);

    try {
      await createCropListing({
        cropName: sellForm.cropName,
        quantity: sellForm.quantity,
        quantityUnit: sellForm.quantityUnit,
        photos: sellForm.photos,
        thresholdPrice: sellForm.thresholdPrice,
        location: {
          state: sellForm.state,
          district: sellForm.district,
          villageOrTown: sellForm.villageOrTown,
        },
        contactNumber: sellForm.contactNumber,
        userId: user.uid,
      });

      const rows = await getActiveCropListings();
      setListings(rows);
      setSellForm({
        cropName: "Wheat",
        quantity: 0,
        quantityUnit: "quintal",
        thresholdPrice: 0,
        state: "",
        district: "",
        villageOrTown: "",
        contactNumber: "",
        photos: [],
      });
    } catch (e) {
      setSellError(e instanceof Error ? e.message : "Failed to create listing.");
    } finally {
      setSellLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Mandi Bhav</h1>
            <p className="text-sm text-[#B8A99A]">Bhav intelligence + Becho + Kharido marketplace</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAlerts((s) => !s)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2B241F] border border-[#3B322A] text-[#F5F0E8]"
            >
              <Bell className="w-4 h-4" />
              Alerts
              {alerts.length > 0 && <span className="text-xs bg-rose-600 text-white rounded-full px-2 py-0.5">{alerts.length}</span>}
            </button>
            {showAlerts && (
              <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] rounded-lg bg-[#1A1A1A] border border-[#3B322A] p-3 z-40">
                <p className="text-xs font-semibold text-[#B8A99A] mb-2">In-app notification bell alerts</p>
                {alerts.length === 0 ? (
                  <p className="text-sm text-[#B8A99A]">No price alerts yet.</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((a) => (
                      <div key={a} className="text-sm text-white rounded bg-[#2B241F] border border-[#3B322A] px-3 py-2">
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(["bhav", "becho", "kharido"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                activeTab === tab
                  ? "bg-[#E86B2E] border-[#E86B2E] text-white"
                  : "bg-[#1A1A1A] border-[#3B322A] text-[#B8A99A] hover:text-white"
              }`}
            >
              {tab === "bhav" ? "Bhav" : tab === "becho" ? "Becho" : "Kharido"}
            </button>
          ))}
        </div>

        {activeTab === "bhav" && (
          <div className="space-y-5">
            {loadingBhav ? (
              <div className="rounded-xl bg-white/5 border border-white/10 p-8 flex items-center justify-center text-[#B8A99A] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading mandi data...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {todayCards.map((crop) => (
                    <div
                      key={crop.cropName}
                      className={`rounded-xl border p-5 ${
                        crop.direction === "up"
                          ? "bg-green-950/30 border-green-700/40"
                          : crop.direction === "down"
                          ? "bg-rose-950/30 border-rose-700/40"
                          : "bg-neutral-900/40 border-neutral-700/40"
                      }`}
                    >
                      <p className="text-xs text-[#B8A99A]">{crop.cropName}</p>
                      <p className="text-3xl font-bold text-white mt-1">₹{crop.currentPrice.toLocaleString("en-IN")}/q</p>
                      <p className="text-sm mt-2 font-semibold flex items-center gap-1">
                        {crop.direction === "up" && (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-300">↑ ₹{Math.abs(crop.priceChange)} aaj badhaa</span>
                          </>
                        )}
                        {crop.direction === "down" && (
                          <>
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                            <span className="text-rose-300">↓ ₹{Math.abs(crop.priceChange)} aaj ghata</span>
                          </>
                        )}
                        {crop.direction === "same" && <span className="text-gray-300">Koi badlaav nahi</span>}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {Object.entries(historical).map(([cropName, points]) => {
                    const weekly = points.slice(-7);
                    const data = weekly.map((p) => ({
                      day: new Date(p.date).toLocaleDateString("en-IN", { weekday: "short" }),
                      price: p.price,
                    }));
                    return (
                      <div key={cropName} className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <p className="text-sm font-semibold text-white mb-3">{cropName} - Last 7 days trend</p>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#3B322A" vertical={false} />
                              <XAxis dataKey="day" tick={{ fill: "#B8A99A", fontSize: 11 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: "#B8A99A", fontSize: 11 }} axisLine={false} tickLine={false} />
                              <Tooltip formatter={(v: number) => `₹${v}/q`} />
                              <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                                {data.map((d) => (
                                  <Cell key={d.day} fill="#E86B2E" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-[#F4C430] mt-3">{getWeeklySummary(weekly, cropName)}</p>
                        <p className="text-xs text-[#B8A99A] mt-1">Anuman ki vishwasniyata: {getWeeklyConfidence(weekly)}%</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "becho" && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">Becho (Seller Listing)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#B8A99A]">Crop name</label>
                <select
                  value={sellForm.cropName}
                  onChange={(e) => setSellForm((p) => ({ ...p, cropName: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[1fr_140px] gap-2">
                <div>
                  <label className="text-xs text-[#B8A99A]">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={sellForm.quantity}
                    onChange={(e) => setSellForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                    className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#B8A99A]">Unit</label>
                  <select
                    value={sellForm.quantityUnit}
                    onChange={(e) => setSellForm((p) => ({ ...p, quantityUnit: e.target.value as "kg" | "quintal" }))}
                    className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">Minimum bhav jo main accept karunga (₹/q)</label>
                <input
                  type="number"
                  min={0}
                  value={sellForm.thresholdPrice}
                  onChange={(e) => setSellForm((p) => ({ ...p, thresholdPrice: Number(e.target.value) }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">Contact number</label>
                <input
                  value={sellForm.contactNumber}
                  onChange={(e) => setSellForm((p) => ({ ...p, contactNumber: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="10 digit mobile"
                />
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">State</label>
                <select
                  value={sellForm.state}
                  onChange={(e) => setSellForm((p) => ({ ...p, state: e.target.value, district: "" }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">State choose karein</option>
                  {INDIA_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">District</label>
                <select
                  value={sellForm.district}
                  disabled={!sellForm.state}
                  onChange={(e) => setSellForm((p) => ({ ...p, district: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  <option value="">{sellForm.state ? "District choose karein" : "Pehle state chunein"}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-[#B8A99A]">Village / Town</label>
                <input
                  value={sellForm.villageOrTown}
                  onChange={(e) => setSellForm((p) => ({ ...p, villageOrTown: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-[#B8A99A]">Photo upload (min 2, max 5)</label>
                <div className="mt-1 rounded-lg border border-dashed border-[#3B322A] p-3 bg-[#1A1A1A]">
                  <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer px-3 py-2 rounded bg-[#2B241F] hover:bg-[#342c25]">
                    <Upload className="w-4 h-4" /> Upload photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onPhotoUpload(e.target.files)}
                    />
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                    {sellForm.photos.map((photo) => (
                      <div key={photo} className="relative">
                        <Image
                          src={photo}
                          alt="listing"
                          width={160}
                          height={80}
                          unoptimized
                          className="w-full h-20 object-cover rounded border border-[#3B322A]"
                        />
                        <button
                          onClick={() => setSellForm((p) => ({ ...p, photos: p.photos.filter((x) => x !== photo) }))}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {sellError && <p className="text-sm text-rose-400">{sellError}</p>}

            <button
              onClick={submitListing}
              disabled={sellLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E86B2E] hover:bg-[#d45f25] text-white font-semibold text-sm disabled:opacity-60"
            >
              {sellLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit listing
            </button>
          </div>
        )}

        {activeTab === "kharido" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-[#B8A99A]">Crop</label>
                <select
                  value={filters.cropName}
                  onChange={(e) => setFilters((p) => ({ ...p, cropName: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">All crops</option>
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value, district: "" }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">All states</option>
                  {INDIA_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">District</label>
                <select
                  value={filters.district}
                  disabled={!filters.state}
                  onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  <option value="">All districts</option>
                  {filterDistricts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">Price range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters((p) => ({ ...p, priceRange: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  {PRICE_RANGES.map((range) => (
                    <option key={range.label} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#B8A99A]">Sort</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="w-full mt-1 bg-[#1A1A1A] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price low-high</option>
                  <option value="price-high">Price high-low</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#2B241F] border border-[#3B322A] text-[#B8A99A] text-sm">
                  <Filter className="w-4 h-4" /> {filteredListings.length} listings
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredListings.map((listing) => {
                const mandi = prices.find((p) => p.cropName === listing.cropName);
                const msp = mandi?.msp ?? 0;
                const aboveMSP = listing.thresholdPrice >= msp;

                return (
                  <div key={listing.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <Image
                      src={listing.photos[0]}
                      alt={listing.cropName}
                      width={480}
                      height={320}
                      unoptimized
                      className="w-full h-40 object-cover rounded-lg border border-[#3B322A]"
                    />
                    <div className="mt-3">
                      <p className="text-lg font-semibold text-white">{listing.cropName}</p>
                      <p className="text-sm text-[#B8A99A]">{listing.quantity} {listing.quantityUnit}</p>
                      <p className="text-sm mt-1 text-white">Asking: ₹{listing.thresholdPrice.toLocaleString("en-IN")}/q</p>
                      <p className={`text-xs mt-1 ${aboveMSP ? "text-green-300" : "text-rose-300"}`}>
                        {msp ? `MSP ₹${msp.toLocaleString("en-IN")} (${aboveMSP ? "above" : "below"} MSP)` : "MSP unavailable"}
                      </p>
                      <p className="text-xs text-[#B8A99A] mt-2">
                        {listing.location.district}, {listing.location.state}
                      </p>
                      <button className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E86B2E] hover:bg-[#d45f25] text-white text-sm font-semibold">
                        <Phone className="w-4 h-4" /> Sampark Karo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
