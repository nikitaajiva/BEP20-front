import React, { useState } from "react";

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
    color: "#fff",
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h4 style={{ marginBottom: "1rem", textAlign: "center" }}>
          Redeem from Rewards Wallet
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
              <small style={{ color: "#b3baff" }}>Available to Redeem:</small>
              <div style={{ color: "#4f8cff", fontWeight: "bold" }}>
                {parseFloat(maxAmount).toFixed(6)} USDT
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
            Redeem Amount (USDT)
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
            disabled={isLoading}
          />

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
              {error}
            </p>
          )}
        </div>
        <button
          style={buttonStyle}
          onClick={handleSubmit}
          disabled={isLoading || !!amountError || !amount}
        >
          {isLoading ? "Processing..." : "Redeem"}
        </button>
        <button
          style={{ ...buttonStyle, marginTop: "0.5rem" }}
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
