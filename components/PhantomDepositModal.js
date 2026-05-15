"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Wallet, QrCode, X, RefreshCw } from "lucide-react";

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
}) => {
  const [amount, setAmount] = useState("");
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
  const pollingTimerRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  const walletAddress = user?.phantomWalletAddress || "";

  const isAmountValid = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0;
  }, [amount]);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setIntent(null);
      setSolanaPayUrl("");
      setQrDataUrl("");
      setManualSignature("");
      setLoading(false);
      setPaying(false);
      setChecking(false);
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
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

  const startQrStatusPolling = (intentId) => {
    if (!intentId) return;

    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    setQrPolling(true);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const statusIntent = await checkDepositStatus(intentId);

        if (!statusIntent) return;

        setIntent((prev) => ({
          ...(prev || {}),
          ...statusIntent,
        }));

        if (statusIntent.status === "confirmed") {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setQrPolling(false);

          setSuccessMessage("Payment received successfully.");
          onDepositConfirmed?.({
            success: true,
            intent: statusIntent,
          });
        }

        if (["failed", "expired"].includes(statusIntent.status)) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setQrPolling(false);

          setError(
            statusIntent.status === "expired"
              ? "This payment request expired. Please create a new request."
              : "Payment failed. Please try again."
          );
        }
      } catch (error) {
        console.error("QR payment polling error:", error);
      }
    }, 5000);
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

    setSuccessMessage("Deposit confirmed successfully.");
    onDepositConfirmed?.(data);

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
      setError("Please generate QR deposit request first.");
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
    if (paying) return;

    setPaying(true);
    setError("");
    setSuccessMessage("");

    try {
      const activeIntent = intent || (await createIntent("extension"));

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
          toPubkey: new PublicKey(activeIntent.treasuryAddress),
          lamports: Number(activeIntent.amountLamports),
        })
      );

      const signedResult = await provider.signAndSendTransaction(transaction);

      const signature = signedResult?.signature || signedResult;

      if (!signature) {
        throw new Error("No transaction signature returned from Phantom.");
      }

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
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    setQrPolling(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] shadow-[0_0_40px_rgba(212,175,55,0.15)]">
        {/* Header */}
        <div className="relative border-b border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 to-transparent p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                <Wallet size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-wide text-white">Deposit SOL</h2>
                <p className="text-xs text-[#d4af37]/70">
                  Scan QR or use Phantom extension
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
              Amount in SOL
            </label>
            <div className="relative">
              <input
                disabled={!!intent}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.000001"
                placeholder="0.00"
                className="w-full rounded-lg border border-white/10 bg-black/50 py-3 pl-4 pr-12 text-lg font-medium text-white shadow-inner outline-none transition-all focus:border-[#d4af37] focus:shadow-[0_0_10px_rgba(212,175,55,0.2)] disabled:opacity-50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#d4af37]">
                SOL
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleQrDeposit}
              disabled={loading || !isAmountValid}
              className="group flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/30 bg-black/40 px-4 py-3 text-sm font-medium text-[#d4af37] transition-all hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:hover:bg-black/40"
            >
              <QrCode size={18} className="transition-transform group-hover:scale-110" />
              QR Deposit
            </button>

            <button
              type="button"
              onClick={handlePayWithPhantom}
              disabled={paying || loading || !isAmountValid}
              className="group flex items-center justify-center gap-2 rounded-xl border border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 px-4 py-3 text-sm font-medium text-white shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
            >
              <Wallet size={18} className="transition-transform group-hover:scale-110" />
              {paying ? "Processing..." : "Pay with Phantom"}
            </button>
          </div>

          {qrDataUrl && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="relative mx-auto w-max rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#d4af37]/10 to-transparent p-5 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#d4af37]/40 bg-[#0a0a0a] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                  Scan to Pay
                </div>
                <img
                  src={qrDataUrl}
                  alt="Solana deposit QR"
                  className="mx-auto h-48 w-48 rounded-lg border-4 border-white shadow-lg"
                />
              </div>

              {intent?.temporaryConnectedWalletMode && (
                <p className="mt-4 text-center text-[11px] font-medium text-[#d4af37]/80">
                  <span className="text-[#d4af37]">Demo Mode:</span> This QR receives SOL to your connected wallet.
                </p>
              )}

              {qrPolling && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 py-2 text-[11px] text-[#d4af37]">
                  <RefreshCw size={12} className="animate-spin" />
                  Waiting for payment confirmation...
                </div>
              )}

              {intent?.status === "confirmed" && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 py-2 text-[11px] font-medium text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80]"></div>
                  Payment confirmed successfully!
                </div>
              )}

              <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Manual Verification
                </label>
                <div className="flex gap-2">
                  <input
                    value={manualSignature}
                    onChange={(e) => setManualSignature(e.target.value)}
                    placeholder="Paste tx signature here..."
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none transition-all focus:border-[#d4af37]/50 focus:bg-black/60"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitManualSignature}
                    disabled={checking || !manualSignature.trim()}
                    className="flex shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 transition-colors hover:bg-[#d4af37]/20 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={`text-[#d4af37] ${checking ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {solanaPayUrl && !qrDataUrl && (
            <div className="mt-4 break-all rounded-xl border border-white/5 bg-black/30 p-3 text-[10px] text-white/30">
              {solanaPayUrl}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}

          {successMessage && !qrDataUrl && (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhantomDepositModal;
