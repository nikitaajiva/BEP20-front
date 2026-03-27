"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  ArrowLeft, 
  Filter,
  Globe,
  ShieldCheck,
  TrendingDown,
  User,
  Users,
  Activity,
  Box,
  Coins
} from "lucide-react";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

export default function EcosystemFeePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalCap: 0,
    totalUsed: 0,
    pending: 0,
  });
  const [search, setSearch] = useState("");
  const [parent, setParent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
      else if (!["support", "admin"].includes(user.userType))
        router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchEcosystemFee = async (page = 1, limit = pagination.limit) => {
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
      const res = await fetch(`${API_BASE_URL}api/support/ecosystemfee?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch data");
      setData(json.data || []);
      setSummary(json.summary || { totalCap: 0, totalUsed: 0, pending: 0 });
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
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchEcosystemFee(pagination.currentPage, pagination.limit);
    }
  }, [user, pagination.currentPage, pagination.limit, date, fromDate, toDate, parent]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchEcosystemFee(1, pagination.limit);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
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
      const res = await fetch(`${API_BASE_URL}api/support/ecosystemfee/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export Excel");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ecosystem_Fee_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
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
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#ffd700", cursor: "pointer", fontSize: "0.85rem", marginBottom: "12px", fontWeight: "700", opacity: 0.8 }}
          >
            <ArrowLeft size={14} /> BACK TO REPORTS
          </button>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "-1.5px" }}>
            Ecosystem <span style={{ color: "#ffd700" }}>Fee</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "6px" }}>Administrative dashboard for tracking and auditing ecosystem-wide transaction fees.</p>
        </div>
        
        <button
          onClick={handleExport}
          disabled={exporting}
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
            fontSize: "0.9rem",
            border: "1px solid rgba(255, 215, 0, 0.4)"
          }}
        >
          <Download size={18} /> {exporting ? "EXPORTING..." : "EXPORT DATA"}
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <SummaryCard title="Aggregate Fee" value={Number(summary.totalCap).toFixed(2)} icon={Coins} color="#ffffff" />
        <SummaryCard title="System Impact" value={Number(summary.totalUsed).toFixed(2)} icon={Activity} color="#ffd700" />
        <SummaryCard title="Awaiting Settlement" value={Number(summary.pending).toFixed(2)} icon={ShieldCheck} color="#ff4444" />
      </div>

      {/* Filter Engine */}
      <div style={{ ...glassStyle, padding: "2rem", marginBottom: "2.5rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffd700", fontWeight: "800", fontSize: "0.85rem", letterSpacing: "1px" }}>
              <Filter size={14} /> FILTER ENGINE
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#ffd700",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                padding: "0.7rem 1.8rem",
                fontWeight: "900",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              {loading ? "SEARCHING..." : "RELOAD DATA"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
             <div style={{ position: "relative" }}>
               <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.5)" }} />
               <input
                 type="text"
                 placeholder="Search Entity/UHID"
                 value={search}
                 disabled={!!parent}
                 onChange={(e) => setSearch(e.target.value)}
                 style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
               />
             </div>
             <div style={{ position: "relative" }}>
               <Users size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,215,0,0.5)" }} />
               <input
                 type="text"
                 placeholder="Search Parent/Team"
                 value={parent}
                 disabled={!!search}
                 onChange={(e) => setParent(e.target.value)}
                 style={{ ...inputStyle, width: "100%", paddingLeft: "42px" }}
               />
             </div>
             <input
               type="date"
               value={fromDate}
               onChange={(e) => { setFromDate(e.target.value); setDate(""); }}
               style={{ ...inputStyle, width: "100%" }}
             />
             <input
               type="date"
               value={toDate}
               onChange={(e) => { setToDate(e.target.value); setDate(""); }}
               style={{ ...inputStyle, width: "100%" }}
             />
             <input
               type="date"
               value={date}
               disabled={!!fromDate || !!toDate}
               onChange={(e) => { setDate(e.target.value); setFromDate(""); setToDate(""); }}
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
                {["ENTITY", "UHID", "ECOSYSTEM FEE", "SETTLEMENT STATUS"].map(h => (
                  <th key={h} style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} style={{ background: "rgba(255,255,255,0.02)", transition: "all 0.2s ease" }} className="table-row">
                  <td style={{ padding: "1.2rem 1rem", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,215,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffd700" }}>
                        <User size={12} />
                      </div>
                      <span style={{ fontWeight: "700", color: "#fff" }}>{item.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: "0.85rem" }}>{item.uhid}</td>
                  <td style={{ padding: "1.2rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ffd700", fontWeight: "900" }}>
                      <Globe size={14} /> {item.ecosystemfee || "0.00"}
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem", borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <div style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(0, 217, 255, 0.1)", color: "#00d9ff", fontSize: "0.65rem", fontWeight: "900", textTransform: "uppercase" }}>SETTLED</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && !loading && (
            <div style={{ padding: "4rem", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", fontWeight: "700", letterSpacing: "1px" }}>NO RECORDS MATCH THE CURRENT FILTERS</div>
          )}
        </div>

        {/* Console Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
               <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: "700" }}>DEPTH</span>
               <select
                 value={pagination.limit}
                 onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), currentPage: 1 }))}
                 style={{ background: "#000", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "8px", padding: "4px 8px", fontSize: "0.8rem", outline: "none" }}
               >
                 {[10, 20, 50, 100, 200, 500].map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button disabled={!pagination.hasPrevPage} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))} style={{ ...glassStyle, padding: "0.5rem 1rem", color: pagination.hasPrevPage ? "#ffd700" : "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}>PREV</button>
              {getPageNumbers(pagination.currentPage, pagination.totalPages).map((p, i) => (
                <button key={i} onClick={() => p !== "..." && setPagination(prev => ({ ...prev, currentPage: p }))} style={{ ...glassStyle, padding: "0.5rem 1rem", background: pagination.currentPage === p ? "#ffd700" : "transparent", color: pagination.currentPage === p ? "#000" : "#fff", border: pagination.currentPage === p ? "1px solid #ffd700" : "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", fontWeight: "900" }}>{p}</button>
              ))}
              <button disabled={!pagination.hasNextPage} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))} style={{ ...glassStyle, padding: "0.5rem 1rem", color: pagination.hasNextPage ? "#ffd700" : "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}>NEXT</button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 215, 0, 0.05) !important; transform: translateY(-1px); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(10deg); cursor: pointer; }
      `}</style>
    </div>
  );
}
