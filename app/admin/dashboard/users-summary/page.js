"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import DetailModal from '@/components/DetailModal';
import {
  Users, Search as SearchIcon, Eye, ChevronLeft, ChevronRight,
  Calculator, Zap, Wallet, Activity, TrendingUp, History,
  Database, XCircle, Clock, LayoutGrid, ChevronDown, ChevronUp,
  ArrowDownRight, ArrowUpRight, RefreshCw, Shield,
} from 'lucide-react';
import CalculatorBar from '@/components/CalculatorBar';
import styles from './users-summary.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

/* ─── Avatar palette ─── */
const PALETTE = [
  { bg: 'rgba(255,215,0,0.12)',   text: '#ffd700'  },
  { bg: 'rgba(16,185,129,0.12)',  text: '#10b981'  },
  { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8'  },
  { bg: 'rgba(244,63,94,0.12)',   text: '#f43f5e'  },
  { bg: 'rgba(249,115,22,0.12)',  text: '#f97316'  },
  { bg: 'rgba(6,182,212,0.12)',   text: '#06b6d4'  },
];
const avatarClr = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length];

/* ─── Helpers ─── */
const toNum = (val) => {
  if (val && typeof val === 'object' && '$numberDecimal' in val) return parseFloat(val.$numberDecimal);
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(n) ? 0 : n;
};
const fmt = (val) => {
  const n = toNum(val);
  return isNaN(n) ? '0.000000' : n.toFixed(6);
};
const fmtShort = (val) => {
  const n = toNum(val);
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return n.toFixed(2);
};

/* ══════════════════════════════════════════
   METRIC PILL — individual data point
═══════════════════════════════════════════ */
function MetricPill({ label, value, theme, onCalc, onDetail, subLabel, clickable }) {
  return (
    <div
      className={`${styles.metricPill} ${styles[theme] || styles.themeGold}`}
      onClick={() => onCalc && onCalc(toNum(value))}
      title={clickable ? 'Click to add to calculator · Ctrl+Click to subtract' : ''}
    >
      <div className={styles.metricPillLabel}>{label}</div>
      <div className={styles.metricPillValue}>{fmt(value)}</div>
      {subLabel && <div className={styles.metricPillSub}>{subLabel}</div>}
      {onDetail && (
        <Eye
          size={12}
          className={styles.metricPillEye}
          onClick={(e) => { e.stopPropagation(); onDetail(); }}
          color="rgba(255,215,0,0.6)"
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   USER CARD — collapsible
═══════════════════════════════════════════ */
function UserSummaryCard({ row, addToCalc, openDetail }) {
  const [open, setOpen] = useState(false);
  const ac = avatarClr(row.username);
  const initials = (row.username || '?').slice(0, 2).toUpperCase();

  const lpVal    = toNum(row.lp);
  const xamanVal = toNum(row.xaman);
  const outflow  = toNum(row.claims) + toNum(row.redeems) + toNum(row.autoPositioning);

  return (
    <div className={styles.userCard}>
      {/* ── HEADER (always visible) ── */}
      <div className={styles.cardHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.userAvatar} style={{ background: ac.bg, color: ac.text }}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{row.username}</div>
            <div className={styles.userUhid}>UHID: {row.uhid || '—'}</div>
          </div>
        </div>

        <div className={styles.cardHeaderRight}>
          {/* Quick KPI pills */}
          <div className={styles.quickPills}>
            <div className={`${styles.qPill}`} style={{ color:'#10b981', borderColor:'rgba(16,185,129,0.25)', background:'rgba(16,185,129,0.08)' }}>
              <Zap size={9}/> LP: {fmtShort(row.lp)}
            </div>
            <div className={`${styles.qPill}`} style={{ color:'#818cf8', borderColor:'rgba(99,102,241,0.25)', background:'rgba(99,102,241,0.08)' }}>
              <Wallet size={9}/> Xaman: {fmtShort(row.xaman)}
            </div>
            <div className={`${styles.qPill}`} style={{ color:'#ffd700', borderColor:'rgba(255,215,0,0.25)', background:'rgba(255,215,0,0.08)' }}>
              <TrendingUp size={9}/> Rewards: {fmtShort(row.communityRewardsTotal)}
            </div>
            <div className={`${styles.qPill}`} style={{ color:'#f43f5e', borderColor:'rgba(244,63,94,0.25)', background:'rgba(244,63,94,0.08)' }}>
              <ArrowUpRight size={9}/> Out: {fmtShort(outflow)}
            </div>
          </div>

          <div className={`${styles.chevronBtn} ${open ? styles.chevronOpen : ''}`}>
            {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </div>
        </div>
      </div>

      {/* ── EXPANDED BODY ── */}
      {open && (
        <div className={styles.cardBody}>

          {/* SECTION 1: Wallet Balances */}
          <div className={styles.bodySection}>
            <div className={styles.bodySectionTitle}><Wallet size={10}/> Wallet Balances</div>
            <div className={styles.metricGrid}>
              <MetricPill label="Xaman Balance"   value={row.xaman}    theme="themeBlue"  onCalc={(v) => addToCalc(v)} clickable />
              <MetricPill label="LP Balance"       value={row.lp}       theme="themeGreen" onCalc={(v) => addToCalc(v)} subLabel={row.firstLpDeposit ? `First: ${new Date(row.firstLpDeposit).toLocaleDateString('en-GB')}` : null} clickable />
              <MetricPill label="Zero Risk"        value={row.zeroRisk} theme="themeCyan"  onCalc={(v) => addToCalc(v)} clickable />
              <MetricPill label="5X Limit Used"    value={row.fiveXLimitUsed} theme="themeOrange" onCalc={(v) => addToCalc(v)} clickable />
            </div>
          </div>

          {/* SECTION 2: On-Chain Activity */}
          <div className={styles.bodySection}>
            <div className={styles.bodySectionTitle}><Database size={10}/> On-Chain Activity</div>
            <div className={styles.metricGrid}>
              <MetricPill
                label="Xaman Deposits"     value={row.xamanDeposits}
                theme="themeGreen"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'xamanDeposits')}
                clickable
              />
              <MetricPill
                label="Chain Deposits"     value={row.chainDeposits}
                theme="themeGreen"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'chainDeposits')}
                clickable
              />
              <MetricPill
                label="Chain Withdrawals"  value={row.chainWithdrawals}
                theme="themeRed"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'chainWithdrawals')}
                clickable
              />
              <MetricPill
                label="Auto Positioning"   value={row.autoPositioning}
                theme="themeGold"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'autoPositioning')}
                clickable
              />
              <MetricPill
                label="Ecosystem Fees"     value={row.ecoFeesTotal}
                theme="themeOrange"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'ecosystemfees')}
                clickable
              />
            </div>
          </div>

          {/* SECTION 3: Rewards */}
          <div className={styles.bodySection}>
            <div className={styles.bodySectionTitle}><Activity size={10}/> Community Rewards</div>
            <div className={styles.metricGrid}>
              <MetricPill
                label="Community Credited"    value={row.communityRewardsCredited}
                theme="themePurple"
                subLabel={`Wallet: ${fmt(row.communityRewards)}`}
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'communityRewards')}
                clickable
              />
              <MetricPill
                label="Cascade Rewards"       value={row.cascadeRewards}
                theme="themeBlue"
                onCalc={(v) => addToCalc(v)}
                clickable
              />
              <MetricPill
                label="Booster Credited"      value={row.communityBoosterCredited}
                theme="themeGold"
                subLabel={`Bonus: ${fmt(row.communityBoosterBonus)}`}
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'boosterBonus')}
                clickable
              />
              <MetricPill
                label="X Bonus Credited"      value={row.xBonusCredited}
                subLabel={`Wallet: ${fmt(row.xBonus)}`}
                theme="themeOrange"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'xBonus')}
                clickable
              />
              <MetricPill
                label="Total Rewards"         value={row.communityRewardsTotal}
                theme="themeGreen"
                onCalc={(v) => addToCalc(v)}
                clickable
              />
            </div>
          </div>

          {/* SECTION 4: Outflows */}
          <div className={styles.bodySection}>
            <div className={styles.bodySectionTitle}><ArrowUpRight size={10}/> Claims & Outflows</div>
            <div className={styles.metricGrid}>
              <MetricPill
                label="Claims Audit"
                value={row.claims}
                theme="themeRed"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'claims')}
                clickable
              />
              <MetricPill
                label="Redeems Audit"
                value={row.redeems}
                theme="themeRed"
                onCalc={(v) => addToCalc(v)}
                onDetail={() => openDetail(row.userId, 'redeems')}
                clickable
              />
              <MetricPill
                label="Total Outflow"
                value={outflow}
                theme="themeRed"
                subLabel="Claims + Redeems + AutoPos"
                onDetail={() => openDetail(row.userId, 'withdrawals')}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const UsersSummaryTerminal = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(0);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters,      setFilters]      = useState({ username: '', uhid: '', USDTAddress: '' });
  const debouncedFilters = useDebounce(filters, 500);
  const [modals,    setModals]    = useState([]);
  const [calcValues,setCalcValues]= useState([]);

  const addToCalc     = (num, negative = false) => {
    if (typeof num !== 'number' || isNaN(num)) return;
    const val = negative ? -parseFloat(num.toFixed(6)) : parseFloat(num.toFixed(6));
    setCalcValues(prev => [...prev, val]);
  };
  const clearCalc     = () => setCalcValues([]);
  const removeCalcAt  = (i) => setCalcValues(prev => prev.filter((_,idx) => idx !== i));

  const openDetail = async (userId, kind) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Auth');
      const res  = await fetch(`${API_BASE_URL}/api/support/users-summary/detail?userId=${userId}&kind=${kind}&limit=200`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'fetch error');
      setModals(prev => [...prev, { id: `${userId}-${kind}-${Date.now()}`, kind, rows: json.data }]);
    } catch (e) { console.error('Detail fetch err', e); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      /* DUMMY DATA INJECTION - OVERRIDING API */
      setTimeout(() => {
        const mockData = Array.from({ length: 10 }).map((_, i) => ({
          _id: `summ_${i}`,
          userId: `usr_${i}`,
          username: `QuantumNode${i+1}`,
          uhid: `U200${i}X${Math.floor(Math.random()*900)}`,
          email: `quantum${i}@bepvault.com`,
          xaman: Math.random() * 500,
          lp: Math.random() * 2000,
          firstLpDeposit: new Date().toISOString(),
          zeroRisk: Math.random() * 100,
          fiveXLimitUsed: Math.random() * 300,
          xamanDeposits: Math.random() * 1500,
          chainDeposits: Math.random() * 5000,
          chainWithdrawals: Math.random() * 1000,
          autoPositioning: Math.random() * 200,
          communityRewardsTotal: Math.random() * 800,
          communityBoosterCredited: Math.random() * 400,
          communityBoosterBonus: Math.random() * 50,
          xBonusCredited: Math.random() * 150,
          xBonus: Math.random() * 30,
          claims: Math.random() * 250,
          redeems: Math.random() * 100
        }));
        
        setData(mockData);
        setTotalRecords(52);
        setError(null);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { if (user && ['support','admin'].includes(user.userType)) fetchData(); }, [page, rowsPerPage, debouncedFilters, user]);
  useEffect(() => { if (!authLoading && (!user || !['support','admin'].includes(user.userType))) router.push('/login'); }, [user, authLoading, router]);

  const totalPages   = Math.ceil(totalRecords / rowsPerPage) || 1;
  const handleFilter = (field) => (e) => { setFilters(prev => ({ ...prev, [field]: e.target.value })); setPage(0); };

  if (authLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid rgba(255,215,0,0.15)', borderTop:'3px solid #ffd700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:800, letterSpacing:2 }}>ESTABLISHING SECURE TERMINAL...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}><span className={styles.eyebrowDot}/> BEPVault Admin</div>
          <h1 className={styles.title}>Users <span>Audit Terminal</span></h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={fetchData}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:12,
              border:'1px solid rgba(255,215,0,0.12)', background:'rgba(255,215,0,0.05)',
              color:'rgba(255,215,0,0.6)', cursor:'pointer', fontSize:12, fontWeight:800 }}>
            <RefreshCw size={13}/> Refresh
          </button>
          <div className={styles.monitoringBadge}>
            <div className={styles.monitoringDot}/>
            <span className={styles.monitoringText}>Audit Protocol Active</span>
          </div>
        </div>
      </header>

      {/* ── SEARCH FORM ── */}
      <div className={styles.searchForm}>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label><Users size={10}/> Identity Trace</label>
            <input type="text" placeholder="Username..." value={filters.username} onChange={handleFilter('username')} className={styles.inputField}/>
          </div>
          <div className={styles.inputGroup}>
            <label><History size={10}/> UHID Protocol</label>
            <input type="text" placeholder="UHID..." value={filters.uhid} onChange={handleFilter('uhid')} className={styles.inputField}/>
          </div>
          <div className={styles.inputGroup}>
            <label><Wallet size={10}/> Wallet Address</label>
            <input type="text" placeholder="0x..." value={filters.USDTAddress} onChange={handleFilter('USDTAddress')} className={styles.inputField}/>
          </div>
          <div className={styles.inputGroup}>
            <label><LayoutGrid size={10}/> Records Limit</label>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }} className={styles.inputField}>
              {[10,25,50,100].map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── CALCULATOR BAR ── */}
      <CalculatorBar values={calcValues} onClear={clearCalc} onRemove={removeCalcAt} formatDecimal={(v)=>v?.toFixed?.(6) ?? '0.000000'} />

      {/* ── ERROR ── */}
      {error && <div className={styles.errorBanner}><XCircle size={15}/> {error}</div>}

      {/* ── RECORDS STRIP ── */}
      <div className={styles.recordsStrip}>
        <div>
          <div className={styles.recordsLabel}>Registry Records</div>
          <div className={styles.recordsCount}>{totalRecords.toLocaleString()} Users</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.25)', fontSize:11, fontWeight:700 }}>
          <Database size={12}/> Page {page+1} of {totalPages}
          &nbsp;·&nbsp; Showing {data.length} entries
        </div>
      </div>

      {/* ── CARD LIST ── */}
      <div className={styles.cardList}>
        {loading ? (
          <div className={styles.emptyState}>
            <div style={{ width:36, height:36, border:'3px solid rgba(255,215,0,0.15)', borderTop:'3px solid #ffd700', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
            <div className={styles.emptyText}>Decrypting audit records...</div>
          </div>
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚡</div>
            <div className={styles.emptyText}>Audit Signal Lost — No Records Found</div>
          </div>
        ) : data.map((row) => (
          <UserSummaryCard
            key={row.userId}
            row={row}
            addToCalc={(v, neg) => addToCalc(v, neg)}
            openDetail={openDetail}
          />
        ))}
      </div>

      {/* ── PAGINATION ── */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Segment <span>{page+1}</span> of <span>{totalPages}</span>
          &nbsp;·&nbsp; <span>{totalRecords}</span> total records
        </div>
        <div className={styles.paginationActions}>
          <button onClick={() => setPage(p=>p-1)} disabled={page===0} className={styles.pageBtn}>
            <ChevronLeft size={14}/> Prev
          </button>
          <button onClick={() => setPage(p=>p+1)} disabled={page >= totalPages-1} className={styles.pageBtn}>
            Next <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      {/* ── DETAIL MODALS ── */}
      {modals.map(m => (
        <DetailModal key={m.id} id={m.id} kind={m.kind} rows={m.rows} onClose={() => setModals(prev => prev.filter(md => md.id !== m.id))} />
      ))}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default function UsersSummaryTerminalPage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'rgba(255,215,0,0.4)', fontWeight:800, letterSpacing:2, fontSize:12 }}>
        ESTABLISHING AUDIT BUFFER...
      </div>
    }>
      <UsersSummaryTerminal />
    </Suspense>
  );
}
