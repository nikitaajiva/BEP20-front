"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { requestAccounts, sendUsdtTransfer, sendBnbTransfer, switchToBsc } from "@/utils/bscWallet";

export default function DepositIntentPage() {
  const params = useParams();
  const referenceId = useMemo(() => params?.referenceId || "", [params]);
  const { API_URL } = useAuth();
  const [intent, setIntent] = useState(null);
  const [status, setStatus] = useState("Loading deposit intent...");
  const [error, setError] = useState("");
  const [txHashInput, setTxHashInput] = useState("");
  const [txHashStatus, setTxHashStatus] = useState("");

  const fetchIntent = useCallback(async () => {
    if (!referenceId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Authentication required. Please sign in.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/deposits/intent/${encodeURIComponent(referenceId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch deposit intent.");
      }
      setIntent(data.intent);
      setStatus("Ready to send deposit.");
    } catch (err) {
      setError(err.message || "Failed to load deposit intent.");
      setStatus("Unable to load deposit intent.");
    }
  }, [API_URL, referenceId]);

  useEffect(() => {
    fetchIntent();
  }, [fetchIntent]);

  const handlePay = async () => {
    if (!intent) return;
    setError("");
    try {
      await switchToBsc();
      const accounts = await requestAccounts();
      const activeWallet = accounts?.[0] || "";
      if (!activeWallet) {
        throw new Error("No wallet account available.");
      }
      setStatus("Confirm the transfer in your wallet...");
      const asset = `${intent.asset || "BNB"}`.toUpperCase();
      const txHash =
        asset === "BNB"
          ? await sendBnbTransfer({
              from: activeWallet,
              to: intent.deposit_address,
              amount: intent.amount,
            })
          : await sendUsdtTransfer({
              from: activeWallet,
              to: intent.deposit_address,
              amount: intent.amount,
            });
      setStatus(`Transaction submitted: ${txHash}. Verifying...`);

      const token = localStorage.getItem("token");
      const endpoint = asset === "BNB" ? "bnb" : "usdt";
      const backendResponse = await fetch(`${API_URL}/deposits/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tx_hash: txHash,
          referenceId,
        }),
      });
      const backendData = await backendResponse.json();
      if (!backendResponse.ok || !backendData.success) {
        throw new Error(backendData.message || "Failed to record deposit.");
      }
      setStatus(backendData.message || "Deposit recorded.");
    } catch (err) {
      setError(err.message || "Payment failed.");
      setStatus("Payment failed.");
    }
  };

  const handleSubmitTxHash = async () => {
    if (!intent || !txHashInput) return;
    setTxHashStatus("Submitting tx hash...");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTxHashStatus("Authentication required.");
        return;
      }
      const backendResponse = await fetch(`${API_URL}/deposits/bnb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tx_hash: txHashInput,
          referenceId,
        }),
      });
      const backendData = await backendResponse.json();
      if (backendResponse.ok && backendData.success) {
        setTxHashStatus(backendData.message || "Tx hash accepted.");
        setStatus(backendData.message || "Deposit recorded.");
        return;
      }
      setTxHashStatus(backendData.message || "Failed to submit tx hash.");
    } catch (err) {
      setTxHashStatus(err.message || "Failed to submit tx hash.");
    }
  };

  const expired = intent?.expiresAt ? new Date(intent.expiresAt) < new Date() : false;

  return (
    <AuthGuard>
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(120% 120% at 20% 0%, rgba(255, 215, 0, 0.12) 0%, rgba(10, 10, 10, 0.96) 60%)",
          color: "#f4f4f4",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "rgba(12,12,12,0.7)",
            borderRadius: "14px",
            padding: "28px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>BNB Deposit</h2>
          <p style={{ color: "#ffd766", marginBottom: "16px" }}>{status}</p>
          {error ? <p style={{ color: "#ff8a80" }}>{error}</p> : null}

          {intent ? (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", color: "#c7c7c7" }}>Amount</div>
              <div style={{ marginBottom: "10px" }}>
                {intent.amount} {intent.asset || "BNB"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#c7c7c7" }}>Deposit Address</div>
              <div style={{ marginBottom: "10px", wordBreak: "break-all" }}>
                {intent.deposit_address}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#c7c7c7" }}>Reference ID</div>
              <div style={{ wordBreak: "break-all" }}>{referenceId}</div>
            </div>
          ) : null}

          {intent ? (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", color: "#c7c7c7" }}>
                Submit Tx Hash (external wallet)
              </div>
              <input
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value.trim())}
                placeholder="0x..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 215, 0, 0.25)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#f4f4f4",
                  marginBottom: "8px",
                }}
              />
              <button
                onClick={handleSubmitTxHash}
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "linear-gradient(135deg, #ffd700, #ff9f1a)",
                  color: "#0a0a0a",
                  fontWeight: "bold",
                }}
              >
                Submit Tx Hash
              </button>
              {txHashStatus ? (
                <div style={{ marginTop: "8px", color: "#ffd766" }}>
                  {txHashStatus}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            onClick={handlePay}
            disabled={!intent || expired}
            style={{
              padding: "12px 16px",
              width: "100%",
              borderRadius: "8px",
              border: "none",
              background: expired ? "#555" : "linear-gradient(135deg, #ffd700, #ff9f1a)",
              color: "#0a0a0a",
              fontWeight: "bold",
              cursor: expired ? "not-allowed" : "pointer",
            }}
          >
            {expired ? "Intent expired" : "Pay with MetaMask"}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
