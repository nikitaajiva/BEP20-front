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

const accordionHeaderStyle = {
  background: 'rgba(79, 140, 255, 0.1)',
  borderBottom: '1px solid rgba(79, 140, 255, 0.2)',
  padding: '1rem',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#4f8cff',
  fontWeight: 'bold'
};

export default function BonusReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [filters, setFilters] = useState({
    incomeType: 'cascade',
    date: new Date().toISOString().substring(0, 10),
    identifier: ''
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showTeamLPModal, setShowTeamLPModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});

  // Redirect non-support/admin users
  if (!authLoading && (!user || (user.userType !== 'support' && user.userType !== 'admin'))) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      
      const { data } = await axios.get(`${API_URL}/api/bonus/summary`, {
        params: {
          user: filters.identifier,
          incomeType: filters.incomeType,
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

  const fetchTeamDetails = async (depth) => {
    try {
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bonus/details/team`, {
        params: {
          user: filters.identifier,
          depth,
          date: filters.date
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalData(data);
    } catch (err) {
      setModalError(err?.response?.data?.msg || err.message || 'Failed to fetch team details');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bonus/details/events`, {
        params: {
          user: filters.identifier,
          incomeType: filters.incomeType,
          date: filters.date
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalData(data);
    } catch (err) {
      setModalError(err?.response?.data?.msg || err.message || 'Failed to fetch event details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewTeamLP = async (depth) => {
    setShowTeamLPModal(true);
    await fetchTeamDetails(depth);
  };

  const handleViewEvents = async () => {
    setShowEventsModal(true);
    await fetchEventDetails();
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const formatXRP = (amount) => {
    if (!amount || isNaN(amount)) return '-';
    const value = parseFloat(amount);
    return value === 0 ? '-' : `${value.toFixed(6)} XRP`;
  };

  const getDecimalValue = (field) => {
    if (!field) return 0;
    if (typeof field === 'object' && field.$numberDecimal) {
      return parseFloat(field.$numberDecimal);
    }
    return parseFloat(field);
  };

  const groupEventsByLevel = (events) => {
    if (!events || !Array.isArray(events)) return { grouped: {}, totalAmount: 0 };
    
    const grouped = {};
    let totalAmount = 0;

    events.forEach(event => {
      const level = event.level || 'Unknown';
      
      if (!grouped[level]) {
        grouped[level] = {
          events: [],
          sum: 0
        };
      }
      
      const amount = getDecimalValue(event.amount);
      const depositAmount = getDecimalValue(event.depositAmount);
      
      grouped[level].events.push({
        ...event,
        ts: event.createdAt,
        amount: amount,
        depositAmount: depositAmount,
        walletFrom: event.walletFrom || 'Unknown',
        rate: event.rate
      });
      
      grouped[level].sum += amount;
      totalAmount += amount;
    });

    // Sort levels numerically
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        return parseInt(a) - parseInt(b);
      })
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });

    return { grouped: sortedGrouped, totalAmount };
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
        <h2 style={{ color: '#4f8cff', marginBottom: '1.5rem' }}>Bonus / Income Report</h2>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>Income Type</label>
            <select 
              name="incomeType" 
              value={filters.incomeType} 
              onChange={handleChange} 
              style={inputStyle}
            >
              <option value="cascade">Cascade</option>
              <option value="levelBooster">Level Booster</option>
              <option value="x1" disabled>X1 (coming soon)</option>
              <option value="x2" disabled>X2 (coming soon)</option>
              <option value="x3" disabled>X3 (coming soon)</option>
              <option value="x4" disabled>X4 (coming soon)</option>
              <option value="x5" disabled>X5 (coming soon)</option>
            </select>
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>User Identifier</label>
            <input
              type="text"
              placeholder="User _id | uhid | username"
              name="identifier"
              value={filters.identifier}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              onClick={handleSearch} 
              disabled={loading} 
              style={buttonStyle}
            >
              {loading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </div>

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

        {summary && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#b3baff' }}>Directs</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#b3baff' }}>Team LP ≤3</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#b3baff' }}>Team LP ≤5</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Open Levels</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Conditions</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Total Credited</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                  <td style={{ padding: '1rem' }}>{summary.user.username} ({summary.user.uhid})</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{summary.counts.directTeam}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {summary.lp.teamLvl3.total}
                    <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View details"
                      onClick={() => handleViewTeamLP(3)}
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {summary.lp.teamLvl5.total}
                    <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View details"
                      onClick={() => handleViewTeamLP(5)}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {summary.conditions.openLevels?.length > 0 
                      ? `Levels ${summary.conditions.openLevels.join(', ')}` 
                      : 'None'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {filters.incomeType === 'cascade' ? summary.conditions.required : summary.conditions.note}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {filters.incomeType === 'cascade' && (
                      <span>
                        {summary.conditions.actual?.directs} directs / {summary.conditions.actual?.selfLP} LP / {' '}
                        {summary.conditions.actual?.teamLP3} team LP (3L) / {' '}
                        {summary.conditions.actual?.teamLP5} team LP (5L)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {summary.credited.total}
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
              <h3 style={{ color: '#4f8cff', margin: 0 }}>Team LP Details</h3>
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
            
            {modalData?.members && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                  <thead>
                    <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff', width: '40%' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#b3baff', width: '30%' }}>Level</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff', width: '30%' }}>Self LP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.members.filter(member => parseFloat(member.lp) > 0).map((member, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{member.username}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>Level {member.level}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(member.lp)}</td>
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
            
            {modalData?.events && Object.entries(groupEventsByLevel(modalData.events).grouped)
              .map(([level, { events, sum }]) => (
                <div key={level} style={{ marginBottom: '1rem', border: '1px solid rgba(79, 140, 255, 0.2)', borderRadius: '8px' }}>
                  <div 
                    style={accordionHeaderStyle}
                    onClick={() => toggleLevel(level)}
                  >
                    <span>Level {level} ({events.length} events) - {formatXRP(sum)}</span>
                    {expandedLevels[level] ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  
                  {expandedLevels[level] && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                        <thead>
                          <tr style={{ background: 'rgba(79, 140, 255, 0.1)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff', width: '25%' }}>Time</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff', width: '20%' }}>Bonus</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff', width: '20%' }}>Deposit</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff', width: '20%' }}>From</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff', width: '15%' }}>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <td style={{ padding: '1rem', textAlign: 'left' }}>{moment(event.ts).format('MM/DD/YYYY, HH:mm:ss')}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(event.amount)}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>{formatXRP(event.depositAmount)}</td>
                              <td style={{ padding: '1rem', textAlign: 'left' }}>{event.walletFrom}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>{event.rate ? `${event.rate}%` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 