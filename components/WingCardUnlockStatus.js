import styles from "./UnlockStatus.module.css";

const WingCardUnlockStatus = ({ unlockData, isLoading, error }) => {
  /* ===========================
     LOADING & ERROR STATES
  =========================== */
  if (isLoading) {
    return <div className={styles.loading}>Checking eligibility...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!unlockData) {
    return <div className={styles.loading}>Checking eligibility...</div>;
  }

  /* ===========================
     SAFE DESTRUCTURING
  =========================== */
  const eligible = Boolean(unlockData.eligible);

  const self = unlockData.self || {};
  const legs = unlockData.legs || {};

  const {
    depositDone = 0,
    depositRequired = 1000,
    lpMaintained = false,
    depositQualified = false,
  } = self;

  const {
    requiredQualifiedLegs = 3,
    qualifiedLegs = 0,
    details = [],
  } = legs;

  const progressPercent =
    requiredQualifiedLegs > 0
      ? Math.round((qualifiedLegs / requiredQualifiedLegs) * 100)
      : 0;

  /* ===========================
     UI
  =========================== */
  return (
    <div className="w-100">
      <h2 className={styles.xrp_UnlockStatus_title}>
        <span className={styles.xrp_UnlockStatus_lockIcon}>
          {eligible ? "🔓" : "🔒"}
        </span>
        Unlock Eligibility to Win iPhone 17 Pro
      </h2>

      {/* ===========================
         SELF ELIGIBILITY
      =========================== */}
      <div className={styles.xrp_UnlockStatus_block}>
        <p className={styles.xrp_UnlockStatus_heading}>
          Self Eligibility
        </p>

        <p>
          Deposit Requirement:{" "}
          <strong>
            {Number(depositDone).toLocaleString()} /{" "}
            {Number(depositRequired).toLocaleString()} USDT
          </strong>

          {Number(depositRequired) > Number(depositDone) && (
            <span style={{ color: "red", marginLeft: 8 }}>
              (Need{" "}
              {(Number(depositRequired) - Number(depositDone)).toLocaleString()} USDT more)
            </span>
          )}
        </p>
      <p>
  LP Maintained ≥ 1000:{" "}
  <strong
    style={{
      color: lpMaintained ? "rgb(127,255,76)" : "red",
    }}
  >
    {lpMaintained ? "Yes" : "No"}
  </strong>

  {!lpMaintained && (
    <span style={{ color: "red", marginLeft: 8 }}>
      (Need {(1000 - Number(lpValue || 0)).toLocaleString()} LP more)
    </span>
  )}
</p>


        <p>
          Eligibility Status:{" "}
          <strong
            style={{
              color:
                lpMaintained && depositQualified
                  ? "rgb(127,255,76)"
                  : "red",
            }}
          >
            {lpMaintained && depositQualified
              ? "Completed"
              : "Pending"}
          </strong>
        </p>
      </div>

      {/* ===========================
         TEAM LEGS
      =========================== */}
      <div className={styles.xrp_UnlockStatus_block}>
        <p className={styles.xrp_UnlockStatus_heading}>
          Team Activity (Required {requiredQualifiedLegs} Qualified Wings)
        </p>

        <table className={styles.xrp_UnlockStatus_table}>
          <thead>
            <tr>
              <th>Leg</th>
              <th>Username</th>
              <th>Team Business</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {details.map((leg, idx) => {
              const activityCount = Number(leg.activityCount || 0);
              const pendingActivity = Number(leg.pendingActivity || 0);

              return (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>
                    <strong>{idx + 1}</strong>
                  </td>
                  <td style={{ color: "#7fb3ff" }}>
                    {leg.username || "Unknown"}
                  </td>
                  <td>
                    {activityCount.toLocaleString()} / 5000
                  </td>
                  <td>
                    {leg.qualified ? (
                      <span style={{ color: "rgb(127,255,76)" }}>
                        ✅ Completed
                      </span>
                    ) : (
                      <span style={{ color: "red" }}>
                        ⏳ Pending ({pendingActivity.toLocaleString()})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===========================
         PROGRESS BAR
      =========================== */}
      <div className={styles.xrp_UnlockStatus_block}>
        <div className={styles.xrp_UnlockStatus_progressText}>
          📘 Progress:{" "}
          <strong>
            {qualifiedLegs}/{requiredQualifiedLegs} Wings Qualified
          </strong>
        </div>

        <div className={styles.xrp_UnlockStatus_progressBarWrapper}>
          <div className={styles.xrp_UnlockStatus_progressBarBg}>
            <div
              className={styles.xrp_UnlockStatus_progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {!eligible && (
        <div className={styles.xrp_UnlockStatus_locked}>
          🔒 Feature Locked – Complete pending requirements to unlock
        </div>
      )}
    </div>
  );
};

export default WingCardUnlockStatus;
