import React from "react";
import { FaUsers, FaUserPlus, FaCrown } from "react-icons/fa";
import XRankBadge from "./XRankBadge";

const TeamStatsCard = ({ user }) => {
  const communitySize = user?.communitySize || 0;
  const directReferrals = user?.directDownlines || 0;

  const selfLp = parseFloat(user?.counters?.selfLp?.$numberDecimal || 0);
  const totalTeamLp = parseFloat(
    user?.counters?.totalTeamLp?.$numberDecimal || 0
  );

  const Community_USDT_Balance = parseFloat(totalTeamLp).toFixed(4);
  return (
    <div
      className="card h-100"
      style={{
        background: "rgba(10, 10, 10, 0.4)",
        backdropFilter: "blur(12px)",
        borderRadius: "22px",
        border: "1px solid rgba(255, 102, 0, 0.15)",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
      }}
    >
      <div className="card-body TeamStatistics">
        <div className="d-flex align-items-start justify-content-between">
          <div className="card-title mb-0">
            <h5 className="mb-0" style={{ color: "#fff" }}>
              Team Statistics
            </h5>
            <small style={{ color: "#888" }}>Your community growth</small>
          </div>
          <div
            className="card-icon rounded-circle d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(255, 102, 0, 0.1)",
              width: "45px",
              height: "45px",
            }}
          >
            <FaUsers color="#ff6600" size={24} />
          </div>
        </div>
        <div className="mt-4">
          {/* X-Rank Status */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaCrown color="#ff8c00" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Current Rank
                </h6>
                <small style={{ color: "#888" }}>
                  Your Growth Milestone
                </small>
              </div>
            </div>
            <div>
              <XRankBadge rank={user?.xRank} />
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaUserPlus color="#ff8c00" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Direct Referrals
                </h6>
                <small style={{ color: "#888" }}>
                  Users you personally sponsored
                </small>
              </div>
            </div>
            <h4 className="mb-0" style={{ color: "#ff6600" }}>
              {directReferrals}
            </h4>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaUsers color="#ff8c00" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Community Size
                </h6>
                <small style={{ color: "#888" }}>
                  Total users in your team
                </small>
              </div>
            </div>
            <h4 className="mb-0" style={{ color: "#ff6600" }}>
              {communitySize}
            </h4>
          </div>
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2 gap-2 TeamStatistics">
              <div className="d-flex align-items-center ">
                <div className="me-3">
                  <FaUsers color="#ff8c00" size={20} />
                </div>
                <div>
                  <h6 className="mb-0 " style={{ color: "#fff" }}>
                    Community USDT Balance
                  </h6>
                </div>
              </div>
              <div className="" style={{ color: "#ff6600", textAlign: "end" }}>
                <h4 className="mb-0" style={{ color: "#ff6600" }}>
                  {Community_USDT_Balance}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsCard;

