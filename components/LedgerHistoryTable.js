"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LedgerHistoryTable({ filters }) {
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

  const formatWalletName = (name) => {
    if (!name) return "N/A";
    const formatted = name.toUpperCase();
    if (formatted === "XAMAN_WALLET" || formatted === "SYSTEM_WALLET" || formatted === "XAMAN") return "Primary Vault";
    if (formatted === "LP_WALLET" || formatted === "LP") return "Liquidity Pool";
    if (formatted === "ZERO_RISK") return "Stable Pool";
    if (formatted === "AIRDROP") return "Airdrop Node";
    if (formatted === "BOOST") return "Booster Pool";
    if (formatted === "COMMUNITY_REWARDS") return "Ecosystem Rewards";
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

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
          page: pagination.currentPage.toString(),
          limit: pagination.limit.toString(),
          ...(filters.eventType &&
            filters.eventType !== "all" && {
              eventType: filters.eventType,
            }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        });

        const apiUrl = `${API_URL}/ledger/history?${queryParams.toString()}`
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
          setPagination(
            data.pagination || {
              currentPage: 1,
              totalPages: 0,
              totalEntries: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            }
          );
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
  }, [
    user,
    API_URL,
    logout,
    pagination.currentPage,
    pagination.limit,
    filters,
  ]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleLimitChange = (e) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number(e.target.value),
      currentPage: 1,
    }));
  };

  // Helper function to extract details from BOOST_BONUS narrative
  const parseBoostBonusNarrative = (narrative) => {
    const fromMatch = narrative.match(/from direct referral (.*)'s deposit/);
    const rateMatch = narrative.match(/\((.*?)%\)/);

    return {
      from: fromMatch ? fromMatch[1] : "SYSTEM",
      rate: rateMatch ? rateMatch[1] : null,
    };
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "DEPOSIT":
        return "#7FFF4C";
      case "WITHDRAWAL":
        return "#ff4d4d";
      case "TRANSFER":
        return "#4f8cff";
      case "REWARD":
        return "#FFD700";
      default:
        return "#FFFFFF";
    }
  };

  if (loading) {
    return (
      <div
        className="card p-4 mb-4"
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          border: "1px solid #2a3150",
        }}
      >
        <h4
          className="fw-bold mb-4"
          style={{ fontSize: "1.25rem", color: "#fff" }}
        >
          Ledger History
        </h4>
        <div
          className="table-loading-state"
          style={{ color: "#b3baff", textAlign: "center", padding: "2rem" }}
        >
          Loading ledger history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card p-4 mb-4"
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          border: "1px solid #2a3150",
        }}
      >
        <h4
          className="fw-bold mb-4"
          style={{ fontSize: "1.25rem", color: "#fff" }}
        >
          Ledger History
        </h4>
        <div
          className="table-error-state"
          style={{ color: "#ff4d4d", textAlign: "center", padding: "2rem" }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div
        className="card p-4 mb-4"
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          border: "1px solid #2a3150",
        }}
      >
        <h4
          className="fw-bold mb-4"
          style={{ fontSize: "1.25rem", color: "#fff" }}
        >
          Ledger History
        </h4>
        <div
          className="table-empty-state"
          style={{ color: "#b3baff", textAlign: "center", padding: "2rem" }}
        >
          No ledger entries found.
        </div>
      </div>
    );
  }

  return (
    <div
      className="card p-4 mb-4"
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        border: "1px solid #2a3150",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4
            className="fw-bold"
            style={{ fontSize: "1.25rem", color: "#fff", textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Transaction Archives
          </h4>
          <p className="text-muted mb-0" style={{ color: "#555", fontSize: '12px' }}>
            Historical record of all ecosystem node interactions.
          </p>
        </div>
      </div>
      <div
        className="table-responsive"
        style={{ borderRadius: "16px", overflowX: "auto", border: '1px solid rgba(255,215,0,0.1)' }}
      >
        <table
          className="table table-dark align-middle mb-0"
          style={{ background: "rgba(0,0,0,0.2)", border: "none" }}
        >
          <thead
            style={{
              background: "rgba(255, 215, 0, 0.03)",
              borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Date Epoch
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Source Node
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Target Node
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  textAlign: "right",
                }}
              >
                Ecosystem Value
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Yield %
              </th>
              <th
                style={{
                  padding: "1.25rem 1rem",
                  border: "none",
                  color: "#ffd700",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Core Protocol
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid rgba(42, 49, 80, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    fontSize: "0.9rem",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                >
                  {formatDate(entry.ts)}
                </td>
                <td style={{ padding: "1.25rem 1rem", border: "none" }}>
                  <span
                    style={{
                      color: getEventTypeColor(entry.eventType),
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      padding: "0.4rem 0.8rem",
                      background: `${getEventTypeColor(entry.eventType)}10`,
                      borderRadius: "8px",
                      display: "inline-block",
                      border: `1px solid ${getEventTypeColor(
                        entry.eventType
                      )}40`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {entry.eventType.replace(/_/g, " ")}
                  </span>
                </td>
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    fontSize: "0.9rem",
                    color: "#ffd700",
                    fontWeight: 700,
                  }}
                >
                  {entry.eventType === "BOOST_BONUS"
                    ? parseBoostBonusNarrative(entry.narrative).from
                    : formatWalletName(entry.walletFrom)}
                </td>
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    fontSize: "0.9rem",
                    color: "#ffd700",
                    fontWeight: 700,
                  }}
                >
                  {formatWalletName(entry.walletTo)}
                </td>
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    color:
                      parseFloat(entry.amount) >= 0 ? "#7FFF4C" : "#ff4d4d",
                    fontWeight: 800,
                    fontSize: "15px",
                    textAlign: "right",
                  }}
                >
                  {parseFloat(entry.amount).toFixed(4)}
                </td>
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    fontSize: "0.9rem",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {entry.eventType === "BOOST_BONUS"
                    ? `${parseBoostBonusNarrative(entry.narrative).rate}%`
                    : entry.ratePct
                    ? `${entry.ratePct}%`
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "1.25rem 1rem",
                    border: "none",
                    fontSize: "13px",
                    color: "#aaa",
                    fontWeight: 400,
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span title={entry.narrative}>{entry.narrative}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div
          className="d-flex flex-column gap-2 mt-4"
          style={{ padding: "0 1rem" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <select
                className="form-select form-select-sm"
                value={pagination.limit}
                onChange={(e) => {
                  setPagination((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    currentPage: 1,
                  }));
                }}
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "0.25rem 0.75rem",
                }}
              >
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button
              className="btn btn-sm"
              style={{
                background: pagination.hasPrevPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasPrevPage ? "#4f8cff" : "#8b92b5",
                border: `1px solid ${
                  pagination.hasPrevPage
                    ? "rgba(79, 140, 255, 0.2)"
                    : "rgba(139, 146, 181, 0.2)"
                }`,
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (pagination.hasPrevPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }));
                }
              }}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>

            {(() => {
              const getPageNumbers = (currentPage, totalPages) => {
                const delta = 2;
                const range = [],
                  rangeWithDots = [];
                let l;

                for (let i = 1; i <= totalPages; i++) {
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= currentPage - delta && i <= currentPage + delta)
                  ) {
                    range.push(i);
                  }
                }

                for (let i of range) {
                  if (l) {
                    if (i - l === 2) rangeWithDots.push(l + 1);
                    else if (i - l !== 1) rangeWithDots.push("...");
                  }
                  rangeWithDots.push(i);
                  l = i;
                }

                return rangeWithDots;
              };

              return getPageNumbers(
                pagination.currentPage,
                pagination.totalPages
              ).map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    style={{
                      padding: "0.4rem 0.8rem",
                      color: "#8b92b5",
                      fontSize: "0.85rem",
                    }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    className="btn btn-sm"
                    style={{
                      background:
                        pagination.currentPage === pageNum
                          ? "rgba(79, 140, 255, 0.2)"
                          : "rgba(79, 140, 255, 0.05)",
                      color:
                        pagination.currentPage === pageNum
                          ? "#4f8cff"
                          : "#8b92b5",
                      border: `1px solid ${
                        pagination.currentPage === pageNum
                          ? "rgba(79, 140, 255, 0.4)"
                          : "rgba(79, 140, 255, 0.2)"
                      }`,
                      borderRadius: "6px",
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      minWidth: "36px",
                    }}
                    onClick={() => {
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: pageNum,
                      }));
                    }}
                  >
                    {pageNum}
                  </button>
                )
              );
            })()}

            <button
              className="btn btn-sm"
              style={{
                background: pagination.hasNextPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasNextPage ? "#4f8cff" : "#8b92b5",
                border: `1px solid ${
                  pagination.hasNextPage
                    ? "rgba(79, 140, 255, 0.2)"
                    : "rgba(139, 146, 181, 0.2)"
                }`,
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (pagination.hasNextPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }));
                }
              }}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
