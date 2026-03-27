"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Plus, Minus, User, Users, Wallet, Calendar, ShieldCheck, Network, Activity, Search } from 'lucide-react';
import styles from './team-view.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

/* ── Avatar Palette ── */
const PALETTE = [
  { bg: "rgba(255,215,0,0.15)", text: "#ffd700" },
  { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  { bg: "rgba(244,63,94,0.15)", text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)", text: "#06b6d4" },
];
const getAvatar = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];

// Helper to determine the left-border color class based on tree depth
const getLevelClass = (level) => {
  const cssLevel = Math.min(level, 5); // cap at 5 distinct colors
  return styles[`level-${cssLevel}`] || styles[`level-0`];
}

/* ════════════════════════════════════════════════════════
   RECURSIVE NODE COMPONENT (Tree Branch)
════════════════════════════════════════════════════════ */
const RecursiveNode = ({ user, level, onToggle, open, onFetch, router }) => {
    const handleToggle = () => {
        if (!open && !user.children) {
            onFetch(user.uhid);
        }
        onToggle(user.uhid);
    };

    const handleViewLedger = (userId) => {
        router.push(`/support/dashboard/user-ledger?userId=${userId}`);
    };

    const username = user.username || 'UNKNOWN';
    const init = username.slice(0, 2).toUpperCase();
    const ac = getAvatar(username);

    return (
        <div>
            {/* The Main Node Bar */}
            <div className={`${styles.nodeRow} ${open ? styles.nodeRowExpanded : ''} ${getLevelClass(level)}`}>
                
                {/* Expand / Collapse Button */}
                {user.teamSize > 0 ? (
                    <div className={`${styles.toggleWrap} ${open ? styles.toggleWrapActive : ''}`} onClick={handleToggle}>
                        {open ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                    </div>
                ) : (
                    <div className={styles.emptySpacer} />
                )}

                {/* Identity Box */}
                <div className={styles.identityBox}>
                    <div className={styles.nodeAvatar} style={{ background: ac.bg, color: ac.text }}>{init}</div>
                    <div>
                        <div className={styles.nodeUser}>{username}</div>
                        <div className={styles.nodeUhid}>{user.uhid || "NULL"}</div>
                        <div className={styles.nodeDirects}>
                            <Users size={10} style={{ opacity: 0.6 }} /> 
                            DIRECTS: <strong>{user.directUsers || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Horizontal Metrics Strip */}
                <div className={styles.metricsStrip}>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Self LP</span>
                        <span className={`${styles.metricVal} ${styles.valGold}`}>{user.selfLp?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Team LP</span>
                        <span className={`${styles.metricVal} ${styles.valBlue}`}>{user.teamLp?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Max Depth</span>
                        <span className={`${styles.metricVal} ${styles.valGreen}`}>{user.teamSize?.toLocaleString() || '0'}</span>
                    </div>
                    <div className={styles.metricBadge} style={{ minWidth: 120 }}>
                        <span className={styles.metricLabel}>Sponsor Identity</span>
                        <span className={styles.metricVal} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                            {user.sponsorUsername || 'Sovereign'}
                        </span>
                    </div>
                    <div className={styles.metricBadge} style={{ minWidth: 100 }}>
                        <span className={styles.metricLabel}>Node Synced</span>
                        <span className={styles.metricVal} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                            {new Date(user.registrationTs || Date.now()).toLocaleDateString("en-GB", { timeZone:"UTC" })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recursively Render Children (Inside the padded border box) */}
            {open && user.children && (
                <div className={styles.childrenWrap}>
                    {user.children.map(child => (
                        <RecursiveNode
                            key={child.uhid}
                            user={child}
                            level={level + 1}
                            onToggle={onToggle}
                            open={child.open}
                            onFetch={onFetch}
                            router={router}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


/* ════════════════════════════════════════════════════════
   MAIN TOPOLOGY PAGE
════════════════════════════════════════════════════════ */
export default function TeamViewPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Deep merge function to insert children into the appropriate parent UHID
    const updateUserState = (uhid, childrenResponse) => {
        setUsers(prevUsers => {
            const updateUserRecursively = (userList) => {
                return userList.map(u => {
                    if (u.uhid === uhid) {
                        return { ...u, children: childrenResponse.map(c => ({ ...c, open: false })), open: true };
                    }
                    if (u.children) {
                        return { ...u, children: updateUserRecursively(u.children) };
                    }
                    return u;
                });
            };
            return updateUserRecursively(prevUsers);
        });
    };

    const toggleNode = (uhid) => {
        setUsers(prevUsers => {
            const toggleUserRecursively = (userList) => {
                return userList.map(u => {
                    if (u.uhid === uhid) {
                        return { ...u, open: !u.open };
                    }
                    if (u.children) {
                        return { ...u, children: toggleUserRecursively(u.children) };
                    }
                    return u;
                });
            };
            return toggleUserRecursively(prevUsers);
        });
    };

    const getFilteredNodes = (nodeList) => {
        if (!searchQuery) return nodeList;
        return nodeList.filter(n => 
            (n.username || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
            (n.uhid || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const generateDummyTopLevel = () => {
        return Array.from({ length: 4 }).map((_, i) => ({
            _id: `top_${i}`,
            uhid: `U100${i}X${Math.floor(Math.random()*900)}`,
            username: `GenesisNode${i + 1}`,
            directUsers: Math.floor(Math.random() * 5) + 2,
            teamSize: Math.floor(Math.random() * 50) + 10,
            selfLp: Math.random() * 1000 + 500,
            teamLp: Math.random() * 5000 + 1000,
            sponsorUsername: 'SYSTEM',
            registrationTs: new Date(Date.now() - (i*10000000)).toISOString()
        }));
    };
    
    const generateDummyChildren = (parentUhid) => {
        const numChildren = Math.floor(Math.random() * 3) + 1;
        return Array.from({ length: numChildren }).map((_, i) => ({
            _id: `child_${parentUhid}_${i}`,
            uhid: `${parentUhid.substring(0,4)}Y${Math.floor(Math.random()*900)}`,
            username: `SubNode-${parentUhid.substring(5,7)}-${i+1}`,
            directUsers: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
            teamSize: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : 0,
            selfLp: Math.random() * 500 + 100,
            teamLp: Math.random() * 800,
            sponsorUsername: parentUhid, // Fake sponsor mapping
            registrationTs: new Date().toISOString()
        }));
    };

    // Fetch individual descendants node
    const fetchDescendants = useCallback((uhid) => {
        setLoading(true);
        setTimeout(() => {
            updateUserState(uhid, generateDummyChildren(uhid));
            setLoading(false);
        }, 400);
    }, []);

    // Initial Load
    useEffect(() => {
        if (authUser && ['support', 'admin'].includes(authUser.userType)) {
            setLoading(true);
            setTimeout(() => {
                setUsers(generateDummyTopLevel().map(u => ({ ...u, open: false })));
                setLoading(false);
            }, 500);
        }
    }, [authUser]);
    
    // Auth Guards
    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login');
        } else if (authUser && !['support', 'admin'].includes(authUser.userType)) {
            router.push('/dashboard');
        }
    }, [authUser, authLoading, router]);

    if (authLoading) {
        return (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
                <div style={{ width:36, height:36, border:'3px solid rgba(255,215,0,0.15)', borderTop:'3px solid #ffd700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:800, letterSpacing:2 }}>ESTABLISHING REGISTRY LINK...</div>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (error && users.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <ShieldCheck size={40} color="#f43f5e" />
                    <div style={{ color: '#f43f5e', fontWeight: 900, fontSize: 18 }}>Topology Link Failed</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div style={{ flex: 1 }}>
                    <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
                    <h1 className={styles.title}>System <span>Topology Trace</span></h1>
                </div>

                <div className={styles.searchContainer}>
                    <Search size={16} className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Search by Username or UHID..." 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.statsBadge}>
                    <Network size={14} className={styles.statsBadgeIcon} />
                    <span className={styles.statsBadgeText}>Genesis Nodes: <strong>{users.length}</strong></span>
                </div>
            </header>

            {/* ── TREE WRAPPER ── */}
            <div className={styles.treeWrapper}>
                {loading && users.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Activity size={30} color="rgba(255,215,0,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
                        <div className={styles.emptyText}>Mapping Network Topology...</div>
                    </div>
                ) : users.length > 0 ? (
                    <div>
                        {getFilteredNodes(users).map(user => (
                            <RecursiveNode
                                key={user.uhid}
                                user={user}
                                level={0}
                                onToggle={toggleNode}
                                open={user.open}
                                onFetch={fetchDescendants}
                                router={router}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Users className={styles.emptyIcon} />
                        <div className={styles.emptyText}>Network graph is empty</div>
                    </div>
                )}
            </div>
        </div>
    );
}
