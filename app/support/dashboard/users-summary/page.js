"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import DetailModal from '@/components/DetailModal';
import { 
  Users, 
  Search as SearchIcon, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Calculator, 
  Zap, 
  Wallet, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  History, 
  Database,
  Calendar,
  XCircle,
  Clock,
  LayoutGrid
} from 'lucide-react';
import CalculatorBar from '@/components/CalculatorBar';
import styles from './users-summary.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const UsersSummaryTerminal = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filters, setFilters] = useState({ username: '', uhid: '', USDTAddress: '' });
    const debouncedFilters = useDebounce(filters, 500);
    const [modals, setModals] = useState([]);
    const [calcValues, setCalcValues] = useState([]);

    const addToCalc = (num, negative = false) => {
        if (typeof num !== 'number' || isNaN(num)) return;
        const val = negative ? -parseFloat(num.toFixed(6)) : parseFloat(num.toFixed(6));
        setCalcValues(prev => [...prev, val]);
    };
    const clearCalc = () => setCalcValues([]);
    const removeCalcAt = (index) => setCalcValues(prev => prev.filter((_, i) => i !== index));

    const openDetail = async (userId, kind) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Auth');
            const resp = await fetch(`${API_BASE_URL}/api/support/users-summary/detail?userId=${userId}&kind=${kind}&limit=200`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await resp.json();
            if(!json.success) throw new Error(json.message || 'fetch');
            setModals(prev => [...prev, { id: `${userId}-${kind}-${Date.now()}`, kind, rows: json.data }]);
        } catch (e) { console.error('Detail fetch err', e); }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');
            const queryParams = new URLSearchParams({ page: page + 1, limit: rowsPerPage, ...debouncedFilters });
            const response = await fetch(`${API_BASE_URL}/api/support/users-summary?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Failed to fetch data');
            setData(result.data);
            setTotalRecords(result.pagination.totalRecords);
            setError(null);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Authentication required') || err.message.includes('Unauthorized')) router.push('/sign-in');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (user && ['support', 'admin'].includes(user.userType)) fetchData();
    }, [page, rowsPerPage, debouncedFilters, user]);

    useEffect(() => {
        if (!authLoading && (!user || !['support', 'admin'].includes(user.userType))) router.push('/sign-in');
    }, [user, authLoading, router]);

    const handleChangePage = (dir) => setPage(page + dir);
    const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
    const handleFilterChange = (field) => (e) => { setFilters(prev => ({ ...prev, [field]: e.target.value })); setPage(0); };

    const formatDecimal = (value) => {
        if (value === null || value === undefined) return '0.000000';
        const num = (value && typeof value === 'object' && '$numberDecimal' in value) ? parseFloat(value.$numberDecimal) : (typeof value === 'string' ? parseFloat(value) : value);
        return isNaN(num) ? '0.000000' : num.toFixed(6);
    };

    const toNumber = (val) => {
        if (val && typeof val === 'object' && '$numberDecimal' in val) return parseFloat(val.$numberDecimal);
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
    };

    const ValueWithEye = ({ value, formatted, onDetail }) => {
        const num = toNumber(value); return (
            <div className="flex items-center justify-end gap-2 group">
                <span className={`${styles.calcValue} group-hover:text-gold-400`} onClick={(e) => addToCalc(num, e.metaKey || e.ctrlKey)}>
                    {formatted ?? formatDecimal(value)}
                </span>
                <Eye className={styles.viewIcon} size={13} onClick={(e) => { e.stopPropagation(); onDetail(); }} />
            </div>
        );
    };

    if (authLoading) return <div className="text-center p-20 animate-pulse text-gold-500">Establishing Secure Terminal Connection...</div>;

    return (
        <div className={styles.container}>
            <header className="flex justify-between items-center mb-8">
                <h1 className={styles.title}>Users <span>Audit Terminal</span></h1>
                <div className={styles.monitoringBadge}>
                    <div className={styles.monitoringDot} />
                    <span className={styles.monitoringText}>Audit Monitoring Protocol Active</span>
                </div>
            </header>

            <div className={styles.searchForm}>
                <div className={styles.filterGrid}>
                    <div className={styles.inputGroup}>
                        <label><Users size={12} className="inline mr-2" /> Identity Trace</label>
                        <input type="text" placeholder="Username..." value={filters.username} onChange={handleFilterChange('username')} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><History size={12} className="inline mr-2" /> UHID Protocol</label>
                        <input type="text" placeholder="UHID..." value={filters.uhid} onChange={handleFilterChange('uhid')} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Wallet size={12} className="inline mr-2" /> Wallet Address</label>
                        <input type="text" placeholder="Address..." value={filters.USDTAddress} onChange={handleFilterChange('USDTAddress')} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                       <label><LayoutGrid size={12} className="inline mr-2" /> Records Limit</label>
                       <select value={rowsPerPage} onChange={handleChangeRowsPerPage} className={styles.inputField}>
                           {[10, 25, 50, 100].map(pz => <option key={pz} value={pz}>{pz} Rows Per Segment</option>)}
                       </select>
                    </div>
                </div>
            </div>

            <CalculatorBar values={calcValues} onClear={clearCalc} onRemove={removeCalcAt} formatDecimal={formatDecimal} />

            {error && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <XCircle size={18} /> {error}
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Administrative Core</th>
                            <th>Xaman Deposits</th>
                            <th>Xaman Balance</th>
                            <th>Zero Risk</th>
                            <th>LP Balance</th>
                            <th>5X Consumption</th>
                            <th>Chain Deposits</th>
                            <th>Chain Withdrawals</th>
                            <th>Ecosystem Fees</th>
                            <th>Auto positioning</th>
                            <th>Community Units</th>
                            <th>Cascade units</th>
                            <th>Booster Delta</th>
                            <th>X Bonus Trace</th>
                            <th>Total Rewards</th>
                            <th>Claims Audit</th>
                            <th>Redeems Audit</th>
                            <th>Total Outflow</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && data.length === 0 ? (
                            <tr><td colSpan={18} className="text-center p-20 opacity-40 italic">Audit Signal Lost - No Data Records</td></tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.userId} className={styles.row}>
                                    <td><div className="font-black text-gold-400">{row.username}</div></td>
                                    <td><ValueWithEye value={row.xamanDeposits} onDetail={() => openDetail(row.userId,'xamanDeposits')} /></td>
                                    <td><span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.xaman), e.metaKey || e.ctrlKey)}>{formatDecimal(row.xaman)}</span></td>
                                    <td><span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.zeroRisk), e.metaKey || e.ctrlKey)}>{formatDecimal(row.zeroRisk)}</span></td>
                                    <td>
                                        <div className="flex flex-col items-end">
                                            <span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.lp), e.metaKey || e.ctrlKey)}>{formatDecimal(row.lp)}</span>
                                            {row.firstLpDeposit && <span className={styles.timestamp}>{new Date(row.firstLpDeposit).toLocaleDateString('en-GB')}</span>}
                                        </div>
                                    </td>
                                    <td><span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.fiveXLimitUsed), e.metaKey || e.ctrlKey)}>{formatDecimal(row.fiveXLimitUsed)}</span></td>
                                    <td><ValueWithEye value={row.chainDeposits} onDetail={() => openDetail(row.userId,'chainDeposits')} /></td>
                                    <td><ValueWithEye value={row.chainWithdrawals} onDetail={() => openDetail(row.userId,'chainWithdrawals')} /></td>
                                    <td><ValueWithEye value={row.ecoFeesTotal} onDetail={() => openDetail(row.userId,'ecosystemfees')} /></td>
                                    <td><ValueWithEye value={row.autoPositioning} onDetail={() => openDetail(row.userId,'autoPositioning')} /></td>
                                    <td><ValueWithEye value={row.communityRewardsCredited} formatted={`${formatDecimal(row.communityRewardsCredited)} (${formatDecimal(row.communityRewards)})`} onDetail={() => openDetail(row.userId,'communityRewards')} /></td>
                                    <td><span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.cascadeRewards), e.metaKey || e.ctrlKey)}>{formatDecimal(row.cascadeRewards)}</span></td>
                                    <td><ValueWithEye value={row.communityBoosterCredited} formatted={`${formatDecimal(row.communityBoosterCredited)} (${formatDecimal(row.communityBoosterBonus)})`} onDetail={() => openDetail(row.userId,'boosterBonus')} /></td>
                                    <td><ValueWithEye value={row.xBonusCredited} formatted={`${formatDecimal(row.xBonusCredited)} (${formatDecimal(row.xBonus)})`} onDetail={() => openDetail(row.userId,'xBonus')} /></td>
                                    <td><span className={styles.calcValue} onClick={(e) => addToCalc(toNumber(row.communityRewardsTotal), e.metaKey || e.ctrlKey)}>{formatDecimal(row.communityRewardsTotal)}</span></td>
                                    <td><ValueWithEye value={row.claims} onDetail={() => openDetail(row.userId,'claims')} /></td>
                                    <td><ValueWithEye value={row.redeems} onDetail={() => openDetail(row.userId,'redeems')} /></td>
                                    <td><ValueWithEye value={toNumber(row.claims)+toNumber(row.redeems)+toNumber(row.autoPositioning)} onDetail={() => openDetail(row.userId,'withdrawals')} /></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                 <span className={styles.pageInfo}>SEGMENT {page + 1} OF {Math.ceil(totalRecords / rowsPerPage) || 1}</span>
                 <div className="flex gap-2">
                     <button onClick={() => handleChangePage(-1)} disabled={page === 0} className={styles.pageBtn}><ChevronLeft size={16} /></button>
                     <button onClick={() => handleChangePage(1)} disabled={page >= Math.ceil(totalRecords / rowsPerPage) - 1} className={styles.pageBtn}><ChevronRight size={16} /></button>
                 </div>
            </div>

            {modals.map(m => (
                <DetailModal key={m.id} id={m.id} kind={m.kind} rows={m.rows} onClose={()=>setModals(prev=>prev.filter(md=>md.id!==m.id))} />
            ))}
        </div>
    );
};

export default function UsersSummaryTerminalPage() {
    return (
        <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Establishing Audit Buffer...</div>}>
            <UsersSummaryTerminal />
        </Suspense>
    );
}
