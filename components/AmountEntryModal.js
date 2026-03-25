import React, { useState } from "react";

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

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050, // Ensure it's above other content
  };

  const modalContentStyle = {
    background:
      "radial-gradient(120% 120% at 20% 0%, rgba(255, 215, 0, 0.14) 0%, rgba(10, 10, 10, 0.95) 60%)",
    color: "#f4f4f4",
    padding: "28px",
    borderRadius: "14px",
    minWidth: "320px",
    maxWidth: "520px",
    boxShadow:
      "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255, 215, 0, 0.18) inset",
    textAlign: "center",
  };

  const inputStyle = {
    width: "calc(100% - 20px)",
    padding: "12px",
    margin: "10px 0 16px 0",
    borderRadius: "8px",
    border: "1px solid rgba(255, 215, 0, 0.25)",
    backgroundColor: "rgba(17, 17, 17, 0.9)",
    color: "#fff",
    fontSize: "1rem",
    textAlign: "center",
  };

  const buttonBaseStyle = {
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
    minWidth: "100px",
  };

  const submitButtonStyle = {
    ...buttonBaseStyle,
    background:
      "linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 170, 0, 0.95))",
    color: "#0a0a0a",
    marginRight: "10px",
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "#ffd766",
    border: "1px solid rgba(255, 215, 0, 0.25)",
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      {" "}
      {/* Close on overlay click */}
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Prevent close on content click */}
        <h4 style={{ marginBottom: "20px", color: "#fff" }}>
          Add USDT From Wallet
        </h4>
        <label
          htmlFor="amountUSDT"
          style={{ display: "block", marginBottom: "5px", textAlign: "left" }}
        >
          Amount in USDT:
        </label>
        <input
          type="number"
          id="amountUSDT"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError(""); // Clear error on new input
          }}
          placeholder="Enter USDT amount"
          style={inputStyle}
          autoFocus
        />
        {error && (
          <p
            style={{
              color: "#dc3545",
              fontSize: "0.8rem",
              marginBottom: "10px",
            }}
          >
            {error}
          </p>
        )}
        <div>
          <button onClick={handleSubmit} style={submitButtonStyle}>
            Submit
          </button>
          <button onClick={onClose} style={cancelButtonStyle}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
