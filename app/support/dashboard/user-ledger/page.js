"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaWallet, FaShieldAlt, FaTrophy, FaChartBar, FaSearch, FaTimes } from 'react-icons/fa';
import { Wallet, ShieldCheck, Trophy, BarChart3, Search, RotateCcw, ChevronRight, Eye } from 'lucide-react';
import styles from './user-ledger.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Update {field} Wallet</h3>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 800, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Amount in USDT</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="0.00"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '15px' }}
                    />
                    {error && <p style={{ color: "#ff4d4d", fontSize: '12px' }}>{error}</p>}
                    <div className={styles.modalBtnGroup}>
                        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
                        <button type="submit" disabled={loading} className={styles.btnPrimary}>
                            {loading ? "Decrypting..." : "Commit Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const SearchForm = ({ handleSearch, searchUserId, setSearchUserId, loading }) => (
    <form onSubmit={handleSearch} className={styles.searchForm}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', color: '#ffd700' }} />
            <input
                type="text"
                className={styles.inputField}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                placeholder="Synchronize with User Hub (Enter ID or UHID)..."
                style={{ paddingLeft: '45px' }}
            />
        </div>
        <button type="submit" disabled={loading} className={styles.searchBtn}>
            {loading ? <RotateCcw size={20} className="animate-spin" /> : "Verify Identity"}
        </button>
    </form>
);

const WalletCard = ({ name, value, uhid, onEdit, router, isReward = false }) => {
    const isEditable = !isReward && name !== 'lp';

    const handleView = () => {
        const params = new URLSearchParams({
            uhid: uhid,
            wallet: name.toUpperCase()
        });
        router.push(`/support/dashboard/ledger-rows?${params.toString()}`);
    };

    return (
        <div className={styles.walletCard}>
            <div className="flex flex-col">
                <span className={styles.walletName}>{name.replace('Rewards', '')} {isReward ? 'Reward' : ''} Balance</span>
                <div className="flex items-baseline">
                    <span className={styles.walletValue}>{value || '0.00'}</span>
                    <span className={styles.walletUnit}>USDT</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleView} className={styles.iconBtn} title={`Audit ${name.toUpperCase()} Stream`}>
                    <Eye size={18} />
                </button>
                {isEditable && (
                    <button onClick={() => onEdit(name)} className={styles.actionBtn}>
                        Refactor
                    </button>
                )}
            </div>
        </div>
    );
};

const LimitSegment = ({ name, limit }) => {
    const cap = parseFloat(limit?.cap || 0);
    const used = parseFloat(limit?.used || 0);
    const percentage = cap > 0 ? (used / cap) * 100 : 0;

    return (
        <div className={styles.limitCard}>
            <div className={styles.limitHeader}>
                <span className={styles.limitLabel}>{name.replace('Limit', '')} Quota</span>
                <span className={styles.limitStats}>{used} / {cap} <span style={{ color: '#ffd700' }}>USDT</span></span>
            </div>
            <div className={styles.limitBarBg}>
                <div className={styles.limitBarFill} style={{ width: `${Math.min(percentage, 100)}%`, background: percentage > 80 ? '#ff4d4d' : 'linear-gradient(90deg, #ffd700, #ffa500)' }} />
            </div>
        </div>
    );
};

const RankBadge = ({ label, value, icon: Icon }) => (
    <div className={styles.rankBadge}>
        <div className="flex items-center gap-4">
            <div style={{ background: 'rgba(255,215,0,0.1)', padding: '12px', borderRadius: '12px' }}>
                <Icon size={24} color="#ffd700" />
            </div>
            <div className="flex flex-col">
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{value || 'None'}</span>
            </div>
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
            if (err.message.includes('Authentication required')) {
                router.push('/sign-in');
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="text-center p-20 text-gold-500 animate-pulse">Decrypting Ledger Segment...</div>;
    }

    return (
        <div className={styles.container}>
            <header className="flex justify-between items-center mb-8">
                <h1 className={styles.title}>Finance <span>Audit Terminal</span></h1>
                {ledger && (
                    <div className="flex flex-col items-end">
                        <span style={{ fontSize: '12px', color: '#888', fontWeight: 800 }}>IDENTITY VERIFIED</span>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffd700' }}>{ledger.uhid}</span>
                    </div>
                )}
            </header>

            <SearchForm 
                handleSearch={handleSearch} 
                searchUserId={searchUserId} 
                setSearchUserId={setSearchUserId} 
                loading={loading}
            />
            
            {error && (
                <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <FaTimes /> {error}
                </div>
            )}

            {ledger ? (
                <div className="animate-in fade-in duration-500">
                    <div className={styles.rankInfo}>
                        <RankBadge label="Sovereign Rank" value={ledger.positioningRank} icon={Trophy} />
                        <RankBadge label="Identity Status" value="Authorized" icon={ShieldCheck} />
                    </div>

                    <div className={styles.ledgerGrid}>
                        {/* Main Wallets */}
                        <section className={styles.sectionBox}>
                            <h3 className={styles.sectionTitle}><Wallet size={18} /> Asset Repositories</h3>
                            {ledger.wallets && Object.entries(ledger.wallets)
                                .filter(([name]) => !['communityRewards', 'cascadeRewards', 'rankRewards'].includes(name))
                                .map(([name, value]) => (
                                    <WalletCard key={name} name={name} value={value} uhid={ledger.uhid} onEdit={handleOpenEditModal} router={router} />
                                ))}
                        </section>

                        {/* Reward Wallets & Limits */}
                        <div className="flex flex-col gap-6">
                            <section className={styles.sectionBox}>
                                <h3 className={styles.sectionTitle}><Trophy size={18} /> Rewards Protocol</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    <WalletCard name="Community" value={ledger.wallets?.communityRewards} uhid={ledger.uhid} isReward router={router} />
                                    <WalletCard name="Cascade" value={ledger.wallets?.cascadeRewards} uhid={ledger.uhid} isReward router={router} />
                                    <WalletCard name="Rank" value={ledger.wallets?.rankRewards} uhid={ledger.uhid} isReward router={router} />
                                </div>
                            </section>

                            <section className={styles.sectionBox}>
                                <h3 className={styles.sectionTitle}><BarChart3 size={18} /> Transaction Quotas</h3>
                                {ledger.limits && Object.entries(ledger.limits).map(([name, value]) => (
                                    <LimitSegment key={name} name={name} limit={value} />
                                ))}
                            </section>
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
            ) : userId && !loading ? (
                <div className="text-center p-20 bg-white/5 rounded-3xl border border-white/5">
                    <p style={{ color: '#888', fontWeight: 700 }}>Segment found, but registry trace is empty.</p>
                </div>
            ) : null}
        </div>
    );
}

export default function UserLedgerPage() {
    return (
        <Suspense fallback={<div className="text-center p-20 text-gold-500">Initializing Terminal...</div>}>
            <UserLedger />
        </Suspense>
    );
}
