"use client";
import React, { useState, Suspense } from "react";
import { 
  Users, 
  Calendar, 
  Search as SearchIcon, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Trophy, 
  Database, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Info,
  Clock,
  ArrowRightCircle,
  TrendingUp,
  History,
  ShieldCheck,
  Zap
} from "lucide-react";
import axios from "axios";
import styles from "./community-rewards.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CommunityRewardsReport() {
  const [filters, setFilters] = useState({
    identifier: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const toggleRow = (key) => setExpandedLevels((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toNum = (v) => {
    if (v == null) return 0;
    if (typeof v === "object" && v.$numberDecimal != null) return parseFloat(v.$numberDecimal) || 0;
    return Number(v) || 0;
  };

  const normalizeResponse = (data, identifier) => {
    if (data?.depositor && Array.isArray(data?.snapshots)) return { kind: "trail", headerUser: data.depositor, ...data };
    if (data?.uhid && Array.isArray(data?.ActiveDirects)) return { kind: "single", headerUser: { username: data.sponsorUsername ?? null, uhid: data.uhid }, ...data };
    if (data?.user && data?.volumes && data?.conditions) return { kind: "booster", headerUser: data.user, ...data };
    return { kind: "unknown", headerUser: { username: null, uhid: data?.uhid ?? identifier ?? null }, ...data };
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError("Please enter user identifier to begin audit.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = { uhid: filters.identifier, date: filters.date };
      const { data } = await axios.get(`${API_URL}/api/bonus/community/cascade/snapshot`, { 
        params, 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSummary(normalizeResponse(data, filters.identifier));
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || "Audit sync failed.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const headerUser = summary?.headerUser || summary?.user || {};

  return (
    <div className={styles.container}>
      <header className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>Community Rewards <span>Cascade Report</span></h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <Zap size={14} color="#ffd700" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Audit Cycle Ready</span>
          </div>
        </div>
      </header>

      <div className={styles.searchForm}>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label><Calendar size={12} className="inline mr-2" /> Audit Date</label>
            <input type="date" name="date" value={filters.date} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label><Users size={12} className="inline mr-2" /> Identity Tracer</label>
            <input
              type="text"
              placeholder="Username or UHID..."
              name="identifier"
              value={filters.identifier}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className={styles.searchBtn}>
            {loading ? 'Initializing Audit...' : <><SearchIcon size={16} className="inline mr-2" /> Execute Trace</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
          <XCircle size={18} /> {error}
        </div>
      )}

      {summary && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Target Identity</th>
                <th style={{ textAlign: 'right' }}>Self Balance</th>
                <th style={{ textAlign: 'right' }}>Team Aggregate</th>
                <th style={{ textAlign: 'right' }}>Cascade Credited</th>
                <th style={{ textAlign: 'right' }}>Active Network</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td>
                  <div className="flex flex-col">
                    <span style={{ color: '#ffd700', fontWeight: 900 }}>{headerUser.username || "SEGMENT_NULL"}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>{headerUser.uhid || "AUDIT_TRACER"}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 900 }}>{headerUser.selfLp ? `${headerUser.selfLp} USDT` : "—"}</td>
                <td style={{ textAlign: 'right' }}>
                   <div className="flex flex-col items-end">
                    <span style={{ fontWeight: 800, color: '#00ff88' }}>{headerUser.teamLp5Sum || "0.00"} USDT</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>Top-5 Cohort</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 900, fontSize: '16px' }}>{toNum(summary?.depositor?.totalCascadeAmount).toFixed(2)}</span>
                       <Eye className={styles.viewIcon} size={14} onClick={() => setShowHistoryModal(true)} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>Total Rewards</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                       <span style={{ fontWeight: 900 }}>{headerUser?.activeDirectsCount ?? summary?.depositor?.activeDirectsCount ?? "0"}</span>
                       <TrendingUp className={styles.viewIcon} size={14} onClick={() => setShowSnapshotsModal(true)} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>Direct Units</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshots Modal */}
      {showSnapshotsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Level <span>Cascade Snapshots</span></h3>
              <button onClick={() => setShowSnapshotsModal(false)} className={styles.closeBtn}><X /></button>
            </header>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
               <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                 <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Depositor</span>
                 <div className="font-black text-gold-400">{summary.depositor.username}</div>
               </div>
               <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                 <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Self LP</span>
                 <div className="font-black text-gold-400">{summary.depositor.selfLp ?? "0"}</div>
               </div>
               <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                 <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Team LP 5Sum</span>
                 <div className="font-black text-green-400">{summary.depositor.teamLp5Sum ?? "0"}</div>
               </div>
               <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                 <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Active Directs</span>
                 <div className="font-black text-blue-400">{summary.depositor.activeDirectsCount ?? "0"}</div>
               </div>
            </div>

            <div className={styles.modalBody}>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Depth</th>
                    <th>Identity Tracer</th>
                    <th style={{ textAlign: 'right' }}>Self Balance</th>
                    <th style={{ textAlign: 'right' }}>Team Sum</th>
                    <th style={{ textAlign: 'right' }}>L5 Benchmark</th>
                    <th style={{ textAlign: 'center' }}>Network Hub</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.snapshots || []).map((s, idx) => {
                    const rowKey = s.uhid || `L${s.levelUnlocked}-${idx}`;
                    const isOpen = !!expandedLevels[rowKey];
                    return (
                      <React.Fragment key={idx}>
                        <tr className={styles.expandedRow}>
                          <td style={{ color: '#ffd700', fontWeight: 900 }}>L{s.levelUnlocked}</td>
                          <td><span style={{ fontSize: '11px', color: '#888' }}>{s.uhid}</span></td>
                          <td style={{ textAlign: 'right' }}>{toNum(s.selfLp).toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{toNum(s.teamLp).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', color: '#00ff88' }}>{toNum(s.teamLp5Sum).toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="flex items-center justify-center gap-2" cursor="pointer" onClick={() => toggleRow(rowKey)}>
                              <span className={styles.badge}>{s.ActiveDirects?.length || 0} Units</span>
                              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan="6" style={{ padding: '0 0 10px 0' }}>
                               <div className="mx-12 my-2 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                  <table className="w-full text-xs">
                                     <thead className="text-gold-500 opacity-60">
                                        <tr className="border-b border-white/5 text-left">
                                           <th className="pb-2">Direct Hub Identity</th>
                                           <th className="pb-2 text-center">Depth</th>
                                           <th className="pb-2 text-right">Self Balance</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {s.ActiveDirects.map((d, i) => (
                                           <tr key={i} className="border-b border-white/5 last:border-0">
                                              <td className="py-2"><span className="font-bold">{d.username}</span> <span className="opacity-50">({d.uhid})</span></td>
                                              <td className="py-2 text-center">L{d.level}</td>
                                              <td className="py-2 text-right text-green-400/80 font-mono">{toNum(d.selfLp).toFixed(2)} USDT</td>
                                           </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reward <span>Audit History</span></h3>
              <button onClick={() => setShowHistoryModal(false)} className={styles.closeBtn}><X /></button>
            </header>
            <div className={styles.modalBody}>
               <table className={styles.subTable}>
                  <thead>
                     <tr>
                        <th>Temporal Trace</th>
                        <th>Origin Target</th>
                        <th style={{ textAlign: 'right' }}>Yield Source</th>
                        <th style={{ textAlign: 'right' }}>Yield Target</th>
                        <th style={{ textAlign: 'center' }}>Depth</th>
                        <th style={{ textAlign: 'right' }}>Rate Vector</th>
                     </tr>
                  </thead>
                  <tbody>
                     {summary?.depositor?.cascadeRewards.map((r, i) => (
                        <tr key={i}>
                           <td>
                              <div className="flex flex-col">
                                 <span style={{ fontSize: '11px', color: '#fff' }}>{new Date(r.ts).toLocaleDateString()}</span>
                                 <span style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(r.ts).toLocaleTimeString()}</span>
                              </div>
                           </td>
                           <td><span className="font-bold">{r.targetUhid}</span></td>
                           <td style={{ textAlign: 'right' }}>{toNum(r.triggeringAmount).toFixed(2)}</td>
                           <td style={{ textAlign: 'right', color: '#ffd700', fontWeight: 900 }}>{toNum(r.amount).toFixed(4)}</td>
                           <td style={{ textAlign: 'center' }}><span className={styles.badge}>L{r.depth}</span></td>
                           <td style={{ textAlign: 'right', color: '#00ff88', fontWeight: 800 }}>{(toNum(r.rate) * 100).toFixed(0)}%</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityRewardsReportPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Establishing Cascade Connection...</div>}>
       <CommunityRewardsReport />
    </Suspense>
  );
}
