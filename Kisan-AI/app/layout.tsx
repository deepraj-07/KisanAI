/**
 * app/layout.tsx
 * Root layout - wraps all routes with Firebase Auth context.
 */

import React from "react";
import type { Metadata, Viewport } from "next";
import { Baloo_2, Noto_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/core/firebase/auth-context";
import LoadingScreen from "@/components/ui/LoadingScreen";
import "@/styles/globals.css";

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Kisan AI - Smart Farming Advisor", template: "%s | Kisan AI" },
  description: "AI-powered agricultural advisor for Indian farmers.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#0F0F0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${notoSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-kisan-bg text-kisan-text">
        <AuthProvider>
          <LoadingScreen>{children}</LoadingScreen>
        </AuthProvider>
      </body>
    </html>
  );
}