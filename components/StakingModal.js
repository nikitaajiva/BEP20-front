"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCoins, FaClock, FaShieldAlt, FaBolt, FaInfoCircle, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "./SuccessModal";

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
  const [showSuccess, setShowSuccess] = useState(false);

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
        setShowSuccess(true);
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
    <>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => window.location.reload()}
        title="Staking Confirmed"
        message={`Successfully staked ${amount} USDT for ${tier?.days} days. Your yield engine is now active.`}
      />
      
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
        />
        
        {!showSuccess && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ 
              width: "100%", maxWidth: 520, background: "rgba(10, 10, 10, 0.85)", 
              backdropFilter: "blur(20px)", border: "1px solid rgba(255,102,0,0.15)",
              borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: 28,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)"
            }}
          >
            <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.05)", border: "none", color: "#888", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}>
              <FaTimes size={14} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display:"inline-block", background:"rgba(255,102,0,0.08)", color:"#ff8c00", fontSize:9, fontWeight:800, padding:"3px 10px", borderRadius:12, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, border: "1px solid rgba(255,102,0,0.2)" }}>Investment Vault</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#fff,#ffb800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Staking Engine
              </h2>
            </div>

            {step === 1 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>1. Select Staking Duration</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {tiers.map((t) => (
                    <div key={t.days} onClick={() => setSelectedTier(t.days)} style={{
                      background: selectedTier === t.days ? "rgba(255,102,0,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedTier === t.days ? t.color : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: selectedTier === t.days ? `0 0 20px ${t.color}20` : "none",
                      transform: selectedTier === t.days ? "translateY(-2px)" : "none"
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: t.color, marginBottom: 2, textTransform: "uppercase" }}>{t.badge}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{t.days} <span style={{fontSize: 12, opacity: 0.6}}>Days</span></div>
                      <div style={{ fontSize: 11, color: "#00ff88", fontWeight: 700 }}>{t.max}% APY</div>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={!selectedTier}
                  onClick={() => setStep(2)}
                  style={{ 
                    width: "100%", padding: 14, 
                    background: selectedTier ? "linear-gradient(135deg,#ff8c00,#e63200)" : "rgba(255,255,255,0.03)", 
                    border: "none", borderRadius: 12, color: selectedTier ? "#fff" : "rgba(255,255,255,0.2)", 
                    fontWeight: 800, fontSize: 14, cursor: selectedTier ? "pointer" : "not-allowed",
                    transition: "0.2s", boxShadow: selectedTier ? "0 4px 15px rgba(230, 50, 0, 0.3)" : "none"
                  }}
                >
                  Continue Configuration
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase" }}>2. Stake Amount</h3>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ 
                      width: "100%", background: "rgba(255,255,255,0.03)", 
                      border: "1px solid rgba(255,102,0,0.2)", borderRadius: 12, 
                      padding: "16px 20px", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none",
                      transition: "0.2s"
                    }}
                  />
                  <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "#ff8c00", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>USDT</span>
                </div>
                
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Lock Duration</span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{tier?.days} Days</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Estimated Profit</span>
                    <span style={{ color: "#00ff88", fontWeight: 700 }}>+{(parseFloat(amount || 0) * tier.max / 100 * tier.days / 365).toFixed(2)} USDT</span>
                  </div>
                </div>
    
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>Back</button>
                  <button 
                    onClick={handleStake}
                    disabled={isStaking || !amount}
                    style={{ 
                      flex: 2, padding: 14, 
                      background: "linear-gradient(135deg,#ff8c00,#e63200)", 
                      border: "none", borderRadius: 12, color: "#fff", 
                      fontWeight: 800, fontSize: 14, cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(230, 50, 0, 0.3)"
                    }}
                  >
                    {isStaking ? "Staking..." : `Confirm Stake`}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
