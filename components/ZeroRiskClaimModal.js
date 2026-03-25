import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";

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

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const contentStyle = {
    background: "#181f3a",
    borderRadius: "22px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    position: "relative",
    boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
  };

  const buttonStyle = {
    background: "rgba(79, 140, 255, 0.1)",
    color: "#4f8cff",
    border: "1px solid rgba(79, 140, 255, 0.2)",
    borderRadius: "12px",
    padding: "0.75rem",
    transition: "all 0.3s ease",
    width: "100%",
    marginTop: "1rem",
  };

  const warningButtonStyle = {
    ...buttonStyle,
    background: "rgba(255, 59, 48, 0.1)",
    color: "#ff3b30",
    border: "1px solid rgba(255, 59, 48, 0.2)",
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <>
            <h4
              style={{
                color: "#7FFF4C",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              ✅ Claim Successful!
            </h4>
            <p
              style={{
                color: "#b3baff",
                textAlign: "center",
                marginBottom: "0.5rem",
              }}
            >
              Your claim has been processed successfully.
            </p>
            <p
              style={{
                color: "#b3baff",
                textAlign: "center",
                marginBottom: "0.5rem",
              }}
            >
              Boost & Swift limits updated successfully.
            </p>
            <p
              style={{
                color: "#b3baff",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              Please check updated limits in your dashboard.
            </p>
            <button style={buttonStyle} onClick={onClose}>
              Close
            </button>
          </>
        ) : showWarning ? (
          <>
            <h4
              style={{
                color: "#fff",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              ⚠️ Warning
            </h4>
            <div
              style={{
                color: "#b3baff",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <p style={{ marginBottom: "1rem" }}>
                Claims from Stable Pool have the following impact:
              </p>
              <div
                style={{
                  background: "rgba(255, 206, 84, 0.1)",
                  border: "1px solid rgba(255, 206, 84, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                  textAlign: "left",
                }}
              >
                <p style={{ margin: "0 0 0.5rem 0", color: "#FFCE54" }}>
                   • Amount ≤ Primary Vault Balance: No limits affected
                </p>
                <p style={{ margin: "0", color: "#ff3b30" }}>
                   • Amount &gt; Primary Vault Balance: Swift &amp; Boost limits will be
                   reduced to remaining Liquidity Pool balance
                </p>
              </div>
            </div>
            <button
              style={warningButtonStyle}
              onClick={handleUnderstand}
              disabled={isLoading || isSubmitting}
            >
              I Understand the Risk
            </button>
            <button
              style={buttonStyle}
              onClick={onClose}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h4
              style={{
                color: "#fff",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
               Claim from Stable Pool
            </h4>
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div>
                   <small style={{ color: "#b3baff" }}>Primary Vault Balance:</small>
                  <div style={{ color: "#4f8cff", fontWeight: "bold" }}>
               
                    {Math.max(0, parseFloat(primaryVaultBalance)).toFixed(6)} USDT
                  </div>
                </div>
                <div>
                  <small style={{ color: "#b3baff" }}>
                     Stable Pool Balance:
                  </small>
                  <div style={{ color: "#7FFF4C", fontWeight: "bold" }}>
                   
                    {Math.max(0, parseFloat(lpBalance)).toFixed(6)} USDT
                  </div>
                </div>
              </div>

              <label
                style={{
                  color: "#b3baff",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Claim Amount (USDT)
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                max={maxAmount}
                value={amount}
                onChange={handleAmountChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#fff",
                }}
                placeholder="Enter amount"
                disabled={isLoading || isSubmitting}
              />

              {showLimitWarning && (
                <div
                  style={{
                    background: "rgba(255, 77, 77, 0.1)",
                    border: "1px solid rgba(255, 77, 77, 0.2)",
                    borderRadius: "12px",
                    padding: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <small style={{ color: "#ff4d4d" }}>
                     ⚠️ This amount exceeds your Primary Vault balance. Your Swift &amp;
                     Boost limits will be reduced to remaining Liquidity Pool balance (
                    {(
                      lpBalance -
                      (parseFloat(amount || 0) - primaryVaultBalance)
                    ).toFixed(6)}{" "}
                    USDT).
                  </small>
                </div>
              )}

              {amountError && (
                <p
                  style={{
                    color: "#ff3b30",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {amountError}
                </p>
              )}
              {error && (
                <p
                  style={{
                    color: "#ff3b30",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                Your Last transaction is in Processing.
                </p>
              )}
            </div>
            <button
              style={buttonStyle}
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting || !!amountError || !amount}
            >
              {isLoading || isSubmitting ? "Processing..." : "Claim"}
            </button>
            <button
              style={{ ...buttonStyle, marginTop: "0.5rem" }}
              onClick={onClose}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
