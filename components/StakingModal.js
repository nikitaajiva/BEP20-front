"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCoins, FaClock, FaShieldAlt, FaBolt, FaInfoCircle, FaChartLine } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const tiers = [
  { days: 30,  min: 5,  max: 10, badge: "Starter",  color: "#ff8c00", description: "Perfect for first-time stakers." },
  { days: 90,  min: 11, max: 18, badge: "Growth",   color: "#ff6600", description: "Balance between flexibility and yield." },
  { days: 180, min: 19, max: 22, badge: "Advanced", color: "#ff4500", description: "Maximum yield for committed investors." },
  { days: 365, min: 23, max: 28, badge: "Premium",  color: "#e63200", description: "Top-tier APY with maximum compounding." },
];

export default function StakingModal({ isOpen, onClose }) {
  const { user, updateMe } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);

  const tier = tiers.find((t) => t.days === selectedTier);

  const handleStake = async () => {
    const parsedAmount = parseFloat(amount);
    if (!selectedTier || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid staking amount.");
      return;
    }
    
    setIsStaking(true);
    try {
      const result = await updateMe({
        stakingPlan: {
          amount: parsedAmount,
          days: selectedTier,
          startDate: new Date()
        }
      });
      
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Failed to update staking plan.");
      }
    } catch (error) {
      console.error("Staking failed:", error);
    } finally {
      setIsStaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          width: "100%", maxWidth: 600, background: "#0a0a0a", border: "1px solid rgba(255,102,0,0.2)",
          borderRadius: 32, position: "relative", overflow: "hidden", zIndex: 1, padding: 32,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>
          <FaTimes size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display:"inline-block", background:"rgba(255,102,0,0.1)", color:"#ff8c00", fontSize:10, fontWeight:800, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Investment Portal</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Token Staking Flow
          </h2>
        </div>

        {step === 1 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16 }}>1. Select Lock Period</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {tiers.map((t) => (
                <div key={t.days} onClick={() => setSelectedTier(t.days)} style={{
                  background: selectedTier === t.days ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedTier === t.days ? t.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16, padding: 16, cursor: "pointer", transition: "0.2s"
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: t.color, marginBottom: 4 }}>{t.badge}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{t.days} Days</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Up to {t.max}% APY</div>
                </div>
              ))}
            </div>
            <button 
              disabled={!selectedTier}
              onClick={() => setStep(2)}
              style={{ width: "100%", padding: 16, background: selectedTier ? "linear-gradient(135deg,#ffd700,#ff8c00)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 14, color: selectedTier ? "#000" : "#444", fontWeight: 900, cursor: selectedTier ? "pointer" : "not-allowed" }}
            >
              Next Step →
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 16 }}>2. Enter Amount</h3>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,102,0,0.3)", borderRadius: 12, padding: 16, color: "#fff", fontSize: 20, fontWeight: 800, outline: "none" }}
              />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#ff6600", fontWeight: 800 }}>TOKING</span>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "#666" }}>Selected Period</span>
                <span style={{ color: "#fff", fontWeight: 700 }}>{tier?.days} Days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#666" }}>Est. Max Yield</span>
                <span style={{ color: "#00ff00", fontWeight: 700 }}>+{(parseFloat(amount || 0) * tier.max / 100 * tier.days / 365).toFixed(4)} TOKING</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: 16, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Back</button>
              <button 
                onClick={handleStake}
                disabled={isStaking || !amount}
                style={{ flex: 2, padding: 16, background: "linear-gradient(135deg,#ffd700,#ff8c00)", border: "none", borderRadius: 14, color: "#000", fontWeight: 900, cursor: "pointer" }}
              >
                {isStaking ? "Processing..." : `Stake ${amount} TOKING`}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
