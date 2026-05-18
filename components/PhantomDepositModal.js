"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { 
  Wallet, 
  QrCode, 
  X, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

const getPhantomProvider = () => {
  if (typeof window === "undefined") return null;
  const provider = window.phantom?.solana || window.solana;
  return provider?.isPhantom ? provider : null;
};

const readJsonSafely = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Invalid server response.",
    };
  }
};

const PhantomDepositModal = ({
  isOpen,
  onClose,
  API_URL,
  user,
  onDepositConfirmed,
  initialAmount = "",
  isLockedAmount = false,
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [method, setMethod] = useState("qr"); // "qr" or "phantom"
  const [intent, setIntent] = useState(null);
  const [solanaPayUrl, setSolanaPayUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [manualSignature, setManualSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [qrPolling, setQrPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const pollingTimerRef = useRef(null);
  const pollingAttemptsRef = useRef(0);

  const stopQrPolling = () => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setQrPolling(false);
  };

  useEffect(() => {
    return () => stopQrPolling();
  }, []);

  const walletAddress = user?.phantomWalletAddress || "";

  const isAmountValid = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0;
  }, [amount]);

  useEffect(() => {
    if (!isOpen) {
      setAmount(initialAmount);
      setMethod("qr");
      setIntent(null);
      setSolanaPayUrl("");
      setQrDataUrl("");
      setManualSignature("");
      setLoading(false);
      setPaying(false);
      setChecking(false);
      setError("");
      setSuccessMessage("");
      setTimeLeft(null);
      setShowAdvanced(false);
    } else {
      setAmount(initialAmount);
    }
  }, [isOpen, initialAmount]);

  useEffect(() => {
    if (intent && intent.status !== "confirmed" && intent.status !== "failed" && !paying && !loading) {
      setIntent(null);
      setQrDataUrl("");
      setSolanaPayUrl("");
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      setQrPolling(false);
    }
    setError("");
    setSuccessMessage("");
  }, [amount]);

  useEffect(() => {
    if (!intent?.expiresAt || intent.status === "confirmed" || intent.status === "failed" || intent.status === "expired") {
      setTimeLeft(null);
      return;
    }
    
    const calculateTimeLeft = () => {
      const diff = new Date(intent.expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const t = calculateTimeLeft();
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timer);
        if (intent.status === "created" || intent.status === "submitted") {
           setIntent(prev => prev ? {...prev, status: "expired"} : null);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [intent?.expiresAt, intent?.status]);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const checkDepositStatus = async (intentId) => {
    const token = getToken();

    if (!token || !intentId) return null;

    const response = await fetch(`${API_URL}/phantom-deposits/status/${intentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonSafely(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to check payment status.");
    }

    return data.intent;
  };

  const scheduleNextPoll = (intentId) => {
    pollingAttemptsRef.current += 1;

    const delayMs =
      pollingAttemptsRef.current <= 12
        ? 10000
        : 20000;

    pollingTimerRef.current = setTimeout(() => {
      pollQrStatus(intentId);
    }, delayMs);
  };

  const pollQrStatus = async (intentId) => {
    try {
      if (!intentId) return;

      const statusIntent = await checkDepositStatus(intentId);

      if (statusIntent) {
        setIntent((prev) => ({
          ...(prev || {}),
          ...statusIntent,
        }));

        if (statusIntent.status === "confirmed") {
          stopQrPolling();
          setSuccessMessage("Payment confirmed successfully.");
          onDepositConfirmed?.({
            success: true,
            intent: statusIntent,
          });
          return;
        }

        if (["failed", "expired"].includes(statusIntent.status)) {
          stopQrPolling();
          setError(
            statusIntent.status === "expired"
              ? "This payment request expired. Please create a new request."
              : "Payment failed. Please try again."
          );
          return;
        }
      }

      scheduleNextPoll(intentId);
    } catch (error) {
      console.error("QR payment polling error:", error);
      scheduleNextPoll(intentId);
    }
  };

  const startQrStatusPolling = (intentId) => {
    stopQrPolling();
    pollingAttemptsRef.current = 0;
    setQrPolling(true);
    scheduleNextPoll(intentId);
  };

  const createIntent = async (paymentMethod) => {
    if (!walletAddress) {
      setError("Please connect Phantom wallet first.");
      return null;
    }

    if (!isAmountValid) {
      setError("Please enter a valid SOL amount.");
      return null;
    }

    const token = getToken();

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return null;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/phantom-deposits/intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethod,
        }),
      });

      const data = await readJsonSafely(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create deposit request.");
      }

      setIntent(data.intent);
      setSolanaPayUrl(data.solanaPayUrl || "");

      if (paymentMethod === "qr" && data.solanaPayUrl) {
        const qr = await QRCode.toDataURL(data.solanaPayUrl, {
          margin: 1,
          width: 240,
        });
        setQrDataUrl(qr);
      }

      return data.intent;
    } catch (err) {
      setError(err.message || "Unable to create deposit request.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmDeposit = async (intentId, txSignature) => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(`${API_URL}/phantom-deposits/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intentId,
        txSignature,
      }),
    });

    const data = await readJsonSafely(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to confirm deposit.");
    }

    setSuccessMessage("Payment confirmed successfully.");
    
    stopQrPolling();

    setIntent((prev) => ({
      ...(prev || {}),
      ...(data.intent || {}),
    }));

    onDepositConfirmed?.(data);

    setTimeout(() => {
      onClose?.();
    }, 1500);

    return data;
  };

  const handleQrDeposit = async () => {
    const activeIntent = await createIntent("qr");

    if (activeIntent?.id) {
      startQrStatusPolling(activeIntent.id);
    }
  };

  const handleSubmitManualSignature = async () => {
    if (!intent?.id) {
      setError("Please generate a deposit request first or ensure one is active.");
      return;
    }

    if (!manualSignature.trim()) {
      setError("Please enter transaction signature.");
      return;
    }

    setChecking(true);
    setError("");
    setSuccessMessage("");

    try {
      await confirmDeposit(intent.id, manualSignature.trim());
    } catch (err) {
      setError(err.message || "Unable to confirm deposit.");
    } finally {
      setChecking(false);
    }
  };

  const handlePayWithPhantom = async () => {
    if (paying || loading || (intent && intent.status === 'confirmed')) return;

    setPaying(true);
    setError("");
    setSuccessMessage("");

    try {
      let activeIntent = intent;
      if (!activeIntent || ["failed", "expired"].includes(activeIntent.status)) {
        activeIntent = await createIntent("extension");
      }

      if (!activeIntent) return;

      const provider = getPhantomProvider();

      if (!provider) {
        throw new Error("Phantom Wallet is not available.");
      }

      if (!provider.publicKey) {
        await provider.connect({ onlyIfTrusted: false });
      }

      const fromPublicKey = provider.publicKey;

      if (!fromPublicKey) {
        throw new Error("Unable to read Phantom wallet public key.");
      }

      if (fromPublicKey.toBase58() !== walletAddress) {
        throw new Error("Connected Phantom wallet does not match your app wallet.");
      }

      const rpcEndpoints = [
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        "https://rpc.ankr.com/solana",
        "https://solana.public-rpc.com",
        "https://solana-api.projectserum.com",
        "https://api.mainnet-beta.solana.com",
        "https://api.mainnet.solana.com"
      ].filter(Boolean);

      let connection = null;
      let latestBlockhash = null;
      let rpcError = null;

      for (const endpoint of rpcEndpoints) {
        try {
          console.log("Trying Solana RPC endpoint:", endpoint);
          const conn = new Connection(endpoint, "confirmed");
          const blockhash = await conn.getLatestBlockhash("confirmed");
          if (blockhash?.blockhash) {
            connection = conn;
            latestBlockhash = blockhash;
            break;
          }
        } catch (err) {
          console.warn(`Failed to connect to RPC endpoint ${endpoint}:`, err);
          rpcError = err;
        }
      }

      if (!connection || !latestBlockhash) {
        throw new Error(`RPC Connection Failed: ${rpcError?.message || rpcError?.toString() || "Access Forbidden"}. Node list: ${rpcEndpoints.join(" | ")}`);
      }

      const transaction = new Transaction({
        feePayer: fromPublicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: new PublicKey(activeIntent.merchantWalletAddress),
          lamports: Number(activeIntent.amountLamports),
        })
      );

      const signedResult = await provider.signAndSendTransaction(transaction);

      const signature = signedResult?.signature || signedResult;

      if (!signature) {
        throw new Error("No transaction signature returned from Phantom.");
      }
      
      setIntent((prev) => prev ? { ...prev, status: "submitted", txSignature: signature } : null);

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      await confirmDeposit(activeIntent.id, signature);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleClose = () => {
    stopQrPolling();
    onClose?.();
  };

  const isInputDisabled = (!!intent && !["failed", "expired"].includes(intent.status)) || paying || loading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-3 backdrop-blur-xl overflow-y-auto">
      <div 
        className="premium-deposit-modal w-full max-w-[430px] my-6 overflow-hidden rounded-[28px] border border-white/5 bg-[#08080a] relative"
        style={{ 
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(255, 184, 0, 0.05)",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      >
        {/* Top Glow Ray */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180, background: "radial-gradient(circle at 50% -20%, rgba(255, 184, 0, 0.15), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        {/* Header */}
        <div 
          className="relative z-10 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent px-5"
          style={{
            paddingTop: "36px",
            paddingBottom: "16px"
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div 
                className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full border text-[#FFB800]"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 184, 0, 0.15) 0%, rgba(255, 98, 0, 0.08) 100%)",
                  borderColor: "rgba(255, 184, 0, 0.25)"
                }}
              >
                <Wallet size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-[11px] font-black uppercase tracking-wider text-white" style={{ margin: 0, paddingBottom: "1px" }}>Deposit SOL</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#aaa]/80" style={{ margin: 0 }}>
                  Choose a deposit method securely
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="phantom-close-btn"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 relative z-10 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          
          {/* Amount input & Method selector section (Only visible when no active payment intent) */}
          {(!intent || ["failed", "expired"].includes(intent.status)) && (
            <>
              {/* Amount input section (No outer border, just clean label and input below) */}
              <div className="mb-4">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#FFB800]" style={{ margin: "0 0 8px 4px" }}>
                  Amount
                </label>
                <div className="relative">
                  <input
                disabled={isInputDisabled || isLockedAmount}
                    value={amount}
                 onChange={(e) => {
                  if (!isLockedAmount) setAmount(e.target.value);
                }}                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="0.00"
                    className="phantom-amount-input w-full py-3.5 pl-4 pr-14 text-lg font-extrabold text-white outline-none disabled:opacity-50"
                    style={{
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)"
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#FFB800]" style={{ textShadow: "0 0 10px rgba(255, 184, 0, 0.4)" }}>
                    SOL
                  </div>
                </div>
              </div>

              {/* Methods selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("qr");
                    if (isAmountValid) {
                      handleQrDeposit();
                    } else {
                      setError("Please enter a valid SOL amount first.");
                    }
                  }}
                  className={`phantom-method-btn flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 transform active:scale-95 ${
                    method === "qr" ? "active-method" : ""
                  }`}
                  style={{
                    background: method === "qr" ? "linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(255, 98, 0, 0.06) 100%)" : "",
                    boxShadow: method === "qr" ? "0 8px 25px rgba(255, 184, 0, 0.1)" : "",
                    fontWeight: 800,
                    borderRadius: "16px"
                  }}
                >
                  <QrCode size={22} className="mb-2 mx-auto" style={{ filter: method === "qr" ? "drop-shadow(0 0 5px rgba(255, 184, 0, 0.4))" : "" }} />
                  <div className="text-[13px] font-extrabold uppercase tracking-wider w-full" style={{ margin: 0 }}>QR Deposit</div>
                  <div className="text-[10px] opacity-75 font-semibold w-full mt-1 leading-tight" style={{ margin: "4px 0 0 0" }}>Scan with mobile</div>
                </button>

                 <button
                  type="button"
                  onClick={() => {
                    setMethod("phantom");
                    if (isAmountValid) {
                      handlePayWithPhantom();
                    } else {
                      setError("Please enter a valid SOL amount first.");
                    }
                  }}
                  className={`phantom-method-btn flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 transform active:scale-95 ${
                    method === "phantom" ? "active-method" : ""
                  }`}
                  style={{
                    background: method === "phantom" ? "linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(255, 98, 0, 0.06) 100%)" : "",
                    boxShadow: method === "phantom" ? "0 8px 25px rgba(255, 184, 0, 0.1)" : "",
                    fontWeight: 800,
                    borderRadius: "16px"
                  }}
                >
                  <Wallet size={22} className="mb-2 mx-auto" style={{ filter: method === "phantom" ? "drop-shadow(0 0 5px rgba(255, 184, 0, 0.4))" : "" }} />
                  <div className="text-[13px] font-extrabold uppercase tracking-wider w-full" style={{ margin: 0 }}>Pay Direct</div>
                  <div className="text-[10px] opacity-75 font-semibold w-full mt-1 leading-tight" style={{ margin: "4px 0 0 0" }}>Phantom extension</div>
                </button>
              </div>
            </>
          )}

          {/* QR Method details */}
          {method === "qr" && intent && !["failed", "expired"].includes(intent.status) && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center w-full px-1">
                  <div 
                    className="rounded-full px-4 py-1.5 text-[10.5px] font-black uppercase tracking-widest text-[#FFB800]"
                    style={{
                      backgroundColor: "#08080a",
                      border: "1px solid rgba(255, 184, 0, 0.25)",
                      boxShadow: "0 0 15px rgba(255, 184, 0, 0.1)",
                      marginBottom: "16px"
                    }}
                  >
                    Send exactly {intent.amountSol} SOL
                  </div>
                  
                  {qrDataUrl && (
                    <div 
                      className="w-max bg-white p-2.5 rounded-xl" 
                      style={{ 
                        boxShadow: "0 8px 24px rgba(255, 184, 0, 0.15)",
                        border: "1.5px solid #FFB800",
                        margin: "0 auto 24px auto"
                      }}
                    >
                      <img
                        src={qrDataUrl}
                        alt="Solana deposit QR"
                        className="h-38 w-38 rounded-lg block"
                      />
                    </div>
                  )}

                  <div className="w-full" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div 
                      className="rounded-xl bg-[#0c0c10] p-3.5"
                      style={{ border: "1px solid rgba(255, 255, 255, 0.06)" }}
                    >
                      <div className="phantom-field-label">Receiving Address</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-mono text-white/95 truncate block">
                          {intent.merchantWalletAddress}
                        </span>
                        <button 
                          onClick={() => handleCopy(intent.merchantWalletAddress, 'address')}
                          className="phantom-raw-icon-btn"
                          title="Copy Address"
                        >
                          {copied === 'address' ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {solanaPayUrl && (
                      <div 
                        className="rounded-xl bg-[#0c0c10] p-3.5"
                        style={{ border: "1px solid rgba(255, 255, 255, 0.06)" }}
                      >
                        <div className="phantom-field-label">Solana Pay Link</div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12px] font-mono text-white/95 truncate block">
                            {solanaPayUrl}
                          </span>
                          <button 
                            onClick={() => handleCopy(solanaPayUrl, 'link')}
                            className="phantom-raw-icon-btn"
                            title="Copy Link"
                          >
                            {copied === 'link' ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full flex flex-col items-center" style={{ marginTop: "24px" }}>
                    {intent.status === "confirmed" ? (
                      <div 
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500/5 py-3.5 text-xs font-bold text-green-400 uppercase tracking-widest"
                        style={{ border: "1px solid rgba(34, 197, 94, 0.15)" }}
                      >
                        <CheckCircle2 size={16} />
                        Payment confirmed!
                      </div>
                    ) : (
                      <div className="w-full" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div 
                          className="flex flex-col items-center bg-white/[0.01] w-full rounded-xl py-3"
                          style={{ border: "1px solid rgba(255, 255, 255, 0.06)" }}
                        >
                          <div className="flex items-center justify-center gap-2 text-[12px] font-extrabold uppercase tracking-widest text-[#FFB800]">
                            <RefreshCw size={13} className="animate-spin" />
                            Waiting for payment...
                          </div>
                          {timeLeft !== null && (
                            <div className="text-[10px] text-[#aaa] mt-1 font-mono">
                              Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>

                        <div 
                          className="rounded-xl bg-[#0c0c10] p-3.5"
                          style={{ border: "1px solid rgba(255, 255, 255, 0.06)" }}
                        >
                          <label className="phantom-field-label">Already paid? Paste Tx Hash</label>
                          <div className="flex gap-2">
                            <input
                              value={manualSignature}
                              onChange={(e) => setManualSignature(e.target.value)}
                              placeholder="Solana transaction signature"
                              className="w-full rounded-lg bg-white/[0.01] px-3 py-2 text-xs text-white outline-none focus:border-[#FFB800]/50"
                              style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
                            />
                            <button
                              type="button"
                              onClick={handleSubmitManualSignature}
                              disabled={checking || !manualSignature.trim()}
                              className="phantom-secondary-action-btn"
                            >
                              {checking ? <RefreshCw size={12} className="animate-spin" /> : "Verify"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Phantom Method details */}
          {method === "phantom" && intent?.status === "confirmed" && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center w-full px-1">
              <div 
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500/5 py-3.5 text-xs font-bold text-green-400 uppercase tracking-widest"
                style={{ border: "1px solid rgba(34, 197, 94, 0.15)" }}
              >
                <CheckCircle2 size={16} />
                Payment confirmed!
              </div>
            </div>
          )}

          {((loading && method === "qr") || (paying && method === "phantom")) && (
            <div className="mt-4 flex flex-col items-center justify-center py-6 w-full text-xs font-extrabold uppercase tracking-widest text-[#FFB800] bg-[#0c0c10]/40 rounded-2xl" style={{ border: "1px solid rgba(255, 184, 0, 0.08)" }}>
              <RefreshCw size={18} className="animate-spin mb-2" />
              {method === "qr" ? "Generating QR Code..." : (intent?.status === "submitted" ? "Confirming on blockchain..." : "Waiting for wallet approval...")}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs font-bold uppercase tracking-wider text-red-400 text-center">
              {error}
            </div>
          )}

          {successMessage && method === "phantom" && (
            <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-3.5 text-xs font-bold uppercase tracking-wider text-green-400 text-center">
              {successMessage}
            </div>
          )}

          {/* Bottom spacer to prevent hugging the bottom edge */}
          <div className="h-4 w-full flex-shrink-0" />

        </div>
      </div>
      
      {/* Scrollbar & Specific Styles to override global button resets */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 184, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 184, 0, 0.4);
        }

        /* Direct overrides to defeat any global stylesheet / Bootstrap button styles */
        .premium-deposit-modal .phantom-close-btn {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #aaa !important;
          cursor: pointer !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          outline: none !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        .premium-deposit-modal .phantom-close-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
          color: #fff !important;
        }

        .premium-deposit-modal .phantom-method-btn {
          border-radius: 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          background: rgba(255, 255, 255, 0.01) !important;
          color: #aaa !important;
          box-shadow: none !important;
          outline: none !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }
        .premium-deposit-modal .phantom-method-btn:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          color: #fff !important;
        }
        .premium-deposit-modal .phantom-method-btn.active-method {
          border-color: #FFB800 !important;
          color: #FFB800 !important;
          background: linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(255, 98, 0, 0.06) 100%) !important;
          box-shadow: 0 8px 25px rgba(255, 184, 0, 0.15) !important;
        }

        body .premium-deposit-modal .phantom-primary-action-btn {
          position: relative !important;
          bottom: auto !important;
          left: auto !important;
          right: auto !important;
          margin: 0 !important;
          border-radius: 12px !important;
          outline: none !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 15px 22px !important;
          width: 100% !important;
          font-family: inherit !important;
          font-size: 15px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          transition: all 0.3s ease !important;
          box-sizing: border-box !important;
        }
        body .premium-deposit-modal .phantom-primary-action-btn:not(:disabled) {
          background: linear-gradient(135deg, #FFB800 0%, #FF6200 100%) !important;
          color: #000000 !important;
          box-shadow: 0 8px 25px rgba(255, 184, 0, 0.35) !important;
          cursor: pointer !important;
          border: none !important;
        }
        body .premium-deposit-modal .phantom-primary-action-btn:disabled {
          background: rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
          opacity: 1 !important;
        }

        body .premium-deposit-modal .phantom-secondary-action-btn {
          background: linear-gradient(135deg, #FFB800 0%, #FF6200 100%) !important;
          color: #000000 !important;
          cursor: pointer !important;
          border-radius: 8px !important;
          outline: none !important;
          border: none !important;
          position: relative !important;
          top: auto !important;
          right: auto !important;
          margin: 0 !important;
          padding: 8px 16px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: auto !important;
          height: auto !important;
          font-family: inherit !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          box-shadow: 0 4px 15px rgba(255, 184, 0, 0.2) !important;
          transition: all 0.3s ease !important;
        }
        body .premium-deposit-modal .phantom-secondary-action-btn:disabled {
          background: rgba(255, 255, 255, 0.04) !important;
          color: rgba(255, 255, 255, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }

        body .premium-deposit-modal .phantom-copy-btn {
          background: rgba(255, 184, 0, 0.08) !important;
          border: 1px solid rgba(255, 184, 0, 0.15) !important;
          color: #FFB800 !important;
          cursor: pointer !important;
          position: relative !important;
          top: auto !important;
          right: auto !important;
          margin: 0 !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          width: auto !important;
          height: auto !important;
          font-family: inherit !important;
          font-size: 11px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          box-shadow: none !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }
        body .premium-deposit-modal .phantom-copy-btn:hover {
          background: rgba(255, 184, 0, 0.18) !important;
          border-color: rgba(255, 184, 0, 0.3) !important;
          color: #fff !important;
        }

        body .premium-deposit-modal .phantom-raw-icon-btn {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 6px !important;
          margin: 0 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #FFB800 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          border-radius: 0 !important;
          width: auto !important;
          height: auto !important;
        }
        body .premium-deposit-modal .phantom-raw-icon-btn:hover {
          color: #ffffff !important;
          transform: scale(1.15) !important;
          background: transparent !important;
          border: none !important;
        }
        body .premium-deposit-modal .phantom-raw-icon-btn:active {
          transform: scale(0.95) !important;
        }

        body .premium-deposit-modal .phantom-field-label {
          display: block !important;
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          transform: none !important;
          margin-top: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          margin-bottom: 10px !important;
          padding: 0 !important;
          font-family: inherit !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          color: rgba(170, 170, 170, 0.6) !important;
          line-height: 1.2 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }


        .premium-deposit-modal .phantom-amount-input {
          padding-left: 18px !important;
          padding-right: 56px !important;
          padding-top: 14px !important;
          padding-bottom: 14px !important;
          border-radius: 12px !important;
          background-color: #0c0c10 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
          font-family: 'Outfit', 'Inter', sans-serif !important;
          outline: none !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.8) !important;
          font-size: 18px !important;
          font-weight: 800 !important;
          transition: all 0.3s ease !important;
        }
        .premium-deposit-modal .phantom-amount-input:focus {
          border-color: rgba(255, 184, 0, 0.5) !important;
          background-color: rgba(12, 12, 16, 0.8) !important;
        }

        /* Hide native spinner buttons on number inputs for Chrome, Safari, Edge, Opera */
        .premium-deposit-modal .phantom-amount-input::-webkit-outer-spin-button,
        .premium-deposit-modal .phantom-amount-input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }

        /* Hide native spinner buttons on number inputs for Firefox */
        .premium-deposit-modal input[type=number].phantom-amount-input {
          -moz-appearance: textfield !important;
        }
      `}} />
    </div>
  );
};

export default PhantomDepositModal;
