"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTxUrl } from "@/utils/explorer";

export function RefIdDisplay({ refId }) {
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

export default function HistoryTable({ filters, walletType }) {
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
    limit: 10, // Show fewer entries on dashboard
  });

  useEffect(() => {
    const fetchLedgerHistory = async () => {
      if (!user) {
        
        return;
      }

      
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        

        if (!token) {
          throw new Error("No authentication token found");
        }

        
        

        const queryParams = new URLSearchParams({
          page: pagination.currentPage.toString(),
          limit: pagination.limit.toString(),
          ...(filters.wallet && { wallet: filters.wallet }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        });

        const apiUrl =
          `${API_URL}/ledger/transactions?${queryParams.toString()}`
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
            console.warn("Token removed due to unauthorized response (401)");
            throw new Error("Session expired. Please login again.");
          }
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response from server:", errorData);
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
          console.warn("Session expired. Logging out in 2 seconds.");
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

  // Helper function to extract details from BOOST_BONUS narrative
  const parseBoostBonusNarrative = (narrative) => {
    const fromMatch = narrative.match(/from direct referral (.*)'s deposit/);
    const rateMatch = narrative.match(/\((.*?)%\)/);

    return {
      from: fromMatch ? fromMatch[1] : "SYSTEM",
      rate: rateMatch ? rateMatch[1] : null,
    };
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Month is 0-indexed
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
        {/* <h4 className="fw-bold mb-4" style={{ fontSize: '1.25rem', color: '#fff' }}>Ledger History</h4> */}
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
        {/* <h4 className="fw-bold mb-4" style={{ fontSize: '1.25rem', color: '#fff' }}>Ledger History</h4> */}
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
        {/* <h4 className="fw-bold mb-4" style={{ fontSize: '1.25rem', color: '#fff' }}>Ledger History</h4> */}
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
      <div
        className="table-responsive"
        style={{ borderRadius: "12px", overflowX: "auto" }}
      >
        {(() => {
          const hasClaim = entries.some((entry) => entry.eventType === "CLAIM");

          return (
            <table
              className="table table-dark align-middle mb-0"
              style={{ background: "rgb(24, 31, 58)", border: "none" }}
            >
              <thead
                style={{
                  background:
                    "linear-gradient(135deg, #232b4a 0%, #1e2746 100%)",
                  borderBottom: "2px solid #2a3150",
                }}
              >
                <tr>
                  {[
                    "Sr.",
                    "Date",
                    "Transaction",
                    "Boost Limit",
                    "Boost Bonus",
                    ...(hasClaim ? ["Redeem"] : []),
                    "Percentage",
                    "Amount (USDT)",
                    "Balance",
                  ].map((title) => (
                    <th
                      key={title}
                      style={{
                        padding: "1.25rem 1rem",
                        border: "none",
                        color: "#8b92b5",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const formattedAmount = parseFloat(entry.amount || 0).toFixed(
                    6
                  );
                  const isBoostBonus = entry.eventType === "BOOST_BONUS";
                  const isBoostLimit = entry.eventType === "BOOST_LIMIT";
                  const isClaim = entry.eventType === "CLAIM";
                  const showAmount = !isBoostBonus && !isBoostLimit && !isClaim;

                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(42, 49, 80, 0.3)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Sr. */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontSize: "0.9rem",
                          color: "#b3baff",
                        }}
                      >
                        {(pagination.currentPage - 1) * pagination.limit +
                          (index + 1)}
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontSize: "0.9rem",
                          color: "#b3baff",
                        }}
                      >
                        {formatDate(entry.ts)}
                      </td>

                      {/* Transaction */}
                      <td style={{ padding: "1.25rem 1rem", border: "none" }}>
                        <span
                          style={{
                            color: getEventTypeColor(entry.eventType),
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            background: `${getEventTypeColor(
                              entry.eventType
                            )}15`,
                            borderRadius: "6px",
                            display: "inline-block",
                            border: `1px solid ${getEventTypeColor(
                              entry.eventType
                            )}30`,
                          }}
                        >
                          {entry.eventType.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Boost Limit */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textAlign: "right",
                          color: isBoostLimit ? "#7FFF4C" : "#ccc",
                        }}
                      >
                        {isBoostLimit ? `${formattedAmount} USDT` : "-"}
                      </td>

                      {/* Boost Bonus */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textAlign: "right",
                          color: isBoostBonus ? "#7FFF4C" : "#ccc",
                        }}
                      >
                        {isBoostBonus ? `${formattedAmount} USDT` : "-"}
                      </td>

                      {/* Conditionally Claim */}
                      {hasClaim && (
                        <td
                          style={{
                            padding: "1.25rem 1rem",
                            border: "none",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            textAlign: "right",
                            color: isClaim ? "#7FFF4C" : "#ccc",
                          }}
                        >
                          {isClaim ? `${formattedAmount} USDT` : "-"}
                        </td>
                      )}

                      {/* Percentage */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textAlign: "right",
                        }}
                      >
                        {entry.ratePct ? `${entry.ratePct}%` : "-"}
                      </td>

                      {/* Amount (USDT) */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          color:
                            showAmount && parseFloat(entry.amount) >= 0
                              ? "#7FFF4C"
                              : showAmount
                              ? "#ff4d4d"
                              : "#ccc",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textAlign: "right",
                        }}
                      >
                        {showAmount ? `${formattedAmount} USDT` : "-"}
                      </td>

                      {/* Balance */}
                      <td
                        style={{
                          padding: "1.25rem 1rem",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#b3baff",
                          textAlign: "right",
                        }}
                      >
                        {entry.balance ? entry.balance : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })()}
      </div>
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <>
          {/* Helper function */}
          {(() => {
            const getPageNumbers = (currentPage, totalPages) => {
              const delta = 2; // how many pages to show before/after current
              const range = [];
              const rangeWithDots = [];
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
                  if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                  } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                  }
                }
                rangeWithDots.push(i);
                l = i;
              }

              return rangeWithDots;
            };

            return (
              <div
                className="d-flex flex-column gap-2 mt-4"
                style={{ padding: "0 1rem" }}
              >
                {/* Page Info and Limit */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    {/* <span style={{ color: '#b3baff', fontSize: '0.9rem' }}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span> */}
                    <select
                      className="form-select form-select-sm"
                      value={pagination.limit}
                      onChange={(e) => {
                        setPagination((prev) => ({
                          ...prev,
                          limit: Number(e.target.value),
                          currentPage: 1, // Reset to first page when limit changes
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
                       <option value="20">20 / page</option>
                      <option value="50">50 / page</option>
                      <option value="100">100 / page</option>
                    </select>
                  </div>
                </div>

                {/* Page Links */}
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {/* Previous Button */}
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
                      cursor: pagination.hasPrevPage
                        ? "pointer"
                        : "not-allowed",
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

                  {/* Page Number Links */}
                  {getPageNumbers(
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
                  )}

                  {/* Next Button */}
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
                      cursor: pagination.hasNextPage
                        ? "pointer"
                        : "not-allowed",
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
            );
          })()}
        </>
      )}
    </div>
  );
}
