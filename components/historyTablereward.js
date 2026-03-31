"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTxUrl } from "@/utils/explorer";
// import RefIdDisplay from "@/RefIdDisplay";

export default function HistoryTableReward({ filters, walletType = null }) {
  const { user, API_URL, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log(
    entries,
    "==================================================================entries"
  );
  function RefIdDisplay({ refId }) {
    const [copied, setCopied] = useState(false);

    if (!refId || refId.trim() === "") {
      return null; // don't render anything if blank
    }

    const handleCopy = () => {
      navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    };

    const shortRefId = `${refId.substring(0, 8)}...${refId.substring(
      refId.length - 6
    )}`;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {refId !== "N/A" ? (
          <a
            href={getTxUrl(refId)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              color: "#b3baff",
              textDecoration: "underline",
            }}
          >
            {shortRefId}
          </a>
        ) : (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              color: "#b3baff",
            }}
          >
            {shortRefId}
          </span>
        )}

        <button
          onClick={handleCopy}
          style={{
            cursor: "pointer",
            border: "none",
            background: "none",
            color: "#b3baff",
            fontSize: "1rem",
            padding: "2px",
          }}
          title="Copy full Ref ID"
        >
          📋
        </button>

        {copied && (
          <span style={{ fontSize: "0.75rem", color: "green" }}>Copied!</span>
        )}
      </div>
    );
  }
  useEffect(() => {
    const fetchLedgerHistory = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const queryParams = new URLSearchParams({
          ...(filters.wallet && { wallet: filters.wallet }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        });

        const apiUrl =
          `${API_URL}/ledger/community-rewards?${queryParams.toString()}`
            .replace(/\/+/g, "/")
            .replace(":/", "://");

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            throw new Error("Session expired. Please login again.");
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          setEntries(data.entries || []);
        } else {
          throw new Error(data.message || "Failed to fetch ledger history");
        }
      } catch (err) {
        console.error("Error fetching ledger history:", err);
        setError(
          err.message || "An error occurred while fetching ledger history"
        );
        if (err.message.includes("Session expired")) {
          setTimeout(() => {
            logout();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLedgerHistory();
    }
  }, [user, API_URL, logout, filters]);

  const rewardtabledata = [
    { label: "LP", key: "DAILY_REWARDS_LP" },
    { label: "Airdrop", key: "DAILY_REWARDS_AIRDROP" },
    { label: "Booster", key: "DAILY_REWARDS_BOOST" },
    { label: "Community", key: "COMMUNITY" },
    { label: "Reedem", key: "REWARDS_REDEEMED", red: true },
    { label: "Total Credit", key: "credits" },
    { label: "Community booster", key: "COMMUNITY_BOOSTER" },
          { label: "Growth Multiplier", key: "X_BONUS" },
    { label: "X Men", key: "X_MEN" },
    { label: "X Power", key: "LEADERSHIP_BONUS" },
    { label: "Redeem", key: "CLAIM", red: true }, // ✅ always green
    { label: "Balance", key: "closingBalance" },
  ];

  // 
  entries.forEach((row) => {
    
  });

  if (loading) {
    return (
      <div
        className="card p-4 mb-4"
        style={{ background: "#181f3a", borderRadius: "22px" }}
      >
        <div style={{ color: "#b3baff", textAlign: "center", padding: "2rem" }}>
          Loading ledger history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card p-4 mb-4"
        style={{ background: "#181f3a", borderRadius: "22px" }}
      >
        <div style={{ color: "#ff4d4d", textAlign: "center", padding: "2rem" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div
        className="card p-4 mb-4"
        style={{ background: "#181f3a", borderRadius: "22px" }}
      >
        <div style={{ color: "#b3baff", textAlign: "center", padding: "2rem" }}>
          No ledger entries found.
        </div>
      </div>
    );
  }

  return (
    <div
      className="card "
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        border: "1px solid #2a3150",
      }}
    >
      <div
        className="table-reward-responsive"
        style={{ borderRadius: "12px", overflowX: "auto" }}
      >
        <div
          className="table table-dark align-middle mb-0 table-reward-responsive-inner"
          style={{ border: "none" }}
        >
          {entries.map((row, index) => (
            <div key={index} className="card p-3 m-4">
              <h5 className="USDT-date-heading">{row.date}</h5>

              <div className="USDT-grid-layout">
                {rewardtabledata.map((item, idx) => {
                  const value = (row?.sums?.[item.key] ?? row?.[item.key]) || 0;
                  return (
                    <div key={idx} className="USDT-reward-cell">
                      <div
                        className={`USDT-reward-label ${
                          item.key === "closingBalance" ||
                          item.key === "credits"
                            ? "USDT-center-align USDT-larger-label"
                            : "USDT-left-align USDT-small-label"
                        }`}
                      >
                        {item.label}
                      </div>

                      <div
                        className={`USDT-reward-value ${
                          item.key === "closingBalance" ||
                          item.key === "credits"
                            ? "USDT-center-align USDT-larger-label"
                            : "USDT-left-align USDT-small-label"
                        } ${
                          item.label === "Redeem" || item.label === "Reedem"
                            ? "USDT-red-value"
                            : "USDT-green-value"
                        }`}
                      >
                        {value.toFixed(6)} USDT
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

