"use client";

import React, { useState, useEffect, useCallback } from "react";
import safeStorage from "@/utils/safeStorage";

/* ─── Avatar palette ────────────────────────────────────────────────────── */
const PALETTE = [
  { bg: "rgba(129,140,248,0.15)", text: "#818cf8" },
  { bg: "rgba(52,211,153,0.15)", text: "#34d399" },
  { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  { bg: "rgba(244,63,94,0.15)", text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)", text: "#06b6d4" },
];
const getAvatar = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];

/* ─── Stat chip ─────────────────────────────────────────────────────────── */
function Chip({ label, value, color = "#818cf8" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "6px 12px",
      background: `${color}11`,
      border: `1px solid ${color}33`,
      borderRadius: 8,
      minWidth: 72,
    }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 900, color }}>{value}</span>
    </div>
  );
}

/* ─── Tree Node ─────────────────────────────────────────────────────────── */
function TreeNode({ node, level, expanded, onToggle }) {
  const username = node.username || "Unknown";
  const initials = username.slice(0, 2).toUpperCase();
  const ac = getAvatar(username);
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = expanded[node._id?.toString()];
  
  // Level color logic: L1 (Indigo), L2 (Emerald), L3+ (Rose/Red)
  const levelColor = level === 1 ? "#818cf8" : level === 2 ? "#34d399" : "#f43f5e";

  const activeStakes = (node.stakingPlans || []).filter(s => s.status === "active").length
    || (node.stakingPlan?.amount > 0 ? 1 : 0);
  const nftCount = (node.nftPackages || []).length;

  return (
    <div style={{ marginBottom: 8 }}>
      <div className="node-row" style={{
        border: `1px solid ${levelColor}22`,
        borderLeft: `3px solid ${levelColor}`,
      }}>
        <div className="node-info-group">
          {hasChildren ? (
            <button
              onClick={() => onToggle(node._id?.toString())}
              className="node-toggle-btn"
              style={{
                background: isOpen ? `${levelColor}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${levelColor}44`,
                color: levelColor,
              }}
            >
              {isOpen ? "−" : "+"}
            </button>
          ) : (
            <div className="node-toggle-spacer" />
          )}

          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: ac.bg, color: ac.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900,
            border: `2px solid ${ac.text}44`,
          }}>
            {initials}
          </div>

          <div style={{ minWidth: 120, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{username}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
              {node.uhid || "—"}
            </div>
          </div>

          <div style={{
            padding: "3px 10px", borderRadius: 20,
            background: `${levelColor}22`, border: `1px solid ${levelColor}44`,
            color: levelColor, fontSize: 10, fontWeight: 900, letterSpacing: 1,
            flexShrink: 0,
          }}>
            L{level}
          </div>
        </div>

        <div className="node-stats-group">
          <Chip label="Team" value={node.communitySize ?? 0} color="#818cf8" />
          <Chip label="Directs" value={node.directDownlines ?? 0} color="#06b6d4" />
          <Chip label="Stakes" value={activeStakes} color="#fbbf24" />
          <Chip label="NFTs" value={nftCount} color="#34d399" />
        </div>
      </div>

      {/* Children */}
      {isOpen && hasChildren && (
        <div className="node-children">
          {node.children.map(child => (
            <TreeNode
              key={child._id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Summary Banner ────────────────────────────────────────────────────── */
function SummaryBanner({ summary }) {
  if (!summary) return null;
  return (
    <div className="summary-grid">
      {[
        { label: "L1 Members", value: summary.l1?.count ?? 0, color: "#818cf8", icon: "👥" },
        { label: "L2 Members", value: summary.l2?.count ?? 0, color: "#34d399", icon: "🌐" },
        { label: "L1 TSC", value: `${(summary.l1?.tokenEarnings ?? 0).toFixed(4)}`, color: "#818cf8", icon: "💎" },
        { label: "L2 TSC", value: `${(summary.l2?.tokenEarnings ?? 0).toFixed(4)}`, color: "#34d399", icon: "💎" },
        { label: "Total TSC", value: `${(summary.totalTokenEarnings ?? 0).toFixed(4)}`, color: "#fbbf24", icon: "🏆" },
      ].map((item, idx) => (
        <div key={item.label} className={`summary-card ${idx === 4 ? "summary-card-total" : ""}`} style={{
          border: `1px solid ${item.color}33`,
        }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: item.color, marginTop: 2 }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ReferralTreeModal({ isOpen, onClose, API_URL, summaryData }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    const token = safeStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/referral-rewards/my-tree`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load team tree.");
      setTree(json.tree || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isOpen, API_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!isOpen) return null;

  const toggleNode = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () => {
    const allIds = {};
    const collect = (nodes) => nodes.forEach(n => {
      allIds[n._id?.toString()] = true;
      if (n.children) collect(n.children);
    });
    collect(tree);
    setExpanded(allIds);
  };

  const collapseAll = () => setExpanded({});

  const filterTree = (nodes, q) => {
    if (!q) return nodes;
    return nodes.reduce((acc, node) => {
      const nameMatch = (node.username || "").toLowerCase().includes(q.toLowerCase());
      const uhidMatch = (node.uhid || "").toLowerCase().includes(q.toLowerCase());
      const filteredChildren = filterTree(node.children || [], q);
      if (nameMatch || uhidMatch || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const displayTree = filterTree(tree, search);

  return (
    <div className="modal-container" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "20px"
    }}>
      <style>{`
        /* --- General layout responsive improvements --- */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .summary-card {
          background: rgba(255,255,255,0.02);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }
        
        .controls-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          align-items: center;
        }
        .search-input {
          flex: 1;
          min-width: 260px;
        }
        .control-btn {
          text-align: center;
        }

        /* --- Tree Node Row Styles --- */
        .node-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 14px;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .node-info-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .node-stats-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .node-toggle-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }
        .node-toggle-spacer {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .node-children {
          margin-left: 40px;
          margin-top: 6px;
        }

        /* --- Shimmer Animation --- */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* --- Media Queries --- */
        @media (max-width: 1024px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .modal-container {
            padding: 0px !important;
          }
          .modal-content {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0px !important;
            border: none !important;
          }
          .modal-header {
            padding: 16px 20px !important;
          }
          .modal-body {
            padding: 16px 20px !important;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .summary-card-total {
            grid-column: span 2;
          }
          
          .controls-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .search-input {
            grid-column: span 2;
            width: 100%;
            min-width: 100%;
          }
          .control-btn {
            width: 100% !important;
          }

          .node-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 12px;
          }
          .node-info-group {
            width: 100%;
          }
          .node-stats-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            width: 100%;
            gap: 8px;
          }
          .node-toggle-btn {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            font-size: 12px;
          }
          .node-toggle-spacer {
            width: 24px;
            height: 24px;
          }
          .node-children {
            margin-left: 16px;
          }
        }
      `}</style>
      <div className="modal-content" style={{
        background: "#0a0a0a",
        width: "100%", maxWidth: 900,
        height: "90vh", maxHeight: 850,
        borderRadius: 24,
        border: "1px solid rgba(129,140,248,0.2)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div className="modal-header" style={{
          padding: "24px 30px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(255,255,255,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(129,140,248,0.25), rgba(139,92,246,0.2))",
              border: "1px solid rgba(129,140,248,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              🌐
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff" }}>My Referral Tree</h2>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Your L1 + L2 network</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.5)",
            fontSize: 28, cursor: "pointer", transition: "color 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
            ×
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
          <SummaryBanner summary={summaryData} />

          {/* Controls */}
          <div className="controls-group">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by username or UHID…"
              className="search-input"
              style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#fff", fontSize: 13, outline: "none",
              }}
            />
            <button onClick={expandAll} className="control-btn" style={ctrlBtn("#818cf8")}>Expand All</button>
            <button onClick={collapseAll} className="control-btn" style={ctrlBtn("rgba(255,255,255,0.3)")}>Collapse All</button>
          </div>

          {/* Tree View */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: 72, borderRadius: 14,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%)",
                  animation: "shimmer 1.5s infinite",
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: 40, color: "#f43f5e", fontWeight: 700 }}>⚠️ {error}</div>
          ) : displayTree.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>
                {search ? "No matches found" : "Your network is empty"}
              </div>
            </div>
          ) : (
            <div>
              {displayTree.map(node => (
                <TreeNode key={node._id} node={node} level={1} expanded={expanded} onToggle={toggleNode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ctrlBtn = (color) => ({
  padding: "9px 16px",
  background: `${color}11`,
  border: `1px solid ${color}44`,
  borderRadius: 10,
  color,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
});
