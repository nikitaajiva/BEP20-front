"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

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
          href={`https://xrpscan.com/tx/${refId}`}
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
    limit: 40, // Show fewer entries on dashboard
  });
  const [expandedWallets, setExpandedWallets] = useState({});
  const getKey = (entryId, walletName) => `${entryId}_${walletName}`;

  const isWalletExpanded = (entryId, walletName) => {
    return !!expandedWallets[getKey(entryId, walletName)];
  };

  const toggleHistory = (entryId, walletName) => {
    const key = getKey(entryId, walletName);
    setExpandedWallets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
          ...(filters?.wallet && { wallet: filters.wallet }),
          ...(filters?.startDate && { startDate: filters.startDate }),
          ...(filters?.endDate && { endDate: filters.endDate }),
        });

        const apiUrl = `${API_URL}/ledger/reports?${queryParams.toString()}`
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
          console.log(data, "================reports=================");
          setEntries(data.data || []);
          setPagination(
            data.pagination || {
              currentPage: 1,
              totalPages: 0,
              totalEntries: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 40,
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

  const renderWalletCell = (wallets, walletName, entryId) => {
    const wallet = wallets?.find((w) => w.wallet === walletName);
    if (!wallet) return <td>—</td>;

    const isExpanded = isWalletExpanded(entryId, walletName);

    return (
      <td
        style={{
          padding: "1.25rem 1rem",
          border: "none",
          fontSize: "0.9rem",
          color: "#b3baff",
          fontWeight: 500,
          verticalAlign: "top",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {wallet.closingBalance}
          {wallet.history?.length > 0 && (
            <button
              onClick={() => toggleHistory(entryId, walletName)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "0.5rem",
                padding: 0,
              }}
              title={isExpanded ? "Hide history" : "View history"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill={isExpanded ? "#FF4C4C" : "#7FFF4C"}
                viewBox="0 0 24 24"
              >
                <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          )}
        </div>

        {(wallet.totalCredits !== "0.000000" ||
          wallet.totalWithdrawals !== "0.000000") && (
          <div style={{ marginTop: "0.4rem" }}>
            {wallet.totalCredits !== "0.000000" && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#7FFF4C",
                  fontWeight: 500,
                }}
              >
                + {wallet.totalCredits}
              </div>
            )}
            {wallet.totalWithdrawals !== "0.000000" && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#FF4C4C",
                  fontWeight: 500,
                }}
              >
                − {wallet.totalWithdrawals}
              </div>
            )}
          </div>
        )}

        {/* MODAL HISTORY */}
        {isExpanded && wallet.history?.length > 0 && (
          <div className="modal_history" style={{ padding: "1rem" }}>
            <div className="modal_history_inner">
              <div className="bg-[#1e1e1e] text-white  w-full max-w-md p-4 relative">
                {/* Close Button */}
                <button
                  onClick={() => toggleHistory(entryId, walletName)}
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.75rem",
                    fontSize: "1.25rem",
                    color: "#fff",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>

                <h3 className="text-green-400 font-semibold text-base mb-3">
                  History
                </h3>
                <ul
                  style={{
                    fontSize: "0.85rem",
                    paddingLeft: "1rem",
                    maxHeight: "250px",
                    overflowY: "auto",
                    color: "#ffffffcc",
                  }}
                >
                  {wallet.history.map((h, i) => (
                    <li key={i}>
                      {h.eventType}: {h.amount}{" "}
                      {h.source
                        ? `(from ${h.source})`
                        : h.target
                        ? `(to ${h.target})`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div
      className="card p-4 mb-4"
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        border: "1px solid #2a3150",
        width: "90%",
        margin: "auto",
      }}
    >
      <div
        className="table-responsive"
        // style={{ borderRadius: "12px", overflowX: "auto" }}
        style={{
          // maxHeight: "100vh", // adjust as needed
          overflowY: "auto",
          borderRadius: "12px",
        }}
      >
        <table
          className="table table-dark align-middle mb-0"
          style={{ background: "rgb(24, 31, 58)", border: "none" }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #232b4a 0%, #1e2746 100%)",
              borderBottom: "2px solid #2a3150",
              position: "sticky",
              top: 0,
              zIndex: 10, // ensures it stays above scrolling content
            }}
          >
            <tr>
              <th
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
                Sr.
              </th>
              <th
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
                Date
              </th>

              <th
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
                Username
              </th>
              <th
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
                Xaman
              </th>
              <th
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
                ZERO_RISK
              </th>
              <th
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
                LP
              </th>
              <th
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
                COMMUNITY_Rewards
              </th>

              <th
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
                Auto_positioning
              </th>

              <th
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
                Claim
              </th>

              <th
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
                Redeem
              </th>

              <th
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
                Withdrwal
              </th>
            </tr>
          </thead>
          {
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
                      color: "#b3baff",
                    }}
                  >
                    {" "}
                    {(pagination.currentPage - 1) * pagination.limit +
                      (index + 1)}
                  </td>
                  <td
                    style={{
                      padding: "1.25rem 1rem",
                      border: "none",
                      fontSize: "0.9rem",
                      color: "#b3baff",
                    }}
                  >
                    {formatDate(entry.date)}
                  </td>
                  <td style={{ padding: "1.25rem 1rem", border: "none" }}>
                    <span
                      style={{
                        color: "#b3baff",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.8rem",
                        background: `${getEventTypeColor(entry.eventType)}15`,
                        borderRadius: "6px",
                        display: "inline-block",
                        border: `1px solid ${getEventTypeColor(
                          entry.eventType
                        )}30`,
                      }}
                    >
                      {user.username}
                    </span>
                  </td>

                  {renderWalletCell(entry.wallets, "XAMAN", index)}
                  {renderWalletCell(entry.wallets, "ZERO_RISK", index)}
                  {renderWalletCell(entry.wallets, "LP", index)}
                  {renderWalletCell(entry.wallets, "COMMUNITY_REWARDS", index)}

                  <td
                    style={{
                      padding: "1.25rem 1rem",
                      border: "none",
                      fontSize: "0.9rem",
                      color: "#b3baff",
                      fontWeight: 500,
                    }}
                  ></td>
                  <td
                    style={{
                      padding: "1.25rem 1rem",
                      border: "none",
                      fontSize: "0.9rem",
                      color:
                        parseFloat(entry.amount) >= 0 ? "#7FFF4C" : "#ff4d4d",
                      fontWeight: 500,
                    }}
                  >
                    {entry?.summary?.CLAIM.total}
                  </td>
                  <td
                    style={{
                      padding: "1.25rem 1rem",
                      border: "none",
                      color:
                        parseFloat(entry.amount) >= 0 ? "#7FFF4C" : "#ff4d4d",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textAlign: "right",
                    }}
                  >
                    {entry?.summary?.REDEEMED?.total}
                  </td>

                  <td
                    style={{
                      padding: "1.25rem 1rem",
                      border: "none",
                      fontSize: "0.9rem",
                      color: "#ff4d4d",
                      fontWeight: 500,
                    }}
                  >
                    {(
                      parseFloat(entry?.summary?.REDEEMED?.total || 0) +
                      parseFloat(entry?.summary?.CLAIM?.total || 0)
                    ).toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          }
        </table>
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
                      <option value="25">25 / page</option>
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
