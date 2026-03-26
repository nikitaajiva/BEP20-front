"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrDepositModal({
  isOpen,
  onClose,
  payload,
  displayData,
  status,
  timeLeft,
  onRetry,
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const metamaskLink =
    payload && payload.startsWith("ethereum:")
      ? `https://metamask.app.link/send/${payload.replace("ethereum:", "")}`
      : "";

  useEffect(() => {
    let isMounted = true;
    if (!payload) {
      setQrDataUrl("");
      return;
    }

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
      "radial-gradient(120% 120% at 20% 0%, rgba(255, 215, 0, 0.14) 0%, rgba(10, 10, 10, 0.95) 60%)",
    color: "#f4f4f4",
    padding: "28px",
    borderRadius: "14px",
    minWidth: "320px",
    maxWidth: "520px",
    boxShadow:
      "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255, 215, 0, 0.18) inset",
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
    status === "completed"
      ? "Payment Successful"
      : status === "expired"
        ? "Deposit expired"
        : status === "failed"
          ? "Deposit failed"
          : "Waiting for payment";

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4 style={{ marginBottom: "12px", color: "#fff" }}>Scan to Deposit</h4>
        <p style={{ marginBottom: "16px", color: "#ffd766" }}>{statusText}</p>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Deposit QR" style={{ borderRadius: "10px" }} />
        ) : (
          <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Generating QR...
          </div>
        )}

        <div style={{ marginTop: "18px", textAlign: "left" }}>
          <div style={labelStyle}>Amount</div>
          <div style={valueStyle}>
            {displayData?.amount} {displayData?.asset || "USDT"}
          </div>
          {displayData?.asset !== "BNB" && (
            <>
              <div style={labelStyle}>Token Contract</div>
              <div style={valueStyle}>{displayData?.tokenContract}</div>
            </>
          )}
          <div style={labelStyle}>Deposit Address</div>
          <div style={valueStyle}>{displayData?.depositAddress}</div>
          <div style={labelStyle}>Reference ID</div>
          <div style={valueStyle}>{displayData?.referenceId}</div>
          <div style={labelStyle}>Network</div>
          <div style={valueStyle}>{displayData?.network}</div>
        </div>

        <div style={{ marginTop: "14px", color: "#ffd766" }}>
          Time left: {Math.max(0, timeLeft)}s
        </div>

        <div style={{ marginTop: "18px" }}>
          {payload ? (
            <button
              onClick={() => {
                try {
                  const primaryLink = isMobile && metamaskLink ? metamaskLink : payload;
                  window.location.href = primaryLink;
                  if (metamaskLink && primaryLink !== metamaskLink) {
                    setTimeout(() => {
                      window.location.href = metamaskLink;
                    }, 400);
                  }
                } catch (error) {
                  // No-op: fallback handled by link below.
                }
              }}
              style={{
                padding: "10px 16px",
                marginRight: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 215, 0, 0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "#ffd766",
                fontWeight: "bold",
              }}
            >
              Open Wallet
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
                background: "linear-gradient(135deg, #ffd700, #ff9f1a)",
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
              border: "1px solid rgba(255, 215, 0, 0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffd766",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
