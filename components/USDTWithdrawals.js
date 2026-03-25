'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardNavbar from '@/components/DashboardNavbar';

export default function USDTWithdrawals() {
  const { user, API_URL, logout } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Ensure API_URL is available
        if (!API_URL) {
          throw new Error('API URL is not configured');
        }

        // Construct the API URL carefully
        const apiUrl = `${API_URL}/withdrawals/history`.replace(/\/+/g, '/').replace(':/', '://');
        
        console.log('Fetching withdrawals from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            throw new Error('Session expired. Please login again.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Withdrawals data:', data);
        
        if (data.success) {
          setWithdrawals(data.withdrawals || []);
        } else {
          throw new Error(data.message || 'Failed to fetch withdrawals');
        }
      } catch (err) {
        console.error('Error fetching withdrawals:', err);
        setError(err.message || 'An error occurred while fetching withdrawals');
        if (err.message.includes('Session expired')) {
          setTimeout(() => {
            logout();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWithdrawals();
    }
  }, [user, API_URL, logout]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Loading Withdrawals...
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>USDT Withdrawals</h4>
          </div>

          {error && (
            <div className="table-error-state">{error}</div>
          )}

          {loading && (
            <div className="table-loading-state">Loading withdrawals...</div>
          )}

          {!loading && !error && withdrawals.length === 0 && (
            <div className="table-empty-state">No withdrawals found.</div>
          )}

          {!loading && !error && withdrawals.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Amount (USDT)</th>
                    <th>Status</th>
                    <th>Wallet Source</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.transactionId || withdrawal.uniqueTransactionId}>
                      <td>{new Date(withdrawal.timestamp).toLocaleString()}</td>
                      <td className="highlight">
                        {withdrawal.txHash || withdrawal.uniqueTransactionId}
                      </td>
                      <td className="negative-amount">
                        -{parseFloat(withdrawal.amount).toFixed(6)} USDT
                      </td>
                      <td>
                        <span className={`status-${withdrawal.status.toLowerCase()}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td>{withdrawal.walletFrom}</td>
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
