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
  overflow: "auto",
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

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Put this near your other utils (top of the file is fine)
  const toNum = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v) || 0;
    if (typeof v === "object" && "$numberDecimal" in v)
      return Number(v.$numberDecimal) || 0;
    try {
      return Number(v.toString());
    } catch {
      return 0;
    }
  };

  const handleSearch = async () => {
    if (!filters.identifier) {
      setError("Please enter user identifier");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) console.warn("[RewardsSummary] No auth token in localStorage");

    // Build params (optionally include ?view=cascade if your UI sets filters.view)
    const params = {
      user: filters.identifier,
      date: filters.date, // expect YYYY-MM-DD
      ...(filters.view ? { view: filters.view } : {}), // e.g. 'cascade' or 'unlock'
    };

    console.group("[RewardsSummary] Request");
    console.log("→ URL", `${API_URL}/api/bonus/community/rewards/summary`);
    console.log("→ Params", params);
    console.log("→ Has token?", Boolean(token));
    console.time("⏱ fetch");
    try {
      setLoading(true);
      setError(null);

      const { data, status } = await axios.get(
        `${API_URL}/api/bonus/community/rewards/summary`,
        { params, headers: { Authorization: `Bearer ${token}` } }
      );

      console.timeEnd("⏱ fetch");
      console.groupCollapsed("[RewardsSummary] Response");
      console.log("← HTTP", status);
      console.log("← Keys", Object.keys(data));

      // Shape 1: Booster-style (user/volumes/conditions/qualifiedTiers/credited[/cascade])
      if (data.user && data.volumes && data.conditions) {
        console.log("Detected: Booster-style summary");

        console.log("user", data.user);
        console.log("volumes", data.volumes);
        console.log("conditions", data.conditions);

        if (Array.isArray(data.qualifiedTiers)) {
          console.table(
            data.qualifiedTiers.map((t) => ({
              tier: t.tier,
              bonusLevel: t.bonusLevel,
              rate: toNum(t.rate),
            }))
          );
        }

        if (data.credited) {
          const creditedTotalNum = toNum(data.credited.total);
          console.log("credited.total (num)", creditedTotalNum);
          if (
            Array.isArray(data.credited.events) &&
            data.credited.events.length
          ) {
            console.table(
              data.credited.events.slice(0, 10).map((e) => ({
                ts: e.ts,
                from: e.from,
                level: e.level,
                tier: e.tier,
                amount: toNum(e.amount),
                rate: toNum(e.rate),
                trigAmt: toNum(e.triggeringAmount),
              }))
            );
          } else {
            console.log("credited.events: []");
          }
        }

        if (data.cascade) {
          console.log("cascade.levelUnlocked", data.cascade.levelUnlocked);
          console.log("cascade.pct", toNum(data.cascade.pct));
          if (Array.isArray(data.cascade.ActiveDirects)) {
            console.table(
              data.cascade.ActiveDirects.slice(0, 10).map((d) => ({
                uhid: d.uhid,
                username: d.username,
                level: d.level,
                selfLp: toNum(d.selfLp),
              }))
            );
          }
        }
      }

      // Shape 2: Cascade-only (when ?view=cascade)
      if (data.uhid && Array.isArray(data.ActiveDirects)) {
        console.log("Detected: Cascade-only object");
        console.log(
          "levelUnlocked",
          data.levelUnlocked,
          "pct",
          toNum(data.pct)
        );
        console.table(
          data.ActiveDirects.slice(0, 10).map((d) => ({
            uhid: d.uhid,
            username: d.username,
            level: d.level,
            selfLp: toNum(d.selfLp),
          }))
        );
      }

      console.groupEnd(); // Response
      setSummary(data);
    } catch (err) {
      console.timeEnd("⏱ fetch");
      console.groupEnd(); // Request
      console.error("[RewardsSummary] Error", {
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
                    User
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
                      textAlign: "left",
                      color: "#b3baff",
                    }}
                  >
                    Qualified Tiers
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      color: "#b3baff",
                    }}
                  >
                    Total Credited
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem" }}>
                    {summary.user.username} ({summary.user.uhid})
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {formatUSDT(summary.volumes?.directVolume)}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {formatUSDT(summary.volumes?.teamVolume)}
                    {/* <FaEye 
                      style={{ cursor: 'pointer', marginLeft: 6, color: '#4f8cff' }} 
                      title="View team details"
                      onClick={handleViewTeamLP}
                    /> */}
                  </td>
                  <td
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
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
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
                  <li>
                    Direct Volume: {formatUSDT(summary.volumes?.directVolume)}
                  </li>
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
