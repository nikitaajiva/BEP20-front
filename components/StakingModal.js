"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCoins, FaBitcoin, FaEthereum, FaClock, FaShieldAlt, FaBolt, FaChartLine, FaCheckCircle, FaQrcode, FaCopy, FaSpinner, FaWallet } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "./SuccessModal";
import QRCode from "qrcode";

const tiers = [
  { days: 30,  min: 5,  max: 10, badge: "Starter",  color: "#ff8c00", description: "Perfect for first-time stakers." },
  { days: 90,  min: 11, max: 12, badge: "Growth",   color: "#ff6600", description: "Balance between flexibility and yield." },
  { days: 180, min: 19, max: 22, badge: "Advanced", color: "#ff4500", description: "Maximum yield for committed investors." },
  { days: 365, min: 23, max: 28, badge: "Premium",  color: "#e63200", description: "Top-tier APY with maximum compounding." },
];

export default function StakingModal({ isOpen, onClose, ledgerDetails }) {
  const { user, stakeTokens, API_URL } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState(null);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState("");
  const [activationError, setActivationError] = useState("");

  // SOL/USDT Conversion
  const [solRate, setSolRate] = useState(null);
  const [solRateLoading, setSolRateLoading] = useState(false);
  const [remainingUsdt, setRemainingUsdt] = useState(0);
  const [remainingSol, setRemainingSol] = useState(0);

  // Inline Deposit Intent & Polling State
  const [intent, setIntent] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [solanaPayUrl, setSolanaPayUrl] = useState("");
  const [loadingQr, setLoadingQr] = useState(false);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualSignature, setManualSignature] = useState("");
  const [verifyingSignature, setVerifyingSignature] = useState(false);
  const [manualError, setManualError] = useState("");

  const pollTimerRef = useRef(null);

  const tier = tiers.find((t) => t.days === selectedTier);
  const TSC_PRICE = 0.01;

  // Fetch live SOL/USDT rate from CoinGecko
  const fetchSolRate = useCallback(async () => {
    if (solRate !== null) return solRate;
    setSolRateLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        { cache: "no-store" }
      );
      const data = await res.json();
      const rate = data?.solana?.usd;
      if (rate && rate > 0) {
        setSolRate(rate);
        return rate;
      }
    } catch (e) {
      console.warn("Could not fetch SOL rate:", e);
    } finally {
      setSolRateLoading(false);
    }
    setSolRate(150);
    return 150;
  }, [solRate]);

  // Process actual Staking activation
  const processStaking = useCallback(async () => {
    setIsStaking(true);
    setActivationError("");
    try {
      const parsedAmount = parseFloat(amount);
      const result = await stakeTokens({
        amount: parsedAmount,
        days: selectedTier,
        tscAmount: parsedAmount / TSC_PRICE,
        tokenAmount: parsedAmount / TSC_PRICE,
        ratePct: tier?.max
      });

      if (result.success) {
        if (result.txHash) setSuccessTxHash(result.txHash);
        else if (result.transactionHash) setSuccessTxHash(result.transactionHash);
        setShowSuccess(true);
      } else {
        setActivationError(result.error || "Staking failed. Please try again.");
      }
    } catch (err) {
      console.error("Staking failed:", err);
      setActivationError(err.message || "Staking failed.");
    } finally {
      setIsStaking(false);
    }
  }, [amount, selectedTier, tier, stakeTokens]);

  // Start polling deposit status
  const startPolling = useCallback((intentId) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setPolling(true);
    pollTimerRef.current = setInterval(async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const apiBase = API_URL;
        const res = await fetch(`${apiBase}/phantom-deposits/status/${intentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.intent) {
          if (data.intent.status === "confirmed") {
            clearInterval(pollTimerRef.current);
            setPolling(false);
            await processStaking();
          } else if (["failed", "expired"].includes(data.intent.status)) {
            clearInterval(pollTimerRef.current);
            setPolling(false);
            setActivationError("The deposit payment failed or expired.");
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 4000);
  }, [processStaking, API_URL]);

  // Create intent & generate QR inline
  const handleGenerateQr = async () => {
    setLoadingQr(true);
    setActivationError("");
    setManualError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const apiBase = API_URL;
      const response = await fetch(`${apiBase}/phantom-deposits/intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: remainingSol,
          paymentMethod: "qr"
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create deposit intent.");
      }
      setIntent(data.intent);
      setSolanaPayUrl(data.solanaPayUrl);
      const qr = await QRCode.toDataURL(data.solanaPayUrl, {
        margin: 1,
        width: 200
      });
      setQrDataUrl(qr);
      startPolling(data.intent.id);
    } catch (e) {
      console.error(e);
      setActivationError(e.message || "Unable to generate Solana Pay QR code.");
    } finally {
      setLoadingQr(false);
    }
  };

  // Manual transaction confirmation fallback
  const handleVerifyManual = async () => {
    if (!manualSignature.trim()) {
      setManualError("Please enter transaction signature.");
      return;
    }
    setVerifyingSignature(true);
    setManualError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const apiBase = API_URL;
      const response = await fetch(`${apiBase}/phantom-deposits/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          intentId: intent.id,
          txSignature: manualSignature.trim()
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Verification failed. Check signature/hash.");
      }
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setPolling(false);
      await processStaking();
    } catch (e) {
      setManualError(e.message || "Verification failed. Please try again.");
    } finally {
      setVerifyingSignature(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Triggered when user submits staking amount
  const handleStakeClick = async () => {
    const parsedAmount = parseFloat(amount);
    if (!selectedTier || isNaN(parsedAmount) || parsedAmount <= 0) {
      setActivationError("Please enter a valid staking amount.");
      return;
    }
    setActivationError("");

    const currentBalanceSol = parseFloat(ledgerDetails?.solWallet?.balance || "0");
    const rate = await fetchSolRate();

    // Convert required USDT to SOL equivalent
    const requiredSol = parsedAmount / rate;
    const shortfallSol = requiredSol - currentBalanceSol;

    if (shortfallSol > 0.000001) {
      // Need top-up first
      const shortfallUsdt = shortfallSol * rate;
      setRemainingUsdt(parseFloat(shortfallUsdt.toFixed(2)));
      setRemainingSol(parseFloat(shortfallSol.toFixed(6)));
      setStep(3); // Shift to top-up step
      return;
    }

    // Sufficient balance — proceed instantly
    await processStaking();
  };

  // Clean state on open/close
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setSelectedTier(null);
      setAmount("");
      setIsStaking(false);
      setShowSuccess(false);
      setSuccessTxHash("");
      setActivationError("");
      setRemainingUsdt(0);
      setRemainingSol(0);
      setIntent(null);
      setQrDataUrl("");
      setSolanaPayUrl("");
      setPolling(false);
      setManualSignature("");
      setManualError("");
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentBalanceSol = parseFloat(ledgerDetails?.solWallet?.balance || "0");

  return (
    <>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => window.location.reload()}
        title="Staking Confirmed"
        message={`Successfully staked ${amount} USDT for ${tier?.days} days. Your yield engine is now active.`}
        transactionHash={successTxHash}
      />
      
      {!showSuccess && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ 
              width: "100%", maxWidth: 480, background: "#08080a", 
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)",
              backgroundSize: "15px 15px, 100% 4px",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: "24px 20px",
              boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
            }}
          >
            {/* Top Glow */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "radial-gradient(circle at 50% -20%, rgba(255,85,0,0.2), transparent 70%)", zIndex: -1, pointerEvents: "none" }} />

            {/* Background Coins Decoration */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden" }}>
              <FaBitcoin style={{ position: "absolute", top: "5%", left: "-2%", fontSize: 100, color: "#ff8c00", opacity: 0.05, transform: "rotate(-20deg)" }} />
              <FaCoins style={{ position: "absolute", bottom: "10%", left: "-5%", fontSize: 120, color: "#ffd700", opacity: 0.03, transform: "rotate(10deg)" }} />
              <FaEthereum style={{ position: "absolute", top: "35%", right: "-5%", fontSize: 110, color: "#627eea", opacity: 0.03, transform: "rotate(15deg)" }} />
              <FaCoins style={{ position: "absolute", bottom: "5%", right: "10%", fontSize: 80, color: "#ff6600", opacity: 0.05, transform: "rotate(-15deg)" }} />
            </div>

            <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
              <FaTimes size={12} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ display:"inline-block", background:"rgba(255,85,0,0.1)", color:"#ff5500", fontSize:9, fontWeight:900, padding:"4px 12px", borderRadius:50, textTransform:"uppercase", letterSpacing:2, marginBottom:10, border: "1px solid rgba(255,85,0,0.2)" }}>Investment Vault</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase", color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>Staking Engine</h2>
            </div>

            {/* STEP 0: How It Works */}
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

            {/* STEP 1: Select Staking Duration */}
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
                          transform: isSelected ? "scale(1.1) rotate(-10deg)" : "rotate(-15deg)"
                        }}>
                          <FaCoins />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Back</button>
                  <button 
                    disabled={!selectedTier}
                    onClick={() => setStep(2)}
                    style={{ 
                      flex: 2, padding: 16, 
                      background: selectedTier ? "linear-gradient(135deg,#ff5500,#ff8800)" : "rgba(255,255,255,0.03)", 
                      border: selectedTier ? "none" : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 16, color: selectedTier ? "#000" : "rgba(255,255,255,0.2)", 
                      fontWeight: 900, fontSize: 14, cursor: selectedTier ? "pointer" : "not-allowed",
                      boxShadow: selectedTier ? "0 10px 25px rgba(255, 85, 0, 0.4)" : "none",
                      textTransform: "uppercase", letterSpacing: 1
                    }}
                  >
                    CONTINUE {selectedTier && <span>&rarr;</span>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Input Staking Amount */}
            {step === 2 && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Stake Amount</h3>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (activationError) setActivationError("");
                    }}
                    autoFocus
                    className="no-spinner"
                    style={{ 
                      width: "100%", background: "rgba(0,0,0,0.5)", 
                      border: "1px solid rgba(255,85,0,0.3)", borderRadius: 16, 
                      padding: "16px 20px", color: "#fff", fontSize: 22, fontWeight: 900, outline: "none",
                      boxShadow: "inset 0 0 10px rgba(255,85,0,0.05)"
                    }}
                  />
                  <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "#ff5500", fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>USDT</span>
                </div>

                {/* TSC Conversion Display */}
                <motion.div 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{ 
                    background: "rgba(255,85,0,0.05)", border: "1px solid rgba(255,85,0,0.1)", borderRadius: 16, padding: "12px 16px", marginBottom: 16,
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

                {/* Current Wallet Balance */}
                <div style={{ background: "rgba(255,85,0,0.05)", border: "1px solid rgba(255,85,0,0.15)", borderRadius: 16, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <FaWallet color="#ff5500" size={14} />
                  <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    Wallet Balance: <strong style={{ color: "#ff5500" }}>{currentBalanceSol.toFixed(6)} SOL</strong>
                    {solRate ? <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>≈ ${(currentBalanceSol * solRate).toFixed(2)} USDT</span> : null}
                  </div>
                </div>
                
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

                {activationError && (
                  <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#ff6b6b" }}>
                    {activationError}
                  </div>
                )}
    
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { setStep(1); setActivationError(""); }} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Back</button>
                  <button 
                    onClick={handleStakeClick}
                    disabled={isStaking || !amount || solRateLoading}
                    style={{ 
                      flex: 2, padding: 16, 
                      background: "linear-gradient(135deg,#ff5500,#ff8800)", 
                      border: "none", borderRadius: 16, color: "#000", 
                      fontWeight: 900, fontSize: 14, cursor: isStaking || !amount || solRateLoading ? "not-allowed" : "pointer",
                      boxShadow: "0 10px 25px rgba(255, 85, 0, 0.4)",
                      textTransform: "uppercase", letterSpacing: 1,
                      opacity: isStaking || !amount || solRateLoading ? 0.7 : 1
                    }}
                  >
                    {isStaking ? "Processing..." : solRateLoading ? "Checking Rate..." : `Confirm Stake`}
                  </button>
                </div>
              </motion.div>
            )}            {/* STEP 3: Top-up via Inline Solana Pay QR */}
            {step === 3 && remainingSol > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>Top-Up Required</h3>

                {/* Balance breakdown card */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,85,0,0.2)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                      <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Current Wallet</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#4ade80" }}>{currentBalanceSol.toFixed(6)} SOL</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>≈ ${(currentBalanceSol * (solRate || 150)).toFixed(2)}</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,85,0,0.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Remaining Shortfall</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#ff5500" }}>{remainingSol} SOL</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>≈ ${remainingUsdt}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, margin: "0", textAlign: "center" }}>
                    Pay exactly <strong style={{ color: "#ff5500" }}>{remainingSol} SOL</strong> to proceed.
                  </p>
                </div>

                {/* QR Code Presentation */}
                {!qrDataUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifycontent: "center", padding: "10px 0" }}>
                    {activationError && (
                      <div style={{ width: "100%", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 11, color: "#ff6b6b", textAlign: "center" }}>
                        {activationError}
                      </div>
                    )}
                    <button
                      onClick={handleGenerateQr}
                      disabled={loadingQr}
                      style={{ width: "100%", padding: "12px 20px", background: "linear-gradient(135deg,#ff5500,#ff8800)", border: "none", borderRadius: 12, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5, boxShadow: "0 8px 20px rgba(255,85,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
                    >
                      {loadingQr ? (
                        <>
                          <FaSpinner className="animate-spin" size={14} />
                          Generating Solana QR...
                        </>
                      ) : (
                        <>
                          <FaQrcode size={14} />
                          Generate QR — Pay {remainingSol} SOL
                        </>
                      )}
                    </button>
                    <button onClick={() => { setStep(2); setActivationError(""); }} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Back</button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ position: "relative", padding: 8, background: "#fff", borderRadius: 16, boxShadow: "0 8px 25px rgba(0,0,0,0.5)", marginBottom: 12 }}>
                      <img src={qrDataUrl} alt="Solana Pay QR" style={{ width: 135, height: 135, display: "block" }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, color: "#ff5500", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
                      <FaSpinner className="animate-spin" size={10} />
                      Waiting for payment detection...
                    </div>

                    {/* Merchant Address Copy Details */}
                    {intent?.merchantWalletAddress && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 10px", width: "100%", maxWidth: 360, marginBottom: 14, cursor: "pointer" }} onClick={() => handleCopy(intent.merchantWalletAddress)}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 800 }}>To:</span>
                        <span style={{ fontSize: 10, color: "#fff", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{intent.merchantWalletAddress}</span>
                        <button style={{ background: "none", border: "none", color: copied ? "#4ade80" : "#ff5500", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          {copied ? <span style={{ fontSize: 8, fontWeight: 800 }}>COPIED!</span> : <FaCopy size={10} />}
                        </button>
                      </div>
                    )}

                    {/* Manual Hash Fallback Verification */}
                    <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>
                        Paid but not detected? Verify manually:
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Paste transaction signature / hash..."
                          value={manualSignature}
                          onChange={(e) => {
                            setManualSignature(e.target.value);
                            if (manualError) setManualError("");
                          }}
                          style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 11, outline: "none" }}
                        />
                        <button
                          onClick={handleVerifyManual}
                          disabled={verifyingSignature || !manualSignature.trim()}
                          style={{ padding: "8px 14px", background: "#ff5500", color: "#000", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: verifyingSignature ? "not-allowed" : "pointer" }}
                        >
                          {verifyingSignature ? <FaSpinner className="animate-spin" size={12} /> : "Verify"}
                        </button>
                      </div>
                      {manualError && (
                        <div style={{ color: "#ff6b6b", fontSize: 10, marginTop: 4, textAlign: "center", fontWeight: 600 }}>
                          {manualError}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                        setIntent(null);
                        setQrDataUrl("");
                        setSolanaPayUrl("");
                        setPolling(false);
                        setManualSignature("");
                        setManualError("");
                      }}
                      style={{ width: "100%", padding: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                    >
                      Cancel Deposit &amp; Back
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
