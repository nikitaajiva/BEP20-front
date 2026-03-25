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
    <div
      className="card h-100"
      style={{
        background: "#000000",
        borderRadius: "24px",
        border: "1px solid rgba(255, 215, 0, 0.15)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
      }}
    >
      <div className="card-body single-card-style">
        <div className="d-flex align-items-start justify-content-between">
          <div className="card-title mb-0">
            <h5
              className="mb-0"
              style={{ color: "#fff", display: "flex", gap: "3px" }}
            >
              {/* <span className="" style={{ marginTop: "-3px" }}>
                {" "}
                <Image src={CommunityBoostericon} width={40} height={40} />
              </span> */}
              Community Booster
            </h5>
          </div>
        </div>

        {/* Card list */}
        <div className="booster-list">
          {CARDS.map((c, i) => {
            // find matching total for this card's level
            const levelTotal =
              records?.levelTotals?.find((lt) => lt.level === i + 1)?.total ||
              0;
            const accent = accentForLevel(i + 1);
            return (
              <div key={i} className="booster-card">
                <span className="booster-accent" />

                <div
                  className=""
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* header */}
                  <div className="booster-head">
                    <div className="lp-col">
                      <div className="lp-label">TIER {i + 1}</div>
                      <div className="lp-val self">{c.direct}</div>
                    </div>
                    <div className="lp-col">
                      <div className="lp-label">COMMUNITY LP</div>
                      <div className="lp-val community">{c.community}</div>
                    </div>
                  </div>

                  {/* tiers row */}
                  <div className="tiers-row">
                    {c.tiers.map((t, idx) => (
                      <div key={idx} className="tier-box">
                        <div className="tier-name">{t.name}</div>
                        <div className="tier-bonus">Bonus {t.bonus}</div>

                        {/* ✅ hover overlay (dynamic value) */}
                        <div className="booster-overlay">
                          {/* Bonus chip */}
                          <div className="cr-chip mb-2">
                            <FaGift className="me-2" /> {c.tiers[0].bonus}{" "}
                            Rewards
                          </div>

                          {/* Value row */}
                          <div
                            className={`cr-value text-2xl font-bold cr-value-${accent}`}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <div>{levelTotal.toFixed(6)} USDT</div>
                              <div
                                style={{ color: "#7fff4c", cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedRewards(
                                    allRewards.filter((r) => r.level === i + 1),
                                  );
                                  setSelectedLevel(i + 1);
                                  setOpenPopup(true);
                                }}
                              >
                                <svg
                                  width={20}
                                  height={20}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  title="View Booster Rewards"
                                >
                                  <path d="M2.05 12c2.93-5 7.05-7.5 9.95-7.5S19.02 7 21.95 12c-2.93 5-7.05 7.5-9.95 7.5S4.98 17 2.05 12Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Label */}
                          <div className="cr-label mt-1">
                            Tier {i + 1} Rewards Today
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Render Popup */}
        <CommunityBoosterPopup
          isOpen={openPopup}
          onClose={() => setOpenPopup(false)}
          rewards={selectedRewards}
          level={selectedLevel}
        />
        <p className="booster-note">
          The Community LP will be calculated from the <b>First 3 Tiers</b>.
        </p>
      </div>
    </div>
  );
}
