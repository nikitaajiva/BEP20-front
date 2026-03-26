"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, Download, ChevronLeft, ChevronRight, Filter, 
  Calendar, Wallet as WalletIcon, Activity, User as UserIcon, 
  Tag, Terminal, Database, Clock, Zap, Target, ArrowRight, ShieldAlert, Cpu
} from 'lucide-react';
import styles from './ledger-rows.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const eventTypes = [
  'DEPOSIT', 'AIRDROP_ACTIVATION', 'AIRDROP_BURN', 'AIRDROP_TRANSFER', 'BOOST_BONUS',
  'ROI_CREDIT', 'ROI_CASCADE', 'WITHDRAWAL', 'INTERNAL_TRANSFER', 'LP_DEPOSIT_FROM_USDT',
  'MOCK_SWIFT_CREDIT', 'SWIFT_TRANSFER_IN', 'SWIFT_TRANSFER_OUT'
];

const walletTypes = [ 'EXTERNAL', 'SWIFT', 'LP', 'BOOST', 'COMMUNITY_REWARDS', 'USDT', 'ZERO_RISK', 'AIRDROP' ];

const parseBoostBonusNarrative = (narrative) => {
    if (typeof narrative !== 'string') return { from: 'SYSTEM', rate: null };
    const fromMatch = narrative.match(/from direct referral (.*)'s deposit/);
    const rateMatch = narrative.match(/\((.*?)%\)/);
    return {
        from: fromMatch ? fromMatch[1] : 'SYSTEM',
        rate: rateMatch ? rateMatch[1] : null,
    };
};

// Returns style class for event badge based on name keyword
const getEventTypeClass = (type = '') => {
  const t = type.toUpperCase();
  if (t.includes('DEPOSIT')) return styles.typeDeposit;
  if (t.includes('WITHDRAWAL')) return styles.typeWithdrawal;
  if (t.includes('BOOST')) return styles.typeBoost;
  if (t.includes('ROI') || t.includes('CASCADE')) return styles.typeRoi;
  if (t.includes('AIRDROP')) return styles.typeAirdrop;
  return styles.typeDefault;
};

/* ── Avatar Palette ── */
const PALETTE = [
  { bg: "rgba(255,215,0,0.15)", text: "#ffd700" },
  { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  { bg: "rgba(244,63,94,0.15)", text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)", text: "#06b6d4" },
];
const getAvatar = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];


function LedgerRows() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 12 });
    
    // Default sorting applied via API. No longer using UI headers to sort in new layout, 
    // but the state exists if we want to add sort dropdowns later.
    const [sort, setSort] = useState({ sortBy: 'ts', sortOrder: 'desc' });
    
    const [filters, setFilters] = useState({
        narrative: searchParams.get('narrative') || '',
        eventType: searchParams.get('eventType') || '',
        username: searchParams.get('username') || '',
        uhid: searchParams.get('uhid') || '',
        wallet: searchParams.get('wallet') || '',
        fromDate: searchParams.get('fromDate') || '',
        toDate: searchParams.get('toDate') || ''
    });

    const fetchRows = useCallback(async (page = pagination.currentPage) => {
        setLoading(true);
        setError(null);
        try {
            // --- DUMMY DATA FOR PREVIEW INSTED OF API DUMP ---
            setTimeout(() => {
                const resultData = Array.from({ length: 8 }).map((_, i) => ({
                    ts: new Date(Date.now() - i * 4500000).toISOString(),
                    userId: `dummy_usr_${i}`,
                    userInfo: { username: `GenesisWalker${i}`, uhid: `U900${i}X${Math.floor(Math.random()*900)}` },
                    eventType: eventTypes[i % eventTypes.length],
                    amount: Math.random() * 500,
                    walletFrom: i % 2===0 ? walletTypes[Math.floor(Math.random() * walletTypes.length)] : 'SYSTEM',
                    walletTo: walletTypes[Math.floor(Math.random() * walletTypes.length)],
                    ratePct: i % 3 === 0 ? (Math.random() * 5).toFixed(2) : 0,
                    narrative: `Audit Trajectory Executed: Node verification completed. Cross-chain hash sequence verified and synchronized perfectly. Tracing path #${Math.floor(Math.random()*10000)}.`
                }));
                setRows(resultData);
                setPagination({ ...pagination, currentPage: 1, totalPages: 1, totalRecords: 8 });
                setLoading(false);
            }, 500);
            
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [filters, pagination.limit, sort.sortBy, sort.sortOrder, router]);

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchRows(1);
    };
    
    const downloadCSV = () => {
        const header = ['Date', 'User ID', 'Username', 'UHID', 'Event Type', 'Amount', 'From', 'To', 'Rate %', 'Narrative'];
        const csvRows = [
            header.join(','),
            ...rows.map(row => {
                const boostDetails = row.eventType === 'BOOST_BONUS' ? parseBoostBonusNarrative(row.narrative) : {};
                return [
                    `"${new Date(row.ts).toLocaleString()}"`,
                    `"${row.userId}"`,
                    `"${row.userInfo?.username || 'N/A'}"`,
                    `"${row.userInfo?.uhid || 'N/A'}"`,
                    `"${row.eventType}"`,
                    row.amount,
                    `"${row.eventType === 'BOOST_BONUS' ? boostDetails.from : (row.walletFrom || 'N/A')}"`,
                    `"${row.walletTo || 'N/A'}"`,
                    `"${row.eventType === 'BOOST_BONUS' ? boostDetails.rate : (row.ratePct || 'N/A')}"`,
                    `"${(row.narrative || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `ledger-export-${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    useEffect(() => { if (user && ['support', 'admin'].includes(user.userType)) fetchRows(); }, [user, sort, fetchRows]);
    useEffect(() => { if (!authLoading && (!user || !['support', 'admin'].includes(user.userType))) router.push('/sign-in'); }, [user, authLoading, router]);

    if (authLoading) return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
        <div style={{ width:36, height:36, border:'3px solid rgba(255,215,0,0.15)', borderTop:'3px solid #ffd700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:800, letterSpacing:2 }}>ESTABLISHING AUDIT BUFFER...</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
    if (!user) return null;

    return (
        <div className={styles.container}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div>
                    <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
                    <h1 className={styles.title}>System <span>Audit Explorer</span></h1>
                </div>
                <div className={styles.statsBadge}>
                    <Database size={15} className={styles.statsBadgeIcon} />
                    <span className={styles.statsBadgeText}>{pagination.totalRecords.toLocaleString()} Core Entries</span>
                </div>
            </header>

            {/* ── FILTERS ── */}
            <form onSubmit={handleSearch} className={styles.filterForm}>
                <div className={styles.filterGrid}>
                    <div className={styles.inputGroup}>
                        <label><Tag size={10}/> Narrative Trace</label>
                        <input type="text" name="narrative" value={filters.narrative} onChange={handleFilterChange} placeholder="Search narrative..." className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><UserIcon size={10}/> Identity Matrix (UHID)</label>
                        <input type="text" name="uhid" value={filters.uhid} onChange={handleFilterChange} placeholder="Enter UHID..." className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Activity size={10}/> Protocol Scope</label>
                        <select name="eventType" value={filters.eventType} onChange={handleFilterChange} className={styles.selectField}>
                            <option value="">All Events</option>
                            {eventTypes.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label><WalletIcon size={10}/> Repository Engine</label>
                        <select name="wallet" value={filters.wallet} onChange={handleFilterChange} className={styles.selectField}>
                            <option value="">Global Wallets</option>
                            {walletTypes.map(w => <option key={w} value={w}>{w.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Calendar size={10}/> Timeline Start</label>
                        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Calendar size={10}/> Timeline End</label>
                        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputField} />
                    </div>
                </div>
                <div className={styles.formActions}>
                    <button type="button" onClick={downloadCSV} disabled={rows.length === 0} className={styles.btnDownload}>
                        <Download size={14} /> Export Packet
                    </button>
                    <button type="submit" disabled={loading} className={styles.btnPrimary}>
                        {loading ? <Activity size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Filter size={14} /> Sync Trace Filters</>}
                    </button>
                </div>
            </form>

            {/* ── ERROR ── */}
            {error && <div className={styles.errorBanner}><ShieldAlert size={15}/> {error}</div>}

            {/* ── AUDIT TRAIL ── */}
            <div className={styles.trailList}>
                {loading && rows.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Activity size={30} color="rgba(255,215,0,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
                        <div className={styles.emptyText}>Decrypting Audit Packets...</div>
                    </div>
                ) : rows.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Cpu className={styles.emptyIcon} />
                        <div className={styles.emptyText}>No Matrix Traces Discovered</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                            Modify the global filter scopes and attempt re-syncing.
                        </div>
                    </div>
                ) : (
                    rows.map((row, index) => {
                        const ts = new Date(row.ts);
                        const boostDetails = row.eventType === 'BOOST_BONUS' ? parseBoostBonusNarrative(row.narrative) : {};
                        const username = row.userInfo?.username || 'UNKNOWN';
                        const initials = username.slice(0, 2).toUpperCase();
                        const ac = getAvatar(username);
                        
                        return (
                            <div key={index} className={styles.trailCard}>
                                <div className={styles.trailDot} />
                                
                                {/* Time Column */}
                                <div className={styles.trailTimeCol}>
                                    <div className={styles.trailDate}>{ts.toLocaleDateString("en-GB", { timeZone: "UTC", day: '2-digit', month: 'short' })}</div>
                                    <div className={styles.trailTime}>{ts.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: '2-digit', minute: '2-digit', second:'2-digit' })}</div>
                                </div>

                                {/* Core Details */}
                                <div className={styles.trailCoreCol}>
                                    
                                    <div className={styles.trailHeader}>
                                        <div className={styles.trailIdentity}>
                                            <div className={styles.trailAvatar} style={{ background: ac.bg, color: ac.text }}>{initials}</div>
                                            <div>
                                                <div className={styles.trailUser}>{username}</div>
                                                <div className={styles.trailUhid}>{row.userInfo?.uhid || 'NULL'}</div>
                                            </div>
                                        </div>
                                        <span className={`${styles.trailEventType} ${getEventTypeClass(row.eventType)}`}>
                                            {row.eventType.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Metrics Details */}
                                    <div className={styles.trailMetrics}>
                                        <div className={styles.tMetric}>
                                            <span className={styles.tMetricLabel}>Volume Transacted</span>
                                            <span className={styles.tMetricVal}>{row.amount?.toFixed(2) || '0.00'} <span>USDT</span></span>
                                        </div>
                                        
                                        <div className={styles.tMetric}>
                                            <span className={styles.tMetricLabel}>Source Node</span>
                                            <span className={styles.tMetricVal} style={{ fontSize: 11, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>
                                                {row.eventType === 'BOOST_BONUS' ? boostDetails.from : (row.walletFrom || 'SYSTEM CORE')}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.tMetric}>
                                            <span className={styles.tMetricLabel}>Target Node</span>
                                            <span className={styles.tMetricVal} style={{ fontSize: 11, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>
                                                {row.walletTo || 'SYSTEM CORE'}
                                            </span>
                                        </div>

                                        <div className={styles.tMetric}>
                                            <span className={styles.tMetricLabel}>Calculated Yield</span>
                                            <span className={styles.tMetricVal}>
                                                <span className={styles.tMetricValYield}>{row.eventType === 'BOOST_BONUS' ? boostDetails.rate : (row.ratePct || '0')}%</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.trailNarrative}>
                                        {row.narrative}
                                    </div>

                                </div>

                            </div>
                        );
                    })
                )}
            </div>
            
            {/* ── PAGINATION ── */}
            <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                    Segment Data <span>{pagination.currentPage}</span> of <span>{pagination.totalPages || 1}</span>
                </div>
                <div className={styles.btnGroup}>
                    <button
                        onClick={() => fetchRows(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1 || loading}
                        className={styles.btnSecondary}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                        onClick={() => fetchRows(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages || loading}
                        className={styles.btnSecondary}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LedgerRowsPage() {
    return (
        <Suspense fallback={
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'rgba(255,215,0,0.4)', fontWeight:800, letterSpacing:2, fontSize:12 }}>
                CONNECTING TO AUDIT HUB...
            </div>
        }>
            <LedgerRows />
        </Suspense>
    );
} 
