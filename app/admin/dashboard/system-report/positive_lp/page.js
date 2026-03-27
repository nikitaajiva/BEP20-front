"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  Calendar, 
  User, 
  Users, 
  ArrowLeft, 
  Filter,
  Layers,
  ShieldCheck,
  Zap
} from "lucide-react";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

export default function PositiveLPPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalRecords: 0, totalLp: 0, totalZeroRisk: 0 });
  const [search, setSearch] = useState("");
  const [parent, setParent] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      else if (!["support", "admin"].includes(user.userType)) router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchPositiveLP = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams({ page, limit });
      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);

      if (fromDate || toDate) {
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
      } else {
        params.append("date", date);
      }

      const res = await fetch(`${API_BASE_URL}api/support/positivelp?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch data");

      setData(json.data || []);
      setSummary(json.summary || { totalRecords: 0, totalLp: 0, totalZeroRisk: 0 });
      setPagination((prev) => ({
        ...prev,
        ...json.pagination,
        currentPage: json.pagination?.currentPage || page,
      }));
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchPositiveLP(pagination.currentPage, pagination.limit);
    }
  }, [user, pagination.currentPage, pagination.limit, date, fromDate, toDate, parent]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchPositiveLP(1, pagination.limit);
  };

  // ✅ Excel Export Handler
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);

      if (fromDate || toDate) {
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
      } else {
        params.append("date", date);
      }

      const res = await fetch(`${API_BASE_URL}api/support/positivelp/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to export Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PositiveLP_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Export failed: " + err.message);
    }
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
    border: "1px solid rgba(255, 215, 0, 0.1)",
    borderRadius: "16px",
  };

  const inputStyle = {
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(255, 215, 0, 0.2)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const SummaryCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ ...glassStyle, padding: "1.2rem", flex: 1, minWidth: "200px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
        <Icon size={80} color={color} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{title}</div>
      <div style={{ color, fontSize: "1.5rem", fontWeight: "800" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ background: "#060606", minHeight: "100vh", padding: "2rem", fontFamily: "'Inter', sans-serif" }}>
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <button 
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#ffd700", cursor: "pointer", fontSize: "0.85rem", marginBottom: "12px", fontWeight: "700", opacity: 0.8 }}
          >
            <ArrowLeft size={14} /> PROTOCOL REPORTS
          </button>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "-1.5px" }}>
            Positive <span style={{ color: "#ffd700" }}>LP Positions</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "6px" }}>Real-time terminal of active liquidity allocations and risk-exposure metrics.</p>
        </div>
        
        <button
          onClick={handleExport}
          style={{
            ...glassStyle,
            background: "rgba(255, 215, 0, 0.08)",
            color: "#ffd700",
            fontWeight: "800",
            padding: "0.9rem 1.8rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "1px solid rgba(255, 215, 0, 0.4)",
            fontSize: "0.9rem",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.05)"
          }}
        >
          <Download size={18} /> EXPORT DATA
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <SummaryCard title="Live Records" value={summary.totalRecords} icon={Layers} color="#ffffff" />
        <SummaryCard title="Aggregate LP" value={Number(summary.totalLp).toLocaleString(undefined, { minimumFractionDigits: 6 })} icon={Zap} color="#ffd700" />
        <SummaryCard title="ZeroRisk Offset" value={Number(summary.totalZeroRisk).toLocaleString(undefined, { minimumFractionDigits: 6 })} icon={ShieldCheck} color="#00ff88" />
      </div>

      {/* Advanced Filter Console */}
      <div style={{ ...glassStyle, padding: "2rem", marginBottom: "2.5rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffd700", fontWeight: "800", fontSize: "0.85rem", letterSpacing: "1.5px" }}>
              <Filter size={14} /> FILTER ENGINE
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#ffd700",
                color: "#000",
                border: "none",
                borderRadius: "12px",
                padding: "0.75rem 2rem",
                fontWeight: "900",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)"
              }}
            >
              {loading ? "PROCESSING..." : <><Search size={18} /> APPLY FILTERS</>}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: "800", letterSpacing: "1px" }}>ENTITY LOOKUP</label>
               <div style={{ position: "relative" }}>
                 <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)" }} />
                 <input
                   type="text"
                   placeholder="Username / UHID"
                   value={search}
                   disabled={!!parent}
                   onChange={(e) => setSearch(e.target.value)}
                   style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
                 />
               </div>
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: "800", letterSpacing: "1px" }}>TEAM CLUSTER</label>
               <div style={{ position: "relative" }}>
                 <Users size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.6)" }} />
                 <input
                   type="text"
                   placeholder="Sponsor UHID"
                   value={parent}
                   disabled={!!search}
                   onChange={(e) => setParent(e.target.value)}
                   style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
                 />
               </div>
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: "800", letterSpacing: "1px" }}>START DATE</label>
               <input
                 type="date"
                 value={fromDate}
                 onChange={(e) => {
                   setFromDate(e.target.value);
                   setPagination((prev) => ({ ...prev, currentPage: 1 }));
                   setDate("");
                 }}
                 style={{ ...inputStyle, width: "100%" }}
               />
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: "800", letterSpacing: "1px" }}>END DATE</label>
               <input
                 type="date"
                 value={toDate}
                 onChange={(e) => {
                   setToDate(e.target.value);
                   setPagination((prev) => ({ ...prev, currentPage: 1 }));
                   setDate("");
                 }}
                 style={{ ...inputStyle, width: "100%" }}
               />
             </div>
          </div>
        </form>
      </div>

      {/* Main Data Terminal */}
      <div style={{ ...glassStyle, padding: "1.5rem", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
            <thead>
              <tr>
                {["ASSOCIATED ENTITY", "IDENTIFIER", "LP POSITION", "RISK OFFSET", "VELOCITIES"].map((h) => (
                  <th key={h} style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left", letterSpacing: "1.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={idx} style={{ background: "rgba(255,255,255,0.02)", transition: "all 0.3s ease", cursor: "default" }} className="table-row">
                    <td style={{ padding: "1.4rem 1rem", borderTopLeftRadius: "14px", borderBottomLeftRadius: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, transparent 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffd700", border: "1px solid rgba(255,215,0,0.1)" }}>
                          <User size={16} />
                        </div>
                        <span style={{ fontWeight: "800", color: "#fff", fontSize: "0.95rem" }}>{item.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1.4rem 1rem", color: "rgba(179, 186, 255, 0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.5px" }}>{item.uhid}</td>
                    <td style={{ padding: "1.4rem 1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#ffd700", fontWeight: "900", fontSize: "1.1rem" }}>{Number(item.lp).toLocaleString()}</span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", fontWeight: "800", letterSpacing: "1px" }}>USDT POSITION</span>
                      </div>
                    </td>
                    <td style={{ padding: "1.4rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00ff88" }}>
                        <ShieldCheck size={14} />
                        <span style={{ fontWeight: "800" }}>{Number(item.zeroRisk).toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1.4rem 1rem", borderTopRightRadius: "14px", borderBottomRightRadius: "14px" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00d9ff", background: "rgba(0, 217, 255, 0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(0, 217, 255, 0.1)", width: "fit-content" }}>
                         <Zap size={14} />
                         <span style={{ fontWeight: "900", fontSize: "0.85rem" }}>{item.autopositioning}</span>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "6rem 2rem", color: "rgba(255,255,255,0.1)" }}>
                    <Layers size={64} style={{ marginBottom: "1.5rem", opacity: 0.2 }} />
                    <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>PROTOCOL TERMINAL: NO ACTIVE DATA FOUND</p>
                    <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Adjust your filters or try a different date range.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Global Pagination Console */}
        {pagination.totalPages > 1 && (
          <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: "700" }}>TERMINAL DEPTH:</span>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value), currentPage: 1 }))}
                style={{ background: "#000", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem", fontWeight: "800", outline: "none" }}
              >
                {[10, 20, 50, 100, 200, 500].map((s) => <option key={s} value={s}>{s} / VIEW</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
                style={{
                  ...glassStyle,
                  padding: "0.6rem 1.2rem",
                  color: pagination.hasPrevPage ? "#ffd700" : "rgba(255,255,255,0.05)",
                  background: "transparent",
                  cursor: pagination.hasPrevPage ? "pointer" : "default",
                  fontSize: "0.8rem",
                  fontWeight: "900",
                  letterSpacing: "1px"
                }}
              >
                PREV
              </button>

              {getPageNumbers(pagination.currentPage, pagination.totalPages).map((p, i) => (
                <button
                  key={i}
                  onClick={() => p !== "..." && setPagination((prev) => ({ ...prev, currentPage: p }))}
                  style={{
                    ...glassStyle,
                    padding: "0.6rem 1rem",
                    background: pagination.currentPage === p ? "#ffd700" : "rgba(255,255,255,0.02)",
                    color: pagination.currentPage === p ? "#000" : "#fff",
                    border: pagination.currentPage === p ? "1px solid #ffd700" : "1px solid rgba(255,255,255,0.1)",
                    cursor: p === "..." ? "default" : "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "900",
                    transition: "all 0.2s ease"
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                style={{
                  ...glassStyle,
                  padding: "0.6rem 1.2rem",
                  color: pagination.hasNextPage ? "#ffd700" : "rgba(255,255,255,0.05)",
                  background: "transparent",
                  cursor: pagination.hasNextPage ? "pointer" : "default",
                  fontSize: "0.8rem",
                  fontWeight: "900",
                  letterSpacing: "1px"
                }}
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .table-row:hover {
          background: rgba(255, 215, 0, 0.08) !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(10deg);
          cursor: pointer;
          opacity: 0.6;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
