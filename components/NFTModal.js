"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaHorse, FaCheckCircle, FaLock, FaExternalLinkAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

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
        window.location.reload();
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          width: "100%", maxWidth: 650, background: "#0a0a0a", border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 32, position: "relative", overflow: "hidden", zIndex: 1, padding: 32,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>
          <FaTimes size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display:"inline-block", background:"rgba(255,215,0,0.1)", color:"#ffd700", fontSize:10, fontWeight:800, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Asset Acquisition</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Horse NFT Tiers
          </h2>
        </div>

        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {packages.map((p) => (
              <div key={p.id} onClick={() => setSelected(p.id)} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: 20, textAlign: "center", cursor: "pointer", transition: "0.2s"
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.tier}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{p.priceLabel}</div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: pkg.gradient, borderRadius: 24, padding: 24, marginBottom: 24, color: "#000" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7 }}>SELECTED PACKAGE</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{pkg.tier} Tier NFT</div>
                </div>
                <span style={{ fontSize: 40 }}>{pkg.icon}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "rgba(0,0,0,0.1)", padding: 12, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800 }}>EST. ROI</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{pkg.roi}</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.1)", padding: 12, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800 }}>BONUS TOKENS</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{pkg.tokens}</div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#888" }}>
                <FaLock color="#ffd700" />
                <span>Legally backed fractional ownership documented on-chain.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: 16, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Back</button>
              <button 
                onClick={handleActivate}
                disabled={isActivating}
                style={{ flex: 2, padding: 16, background: pkg.gradient, border: "none", borderRadius: 14, color: "#000", fontWeight: 900, cursor: "pointer" }}
              >
                {isActivating ? "Processing..." : `Confirm — ${pkg.priceLabel}`}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
