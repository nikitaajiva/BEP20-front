"use client";
import React from "react";
import Link from "next/link";
import { FaGift } from "react-icons/fa";
import { left } from "@popperjs/core";
import { FaEye } from "react-icons/fa";

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
  const toNumber = (v) => parseFloat(v?.toString?.() || "0");
  const comm_rewards =
    toNumber(ledgerDetails?.daily_rewards?.XBONUS) +
    toNumber(ledgerDetails?.daily_rewards?.COMMUNITY_BOOSTER) +
    toNumber(ledgerDetails?.daily_rewards?.XPOWER) +
    toNumber(ledgerDetails?.daily_rewards?.cascade) +
    toNumber(ledgerDetails?.daily_rewards?.XMEN);
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
            display: "flex",
            alignItems: "center",
            gap: "10px", // adds space between text & icon
          }}
        >
          <span>{label}</span>

          {/* ✅ Show Eye icon only if label matches */}
          {/* {label === "Community Rewards" && (
            <Link
              // href="/dashboard/history/Community_history"
              href="#"
              target="_blank" // ✅ opens in a new tab
              rel="noopener noreferrer" // ✅ security best practice
              style={{
                color: "#7fff4c",
                pointerEvents: "none",
              }}
            >
              <svg
                width={20}
                Height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style={{ cursor: "pointer" }}
                title="View Community Rewards"
              >
                <path d="M2.05 12c2.93-5 7.05-7.5 9.95-7.5S19.02 7 21.95 12c-2.93 5-7.05 7.5-9.95 7.5S4.98 17 2.05 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          )} */}
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
                Community Wallet (USDT)
              </h5>
              {/* <small style={{ color: "#b3baff" }}>Current Balance</small> */}
            </div>
            <div className="d-flex align-items-center">
              <div
                className="card-icon rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  width: "45px",
                  height: "45px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 12 .375a2.625 2.625 0 0 0 0 4.5Z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div
              className="card-title-first-balance"
              style={{ display: "flex", alignItems: "center", gap: "3px" }}
            >
              <h3 className="card-title mb-0" style={{ color: "#4f8cff" }}>
                {Math.max(0, parseFloat(CommunityWallet)).toFixed(2)}
              </h3>
              <h2>/</h2>
              <h4 style={{}} className="m-0">
                {comm_rewards.toFixed(2)}
              </h4>
            </div>
          </div>
          <div>
            <div
              className=""
              style={{
                display: "flex",
                justifyContent: "space-between",
                // alignItems: "center",
              }}
            >
              <div>
                {" "}
                <ProgressBar
                  label="Community Rewards"
                  value={cascadeRewards_rewards}
                  max={cascadeRewards_rewards * 2}
                  unit=" USDT"
                  color="#00F0FF"
                  rewards={ledgerDetails?.daily_rewards?.cascade}
                />
                <ProgressBar
                  label="Growth Multiplier"
                  value={xBonus}
                  // unit=" USDT"
                  color="#00F0FF"
                  rewards={ledgerDetails?.daily_rewards?.XBONUS}
                />
              </div>
              <div>
                <ProgressBar
                  label="Community booster"
                  value={communityBoosterBonus}
                  // max={airdropWalletData.balance * 2}
                  // unit=" USDT"
                  color="#00F0FF" //
                  rewards={ledgerDetails?.daily_rewards?.COMMUNITY_BOOSTER}
                />

                <ProgressBar
                  label="X Power"
                  value={ledgerDetails?.daily_rewards?.XPOWER_TOTAL}
                  // max={fiveXData.balance * 2}
                  // unit=" USDT"
                  color="#00F0FF"
                  rewards={ledgerDetails?.daily_rewards?.XPOWER}
                />
              </div>
            </div>
            <div
              style={{
                paddingRight: "40%",
                paddingLeft: "40%",
              }}
            >
              <ProgressBar
                label="X Men"
                value={"0.0"}
                // max={boostWalletData.balance * 2}
                // unit=" USDT"
                color="#00F0FF" // Teal/Cyan for Airdrop
                rewards={ledgerDetails?.daily_rewards?.XMEN}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mt-2">
            <Link
              //href="/dashboard/history/community_wallet"
              href="/dashboard/history/community_rewards"
              className="btn w-100"
              style={{
                background: "rgba(127, 255, 76, 0.1)",
                border: "1px solid rgba(127, 255, 76, 0.2)",
                color: "rgb(127, 255, 76)",
                width: "45px",
                height: "45px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px", // optional: gives soft corners
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
