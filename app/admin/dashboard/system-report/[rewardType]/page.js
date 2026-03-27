"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { 
  Search, 
  Download, 
  ArrowLeft, 
  Filter,
  Layers,
  ShieldCheck,
  Zap,
  User,
  Users,
  Coins,
  TrendingUp,
  Activity
} from "lucide-react";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

const REWARD_CONFIG = {
  community: { title: "Daily Cascade Rewards", apiParam: "community", column: "dailyCascadeRewards" },
  boost: { title: "Daily Boost Rewards", apiParam: "boost", column: "dailyRewardsBoost" },
  "airdrop-rewards": { title: "Daily Airdrop Rewards", apiParam: "airdrop-rewards", column: "dailyRewardsAirdrop" },
  lp: { title: "Daily LP Rewards", apiParam: "lp", column: "dailyRewardsLp" },
  booster: { title: "Community Booster Rewards", apiParam: "booster", column: "communityBoosterRewards" },
  xpower: { title: "X Power Rewards", apiParam: "xpower", column: "xPowerRewards" },
  x1: { title: "Growth Multiplier Rewards", apiParam: "x1", column: "x1Rewards" },
  rewards: { title: "Daily Rewards Total", apiParam: "rewards", column: "dailyRewardsTotal" }
};

const REWARD_TITLES = {
  lp: "LP",
  community: "Cascade",
  boost: "Boost",
  "airdrop-rewards": "Airdrop",
  booster: "Booster",
  xpower: "X Power",
  x1: "Growth Multiplier",
  rewards: "Protocol"
};

export default function DailyRewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { rewardType } = useParams();
  const rewardConfig = REWARD_CONFIG[rewardType];
  const isAllRewards = rewardType === "rewards";

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalRewards: "0.000000",
    rewardDate: "",
  });

  const [search, setSearch] = useState("");
  const [parent, setParent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    if (rewardType && !rewardConfig) {
      router.push("/admin/dashboard/system-report");
    }
  }, [user, authLoading, router, rewardType, rewardConfig]);

  const fetchDailyRewards = async (page = pagination.currentPage, limit = pagination.limit) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);
      if (fromDate || toDate) {
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
      } else {
        params.append("date", date);
      }
      const res = await fetch(`${API_BASE_URL}api/support/daily-rewards/${rewardType}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch data");
      setData(json.data || []);
      setSummary(json.summary || {});
      setPagination((prev) => ({
        ...prev,
        ...json.pagination,
        currentPage: json.pagination?.currentPage || page,
      }));
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchDailyRewards();
    }
  }, [user, pagination.currentPage, pagination.limit, date, fromDate, toDate, parent]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchDailyRewards(1, pagination.limit);
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
      const res = await fetch(`${API_BASE_URL}api/support/daily-rewards/${rewardType}/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export Excel");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fromDate || toDate ? `Daily_Rewards_${fromDate || "start"}_to_${toDate || "end"}.xlsx` : `Daily_Rewards_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
    <div style={{ ...glassStyle, padding: "1.2rem", flex: 1, minWidth: "220px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}>
        <Icon size={80} color={color} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{title}</div>
      <div style={{ color, fontSize: "1.5rem", fontWeight: "800" }}>{value}</div>
    </div>
  );

  const rewardTitle = REWARD_TITLES[rewardType] || "";

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
            {rewardTitle} <span style={{ color: "#ffd700" }}>Performance Logs</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "6px" }}>Detailed terminal for protocol-wide {rewardTitle.toLowerCase()} reward distributions.</p>
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
            cursor: exporting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
            border: "1px solid rgba(255, 215, 0, 0.4)",
            opacity: exporting ? 0.6 : 1
          }}
        >
          <Download size={18} /> {exporting ? "PROCESSING..." : "EXPORT DATA"}
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <SummaryCard title="Active Recipients" value={summary.totalRecords} icon={Users} color="#ffffff" />
        <SummaryCard title={`Total ${rewardTitle} Payout`} value={Number(summary.totalRewards || 0).toLocaleString(undefined, { minimumFractionDigits: 6 })} icon={Coins} color="#ffd700" />
        <SummaryCard title="Snapshot Date" value={summary.rewardDate || date} icon={Activity} color="#00ff88" />
      </div>

      {/* Filter Console */}
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
                {["ENTITY", "UHID"].map(h => (
                  <th key={h} style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left", letterSpacing: "1px" }}>{h}</th>
                ))}
                
                {rewardType === "lp" ? (
                  <>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "#ffd700", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>LP YIELD</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>REWARDS ON LP</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>YIELD RATE</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>ACTUAL POSITION</th>
                  </>
                ) : rewardType === "x1" ? (
                  <>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "#ffd700", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>GROWTH MULTIPLIER</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>BONUS LIMIT</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>LIMIT USED</th>
                  </>
                ) : isAllRewards ? (
                  <>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>LP</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>AIRDROP</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>BOOST</th>
                    <th style={{ padding: "0 1rem 1rem 1rem", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>CASCADE</th>
                  </>
                ) : (
                  <th style={{ padding: "0 1rem 1rem 1rem", color: "#ffd700", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>{rewardTitle.toUpperCase()}</th>
                )}
                <th style={{ padding: "0 1rem 1rem 1rem", color: "#ffd700", fontSize: "0.7rem", fontWeight: "900", textAlign: "left" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} style={{ background: "rgba(255,255,255,0.02)", transition: "all 0.2s ease" }} className="table-row">
                  <td style={{ padding: "1.2rem 1rem", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,215,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffd700" }}>
                        <User size={12} />
                      </div>
                      <span style={{ fontWeight: "700", color: "#fff" }}>{row.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: "0.85rem" }}>{row.uhid}</td>
                  
                  {rewardType === "lp" ? (
                    <>
                      <td style={{ padding: "1.2rem 1rem", color: "#15c081", fontWeight: "800" }}>{row.dailyRewardsLp}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#fff" }}>{row.rewardsOnLP}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#ffd700" }}>{Number(row.rate || 0).toFixed(6)}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#fff" }}>{row.actualLPForRewards}</td>
                    </>
                  ) : rewardType === "x1" ? (
                    <>
                      <td style={{ padding: "1.2rem 1rem", color: "#00d9ff", fontWeight: "800" }}>{row.x1Rewards}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#ffd700" }}>{Number(row.cap || 0).toFixed(6)}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#fff" }}>{row.used}</td>
                    </>
                  ) : isAllRewards ? (
                    <>
                      <td style={{ padding: "1.2rem 1rem", color: "#15c081" }}>{row.dailyRewardsLp}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#ffd700" }}>{row.dailyRewardsAirdrop}</td>
                      <td style={{ padding: "1.2rem 1rem", color: "#00d9ff" }}>{row.dailyRewardsBoost}</td>
                      <td style={{ padding: "1.2rem 1rem" }}>{row.dailyCascadeRewards}</td>
                    </>
                  ) : (
                    <td style={{ padding: "1.2rem 1rem", color: "#15c081", fontWeight: "700" }}>{row[rewardConfig.column] || "0.000000"}</td>
                  )}
                  <td style={{ padding: "1.2rem 1rem", borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ffd700", fontWeight: "900" }}>
                      <TrendingUp size={14} /> {row.total || row[rewardConfig.column] || "0.000000"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
