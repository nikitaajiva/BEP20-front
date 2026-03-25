"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardNavbar from './DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import AuthGuard from '@/components/auth/AuthGuard';

const TIER_COUNT = 5;
const ENTRIES_PER_PAGE_OPTIONS = [10, 25, 50];

export default function USDTSwiftWallet() {
  const { user, loading: authLoading, logout } = useAuth();
  const { directChildren, paginationInfo, loading: referralsLoading, error: referralsError, fetchDirectChildren, fetchTieredChildren } = useReferral();

  const [activeTier, setActiveTier] = useState(0);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      if (activeTier === 0 || activeTier === 1) {
        fetchDirectChildren(page, entriesPerPage);
      } else if (activeTier >= 2 && activeTier <= TIER_COUNT) {
        fetchTieredChildren(activeTier, page, entriesPerPage);
      }
    }
  }, [user, activeTier, page, entriesPerPage, fetchDirectChildren, fetchTieredChildren]);

  const processedDataForDisplay = React.useMemo(() => {
    if (!directChildren) return [];
    let filtered = directChildren;

    if (search) {
      filtered = filtered.filter(child =>
        child.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [directChildren, search]);

  const totalPages = paginationInfo?.totalPages || 1;

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Loading Wallet Data...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGuard>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
          Please log in to view your Swift Wallet.
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardNavbar user={user} onLogout={logout} />
      <div className="container-xxl py-4">
        <div className="card p-4" style={{ borderRadius: 22, boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)', background: '#181f3a' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
              Swift Wallet Reports - {activeTier === 0 ? 'All Tiers' : `Tier ${activeTier}`}
            </h4>
            <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#b3baff' }}>
              {user?.balanceXRP?.toFixed(4) || '0.0000'} USDT
            </div>
          </div>
          <div className="mb-4">
            <span className="fw-semibold" style={{ fontSize: '1.1rem' }}>USDT Swift Balance & Tier Filter</span>
            <div className="d-flex gap-3 mt-3 flex-wrap align-items-center">
              <button
                key="all-tiers"
                className={`btn tier-btn ${activeTier === 0 ? 'btn-primary' : ''}`}
                style={{
                  background: activeTier === 0 ? 'linear-gradient(90deg, #6a8dff 0%, #7f6aff 100%)' : '#232b4a',
                  color: '#fff',
                  borderRadius: 22,
                  fontWeight: 700,
                  minWidth: 100,
                  fontSize: '1.12rem',
                  border: 'none',
                  boxShadow: activeTier === 0 ? '0 2px 8px 0 rgba(59,130,246,0.18)' : 'none',
                  padding: '0.7rem 2.2rem',
                  marginRight: 8,
                  marginBottom: 8,
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onClick={() => { setActiveTier(0); setPage(1); }}
              >
                All Tiers
              </button>
              {[...Array(TIER_COUNT)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`btn tier-btn ${activeTier === (i + 1) ? 'btn-primary' : ''}`}
                  style={{
                    background: activeTier === (i + 1) ? 'linear-gradient(90deg, #6a8dff 0%, #7f6aff 100%)' : '#232b4a',
                    color: '#fff',
                    borderRadius: 22,
                    fontWeight: 700,
                    minWidth: 100,
                    fontSize: '1.12rem',
                    border: 'none',
                    boxShadow: activeTier === (i + 1) ? '0 2px 8px 0 rgba(59,130,246,0.18)' : 'none',
                    padding: '0.7rem 2.2rem',
                    marginRight: 8,
                    marginBottom: 8,
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => { setActiveTier(i + 1); setPage(1); }}
                >
                  Tier {i + 1}
                </button>
              ))}
            </div>
          </div>
          
          {referralsLoading && (
            <div className="text-center p-5"><span className="spinner-border text-primary"></span> Loading referrals...</div>
          )}
          {referralsError && (
            <div className="alert alert-danger">Error loading referrals: {referralsError.message || referralsError.toString()}</div>
          )}

          {!referralsLoading && !referralsError && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <div>
                  <select
                    className="form-select"
                    style={{ width: 80, background: '#232b4a', color: '#fff', border: 'none', borderRadius: 8 }}
                    value={entriesPerPage}
                    onChange={e => { setEntriesPerPage(Number(e.target.value)); setPage(1); }}
                  >
                    {ENTRIES_PER_PAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="ms-2" style={{ color: '#b3baff' }}>entries per page</span>
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Username..."
                    style={{ background: '#232b4a', color: '#fff', border: 'none', borderRadius: 8, width: 220 }}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <thead style={{ color: '#b3baff', borderBottom: '2px solid #2a3150' }}>
                    <tr>
                      <th>#</th>
                      <th>DATE</th>
                      <th>USERNAME</th>
                      <th>REFERRED BY</th>
                      <th>TIER</th>
                      <th>AIRDROP (USDT)</th>
                      <th>CONTACT (Email)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedDataForDisplay.length === 0 ? (
                      <tr><td colSpan={7} className="text-center text-muted py-4">No entries found for the current filter.</td></tr>
                    ) : processedDataForDisplay.map((child, idx) => (
                      <tr key={child._id} style={{ color: '#fff' }}>
                        <td>{ (paginationInfo.currentPage - 1) * paginationInfo.limit + idx + 1 }</td>
                        <td>{child.createdAt ? new Date(child.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                        <td style={{ color: '#4f8cff', fontWeight: 600 }}>
                          <Link href={`#`} passHref style={{ color: '#4f8cff', textDecoration: 'underline', fontWeight: 700 }}>
                             {child.username}
                          </Link>
                        </td>
                        <td>{user?.username || 'N/A'}</td>
                        <td>{child.level !== undefined ? `Tier - ${child.level}` : 'N/A'}</td>
                        <td>
                          <span style={{ color: '#7FFF4C', fontWeight: 600 }}>
                            {child.xrpRewardContribution?.toFixed(2) || '0.00'} USDT
                          </span>
                        </td>
                        <td>{child.email || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span style={{ color: '#b3baff', fontSize: '0.98rem' }}>
                  Showing {paginationInfo.totalRecords === 0 ? 0 : (paginationInfo.currentPage - 1) * paginationInfo.limit + 1} 
                  to {Math.min(paginationInfo.currentPage * paginationInfo.limit, paginationInfo.totalRecords)} 
                  of {paginationInfo.totalRecords} entries
                </span>
                <nav>
                  <ul className="pagination mb-0" style={{ gap: 4 }}>
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" style={{ background: '#232b4a', color: '#fff', border: 'none', borderRadius: 8 }} onClick={() => setPage(page - 1)} disabled={page === 1}>&laquo;</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" style={{ background: page === i + 1 ? '#7f6aff' : '#232b4a', color: '#fff', border: 'none', borderRadius: 8 }} onClick={() => setPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                      <button className="page-link" style={{ background: '#232b4a', color: '#fff', border: 'none', borderRadius: 8 }} onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 
