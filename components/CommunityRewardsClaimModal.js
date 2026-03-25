import React, { useState } from "react";
import styles from "./CommunityRewardsClaimModal.module.css";
import { Gift, Wallet, X, AlertCircle } from "lucide-react";

export default function CommunityRewardsClaimModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
  isLoading,
  error,
}) {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const handleAmountChange = (e) => {
    let value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      const [intPart, decimalPart] = value.split(".");
      if (decimalPart && decimalPart.length > 6) {
        value = `${intPart}.${decimalPart.slice(0, 6)}`;
      }

      setAmount(value);

      if (!value) {
        setAmountError("Amount is required");
        } else if (isNaN(value) || parseFloat(value) < 4.999999) {
        setAmountError("Minimum amount should be 5");
        } else if (parseFloat(value) > parseFloat(maxAmount)) {
        setAmountError("Amount exceeds available balance");
        } else {
        setAmountError("");
      }
    }
  };

  const handleSubmit = async () => {
    if (!amountError && amount) {
      await onSubmit(parseFloat(amount)); // Let parent handle success
      setAmount(""); // Reset after submission
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h4 className={styles.modalTitle}>
          Redeem Rewards
        </h4>
        
        <div className={styles.balanceBox}>
            <span className={styles.balanceLabel}>Available to Redeem</span>
            <div className={styles.balanceValue}>
                {parseFloat(maxAmount).toFixed(4)} USDT
            </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Redeem Amount (USDT)
          </label>
          <input
            type="number"
            step="0.000001"
            className={styles.amountInput}
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            disabled={isLoading}
          />

          {amountError && <div className={styles.errorText}>{amountError}</div>}
          {error && <div className={styles.errorText}>{error}</div>}
        </div>

        <div className={styles.buttonGroup}>
            <button
            className={styles.primaryBtn}
            onClick={handleSubmit}
            disabled={isLoading || !!amountError || !amount}
            >
            {isLoading ? "Processing..." : "Confirm Redemption"}
            </button>
            <button
            className={styles.secondaryBtn}
            onClick={onClose}
            disabled={isLoading}
            >
            Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
