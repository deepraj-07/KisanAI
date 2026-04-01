/**
 * app/profile/page.tsx
 * Farm Profile - fully integrated with Firebase + real GPS location.
 * Auto-fills from Firebase Auth + GPS so user manually fills as little as possible.
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import IntelligenceScore from "@/components/profile/IntelligenceScore";
import {
  FileText, Download, ShieldCheck, X, Plus, Map,
  Save, Loader2, CheckCircle2, LocateFixed, User,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/core/firebase/auth-context";
import { getUserProfile, updateUserProfile } from "@/core/firebase/user-profile";
import { useLocation } from "@/hooks/useLocation";
import type { FirestoreUser } from "@/core/data/firestore-schema";

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const SOIL_TYPES = [
  "Alluvial Soil","Black Cotton Soil","Red & Laterite Soil",
  "Loamy Silt","Loamy Soil","Sandy Soil","Clay Soil","Peaty Soil",
];

const ALL_CROPS = [
  "Winter Wheat","Soybeans","Maize","Rice","Cotton",
  "Mustard","Sugarcane","Tomato","Potato","Groundnut",
  "Sunflower","Tur (Arhar)","Moong","Chilli","Onion",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "pa", label: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40" },
  { code: "mr", label: "\u092E\u0930\u093E\u0920\u0940" },
  { code: "te", label: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "ta", label: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Intelligence score calculator Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Based on how complete the profile is + activity

function calculateScore(profile: Partial<FirestoreUser>): number {
  let score = 0;
  if (profile.farmName)                      score += 15;
  if (profile.landHolding && profile.landHolding > 0) score += 15;
  if (profile.location?.state)               score += 15;
  if (profile.location?.district)            score += 10;
  if (profile.location?.pincode)             score += 5;
  if (profile.primaryCrops?.length)          score += 20;
  if (profile.preferredLanguage && profile.preferredLanguage !== "en") score += 5;
  if (profile.isOnboarded)                   score += 15;
  return Math.min(score, 100);
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Crop tag Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function CropTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E86B2E]/15 border border-[#E86B2E]/30 text-[#F5F0E8] text-xs font-semibold uppercase tracking-wide">
      {name}
      <button onClick={onRemove} className="hover:text-rose-400 transition-colors ml-0.5">
        <X className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </span>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export default function ProfilePage() {
  const { user }  = useAuth();
  const { location, loading: locationLoading } = useLocation(user?.uid);

  // Form state
  const [farmName,   setFarmName]   = useState("");
  const [landSize,   setLandSize]   = useState("");
  const [soilType,   setSoilType]   = useState("");
  const [crops,      setCrops]      = useState<string[]>([]);
  const [state,      setState_]     = useState("");
  const [district,   setDistrict]   = useState("");
  const [pincode,    setPincode]    = useState("");
  const [language,   setLanguage]   = useState("en");
  const [lat,        setLat]        = useState("");
  const [lng,        setLng]        = useState("");
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // UI state
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [score,      setScore]      = useState(0);
  const [profile,    setProfile]    = useState<FirestoreUser | null>(null);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Load profile from Firebase Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setFarmName(p.farmName || "");
        setLandSize(p.landHolding ? String(p.landHolding) : "");
        setSoilType("");
        setCrops(p.primaryCrops || []);
        setState_(p.location?.state || "");
        setDistrict(p.location?.district || "");
        setPincode(p.location?.pincode || "");
        setLanguage(p.preferredLanguage || "en");
        setPhotoPreview(p.photoURL || null);
        if (p.location?.coordinates) {
          setLat(String(p.location.coordinates.lat));
          setLng(String(p.location.coordinates.lng));
        }
        setScore(calculateScore(p));
      } else {
        // New user - pre-fill from Auth
        setFarmName(user.displayName ? `${user.displayName}'s Farm` : "");
        setPhotoPreview(user.photoURL || null);
      }
      setLoading(false);
    });
  }, [user]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Auto-fill GPS coordinates when location detected Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (!location) return;
    // Only auto-fill if user hasn't set them manually
    if (!lat && !lng) {
      setLat(String(location.lat.toFixed(4)));
      setLng(String(location.lng.toFixed(4)));
    }
    // Auto-fill state if empty
    if (!state && location.state) {
      setState_(location.state);
    }
    // Auto-fill district from label (e.g. "Ludhiana, Punjab" Ã¢â€ â€™ "Ludhiana")
    if (!district && location.label.includes(",")) {
      setDistrict(location.label.split(",")[0].trim());
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeCrop = (c: string) => setCrops((p: string[]) => p.filter((x: string) => x !== c));
  const addCrop    = (c: string) => {
    if (!crops.includes(c)) setCrops((p: string[]) => [...p, c]);
    setShowCropPicker(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Save to Firebase Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated: Partial<Omit<FirestoreUser, "uid" | "createdAt">> = {
        farmName,
        landHolding:       parseFloat(landSize) || 0,
        primaryCrops:      crops,
        preferredLanguage: language as FirestoreUser["preferredLanguage"],
        photoURL: photoPreview,
        isOnboarded:       true,
        location: {
          state:    state,
          district: district,
          pincode:  pincode,
          ...(lat && lng ? {
            coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
          } : {}),
        },
      };
      await updateUserProfile(user.uid, updated);

      // Recalculate score
      const updatedProfile = { ...profile, ...updated } as FirestoreUser;
      setScore(calculateScore(updatedProfile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Get location button Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLat(latitude.toFixed(4));
      setLng(longitude.toFixed(4));
      // Reverse geocode
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "en-US" } }
        );
        const data = await res.json();
        const addr = data.address ?? {};
        if (addr.state)   setState_(addr.state);
        if (addr.city || addr.town) setDistrict(addr.city || addr.town);
        if (addr.postcode) setPincode(addr.postcode);
      } catch { /* ignore */ }
    }, console.error, { enableHighAccuracy: true });
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Farmer";
  const subtitle    = [district, state].filter(Boolean).join(", ") || "Update your location below";
  const effectivePhoto = photoPreview || profile?.photoURL || user?.photoURL || null;
  const latNum = Number.parseFloat(lat);
  const lngNum = Number.parseFloat(lng);
  const hasCoordinates = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const mapEmbedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lngNum - 0.02}%2C${latNum - 0.02}%2C${lngNum + 0.02}%2C${latNum + 0.02}&layer=mapnik&marker=${latNum}%2C${lngNum}`
    : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E86B2E]/20 border border-[#E86B2E]/40 flex items-center justify-center overflow-hidden">
              {effectivePhoto
                ? (
                  <Image
                    src={effectivePhoto}
                    alt={displayName}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                )
                : <User className="w-5 h-5 text-[#F5F0E8]" strokeWidth={1.5} />
              }
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {farmName || `${displayName}'s Farm`}
              </h1>
              <p className="text-xs text-[#B8A99A]">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#3B322A] text-xs text-[#B8A99A] hover:text-white hover:border-[#5A4636] transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            <button onClick={handleSave} disabled={saving}
            className={cn("btn-primary gap-2 disabled:opacity-60", saved && "bg-[#6D4BEA]")}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" />
             : saved  ? <CheckCircle2 className="w-4 h-4" />
             : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Update Profile"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#F5F0E8] animate-spin" />
            <p className="text-sm text-[#B8A99A]">Loading your profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ LEFT: General Information Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#3B322A]">
                <FileText className="w-4 h-4 text-[#F5F0E8]" strokeWidth={2} />
                <h2 className="text-base font-bold text-white">General Information</h2>
              </div>

              {/* Auto-filled from Auth notice */}
              {user?.displayName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E86B2E]/5 border border-[#E86B2E]/20 text-xs text-[#F5F0E8]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Signed in as <span className="font-semibold">{user.email}</span> via Google
                </div>
              )}

              {/* Farm Name */}
              <div>
                <label className="block text-xs font-medium text-[#B8A99A] mb-1.5">Farm Name</label>
                <input type="text" value={farmName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmName(e.target.value)}
                  placeholder={`${displayName}'s Farm`}
                  className="input-field text-sm" />
              </div>

              {/* Size + Soil Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#B8A99A] mb-1.5">Size (Acres)</label>
                  <div className="relative">
                    <input type="number" value={landSize} min="0" step="0.5"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLandSize(e.target.value)}
                      placeholder="e.g. 5.0" className="input-field text-sm pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#B8A99A] font-medium">AC</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#B8A99A] mb-1.5">Soil Type</label>
                  <select value={soilType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSoilType(e.target.value)}
                    className="input-field text-sm">
                    <option value="">Select...</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Primary Crops */}
              <div>
                <label className="block text-xs font-medium text-[#B8A99A] mb-2">Primary Crops</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {crops.map((c: string) => (
                    <React.Fragment key={c}>
                      <CropTag name={c} onRemove={() => removeCrop(c)} />
                    </React.Fragment>
                  ))}
                  <div className="relative">
                    <button onClick={() => setShowCropPicker((p: boolean) => !p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#5A4636] text-xs font-semibold text-[#B8A99A] hover:border-[#F4C430] hover:text-[#F5F0E8] transition-colors">
                      <Plus className="w-3 h-3" strokeWidth={2.5} /> Add Crop
                    </button>
                    {showCropPicker && (
                      <div className="absolute z-20 top-full left-0 mt-1 w-44 rounded-xl bg-[#1A1A1A] border border-[#3B322A] shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {ALL_CROPS.filter(c => !crops.includes(c)).map(c => (
                          <button key={c} onClick={() => addCrop(c)}
                            className="w-full text-left text-xs text-[#B8A99A] px-3 py-2.5 hover:bg-[#2B241F] hover:text-white transition-colors">
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-medium text-[#B8A99A] mb-1.5">Preferred Language</label>
                <select value={language}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                  className="input-field text-sm">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              {/* Location section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#B8A99A]">Location</label>
                  <button onClick={detectLocation}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#F5F0E8] hover:text-[#B8A99A] transition-colors">
                    <LocateFixed className="w-3.5 h-3.5" />
                    {locationLoading ? "Detecting..." : "Use GPS"}
                  </button>
                </div>

                {/* State + District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#B8A99A] mb-1">State</label>
                    <select value={state}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState_(e.target.value)}
                      className="input-field text-sm">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#B8A99A] mb-1">District</label>
                    <input type="text" value={district}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                      placeholder="e.g. Ludhiana"
                      className="input-field text-sm" />
                  </div>
                </div>

                {/* Pincode + Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#B8A99A] mb-1">Pincode</label>
                    <input type="text" value={pincode} maxLength={6}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPincode(e.target.value)}
                      placeholder="e.g. 141001"
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#B8A99A] mb-1">GPS Coordinates</label>
                    <div className="input-field text-xs text-[#B8A99A] flex items-center gap-1 cursor-default">
                      <Map className="w-3 h-3 flex-shrink-0" />
                      {lat && lng
                        ? `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`
                        : <span className="text-[#3d4d3e]">Click &quot;Use GPS&quot;</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Satellite map */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#3B322A]">
                {mapEmbedUrl ? (
                  <>
                    <iframe
                      title="Farm Location Map"
                      src={mapEmbedUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F0F0F]/80 border border-[#E86B2E]/40 backdrop-blur-sm">
                      <Map className="w-3 h-3 text-[#F4C430]" />
                      <span className="text-[10px] font-semibold text-[#F5F0E8] uppercase tracking-wider">
                        Pin: {latNum.toFixed(4)}, {lngNum.toFixed(4)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] text-[#B8A99A] text-xs">
                    Add GPS coordinates to view map pin
                  </div>
                )}
              </div>
            </div>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ RIGHT: Score + Documents Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <div className="space-y-5">

              {/* Farm Intelligence Score Ã¢â‚¬â€ calculated from profile completeness */}
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 flex flex-col items-center">
                <h2 className="text-sm font-semibold text-white mb-1 self-start">
                  Farm Intelligence Score
                </h2>
                <p className="text-xs text-[#B8A99A] self-start mb-5">
                  Based on profile completeness
                </p>
                <IntelligenceScore score={score} />

                {/* Completion hints */}
                {score < 100 && (
                  <div className="w-full mt-4 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B8A99A] mb-2">
                      Improve your score
                    </p>
                    {!farmName   && <p className="text-xs text-[#B8A99A]">• Add farm name (+15)</p>}
                    {!landSize   && <p className="text-xs text-[#B8A99A]">• Add land size (+15)</p>}
                    {!state      && <p className="text-xs text-[#B8A99A]">• Add your state (+15)</p>}
                    {!district   && <p className="text-xs text-[#B8A99A]">• Add district (+10)</p>}
                    {crops.length === 0 && <p className="text-xs text-[#B8A99A]">• Add crops (+20)</p>}
                  </div>
                )}
              </div>

              {/* Account Info Ã¢â‚¬â€ from Firebase Auth (auto-filled) */}
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-white">Account</h2>
                <div className="space-y-2">
                  {[
                    { label: "Email",        value: user?.email ?? "--"                        },
                    { label: "Name",         value: user?.displayName ?? "Not set"            },
                    { label: "Member since", value: user?.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN")
                        : "--"
                    },
                    { label: "Last sign in", value: user?.metadata.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-IN")
                        : "--"
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#3B322A] last:border-0">
                      <span className="text-xs text-[#B8A99A]">{label}</span>
                      <span className="text-xs font-medium text-white truncate max-w-[160px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Verified */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#2B241F] border border-[#3B322A]">
                <ShieldCheck className="w-5 h-5 text-[#F5F0E8] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Data Secured</p>
                  <p className="text-[11px] text-[#B8A99A] leading-relaxed">
                    Your farm data is encrypted and stored securely in Firebase. Only you can access it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

