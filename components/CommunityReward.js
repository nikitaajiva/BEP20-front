"use client";
import React, { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import { FaLock, FaLockOpen } from "react-icons/fa";
import "./CommunityReward.css";
import CommunityRewardsPopup from "./CommunityRewardsPopup.js";
// Raw data
const cascadeUnlockRules = [
  {
    level: 1,
    pct: 12,
    minDirects: 1,
    selfLpOrTeamLp3: { selfLp: 9, teamLp3: 9 },
  },
  {
    level: 2,
    pct: 10,
    minDirects: 2,
    selfLpOrTeamLp3: { selfLp: 9, teamLp3: 9 },
  },
  {
    level: 3,
    pct: 7,
    minDirects: 3,
    selfLpOrTeamLp3: { selfLp: 9, teamLp3: 9 },
  },
  {
    level: 4,
    pct: 5,
    minDirects: 4,
    selfLpOrTeamLp3: { selfLp: 1500, teamLp3: 7500 },
  },
  {
    level: 5,
    pct: 5,
    minDirects: 5,
    selfLpOrTeamLp3: { selfLp: 1500, teamLp3: 7500 },
  },
  {
    level: 6,
    pct: 5,
    minDirects: 5,
    selfLpOrTeamLp3: { selfLp: 1500, teamLp3: 7500 },
  },
  {
    level: 7,
    pct: 3,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 3000, teamLp5: 15000 },
  },
  {
    level: 8,
    pct: 3,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 3000, teamLp5: 15000 },
  },
  {
    level: 9,
    pct: 3,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 3000, teamLp5: 15000 },
  },
  {
    level: 10,
    pct: 3,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 3000, teamLp5: 15000 },
  },
  {
    level: 11,
    pct: 5,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 4000, teamLp5: 30000 },
  },
  {
    level: 12,
    pct: 5,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 4000, teamLp5: 30000 },
  },
  {
    level: 13,
    pct: 5,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 4000, teamLp5: 30000 },
  },
  {
    level: 14,
    pct: 7,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 5000, teamLp5: 50000 },
  },
  {
    level: 15,
    pct: 10,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 5000, teamLp5: 50000 },
  },
  {
    level: 16,
    pct: 12,
    minDirects: 5,
    selfLpOrTeamLp5: { selfLp: 5000, teamLp5: 50000 },
  },
];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const formatNum = (n) =>
  n === undefined || n === null ? "-" : Number(n).toLocaleString();

const accentForLevel = (level) => {
  const accents = ["green", "purple", "teal", "orange", "blue"];
  return accents[(level - 1) % accents.length];
};
function parseNarrative(narrative) {
  if (!narrative) return null;
  const match = narrative.match(/\(L(\d+)/); // captures "Lx"
  return match ? parseInt(match[1], 10) : null;
}
async function groupCascadeRewards(rewards) {
  const levelMap = new Map();
  let grandTotal = 0;

  rewards.forEach((r) => {
    const level = r.level ?? parseNarrative(r.narrative); // ✅ fallback to narrative
    if (!level) return;

    const amt = parseFloat(r.amount?.$numberDecimal || r.amount);
    grandTotal += amt;

    const current = levelMap.get(level) || 0;
    levelMap.set(level, current + amt);
  });

  return {
    levelTotals: [...levelMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([level, total]) => ({ level, total })),
    grandTotal,
  };
}
export default function CommunityReward() {
  const [records, setRecords] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState([]);
  
  const [allRewards, setAllRewards] = useState([]);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const [failedLevels, setFailedLevels] = useState([]); // 🔹 added state
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedRewards, setSelectedRewards] = useState([]);
  useEffect(() => {
    const fetchCascadeRules = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const finalUrl = `${API_URL}/api/rewards/cascade`;
        console.log("Fetching Cascade Rewards URL:", finalUrl);

        const response = await fetch(finalUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(
            responseData.message || "Failed to fetch cascade rewards."
          );
        }
        setMaxUnlockedLevel(responseData.data.maxUnlockedLevel);
        setFailedLevels(responseData.data.failedLevels || []);
        setAllRewards(responseData.data.rewards || []);
        const levelRewards = await groupCascadeRewards(
          responseData.data.rewards
        );
        console.log(levelRewards, "levelRewards=================");
        setRecords(levelRewards); // assuming API returns array of rules
      } catch (err) {
        console.error("❌ Error fetching cascade rules:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCascadeRules();
  }, []);

  return (
    <div className="card h-100">
      <div
        className="card-body single-card-style"
        style={{ overflowX: "auto" }}
      >
        <h5 className="xrp-comm-rew-title" style={{ color: "#b3baff" }}>
          <FaGift className="me-2" />
          Community Rewards
        </h5>

        {/* keep your container + scroll area */}
        <div className="xrp-comm-rew-card">
          {/* card list instead of table */}
          <div className="cr-list">
            {cascadeUnlockRules.map((row) => {
              const isLp3 = row.selfLpOrTeamLp3;
              const isLp5 = row.selfLpOrTeamLp5;
              const selfLp = isLp3?.selfLp ?? isLp5?.selfLp ?? "-";
              const teamLp = isLp3?.teamLp3 ?? isLp5?.teamLp5 ?? "-";
              const accent = accentForLevel(row.level);
              const isUnlocked = row.level <= maxUnlockedLevel;
              const rewardAmount =
                records?.levelTotals?.find((lt) => lt.level === row.level)
                  ?.total ?? 0;
              return (
                <div key={row.level} className={`cr-card cr-${accent}`}>
                  <div className="cr-accent" />

                  {/* Overlay content */}
                  {isUnlocked && (
                    <div className="cr-overlay">
                      <div className="cr-chip mb-2">
                        <FaGift className="me-2" /> {row.pct}% Rewards
                      </div>
                      <div
                        className={`cr-value cr-value-${accent} text-2xl font-bold`}
                      >
                        <div
                          className=""
                          style={{ display: "flex", gap: "5px" }}
                        >
                          <div> {rewardAmount.toFixed(6) || "0.0"} USDT </div>
                          <div
                            style={{
                              color: "#7fff4c",
                            }}
                           onClick={() => {
                                          const levelRewards =
                                            allRewards.filter((r) =>
                                               r.narrative.includes(`(L${row.level} `)
                                            ) || [];
                                          setSelectedRewards(levelRewards);
                                          setOpenPopup(true);
                                          setSelectedLevel(row.level);
                                        }}
                          >
                            <svg
                              width={20}
                              Height={20}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              style={{ cursor: "pointer" }}
                              title="View Community Rewards"
                            >
                              <path d="M2.05 12c2.93-5 7.05-7.5 9.95-7.5S19.02 7 21.95 12c-2.93 5-7.05 7.5-9.95 7.5S4.98 17 2.05 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="cr-label mt-1">
                        Level {row.level} Rewards Today
                      </div>
                    </div>
                  )}
                            {!isUnlocked &&
                  failedLevels.find((f) => f.level === row.level) && (
                    <div className="cr-overlay">
                      <div className={`cr-chip mb-2 text-red-400 cr-value-${accent}`}>
                        <FaLock className="me-2" /> Locked
                      </div>
                      <div className="cr-value text-sm text-red-300">
                        {failedLevels.find((f) => f.level === row.level)?.reason}
                      </div>
                      <div className="cr-label mt-1">
                        Level {row.level} Requirement Not Met
                      </div>
                    </div>
                  )}
                  {/* Main content */}
                  <div className="cr-main">
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="cr-badge">
                        {isUnlocked ? (
                          <FaLockOpen
                            className={`cr-unlock cr-tier-${accent}`}
                          />
                        ) : (
                          <FaLock className={`cr-lock cr-tier-${accent}`} />
                        )}
                        <span className={`cr-tier cr-tier-${accent}`}>
                          Tier {row.level}
                        </span>
                      </div>
                      <div className="cr-sub">
                        <span>Min Active Directs:</span>{" "}
                        <div>{row.minDirects}</div>
                      </div>
                    </div>

                    {/* metrics */}
                    <div style={{ display: "flex", paddingTop: "10px" }}>
                      <div className="cr-meta">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div>
                            <div className="cr-chip">
                              <FaGift className="me-2" />
                              {row.pct}%
                            </div>
                            <div className="cr-label">Rewards</div>
                          </div>
                        </div>
                      </div>
                      <div className="cr-metrics">
                        <div className="cr-item">
                          <div className="cr-label">Self LP</div>
                          <div className={`cr-value cr-value-${accent}`}>
                            {formatNum(selfLp)} USDT
                          </div>
                        </div>
                        <h6 className="m-0">or</h6>
                        <div
                          className="cr-item cr-item-second"
                          style={{ marginLeft: "15px" }}
                        >
                         <div className="cr-label">
                          Community LP {isLp3 ? "(T1-T3)" : isLp5 ? "(T1-T5)" : ""}
                        </div>
                          <div className="cr-value">
                            {formatNum(teamLp)} USDT
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* ✅ Render Popup */}
       <CommunityRewardsPopup
          isOpen={openPopup}
          onClose={() => setOpenPopup(false)}
          rewards={selectedRewards}
          level={selectedLevel}
 
        />
        {/* total row under cards (optional) */}
        <div className="cr-total">
          Total Community Rewards:{" "}
          <strong>{cascadeUnlockRules.reduce((s, r) => s + r.pct, 0)}%</strong>
        </div>
      </div>
    </div>
  );
}
