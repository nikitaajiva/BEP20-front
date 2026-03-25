"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

// TODO: Move this URL to a .env.local file
const API_BASE_URL =    `${process.env.NEXT_PUBLIC_API_URL}`;
 

// From LedgerRow.js model
const eventTypes = [
  'DEPOSIT', 'AIRDROP_ACTIVATION', 'AIRDROP_BURN', 'AIRDROP_TRANSFER', 'BOOST_BONUS',
  'ROI_CREDIT', 'ROI_CASCADE', 'WITHDRAWAL', 'INTERNAL_TRANSFER', 'LP_DEPOSIT_FROM_USDT',
  'MOCK_SWIFT_CREDIT', 'SWIFT_TRANSFER_IN', 'SWIFT_TRANSFER_OUT'
];

const walletTypes = [ 'EXTERNAL', 'SWIFT', 'LP', 'BOOST', 'COMMUNITY_REWARDS', 'USDT', 'ZERO_RISK', 'AIRDROP' ];

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid rgba(79, 140, 255, 0.2)',
    background: 'rgba(79, 140, 255, 0.1)',
    color: '#fff',
    fontSize: '0.9rem'
};

const labelStyle = {
    display: 'block', 
    marginBottom: '0.5rem', 
    color: '#b3baff',
    fontSize: '0.9rem'
};

// Helper function to extract details from BOOST_BONUS narrative
const parseBoostBonusNarrative = (narrative) => {
    if (typeof narrative !== 'string') {
        return { from: 'SYSTEM', rate: null };
    }
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
            if (err.message.includes('Authentication required') || err.message.includes('Unauthorized')) {
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
        
        const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ledger-rows.csv');
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
            if (!user) {
                router.push('/sign-in');
            } else if (!['support', 'admin'].includes(user.userType)) {
                router.push('/sign-in');
            }
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading authentication state...</div>;
    }
    if (!user || !['support', 'admin'].includes(user.userType)) {
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Unauthorized access. Redirecting...</div>;
    }

    const SortableHeader = ({ children, column }) => (
        <th onClick={() => handleSort(column)} style={{ padding: '1rem', textAlign: 'left', color: '#4f8cff', cursor: 'pointer' }}>
            {children}
            {sort.sortBy === column ? (sort.sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
        </th>
    );

    return (
        <div style={{ 
          background: '#181f3a',
          borderRadius: '22px',
          padding: '2rem',
          color: 'white'
        }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Ledger Rows Explorer</h2>
            <form onSubmit={handleSearch} style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(79, 140, 255, 0.2)',
                background: 'rgba(16,25,53,0.5)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Narrative</label>
                        <input type="text" name="narrative" value={filters.narrative} onChange={handleFilterChange} placeholder="Narrative contains..." style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Username</label>
                        <input type="text" name="username" value={filters.username} onChange={handleFilterChange} placeholder="Username contains..." style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>UHID</label>
                        <input type="text" name="uhid" value={filters.uhid} onChange={handleFilterChange} placeholder="UHID contains..." style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Event Type</label>
                        <select name="eventType" value={filters.eventType} onChange={handleFilterChange} style={inputStyle}><option value="">Any Event Type</option>{eventTypes.map(e => <option key={e} value={e}>{e}</option>)}</select>
                    </div>
                    <div>
                        <label style={labelStyle}>Wallet</label>
                        <select name="wallet" value={filters.wallet} onChange={handleFilterChange} style={inputStyle}><option value="">Any Wallet</option>{walletTypes.map(w => <option key={w} value={w}>{w}</option>)}</select>
                    </div>
                    <div>
                        <label style={labelStyle}>From Date</label>
                        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} style={inputStyle}/>
                    </div>
                    <div>
                        <label style={labelStyle}>To Date</label>
                        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} style={inputStyle}/>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <button type="button" onClick={downloadCSV} disabled={rows.length === 0} style={{
                        background: 'rgba(25, 135, 84, 0.1)',
                        border: '1px solid rgba(25, 135, 84, 0.2)',
                        color: '#198754',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        opacity: rows.length === 0 ? 0.5 : 1,
                        fontWeight: 'bold'
                    }}>
                        Download CSV
                    </button>
                    <button type="submit" disabled={loading} style={{
                        background: 'rgba(79, 140, 255, 0.1)',
                        border: '1px solid rgba(79, 140, 255, 0.2)',
                        color: '#4f8cff',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        opacity: loading ? 0.5 : 1,
                        fontWeight: 'bold'
                    }}>
                        {loading ? 'Filtering...' : 'Apply Filters'}
                    </button>
                </div>
            </form>

            <div style={{ margin: '1rem 0', color: '#b3baff' }}>
                Total Records: {pagination.totalRecords}
            </div>

            {loading && <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading...</div>}
            
            {error && (
              <div style={{
                background: 'rgba(255, 77, 77, 0.1)',
                border: '1px solid rgba(255, 77, 77, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#ffb3b3',
                marginBottom: '1rem'
              }}>{error}</div>
            )}
            
            <div className="table-responsive" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <SortableHeader column="ts">Date</SortableHeader>
                            <SortableHeader column="userInfo.username">User</SortableHeader>
                            <SortableHeader column="userInfo.uhid">UHID</SortableHeader>
                            <SortableHeader column="eventType">Event Type</SortableHeader>
                            <SortableHeader column="amount">Amount</SortableHeader>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>From</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>To</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Rate %</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Narrative</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const boostDetails = row.eventType === 'BOOST_BONUS' ? parseBoostBonusNarrative(row.narrative) : {};
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid #2a3150' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(row.ts).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>{row.userInfo?.username || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{row.userInfo?.uhid || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{row.eventType}</td>
                                    <td style={{ padding: '1rem' }}>{row.amount}</td>
                                    <td style={{ padding: '1rem' }}>{row.eventType === 'BOOST_BONUS' ? boostDetails.from : (row.walletFrom || 'N/A')}</td>
                                    <td style={{ padding: '1rem' }}>{row.walletTo || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{row.eventType === 'BOOST_BONUS' ? boostDetails.rate : (row.ratePct || 'N/A')}</td>
                                    <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.narrative}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#b3baff' }}>
                <button
                    onClick={() => fetchRows(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1 || loading}
                    style={{...buttonStyle, opacity: (pagination.currentPage <= 1 || loading) ? 0.5 : 1 }}
                >
                    Previous
                </button>
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                    onClick={() => fetchRows(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages || loading}
                    style={{...buttonStyle, opacity: (pagination.currentPage >= pagination.totalPages || loading) ? 0.5 : 1 }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const buttonStyle = {
    background: 'rgba(79, 140, 255, 0.1)',
    border: '1px solid rgba(79, 140, 255, 0.2)',
    color: '#4f8cff',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontWeight: 'bold'
}; 

export default function LedgerRowsPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading...</div>}>
            <LedgerRows />
        </Suspense>
    );
} 
