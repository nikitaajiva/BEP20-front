"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function PhantomQrDepositModal({
  isOpen,
  onClose,
  payload,
  displayData,
  status,
  timeLeft,
  onRetry,
  onSubmitTxSignature,
  txSignatureStatus,
  onOpenWallet,
  loading = false,
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [txSignature, setTxSignature] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!payload) {
      setQrDataUrl("");
      setTxSignature("");
      return undefined;
    }

    setTxSignature("");
    QRCode.toDataURL(payload, { width: 220, margin: 1 })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        if (isMounted) setQrDataUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [payload]);

  if (!isOpen) return null;

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1060,
  };

  const modalContentStyle = {
    background:
      "radial-gradient(120% 120% at 20% 0%, rgba(255, 102, 0, 0.14) 0%, rgba(10, 10, 10, 0.95) 60%)",
    color: "#f4f4f4",
    padding: "28px",
    borderRadius: "14px",
    minWidth: "320px",
    maxWidth: "520px",
    boxShadow:
      "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255, 102, 0, 0.18) inset",
    textAlign: "center",
  };

  const labelStyle = {
    fontSize: "0.85rem",
    color: "#c7c7c7",
    marginBottom: "6px",
  };

  const valueStyle = {
    fontSize: "0.95rem",
    wordBreak: "break-all",
    marginBottom: "12px",
  };

  const statusText =
    status === "confirmed"
      ? "Payment Successful"
      : status === "expired"
      ? "Deposit expired"
      : status === "failed"
      ? "Deposit failed"
      : "Waiting for payment";

  return (
    <div style={modalStyle} onClick={loading ? undefined : onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4 style={{ marginBottom: "12px", color: "#fff" }}>Scan to Deposit</h4>
        <p style={{ marginBottom: "16px", color: "#ffb800" }}>{statusText}</p>

        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Deposit QR" style={{ borderRadius: "10px" }} />
        ) : (
          <div
            style={{
              height: "220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Generating QR...
          </div>
        )}

        <div style={{ marginTop: "18px", textAlign: "left" }}>
          <div style={labelStyle}>Amount</div>
          <div style={valueStyle}>{displayData?.amountSol} SOL</div>
          <div style={labelStyle}>Treasury Address</div>
          <div style={valueStyle}>{displayData?.treasuryAddress}</div>
          <div style={labelStyle}>Reference</div>
          <div style={valueStyle}>{displayData?.reference}</div>
          <div style={labelStyle}>Network</div>
          <div style={valueStyle}>{displayData?.network || "mainnet-beta"}</div>
        </div>

        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <div style={labelStyle}>Have a transaction signature?</div>
          <input
            value={txSignature}
            onChange={(e) => setTxSignature(e.target.value.trim())}
            placeholder="Paste Solana transaction signature"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 102, 0, 0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#f4f4f4",
              marginBottom: "8px",
            }}
          />
          <button
            onClick={() => {
              if (txSignature) onSubmitTxSignature?.(txSignature);
            }}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              background: "linear-gradient(135deg, #ff6600, #ff8c00)",
              color: "#0a0a0a",
              fontWeight: "bold",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Confirming..." : "Submit Signature"}
          </button>
          {txSignatureStatus ? (
            <div style={{ marginTop: "8px", color: "#ffb800", fontSize: "0.85rem" }}>
              {txSignatureStatus}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: "14px", color: "#ffb800" }}>
          Time left: {Math.max(0, timeLeft)}s
        </div>

        <div style={{ marginTop: "18px" }}>
          {payload ? (
            <button
              onClick={onOpenWallet}
              style={{
                padding: "10px 16px",
                marginRight: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 102, 0, 0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "#ffb800",
                fontWeight: "bold",
              }}
            >
              Open Phantom
            </button>
          ) : null}

          {(status === "expired" || status === "failed") && (
            <button
              onClick={onRetry}
              style={{
                padding: "10px 16px",
                marginRight: "10px",
                borderRadius: "6px",
                border: "none",
                background: "linear-gradient(135deg, #ff6600, #ff8c00)",
                color: "#0a0a0a",
                fontWeight: "bold",
              }}
            >
              Retry
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.06)",
              color: "#f4f4f4",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
