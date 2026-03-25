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
  primaryVaultBalance = 0,
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
    const numericBalance = parseFloat(primaryVaultBalance);
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

    if (parseFloat(transferAmount) > primaryVaultBalance) {
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
          <div className={styles.headerCentered}>
            <div className={styles.titleIconBox}>
                <ShieldCheck size={28} className={styles.protocolIcon} />
            </div>
            <h4 className={styles.modalTitle}>
              {isFirstLP ? "PROTOCOL ACTIVATION" : "LIQUIDITY SYNCHRONIZATION"}
            </h4>
            <p className={styles.headerSubtitle}>SECURE REGISTRY INTERFACE</p>
          </div>
          <button onClick={handleClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.topInfoGrid}>
            <div className={styles.balanceItemLarge}>
              <span className={styles.balanceLabel}>VAULT INTERFACE</span>
              <div className={styles.balanceValueLarge} style={{ color: "#4f8cff" }}>
                {xamanBalance.toFixed(4)} <span className={styles.currencySmall}>USDT</span>
              </div>
            </div>

            <div className={styles.verticalDetailStack}>
              {!show && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>NODE CAPACITY</span>
                  <div className={styles.detailValue} style={{ color: "#ffd700" }}>
                    {swiftBalance.toFixed(2)} <span className={styles.currencySmall}>USDT</span>
                  </div>
                </div>
              )}
              <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>STATUS</span>
                  <div className={styles.detailValue} style={{ color: "#00ff00" }}>
                    ACTIVE <span className={styles.currencySmall}>PROTOCOL</span>
                  </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.activationForm}>
            <div className={styles.inputSection}>
              <div className={styles.inputHeader}>
                <label className={styles.inputLabel}>AMOUNT</label>
                <div className={styles.minBadge}>NODE MIN 9+</div>
              </div>
              
              <div className={styles.amountInputWrapper}>
                <input
                  type="number"
                  step="0.000001"
                  className={styles.premiumInput}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <div className={styles.inputCurrency}>USDT</div>
              </div>

              <div className={styles.percentageSelector}>
                {[0.25, 0.5, 0.75, 1].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.glassTileBtn}
                    onClick={() => handlePercentageClick(p)}
                  >
                    {p === 1 ? "MAX" : `${p * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {airdropConfig && !show && getAirdropBonusPercentage(airdropConfig, airdropConfig.serverTime) > 0 && (
              <div className={styles.protocolIncentiveBox}>
                <div className={styles.incentiveHeader}>
                  <Zap size={14} className={styles.incentiveIcon} />
                  <span>AIRDROP NODE MULTIPLIER IDENTIFIED: {getAirdropBonusPercentage(airdropConfig, airdropConfig.serverTime) * 100}%</span>
                </div>
                <div className={styles.incentiveValue}>+{airdropBonus} <span className={styles.currencySmall}>USDT</span></div>
              </div>
            )}

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={handleClose}
                disabled={isLoading}
              >
                Abort Protocol
              </button>
              <button
                type="submit"
                className={styles.vaultActionBtn}
                disabled={isLoading || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > xamanBalance}
              >
                {isLoading ? "Synchronizing..." : (isFirstLP ? "Initialize Protocol" : "Commit Assets")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
