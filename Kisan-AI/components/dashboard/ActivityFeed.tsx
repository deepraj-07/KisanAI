/**
 * components/home/ActivityFeed.tsx
 * Recent activity log for the Dashboard sidebar.
 */

import {
  ScanSearch,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  FileText,
  Activity,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/utils/utils";
import type { ActivityLogEntry } from "@/models";

// â”€â”€â”€ Icon Registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type IconComponent = React.FC<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  ScanSearch,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  FileText,
};

// â”€â”€â”€ Activity color mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TYPE_COLORS: Record<string, string> = {
  pest_diagnosis:      "text-rose-400   bg-rose-400/10   border-rose-400/20",
  chat_message:        "text-[#F5F0E8]  bg-[#E86B2E]/10  border-[#E86B2E]/20",
  crop_recommendation: "text-amber-400  bg-amber-400/10  border-amber-400/20",
  market_query:        "text-blue-400   bg-blue-400/10   border-blue-400/20",
  scheme_search:       "text-[#F4C430] bg-[#F4C430]/10 border-[#F4C430]/20",
  weather_check:       "text-sky-400    bg-sky-400/10    border-sky-400/20",
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  maxItems?: number;
}

export default function ActivityFeed({
  entries,
  maxItems = 6,
}: ActivityFeedProps) {
  const displayed = entries.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3B322A]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#B8A99A]" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-white">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs text-[#B8A99A]">{entries.length} events</span>
      </div>

      {/* Feed */}
      {displayed.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Activity className="w-8 h-8 text-[#3B322A] mx-auto mb-2" />
          <p className="text-sm text-[#B8A99A]">No activity yet</p>
          <p className="text-xs text-[#3B322A] mt-1">
            Start by asking the AI advisor a question
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#3B322A]">
          {displayed.map((entry, index) => {
            const Icon = ICON_MAP[entry.icon] ?? Activity;
            const colorClass =
              TYPE_COLORS[entry.type] ?? TYPE_COLORS["chat_message"];

            return (
              <li
                key={entry.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-3.5",
                  "hover:bg-white/5 transition-colors",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon badge */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5",
                    colorClass
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-tight truncate">
                    {entry.title}
                  </p>
                  <p className="text-xs text-[#B8A99A] mt-0.5 line-clamp-2">
                    {entry.description}
                  </p>
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-[10px] text-[#B8A99A] mt-0.5 whitespace-nowrap">
                  {entry.timeAgo}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      {entries.length > maxItems && (
        <div className="px-5 py-3 border-t border-[#3B322A]">
          <button className="text-xs font-medium text-[#F5F0E8] hover:text-[#B8A99A] transition-colors">
            View all {entries.length} activities
          </button>
        </div>
      )}
    </div>
  );
}