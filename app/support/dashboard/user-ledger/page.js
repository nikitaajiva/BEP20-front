"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye } from 'react-icons/fa';

// TODO: Move this URL to a .env.local file
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(79, 140, 255, 0.2)',
    background: 'rgba(79, 140, 255, 0.1)',
    color: '#fff',
    fontSize: '1rem',
    width: '100%',
};

function EditWalletModal({ isOpen, onClose, onSave, field, currentValue }) {
    const [value, setValue] = useState(currentValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setValue(currentValue);
        setError(null);
    }, [isOpen, currentValue]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(field, value);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#181f3a', borderRadius: '22px', padding: '2rem', minWidth: 320, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem', textTransform: 'capitalize' }}>Edit {field} Wallet</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        style={inputStyle}
                        placeholder="Enter new value"
                        disabled={loading}
                    />
                    {error && <div style={{ color: '#ff4d4d', marginTop: 8 }}>{error}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button type="submit" disabled={loading} style={{ ...inputStyle, background: '#4f8cff', color: '#fff', border: 'none', width: '50%' }}>{loading ? 'Saving...' : 'Save'}</button>
                        <button type="button" onClick={onClose} disabled={loading} style={{ ...inputStyle, background: 'rgba(79, 140, 255, 0.1)', color: '#4f8cff', border: '1px solid #4f8cff', width: '50%' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const renderSearchForm = (handleSearch, searchUserId, setSearchUserId) => (
    <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', background: '#181f3a', padding: '1.5rem', borderRadius: '22px' }}>
        <input
            type="text"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="Enter User ID or UHID"
            style={inputStyle}
        />
        <button type="submit" style={{ ...inputStyle, background: '#4f8cff', color: '#fff', border: 'none', width: 'auto', cursor: 'pointer' }}>
            Search
        </button>
    </form>
);

const renderWallet = (name, value, uhid, onEdit, router) => {
    const isEditable = name !== 'lp';

    const handleView = () => {
        const params = new URLSearchParams({
            uhid: uhid,
            wallet: name.toUpperCase() // e.g., 'SWIFT', 'LP'
        });
        router.push(`/support/dashboard/ledger-rows?${params.toString()}`);
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0.75rem 1rem',
            border: '1px solid rgba(79, 140, 255, 0.2)',
            borderRadius: '12px',
            marginBottom: '0.5rem',
            background: 'rgba(79, 140, 255, 0.1)'
        }}>
            <div>
                <strong style={{ color: '#b3baff', textTransform: 'capitalize' }}>{name} Wallet</strong>
                <br />
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{value} USDT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={handleView} title={`View ${name.toUpperCase()} transactions`} style={{ background: 'none', border: 'none', color: '#4f8cff', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <FaEye />
                </button>
                {isEditable && (
                    <button onClick={() => onEdit(name)} style={{ background: '#4f8cff', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
};

const renderLimit = (name, limit) => (
    <div style={{
        padding: '1rem',
        border: '1px solid rgba(79, 140, 255, 0.2)',
        borderRadius: '12px',
        marginBottom: '0.5rem',
        background: 'rgba(79, 140, 255, 0.1)'
    }}>
        <strong style={{ color: '#4f8cff', textTransform: 'capitalize' }}>{name.replace('Limit', '')} Limit</strong>
        <div style={{ marginLeft: '1rem', marginTop: '0.5rem', color: '#b3baff' }}>
            <div><span style={{ color: '#8a9fca' }}>Cap:</span> {limit.cap} USDT</div>
            <div><span style={{ color: '#8a9fca' }}>Used:</span> {limit.used} USDT</div>
        </div>
    </div>
);

const renderRewardWallet = (name, value) => (
    <div style={{ 
        padding: '0.75rem 1rem',
        border: '1px solid rgba(79, 140, 255, 0.2)',
        borderRadius: '12px',
        marginBottom: '0.5rem',
        background: 'rgba(79, 140, 255, 0.1)'
    }}>
        <strong style={{ color: '#b3baff', textTransform: 'capitalize' }}>{name} Wallet</strong>
        <br />
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{value || '0.00'} USDT</span>
    </div>
);

const renderRankInfo = (rank, paidBonuses) => (
     <div style={{
        padding: '1rem',
        border: '1px solid rgba(79, 140, 255, 0.2)',
        borderRadius: '12px',
        marginBottom: '1rem',
        background: 'rgba(79, 140, 255, 0.1)'
    }}>
        <h3 style={{ color: '#4f8cff', marginBottom: '0.5rem' }}>Rank & Positioning</h3>
        <div style={{ marginLeft: '1rem', color: '#b3baff' }}>
            <div><span style={{ color: '#8a9fca' }}>Positioning Rank:</span> {rank || 'N/A'}</div>
            <div><span style={{ color: '#8a9fca' }}>Paid Rank Bonuses:</span> {paidBonuses && paidBonuses.length > 0 ? paidBonuses.join(', ') : 'None'}</div>
        </div>
    </div>
);

function UserLedger() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [ledger, setLedger] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [searchUserId, setSearchUserId] = useState('');

    const handleOpenEditModal = (field) => {
        setEditingField(field);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingField(null);
        setEditModalOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchUserId.trim()) {
            router.push(`/support/dashboard/user-ledger?userId=${searchUserId.trim()}`);
        }
    };

    const handleSaveChanges = async (field, value) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const response = await fetch(`${API_BASE_URL}/api/support/ledger`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, field, value })
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to update ledger');
        }
        setLedger(data.data);
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/sign-in');
            } else if (!['support', 'admin'].includes(user.userType)) {
                router.push('/sign-in');
            } else if (userId) {
                fetchLedger();
            } else {
                setLoading(false);
                // No user ID, so we don't set an error, just show the search form
            }
        }
    }, [user, authLoading, router, userId]);

    const fetchLedger = async () => {
        setLoading(true);
        setError(null);
        setLedger(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');
            const response = await fetch(`${API_BASE_URL}/api/support/ledger?userId=${userId}`, {
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
            if (!data.success) throw new Error(data.message || 'Failed to fetch ledger');
            setLedger(data.data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Authentication required') || err.message.includes('Unauthorized')) {
                router.push('/sign-in');
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading...</div>;
    }

    if (!user || !['support', 'admin'].includes(user.userType)) {
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Unauthorized access. Redirecting...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Error: {error}</div>;
    }

    if (!ledger) {
        // This case is for when there's a userId but no ledger was found
        return (
            <>
                {renderSearchForm(handleSearch, searchUserId, setSearchUserId)}
                <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>
                    User found, but no ledger data available.
                </div>
            </>
        );
    }
    
    // Helper for user details rendering
    const renderUserDetails = (data) => (
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(79, 140, 255, 0.2)', paddingBottom: '1rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ledger for {data.uhid}</h2>
            {data.firstLpDepositTs && <p style={{ color: '#b3baff' }}>First LP Deposit: {new Date(data.firstLpDepositTs).toLocaleString()}</p>}
        </div>
    );
    
    return (
        <>
            {renderSearchForm(handleSearch, searchUserId, setSearchUserId)}
            
            {ledger && (
                 <div style={{ background: '#181f3a', borderRadius: '22px', padding: '2rem', color: 'white', boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)' }}>
                    {renderUserDetails(ledger)}
                    {renderRankInfo(ledger.positioningRank, ledger.paidRankBonuses)}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ color: '#4f8cff', marginBottom: '1rem' }}>Main Wallets</h3>
                            {ledger.wallets && Object.entries(ledger.wallets)
                                .filter(([name]) => !['communityRewards', 'cascadeRewards', 'rankRewards'].includes(name))
                                .map(([name, value]) => renderWallet(name, value, ledger.uhid, handleOpenEditModal, router))}
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ color: '#4f8cff', marginBottom: '1rem' }}>Reward Wallets</h3>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                {renderRewardWallet('Community', ledger.wallets?.communityRewards)}
                                {renderRewardWallet('Cascade', ledger.wallets?.cascadeRewards)}
                                {renderRewardWallet('Rank', ledger.wallets?.rankRewards)}
                            </div>
                            <h3 style={{ color: '#4f8cff', marginBottom: '1rem', marginTop: '2rem' }}>Limits</h3>
                            {ledger.limits && Object.entries(ledger.limits).map(([name, value]) => renderLimit(name, value))}
                        </div>
                    </div>
                    <EditWalletModal
                        isOpen={isEditModalOpen}
                        onClose={handleCloseEditModal}
                        onSave={handleSaveChanges}
                        field={editingField}
                        currentValue={ledger.wallets?.[editingField] ?? ledger[editingField] ?? '0'}
                    />
                </div>
            )}
        </>
    );
}

export default function UserLedgerPage() {
    return (
        <Suspense fallback={<div>Loading Page...</div>}>
            <UserLedger />
        </Suspense>
    );
} 