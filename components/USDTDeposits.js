'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardNavbar from '@/components/DashboardNavbar';

export default function USDTDeposits() {
  const { user, API_URL, logout } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeposits = async () => {
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
        const apiUrl = `${API_URL}/deposits/history`.replace(/\/+/g, '/').replace(':/', '://');
        
        
        
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
        
        
        if (data.success) {
          setDeposits(data.deposits || []);
        } else {
          throw new Error(data.message || 'Failed to fetch deposits');
        }
      } catch (err) {
        console.error('Error fetching deposits:', err);
        setError(err.message || 'An error occurred while fetching deposits');
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
      fetchDeposits();
    }
  }, [user, API_URL, logout]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Loading Deposits...
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>BNB Deposits</h4>
          </div>

          {error && (
            <div className="table-error-state">{error}</div>
          )}

          {loading && (
            <div className="table-loading-state">Loading deposits...</div>
          )}

          {!loading && !error && deposits.length === 0 && (
            <div className="table-empty-state">No deposits found.</div>
          )}

          {!loading && !error && deposits.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Amount (BNB)</th>
                    <th>Status</th>
                    <th>Wallet Address</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit._id || deposit.tx_hash}>
                      <td>{new Date(deposit.timestamp).toLocaleString()}</td>
                      <td className="highlight">{deposit.tx_hash}</td>
                      <td className="positive-amount">
                        {parseFloat(deposit.amount).toFixed(6)} BNB
                      </td>
                      <td>
                        <span className={`status-${deposit.status.toLowerCase()}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td>{deposit.wallet_address}</td>
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
