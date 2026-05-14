"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHorse, FaCheckCircle, FaLock, FaExternalLinkAlt, FaClipboardCheck, FaMoneyBillWave, FaGift, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "./SuccessModal";

const packages = [
  {
    id: "starter", tier: "Bronze", price: 500, priceLabel: "$500 USDT",
    icon: "🥉", color: "#cd7f32", gradient: "linear-gradient(135deg,#cd7f32,#a0522d)",
    roi: "15%", tokens: "5,000"
  },
  {
    id: "growth", tier: "Silver", price: 1000, priceLabel: "$1,000 USDT",
    icon: "🥈", color: "#c0c0c0", gradient: "linear-gradient(135deg,#c0c0c0,#808080)",
    roi: "25%", tokens: "12,000"
  },
  {
    id: "premium", tier: "Gold", price: 5000, priceLabel: "$5,000 USDT",
    icon: "🥇", color: "#ffd700", gradient: "linear-gradient(135deg,#ffd700,#ff8c00)",
    roi: "35%", tokens: "75,000"
  },
];

export default function NFTModal({ isOpen, onClose }) {
  const { user, purchaseNft } = useAuth();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pkg = packages.find(p => p.id === selected);

  const handleActivate = async () => {
    if (!selected) return;
    setIsActivating(true);
    try {
      const result = await purchaseNft({ tier: selected });
      
      if (result.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Activation failed", err);
    } finally {
      setIsActivating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <SuccessModal 
        isOpen={isSuccess} 
        onClose={() => window.location.reload()}
        title="Asset Acquired"
        message={`Successfully purchased the ${pkg?.tier} Horse NFT package. Your asset is now live.`}
      />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
      />
      
      {!isSuccess && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{ 
            width: "100%", maxWidth: 640, background: "#08080a", 
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)",
            backgroundSize: "15px 15px, 100% 4px",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: "35px 30px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
          }}
        >
          {/* Top Glow */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250, background: "radial-gradient(circle at 50% -20%, rgba(255, 184, 0, 0.2), transparent 70%)", zIndex: -1, pointerEvents: "none" }}></div>

          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
            <FaTimes size={14} />
          </button>

          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ display:"inline-block", background:"rgba(255,184,0,0.1)", color:"#FFB800", fontSize:10, fontWeight:900, padding:"6px 16px", borderRadius:50, textTransform:"uppercase", letterSpacing:2, marginBottom:16, border: "1px solid rgba(255,184,0,0.2)" }}>Asset Acquisition</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase", color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              Horse NFT Tiers
            </h2>
          </div>

          {step === 0 && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>How It Works</h3>
              
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, marginBottom: 24, backdropFilter: "blur(10px)" }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 24px 0", textAlign: "center" }}>
                  Acquire fractional interests in real, registered horses. Each NFT is backed by legal ownership documentation and professional management agreements.
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800" }}><FaClipboardCheck size={16} /></div>
                    <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Registration & Veterinary records included</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800" }}><FaMoneyBillWave size={16} /></div>
                    <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Quarterly/Monthly/Weekly dividend payments</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800" }}><FaGift size={16} /></div>
                    <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Exclusive Airdrops & Event Invitations</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800" }}><FaShieldAlt size={16} /></div>
                    <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Fully secured and insured assets</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(1)}
                style={{ 
                  width: "100%", padding: "16px 24px", 
                  background: "linear-gradient(135deg,#FFB800,#FF6200)", 
                  border: "none", borderRadius: 16, color: "#000", 
                  fontWeight: 900, fontSize: 14, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: 1.5,
                  boxShadow: "0 10px 25px rgba(255, 184, 0, 0.4)",
                  transition: "all 0.3s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                }}
              >
                Proceed to Packages <span>&rarr;</span>
              </button>
            </motion.div>
          )}

          {step === 1 && !selected && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Select NFT Package</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
                {packages.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelected(p.id)} 
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20, padding: "24px 16px", textAlign: "center", cursor: "pointer", 
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      position: "relative", overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = p.color;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = `0 10px 30px ${p.color}30, inset 0 0 15px ${p.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                      <div style={{ background: `linear-gradient(135deg, ${p.color}33, ${p.color}11)`, padding: 12, borderRadius: 16, border: `1px solid ${p.color}44` }}>
                        <FaHorse color={p.color} size={32} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: p.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{p.tier}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{p.priceLabel}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>EST YIELD: <span style={{color: p.color}}>{p.roi}</span></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(0)} style={{ width: "100%", padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}>Back</button>
            </motion.div>
          )}

          {step === 1 && selected && pkg && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Confirm Selection</h3>
              
              <div style={{ 
                background: "rgba(255,255,255,0.02)", borderRadius: 20, padding: 24, marginBottom: 24,
                border: `1px solid ${pkg.color}40`, position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: `radial-gradient(circle at top right, ${pkg.color}22, transparent 60%)`, pointerEvents: "none" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: pkg.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{pkg.tier} Asset</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{pkg.priceLabel}</div>
                  </div>
                  <div style={{ background: `linear-gradient(135deg, ${pkg.color}33, ${pkg.color}11)`, padding: 16, borderRadius: 20, border: `1px solid ${pkg.color}44` }}>
                    <FaHorse color={pkg.color} size={40} />
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>ESTIMATED YIELD</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: pkg.color }}>{pkg.roi}</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>BONUS ASSETS</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{pkg.tokens}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  <FaLock color={pkg.color} size={14} />
                  <span>On-chain ownership documentation secured.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}>Back</button>
                <button 
                  onClick={handleActivate}
                  disabled={isActivating}
                  style={{ 
                    flex: 2, padding: 16, 
                    background: pkg.gradient, 
                    border: "none", borderRadius: 16, color: "#000", 
                    fontWeight: 900, fontSize: 14, cursor: "pointer",
                    boxShadow: `0 10px 25px ${pkg.color}40`,
                    textTransform: "uppercase", letterSpacing: 1
                  }}
                >
                  {isActivating ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
