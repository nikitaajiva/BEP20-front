"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AssetHistoryTable() {
  const { user, API_URL, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    const fetchAssetHistory = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const queryParams = new URLSearchParams({
          page: (pagination.currentPage || 1).toString(),
          limit: (pagination.limit || 10).toString(),
        });

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
  }, [user, API_URL, pagination.currentPage, pagination.limit]);

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

  if (!entries.length) {
    return (
      <div className="text-center p-5" style={{ color: "rgba(255,255,255,0.4)" }}>
        <i className="ri-inbox-archive-line" style={{ fontSize: "2.5rem", color: "#ffa500", opacity: 0.7 }}></i>
        <div className="mt-3" style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Stakings or NFT Purchase History Found</div>
        <p className="mt-1" style={{ fontSize: "0.9rem" }}>When you acquire a Horse NFT or stake tokens, transactions will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive" style={{ borderRadius: "12px", overflowX: "auto" }}>
        <table className="table table-dark align-middle mb-0" style={{ background: "rgb(24, 31, 58)", border: "none" }}>
          <thead style={{
            background: "linear-gradient(135deg, #232b4a 0%, #1e2746 100%)",
            borderBottom: "2px solid #2a3150",
          }}>
            <tr>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Sr.</th>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Date & Time</th>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Asset Type</th>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Amount (USDT)</th>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Token equivalent</th>
              <th style={{ padding: "1.25rem 1rem", border: "none", color: "#8b92b5", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Details / Narrative</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id || index} style={{ borderBottom: "1px solid rgba(42, 49, 80, 0.3)", transition: "all 0.2s ease" }}>
                <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#b3baff" }}>
                  {(pagination.currentPage - 1) * pagination.limit + (index + 1)}
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#b3baff" }}>
                  {formatDate(entry.date)}
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none" }}>
                  <span style={{
                    color: entry.eventType === "STAKING_DEPOSIT" ? "#38bdf8" : "#fbbf24",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    padding: "0.35rem 0.75rem",
                    background: entry.eventType === "STAKING_DEPOSIT" ? "rgba(56, 189, 248, 0.1)" : "rgba(251, 191, 36, 0.1)",
                    borderRadius: "6px",
                    display: "inline-block",
                    border: `1px solid ${entry.eventType === "STAKING_DEPOSIT" ? "rgba(56, 189, 248, 0.2)" : "rgba(251, 191, 36, 0.2)"}`,
                    letterSpacing: "0.5px"
                  }}>
                    {entry.assetType.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none", color: "#10b981", fontWeight: 700, fontSize: "0.95rem" }}>
                  {parseFloat(entry.amountUsdt).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none", color: "#38bdf8", fontWeight: 700, fontSize: "0.95rem" }}>
                  {parseFloat(entry.amountToken).toLocaleString(undefined, { minimumFractionDigits: 4 })} TSC
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}>
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
    </div>
  );
}
