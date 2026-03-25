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
    }).format(amount || 0) + " XRP"
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

  const fetchXrpData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/ripple?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false"
      );
      const result = await response.json();
      const market_data = result.market_data;

      const dynamicData = {
        xrp: {
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
      console.error("Error fetching XRP data:", error);
    }
  };
  useEffect(() => {
    fetchXrpData();
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
          `Error fetching referrals for UHID: ${targetUhid}, Level: ${
            level || "direct"
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

  const Community_XRP_Balance = displayedReferrals
    .reduce((sum, referral) => {
      return sum + (parseFloat(referral.teamLp) || 0);
    }, 0)
    .toFixed(4);
  const Community_XRP_Balancetotal = (
    parseFloat(selfLp) + parseFloat(Community_XRP_Balance)
  ).toFixed(4);

  console.log(Community_XRP_Balancetotal, "Community_XRP_Balancetotal");
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
        <DashboardNavbar user={user} onLogout={logout} />
        <div className={styles.contentWrapper}>
          {/* <DashboardSidebar /> */}
          <main className={styles.mainContent} style={{ minWidth: 0 }}>
            <div className={styles.headerRow}>
              <h1 className={styles.pageTitle}>Team Referrals</h1>
              {viewHistory.length > 0 && (
                <button onClick={handleGoBack} className={styles.backButton}>
                  &larr; Back to {viewHistory[viewHistory.length - 1].username}
                </button>
              )}
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
                          <span>Community XRP Balance:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {Community_XRP_Balancetotal ?? "0.0000"} XRP
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>My Level:</span>
                          <span className={`badge ${styles.statBadge}`}>
                            {user.level ?? 0}
                          </span>
                        </div>
                      </div>
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
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <span>Current Rank:</span>
                          <XRankBadge rank={user.xRank} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-5">
                <div className={`${styles.card} h-100 `}>
                  <div
                    className={`${styles.cardHeader} ${styles.mbFiltersheadding} `}
                  >
                    <h5 className={styles.cardTitle}>Quick Level Filters</h5>
                    <small className={styles.cardSubTitle}>
                      Jump to specific team levels
                    </small>
                  </div>
                  <div className={styles.cardBody}>
                    <div className="row g-2">
                      {[
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                      ].map((level) => (
                        <div key={level} className="col-3">
                          <button
                            className={`${styles.levelFilterButton} ${
                              selectedLevel === level ? styles.active : ""
                            }`}
                            onClick={() => {
                              setSelectedLevel(level);
                              setLevelInput(level.toString());

                              // Add level only if it's not already in clickedLevels
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

                              if (viewedUser?.uhid && viewedUser?.username) {
                                fetchReferrals(
                                  viewedUser.uhid,
                                  viewedUser.username,
                                  level
                                );
                              } else if (user?.uhid && user?.username) {
                                fetchReferrals(user.uhid, user.username, level);
                              }
                            }}
                            disabled={isLoadingReferrals}
                          >
                            T{level}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-8 col-md-7">
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

              {/* Right section that conditionally shows Self LP or T1 */}
              <div className="col-lg-4 col-md-5 filterCardheaddingsection">
                {searchInput.trim() === "" ? (
                  selectedLevel ? (
                    // T1-Tx Section
                    <div className={styles.filterCard}>
                      <div className="innerfilterCardheaddingsection">
                        <span>
                          {selectedLevel > 1 ? `T1-T${selectedLevel}` : "T1"}
                        </span>
                        <span className="innerfilterCardheading">
                          {sumselflp}
                        </span>
                      </div>
                      <div className="innerfilterCardheaddingsection">
                        <span>Team LP</span>
                        <span className="innerfilterCardheading">
                          {Community_XRP_Balance}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Default Self LP
                    <div className={styles.filterCard}>
                      <div className="innerfilterCardheaddingsection">
                        <span>Self LP</span>
                        <span className="innerfilterCardheading">{selfLp}</span>
                      </div>
                      <div className="innerfilterCardheaddingsection">
                        <span>Team LP</span>
                        <span className="innerfilterCardheadding">
                          {Community_XRP_Balance}
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  // Search result case: Self LP
                  <div className={styles.filterCard}>
                    <div className="innerfilterCardheaddingsection">
                      <span>Self LP</span>
                      <span className="innerfilterCardheading">{selfLp}</span>
                    </div>
                    <div className="innerfilterCardheaddingsection">
                      <span>Team LP</span>
                      <span className="innerfilterCardheading">
                        {Community_XRP_Balance}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {(viewHistory.length > 0 || viewedUser) && (
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
                      <th className={styles.tableHeader}>Country</th>
                      <th className={styles.tableHeader}>Mobile</th>
                      <th
                        className={`${styles.tableHeader} ${styles.textRight}`}
                      >
                        Self LP
                      </th>
                      <th
                        className={`${styles.tableHeader} ${styles.textRight}`}
                      >
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
                              {referral.country ?? "N/A"}
                            </td>
                            <td className={styles.tableCell}>
                              {referral.whatsappContact ?? "N/A"}
                            </td>
                            <td
                              className={`${styles.tableCell} ${styles.lpAmount}`}
                            >
                              {formatLpAmount(referral.selfLp)}
                            </td>
                            <td
                              className={`${styles.tableCell} ${styles.lpAmount}`}
                            >
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
