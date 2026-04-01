/**
 * components/home/MarketPriceTable.tsx
 * Compact market prices table for the Dashboard.
 * Shows top N crops with price vs MSP comparison.
 */

import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn, formatINR } from "@/utils/utils";
import type { MarketPrice } from "@/models";

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MarketPriceTableProps {
  prices: MarketPrice[];
  maxItems?: number;
}

export default function MarketPriceTable({
  prices,
  maxItems = 5,
}: MarketPriceTableProps) {
  const displayed = prices.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3B322A]">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Market Prices
          </h2>
          <p className="text-xs text-[#B8A99A] mt-0.5">INR per quintal</p>
        </div>
        <Link
          href="/markets"
          className="flex items-center gap-1 text-xs font-medium text-[#F5F0E8] hover:text-[#B8A99A] transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3B322A]">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#B8A99A] uppercase tracking-wider">
                Crop
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-[#B8A99A] uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-[#B8A99A] uppercase tracking-wider hidden sm:table-cell">
                MSP
              </th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#B8A99A] uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3B322A]">
            {displayed.map((item) => {
              const isAboveMSP = item.currentPrice >= item.msp;
              const isUp = item.priceChange > 0;
              const isDown = item.priceChange < 0;

              return (
                <tr
                  key={item.cropName}
                  className="hover:bg-white/5 transition-colors"
                >
                  {/* Crop name */}
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-white">
                        {item.cropName}
                      </p>
                      {item.cropNameHi && (
                        <p className="text-[11px] text-[#B8A99A]">
                          {item.cropNameHi}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Current price */}
                  <td className="px-3 py-3 text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        isAboveMSP ? "text-[#F5F0E8]" : "text-rose-400"
                      )}
                    >
                      â‚¹{item.currentPrice.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* MSP */}
                  <td className="px-3 py-3 text-right hidden sm:table-cell">
                    <span className="text-[#B8A99A] text-xs">
                      â‚¹{item.msp.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Change */}
                  <td className="px-5 py-3 text-right">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        isUp   ? "text-[#F5F0E8]" :
                        isDown ? "text-rose-400"   : "text-[#B8A99A]"
                      )}
                    >
                      {isUp   ? <TrendingUp  className="w-3 h-3" /> :
                       isDown ? <TrendingDown className="w-3 h-3" /> :
                                <Minus        className="w-3 h-3" />}
                      <span>
                        {isUp ? "+" : ""}
                        {item.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-[#3B322A]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F4C430]" />
          <span className="text-[10px] text-[#B8A99A]">Above MSP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-[10px] text-[#B8A99A]">Below MSP</span>
        </div>
        <span className="text-[10px] text-[#B8A99A] ml-auto">
          Source: Mock Mandi Data
        </span>
      </div>
    </div>
  );
}