"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHorse, FaCheckCircle, FaLock, FaExternalLinkAlt } from "react-icons/fa";
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
  const { user, setUser, API_URL } = useAuth();
  const [selected, setSelected] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pkg = packages.find(p => p.id === selected);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ nftPackage: selected })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          width: "100%", maxWidth: 580, background: "rgba(10, 10, 10, 0.85)", 
          backdropFilter: "blur(20px)", border: "1px solid rgba(255,215,0,0.15)",
          borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: 28,
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.05)", border: "none", color: "#888", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}>
          <FaTimes size={14} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display:"inline-block", background:"rgba(255,215,0,0.08)", color:"#ffd700", fontSize:9, fontWeight:800, padding:"3px 10px", borderRadius:12, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, border: "1px solid rgba(255,215,0,0.2)" }}>Asset Acquisition</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#fff,#ffd700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Horse NFT Tiers
          </h2>
        </div>

        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            {packages.map((p) => (
              <div key={p.id} onClick={() => setSelected(p.id)} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "20px 10px", textAlign: "center", cursor: "pointer", transition: "all 0.3s ease"
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: p.color, marginBottom: 2, textTransform: "uppercase" }}>{p.tier}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{p.priceLabel}</div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ 
              background: pkg.gradient, borderRadius: 20, padding: 20, marginBottom: 20, color: "#000",
              boxShadow: `0 10px 30px ${pkg.color}30`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.6, textTransform: "uppercase" }}>Selected Asset</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{pkg.tier} Tier Horse</div>
                </div>
                <span style={{ fontSize: 32 }}>{pkg.icon}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(0,0,0,0.08)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.6 }}>EST. YIELD</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{pkg.roi}</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.08)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.6 }}>BONUS ASSETS</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{pkg.tokens}</div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                <FaLock color="#ffd700" size={10} />
                <span>On-chain ownership documentation secured.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>Back</button>
              <button 
                onClick={handleActivate}
                disabled={isActivating}
                style={{ 
                  flex: 2, padding: 14, 
                  background: pkg.gradient, 
                  border: "none", borderRadius: 12, color: "#000", 
                  fontWeight: 900, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 4px 15px ${pkg.color}40`
                }}
              >
                {isActivating ? "Activating..." : `Confirm Purchase`}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <SuccessModal 
        isOpen={isSuccess} 
        onClose={() => window.location.reload()}
        title="NFT Activated"
        message={`Successfully acquired and activated your ${pkg?.tier} Tier Horse NFT. Your asset is now live.`}
      />
    </div>
  );
}
