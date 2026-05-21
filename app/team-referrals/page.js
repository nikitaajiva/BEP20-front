"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useRef } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { Users, Search, RefreshCw, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import styles from "./team-referrals.module.css";

const ITEMS_PER_PAGE = 10;

const generatePagination = (currentPage, totalPages) => {
  if (totalPages <= 7) return [...Array(totalPages).keys()].map((i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
  if (currentPage > totalPages - 4) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

/* ─── Tree Avatar Palette ─── */
const TREE_PALETTE = [
  { bg: "rgba(129,140,248,0.15)", text: "#818cf8" },
  { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  { bg: "rgba(244,63,94,0.15)",   text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)",   text: "#06b6d4" },
];
const getAvatar = (name = "") => TREE_PALETTE[name.charCodeAt(0) % TREE_PALETTE.length];

/* ─── Stat Chip ─── */
function Chip({ label, value, color = "#818cf8" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 12px", background:`${color}11`, border:`1px solid ${color}33`, borderRadius:8, minWidth:72 }}>
      <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:900, color }}>{value}</span>
    </div>
  );
}

/* ─── Tree Node Row ─── */
function TreeNode({ node, level, expanded, onToggle }) {
  const username = node.username || "Unknown";
  const initials = username.slice(0, 2).toUpperCase();
  const ac = getAvatar(username);
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = expanded[node._id?.toString()];
  const levelColor = level === 1 ? "#818cf8" : level === 2 ? "#34d399" : "#f43f5e";
  const activeStakes = (node.stakingPlans || []).filter(s => s.status === "active").length || (node.stakingPlan?.amount > 0 ? 1 : 0);
  const nftCount = (node.nftPackages || []).length;
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"14px 16px", background:"rgba(255,255,255,0.02)", borderRadius:14, border:`1px solid ${levelColor}22`, borderLeft:`3px solid ${levelColor}`, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
          {hasChildren ? (
            <button onClick={() => onToggle(node._id?.toString())} style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${levelColor}44`, background:isOpen?`${levelColor}22`:"rgba(255,255,255,0.04)", color:levelColor, fontSize:14, fontWeight:900, cursor:"pointer" }}>
              {isOpen ? "−" : "+"}
            </button>
          ) : <div style={{ width:28, height:28, flexShrink:0 }} />}
          <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, background:ac.bg, color:ac.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, border:`2px solid ${ac.text}44` }}>{initials}</div>
          <div style={{ minWidth:120, flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{username}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>{node.uhid || "—"}</div>
          </div>
          <div style={{ padding:"3px 10px", borderRadius:20, background:`${levelColor}22`, border:`1px solid ${levelColor}44`, color:levelColor, fontSize:10, fontWeight:900, letterSpacing:1, flexShrink:0 }}>L{level}</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Chip label="Team"    value={node.communitySize ?? 0}   color="#818cf8" />
          <Chip label="Directs" value={node.directDownlines ?? 0} color="#06b6d4" />
          <Chip label="Stakes"  value={activeStakes}              color="#fbbf24" />
          <Chip label="NFTs"    value={nftCount}                  color="#34d399" />
        </div>
      </div>
      {isOpen && hasChildren && (
        <div style={{ marginLeft:40, marginTop:6 }}>
          {node.children.map(child => <TreeNode key={child._id} node={child} level={level + 1} expanded={expanded} onToggle={onToggle} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Summary Banner ─── */
function SummaryBanner({ summary }) {
  if (!summary) return null;
  const items = [
    { label:"L1 Members",  value: summary.l1?.count ?? 0,                           color:"#818cf8", icon:"👥" },
    { label:"L2 Members",  value: summary.l2?.count ?? 0,                           color:"#34d399", icon:"🌐" },
    { label:"L1 TSC",      value:(summary.l1?.tokenEarnings ?? 0).toFixed(4),        color:"#818cf8", icon:"💎" },
    { label:"L2 TSC",      value:(summary.l2?.tokenEarnings ?? 0).toFixed(4),        color:"#34d399", icon:"💎" },
    { label:"Total TSC",   value:(summary.totalTokenEarnings ?? 0).toFixed(4),       color:"#fbbf24", icon:"🏆" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24, flexWrap:"wrap" }}>
      {items.map(item => (
        <div key={item.label} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${item.color}33`, borderRadius:14, padding:"14px 16px", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:18, marginBottom:4 }}>{item.icon}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>{item.label}</div>
          <div style={{ fontSize:16, fontWeight:900, color:item.color, marginTop:2 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Flatten tree into a flat list for Node Directory ─── */
function flattenTree(nodes, level = 1, result = []) {
  for (const node of nodes) {
    result.push({ ...node, _level: level });
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, level + 1, result);
    }
  }
  return result;
}

/* ─── Top Performers Card ─── */
const MEDALS = [
  { rank: 1, icon: "🥇", label: "Gold",   gradient: "linear-gradient(135deg,#ffd700 0%,#ff9500 100%)", glow: "rgba(255,215,0,0.25)",  border: "rgba(255,215,0,0.5)"  },
  { rank: 2, icon: "🥈", label: "Silver", gradient: "linear-gradient(135deg,#c0c0c0 0%,#8a8a8a 100%)", glow: "rgba(192,192,192,0.2)", border: "rgba(192,192,192,0.4)" },
  { rank: 3, icon: "🥉", label: "Bronze", gradient: "linear-gradient(135deg,#cd7f32 0%,#8b4513 100%)", glow: "rgba(205,127,50,0.2)",  border: "rgba(205,127,50,0.4)"  },
];

function TopPerformers({ nodes, loading }) {
  if (loading) {
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[1,2,3].map(i => <div key={i} style={{ height:180, borderRadius:20, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", animation:"shimmer 1.5s infinite" }} />)}
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return <div style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.3)", fontWeight:700 }}>No network data yet.</div>;
  }

  // Score formula: reflects how much "profit potential" a node contributes
  const scored = nodes.map(n => {
    const stakes = (n.stakingPlans || []).filter(s => s.status === "active").length || (n.stakingPlan?.amount > 0 ? 1 : 0);
    const nfts   = (n.nftPackages || []).length;
    const score  = (n.communitySize  || 0) * 10
                 + (n.directDownlines || 0) * 5
                 + stakes * 3
                 + nfts   * 2;
    return { ...n, _score: score, _stakes: stakes, _nfts: nfts };
  }).sort((a, b) => b._score - a._score).slice(0, 3);

  // Combined network score of top 3
  const combinedScore = scored.reduce((s, n) => s + n._score, 0);

  return (
    <div>
      {/* Combined score banner */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, padding:"12px 20px", background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>👑</span>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Top 3 Combined Network Score</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#ffd700" }}>{combinedScore.toLocaleString()}</div>
          </div>
        </div>
        {scored[0] && (
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>👑 #1 Profit Generator</div>
            <div style={{ fontSize:14, fontWeight:900, color:"#ffd700" }}>{scored[0].username}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>#{scored[0].uhid}</div>
          </div>
        )}
      </div>

      {/* Top 3 cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {scored.map((node, idx) => {
          const medal = MEDALS[idx];
          const ac    = TREE_PALETTE[node.username?.charCodeAt(0) % TREE_PALETTE.length] || TREE_PALETTE[0];
          return (
            <div key={node._id} style={{ position:"relative", background:`linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%)`, border:`1px solid ${medal.border}`, borderRadius:20, padding:"20px 18px", boxShadow:`0 8px 32px ${medal.glow}`, overflow:"hidden", transition:"transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {/* Glow orb */}
              <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:medal.glow, filter:"blur(20px)", pointerEvents:"none" }} />

              {/* Rank badge */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontSize:28 }}>{medal.icon}</div>
                <div style={{ padding:"4px 10px", borderRadius:20, background:medal.gradient, fontSize:10, fontWeight:900, color:"#000", letterSpacing:0.5 }}>RANK #{medal.rank}</div>
              </div>

              {/* Avatar + name */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:46, height:46, borderRadius:"50%", background:ac.bg, color:ac.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, border:`2px solid ${ac.text}66`, flexShrink:0 }}>
                  {(node.username || "?").slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:900, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{node.username}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>#{node.uhid}</div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  { label:"Network",  value: node.communitySize  || 0, color:"#818cf8" },
                  { label:"Directs",  value: node.directDownlines || 0, color:"#06b6d4" },
                  { label:"Stakes",   value: node._stakes,             color:"#fbbf24" },
                  { label:"NFTs",     value: node._nfts,               color:"#34d399" },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"8px 10px", border:`1px solid ${stat.color}22` }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>{stat.label}</div>
                    <div style={{ fontSize:16, fontWeight:900, color:stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Score bar */}
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Network Score</span>
                <span style={{ fontSize:16, fontWeight:900, background:medal.gradient, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{node._score.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
        {/* Fill empty slots if <3 nodes */}
        {scored.length < 3 && Array.from({ length: 3 - scored.length }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background:"rgba(255,255,255,0.01)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:20, padding:"20px 18px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:180 }}>
            <span style={{ color:"rgba(255,255,255,0.1)", fontSize:32 }}>—</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ PAGE ═══ */
export default function TeamReferralsPage() {
  const { user, loading: authLoading, API_URL } = useAuth();

  /* ── State ── */
  const [treeData,    setTreeData]    = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [expanded,    setExpanded]    = useState({});
  const [treeSearch,  setTreeSearch]  = useState("");
  const [nodeSearch,  setNodeSearch]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState(0); // 0 = all, 1 = L1, 2 = L2
  const fetchedRef = useRef(false);

  /* ── Fetch: 2 APIs in parallel ── */
  const fetchData = useCallback(async () => {
    if (!API_URL) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [treeRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/referral-rewards/my-tree`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/referral-rewards/summary`,  { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const treeJson = await treeRes.json();
      const sumJson  = await sumRes.json();
      if (treeRes.ok && treeJson.success) setTreeData(treeJson.tree || []);
      else setError(treeJson.message || "Failed to load tree.");
      if (sumRes.ok  && sumJson.success)  setSummary(sumJson.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (authLoading || fetchedRef.current) return;
    if (user) { fetchedRef.current = true; fetchData(); }
  }, [authLoading, user, fetchData]);

  /* ── Tree helpers ── */
  const toggleNode = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const expandAll  = () => {
    const ids = {};
    const collect = (nodes) => nodes.forEach(n => { ids[n._id?.toString()] = true; if (n.children) collect(n.children); });
    collect(treeData);
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded({});

  const filterTree = (nodes, q) => {
    if (!q) return nodes;
    return nodes.reduce((acc, node) => {
      const match = (node.username || "").toLowerCase().includes(q.toLowerCase()) ||
                    (node.uhid     || "").toLowerCase().includes(q.toLowerCase());
      const filteredChildren = filterTree(node.children || [], q);
      if (match || filteredChildren.length > 0) acc.push({ ...node, children: filteredChildren });
      return acc;
    }, []);
  };
  const displayTree = filterTree(treeData, treeSearch);

  /* ── Node Directory: flatten tree, filter, paginate ── */
  const allNodes = flattenTree(treeData);
  const filteredNodes = allNodes.filter(n => {
    const matchSearch = !nodeSearch ||
      (n.username || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
      (n.uhid     || "").toLowerCase().includes(nodeSearch.toLowerCase());
    const matchLevel = levelFilter === 0 || n._level === levelFilter;
    return matchSearch && matchLevel;
  });
  const totalPages       = Math.ceil(filteredNodes.length / ITEMS_PER_PAGE);
  const paginatedNodes   = filteredNodes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginationItems  = totalPages > 1 ? generatePagination(currentPage, totalPages) : [];

  // Top performers computed from ALL flattened nodes (no extra API)
  const topPerformerNodes = allNodes;

  if (authLoading) return <div className={styles.loading}><RefreshCw size={32} className={styles.spinning} /><span>Loading...</span></div>;
  if (!user)       return <div className={styles.loading}>Session expired. Please log in.</div>;

  return (
    <AuthGuard>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.bentoGrid}>

            {/* ══ TOP PERFORMERS ══ */}
            <div className={`${styles.bentoBox} ${styles.bentoTableBox}`}>
              <div className={styles.boxHeader} style={{ marginBottom:20 }}>
                <div className={styles.headerLeft}>
                  <span style={{ fontSize:22 }}>🏆</span>
                  <div>
                    <span style={{ fontSize:15, fontWeight:900, color:"#fff", display:"block" }}>Top Performers</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Highest-impact nodes in your network</span>
                  </div>
                </div>
              </div>
              <TopPerformers nodes={topPerformerNodes} loading={loading} />
              <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
            </div>

            {/* ══ MY REFERRAL TREE ══ */}
            <div className={`${styles.bentoBox} ${styles.bentoTableBox}`}>
              <div className={styles.boxHeader}>
                <div className={styles.headerLeft}>
                  <span style={{ fontSize:22 }}>🌐</span>
                  <div>
                    <span style={{ fontSize:15, fontWeight:900, color:"#fff", display:"block" }}>My Referral Tree</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Your L1 + L2 network</span>
                  </div>
                </div>
                <button onClick={fetchData} style={{ width:38, height:38, borderRadius:12, background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.3)", color:"#818cf8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <RefreshCw size={15} className={loading ? styles.spinning : ""} />
                </button>
              </div>

              <SummaryBanner summary={summary} />

              {/* Search + Expand/Collapse */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
                <div style={{ position:"relative", flex:1, minWidth:260, display:"flex", alignItems:"center" }}>
                  <Search size={14} style={{ position:"absolute", left:12, color:"rgba(255,255,255,0.3)" }} />
                  <input
                    value={treeSearch}
                    onChange={e => setTreeSearch(e.target.value)}
                    placeholder="Search by username or UHID..."
                    style={{ width:"100%", padding:"10px 14px 10px 36px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:13, outline:"none" }}
                  />
                </div>
                <button onClick={expandAll}  style={{ padding:"9px 16px", background:"rgba(129,140,248,0.11)", border:"1px solid rgba(129,140,248,0.44)", borderRadius:10, color:"#818cf8", fontSize:12, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>Expand All</button>
                <button onClick={collapseAll} style={{ padding:"9px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, color:"rgba(255,255,255,0.5)", fontSize:12, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>Collapse All</button>
              </div>

              {/* Tree */}
              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:72, borderRadius:14, background:"linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%)", animation:"shimmer 1.5s infinite" }} />)}
                </div>
              ) : error ? (
                <div style={{ textAlign:"center", padding:40, color:"#f43f5e", fontWeight:700 }}>⚠️ {error}</div>
              ) : displayTree.length === 0 ? (
                <div style={{ textAlign:"center", padding:60 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🌱</div>
                  <div style={{ fontSize:18, fontWeight:900, color:"rgba(255,255,255,0.4)" }}>{treeSearch ? "No matches found" : "Your network is empty"}</div>
                </div>
              ) : (
                <div>
                  {displayTree.map(node => <TreeNode key={node._id} node={node} level={1} expanded={expanded} onToggle={toggleNode} />)}
                </div>
              )}
              <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
            </div>

            {/* ══ NODE DIRECTORY (powered by my-tree data) ══ */}
            <div className={`${styles.bentoBox} ${styles.bentoTableBox}`}>
              <div className={styles.boxHeader}>
                <div className={styles.headerLeft}>
                  <Users size={18} className={styles.boxIcon} />
                  <span>Node Directory</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginLeft:8 }}>({filteredNodes.length} nodes)</span>
                </div>
                <div className={styles.headerActions}>
                  {/* Level filter pills */}
                  <div style={{ display:"flex", gap:6 }}>
                    {[0,1,2].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => { setLevelFilter(lvl); setCurrentPage(1); }}
                        style={{ padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:800, cursor:"pointer", border:"1px solid", transition:"all 0.2s",
                          background: levelFilter === lvl ? (lvl === 0 ? "#818cf8" : lvl === 1 ? "#818cf8" : "#34d399") : "transparent",
                          color:      levelFilter === lvl ? "#fff" : (lvl === 1 ? "#818cf8" : lvl === 2 ? "#34d399" : "rgba(255,255,255,0.4)"),
                          borderColor: lvl === 0 ? "rgba(129,140,248,0.4)" : lvl === 1 ? "rgba(129,140,248,0.4)" : "rgba(52,211,153,0.4)",
                        }}
                      >
                        {lvl === 0 ? "All" : `L${lvl}`}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tableSearch}>
                    <Search size={14} className={styles.tableSearchIcon} />
                    <input
                      type="text"
                      value={nodeSearch}
                      onChange={e => { setNodeSearch(e.target.value); setCurrentPage(1); }}
                      placeholder="Find node..."
                    />
                  </div>
                  <button onClick={fetchData} className={styles.refreshBtn} disabled={loading}>
                    <RefreshCw size={16} className={loading ? styles.spinning : ""} />
                  </button>
                </div>
              </div>

              <div className={styles.tableContainer}>
                {loading ? (
                  <div className={styles.tableLoading}>
                    <RefreshCw size={40} className={styles.spinning} />
                    <p>Loading network data...</p>
                  </div>
                ) : error ? (
                  <div className={styles.tableError}>{error}</div>
                ) : (
                  <table className={styles.premiumTable}>
                    <thead>
                      <tr>
                        <th>NODE</th>
                        <th>LEVEL</th>
                        <th>TEAM SIZE</th>
                        <th>DIRECTS</th>
                        <th>STAKES</th>
                        <th>NFTs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedNodes.length > 0 ? paginatedNodes.map(node => {
                        const username = node.username || "Unknown";
                        const ac = getAvatar(username);
                        const lColor = node._level === 1 ? "#818cf8" : node._level === 2 ? "#34d399" : "#f43f5e";
                        const stakes = (node.stakingPlans || []).filter(s => s.status === "active").length || (node.stakingPlan?.amount > 0 ? 1 : 0);
                        const nfts   = (node.nftPackages || []).length;
                        return (
                          <tr key={node._id || node.uhid}>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:34, height:34, borderRadius:"50%", background:ac.bg, color:ac.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, flexShrink:0, border:`1.5px solid ${ac.text}44` }}>
                                  {username.slice(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <div className={styles.nodeUser}>{username}</div>
                                  <div className={styles.nodeID}>#{node.uhid}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ padding:"3px 10px", borderRadius:20, background:`${lColor}22`, border:`1px solid ${lColor}44`, color:lColor, fontSize:10, fontWeight:900 }}>L{node._level}</span>
                            </td>
                            <td><div className={styles.sizeTag}>{node.communitySize ?? 0} Nodes</div></td>
                            <td><span style={{ color:"#06b6d4", fontWeight:800 }}>{node.directDownlines ?? 0}</span></td>
                            <td><span style={{ color:"#fbbf24", fontWeight:800 }}>{stakes}</span></td>
                            <td><span style={{ color:"#34d399", fontWeight:800 }}>{nfts}</span></td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={6} className={styles.emptyRow}>No nodes found.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <div className={styles.bentoPagination}>
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
                  <div className={styles.pagesRow}>
                    {paginationItems.map((p, i) => (
                      p === "..." ? <span key={i} style={{ color:"rgba(255,255,255,0.3)" }}>...</span> :
                      <button key={i} onClick={() => setCurrentPage(p)} className={currentPage === p ? styles.pgActive : styles.pgBtn}>{p}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
