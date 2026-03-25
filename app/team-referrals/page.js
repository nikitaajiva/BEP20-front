"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  FaSync,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";
import styles from "./team-referrals.module.css";
import XRankBadge from "@/components/XRankBadge";

const ITEMS_PER_PAGE = 10;

// Helper function for smart pagination
const generatePagination = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return [...Array(totalPages).keys()].map((i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage > totalPages - 4) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

// Helper function to format LP Amount
const formatLpAmount = (amount) => {
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0) + " USDT"
  );
};

const format = (amount) => {
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  );
};

export default function TeamReferralsPage(
  ledgerDetails,
  loadingLedger,
  ledgerError
) {
  const { user, loading: authLoading, API_URL, logout } = useAuth();
  const [Data, setData] = useState();
  console.log(user, "user user user");

  const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .toISOString()
      .slice(0, 10); // YYYY-MM-DD
  };

  const [dateFrom, setDateFrom] = useState(getTodayUTC());
  const [dateTo, setDateTo] = useState(getTodayUTC());

  const [ledgerSearch, setLedgerSearch] = useState("");

  const fetchUSDTData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/ripple?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false"
      );
      const result = await response.json();
      const market_data = result.market_data;

      const dynamicData = {
        USDT: {
          currentPrice: market_data.current_price.usd,
          change24h: market_data.price_change_24h,
          changePercent: market_data.price_change_percentage_24h,
          totalSupply: market_data.total_supply,
          high: market_data.high_24h.usd,
          low: market_data.low_24h.usd,
        },
      };

      setData(dynamicData);
      console.log(dynamicData, "sssssssssssss");
    } catch (error) {
      console.error("Error fetching USDT data:", error);
    }
  };
  useEffect(() => {
    fetchUSDTData();
    // This useEffect is primarily for logging and can be removed or adjusted
  }, [user, ledgerDetails, loadingLedger, ledgerError]);

  const initialFetchComplete = useRef(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const [displayedReferrals, setDisplayedReferrals] = useState([]);
  const [sumselflp, setSumselflp] = useState(null);

  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [referralsError, setReferralsError] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState(0);
  const [levelInput, setLevelInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedLevels, setClickedLevels] = useState([]);
  const [totalClickedValue, setTotalClickedValue] = useState(0);
  const fetchReferrals = useCallback(
    async (targetUhid, targetUsername, level, search = null) => {
      if (!API_URL || !targetUhid || !user?.uhid) return;

      setIsLoadingReferrals(true);
      setReferralsError(null);
      setCurrentPage(1);

      let url = "";
      const viewerUhid = user.uhid; // The person who is logged in

      if (level && level > 0) {
        url = `${API_URL}/hierarchy/users/${targetUhid}/descendants/level/${level}?viewerUhid=${viewerUhid}`;
      } else {
        url = `${API_URL}/hierarchy/users/${targetUhid}/descendants?viewerUhid=${viewerUhid}`;
      }
      if (searchInput && searchInput.trim() !== "") {
        url += `&search=${encodeURIComponent(searchInput.trim())}`;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch referrals");
        }

        const referralsData =
          level && level > 0 ? data.descendants_at_level : data.descendants;
        setDisplayedReferrals(referralsData || []);
        setSumselflp(data.levelSelfLpSum);
        setViewedUser({ uhid: targetUhid, username: targetUsername });
      } catch (err) {
        console.error(
          `Error fetching referrals for UHID: ${targetUhid}, Level: ${level || "direct"
          }`,
          err
        );
        setReferralsError(err.message);
        setDisplayedReferrals([]);
        setSumselflp(data.levelSelfLpSum);
      } finally {
        setIsLoadingReferrals(false);
      }
    },
    [API_URL, user, searchInput]
  );


  const [ledgerTotals, setLedgerTotals] = useState({ deposited: 0, withdrawal: 0 });
  const [isLoadingTotals, setIsLoadingTotals] = useState(false);
  const fetchLedgerTotals = async (
    from = dateFrom,
    to = dateTo,
    searchValue = ledgerSearch
  ) => {
    try {
      setIsLoadingTotals(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      let url = `${API_URL}/ledger/team-daily-totals?from=${from}&to=${to}`;
      if (searchValue && searchValue.trim() !== "") {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (json.success) {
        setLedgerTotals({
          deposited: json.totals.deposited || 0,
          withdrawal: json.totals.withdrawal || 0,
        });
      } else {
        console.warn("Ledger totals API failed:", json);
      }
    } catch (e) {
      console.error("Failed to fetch totals", e);
    } finally {
      setIsLoadingTotals(false);
    }
  };




  useEffect(() => {
    console.log("useaffect running");
    if (authLoading) {
      return; // Wait for auth to complete.
    }

    // We only want this effect to run ONCE for the initial fetch.
    if (initialFetchComplete.current) {
      return;
    }

    if (user?.uhid) {
      // We have a user and we haven't fetched their data yet.
      initialFetchComplete.current = true;
      fetchReferrals(user.uhid, user.username, 0);
      setSelectedLevel(0);
      setLevelInput("");
    } else {
      // Auth is done, but we still don't have a user with a uhid.
      // This might be a guest or an error case.
      console.warn("Auth complete, but no user with UHID found.");
    }
  }, [authLoading, user, fetchReferrals]);
  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    if (dateFrom > dateTo) return;

    fetchLedgerTotals(dateFrom, dateTo, ledgerSearch);
  }, [dateFrom, dateTo, ledgerSearch]);


  // if(user.username =="Mrperfect2025"){
  //   user.level = "x1"
  // }
  const handleViewUserReferrals = (targetUhid, targetUsername) => {
    if (viewedUser) {
      setViewHistory((prev) => [...prev, viewedUser]);
    }
    setSelectedLevel(0);
    setLevelInput("");
    fetchReferrals(targetUhid, targetUsername, 0);
  };

  const handleGoBack = () => {
    if (viewHistory.length > 0) {
      const previousUser = viewHistory[viewHistory.length - 1];
      setViewHistory((prev) => prev.slice(0, -1));
      setSelectedLevel(0);
      setLevelInput("");
      fetchReferrals(previousUser.uhid, previousUser.username, 0);
    }
  };

  const handleLevelFilterChange = (e) => {
    setSearchInput(e.target.value);
  };

  const applyLevelFilter = () => {
    const levelNum = parseInt(levelInput, 10);
    if (!isNaN(levelNum) && levelNum >= 0) {
      setSelectedLevel(levelNum);
      if (viewedUser?.uhid && viewedUser?.username) {
        fetchReferrals(viewedUser.uhid, viewedUser.username, levelNum);
      } else if (user?.uhid && user?.username) {
        fetchReferrals(user.uhid, user.username, levelNum);
      }
    } else if (levelInput === "") {
      setSelectedLevel(0);
      if (viewedUser?.uhid && viewedUser?.username) {
        fetchReferrals(viewedUser.uhid, viewedUser.username, 0);
      }
    }
  };

  const handleRefresh = () => {
    if (viewedUser?.uhid && viewedUser?.username) {
      fetchReferrals(viewedUser.uhid, viewedUser.username, selectedLevel);
    } else if (user?.uhid && user?.username) {
      fetchReferrals(user.uhid, user.username, selectedLevel);
    }
  };

  const selfLp = displayedReferrals
    .reduce((sum, referral) => {
      return sum + (parseFloat(referral.selfLp) || 0);
    }, 0)
    .toFixed(4);

  const selfLpsum = displayedReferrals
    .reduce((sum, referral) => {
      return sum + (parseFloat(referral.selfLp) || 0);
    }, 0)
    .toFixed(4);

  const Community_USDT_Balance = displayedReferrals
    .reduce((sum, referral) => {
      return sum + (parseFloat(referral.teamLp) || 0);
    }, 0)
    .toFixed(4);
  const Community_USDT_Balancetotal = (
    parseFloat(selfLp) + parseFloat(Community_USDT_Balance)
  ).toFixed(4);

  console.log(Community_USDT_Balancetotal, "Community_USDT_Balancetotal");
  const totalPages = Math.ceil(displayedReferrals.length / ITEMS_PER_PAGE);
  const paginatedReferrals = displayedReferrals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginationItems =
    totalPages > 1 ? generatePagination(currentPage, totalPages) : [];

  if (authLoading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className={styles.loading}>Please log in to view this page.</div>
    );
  }



  return (
    <AuthGuard>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <main className={styles.mainContent} style={{ minWidth: 0 }}>
            <div className={styles.headerRow}>
              <h1 className={styles.pageTitle}>Team Referrals</h1>
              {/* {viewHistory.length > 0 && (
                <button onClick={handleGoBack} className={styles.backButton}>
                  &larr; Back toytytrd{" "}
                  {viewHistory[viewHistory.length - 1].username}
                </button>
              )} */}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-8 col-md-7">
                <div className={`${styles.card} h-100`}>
                  <div className={styles.cardHeader}>
                    <h5 className={styles.cardTitle}>My Referral Stats</h5>
                  </div>
                  <div className={styles.cardBody}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>Community USDT Balance:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {Community_USDT_Balancetotal ?? "0.0000"} USDT
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>X Bonus position:</span>
                          <div className="X_Bonus_position">
                            <XRankBadge rank={user.xRank} />
                            {/* <div className="user_ranking_section">
                              <svg
                                width={24}
                                hanging={24}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                fill="#fff"
                              >
                                <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
                              </svg>
                              <div>21</div>
                            </div> */}
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>My Level:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {user.level ?? 0}
                          </span>
                        </div>
                      </div> */}
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>Front lines:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {user.directDownlines ?? 0}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>Community Size:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {user.communitySize ?? 0}
                          </span>
                        </div>
                      </div>
                      {/* <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>Current Rank:</span>
                          <XRankBadge rank={user.xRank} />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-5">
                <div className={`${styles.card} h-100 `}>
                  <div
                    className={`${styles.cardHeader} ${styles.mbFiltersheadding} `}
                  >
                    <h5 className={styles.cardTitle}>Quick Tier Filters</h5>
                    <small className={styles.cardSubTitle}>
                      {/* Jump to specific team levels */}
                    </small>
                  </div>

                  <div className={styles.cardBody}>
                    <div className="row g-2 ">
                      <div className="col-12">
                        <select
                          className={`${styles.levelDropdown}`}
                          value={selectedLevel}
                          onChange={(e) => {
                            const level = parseInt(e.target.value);
                            setSelectedLevel(level);
                            setLevelInput(level.toString());

                            setClickedLevels((prev) => {
                              if (!prev.includes(level)) {
                                const updated = [...prev, level];
                                const total = updated.reduce(
                                  (sum, val) => sum + val,
                                  0
                                );
                                setTotalClickedValue(total);
                                return updated;
                              }
                              return prev;
                            });

                            const targetUHID = viewedUser?.uhid || user?.uhid;
                            const targetUsername =
                              viewedUser?.username || user?.username;

                            if (targetUHID && targetUsername) {
                              fetchReferrals(targetUHID, targetUsername, level);
                            }
                          }}
                          disabled={isLoadingReferrals}
                        >
                          <option value="">Select Tier</option>
                          {Array.from({ length: 16 }, (_, i) => i + 1).map(
                            (level) => (
                              <option key={level} value={level}>
                                Tier {level}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    {/* Right section that conditionally shows Self LP or T1 */}
                    <div className="mt-3 filterCardheaddingsection">
                      {searchInput.trim() === "" ? (
                        selectedLevel ? (
                          // T1-Tx Section
                          <div className={styles.filterCard}>
                            <div className="innerfilterCardheaddingsection">
                              <span>
                                {selectedLevel > 1
                                  ? `T1-T${selectedLevel}`
                                  : "T1"}
                              </span>
                              <span className="innerfilterCardheading">
                                {sumselflp}
                              </span>
                            </div>
                            <div className="innerfilterCardheaddingsection">
                              <span>Team LP</span>
                              <span className="innerfilterCardheading">
                                {Community_USDT_Balance}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Default Self LP
                          <div className={styles.filterCard}>
                            <div className="innerfilterCardheaddingsection">
                              <span>Tier 1</span>
                              <span className="innerfilterCardheading">
                                {selfLp}
                              </span>
                            </div>
                            <div className="innerfilterCardheaddingsection">
                              <span>Team LP</span>
                              <span className="innerfilterCardheadding">
                                {Community_USDT_Balance}
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        // Search result case: Self LP
                        <div className={styles.filterCard}>
                          <div className="innerfilterCardheaddingsection">
                            <span>Self LP</span>
                            <span className="innerfilterCardheading">
                              {selfLp}
                            </span>
                          </div>
                          <div className="innerfilterCardheaddingsection">
                            <span>Team LP</span>
                            <span className="innerfilterCardheading">
                              {Community_USDT_Balance}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 mb-3 align-items-end">
              <div className="col-lg-8 col-md-7">
                <div className={`${styles.card} h-100`}>
                  <div className="d-flex">
                    {/* From */}
                    <div className="col-md-6">
                      <label className={styles.dateLabel}>From (UTC)</label>
                      <input
                        type="date"
                        value={dateFrom}
                        max={getTodayUTC()}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDateFrom(v);
                          if (v > dateTo) setDateTo(v); // auto-fix
                        }}
                        className={styles.dateInput}
                      />
                    </div>

                    {/* To */}
                    <div className="col-md-6">
                      <label className={styles.dateLabel}>To (UTC)</label>
                      <input
                        type="date"
                        value={dateTo}
                        max={getTodayUTC()}
                        min={dateFrom}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>
                  <div className="row px-3 w-100 mb-2">
                    <div className="col-md-6 ">
                      <label className={styles.dateLabel}>
                        Search User (Username / Email / UHID)
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={ledgerSearch}
                          onChange={(e) => setLedgerSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              fetchLedgerTotals(dateFrom, dateTo, ledgerSearch);
                            }
                          }}
                          className={styles.dateInput}
                          placeholder="Enter username, email or UHID"
                        />

                        {ledgerSearch && (
                          <button
                            onClick={() => setLedgerSearch("")}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "16px",
                              color: "#999",
                              padding: 0,
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="col-md-2 d-flex align-items-center">
                      <button
                        className={styles.applyButton}
                        onClick={() => fetchLedgerTotals(dateFrom, dateTo, ledgerSearch)}
                        disabled={isLoadingTotals}
                        style={{ width: "100%" }}
                      >
                        &nbsp; Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-7">
                <div className={`${styles.card} h-100`}>
                  {/* Deposits */}
                  <div className="col-md-4 py-0">
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Total Deposits</div>
                      <div className={styles.statValue}>
                        {isLoadingTotals ? "—" : ledgerTotals.deposited.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Claimed */}
                  <div className="col-md-4 py-0">
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Total Claimed</div>
                      <div className={styles.claimedstatValue}>
                        {isLoadingTotals ? "—" : ledgerTotals.withdrawal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div></div>

            <div className="row g-4 mb-4">
              <div className="">
                <div className={styles.filterCard}>
                  <div className={styles.filterHeader}>
                    <button
                      onClick={handleRefresh}
                      className={styles.refreshButton}
                      disabled={isLoadingReferrals}
                    >
                      <FaSync className={isLoadingReferrals ? "fa-spin" : ""} />
                    </button>
                  </div>
                  <div
                    className="row g-2 align-items-center"
                    style={{ position: "relative" }}
                  >
                    <div className="col" style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => {
                          setSearchInput(e.target.value);
                          handleLevelFilterChange(e);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && applyLevelFilter()
                        }
                        className={styles.levelInput}
                        placeholder="Search with Username"
                        disabled={isLoadingReferrals}
                      />

                      {searchInput && (
                        <button
                          onClick={() => setSearchInput("")}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#999",
                            padding: 0,
                          }}
                        >
                          &#10005;
                        </button>
                      )}
                    </div>
                    <div className="col-auto">
                      <button
                        onClick={applyLevelFilter}
                        className={styles.applyButton}
                        disabled={isLoadingReferrals}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(viewHistory.length > 0 || viewedUser) && (
              <div
                className=""
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    color: "#999",
                  }}
                >
                  <strong>Referrals :</strong>{" "}
                  {viewHistory.map((userItem, index) => (
                    <span key={index}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // Jump to this user:
                          setViewHistory((prev) => prev.slice(0, index));
                          fetchReferrals(userItem.uhid, userItem.username, 0);
                        }}
                        style={{
                          color: "#3399ff",
                          textDecoration: "none",
                          marginRight: "6px",
                        }}
                      >
                        {userItem.username}
                      </a>
                      {"> "}
                    </span>
                  ))}
                  {viewedUser && (
                    <span style={{ fontWeight: "bold", color: "#fff" }}>
                      {viewedUser.username}
                    </span>
                  )}
                </div>
                <div>
                  {viewHistory.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className={styles.backButton}
                    >
                      &larr; Back to{" "}
                      {viewHistory[viewHistory.length - 1].username}
                    </button>
                  )}
                </div>
              </div>
            )}

            {isLoadingReferrals ? (
              <div className={styles.loading}>Loading referrals...</div>
            ) : referralsError ? (
              <div className={styles.errorMessage}>{referralsError}</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.referralsTable}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>S.No.</th>
                      <th className={styles.tableHeader}>Username</th>
                      <th className={styles.tableHeader}>Referred By</th>
                      <th className={styles.tableHeader}>Team Size</th>
                      <th className={styles.tableHeader}>X-Bonus</th>
                      {/* <th className={styles.tableHeader}></th> */}
                      <th className={styles.tableHeader}>Mobile</th>
                      <th className={`${styles.tableHeader} ${styles.textRight}`}>
                        Self LP
                      </th>
                      <th className={`${styles.tableHeader} ${styles.textRight}`}>
                        Team LP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReferrals.length > 0 ? (
                      paginatedReferrals.map((referral, index) => {
                        return (
                          <tr key={referral._id || referral.username}>
                            <td className={styles.tableCell}>
                              {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            </td>
                            <td className={styles.tableCell}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleViewUserReferrals(
                                    referral.uhid,
                                    referral.username
                                  );
                                }}
                                className={styles.usernameLink}
                              >
                                {referral.username}
                              </a>
                            </td>
                            <td className={styles.tableCell}>
                              {referral.sponsorUsername ?? "N/A"}
                            </td>
                            <td className={styles.tableCell}>
                              {referral.teamSize ?? "N/A"}
                            </td>
                            <td className={styles.tableCell}>
                              {" "}
                              {referral.xRank ?? "-"}
                            </td>

                            <td className={styles.tableCell}>
                              <div className="user_country_column" style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase" }}>
                                {typeof referral.country === "object"
                                  ? referral.country?.name ?? "N/A"
                                  : referral.country ?? "N/A"}
                              </div>
                              <div style={{ marginTop: "4px", fontSize: "13px" }}>{referral.whatsappContact ?? "N/A"}</div>
                            </td>
                            <td className={`${styles.tableCell} ${styles.lpAmount} ${styles.textRight}`}>
                              <div style={{ color: "#ffd700", fontWeight: "700" }}>{formatLpAmount(referral.selfLp)}</div>
                              <div className="BoostLimt-section" style={{ fontSize: "11px", color: "#ccc", marginTop: "4px" }}>
                                <div className="BoostLimt-value">
                                  {referral.boostLimit && referral.boostLimit.$numberDecimal
                                  ? parseFloat(referral.boostLimit.$numberDecimal).toLocaleString()
                                  : "0"} / <span className="boot-available" style={{ color: "#00ff00" }}>{referral.boost && referral.boost.$numberDecimal
                                    ? parseFloat(referral.boost.$numberDecimal).toLocaleString()
                                    : "0"} </span>
                                </div>
                                <div className="BoostLimt-showhover" style={{ fontSize: "9px", textTransform: "uppercase", color: "#888" }}>
                                  Boost Limit
                                </div>
                              </div>
                            </td>
                            <td className={`${styles.tableCell} ${styles.lpAmount} ${styles.textRight}`}>
                              {formatLpAmount(referral.teamLp)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "2rem" }}
                        >
                          No referrals found for this level.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      &laquo; Prev
                    </button>
                    {paginationItems.map((item, index) =>
                      item === "..." ? (
                        <span key={index} className={styles.ellipsis}>
                          ...
                        </span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(item)}
                          className={currentPage === item ? styles.active : ""}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
