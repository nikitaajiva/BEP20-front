"use client";
import React from "react";
import Link from "next/link";
import { FaGift } from "react-icons/fa";
import { left } from "@popperjs/core";

export default function CommunityWalletCard({
  ledgerDetails,
  totalRewards,
  pendingRewards,
  fiveXAvailable,
  onRedeem,
  onClaimPendingRewards,
  onAutoPosition,
  isLoading,
  isClaiming,
  claimError,
}) {
  const cascadeRewards_rewards =
    ledgerDetails?.cascadeRewards?.toString?.() || "0.0";
  const communityBoosterBonus =
    ledgerDetails?.communityBoosterBonus?.toString?.() || "0.0";
  const xBonus = ledgerDetails?.xBonus?.toString?.() || "0.0";

  const airdropWalletData = ledgerDetails?.airdropWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const airdropLimitUsed = parseFloat(airdropWalletData.used);
  const lpWalletData = ledgerDetails?.lpWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const lpLimitUsed = parseFloat(lpWalletData.used) || 0;
  const boostWalletData = ledgerDetails?.boostWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const boostLimitUsed = parseFloat(boostWalletData.used);

  // Use the new fiveXLimit data structure from the backend
  const fiveXData = ledgerDetails?.fiveXLimit || { cap: "0", used: "0" };
  const fiveXLimitUsed = parseFloat(fiveXData.used);

  const sumLimits = lpLimitUsed + airdropLimitUsed + boostLimitUsed;
  const CommunityWallet =
    parseFloat(cascadeRewards_rewards) +
    parseFloat(communityBoosterBonus) +
    parseFloat(xBonus);
  const totalLimitUsed =
    (airdropLimitUsed || 0) +
    (lpLimitUsed || 0) +
    (boostLimitUsed || 0) +
    (CommunityWallet || 0);

  const RewardsWalletRedeem = (totalLimitUsed || 0) - (totalRewards || 0);

  // Console log everything
  
  
  
  

  const buttonStyle = {
    background: "rgba(79, 140, 255, 0.1)",
    color: "#4f8cff",
    border: "1px solid rgba(79, 140, 255, 0.2)",
    borderRadius: "12px",
    padding: "0.75rem",
    transition: "all 0.3s ease",
    width: "100%",
  };

  const ProgressBar = ({
    rewards,
    label,
    value,
    max,
    unit = "",
    color = "#4f8cff",
  }) => {
    const numericValue = parseFloat(value || "0");
    const numericMax = parseFloat(max || "0");

    let percentage =
      numericMax > 0 ? Math.min((numericValue / numericMax) * 100, 100) : 0;
    // If percentage is 0 but you want to show a sliver, set a minimum visual percentage
    const visualPercentage =
      percentage === 0 && numericMax > 0 ? 1.5 : percentage; // Show 1.5% as a minimum sliver if actual is 0

    return (
      <div className="mb-2 ProgressBardiv Community_Wallet_ProgressBardiv">
        <div
          style={{
            color: "#b3baff",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
        <div
          className="ProgressBardiv_inner"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            // marginTop: "8px",
          }}
        >
          <div style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
            {`${numericValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${unit}`}
          </div>
          <div>/</div>
          <div className="ProgressBardiv_inner_label_section">
            <p className="ProgressBardiv_inner_value_section">
              {rewards != null
                ? Number(rewards).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </p>
            <div className="ProgressBardiv_inner_label"></div>
          </div>
        </div>
      </div>
    );
  };
  const currentDateOnlyUTC = new Date().toISOString().split("T")[0]; // e.g., "2025-06-27"
  const targetDateOnlyUTC = "2025-06-27";
  const show = currentDateOnlyUTC > targetDateOnlyUTC;
  return (
    <div
      className="card h-100"
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="card-body single-card-style">
        <div>
          <div className="d-flex align-items-start justify-content-between">
            <div className="card-title mb-0">
              <h5 className="mb-0" style={{ color: "#fff" }}>
                {" "}
                Community Wallet new
              </h5>
              {/* <small style={{ color: "#b3baff" }}>Current Balance</small> */}
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
