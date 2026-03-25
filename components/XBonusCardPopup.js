import React, { useState } from "react";

export default function XBonusPopup({
  isOpen,
  onClose,
  rewards = [],
  level = null,
}) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 username extractor (same logic, safe)
  function extractUsername(username) {
    return username || "-";
  }

  // 🔹 filter by username
  const filteredRewards = rewards.filter((r) =>
    extractUsername(r.username)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgb(0 0 0 / 90%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          maxWidth: "900px",
          width: "90%",
          position: "relative",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(16,25,53,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <section style={{ padding: "24px" }}>
          <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
            X-Bonus Rewards {level ? `(${level})` : ""}
          </h2>

          {/* 🔍 Search */}
          {rewards.length > 0 && (
            <div style={{ marginBottom: "12px", textAlign: "right" }}>
              <input
                type="text"
                placeholder="Search username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "#e5e7eb",
                  fontSize: "12px",
                }}
              />
            </div>
          )}

          {filteredRewards.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af" }}>
              No rewards found
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead
                  style={{
                    background: "#20284a",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <tr>
                    <th style={th}>Sr.</th>
                    <th style={th}>Username</th>
                    <th style={th}>Self LP</th>
                    <th style={th}>Team LP</th>
                    <th style={th}>Reward (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background:
                          idx % 2 === 0 ? "#1c2444" : "#181f3a",
                      }}
                    >
                      <td style={tdCenter}>{idx + 1}</td>
                      <td style={td}>{r.username}</td>
                      <td style={tdRight}>
                        {Number(r.selfLp || 0).toFixed(2)}
                      </td>
                      <td style={tdRight}>
                        {Number(r.teamLp || 0).toFixed(2)}
                      </td>
                      <td style={tdRightGreen}>
                        {Number(r.reward || 0).toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* 🔹 styles */
const th = {
  border: "1px solid #374151",
  padding: "10px",
  textAlign: "left",
};

const td = {
  border: "1px solid #374151",
  padding: "10px",
};

const tdCenter = {
  ...td,
  textAlign: "center",
};

const tdRight = {
  ...td,
  textAlign: "right",
  color: "#d1d5db",
};

const tdRightGreen = {
  ...tdRight,
  color: "#7fff4c",
  fontWeight: 600,
};
