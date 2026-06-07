/**
 * components/layout/Sidebar.tsx
 * Responsive sidebar navigation for Kisan AI.
 *
 * - Desktop: fixed left sidebar (256px wide)
 * - Mobile: slides in as a drawer overlay
 * - Icons: Lucide React only (NO emojis)
 * - Active state: highlighted with green accent
 */

"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareHeart,
  ScanEye,
  Sprout,
  TrendingUp,
  CloudSun,
  FileText,
  UserCircle,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Sparkles,
  CalendarDays,
  Thermometer,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/core/firebase/auth-context";

function WheatLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 6C10.7 6 9.6 5.1 9.2 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9C10.2 9 8.7 7.9 8.2 6.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 12C10.4 12 9 11 8.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15C10.6 15 9.4 14.1 8.9 12.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 6C13.3 6 14.4 5.1 14.8 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9C13.8 9 15.3 7.9 15.8 6.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 12C13.6 12 15 11 15.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15C13.4 15 14.6 14.1 15.1 12.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Nav Config

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<LucideProps>;
  badge?: string;
  description: string; // Shown as tooltip when collapsed
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Khet Overview",
    href: "/home",
    icon: LayoutDashboard,
    description: "Farm overview and stats",
  },
  {
    label: "Fasal Advisor",
    href: "/advisor",
    icon: MessageSquareHeart,
    badge: "AI",
    description: "Bilingual crop guidance",
  },
  {
    label: "Rog Pahchan",
    href: "/diagnose",
    icon: ScanEye,
    badge: "Vision",
    description: "Photo based diagnosis",
  },
  {
    label: "Beej Salah",
    href: "/crops",
    icon: Sprout,
    description: "Crop selection insights",
  },
  {
    label: "Mandi Bhav",
    href: "/markets",
    icon: TrendingUp,
    description: "Live prices and MSP",
  },
  {
    label: "Mausam",
    href: "/forecast",
    icon: CloudSun,
    description: "Forecast and farm alerts",
  },
  {
    label: "Sarkari Yojana",
    href: "/yojana",
    icon: FileText,
    description: "Schemes and subsidies",
  },
  {
    label: "Khet Diary",
    href: "/khet-diary",
    icon: BookOpen,
    description: "Activity timeline",
  },
  {
    label: "Mera Profile",
    href: "/profile",
    icon: UserCircle,
    description: "Your farm settings",
  },
  {
    label: "Hamaari Team",
    href: "/team",
    icon: Users,
    description: "Meet the Kisan AI team",
  },
  {
    label: "Khet Score",
    href: "/khet-score",
    icon: Sparkles,
    description: "Farm health score",
  },
];

// Types

interface SidebarProps {
  /** Mobile drawer is controlled externally via AppShell */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Sidebar Component

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [appNotifications, setAppNotifications] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const todayHindi = new Date().toLocaleDateString("hi-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Avoid hydration mismatch for localStorage-persisted collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    const appNotif = localStorage.getItem("notif-app");
    const whatsapp = localStorage.getItem("notif-whatsapp");
    const sms = localStorage.getItem("notif-sms");
    if (appNotif !== null) setAppNotifications(appNotif === "true");
    if (whatsapp !== null) setWhatsappAlerts(whatsapp === "true");
    if (sms !== null) setSmsAlerts(sms === "true");

    setMounted(true);
  }, []);

  const updateToggle = (key: "app" | "whatsapp" | "sms", value: boolean) => {
    if (key === "app") {
      setAppNotifications(value);
      localStorage.setItem("notif-app", String(value));
      return;
    }
    if (key === "whatsapp") {
      setWhatsappAlerts(value);
      localStorage.setItem("notif-whatsapp", String(value));
      return;
    }
    setSmsAlerts(value);
    localStorage.setItem("notif-sms", String(value));
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (!mounted) return null; // Prevent SSR flash

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          // Base styles
          "fixed top-0 left-0 h-full z-50 flex flex-col",
          "bg-[#1A1A1A] border-r border-[#3B322A]",
          "transition-all duration-300 ease-in-out",
          // Width toggle
          collapsed ? "w-[72px]" : "w-64",
          // Mobile: translate off-screen by default, show when mobileOpen
          "translate-x-[-100%] lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-[#3B322A] flex-shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/home"
            className="flex items-center gap-2.5 min-w-0"
            onClick={onMobileClose}
          >
            {/* Logo mark */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E86B2E]/20 border border-[#E86B2E]/40 flex items-center justify-center">
              <WheatLogoIcon className="w-4.5 h-4.5 text-[#F5F0E8]" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block font-semibold text-sm text-white leading-tight truncate">
                  Kisan AI
                </span>
                <span className="block text-[10px] text-[#B8A99A] leading-tight truncate">
                  Smart Farming Advisor
                </span>
              </div>
            )}
          </Link>

          {/* Close button (mobile) */}
          {!collapsed && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="px-3 py-2 border-b border-[#3B322A] space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-[#B8A99A]">
              <CalendarDays className="w-3.5 h-3.5 text-[#F4C430]" />
              <span>{todayHindi}</span>
            </div>
            <div className="rounded-lg bg-[#242424] border border-[#3B322A] px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#B8A99A]">Mausam</p>
                <p className="text-xs text-white font-medium">28&#176;C - Halka Badal</p>
              </div>
              <Thermometer className="w-4 h-4 text-[#E86B2E]" />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // Base styles
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-300 group relative",
                  // Default state
                  "text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5",
                  // Active state
                  isActive && [
                    "text-[#F5F0E8] bg-[#E86B2E]/12",
                    "border border-[#E86B2E]/30",
                  ],
                  // Collapsed: center icon
                  collapsed && "justify-center px-2"
                )}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "flex-shrink-0 w-[18px] h-[18px] transition-colors",
                    isActive ? "text-[#F5F0E8]" : "text-[#F4C430] group-hover:text-[#F5F0E8]"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label + Badge */}
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide",
                          isActive
                            ? "bg-[#E86B2E]/20 text-[#F5F0E8]"
                            : "bg-[#2B241F] text-[#B8A99A]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed tooltip */}
                {collapsed && (
                  <div
                    className={cn(
                      "absolute left-full ml-2 z-50",
                      "px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap",
                      "bg-[#2B241F] border border-[#3B322A] text-white",
                      "shadow-xl pointer-events-none",
                      "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0",
                      "transition-all duration-150"
                    )}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="flex-shrink-0 border-t border-[#3B322A] p-2 space-y-1">
          {!collapsed && (
            <div className="rounded-xl bg-[#242424] border border-[#3B322A] p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[#B8A99A]">Farm Health Score</span>
                <span className="text-xs font-bold text-[#F4C430]">82/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[#0F0F0F] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E86B2E] to-[#F4C430] rounded-full" style={{ width: "82%" }} />
              </div>
              <p className="mt-2 text-[10px] text-[#B8A99A]">Healthy growth trend this week.</p>
            </div>
          )}

          {/* Notifications shortcut */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Notifications" : undefined}
          >
            <Bell className="flex-shrink-0 w-[18px] h-[18px]" strokeWidth={2} />
            {!collapsed && <span>Notifications</span>}
          </button>

          {/* Sign out */}
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#B8A99A] hover:text-rose-400 hover:bg-rose-900/10 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Sign Out" : undefined}
            onClick={handleSignOut}
          >
            <LogOut className="flex-shrink-0 w-[18px] h-[18px]" strokeWidth={2} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#B8A99A] hover:text-[#F5F0E8] hover:bg-white/5 transition-colors",
              collapsed && "justify-center px-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>

          {!collapsed && (
            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[#E86B2E]/30 bg-[#E86B2E]/10 text-[10px] text-[#F5F0E8]">
                <Sparkles className="w-3 h-3" /> Powered by Gemini AI
              </span>
            </div>
          )}
        </div>
      </aside>

      {showNotificationModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#1A1A1A] border border-[#3B322A] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 rounded text-[#B8A99A] hover:text-white"
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
                <div key={item.key} className="flex items-center justify-between rounded-lg bg-[#242424] border border-[#3B322A] px-3 py-2.5">
                  <span className="text-sm text-white">{item.label}</span>
                  <button
                    onClick={() => updateToggle(item.key, !item.value)}
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
    </>
  );
}

// Mobile Menu Trigger

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-[#B8A99A] hover:text-white hover:bg-white/5 transition-colors"
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}