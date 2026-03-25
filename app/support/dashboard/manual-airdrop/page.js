"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid rgba(79, 140, 255, 0.2)',
    background: 'rgba(79, 140, 255, 0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    marginBottom: '1rem'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#b3baff',
    fontSize: '0.9rem'
};

export default function ManualAirdropPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [targetUserId, setTargetUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [narrative, setNarrative] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`${API_BASE_URL}/api/support/manual-airdrop`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: targetUserId, amount, narrative })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to grant airdrop');
            }
            setSuccess(`Successfully credited ${amount} USDT to user ${targetUserId}.`);
            setTargetUserId('');
            setAmount('');
            setNarrative('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div style={{ textAlign: 'center', color: '#b3baff', padding: '2rem' }}>Loading authentication...</div>;
    }

    if (!user || !['support', 'admin'].includes(user.userType)) {
        router.push('/sign-in');
        return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '2rem' }}>Unauthorized. Redirecting...</div>;
    }

    return (
        <div style={{ background: '#181f3a', borderRadius: '22px', padding: '2rem', color: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Manual Airdrop Credit</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label style={labelStyle}>User ID (UHID or _id)</label>
                    <input type="text" value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="Enter User ID" style={inputStyle} required />
                </div>
                <div>
                    <label style={labelStyle}>Airdrop Amount</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter airdrop amount" style={inputStyle} required />
                </div>
                <div>
                    <label style={labelStyle}>Narrative</label>
                    <input type="text" value={narrative} onChange={e => setNarrative(e.target.value)} placeholder="Reason for airdrop (e.g., Manual correction)" style={inputStyle} required />
                </div>
                <button type="submit" disabled={loading} style={{
                    background: '#4f8cff',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    opacity: loading ? 0.5 : 1
                }}>
                    {loading ? 'Submitting...' : 'Grant Airdrop'}
                </button>
                {error && <div style={{ color: '#ff4d4d', marginTop: '1rem' }}>Error: {error}</div>}
                {success && <div style={{ color: '#28a745', marginTop: '1rem' }}>{success}</div>}
            </form>
        </div>
    );
} 
