/**
 * components/auth/AuthGuard.tsx
 * Wraps any page that requires authentication.
 * Redirects to /login if user is not authenticated.
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import { useAuth } from "@/core/firebase/auth-context";

export default function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0F0F0F] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E86B2E]/20 border border-[#E86B2E]/40 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-[#F5F0E8]" strokeWidth={2} />
        </div>
        <Loader2 className="w-5 h-5 text-[#F5F0E8] animate-spin" />
        <p className="text-xs text-[#B8A99A]">Loading Kisan AI...</p>
      </div>
    );
  }

  if (!user) return null; // Redirecting

  return <>{children}</>;
}