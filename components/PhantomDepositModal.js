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
    await createIntent("qr");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0f14] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Deposit SOL</h2>
            <p className="text-xs text-white/50">
              Deposit with Phantom extension or scan QR.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="mb-1 block text-xs text-white/60">
            Amount in SOL
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.000001"
            placeholder="0.00"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#d4af37]/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleQrDeposit}
            disabled={loading || !isAmountValid}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm hover:bg-white/[0.08] disabled:opacity-50"
          >
            <QrCode size={16} />
            QR Deposit
          </button>

          <button
            type="button"
            onClick={handlePayWithPhantom}
            disabled={paying || loading || !isAmountValid}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-3 text-sm hover:bg-[#d4af37]/20 disabled:opacity-50"
          >
            <Wallet size={16} />
            {paying ? "Paying..." : "Pay with Phantom"}
          </button>
        </div>

        {qrDataUrl && (
          <>
            <div className="mt-4 rounded-xl border border-white/10 bg-white p-3 text-center">
              <img
                src={qrDataUrl}
                alt="Solana deposit QR"
                className="mx-auto h-56 w-56"
              />
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
              <label className="mb-1 block text-xs text-white/60">
                Paste transaction signature after QR payment
              </label>
              <input
                value={manualSignature}
                onChange={(e) => setManualSignature(e.target.value)}
                placeholder="Solana transaction signature"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none"
              />

              <button
                type="button"
                onClick={handleSubmitManualSignature}
                disabled={checking || !manualSignature.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw size={14} />
                {checking ? "Confirming..." : "Submit Signature"}
              </button>
            </div>
          </>
        )}

        {solanaPayUrl && (
          <div className="mt-3 break-all rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/50">
            {solanaPayUrl}
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhantomDepositModal;
