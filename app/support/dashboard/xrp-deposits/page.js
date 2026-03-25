"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "../../../globals.css";

// Ensure API_BASE_URL ends with a trailing slash
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

const depositStatuses = ["pending_verification", "completed", "failed"];

const dropsToXRP = (drops) => (parseFloat(drops) / 1000000).toFixed(6);
const formatAmount = (amount, isDeposit) =>
  isDeposit ? dropsToXRP(amount) : parseFloat(amount).toFixed(6);

const getCurrentUTCDate = () => {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(now.getUTCDate()).padStart(2, "0");
  return `${utcYear}-${utcMonth}-${utcDay}`;
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "12px",
  border: "1px solid rgba(79, 140, 255, 0.2)",
  background: "rgba(79, 140, 255, 0.1)",
  color: "#fff",
  fontSize: "0.9rem",
};

const getStatusBadgeStyle = (status) => {
  const baseStyle = {
    borderRadius: "12px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.8rem",
    fontWeight: "bold",
    color: "#fff",
  };
  switch (status) {
    case "completed":
      return {
        ...baseStyle,
        background: "rgba(21, 192, 129, 0.2)",
        color: "#15c081",
      };
    case "failed":
      return {
        ...baseStyle,
        background: "rgba(255, 77, 77, 0.2)",
        color: "#ff4d4d",
      };
    default:
      return {
        ...baseStyle,
        background: "rgba(255, 215, 0, 0.2)",
        color: "#ffd700",
      };
  }
};

export default function XrpTransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("deposits","");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xamanMessage, setXamanMessage] = useState(null); // { type: "success" | "error", text: string }

  const [error, setError] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const todayUTC = getCurrentUTCDate();
  const [filters, setFilters] = useState({
    status: "",
    walletAddress: "",
    transactionId: "",
    startDate: todayUTC, // ✅ Default to today UTC
    endDate: todayUTC,   // ✅ Default to today UTC
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xrplAmount, setXrplAmount] = useState(null);

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState([]);
  const [uhid, setUhid] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const endpointMap = {
    deposits: "xrp-deposits",
    withdrawals: "xrp-withdrawals",
    claimed: "xrp-claimed",
    redeemed: "xrp-redeemed",
    autopositioning: "xrp-autopositioning",
    lppositioning: "lp-positioning",
    withdrawalerror :"xrp-withdrawalerror"
  };
  const [userMap, setUserMap] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalEntries: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10, // Show fewer entries on dashboard
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // for success or error message
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const [filterField, setFilterField] = useState("uhid");
  const [filterValue, setFilterValue] = useState("");
  const [summary, setSummary] = useState({ totalRecords: 0, totalAmount: 0 });


  const fetchTransactions = async (page = 1,limit = pagination.limit) => {
    setLoading(true);
    setError(null);
  const appliedLimit = limit ?? pagination.limit ?? 10;  // ✅ always a number

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const query = new URLSearchParams({
        ...cleanFilters,
        page,
        limit:appliedLimit,
      }).toString();

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // ✅ Dynamically select endpoint based on current tab
      const endpoint = endpointMap[activeTab];
      if (!endpoint) throw new Error(`Unknown tab: ${activeTab}`);

      const response = await fetch(`${API_BASE_URL}api/support/${endpoint}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch transactions");

      // ✅ Standardize data shape based on activeTab
      const transformedData = data.data.map((tx) => {
        switch (activeTab) {
          case "deposits":
            return {
              ...tx,
              amount: formatAmount(tx.amount, true),
              transactionId: tx.transactionId || tx.refId,
              walletAddress: tx.walletAddress || tx.destinationAddress,
              username: tx.userId?.username || tx.username || "Unknown",
              uhid: tx.userId?.uhid || tx.uhid || "",
            };

          case "withdrawals":
            return {
              ...tx,
              amount: formatAmount(tx.amount, false),
              transactionId: tx.refId,
              fromWallet: tx.fromWallet,
              toAddress: tx.toAddress,
              username: tx.userId?.username || tx.username || "Unknown",
              uhid: tx.userId?.uhid || tx.uhid || "",
            };

          // 👇 Add uniform handling for new tabs
          case "claimed":
          case "redeemed":
          case "autopositioning":
            return {
              ...tx,
              amount: parseFloat(tx.amount).toFixed(6),
              transactionId: tx.refId || tx.transactionId || "",
              username: tx.userId?.username || tx.username || "Unknown",
              uhid: tx.userId?.uhid || tx.uhid || "",
              eventType: tx.eventType || activeTab.toUpperCase(),
            };

          default:
            return tx;
        }
      });

      setTransactions(transformedData);
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalEntries: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: pagination.limit,
        }
      );

      // ✅ Capture summary data if present
      if (data.summary) {
        setSummary({
          totalRecords: data.summary.totalRecords || 0,
          totalAmount: parseFloat(data.summary.totalAmount || 0).toFixed(6),
        });
      } else {
        setSummary({ totalRecords: 0, totalAmount: 0 });
      }
      setCurrentPage(data.pagination?.currentPage || 1);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);

      if (err.message.includes("Authentication required") || err.message.includes("Unauthorized")) {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (user && ["support", "admin"].includes(user.userType)) {
    fetchTransactions(pagination.currentPage,pagination.limit);
  }
}, [user, activeTab, pagination.currentPage, pagination.limit]);


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(pagination.currentPage, pagination.limit);
  };
  const fetchXrplAmount = async (transactionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch(
        `${API_BASE_URL}api/support/xrp-deposits/transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId: transactionId,
            binary: false,
          }),
        }
      );

      const result = await response.json();
      const txdata = result?.data;
      console.log("result", result);
      if (result?.data?.amount) {
        const amountFromXRPL = result?.data?.amount;
        setXrplAmount(amountFromXRPL); // convert drops to XRP

        setUsername(txdata?.user?.username); // convert drops to XRP
        setUhid(txdata?.user?.uhid); // c
      } else {
        setXrplAmount("0");
      }
    } catch (error) {
      console.error("XRPL Fetch Error:", error);
      setXrplAmount("0");
    }
  };
  useEffect(() => {
    if (selectedTx?.transactionId) {
      fetchXrplAmount(selectedTx.transactionId);
    }
  }, [selectedTx]);

  const handleAddToXaman = async (selectedDeposit) => {
    if (!selectedDeposit || !selectedDeposit._id) {
      setXamanMessage({ type: "error", text: "No deposit selected." });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}api/support/xrp-deposits/add-to-xaman`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            _id: selectedDeposit._id,
            walletAddress: selectedDeposit.walletAddress,
            transactionId: selectedDeposit.transactionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setXamanMessage({ type: "success", text: result.message });
        // ✅ Auto-clear the message after 10 seconds (10000 ms)
        setTimeout(() => {
          setXamanMessage(null);
        }, 5000);
        // ✅ Update local state with new amount and status
        const updatedDeposit = {
          ...selectedDeposit,
          amount: result.deliveredAmount || selectedDeposit.amount,
          status: "completed",
        };

        setSelectedTx(updatedDeposit); // <- Update selected item state
      } else {
        setXamanMessage({
          type: "error",
          text: result.message || "Failed to add to Xaman.",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      setXamanMessage({
        type: "error",
        text: "Something went wrong. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const handleTabChange = (tab) => {
  setActiveTab(tab);
  setTransactions([]);
  const todayUTC = getCurrentUTCDate();
  // Build filters dynamically
  const baseFilters = {
    walletAddress: "",
    transactionId: "",
    startDate: todayUTC,  // ✅ Set default UTC start date
    endDate: todayUTC, 
  };

  if (tab === "deposits") {
    baseFilters.status = "";
  }

  setFilters(baseFilters);

  // Reset pagination
  setPagination((prev) => ({ ...prev, currentPage: 1 }));
};





  React.useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/sign-in");
      } else if (!["support", "admin"].includes(user.userType)) {
        router.push("/sign-in");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
        Loading authentication state...
      </div>
    );
  }

  if (!user || !["support", "admin"].includes(user.userType)) {
    return (
      <div style={{ textAlign: "center", color: "#ff4d4d", padding: "2rem" }}>
        Unauthorized access. Redirecting...
      </div>
    );
  }

  const tabStyle = (isActive) => ({
    padding: "0.75rem 1.5rem",
    background: isActive ? "rgba(79, 140, 255, 0.1)" : "transparent",
    border:
      "1px solid " + (isActive ? "rgba(79, 140, 255, 0.2)" : "transparent"),
    borderRadius: "12px",
    color: isActive ? "#4f8cff" : "#b3baff",
    cursor: "pointer",
    marginRight: "1rem",
    fontSize: "0.9rem",
    fontWeight: "bold",
  });

  return (
    <div
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        padding: "2rem",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", color: "#fff" }}>
        XRP Transactions Explorer
      </h2>
      {/* ✅ Tab Bar with Summary */}
<div
  style={{
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  {/* --- Tabs --- */}
  <div style={{ display: "flex" }}>
    <button
      onClick={() => handleTabChange("deposits")}
      style={tabStyle(activeTab === "deposits")}
    >
      Deposits
    </button>
    <button
      onClick={() => handleTabChange("withdrawals")}
      style={tabStyle(activeTab === "withdrawals")}
    >
      Withdrawals
    </button>
    <button
      onClick={() => handleTabChange("claimed")}
      style={tabStyle(activeTab === "claimed")}
    >
      Claimed
    </button>
    <button
      onClick={() => handleTabChange("redeemed")}
      style={tabStyle(activeTab === "redeemed")}
    >
      Redeemed
    </button>
    <button
      onClick={() => handleTabChange("autopositioning")}
      style={tabStyle(activeTab === "autopositioning")}
    >
      Autopositioning
    </button>
      <button
      onClick={() => handleTabChange("lppositioning")}
      style={tabStyle(activeTab === "lppositioning")}
    >
      LP Positioning
    </button>
      <button
      onClick={() => handleTabChange("withdrawalerror")}
      style={tabStyle(activeTab === "withdrawalerror")}
    >
     Withdrawal Pending
    </button>
  </div>

  {/* --- Summary Info --- */}
  <div
    style={{
      display: "flex",
      gap: "1.5rem",
      color: "#4f8cff",
      fontSize: "0.9rem",
      fontWeight: "600",
      background: "rgba(79,140,255,0.05)",
      border: "1px solid rgba(79,140,255,0.2)",
      borderRadius: "12px",
      padding: "0.6rem 1rem",
      alignItems: "center",
    }}
  >
    <div>
      Total Records:{" "}
      <span style={{ color: "#fff" }}>{summary.totalRecords}</span>
    </div>
    <div>
      Total Amount:{" "}
      <span style={{ color: "#fff" }}>{summary.totalAmount}</span>
    </div>
  </div>
</div>

      <form
        onSubmit={handleSearch}
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(79, 140, 255, 0.2)",
          background: "rgba(16,25,53,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            gridTemplateColumns: "1fr 1fr 1fr 0.5fr",
            gap: "1rem",
            alignItems: "flex-end",
          }}
        >
          {["deposits", "withdrawals","claimed","redeemed"].includes(activeTab) && (
            <input
              type="text"
              name="walletAddress"
              value={filters.walletAddress}
              onChange={handleFilterChange}
              placeholder={
                activeTab === "deposits"
                  ? "Sender Wallet Address..."
                  : "Destination Wallet Address..."
              }
              style={inputStyle}
            />
          )}
 {["deposits", "withdrawals","claimed","redeemed"].includes(activeTab) && (
          <input
            type="text"
            name="transactionId"
            value={filters.transactionId}
            onChange={handleFilterChange}
            placeholder="Transaction ID..."
            style={inputStyle}
          />
            )}
          {/* 🗓️ Start Date Filter */}
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
            style={inputStyle}
          />

          {/* 🗓️ End Date Filter */}
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
            style={inputStyle}
          />
          {activeTab === "deposits" && (
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={inputStyle}
            >
              <option value="">Any Status</option>
              {depositStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          {activeTab === "withdrawals" && <div style={{ width: "100%" }}></div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              color: "#4f8cff",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1,
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {loading ? "..." : "Filter"}
          </button>
        </div>
      </form>
      {loading && (
        <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
          Loading...
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.2)" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                User Info
              </th>
              
                {/* Hide Transaction ID for autopositioning */}
                {(activeTab !== "autopositioning" && activeTab !== "lppositioning")  && (
                  <th style={{ padding: "1rem", textAlign: "left", color: "#4f8cff" }}>
                    Transaction ID
                  </th>
                )}
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Amount (XRP)
              </th>
              {activeTab === "deposits" ? (
                <>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#4f8cff",
                    }}
                  >
                    Sender Address
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#4f8cff",
                    }}
                  >
                    Status
                  </th>
                </>
              ) : (
                  <>
                    {/* Hide walletFrom / toAddress for autopositioning */}
                    {(activeTab !== "autopositioning" && activeTab !== "lppositioning")  && (
                  <>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#4f8cff",
                    }}
                  >
                    From Wallet
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#4f8cff",
                    }}
                  >
                    To Address
                  </th>
                  </>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx._id}
                  style={{
                    borderBottom: "1px solid rgba(79, 140, 255, 0.1)",
                  }}
                >
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                   {new Date(tx.ts || tx.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}
                  </td>
                  <td style={{ padding: "1rem", color: "#fff" }}>
                    {activeTab === "deposits" ? (
                      <>
                        <div>{tx?.user?.username}</div>
                        <div style={{ fontSize: "0.8em", color: "#b3baff" }}>
                          {tx?.user?.uhid}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{tx.username}</div>
                        <div style={{ fontSize: "0.8em", color: "#b3baff" }}>
                          {tx.uhid}
                        </div>
                      </>
                    )}
                  </td>
                  {/* Hide Transaction ID for autopositioning */}
                  {(activeTab !== "autopositioning" && activeTab !== "lppositioning")  && (
                  <td
                        style={{
                          padding: "1rem",
                          color: "#fff",
                        }}
                        title={tx.transactionId}
                      >
                        {activeTab === "deposits" ? (
                          // 🟢 For deposits — open modal as before
                          <span
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => {
                              setSelectedTx(tx);
                              setShowModal(true);
                            }}
                          >
                            {tx.transactionId?.substring(0, 20)}...
                          </span>
                        ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <a
                              href={`https://xrpscan.com/tx/${tx.transactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#4f8cff",
                                textDecoration: "underline",
                                cursor: "pointer",
                                wordBreak: "break-all",
                              }}
                            >
                              {tx.transactionId?.substring(0, 20)}...
                            </a>
                          {/* 🎨 Event Type / Claimed Badge */}
                          {tx.eventType && ( activeTab === "withdrawals") && (
                            <span
                              style={{
                                marginTop: "6px",
                                alignSelf: "flex-start",
                                borderRadius: "10px",
                                padding: "2px 8px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                color:"#fff",
                                background:
                                  tx.eventType === "WITHDRAWAL"
                                    ? "rgba(255,77,77,0.17)" // 🔴 Red badge for Claimed
                                    : "rgba(79,140,255,0.1)", // Blue tint for others
                              }}
                            >
                              { tx.eventType === "WITHDRAWAL"
                                ? "Claimed"
                                : tx.eventType.replace(/_/g, " ")}
                            </span>
                          )}
                          </div>
                        )}
                  </td>
                  )}

                  <td style={{ padding: "1rem", color: "#fff" }}>
                    {tx.amount}
                  </td>
                  {activeTab === "deposits" ? (
                    <>
                      <td style={{ padding: "1rem", color: "#fff" }}>
                        {tx.walletAddress}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={getStatusBadgeStyle(tx.status)}>
                          {tx.status?.replace("_", " ")}
                        </span>
                      </td>
                    </>
                  ) : (
                      <>
                        {(activeTab !== "autopositioning" && activeTab !== "lppositioning")  && (
                          <>
                            <td style={{ padding: "1rem", color: "#fff" }}>{tx.fromWallet}</td>
                            <td style={{ padding: "1rem", color: "#fff" }}>{tx.toAddress}</td>
                          </>
                        )}
                      </>
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#b3baff",
                  }}
                >
                  No {activeTab} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && selectedTx && (
        <div className="xrp_modalBackdrop" onClick={() => setShowModal(false)}>
          <div
            className="xrp_modalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="xrp_modalClose"
              onClick={() => setShowModal(false)}
            >
              <svg
                width={20}
                height={20}
                fill="#fff"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
              </svg>
            </button>

            <h3 className="xrp_modalTitle">Transaction Details</h3>

            <div className="xrp_section xrp_date">
              <strong>Date:</strong>{" "}
              <span>
                {new Date(
                  selectedTx.ts || selectedTx.createdAt
                ).toLocaleString()}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                {" "}
                <div className="xrp_section xrp_username">
                  <strong>Username:</strong>
                  <span>{username || "N/A"}</span>
                </div>
                <div className="xrp_section xrp_uhid">
                  <strong>UHID:</strong>
                  <span>{uhid || "N/A"}</span>
                </div>
              </div>
              <div className="xrp_section xrp_amount">
                <strong>Amount:</strong>
                <span>
                  {xrplAmount !== null ? `${xrplAmount} XRP` : "Loading..."}
                </span>
              </div>
            </div>

            <div className="xrp_section xrp_transactionId">
                <strong>Transaction ID:</strong>{" "}
                <div>
                  <span className="xrp_transactionId_value">
                    {selectedTx.transactionId}
                  </span>
                  <button
                    className="xrp_copyButton"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTx.transactionId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
                    }}
                    title="Copy to clipboard"
                  >
                    <svg
                      width={16}
                      height={16}
                      fill="#fff"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path d="M192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-200.6c0-17.4-7.1-34.1-19.7-46.2L370.6 17.8C358.7 6.4 342.8 0 326.3 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0z" />
                    </svg>
                  </button>
                  {copied && <span className="xrp_copyMessage">Copied!</span>}
                </div>
              </div>
           
            {activeTab === "deposits" ? (
              <>
                <div className="xrp_section xrp_walletAddress">
                  <strong>Wallet Address:</strong>{" "}
                  <span>{selectedTx.walletAddress}</span>
                </div>

                <div className="xrp_section xrp_status">
                  <div className="xrp_actionAddXaman_section">
                    <div className="xrp_statusDropdownWrapper">
                      <div className="xrp_selectWithIcon">
                        <select
                          className={`xrp_statusDropdown
                            ${
                              selectedTx.status === "completed"
                                ? "xrp_statusDropdown--completed"
                                : ""
                            }
                            ${
                              selectedTx.status === "failed_verification"
                                ? "xrp_statusDropdown--failed"
                                : ""
                            }
                          `}
                          value={selectedTx.status}
                          onChange={(e) =>
                            setSelectedTx({
                              ...selectedTx,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="pending_verification">
                            Pending Verification
                          </option>
                        </select>

                        <span className="xrp_dropdownIcon">
                          <svg
                            width={16}
                            height={16}
                            fill="#fff"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* {selectedTx.status !== "completed" && ( */}
                    <div className="xrp_actionAddXaman">
                      <button
                        className="xrp_buttonAddXaman"
                        onClick={() => handleAddToXaman(selectedTx)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <svg
                            className="xrp_loader"
                            width={16}
                            height={16}
                            viewBox="0 0 50 50"
                          >
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="5"
                              strokeLinecap="round"
                              strokeDasharray="31.4 31.4"
                              transform="rotate(-90 25 25)"
                            >
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                values="0 25 25;360 25 25"
                                dur="1s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </svg>
                        ) : (
                          "Add to Xaman"
                        )}
                      </button>
                    </div>
                    {/* )} */}
                    {/* {selectedTx.status !== "failed_verification" && ( */}
                    <div className="xrp_actionAddXaman">
                      <button className="xrp_buttonAddXaman">Update</button>
                    </div>
                    {/* )} */}
                  </div>
                </div>
                {xamanMessage && (
                  <div
                    className={`mt-2 flex items-center space-x-2 ${
                      xamanMessage.type === "success"
                        ? "text-green-600 font-bold"
                        : "text-red-600"
                    }`}
                  >
                    <span>{xamanMessage.type === "success" ? "✅" : "❌"}</span>
                    <span>{xamanMessage.text}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="xrp_section xrp_fromWallet">
                  <strong>From Wallet:</strong>{" "}
                  <span>{selectedTx.fromWallet}</span>
                </div>
                <div className="xrp_section xrp_toAddress">
                  <strong>To Address:</strong>{" "}
                  <span>{selectedTx.toAddress}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {pagination.totalPages > 1 && (
        <div
          className="d-flex flex-column gap-2 mt-4"
          style={{ padding: "0 1rem" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <select
                className="form-select form-select-sm"
                value={pagination.limit}
                onChange={(e) => {
                  setPagination((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    currentPage: 1,
                  }));
                }}
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "0.25rem 0.75rem",
                }}
              >
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button
              className="btn btn-sm"
              style={{
                background: pagination.hasPrevPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasPrevPage ? "#4f8cff" : "#8b92b5",
                border: `1px solid ${
                  pagination.hasPrevPage
                    ? "rgba(79, 140, 255, 0.2)"
                    : "rgba(139, 146, 181, 0.2)"
                }`,
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (pagination.hasPrevPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                    limit:pagination.limit,
                  }));
                }
              }}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>

            {(() => {
              const getPageNumbers = (currentPage, totalPages) => {
                const delta = 2;
                const range = [],
                  rangeWithDots = [];
                let l;

                for (let i = 1; i <= totalPages; i++) {
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= currentPage - delta && i <= currentPage + delta)
                  ) {
                    range.push(i);
                  }
                }

                for (let i of range) {
                  if (l) {
                    if (i - l === 2) rangeWithDots.push(l + 1);
                    else if (i - l !== 1) rangeWithDots.push("...");
                  }
                  rangeWithDots.push(i);
                  l = i;
                }

                return rangeWithDots;
              };

              return getPageNumbers(
                pagination.currentPage,
                pagination.totalPages
              ).map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    style={{
                      padding: "0.4rem 0.8rem",
                      color: "#8b92b5",
                      fontSize: "0.85rem",
                    }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    className="btn btn-sm"
                    style={{
                      background:
                        pagination.currentPage === pageNum
                          ? "rgba(79, 140, 255, 0.2)"
                          : "rgba(79, 140, 255, 0.05)",
                      color:
                        pagination.currentPage === pageNum
                          ? "#4f8cff"
                          : "#8b92b5",
                      border: `1px solid ${
                        pagination.currentPage === pageNum
                          ? "rgba(79, 140, 255, 0.4)"
                          : "rgba(79, 140, 255, 0.2)"
                      }`,
                      borderRadius: "6px",
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      minWidth: "36px",
                    }}
                    onClick={() => {
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: pageNum,
                        limit:pagination.limit,
                      }));
                    }}
                  >
                    {pageNum}
                  </button>
                )
              );
            })()}

            <button
              className="btn btn-sm"
              style={{
                background: pagination.hasNextPage
                  ? "rgba(79, 140, 255, 0.1)"
                  : "rgba(139, 146, 181, 0.1)",
                color: pagination.hasNextPage ? "#4f8cff" : "#8b92b5",
                border: `1px solid ${
                  pagination.hasNextPage
                    ? "rgba(79, 140, 255, 0.2)"
                    : "rgba(139, 146, 181, 0.2)"
                }`,
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (pagination.hasNextPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                    limit:pagination.limit,
                  }));
                }
              }}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
