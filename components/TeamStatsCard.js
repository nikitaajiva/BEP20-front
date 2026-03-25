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

  const Community_XRP_Balance = parseFloat(totalTeamLp).toFixed(4);
  return (
    <div
      className="card h-100"
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
      }}
    >
      <div className="card-body TeamStatistics">
        <div className="d-flex align-items-start justify-content-between">
          <div className="card-title mb-0">
            <h5 className="mb-0" style={{ color: "#fff" }}>
              Team Statistics
            </h5>
            <small style={{ color: "#b3baff" }}>Your community growth</small>
          </div>
          <div
            className="card-icon rounded-circle d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              width: "45px",
              height: "45px",
            }}
          >
            <FaUsers color="#4f8cff" size={24} />
          </div>
        </div>
        <div className="mt-4">
          {/* X-Rank Status */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaCrown color="#b3baff" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Current Rank
                </h6>
                <small style={{ color: "#b3baff" }}>
                  Your achievement level
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
                <FaUserPlus color="#b3baff" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Direct Referrals
                </h6>
                <small style={{ color: "#b3baff" }}>
                  Users you personally sponsored
                </small>
              </div>
            </div>
            <h4 className="mb-0" style={{ color: "#4f8cff" }}>
              {directReferrals}
            </h4>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaUsers color="#b3baff" size={20} />
              </div>
              <div>
                <h6 className="mb-0" style={{ color: "#fff" }}>
                  Community Size
                </h6>
                <small style={{ color: "#b3baff" }}>
                  Total users in your team
                </small>
              </div>
            </div>
            <h4 className="mb-0" style={{ color: "#4f8cff" }}>
              {communitySize}
            </h4>
          </div>
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2 gap-2 TeamStatistics">
              <div className="d-flex align-items-center ">
                <div className="me-3">
                  <FaUsers color="#b3baff" size={20} />
                </div>
                <div>
                  <h6 className="mb-0 " style={{ color: "#fff" }}>
                    Community USDT Balance
                  </h6>
                </div>
              </div>
              <div className="" style={{ color: "#4f8cff", textAlign: "end" }}>
                <h4 className="mb-0" style={{ color: "#4f8cff" }}>
                  {Community_XRP_Balance}
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
