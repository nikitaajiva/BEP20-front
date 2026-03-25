"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaEye, FaPlusSquare, FaMinusSquare } from 'react-icons/fa';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const tableHeaderStyle = { padding: '1rem', textAlign: 'left', color: '#4f8cff', cursor: 'pointer' };
const tableCellStyle = { padding: '1rem', borderBottom: '1px solid #2a3150' };

const UserRow = ({ user, level, onToggle, open, onFetch, router }) => {
    const handleToggle = () => {
        if (!open && !user.children) {
            onFetch(user.uhid);
        }
        onToggle(user.uhid);
    };

    const handleViewLedger = (userId) => {
        // Assuming the user object has a `_id` field.
        // The ledger page uses the MongoDB _id, not the uhid.
        router.push(`/support/dashboard/user-ledger?userId=${userId}`);
    };

    return (
        <>
            <tr style={{ backgroundColor: `rgba(79, 140, 255, ${0.05 * level})` }}>
                <td style={tableCellStyle}>
                    <div style={{ paddingLeft: `${level * 20}px`, display: 'flex', alignItems: 'center' }}>
                        {user.teamSize > 0 && (
                            <span onClick={handleToggle} style={{ cursor: 'pointer', marginRight: '10px' }}>
                                {open ? <FaMinusSquare /> : <FaPlusSquare />}
                            </span>
                        )}
                        {user.username}
                    </div>
                </td>
                <td style={tableCellStyle}>{user.uhid}</td>
                <td style={tableCellStyle}>{user.selfLp?.toFixed(2) || '0.00'}</td>
                <td style={tableCellStyle}>{user.teamLp?.toFixed(2) || '0.00'}</td>
                <td style={tableCellStyle}>{user.teamSize}</td>
                <td style={tableCellStyle}>{user.sponsorUsername}</td>
                <td style={tableCellStyle}>
                    {new Date(user.registrationTs).toLocaleDateString()}
                </td>
                <td style={tableCellStyle}>
                    <button 
                        onClick={() => handleViewLedger(user._id)}
                        style={{ background: 'none', border: 'none', color: '#4f8cff', cursor: 'pointer' }}
                        title="View User Ledger"
                    >
                        <FaEye />
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
    
    // Auth redirection logic
    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/sign-in');
        } else if (authUser && !['support', 'admin'].includes(authUser.userType)) {
            router.push('/dashboard'); // or some other appropriate page
        }
    }, [authUser, authLoading, router]);


    if (authLoading || loading) {
        return <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading...</div>;
    }
    if (error) {
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Error: {error}</div>;
    }

    return (
        <div style={{ background: '#181f3a', borderRadius: '22px', padding: '2rem', color: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Hierarchical Team View</h2>
            <div className="table-responsive" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Username</th>
                            <th style={tableHeaderStyle}>UHID</th>
                            <th style={tableHeaderStyle}>Self LP</th>
                            <th style={tableHeaderStyle}>Team LP</th>
                            <th style={tableHeaderStyle}>Team Size</th>
                            <th style={tableHeaderStyle}>Sponsor</th>
                            <th style={tableHeaderStyle}>Joined</th>
                            <th style={tableHeaderStyle}>Ledger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <UserRow
                                key={user.uhid}
                                user={user}
                                level={0}
                                onToggle={toggleNode}
                                open={user.open}
                                onFetch={fetchDescendants}
                                router={router}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 