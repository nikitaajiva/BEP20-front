import "./XBonusCard.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import Image from "next/image";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import UnlockStatusPopop from "./UnlockStatus";
import { FaGift, FaEye } from "react-icons/fa";
import XBonusPopup from "./XBonusCardPopup";

// import XBonus from "../public/assets/images/XBonus.png";
const XBonusBanner = () => {
  const [ledgerDetails, setLedgerDetails] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [ledgerError, setLedgerError] = useState("");
  const [Referrals, setReferrals] = useState([]);
  const [Legs, setLegs] = useState([]);
  const [sumselflp, setSumselflp] = useState(null);

  // ✅ ADDED STATES
  const [showXBonusPopup, setShowXBonusPopup] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const { user, API_URL } = useAuth();

  const topThreeLegs = (referrals) => {
    const sorted = [...referrals].sort((a, b) => b.teamLp - a.teamLp);
    const [leg1, leg2, ...rest] = sorted;

    const combinedSelfLp = rest.reduce((sum, u) => sum + (u.selfLp || 0), 0);
    const combinedTeamLp = rest.reduce((sum, u) => sum + (u.teamLp || 0), 0);
    const combinedMembers = rest.map((u) => u.username);

    return {
      leg1: {
        username: leg1.username,
        uhid: leg1.uhid,
        selfLp: leg1.selfLp,
        team: leg1.teamLp,
        teamLp: leg1.selfLp + leg1.teamLp,
      },
      leg2: {
        username: leg2.username,
        uhid: leg2.uhid,
        selfLp: leg2.selfLp,
        team: leg2.teamLp,
        teamLp: leg2.selfLp + leg2.teamLp,
      },
      leg3: {
        username: "Others Combined",
        selfLp: combinedSelfLp,
        team: combinedTeamLp,
        teamLp: combinedSelfLp + combinedTeamLp,
        members: combinedMembers,
      },
    };
  };

  const rawXBonusLevels = [
    { level: "X", self: "1,000 USDT", community: "15,000 USDT", color: "#6C5CE7" },
    { level: "X1", self: "1,500 USDT", community: "30,000 USDT", color: "#00d6c4" },
    { level: "X2", self: "3,000 USDT", community: "120,000 USDT", color: "#d34be6" },
    { level: "X3", self: "6,000 USDT", community: "300,000 USDT", color: "#00d19b" },
    { level: "X4", self: "12,000 USDT", community: "900,000 USDT", color: "#f1802f" },
    { level: "X5", self: "20,000 USDT", community: "1,500,000 USDT", color: "#007aff" },
  ];

  const fetchReferrals = useCallback(
    async (targetUhid, targetUsername, level, search = null) => {
      if (!API_URL || !targetUhid || !user?.uhid) return;
      let url = "";
      const viewerUhid = user.uhid;

      if (level && level > 0) {
        url = `${API_URL}/hierarchy/users/${targetUhid}/descendants/level/${level}?viewerUhid=${viewerUhid}`;
      } else {
        url = `${API_URL}/hierarchy/users/${targetUhid}/descendants?viewerUhid=${viewerUhid}`;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const referralsData =
          level && level > 0 ? data.descendants_at_level : data.descendants;

        setReferrals(referralsData || []);
        setLegs(topThreeLegs(referralsData));
       //  setSumselflp("0.00");
     setSumselflp(data.levelSelfLpSum);
      } catch (err) {
        setSumselflp("0.00");
      }
    },
    [API_URL, user]
  );

  const fetchLedgerDetails = useCallback(async () => {
    if (!user) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/ledger`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLedgerDetails(data.data);
      }
    } catch (error) {
      setLedgerError(error.message);
    } finally {
      setLoadingLedger(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    fetchLedgerDetails();
  }, [fetchLedgerDetails]);

  useEffect(() => {
    if (user?.uhid && user?.username) {
      fetchReferrals(user.uhid, user.username, 0);
    }
  }, [fetchReferrals, user]);

  const unlockedIndex = rawXBonusLevels.findIndex(
    (l) => l.level === user?.xRank
  );

  const xBonusLevels = rawXBonusLevels.map((item, index) => ({
    ...item,
    locked: index > unlockedIndex,
  }));

  const [showPopup, setShowPopup] = useState(false);

  const handleLockedClick = (index) => {
    const firstLockedIndex = xBonusLevels.findIndex((x) => x.locked);
    if (index === firstLockedIndex) {
      setShowPopup(true);
    }
  };

  const nextLockedIndex = xBonusLevels.findIndex((x) => x.locked);
  const nextLocked = xBonusLevels[nextLockedIndex];

  const parseUSDT = (val) => parseInt(val.replace(/,/g, "").replace(" USDT", ""));
  const unlockData = nextLocked
    ? {
        requiredSelfLp: parseXrp(nextLocked.self),
        userSelfLp: parseFloat(ledgerDetails?.lpWallet?.balance || 0).toFixed(2),
        requiredCommunityLp: parseXrp(nextLocked.community),
        legs: Legs,
        isUnlocked: false,
      }
    : null;

  return (
    <>
      <div className="x-bonus-container">
        <div
          className="x-bonus-header"
          style={{ color: "#fff", display: "flex", gap: "3px" }}
        >
          {/* <span className="" style={{ marginTop: "-10px" }}>
            <Image src={XBonus} width={40} height={40} />
          </span> */}
          <h5 className="mb-0">X-Bonus</h5>
        </div>

        <div className="mt-4 " style={{ display: "flex" }}>
          <div className="x-bonus-right mt-4 ">
            {xBonusLevels.map((item, index) => (
              <div
                  key={index}
                  className={`x-bonus-bar-content ${item.locked ? "locked" : ""}`}
                  onClick={() => handleLockedClick(index)}
                  style={{
                    cursor: item.locked ? "pointer" : "default",
                    "--x-color": item.color,   // ✅ IMPORTANT
                  }}
                >

                <div className="x-bonus-tag">
                  <span
                    className="x-bonus-lock-icon"
                    style={{ color: item.color }}
                  >
                    {item.locked ? <FaLock /> : <FaLockOpen />}
                  </span>
                  <span className="x-bonus-level" style={{ color: item.color }}>
                    {item.level}
                  </span>
                </div>

                <div>
                  <h3 className="x-bonus-left-title">
                    Self <span>LP</span>
                  </h3>
                  <div
                    className="x-bonus-self-value"
                    style={{ color: item.color }}
                  >
                    {item.self}
                  </div>
                </div>

                <div className="x-bonus-community">
                  <div className="x-bonus-label">COMMUNITY LP</div>
                  <div className="x-bonus-amount">{item.community}</div>
                </div>
            
                <div className="xbonus-hover-overlay">
                  {/* Chip */}
                  <div className="cr-chip mb-2">
                    <FaGift style={{ marginRight: "6px" }} />
                    X Bonus Rewards
                  </div>

                  {/* Value */}
                  <div className="cr-value">
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <div>
                        {Number(
                          // ledgerDetails?.daily_rewards?.XBONUS || 0
                          0
                        ).toFixed(6)}{" "}
                        USDT
                      </div>

                       <FaEye
                      className="xbonus-eye"
                      title="View X Bonus Rewards"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLevel(item.level);
                        setShowXBonusPopup(true);
                      }}
                    />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

       {/* Unlock Status Popup */}
      {showPopup && unlockData && (
        <div
          className="xbonus-modal-overlay"
          onClick={() => setShowPopup(false)}
        >
          <div className="xbonus-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="xbonus-modal-close"
              onClick={() => setShowPopup(false)}
            >
              ✖
            </button>
            <UnlockStatusPopop
              unlockData={unlockData}
              xrankLabel={nextLocked?.level}
            />
          </div>
        </div>
      )}

     <XBonusPopup
        isOpen={showXBonusPopup}
        onClose={() => setShowXBonusPopup(false)}
        level={selectedLevel}
      />
    </>
  );
};

export default XBonusBanner;
