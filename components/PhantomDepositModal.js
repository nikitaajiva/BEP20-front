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

      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com";

      const connection = new Connection(rpcUrl, "confirmed");

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-3 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-[420px] my-6 overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-[#0a0a0a] relative"
        style={{ boxShadow: "0 10px 40px rgba(212,175,55,0.12)" }}
      >
        {/* Header */}
        <div className="relative border-b border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 to-transparent p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                <Wallet size={22} />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-lg sm:text-xl font-bold tracking-wide text-white" style={{ margin: 0, paddingBottom: "2px" }}>Deposit SOL</h2>
                <p className="text-[11px] sm:text-xs text-[#d4af37]/70 leading-tight" style={{ margin: 0 }}>
                  Choose a deposit method securely
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white mt-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          
          <div className="mb-5 rounded-2xl border border-white/10 bg-[#111] p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50" style={{ margin: "0 0 8px 0" }}>
              Amount
            </label>
            <div className="relative">
              <input
                disabled={isInputDisabled || isLockedAmount}
                value={amount}
                onChange={(e) => {
                  if (!isLockedAmount) setAmount(e.target.value);
                }}
                type="number"
                min="0"
                step="0.000001"
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-black py-3.5 pl-4 pr-14 text-lg font-bold text-white outline-none transition-all focus:border-[#d4af37]/60 focus:bg-[#0f0f0f] disabled:opacity-50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#d4af37]">
                SOL
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("qr")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-4 text-center transition-all ${
                method === "qr"
                  ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                  : "border-white/10 bg-[#111] text-white/50 hover:bg-white/5 hover:text-white"
              }`}
              style={method === "qr" ? { boxShadow: "0 0 15px rgba(212,175,55,0.15)" } : {}}
            >
              <QrCode size={24} className="mb-2 mx-auto" />
              <div className="text-sm font-bold w-full" style={{ margin: 0 }}>QR Deposit</div>
              <div className="text-[10px] sm:text-[11px] opacity-70 w-full mt-1 leading-tight" style={{ margin: "4px 0 0 0" }}>Scan with mobile</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("phantom")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-4 text-center transition-all ${
                method === "phantom"
                  ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                  : "border-white/10 bg-[#111] text-white/50 hover:bg-white/5 hover:text-white"
              }`}
              style={method === "phantom" ? { boxShadow: "0 0 15px rgba(212,175,55,0.15)" } : {}}
            >
              <Wallet size={24} className="mb-2 mx-auto" />
              <div className="text-sm font-bold w-full" style={{ margin: 0 }}>Pay Direct</div>
              <div className="text-[10px] sm:text-[11px] opacity-70 w-full mt-1 leading-tight" style={{ margin: "4px 0 0 0" }}>Phantom extension</div>
            </button>
          </div>

          {method === "qr" && (
            <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {!intent || ["failed", "expired"].includes(intent.status) ? (
                <div className="rounded-3xl border border-white/5 bg-[#111] p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10">
                    <QrCode size={28} className="text-[#d4af37]" />
                  </div>
                  <h3 className="text-lg font-bold text-white" style={{ margin: "0 0 8px 0" }}>QR Deposit</h3>
                  <p className="text-xs text-white/50 leading-relaxed max-w-[250px] mx-auto" style={{ margin: "0 0 20px 0" }}>
                    Scan with Phantom mobile wallet. We will detect the deposit automatically.
                  </p>
                  <button
                    type="button"
                    onClick={handleQrDeposit}
                    disabled={loading || !isAmountValid}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3.5 text-[15px] font-bold text-black transition-all hover:bg-[#ffdf6b] disabled:opacity-50"
                  >
                    {loading ? (
                      <><RefreshCw size={18} className="animate-spin" /> Generating...</>
                    ) : (
                      <><QrCode size={18} /> Generate QR Code</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#d4af37]/10 to-transparent p-5 sm:p-6 flex flex-col items-center relative">
                  <div className="mb-5 rounded-full border border-[#d4af37]/40 bg-[#0a0a0a] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                    Send exactly {intent.amountSol} SOL
                  </div>
                  
                  {qrDataUrl && (
                    <div className="mx-auto mb-5 w-max rounded-xl bg-white p-2.5" style={{ boxShadow: "0 8px 25px rgba(0,0,0,0.5)" }}>
                      <img
                        src={qrDataUrl}
                        alt="Solana deposit QR"
                        className="h-44 w-44 rounded-lg block"
                      />
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3.5">
                      <div className="text-[10px] uppercase font-bold text-white/40" style={{ margin: "0 0 4px 0" }}>Receiving Address</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-mono text-white/90 truncate block">
                          {intent.merchantWalletAddress}
                        </span>
                        <button 
                          onClick={() => handleCopy(intent.merchantWalletAddress, 'address')}
                          className="flex-shrink-0 text-[#d4af37] hover:text-white transition-colors bg-[#d4af37]/10 p-1.5 rounded-md"
                          title="Copy Address"
                        >
                          {copied === 'address' ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {solanaPayUrl && (
                      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3.5 flex justify-between items-center">
                         <span className="text-[13px] font-medium text-white/70">Solana Pay Link</span>
                         <button 
                          onClick={() => handleCopy(solanaPayUrl, 'link')}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:text-white transition-colors bg-[#d4af37]/10 px-2.5 py-1.5 rounded-md"
                        >
                          {copied === 'link' ? <><CheckCircle2 size={14} className="text-green-400"/> Copied</> : <><Copy size={14}/> Copy Link</>}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 w-full flex flex-col items-center">
                    {intent.status === "confirmed" ? (
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-3.5 text-sm font-bold text-green-400">
                        <CheckCircle2 size={18} />
                        Payment confirmed!
                      </div>
                    ) : (
                      <div className="flex flex-col w-full gap-3">
                        <div className="flex flex-col items-center bg-[#111] w-full rounded-xl py-3 border border-white/5">
                          <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-[#d4af37]">
                            <RefreshCw size={14} className="animate-spin" />
                            Waiting for payment...
                          </div>
                          {timeLeft !== null && (
                            <div className="text-[11px] text-white/40 mt-1 font-mono">
                              Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3.5">
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/40">
                            Already paid? Paste Tx Hash
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={manualSignature}
                              onChange={(e) => setManualSignature(e.target.value)}
                              placeholder="Paste Solana transaction hash"
                              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]/50"
                            />
                            <button
                              type="button"
                              onClick={handleSubmitManualSignature}
                              disabled={checking || !manualSignature.trim()}
                              className="flex flex-shrink-0 items-center justify-center rounded-lg bg-[#d4af37] px-3 py-2 text-[11px] font-bold text-black transition-colors hover:bg-[#ffdf6b] disabled:opacity-50"
                            >
                              {checking ? "Verifying..." : "Verify Payment"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {method === "phantom" && (
            <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-3xl border border-white/5 bg-[#111] p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10">
                  <Wallet size={28} className="text-[#d4af37]" />
                </div>
                <h3 className="text-lg font-bold text-white" style={{ margin: "0 0 8px 0" }}>Pay with Phantom</h3>
                <p className="text-xs text-white/50 max-w-[250px] mx-auto leading-relaxed" style={{ margin: "0 0 20px 0" }}>
                  Pay directly from your connected Phantom wallet extension.
                </p>

                <button
                  type="button"
                  onClick={handlePayWithPhantom}
                  disabled={paying || loading || !isAmountValid || (intent && intent.status === 'confirmed')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3.5 text-[15px] font-bold text-black transition-all hover:bg-[#ffdf6b] disabled:opacity-50"
                  style={!(paying || loading || !isAmountValid) ? { boxShadow: "0 4px 15px rgba(212,175,55,0.3)" } : {}}
                >
                  {paying || loading ? (
                    <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                  ) : intent?.status === 'confirmed' ? (
                    <><CheckCircle2 size={18} className="text-green-700" /> Confirmed</>
                  ) : (
                    <><Wallet size={18} /> Pay {amount || "0.00"} SOL</>
                  )}
                </button>

                {/* Status messages for Phantom */}
                {intent?.status === "submitted" && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#d4af37]">
                    <RefreshCw size={14} className="animate-spin" /> Confirming on blockchain...
                  </div>
                )}
                {intent?.status === "created" && paying && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#d4af37]">
                    <RefreshCw size={14} className="animate-spin" /> Waiting for wallet approval...
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-[13px] font-medium text-red-300 text-center">
              {error}
            </div>
          )}

          {successMessage && method === "phantom" && (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-[13px] font-medium text-green-400 text-center">
              {successMessage}
            </div>
          )}


        </div>
      </div>
      
      {/* Scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}} />
    </div>
  );
};

export default PhantomDepositModal;
