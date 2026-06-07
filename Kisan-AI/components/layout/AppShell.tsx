/**
 * components/layout/AppShell.tsx
 * Authenticated app shell - wraps all protected pages.
 * Includes AuthGuard, Sidebar, and top header with real user data.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Search, LogOut, X } from "lucide-react";
import { useAuth } from "@/core/firebase/auth-context";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar, { MobileMenuButton } from "./Sidebar";
import { cn } from "@/utils/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/home":      { title: "Khet Overview", subtitle: "Aapke khet ka live snapshot" },
  "/advisor":   { title: "Fasal Advisor", subtitle: "AI se fasal salah poochiye" },
  "/diagnose":  { title: "Rog Pahchan", subtitle: "Photo se rog pehchaan" },
  "/crops":     { title: "Beej Salah", subtitle: "Season ke liye crop recommendations" },
  "/markets":   { title: "Mandi Bhav", subtitle: "Live rates, MSP aur bechne ki salah" },
  "/forecast":  { title: "Mausam Jaankari", subtitle: "Farming alerts aur forecast" },
  "/yojana":    { title: "Sarkari Yojana", subtitle: "Subsidy aur scheme deadlines" },
  "/profile":   { title: "Mera Profile", subtitle: "Farm details aur language preferences" },
  "/khet-diary":{ title: "Khet Diary", subtitle: "Rozana farm activity record" },
  "/team":      { title: "Hamaari Team", subtitle: "Kisan AI banane wale log" },
  "/khet-score":{ title: "Khet Score", subtitle: "Overall farm health index" },
};

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [appNotifications, setAppNotifications] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const pathname  = usePathname();
  const { user, signOut } = useAuth();
  const router    = useRouter();

  const pageMeta =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? ""] ??
    { title: "Kisan AI", subtitle: "" };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  // Get initials from display name or email
  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Farmer";

  React.useEffect(() => {
    const appVal = localStorage.getItem("top-notif-app");
    const waVal = localStorage.getItem("top-notif-whatsapp");
    const smsVal = localStorage.getItem("top-notif-sms");
    if (appVal !== null) setAppNotifications(appVal === "true");
    if (waVal !== null) setWhatsappAlerts(waVal === "true");
    if (smsVal !== null) setSmsAlerts(smsVal === "true");
  }, []);

  const setToggle = (key: "app" | "whatsapp" | "sms", value: boolean) => {
    if (key === "app") {
      setAppNotifications(value);
      localStorage.setItem("top-notif-app", String(value));
      return;
    }
    if (key === "whatsapp") {
      setWhatsappAlerts(value);
      localStorage.setItem("top-notif-whatsapp", String(value));
      return;
    }
    setSmsAlerts(value);
    localStorage.setItem("top-notif-sms", String(value));
  };

  return (
    <AuthGuard>
      <div className="min-h-dvh bg-[#0F0F0F]">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="transition-all duration-300 ease-in-out lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 md:px-6 border-b border-[#3B322A] bg-[#0F0F0F]/90 backdrop-blur-md">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-white leading-tight truncate">
                {pageMeta.title}
              </h1>
              {pageMeta.subtitle && (
                <p className="hidden sm:block text-xs text-[#B8A99A] leading-tight">
                  {pageMeta.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 rounded-lg text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F4C430] border-2 border-[#0F0F0F]" />
              </button>

              {/* User avatar + sign out */}
              <div className="flex items-center gap-2 pl-2">
                <div className="w-7 h-7 rounded-full bg-[#E86B2E]/20 border border-[#E86B2E]/40 flex items-center justify-center">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={displayName}
                      width={28}
                      height={28}
                      unoptimized
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#F5F0E8]">{initials}</span>
                  )}
                </div>
                <span className="hidden sm:block text-xs font-medium text-[#B8A99A]">{displayName}</span>
                <button onClick={handleSignOut} title="Sign out"
                  className="p-1.5 rounded-lg text-[#B8A99A] hover:text-rose-400 hover:bg-rose-900/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100dvh-4rem)]">
            {children ?? null}
          </main>
        </div>

        {showNotificationModal && (
          <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#1A1A1A] border border-[#3B322A] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-[#B8A99A] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: "App Notifications", value: appNotifications, key: "app" as const },
                  { label: "WhatsApp Alerts", value: whatsappAlerts, key: "whatsapp" as const },
                  { label: "SMS Alerts", value: smsAlerts, key: "sms" as const },
                ].map((item) => (
                  <div key={item.key} className="rounded-lg bg-[#242424] border border-[#3B322A] px-3 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-white">{item.label}</span>
                    <button
                      onClick={() => setToggle(item.key, !item.value)}
                      className={cn(
                        "relative w-10 h-6 rounded-full transition-colors",
                        item.value ? "bg-[#E86B2E]" : "bg-[#3B322A]"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                          item.value ? "translate-x-5" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}