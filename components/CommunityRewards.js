"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function CommunityRewards() {
  const { user, API_URL, logout } = useAuth();
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLedgerEntries = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Ensure API_URL is available
        if (!API_URL) {
          throw new Error("API URL is not configured");
        }

        // Construct the API URL carefully
        const apiUrl = `${API_URL}/ledger/history`
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
            // Token expired or invalid
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
          setLedgerEntries(data.entries || []);
        } else {
          throw new Error(data.message || "Failed to fetch ledger entries");
        }
      } catch (err) {
        console.error("Error fetching ledger entries:", err);
        setError(
          err.message || "An error occurred while fetching ledger entries"
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
      fetchLedgerEntries();
    }
  }, [user, API_URL, logout]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#101935",
          color: "white",
        }}
      >
        Loading Community Rewards...
      </div>
    );
  }

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "ROI_CREDIT":
        return "#7FFF4C";
      case "ROI_CASCADE":
        return "#4f8cff";
      case "BOOST_BONUS":
        return "#FFD700";
      case "AIRDROP_ACTIVATION":
        return "#9F7AEA";
      default:
        return "#FFFFFF";
    }
  };

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.25rem" }}>
              Community Rewards Ledger
            </h4>
          </div>

          {error && <div className="table-error-state">{error}</div>}

          {loading && (
            <div className="table-loading-state">
              Loading community rewards...
            </div>
          )}

          {!loading && !error && ledgerEntries.length === 0 && (
            <div className="table-empty-state">No ledger entries found.</div>
          )}

          {!loading && !error && ledgerEntries.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event Type</th>
                    <th>From Wallet</th>
                    <th>To Wallet</th>
                    <th>Amount (USDT)</th>
                    <th>Rate %</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry) => (
                    <tr key={entry._id}>
                      <td>{new Date(entry.ts).toLocaleString()}</td>
                      <td>
                        <span
                          style={{
                            color: getEventTypeColor(entry.eventType),
                            fontWeight: "bold",
                          }}
                        >
                          {entry.eventType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>{entry.walletFrom || "N/A"}</td>
                      <td>{entry.walletTo || "N/A"}</td>
                      <td className="positive-amount">
                        {parseFloat(entry.amount).toFixed(2)} USDT
                      </td>
                      <td>
                        {entry.ratePct
                          ? `${parseFloat(entry.ratePct).toFixed(2)}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
