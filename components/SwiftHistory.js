'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardNavbar from '@/components/DashboardNavbar';
import Link from 'next/link';
// 6239001858 9501005959  8054989435 
// Renamed from SwiftHistoryPage to SwiftHistory
const SwiftHistory = () => {
  const { user, API_URL, logout } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransferHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated.');
      return;
    }
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const apiBaseUrl = API_URL || '';
      let endpointPath = '/swift-transfers/history'; // Specific endpoint for history
      let finalUrl;

      if (apiBaseUrl.endsWith('/api')) {
        // API_URL is like https://staging-b.bepvault.io/api
        // We want https://staging-b.bepvault.io/api/swift-transfers/history
        // So, if endpointPath starts with /api/, remove it. But it doesn't here.
        // If endpointPath starts with just /, ensure no double slash if apiBaseUrl ends with /
        if (endpointPath.startsWith('/') && apiBaseUrl.endsWith('/')) {
          finalUrl = `${apiBaseUrl}${endpointPath.substring(1)}`;
        } else if (!endpointPath.startsWith('/') && !apiBaseUrl.endsWith('/')){
          finalUrl = `${apiBaseUrl}/${endpointPath}`;
        } else {
          finalUrl = `${apiBaseUrl}${endpointPath}`;
        }
      } else if (apiBaseUrl && !apiBaseUrl.endsWith('/')) {
        // API_URL is like https://staging-b.bepvault.io
        // We want https://staging-b.bepvault.io/api/swift-transfers/history
        finalUrl = `${apiBaseUrl}/api${endpointPath.startsWith('/') ? endpointPath : '/'.concat(endpointPath)}`;
      } else if (apiBaseUrl && apiBaseUrl.endsWith('/')){
        // API_URL is like https://staging-b.bepvault.io/
        // We want https://staging-b.bepvault.io/api/swift-transfers/history
        finalUrl = `${apiBaseUrl}api${endpointPath.startsWith('/') ? endpointPath : '/'.concat(endpointPath)}`;
      }else {
        // API_URL is empty, assume relative path starting with /api
        finalUrl = `/api${endpointPath.startsWith('/') ? endpointPath : '/'.concat(endpointPath)}`;
      }
      
      

      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTransfers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch transfer history');
      }
    } catch (err) {
      console.error("Error fetching Swift transfer history:", err);
      setError(err.message || 'An unexpected error occurred.');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    fetchTransferHistory();
  }, [fetchTransferHistory]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000', color: 'white' }}>
        Loading Transfer History...
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>Swift Transfer History</h4>
          </div>

          {error && (
            <div className="table-error-state">{error}</div>
          )}

          {loading && (
            <div className="table-loading-state">Loading swift transfers...</div>
          )}

          {!loading && !error && transfers.length === 0 && (
            <div className="table-empty-state">No Swift transfers found.</div>
          )}

          {!loading && !error && transfers.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Other Party</th>
                    <th>Amount (USDT)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer._id}>
                      <td>{new Date(transfer.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={transfer.type === 'sent' ? 'negative-amount' : 'positive-amount'}>
                          {transfer.type === 'sent' ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td>{transfer.otherPartyEmail || transfer.otherPartyUsername || 'N/A'}</td>
                      <td className={transfer.type === 'sent' ? 'negative-amount' : 'positive-amount'}>
                        {parseFloat(transfer.amount.toString()).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-${transfer.status.toLowerCase()}`}>
                          {transfer.status}
                        </span>
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
};

export default SwiftHistory; 
