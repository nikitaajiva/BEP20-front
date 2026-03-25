"use client";
import React, { useState, Suspense } from 'react';
import { 
  Users, 
  Calendar, 
  Search as SearchIcon, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Trophy, 
  Database, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Info,
  Clock,
  ArrowRightCircle
} from 'lucide-react';
import axios from 'axios';
import styles from './community-booster-report.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CommunityBoosterReport() {
  const [filters, setFilters] = useState({
    identifier: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const [showTeamLPModal, setShowTeamLPModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError('Please enter user identifier to begin audit.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bonus/community/summary`, {
        params: { user: filters.identifier, date: filters.date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(data);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Audit sync failed.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUSDT = (amount) => {
    if (!amount) return '0.000000 USDT';
    // Handle Decimal128 format
    const value = amount.$numberDecimal ? parseFloat(amount.$numberDecimal) : parseFloat(amount);
    if (isNaN(value)) return '0.000000 USDT';
    return value === 0 ? '0.000000 USDT' : `${value.toFixed(6)} USDT`;
  };

  const fetchTeamDetails = async () => {
    try {
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/bonus/community/details`, {
        params: { user: filters.identifier, type: 'team', date: filters.date },
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
      const { data } = await axios.get(`${API_URL}/api/bonus/community/details`, {
        params: { user: filters.identifier, type: 'events', date: filters.date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalData({ events: data });
    } catch (err) {
      setModalError(err?.response?.data?.msg || err.message || 'Failed to fetch event details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewTeamLP = async () => {
    setShowTeamLPModal(true);
    await fetchTeamDetails();
  };

  const handleViewEvents = async () => {
    setShowEventsModal(true);
    await fetchEventDetails();
  };

  const handleViewQualification = () => setShowQualificationModal(true);

  return (
    <div className={styles.container}>
      <header className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>Community Booster <span>Report Terminal</span></h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <Trophy size={14} color="#ffd700" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Tier Audit Segment</span>
          </div>
        </div>
      </header>

      <div className={styles.searchForm}>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label><Calendar size={12} className="inline mr-2" /> Audit Date</label>
            <input type="date" name="date" value={filters.date} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label><Users size={12} className="inline mr-2" /> Identity Tracer</label>
            <input
              type="text"
              placeholder="Username, UHID or ID..."
              name="identifier"
              value={filters.identifier}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className={styles.searchBtn}>
            {loading ? 'Initializing Audit...' : <><SearchIcon size={16} className="inline mr-2" /> Execute Trace</>}
          </button>
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
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Direct Volume</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Team Volume</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Qualified Tiers</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Total Credited</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                  <td style={{ padding: '1rem' }}>{summary.user.username} ({summary.user.uhid})</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {formatUSDT(summary.volumes?.directVolume)}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {formatUSDT(summary.volumes?.teamVolume)}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>
                  <td style={{ padding: '1rem', cursor: 'pointer' }} onClick={handleViewQualification}>
                    {summary.qualifiedTiers?.length > 0 
                      ? summary.qualifiedTiers.map(tier => 
                          `Tier ${tier.tier} (Level ${tier.bonusLevel} @ ${(tier.rate * 100).toFixed(0)}%)`
                        ).join(', ')
                      : 'None'
                    }
                    <div style={{ fontSize: '0.9em', color: '#b3baff', marginTop: '0.5rem' }}>
                      Directs: {summary.conditions?.directs || 0}, Self LP: {formatUSDT(summary.conditions?.selfLP)}
                    </div>
                    <FaEye 
                      style={{ marginLeft: 6, color: '#4f8cff' }} 
                      title="View qualification details"
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {formatUSDT(summary.credited?.total)}
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

      {/* Team Volume Modal */}
      {showTeamLPModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#4f8cff', margin: 0 }}>Team Volume Details</h3>
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
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b3baff' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#b3baff' }}>Level</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#b3baff' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.members.map((member, index) => {
                      if (member.isTotal) {
                        return (
                          <tr key={`total-${index}`} style={{
                            background: 'rgba(79, 140, 255, 0.2)',
                            borderTop: '2px solid rgba(79, 140, 255, 0.3)',
                            fontWeight: 'bold'
                          }}>
                            <td colSpan="2" style={{ padding: '1rem', color: '#4f8cff' }}>
                              Total Team Volume
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right', color: '#4f8cff' }}>
                              {formatUSDT(member.lpSum)}
                            </td>
                          </tr>
                        );
                      }
                      
                      if (member.isLevelSum) {
                        return (
                          <tr key={`sum-${index}`} style={{
                            background: 'rgba(79, 140, 255, 0.1)',
                            borderBottom: '1px solid rgba(79, 140, 255, 0.2)'
                          }}>
                            <td colSpan="2" style={{ padding: '1rem', color: '#4f8cff', fontStyle: 'italic' }}>
                              Level {member.level} Sum
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right', color: '#4f8cff', fontWeight: 'bold' }}>
                              {formatUSDT(member.lpSum)}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                          <td style={{ padding: '1rem' }}>{member.username}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>Level {member.level}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(member.lp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {summary && (
        <div className={styles.summaryTableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Target Identity</th>
                <th className="text-right">Activity Volume</th>
                <th className="text-right">Cohort Volume</th>
                <th>Qualified Matrix</th>
                <th className="text-right">Total Credited</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td>
                  <div className="flex flex-col">
                    <span style={{ color: '#ffd700', fontWeight: 900 }}>{summary.user.username}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>{summary.user.uhid}</span>
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex flex-col items-end">
                    <span style={{ fontWeight: 800 }}>{formatUSDT(summary.volumes?.directVolume)}</span>
                    <span className={styles.subText}>Directs Trace</span>
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center justify-end">
                      <span style={{ fontWeight: 800, color: '#00ff88' }}>{formatUSDT(summary.volumes?.teamVolume)}</span>
                      <Eye className={styles.viewIcon} onClick={handleViewTeamLP} size={14} />
                    </div>
                    <span className={styles.subText}>L1-L3 Aggregate</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    {summary.qualifiedTiers?.length > 0 ? summary.qualifiedTiers.map((tier, i) => (
                      <span key={i} className={styles.badge}>
                        Tier {tier.tier} (L{tier.bonusLevel} @ {(tier.rate * 100).toFixed(0)}%)
                      </span>
                    )) : <span className={styles.badge} style={{ opacity: 0.5 }}>No Tiers Qualified</span>}
                    <div className="flex items-center mt-2 gap-2" onClick={handleViewQualification} style={{ cursor: 'pointer' }}>
                      <span className={styles.subText}>D: <span>{summary.conditions?.directs || 0}</span> | S: <span>{formatUSDT(summary.conditions?.selfLP).split(' ')[0]}</span></span>
                      <Info size={12} color="#ffd700" title="Qualification Requirements" />
                    </div>
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center justify-end">
                      <span style={{ fontWeight: 900, fontSize: '16px' }}>{formatUSDT(summary.credited?.total)}</span>
                      <Eye className={styles.viewIcon} size={14} onClick={handleViewEvents} />
                    </div>
                    <span className={styles.subText}>Boost Credit</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Team Analytics Modal */}
      {showTeamLPModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cohort <span>Volume Matrix</span></h3>
              <button onClick={() => setShowTeamLPModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            {modalLoading ? <div className="text-center p-20 animate-pulse text-gold-500">Decrypting Team Structure...</div> : 
             modalError ? <div className="p-4 bg-red-500/10 text-red-500 rounded-xl">{modalError}</div> :
             modalData?.members && (
              <div className={styles.summaryTableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Identity</th>
                      <th className="text-center">Hierarchy Depth</th>
                      <th className="text-right">Contributed Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.events.map((event, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{new Date(event.ts).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>{new Date(event.triggeringDate).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>{event.from}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(event.triggeringAmount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(event.amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>Level {event.level}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>Tier {event.tier}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{(parseFloat(event.rate.$numberDecimal || event.rate) * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credit Events Modal */}
      {showEventsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Credit <span>Protocol Traces</span></h3>
              <button onClick={() => setShowEventsModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            {modalLoading ? <div className="text-center p-20 animate-pulse text-gold-500">Synchronizing Event Buffer...</div> : 
             modalError ? <div className="p-4 bg-red-500/10 text-red-500 rounded-xl">{modalError}</div> :
             modalData?.events && (
              <div className={styles.summaryTableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reward Timestamp</th>
                      <th>Origin Protocol</th>
                      <th>Volume Source</th>
                      <th className="text-right">Volume</th>
                      <th className="text-right">Boost Credit</th>
                      <th className="text-center">Depth/Tier</th>
                      <th className="text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.events.map((event, index) => (
                      <tr key={index} className={styles.row}>
                        <td>
                          <div className="flex flex-col">
                            <span style={{ fontSize: '11px', color: '#fff' }}>{new Date(event.ts).toLocaleDateString()}</span>
                            <span style={{ fontSize: '9px', opacity: 0.6 }}>{new Date(event.ts).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td>
                           <div className="flex flex-col">
                            <span style={{ fontSize: '11px', color: '#fff' }}>{new Date(event.triggeringDate).toLocaleDateString()}</span>
                            <span style={{ fontSize: '9px', opacity: 0.6 }}>Deposit Trace</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                             <Database size={10} color="#ffd700" />
                             <span style={{ fontSize: '11px' }}>{event.from}</span>
                          </div>
                        </td>
                        <td className="text-right" style={{ fontWeight: 800 }}>{formatUSDT(event.triggeringAmount).split(' ')[0]}</td>
                        <td className="text-right" style={{ fontWeight: 900, color: '#ffd700' }}>{formatUSDT(event.amount)}</td>
                        <td className="text-center">
                          <span className={styles.badge} style={{ fontSize: '9px' }}>L{event.level} | T{event.tier}</span>
                        </td>
                        <td className="text-right" style={{ fontWeight: 800, color: '#00ff88' }}>
                          {(parseFloat(event.rate.$numberDecimal || event.rate) * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Qualification Blueprint Modal */}
      {showQualificationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Qualification <span>Blueprint</span></h3>
              <button onClick={() => setShowQualificationModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                 <span className={styles.subText}>Direct Hub</span>
                 <div className="text-xl font-black text-gold-400 mt-1">{summary.conditions?.directs || 0} <span className="text-xs opacity-50">Units</span></div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                 <span className={styles.subText}>Self Holding</span>
                 <div className="text-xl font-black text-gold-400 mt-1">{formatUSDT(summary.conditions?.selfLP).split(' ')[0]} <span className="text-xs opacity-50">USDT</span></div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                 <span className={styles.subText}>Core Volume</span>
                 <div className="text-xl font-black text-gold-400 mt-1">{formatUSDT(summary.volumes?.directVolume).split(' ')[0]} <span className="text-xs opacity-50">USDT</span></div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                 <span className={styles.subText}>Network Volume</span>
                 <div className="text-xl font-black text-green-400 mt-1">{formatUSDT(summary.volumes?.teamVolume).split(' ')[0]} <span className="text-xs opacity-50">USDT</span></div>
               </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ marginBottom: '1rem', color: '#b3baff' }}>
                <strong>Your Current Stats:</strong>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>Direct Referrals: {summary.conditions?.directs || 0}</li>
                  <li>Self LP: {formatUSDT(summary.conditions?.selfLP)}</li>
                  <li>Direct Volume: {formatUSDT(summary.volumes?.directVolume)}</li>
                  <li>Team Volume: {formatUSDT(summary.volumes?.teamVolume)}</li>
                </ul>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                <thead>
                  <tr>
                    <th>Tier Vector</th>
                    <th className="text-center">Goal Lvl</th>
                    <th className="text-center">Min D</th>
                    <th className="text-right">Min Self</th>
                    <th className="text-right">Direct Vol</th>
                    <th className="text-right">Team Vol</th>
                    <th className="text-center">Status Vector</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 10000, level: 1, minDirects: 1, minSelfLP: 9, directRequired: 2000, teamRequired: 10000 },
                    { tier: 20000, level: 2, minDirects: 2, minSelfLP: 9, directRequired: 6000, teamRequired: 20000 },
                    { tier: 30000, level: 3, minDirects: 3, minSelfLP: 9, directRequired: 12000, teamRequired: 30000 }
                  ].map((tierReq, index) => {
                    const meetsBasicReqs = (summary.conditions?.directs >= tierReq.minDirects) && (parseFloat(summary.conditions?.selfLP) >= tierReq.minSelfLP);
                    const meetsDirectVolume = parseFloat(summary.volumes?.directVolume) >= tierReq.directRequired;
                    const meetsTeamVolume = parseFloat(summary.volumes?.teamVolume) >= tierReq.teamRequired;
                    const isQualified = meetsBasicReqs && meetsDirectVolume && meetsTeamVolume;

                    return (
                      <tr key={index} className={styles.row}>
                        <td><span style={{ fontWeight: 900 }}>Tier {tierReq.tier}</span></td>
                        <td className="text-center">Level {tierReq.level}</td>
                        <td className="text-center">
                          <span style={{ color: summary.conditions?.directs >= tierReq.minDirects ? '#00ff88' : '#ff4d4d' }}>{tierReq.minDirects}</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: parseFloat(summary.conditions?.selfLP) >= tierReq.minSelfLP ? '#4caf50' : '#ff4d4d' }}>
                          {tierReq.minSelfLP} ({formatUSDT(summary.conditions?.selfLP)})
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: meetsDirectVolume ? '#4caf50' : '#ff4d4d' }}>
                          {formatUSDT(tierReq.directRequired)} ({formatUSDT(summary.volumes?.directVolume)})
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: meetsTeamVolume ? '#4caf50' : '#ff4d4d' }}>
                          {formatUSDT(tierReq.teamRequired)} ({formatUSDT(summary.volumes?.teamVolume)})
                        </td>
                        <td className="text-center">
                          {isQualified ? <CheckCircle2 size={16} color="#00ff88" className="inline" /> : <XCircle size={16} color="#ff4d4d" className="inline" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-white/5 border-l-4 border-gold-500 rounded-r-xl">
               <div className="flex items-center gap-2 text-gold-500 font-bold mb-2">
                 <Info size={14} /> Audit Instruction
               </div>
               <p className="text-xs opacity-70 leading-relaxed">
                 To achieve Tier qualification, the user must satisfy the full constraint matrix: Direct referral count, Minimum self-holding (LP), Level 1 Direct Volume, and Recursive Team Volume (L1-L3).
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityBoosterReportPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Establishing Audit Connection...</div>}>
       <CommunityBoosterReport />
    </Suspense>
  );
}
