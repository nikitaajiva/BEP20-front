import React, { useState } from "react";

export default function AmountEntryModal({
  isOpen,
  onClose,
  onSubmit,
  appName,
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
    background: "#181f3a", // Dark background similar to cards
    color: "#e5e7eb", // Light text
    padding: "25px",
    borderRadius: "8px",
    minWidth: "300px",
    maxWidth: "500px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
    textAlign: "center",
  };

  const inputStyle = {
    width: "calc(100% - 20px)",
    padding: "10px",
    margin: "10px 0 15px 0",
    borderRadius: "4px",
    border: "1px solid #333",
    backgroundColor: "#2a314e", // Darker input field
    color: "#fff",
    fontSize: "1rem",
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
    backgroundColor: "#16a34a", // Green (like USDTSCAN badge)
    color: "#fff",
    marginRight: "10px",
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#6c757d", // Grey
    color: "#fff",
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      {" "}
      {/* Close on overlay click */}
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Prevent close on content click */}
        <h4 style={{ marginBottom: "20px", color: "#fff" }}>
          Add USDT From XAMAN OnChain
        </h4>
        <label
          htmlFor="amountXRP"
          style={{ display: "block", marginBottom: "5px", textAlign: "left" }}
        >
          Amount in USDT:
        </label>
        <input
          type="number"
          id="amountXRP"
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
