"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Operation Successful",
  message = "Your request has been processed securely on-chain.",
  transactionHash,
}) {
  const isEvm = transactionHash?.startsWith("0x");
  const explorerLink = isEvm 
    ? `https://bscscan.com/tx/${transactionHash}`
    : `https://solscan.io/tx/${transactionHash}`;

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(15px)" }}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ 
          width: "100%", maxWidth: 420, background: "rgba(15, 15, 15, 0.95)", 
          border: "1px solid rgba(255,215,0,0.2)", borderRadius: 24, 
          position: "relative", zIndex: 1, padding: 32, textAlign: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.03)"
        }}
      >
        <div style={{ 
          width: 80, height: 80, background: "rgba(0, 255, 136, 0.1)", 
          borderRadius: "50%", display: "flex", alignItems: "center", 
          justifyContent: "center", margin: "0 auto 24px",
          border: "1px solid rgba(0, 255, 136, 0.2)",
          boxShadow: "0 0 30px rgba(0, 255, 136, 0.15)"
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          >
            <FaCheckCircle size={40} color="#00ff88" />
          </motion.div>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>{title}</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24, padding: "0 20px" }}>{message}</p>

        {transactionHash && (
          <div style={{ 
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: 12, padding: 12, marginBottom: 24, wordBreak: "break-all" 
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase" }}>Transaction Hash</div>
            <a 
              href={explorerLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#ffd700", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {transactionHash.slice(0, 20)}...{transactionHash.slice(-10)}
              <FaExternalLinkAlt size={10} />
            </a>
          </div>
        )}

        <button 
          onClick={onClose}
          style={{ 
            width: "100%", padding: 14, background: "linear-gradient(135deg, #ffd700, #ff8c00)", 
            border: "none", borderRadius: 12, color: "#000", fontWeight: 800, 
            fontSize: 14, cursor: "pointer", transition: "0.2s",
            boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)"
          }}
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
