"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Plus, Minus, User, Users, Wallet, Calendar, ShieldCheck, Network, Activity } from 'lucide-react';
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
        // Fetch children if the branch is being opened and we don't have them yet
        if (!open && (!user.children || user.children.length === 0)) {
            onFetch(user.uhid);
        }
        onToggle(user.uhid);
    };

    const username = user.username || 'UNKNOWN';
    const init = username.slice(0, 2).toUpperCase();
    const ac = getAvatar(username);

    // Safe Numeric Formatting
    const fmt = (val) => (Number(val) || 0).toFixed(2);
    const fmtInt = (val) => (Number(val) || 0).toLocaleString();

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
                    </div>
                </div>

                {/* Horizontal Metrics Strip */}
                <div className={styles.metricsStrip}>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Self LP</span>
                        <span className={`${styles.metricVal} ${styles.valGold}`}>{fmt(user.selfLp)}</span>
                    </div>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Team LP</span>
                        <span className={`${styles.metricVal} ${styles.valBlue}`}>{fmt(user.teamLp)}</span>
                    </div>
                    <div className={styles.metricBadge}>
                        <span className={styles.metricLabel}>Network Size</span>
                        <span className={`${styles.metricVal} ${styles.valGreen}`}>{fmtInt(user.teamSize)}</span>
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

                {/* Audit Action */}
                <button className={styles.btnAudit} onClick={() => router.push(`/admin/dashboard/user-ledger?userId=${user._id}`)}>
                    <ShieldCheck size={12} strokeWidth={3} /> Audit Log
                </button>
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

    // Deep merge function to insert children into the appropriate parent UHID
    const updateUserState = (uhid, childrenResponse) => {
        // Extract the best candidate for an array from the response
        let rawList = [];
        if (Array.isArray(childrenResponse)) {
            rawList = childrenResponse;
        } else if (childrenResponse && typeof childrenResponse === 'object') {
            rawList = childrenResponse.users || childrenResponse.descendants || childrenResponse.data || [];
        }
        
        const safeChildren = Array.isArray(rawList) ? rawList : [];
        

        setUsers(prevUsers => {
            const updateUserRecursively = (userList) => {
                const list = Array.isArray(userList) ? userList : [];
                return list.map(u => {
                    if (String(u.uhid) === String(uhid)) {
                        
                        return { ...u, children: safeChildren.map(c => ({ ...c, open: false })), open: true };
                    }
                    if (Array.isArray(u.children) && u.children.length > 0) {
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
                const list = Array.isArray(userList) ? userList : [];
                return list.map(u => {
                    // Normalize to string to avoid type mismatch
                    if (String(u.uhid) === String(uhid)) {
                        return { ...u, open: !u.open };
                    }
                    if (Array.isArray(u.children) && u.children.length > 0) {
                        return { ...u, children: toggleUserRecursively(u.children) };
                    }
                    return u;
                });
            };
            return toggleUserRecursively(prevUsers);
        });
    };

    // Fetch root-level nodes
    const fetchRootNodes = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");
            const res = await fetch(`${API_BASE_URL}/api/support/hierarchy/top-level`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resData = await res.json();
            if (!res.ok || !resData.success) throw new Error(resData.message || "Failed to fetch top-level nodes");
            
            // Flexibly find the array (in .data, .users, or the root object itself)
            let safeUsers = [];
            if (Array.isArray(resData.data)) safeUsers = resData.data;
            else if (Array.isArray(resData.users)) safeUsers = resData.users;
            else if (Array.isArray(resData)) safeUsers = resData;
            
            setUsers(safeUsers.map(u => ({ ...u, open: false })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch individual descendants node
    const fetchDescendants = useCallback(async (uhid) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");
            const res = await fetch(`${API_BASE_URL}/api/support/hierarchy/descendants/${uhid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resData = await res.json();
            if (!res.ok || !resData.success) throw new Error(resData.message || "Failed to fetch children");
            // Pass the whole object so updateUserState can find 'descendants' key
            updateUserState(uhid, resData);
        } catch (err) {
            console.error("Descendant fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        if (authUser && ['support', 'admin'].includes(authUser.userType)) {
            fetchRootNodes();
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
                <div>
                    <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
                    <h1 className={styles.title}>System <span>Topology Trace</span></h1>
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
                        {users.map(user => (
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
