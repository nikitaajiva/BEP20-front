"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import safeStorage from "@/utils/safeStorage";

/* ─── tiny animation helper ──────────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target || target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ─── Stat Pill ──────────────────────────────────────────────────────────── */
function StatPill({ label, value, accent, sub }) {
  const animated = useCountUp(parseFloat(value) || 0);
  return (
    <div style={{
      flex: 1,
      minWidth: 130,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accent}33`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.1, textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 19, fontWeight: 900, color: accent, fontVariantNumeric: "tabular-nums" }}>
        {animated.toFixed(4)}
      </span>
      {sub && (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{sub}</span>
      )}
    </div>
  );
}

/* ─── Mini Badge ─────────────────────────────────────────────────────────── */
function LevelBadge({ level, count, rate, accent }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: `${accent}11`,
      border: `1px solid ${accent}33`,
      borderRadius: 8,
      padding: "6px 11px",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `${accent}22`,
        border: `2px solid ${accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: accent,
      }}>
        L{level}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
          {count} referral{count !== 1 ? "s" : ""}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          {rate}% reward rate
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CARD COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ReferralRewardsCard({ API_URL }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    const token = safeStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/referral-rewards/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load referral rewards.");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div style={cardWrap}>
        <div style={shimmerBar(200)} />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <div style={shimmerBar(100, 80)} />
          <div style={shimmerBar(100, 80)} />
          <div style={shimmerBar(100, 80)} />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ ...cardWrap, justifyContent: "center", alignItems: "center", minHeight: 120 }}>
        <span style={{ color: "#f43f5e", fontSize: 13, fontWeight: 600 }}>⚠ {error}</span>
        <button onClick={fetchSummary} style={retryBtn}>Retry</button>
      </div>
    );
  }

  const l1 = data?.l1 || {};
  const l2 = data?.l2 || {};
  const total = data?.totalTokenEarnings ?? 0;

  return (
    <div style={cardWrap}>
      {/* ── Glow decoration ── */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            {/* Icon */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, rgba(179,186,255,0.25), rgba(127,255,76,0.2))",
              border: "1px solid rgba(179,186,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>
              🔗
            </div>
            <h2 style={{
              margin: 0, fontSize: 15, fontWeight: 900, color: "#fff",
              letterSpacing: -0.3,
            }}>
              Referral Rewards
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.4 }}>
            TSC tokens from referral network
          </p>
        </div>

        {/* View Team Button */}
        <button
          id="referral-view-team-btn"
          onClick={() => router.push("/team-referrals")}
          style={{
            ...viewBtn,
            padding: "6px 12px",
            fontSize: 11,
            background: "rgba(179,186,255,0.12)",
            border: "1px solid rgba(179,186,255,0.3)",
            color: "#b3baff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(179,186,255,0.25)";
            e.currentTarget.style.borderColor = "rgba(179,186,255,0.6)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(179,186,255,0.12)";
            e.currentTarget.style.borderColor = "rgba(179,186,255,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          View Team
        </button>
      </div>

      {/* ── Level Badges ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <LevelBadge level={1} count={l1.count ?? 0} rate={l1.ratePercent ?? 10} accent="#b3baff" />
        <LevelBadge level={2} count={l2.count ?? 0} rate={l2.ratePercent ?? 5} accent="rgb(127,255,76)" />
      </div>

      {/* ── Stat Pills ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatPill
          label="L1 Earnings"
          value={l1.tokenEarnings ?? 0}
          accent="#b3baff"
          sub={`${l1.transactionCount ?? 0} mint${(l1.transactionCount ?? 0) !== 1 ? "s" : ""}`}
        />
        <StatPill
          label="L2 Earnings"
          value={l2.tokenEarnings ?? 0}
          accent="rgb(127,255,76)"
          sub={`${l2.transactionCount ?? 0} mint${(l2.transactionCount ?? 0) !== 1 ? "s" : ""}`}
        />
        <StatPill
          label="Total Earned"
          value={total}
          accent="#FFD700"
          sub="TSC Tokens"
        />
      </div>

      {/* ── Divider + Info ── */}
      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>


      </div>

      <style>{`
        @keyframes refPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
const cardWrap = {
  position: "relative",
  overflow: "hidden",
  background: "#000",
  borderRadius: 18,
  border: "1px solid rgba(179,186,255,0.2)",
  boxShadow: "0 8px 32px rgba(179,186,255,0.06), 0 0 0 1px rgba(179,186,255,0.05)",
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column",
  maxWidth: "500px",
};

const viewBtn = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 12px",
  background: "rgba(179,186,255,0.12)",
  border: "1px solid rgba(179,186,255,0.3)",
  borderRadius: 8,
  color: "#b3baff",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
  letterSpacing: 0.2,
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const retryBtn = {
  marginTop: 8,
  padding: "5px 12px",
  background: "rgba(255,215,0,0.12)",
  border: "1px solid rgba(255,215,0,0.3)",
  borderRadius: 6,
  color: "#FFD700",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const shimmerBar = (w = "100%", h = 18) => ({
  width: w,
  height: h,
  borderRadius: 8,
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
});
