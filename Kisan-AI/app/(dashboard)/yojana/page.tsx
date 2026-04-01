/**
 * app/yojana/page.tsx
 * ============================================================
 * Government Support Ecosystem Page Ã¢â‚¬â€ pixel-matched to design.
 *
 * Layout:
 *  - Header + search bar + Filter / Application Status buttons
 *  - Profile Match banner (eligibility count + benefit value)
 *  - Applied count + Deadlines stat boxes
 *  - 2-column scheme cards grid with eligibility tags, deadline, CTA
 *  - Footer: Legal & Compliance Hub
 * ============================================================
 */

"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Search,
  SlidersHorizontal,
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Shield,
  CreditCard,
  Leaf,
  FileText,
  ChevronRight,
  Scale,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { MOCK_SCHEMES } from "@/services/mock-data";

type SchemeLang = "en" | "hi";

const SCHEME_I18N: Record<string, { nameHi: string; descriptionHi: string; eligibilityHi: string[] }> = {
  "pm-kisan": {
    nameHi: "\u092A\u0940\u090F\u092E-\u0915\u093F\u0938\u093E\u0928",
    descriptionHi: "\u092D\u0942\u092E\u093F\u0927\u093E\u0930\u0915 \u0915\u093F\u0938\u093E\u0928 \u092A\u0930\u093F\u0935\u093E\u0930\u094B\u0902 \u0915\u094B \u092A\u094D\u0930\u0924\u093F \u0935\u0930\u094D\u0937 \u20B96,000 \u0915\u0940 \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0906\u092F \u0938\u0939\u093E\u092F\u0924\u093E\u0964",
    eligibilityHi: ["\u091B\u094B\u091F\u0947 \u0914\u0930 \u0938\u0940\u092E\u093E\u0902\u0924 \u0915\u093F\u0938\u093E\u0928", "\u092D\u0942\u092E\u093F \u0938\u094D\u0935\u093E\u092E\u093F\u0924\u094D\u0935 \u0906\u0935\u0936\u094D\u092F\u0915", "\u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u093E \u0914\u0930 \u0906\u0927\u093E\u0930 \u0906\u0935\u0936\u094D\u092F\u0915"],
  },
  "fasal-bima": {
    nameHi: "\u092A\u094D\u0930\u0927\u093E\u0928\u092E\u0902\u0924\u094D\u0930\u0940 \u092B\u0938\u0932 \u092C\u0940\u092E\u093E \u092F\u094B\u091C\u0928\u093E",
    descriptionHi: "\u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915 \u0906\u092A\u0926\u093E \u0938\u0947 \u092B\u0938\u0932 \u0928\u0941\u0915\u0938\u093E\u0928 \u092A\u0930 \u0915\u093F\u0938\u093E\u0928\u094B\u0902 \u0915\u0940 \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0915\u0947 \u0932\u093F\u090F \u092C\u0940\u092E\u093E \u092F\u094B\u091C\u0928\u093E\u0964",
    eligibilityHi: ["\u0938\u0942\u091A\u093F\u0924 \u092B\u0938\u0932 \u0909\u0917\u093E\u0928\u0947 \u0935\u093E\u0932\u0947 \u0915\u093F\u0938\u093E\u0928", "\u090B\u0923\u0940 \u0915\u093F\u0938\u093E\u0928 \u0938\u094D\u0935\u0924\u0903 \u0915\u0935\u0930"],
  },
  "kcc": {
    nameHi: "\u0915\u093F\u0938\u093E\u0928 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u093E\u0930\u094D\u0921 (KCC)",
    descriptionHi: "\u0916\u0947\u0924\u0940, \u0915\u091F\u093E\u0908 \u092C\u093E\u0926 \u0916\u0930\u094D\u091A \u0914\u0930 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0917\u0924\u093F\u0935\u093F\u0927\u093F\u092F\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0905\u0932\u094D\u092A\u0915\u093E\u0932\u093F\u0915 \u090B\u0923 \u0938\u0941\u0935\u093F\u0927\u093E\u0964",
    eligibilityHi: ["\u0938\u092D\u0940 \u0915\u093F\u0938\u093E\u0928", "\u090F\u0938\u090F\u091A\u091C\u0940 \u0914\u0930 \u092C\u091F\u093E\u0908\u0926\u093E\u0930 \u0915\u093F\u0938\u093E\u0928"],
  },
  "soil-health-card": {
    nameHi: "\u092E\u0943\u0926\u093E \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u093E\u0930\u094D\u0921 \u092F\u094B\u091C\u0928\u093E",
    descriptionHi: "\u0939\u0930 2 \u0935\u0930\u094D\u0937 \u092E\u0947\u0902 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092E\u093F\u091F\u094D\u091F\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0914\u0930 \u092A\u094B\u0937\u0915 \u0924\u0924\u094D\u0935 \u0906\u0927\u093E\u0930\u093F\u0924 \u0938\u0941\u091D\u093E\u0935\u0964",
    eligibilityHi: ["\u0938\u092D\u0940 \u0915\u093F\u0938\u093E\u0928", "\u0928\u093F\u0915\u091F\u0924\u092E \u0915\u0943\u0937\u093F \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947\u0902\u0926\u094D\u0930 \u092A\u0930 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902"],
  },
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Scheme icon mapping Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const SCHEME_ICONS: Record<string, React.FC<LucideProps>> = {
  "pm-kisan":        Banknote,
  "fasal-bima":      Shield,
  "kcc":             CreditCard,
  "soil-health-card": Leaf,
};

const SCHEME_CATEGORIES: Record<string, { label: string; color: string }> = {
  "pm-kisan":         { label: "Income Support",    color: "text-amber-400 bg-amber-900/30 border-amber-800/40"  },
  "fasal-bima":       { label: "Crop Insurance",    color: "text-blue-400  bg-blue-900/30  border-blue-800/40"   },
  "kcc":              { label: "Low Interest Loans", color: "text-[#F5F0E8] bg-[#E86B2E]/10 border-[#E86B2E]/30"  },
  "soil-health-card": { label: "Organic Farming",   color: "text-[#E86B2E] bg-[#E86B2E]/10 border-[#E86B2E]/30"  },
};

const SCHEME_DEADLINES: Record<string, { label: string; urgent: boolean }> = {
  "pm-kisan":         { label: "Closes Mar 30",  urgent: false },
  "fasal-bima":       { label: "14 Days Left",   urgent: true  },
  "kcc":              { label: "Always Open",    urgent: false },
  "soil-health-card": { label: "Closes Apr 15",  urgent: false },
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Scheme card Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function SchemeCard({ scheme, lang }: { scheme: (typeof MOCK_SCHEMES)[0]; lang: SchemeLang }) {
  const Icon = SCHEME_ICONS[scheme.id] ?? FileText;
  const category = SCHEME_CATEGORIES[scheme.id];
  const deadline = SCHEME_DEADLINES[scheme.id];
  const isAlwaysOpen = deadline?.label === "Always Open";
  const i18n = SCHEME_I18N[scheme.id];

  const schemeName = lang === "hi" ? i18n?.nameHi || scheme.name : scheme.name;
  const schemeDescription = lang === "hi" ? i18n?.descriptionHi || scheme.description : scheme.description;
  const schemeEligibility = lang === "hi" ? i18n?.eligibilityHi || scheme.eligibility : scheme.eligibility;

  return (
    <div className="rounded-xl bg-[#1A1A1A] border border-[#3B322A] p-6 flex flex-col gap-4 hover:border-[#5A4636] transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#2B241F] border border-[#3B322A] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#F5F0E8]" strokeWidth={1.5} />
        </div>
        {category && (
          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wide", category.color)}>
            {category.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-white mb-2 leading-snug">
          {schemeName}
        </h3>
        <p className="text-sm text-[#B8A99A] leading-relaxed line-clamp-3">
          {schemeDescription}
        </p>
      </div>

      {/* Eligibility tags */}
      <div className="flex flex-wrap gap-2">
        {schemeEligibility.slice(0, 2).map((e: string) => (
          <span
            key={e}
            className="px-2.5 py-1 rounded-lg border border-[#3B322A] bg-[#2B241F] text-xs text-[#B8A99A]"
          >
            {e.length > 20 ? e.slice(0, 18) + "..." : e}
          </span>
        ))}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#3B322A]">
        {/* Deadline */}
        <div className={cn("flex items-center gap-1.5 text-xs font-medium",
          isAlwaysOpen ? "text-[#F5F0E8]" : deadline?.urgent ? "text-amber-400" : "text-[#B8A99A]"
        )}>
          {isAlwaysOpen
            ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            : deadline?.urgent
              ? <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              : <CalendarDays  className="w-3.5 h-3.5" strokeWidth={2} />
          }
          <span>{deadline?.label}</span>
        </div>

        {/* CTA */}
        <a
          href={scheme.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95",
            deadline?.urgent
              ? "bg-gradient-to-r from-[#E86B2E] to-[#F4C430] text-[#0F0F0F] hover:scale-105 hover:brightness-110"
              : "border border-[#3B322A] text-[#B8A99A] hover:border-[#F4C430] hover:text-[#F5F0E8] hover:bg-white/5"
          )}
        >
          {deadline?.urgent ? "Apply Now" : "Check Eligibility"}
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const ALL_CATEGORIES = ["All", "Income Support", "Crop Insurance", "Low Interest Loans", "Organic Farming"];

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [lang, setLang] = useState<SchemeLang>("en");

  const filtered = MOCK_SCHEMES.filter((s) => {
    const i18n = SCHEME_I18N[s.id];
    const name = lang === "hi" ? i18n?.nameHi || s.name : s.name;
    const description = lang === "hi" ? i18n?.descriptionHi || s.description : s.description;

    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "All" ||
      SCHEME_CATEGORIES[s.id]?.label === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Page header Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">{lang === "hi" ? "à¤¸à¤°à¤•à¤¾à¤°à¥€ à¤¯à¥‹à¤œà¤¨à¤¾" : "Sarkari Yojana"}</h1>
            <p className="text-sm text-[#B8A99A] mt-1 max-w-xl leading-relaxed">
              {lang === "hi"
                ? "\u0915\u0943\u0937\u093F \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u0935\u093F\u0915\u093E\u0938 \u092F\u094B\u091C\u0928\u093E\u0913\u0902 \u0915\u0940 \u0938\u0942\u091A\u0940 \u0926\u0947\u0916\u0947\u0902\u0964 \u0906\u092A\u0915\u0940 \u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0909\u092A\u092F\u0941\u0915\u094D\u0924 \u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u0926\u093F\u0916\u093E\u0908 \u091C\u093E\u0924\u0940 \u0939\u0948\u0902\u0964"
                : "Access a curated directory of agricultural financial aid and development programs. We analyse your farm profile to match you with the most relevant schemes."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-[#3B322A] p-1">
              <button
                onClick={() => setLang("en")}
                className={cn("px-2 py-1 text-xs rounded", lang === "en" ? "bg-[#E86B2E]/20 text-[#F5F0E8]" : "text-[#B8A99A]")}
              >
                English
              </button>
              <button
                onClick={() => setLang("hi")}
                className={cn("px-2 py-1 text-xs rounded", lang === "hi" ? "bg-[#E86B2E]/20 text-[#F5F0E8]" : "text-[#B8A99A]")}
              >
                \u0939\u093F\u0928\u094D\u0926\u0940
              </button>
            </div>
            <button className="btn-secondary text-xs py-2 gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="btn-primary text-xs py-2 gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Application Status
            </button>
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Search bar Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A]" />
          <input
            type="text"
            placeholder={lang === "hi" ? "\u092F\u094B\u091C\u0928\u093E, \u0932\u093E\u092D \u092F\u093E \u092A\u093E\u0924\u094D\u0930\u0924\u093E \u0916\u094B\u091C\u0947\u0902..." : "Search schemes, benefits, or eligibility..."}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Profile Match + Stats banner Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
          {/* Profile match */}
          <div
            className="rounded-xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(120deg, #2B241F 0%, #1A1A1A 100%)", border: "1px solid rgba(232,107,46,0.24)" }}
          >
            <div className="relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]/60">
                Profile Match
              </span>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                {lang === "hi" ? (
                  <>
                    \u0906\u092A <span className="text-[#F5F0E8]">12 \u092F\u094B\u091C\u0928\u093E\u0913\u0902</span> \u0915\u0947 \u0932\u093F\u090F \u092A\u093E\u0924\u094D\u0930 \u0939\u0948\u0902, \u0932\u0917\u092D\u0917{" "}
                    <span className="text-[#F5F0E8]">\u20B945,000</span> \u0932\u093E\u092D \u0924\u0915\u0964
                  </>
                ) : (
                  <>
                    You are eligible for <span className="text-[#F5F0E8]">12 schemes</span> worth approx.{" "}
                    <span className="text-[#F5F0E8]">\u20B945,000</span> in benefits.
                  </>
                )}
              </h2>
              {/* Progress */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-[#F5F0E8]">85%</span>
                <div className="flex-1">
                  <div className="h-1.5 w-full rounded-full bg-[#3B322A] overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-[#E86B2E]" />
                  </div>
                  <p className="text-[10px] text-[#B8A99A]/60 mt-1">Completion of profile data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applied stat */}
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl px-6 py-5 flex flex-col justify-between min-w-[140px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">Applied</p>
            <p className="text-4xl font-bold text-white my-2">03</p>
            <div className="flex items-center gap-1.5 text-xs text-[#F5F0E8]">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span>2 Under Review</span>
            </div>
          </div>

          {/* Deadlines stat */}
          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl px-6 py-5 flex flex-col justify-between min-w-[140px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B8A99A]">Deadlines</p>
            <p className="text-4xl font-bold text-white my-2">02</p>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Ending this week</span>
            </div>
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Category filter pills Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeCategory === cat
                  ? "bg-[#E86B2E]/20 text-[#F5F0E8] border-[#E86B2E]/40"
                  : "text-[#B8A99A] border-[#3B322A] hover:border-[#5A4636] hover:text-[#B8A99A]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Scheme cards grid Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-[#3B322A] mb-3" strokeWidth={1} />
            <p className="text-sm text-[#3d4d3e]">No schemes match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {filtered.map((scheme) => (
              <React.Fragment key={scheme.id}>
                <SchemeCard scheme={scheme} lang={lang} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Footer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <footer className="border-t border-[#3B322A] pt-5 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#2B241F] border border-[#3B322A] flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-[#B8A99A]" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-[#B8A99A]">Legal & Compliance Hub</span>
            </div>
            <div className="flex items-center gap-5">
              {["Scheme Guidelines", "Data Privacy", "Help Center"].map((link) => (
                <button key={link} className="text-xs text-[#B8A99A] hover:text-[#F5F0E8] transition-colors">
                  {link}
                </button>
              ))}
              <span className="text-xs text-[#3d4d3e]">
                \u00A9 2026 Kisan AI. Official Agritech Partner.
              </span>
            </div>
          </div>
        </footer>

      </div>
    </AppShell>
  );
}
