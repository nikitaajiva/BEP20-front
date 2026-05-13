"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useRef } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, Search, RefreshCw, ChevronLeft, ChevronRight, 
  ArrowLeft, BarChart3, Zap, Network, Calendar, 
  Layers, Activity, History, X, Globe, Phone, Award, TrendingUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./team-referrals.module.css";
import XRankBadge from "@/components/XRankBadge";

const ITEMS_PER_PAGE = 10;

const generatePagination = (currentPage, totalPages) => {
  if (totalPages <= 7) return [...Array(totalPages).keys()].map((i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
  if (currentPage > totalPages - 4) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const formatLpAmount = (amount) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0) + " USDT";

export default function TeamReferralsPage() {
  const { user, loading: authLoading, API_URL } = useAuth();
  const getTodayUTC = () => new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(getTodayUTC());
  const [dateTo, setDateTo] = useState(getTodayUTC());
  const [ledgerSearch, setLedgerSearch] = useState("");
  const initialFetchComplete = useRef(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const [displayedReferrals, setDisplayedReferrals] = useState([]);
  const [sumselflp, setSumselflp] = useState(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [referralsError, setReferralsError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [levelInput, setLevelInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ledgerTotals, setLedgerTotals] = useState({ deposited: 0, withdrawal: 0 });
  const [isLoadingTotals, setIsLoadingTotals] = useState(false);

  const fetchReferrals = useCallback(async (targetUhid, targetUsername, level) => {
    if (!API_URL || !targetUhid || !user?.uhid) return;
    setIsLoadingReferrals(true);
    setReferralsError(null);
    setCurrentPage(1);
    let url = level && level > 0
      ? `${API_URL}/hierarchy/users/${targetUhid}/descendants/level/${level}?viewerUhid=${user.uhid}`
      : `${API_URL}/hierarchy/users/${targetUhid}/descendants?viewerUhid=${user.uhid}`;
    if (searchInput?.trim()) url += `&search=${encodeURIComponent(searchInput.trim())}`;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch referrals");
      const referralsData = level && level > 0 ? data.descendants_at_level : data.descendants;
      setDisplayedReferrals(referralsData || []);
      setSumselflp(data.levelSelfLpSum);
      setViewedUser({ uhid: targetUhid, username: targetUsername });
    } catch (err) {
      setReferralsError(err.message);
      setDisplayedReferrals([]);
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [API_URL, user, searchInput]);

  const fetchLedgerTotals = async (from = dateFrom, to = dateTo, searchValue = ledgerSearch) => {
    try {
      setIsLoadingTotals(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      let url = `${API_URL}/ledger/team-daily-totals?from=${from}&to=${to}`;
      if (searchValue?.trim()) url += `&search=${encodeURIComponent(searchValue.trim())}`;
      const res = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const json = await res.json();
      if (json.success) setLedgerTotals({ deposited: json.totals.deposited || 0, withdrawal: json.totals.withdrawal || 0 });
    } catch (e) { console.error("Failed to fetch totals", e); }
    finally { setIsLoadingTotals(false); }
  };

  useEffect(() => {
    if (authLoading || initialFetchComplete.current) return;
    if (user?.uhid) {
      initialFetchComplete.current = true;
      fetchReferrals(user.uhid, user.username, 0);
      setSelectedLevel(0);
    }
  }, [authLoading, user, fetchReferrals]);

  useEffect(() => {
    if (!dateFrom || !dateTo || dateFrom > dateTo) return;
    fetchLedgerTotals(dateFrom, dateTo, ledgerSearch);
  }, [dateFrom, dateTo, ledgerSearch]);

  const handleViewUserReferrals = (uhid, username) => {
    if (viewedUser) setViewHistory((prev) => [...prev, viewedUser]);
    setSelectedLevel(0); setLevelInput("");
    fetchReferrals(uhid, username, 0);
  };

  const handleGoBack = () => {
    if (viewHistory.length > 0) {
      const prev = viewHistory[viewHistory.length - 1];
      setViewHistory((h) => h.slice(0, -1));
      setSelectedLevel(0); setLevelInput("");
      fetchReferrals(prev.uhid, prev.username, 0);
    }
  };

  const applyLevelFilter = () => {
    const levelNum = parseInt(levelInput, 10);
    if (!isNaN(levelNum) && levelNum >= 0) {
      setSelectedLevel(levelNum);
      const uid = viewedUser?.uhid || user?.uhid;
      const uname = viewedUser?.username || user?.username;
      if (uid && uname) fetchReferrals(uid, uname, levelNum);
    } else if (levelInput === "" && viewedUser?.uhid) {
      setSelectedLevel(0);
      fetchReferrals(viewedUser.uhid, viewedUser.username, 0);
    }
  };

  const handleRefresh = () => {
    const uid = viewedUser?.uhid || user?.uhid;
    const uname = viewedUser?.username || user?.username;
    if (uid && uname) fetchReferrals(uid, uname, selectedLevel);
  };

  const selfLp = displayedReferrals.reduce((s, r) => s + (parseFloat(r.selfLp) || 0), 0).toFixed(4);
  const Community_USDT_Balance = displayedReferrals.reduce((s, r) => s + (parseFloat(r.teamLp) || 0), 0).toFixed(4);
  const Community_USDT_Balancetotal = (parseFloat(selfLp) + parseFloat(Community_USDT_Balance)).toFixed(4);
  const totalPages = Math.ceil(displayedReferrals.length / ITEMS_PER_PAGE);
  const paginatedReferrals = displayedReferrals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginationItems = totalPages > 1 ? generatePagination(currentPage, totalPages) : [];

  if (authLoading) return <div className={styles.loading}><RefreshCw size={32} className={styles.spinIcon} /><span>Syncing Ecosystem...</span></div>;
  if (!user) return <div className={styles.loading}>Session expired. Please log in.</div>;

  return (
    <AuthGuard>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          
          {/* ── BENTO DASHBOARD LAYOUT ── */}
          <div className={styles.bentoGrid}>
            
            {/* Box 1: Hero & Primary Stats (Large) */}
            <div className={`${styles.bentoBox} ${styles.bentoHero}`}>
              <Image src="/IMG/community-hero.png" alt="Stallions" fill className={styles.heroImage} priority />
              <div className={styles.heroOverlay}>
                <div className={styles.heroHeader}>
                  <div className={styles.liveBadge}><span className={styles.pulseDot} /> CONNECTED</div>
                  <h1 className={styles.heroTitle}>Ecosystem <span>Intelligence</span></h1>
                  <p className={styles.heroSubtitle}>Monitoring real-time node liquidity and network growth</p>
                </div>
                <div className={styles.heroStats}>
                  <div className={styles.heroStatItem}>
                    <div className={styles.heroStatLabel}>NETWORK LIQUIDITY</div>
                    <div className={styles.heroStatValue}>{Community_USDT_Balancetotal} <small>USDT</small></div>
                  </div>
                  <div className={styles.heroStatDivider} />
                  <div className={styles.heroStatItem}>
                    <div className={styles.heroStatLabel}>TOTAL NODES</div>
                    <div className={styles.heroStatValue}>{user.communitySize ?? 0} <small>NODES</small></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Rank & Status (Small) */}
            <div className={`${styles.bentoBox} ${styles.bentoSmall}`}>
               <div className={styles.boxHeader}>
                  <Award size={18} className={styles.boxIcon} />
                  <span>Platform Standing</span>
               </div>
               <div className={styles.rankCenter}>
                  <div className={styles.rankBadgeContainer}>
                    <XRankBadge rank={user.xRank} />
                  </div>
                  <p className={styles.rankText}>Current Tier Protocol</p>
                  <div className={styles.connectionsRow}>
                    <div className={styles.connItem}>
                      <Network size={14} />
                      <span>{user.directDownlines ?? 0} Directs</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Box 3: Level Navigator (Interactive) */}
            <div className={`${styles.bentoBox} ${styles.bentoMedium}`}>
               <div className={styles.boxHeader}>
                  <Layers size={18} className={styles.boxIcon} />
                  <span>Level Navigator</span>
               </div>
               <div className={styles.navigatorContent}>
                  <select
                    className={styles.premiumSelect}
                    value={selectedLevel}
                    onChange={(e) => {
                      const level = parseInt(e.target.value);
                      setSelectedLevel(level);
                      setLevelInput(level.toString());
                      const uid = viewedUser?.uhid || user?.uhid;
                      const uname = viewedUser?.username || user?.username;
                      if (uid && uname) fetchReferrals(uid, uname, level);
                    }}
                  >
                    <option value="">Select Protocol Level</option>
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((lvl) => (
                      <option key={lvl} value={lvl}>Access Level {lvl}</option>
                    ))}
                  </select>
                  <div className={styles.navStats}>
                    <div className={styles.navStatRow}>
                      <span>Liquidity Depth</span>
                      <span className={styles.navStatVal}>{selectedLevel ? sumselflp : selfLp} USDT</span>
                    </div>
                    <div className={styles.navStatRow}>
                      <span>Network Reach</span>
                      <span className={styles.navStatVal}>{Community_USDT_Balance} USDT</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Box 4: Settlement Logs (Long search area) */}
            <div className={`${styles.bentoBox} ${styles.bentoWide}`}>
               <div className={styles.boxHeader}>
                  <Calendar size={18} className={styles.boxIcon} />
                  <span>Historical Settlement Scan</span>
                  <div className={styles.headerRight}>
                    <History size={14} /> 
                    <span>Live Syncing</span>
                  </div>
               </div>
               <div className={styles.logScannerBody}>
                  <div className={styles.scanGrid}>
                    <div className={styles.scanInputGroup}>
                      <span className={styles.scanLabel}>START BLOCK</span>
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={styles.scanInput} />
                    </div>
                    <div className={styles.scanInputGroup}>
                      <span className={styles.scanLabel}>END BLOCK</span>
                      <input type="date" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} className={styles.scanInput} />
                    </div>
                    <div className={styles.scanInputGroup}>
                      <span className={styles.scanLabel}>NODE FINDER</span>
                      <div className={styles.scannerWrapper}>
                        <Search size={14} className={styles.scannerIcon} />
                        <input type="text" value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)} placeholder="Username / UHID / Email..." className={styles.scannerInput} />
                      </div>
                    </div>
                    <button className={styles.scanButton} onClick={() => fetchLedgerTotals()} disabled={isLoadingTotals}>
                      {isLoadingTotals ? "SYNCING..." : "SCAN NETWORK"}
                    </button>
                  </div>
                  <div className={styles.resResults}>
                    <div className={styles.resItem}>
                      <div className={styles.resLabel}>NET DEPOSITS</div>
                      <div className={styles.resValueGreen}>+{ledgerTotals.deposited.toFixed(2)} USDT</div>
                    </div>
                    <div className={styles.resDivider} />
                    <div className={styles.resItem}>
                      <div className={styles.resLabel}>NET WITHDRAWALS</div>
                      <div className={styles.resValueRed}>-{ledgerTotals.withdrawal.toFixed(2)} USDT</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Box 5: Node Directory (The Full Table Area) */}
            <div className={`${styles.bentoBox} ${styles.bentoTableBox}`}>
              <div className={styles.boxHeader}>
                <div className={styles.headerLeft}>
                  <Users size={18} className={styles.boxIcon} />
                  <span>Node Directory</span>
                </div>
                <div className={styles.headerActions}>
                  <div className={styles.tableSearch}>
                    <Search size={14} className={styles.tableSearchIcon} />
                    <input 
                      type="text" 
                      value={searchInput} 
                      onChange={(e) => setSearchInput(e.target.value)} 
                      onKeyDown={(e) => e.key === "Enter" && applyLevelFilter()}
                      placeholder="Find node..." 
                    />
                  </div>
                  <button onClick={handleRefresh} className={styles.refreshBtn} disabled={isLoadingReferrals}>
                    <RefreshCw size={16} className={isLoadingReferrals ? styles.spinning : ""} />
                  </button>
                </div>
              </div>

              {/* Path / Breadcrumbs */}
              {(viewHistory.length > 0 || viewedUser) && (
                <div className={styles.nodePath}>
                  <Globe size={12} />
                  <span className={styles.pathRoot} onClick={() => { setViewHistory([]); fetchReferrals(user.uhid, user.username, 0); }}>ROOT</span>
                  {viewHistory.map((u, i) => (
                    <React.Fragment key={i}>
                      <ChevronRight size={12} className={styles.pathSep} />
                      <span className={styles.pathItem} onClick={() => { setViewHistory(h => h.slice(0, i)); fetchReferrals(u.uhid, u.username, 0); }}>{u.username}</span>
                    </React.Fragment>
                  ))}
                  {viewedUser && viewedUser.uhid !== user.uhid && (
                    <><ChevronRight size={12} className={styles.pathSep} /><span className={styles.pathActive}>{viewedUser.username}</span></>
                  )}
                  {viewHistory.length > 0 && (
                    <button onClick={handleGoBack} className={styles.backBtn}><ArrowLeft size={14} /> Back</button>
                  )}
                </div>
              )}

              <div className={styles.tableContainer}>
                {isLoadingReferrals ? (
                  <div className={styles.tableLoading}>
                    <RefreshCw size={40} className={styles.spinning} />
                    <p>Decrypting Network Data...</p>
                  </div>
                ) : referralsError ? (
                  <div className={styles.tableError}>{referralsError}</div>
                ) : (
                  <table className={styles.premiumTable}>
                    <thead>
                      <tr>
                        <th>NODE</th>
                        <th>SPONSOR</th>
                        <th>NETWORK</th>
                        <th>RANK</th>
                        <th>LOCATION</th>
                        <th className={styles.txtRight}>LIQUIDITY</th>
                        <th className={styles.txtRight}>TOTAL POOL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReferrals.length > 0 ? paginatedReferrals.map((ref, idx) => (
                        <tr key={ref._id || ref.uhid}>
                          <td>
                            <div className={styles.nodeIdentity} onClick={() => handleViewUserReferrals(ref.uhid, ref.username)}>
                              <span className={styles.nodeUser}>{ref.username}</span>
                              <span className={styles.nodeID}>#{ref.uhid}</span>
                            </div>
                          </td>
                          <td><span className={styles.sponsorTag}>{ref.sponsorUsername ?? "GENESIS"}</span></td>
                          <td><div className={styles.sizeTag}>{ref.teamSize ?? 0} Nodes</div></td>
                          <td><XRankBadge rank={ref.xRank} /></td>
                          <td>
                            <div className={styles.locInfo}>
                              <span className={styles.locName}>{typeof ref.country === "object" ? ref.country?.name ?? "Global" : ref.country ?? "Global"}</span>
                              <span className={styles.locContact}>{ref.whatsappContact ?? "Encrypted"}</span>
                            </div>
                          </td>
                          <td className={styles.txtRight}>
                            <div className={styles.liqVal}>{formatLpAmount(ref.selfLp)}</div>
                            <div className={styles.capBar}>
                              <div className={styles.capInfo}>
                                <span>CAP</span>
                                <span className={styles.capNum}>{ref.boost?.$numberDecimal ? parseFloat(ref.boost.$numberDecimal).toLocaleString() : "0"}</span>
                              </div>
                            </div>
                          </td>
                          <td className={styles.txtRight}><div className={styles.poolVal}>{formatLpAmount(ref.teamLp)}</div></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className={styles.emptyRow}>No nodes found at this security clearance level.</td></tr>
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
                      p === "..." ? <span key={i} className={styles.dotDot}>...</span> :
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
