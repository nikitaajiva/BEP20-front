"use client";
import React, { useState, useEffect } from "react";
import { FaGift } from "react-icons/fa";
import { FaLock, FaLockOpen } from "react-icons/fa";
import "./communitybooster.css";
import CommunityBoosterPopup from "./CommunityBoosterPopup.js";
// import CommunityBoostericon from "../public/assets/images/CommunityBoostericon2.png";
const CARDS = [
  {
    direct: "2K USDT",
    community: "10K USDT",
    tiers: [{ name: "Tier 1", bonus: "12%" }],
  },
  {
    direct: "6K USDT",
    community: "20K USDT",
    tiers: [{ name: "Tier 2", bonus: "10%" }],
  },
  {
    direct: "12K USDT",
    community: "30K USDT",
    tiers: [{ name: "Tier 3", bonus: "7%" }],
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
function groupRewardsByTierAndLevel(rewards) {
  const grouped = {};
  const sums = {};

  rewards.forEach((r) => {
    const tier = r.tier;
    const level = r.level;
    const amt = parseFloat(r.amount?.$numberDecimal || r.amount || 0);

    // ✅ Ensure tier object exists
    if (!grouped[tier]) grouped[tier] = {};
    if (!sums[tier]) sums[tier] = { total: 0 };

    // ✅ Ensure level array + sum exists
    const levelKey = `level${level}`;
    if (!grouped[tier][levelKey]) grouped[tier][levelKey] = [];
    if (!sums[tier][levelKey]) sums[tier][levelKey] = 0;

    // ✅ Push full record
    grouped[tier][levelKey].push({
      amount: amt,
      tier,
      level,
      narrative: r.narrative,
    });

    // ✅ Update sums
    sums[tier][levelKey] += amt;
    sums[tier].total += amt;
  });

  return { grouped, sums };
}

export default function Communitybooster() {
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

        const finalUrl = `${API_URL}/api/rewards/booster`;

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
            responseData.message || "Failed to fetch cascade rewards.",
          );
        }
        setMaxUnlockedLevel(responseData.data.maxUnlockedLevel);
        setFailedLevels(responseData.data.failedLevels || []);
        setAllRewards(responseData.data.rewards || []);
        const levelRewards = await groupCascadeRewards(
          responseData.data.rewards,
        );

        const { grouped, sums } = groupRewardsByTierAndLevel(
          responseData.data.rewards,
        );

        console.log("Grouped:", grouped);
        console.log("Sums:", sums);

        //  setAllRewards(grouped);   // detailed arrays for popup
        setRecords(sums);
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
  const tiersPresent = Object.keys(allRewards).map((t) => parseInt(t, 10));
  const blockToShow = tiersPresent.length; // 1, 2, or 3

  return (
    <div className="booster-shell">
      <div className="booster-title-box">
        <h5>Community Booster</h5>
      </div>

      <div className="booster-list">
        {CARDS.map((c, i) => {
          const levelTotal = records?.levelTotals?.find((lt) => lt.level === i + 1)?.total || 0;
          const accent = accentForLevel(i + 1);
          const tierInfo = c.tiers[0];

          return (
            <div key={i} className={`booster-card tier-${i + 1}`}>
              <div className="booster-card-header">
                <span className="booster-tier-label">TIER {i + 1}</span>
                <span className="booster-bonus-pct">Bonus: {tierInfo.bonus}</span>
              </div>

              <div className="booster-card-body">
                <div className="booster-val-row">
                  <div className="booster-val-large">{c.direct}</div>
                </div>
                <div className="booster-divider" />
                <div className="booster-val-row">
                  <div className="booster-val-large">{c.community}</div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="booster-overlay">
                <div className="cr-chip">
                  <FaGift size={10} />
                  Tier {i + 1} Rewards
                </div>
                <div className="cr-value">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>{levelTotal.toFixed(6)} USDT</span>
                    <div
                      className="eye-icon-wrapper"
                      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRewards(allRewards.filter((r) => r.level === i + 1));
                        setSelectedLevel(i + 1);
                        setOpenPopup(true);
                       }}
                    >
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="View Details">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="cr-label">Today's Earnings</div>
              </div>
            </div>
          );
        })}
      </div>

      <CommunityBoosterPopup
        isOpen={openPopup}
        onClose={() => setOpenPopup(false)}
        rewards={selectedRewards}
        level={selectedLevel}
      />
      
      <p className="booster-footer-note">
        The Community LP will be calculated from the First 3 Tiers.
      </p>
    </div>
  );
}
