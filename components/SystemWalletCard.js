import React from "react";
import Link from "next/link";
export default function SystemWalletCard({
  account,

  appName,
  lastPayloadUpdate,
  transactionStatus,
  onLogin,
  onLogout,
  onOpenModal,
  xamanBalance,
}) {
  const cardBaseStyle = {
    overflow: "hidden",
    background: "#181f3a",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    borderRadius: "22px",
    boxShadow: "0 8px 32px 0 rgba(79, 140, 255, 0.1)",
    border: "1px solid rgba(79, 140, 255, 0.15)",
    position: "relative",
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #4f8cff 0%, #3b76ff 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "0.75rem",
    transition: "all 0.3s ease",
    width: "100%",
    marginBottom: "0.5rem",
    fontWeight: "bold",
  };

  const iconButtonStyle = {
    background: "transparent",
    border: "none",
    color: "#ff4d4d",
    padding: "0.25rem",
    marginLeft: "0.5rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };
const now = new Date();
const minutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();

// Disable window: 23:30 → 00:20 UTC
const disableStart = 23 * 60 + 30; // 23:30 → 1410 minutes
const disableEnd = 0 * 60 + 20;    // 00:20 → 20 minutes

// Check if current time is in disable window
const isDisabledAlt = minutesNow >= disableStart || minutesNow <= disableEnd;
  
return (
    <div className="card h-100" style={cardBaseStyle}>
      <div className="card-body w-100 d-flex flex-column">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              className="mb-0"
              style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}
            >
              Primary Vault
            </h5>
            {account && onOpenModal && (
              <>
                <div className="main-btn-icon">
                  <div className="main-btn-icon-inner">
                    <button
                     onClick={isDisabledAlt ? undefined : onOpenModal} // disable click
                      className="btn btn-icon"
                      style={{
                        background: "rgba(127, 255, 76, 0.1)",
                        border: "1px solid rgba(127, 255, 76, 0.2)",
                        width: "45px",
                        height: "45px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        color: "rgb(127, 255, 76)",
                        padding: "0.25rem",
                        alignSelf: "flex-start",
                      }}
                         title={isDisabledAlt ? "Disabled at this time" : "Send USDT"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgb(127, 255, 76)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!account ? (
            <>
              <p
                style={{
                  marginBottom: ".5rem",
                  fontWeight: "bold",
                  fontSize: "1.75rem",
                  color: "#fff",
                  textAlign: "start",
                }}
              >
                {typeof xamanBalance === "number"
                  ? xamanBalance.toFixed(6)
                  : "0.000000"}{" "}
                USDT
              </p>
            </>
          ) : (
            <div
              className="w-100 d-flex flex-column justify-content-center flex-grow-1"
              style={{
                marginTop: "1.5rem",
              }}
            >
              <p
                style={{
                  marginBottom: ".5rem",
                  fontWeight: "bold",
                  fontSize: "1.75rem",
                  color: "#fff",
                  textAlign: "start",
                }}
              >
                {typeof xamanBalance === "number"
                  ? xamanBalance.toFixed(6)
                  : "0.000000"}{" "}
                USDT
              </p>
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  // justifyContent: "center",
                  textAlign: "left",

                  // wordBreak: "break-all",
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: "0.85rem", color: "#b3baff" }}>
                    <p> Connected:</p>
                    <b
                      style={{
                        // width: "200px",
                        // backgroundColor: "#fff",
                        padding: "10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        border: "1px solid ",
                        borderRadius: "8px",
                      }}
                    >
                      {account}
                    </b>
                  </div>
                </div>

                {onLogout && (
                  <div>
                    {" "}
                    <button
                      onClick={onLogout}
                      style={iconButtonStyle}
                      title="Disconnect Wallet"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 1a.5.5 0 0 0-.5.5v3.75L1.72 1.97a.5.5 0 0 0-.84.35V14a.5.5 0 0 0 .84.35L5 10.75V14.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V1a.5.5 0 0 0-.5-.5h-5zM5 10.44 2.03 12.62a.5.5 0 0 0-.03.03V3.35a.5.5 0 0 0 .03.03L5 5.56v4.88zm5.5 3.06H6v-1.88L8.12 9.5h.76L11 11.56v1.94zM11 1L6 1v3.5l5 4V1z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {account ? (
          <div className="mt-4">
            <Link
              href={isDisabledAlt ? "#" : "/dashboard/history/xaman"}
              className="btn w-100"
              style={{
                background: "rgba(127, 255, 76, 0.1)",
                color: "#7FFF4C",
                border: "1px solid rgba(127, 255, 76, 0.2)",
                borderRadius: "12px",
                padding: "0.75rem",
                justifyContent: "center",
                pointerEvents: isDisabledAlt ? "none" : "auto",
                transition: "all 0.3s ease",
                // cursor: "not-allowed",
                // pointerEvents: "none",
              }}
            >
              View History
            </Link>
          </div>
        ) : (
          <>
            <div>
              <a href="https://xaman.app/">
                {" "}
                <img
                  src="/assets/img/elements/xamn.png"
                  alt="Connect Wallet"
                  // onClick={onLogin}
                  style={{
                    position: "absolute",
                    top: "35px",
                    right: "45px",
                    width: "50px",
                    opacity: 1,
                    cursor: "pointer",
                  }}
                />
              </a>
            </div>

            <button
              onClick={onLogin}
              className="btn"
              style={{
                background: "rgba(127, 255, 76, 0.1)",
                border: "1px solid rgba(127, 255, 76, 0.2)",
                color: "rgb(127, 255, 76)",
                height: "45px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px", // optional: gives soft corners
              }}
            >
              Connect Primary Vault
            </button>
          </>
        )}
      </div>
    </div>
  );
}
