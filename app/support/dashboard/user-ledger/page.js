"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet, ShieldCheck, Trophy, BarChart3, Search, RotateCcw, ChevronRight, Eye, Diamond, TriangleAlert, Cpu, Activity } from 'lucide-react';
import styles from './user-ledger.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

function EditWalletModal({ isOpen, onClose, onSave, field, currentValue }) {
    const [value, setValue] = useState(currentValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setValue(currentValue);
            setError(null);
        }
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
                <h3 className={styles.modalTitle}>Refactor {field} Node</h3>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Target USDT Volume</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="0.00"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '16px', paddingLeft: 16 }}
                    />
                    {error && <p style={{ color: "#f43f5e", fontSize: '12px', fontWeight: 800, marginBottom: 12 }}>{error}</p>}
                    <div className={styles.modalBtnGroup}>
                        <button type="button" onClick={onClose} className={styles.btnSecondary}>Abort</button>
                        <button type="submit" disabled={loading} className={styles.btnPrimary}>
                            {loading ? "Committing..." : "Commit Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const SearchForm = ({ handleSearch, searchUserId, setSearchUserId, loading }) => (
    <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
                type="text"
                className={styles.inputField}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                placeholder="Synchronize with User Object ID or UHID..."
            />
        </div>
        <button type="submit" disabled={loading} className={styles.searchBtn}>
            {loading ? <Cpu size={16} style={{animation:'spin 1s linear infinite'}} /> : "Verify Identity"}
        </button>
    </form>
);

const WalletCard = ({ name, value, uhid, onEdit, router, isReward = false }) => {
    const isEditable = !isReward && name !== 'lp';

    const handleView = () => {
        const params = new URLSearchParams({ uhid: uhid, wallet: name.toUpperCase() });
        router.push(`/support/dashboard/ledger-rows?${params.toString()}`);
    };

    return (
        <div className={`${styles.walletCard} ${isReward ? styles.rewardCard : ''}`}>
            <div className={styles.walletInfo}>
                <span className={styles.walletName}>{name.replace('Rewards', '')} {isReward ? 'Yield' : 'Balance'}</span>
                <div className={styles.walletValue}>
                    {parseFloat(value || 0).toFixed(2)}
                    <span className={styles.walletUnit}>USDT</span>
                </div>
            </div>
            <div className={styles.walletActions}>
                {isEditable && (
                    <button onClick={() => onEdit(name)} className={styles.actionBtn}>
                        Refactor
                    </button>
                )}
                <button onClick={handleView} className={styles.iconBtn} title={`Audit ${name.toUpperCase()} Stream`}>
                    <Eye size={16} />
                </button>
            </div>
        </div>
    );
};

const LimitSegment = ({ name, limit }) => {
    const cap = parseFloat(limit?.cap || 0);
    const used = parseFloat(limit?.used || 0);
    const percentage = cap > 0 ? (used / cap) * 100 : 0;
    
    // Smooth gradient based on utilization
    let bgColor = 'linear-gradient(90deg, #10b981 0%, #10b981 100%)';
    if (percentage > 50) bgColor = 'linear-gradient(90deg, #10b981 0%, #ffd700 100%)';
    if (percentage > 85) bgColor = 'linear-gradient(90deg, #ffd700 0%, #f43f5e 100%)';

    return (
        <div className={styles.limitCard}>
            <div className={styles.limitHeader}>
                <span className={styles.limitLabel}>{name.replace(/^([a-z])([a-z]+)Limit$/i, (_, first, rest) => first.toUpperCase() + rest + " Quota").replace('two', '2').replace('three','3').replace('four','4').replace('five','5')}</span>
                <span className={styles.limitStats}>
                    <strong>{used.toLocaleString()}</strong> / {cap.toLocaleString()}
                    <span>USDT</span>
                </span>
            </div>
            <div className={styles.limitBarBg}>
                <div className={styles.limitBarFill} style={{ width: `${Math.min(percentage, 100)}%`, background: bgColor }} />
            </div>
        </div>
    );
};

const RankBadge = ({ label, value, icon: Icon, color = "#ffd700" }) => (
    <div className={styles.rankBadge}>
        <div className={styles.rankIconWrap} style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
            <Icon size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.rankLabel}>{label}</span>
            <span className={styles.rankVal}>{value || 'NONE'}</span>
        </div>
    </div>
);


/* ════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════ */
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

    const handleOpenEditModal = (field) => { setEditingField(field); setEditModalOpen(true); };
    const handleCloseEditModal = () => { setEditingField(null); setEditModalOpen(false); };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchUserId.trim()) {
            router.push(`/support/dashboard/user-ledger?userId=${searchUserId.trim()}`);
        }
    };

    const handleSaveChanges = async (field, value) => {
        // Optimistic dummy update for local preview
        return new Promise((resolve) => {
            setTimeout(() => {
                setLedger(prev => {
                    const newLedger = { ...prev };
                    if (newLedger.wallets && newLedger.wallets[field] !== undefined) {
                        newLedger.wallets[field] = parseFloat(value).toFixed(2);
                    } else {
                        newLedger[field] = parseFloat(value).toFixed(2);
                    }
                    return newLedger;
                });
                resolve();
            }, 600);
        });
    };

    const fetchLedger = async () => {
        setLoading(true); setError(null); setLedger(null);
        try {
            // --- DUMMY DATA FOR PREVIEW INSTED OF API DUMP ---
            setTimeout(() => {
                const dummyLedger = {
                    uhid: userId || `U300X${Math.floor(Math.random()*900)}`,
                    positioningRank: ["Novice", "Silver", "Gold", "Diamond"][Math.floor(Math.random()*4)],
                    wallets: {
                        external: (Math.random() * 500).toFixed(2),
                        swift: (Math.random() * 1000).toFixed(2),
                        lp: (Math.random() * 200).toFixed(2),
                        boost: (Math.random() * 50).toFixed(2),
                        xaman: (Math.random() * 1500).toFixed(2),
                        communityRewards: (Math.random() * 300).toFixed(2),
                        cascadeRewards: (Math.random() * 120).toFixed(2),
                        rankRewards: (Math.random() * 500).toFixed(2),
                    },
                    limits: {
                        twoXLimit: { cap: 1000, used: Math.floor(Math.random() * 1000) },
                        threeXLimit: { cap: 1500, used: Math.floor(Math.random() * 1000) },
                        fourXLimit: { cap: 2000, used: Math.floor(Math.random() * 500) },
                        fiveXLimit: { cap: 2500, used: 0 },
                    }
                };
                setLedger(dummyLedger);
                setLoading(false);
            }, 600);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/sign-in');
            else if (!['support', 'admin'].includes(user.userType)) router.push('/sign-in');
            else fetchLedger(); // ALWAYS fetch ledger to show dummy data on blank load
        }
    }, [user, authLoading, router, userId]);

    if (authLoading) {
        return (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
                <div style={{ width:36, height:36, border:'3px solid rgba(255,215,0,0.15)', borderTop:'3px solid #ffd700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:800, letterSpacing:2 }}>ESTABLISHING REGISTRY LINK...</div>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div>
                    <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
                    <h1 className={styles.title}>Finance <span>Audit Terminal</span></h1>
                </div>
                {ledger && (
                    <div className={styles.identityBadge}>
                        <span className={styles.identityLabel}>Target Registry Node</span>
                        <span className={styles.identityUhid}>{ledger.uhid}</span>
                    </div>
                )}
            </header>

            {/* ── SEARCH ── */}
            <SearchForm handleSearch={handleSearch} searchUserId={searchUserId} setSearchUserId={setSearchUserId} loading={loading} />
            
            {error && (
                <div className={styles.errorBanner}>
                    <TriangleAlert size={16} /> {error}
                </div>
            )}

            {loading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'30vh', flexDirection:'column', gap:14 }}>
                    <Activity size={28} color="rgba(255,215,0,0.4)" style={{ animation:'spin 1s linear infinite' }} />
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:900, letterSpacing:2 }}>DECRYPTING DATA CORE...</div>
                </div>
            ) : ledger ? (
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                    
                    {/* ── STRIP ── */}
                    <div className={styles.rankInfo}>
                        <RankBadge label="Sovereign Protocol" value={ledger.positioningRank} icon={Diamond} color="#10b981" />
                        <RankBadge label="Identity Vector" value="Verified Core" icon={ShieldCheck} color="#3b82f6" />
                    </div>

                    {/* ── BENTO GRID ── */}
                    <div className={styles.ledgerGrid}>
                        
                        {/* LEFT COL: Core Assets & Liquid */}
                        <div style={{ display:'flex', flexDirection:'column', gap: 24 }}>
                            <section className={styles.sectionBox}>
                                <h3 className={styles.sectionTitle}><Wallet size={16} /> Asset Repositories</h3>
                                {ledger.wallets && Object.entries(ledger.wallets)
                                    .filter(([name]) => !['communityRewards', 'cascadeRewards', 'rankRewards'].includes(name))
                                    .map(([name, value]) => (
                                        <WalletCard key={name} name={name} value={value} uhid={ledger.uhid} onEdit={handleOpenEditModal} router={router} />
                                    ))}
                            </section>
                        </div>

                        {/* RIGHT COL: Protocol Rewards & Limit Traces */}
                        <div style={{ display:'flex', flexDirection:'column', gap: 24 }}>
                            <section className={`${styles.sectionBox} ${styles.sectionBoxAlt}`}>
                                <h3 className={styles.sectionTitle}><Trophy size={16} /> Yield Protocol</h3>
                                <div>
                                    <WalletCard name="Community" value={ledger.wallets?.communityRewards} uhid={ledger.uhid} isReward router={router} />
                                    <WalletCard name="Cascade" value={ledger.wallets?.cascadeRewards} uhid={ledger.uhid} isReward router={router} />
                                    <WalletCard name="Rank" value={ledger.wallets?.rankRewards} uhid={ledger.uhid} isReward router={router} />
                                </div>
                            </section>

                            <section className={styles.sectionBox}>
                                <h3 className={styles.sectionTitle}><BarChart3 size={16} /> Execution Quotas</h3>
                                {ledger.limits && Object.entries(ledger.limits).map(([name, value]) => (
                                    <LimitSegment key={name} name={name} limit={value} />
                                ))}
                            </section>
                        </div>
                    </div>

                    {/* Editor Modal */}
                    <EditWalletModal
                        isOpen={isEditModalOpen}
                        onClose={handleCloseEditModal}
                        onSave={handleSaveChanges}
                        field={editingField}
                        currentValue={ledger.wallets?.[editingField] ?? ledger[editingField] ?? '0'}
                    />
                    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
                </div>
            ) : userId && !loading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'30vh', background:'rgba(255,255,255,0.02)', borderRadius: 24, border:'1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 13, textTransform:'uppercase', letterSpacing:2 }}>Registry Node Destroyed or Invalid</p>
                </div>
            ) : null}
        </div>
    );
}

export default function UserLedgerPage() {
    return (
        <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'rgba(255,215,0,0.4)', fontWeight:900, letterSpacing:2, fontSize:12 }}>INITIALIZING TERMINAL...</div>}>
            <UserLedger />
        </Suspense>
    );
}
