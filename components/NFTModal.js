"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaHorse, FaLock, FaClipboardCheck, FaMoneyBillWave, FaGift, FaShieldAlt, FaWallet, FaQrcode, FaCopy, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "./SuccessModal";
import QRCode from "qrcode";

// Packages loaded dynamically on mount with local hardcoded items as fallback

export default function NFTModal({ isOpen, onClose, ledgerDetails }) {
  const { user, purchaseNft, API_URL } = useAuth();
  const [packages, setPackages] = useState([
    {
      id: "starter", tierCode: "starter", tier: "Bronze", price: 500, priceLabel: "$500 USDT",
      icon: "🥉", color: "#cd7f32", gradient: "linear-gradient(135deg,#cd7f32,#a0522d)",
      roi: "15%", tokens: "5,000", benefits: []
    },
    {
      id: "growth", tierCode: "growth", tier: "Silver", price: 1000, priceLabel: "$1,000 USDT",
      icon: "🥈", color: "#c0c0c0", gradient: "linear-gradient(135deg,#c0c0c0,#808080)",
      roi: "25%", tokens: "12,000", benefits: []
    },
    {
      id: "premium", tierCode: "premium", tier: "Gold", price: 5000, priceLabel: "$5,000 USDT",
      icon: "🥇", color: "#ffd700", gradient: "linear-gradient(135deg,#ffd700,#ff8c00)",
      roi: "35%", tokens: "75,000", benefits: []
    },
  ]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activationError, setActivationError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchPackages = async () => {
      setLoadingPackages(true);
      try {
        const { getHorseNftPackages } = await import("../services/horseNftApi");
        const res = await getHorseNftPackages();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(pkg => {
            let tier = "Bronze";
            let color = "#cd7f32";
            let gradient = "linear-gradient(135deg,#cd7f32,#a0522d)";
            let icon = "🥉";

            const code = (pkg.tierCode || "").toLowerCase();
            if (code === "growth" || code === "silver") {
              tier = "Silver";
              color = "#c0c0c0";
              gradient = "linear-gradient(135deg,#c0c0c0,#808080)";
              icon = "🥈";
            } else if (code === "premium" || code === "gold") {
              tier = "Gold";
              color = "#ffd700";
              gradient = "linear-gradient(135deg,#ffd700,#ff8c00)";
              icon = "🥇";
            }

            return {
              id: pkg.tierCode,
              tierCode: pkg.tierCode,
              tier,
              price: pkg.priceUSDT,
              priceLabel: `$${pkg.priceUSDT.toLocaleString()} USDT`,
              icon,
              color,
              gradient,
              roi: `${pkg.annualRoiPercent}%`,
              tokens: pkg.bonusTokens ? pkg.bonusTokens.toLocaleString() : "0",
              benefits: pkg.benefits || [],
              displayName: pkg.displayName || pkg.tierName || tier,
              dividendFrequency: pkg.dividendFrequency,
            };
          });
          setPackages(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic Horse NFT packages, using static fallback", err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, [isOpen]);

  // SOL/USDT conversion
  const [solRate, setSolRate] = useState(null);         // SOL price in USDT
  const [solRateLoading, setSolRateLoading] = useState(false);
  const [remainingUsdt, setRemainingUsdt] = useState(0);  // USDT shortfall
  const [remainingSol, setRemainingSol] = useState(0);    // SOL needed for QR

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

  const TSC_PRICE = 0.01;
  const pkg = packages.find(p => p.id === selected);
  const tscAmount = pkg ? (pkg.price / TSC_PRICE).toLocaleString() : "0";

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
    // fallback hardcoded rate
    setSolRate(150);
    return 150;
  }, [solRate]);

  // Process actual NFT activation
  const processPurchase = useCallback(async () => {
    setIsActivating(true);
    setActivationError("");
    try {
      const result = await purchaseNft({
        tier: selected,
        tscAmount: pkg ? pkg.price / TSC_PRICE : 0,
      });
      if (result.success) {
        if (result.txHash) setSuccessTxHash(result.txHash);
        else if (result.transactionHash) setSuccessTxHash(result.transactionHash);
        setIsSuccess(true);
      } else {
        setActivationError(result.error || "Purchase failed. Please try again.");
      }
    } catch (err) {
      console.error("Activation failed", err);
      setActivationError(err.message || "Purchase failed.");
    } finally {
      setIsActivating(false);
    }
  }, [selected, pkg, purchaseNft]);

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
            await processPurchase();
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
  }, [processPurchase]);

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
      await processPurchase();
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

  // Called when user taps "Confirm Purchase"
  const handleActivate = useCallback(async () => {
    if (!selected || !pkg) return;
    setActivationError("");
    setIsActivating(true);
    try {
      const { purchaseHorseNft } = await import("../services/horseNftApi");
      const res = await purchaseHorseNft(pkg.tierCode);
      if (res.success) {
        const isPending = res.data?.paymentStatus === "PENDING" || res.data?.status === "PENDING_PAYMENT";
        const msg = isPending 
          ? "Purchase request created. Payment confirmation required."
          : "Horse NFT activated successfully.";
        setSuccessMsg(msg);
        setSuccessTxHash(res.data?.paymentReference || res.data?.id || "");
        setIsSuccess(true);
      } else {
        setActivationError(res.message || "Purchase failed. Please try again.");
      }
    } catch (err) {
      console.error("Purchase failed", err);
      setActivationError(err.message || "Purchase failed.");
    } finally {
      setIsActivating(false);
    }
  }, [selected, pkg]);

  // Reset on close or cleanup
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setSelected(null);
      setIsActivating(false);
      setIsSuccess(false);
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
      setSuccessMsg("");
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
        isOpen={isSuccess}
        onClose={() => window.location.reload()}
        title="Asset Acquired"
        message={successMsg || `Successfully purchased the ${pkg?.tier} Horse NFT package. Your asset is now live.`}
        transactionHash={successTxHash}
      />

      {!isSuccess && (
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
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "15px 15px",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 24, position: "relative", overflow: "hidden", zIndex: 1, padding: "24px 20px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
          }}
        >
          {/* Top Glow */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "radial-gradient(circle at 50% -20%, rgba(255,184,0,0.2), transparent 70%)", zIndex: -1, pointerEvents: "none" }} />

          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
            <FaTimes size={12} />
          </button>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-block", background: "rgba(255,184,0,0.1)", color: "#FFB800", fontSize: 9, fontWeight: 900, padding: "4px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, border: "1px solid rgba(255,184,0,0.2)" }}>Asset Acquisition</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase", color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>Horse NFT Tiers</h2>
          </div>

          {/* STEP 0: How It Works */}
          {step === 0 && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>How It Works</h3>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, marginBottom: 24, backdropFilter: "blur(10px)" }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 24px 0", textAlign: "center" }}>
                  Acquire fractional interests in real, registered horses. Each NFT is backed by legal ownership documentation and professional management agreements.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { icon: <FaClipboardCheck size={16} />, text: "Registration & Veterinary records included" },
                    { icon: <FaMoneyBillWave size={16} />, text: "Quarterly/Monthly/Weekly dividend payments" },
                    { icon: <FaGift size={16} />, text: "Exclusive Airdrops & Event Invitations" },
                    { icon: <FaShieldAlt size={16} />, text: "Fully secured and insured assets" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800" }}>{item.icon}</div>
                      <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(1)} style={{ width: "100%", padding: "16px 24px", background: "linear-gradient(135deg,#FFB800,#FF6200)", border: "none", borderRadius: 16, color: "#000", fontWeight: 900, fontSize: 14, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5, boxShadow: "0 10px 25px rgba(255,184,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                Proceed to Packages <span>&rarr;</span>
              </button>
            </motion.div>
          )}

          {/* STEP 1a: Select Package */}
          {step === 1 && !selected && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Select NFT Package</h3>
              {loadingPackages ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160, marginBottom: 30 }}>
                  <FaSpinner className="animate-spin" size={24} color="#FFB800" />
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
                  {packages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${p.color}30, inset 0 0 15px ${p.color}15`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                        <div style={{ background: `linear-gradient(135deg,${p.color}33,${p.color}11)`, padding: 12, borderRadius: 16, border: `1px solid ${p.color}44` }}>
                          <FaHorse color={p.color} size={32} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: p.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{p.tier}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{p.priceLabel}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>EST YIELD: <span style={{ color: p.color }}>{p.roi}</span></div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(0)} style={{ width: "100%", padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Back</button>
            </motion.div>
          )}

          {/* STEP 1b: Confirm Selection */}
          {step === 1 && selected && pkg && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Confirm Selection</h3>

              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 20, padding: 24, marginBottom: 16, border: `1px solid ${pkg.color}40`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: `radial-gradient(circle at top right,${pkg.color}22,transparent 60%)`, pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: pkg.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{pkg.tier} Asset</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{pkg.priceLabel}</div>
                  </div>
                  <div style={{ background: `linear-gradient(135deg,${pkg.color}33,${pkg.color}11)`, padding: 16, borderRadius: 20, border: `1px solid ${pkg.color}44` }}>
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

              {/* Current Wallet Balance */}
              <div style={{ background: "rgba(255,184,0,0.05)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: 16, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <FaWallet color="#FFB800" size={14} />
                <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  USDT Balance: <strong style={{ color: "#FFB800" }}>{parseFloat(ledgerDetails?.bnbWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
                </div>
              </div>

              {/* Token Equivalence */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ background: "linear-gradient(135deg,rgba(255,184,0,0.1),rgba(255,98,0,0.05))", border: "1px solid rgba(255,184,0,0.2)", borderRadius: 20, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "inset 0 0 20px rgba(255,184,0,0.05)" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#FFB800", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Token Equivalence</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>{tscAmount} <span style={{ color: "#FFB800", fontSize: 14 }}>TSC</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>EXCHANGE RATE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>1 TSC = $0.01</div>
                </div>
              </motion.div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  <FaLock color={pkg.color} size={14} />
                  <span>On-chain ownership documentation secured.</span>
                </div>
              </div>

              {activationError && (
                <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#ff6b6b" }}>
                  {activationError}
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => { setSelected(null); setActivationError(""); }} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Back</button>
                <button
                  onClick={handleActivate}
                  disabled={isActivating || solRateLoading}
                  style={{ flex: 2, padding: 16, background: pkg.gradient, border: "none", borderRadius: 16, color: "#000", fontWeight: 900, fontSize: 14, cursor: isActivating || solRateLoading ? "not-allowed" : "pointer", boxShadow: `0 10px 25px ${pkg.color}40`, textTransform: "uppercase", letterSpacing: 1, opacity: isActivating || solRateLoading ? 0.7 : 1 }}
                >
                  {isActivating ? "Processing..." : solRateLoading ? "Checking Rate..." : "Confirm Purchase"}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Insufficient Balance — Top-up via Inline Solana Pay QR */}
          {step === 2 && remainingSol > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h3 style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>Top-Up Required</h3>

              {/* Balance breakdown card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Current Wallet</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#4ade80" }}>{currentBalanceSol.toFixed(6)} SOL</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>≈ ${(currentBalanceSol * (solRate || 150)).toFixed(2)}</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,184,0,0.2)", textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Remaining Shortfall</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#FFB800" }}>{remainingSol} SOL</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>≈ ${remainingUsdt}</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, margin: "0", textAlign: "center" }}>
                  Pay exactly <strong style={{ color: "#FFB800" }}>{remainingSol} SOL</strong> to proceed.
                </p>
              </div>

              {/* QR Code Presentation */}
              {!qrDataUrl ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
                  {activationError && (
                    <div style={{ width: "100%", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 11, color: "#ff6b6b", textAlign: "center" }}>
                      {activationError}
                    </div>
                  )}
                  <button
                    onClick={handleGenerateQr}
                    disabled={loadingQr}
                    style={{ width: "100%", padding: "12px 20px", background: "linear-gradient(135deg,#FFB800,#FF6200)", border: "none", borderRadius: 12, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5, boxShadow: "0 8px 20px rgba(255,184,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
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
                  <button onClick={() => { setStep(1); setActivationError(""); }} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Back</button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "relative", padding: 8, background: "#fff", borderRadius: 16, boxShadow: "0 8px 25px rgba(0,0,0,0.5)", marginBottom: 12 }}>
                    <img src={qrDataUrl} alt="Solana Pay QR" style={{ width: 135, height: 135, display: "block" }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, color: "#FFB800", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
                    <FaSpinner className="animate-spin" size={10} />
                    Waiting for payment detection...
                  </div>

                  {/* Merchant Address Copy Details */}
                  {intent?.merchantWalletAddress && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 10px", width: "100%", maxWidth: 360, marginBottom: 14, cursor: "pointer" }} onClick={() => handleCopy(intent.merchantWalletAddress)}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 800 }}>To:</span>
                      <span style={{ fontSize: 10, color: "#fff", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{intent.merchantWalletAddress}</span>
                      <button style={{ background: "none", border: "none", color: copied ? "#4ade80" : "#FFB800", cursor: "pointer", display: "flex", alignItems: "center" }}>
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
                        style={{ padding: "8px 14px", background: "#FFB800", color: "#000", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: verifyingSignature ? "not-allowed" : "pointer" }}
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
