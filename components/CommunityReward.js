"use client";
import React, { useEffect, useState } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { Activity } from "lucide-react";
import "./CommunityReward.css";
import CommunityRewardsPopup from "./CommunityRewardsPopup.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formatNum = (n) =>
  n === undefined || n === null ? "-" : Number(n).toLocaleString();

const accentForLevel = (level) => {
  const accents = ["orange", "red", "amber", "fire", "gold"];
  return accents[(level - 1) % accents.length];
};

export default function CommunityReward() {
  const [nodeData, setNodeData] = useState({
    ownPower: 0,
    teamPower: 0,
    totalPower: 0,
    nodeTier: "None",
    tiers: [],
  });
  const [nodeRewards, setNodeRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");

  useEffect(() => {
    const fetchNodeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const [statusRes, rewardsRes] = await Promise.all([
          fetch(`${API_URL}/api/users/node-status`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/rewards/node`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!statusRes.ok) throw new Error("Failed to fetch node status.");
        if (!rewardsRes.ok) throw new Error("Failed to fetch node rewards.");

        const statusData = await statusRes.ok ? await statusRes.json() : {};
        const rewardsData = await rewardsRes.ok ? await rewardsRes.json() : { data: { rewards: [] } };

        if (statusData.success) {
          setNodeData(statusData);
        }
        if (rewardsData.success) {
          setNodeRewards(rewardsData.data?.rewards || []);
        }
      } catch (err) {
        console.error("❌ Error fetching node details:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNodeData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '480px', color: '#fff' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const tiersList = nodeData.tiers && nodeData.tiers.length > 0 ? nodeData.tiers : [];

  return (
    <div className="card" style={{ height: "520px", background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(15px)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", overflow: "hidden" }}>
      <div className="card-body single-card-style" style={{ padding: "15px" }}>
        <div className="cr-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h5 className="USDT-comm-rew-title" style={{ color: "#fff", fontWeight: 800, letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <div style={{ width: "35px", height: "35px", background: "rgba(127,255,76,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fff4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            NODE INFRASTRUCTURE
          </h5>
          <div className="cr-header-stats" style={{ display: 'flex', gap: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
            <div>Personal Power: <span style={{ color: '#7fff4c', fontWeight: 'bold' }}>{formatNum(nodeData.ownPower)} U</span></div>
            <div>Total Network Power: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{formatNum(nodeData.totalPower)} U</span></div>
            <div>Active Tier: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{nodeData.nodeTier}</span></div>
          </div>
        </div>

        <div className="USDT-comm-rew-card" style={{ height: "400px" }}>
          <div className="cr-list">
            {tiersList.map((row, index) => {
              const accent = accentForLevel(index + 1);
              const isUnlocked = row.isUnlocked;
              const rewardAmount = nodeRewards.filter(r => r.nodeTier === row.id).reduce((s, r) => s + parseFloat(r.amount?.$numberDecimal || r.amount || 0), 0);
              const isEven = index % 2 === 1;

              return (
                <div key={row.id} className={`cr-item-wrapper ${isEven ? 'cr-item-right' : 'cr-item-left'}`}>
                  <div className={`cr-card cr-${accent}`}>
                    <div className="cr-header-row">
                      <div className="cr-badge">
                        {isUnlocked ? (
                          <FaLockOpen size={10} className={`cr-unlock cr-value-${accent}`} />
                        ) : (
                          <FaLock size={10} className={`cr-lock cr-value-${accent}`} />
                        )}
                        <span className="cr-tier">{row.id}</span>
                      </div>
                      <div className="cr-pct-badge" style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff' }}>
                        <Activity size={10} />
                        {row.miningCut} TSC Cut
                      </div>
                    </div>

                    <div className="cr-main-stats">
                      <div className="stat-group">
                        <div className="stat-label">Upgrade Power</div>
                        <div className={`stat-value cr-value-${accent}`}>{formatNum(row.upgradePower)} U</div>
                      </div>
                      <div className="stat-group">
                        <div className="stat-label">Total Power</div>
                        <div className="stat-value">{formatNum(row.totalPower)} U</div>
                      </div>
                    </div>

                    <div className="cr-footer-bar">
                      <div className="stat-group">
                        <div className="stat-label">Fee Airdrop</div>
                        <div className="stat-value" style={{ color: '#ffd700', fontSize: '13px' }}>{row.feeAirdrop} Share</div>
                      </div>
                      {isUnlocked && (
                        <div className="stat-group text-end" style={{ cursor: 'pointer' }} onClick={() => {
                          const tierRewards = nodeRewards.filter((r) => r.nodeTier === row.id) || [];
                          setSelectedRewards(tierRewards);
                          setOpenPopup(true);
                          setSelectedLevel(row.id);
                        }}>
                          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            Today's Earnings <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                          <div className="stat-value" style={{ color: '#7fff4c', fontWeight: 800 }}>{rewardAmount.toFixed(6)}</div>
                        </div>
                      )}
                    </div>

                    {!isUnlocked && (
                      <div className="cr-lock-overlay">
                        <div className="text-center px-3">
                          <FaLock size={20} color="rgba(255,255,255,0.3)" />
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '5px', fontWeight: 'bold' }}>
                            {row.reason}
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

        <div className="cr-total" style={{ margin: 0, padding: '10px' }}>
          Network Node Infrastructure Tier Qualified: <strong style={{ color: '#00f0ff' }}>{nodeData.nodeTier}</strong>
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
