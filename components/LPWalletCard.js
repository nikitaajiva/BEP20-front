"use client";
import React from "react";
import Link from "next/link";
import styles from "./LPWalletCard.module.css";

// Helper function to get ROI percentage based on balance
const getRoiPercentage = (balance) => {

  const bal = parseFloat(balance);
  if (bal >= 11000) return 0.6;
  if (bal >= 5000) return 0.6;
  if (bal >= 1000) return 0.5;
  if (bal >= 9) return 0.5;
  return 0;
};

export default function LPWalletCard({
  balance = "0.0",
  pending = "0.0",
  autopositioning= "0.0",
  onAddLP = null,
  showEarningInfo = true,
  disableButtons,
}) {
  const roiPercentage = showEarningInfo ? getRoiPercentage(balance) : 0;

  return (
    <div
      className="card h-100"
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="card-body" >
        <div>
          <div className="d-flex align-items-start justify-content-between">
            <div className="card-title mb-0">
              <h5 className="mb-0" style={{ color: "#fff" }}>
                LP
              </h5>
              <small style={{ color: "#b3baff" }}>Your Balance</small>
            </div>
            <div className="d-flex align-items-center">
              {onAddLP ? (
                <div className={styles.rippleContainer}>
                  <button
                    disabled={disableButtons}
                    onClick={onAddLP}
                    className="card-icon rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      background: "rgba(127, 255, 76, 0.1)",
                      border: "1px solid rgba(127, 255, 76, 0.2)",
                      width: "45px",
                      height: "45px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                      title={
                    disableButtons ? "Connect Primary Vault to Enable Transactions" : "Add LP"
                  }
                   
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7FFF4C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className="card-icon rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    background: "rgba(127, 255, 76, 0.1)",
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7FFF4C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="card-title mb-2" style={{ color: "#7FFF4C" }}>
              {Math.max(0, parseFloat(balance)).toFixed(6)} USDT
            </h3>
          
              <small style={{ color: "#FFD700" }}>
                Autopositioning: {parseFloat(autopositioning).toFixed(6)} USDT
              </small>
        
            {parseFloat(pending) > 0 && (
              <small style={{ color: "#FFD700" }}>
                Pending: {parseFloat(pending).toFixed(6)} USDT
              </small>
            )}
            {showEarningInfo && roiPercentage > 0 && (
              <div>
                <small style={{ color: "#7FFF4C" }}>
                  Earning {roiPercentage}% daily
                </small>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mt-4">
            <Link
              href="/dashboard/history/lp"
              className="btn w-100"
              style={{
                background: "rgba(127, 255, 76, 0.1)",
                color: "#7FFF4C",
                border: "1px solid rgba(127, 255, 76, 0.2)",
                borderRadius: "12px",
                padding: "0.75rem",
                justifyContent: "center",
                transition: "all 0.3s ease",
                // cursor: "not-allowed",
                // pointerEvents: "none",
              }}
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
