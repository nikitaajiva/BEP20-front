"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, TrendingUp, Clock, History } from "lucide-react";


export default function PortfolioModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const allStakes = [
    ...(user?.stakingPlan?.amount ? [{ ...user.stakingPlan, isPrimary: true }] : []),
    ...(user?.stakingPlans || [])
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(15px)" }}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          width: "100%", maxWidth: 900, background: "#0a0a0c", 
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32, position: "relative", zIndex: 1, 
          overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.8)"
        }}
      >
        {/* Header Section */}
        <div style={{ padding: "40px 40px 20px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 150, background: "radial-gradient(circle at 50% -20%, rgba(255,85,0,0.15), transparent 70%)", pointerEvents: "none" }}></div>
          
          <button onClick={onClose} style={{ position: "absolute", top: 30, right: 30, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s" }}>
            <X size={16} />
          </button>

          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 950, margin: 0, color: "#fff", letterSpacing: "-1px" }}>ACTIVE STAKES</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 10 }}>Complete overview of your active investment vehicles.</p>
          </div>
        </div>

        {/* Portfolio Table */}
        <div style={{ padding: "0 30px 30px", maxHeight: "65vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", textAlign: "left" }}>
            <thead>
              <tr style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5 }}>
                <th style={{ padding: "0 15px 10px" }}>Asset / Amount</th>
                <th style={{ padding: "0 15px 10px" }}>Tier</th>
                <th style={{ padding: "0 15px 10px" }}>Duration</th>
                <th style={{ padding: "0 15px 10px" }}>Est. Reward</th>
                <th style={{ padding: "0 15px 10px" }}>Maturity</th>
                <th style={{ padding: "0 15px 10px", textAlign: "right" }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {allStakes.length > 0 ? allStakes.map((stake, idx) => {
                const daysPassed = Math.max(0, Math.floor((new Date() - new Date(stake.startDate)) / 86400000));
                const progress = Math.min(100, (daysPassed / stake.days) * 100);
                const dailyYield = stake.days === 30 ? 0.08 : stake.days === 90 ? 0.12 : stake.days === 180 ? 0.18 : 0.28;
                const totalEstReward = (parseFloat(stake.amount) * dailyYield).toFixed(2);
                const daysRemaining = Math.max(0, stake.days - daysPassed);
                const tierName = stake.days === 30 ? "Starter" : stake.days === 90 ? "Growth" : stake.days === 180 ? "Advanced" : "Premium";

                return (
                  <tr key={idx} style={{ 
                    background: "rgba(255,255,255,0.02)", 
                    transition: "0.2s", 
                    cursor: "default"
                  }} 
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,85,0,0.05)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  >
                    <td style={{ padding: "16px 15px", borderRadius: "12px 0 0 12px", border: "1px solid rgba(255,255,255,0.05)", borderRight: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,85,0,0.1)", color: "#ff5500", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", display: "block" }}>{parseFloat(stake.amount).toLocaleString()}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>USDT</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 15px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: "#ff5500", background: "rgba(255,85,0,0.1)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                        {tierName}
                      </span>
                    </td>
                    <td style={{ padding: "16px 15px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{stake.days} <small style={{ fontSize: 9, opacity: 0.4 }}>Days</small></span>
                    </td>
                    <td style={{ padding: "16px 15px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#00ff00" }}>+{totalEstReward}</span>
                      <span style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>~{(dailyYield * 100).toFixed(0)}% APR</span>
                    </td>
                    <td style={{ padding: "16px 15px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", display: "block" }}>
                        {new Date(new Date(stake.startDate).getTime() + stake.days * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 9, color: daysRemaining < 5 ? "#ff5500" : "rgba(255,255,255,0.3)", fontWeight: 800 }}>{daysRemaining}d left</span>
                    </td>
                    <td style={{ padding: "16px 15px", borderRadius: "0 12px 12px 0", border: "1px solid rgba(255,255,255,0.05)", borderLeft: "none", textAlign: "right" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${progress}%`, height: "100%", background: "#ff5500", boxShadow: "0 0 10px rgba(255,85,0,0.5)" }}></div>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)" }}>{progress.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                    No active staking records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{ padding: "20px 40px", background: "rgba(255,85,0,0.03)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <History color="#ff5500" size={14} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Transaction Ledger Syncing</span>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff00", boxShadow: "0 0 10px #00ff00" }}></div>
        </div>
      </motion.div>
    </div>
  );
}
