"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

export default function ActiveLp() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalCap: 0,
    totalUsed: 0,
    pending: 0,
  });

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [parent, setParent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [date, setDate] = useState("");

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

  // ✅ Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/sign-in");
      else if (!["support", "admin"].includes(user.userType))
        router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  // ✅ Fetch Active LP
  const fetchActiveLp = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams({ page, limit });

      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (date) params.append("date", date);

      const res = await fetch(
        `${API_BASE_URL}api/support/activeLp?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to fetch data");

      setData(json.data || []);
      setSummary(json.summary || summary);
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

  // ✅ Auto fetch
  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchActiveLp(pagination.currentPage, pagination.limit);
    }
  }, [user, pagination.currentPage, pagination.limit]);

  // 🔘 Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchActiveLp(1, pagination.limit);
  };

  // ⬇️ Export Excel
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (parent) params.append("parent", parent);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (date) params.append("date", date);

      const res = await fetch(
        `${API_BASE_URL}api/support/activeLp/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ActiveLP_Report_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  // 🔢 Pagination helper
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

  const inputStyle = {
    padding: "0.75rem",
    borderRadius: "12px",
    border: "1px solid rgba(79,140,255,0.2)",
    background: "rgba(79,140,255,0.1)",
    color: "#fff",
    minHeight: "44px",
  };

  // ✅ UI
  return (
    <div style={{ background: "#181f3a", borderRadius: "22px", padding: "2rem", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2>Active LP Report</h2>
        <button onClick={handleExport}>⬇️ Export to Excel</button>
      </div>

      {/* 🔍 Filters */}
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "nowrap" }}
      >
        <input
          placeholder="Search by username or UHID..."
          value={search}
          disabled={!!parent}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 3 }}
        />

        <input
          placeholder="Team / Parent Username or UHID..."
          value={parent}
          disabled={!!search}
          onChange={(e) => setParent(e.target.value)}
          style={{ ...inputStyle, flex: 2 }}
        />

        <input
          type="date"
          value={fromDate}
          disabled={!!date}
          onChange={(e) => {
            setFromDate(e.target.value);
            setDate("");
          }}
          style={{ ...inputStyle, flex: 1.3 }}
        />

        <input
          type="date"
          value={toDate}
          disabled={!!date}
          onChange={(e) => {
            setToDate(e.target.value);
            setDate("");
          }}
          style={{ ...inputStyle, flex: 1.3 }}
        />

        <input
          type="date"
          value={date}
          disabled={!!fromDate || !!toDate}
          onChange={(e) => {
            setDate(e.target.value);
            setFromDate("");
            setToDate("");
          }}
          style={{ ...inputStyle, flex: 1.3 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {/* 🧾 Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span>Total Cap: {Number(summary.totalCap).toFixed(6)}</span>
        <span>Total Used: {Number(summary.totalUsed).toFixed(6)}</span>
        <span>Pending: {Number(summary.pending).toFixed(6)}</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.2)" }}>
              <th
                style={{ padding: "1rem", color: "#4f8cff", textAlign: "left" }}
              >
                Username
              </th>
              <th
                style={{ padding: "1rem", color: "#4f8cff", textAlign: "left" }}
              >
                UHID
              </th>
              <th
                style={{ padding: "1rem", color: "#4f8cff", textAlign: "left" }}
              >
                LP
              </th>
              
               <th
                style={{ padding: "1rem", color: "#4f8cff", textAlign: "left" }}
              >
               Auto Positioning
              </th>
               <th
                style={{ padding: "1rem", color: "#4f8cff", textAlign: "left" }}
              >
                Active LP
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem", color: "#fff" }}>
                    {item.username}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {item.uhid}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {item.lp}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {item.autopositioning}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {item.activeLp}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
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

      {/* 📄 Pagination */}
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
          {/* Rows per page */}
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
              background: "rgba(79, 140, 255, 0.1)",
              color: "#4f8cff",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
            }}
          >
            {[10, 20, 50, 100, 200, 500].map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

          {/* Numbered pagination */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              disabled={!pagination.hasPrevPage}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background: pagination.hasPrevPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasPrevPage ? "#4f8cff" : "#8b92b5",
                border: "1px solid rgba(79, 140, 255, 0.2)",
              }}
            >
              Prev
            </button>

            {getPageNumbers(pagination.currentPage, pagination.totalPages).map(
              (p, i) =>
                p === "..." ? (
                  <span
                    key={i}
                    style={{ padding: "0.5rem 0.8rem", color: "#8b92b5" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, currentPage: p }))
                    }
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "6px",
                      border:
                        pagination.currentPage === p
                          ? "1px solid rgba(79, 140, 255, 0.5)"
                          : "1px solid rgba(79, 140, 255, 0.2)",
                      background:
                        pagination.currentPage === p
                          ? "rgba(79, 140, 255, 0.2)"
                          : "rgba(79, 140, 255, 0.05)",
                      color:
                        pagination.currentPage === p ? "#4f8cff" : "#8b92b5",
                      fontWeight: pagination.currentPage === p ? 600 : 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {p}
                  </button>
                )
            )}

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              disabled={!pagination.hasNextPage}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background: pagination.hasNextPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasNextPage ? "#4f8cff" : "#8b92b5",
                border: "1px solid rgba(79, 140, 255, 0.2)",
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
