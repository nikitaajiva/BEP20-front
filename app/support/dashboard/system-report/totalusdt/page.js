"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "../../../../globals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

export default function TotalUsdtPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, totalAmount: "0.00" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 20,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !["support", "admin"].includes(user.userType)) {
        router.push("/sign-in");
      }
    }
  }, [user, authLoading, router]);

  const fetchBalances = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(limit),
      });

      const res = await fetch(
        `${API_BASE_URL}api/support/system-report-usdt-users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch data");

      const data = json.data || {};
      const totalUsers = data.totalUsers || 0;
      const totalAmount = data.totalAmount || "0.00";
      const pageSize = data.pageSize || limit;

      setRows(data.rows || []);
      setSummary({ totalUsers, totalAmount });
      setPagination((prev) => ({
        ...prev,
        currentPage: data.page || page,
        totalPages: Math.ceil(totalUsers / pageSize),
        totalItems: totalUsers,
        limit: pageSize,
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
      fetchBalances(pagination.currentPage, pagination.limit);
    }
  }, [user, pagination.currentPage, pagination.limit]);

  return (
    <div className="container-xxl py-4">
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>USDT Balances</h2>

      {error && (
        <div style={{ color: "#ff4d4d", marginBottom: "1rem" }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          background: "rgba(79,140,255,0.05)",
          border: "1px solid rgba(79,140,255,0.2)",
          borderRadius: "12px",
          padding: "0.8rem 1rem",
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#b3baff",
        }}
      >
        <span>Total Users: {summary.totalUsers}</span>
        <span>Total USDT: {summary.totalAmount}</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.2)" }}>
              <th style={{ padding: "1rem", color: "#4f8cff" }}>Username</th>
              <th style={{ padding: "1rem", color: "#4f8cff" }}>UHID</th>
              <th style={{ padding: "1rem", color: "#4f8cff" }}>
                Wallet Address
              </th>
              <th style={{ padding: "1rem", color: "#4f8cff" }}>USDT</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr
                  key={row.userId}
                  style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem", color: "#fff" }}>
                    {row.username}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {row.uhid}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {row.wallet_address}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {row.amountStr}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#b3baff",
                  }}
                >
                  {loading ? "Loading..." : "No records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
              background: "rgba(79, 140, 255, 0.1)",
              color: "#fff",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              padding: "0.5rem",
              borderRadius: "8px",
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(79, 140, 255, 0.2)",
                background: "rgba(79, 140, 255, 0.1)",
                color: "#b3baff",
                cursor: "pointer",
              }}
            >
              Prev
            </button>
            <span style={{ color: "#b3baff" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(79, 140, 255, 0.2)",
                background: "rgba(79, 140, 255, 0.1)",
                color: "#b3baff",
                cursor: "pointer",
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
