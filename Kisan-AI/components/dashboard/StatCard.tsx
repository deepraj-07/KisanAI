/**
 * components/home/StatCard.tsx
 * Metric summary card for the Dashboard page.
 */

import {
  Wheat,
  CloudRain,
  Sprout,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/utils/utils";
import type { StatCard as StatCardType } from "@/models";

// â”€â”€â”€ Icon Registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Maps string names (stored in data) to Lucide components

type IconComponent = React.FC<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  Wheat,
  CloudRain,
  Sprout,
  BrainCircuit,
};

// â”€â”€â”€ Color Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COLOR_CONFIG = {
  green: {
    bg:     "bg-[#2D5016]/60",
    border: "border-[#6D4BEA]/40",
    icon:   "text-[#F5F0E8]",
    iconBg: "bg-[#E86B2E]/15",
  },
  amber: {
    bg:     "bg-amber-950/40",
    border: "border-amber-800/30",
    icon:   "text-amber-400",
    iconBg: "bg-amber-400/10",
  },
  blue: {
    bg:     "bg-blue-950/40",
    border: "border-blue-800/30",
    icon:   "text-blue-400",
    iconBg: "bg-blue-400/10",
  },
  rose: {
    bg:     "bg-rose-950/40",
    border: "border-rose-800/30",
    icon:   "text-rose-400",
    iconBg: "bg-rose-400/10",
  },
} as const;

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface StatCardProps {
  card: StatCardType;
  className?: string;
}

export default function StatCard({ card, className }: StatCardProps) {
  const { title, value, subValue, trend, trendValue, icon, color } = card;
  const colors = COLOR_CONFIG[color];
  const Icon = ICON_MAP[icon] ?? Sprout;

  return (
    <div
      className={cn(
        "relative rounded-xl p-5 border transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        "bg-[#242424]",
        colors.border,
        className
      )}
    >
      {/* Subtle top glow line */}
      <div
        className={cn(
          "absolute top-0 left-4 right-4 h-px opacity-50",
          color === "green" ? "bg-[#E86B2E]" :
          color === "amber" ? "bg-amber-500" :
          color === "blue"  ? "bg-blue-500" :
                              "bg-rose-500"
        )}
      />

      <div className="flex items-start justify-between gap-3">
        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#B8A99A] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-white leading-none mb-1">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-[#B8A99A] mt-1.5 truncate">{subValue}</p>
          )}
          {/* Trend indicator */}
          {trend && trend !== "neutral" && trendValue && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs font-medium",
                trend === "up"   ? "text-[#F5F0E8]" : "text-rose-400"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
          {trend === "neutral" && trendValue && (
            <div className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#B8A99A]">
              <Minus className="w-3 h-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            colors.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", colors.icon)} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}