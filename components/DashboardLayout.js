"use client";
import React, { useState, useEffect, useRef } from "react";
import WalletCard from "./WalletCard";
import SystemWalletCard from "./SystemWalletCard";
import InvitationLinkCard from "./InvitationLinkCard";
import Link from "next/link";
import DashboardNavbar from "./DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import TransferModal from "./TransferModal";
import LPWalletCard from "./LPWalletCard";
import CommunityRewardsCard from "./CommunityRewardsCard";
import CommunityWalletCard from "./CommunityWalletCard";
import LedgerHistoryTable from "./LedgerHistoryTable";
import SocialMediaAlert from "./SocialMediaAlert";
import ZeroRiskClaimModal from "./ZeroRiskClaimModal";
import AddLPModal from "./AddLPModal";
import ProgressBarsCard from "./ProgressBarsCard";
import TeamStatsCard from "./TeamStatsCard";
import { FaPaperPlane, FaGift } from "react-icons/fa";
import SuccessModal from "./SuccessModal";
import DashboardSidebar from "./DashboardSidebar";
import RedesignedDashboard from "./RedesignedDashboard";
import GlobalLoader from "../components/LoaderComponent";
import { RewardsWalletCard, ActionableWalletCard, BoostWalletCard } from "./PremiumWalletCards";
import CommunityRewardsCardnew from "./CommunityReward";
import Communitybooster from "../components/Communitybooster";
import X_PowerCard from "../components/XPowercard";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  BarElement,
  Legend,
} from "chart.js";
import { v4 as uuidv4 } from "uuid";
import X_BonusCard from "../components/XBonusCard";
import XCard from "../components/xCard";
import { Line, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import CommunityRewardsClaimModal from "./CommunityRewardsClaimModal";

// Icon Components (defined from your .jsx files)
const Wallet1Icon = (props) => (
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
      d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
    />
  </svg>
);

const ShieldCheckIcon = (props) => (
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
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
    />
  </svg>
);

const RocketLaunchIcon = (props) => (
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
      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.99 14.99 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
  </svg>
);

// Helper function to get ROI percentage based on balance
const getRoiPercentage = (balance) => {
  const bal = parseFloat(balance);
  if (bal >= 11000) return 0.6;
  if (bal >= 5000) return 0.6;
  if (bal >= 1000) return 0.5;
  if (bal >= 9) return 0.5;
  return 0;
};

// Now ChartJS is defined — safe to call:
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ChartDataLabels,
  Tooltip,
  Legend
);
// Modified LedgerInfoCard to accept an icon component and onTransferClick
// --- Chart Utility Functions (Moved out for reuse) ---
const CUTOFF_YMD = "2025-08-09";

function toLocalMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const CUTOFF = toLocalMidnight(new Date(CUTOFF_YMD));

function chooseConfig(startDate) {
  const start = toLocalMidnight(new Date(startDate));
  if (start.getTime() >= CUTOFF.getTime()) {
    return {
      weekLengths: [8, 7, 7, 8],
      usageValues: [50, 30, 20, 10],
    };
  }
  return {
    weekLengths: [2, 7, 7, 7, 8],
    usageValues: [50, 30, 20, 10, 5],
  };
}

function getOrdinalSuffix(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatSpanLabel(start, end) {
  const fmt = (d) =>
    d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getUsageLabels(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const { weekLengths } = chooseConfig(startDate);

  const labels = [];
  let current = new Date(start);

  for (let i = 0; i < weekLengths.length; i++) {
    if (current > end) break;
    const intervalStart = new Date(current);
    const intervalEnd = new Date(current);
    intervalEnd.setDate(intervalEnd.getDate() + weekLengths[i] - 1);
    if (intervalEnd > end) intervalEnd.setTime(end.getTime());
    labels.push({
      week: i + 1,
      label: formatSpanLabel(intervalStart, intervalEnd),
      start: new Date(intervalStart),
      end: new Date(intervalEnd),
    });
    current = new Date(intervalEnd);
    current.setDate(current.getDate() + 1);
  }
  return labels;
}

function getUsageValuesForRange(startDate) {
  return chooseConfig(startDate).usageValues;
}

function getCurrentIndexFromLabels(labels) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < labels.length; i++) {
    const start = new Date(labels[i].start);
    const end = new Date(labels[i].end);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    if (today >= start && today <= end) return i;
  }
  return -1;
}

const LedgerInfoCard = ({
  title,
  limit,
  pending,
  balance,
  IconComponent,
  showTransferButton = true,
  walletType,
  showClaimButton = false,
  onClaimClick,
  showEarningInfo = false,
  onTransferClick,
  showLimitInfo = true,
  countdownConfig,
  showUsageChart = false, // NEW PROP
  ZeroRiskUsageChart = false, // NEW PROP
  disableButtons,
}) => {
  const roiPercentage = showEarningInfo ? getRoiPercentage(balance) : 0;
  // const [timeRemaining, setTimeRemaining] = useState(null);

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (
      !countdownConfig ||
      !countdownConfig.steps ||
      !countdownConfig.startTimestamp ||
      title !== "Swift Wallet"
    ) {
      setTimeRemaining(null);
      return;
    }
    const calculateAndSetRemainingTime = () => {
      const { startTimestamp, steps } = countdownConfig;
      const now = new Date().getTime();

      if (now < startTimestamp) {
        setIsCountdownActive(false);
        return;
      }

      let cumulativeHours = 0;
      for (const step of steps) {
        const stepEndTimestamp =
          startTimestamp +
          (cumulativeHours + step.durationHours) * 60 * 60 * 1000;

        if (now < stepEndTimestamp) {
          const distance = stepEndTimestamp - now;
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeRemaining({ days, hours, minutes, seconds });
          setIsCountdownActive(true);
          return;
        }

        cumulativeHours += step.durationHours;
      }

      // Promotion is over
      setIsCountdownActive(false);
    };

    // Run once immediately on load
    calculateAndSetRemainingTime();

    // Then, run every second
    const intervalId = setInterval(calculateAndSetRemainingTime, 1000);

    return () => clearInterval(intervalId);
  }, [countdownConfig, title]);

  // Detect current week index
  const today = new Date().getDate();

  const barColors = ["rgb(127, 255, 76)", "rgb(127, 255, 76)"];

  const { user } = useAuth();

  let firstLpTs = user?.firstLpDepositTs;

  if (!firstLpTs) {
    console.warn(
      "firstLpDepositTs not found on user. Using current date instead."
    );
    firstLpTs = new Date().toISOString(); // fallback to current date
  }

  const startDate = new Date(firstLpTs);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 29);
  const usageLabels = getUsageLabels(startDate, endDate);
  const usageValues = getUsageValuesForRange(startDate);

  // Y-axis config
  const startY = 0;
  const endY = 70;
  const stepSize = 10;

  // Date labels
  const startDateLabel = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDateLabel = new Date(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const currentIndex = getCurrentIndexFromLabels(usageLabels);


  // 📈 Chart Data

  const chartData = {
    labels: usageLabels.map((label) => label.label), // "1st-8th", etc.
    datasets: [
      {
        label: "Usage %",
        data: usageValues,
        backgroundColor: usageLabels.map((_, index) =>
          index === currentIndex ? "rgb(255, 215, 0)" : "rgb(127, 255, 76)"
        ),
        borderRadius: 6,
        barThickness: 30,
      },
    ],
  };

  // ⚙️ Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "end",
        display: true,
        color: "#ffffff",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => `${value}%`,
      },
      endDateLabelPlugin: {
        afterDatasetsDraw: (chart) => {
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);
          const lastBar = meta.data[meta.data.length - 1];
          if (!lastBar) return;

          const labelX = lastBar.x + 24; // spacing from bar
          const labelY = lastBar.y + lastBar.height / 2;

          ctx.save();
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "rgb(127, 255, 76)";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(endDateLabel, labelX, labelY);
          ctx.restore();
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: startY,
        max: endY,
        ticks: {
          stepSize: stepSize,
          callback: function (value) {
            if (value === startY) return startDateLabel;
            if (value === endY) return "";
            return "";
          },
          color: "rgb(127, 255, 76)",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      x: {
        ticks: {
          color: "#b3baff",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };

  return (
    <div
      className="card h-100"
      style={{
        background: "#000000",
        borderRadius: "22px",
        boxShadow: "0 8px 32px 0 rgba(255, 215, 0, 0.1)",
        border: "1px solid rgba(255, 215, 0, 0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {title === "Airdrop Wallet" && (
        <img
          src="/assets/img/illustrations/trophy.png"
          alt="Airdrop Trophy"
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            width: "100px",
            opacity: 0.15,
            pointerEvents: "none",
          }}
        />
      )}
      <div className="card-body single-card-style">
        <div>
          <div className="d-flex align-items-start justify-content-between">
            <div className="card-title mb-0">
              <h5 className="mb-0" style={{ color: "#fff" }}>
                {title}
              </h5>
              <small style={{ color: "#b3baff" }}>Available Balance</small>
            </div>

            <div className="d-flex align-items-center">
              {onTransferClick && (
                <div className="main-btn-icon">
                  <div className="main-btn-icon-inner">
                    <div
                      title={
                        disableButtons
                          ? "Connect Primary Vault to Enable Transactions"
                          : ""
                      }
                    >
                      <button
                        disabled={disableButtons}
                        onClick={onTransferClick}
                        className="btn btn-icon"
                        style={{
                          background: "rgba(127, 255, 76, 0.1)",
                          border: "1px solid rgba(127, 255, 76, 0.2)",
                          width: "45px",
                          height: "45px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          color: "rgb(127, 255, 76)",
                          padding: "0.25rem",
                          alignSelf: "flex-start",
                        }}
                        title="Transfer USDT"
                      >
                        <FaPaperPlane size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 d-flex align-items-center justify-content-between">
            <div>
              <h3 className="card-title mb-0" style={{ color: "#ffd700" }}>
                {parseFloat(balance).toFixed(6)} USDT
              </h3>
              {isCountdownActive && (
                <div className="timer-container">
                  <div className="timer-remaining">
                    <small className="timer-note">
                      100% Usage Available Until:
                    </small>
                    <div className="timer-text">
                      <div className="timer-text">
                        <div className="time-unit">
                          <span className="number">
                            {String(timeRemaining.days).padStart(2, "0")}
                          </span>
                          <span className="label">d</span>
                        </div>
                        <div className="time-unit">
                          <span className="number">
                            {String(timeRemaining.hours).padStart(2, "0")}
                          </span>
                          <span className="label">h</span>
                        </div>
                        <div className="time-unit">
                          <span className="number">
                            {String(timeRemaining.minutes).padStart(2, "0")}
                          </span>
                          <span className="label">m</span>
                        </div>
                        <div className="time-unit">
                          <span className="number">
                            {String(timeRemaining.seconds).padStart(2, "0")}
                          </span>
                          <span className="label">s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showLimitInfo && (
                <div>
                  {limit != null && (
                    <small style={{ color: "#b3baff" }}>
                      Limit: {parseFloat(limit).toFixed(6)} USDT
                    </small>
                  )}
                  {parseFloat(pending) > 0 && (
                    <div>
                      <small style={{ color: "#FFD700" }}>
                        Pending: {parseFloat(pending).toFixed(6)} USDT
                      </small>
                    </div>
                  )}
                  {showEarningInfo && roiPercentage > 0 && (
                    <div>
                      <small style={{ color: "#7FFF4C" }}>
                        Earning {roiPercentage}% daily
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          {showUsageChart && (
            <div style={{ width: "100%", maxWidth: 500, margin: "0 auto" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          {ZeroRiskUsageChart && (
            <div style={{ marginTop: "1.5rem" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          {showClaimButton && (
            <div className="mt-4">
              <div
                title={
                  disableButtons
                    ? "Connect Primary Vault to Enable Transactions"
                    : ""
                }
              >
                <button
                  disabled={disableButtons}
                  className="btn w-100"
                  style={{
                    background: "rgba(255, 215, 0, 0.1)",
                    color: "#ffd700",
                    border: "1px solid rgba(255, 215, 0, 0.2)",
                    borderRadius: "12px",
                    padding: "0.75rem",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onClick={onClaimClick}
                >
                  Redeem
                </button>
              </div>
            </div>
          )}
          <div className="mt-4">
            <Link
              href={
                walletType === "boost"
                  ? "#"
                  : `/dashboard/history/${walletType}`
              }
              className="btn w-100"
              style={{
                background: "rgba(127, 255, 76, 0.1)",
                border: "1px solid rgba(127, 255, 76, 0.2)",
                color: "rgb(127, 255, 76)",
                width: "45px",
                height: "45px",
                borderRadius: "12px",
                cursor: walletType === "boost" ? "not-allowed" : "pointer",
                pointerEvents: walletType === "boost" ? "none" : "auto",
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                opacity: walletType === "boost" ? 0.5 : 1, // Dim if disabled
              }}
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
  walletAccount,
  walletTransactionStatus,
  walletDebugMessage,
  onWalletConnect,
  onWalletDisconnect,
  onOpenAmountModal,
  walletBalance = "0",
  ledgerDetails,
  loadingLedger,
  ledgerError,
  refreshLedgerDetails,
  successModalTrigger,
}) {

  const { user, logout, loading: authLoading, API_URL, setUser } = useAuth();
  const [isAutoPositioningActive, setIsAutoPositioningActive] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferModalError, setTransferModalError] = useState(null);
  const [transferModalLoading, setTransferModalLoading] = useState(false);
  const [transferModalSuccess, setTransferModalSuccess] = useState(false);
  const [isSocialAlertOpen, setIsSocialAlertOpen] = useState(false);
  const [showZeroRiskWarningModal, setShowZeroRiskWarningModal] =
    useState(false);
  const [zeroRiskClaimLoading, setZeroRiskClaimLoading] = useState(false);
  const [zeroRiskClaimError, setZeroRiskClaimError] = useState(null);
  const [communityRewardsLoading, setCommunityRewardsLoading] = useState(false);
  const [communityRewardsError, setCommunityRewardsError] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAddLPModalOpen, setIsAddLPModalOpen] = useState(false);
  const [addLPLoading, setAddLPLoading] = useState(false);
  const [addLPError, setAddLPError] = useState(null);
  const [airdropConfig, setAirdropConfig] = useState(null);
  const [isCommunityRewardsModalOpen, setIsCommunityRewardsModalOpen] =
    useState(false);
  const [communityRewardsClaimLoading, setCommunityRewardsClaimLoading] =
    useState(false);
  const [communityRewardsClaimError, setCommunityRewardsClaimError] =
    useState(null);

  // State for the new success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: "",
    message: "",
    transactionHash: null,
  });
  const lastSuccessModalIdRef = useRef(null);

  // State for the new claim community rewards modal (if we add one later)
  const [isClaimRewardsModalOpen, setIsClaimRewardsModalOpen] = useState(false);
  const [claimActionLoading, setClaimActionLoading] = useState(false);
  const [claimActionError, setClaimActionError] = useState(null);
  const [socialAlertLoading, setSocialAlertLoading] = useState(true);
  const formatPrimaryBalance = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "0.000000";
    return numeric.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 12,
    });
  };

  // -------------------------------------------------------------
  // Track whether withdrawals are currently disabled for the user
  // -------------------------------------------------------------
  const [withdrawalsDisabled, setWithdrawalsDisabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("disableWithdrawal") || "false");
    } catch {
      return false;
    }
  });

  // On mount (and whenever the authenticated user changes) check the flag via API once
  useEffect(() => {
    const checkWithdrawalsDisabled = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${API_URL}/withdrawals/disabled`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data && typeof data.disableWithdrawal !== "undefined") {
          localStorage.setItem("disableWithdrawal", data.disableWithdrawal);
          setWithdrawalsDisabled(data.disableWithdrawal);
        }
      } catch (e) {
        console.error("Failed to fetch withdrawalDisabled flag:", e);
      }
    };
    /* 
          const acknowledged = localStorage.getItem("bepvault_upgrade_ack");
          if (!acknowledged) {
            setIsSocialAlertOpen(true);
          }
          */

    // Unnecessary redundant calls removed
    // checkWithdrawalsDisabled();
    setIsAutoPositioningActive(user?.autopositioning);
  }, [user, API_URL]);

  useEffect(() => {
    if (!successModalTrigger?.id) return;
    if (lastSuccessModalIdRef.current === successModalTrigger.id) return;
    lastSuccessModalIdRef.current = successModalTrigger.id;
    setSuccessModalContent({
      title: successModalTrigger.title || "Transaction Success",
      message: successModalTrigger.message,
      transactionHash: successModalTrigger.transactionHash || null,
    });
    setIsSuccessModalOpen(true);
  }, [successModalTrigger]);

  /* Unnecessary initial call for airdrop config
  useEffect(() => {
    const fetchAirdropConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/promotions/airdrop-config`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const config = await response.json();
          setAirdropConfig(config);
          
        } else {
          console.error("Failed to fetch airdrop config");
        }
      } catch (error) {
        console.error("Error fetching airdrop config:", error);
      }
    };

    fetchAirdropConfig();
  }, [API_URL]);
  */

  /* Crashing API call - endpoint /ledger/social-visibility is missing in backend
  useEffect(() => {
    const fetchSocialAlertVisibility = async () => {
      try {
        // Already acknowledged → skip API
        if (localStorage.getItem("bepvault_upgrade_ack") === "true") {
          setSocialAlertLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setSocialAlertLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/ledger/social-visibility`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setSocialAlertLoading(false);
          return;
        }

        const data = await response.json();

        if (data?.success) {
          setIsSocialAlertOpen(Boolean(data.visible));
        }
      } catch (error) {
        console.error("Error fetching social alert visibility:", error);
      } finally {
        setSocialAlertLoading(false);
      }
    };

    fetchSocialAlertVisibility();
  }, [API_URL]);
  */



  useEffect(() => {
    const handleWalletConnection = async () => {
      if (walletAccount && user && !authLoading) {
        if (!user.wallet_address) {
          try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No auth token");

            const response = await fetch(`${API_URL}/users/wallet-address`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ wallet_address: walletAccount }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Failed to save wallet address.");
            }

            if (setUser) {
              setUser({ ...user, wallet_address: walletAccount });
            }
          } catch (error) {
            console.error("Error saving wallet address:", error.message);
          }
        } else if (user.wallet_address !== walletAccount) {
          console.warn("Wallet mismatch: Connected wallet doesn't match registered address.");
        }
      }
    };

    handleWalletConnection();
  }, [walletAccount, user, authLoading, API_URL, setUser]);

  const openTransferModal = () => {
    setTransferModalError(null); // Clear previous errors
    setTransferModalSuccess(false); // Reset success state
    setIsTransferModalOpen(true);
  };
  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferModalSuccess(false); // Ensure reset on close
  };

  const handleSwiftTransferSubmit = async ({ recipientEmail, amount }) => {
    setTransferModalLoading(true);
    setTransferModalError(null);
    setTransferModalSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const specificPath = "/swift-transfers/transfer"; // Path relative to API_URL
      const finalUrl = `${API_URL}${specificPath}`;


      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientEmail, amount }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit transfer.");

      setTransferModalSuccess(true); // Set success state
      if (refreshLedgerDetails) refreshLedgerDetails();
    } catch (error) {
      console.error("Swift Transfer error:", error);
      setTransferModalError(error.message || "An unexpected error occurred.");
    } finally {
      setTransferModalLoading(false);
    }
  };

  const handleZeroRiskClaim = async (amount, uniqueTransactionId) => {
    setZeroRiskClaimLoading(true);
    setZeroRiskClaimError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const specificPath = "/withdrawals/usdt";
      const finalUrl = `${API_URL}${specificPath}`;

      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          walletFrom: "ZERO_RISK",
          uniqueTransactionId,
        }),
      });

      const data = await response.json();

      // ✅ Store disableWithdrawal flag if available
      if (typeof data.disableWithdrawal !== "undefined") {
        localStorage.setItem("disableWithdrawal", data.disableWithdrawal);
        setWithdrawalsDisabled(data.disableWithdrawal);
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to process claim.");
      }

      // ✅ Close the warning modal
      setShowZeroRiskWarningModal(false);

      // ✅ Show styled success modal with transferredAmount & ecosystemFee
      setSuccessModalContent({
        title: "Redemption Successful!",
        message: (
          <>
            <p>
              Your funds have been successfully processed and sent to your
              registered USDT address.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <p>Transferred Amount: {data.transferredAmount} USDT</p>
              {/* <p>Ecosystem Fee: {data.ecosystemFee} USDT</p> */}
            </p>
          </>
        ),
        transactionHash: data.transactionHash,
      });

      setIsSuccessModalOpen(true);

      if (refreshLedgerDetails) refreshLedgerDetails();
    } catch (error) {
      console.error("Zero Risk claim error:", error);
      setZeroRiskClaimError(error.message || "An unexpected error occurred.");

      if (typeof error.disableWithdrawal !== "undefined") {
        localStorage.setItem("disableWithdrawal", error.disableWithdrawal);
        setWithdrawalsDisabled(error.disableWithdrawal);
      }
    } finally {
      setZeroRiskClaimLoading(false);
    }
  };

  const handleRedeemRewards = async () => {
    setCommunityRewardsLoading(true);
    setCommunityRewardsError(null); // Clear previous errors

    const pendingRewardsAmount = parseFloat(
      ledgerDetails?.communityRewards?.pending || "0.0"
    );

    if (pendingRewardsAmount <= 0) {
      setCommunityRewardsError("No pending rewards to redeem.");
      setCommunityRewardsLoading(false);
      // Optionally, display this error to the user more formally
      console.warn(
        "Attempted to redeem rewards when pending amount is zero or less."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const specificPath = "/ledger/transfer-rewards-to-usdt";
      const finalUrl = `${API_URL}${specificPath}`;


      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: pendingRewardsAmount.toString() }), // Send amount in body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to redeem rewards to Primary Vault."
        );
      }

      // Successfully redeemed, refresh ledger details
      if (refreshLedgerDetails) {
        refreshLedgerDetails();
      }
      // Optionally, show a success message to the user
    } catch (error) {
      console.error("Community rewards redemption to USDT error:", error);
      setCommunityRewardsError(
        error.message || "An unexpected error occurred during redemption."
      );
      // Potentially display this error to the user more formally
    } finally {
      setCommunityRewardsLoading(false);
    }
  };

  const handleAutoPosition = async () => {
    // Implement auto position logic here

  };

  const handleAddLP = async (transferAmount) => {
    setAddLPLoading(true);
    setAddLPError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const specificPath = "/ledger/add-lp";
      const finalUrl = `${API_URL}${specificPath}`;


      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transferAmount }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to transfer to LP wallet.");

      setIsAddLPModalOpen(false);
      if (refreshLedgerDetails) refreshLedgerDetails();
    } catch (error) {
      console.error("Add LP error:", error);
      setAddLPError(error.message || "An unexpected error occurred.");
    } finally {
      setAddLPLoading(false);
    }
  };

  const handleClaimCommunityRewards = async (amountToClaim) => {
    if (!user?.wallet_address) {
      setClaimActionError(
        "Your wallet address is not set. Please connect your wallet first."
      );
      return;
    }
    if (!amountToClaim || parseFloat(amountToClaim) <= 0) {
      setClaimActionError("Invalid amount to claim.");
      return;
    }

    setClaimActionLoading(true);
    setClaimActionError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const specificPath = "/withdrawals/usdt";
      const finalUrl = `${API_URL}${specificPath}`;


      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountToClaim.toString(),
          walletFrom: "COMMUNITY_REWARDS",
          uniqueTransactionId: uuidv4(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (typeof data.disableWithdrawal !== "undefined") {
          localStorage.setItem("disableWithdrawal", data.disableWithdrawal);
          setWithdrawalsDisabled(data.disableWithdrawal);
        }
        throw new Error(data.message || "Failed to claim community rewards.");
      }

      // Close modal if it was open: setIsClaimRewardsModalOpen(false);
      setSuccessModalContent({
        title: "Redemption Successful!",
        message:
          "Your community rewards have been successfully redeemed and sent to your registered USDT address.",
        transactionHash: data.transactionHash,
      });
      setIsSuccessModalOpen(true);
      if (refreshLedgerDetails) refreshLedgerDetails();
      // Add success notification/toast here if desired
    } catch (error) {
      console.error("Claim Community Rewards error:", error);
      setClaimActionError(error.message || "An unexpected error occurred.");
    } finally {
      setClaimActionLoading(false);
    }
  };

  const handleCommunityRewardsClaim = async (amount) => {
    setCommunityRewardsClaimLoading(true);
    setCommunityRewardsClaimError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const specificPath = "/withdrawals/usdt";
      const finalUrl = `${API_URL}${specificPath}`;

      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          walletFrom: "COMMUNITY_REWARDS",
          uniqueTransactionId: uuidv4(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to process rewards withdrawal."
        );
      }

      // ✅ Close claim modal
      setIsCommunityRewardsModalOpen(false);

      // ✅ Show global success modal with styled message
      setSuccessModalContent({
        title: "Redeem Successful!",
        message: (
          <>
            <p>
              Your funds have been successfully processed and sent to your
              registered USDT address.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <p>Transferred Amount: {data.transferredAmount} USDT</p>

              <p>Ecosystem Fee: {data.ecosystemFee} USDT</p>
            </p>
          </>
        ),
        transactionHash: data.transactionHash,
      });

      setIsSuccessModalOpen(true);

      if (refreshLedgerDetails) refreshLedgerDetails();
      return data;
    } catch (error) {
      console.error("Community Rewards claim error:", error);
      setCommunityRewardsClaimError(
        error.message || "An unexpected error occurred."
      );
      if (typeof error.disableWithdrawal !== "undefined") {
        localStorage.setItem("disableWithdrawal", error.disableWithdrawal);
        setWithdrawalsDisabled(error.disableWithdrawal);
      }
      return null;
    } finally {
      setCommunityRewardsClaimLoading(false);
    }
  };

  const onAutoPosition = async (deactivate = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const finalUrl = `${API_URL}/ledger/autopositioning${deactivate ? "?deactivate=true" : ""
        }`;

      setCommunityRewardsClaimLoading(true);

      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      // If it's a network error (like 500), then show the error.
      if (!response.ok && response.status >= 500) {
        throw new Error(data.message || "Failed autopositioning");
      }

      // Treat all other responses (even with 200 + success: false) as successful
      setIsAutoPositioningActive(!deactivate);
      setSuccessModalContent({
        title: "Success!",
        message: deactivate
          ? "Autopositioning has been deactivated."
          : "You have been successfully autopositioned.",
      });
      setIsSuccessModalOpen(true);

      if (refreshLedgerDetails) refreshLedgerDetails();
    } catch (err) {
      setCommunityRewardsClaimError(err.message || "Something went wrong.");
    } finally {
      setCommunityRewardsClaimLoading(false);
    }
  };

  useEffect(() => {
    // This useEffect is primarily for logging and can be removed or adjusted
    console.log(
      "[DashboardLayout] User object received from AuthContext:",
      user
    );
  }, [user]);

  // DEBUGGING LOGS for ZeroRiskClaimModal props
  console.log(
    "[DashboardLayout] Rendering cycle. ledgerDetails available: ",
    !!ledgerDetails
  );
  if (ledgerDetails) {
    console.log(
      "[DashboardLayout] ledgerDetails.zeroRisk?.balance from props:",
      ledgerDetails.zeroRisk?.balance
    );
    console.log(
      "[DashboardLayout] ledgerDetails.bnbWallet?.balance:",
      ledgerDetails.bnbWallet?.balance
    );
    console.log(
      "[DashboardLayout] ledgerDetails.lpWallet?.balance:",
      ledgerDetails.lpWallet?.balance
    );
  }



  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "white",
          background: "#101935",
          height: "100vh",
        }}
      >
        User data not available. You might need to log in.
      </div>
    );
  }

  // Log the user object to inspect its structure


  const disableButtons = !walletAccount || walletAccount === "";





  // Calculate props for ZeroRiskClaimModal safely
  const primaryVaultBalanceForModal = parseFloat(
    ledgerDetails?.bnbWallet?.balance || "0.0"
  );

  const lpBalanceForModal = parseFloat(
    ledgerDetails?.lpWallet?.balance || "0.0"
  );
  // For the modal's maxAmount, we should use the dynamically calculated balance from ledgerDetails
  const maxAmountForModal = parseFloat(
    ledgerDetails?.zeroRisk?.balance || "0.0"
  );

  const zeroRiskDisplayBalance = Math.max(
    0,
    parseFloat(ledgerDetails?.zeroRisk?.balance || "0.0")
  );
  console.log(
    "[DashboardLayout] Calculated zeroRiskDisplayBalance:",
    zeroRiskDisplayBalance
  );
  console.log(
    "[DashboardLayout] Calculated walletBalanceForModal:",
    primaryVaultBalanceForModal
  );
  console.log(
    "[DashboardLayout] Calculated lpBalanceForModal:",
    lpBalanceForModal
  );
  console.log(
    "[DashboardLayout] Calculated maxAmountForModal for modal:",
    maxAmountForModal
  );



  const handleClosePopup = () => {
    localStorage.setItem("bepvault_upgrade_ack", "true");
    setIsSocialAlertOpen(false);
  };

  const rawBalance =
    Number(ledgerDetails?.lpWallet?.balance || 0) -
    Number(ledgerDetails?.lpWallet?.autopositioning || 0);

  const displayBalance = Math.max(rawBalance, 0);

  // Boost Wallet Chart Data
  const bFirstLpTs = user?.firstLpDepositTs || new Date().toISOString();
  const bStartDate = new Date(bFirstLpTs);
  const bEndDate = new Date(bStartDate);
  bEndDate.setDate(bStartDate.getDate() + 29);

  // 📊 Weekly Boost usage data
  const bUsageLabels = getUsageLabels(bStartDate, bEndDate);
  const bUsageValues = getUsageValuesForRange(bStartDate);
  const bCurrentIndex = getCurrentIndexFromLabels(bUsageLabels);

  const boostChartData = {
    labels: bUsageLabels.map((l, i) => `0${i + 1}`),
    datasets: [
      {
        type: 'line',
        label: "Primary Trend",
        data: bUsageValues,
        borderColor: "#ff8c00", // Dark Orange
        backgroundColor: "rgba(255, 140, 0, 0.1)",
        borderWidth: 4,
        pointBackgroundColor: "#ffd700", // Gold/Yellow point
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: false,
      },
      {
        type: 'line',
        label: "Secondary Trend",
        data: bUsageValues.map(v => v * 0.7 + 5), // Secondary data line
        borderColor: "#a020f0", // Purple
        backgroundColor: "rgba(160, 32, 240, 0.1)",
        borderWidth: 4,
        pointBackgroundColor: "#ff00ff", // Magenta/Purple point
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const boostChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10, 15, 25, 0.95)",
        titleColor: "#ffd700",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
      datalabels: {
        display: (ctx) => ctx.datasetIndex === 0, // Only show for primary line
        color: "#fff",
        font: { size: 10, weight: 'bold', family: 'Inter' },
        formatter: (value) => `${value}%`,
        align: 'top',
        anchor: 'end',
        offset: 8,
      }
    },
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        max: 85,
        grid: {
          color: "rgba(255, 255, 255, 0.05)", // Visible grid lines as in image
          drawBorder: false,
        },
        ticks: { display: false }
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)", // Visible vertical lines
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10, weight: '700', family: 'Inter' },
          padding: 10
        }
      }
    }
  };

  // Shadow/Glow Plugin for Chart.js
  const glowPlugin = {
    id: 'glowPlugin',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      ctx.save();
    },
    afterDatasetDraw: (chart, args) => {
      if (args.meta.type === 'line') {
        const { ctx } = chart;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        args.meta.dataset.draw(ctx);
        ctx.restore();
      }
    }
  };


  return (
    <>
      {showLoader && <GlobalLoader />}

      <RedesignedDashboard
        user={user}
        onLogout={logout}
        walletAccount={walletAccount}
        onWalletConnect={onWalletConnect}
        onWalletDisconnect={onWalletDisconnect}
        onOpenZeroRiskModal={() => setShowZeroRiskWarningModal(true)}
        onOpenAddLPModal={() => setIsAddLPModalOpen(true)}
        onRedeem={() => setIsCommunityRewardsModalOpen(true)}
        ledgerDetails={ledgerDetails}
        orbitCard1={
          <ActionableWalletCard
            title="Primary Wallet"
            type="system"
            subtitle={
              (walletAccount && walletAccount.trim())
                ? `CONNECTED • ${walletAccount.trim().slice(0, 6)}...${walletAccount.trim().slice(-4)}`
                : "CONNECT WALLET"
            }
            layout="horizontal"
            showPlusBtn={false}
            balance={formatPrimaryBalance(ledgerDetails?.bnbWallet?.balance || "0")}
            currency="BNB"
            onDeposit={walletAccount ? onOpenAmountModal : onWalletConnect}
            depositLabel={walletAccount ? "Deposit" : "Connect"}
            onViewHistory={() => window.location.href = "/dashboard/ledger"}
          />
        }
        orbitCard2={
          <ActionableWalletCard
            title="Stable Pool"
            type="zero-risk"
            balance={parseFloat(ledgerDetails?.zeroRisk?.balance || "0.0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            limit={parseFloat(ledgerDetails?.zeroRisk?.limit || "0.0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            earningRate={getRoiPercentage(ledgerDetails?.zeroRisk?.balance) + "% Daily"}
            showPlusBtn={false}
            depositLabel="Withdraw"
            onDeposit={() => setShowZeroRiskWarningModal(true)}
            onViewHistory={() => window.location.href = "/dashboard/history/zero-risk"}
          />
        }
        orbitCard3={
          <RewardsWalletCard
            totalBalance={(
              parseFloat(ledgerDetails?.communityRewards?.balance || "0") +
              parseFloat(ledgerDetails?.lpWallet?.balance || "0") +
              parseFloat(ledgerDetails?.boostWallet?.balance || "0") +
              parseFloat(ledgerDetails?.airdropWallet?.balance || "0")
            ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            lpBalance={parseFloat(ledgerDetails?.lpWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            communityBalance={parseFloat(ledgerDetails?.communityRewards?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            boostBalance={parseFloat(ledgerDetails?.boostWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            airdropBalance={parseFloat(ledgerDetails?.airdropWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            currentBalance={parseFloat(ledgerDetails?.communityRewards?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            autoPositioning={parseFloat(ledgerDetails?.fiveXLimit?.used || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            redeemed={parseFloat(ledgerDetails?.totalRewardsWithdrawal || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            onAutoPosition={() => onAutoPosition(false)}
            onRedeem={() => setIsCommunityRewardsModalOpen(true)}
            onViewHistory={() => window.location.href = "/dashboard/ledger"}
          />
        }
        orbitCard4={
          <BoostWalletCard
            title="Boost Wallet"
            balance={parseFloat(ledgerDetails?.boostWallet?.balance || "0.0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            limit={parseFloat(ledgerDetails?.boostWallet?.limit || "0.0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            earningRate={getRoiPercentage(ledgerDetails?.boostWallet?.balance) + "% Daily"}
            chartData={boostChartData}
            chartOptions={boostChartOptions}
            plugins={[glowPlugin]}
            onViewHistory={() => window.location.href = "/dashboard/history/boost"}
          />
        }
        extraHubCard={<Communitybooster />}
        bottomCards={
          <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Analytical & Rewards Stack stays below the Hub circle */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-xl-7">
                <X_BonusCard />
              </div>
              <div className="col-12 col-xl-5">
                <CommunityRewardsCardnew />
              </div>
            </div>
          </div>
        }
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 100px' }}>
          {children}
        </div>
      </RedesignedDashboard>
      {isTransferModalOpen && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={closeTransferModal}
          onSubmit={handleSwiftTransferSubmit}
          currentSwiftBalance={parseFloat(
            ledgerDetails?.swiftWallet?.balance || "0.0"
          )}
          error={transferModalError}
          isLoading={transferModalLoading}
          isSuccess={transferModalSuccess}
        />
      )}
      {/* <SocialMediaAlert
        isOpen={isSocialAlertOpen}
         onClose={handleClosePopup}
       // onClose={() => setIsSocialAlertOpen(false)}
      /> */}
      <ZeroRiskClaimModal
        isOpen={showZeroRiskWarningModal}
        onClose={() => setShowZeroRiskWarningModal(false)}
        onSubmit={handleZeroRiskClaim}
        maxAmount={maxAmountForModal} // Use the dynamically calculated zeroRisk.balance
        isLoading={zeroRiskClaimLoading}
        error={zeroRiskClaimError}
        primaryVaultBalance={primaryVaultBalanceForModal}
        // lpBalance={zeroRiskDisplayBalance}
        lpBalance={zeroRiskDisplayBalance} // <-- fix
        // isFirstLPMade might still be relevant for the warning text logic within the modal
        isFirstLPMade={
          parseFloat(ledgerDetails?.lpWallet?.limit || "0.0") > 0
        }
      />
      <AddLPModal
        isOpen={isAddLPModalOpen}
        onClose={() => setIsAddLPModalOpen(false)}
        onSubmit={handleAddLP}
        primaryVaultBalance={parseFloat(ledgerDetails?.bnbWallet?.balance || "0.0")}
        swiftBalance={parseFloat(ledgerDetails?.swiftWallet?.balance || "0.0")}
        isFirstLP={parseFloat(ledgerDetails?.swiftWallet?.limit || "0.0") === 0}
        isLoading={addLPLoading}
        error={addLPError}
        airdropConfig={airdropConfig}
      />
      <CommunityRewardsClaimModal
        isOpen={isCommunityRewardsModalOpen}
        onClose={() => setIsCommunityRewardsModalOpen(false)}
        onSubmit={handleCommunityRewardsClaim}
        maxAmount={parseFloat(
          ledgerDetails?.communityRewards?.balance || "0.0"
        )}
        isLoading={communityRewardsClaimLoading}
        error={communityRewardsClaimError}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalContent.title}
        message={successModalContent.message}
        transactionHash={successModalContent.transactionHash}
      />
    </>
  );
}
