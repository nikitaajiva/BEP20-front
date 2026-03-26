import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CommunityBoosterPopup({
  isOpen,
  onClose,
  rewards = [],
  level = null,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen || !mounted) return null;

  function extractUsername(narrative) {
    if (!narrative) return "";
    
    const fromParts = narrative.split("from ");
    if (fromParts.length > 1) {
      return fromParts[1].split(" ")[0].replace(/'s$/, "").trim();
    }

    const depositIndex = narrative.toLowerCase().indexOf("deposit");
    if (depositIndex !== -1) {
      return narrative.substring(0, depositIndex).replace(/'s$/, "").trim();
    }

    return narrative.replace(/'s$/, "").trim();
  }

  const filteredRewards = rewards.filter((r) =>
    extractUsername(r.narrative)
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
          background: "#080b12",
          borderRadius: "32px",
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "90vh",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(255, 215, 0, 0.05)",
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: '0.5px' }}>
                Performance Bonus Analytics
              </h2>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                Level {level} Detailed Booster Performance Breakdown
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
                  placeholder="Filter by contributor..."
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
              <p>{searchTerm ? "No records match your filter" : "No booster rewards data available currently"}</p>
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
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "right" }}>Booster LP</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "right" }}>Bonus Amt</th>
                    <th style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "center" }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.map((r, idx) => (
                    <tr
                      key={r._id}
                      style={{
                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      }}
                    >
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", color: "#fff", fontWeight: "600" }}>
                        {extractUsername(r.narrative)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "right", color: "#ffd700", fontFamily: "monospace", fontWeight: '700' }}>
                        {parseFloat(r.lp_reward?.$numberDecimal || r.lp_reward || 0).toFixed(6)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "right", color: "#7fff4c", fontWeight: "800", fontFamily: "monospace" }}>
                        {parseFloat(r.amount?.$numberDecimal || r.amount || 0).toFixed(6)}
                      </td>
                      <td style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", textAlign: "center" }}>
                        <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {(parseFloat(r.rate?.$numberDecimal || r.rate || 0) * 100).toFixed(0)}%
                        </span>
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
