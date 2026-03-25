"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "../../../../globals.css";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

const REWARD_CONFIG = {
  community: {
    title: "Daily Cascade Rewards",
    apiParam: "community",
    column: "dailyCascadeRewards",
  },
  boost: {
    title: "Daily Boost Rewards",
    apiParam: "boost",
    column: "dailyRewardsBoost",
  },
  "airdrop-rewards": {
    title: "Daily Airdrop Rewards",
    apiParam: "airdrop-rewards",
    column: "dailyRewardsAirdrop",
  },
  lp: {
    title: "Daily LP Rewards",
    apiParam: "lp",
    column: "dailyRewardsLp",
  },
  booster: {
    title: "Community Booster Rewards",
    apiParam: "booster",
    column: "communityBoosterRewards",
  },
  xpower: {
    title: "X Power Rewards",
    apiParam: "xpower",
    column: "xPowerRewards",
  },
  x1: {
    title: "X1 Rewards",
    apiParam: "x1",
    column: "x1Rewards",
  },
  rewards: {
    title: "Daily Rewards Total",
    apiParam: "rewards",
    column: "dailyRewardsTotal",
  }
};

const REWARD_TITLES = {
  lp: "LP",
  community: "Cascade",
  boost: "Boost",
  "airdrop-rewards": "Airdrop",
  booster: "Community Booster",
  xpower: "X Power",
  x1: "X Bonus"
};
export default function DailyRewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { rewardType } = useParams();
  const rewardConfig = REWARD_CONFIG[rewardType];
  const isAllRewards = rewardType === "rewards";

  useEffect(() => {
    if (rewardType && !rewardConfig) {
      router.push("/support/dashboard");
    }
  }, [rewardType]);
  const rewardTitle = REWARD_TITLES[rewardType] || "";

  /* -------------------- STATE -------------------- */
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

  // ✅ DEFAULT LIMIT = 10 (IMPORTANT)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  /* -------------------- AUTH CHECK -------------------- */
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/sign-in");
      else if (!["support", "admin"].includes(user.userType))
        router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  /* -------------------- FETCH API -------------------- */
  const fetchDailyRewards = async (
    page = pagination.currentPage,
    limit = pagination.limit,
  ) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Filters (mutual behavior done via disabled inputs)
      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);

      // Date mode:
      // - If from/to used => range mode
      // - else single date mode
      if (fromDate || toDate) {
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
      } else {
        params.append("date", date);
      }

      const res = await fetch(
        `${API_BASE_URL}api/support/daily-rewards/${rewardType}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to fetch data");

      setData(json.data || []);
      setSummary(json.summary || {});
      setPagination((prev) => ({
        ...prev,
        ...json.pagination,
        currentPage: json.pagination?.currentPage || page,
      }));
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  console.log("SUMMARY:", data);

  /* -------------------- AUTO FETCH -------------------- */
  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchDailyRewards();
    }
  }, [
    user,
    pagination.currentPage,
    pagination.limit,
    date,
    fromDate,
    toDate,
    parent,
  ]);

  /* -------------------- SEARCH -------------------- */
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchDailyRewards(1, pagination.limit);
  };

  /* -------------------- EXPORT -------------------- */
  const handleExport = async () => {
    try {
      setExporting(true); // ✅ START feedback

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

      const res = await fetch(
        `${API_BASE_URL}api/support/daily-rewards/${rewardType}/export?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to export Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        fromDate || toDate
          ? `Daily_Rewards_${fromDate || "start"}_to_${toDate || "end"}.xlsx`
          : `Daily_Rewards_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false); // ✅ END feedback
    }
  };

  /* -------------------- PAGINATION HELPER -------------------- */
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 2;
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
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  /* -------------------- UI -------------------- */
  const inputStyle = {
    padding: "0.75rem",
    borderRadius: "12px",
    border: "1px solid rgba(79, 140, 255, 0.2)",
    background: "rgba(79, 140, 255, 0.1)",
    color: "#fff",
    minHeight: "44px",
  };

  const dateStyle = {
    padding: "0.75rem",
    borderRadius: "12px",
    border: "1px solid rgba(79, 140, 255, 0.2)",
    background: "rgba(79, 140, 255, 0.1)",
    color: "#fff",
  };

  const thStyle = {
    padding: "1rem",
    color: "#4f8cff",
    textAlign: "left",
  };

  return (
    <div
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        padding: "2rem",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Daily {rewardTitle} Rewards Report</h2>

        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            background: exporting
              ? "rgba(21, 192, 129, 0.08)"
              : "rgba(21, 192, 129, 0.15)",
            border: "1px solid rgba(21, 192, 129, 0.4)",
            borderRadius: "10px",
            color: "#15c081",
            fontWeight: "600",
            padding: "0.6rem 1.2rem",
            cursor: exporting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? (
            <>
              <span className="spinner" />
              Generating…
            </>
          ) : (
            <>⬇️ Export to Excel</>
          )}
        </button>
      </div>

      {/* Search + Date */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
          flexWrap: "nowrap", // 🔥 force single row
        }}
      >
        {/* 🔍 Search (BIGGEST) */}
        <input
          type="text"
          placeholder="Search by username or UHID..."
          value={search}
          disabled={!!parent}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            flex: "3", // 👑 biggest
          }}
        />

        {/* 👨‍👩‍👧 Parent */}
        <input
          type="text"
          placeholder="Team / Parent Username or UHID..."
          value={parent}
          disabled={!!search}
          onChange={(e) => setParent(e.target.value)}
          style={{
            ...inputStyle,
            flex: "2",
          }}
        />

        {/* 📅 From Date */}
        <input
          type="date"
          value={fromDate}
          disabled={!!date && !fromDate && !toDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
            setDate("");
          }}
          style={{ ...dateStyle, flex: "1.3" }}
        />

        {/* 📅 To Date */}
        <input
          type="date"
          value={toDate}
          disabled={!!date && !fromDate && !toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
            setDate("");
          }}
          style={{ ...dateStyle, flex: "1.3" }}
        />

        {/* 📆 Single Date */}
        <input
          type="date"
          value={date}
          disabled={!!fromDate || !!toDate}
          onChange={(e) => {
            setDate(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
            setFromDate("");
            setToDate("");
          }}
          style={{ ...dateStyle, flex: "1.3" }}
        />

        {/* 🔘 Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            minHeight: "44px",
            padding: "0 1.5rem",
            background: "rgba(79, 140, 255, 0.15)",
            border: "1px solid rgba(79, 140, 255, 0.3)",
            borderRadius: "12px",
            color: "#4f8cff",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error ? (
        <div style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
  {/* 👥 Total Users */}
  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
    <span style={{ color: "#b3baff", fontSize: "0.9rem" }}>
      Total Users:
    </span>
    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
      {summary.totalRecords ?? 0}
    </span>
  </div>

  {/* 💰 Total Rewards */}
  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
    <span style={{ color: "#b3baff", fontSize: "0.9rem" }}>
      Total Rewards:
    </span>
    <span
      style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#15c081",
      }}
    >
      {summary.totalRewards ?? "0.000000"}
    </span>
  </div>
</div>


      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(79,140,255,0.2)" }}>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>UHID</th>

              {rewardType === "lp" ? (
                <>
                  <th style={thStyle}>LP Reward</th>
                  <th style={thStyle}>Rewards On LP</th>
                  <th style={thStyle}>Rate</th>
                  <th style={thStyle}>Actual LP For Rewards</th>
                   <th style={thStyle}>Total</th>
                </>
              ) : rewardType === "x1" ? (
                <>
                  <th style={thStyle}>X1 Bonus Rewards</th>
                  <th style={thStyle}>X Bonus Limit</th>
                  <th style={thStyle}>X Bonus Used</th>
                   <th style={thStyle}>Total</th>
                </>
              ) :rewardType === "xpower" ? (
                <>
                  <th style={thStyle}>X Power Rewards</th>
                  <th style={thStyle}>X Power Rank</th>
                  <th style={thStyle}>X Power Limit</th>
                  <th style={thStyle}>X Power Used</th>
                   <th style={thStyle}>Total</th>
                </>
              ) :rewardType === "booster" ? (
                <>
                  <th style={thStyle}>Booster Rewards</th>
                  <th style={thStyle}>Booster Limit</th>
                  <th style={thStyle}>Booster Used</th>
                   <th style={thStyle}>Total</th>
                </>
              ) :rewardType === "boost" ? (
                <>
                  <th style={thStyle}>Boost Rewards</th>
                  <th style={thStyle}>Boost Limit</th>
                  <th style={thStyle}>Boost Used</th>
                   <th style={thStyle}>Available</th>
                </>
              ) :rewardType === "community" ? (
                <>
                  <th style={thStyle}>Cascade Rewards</th>
                  <th style={thStyle}>Cascade Lp limit</th>
                  <th style={thStyle}>Cascade Lp Used</th>
                  <th style={thStyle}>Cascade Limit</th>
                  <th style={thStyle}>Cascade Used</th>
                   <th style={thStyle}>Total</th>
                </>
              ) : isAllRewards ? (
                <>
                  <th style={thStyle}>LP</th>
                  <th style={thStyle}>Airdrop</th>
                  <th style={thStyle}>Boost</th>
                  <th style={thStyle}>Cascade</th>
                  <th style={thStyle}>Community Booster</th>
                  <th style={thStyle}>X Bonus</th>
                  <th style={thStyle}>X Power</th>
                   <th style={thStyle}>Total</th>
                </>
              ) : (
                <th style={thStyle}>{rewardTitle}</th>
              )}

             
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid rgba(79,140,255,0.1)" }}
                >
                  <td style={{ padding: "1rem" }}>{row.username}</td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {row.uhid}
                  </td>

                  {rewardType === "lp" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#15c081",
                          fontWeight: 600,
                        }}
                      >
                        {row.dailyRewardsLp ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.rewardsOnLP ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.rate ? Number(row.rate).toFixed(6) : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.actualLPForRewards ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                  </td>
                    </>
                  ) : rewardType === "x1" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#00d9ff",
                          fontWeight: 600,
                        }}
                      >
                        {row.x1Rewards ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.cap
                          ? Number(row.cap).toFixed(6)
                          : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.used ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                  </td>
                    </>
                  ): rewardType === "xpower" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#00d9ff",
                          fontWeight: 600,
                        }}
                      >
                        {row.xPowerRewards ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.xRank ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.cap
                          ? Number(row.cap).toFixed(6)
                          : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.used ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                  </td>
                    </>
                  ): rewardType === "booster" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#00d9ff",
                          fontWeight: 600,
                        }}
                      >
                        {row.communityBoosterRewards ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.cap
                          ? Number(row.cap).toFixed(6)
                          : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.used ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                  </td>
                    </>
                  ): rewardType === "community" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#00d9ff",
                          fontWeight: 600,
                        }}
                      >
                        {row.dailyCascadeRewards ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.lpCap ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.lpUsed ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.cap
                          ? Number(row.cap).toFixed(6)
                          : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.used ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                  </td>
                    </>
                  ): rewardType === "boost" ? (
                    <>
                      <td
                        style={{
                          padding: "1rem",
                          color: "#00d9ff",
                          fontWeight: 600,
                        }}
                      >
                        {row.dailyRewardsBoost ?? "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.boostLimitCap
                          ? Number(row.boostLimitCap).toFixed(6)
                          : "0.000000"}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.boostLimitUsed ?? "0.000000"}
                      </td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                          {row.available ?? row[rewardConfig.column] ?? "0.000000"}
                        </td>
                    </>
                  ) : isAllRewards ? (
                    <>
                      <td style={{ padding: "1rem", color: "#15c081" }}>
                        {row.dailyRewardsLp}
                      </td>
                      <td style={{ padding: "1rem", color: "#ffd700" }}>
                        {row.dailyRewardsAirdrop}
                      </td>
                      <td style={{ padding: "1rem", color: "#00d9ff" }}>
                        {row.dailyRewardsBoost}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.dailyCascadeRewards}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {row.communityBoosterRewards}
                      </td>
                      <td style={{ padding: "1rem" }}>{row.x1Rewards}</td>
                      <td style={{ padding: "1rem" }}>{row.xPowerRewards}</td>
                       <td style={{ padding: "1rem", fontWeight: 600 }}>
                        {row.total ?? row[rewardConfig.column] ?? "0.000000"}
                      </td>
                    </>
                  ) : (
                    <td
                      style={{
                        padding: "1rem",
                        fontWeight: 600,
                        color: "#15c081",
                      }}
                    >
                      {row[rewardConfig.column] ?? "0.000000"}
                    </td>
                  )}

                 
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={rewardType === "lp" ? 6 : isAllRewards ? 10 : 4}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#b3baff",
                  }}
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 PAGINATION (YOUR DESIGN – FULLY FUNCTIONAL) */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <select
            value={pagination.limit}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                limit: Number(e.target.value),
                currentPage: 1,
              }))
            }
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "10px",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              background: "rgba(79, 140, 255, 0.08)",
              color: "#fff",
            }}
          >
            {[10, 20, 50, 100, 200, 500].map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  currentPage: p.currentPage - 1,
                }))
              }
              style={{
                background: "rgba(79, 140, 255, 0.1)",
                border: "1px solid rgba(79, 140, 255, 0.2)",
                borderRadius: "10px",
                color: "#4f8cff",
                padding: "0.5rem 0.9rem",
                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                opacity: pagination.hasPrevPage ? 1 : 0.5,
              }}
            >
              Prev
            </button>

            {getPageNumbers(pagination.currentPage, pagination.totalPages).map(
              (p, i) =>
                p === "..." ? (
                  <span key={i} style={{ color: "#b3baff", padding: "0.5rem" }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, currentPage: p }))
                    }
                    style={{
                      background:
                        p === pagination.currentPage
                          ? "rgba(79, 140, 255, 0.25)"
                          : "rgba(79, 140, 255, 0.1)",
                      border: "1px solid rgba(79, 140, 255, 0.2)",
                      borderRadius: "10px",
                      color: "#4f8cff",
                      padding: "0.5rem 0.9rem",
                      cursor: "pointer",
                      fontWeight: p === pagination.currentPage ? "700" : "500",
                    }}
                  >
                    {p}
                  </button>
                ),
            )}

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  currentPage: p.currentPage + 1,
                }))
              }
              style={{
                background: "rgba(79, 140, 255, 0.1)",
                border: "1px solid rgba(79, 140, 255, 0.2)",
                borderRadius: "10px",
                color: "#4f8cff",
                padding: "0.5rem 0.9rem",
                cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                opacity: pagination.hasNextPage ? 1 : 0.5,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
