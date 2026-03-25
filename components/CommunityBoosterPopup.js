import React, { useState } from "react";

export default function CommunityBoosterPopup({
  isOpen,
  onClose,
  rewards = [],
  level = null,
}) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("");

function extractUsername(narrative) {
  if (!narrative) return "";
  
  // Try to extract name after 'from'
  const fromParts = narrative.split("from ");
  if (fromParts.length > 1) {
    return fromParts[1].split(" ")[0].replace(/'s$/, "").trim();
  }

  // If 'from' not found, remove everything after 'deposit'
  const depositIndex = narrative.toLowerCase().indexOf("deposit");
  if (depositIndex !== -1) {
    return narrative.substring(0, depositIndex).replace(/'s$/, "").trim();
  }

  // Default case
  return narrative.replace(/'s$/, "").trim();
}



  // filter rewards by search
  const filteredRewards = rewards.filter((r) =>
    extractUsername(r.narrative)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  console.log(rewards )
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgb(0 0 0 / 90%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        width: "100%",
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
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
          }}
        >
          ×
        </button>

        {/* Content */}
        <section className="relative py-6 px-6 text-center overflow-hidden">
          <h2 className="text-lg font-bold mb-4">
            Community Rewards Details {level ? `(Level ${level})` : ""}
          </h2>

          {/* 🔍 Search box */}
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
                  outline: "none",
                }}
              />
            </div>
          )}

          {filteredRewards.length === 0 ? (
            <p className="text-gray-400">
              {searchTerm ? "No results found" : "No rewards for this level"}
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  width: "100%",
                  padding: "12px",
                  boxSizing: "border-box",
                }}
              >
               <table
  style={{
    minWidth: "600px",
    borderCollapse: "collapse",
    fontSize: "12px",
    color: "#e5e7eb",
    width: "100%",
    tableLayout: "fixed", // 🔹 ensures proper column alignment
  }}
>
  <thead
    style={{
      position: "sticky",
      top: 0,
      background: "#20284a",
      zIndex: 10,
    }}
  >
    <tr>
      <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "40px", textAlign: "center" }}>
        Sr.
      </th>
      <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "180px", textAlign: "left" }}>
        Username
      </th>
      {/* <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "120px", textAlign: "right" }}>
        User LP
      </th> */}
      <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "120px", textAlign: "right" }}>
        LP Reward
      </th>
      <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "120px", textAlign: "right" }}>
        Amount (USDT)
      </th>
      <th style={{ border: "1px solid #374151", padding: "8px 14px", width: "80px", textAlign: "center" }}>
        Rate
      </th>
    </tr>
  </thead>
  <tbody>
    {filteredRewards.map((r, idx) => (
      <tr
        key={r._id}
        style={{
          background: idx % 2 === 0 ? "#1c2444" : "#181f3a",
        }}
      >
        <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "center" }}>
          {idx + 1}
        </td>
        <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "left", color: "#d1d5db" }}>
          {extractUsername(r.narrative)}
        </td>
        {/* <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "right", color: "#7fff4c", fontWeight: "600" }}>
          {parseFloat(r.lp).toFixed(6)}
        </td> */}
        <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "right", color: "#7fff4c", fontWeight: "600" }}>
          {parseFloat(r.lp_reward.$numberDecimal)?.toFixed(6)}
        </td>
        <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "right", color: "#7fff4c", fontWeight: "600" }}>
          {parseFloat(r.amount.$numberDecimal)?.toFixed(6)}
        </td>
        <td style={{ border: "1px solid #374151", padding: "8px 14px", textAlign: "center" }}>
          {(parseFloat(r.rate.$numberDecimal) * 100)?.toFixed(0)}%
        </td>
      </tr>
    ))}
  </tbody>
</table>

              </div>
              <style jsx>{`
                /* Custom scrollbar for Webkit browsers */
                div::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #181f3a;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #3b4a7a;
                  border-radius: 10px;
                  border: 2px solid #181f3a;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #5b6bb2;
                }

                /* Firefox scrollbar */
                div {
                  scrollbar-width: thin;
                  scrollbar-color: #3b4a7a #181f3a;
                }
              `}</style>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
