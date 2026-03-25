import styles from "./UnlockStatus.module.css";

const POOL_RULES = {
  1: { title: "Have 3 iPhone 17 Pro", perWing: 1 },
  2: { title: "Have 8 iPhone 17 Pro", perWing: 3 },
  3: { title: "Have 25 iPhone 17 Pro", perWing: 9 },
  4: { title: "Have 60 iPhone 17 Pro", perWing: 20 },
  5: { title: "Build a team with achievers", perWing: 1 },
};

const RewardPoolCardpopup = ({ unlockData, xrankLabel }) => {
  if (!unlockData) return null;

  const pool = POOL_RULES[xrankLabel] || POOL_RULES[1];

  const { requiredSelfLp, userSelfLp, legs = [], isUnlocked } = unlockData;

  const pendingSelf = requiredSelfLp - userSelfLp;
  const requiredPerLeg = pool.perWing;

  const completedLegs = Object.values(legs).filter(
    (leg) => (leg.teamLp || 0) >= requiredPerLeg
  ).length;

  const progressPercent = Math.round((completedLegs / 3) * 100);

  return (
    <div className="w-100">
      <h2 className={styles.xrp_UnlockStatus_title}>
        🔒 Unlock REWARD POOL {xrankLabel}
      </h2>

      {/* SELF LP SECTION */}
      <div className={styles.xrp_UnlockStatus_block}>
        <p className={styles.xrp_UnlockStatus_heading}>
          Required Self LP – <strong>{requiredSelfLp} USDT</strong>
        </p>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>
            Your LP: <strong>{userSelfLp} USDT</strong>
          </p>

          {pendingSelf > 0 ? (
            <p className={styles.xrp_UnlockStatus_pending}>
              Pending: {pendingSelf} USDT
            </p>
          ) : (
            <p style={{ color: "rgb(127,255,76)" }}>✔ Completed</p>
          )}
        </div>
      </div>

      {/* COMMUNITY SECTION */}
      <div className={styles.xrp_UnlockStatus_block}>
        <p className={styles.xrp_UnlockStatus_heading}>
          Required Community LP – <strong>{pool.title}</strong>
        </p>

        <p>
          Required Per Wing (3 Wings): <strong>{requiredPerLeg}</strong>
        </p>

        {/* TABLE */}
        <table className={styles.xrp_UnlockStatus_table}>
          <thead>
            <tr>
              <th>Leg</th>
              <th>Username</th>
              <th>Achieved</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(legs).map((leg, idx) => {
              const achieved = leg.teamLp || 0;
              const isDone = achieved >= requiredPerLeg;

              return (
                <tr key={idx}>
                  <td>
                    <strong>{idx + 1}</strong>
                  </td>
                  <td style={{ color: "#7fb3ff" }}>{leg.username}</td>
                  <td>
                    <strong>{achieved}</strong>
                  </td>

                  <td>
                    {isDone ? (
                      <span style={{ color: "rgb(127,255,76)" }}>
                        ✔ Completed
                      </span>
                    ) : (
                      <span style={{ color: "red" }}>
                        Pending: {requiredPerLeg - achieved}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PROGRESS BAR */}
      <div className={styles.xrp_UnlockStatus_block}>
        <div className={styles.xrp_UnlockStatus_progressText}>
          📘 Progress: <strong>{completedLegs}/3 Wings Completed</strong>
        </div>

        <div className={styles.xrp_UnlockStatus_progressBarBg}>
          <div
            className={styles.xrp_UnlockStatus_progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!isUnlocked && (
        <div className={styles.xrp_UnlockStatus_locked}>
          🔒 Feature Locked – Meet all requirements to unlock
        </div>
      )}
    </div>
  );
};

export default RewardPoolCardpopup;
