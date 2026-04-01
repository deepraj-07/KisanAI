/**
 * app/page.tsx
 * Root route redirect.
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home");
}