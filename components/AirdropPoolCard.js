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
      const res = await fetch(`${API_URL}/api/rewards/airdrop-pool/history?page=${pg}&limit=20`, {
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

// ─── Main Card ───────────────────────────────────────────────────────────────
export default function AirdropPoolCard({ API_URL }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/rewards/airdrop-pool`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("[AirdropPoolCard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tier = stats?.nodeTier || null;
  const tierCfg = tier ? TIER_CONFIG[tier] : null;
  const hasEarnings = (stats?.lifetimeEarnings || 0) > 0;

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
          position: "relative", overflow: "hidden",
          borderRadius: 24, cursor: "pointer",
          background: "linear-gradient(135deg, #080c14 0%, #0a1020 50%, #080c14 100%)",
          border: `1px solid ${tierCfg ? `${tierCfg.color}30` : "rgba(105,240,174,0.15)"}`,
          boxShadow: tierCfg
            ? `0 0 30px ${tierCfg.glow}, inset 0 0 30px rgba(0,0,0,0.5)`
            : "0 0 20px rgba(0,0,0,0.4)",
          padding: "24px",
          minHeight: 200,
          transition: "border-color 0.3s, box-shadow 0.3s"
        }}
      >
        {/* Animated background radial when tier active */}
        {tierCfg && (
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, ${tierCfg.glow} 0%, transparent 70%)`,
            pointerEvents: "none"
          }} />
        )}

        {/* Top row: title + tier badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 3,
              color: "rgba(105,240,174,0.7)", textTransform: "uppercase", marginBottom: 6
            }}>
              🌐 P1–P9 NETWORK REWARDS
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>
              AIRDROP POOL
            </h3>
          </div>

          {loading ? (
            <div style={{ width: 60, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
          ) : tier ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                padding: "6px 14px", borderRadius: 10,
                background: `${tierCfg.glow}`,
                border: `1px solid ${tierCfg.color}66`,
                boxShadow: `0 0 14px ${tierCfg.glow}`,
                fontSize: 13, fontWeight: 900, color: tierCfg.color,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: tierCfg.color,
                boxShadow: `0 0 8px ${tierCfg.color}`,
                animation: "pulseDot 1.5s ease-in-out infinite"
              }} />
              <style>{`@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.3)}}`}</style>
              {tier}
            </motion.div>
          ) : (
            <div style={{
              padding: "6px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)"
            }}>
              NOT QUALIFIED
            </div>
          )}
        </div>

        {/* Community Rewards Balance (primary metric) */}
        {loading ? (
          <div style={{ height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 16 }} />
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              COMMUNITY REWARDS BALANCE
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize: 32, fontWeight: 900, letterSpacing: -1,
                color: tierCfg?.color || "#69F0AE",
                textShadow: tierCfg ? `0 0 20px ${tierCfg.glow}` : "none"
              }}>
                ${formatAmount(stats?.communityRewardsBalance, 4)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>USDT</span>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: 16
        }}>
          {[
            { label: "LIFETIME", value: loading ? "—" : `$${formatAmount(stats?.lifetimeEarnings, 4)}` },
            { label: "LAST 30D", value: loading ? "—" : `$${formatAmount(stats?.last30DayEarnings, 4)}` },
            { label: "EVENTS", value: loading ? "—" : (stats?.rewardCount || 0) }
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "10px 12px", textAlign: "center"
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Tier share info */}
        {!loading && tier && stats?.tierSharePct != null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", borderRadius: 10, marginBottom: 14,
            background: `${tierCfg.glow}`,
            border: `1px solid ${tierCfg.color}33`
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: tierCfg.color }}>
              🎯 {stats.tierSharePct}% Pool Share
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              · You receive {stats.tierSharePct}% of every 2% withdrawal fee
            </span>
          </div>
        )}

        {/* No tier message */}
        {!loading && !tier && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, color: "rgba(255,255,255,0.35)"
          }}>
            💡 Qualify for P1–P9 by growing your personal & team mining power to earn from every network withdrawal.
          </div>
        )}

        {/* View History button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Tap card to view full history</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
            style={{
              padding: "8px 16px", borderRadius: 10,
              background: tierCfg ? `${tierCfg.glow}` : "rgba(105,240,174,0.08)",
              border: `1px solid ${tierCfg ? `${tierCfg.color}44` : "rgba(105,240,174,0.2)"}`,
              color: tierCfg?.color || "#69F0AE",
              fontSize: 11, fontWeight: 800, cursor: "pointer",
              letterSpacing: 1, display: "flex", alignItems: "center", gap: 6
            }}
          >
            VIEW HISTORY →
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
