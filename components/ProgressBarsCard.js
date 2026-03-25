import React from "react";
import Image from "next/image";
import WalletLimitUtilization from "../public/assets/images/WalletLimitUtilization.png";
const ProgressBar = ({ label, value, max, unit = "", color = "#4f8cff" }) => {
  const numericValue = parseFloat(value || "0");
  const numericMax = parseFloat(max || "0");

  let percentage =
    numericMax > 0 ? Math.min((numericValue / numericMax) * 100, 100) : 0;
  // If percentage is 0 but you want to show a sliver, set a minimum visual percentage
  const visualPercentage =
    percentage === 0 && numericMax > 0 ? 1.5 : percentage; // Show 1.5% as a minimum sliver if actual is 0

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.3rem",
        }}
      >
        <span
          style={{ color: "#b3baff", fontSize: "0.875rem", fontWeight: 500 }}
        >
          {label}
        </span>
        <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
          {`${numericValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} / ${numericMax.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}${unit}`}
        </span>
      </div>
      <div
        style={{
          height: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${visualPercentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "5px",
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

const ProgressBarsCard = ({ ledgerDetails, user }) => {  
     const firstLpTs = user?.firstLpDepositTs;  // 2025-08-29T17:52:15.672Z
const firstLpDate = firstLpTs ? new Date(firstLpTs) : null;
// Set cutoff date: June 28, 2025
const cutoffDate = new Date("2025-06-28T00:00:00Z");

  const cardBaseStyle = {
    overflow: "hidden",
    background: "#000000",
    color: "#ffffff",
    borderRadius: "24px",
    border: "1px solid rgba(255, 215, 0, 0.15)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    padding: "1.5rem",
  };

  // Access data from the structure prepared by ledgerController.js
  const airdropWalletData = ledgerDetails?.airdropWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const airdropLimitUsed = parseFloat(airdropWalletData.used);
  const airdropLimitCap = parseFloat(airdropWalletData.limit);
  const lpWalletData = ledgerDetails?.lpWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const lpLimitUsed = parseFloat(lpWalletData.used) || 0;
  const lpLimitCap = parseFloat(lpWalletData.limit) || 0;

  const boostWalletData = ledgerDetails?.boostWallet || {
    balance: "0",
    limit: "0",
    used: "0",
  };
  const boostBalance = parseFloat(boostWalletData.balance);
  const boostLimitUsed = parseFloat(boostWalletData.used);
  const boostLimitCap = parseFloat(boostWalletData.limit);

  // Use the new fiveXLimit data structure from the backend
  const fiveXData = ledgerDetails?.fiveXLimit || { cap: "0", used: "0" };
  const fiveXLimitUsed = parseFloat(fiveXData.used);
  const fiveXLimitMax = parseFloat(fiveXData.cap);

  return (
    <div className="card h-100" style={cardBaseStyle}>
      <div className="card-body w-100">
        <div style={{ color: "#fff", display: "flex", gap: "3px" }}>
          {/* <span className="" style={{ marginTop: "-10px" }}>
            <Image src={WalletLimitUtilization} width={40} height={40} />
          </span> */}
          <h5
            className="mb-4"
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#fff",
              textAlign: "left",
            }}
          >
            Wallet Limit Utilization
          </h5>
        </div>

        <div>
          <ProgressBar
            label="Liquidity Pool Limit"
            value={lpLimitUsed}
            max={lpWalletData.balance * 2}
            unit=" USDT"
            color="#00F0FF" // Teal/Cyan for Airdrop
          />

          {firstLpDate && firstLpDate < cutoffDate ? (
          <ProgressBar
            label="Airdrop Wallet Limit"
            value={airdropLimitUsed}
            max={airdropLimitCap}
            unit=" USDT"
            color="#00F0FF"
          />
        ) : null}

          <ProgressBar
            label="Boost Wallet Limit"
            value={boostLimitUsed}
            max={boostBalance}
            unit=" USDT"
            color="#FFD700" // Gold for Boost
          />

          <ProgressBar
            label="5X Available Limit"
            value={fiveXLimitUsed}
            max={fiveXLimitMax}
            unit=" USDT"
            color="#7FFF4C" // Green for FiveX
          />
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default ProgressBarsCard;
