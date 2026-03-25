import React from "react";
import Link from "next/link";

export default function WalletCard({ user, onTransferClick }) {
  const textCellStyle = {
    padding: "0.75rem", // Further reduced padding
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Changed to center content vertically
    height: "100%", // Restored height constraint
  };

  const imageCellStyle = {
    background: "#1a2035",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem",
    height: "100%", // Restored height constraint
    borderTopRightRadius: "22px",
    borderBottomRightRadius: "22px",
    overflow: "hidden",
  };

  return (
    // Restored h-100 to card for uniform height with other cards in the row
    <div
      className="card h-100"
      style={{ background: "#181f3a", padding: "0", overflow: "hidden" }}
    >
      {/* Restored h-100 to inner row */}
      <div className="row g-0 h-100">
        {/* Changed to col-7 for more text space */}
        <div className="col-7 d-flex">
          <div style={textCellStyle} className="w-100">
            <div style={{ marginBottom: "0.75rem" }}>
              <h5
                className="mb-1"
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  whiteSpace: "normal",
                  lineHeight: "1.3",
                  color: "#fff",
                }}
              >
                USDT Swift Wallet
              </h5>
              <div
                className="badge lh-xs"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#fff",
                  borderRadius: "9999px",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  marginTop: "0.125rem",
                }}
              >
                Live
              </div>
            </div>
            <div className="d-flex align-items-baseline">
              <h4
                className="mb-0 me-1"
                style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}
              >
                {typeof user?.balanceXRP === "number"
                  ? user.balanceXRP.toFixed(4)
                  : "0.0000"}
              </h4>
              {/* Ensured flexShrink and marginLeft on USDT span */}
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#a0a7c4",
                  fontWeight: 500,
                  flexShrink: 0,
                  marginLeft: "0.25rem",
                }}
              >
                USDT
              </span>
            </div>
            <div className="mt-3">
              <button
                onClick={onTransferClick}
                className="btn w-100 mb-2"
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "12px",
                  justifyContent: "center",
                  padding: "0.75rem",
                  transition: "all 0.3s ease",
                }}
              >
                Transfer USDT
              </button>
              <Link
                href="/dashboard/ledger?type=zero-risk"
                className="btn w-100"
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "12px",
                  justifyContent: "center",
                  padding: "0.75rem",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                }}
              >
                View History
              </Link>
            </div>
          </div>
        </div>
        {/* Changed to col-5 for image */}
        <div className="col-5 d-flex">
          <div style={imageCellStyle} className="w-100">
            <img
              src="/assets/img/illustrations/illustration-upgrade-account.png"
              alt="Wallet Illustration"
              style={{
                display: "block",
                maxHeight: "85%",
                maxWidth: "100%",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
