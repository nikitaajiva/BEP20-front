"use client";
import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
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
  ArrowRightCircle,
  TrendingUp,
  History,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Activity as ActivityIcon
} from 'lucide-react';
import moment from 'moment';
import styles from './x1-bonus-report.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function X1BonusReport() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
      const { data } = await axios.get(`${API_URL}/api/bonus/x1/summary`, {
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

  const handleViewTeamLP = async () => {
    try {
      setShowTeamLPModal(true);
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/bonus/x1/details`, {
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

  const handleViewEvents = () => {
    setShowEventsModal(true);
    setModalData(summary?.credited);
  };

  if (!authLoading && (!user || (user.userType !== 'support' && user.userType !== 'admin'))) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }
  const formatUSDT = (amount) => {
    if (!amount) return '0.000000 USDT';
    // Handle Decimal128 format
    const value = amount.$numberDecimal ? parseFloat(amount.$numberDecimal) : parseFloat(amount);
    if (isNaN(value)) return '0.000000 USDT';
    return value === 0 ? '0.000000 USDT' : `${value.toFixed(6)} USDT`;
  };

  return (
    <div className={styles.container}>
      <header className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>X1 Bonus <span>Master Terminal</span></h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <ShieldCheck size={14} color="#ffd700" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Audit Protocol Active</span>
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
              placeholder="Username or UHID..."
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
                    {formatUSDT(summary.qualification.selfLP)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {Object.entries(summary.qualification.teamLP).map(([tier, data]) => (
                      <div key={tier}>
                        {tier}: {formatUSDT(data.required)} {data.meets ? '✓' : '✗'}
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
                    {formatUSDT(summary.credited.total)}
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

      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
          <XCircle size={18} /> {error}
        </div>
      )}

      {summary && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Target Identity</th>
                <th style={{ textAlign: 'right' }}>Self Balance</th>
                <th style={{ textAlign: 'right' }}>Network Matrix</th>
                <th>Bonus Status</th>
                <th style={{ textAlign: 'right' }}>Total Credited</th>
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
                <td style={{ textAlign: 'right', fontWeight: 900 }}>{formatUSDT(summary.qualification.selfLP).split(' ')[0]} USDT</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end gap-1">
                      {Object.entries(summary.qualification.teamLP).map(([tier, data]) => (
                        <div key={tier} className={styles.wingItem} style={{ width: '180px' }}>
                          <span className={styles.wingLabel}>{tier}</span>
                          <span className={styles.wingValue}>
                            {formatUSDT(data.required).split(' ')[0]}
                            {data.meets ? <CheckCircle2 size={10} className={`${styles.statusIcon} ${styles.check} inline ml-1`} /> : <XCircle size={10} className={`${styles.statusIcon} ${styles.cross} inline ml-1`} />}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Eye className={styles.viewIcon} size={14} onClick={handleViewTeamLP} />
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-2">
                    {summary.qualification.currentTier ? (
                       <>
                         <span className={styles.tierBadge}><Trophy size={10} /> {summary.qualification.currentTier}</span>
                         <span style={{ fontSize: '10px', color: '#00ff88', fontWeight: 800 }}>RATE: {summary.qualification.currentRate}%</span>
                       </>
                    ) : (
                       <span style={{ color: '#ff4d4d', fontSize: '11px', fontWeight: 800 }}>Matrix Deficit</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 900, fontSize: '16px' }}>{formatUSDT(summary.credited.total).split(' ')[0]}</span>
                      <Eye className={styles.viewIcon} size={14} onClick={handleViewEvents} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>Boost Segments</span>
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
              <h3 className={styles.modalTitle}>Network <span>Protocol Matrix</span></h3>
              <button onClick={() => setShowTeamLPModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            {modalLoading ? <div className="text-center p-20 animate-pulse text-gold-500">Decrypting Wing Structures...</div> : 
             modalError ? <div className="p-4 bg-red-500/10 text-red-500 rounded-xl">{modalError}</div> :
             modalData?.teamDetails && (
              <div className={styles.modalBody}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Identity Core</th>
                      <th style={{ textAlign: 'right' }}>Self Balance</th>
                      <th style={{ textAlign: 'right' }}>Network Wings</th>
                      <th style={{ textAlign: 'right' }}>Total Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.teamDetails.map((member, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{member.username}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(member.selfLP)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {Object.entries(member.teamLP).map(([wing, lp]) => (
                            <div key={wing}>Wing {wing}: {formatUSDT(lp)}</div>
                          ))}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(member.totalTeamLP)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Audit Modal */}
      {showEventsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Credit <span>Protocol History</span></h3>
              <button onClick={() => setShowEventsModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            {modalData?.events && (
              <div className={styles.modalBody}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Temporal Trace</th>
                      <th>Origin Source</th>
                      <th style={{ textAlign: 'right' }}>Volume</th>
                      <th>Audit Narrative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.events.map((event, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(79, 140, 255, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{moment(event.ts).format('MM/DD/YYYY, HH:mm:ss')}</td>
                        <td style={{ padding: '1rem' }}>{event.walletFrom}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatUSDT(event.amount)}</td>
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

export default function X1BonusReportPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Initializing X1 Terminal...</div>}>
       <X1BonusReport />
    </Suspense>
  );
}
