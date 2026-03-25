'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import DetailModal from '@/components/DetailModal';
import { FaEye } from 'react-icons/fa';
import CalculatorBar from '@/components/CalculatorBar';

// Ensure API_BASE_URL ends with a trailing slash
const API_BASE_URL =  `${process.env.NEXT_PUBLIC_API_URL}`; 


const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid rgba(79, 140, 255, 0.2)',
    background: 'rgba(79, 140, 255, 0.1)',
    color: '#fff',
    fontSize: '0.9rem'
};

const UsersSummary = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filters, setFilters] = useState({ username: '', uhid: '', xrpAddress: '' });
    const debouncedFilters = useDebounce(filters, 500);
    const [modals, setModals] = useState([]); // {id, kind, rows}
    // NEW STATE FOR CALCULATOR
    const [calcValues, setCalcValues] = useState([]);

    // Helpers to manage calculator values
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
        } catch (e) {
            console.error('Detail fetch err', e);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');

            const queryParams = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage,
                ...debouncedFilters
            });

            const response = await fetch(`${API_BASE_URL}/api/support/users-summary?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch data');
            }

            setData(result.data);
            setTotalRecords(result.pagination.totalRecords);
            setError(null);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            if (err.message.includes('Authentication required') || err.message.includes('Unauthorized')) {
                router.push('/sign-in');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && ['support', 'admin'].includes(user.userType)) {
            fetchData();
        }
    }, [page, rowsPerPage, debouncedFilters, user]);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/sign-in');
            } else if (!['support', 'admin'].includes(user.userType)) {
                router.push('/sign-in');
            }
        }
    }, [user, authLoading, router]);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({ ...prev, [field]: event.target.value }));
        setPage(0);
    };

    const formatDecimal = (value) => {
        if (value === null || value === undefined) return '0.000000';
        // Handle MongoDB Decimal128 format
        if (value && typeof value === 'object' && '$numberDecimal' in value) {
            return parseFloat(value.$numberDecimal).toFixed(6);
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0.000000' : num.toFixed(6);
    };

    const toNumber = (val) => {
        if (val && typeof val === 'object' && '$numberDecimal' in val) {
            return parseFloat(val.$numberDecimal);
        }
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
    };

    // Small wrapper to make any numeric value clickable
    const ClickableNumber = ({ value }) => {
        const num = toNumber(value);
        return (
            <span
                style={{ cursor: 'pointer' }}
                onClick={(e) => addToCalc(num, e.metaKey || e.ctrlKey)}
            >
                {formatDecimal(value)}
            </span>
        );
    };

    // Updated helper with eye icon + calculator behaviour
    const ValueWithEye = ({ value, formatted, onDetail }) => {
        const num = toNumber(value);
        return (
            <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                onClick={(e) => addToCalc(num, e.metaKey || e.ctrlKey)}
            >
                <span>{formatted ?? formatDecimal(value)}</span>
                <FaEye
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onDetail(); }}
                />
            </span>
        );
    };

    if (authLoading) {
        return <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading authentication state...</div>;
    }

    if (!user || !['support', 'admin'].includes(user.userType)) {
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Unauthorized access. Redirecting...</div>;
    }

    // Predefined cell styles to keep table aligned and prevent wrapping
    const thStyle = {
        padding: '1rem',
        textAlign: 'right',
        color: '#4f8cff',
        whiteSpace: 'nowrap',
    };

    const tdStyle = {
        padding: '1rem',
        color: '#fff',
        textAlign: 'right',
        whiteSpace: 'nowrap',
    };

    return (
        <div style={{ 
            background: '#181f3a',
            borderRadius: '22px',
            padding: '2rem',
            color: 'white'
        }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Users Summary</h2>

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
                        placeholder="XRP Address"
                        value={filters.xrpAddress}
                        onChange={handleFilterChange('xrpAddress')}
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

            {/* QUICK CALCULATOR BAR */}
            <CalculatorBar values={calcValues} onClear={clearCalc} onRemove={removeCalcAt} formatDecimal={formatDecimal} />

            {loading && <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading...</div>}
            
            {error && (
                <div style={{
                    background: 'rgba(255, 77, 77, 0.1)',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#ff4d4d'
                }}>
                    {error}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.2)' }}>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Username</th>
                            <th style={thStyle}>Xaman Deposits</th>
                            <th style={thStyle}>Xaman Balance</th>
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
                            <tr>
                                <td colSpan={17} style={{ padding: '2rem', textAlign: 'center', color: '#b3baff' }}>
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.userId} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>{row.username}</td>
                                    <td style={tdStyle}>
                                        <ValueWithEye value={row.xamanDeposits} onDetail={() => openDetail(row.userId,'xamanDeposits')} />
                                    </td>
                                    <td style={tdStyle}><ClickableNumber value={row.xaman} /></td>
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

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: '#b3baff' }}>
                    Page {page + 1} of {Math.ceil(totalRecords / rowsPerPage)}
                </span>
                <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    style={{
                        background: 'rgba(79, 140, 255, 0.1)',
                        border: '1px solid rgba(79, 140, 255, 0.2)',
                        color: '#4f8cff',
                        borderRadius: '12px',
                        padding: '0.5rem 1rem',
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.5 : 1
                    }}
                >
                    Previous
                </button>
                <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= Math.ceil(totalRecords / rowsPerPage) - 1}
                    style={{
                        background: 'rgba(79, 140, 255, 0.1)',
                        border: '1px solid rgba(79, 140, 255, 0.2)',
                        color: '#4f8cff',
                        borderRadius: '12px',
                        padding: '0.5rem 1rem',
                        cursor: page >= Math.ceil(totalRecords / rowsPerPage) - 1 ? 'not-allowed' : 'pointer',
                        opacity: page >= Math.ceil(totalRecords / rowsPerPage) - 1 ? 0.5 : 1
                    }}
                >
                    Next
                </button>
            </div>
            {modals.map(m => (
                <DetailModal key={m.id} id={m.id} kind={m.kind} rows={m.rows} onClose={()=>setModals(prev=>prev.filter(md=>md.id!==m.id))} />
            ))}
        </div>
    );
};

export default UsersSummary; 