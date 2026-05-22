"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import safeStorage from "@/utils/safeStorage";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";

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
  console.log("TreeNode Rendering:", username, "node._id:", node._id, "isOpen:", isOpen, "expandedKeys:", Object.keys(expanded));
  
  // Level color logic: L1 (Indigo), L2 (Emerald), L3+ (Rose/Red)
  const levelColor = level === 1 ? "#818cf8" : level === 2 ? "#34d399" : "#f43f5e";

  const activeStakes = (node.stakingPlans || []).filter(s => s.status === "active").length
    || (node.stakingPlan?.amount > 0 ? 1 : 0);
  const totalStakedAmount = (node.stakingPlans || []).reduce((acc, s) => acc + (s.amount || 0), 0) || node.stakingPlan?.amount || 0;
  
  const nftCount = (node.nftPackages || []).length;
  const totalNftValue = (node.nftPackages || []).reduce((acc, p) => acc + (p.mintPrice || 0), 0);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${levelColor}22`,
        borderLeft: `3px solid ${levelColor}`,
        borderRadius: 14,
      }}>
        {/* Top Part: User Details & Chips */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            {/* Toggle */}
            {hasChildren ? (
              <button
                onClick={() => onToggle(node._id?.toString())}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: isOpen ? `${levelColor}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${levelColor}44`,
                  color: levelColor, cursor: "pointer",
                  fontSize: 14, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                }}
              >
                {isOpen ? "−" : "+"}
              </button>
            ) : (
              <div style={{ width: 28, height: 28, flexShrink: 0 }} />
            )}

            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: ac.bg, color: ac.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900,
              border: `2px solid ${ac.text}44`,
            }}>
              {initials}
            </div>

            {/* Identity */}
            <div style={{ minWidth: 120, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{username}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                {node.uhid || "—"}
              </div>
            </div>

            {/* Level badge */}
            <div style={{
              padding: "3px 10px", borderRadius: 20,
              background: `${levelColor}22`, border: `1px solid ${levelColor}44`,
              color: levelColor, fontSize: 10, fontWeight: 900, letterSpacing: 1,
              flexShrink: 0,
            }}>
              L{level}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip label="Team" value={node.communitySize ?? 0} color="#818cf8" />
            <Chip label="Directs" value={node.directDownlines ?? 0} color="#06b6d4" />
            <Chip label="Stakes" value={(node.teamStakes !== undefined && node.teamStakes > 0) ? `${node.teamStakes.toLocaleString()} TSC` : (totalStakedAmount > 0 ? `${totalStakedAmount.toLocaleString()} TSC` : activeStakes)} color="#fbbf24" />
            <Chip label="NFTs" value={(node.teamNfts !== undefined && node.teamNfts > 0) ? `$${node.teamNfts.toLocaleString()}` : (totalNftValue > 0 ? `$${totalNftValue.toLocaleString()}` : nftCount)} color="#34d399" />
            <Chip label="My Stake" value={"$" + (node.personalStaking || 0).toLocaleString() + " USDT"} color="#fbbf24" />
            <Chip label="My NFT" value={"$" + (node.personalHorseNft || 0).toLocaleString() + " USDT"} color="#34d399" />
            <Chip label="Parent Earned" value={"$" + (node.commissionToParent || 0).toFixed(4) + " USDT"} color="#06b6d4" />
            <Chip label="Today's Earned" value={"$" + (node.todaysEarnings?.usdt || 0).toFixed(4) + " USDT / " + (node.todaysEarnings?.tsc || 0).toFixed(4) + " TSC"} color="#a78bfa" />
          </div>
        </div>
      </div>

      {/* Children */}
      {isOpen && hasChildren && (
        <div style={{ marginLeft: 40, marginTop: 6 }}>
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
    <div style={{
      display: "flex", gap: 12, flexWrap: "wrap",
      marginBottom: 24,
    }}>
      {[
        { label: "L1 Members", value: summary.l1?.count ?? 0, color: "#818cf8", icon: "👥" },
        { label: "L2 Members", value: summary.l2?.count ?? 0, color: "#34d399", icon: "🌐" },
        { label: "L1 TSC", value: `${(summary.l1?.tokenEarnings ?? 0).toFixed(4)}`, color: "#818cf8", icon: "💎" },
        { label: "L2 TSC", value: `${(summary.l2?.tokenEarnings ?? 0).toFixed(4)}`, color: "#34d399", icon: "💎" },
        { label: "Total TSC", value: `${(summary.totalTokenEarnings ?? 0).toFixed(4)}`, color: "#fbbf24", icon: "🏆" },
        { label: "Self Stake", value: `${(summary.selfStaking ?? 0).toLocaleString()} TSC`, color: "#a78bfa", icon: "⚡" },
        { label: "Self NFT", value: `$${(summary.selfHorseNft ?? 0).toLocaleString()}`, color: "#38bdf8", icon: "🐴" },
        { label: "Team Stake", value: `${(summary.teamStaking ?? 0).toLocaleString()} TSC`, color: "#fbbf24", icon: "🛡️" },
        { label: "Team NFT", value: `$${(summary.teamHorseNft ?? 0).toLocaleString()}`, color: "#ec4899", icon: "👑" },
      ].map(item => (
        <div key={item.label} style={{
          flex: "1 1 180px",
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${item.color}33`,
          borderRadius: 14,
          padding: "14px 16px",
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

export default function ReferralTreePage() {
  const router = useRouter();
  const { user, API_URL, loading: authLoading } = useAuth();
  
  const [tree, setTree] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    const token = safeStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      // Fetch Tree
      const treeRes = await fetch(`${API_URL}/referral-rewards/my-tree`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const treeJson = await treeRes.json();
      if (!treeRes.ok || !treeJson.success) throw new Error(treeJson.message || "Failed to load team tree.");
      
      const enrichTree = (nodes) => {
        return nodes.map(node => {
          let teamStakes = 0;
          let teamNfts = 0;
          let enrichedChildren = [];

          if (node.children && node.children.length > 0) {
            enrichedChildren = enrichTree(node.children);
            enrichedChildren.forEach(child => {
              const childOwnStakes = (child.stakingPlans || []).reduce((acc, s) => acc + (s.amount || 0), 0) || child.stakingPlan?.amount || 0;
              const childOwnNfts = (child.nftPackages || []).reduce((acc, p) => acc + (p.mintPrice || 0), 0);

              teamStakes += childOwnStakes + (child.teamStakes || 0);
              teamNfts += childOwnNfts + (child.teamNfts || 0);
            });
          }

          return {
            ...node,
            children: enrichedChildren,
            teamStakes,
            teamNfts
          };
        });
      };

      setTree(enrichTree(treeJson.tree || []));

      // Fetch Summary Data
      const summaryRes = await fetch(`${API_URL}/referral-rewards/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryJson = await summaryRes.json();
      if (summaryRes.ok && summaryJson.success) {
        setSummaryData(summaryJson.data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "rgba(255,255,255,0.5)" }}>
        Loading user data...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "rgba(255,255,255,0.5)" }}>
        Please log in to view this page.
      </div>
    );
  }

  const toggleNode = (id) => {
    console.log("toggleNode called with ID:", id);
    setExpanded(prev => {
      const next = { ...prev, [id]: !prev[id] };
      console.log("New expanded state:", next);
      return next;
    });
  };

  const expandAll = () => {
    console.log("expandAll called");
    const allIds = {};
    const collect = (nodes) => nodes.forEach(n => {
      allIds[n._id?.toString()] = true;
      if (n.children) collect(n.children);
    });
    collect(tree);
    console.log("allIds collected for expandAll:", allIds);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    console.log("collapseAll called");
    setExpanded({});
  };

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
    <AuthGuard>
      <div style={{
        padding: "24px 30px",
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
      }}>
        {/* Header Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          paddingBottom: 20,
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
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Your downline network tree (L1 - L4+)</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            <i className="ri-arrow-left-line" style={{ fontSize: 16 }}></i>
            Back to Dashboard
          </button>
        </div>

        {/* Content Body */}
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SummaryBanner summary={summaryData} />

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by username or UHID…"
              style={{
                flex: 1, minWidth: 260, padding: "12px 16px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#818cf8"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button onClick={expandAll} style={ctrlBtn("#818cf8")}>Expand All</button>
            <button onClick={collapseAll} style={ctrlBtn("rgba(255,255,255,0.4)")}>Collapse All</button>
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
              <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: 40, color: "#f43f5e", fontWeight: 700 }}>⚠️ {error}</div>
          ) : displayTree.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: "rgba(255,255,255,0.01)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>
                {search ? "No matches found" : "Your network is empty"}
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: 20,
              padding: "24px 30px",
            }}>
              {displayTree.map(node => (
                <TreeNode key={node._id} node={node} level={1} expanded={expanded} onToggle={toggleNode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

const ctrlBtn = (color) => ({
  padding: "11px 20px",
  background: `${color}11`,
  border: `1px solid ${color}44`,
  borderRadius: 12,
  color,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s",
});
