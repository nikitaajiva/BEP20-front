import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";
import styles from "./ZeroRiskClaimModal.module.css";
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, ArrowRight, Wallet, Info } from "lucide-react";

export default function ZeroRiskClaimModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
  isLoading,
  error,
  primaryVaultBalance = 0,
  lpBalance = 0,
  isFirstLPMade = false,
}) {
  const [showWarning, setShowWarning] = useState(true);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uniqueTransactionId, setUniqueTransactionId] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const willExceedPrimaryVault =
    parseFloat(amount || 0) > primaryVaultBalance;
  const showLimitWarning = isFirstLPMade && willExceedPrimaryVault;

  React.useEffect(() => {
    if (isOpen) {
      setUniqueTransactionId(uuidv4());
      setIsSubmitting(false);
      setAmount("");
      setAmountError("");
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleUnderstand = () => {
    setShowWarning(false);
  };

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
      } else if (isNaN(value) || parseFloat(value) <= 0) {
        setAmountError("Please enter a valid amount");
      } else if (parseFloat(value) > parseFloat(maxAmount)) {
        setAmountError("Amount exceeds available balance");
      } else {
        setAmountError("");
      }
    }
  };

  const debouncedSubmit = useCallback(
    debounce((amount, uniqueTransactionId) => {
      if (!isSubmitting) {
        setIsSubmitting(true);
        onSubmit(parseFloat(amount), uniqueTransactionId)
          .then(() => {
            setIsSuccess(true);
          })
          .catch((error) => {
            console.error("Withdrawal error:", error);
            setAmountError(error.message || "An unexpected error occurred");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    }, 300),
    [onSubmit]
  );

  const handleSubmit = () => {
    if (!amountError && amount && uniqueTransactionId && !isSubmitting) {
      debouncedSubmit(amount, uniqueTransactionId);
    }
  };

  React.useEffect(() => {
    return () => {
      debouncedSubmit.cancel();
    };
  }, [debouncedSubmit]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <div className={styles.successWrapper}>
            <div className={styles.successIconBox}>
                <CheckCircle size={56} color="#00ff00" style={{ margin: "0 auto 20px" }} />
            </div>
            <h4 className={styles.successTitle}>Claim Successful!</h4>
            <p className={styles.successText}>
              Your claim has been processed successfully. Boost &amp; Swift limits have been updated.
            </p>
            <div className={styles.buttonGroup}>
                <button className={styles.primaryBtn} onClick={onClose}>
                Back to Dashboard
                </button>
            </div>
          </div>
        ) : showWarning ? (
          <>
            <div className={styles.protocolHeader}>
              <ShieldAlert className={styles.alertIcon} size={32} />
              <div className={styles.headerText}>
                <h4 className={styles.headerTitle}>PROTOCOL SECURITY ALERT</h4>
                <p className={styles.headerSubtitle}>SEGMENT WITHDRAWAL DETECTED</p>
              </div>
            </div>
            
            <p className={styles.warningDesc}>
                Withdrawing liquidity from the <strong>Stable Pool</strong> triggers cross-segment balance checks. Registry synchronization may be affected.
            </p>

            <div className={styles.protocolWarningBox}>
              <div className={styles.warningItem}>
                <div className={styles.itemIcon + " " + styles.iconGold}><Info size={16} /></div>
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle}>REGISTRY INTEGRITY</p>
                  <p className={styles.itemDetail}>Amount ≤ Primary Vault: Liquidity segment remains stable. No limits affected.</p>
                </div>
              </div>
              
              <div className={styles.warningDivider}></div>

              <div className={styles.warningItem}>
                <div className={styles.itemIcon + " " + styles.iconRed}><AlertTriangle size={16} /></div>
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle + " " + styles.textRed}>PROTOCOL DE-LEVERAGING</p>
                  <p className={styles.itemDetail}>Amount &gt; Primary Vault: Swift &amp; Boost Node limits will be reduced proportionally.</p>
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
                <button
                  className={styles.riskUnderstandBtn}
                  onClick={handleUnderstand}
                  disabled={isLoading || isSubmitting}
                >
                  Confirm Risk Awareness
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={isLoading || isSubmitting}
                >
                  Cancel Operation
                </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalTitle}>
              Withdrawal Protocol
            </div>

            <div className={styles.balanceGrid}>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>VAULT INTERFACE</span>
                <div className={styles.balanceValue} style={{ color: "#4f8cff" }}>
                  {Math.max(0, parseFloat(primaryVaultBalance)).toFixed(4)} <span className={styles.currencySmall}>USDT</span>
                </div>
              </div>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>POOL LIQUIDITY</span>
                <div className={styles.balanceValue} style={{ color: "#00ff00" }}>
                  {Math.max(0, parseFloat(lpBalance)).toFixed(4)} <span className={styles.currencySmall}>USDT</span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Disbursement Amount</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  step="0.000001"
                  className={styles.amountInput}
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  disabled={isLoading || isSubmitting}
                />
              </div>
              
              {amountError && <div className={styles.errorText}>{amountError}</div>}
              {error && <div className={styles.errorText}>Your last transaction is still processing.</div>}
            </div>

            {showLimitWarning && (
              <div className={styles.limitWarning}>
                <AlertTriangle size={18} className={styles.limitWarningIcon} />
                <div className={styles.limitWarningText}>
                   <strong>De-leveraging Alert:</strong> Amount exceeds Vault threshold. Registry nodes will be adjusted to 
                   {(lpBalance - (parseFloat(amount || 0) - primaryVaultBalance)).toFixed(4)} USDT.
                </div>
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                className={styles.primaryBtn}
                onClick={handleSubmit}
                disabled={isLoading || isSubmitting || !!amountError || !amount}
              >
                {isLoading || isSubmitting ? "Syncing Registry..." : "Initiate Withdrawal"}
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={onClose}
                disabled={isLoading || isSubmitting}
              >
                Cancel Operation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
