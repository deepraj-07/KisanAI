import React from "react";
import PageTransition from "@/components/ui/PageTransition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
