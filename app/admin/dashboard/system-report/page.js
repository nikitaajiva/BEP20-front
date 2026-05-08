"use client";

import React, { Suspense } from "react";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// Dynamic import with SSR disabled to strictly prevent window-related errors during build
const SystemReportContent = nextDynamic(() => import("./SystemReportContent"), { 
  ssr: false,
  loading: () => (
    <div style={centeredStyle}>
      <div style={{
        width: 40, height: 40, border: "3px solid rgba(255,215,0,0.2)", borderTop: "3px solid #ffd700",
        borderRadius: "50%", animation: "spin 1s linear infinite"
      }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12, fontWeight: 700, letterSpacing: 2 }}>
        BOOTING AUDIT TERMINAL...
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
});

export default function SystemReportPage() {
  return (
    <Suspense fallback={
      <div style={centeredStyle}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(255,215,0,0.2)", borderTop: "3px solid #ffd700",
          borderRadius: "50%", animation: "spin 1s linear infinite"
        }} />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12, fontWeight: 700, letterSpacing: 2 }}>
          CONNECTING TO VAULT...
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SystemReportContent />
    </Suspense>
  );
}

const centeredStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  minHeight: "100vh", gap: 12, background: "#060606"
};
