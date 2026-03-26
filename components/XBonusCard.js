import styles from "./XBonusCard.module.css";
import { 
  FaLock, 
  FaLockOpen, 
  FaGift, 
  FaEye, 
  FaBolt, 
  FaHandHoldingUsd, 
  FaFire, 
  FaGem, 
  FaRocket, 
  FaCrown 
} from "react-icons/fa";
import Image from "next/image";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import UnlockStatusPopop from "./UnlockStatus";
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
        requiredSelfLp: parseUSDT(nextLocked.self),
        userSelfLp: parseFloat(ledgerDetails?.lpWallet?.balance || 0).toFixed(2),
        requiredCommunityLp: parseUSDT(nextLocked.community),
        legs: Legs,
        isUnlocked: false,
      }
    : null;
  return (
    <>
      <div className={styles.xBonusContainer}>
        <div className={styles.xBonusHeader}>
          <h5 className="mb-0">X-BONUS</h5>
        </div>

        <div className={styles.xBonusListWrapper}>
          <div className={styles.xBonusList}>
            {xBonusLevels.map((item, index) => {
              // Select an icon for the hexagon based on index
              const HexIcon = [FaBolt, FaHandHoldingUsd, FaFire, FaGem, FaRocket, FaCrown][index] || FaGem;
              const LevelIcon = item.locked ? FaLock : FaLockOpen;

              return (
                <div
                  key={index}
                  className={`${styles.xBonusRow} ${item.locked ? styles.locked : ""}`}
                  onClick={() => handleLockedClick(index)}
                  style={{
                    cursor: item.locked ? "pointer" : "default",
                    "--x-color": item.color,
                  }}
                >
                  {/* Left Side: Level Chevron Card */}
                  <div className={styles.levelCard}>
                    <div className={styles.iconContainer}>
                      <LevelIcon size={14} />
                    </div>
                    <span className={styles.levelTitle}>{item.level}</span>
                  </div>

                  {/* Center: Molecular Hexagon */}
                  <div className={styles.hexagonWrapper}>
                    <div className={styles.hexagon}>
                      <div className={styles.hexagonInner}>
                        <HexIcon />
                      </div>
                    </div>
                  </div>

                  {/* Right Side: LP Chevron Card */}
                  <div className={styles.lpCard}>
                    <div className={styles.miniLabel}>SELF LP</div>
                    <div className={styles.lpValue}>
                      {item.self.split(' ')[0]}
                    </div>
                  </div>

                    <div className={styles.hoverOverlay}>
                      <div className={styles.crChip}>
                        <FaGift size={10} />
                        {item.level} Rewards Today
                      </div>
                      <div className={styles.crValue}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span>{Number(0).toFixed(6)} USDT</span>
                          <FaEye
                            className={styles.eyeIcon}
                            size={18}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLevel(item.level);
                              setShowXBonusPopup(true);
                            }}
                          />
                        </div>
                      </div>
                      <div className={styles.miniLabel} style={{ marginTop: '10px', opacity: 0.6 }}>
                        COMMUNITY LP: {item.community}
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

       {/* Unlock Status Popup */}
      {showPopup && unlockData && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPopup(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
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
