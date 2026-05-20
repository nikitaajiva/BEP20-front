"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Gift, RefreshCw, Search, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Clock, Play, Save, Package,
  List, DollarSign, Settings
} from "lucide-react";
import styles from "./horse-nft.module.css";
import {
  adminGetHorseNftPackages, adminUpdateHorseNftPackage,
  adminGetHorseNftPurchases, adminGetHorseNftPayouts,
  adminRunHorseNftPayout
} from "@/services/horseNftApi";

const TIER_COLORS = {
  starter: styles.tierBronze, bronze: styles.tierBronze,
  growth:  styles.tierSilver, silver: styles.tierSilver,
  premium: styles.tierGold,   gold:   styles.tierGold,
};
const PALETTE = [
  { bg: "rgba(255,215,0,0.15)",   text: "#ffd700" },
  { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  { bg: "rgba(244,63,94,0.15)",  text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)",  text: "#06b6d4" },
];
const avatar = (n = "") => PALETTE[n.charCodeAt(0) % PALETTE.length];

function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "active" || s === "completed" || s === "paid")
    return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={10}/>{status}</span>;
  if (s === "failed" || s === "expired")
    return <span className={`${styles.badge} ${styles.badgeFailed}`}><AlertCircle size={10}/>{status}</span>;
  if (s === "pending" || s === "pending_payment")
    return <span className={`${styles.badge} ${styles.badgePending}`}><Clock size={10}/>{status}</span>;
  return <span className={`${styles.badge} ${styles.badgeNeutral}`}>{status}</span>;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ── PACKAGES TAB ─────────────────────────────────────────────── */
function PackagesTab() {
  const [pkgs, setPkgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [edits, setEdits] = useState({});
  const [msg, setMsg] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await adminGetHorseNftPackages();
      const list = d.data || [];
      setPkgs(list);
      const init = {};
      list.forEach(p => { init[p.tierCode] = { ...p }; });
      setEdits(init);
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    finally { setLoading(false); }
  }

  function change(tierCode, field, val) {
    setEdits(prev => ({ ...prev, [tierCode]: { ...prev[tierCode], [field]: val } }));
  }

  async function save(tierCode) {
    setSaving(tierCode);
    setMsg(null);
    try {
      const { priceUSDT, annualRoiPercent, bonusTokens, dividendFrequency, isActive } = edits[tierCode];
      await adminUpdateHorseNftPackage(tierCode, { priceUSDT: Number(priceUSDT), annualRoiPercent: Number(annualRoiPercent), bonusTokens: Number(bonusTokens), dividendFrequency, isActive });
      setMsg({ type: "ok", text: `${tierCode} updated successfully.` });
      load();
    } catch (e) { setMsg({ type: "err", text: e.message }); }
    finally { setSaving(null); }
  }

  if (loading) return <Loader/>;

  return (
    <div>
      {msg && <div className={msg.type === "ok" ? styles.infoBanner : styles.errorBanner} style={{marginBottom:16}}>{msg.text}</div>}
      <div className={styles.cardGrid}>
        {pkgs.map(p => {
          const e = edits[p.tierCode] || p;
          return (
            <div key={p.tierCode} className={styles.pkgCard}>
              <div className={styles.pkgHeader}>
                <span className={`${styles.badge} ${TIER_COLORS[p.tierCode] || styles.tierGold}`} style={{fontSize:13}}>{p.displayName || p.tierCode}</span>
                <span className={e.isActive ? styles.badgeActive : styles.badgeInactive} style={{padding:"5px 11px",borderRadius:10,fontSize:10,fontWeight:800,letterSpacing:1}}>
                  {e.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className={styles.pkgFieldGrid}>
                <div className={styles.pkgField}>
                  <label>Price (USDT)</label>
                  <input className={styles.pkgInput} type="number" value={e.priceUSDT ?? ""} onChange={ev => change(p.tierCode, "priceUSDT", ev.target.value)}/>
                </div>
                <div className={styles.pkgField}>
                  <label>Annual ROI %</label>
                  <input className={styles.pkgInput} type="number" value={e.annualRoiPercent ?? ""} onChange={ev => change(p.tierCode, "annualRoiPercent", ev.target.value)}/>
                </div>
                <div className={styles.pkgField}>
                  <label>Bonus Tokens</label>
                  <input className={styles.pkgInput} type="number" value={e.bonusTokens ?? ""} onChange={ev => change(p.tierCode, "bonusTokens", ev.target.value)}/>
                </div>
                <div className={styles.pkgField}>
                  <label>Dividend Freq</label>
                  <select className={styles.pkgSelect} value={e.dividendFrequency || "monthly"} onChange={ev => change(p.tierCode, "dividendFrequency", ev.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div className={styles.pkgField}>
                  <label>Status</label>
                  <select className={styles.pkgSelect} value={e.isActive ? "true" : "false"} onChange={ev => change(p.tierCode, "isActive", ev.target.value === "true")}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>
                Benefits: {(p.benefits || []).join(", ") || "—"}
              </div>
              <div className={styles.pkgActions}>
                <button className={styles.btnPrimary} onClick={() => save(p.tierCode)} disabled={saving === p.tierCode}>
                  {saving === p.tierCode ? <RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> : <Save size={13}/>}
                  {saving === p.tierCode ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── PURCHASES TAB ──────────────────────────────────────────────── */
function PurchasesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage:1, totalPages:1 });
  const [filters, setFilters] = useState({ status:"", tierCode:"" });

  const load = useCallback(async (page=1) => {
    setLoading(true); setError(null);
    try {
      const d = await adminGetHorseNftPurchases({ page, limit:12, ...filters });
      setItems(d.data || []);
      setPagination(d.pagination || { currentPage:page, totalPages:1 });
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <form className={styles.filterForm} onSubmit={e => { e.preventDefault(); load(1); }}>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label>Status</label>
            <select className={styles.selectField} value={filters.status} onChange={e => setFilters(p=>({...p,status:e.target.value}))}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Tier</label>
            <select className={styles.selectField} value={filters.tierCode} onChange={e => setFilters(p=>({...p,tierCode:e.target.value}))}>
              <option value="">All Tiers</option>
              <option value="starter">Starter (Bronze)</option>
              <option value="growth">Growth (Silver)</option>
              <option value="premium">Premium (Gold)</option>
            </select>
          </div>
          <button type="submit" className={styles.searchBtn} disabled={loading}>
            {loading ? <RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> : <><Search size={14}/> Filter</>}
          </button>
        </div>
      </form>

      {error && <div className={styles.errorBanner}><AlertCircle size={15}/>{error}</div>}

      <div className={styles.cardGrid}>
        {loading && items.length === 0 ? <Loader/> : items.length > 0 ? items.map(item => {
          const username = item.userId?.username || "UNKNOWN";
          const ac = avatar(username);
          return (
            <div key={item._id} className={styles.nftCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardUser}>
                  <div className={styles.cardAvatar} style={{background:ac.bg,color:ac.text}}>{username.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div className={styles.cardName}>{username}</div>
                    <div className={styles.cardUhid}>UHID: {item.userId?.uhid || "—"}</div>
                  </div>
                </div>
                <div className={styles.cardTime}>
                  <div className={styles.cardDateStr}>{fmtDate(item.purchasedAt || item.createdAt)}</div>
                </div>
              </div>
              <div className={styles.divider}/>
              <div className={styles.tierRow}>
                <span className={`${styles.tierBadge} ${TIER_COLORS[item.tierCode] || styles.tierGold}`}>{item.tierCode || "—"}</span>
                <StatusBadge status={item.status}/>
              </div>
              <div className={styles.amountRow}>
                <div className={styles.amountBlock}>
                  <div className={styles.amountLabel}>Amount Paid</div>
                  <div className={styles.amountValue}>{parseFloat(item.priceUSDT || item.totalPaidUSDT || 0).toFixed(2)}<span>USDT</span></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Payouts</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#10b981"}}>{item.totalPayoutCount || 0}</div>
                </div>
              </div>
              <div className={styles.detailsBlock}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Annual ROI</span>
                  <span className={styles.detailValue}>{item.annualRoiPercent ?? "—"}%</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Next Payout</span>
                  <span className={styles.detailValue}>{fmtDate(item.nextPayoutAt)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Freq</span>
                  <span className={styles.detailValue}>{item.dividendFrequency || "—"}</span>
                </div>
              </div>
            </div>
          );
        }) : <div className={styles.emptyState}><Package size={40} opacity={0.15}/><div className={styles.emptyText}>No purchases found</div></div>}
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageInfo}>Page <span>{pagination.currentPage}</span> of <span>{pagination.totalPages||1}</span></div>
        <div style={{display:"flex",gap:10}}>
          <button className={styles.pageBtn} disabled={pagination.currentPage<=1||loading} onClick={()=>load(pagination.currentPage-1)}><ChevronLeft size={14}/>Prev</button>
          <button className={styles.pageBtn} disabled={pagination.currentPage>=pagination.totalPages||loading} onClick={()=>load(pagination.currentPage+1)}>Next<ChevronRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}

/* ── PAYOUTS TAB ─────────────────────────────────────────────────── */
function PayoutsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runMsg, setRunMsg] = useState(null);
  const [running, setRunning] = useState(false);
  const [pagination, setPagination] = useState({ currentPage:1, totalPages:1 });
  const [filters, setFilters] = useState({ status:"", tierCode:"" });

  const load = useCallback(async (page=1) => {
    setLoading(true); setError(null);
    try {
      const d = await adminGetHorseNftPayouts({ page, limit:12, ...filters });
      setItems(d.data || []);
      setPagination(d.pagination || { currentPage:page, totalPages:1 });
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  async function runPayout(dryRun) {
    setRunning(true); setRunMsg(null);
    try {
      const d = await adminRunHorseNftPayout({ dryRun });
      setRunMsg({ type:"ok", text: `${dryRun?"Dry run":"Payout"} complete — processed: ${d.data?.processed ?? 0}, skipped: ${d.data?.skipped ?? 0}` });
      if (!dryRun) load(1);
    } catch(e) { setRunMsg({ type:"err", text: e.message }); }
    finally { setRunning(false); }
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Run payout panel */}
      <div style={{background:"rgba(10,10,10,0.6)",border:"1px solid rgba(255,215,0,0.08)",borderRadius:20,padding:"20px 24px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,color:"#fff",fontSize:14,marginBottom:4}}>Run Horse NFT Payout</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Process dividends for all active Horse NFT holders</div>
        </div>
        <button className={styles.btnSecondary} onClick={()=>runPayout(true)} disabled={running}>
          {running ? <RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> : <Play size={13}/>} Dry Run
        </button>
        <button className={styles.btnPrimary} onClick={()=>runPayout(false)} disabled={running}>
          {running ? <RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> : <DollarSign size={13}/>} Run Payout
        </button>
      </div>

      {runMsg && <div className={runMsg.type==="ok"?styles.infoBanner:styles.errorBanner}>{runMsg.text}</div>}

      <form className={styles.filterForm} onSubmit={e=>{e.preventDefault();load(1);}}>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label>Status</label>
            <select className={styles.selectField} value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Tier</label>
            <select className={styles.selectField} value={filters.tierCode} onChange={e=>setFilters(p=>({...p,tierCode:e.target.value}))}>
              <option value="">All Tiers</option>
              <option value="starter">Starter (Bronze)</option>
              <option value="growth">Growth (Silver)</option>
              <option value="premium">Premium (Gold)</option>
            </select>
          </div>
          <button type="submit" className={styles.searchBtn} disabled={loading}>
            {loading ? <RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> : <><Search size={14}/> Filter</>}
          </button>
        </div>
      </form>

      {error && <div className={styles.errorBanner}><AlertCircle size={15}/>{error}</div>}

      <div className={styles.cardGrid}>
        {loading && items.length===0 ? <Loader/> : items.length>0 ? items.map(item => {
          const username = item.userId?.username || "UNKNOWN";
          const ac = avatar(username);
          return (
            <div key={item._id} className={styles.nftCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardUser}>
                  <div className={styles.cardAvatar} style={{background:ac.bg,color:ac.text}}>{username.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div className={styles.cardName}>{username}</div>
                    <div className={styles.cardUhid}>UHID: {item.userId?.uhid||"—"}</div>
                  </div>
                </div>
                <div className={styles.cardTime}>
                  <div className={styles.cardDateStr}>{fmtDate(item.paidAt||item.createdAt)}</div>
                </div>
              </div>
              <div className={styles.divider}/>
              <div className={styles.tierRow}>
                <span className={`${styles.tierBadge} ${TIER_COLORS[item.tierCode]||styles.tierGold}`}>{item.tierCode||"—"}</span>
                <StatusBadge status={item.status}/>
              </div>
              <div className={styles.amountRow}>
                <div className={styles.amountBlock}>
                  <div className={styles.amountLabel}>Payout Amount</div>
                  <div className={styles.amountValue}>{parseFloat(item.payoutAmount||0).toFixed(4)}<span>USDT</span></div>
                </div>
              </div>
              <div className={styles.detailsBlock}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Period</span>
                  <span className={styles.detailValue}>{item.periodLabel||"—"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Credited To</span>
                  <span className={styles.detailValue}>{item.creditedWallet||"USDT Wallet"}</span>
                </div>
              </div>
            </div>
          );
        }) : <div className={styles.emptyState}><DollarSign size={40} opacity={0.15}/><div className={styles.emptyText}>No payouts found</div></div>}
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageInfo}>Page <span>{pagination.currentPage}</span> of <span>{pagination.totalPages||1}</span></div>
        <div style={{display:"flex",gap:10}}>
          <button className={styles.pageBtn} disabled={pagination.currentPage<=1||loading} onClick={()=>load(pagination.currentPage-1)}><ChevronLeft size={14}/>Prev</button>
          <button className={styles.pageBtn} disabled={pagination.currentPage>=pagination.totalPages||loading} onClick={()=>load(pagination.currentPage+1)}>Next<ChevronRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",gap:12,gridColumn:"1/-1"}}>
      <div style={{width:32,height:32,border:"3px solid rgba(255,215,0,0.15)",borderTop:"3px solid #ffd700",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",fontWeight:800,letterSpacing:2}}>LOADING...</div>
    </div>
  );
}

const TABS = [
  { id:"packages",  label:"Packages",  icon: Settings  },
  { id:"purchases", label:"Purchases", icon: List       },
  { id:"payouts",   label:"Payouts",   icon: DollarSign },
];

function HorseNftAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("packages");

  useEffect(() => {
    if (!authLoading && (!user || !["admin","superadmin"].includes(user.userType))) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) return <Loader/>;

  return (
    <div className={styles.container}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><span className={styles.eyebrowDot}/> Admin Panel</div>
          <h1 className={styles.title}>Horse NFT <span>Management</span></h1>
        </div>
      </header>

      <div className={styles.tabContainer}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`${styles.tab} ${activeTab===t.id ? styles.tabActive : ""}`} onClick={()=>setActiveTab(t.id)}>
              <Icon size={12}/> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "packages"  && <PackagesTab/>}
      {activeTab === "purchases" && <PurchasesTab/>}
      {activeTab === "payouts"   && <PayoutsTab/>}
    </div>
  );
}

export default function HorseNftAdminPage() {
  return (
    <Suspense fallback={
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",color:"rgba(255,215,0,0.4)",fontWeight:800,letterSpacing:2,fontSize:12}}>
        LOADING HORSE NFT PANEL...
      </div>
    }>
      <HorseNftAdmin/>
    </Suspense>
  );
}
