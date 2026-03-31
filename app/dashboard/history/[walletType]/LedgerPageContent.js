"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import HistoryTable from "@/components/HistoryTable";
import HistoryTableBoost from "@/components/HistoryTableBoost";
import HistoryTablereward from "@/components/historyTablereward";
import HistoryTablezerorisk from "@/components/HistoryTablezerorisk";
import HistoryTableswift from "@/components/HistoryTableswift";
import HistoryTableLPWallet from "@/components/HistoryTableLPWallet";
import HistoryTableairdropWallet from "@/components/HistoryTableAirdropWallet";
import History_communityRewards from "@/components/History_communityRewards";

// Helper function to format event type strings for display
const formatEventType = (type) => {
  if (!type) return "All Events";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function LedgerPageContent({ walletType }) {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTypes, setEventTypes] = useState([]);

  const [filters, setFilters] = useState({
    wallet: walletType,
    eventType: searchParams.get("type") || "all",
    startDate: "",
    endDate: "",
  });

  // Fetch the available event types from the backend
  useEffect(() => {
    const fetchEventTypes = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "" && value !== "all") {
            params.append(key, value);
          }
        });

        const response = await fetch(
          `/api/ledger/history1?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch event types");
        }

        const data = await response.json();

        if (data.success) {
          setEventTypes(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch event types:", err);
        // Do not block the UI for this, can default to manual entry or show a small error
      }
    };
    fetchEventTypes();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      wallet: "SWIFT",
      eventType: "all",
      startDate: "",
      endDate: "",
    });
  };
  function formatWalletTitle(walletType) {
    return (
      walletType
        .replace(/[-_]/g, " ") // replace - or _ with space
        .toLowerCase() // make all lowercase
        .replace(/\b\w/g, (char) => char.toUpperCase()) + // capitalize first letter of each word
      " Wallet Transaction History"
    );
  }

  const getFilterTitle = () => {
    if (filters.eventType === "all") return formatWalletTitle(walletType);
    return `${formatEventType(filters.eventType)} History`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div className="text-center p-4" style={{ color: "#b3baff" }}>
          Loading page...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div
          className="alert alert-danger"
          style={{
            backgroundColor: "#450A0A",
            color: "#F9DADA",
            border: "1px solid #7F1D1D",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2
              className="fw-bold mb-3"
              style={{
                color: "#fff",
                fontSize: "1.75rem",
                textAlign: "center",
              }}
            >
              {getFilterTitle()}
            </h2>
          </div>
        </div>

        <div
          className="card p-4 mb-4"
          style={{
            borderRadius: "16px",
            background: "#181f3a",
            border: "1px solid #2a3150",
            boxShadow: "0 4px 24px 0 rgba(16,25,53,0.16)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >

            <div>
              <label
                htmlFor="startDate"
                className="form-label mb-2"
                style={{ color: "#b3baff", fontWeight: 500 }}
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                style={{
                  background: "#232b4a",
                  color: "#fff",
                  border: "1px solid #2a3150",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                }}
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="form-label mb-2"
                style={{ color: "#b3baff", fontWeight: 500 }}
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                style={{
                  background: "#232b4a",
                  color: "#fff",
                  border: "1px solid #2a3150",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                }}
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn w-100"
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "0.75rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onClick={clearFilters}
              >
                <i className="ri-filter-off-line me-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div
          className="card p-4 mb-4"
          style={{
            borderRadius: "16px",
            background: "#181f3a",
            border: "1px solid #2a3150",
            boxShadow: "0 4px 24px 0 rgba(16,25,53,0.16)",
          }}
        >
          {console.log(walletType, "walletTypewalletType")}
          {walletType == "BOOST" ? (
            <HistoryTableBoost filters={filters} walletType={walletType} />
          ) : walletType == "COMMUNITY_WALLET" ? (
            <HistoryTablereward filters={filters} walletType={walletType} />
          ) : walletType == "ZERO_RISK" ? (
            <HistoryTablezerorisk filters={filters} walletType={walletType} />
          ) : walletType == "SWIFT" ? (
            <HistoryTableswift filters={filters} walletType={walletType} />
          ) : walletType == "LP" ? (
            <HistoryTableLPWallet filters={filters} walletType={walletType} />
          ) : walletType == "AIRDROP" ? (
            <HistoryTableairdropWallet
              filters={filters}
              walletType={walletType}
            />
          ) : walletType == "COMMUNITY_REWARDS" ? (
            <History_communityRewards
              filters={filters}
              walletType={walletType}
            />
          ) : walletType == "REWARDS" ? (
            <History_communityRewards
              filters={filters}
              walletType={walletType}
            />
          ) : (
            <HistoryTable filters={filters} walletType={walletType} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl flex-grow-1 container-p-y py-4">
      <div className="text-center p-4" style={{ color: "#b3baff" }}>
        Loading ledger history...
      </div>
    </div>
  );
}
