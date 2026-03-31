"use client";
import React, { useState, Suspense } from "react";
import {
  Users,
  Calendar,
  Search as SearchIcon,
  Eye,
  X,
  XCircle,
  TrendingUp,
  Zap
} from "lucide-react";
import axios from "axios";
import styles from "./community-rewards.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CommunityRewardsReport() {
  const [filters, setFilters] = useState({
    identifier: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const toggleRow = (key) => setExpandedLevels((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toNum = (v) => {
    if (v == null) return 0;
    if (typeof v === "object" && v.$numberDecimal != null) return parseFloat(v.$numberDecimal) || 0;
    return Number(v) || 0;
  };

  const normalizeResponse = (data, identifier) => {
    if (data?.depositor && Array.isArray(data?.snapshots)) return { kind: "trail", headerUser: data.depositor, ...data };
    if (data?.uhid && Array.isArray(data?.ActiveDirects)) return { kind: "single", headerUser: { username: data.sponsorUsername ?? null, uhid: data.uhid }, ...data };
    if (data?.user && data?.volumes && data?.conditions) return { kind: "booster", headerUser: data.user, ...data };
    return { kind: "unknown", headerUser: { username: null, uhid: data?.uhid ?? identifier ?? null }, ...data };
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError("Please enter user identifier to begin audit.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = { uhid: filters.identifier, date: filters.date };
      const { data } = await axios.get(`${API_URL}/api/bonus/community/cascade/snapshot`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(normalizeResponse(data, filters.identifier));
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || "Audit sync failed.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUSDT = (amount) => {
    if (!amount) return "0.000000 USDT";
    // Handle Decimal128 format
    const value = amount.$numberDecimal
      ? parseFloat(amount.$numberDecimal)
      : parseFloat(amount);
    if (isNaN(value)) return "0.000000 USDT";
    return value === 0 ? "0.000000 USDT" : `${value.toFixed(6)} USDT`;
  };

  const fetchTeamDetails = async () => {
    try {
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${API_URL}/api/bonus/community/details`,
        {
          params: {
            user: filters.identifier,
            type: "team",
            date: filters.date,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setModalData(data);
    } catch (err) {
      setModalError(
        err?.response?.data?.msg ||
        err.message ||
        "Failed to fetch team details"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setModalLoading(true);
      setModalError(null);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${API_URL}/api/bonus/community/details`,
        {
          params: {
            user: filters.identifier,
            type: "events",
            date: filters.date,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setModalData({ events: data });
    } catch (err) {
      setModalError(
        err?.response?.data?.msg ||
        err.message ||
        "Failed to fetch event details"
      );
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

  const handleViewQualification = () => {
    setShowQualificationModal(true);
  };
  // before your return()
  const headerUser = summary?.headerUser || summary?.user || {};

  return (
    <div className={styles.container}>
      <header className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>Community Rewards <span>Cascade Report</span></h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <Zap size={14} color="#ffd700" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Audit Cycle Ready</span>
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

        {error && (
          <div
            style={{
              background: "rgba(255, 77, 77, 0.1)",
              border: "1px solid rgba(255, 77, 77, 0.2)",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              color: "#ff4d4d",
            }}
          >
            {error}
          </div>
        )}

        {summary && (
          <div
          // style={{
          // overflowX: "auto"

          // }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(79, 140, 255, 0.1)" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#b3baff",
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Self Lp
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Team Lp
                  </th>
                  {/* <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#b3baff",
                    }}
                  >
                    Qualified Tiers
                  </th> */}
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Rewards Credited
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Active Directs
                  </th>
                  {/* <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Total Credited
                  </th> */}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem" }}>
                    {headerUser.username ? `${headerUser.username}` : "—"}
                    {headerUser.uhid ? ` (${headerUser.uhid})` : ""}
                  </td>

                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {headerUser.selfLp ? `${headerUser.selfLp}` : "—"}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {headerUser.teamLp5Sum ? `${headerUser.teamLp5Sum}` : "—"}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>

                  <td
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {toNum(summary?.depositor?.totalCascadeAmount).toFixed(2)}
                    {Array.isArray(summary?.depositor?.cascadeRewards) &&
                      summary?.depositor?.cascadeRewards.length > 0 && (
                        <span>
                          <FaEye
                            style={{
                              cursor: "pointer",
                              marginLeft: 8,
                              color: "#4f8cff",
                              width: "",
                            }}
                            title="View level-by-level snapshots"
                            onClick={handleViewRewardsHistory}
                          />
                        </span>
                      )}
                  </td>

                  <td
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* Count of strict-active directs */}
                    {headerUser?.activeDirectsCount ??
                      summary?.depositor?.activeDirectsCount ??
                      "—"}

                    {/* Eye to open the snapshots modal (only if we have data) */}
                    {Array.isArray(summary?.snapshots) &&
                      summary.snapshots.length > 0 && (
                        <span>
                          <FaEye
                            style={{
                              cursor: "pointer",
                              marginLeft: 8,
                              color: "#4f8cff",
                              width: "",
                            }}
                            title="View level-by-level snapshots"
                            onClick={handleViewActiveDirects}
                          />
                        </span>
                      )}
                  </td>

                  {/* <td
                    style={{ padding: "1rem", cursor: "pointer" }}
                    onClick={handleViewQualification}
                  >
                    {summary.qualifiedTiers?.length > 0
                      ? summary.qualifiedTiers
                          .map(
                            (tier) =>
                              `Tier ${tier.tier} (Level ${tier.bonusLevel} @ ${(
                                tier.rate * 100
                              ).toFixed(0)}%)`
                          )
                          .join(", ")
                      : "None"}
                    <div
                      style={{
                        fontSize: "0.9em",
                        color: "#b3baff",
                        marginTop: "0.5rem",
                      }}
                    >
                      Directs: {summary.conditions?.directs || 0}, Self LP:{" "}
                      {formatUSDT(summary.conditions?.selfLP)}
                    </div>
                    <FaEye
                      style={{ marginLeft: 6, color: "#4f8cff" }}
                      title="View qualification details"
                    />
                  </td> */}
                  {/* <td style={{ padding: "1rem", textAlign: "right" }}>
                    {formatUSDT(summary.credited?.total)}
                    <FaEye
                      style={{
                        cursor: "pointer",
                        marginLeft: 6,
                        color: "#4f8cff",
                      }}
                      title="View events"
                      onClick={handleViewEvents}
                    />
                  </td> */}
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
                <th style={{ textAlign: 'right' }}>Team Aggregate</th>
                <th style={{ textAlign: 'right' }}>Cascade Credited</th>
                <th style={{ textAlign: 'right' }}>Active Network</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td>
                  <div className="flex flex-col">
                    <span style={{ color: '#ffd700', fontWeight: 900 }}>{headerUser.username || "SEGMENT_NULL"}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>{headerUser.uhid || "AUDIT_TRACER"}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 900 }}>{headerUser.selfLp ? `${headerUser.selfLp} USDT` : "—"}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end">
                    <span style={{ fontWeight: 800, color: '#00ff88' }}>{headerUser.teamLp5Sum || "0.00"} USDT</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>Top-5 Cohort</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 900, fontSize: '16px' }}>{toNum(summary?.depositor?.totalCascadeAmount).toFixed(2)}</span>
                      <Eye className={styles.viewIcon} size={14} onClick={() => setShowHistoryModal(true)} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>Total Rewards</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 900 }}>{headerUser?.activeDirectsCount ?? summary?.depositor?.activeDirectsCount ?? "0"}</span>
                      <TrendingUp className={styles.viewIcon} size={14} onClick={() => setShowSnapshotsModal(true)} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>Direct Units</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshots Modal */}
      {showSnapshotsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Level <span>Cascade Snapshots</span></h3>
              <button onClick={() => setShowSnapshotsModal(false)} className={styles.closeBtn}><X /></button>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Depositor</span>
                <div className="font-black text-gold-400">{summary.depositor.username}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Self LP</span>
                <div className="font-black text-gold-400">{summary.depositor.selfLp ?? "0"}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Team LP 5Sum</span>
                <div className="font-black text-green-400">{summary.depositor.teamLp5Sum ?? "0"}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Active Directs</span>
                <div className="font-black text-blue-400">{summary.depositor.activeDirectsCount ?? "0"}</div>
              </div>
            </div>

            {/* Depositor header (optional) */}
            {summary?.depositor && (
              <div style={{ color: "#b3baff", fontSize: 13, marginTop: 8 }}>
                Depositor: <strong>{summary.depositor.username}</strong> (
                {summary.depositor.uhid}) · Self LP:{" "}
                <strong>{summary.depositor.selfLp ?? "0"}</strong> · Team LP:{" "}
                <strong>
                  {/* prefer teamLp5Sum; fallback teamLp3Sum */}
                  {summary.depositor.teamLp5Sum ??
                    summary.depositor.teamLp3Sum ??
                    "0"}
                </strong>{" "}
                · Active directs:
                <strong>{summary.depositor.activeDirectsCount ?? "-"}</strong>
              </div>
            )}

            {/* Snapshots table */}
            <div
              className="main-model-custom-scroll"
              style={{
                marginTop: "1rem",
                border: "1px solid #4f8cff26",
                borderRadius: 12,
                // maxHeight: "80vh",
              }}
            >
              {/* Head */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 1.4fr 1fr 1fr 1fr 0.8fr",
                  background: "rgba(79,140,255,0.08)",
                  color: "#b3baff",
                  fontSize: 12,
                  borderBottom: "1px solid rgba(79,140,255,0.2)",
                }}
              >
                <div style={{ padding: "10px 12px" }}>Level</div>
                <div style={{ padding: "10px 12px" }}>UHID</div>
                <div style={{ padding: "10px 12px" }}>Self LP</div>
                <div style={{ padding: "10px 12px" }}>Team LP</div>
                <div style={{ padding: "10px 12px" }}>Team LP (top3/top5)</div>
                <div style={{ padding: "10px 12px" }}>Directs</div>
              </div>

              {/* Rows */}
              {(summary?.snapshots || []).map((s, idx) => {
                const rowKey = s.uhid || `L${s.levelUnlocked}-${idx}`;
                const hasDirects =
                  Array.isArray(s.ActiveDirects) && s.ActiveDirects.length > 0;
                const isOpen = !!expandedLevels[rowKey];

                // prefer snapshot.teamLp when present; else sum ActiveDirects
                const computedTeamLp =
                  s.teamLp ??
                  (Array.isArray(s.ActiveDirects)
                    ? s.ActiveDirects.reduce(
                      (acc, d) => acc + Number(d?.selfLp || 0),
                      0
                    )
                    : 0);

                return (
                  <div
                    key={`${s.uhid}-${idx}`}
                    style={{
                      borderBottom: "1px solid rgba(79,140,255,0.08)",
                    }}
                  >
                    {/* main row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "0.5fr 1.4fr 1fr 1fr 1fr 0.8fr",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        L{s.levelUnlocked}
                      </div>
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {s.uhid}
                      </div>
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {Number(s.selfLp || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </div>
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {Number(computedTeamLp || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </div>
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {/* this is the top3/top5 value when the rule uses it; may be null for L1-L3 */}
                        {s.teamLpSum == null
                          ? "—"
                          : Number(s.teamLpSum).toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span>{(s.ActiveDirects || []).length}</span>
                        <span style={{ display: "flex" }}>
                          <FaEye
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasDirects) toggleRow(rowKey);
                            }}
                            style={{
                              cursor: hasDirects ? "pointer" : "not-allowed",
                              marginLeft: 8,
                              color: isOpen ? "#9ec1ff" : "#4f8cff",
                              opacity: hasDirects ? 1 : 0.5,
                            }}
                            title={
                              hasDirects
                                ? isOpen
                                  ? "Hide directs"
                                  : "Show directs"
                                : "No directs"
                            }
                            aria-expanded={isOpen}
                            aria-controls={`active-${rowKey}`}
                          />
                        </span>
                      </div>
                    </div>

                    {isOpen && hasDirects && (
                      <div
                        id={`active-${rowKey}`}
                        className="main-model-custom-scroll"
                        style={{
                          background: "rgba(79,140,255,0.05)",

                          padding: "8px 12px 12px",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            color: "#fff",
                            fontSize: 14,
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                background: "rgba(79,140,255,0.08)",
                                color: "#b3baff",
                              }}
                            >
                              <th
                                style={{
                                  padding: "8px 12px",
                                }}
                              >
                                Direct UHID
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                }}
                              >
                                Self LP
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                }}
                              >
                                Team LP
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.ActiveDirects.map((d, i2) => (
                              <tr
                                key={`${d.uhid}-${i2}`}
                                style={{
                                  borderTop: "1px solid rgba(79,140,255,0.08)",
                                }}
                              >
                                <td style={{ padding: "8px 12px" }}>
                                  {d.uhid}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                  }}
                                >
                                  {Number(d.selfLp || 0).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                  }}
                                >
                                  {Number(d.teamLp || 0).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SHOW Community Rewards History Starts Here*/}
      {showCommunityRewardsHistoryModal && (
        <div
          onClick={() => setShowCommunityRewardsHistoryModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#181f3a",
              border: "1px solid #4f8cff26",
              borderRadius: 22,
              padding: "1.25rem",
              boxShadow: "0 8px 32px #4f8cff1a",
              width: "1000px",
              maxWidth: "94%",
              maxHeight: "80vh",
              // overflow: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: "#fff", margin: 0 }}>
                Community Rewards History
              </h3>
              <button
                onClick={() => setShowCommunityRewardsHistoryModal(false)}
                style={{
                  background: "transparent",
                  color: "#b3baff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Snapshots table */}
            <div
              className="main-model-custom-scroll"
              style={{
                marginTop: "1rem",
                border: "1px solid #4f8cff26",
                borderRadius: 12,
                // maxHeight: "80vh",
              }}
            >
              {/* Head */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "17% 48% 15%",
                  background: "rgba(79,140,255,0.08)",
                  color: "#b3baff",
                  fontSize: 12,
                  borderBottom: "1px solid rgba(79,140,255,0.2)",
                }}
              >
                <div style={{ padding: "10px 12px" }}>Amount</div>
                <div style={{ padding: "10px 12px" }}>Summary</div>
                <div style={{ padding: "10px 12px" }}>Creditted On</div>
              </div>
              {/* Rows */}
              {(summary?.depositor?.cascadeRewards || []).map((reward, idx) => {
                return (
                  <div
                    key={reward._id || idx}
                    style={{
                      borderBottom: "1px solid rgba(79,140,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "0.5fr 1.4fr 1fr",
                        alignItems: "center",
                      }}
                    >
                      {/* Amount */}
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {Number(
                          reward.amount?.$numberDecimal || 0
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </div>

                      {/* Narrative / Summary */}
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {reward.narrative}
                      </div>

                      {/* Created At */}
                      <div style={{ padding: "10px 12px", color: "#fff" }}>
                        {new Date(reward.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* SHOW Community Rewards History Ends Here*/}

      {/* Team Volume Modal */}
      {showTeamLPModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ color: "#4f8cff", margin: 0 }}>
                Team Volume Details
              </h3>
              <button
                onClick={() => setShowTeamLPModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b3baff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {modalLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#b3baff",
                }}
              >
                Loading...
              </div>
            )}
            {modalError && (
              <div
                style={{
                  background: "rgba(255, 77, 77, 0.1)",
                  border: "1px solid rgba(255, 77, 77, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color: "#ff4d4d",
                }}
              >
                {modalError}
              </div>
            )}

            {modalData?.members && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "rgba(79, 140, 255, 0.1)" }}>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          color: "#b3baff",
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          color: "#b3baff",
                        }}
                      >
                        Level
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#b3baff",
                        }}
                      >
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.members.map((member, index) => {
                      if (member.isTotal) {
                        return (
                          <tr
                            key={`total-${index}`}
                            style={{
                              background: "rgba(79, 140, 255, 0.2)",
                              borderTop: "2px solid rgba(79, 140, 255, 0.3)",
                              fontWeight: "bold",
                            }}
                          >
                            <td
                              colSpan="2"
                              style={{ padding: "1rem", color: "#4f8cff" }}
                            >
                              Total Team Volume
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "right",
                                color: "#4f8cff",
                              }}
                            >
                              {formatUSDT(member.lpSum)}
                            </td>
                          </tr>
                        );
                      }

                      if (member.isLevelSum) {
                        return (
                          <tr
                            key={`sum-${index}`}
                            style={{
                              background: "rgba(79, 140, 255, 0.1)",
                              borderBottom: "1px solid rgba(79, 140, 255, 0.2)",
                            }}
                          >
                            <td
                              colSpan="2"
                              style={{
                                padding: "1rem",
                                color: "#4f8cff",
                                fontStyle: "italic",
                              }}
                            >
                              Level {member.level} Sum
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "right",
                                color: "#4f8cff",
                                fontWeight: "bold",
                              }}
                            >
                              {formatUSDT(member.lpSum)}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={index}
                          style={{
                            borderBottom: "1px solid rgba(79, 140, 255, 0.1)",
                          }}
                        >
                          <td style={{ padding: "1rem" }}>{member.username}</td>
                          <td style={{ padding: "1rem", textAlign: "center" }}>
                            Level {member.level}
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right" }}>
                            {formatUSDT(member.lp)}
                          </td>
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

      {/* Events Modal */}
      {showEventsModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ color: "#4f8cff", margin: 0 }}>Credited Events</h3>
              <button
                onClick={() => setShowEventsModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b3baff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {modalLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#b3baff",
                }}
              >
                Loading...
              </div>
            )}
            {modalError && (
              <div
                style={{
                  background: "rgba(255, 77, 77, 0.1)",
                  border: "1px solid rgba(255, 77, 77, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color: "#ff4d4d",
                }}
              >
                {modalError}
              </div>
            )}

            {modalData && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "rgba(79, 140, 255, 0.1)" }}>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          color: "#b3baff",
                        }}
                      >
                        Reward Time
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          color: "#b3baff",
                        }}
                      >
                        Deposit Time
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          color: "#b3baff",
                        }}
                      >
                        From User
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#b3baff",
                        }}
                      >
                        Deposit Amount
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#b3baff",
                        }}
                      >
                        Bonus Amount
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          color: "#b3baff",
                        }}
                      >
                        Level
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          color: "#b3baff",
                        }}
                      >
                        Tier
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#b3baff",
                        }}
                      >
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.events.map((event, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(79, 140, 255, 0.1)",
                        }}
                      >
                        <td style={{ padding: "1rem" }}>
                          {new Date(event.ts).toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          {new Date(event.triggeringDate).toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem" }}>{event.from}</td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatUSDT(event.triggeringAmount)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatUSDT(event.amount)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          Level {event.level}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          Tier {event.tier}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {(
                            parseFloat(
                              event.rate.$numberDecimal || event.rate
                            ) * 100
                          ).toFixed(0)}
                          %
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

      {/* Qualification Modal */}
      {showQualificationModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ color: "#4f8cff", margin: 0 }}>
                Qualification Requirements
              </h3>
              <button
                onClick={() => setShowQualificationModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b3baff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <div style={{ marginBottom: "1rem", color: "#b3baff" }}>
                <strong>Your Current Stats:</strong>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li>Direct Referrals: {summary.conditions?.directs || 0}</li>
                  <li>Self LP: {formatUSDT(summary.conditions?.selfLP)}</li>
                  <li>Self Lp: {formatUSDT(summary.volumes?.directVolume)}</li>
                  <li>Team Volume: {formatUSDT(summary.volumes?.teamVolume)}</li>
                </ul>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  color: "#fff",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Depth</th>
                    <th>Identity Tracer</th>
                    <th style={{ textAlign: 'right' }}>Self Balance</th>
                    <th style={{ textAlign: 'right' }}>Team Sum</th>
                    <th style={{ textAlign: 'right' }}>L5 Benchmark</th>
                    <th style={{ textAlign: 'center' }}>Network Hub</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.snapshots || []).map((s, idx) => {
                    const rowKey = s.uhid || `L${s.levelUnlocked}-${idx}`;
                    const isOpen = !!expandedLevels[rowKey];
                    return (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(79, 140, 255, 0.1)",
                        }}
                      >
                        <td style={{ padding: "1rem" }}>Tier {tierReq.tier}</td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          Level {tierReq.level}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                            color:
                              summary.conditions?.directs >= tierReq.minDirects
                                ? "#4caf50"
                                : "#ff4d4d",
                          }}
                        >
                          {tierReq.minDirects} (
                          {summary.conditions?.directs || 0})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            color:
                              parseFloat(summary.conditions?.selfLP) >=
                                tierReq.minSelfLP
                                ? "#4caf50"
                                : "#ff4d4d",
                          }}
                        >
                          {tierReq.minSelfLP} (
                          {formatUSDT(summary.conditions?.selfLP)})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            color: meetsDirectVolume ? "#4caf50" : "#ff4d4d",
                          }}
                        >
                          {formatUSDT(tierReq.directRequired)} (
                          {formatUSDT(summary.volumes?.directVolume)})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            color: meetsTeamVolume ? "#4caf50" : "#ff4d4d",
                          }}
                        >
                          {formatUSDT(tierReq.teamRequired)} (
                          {formatUSDT(summary.volumes?.teamVolume)})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                            color: isQualified ? "#4caf50" : "#ff4d4d",
                          }}
                        >
                          {isQualified ? "✓ Qualified" : "✗ Not Qualified"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reward <span>Audit History</span></h3>
              <button onClick={() => setShowHistoryModal(false)} className={styles.closeBtn}><X /></button>
            </header>
            <div className={styles.modalBody}>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th>Temporal Trace</th>
                    <th>Origin Target</th>
                    <th style={{ textAlign: 'right' }}>Yield Source</th>
                    <th style={{ textAlign: 'right' }}>Yield Target</th>
                    <th style={{ textAlign: 'center' }}>Depth</th>
                    <th style={{ textAlign: 'right' }}>Rate Vector</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.depositor?.cascadeRewards.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex flex-col">
                          <span style={{ fontSize: '11px', color: '#fff' }}>{new Date(r.ts).toLocaleDateString()}</span>
                          <span style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(r.ts).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td><span className="font-bold">{r.targetUhid}</span></td>
                      <td style={{ textAlign: 'right' }}>{toNum(r.triggeringAmount).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#ffd700', fontWeight: 900 }}>{toNum(r.amount).toFixed(4)}</td>
                      <td style={{ textAlign: 'center' }}><span className={styles.badge}>L{r.depth}</span></td>
                      <td style={{ textAlign: 'right', color: '#00ff88', fontWeight: 800 }}>{(toNum(r.rate) * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityRewardsReportPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Establishing Cascade Connection...</div>}>
      <CommunityRewardsReport />
    </Suspense>
  );
}
