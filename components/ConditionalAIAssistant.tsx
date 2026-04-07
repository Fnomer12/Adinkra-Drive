"use client";

import { usePathname } from "next/navigation";
import GlobalAIAssistant from "@/components/GlobalAIAssistant";

export default function ConditionalAIAssistant() {
  const pathname = usePathname();

  const hideAssistant =
    pathname?.startsWith("/ADmin00") ||
    pathname?.startsWith("/login/ADmin00");

  if (hideAssistant) return null;

  return <GlobalAIAssistant />;
}