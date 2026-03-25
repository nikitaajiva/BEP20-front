import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { getTxUrl } from "@/utils/explorer";

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  transactionHash,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050, // Ensure it's on top of other elements
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          position: "relative",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          border: "1px solid #2a3150",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
          }}
        >
          ×
        </button>

        <div style={{ textAlign: "center" }}>
          <FaCheckCircle
            size={48}
            color="#7FFF4C"
            style={{ marginBottom: "1rem" }}
          />
          <h4 style={{ color: "#fff", marginBottom: "1rem" }}>
            {title || "Success!"}
          </h4>
          <p style={{ color: "#b3baff", marginBottom: "1.5rem" }}>
            {message || "Your operation was completed successfully."}
          </p>

          {transactionHash && (
            <div style={{ marginBottom: "2rem", wordBreak: "break-all" }}>
              <p
                style={{
                  color: "#b3baff",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                Transaction Hash:
              </p>
              <a
                href={getTxUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4f8cff", textDecoration: "underline" }}
                title="View transaction on USDTL explorer"
              >
                {transactionHash}
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="btn w-100"
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              color: "#4f8cff",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              borderRadius: "12px",
              padding: "0.75rem",
              justifyContent: "center",
              transition: "all 0.3s ease",
              fontWeight: 600,
            }}
          >
            Great!
          </button>
        </div>
      </div>
    </div>
  );
}
