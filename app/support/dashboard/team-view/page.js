"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaEye } from 'react-icons/fa';
import { ChevronRight, ChevronDown, PlusCircle, MinusCircle, User, Users, Wallet, Calendar, Search, Eye, Radio, Network } from 'lucide-react';
import styles from './team-view.module.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const UserRow = ({ user, level, onToggle, open, onFetch, router }) => {
    const handleToggle = () => {
        if (!open && !user.children) {
            onFetch(user.uhid);
        }
        onToggle(user.uhid);
    };

    const handleViewLedger = (userId) => {
        router.push(`/support/dashboard/user-ledger?userId=${userId}`);
    };

    const indentStyle = { paddingLeft: `${level * 28}px` };

    return (
        <>
            <tr className={styles.row}>
                <td style={indentStyle}>
                    <div className={styles.usernameCell}>
                        {user.teamSize > 0 ? (
                            <span onClick={handleToggle} className={styles.toggleIcon}>
                                {open ? <MinusCircle size={18} fill="rgba(255,215,0,0.1)" /> : <PlusCircle size={18} fill="rgba(255,215,0,0.1)" />}
                            </span>
                        ) : (
                            <div style={{ width: '18px', height: '18px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: level === 0 ? 800 : 600, color: level === 0 ? '#ffd700' : '#fff', fontSize: '15px' }}>{user.username}</span>
                    </div>
                </td>
                <td><span style={{ fontSize: '12px', fontWeight: 900, color: '#888', letterSpacing: '0.5px' }}>{user.uhid}</span></td>
                <td><span className={`${styles.badge} ${styles.lpBadge}`}>{user.selfLp?.toFixed(2) || '0.00'}</span></td>
                <td><span className={`${styles.badge} ${styles.teamBadge}`}>{user.teamLp?.toFixed(2) || '0.00'}</span></td>
                <td><span className={`${styles.badge} ${styles.sizeBadge}`}>{user.teamSize}</span></td>
                <td><span style={{ fontSize: '13px', opacity: 0.6, fontWeight: 700 }}>{user.sponsorUsername || 'Sovereign'}</span></td>
                <td><span style={{ fontSize: '12px', color: '#555', fontWeight: 800 }}>{new Date(user.registrationTs).toLocaleDateString()}</span></td>
                <td>
                    <button 
                        onClick={() => handleViewLedger(user._id)}
                        className={styles.auditBtn}
                        title="Audit Registry"
                    >
                        <Eye size={14} /> Audit
                    </button>
                </td>
            </tr>
            {open && user.children && user.children.map(child => (
                <UserRow
                    key={child.uhid}
                    user={child}
                    level={level + 1}
                    onToggle={onToggle}
                    open={child.open}
                    onFetch={child.children ? undefined : onFetch} // only pass down if we can fetch more
                    onFetchMore={onFetch}
                    router={router}
                />
            ))}
        </>
    );
};

// Fixed UserRow recursion: ensure onFetch is always available
const RecursiveRow = ({ user, level, onToggle, open, onFetch, router }) => {
    const handleToggle = () => {
        if (!open && !user.children) {
            onFetch(user.uhid);
        }
        onToggle(user.uhid);
    };

    const handleViewLedger = (userId) => {
        router.push(`/support/dashboard/user-ledger?userId=${userId}`);
    };

    const indentStyle = { paddingLeft: `${level * 28}px` };

    return (
        <>
            <tr className={styles.row}>
                <td style={indentStyle}>
                    <div className={styles.usernameCell}>
                        {user.teamSize > 0 ? (
                            <span onClick={handleToggle} className={styles.toggleIcon}>
                                {open ? <MinusCircle size={18} fill="rgba(255,215,0,0.1)" /> : <PlusCircle size={18} fill="rgba(255,215,0,0.1)" />}
                            </span>
                        ) : (
                            <div style={{ width: '18px', height: '18px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: level === 0 ? 800 : 600, color: level === 0 ? '#ffd700' : '#fff', fontSize: '15px' }}>{user.username}</span>
                    </div>
                </td>
                <td><span style={{ fontSize: '12px', fontWeight: 900, color: '#888', letterSpacing: '0.5px' }}>{user.uhid}</span></td>
                <td><span className={`${styles.badge} ${styles.lpBadge}`}>{user.selfLp?.toFixed(2) || '0.00'}</span></td>
                <td><span className={`${styles.badge} ${styles.teamBadge}`}>{user.teamLp?.toFixed(2) || '0.00'}</span></td>
                <td><span className={`${styles.badge} ${styles.sizeBadge}`}>{user.teamSize}</span></td>
                <td><span style={{ fontSize: '13px', opacity: 0.6, fontWeight: 700 }}>{user.sponsorUsername || 'Sovereign'}</span></td>
                <td><span style={{ fontSize: '12px', color: '#555', fontWeight: 800 }}>{new Date(user.registrationTs).toLocaleDateString()}</span></td>
                <td>
                    <button 
                        onClick={() => handleViewLedger(user._id)}
                        className={styles.auditBtn}
                        title="Audit Registry"
                    >
                        <Eye size={14} /> Audit
                    </button>
                </td>
            </tr>
            {open && user.children && user.children.map(child => (
                <RecursiveRow
                    key={child.uhid}
                    user={child}
                    level={level + 1}
                    onToggle={onToggle}
                    open={child.open}
                    onFetch={onFetch}
                    router={router}
                />
            ))}
        </>
    );
};

export default function TeamViewPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateUserState = (uhid, children) => {
        setUsers(prevUsers => {
            const updateUserRecursively = (userList) => {
                return userList.map(u => {
                    if (u.uhid === uhid) {
                        return { ...u, children: children.map(c => ({ ...c, open: false })), open: true };
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

    const fetchDescendants = useCallback(async (uhid) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/support/hierarchy/descendants/${uhid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch descendants');
            updateUserState(uhid, data.descendants);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authUser && ['support', 'admin'].includes(authUser.userType)) {
            setLoading(true);
            const token = localStorage.getItem('token');
            fetch(`${API_BASE_URL}/api/support/hierarchy/top-level`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.data.map(u => ({ ...u, open: false })));
                } else {
                    throw new Error(data.message || 'Failed to fetch top-level users');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
        }
    }, [authUser]);
    
    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/sign-in');
        } else if (authUser && !['support', 'admin'].includes(authUser.userType)) {
            router.push('/dashboard');
        }
    }, [authUser, authLoading, router]);

    if (authLoading || loading) {
        return <div className="text-center p-20 text-gold-500 animate-pulse">Synchronizing Topology Segments...</div>;
    }

    if (error) {
        return (
            <div className="text-center p-20 bg-red-500/10 text-red-500 rounded-3xl m-8">
                <Radio size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-black mb-2">Registry Connection Failed</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className="mb-0">
                <h1 className={styles.title}>System <span>Topology Terminal</span></h1>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        <Network size={14} color="#ffd700" /> Authorized Nodes Count: <strong>{users.length}</strong>
                    </div>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Administrative ID</th>
                            <th>Identity UHID</th>
                            <th>Self LP</th>
                            <th>Team LP</th>
                            <th>Cohort</th>
                            <th>Sponsor</th>
                            <th>Synced On</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <RecursiveRow
                                    key={user.uhid}
                                    user={user}
                                    level={0}
                                    onToggle={toggleNode}
                                    open={user.open}
                                    onFetch={fetchDescendants}
                                    router={router}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '100px', color: '#555', fontStyle: 'italic' }}>
                                    No network topology traced in the current registry segment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}