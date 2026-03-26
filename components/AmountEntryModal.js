import React, { useState } from "react";
import styles from "./AmountEntryModal.module.css";
import { PlusCircle, Wallet, X, AlertCircle } from "lucide-react";

export default function AmountEntryModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    setError("");
    onSubmit(numericAmount);
    setAmount(""); // Reset amount after submission
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
            <Wallet size={32} />
        </div>
        
        <div className={styles.modalHeader}>
            <h4 className={styles.modalTitle}>
              Deposit From Primary Vault
            </h4>
        </div>

        <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
                OnChain Amount (USDT)
            </label>
            <input
            type="number"
            className={styles.amountInput}
            value={amount}
            onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
            }}
            placeholder="0.00"
            autoFocus
            />

            {error && (
            <div className={styles.errorText}>
                <AlertCircle size={14} />
                <span>{error}</span>
            </div>
            )}
        </div>

        <div className={styles.buttonGroup}>
            <button onClick={handleSubmit} className={styles.primaryBtn}>
                Confirm Deposit
            </button>
            <button onClick={onClose} className={styles.secondaryBtn}>
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
