"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  ArrowLeft,
  Filter,
  AlertCircle,
  User,
  Users,
  Activity,
  Box,
  Coins,
  Clock,
  ShieldAlert
} from "lucide-react";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

export default function WithdrawalErrorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalAmount: "0.00",
  });
  const [search, setSearch] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (!["support", "admin", "superadmin"].includes(user.userType))
        router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchWithdrawalErrors = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const params = new URLSearchParams({ page, limit });
      if (search) params.append("search", search);
      if (walletAddress) params.append("walletAddress", walletAddress);
      if (transactionId) params.append("transactionId", transactionId);
      if (fromDate) params.append("startDate", fromDate);
      if (toDate) params.append("endDate", toDate);

      const res = await fetch(`${API_BASE_URL}api/support/usdt-withdrawalerror?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch data");
      
      setData(json.data || []);
      setSummary(json.summary || { totalRecords: 0, totalAmount: "0.00" });
      setPagination((prev) => ({
        ...prev,
        ...json.pagination,
        currentPage: json.pagination?.currentPage || page,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && ["support", "admin", "superadmin"].includes(user.userType)) {
      fetchWithdrawalErrors(pagination.currentPage, pagination.limit);
    }
  }, [user, pagination.currentPage, pagination.limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchWithdrawalErrors(1, pagination.limit);
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
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

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 68, 68, 0.1)",
    borderRadius: "16px",
  };

  const inputStyle = {
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(255, 68, 68, 0.2)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.3s ease",
  };

  const SummaryCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ ...glassStyle, padding: "1.2rem", flex: 1, minWidth: "200px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
        <Icon size={80} color={color} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{title}</div>
      <div style={{ color: color, fontSize: "1.5rem", fontWeight: "800" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ background: "#060606", minHeight: "100vh", padding: "2rem", fontFamily: "'Inter', sans-serif" }}>
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <button
            onClick={() => router.push("/admin/dashboard/system-report")}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "0.85rem", marginBottom: "12px", fontWeight: "700", opacity: 0.8 }}
          >
            <ArrowLeft size={14} /> BACK TO REPORTS
          </button>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "-1.5px" }}>
            Withdrawal <span style={{ color: "#ff4444" }}>Errors</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "6px" }}>Detailed audit logs for failed on-chain withdrawal transactions.</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <SummaryCard title="Total Failed" value={summary.totalRecords} icon={AlertCircle} color="#ff4444" />
        <SummaryCard title="Total Volume" value={`${summary.totalAmount} USDT`} icon={Coins} color="#ffd700" />
        <SummaryCard title="Unique Users" value={new Set(data.map(d => d.userId)).size} icon={Users} color="#ffffff" />
      </div>

      {/* Filter Engine */}
      <div style={{ ...glassStyle, padding: "2rem", marginBottom: "2.5rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ff4444", fontWeight: "800", fontSize: "0.85rem", letterSpacing: "1px" }}>
              <Filter size={14} /> AUDIT FILTERS
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#ff4444",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.7rem 1.8rem",
                fontWeight: "900",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              {loading ? "SEARCHING..." : "RELOAD LOGS"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,68,68,0.5)" }} />
              <input
                type="text"
                placeholder="Search UHID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <ShieldAlert size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,68,68,0.5)" }} />
              <input
                type="text"
                placeholder="Search Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
              />
            </div>
            <input
              type="date"
              value={fromDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setToDate(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
        </form>
      </div>

      {/* Main Table Terminal */}
      <div style={{ ...glassStyle, padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr>
                {["USER", "AMOUNT", "WALLET", "ERROR INFO", "DATE"].map(h => (
                  <th key={h} style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} style={{ background: "rgba(255,255,255,0.02)", transition: "all 0.2s ease" }} className="table-row">
                  <td style={{ padding: "1.2rem 1rem", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700", color: "#fff" }}>{item.username}</span>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{item.uhid}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem" }}>
                    <div style={{ fontWeight: "800", color: "#ffd700" }}>{item.amount} USDT</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>{item.walletFrom}</div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem", maxWidth: "200px" }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", wordBreak: "break-all", fontFamily: "monospace" }}>{item.destinationAddress}</div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ff4444" }}>{item.errorCode}</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", maxWidth: "300px" }}>{item.errorMessage}</div>
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem", borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      <Clock size={14} /> {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && !loading && (
            <div style={{ padding: "4rem", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", fontWeight: "700", letterSpacing: "1px" }}>NO ERROR LOGS MATCH THE CURRENT FILTERS</div>
          )}
        </div>

        {/* Console Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: "700" }}>LIMIT</span>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), currentPage: 1 }))}
                style={{ background: "#000", color: "#ff4444", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "0.8rem", outline: "none" }}
              >
                {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button disabled={!pagination.hasPrevPage} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))} style={{ ...glassStyle, padding: "0.5rem 1rem", color: pagination.hasPrevPage ? "#ff4444" : "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}>PREV</button>
              {getPageNumbers(pagination.currentPage, pagination.totalPages).map((p, i) => (
                <button key={i} onClick={() => p !== "..." && setPagination(prev => ({ ...prev, currentPage: p }))} style={{ ...glassStyle, padding: "0.5rem 1rem", background: pagination.currentPage === p ? "#ff4444" : "transparent", color: pagination.currentPage === p ? "#fff" : "#fff", border: pagination.currentPage === p ? "1px solid #ff4444" : "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", fontWeight: "900" }}>{p}</button>
              ))}
              <button disabled={!pagination.hasNextPage} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))} style={{ ...glassStyle, padding: "0.5rem 1rem", color: pagination.hasNextPage ? "#ff4444" : "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}>NEXT</button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 68, 68, 0.05) !important; transform: translateY(-1px); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(0deg); cursor: pointer; }
      `}</style>
    </div>
  );
}

