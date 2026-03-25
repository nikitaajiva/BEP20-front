"use client";
import React, { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function WithdrawDepositTableForm() {
  const [withdrawal, setWithdrawal] = useState("");
  const [deposit, setDeposit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasFetchedRef = useRef(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/support/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch settings");
      }

      const latest = data.data;
      if (latest) {
        const nextWithdrawal =
          latest.negativeWithdrawal === null ||
            latest.negativeWithdrawal === undefined
            ? ""
            : String(latest.negativeWithdrawal);
        const nextDeposit =
          latest.positiveDeposit === null ||
            latest.positiveDeposit === undefined
            ? ""
            : String(latest.positiveDeposit);

        setWithdrawal(nextWithdrawal);
        setDeposit(nextDeposit);
      }
    } catch (err) {
      console.error("Fetch settings error:", err.message);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const negativeWithdrawal = Number(withdrawal);
    const positiveDeposit = Number(deposit);

    if (!negativeWithdrawal && !positiveDeposit) {
      setError("Please enter at least one value");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        negativeWithdrawal,
        positiveDeposit,
      };

      const res = await fetch(`${API_BASE}/api/support/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update settings");
      }

      await fetchSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled =
    (!Number(withdrawal) && !Number(deposit)) || loading;

  const thStyle = {
    textAlign: "left",
    padding: "0.9rem",
    color: "#b3baff",
    fontWeight: 500,
    fontSize: "0.9rem",
    width: "40%",
    borderBottom: "1px solid rgba(79,140,255,0.15)",
  };

  const tdStyle = {
    padding: "0.9rem",
    borderBottom: "1px solid rgba(79,140,255,0.15)",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.65rem",
    borderRadius: "10px",
    background: "#0f1530",
    color: "#fff",
    outline: "none",
    border: "1px solid rgba(79,140,255,0.3)",
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#181f3a",
          padding: "1.5rem",
          borderRadius: "20px",
          border: "1px solid rgba(79,140,255,0.2)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <th style={thStyle}>
                <span style={{ color: "#ff9a9a" }}>
                  Negative Withdrawals %
                </span>
              </th>
              <td style={tdStyle}>
                <input
                  type="number"
                  step="0.001"
                  value={withdrawal}
                  onChange={(e) => setWithdrawal(e.target.value)}
                  placeholder="0.005"
                  style={{
                    ...inputStyle,
                    border: "1px solid rgba(255,154,154,0.4)",
                  }}
                />
              </td>
            </tr>

            <tr>
              <th style={thStyle}>
                <span style={{ color: "#9affb3" }}>
                  Positive Deposits %
                </span>
              </th>
              <td style={tdStyle}>
                <input
                  type="number"
                  step="0.001"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0.005"
                  style={{
                    ...inputStyle,
                    border: "1px solid rgba(154,255,179,0.4)",
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {error && (
          <p style={{ color: "#ff9a9a", marginTop: "1rem" }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
          <button
            type="submit"
            disabled={isSaveDisabled}
            style={{
              padding: "0.6rem 1.6rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4f8cff, #6ea8ff)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              cursor: isSaveDisabled ? "not-allowed" : "pointer",
              opacity: isSaveDisabled ? 0.6 : 1,
            }}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </>
  );
}
