"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LedgerHistoryTable({ filters }) {
  const { user, API_URL, logout } = useAuth();
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]             = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({
    totalPages: 0, totalEntries: 0, hasNextPage: false, hasPrevPage: false,
  });

  const formatWalletName = (name) => {
    if (!name) return "N/A";
    const formatted = name.toUpperCase();
    if (formatted === "USDT_WALLET" || formatted === "SYSTEM_WALLET" || formatted === "USDT") return "Primary Vault";
    if (formatted === "LP_WALLET" || formatted === "LP") return "Liquidity Pool";
    if (formatted === "ZERO_RISK") return "Stable Pool";
    if (formatted === "AIRDROP") return "Airdrop Node";
    if (formatted === "BOOST") return "Booster Pool";
    if (formatted === "COMMUNITY_REWARDS") return "Ecosystem Rewards";
    if (formatted === "STAKING_HUB") return "Staking Hub";
    if (formatted === "HORSE_NFT") return "Horse NFT Assets";
    if (formatted === "NFT_MINT") return "NFT Mining Vault";
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Clean single-fetch approach: track filters ref, compute effective page locally
  const filtersRef = React.useRef(filters);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (!user) return;

    // Detect if filters changed vs a page/limit change
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersRef.current);
    if (filtersChanged) {
      filtersRef.current = filters;
      // If we're not already on page 1, reset — this re-runs with currentPage=1
      if (currentPage !== 1) {
        setCurrentPage(1);
        return; // second run will fetch with page=1
      }
    }

    const fetchLedgerHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const queryParams = new URLSearchParams({
          page:  currentPage.toString(),
          limit: limit.toString(),
          ...(filters.eventType && filters.eventType !== "all" && { eventType: filters.eventType }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate   && { endDate:   filters.endDate   }),
        });

        const apiUrl = `${API_URL}/ledger/history?${queryParams}`
          .replace(/\/+/g, "/").replace(":/", "://");

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            setTimeout(() => logout(), 2000);
            throw new Error("Session expired. Please login again.");
          }
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setEntries(data.entries || []);
          const p = data.pagination || {};
          setPaginationMeta({
            totalPages:   p.totalPages   ?? 0,
            totalEntries: p.totalEntries ?? 0,
            hasNextPage:  p.hasNextPage  ?? false,
            hasPrevPage:  p.hasPrevPage  ?? false,
          });
        } else {
          throw new Error(data.message || "Failed to fetch ledger history");
        }
      } catch (err) {
        console.error("Error fetching ledger history:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, API_URL, logout, filters, currentPage, limit]);

  const handlePageChange  = (newPage) => setCurrentPage(newPage);
  const handleLimitChange = (e) => { setLimit(Number(e.target.value)); setCurrentPage(1); };

  // Compatibility shim — lets the JSX below reference `pagination.xxx` unchanged
  const pagination = {
    currentPage, limit,
    totalPages:   paginationMeta.totalPages,
    totalEntries: paginationMeta.totalEntries,
    hasNextPage:  paginationMeta.hasNextPage,
    hasPrevPage:  paginationMeta.hasPrevPage,
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
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

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
      case "STAKING_DEPOSIT":
        return "#4cc9f0";
      case "NFT_PURCHASE":
        return "#f038ff";
      default:
        return "#FFFFFF";
    }
  };

  if (loading) {
    return (
      <div
        className="card p-4 mb-4"
        style={{
          background: "transparent",
          borderRadius: "22px",
          boxShadow: "none",
          border: "none",
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
          background: "transparent",
          borderRadius: "22px",
          boxShadow: "none",
          border: "none",
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
          background: "transparent",
          borderRadius: "22px",
          boxShadow: "none",
          border: "none",
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
    <>
      <style jsx="true">{`
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-history-view { display: block !important; }
          .pagination-wrapper { 
            flex-direction: column !important;
            align-items: center !important;
            gap: 15px !important;
          }
          .history-card-container {
            padding: 0.5rem !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-history-view { display: none !important; }
        }
      `}</style>

      <div
        className="card p-4 mb-4 history-card-container"
        style={{
          background: "transparent",
          backdropFilter: "none",
          borderRadius: "0",
          boxShadow: "none",
          border: "none",
        }}
      >
        {/* Desktop Table View */}
        <div
          className="table-responsive desktop-table"
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
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", minWidth: "160px" }}>Date Epoch</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", minWidth: "140px" }}>Category</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", minWidth: "150px" }}>Source Node</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", minWidth: "150px" }}>Target Node</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", textAlign: "right", minWidth: "160px" }}>Ecosystem Value</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#FFB800", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", textAlign: "right", minWidth: "140px" }}>TSC Value</th>
                <th style={{ padding: "1.25rem 1rem", border: "none", color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1.5px", textAlign: "right", minWidth: "100px" }}>Yield %</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const amountVal = parseFloat(entry.amount?.$numberDecimal || entry.amount || 0);
                const isNegative = amountVal < 0;
                return (
                  <tr key={index} style={{ borderBottom: "1px solid rgba(255, 215, 0, 0.05)", transition: "all 0.2s ease" }}>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#fff", fontWeight: 500 }}>{formatDate(entry.ts)}</td>
                    <td style={{ padding: "1.25rem 1rem", border: "none" }}>
                      <span style={{ color: getEventTypeColor(entry.eventType), fontWeight: 700, fontSize: "0.75rem", padding: "0.4rem 0.8rem", background: `${getEventTypeColor(entry.eventType)}10`, borderRadius: "8px", display: "inline-block", border: `1px solid ${getEventTypeColor(entry.eventType)}40`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {entry.eventType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#ffd700", fontWeight: 700 }}>
                      {entry.eventType === "BOOST_BONUS" ? parseBoostBonusNarrative(entry.narrative).from : formatWalletName(entry.walletFrom)}
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#ffd700", fontWeight: 700 }}>{formatWalletName(entry.walletTo)}</td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", color: isNegative ? "#ff4d4d" : "#7FFF4C", fontWeight: 800, fontSize: "15px", textAlign: "right" }}>
                      {amountVal.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", color: "#FFB800", fontWeight: 800, fontSize: "15px", textAlign: "right" }}>
                      {entry.tscAmount ? parseFloat(entry.tscAmount.$numberDecimal || entry.tscAmount).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "1.25rem 1rem", border: "none", fontSize: "0.9rem", color: "#fff", fontWeight: 700, textAlign: "right" }}>
                      {entry.eventType === "BOOST_BONUS" ? `${parseBoostBonusNarrative(entry.narrative).rate}%` : entry.ratePct ? `${entry.ratePct}%` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-history-view" style={{ display: 'none' }}>
          {entries.map((entry, index) => {
            const hasYield = entry.eventType === "BOOST_BONUS" || entry.ratePct;
            const yieldVal = entry.eventType === "BOOST_BONUS" ? parseBoostBonusNarrative(entry.narrative).rate : entry.ratePct;
            const tscVal = entry.tscAmount ? parseFloat(entry.tscAmount.$numberDecimal || entry.tscAmount) : null;
            
            return (
              <div 
                key={index} 
                className="mb-4"
                style={{ 
                  background: "rgba(10, 10, 10, 0.6)", 
                  backdropFilter: "blur(10px)",
                  borderRadius: "24px", 
                  padding: "1.5rem", 
                  border: "1px solid rgba(255, 215, 0, 0.15)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: "800", letterSpacing: '1px' }}>{formatDate(entry.ts)}</span>
                  <span style={{ 
                    color: getEventTypeColor(entry.eventType), 
                    fontWeight: 900, 
                    fontSize: "10px", 
                    padding: "5px 12px", 
                    background: `${getEventTypeColor(entry.eventType)}15`, 
                    borderRadius: "8px",
                    border: `1px solid ${getEventTypeColor(entry.eventType)}40`,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {entry.eventType.replace(/_/g, " ")}
                  </span>
                </div>
                
                <div className="mb-4 p-3" style={{ background: 'rgba(255, 215, 0, 0.03)', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div style={{ fontSize: '10px', color: '#555', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Value Transfer</div>
                      <span style={{ fontSize: "20px", fontWeight: "900", color: parseFloat(entry.amount?.$numberDecimal || entry.amount) >= 0 ? "#7FFF4C" : "#ff4d4d", letterSpacing: '-1px' }}>
                        {parseFloat(entry.amount?.$numberDecimal || entry.amount).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} <small style={{ fontSize: '12px', opacity: 0.6 }}>USDT/SOL</small>
                      </span>
                    </div>
                    {hasYield && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#555', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Yield</div>
                        <div style={{ fontSize: "16px", fontWeight: "900", color: "#fff" }}>{yieldVal}%</div>
                      </div>
                    )}
                  </div>

                  {tscVal && (
                    <div style={{ borderTop: '1px solid rgba(255,184,0,0.1)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#555', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Token Equivalence</div>
                      <div style={{ fontSize: "16px", fontWeight: "900", color: "#FFB800" }}>
                        {tscVal.toLocaleString()} <span style={{ fontSize: '10px', opacity: 0.8 }}>TSC</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#444', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Source Node</span>
                    <span style={{ color: '#ffd700', fontWeight: '700', fontSize: '14px' }}>{entry.eventType === "BOOST_BONUS" ? parseBoostBonusNarrative(entry.narrative).from : formatWalletName(entry.walletFrom)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,215,0,0.1)', width: '100%' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#444', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Target Account</span>
                    <span style={{ color: '#ffd700', fontWeight: '700', fontSize: '14px' }}>{formatWalletName(entry.walletTo)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="d-flex flex-column gap-3 mt-4 pagination-wrapper" style={{ padding: "0 1rem" }}>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <button
                className="btn btn-sm"
                style={{
                  background: pagination.hasPrevPage ? "rgba(255, 215, 0, 0.1)" : "rgba(50, 50, 50, 0.1)",
                  color: pagination.hasPrevPage ? "#ffd700" : "#555",
                  border: `1px solid ${pagination.hasPrevPage ? "rgba(255, 215, 0, 0.2)" : "rgba(50, 50, 50, 0.2)"}`,
                  borderRadius: "8px", padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700
                }}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Prev
              </button>

              <div className="d-flex gap-2">
                {/* Simplified page numbers for mobile if needed, but keeping existing logic */}
                <span style={{ color: '#ffd700', fontWeight: '800', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
              </div>

              <button
                className="btn btn-sm"
                style={{
                  background: pagination.hasNextPage ? "rgba(255, 215, 0, 0.1)" : "rgba(50, 50, 50, 0.1)",
                  color: pagination.hasNextPage ? "#ffd700" : "#555",
                  border: `1px solid ${pagination.hasNextPage ? "rgba(255, 215, 0, 0.2)" : "rgba(50, 50, 50, 0.2)"}`,
                  borderRadius: "8px", padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700
                }}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </button>
            </div>
            
            <div className="d-flex justify-content-center">
              <select
                className="form-select form-select-sm"
                value={pagination.limit}
                onChange={handleLimitChange}
                style={{
                  background: "rgba(10,10,10,0.8)", color: "#888", border: "1px solid rgba(255,215,0,0.1)",
                  borderRadius: "8px", width: "120px", fontSize: '11px', fontWeight: '700'
                }}
              >
                <option value="10">10 PER PAGE</option>
                <option value="25">25 PER PAGE</option>
                <option value="50">50 PER PAGE</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
