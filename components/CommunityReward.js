"use client";
import React, { useEffect, useState } from "react";
import { FaGift, FaLock, FaLockOpen } from "react-icons/fa";
import { Activity } from "lucide-react";
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
        setRecords(levelRewards);
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
    <div className="card h-100" style={{ background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(15px)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px" }}>
      <div className="card-body single-card-style" style={{ padding: "25px" }}>
        <h5 className="USDT-comm-rew-title mb-4" style={{ color: "#fff", fontWeight: 800, letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "35px", height: "35px", background: "rgba(127,255,76,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fff4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          NETWORK GROWTH
        </h5>

        <div className="USDT-comm-rew-card">
          <div className="cr-list">
            {cascadeUnlockRules.map((row, index) => {
              const isLp3 = row.selfLpOrTeamLp3;
              const isLp5 = row.selfLpOrTeamLp5;
              const selfLp = isLp3?.selfLp ?? isLp5?.selfLp ?? "-";
              const teamLp = isLp3?.teamLp3 ?? isLp5?.teamLp5 ?? "-";
              const accent = accentForLevel(row.level);
              const isUnlocked = row.level <= maxUnlockedLevel;
              const rewardAmount = records?.levelTotals?.find((lt) => lt.level === row.level)?.total ?? 0;
              const isEven = index % 2 === 1;

              return (
                <div key={row.level} className={`cr-item-wrapper ${isEven ? 'cr-item-right' : 'cr-item-left'}`}>
                  <div className={`cr-card cr-${accent}`}>
                    <div className="cr-header-row">
                      <div className="cr-badge">
                        {isUnlocked ? (
                          <FaLockOpen size={10} className={`cr-unlock cr-value-${accent}`} />
                        ) : (
                          <FaLock size={10} className={`cr-lock cr-value-${accent}`} />
                        )}
                        <span className="cr-tier">LEVEL {row.level}</span>
                      </div>
                      <div className="cr-pct-badge">
                        <Activity size={10} />
                        {row.pct}%
                      </div>
                    </div>

                    <div className="cr-main-stats">
                      <div className="stat-group">
                        <div className="stat-label">Required Directs</div>
                        <div className="stat-value">{row.minDirects}</div>
                      </div>
                      <div className="stat-group">
                        <div className="stat-label">Personal LP</div>
                        <div className={`stat-value cr-value-${accent}`}>{formatNum(selfLp)}</div>
                      </div>
                    </div>

                    <div className="cr-footer-bar">
                      <div className="stat-group">
                        <div className="stat-label">Network LP</div>
                        <div className="stat-value">{formatNum(teamLp)} USDT</div>
                      </div>
                      {isUnlocked && (
                        <div className="stat-group text-end" style={{ cursor: 'pointer' }} onClick={() => {
                          const levelRewards = allRewards.filter((r) => r.narrative?.includes(`(L${row.level} `)) || [];
                          setSelectedRewards(levelRewards);
                          setOpenPopup(true);
                          setSelectedLevel(row.level);
                        }}>
                          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            Today's Earnings <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                          <div className="stat-value" style={{ color: '#7fff4c', fontWeight: 800 }}>{rewardAmount.toFixed(6)}</div>
                        </div>
                      )}
                    </div>

                    {!isUnlocked && failedLevels.find((f) => f.level === row.level) && (
                      <div className="cr-lock-overlay">
                        <div className="text-center px-3">
                          <FaLock size={20} color="rgba(255,255,255,0.3)" />
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>
                            {failedLevels.find((f) => f.level === row.level)?.reason}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cr-total">
          Total Reward Multiplier:{" "}
          <strong>{cascadeUnlockRules.reduce((s, r) => s + r.pct, 0)}%</strong>
        </div>

        <CommunityRewardsPopup
          isOpen={openPopup}
          onClose={() => setOpenPopup(false)}
          rewards={selectedRewards}
          level={selectedLevel}
        />
      </div>
    </div>
  );
}
