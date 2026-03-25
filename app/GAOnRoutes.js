// app/GA_TagManager.jsx
"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-EKBRNJ9C4M";

const ALLOWED = new Set([
  "/", // home
  "/sign-in",
  "/sign-up",
  "/privacy-policy",
  "/disclaimer",
  "/terms-conditions",
]);

export default function GA_TagManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // normalize: keep "/" as is; strip trailing slash elsewhere
  const cleanPath = useMemo(() => {
    if (!pathname) return "/";
    return pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  }, [pathname]);

  // If route not allowed, render nothing (no GA scripts injected)
  if (!ALLOWED.has(cleanPath)) return null;

  const pageUrl =
    cleanPath + (searchParams?.toString() ? `?${searchParams}` : "");

  return (
    <>
      {/* Bootstrap gtag before loading the library */}
      <Script id="ga-inline-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
        `}
      </Script>

      {/* Load GA ONLY on allowed routes */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize + send first page_view for this allowed route
          window.gtag("js", new Date());
          window.gtag("config", GA_ID, { page_path: "${pageUrl}" });
        }}
      />
    </>
  );
}
