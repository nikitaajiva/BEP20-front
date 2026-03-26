import styles from "./UnlockStatus.module.css";

const UnlockStatus = ({ unlockData, xrankLabel = "Next Rank" }) => {
  if (!unlockData) return null;

  const {
    requiredSelfLp,
    userSelfLp,
    requiredCommunityLp,
    legs = [],
    isUnlocked,
  } = unlockData;

  const pendingSelf = requiredSelfLp - userSelfLp;
  const requiredPerLeg = requiredCommunityLp / 3;

  const completedLegs = Object.values(legs).filter(
    (leg) => leg.teamLp >= requiredPerLeg
  ).length;
  const progressPercent = Math.round((completedLegs / 3) * 100);

  return (
    <div className={styles.USDT_UnlockStatus_card}>
      <h2
        className={styles.USDT_UnlockStatus_title}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.USDT_UnlockStatus_lockIcon}>🔒</span> Unlock{" "}
        {xrankLabel}
      </h2>

      <div className={styles.USDT_UnlockStatus_block}>
        <p className={styles.USDT_UnlockStatus_heading}>
          Required Personal LP –{" "}
          <strong>{requiredSelfLp.toLocaleString()} USDT</strong>
        </p>
        <div
          className=""
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p>
            Your LP: <strong>{userSelfLp.toLocaleString()} USDT</strong>
          </p>
          <p>
            {" "}
            <span className={styles.USDT_UnlockStatus_pending}>
              {pendingSelf > 0 ? (
                <>
                  <div> Pending: {pendingSelf.toLocaleString()} USDT</div>
                </>
              ) : (
                <>
                  <div className="" style={{ color: "rgb(127, 255, 76)" }}>
                    {" "}
                    <svg
                      width={16}
                      height={16}
                      fill="rgb(127, 255, 76)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                    >
                      <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
                    </svg>{" "}
                    Completed{" "}
                  </div>
                </>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.USDT_UnlockStatus_block}>
        <p className={styles.USDT_UnlockStatus_heading}>
          Required Team LP –{" "}
          <strong>{requiredCommunityLp.toLocaleString()} USDT</strong>
        </p>
        <p>
          Required per Leg (3 Legs):{" "}
          <strong>{requiredPerLeg.toLocaleString()} USDT each</strong>
        </p>
        <table className={styles.USDT_UnlockStatus_table}>
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
              const pending = Math.max(0, requiredPerLeg - achieved);
              const isCompleted = achieved >= requiredPerLeg;

              return (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>
                    <strong> {idx + 1}</strong>
                  </td>
                  <td style={{ color: "#7fb3ff" }}>
                    {leg.username || "Unknown User"}
                  </td>
                  <td>
                    <strong>{achieved.toLocaleString()} USDT</strong>
                  </td>
                  <td>
                    {isCompleted ? (
                      <span style={{ color: "rgb(127, 255, 76)" }}>
                        <svg
                          width={16}
                          height={16}
                          fill="rgb(127, 255, 76)"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                        >
                          <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
                        </svg>{" "}
                        Completed
                      </span>
                    ) : (
                      <>
                        <div>
                          <div style={{ color: "red" }}>
                            <svg
                              width={16}
                              height={16}
                              fill="red"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 640 640"
                            >
                              <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
                            </svg>{" "}
                            Pending:{" "}
                          </div>
                          <span className={styles.USDT_UnlockStatus_pending}>
                            {pending.toLocaleString()} USDT
                          </span>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Progress Bar */}
      <div className={styles.USDT_UnlockStatus_block}>
        <div className={styles.USDT_UnlockStatus_progressText}>
          📘 Progress: <strong>{completedLegs}/3 Legs Completed</strong>
        </div>
        <div className={styles.USDT_UnlockStatus_progressBarWrapper}>
          <div className={styles.USDT_UnlockStatus_progressBarBg}>
            <div
              className={styles.USDT_UnlockStatus_progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {!isUnlocked && (
        <div className={styles.USDT_UnlockStatus_locked}>
          🔒 Feature Locked – <strong>Meet all requirements to unlock</strong>
        </div>
      )}
    </div>
  );
};

export default UnlockStatus;

