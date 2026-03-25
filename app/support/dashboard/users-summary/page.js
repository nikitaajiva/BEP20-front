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
    const [filters, setFilters] = useState({ username: '', uhid: '', wallet_address: '' });
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

            <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(79, 140, 255, 0.2)',
                background: 'rgba(16,25,53,0.5)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={filters.username}
                        onChange={handleFilterChange('username')}
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="UHID"
                        value={filters.uhid}
                        onChange={handleFilterChange('uhid')}
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="Wallet Address"
                        value={filters.wallet_address}
                        onChange={handleFilterChange('wallet_address')}
                        style={inputStyle}
                    />
                    <select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        style={inputStyle}
                    >
                        {[10, 25, 50, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize} rows per page
                            </option>
                        ))}
                    </select>
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
                        <tr style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.2)' }}>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Username</th>
                            <th style={thStyle}>USDT Deposits</th>
                            <th style={thStyle}>USDT Balance</th>
                            <th style={thStyle}>Zero Risk</th>
                            <th style={thStyle}>LP Balance</th>
                            <th style={thStyle}>5X Used</th>
                            <th style={thStyle}>Chain Deposits</th>
                            <th style={thStyle}>Chain Withdrawals</th>
                            <th style={thStyle}>EcoFees</th>
                            <th style={thStyle}>Auto Position</th>
                            <th style={thStyle}>Community Rewards</th>
                            <th style={thStyle}>Cascade Rewards</th>
                            <th style={thStyle}>Booster Bonus</th>
                            <th style={thStyle}>X Bonus</th>
                            <th style={thStyle}>Total Rewards</th>
                            <th style={thStyle}>Claims</th>
                            <th style={thStyle}>Redeems</th>
                            <th style={thStyle}>Withdrawals</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && data.length === 0 ? (
                            <tr><td colSpan={18} className="text-center p-20 opacity-40 italic">Audit Signal Lost - No Data Records</td></tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.userId} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>{row.username}</td>
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.usdtDeposits} onDetail={() => openDetail(row.userId,'usdtDeposits')} />
                                    </td>
                                    <td style={tdStyle}><ClickableNumber value={row.usdt} /></td>
                                    <td style={tdStyle}><ClickableNumber value={row.zeroRisk} /></td>
                                    <td style={tdStyle}><ClickableNumber value={row.lp} />
                                    <div>  
                                    {row.firstLpDeposit
                                    ? new Date(row.firstLpDeposit).toLocaleString("en-GB", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                        })
                                    : "-"}</div></td>
                                    <td style={tdStyle}><ClickableNumber value={row.fiveXLimitUsed} /></td>
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.chainDeposits} onDetail={() => openDetail(row.userId,'chainDeposits')} />
                                    </td>
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.chainWithdrawals} onDetail={() => openDetail(row.userId,'chainWithdrawals')} />
                                    </td>
                                    <td style={tdStyle}>
                                        {(() => { const w = toNumber(row.ecoFeesTotal); return (
                                          <ValueWithEye value={w} onDetail={() => openDetail(row.userId,'ecosystemfees')} /> ); })()}
                                    </td>
                                     <td style={tdStyle}>
                                        {(() => { const w = toNumber(row.autoPositioning); return (
                                          <ValueWithEye value={w} onDetail={() => openDetail(row.userId,'autoPositioning')} /> ); })()}
                                    </td>
                                    <td style={tdStyle}>
                                         <ValueWithEye 
                                             value={row.communityRewardsCredited}
                                             formatted={`${formatDecimal(row.communityRewardsCredited)} (${formatDecimal(row.communityRewards)})`} 
                                             onDetail={() => openDetail(row.userId,'communityRewards')} />
                                    </td>

                                    <td style={tdStyle}><ClickableNumber value={row.cascadeRewards} /></td>

                                    <td style={tdStyle}>
                                         <ValueWithEye 
                                             value={row.communityBoosterCredited}
                                             formatted={`${formatDecimal(row.communityBoosterCredited)} (${formatDecimal(row.communityBoosterBonus)})`} 
                                             onDetail={() => openDetail(row.userId,'boosterBonus')} />
                                    </td>
                                    <td style={tdStyle}>
                                         <ValueWithEye 
                                             value={row.xBonusCredited}
                                             formatted={`${formatDecimal(row.xBonusCredited)} (${formatDecimal(row.xBonus)})`} 
                                             onDetail={() => openDetail(row.userId,'xBonus')} />
                                    </td>

                                    <td style={tdStyle}><ClickableNumber value={row.communityRewardsTotal} /></td>
                           
                                   
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.claims} onDetail={() => openDetail(row.userId,'claims')} />
                                    </td>
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.redeems} onDetail={() => openDetail(row.userId,'redeems')} />
                                    </td>
                                    <td style={tdStyle}>
                                        {(() => { const w = toNumber(row.claims)+toNumber(row.redeems)+toNumber(row.autoPositioning); return (
                                          <ValueWithEye value={w} onDetail={() => openDetail(row.userId,'withdrawals')} /> ); })()}
                                    </td>
                                    
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

export default UsersSummary; 
