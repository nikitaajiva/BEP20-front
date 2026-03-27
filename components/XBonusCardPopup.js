import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function XBonusPopup({
  isOpen,
  onClose,
  rewards = [],
  displayLevel = null,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen || !mounted) return null;

  // username extractor
  function extractUsername(username) {
    return username || "-";
  }

  // filter by username
  const filteredRewards = rewards.filter((r) =>
    extractUsername(r.username)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const content = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        width: "100%",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#060606",
          borderRadius: "32px",
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "90vh",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.05)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div style={{ padding: "30px 40px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255,255,255,0.02)" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              right: "25px",
              top: "25px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "20px"
            }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: '0.5px' }}>
                Growth Multiplier Analytics
              </h2>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                Growth Multiplier {displayLevel} - Performance Insights
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <section style={{ padding: "30px 40px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {rewards.length > 0 && (
            <div style={{ marginBottom: "25px" }}>
              <div style={{ position: "relative", maxWidth: "350px", marginLeft: "auto" }}>
                <input
                  type="text"
                  placeholder="Filter by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.4)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                  }}
                />
              </div>
            </div>
          )}

          {filteredRewards.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "rgba(255,255,255,0.3)" }}>
               <p>{searchTerm ? "No results found matching your query" : "No rewards data available for this multiplier level"}</p>
            </div>
          ) : (
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: "auto",
                width: "100%",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                background: "rgba(0,0,0,0.2)"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0",
                  fontSize: "13px",
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#111827",
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "center", width: "60px" }}>Idx</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "left" }}>Contributor</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "right" }}>Personal LP</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "right" }}>Team LP</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "right" }}>Reward (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      }}
                    >
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", color: "#fff", fontWeight: "600" }}>
                        {extractUsername(r.username)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "right", color: "#ffd700", fontFamily: "monospace", fontWeight: '700' }}>
                        {Number(r.selfLp || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "right", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                        {Number(r.teamLp || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "right", color: "#7fff4c", fontWeight: "800", fontFamily: "monospace" }}>
                        {Number(r.reward || 0).toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
