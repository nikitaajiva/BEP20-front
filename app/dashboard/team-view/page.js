"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import safeStorage from "@/utils/safeStorage";
import { useAuth } from "@/context/AuthContext";

/* ─── Avatar palette ────────────────────────────────────────────────────── */
const PALETTE = [
  { bg: "rgba(255,102,0,0.15)", text: "#ff6600" },
  { bg: "rgba(255,69,0,0.15)", text: "#ff4500" },
  { bg: "rgba(255,215,0,0.15)", text: "#FFD700" },
  { bg: "rgba(255,140,0,0.15)", text: "#ff8c00" },
  { bg: "rgba(255,94,77,0.15)", text: "#FF5E4D" },
];
const getAvatar = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];

/* ─── Stat chip ─────────────────────────────────────────────────────────── */
function Chip({ label, value, color = "#ff6600" }) {
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
  
  const levelColor = level === 1 ? "#ff6600" : level === 2 ? "#ff8c00" : "#FFD700";

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
          <Chip label="Team" value={node.communitySize ?? 0} color="#b3baff" />
          <Chip label="Directs" value={node.directDownlines ?? 0} color="rgb(127,255,76)" />
          <Chip label="Stakes" value={activeStakes} color="#FFD700" />
          <Chip label="NFTs" value={nftCount} color="rgb(127,255,76)" />
        </div>
      </div>

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
        { label: "L1 Members", value: summary.l1?.count ?? 0, color: "#ff6600", icon: "👥" },
        { label: "L2 Members", value: summary.l2?.count ?? 0, color: "#ff8c00", icon: "🌐" },
        { label: "L1 TSC", value: `${(summary.l1?.tokenEarnings ?? 0).toFixed(4)}`, color: "#ff6600", icon: "💎" },
        { label: "L2 TSC", value: `${(summary.l2?.tokenEarnings ?? 0).toFixed(4)}`, color: "#ff8c00", icon: "💎" },
        { label: "Total TSC", value: `${(summary.totalTokenEarnings ?? 0).toFixed(4)}`, color: "#FFD700", icon: "🏆" },
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

export default function TeamViewPage() {
  const router = useRouter();
  const { API_URL } = useAuth();
  const [tree, setTree] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    const token = safeStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/referral-rewards/my-tree`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load team tree.");
      setTree(json.tree || []);
      setSummaryData(json.summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      color: "#fff",
      padding: "clamp(12px, 4vw, 40px)",
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
      <div style={{ width: "100%" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "clamp(20px, 5vw, 32px)",
          paddingBottom: "clamp(16px, 3vw, 24px)",
          borderBottom: "1px solid rgba(255,102,0,0.2)",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 3vw, 16px)", minWidth: 0 }}>
            <div style={{
              width: "clamp(40px, 10vw, 56px)", height: "clamp(40px, 10vw, 56px)", borderRadius: 16,
              background: "linear-gradient(135deg, rgba(255,102,0,0.25), rgba(255,69,0,0.2))",
              border: "1px solid rgba(255,102,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(20px, 5vw, 28px)",
              flexShrink: 0,
            }}>
              🔥
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "#fff" }}>My Referral Tree</h1>
              <p style={{ margin: 0, marginTop: 4, fontSize: "clamp(12px, 3vw, 14px)", color: "rgba(255,255,255,0.4)" }}>Your L1 + L2 network details</p>
            </div>
          </div>
          <button onClick={() => router.back()} style={{
            background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.3)",
            color: "#ff6600", padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)", borderRadius: 10,
            cursor: "pointer", fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 700,
            transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
          }} onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,102,0,0.25)";
            e.currentTarget.style.borderColor = "rgba(255,102,0,0.5)";
          }} onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,102,0,0.12)";
            e.currentTarget.style.borderColor = "rgba(255,102,0,0.3)";
          }}>
            ← Back
          </button>
        </div>

        {/* Summary */}
        <SummaryBanner summary={summaryData} />

        {/* Controls */}
        <div className="controls-group">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by username or UHID…"
            className="search-input"
            style={{
              padding: "clamp(8px, 2vw, 10px) clamp(10px, 2vw, 14px)",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, color: "#fff", fontSize: "clamp(11px, 2vw, 13px)", outline: "none",
            }}
          />
          <button onClick={expandAll} className="control-btn" style={ctrlBtn("#ff6600")}>Expand All</button>
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
          <div style={{ textAlign: "center", padding: 60, color: "#FFD700", fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        ) : displayTree.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>
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
  );
}
