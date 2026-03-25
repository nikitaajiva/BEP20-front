"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import moment from 'moment';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Reusable styles
const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '12px',
  border: '1px solid rgba(79, 140, 255, 0.2)',
  background: 'rgba(79, 140, 255, 0.1)',
  color: '#fff',
  fontSize: '0.9rem'
};

const buttonStyle = {
  background: 'rgba(79, 140, 255, 0.1)',
  border: '1px solid rgba(79, 140, 255, 0.2)',
  color: '#4f8cff',
  borderRadius: '12px',
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1050
};

const modalContentStyle = {
  background: '#181f3a',
  borderRadius: '22px',
  padding: '2rem',
  width: '90%',
  maxWidth: '800px',
  color: 'white',
  boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)',
  maxHeight: '80vh',
  overflowY: 'auto'
};

export default function X1BonusReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [filters, setFilters] = useState({
    identifier: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const [showTeamLPModal, setShowTeamLPModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});

  // Redirect non-support/admin users
  if (!authLoading && (!user || (user.userType !== 'support' && user.userType !== 'admin'))) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const handleChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError('Please enter user identifier');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bonus/x1/summary`, {
        params: {
          user: filters.identifier,
          date: filters.date
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(data);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Fetch failed');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeamLP = async () => {
    try {
      setShowTeamLPModal(true);
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bonus/x1/details`, {
        params: {
          user: filters.identifier,
          type: 'team',
          date: filters.date
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Team details response:', data);
      setModalData(data);
    } catch (err) {
      console.error('Team details error:', err);
      setModalError(err?.response?.data?.msg || err.message || 'Failed to fetch team details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewEvents = () => {
    setShowEventsModal(true);
    setModalData(summary?.credited);
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const formatXRP = (amount) => {
    if (!amount) return '0.000000 XRP';
    // Handle Decimal128 format
    const value = amount.$numberDecimal ? parseFloat(amount.$numberDecimal) : parseFloat(amount);
    if (isNaN(value)) return '0.000000 XRP';
    return value === 0 ? '0.000000 XRP' : `${value.toFixed(6)} XRP`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        background: '#181f3a', 
        borderRadius: '22px', 
        padding: '2rem', 
        color: 'white',
        boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#4f8cff', marginBottom: '1.5rem' }}>X1 Bonus Report</h2>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>User Identifier</label>
            <input 
              type="text" 
              name="identifier" 
              value={filters.identifier} 
              onChange={handleChange} 
              placeholder="UHID or Username"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>Date</label>
            <input 
              type="date" 
              name="date" 
              value={filters.date} 
              onChange={handleChange} 
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={handleSearch} style={buttonStyle}>
              Search
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.2)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#ff4d4d'
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b3baff' }}>
            Loading...
          </div>
        )}

        {/* Results */}
        {summary && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Self LP</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Team LP</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Current Tier</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Total Credited</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                  <td style={{ padding: '1rem' }}>{summary.user.username} ({summary.user.uhid})</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {formatXRP(summary.qualification.selfLP)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {Object.entries(summary.qualification.teamLP).map(([tier, data]) => (
                      <div key={tier}>
                        {tier}: {formatXRP(data.required)} {data.meets ? '✓' : '✗'}
                      </div>
                    ))}
                    <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {summary.qualification.currentTier ? (
                      <div>
                        {summary.qualification.currentTier} ({summary.qualification.currentRate}%)
                      </div>
                    ) : 'Not Qualified'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {formatXRP(summary.credited.total)}
                    <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View events"
                      onClick={handleViewEvents}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team LP Modal */}
      {showTeamLPModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#4f8cff', margin: 0 }}>Team Details</h3>
              <button
                onClick={() => setShowTeamLPModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b3baff',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {modalLoading && <div style={{ textAlign: 'center', padding: '2rem', color: '#b3baff' }}>Loading...</div>}
            {modalError && (
              <div style={{
                background: 'rgba(255, 77, 77, 0.1)',
                border: '1px solid rgba(255, 77, 77, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#ff4d4d'
              }}>
                {modalError}
              </div>
            )}
            
            {modalData?.teamDetails && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                  <thead>
                    <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Self LP</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Team LP</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Total Team LP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.teamDetails.map((member, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{member.username}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(member.selfLP)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {Object.entries(member.teamLP).map(([wing, lp]) => (
                            <div key={wing}>Wing {wing}: {formatXRP(lp)}</div>
                          ))}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(member.totalTeamLP)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#4f8cff', margin: 0 }}>Credited Events</h3>
              <button
                onClick={() => setShowEventsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b3baff',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {modalData?.events && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                  <thead>
                    <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Time</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>From</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Narrative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.events.map((event, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{moment(event.ts).format('MM/DD/YYYY, HH:mm:ss')}</td>
                        <td style={{ padding: '1rem' }}>{event.walletFrom}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(event.amount)}</td>
                        <td style={{ padding: '1rem' }}>{event.narrative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 