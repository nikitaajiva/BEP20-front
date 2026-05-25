"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tier configuration ─────────────────────────────────────────────────────
const TIER_CONFIG = {
  P1: { color: "#FFD700", glow: "rgba(255, 215, 0, 0.35)", label: "P1", share: "20%" },
  P2: { color: "#C0C0C0", glow: "rgba(192, 192, 192, 0.35)", label: "P2", share: "15%" },
  P3: { color: "#CD7F32", glow: "rgba(205, 127, 50, 0.35)", label: "P3", share: "12.5%" },
  P4: { color: "#00E5FF", glow: "rgba(0, 229, 255, 0.35)", label: "P4", share: "11.5%" },
  P5: { color: "#7C4DFF", glow: "rgba(124, 77, 255, 0.35)", label: "P5", share: "10.5%" },
  P6: { color: "#00BFA5", glow: "rgba(0, 191, 165, 0.35)", label: "P6", share: "9.5%" },
  P7: { color: "#FF6D00", glow: "rgba(255, 109, 0, 0.35)", label: "P7", share: "8.5%" },
  P8: { color: "#E040FB", glow: "rgba(224, 64, 251, 0.35)", label: "P8", share: "7.5%" },
  P9: { color: "#69F0AE", glow: "rgba(105, 240, 174, 0.35)", label: "P9", share: "5%" },
};

function formatAmount(val, dp = 4) {
  const n = parseFloat(val || 0);
  if (n === 0) return "0.00";
  if (n < 0.0001) return n.toFixed(6);
  if (n < 1) return n.toFixed(dp);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: dp });
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── History Modal ───────────────────────────────────────────────────────────
function AirdropHistoryModal({ isOpen, onClose, API_URL }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async (pg = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/rewards/airdrop-pool/history?page=${pg}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data.rewards);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
        setPage(pg);
      }
    } catch (err) {
      console.error("[AirdropPoolHistory] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (isOpen) fetchHistory(1);
  }, [isOpen, fetchHistory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "900px",
            maxHeight: "88vh", overflowY: "auto",
            background: "linear-gradient(160deg, #0a0a12 0%, #0d0d1a 100%)",
            border: "1px solid rgba(105, 240, 174, 0.2)",
            borderRadius: "28px 28px 0 0",
            padding: "0 0 40px",
            boxShadow: "0 -20px 80px rgba(0,0,0,0.7), 0 0 40px rgba(105,240,174,0.05)"
          }}
        >
          {/* Header */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "linear-gradient(180deg, #0a0a12 70%, transparent)",
            padding: "24px 24px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: "rgba(105,240,174,0.7)", textTransform: "uppercase", marginBottom: 4 }}>
                🌐 AIRDROP POOL
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                Earnings History
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {total} total airdrop events from network withdrawals
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >✕</button>
          </div>

          {/* Table Content */}
          <div style={{ padding: "0 16px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "2px solid rgba(105,240,174,0.15)", borderTopColor: "#69F0AE",
                  animation: "spin 1s linear infinite", margin: "0 auto 12px"
                }} />
                <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
                <p style={{ fontSize: 12 }}>Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 24px",
                color: "rgba(255,255,255,0.4)"
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>No airdrop earnings yet</p>
                <p style={{ fontSize: 12 }}>Earn a node tier (P1–P9) to start receiving 2% fee shares from network withdrawals.</p>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 70px 80px 80px 100px",
                  gap: 8, padding: "12px 12px 8px",
                  fontSize: 9, fontWeight: 800, letterSpacing: 2,
                  color: "rgba(255,255,255,0.3)", textTransform: "uppercase"
                }}>
                  <span>Date & Source</span>
                  <span style={{ textAlign: "center" }}>Tier</span>
                  <span style={{ textAlign: "right" }}>Share %</span>
                  <span style={{ textAlign: "right" }}>Amount</span>
                  <span style={{ textAlign: "right" }}>Src Withdrawal</span>
                </div>

                {history.map((row, idx) => {
                  const tierCfg = TIER_CONFIG[row.nodeTier] || { color: "#aaa", glow: "transparent", share: "—" };
                  return (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 70px 80px 80px 100px",
                        gap: 8, padding: "12px",
                        marginBottom: 4, borderRadius: 12,
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        alignItems: "center"
                      }}
                    >
                      {/* Date + narrative */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                          {formatDate(row.createdAt)}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.3 }}>
                          {row.narrative}
                        </div>
                      </div>

                      {/* Tier badge */}
                      <div style={{ textAlign: "center" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px",
                          borderRadius: 8, fontSize: 11, fontWeight: 800,
                          color: tierCfg.color,
                          background: `${tierCfg.glow}`,
                          border: `1px solid ${tierCfg.color}44`,
                          boxShadow: `0 0 8px ${tierCfg.glow}`
                        }}>
                          {row.nodeTier}
                        </span>
                      </div>

                      {/* Share % */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#69F0AE" }}>
                          {row.tierSharePct != null ? `${row.tierSharePct.toFixed(1)}%` : "—"}
                        </span>
                      </div>

                      {/* Amount */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                          ${formatAmount(row.amount, 6)}
                        </span>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>USDT</div>
                      </div>

                      {/* Source withdrawal amount */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                          {row.withdrawalAmount != null ? `$${formatAmount(row.withdrawalAmount, 2)}` : "—"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    <button
                      onClick={() => fetchHistory(page - 1)}
                      disabled={page <= 1}
                      style={{
                        padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: page <= 1 ? "rgba(255,255,255,0.05)" : "rgba(105,240,174,0.1)",
                        border: "1px solid rgba(105,240,174,0.2)",
                        color: page <= 1 ? "rgba(255,255,255,0.3)" : "#69F0AE",
                        cursor: page <= 1 ? "not-allowed" : "pointer"
                      }}
                    >← Prev</button>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => fetchHistory(page + 1)}
                      disabled={page >= totalPages}
                      style={{
                        padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: page >= totalPages ? "rgba(255,255,255,0.05)" : "rgba(105,240,174,0.1)",
                        border: "1px solid rgba(105,240,174,0.2)",
                        color: page >= totalPages ? "rgba(255,255,255,0.3)" : "#69F0AE",
                        cursor: page >= totalPages ? "not-allowed" : "pointer"
                      }}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── countUp animation hook ─────────────────────────────────────────────── */
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
function StatPill({ label, value, accent, sub, isCurrency = true }) {
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
        {isCurrency ? "$" : ""}{isCurrency ? animated.toFixed(4) : Math.round(animated)}
      </span>
      {sub && (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{sub}</span>
      )}
    </div>
  );
}

/* ─── Tier Badge ─────────────────────────────────────────────────────────── */
function TierBadge({ tier, sharePct }) {
  const accent = tier ? (TIER_CONFIG[tier]?.color || "#69F0AE") : "rgba(255,255,255,0.3)";
  const label = tier ? `Qualified Tier: ${tier}` : "Not Qualified";
  const sub = tier ? `${sharePct}% pool share` : "Grow mining power to qualify";
  
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: tier ? `${accent}11` : "rgba(255,255,255,0.02)",
      border: `1px solid ${accent}33`,
      borderRadius: 8,
      padding: "6px 11px",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: tier ? `${accent}22` : "rgba(255,255,255,0.05)",
        border: `2px solid ${accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: accent,
      }}>
        {tier || "—"}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: tier ? "#fff" : "rgba(255,255,255,0.5)" }}>
          {label}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export default function AirdropPoolCard({ API_URL }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/rewards/airdrop-pool`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load stats.");
      setStats(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tier = stats?.nodeTier || null;
  const tierCfg = tier ? TIER_CONFIG[tier] : null;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div style={cardWrap}>
        <div style={shimmerBar(200)} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <div style={{ flex: 1, minWidth: 130, height: 80, borderRadius: 12, background: "rgba(255,255,255,0.02)" }} />
          <div style={{ flex: 1, minWidth: 130, height: 80, borderRadius: 12, background: "rgba(255,255,255,0.02)" }} />
          <div style={{ flex: 1, minWidth: 130, height: 80, borderRadius: 12, background: "rgba(255,255,255,0.02)" }} />
          <div style={{ flex: 1, minWidth: 130, height: 80, borderRadius: 12, background: "rgba(255,255,255,0.02)" }} />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ ...cardWrap, justifyContent: "center", alignItems: "center", minHeight: 120 }}>
        <span style={{ color: "#f43f5e", fontSize: 13, fontWeight: 600 }}>⚠ {error}</span>
        <button onClick={fetchStats} style={retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <AirdropHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        API_URL={API_URL}
      />

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowHistory(true)}
        style={{
          ...cardWrap,
          border: `1px solid ${tierCfg ? `${tierCfg.color}44` : "rgba(105,240,174,0.2)"}`,
          boxShadow: tierCfg
            ? `0 8px 32px ${tierCfg.glow}, 0 0 0 1px rgba(105,240,174,0.05)`
            : "0 8px 32px rgba(105,240,174,0.06), 0 0 0 1px rgba(105,240,174,0.05)",
        }}
      >
        {/* ── Glow decoration ── */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${tierCfg ? `${tierCfg.color}1e` : "rgba(105,240,174,0.12)"} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${tierCfg ? `${tierCfg.color}40` : "rgba(105,240,174,0.25)"}, rgba(127,255,76,0.2))`,
                border: `1px solid ${tierCfg ? `${tierCfg.color}88` : "rgba(105,240,174,0.4)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                🌐
              </div>
              <h2 style={{
                margin: 0, fontSize: 15, fontWeight: 900, color: "#fff",
                letterSpacing: -0.3,
              }}>
                Airdrop Pool
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.4 }}>
              P1–P9 Network Rewards
            </p>
          </div>

          {/* View History Button */}
          <button
            id="airdrop-view-history-btn"
            onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
            style={{
              ...viewBtn,
              padding: "6px 12px",
              fontSize: 11,
              background: tierCfg ? `${tierCfg.color}1c` : "rgba(105,240,174,0.12)",
              border: `1px solid ${tierCfg ? `${tierCfg.color}66` : "rgba(105,240,174,0.3)"}`,
              color: tierCfg ? tierCfg.color : "#69f0ae",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = tierCfg ? `${tierCfg.color}35` : "rgba(105,240,174,0.25)";
              e.currentTarget.style.borderColor = tierCfg ? tierCfg.color : "rgba(105,240,174,0.6)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = tierCfg ? `${tierCfg.color}1c` : "rgba(105,240,174,0.12)";
              e.currentTarget.style.borderColor = tierCfg ? `${tierCfg.color}66` : "rgba(105,240,174,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            History →
          </button>
        </div>

        {/* ── Tier Badge ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <TierBadge tier={tier} sharePct={stats?.tierSharePct || (tierCfg ? parseFloat(tierCfg.share) : 0)} />
        </div>

        {/* ── Stat Pills ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatPill
            label="Today"
            value={stats?.todayEarnings ?? 0}
            accent="#a78bfa"
            sub="USDT Earned"
            isCurrency={true}
          />
          <StatPill
            label="Lifetime"
            value={stats?.lifetimeEarnings ?? 0}
            accent={tierCfg ? tierCfg.color : "#69f0ae"}
            sub={`${stats?.rewardCount || 0} event${(stats?.rewardCount || 0) !== 1 ? "s" : ""}`}
            isCurrency={true}
          />
          <StatPill
            label="Last 30D"
            value={stats?.last30DayEarnings ?? 0}
            accent="#38bdf8"
            sub="USDT Earned"
            isCurrency={true}
          />
          <StatPill
            label="Vault Balance"
            value={stats?.communityRewardsBalance ?? 0}
            accent="#FFD700"
            sub="USDT Balance"
            isCurrency={true}
          />
        </div>
      </motion.div>
    </>
  );
}

/* ── Styles ── */
const cardWrap = {
  position: "relative",
  overflow: "hidden",
  background: "#000",
  borderRadius: 18,
  border: "1px solid rgba(105,240,174,0.2)",
  boxShadow: "0 8px 32px rgba(105,240,174,0.06), 0 0 0 1px rgba(105,240,174,0.05)",
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column",
  maxWidth: "500px",
  width: "100%",
  cursor: "pointer",
};

const viewBtn = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 12px",
  borderRadius: 8,
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
