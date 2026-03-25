"use client";
import React from "react";
import Link from "next/link";
import { FaGift } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CommunityRewardsCard({
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
  isAutoPositioningActive, // ✅ coming from parent
  setIsAutoPositioningActive, // ✅ setter from parent
  disableButtons,
  xRank,
  refreshLedgerDetails,
  user


  // show,
}) {

    const {  API_URL } = useAuth();
      const disableRewardWalletButtons = xRank ? true : false;
  // const [isAutoPositioningActive, setIsAutoPositioningActive] = useState(false);
  console.log(isAutoPositioningActive, "isAutoPositioningActive");
  const [redeemEligible, setRedeemEligible] = useState(false);
const [redeemEligibilityLoading, setRedeemEligibilityLoading] = useState(true);

const fetchRedeemEligibility = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `${API_URL}/ledger/redeem-eligibility`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok && data?.success) {
      setRedeemEligible(Boolean(data.eligible));
    } else {
      setRedeemEligible(false);
    }
  } catch (err) {
    console.error("Redeem eligibility fetch failed:", err);
    setRedeemEligible(false);
  } finally {
    setRedeemEligibilityLoading(false);
  }
};


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

const [showMacauPopup, setShowMacauPopup] = useState(false);
const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [macauLoading, setMacauLoading] = useState(false);

     const firstLpTs = user?.firstLpDepositTs;  // 2025-08-29T17:52:15.672Z
const firstLpDate = firstLpTs ? new Date(firstLpTs) : null;
// Set cutoff date: June 28, 2025
const cutoffDate = new Date("2025-06-28T00:00:00Z");


  // Use the new fiveXLimit data structure from the backend
  const fiveXData = ledgerDetails?.fiveXLimit || { cap: "0", used: "0" };
  const fiveXLimitUsed = parseFloat(fiveXData.used);

  // console.log(
  //   fiveXLimitUsed,
  //   "ggggggggggggggggggggggggggggggggggggggggggggggggg"
  // );

  const sumLimits = lpLimitUsed + airdropLimitUsed + boostLimitUsed;
  const CommunityWallet = fiveXLimitUsed - sumLimits;
  const totalLimitUsed =
    (airdropLimitUsed || 0) +
    (lpLimitUsed || 0) +
    (boostLimitUsed || 0) +
    (CommunityWallet || 0);
  const toNumber = (v) => parseFloat(v?.toString?.() || "0");
  const RewardsWalletRedeem =toNumber(ledgerDetails?.totalRewardsWithdrawal);
  
  // Calculate Auto Positioning: fiveXLimitUsed - Current Balance - Redeemed
  const autoPositioningValue = Math.max(0, fiveXLimitUsed - parseFloat(totalRewards || 0) - RewardsWalletRedeem);
  
    // (totalLimitUsed || 0) -
    // (totalRewards || 0) -
    // toNumber(ledgerDetails?.daily_rewards?.AUTOPOSITION);

  // Console log everything
  console.log("sumLimits:", sumLimits.toFixed(2), "USDT");
  console.log("CommunityWallet:", CommunityWallet.toFixed(2), "USDT");
  console.log("totalLimitUsed:", totalLimitUsed.toFixed(2), "USDT");
  console.log("RewardsWalletRedeem:", RewardsWalletRedeem.toFixed(2), "USDT");
  console.log("Auto Positioning Calculation:", autoPositioningValue.toFixed(2), "USDT");

  const comm_rewards =
    toNumber(ledgerDetails?.daily_rewards?.XBONUS) +
    toNumber(ledgerDetails?.daily_rewards?.COMMUNITY_BOOSTER) +
    toNumber(ledgerDetails?.daily_rewards?.XPOWER) +
    toNumber(ledgerDetails?.daily_rewards?.cascade) +
    toNumber(ledgerDetails?.daily_rewards?.XMEN);

  const totalCommRewards = Number(
    (
      toNumber(ledgerDetails?.daily_rewards?.DAILY_REWARDS_LP) +
      toNumber(ledgerDetails?.daily_rewards?.DAILY_REWARDS_AIRDROP) +
      toNumber(ledgerDetails?.daily_rewards?.DAILY_REWARDS_BOOST) +
      toNumber(comm_rewards)
    ).toFixed(2)
  );
  const [macauRemaining, setMacauRemaining] = useState(null);

 const fetchMacauEventRemaining = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found.");

    // API endpoint (GET)
    const specificPath = "/withdrawals/MACAU_HK_EVENT";
    const finalUrl = `${API_URL}${specificPath}`;

    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Macau event rewards");
    }

    // data.totalRemaining contains what you need in Popup
    return data;

  } catch (error) {
    console.error("Error fetching Macau event rewards:", error);
    return null;
  }
};
  RewardsWalletRedeem;

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
    label,
    value,
    max,
    unit = "",
    color = "#4f8cff",
    rewards,
  }) => {
    const numericValue = parseFloat(value || "0");
    const numericMax = parseFloat(max || "0");

    let percentage =
      numericMax > 0 ? Math.min((numericValue / numericMax) * 100, 100) : 0;
    // If percentage is 0 but you want to show a sliver, set a minimum visual percentage
    const visualPercentage =
      percentage === 0 && numericMax > 0 ? 1.5 : percentage; // Show 1.5% as a minimum sliver if actual is 0


      const canRedeem =
  disableButtons === false &&
  ledgerDetails?.redeem === true &&
  !isLoading &&
  parseFloat(totalRewards || 0) > 0;

  const displayValue = Math.max(0, numericValue);
    return (
      <div className="mb-2 ProgressBardiv">
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
            {`${displayValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} `}
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

  const AutoPositioning = ({
    label,
    value,
    max,
    unit = "",
    color = "#4f8cff",
    rewards,
  }) => {
    const numericValue = parseFloat(value || "0");
    const numericMax = parseFloat(max || "0");
    const rewardsnumericValue = parseFloat(rewards || "0");

    let percentage =
      numericMax > 0 ? Math.min((numericValue / numericMax) * 100, 100) : 0;
    // If percentage is 0 but you want to show a sliver, set a minimum visual percentage
    const visualPercentage =
      percentage === 0 && numericMax > 0 ? 1.5 : percentage; // Show 1.5% as a minimum sliver if actual is 0

    return (
      <div className="mb-2 ProgressBardiv">
        <div
          style={{
            color: "#b3baff",
            fontSize: "0.700rem",
            fontWeight: 600,
            marginTop: "-5px",
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
          <h4
            className="card-title mb-0"
            style={{ color: "", fontSize: "18px" }}
          >
            {`${numericValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} `}
          </h4>
          <h4 className="m-0">/</h4>
          <div className="ProgressBardiv_inner_label_section">
            <h4
              className="card-title mb-0 ProgressBardiv_inner_headding"
              style={{ color: "#7fff4c" }}
            >
            {rewards != null
                ? Number(rewards).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </h4>
            <div className="ProgressBardiv_inner_label"></div>
          </div>
        </div>
      </div>
    );
  };
  const Redeemed_section = ({
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
      <div className="mb-2 ProgressBardiv Redeemed_button">
        <div
          style={{
            color: "#b3baff",
            fontSize: "0.700rem",
            fontWeight: 600,
            marginTop: "-5px",
          }}
        >
          {label}
        </div>
        <h4 className="mb-0 " style={{ color: "#fff", fontWeight: 600 }}>
          {`${numericValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${unit}`}
        </h4>
      </div>
    );
  };
const handleRedeemClick = async () => {
  const eventDates = ["2025-12-09", "2025-12-10", "2025-12-11", "2025-12-12"];
  const todayUTC = new Date().toISOString().split("T")[0];

  // Fetch remaining BEFORE deciding
  if (xRank && eventDates.includes(todayUTC)) {
    const data = await fetchMacauEventRemaining();
    if (data?.totalRemaining > 0) {
      setMacauRemaining(data.totalRemaining);
      setShowMacauPopup(true);
      return; 
    }
  }

  // Normal redeem (no popup)
  onRedeem();
};

  const currentDateOnlyUTC = new Date().toISOString().split("T")[0]; // e.g., "2025-06-27"
  const targetDateOnlyUTC = "2025-06-27";
  const show = currentDateOnlyUTC > targetDateOnlyUTC;
useEffect(() => {
    fetchRedeemEligibility();
  if (showMacauPopup && xRank) {
    fetchMacauEventRemaining().then((data) => {
      if (data) {
        setMacauRemaining(data.totalRemaining);
      }
    });
  }
}, [showMacauPopup, xRank]);


const canRedeem =
  !redeemEligibilityLoading &&
  redeemEligible === true &&
  disableButtons === false &&
  !isLoading &&
  parseFloat(totalRewards || 0) > 0;


  return (
    <>
    {/* Macau Event Popup */}
 {showMacauPopup && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "linear-gradient(145deg, #1e2746, #131a31)",
        padding: "35px 28px",
        borderRadius: "20px",
        width: "98%",
        maxWidth: "440px",
        textAlign: "center",
        boxShadow: "0 0 25px rgba(0,0,0,0.4)",
        border: "1px solid rgba(127,255,76,0.25)",
      }}
    >
      <h2
        style={{
          color: "#7fff4c",
          marginBottom: "12px",
          fontSize: "1.7rem",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        🎉 Macau & Hong Kong Event Contribution 🎉
      </h2>

      <p
        style={{
          color: "#e0e6ff",
          fontSize: "1rem",
          lineHeight: "1.6",
          marginBottom: "22px",
        }}
      >
        From <strong>9th to 12th December</strong>, all X-Rank users will have
        their <strong>daily rewards contributed</strong> toward the  
        <span style={{ color: "#7fff4c" }}> Macau & Hong Kong Elite Event Contribution.</span>
        <br /><br />
        When you redeem rewards during this period, they will be **credited to
        the event pool automatically**.  
      </p>
        {macauRemaining !== null && (
          <p style={{ color: "#7fff4c", marginBottom: "18px", fontSize: "1.1rem" }}>
            <strong>{macauRemaining} USDT</strong>
          </p>
        )}
<button
  onClick={async () => {
    try {
      setMacauLoading(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

      const response = await fetch(`${API_URL}/withdrawals/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletFrom: "COMMUNITY_REWARDS",
          amount: totalRewards, // or selected amount
          uniqueTransactionId: `MACAU_${Date.now()}`
        }),
      });

      const data = await response.json();
      setMacauLoading(false);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Event redeem failed");
      }

      // Close popup
      setShowMacauPopup(false);

      // Show Success Popup
      setShowSuccessPopup(true);

      // Refresh UI after successful deduction
      if (refreshLedgerDetails) refreshLedgerDetails();

    } catch (err) {
      setMacauLoading(false);
      console.error("Macau event redeem failed:", err);
      alert(err.message);
    }
  }}
  style={{
    width: "100%",
    padding: "14px",
    background: "rgba(127,255,76,0.2)",
    border: "1px solid rgba(127,255,76,0.4)",
    borderRadius: "12px",
    color: "#7fff4c",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  {macauLoading ? "Processing..." : "Continue"}
</button>

    </div>
  </div>
)}
{showSuccessPopup && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "linear-gradient(145deg, #16203b, #0f162b)",
        padding: "35px 28px",
        borderRadius: "20px",
        width: "90%",
        maxWidth: "420px",
        textAlign: "center",
        boxShadow: "0 0 25px rgba(0,255,0,0.25)",
        border: "1px solid rgba(127,255,76,0.35)",
      }}
    >
      {/* Green Tick */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(127,255,76,0.15)",
          border: "2px solid #7fff4c",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 20px",
        }}
      >
        <span style={{ fontSize: "3rem", color: "#7fff4c" }}>✔</span>
      </div>

      <h2 style={{ color: "#7fff4c", marginBottom: "10px" }}>
        Contribution Successful!
      </h2>

      <p style={{ color: "#d0d8ff", fontSize: "1rem", lineHeight: "1.5" }}>
        Your rewards have been successfully added to the  
        <strong style={{ color: "#7fff4c" }}> Macau & Hong Kong Event Contribution</strong>.
      </p>

      <button
        onClick={() => setShowSuccessPopup(false)}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "12px",
          background: "rgba(127,255,76,0.2)",
          border: "1px solid rgba(127,255,76,0.4)",
          borderRadius: "12px",
          color: "#7fff4c",
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

{
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
                Rewards Wallet (USDT)
              </h5>
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
          <div className="mt-0">
            <div
              className="card-title-first-balance"
              style={{ display: "flex", alignItems: "center", gap: "3px" }}
            >
              <h3 className="card-title mb-0" style={{ color: "#4f8cff" }}>
       
                {Math.max(0, parseFloat(fiveXLimitUsed)).toFixed(2)} 
              </h3>
              <h2>/</h2>
              <h4 style={{}} className="m-0">
                {totalCommRewards}
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
                  label="LP Wallet"
                  value={lpLimitUsed}
                  max={lpWalletData.balance * 2}
                  rewards={ledgerDetails?.daily_rewards?.DAILY_REWARDS_LP}
                  unit=" "
                  color="#00F0FF" // Teal/Cyan for Airdrop
                />
                 <ProgressBar
                  label="Boost Wallet"
                  value={boostLimitUsed}
                  max={boostWalletData.balance * 2}
                  unit=" "
                  color="#00F0FF" // Teal/Cyan for Airdrop
                  rewards={ledgerDetails?.daily_rewards?.DAILY_REWARDS_BOOST}
                />
              
            
              </div>
              <div>
               
                <ProgressBar
                  label="Community Wallet"
                  value={CommunityWallet}
                  max={fiveXData.balance * 2}
                  unit=" "
                  color="#00F0FF" // Teal/Cyan for Airdrop
                  rewards={comm_rewards}
                />
                 {firstLpDate && firstLpDate < cutoffDate ? (
                <ProgressBar
                  label="Airdrop Wallet"
                  value={airdropLimitUsed}
                  max={airdropWalletData.balance * 2}
                  rewards={ledgerDetails?.daily_rewards?.DAILY_REWARDS_AIRDROP}
                  unit=" "
                  color="#00F0FF"
                />
                ) : null}
              </div>
            </div>
            <div
              className="Rewards_Current_Balance"
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  color: "rgb(179, 186, 255)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  // marginTop: "-5px",
                }}
              >
                Current Balance
              </div>
              <h4 className="card-title mb-0" style={{ color: "#4f8cff" }}>
                {parseFloat(totalRewards).toFixed(2)}
              </h4>
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              gap: " .5rem",
            }}
          >
            <div
              className=""
              style={{
                width: "50%",
              }}
            >
              <AutoPositioning
                label="Auto Positioning"
                value={autoPositioningValue}
                max={fiveXLimitUsed}
                rewards={ledgerDetails?.daily_rewards?.AUTOPOSITION_TODAY}
                unit=" "
                color="#00F0FF"
              />
            </div>
            <div
              className=""
              style={{
                width: "50%",
              }}
            >
              <Redeemed_section
                className="mb-0"
                label="Redeemed"
                value={RewardsWalletRedeem}
                max={airdropWalletData.balance * 2}
                unit=" "
                color="#00F0FF"
              />
            </div>
          </div>
          <div className="buttonStyleouter" style={{ gap: " .5rem" }}>
            {show && (
              <div
                className="mt-2 d-flex gap-2 buttonStylePositioning"
                title={
                  disableButtons
                    ? "Connect Primary Vault to Enable Transactions"
                    : ""
                }
                // style={{
                //   width: "50%",
                // }}
              >
                {!isAutoPositioningActive && (
                  <button
                    title={
                      disableButtons
                        ? "Connect Primary Vault to Enable Transactions"
                        : ""
                    }
                    disabled={disableButtons}
                    onClick={() => onAutoPosition(false)} // explicitly set false
                    // disabled={isLoading || parseFloat(totalRewards) <= 0}
                    className="btn buttonStyleactivate"
                    style={{
                      ...buttonStyle,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "rgba(127, 255, 76, 0.1)",
                      border: "1px solid rgba(127, 255, 76, 0.2)",
                      color: "rgb(127, 255, 76)",
                      transition: "all 0.3s ease",
                      borderRadius: "12px",
                    }}
                  >
                    Auto Positioning
                  </button>
                )}

                {isAutoPositioningActive && (
                  <button
                    onClick={() => onAutoPosition(true)} // explicitly deactivate
                    //disabled={disableButtons}
                    className="btn buttonStyleDeactivate"
                    style={{
                      ...buttonStyle,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "rgba(127, 255, 76, 0.1)",
                      border: "1px solid #FF0000",
                      color: "#FF0000",
                      transition: "all 0.3s ease",
                      borderRadius: "12px",
                      padding: "0px",
                    }}
                  >
                    Deactivate Auto Positioning
                  </button>
                )}
              </div>
            )}

            <div
              className="mt-2 d-flex gap-2 buttonStylePositioning"
              title={
                disableButtons
                  ? "Connect Primary Vault to Enable Transactions"
                  : ""
              }
              // style={{
              //   width: "50%",
              // }}
            >
              <button
               // onClick={handleRedeemClick}
                 onClick={onRedeem}
                 disabled={!canRedeem}
                // disabled={true}  //{disableButtons}
                // disabled={
                //   disableButtons || isLoading || parseFloat(totalRewards) <= 0
                // }
                className="btn"
                style={buttonStyle}
              >
                {isLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
          </div>
          <div className="mt-2">
            <Link
              href="/dashboard/history/rewards"
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
    </div>}
      </>
  );
  
}
