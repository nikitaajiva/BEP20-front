'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardNavbar from '@/components/DashboardNavbar';

export default function DirectReferrals() {
  const { user, API_URL, logout } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/referrals/direct-children`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setReferrals(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch referrals');
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError(err.message || 'An error occurred while fetching referrals');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [user, API_URL]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Loading Direct Referrals...
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4" style={{ borderRadius: 22, boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)', background: '#181f3a' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>Direct Referrals</h4>
          </div>

          {error && (
            <div className="alert alert-danger" style={{backgroundColor: '#450A0A', color: '#F9DADA', border: '1px solid #7F1D1D'}}>{error}</div>
          )}

          {!loading && !error && referrals.length === 0 && (
            <p className="text-center mt-3" style={{ color: '#b3baff' }}>No direct referrals found.</p>
          )}

          {!loading && !error && referrals.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <thead style={{ color: '#b3baff', borderBottom: '2px solid #2a3150' }}>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Level</th>
                    <th>Direct Downlines</th>
                    <th>Community Size</th>
                    <th>USDT Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral._id} style={{ color: '#fff' }}>
                      <td style={{ color: '#4f8cff', fontWeight: 600 }}>{referral.username}</td>
                      <td>{referral.email}</td>
                      <td>Tier {referral.level}</td>
                      <td>{referral.directDownlines}</td>
                      <td>{referral.communitySize}</td>
                      <td style={{ color: '#7FFF4C', fontWeight: 600 }}>
                        {parseFloat(referral.xrpRewardContribution).toFixed(2)} USDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 
