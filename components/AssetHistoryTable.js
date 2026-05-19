"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AssetHistoryTable() {
  const { user, API_URL, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalEntries: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Parse type parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      if (typeParam === "nft") {
        setActiveTab("nft");
      } else if (typeParam === "staking") {
        setActiveTab("staking");
      }
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setError("");
  };

  useEffect(() => {
    const fetchAssetHistory = async () => {
      if (!user) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const queryParams = new URLSearchParams({
          page: (pagination.currentPage || 1).toString(),
          limit: (pagination.limit || 10).toString(),
        });

        if (activeTab && activeTab !== "all") {
          queryParams.append("type", activeTab);
        }

        // Clean up double slashes
        const apiUrl = `${API_URL}/ledger/asset-history?${queryParams.toString()}`
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
          setPagination((prev) => ({
            ...prev,
            ...(data.pagination || {})
          }));
        } else {
          throw new Error(data.message || "Failed to fetch asset history");
        }
      } catch (err) {
        console.error("Error fetching asset history:", err);
        setError(err.message || "An error occurred while fetching asset history");
        if (err.message.includes("Session expired")) {
          setTimeout(() => {
            logout();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssetHistory();
  }, [user, API_URL, pagination.currentPage, pagination.limit, activeTab]);

  if (loading) {
    return (
      <div className="text-center p-5" style={{ color: "#b3baff" }}>
        <div className="spinner-border text-warning mb-3" role="status"></div>
        <div>Loading asset history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5 text-danger">
        <i className="ri-error-warning-line" style={{ fontSize: "2rem" }}></i>
        <div className="mt-2">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Premium Filter Tabs */}
      <div 
        className="d-flex align-items-center gap-2 mb-4 flex-wrap" 
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          padding: "6px",
          borderRadius: "14px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          width: "max-content",
          maxWidth: "100%",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)"
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange("all")}
          style={{
            background: activeTab === "all" ? "linear-gradient(135deg, #ff7200 0%, #ff5500 100%)" : "transparent",
            color: activeTab === "all" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            padding: "8px 20px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === "all" ? "0 4px 15px rgba(255, 85, 0, 0.3)" : "none",
            textTransform: "uppercase"
          }}
        >
          All Assets
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("nft")}
          style={{
            background: activeTab === "nft" ? "linear-gradient(135deg, #ff7200 0%, #ff5500 100%)" : "transparent",
            color: activeTab === "nft" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            padding: "8px 20px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === "nft" ? "0 4px 15px rgba(255, 85, 0, 0.3)" : "none",
            textTransform: "uppercase"
          }}
        >
          Horse NFTs
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("staking")}
          style={{
            background: activeTab === "staking" ? "linear-gradient(135deg, #ff7200 0%, #ff5500 100%)" : "transparent",
            color: activeTab === "staking" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            padding: "8px 20px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === "staking" ? "0 4px 15px rgba(255, 85, 0, 0.3)" : "none",
            textTransform: "uppercase"
          }}
        >
          Token Staking
        </button>
      </div>

      {!entries.length ? (
        <div 
          className="text-center p-5 card" 
          style={{ 
            color: "rgba(255,255,255,0.4)", 
            borderRadius: "18px", 
            background: "rgba(24, 31, 58, 0.4)", 
            border: "1px solid rgba(255, 165, 0, 0.15)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
          }}
        >
          <i className="ri-inbox-archive-line" style={{ fontSize: "2.5rem", color: "#ffa500", opacity: 0.7 }}></i>
          <div className="mt-3" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {activeTab === "all" 
              ? "No Stakings or NFT Purchase History Found" 
              : activeTab === "nft" 
                ? "No Horse NFT Purchase History Found" 
                : "No Token Staking History Found"}
          </div>
          <p className="mt-1" style={{ fontSize: "0.9rem" }}>When you perform actions in this category, transactions will appear here.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive" style={{ borderRadius: "16px", overflowX: "auto" }}>
            <table className="table align-middle mb-0" style={{ background: "transparent", border: "none", "--bs-table-bg": "transparent", "--bs-table-accent-bg": "transparent", "--bs-table-color": "#fff" }}>
              <thead style={{
                background: "rgba(255, 255, 255, 0.02)",
                borderBottom: "1px solid rgba(255, 184, 0, 0.15)",
              }}>
                <tr>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Sr.</th>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Date & Time</th>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Asset Type</th>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Amount (USDT)</th>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Token equivalent</th>
                  <th style={{ padding: "1.25rem 1rem", border: "none", color: "rgba(255, 255, 255, 0.4)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", background: "transparent" }}>Details / Narrative</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id || index} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)", transition: "all 0.2s ease", background: "transparent" }}>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.65)", background: "transparent" }}>
                      {(pagination.currentPage - 1) * pagination.limit + (index + 1)}
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.65)", background: "transparent" }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", background: "transparent" }}>
                      <span style={{
                        color: entry.eventType === "STAKING_DEPOSIT" ? "#ff7200" : "#ffb800",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.75rem",
                        background: entry.eventType === "STAKING_DEPOSIT" ? "rgba(255, 114, 0, 0.1)" : "rgba(255, 184, 0, 0.1)",
                        borderRadius: "8px",
                        display: "inline-block",
                        border: `1px solid ${entry.eventType === "STAKING_DEPOSIT" ? "rgba(255, 114, 0, 0.2)" : "rgba(255, 184, 0, 0.2)"}`,
                        letterSpacing: "0.5px"
                      }}>
                        {entry.assetType.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", color: "#00ff00", fontWeight: 800, fontSize: "0.95rem", background: "transparent" }}>
                      {parseFloat(entry.amountUsdt).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", color: "#ffb800", fontWeight: 800, fontSize: "0.95rem", background: "transparent" }}>
                      {parseFloat(entry.amountToken).toLocaleString(undefined, { minimumFractionDigits: 4 })} TSC
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: 500, background: "transparent" }}>
                      {entry.narrative}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                className="btn btn-sm"
                style={{
                  background: pagination.hasPrevPage ? "rgba(79, 140, 255, 0.1)" : "rgba(139, 146, 181, 0.1)",
                  color: pagination.hasPrevPage ? "#4f8cff" : "#8b92b5",
                  border: `1px solid ${pagination.hasPrevPage ? "rgba(79, 140, 255, 0.2)" : "rgba(139, 146, 181, 0.2)"}`,
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  if (pagination.hasPrevPage) {
                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
                  }
                }}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </button>

              <span style={{ color: "#8b92b5", fontSize: "0.9rem", fontWeight: 600 }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                className="btn btn-sm"
                style={{
                  background: pagination.hasNextPage ? "rgba(79, 140, 255, 0.1)" : "rgba(139, 146, 181, 0.1)",
                  color: pagination.hasNextPage ? "#4f8cff" : "#8b92b5",
                  border: `1px solid ${pagination.hasNextPage ? "rgba(79, 140, 255, 0.2)" : "rgba(139, 146, 181, 0.2)"}`,
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  if (pagination.hasNextPage) {
                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
                  }
                }}
                disabled={!pagination.hasNextPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
