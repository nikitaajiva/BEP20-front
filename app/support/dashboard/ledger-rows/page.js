"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, ChevronLeft, ChevronRight, Filter, Calendar, Wallet as WalletIcon, Activity, User as UserIcon, Tag, Terminal, Database, Clock } from 'lucide-react';
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

function LedgerRows() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Initializing filters from URL - use default to prevent uncontrolled issues
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 25
    });
    const [sort, setSort] = useState({
        sortBy: 'ts',
        sortOrder: 'desc'
    });
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
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
            );
            const queryParams = {
                ...cleanFilters,
                page,
                limit: pagination.limit,
                sortBy: sort.sortBy,
                sortOrder: sort.sortOrder,
            };
            const query = new URLSearchParams(queryParams).toString();
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');
            const response = await fetch(`${API_BASE_URL}/api/support/ledger-rows?${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch rows');
            setRows(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Authentication required')) {
                router.push('/sign-in');
            }
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit, sort.sortBy, sort.sortOrder, router]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchRows(1);
    };

    const handleSort = (column) => {
        const newSortOrder = sort.sortBy === column && sort.sortOrder === 'asc' ? 'desc' : 'asc';
        setSort({ sortBy: column, sortOrder: newSortOrder });
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
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ledger-export-${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (user && ['support', 'admin'].includes(user.userType)) {
            fetchRows();
        }
    }, [user, sort, fetchRows]);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !['support', 'admin'].includes(user.userType)) {
                router.push('/sign-in');
            }
        }
    }, [user, authLoading, router]);

    if (authLoading) return <div className="text-center p-20 text-gold-500 animate-pulse">Initializing Data Stream...</div>;
    if (!user) return null;

    const SortableHeader = ({ children, column }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2">
                {children}
                {sort.sortBy === column && (
                    sort.sortOrder === 'asc' ? <ChevronLeft className="rotate-90" size={12} /> : <ChevronRight className="rotate-90" size={12} />
                )}
            </div>
        </th>
    );

    return (
        <div className={styles.container}>
            <header className="flex justify-between items-center mb-8">
                <h1 className={styles.title}>System <span>Audit Explorer</span></h1>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <Database size={14} color="#ffd700" />
                        <span style={{ fontSize: '12px', fontWeight: 800 }}>{pagination.totalRecords} Entries</span>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSearch} className={styles.filterForm}>
                <div className={styles.filterGrid}>
                    <div className={styles.inputGroup}>
                        <label><Tag size={12} className="inline mr-1" /> Narrative</label>
                        <input type="text" name="narrative" value={filters.narrative} onChange={handleFilterChange} placeholder="Search narrative..." className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><UserIcon size={12} className="inline mr-1" /> Identity</label>
                        <input type="text" name="uhid" value={filters.uhid} onChange={handleFilterChange} placeholder="Enter UHID..." className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Activity size={12} className="inline mr-1" /> Protocol</label>
                        <select name="eventType" value={filters.eventType} onChange={handleFilterChange} className={styles.selectField}>
                            <option value="">All Events</option>
                            {eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label><WalletIcon size={12} className="inline mr-1" /> Repository</label>
                        <select name="wallet" value={filters.wallet} onChange={handleFilterChange} className={styles.selectField}>
                            <option value="">All Wallets</option>
                            {walletTypes.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Calendar size={12} className="inline mr-1" /> From</label>
                        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label><Calendar size={12} className="inline mr-1" /> Until</label>
                        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputField} />
                    </div>
                </div>
                <div className={styles.formActions}>
                    <button type="button" onClick={downloadCSV} disabled={rows.length === 0} className={styles.btnDownload}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button type="submit" disabled={loading} className={styles.btnPrimary}>
                        {loading ? 'Decrypting...' : <><Filter size={16} /> Sync Filters</>}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                    {error}
                </div>
            )}
            
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <SortableHeader column="ts">Timestamp</SortableHeader>
                            <SortableHeader column="userInfo.username">Identity</SortableHeader>
                            <SortableHeader column="eventType">Event Type</SortableHeader>
                            <SortableHeader column="amount">Volume</SortableHeader>
                            <th>Source</th>
                            <th>Target</th>
                            <th>Yield %</th>
                            <th style={{ width: '400px' }}>Audit Narrative</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? rows.map((row, index) => {
                            const boostDetails = row.eventType === 'BOOST_BONUS' ? parseBoostBonusNarrative(row.narrative) : {};
                            return (
                                <tr key={index} className={styles.row}>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <div className="flex flex-col">
                                            <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{new Date(row.ts).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '11px', color: '#888' }}>{new Date(row.ts).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 800, color: '#ffd700' }}>{row.userInfo?.username || 'N/A'}</span>
                                            <span style={{ fontSize: '10px', color: '#666' }}>{row.userInfo?.uhid || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            fontSize: '10px',
                                            fontWeight: 800
                                        }}>{row.eventType}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 800, color: '#fff' }}>{row.amount?.toFixed(2)}</span>
                                        <span style={{ fontSize: '10px', color: '#ffd700', marginLeft: '4px' }}>USDT</span>
                                    </td>
                                    <td><span style={{ fontSize: '12px', opacity: 0.7 }}>{row.eventType === 'BOOST_BONUS' ? boostDetails.from : (row.walletFrom || 'SYSTEM')}</span></td>
                                    <td><span style={{ fontSize: '12px', opacity: 0.7 }}>{row.walletTo || 'SYSTEM'}</span></td>
                                    <td><span style={{ fontWeight: 800, color: '#00ff88' }}>{row.eventType === 'BOOST_BONUS' ? boostDetails.rate : (row.ratePct || '0')}%</span></td>
                                    <td>
                                        <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>{row.narrative}</p>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                                    No transaction traces found matching the current criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                    Registry Segment <span>{pagination.currentPage}</span> of <span>{pagination.totalPages}</span>
                </div>
                <div className={styles.btnGroup}>
                    <button
                        onClick={() => fetchRows(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1 || loading}
                        className={styles.btnSecondary}
                    >
                        <ChevronLeft size={16} /> Previous
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
        <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Connecting to Audit Hub...</div>}>
            <LedgerRows />
        </Suspense>
    );
} 
