"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCoins, FaBitcoin, FaEthereum, FaClock, FaShieldAlt, FaBolt, FaInfoCircle, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "./SuccessModal";

const tiers = [
  { days: 30,  min: 5,  max: 10, badge: "Starter",  color: "#ff8c00", description: "Perfect for first-time stakers." },
  { days: 90,  min: 11, max: 18, badge: "Growth",   color: "#ff6600", description: "Balance between flexibility and yield." },
  { days: 180, min: 19, max: 22, badge: "Advanced", color: "#ff4500", description: "Maximum yield for committed investors." },
  { days: 365, min: 23, max: 28, badge: "Premium",  color: "#e63200", description: "Top-tier APY with maximum compounding." },
];

export default function StakingModal({ isOpen, onClose }) {
  const { user, stakeTokens } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState(null);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tier = tiers.find((t) => t.days === selectedTier);

    const TSC_PRICE = 0.01;
    const handleStake = async () => {
    const parsedAmount = parseFloat(amount);
    if (!selectedTier || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid staking amount.");
      return;
    }
    
    setIsStaking(true);
    try {
      const result = await stakeTokens({
        amount: parsedAmount,
        days: selectedTier,
        tscAmount: parsedAmount / TSC_PRICE,
        ratePct: tier?.max
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
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        />
        
        {!showSuccess && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ 
              width: "100%", maxWidth: 540, background: "#08080a", 
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)",
              backgroundSize: "15px 15px, 100% 4px",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: "35px 30px",
              boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
            }}
          >
            {/* Top Glow */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250, background: "radial-gradient(circle at 50% -20%, rgba(255,85,0,0.2), transparent 70%)", zIndex: -1, pointerEvents: "none" }}></div>

            {/* Background Coins */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden" }}>
              <FaBitcoin style={{ position: "absolute", top: "5%", left: "-2%", fontSize: 120, color: "#f7931a", opacity: 0.08, transform: "rotate(-20deg)" }} />
              <FaCoins style={{ position: "absolute", bottom: "10%", left: "-5%", fontSize: 150, color: "#ffd700", opacity: 0.05, transform: "rotate(10deg)" }} />
              <FaEthereum style={{ position: "absolute", top: "35%", right: "-5%", fontSize: 140, color: "#627eea", opacity: 0.05, transform: "rotate(15deg)" }} />
              <FaCoins style={{ position: "absolute", bottom: "5%", right: "10%", fontSize: 100, color: "#ff6600", opacity: 0.08, transform: "rotate(-15deg)" }} />
            </div>

            <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
              <FaTimes size={14} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ display:"inline-block", background:"rgba(255,85,0,0.1)", color:"#ff5500", fontSize:10, fontWeight:900, padding:"6px 16px", borderRadius:50, textTransform:"uppercase", letterSpacing:2, marginBottom:16, border: "1px solid rgba(255,85,0,0.2)" }}>Investment Vault</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase", color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                Staking Engine
              </h2>
            </div>

            {step === 0 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>How It Works</h3>
                
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, marginBottom: 24, backdropFilter: "blur(10px)" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 24px 0", textAlign: "center" }}>
                    Lock your TOKING tokens in our secure smart contract protocol to earn competitive yields benchmarked against leading DeFi platforms.
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff5500" }}><FaClock size={16} /></div>
                      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Flexible lock-up periods up to 365 days</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff5500" }}><FaBolt size={16} /></div>
                      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Automatic reward distribution every 24 hours</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff5500" }}><FaChartLine size={16} /></div>
                      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Compound earnings for maximum returns</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff5500" }}><FaShieldAlt size={16} /></div>
                      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Secure withdrawal anytime after lock-up</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(1)}
                  style={{ 
                    width: "100%", padding: "16px 24px", 
                    background: "linear-gradient(135deg,#ff5500,#ff8800)", 
                    border: "none", borderRadius: 16, color: "#000", 
                    fontWeight: 900, fontSize: 14, cursor: "pointer",
                    textTransform: "uppercase", letterSpacing: 1.5,
                    boxShadow: "0 10px 25px rgba(255, 85, 0, 0.4)",
                    transition: "all 0.3s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                  }}
                >
                  Proceed to Setup <span>&rarr;</span>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Select Staking Duration</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30 }}>
                  {tiers.map((t) => {
                    const isSelected = selectedTier === t.days;
                    return (
                      <div 
                        key={t.days} 
                        onClick={() => setSelectedTier(t.days)} 
                        style={{
                          background: isSelected 
                            ? "linear-gradient(135deg, rgba(255,85,0,0.1), rgba(255,136,0,0.05))" 
                            : "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                          border: isSelected 
                            ? "2px solid #ff5500" 
                            : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 20, 
                          padding: "20px 16px", 
                          cursor: "pointer", 
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: isSelected 
                            ? "0 10px 30px rgba(255,85,0,0.2), inset 0 0 15px rgba(255,85,0,0.1)" 
                            : "0 4px 15px rgba(0,0,0,0.2)",
                          transform: isSelected ? "translateY(-4px) scale(1.02)" : "none",
                          position: "relative", 
                          overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255,85,0,0.4)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))";
                          }
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: "absolute", top: -1, right: -1, background: "#ff5500", color: "#000", padding: "6px 10px", borderBottomLeftRadius: 16, fontSize: 12, fontWeight: 900 }}>
                            <FaCheckCircle />
                          </div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 900, color: isSelected ? "#ff5500" : "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{t.badge}</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
                          {t.days} <span style={{fontSize: 14, opacity: 0.6, fontWeight: 600}}>Days</span>
                        </div>
                        <div style={{ fontSize: 13, color: isSelected ? "#ff5500" : "#ffaa00", fontWeight: 900 }}>UP TO {t.max}% APY</div>
                        
                        <div style={{ 
                          position: "absolute", bottom: -20, right: -20, fontSize: 80, opacity: isSelected ? 0.05 : 0.02, color: "#fff",
                          transform: isSelected ? "scale(1.1) rotate(-10deg)" : "rotate(-15deg)", transition: "all 0.5s ease"
                        }}>
                          <FaCoins />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}>Back</button>
                    <button 
                      disabled={!selectedTier}
                      onClick={() => setStep(2)}
                      style={{ 
                        flex: 2, padding: 16, 
                        background: selectedTier ? "linear-gradient(135deg,#ff5500,#ff8800)" : "rgba(255,255,255,0.03)", 
                        border: selectedTier ? "none" : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 16, color: selectedTier ? "#000" : "rgba(255,255,255,0.2)", 
                        fontWeight: 900, fontSize: 14, cursor: selectedTier ? "pointer" : "not-allowed",
                        transition: "all 0.3s ease", 
                        boxShadow: selectedTier ? "0 10px 25px rgba(255, 85, 0, 0.4)" : "none",
                        textTransform: "uppercase", letterSpacing: 1
                      }}
                    >
                      CONTINUE {selectedTier && <span>&rarr;</span>}
                    </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Stake Amount</h3>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    className="no-spinner"
                    style={{ 
                      width: "100%", background: "rgba(0,0,0,0.5)", 
                      border: "1px solid rgba(255,85,0,0.3)", borderRadius: 16, 
                      padding: "16px 20px", color: "#fff", fontSize: 22, fontWeight: 900, outline: "none",
                      transition: "0.2s", boxShadow: "inset 0 0 10px rgba(255,85,0,0.05)"
                    }}
                  />
                  <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "#ff5500", fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>USDT</span>
                </div>

                {/* TSC Conversion Display */}
                <motion.div 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{ 
                    background: "rgba(255,85,0,0.05)", border: "1px solid rgba(255,85,0,0.1)", borderRadius: 16, padding: "12px 16px", marginBottom: 24,
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>TOKEN VALUE</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                      {amount ? (parseFloat(amount) / TSC_PRICE).toLocaleString() : "0"} <span style={{color: "#ff5500", fontSize: 12}}>TSC</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>RATE: $0.01</div>
                  </div>
                </motion.div>
                
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Lock Duration</span>
                    <span style={{ color: "#fff", fontWeight: 800 }}>{tier?.days} Days</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Estimated Profit</span>
                    <span style={{ color: "#ff5500", fontWeight: 800 }}>+{(parseFloat(amount || 0) * (tier?.max || 0) / 100 * (tier?.days || 0) / 365).toFixed(2)} USDT</span>
                  </div>
                </div>
    
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}>Back</button>
                  <button 
                    onClick={handleStake}
                    disabled={isStaking || !amount}
                    style={{ 
                      flex: 2, padding: 16, 
                      background: "linear-gradient(135deg,#ff5500,#ff8800)", 
                      border: "none", borderRadius: 16, color: "#000", 
                      fontWeight: 900, fontSize: 14, cursor: "pointer",
                      boxShadow: "0 10px 25px rgba(255, 85, 0, 0.4)",
                      textTransform: "uppercase", letterSpacing: 1
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
