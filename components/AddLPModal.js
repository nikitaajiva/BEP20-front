"use client";
import React, { useState, useEffect } from "react";

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
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          padding: "2rem",
          width: "90%",
          maxWidth: "500px",
          color: "white",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        }}
      >
        <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ margin: 0, color: "#fff" }}>
            {isFirstLP ? "Activate Liquidity Pool" : "Add to Liquidity Pool"}
          </h4>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              color: "#b3baff",
              fontSize: "1.5rem",
              cursor: "pointer",
              position: "absolute",
              right: "1rem",
              top: "1rem",
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {isFirstLP && !show && (
            <div
              style={{
                background: "rgba(79, 140, 255, 0.1)",
                border: "1px solid rgba(79, 140, 255, 0.2)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <h6 style={{ color: "#4f8cff", margin: "0 0 0.5rem 0" }}>
                First Liquidity Pool Activation
              </h6>
              <p style={{ color: "#b3baff", margin: 0, fontSize: "0.9rem" }}>
                This will set your Swift and Boost limits equal to your transfer
                amount. You can transfer any amount from your Primary Vault balance.
              </p>
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div>
                <small style={{ color: "#b3baff" }}>Available in Primary Vault:</small>
                <div style={{ color: "#4f8cff", fontWeight: "bold" }}>
                  {primaryVaultBalance.toFixed(6)} USDT
                </div>
              </div>
              {!show && (
                <div>
                  <small style={{ color: "#b3baff" }}>
                    Available in Swift:
                  </small>
                  <div style={{ color: "#FFD700", fontWeight: "bold" }}>
                    {swiftBalance.toFixed(2)} USDT
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#b3baff",
                }}
              >
                Transfer Amount (USDT){" "}
                <span style={{ color: "rgb(255, 215, 0)", fontWeight: "bold" }}>
                  Minimum: 9+
                </span>
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                max={primaryVaultBalance}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#fff",
                  fontSize: "1rem",
                }}
                required
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  disabled={true}
                  type="button"
                  onClick={() => handlePercentageClick(0.25)}
                  style={{
                    background: "rgba(79, 140, 255, 0.1)",
                    border: "1px solid rgba(79, 140, 255, 0.2)",
                    color: "#4f8cff",
                    borderRadius: "8px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.5)}
                  style={{
                    background: "rgba(79, 140, 255, 0.1)",
                    border: "1px solid rgba(79, 140, 255, 0.2)",
                    color: "#4f8cff",
                    borderRadius: "8px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.75)}
                  style={{
                    background: "rgba(79, 140, 255, 0.1)",
                    border: "1px solid rgba(79, 140, 255, 0.2)",
                    color: "#4f8cff",
                    borderRadius: "8px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(1)}
                  style={{
                    background: "rgba(79, 140, 255, 0.1)",
                    border: "1px solid rgba(79, 140, 255, 0.2)",
                    color: "#4f8cff",
                    borderRadius: "8px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Max
                </button>
              </div>
            </div>

            {airdropConfig &&
              !show &&
              getAirdropBonusPercentage(
                airdropConfig,
                airdropConfig.serverTime
              ) > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#b3baff",
                    }}
                  >
                    Airdrop Bonus (from Swift Balance)
                  </label>
                  <input
                    type="text"
                    value={`${airdropBonus} USDT`}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(79, 140, 255, 0.2)",
                      background: "rgba(79, 140, 255, 0.1)",
                      color: "#fff",
                      fontSize: "1rem",
                      opacity: 0.7,
                      cursor: "not-allowed",
                    }}
                  />
                  <small
                    style={{
                      color: "#b3baff",
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    You will receive a{" "}
                    {getAirdropBonusPercentage(
                      airdropConfig,
                      airdropConfig.serverTime
                    ) * 100}
                    % bonus on your Liquidity Pool deposit, transferred from your Swift
                    Wallet to your Airdrop Wallet.
                  </small>
                </div>
              )}

            {error && (
              <div
                style={{
                  background: "rgba(255, 77, 77, 0.1)",
                  border: "1px solid rgba(255, 77, 77, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color: "#ff4d4d",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                style={{
                  background: "rgba(255, 77, 77, 0.1)",
                  border: "1px solid rgba(255, 77, 77, 0.2)",
                  color: "#ff4d4d",
                  borderRadius: "12px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !transferAmount ||
                  parseFloat(transferAmount) <= 0 ||
                  parseFloat(transferAmount) > primaryVaultBalance
                }
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  color: "#4f8cff",
                  borderRadius: "12px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  opacity:
                    isLoading ||
                    !transferAmount ||
                    parseFloat(transferAmount) <= 0 ||
                    parseFloat(transferAmount) > primaryVaultBalance
                      ? 0.5
                      : 1,
                }}
              >
                {isLoading
                  ? "Processing..."
                  : isFirstLP
                  ? "Activate Liquidity Pool"
                  : "Transfer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
