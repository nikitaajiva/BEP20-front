"use client";
import React, { useState, useEffect } from "react";
import styles from "./AddLPModal.module.css";
import { Wallet, Droplets, Zap, ShieldCheck, X, CreditCard, Info } from "lucide-react";

function getAirdropBonusPercentage(config, serverTime) {
  if (!config || !config.steps) return 0;

  const { startTimestamp, steps } = config;
  const currentTime = serverTime
    ? new Date(serverTime).getTime()
    : new Date().getTime();

  console.log("--- Airdrop Bonus Debug ---");
  console.log(
    "Current Time (ms):",
    currentTime,
    `(${new Date(currentTime).toISOString()})`
  );
  console.log("Start Timestamp from config:", startTimestamp);

  if (startTimestamp.toString().length <= 10) {
    console.warn(
      "Warning: The 'startTimestamp' seems to be in seconds. It should be in milliseconds (13 digits)."
    );
    console.log(
      "If it is in seconds, the promotion will likely appear to have already ended."
    );
  }

  if (currentTime < startTimestamp) {
    console.log(
      "Result: Promotion has not started yet (Current Time < Start Time)."
    );
    console.log("Should Display: No");
    console.log("--------------------------");
    return 0;
  }

  const hoursSinceStart = (currentTime - startTimestamp) / (1000 * 60 * 60);
  console.log("Hours Since Start:", hoursSinceStart.toFixed(2));

  let cumulativeHours = 0;
  for (const step of steps) {
    cumulativeHours += step.durationHours;
    if (hoursSinceStart < cumulativeHours) {
      console.log(`Result: In a valid step. Percentage: ${step.percentage}`);
      console.log("Should Display: Yes");
      console.log("--------------------------");
      return step.percentage;
    }
  }

  console.log(
    "Result: Promotion period has ended (Hours since start exceeds all steps)."
  );
  console.log("Should Display: No");
  console.log("--------------------------");
  return 0; // Promotion period has ended
}

export default function AddLPModal({
  isOpen,
  onClose,
  onSubmit,
  xamanBalance = 0,
  swiftBalance = 0,
  isFirstLP = false,
  isLoading = false,
  error = null,
  airdropConfig = null,
}) {
  const [transferAmount, setTransferAmount] = useState("");
  const [airdropBonus, setAirdropBonus] = useState("0.00");

  useEffect(() => {
    if (!transferAmount || !airdropConfig) {
      setAirdropBonus("0.00");
      return;
    }

    const percentage = getAirdropBonusPercentage(
      airdropConfig,
      airdropConfig.serverTime
    );
    if (percentage > 0) {
      const amount = parseFloat(transferAmount);
      if (!isNaN(amount) && amount > 0) {
        const bonus = amount * percentage;
        setAirdropBonus(bonus.toFixed(6));
      } else {
        setAirdropBonus("0.00");
      }
    } else {
      setAirdropBonus("0.00");
    }
  }, [transferAmount, airdropConfig]);

  const handlePercentageClick = (percentage) => {
    const numericBalance = parseFloat(xamanBalance);
    if (isNaN(numericBalance) || numericBalance <= 0) {
      setTransferAmount("0");
      return;
    }
    // For 100%, use the full balance to avoid rounding errors from toFixed()
    // For other percentages, toFixed(6) is safe.
    const amount =
      percentage === 1 ? numericBalance : numericBalance * percentage;
    setTransferAmount(amount.toFixed(6));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      return;
    }

    if (parseFloat(transferAmount) > xamanBalance) {
      return;
    }

    onSubmit(parseFloat(transferAmount));
    setTransferAmount("");
  };

  const handleClose = () => {
    setTransferAmount("");
    onClose();
  };
  const currentDateOnlyUTC = new Date().toISOString().split("T")[0]; // e.g., "2025-06-27"
  const targetDateOnlyUTC = "2025-06-27";
  const show = currentDateOnlyUTC > targetDateOnlyUTC;
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>
            {isFirstLP ? "Activate Liquidity Pool" : "Add to Liquidity Pool"}
          </h4>
          <button onClick={handleClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isFirstLP && !show && (
            <div className={styles.activationInfo}>
              <div className={styles.activationTitle}>
                <ShieldCheck size={18} color="#ffd700" />
                <span>First Activation Protocol</span>
              </div>
              <p className={styles.activationText}>
                This sets your Swift &amp; Boost limits equal to your transfer amount.
              </p>
            </div>
          )}

          <div className={styles.balanceRow}>
            <div className={styles.balanceItem}>
              <span className={styles.balanceLabel}>Vault Balance</span>
              <div className={styles.balanceValue} style={{ color: "#4f8cff" }}>
                {xamanBalance.toFixed(4)} USDT
              </div>
            </div>
            {!show && (
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>Swift Limit</span>
                <div className={styles.balanceValue} style={{ color: "#ffd700" }}>
                  {swiftBalance.toFixed(2)} USDT
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Transfer Amount
                <span className={styles.minBadge}>Min 9+</span>
              </label>
              <input
                type="number"
                step="0.000001"
                className={styles.amountInput}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <div className={styles.percentageGrid}>
                {[0.25, 0.5, 0.75, 1].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.percentageBtn}
                    onClick={() => handlePercentageClick(p)}
                  >
                    {p === 1 ? "MAX" : `${p * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {airdropConfig && !show && getAirdropBonusPercentage(airdropConfig, airdropConfig.serverTime) > 0 && (
              <div className={styles.airdropBonus}>
                <span className={styles.bonusLabel}>Airdrop Protocol Bonus</span>
                <div className={styles.bonusValue}>{airdropBonus} USDT</div>
                <div className={styles.bonusDesc}>
                  You'll receive a {getAirdropBonusPercentage(airdropConfig, airdropConfig.serverTime) * 100}% bonus, transferred to your Airdrop Wallet from your Swift limit.
                </div>
              </div>
            )}

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > xamanBalance}
              >
                {isLoading ? "Processing..." : (isFirstLP ? "Activate Protocol" : "Confirm Transfer")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
