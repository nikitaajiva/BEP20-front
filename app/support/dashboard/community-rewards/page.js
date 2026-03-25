"use client";

import { useState } from "react";
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "12px",
  border: "1px solid rgba(79, 140, 255, 0.2)",
  background: "rgba(79, 140, 255, 0.1)",
  color: "#fff",
  fontSize: "1rem",
};

const buttonStyle = {
  padding: "0.75rem 2rem",
  borderRadius: "12px",
  border: "none",
  background: "#4f8cff",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background 0.2s",
  ":hover": {
    background: "#3a7ae0",
  },
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#181f3a",
  borderRadius: "22px",
  padding: "2rem",
  maxWidth: "90%",
  width: "1000px",
  maxHeight: "90vh",
  // overflow: "auto",
  position: "relative",
  color: "#fff",
};

const accordionHeaderStyle = {
  padding: "1rem",
  background: "rgba(79, 140, 255, 0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "8px 8px 0 0",
  color: "#4f8cff",
  fontWeight: "bold",
};

export default function CommunityBoosterReportPage() {
  const [filters, setFilters] = useState({
    identifier: "",
    date: new Date().toISOString().split("T")[0],
  });
  const toggleRow = (key) =>
    setExpandedLevels((prev) => ({ ...prev, [key]: !prev[key] }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const [showTeamLPModal, setShowTeamLPModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [
    showCommunityRewardsHistoryModal,
    setShowCommunityRewardsHistoryModal,
  ] = useState(false);

  const handleViewActiveDirects = () => {
    if (!summary?.snapshots?.length) {
      console.warn("[CascadeSnapshot] No snapshots to show");
      return;
    }
    setShowSnapshotsModal(true);
  };
  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleViewRewardsHistory = () => {
    if (!summary?.depositor?.cascadeRewards.length) {
      console.warn("[CascadeSnapshot] No Rewards History to show");
      return;
    }
    setShowCommunityRewardsHistoryModal(true);
  };

  // helper so logs don't show [object Object] for Decimal128

  // helper: safely coerce Decimal128 / numbers
  const toNum = (v) => {
    if (v == null) return 0;
    if (typeof v === "object" && v.$numberDecimal != null) {
      const n = parseFloat(v.$numberDecimal);
      return Number.isNaN(n) ? 0 : n;
    }
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  // helper: normalize any of the 3 shapes into something render-safe
  const normalizeCascadeResponse = (data, identifier) => {
    if (data?.depositor && Array.isArray(data?.snapshots)) {
      // TRAIL
      return { kind: "trail", headerUser: data.depositor, ...data };
    }
    if (data?.uhid && Array.isArray(data?.ActiveDirects)) {
      // SINGLE snapshot
      return {
        kind: "single",
        headerUser: { username: data.sponsorUsername ?? null, uhid: data.uhid },
        ...data,
      };
    }
    if (data?.user && data?.volumes && data?.conditions) {
      // legacy booster
      return { kind: "booster", headerUser: data.user, ...data };
    }
    // fallback
    return {
      kind: "unknown",
      headerUser: { username: null, uhid: data?.uhid ?? identifier ?? null },
      ...data,
    };
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError("Please enter user identifier (UHID or username)");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) console.warn("[CascadeSnapshot] No auth token in localStorage");

    // Decide params:
    // - Default to TRAIL via ?uhid=<identifier>
    // - If you explicitly set filters.mode === 'single', send ?sponsor=<identifier>&mode=single[&level=...]
    const wantSingle = String(filters.mode || "").toLowerCase() === "single";

    const params = wantSingle
      ? {
          sponsor: filters.identifier, // single snapshot
          mode: "single",
          ...(filters.level ? { level: filters.level } : {}),
        }
      : {
          uhid: filters.identifier, // trail snapshot (your desired behavior)
          ...(filters.startLevel ? { startLevel: filters.startLevel } : {}),
          ...(filters.maxLevel ? { maxLevel: filters.maxLevel } : {}),
          ...(filters.depositAmount
            ? { depositAmount: filters.depositAmount }
            : {}),
          date: filters.date,
        };

    console.group("[CascadeSnapshot] Request");
    console.log("→ URL", `${API_URL}/api/bonus/community/cascade/snapshot`);
    console.log("→ Params", params);
    console.log("→ Has token?", Boolean(token));
    console.time("⏱ fetch");

    try {
      setLoading(true);
      setError(null);

      const { data, status } = await axios.get(
        `${API_URL}/api/bonus/community/cascade/snapshot`,
        { params, headers: { Authorization: `Bearer ${token}` } }
      );

      console.timeEnd("⏱ fetch");
      console.groupCollapsed("[CascadeSnapshot] Raw Response");
      console.log("← HTTP", status);
      console.log("← Keys", Object.keys(data));
      console.groupEnd();

      // normalize before set to avoid "reading 'username' of undefined"
      const normalized = normalizeCascadeResponse(data, filters.identifier);

      // quick console preview per shape
      if (normalized.kind === "trail") {
        console.group("[CascadeSnapshot] TRAIL");
        console.log("depositor", normalized.headerUser);
        console.groupCollapsed("logs");
        (normalized.logs || []).forEach((l) => console.log(l));
        console.groupEnd();
        console.table(
          (normalized.snapshots || []).map((s) => ({
            levelUnlocked: s.levelUnlocked,
            uhid: s.uhid,
            pct: toNum(s.pct),
            selfLp: toNum(s.selfLp),
            teamLpSum: toNum(s.teamLpSum),
            activeDirects: (s.ActiveDirects || []).length,
          }))
        );
        console.groupEnd();
      } else if (normalized.kind === "single") {
        console.group("[CascadeSnapshot] SINGLE");
        console.log("headerUser", normalized.headerUser);
        console.log(
          "levelUnlocked:",
          normalized.levelUnlocked,
          "pct:",
          toNum(normalized.pct),
          "selfLp:",
          toNum(normalized.selfLp),
          "teamLpSum:",
          toNum(normalized.teamLpSum)
        );
        console.table(
          (normalized.ActiveDirects || []).slice(0, 20).map((d) => ({
            uhid: d.uhid,
            username: d.username,
            level: d.level,
            selfLp: toNum(d.selfLp),
          }))
        );
        console.groupEnd();
      } else if (normalized.kind === "booster") {
        console.group("[CascadeSnapshot] BOOSTER (legacy)");
        console.log("user", normalized.headerUser);
        console.log("volumes", normalized.volumes);
        console.log("conditions", normalized.conditions);
        console.groupEnd();
      } else {
        console.warn("[CascadeSnapshot] Unknown response shape", normalized);
      }

      setSummary(normalized); // ← store the normalized shape
    } catch (err) {
      console.timeEnd("⏱ fetch");
      console.groupEnd(); // Request
      console.error("[CascadeSnapshot] Error", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      setError(err?.response?.data?.msg || err.message || "Fetch failed");
      setSummary(null);
    } finally {
      setLoading(false);
      console.groupEnd(); // Request
    }
  };

  const formatXRP = (amount) => {
    if (!amount) return "0.000000 XRP";
    // Handle Decimal128 format
    const value = amount.$numberDecimal
      ? parseFloat(amount.$numberDecimal)
      : parseFloat(amount);
    if (isNaN(value)) return "0.000000 XRP";
    return value === 0 ? "0.000000 XRP" : `${value.toFixed(6)} XRP`;
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
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          padding: "2rem",
          color: "white",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#4f8cff", marginBottom: "1.5rem" }}>
          Community Rewards Report
        </h2>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#b3baff",
              }}
            >
              Date
            </label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#b3baff",
              }}
            >
              User Identifier
            </label>
            <input
              type="text"
              placeholder="User _id | uhid | username"
              name="identifier"
              value={filters.identifier}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Loading…" : "Search"}
            </button>
          </div>
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
                      {formatXRP(summary.conditions?.selfLP)}
                    </div>
                    <FaEye
                      style={{ marginLeft: 6, color: "#4f8cff" }}
                      title="View qualification details"
                    />
                  </td> */}
                  {/* <td style={{ padding: "1rem", textAlign: "right" }}>
                    {formatXRP(summary.credited?.total)}
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
      {showSnapshotsModal && (
        <div
          onClick={() => setShowSnapshotsModal(false)}
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
                Level-by-Level Snapshots
              </h3>
              <button
                onClick={() => setShowSnapshotsModal(false)}
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
                              {formatXRP(member.lpSum)}
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
                              {formatXRP(member.lpSum)}
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
                            {formatXRP(member.lp)}
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
                          {formatXRP(event.triggeringAmount)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatXRP(event.amount)}
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
                  <li>Self LP: {formatXRP(summary.conditions?.selfLP)}</li>
                  <li>Self Lp: {formatXRP(summary.volumes?.directVolume)}</li>
                  <li>Team Volume: {formatXRP(summary.volumes?.teamVolume)}</li>
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
                  <tr style={{ background: "rgba(79, 140, 255, 0.1)" }}>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        color: "#b3baff",
                      }}
                    >
                      Tier
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
                      Min Directs
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        color: "#b3baff",
                      }}
                    >
                      Min Self LP
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        color: "#b3baff",
                      }}
                    >
                      Direct Volume
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        color: "#b3baff",
                      }}
                    >
                      Team Volume
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#b3baff",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      tier: 10000,
                      level: 1,
                      minDirects: 1,
                      minSelfLP: 9,
                      directRequired: 2000,
                      teamRequired: 10000,
                      baseRate: 0.12,
                    },
                    {
                      tier: 20000,
                      level: 2,
                      minDirects: 2,
                      minSelfLP: 9,
                      directRequired: 6000,
                      teamRequired: 20000,
                      baseRate: 0.1,
                    },
                    {
                      tier: 30000,
                      level: 3,
                      minDirects: 3,
                      minSelfLP: 9,
                      directRequired: 12000,
                      teamRequired: 30000,
                      baseRate: 0.07,
                    },
                  ].map((tierReq, index) => {
                    const meetsBasicReqs =
                      summary.conditions?.directs >= tierReq.minDirects &&
                      parseFloat(summary.conditions?.selfLP) >=
                        tierReq.minSelfLP;
                    const meetsDirectVolume =
                      parseFloat(summary.volumes?.directVolume) >=
                      tierReq.directRequired;
                    const meetsTeamVolume =
                      parseFloat(summary.volumes?.teamVolume) >=
                      tierReq.teamRequired;
                    const isQualified =
                      meetsBasicReqs && meetsDirectVolume && meetsTeamVolume;

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
                          {formatXRP(summary.conditions?.selfLP)})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            color: meetsDirectVolume ? "#4caf50" : "#ff4d4d",
                          }}
                        >
                          {formatXRP(tierReq.directRequired)} (
                          {formatXRP(summary.volumes?.directVolume)})
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            color: meetsTeamVolume ? "#4caf50" : "#ff4d4d",
                          }}
                        >
                          {formatXRP(tierReq.teamRequired)} (
                          {formatXRP(summary.volumes?.teamVolume)})
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

              <div
                style={{
                  marginTop: "1rem",
                  color: "#b3baff",
                  fontSize: "0.9em",
                }}
              >
                <p>
                  Note: To qualify for a tier, you must meet ALL requirements:
                </p>
                <ol style={{ paddingLeft: "1.5rem" }}>
                  <li>
                    Have the minimum number of direct referrals for that level
                  </li>
                  <li>Maintain the minimum self LP balance</li>
                  <li>
                    Meet the direct volume requirement (from Level 1 team)
                  </li>
                  <li>Meet the team volume requirement (from Levels 1-3)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
