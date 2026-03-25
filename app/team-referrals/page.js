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
  Users, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Filter, 
  BarChart3, 
  Zap, 
  Network, 
  Calendar,
  Layers,
  Activity,
  History,
  X
} from "lucide-react";
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
          <main className={styles.mainContent}>
            <div className={styles.headerRow}>
              <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Community Network</h1>
                <p className={styles.pageSubtitle}>Analyze and manage your BEP20 ecosystem nodes</p>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-8 col-md-12">
                <div className={`${styles.card} h-100`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerTitleWithIcon}>
                      <BarChart3 size={20} className={styles.headerIcon} />
                      <h5 className={styles.cardTitle}>Network Analytics</h5>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <div className={styles.statPillLeft}>
                            <Zap size={14} color="#ffd700" />
                            <span>Community Liquidity:</span>
                          </div>
                          <span className={styles.statBadge}>
                            {Community_USDT_Balancetotal ?? "0.0000"} USDT
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <div className={styles.statPillLeft}>
                            <Activity size={14} color="#ffd700" />
                            <span>Platform Rank:</span>
                          </div>
                          <XRankBadge rank={user.xRank} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <div className={styles.statPillLeft}>
                            <Network size={14} color="#ffd700" />
                            <span>Direct Connections:</span>
                          </div>
                          <span className={styles.statBadge}>
                            {user.directDownlines ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className={styles.statPill}>
                          <div className={styles.statPillLeft}>
                            <Users size={14} color="#ffd700" />
                            <span>Total Network Nodes:</span>
                          </div>
                          <span className={styles.statBadge}>
                            {user.communitySize ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className={`${styles.card} h-100 `}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerTitleWithIcon}>
                      <Layers size={18} className={styles.headerIcon} />
                      <h5 className={styles.cardTitle}>Level Navigator</h5>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.levelDropdown}
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
                            <option value="">Select Level</option>
                            {Array.from({ length: 16 }, (_, i) => i + 1).map(
                              (level) => (
                                <option key={level} value={level}>
                                  Network Level {level}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {searchInput.trim() === "" ? (
                        selectedLevel ? (
                          <div className={styles.filterCard}>
                            <div className={styles.innerfilterCardheaddingsection}>
                              <span className={styles.innerfilterCardlabel}>
                                {selectedLevel > 1 ? `L1 - L${selectedLevel} Liquidity` : "Level 1 Liquidity"}
                              </span>
                              <span className={styles.innerfilterCardvalue}>
                                {sumselflp} USDT
                              </span>
                            </div>
                            <div className={styles.innerfilterCardheaddingsection}>
                              <span className={styles.innerfilterCardlabel}>Community Pool</span>
                              <span className={styles.innerfilterCardvalue}>
                                {Community_USDT_Balance} USDT
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.filterCard}>
                            <div className={styles.innerfilterCardheaddingsection}>
                              <span className={styles.innerfilterCardlabel}>Direct Node liquidity</span>
                              <span className={styles.innerfilterCardvalue}>
                                {selfLp} USDT
                              </span>
                            </div>
                            <div className={styles.innerfilterCardheaddingsection}>
                              <span className={styles.innerfilterCardlabel}>Global Network Pool</span>
                              <span className={styles.innerfilterCardvalue}>
                                {Community_USDT_Balance} USDT
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className={styles.filterCard}>
                          <div className={styles.innerfilterCardheaddingsection}>
                            <span className={styles.innerfilterCardlabel}>User Liquidity</span>
                            <span className={styles.innerfilterCardvalue}>
                              {selfLp} USDT
                            </span>
                          </div>
                          <div className={styles.innerfilterCardheaddingsection}>
                            <span className={styles.innerfilterCardlabel}>Downline Strength</span>
                            <span className={styles.innerfilterCardvalue}>
                              {Community_USDT_Balance} USDT
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 mb-4">
              <div className="col-lg-8 col-md-12">
                <div className={`${styles.card} h-100`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerTitleWithIcon}>
                      <Calendar size={18} className={styles.headerIcon} />
                      <h5 className={styles.cardTitle}>Global Settlement Logs</h5>
                    </div>
                  </div>
                  <div className="row g-3 px-4 pb-4 pt-2">
                    <div className="col-md-6">
                      <label className={styles.dateLabel}>From Date (UTC)</label>
                      <div className={styles.inputWithIcon}>
                        <input
                          type="date"
                          value={dateFrom}
                          max={getTodayUTC()}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDateFrom(v);
                            if (v > dateTo) setDateTo(v);
                          }}
                          className={styles.dateInput}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className={styles.dateLabel}>To Date (UTC)</label>
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
                  <div className="row px-4 pb-4 w-100">
                    <div className="col-md-9">
                      <label className={styles.dateLabel}>Node Finder (ID / User / Email)</label>
                      <div className={styles.searchBoxWrapper}>
                        <Search size={16} className={styles.searchBoxIcon} />
                        <input
                          type="text"
                          value={ledgerSearch}
                          onChange={(e) => setLedgerSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && fetchLedgerTotals()}
                          className={styles.searchInputPremium}
                          placeholder="Search ecosytem nodes..."
                        />
                        {ledgerSearch && (
                          <button onClick={() => setLedgerSearch("")} className={styles.clearSearchBtn}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="col-md-3 d-flex align-items-end">
                      <button
                        className={styles.searchActionBtn}
                        onClick={() => fetchLedgerTotals()}
                        disabled={isLoadingTotals}
                      >
                        Scan Network
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className={`${styles.card} h-100`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerTitleWithIcon}>
                      <History size={18} className={styles.headerIcon} />
                      <h5 className={styles.cardTitle}>Live Ledger Sync</h5>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <div className={styles.statCard}>
                          <div className={styles.statLabel}>Global Node Deposits</div>
                          <div className={styles.statValue}>
                            {isLoadingTotals ? "SYNCING..." : ledgerTotals.deposited.toFixed(2)} <span className={styles.valUnit}>USDT</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className={styles.statCard}>
                          <div className={styles.statLabel}>Global Node Redemptions</div>
                          <div className={styles.claimedstatValue}>
                            {isLoadingTotals ? "SYNCING..." : ledgerTotals.withdrawal.toFixed(2)} <span className={styles.valUnit}>USDT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.networkTableWrapper}>
                <div className={styles.networkTableHeader}>
                    <div className={styles.headerTitleWithIcon}>
                      <Users size={20} className={styles.headerIcon} />
                      <h5 className={styles.cardTitle}>Network Node Directory</h5>
                    </div>
                    <div className={styles.networkActions}>
                        <div className={styles.premiumSearchBox}>
                            <Search size={16} className={styles.searchIconSmall} />
                            <input 
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyLevelFilter()}
                                placeholder="Find node by username..."
                                className={styles.premiumSearchInput}
                            />
                            {searchInput && <X size={14} className={styles.clearSearchIcon} onClick={() => setSearchInput("")} />}
                        </div>
                        <button
                          onClick={handleRefresh}
                          className={styles.premiumRefreshBtn}
                          disabled={isLoadingReferrals}
                          title="Refresh Network Data"
                        >
                          <RefreshCw size={18} className={isLoadingReferrals ? styles.spinIcon : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {(viewHistory.length > 0 || viewedUser) && (
              <div className={styles.navigationBreadcrumbs}>
                <div className={styles.breadcrumbPath}>
                  <Link href="/dashboard" className={styles.breadcrumbLink}>
                    Ecosystem
                  </Link>
                  <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                  <span className={styles.breadcrumbItem}>Network</span>
                  {viewHistory.map((userItem, index) => (
                    <span key={index} className={styles.breadcrumbPathGroup}>
                      <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setViewHistory((prev) => prev.slice(0, index));
                          fetchReferrals(userItem.uhid, userItem.username, 0);
                        }}
                        className={styles.breadcrumbNodeLink}
                      >
                        {userItem.username}
                      </a>
                    </span>
                  ))}
                  {viewedUser && (
                    <>
                      <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                      <span className={styles.activeNodeName}>
                        {viewedUser.username}
                      </span>
                    </>
                  )}
                </div>
                <div className={styles.breadcrumbActions}>
                  {viewHistory.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className={styles.premiumBackButton}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to {viewHistory[viewHistory.length - 1].username}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {isLoadingReferrals ? (
              <div className={styles.loading}>
                <RefreshCw size={40} className={styles.spinIcon} />
                <span>Syncing Network Nodes...</span>
              </div>
            ) : referralsError ? (
              <div className={styles.errorMessage}>{referralsError}</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.referralsTable}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>#</th>
                      <th className={styles.tableHeader}>Node Name</th>
                      <th className={styles.tableHeader}>Sponsor Node</th>
                      <th className={styles.tableHeader}>Network Size</th>
                      <th className={styles.tableHeader}>Ecosystem Rank</th>
                      <th className={styles.tableHeader}>Contact / Region</th>
                      <th className={`${styles.tableHeader} ${styles.textRight}`}>
                        Node Liquidity
                      </th>
                      <th className={`${styles.tableHeader} ${styles.textRight}`}>
                        Downline Pool
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
                              <div className={styles.nodeNameGroup}>
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
                                  <span className={styles.nodeMainName}>{referral.username}</span>
                                </a>
                                <span className={styles.nodeUhid}>#{referral.uhid}</span>
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <span className={styles.sponsorName}>{referral.sponsorUsername ?? "GENESIS"}</span>
                            </td>
                            <td className={styles.tableCell}>
                              <div className={styles.sizeBadge}>
                                {referral.teamSize ?? "0"} Nodes
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <XRankBadge rank={referral.xRank} />
                            </td>

                             <td className={styles.tableCell}>
                                <div className={styles.regionGroup}>
                                    <span className={styles.regionLabel}>Region</span>
                                    <div className={styles.regionName}>
                                        {typeof referral.country === "object"
                                        ? referral.country?.name ?? "Global"
                                        : referral.country ?? "Global"}
                                    </div>
                                    <div className={styles.regionContact}>{referral.whatsappContact ?? "Contact Hidden"}</div>
                                </div>
                            </td>
                            <td className={`${styles.tableCell} ${styles.lpAmount} ${styles.textRight}`}>
                              <div style={{ color: "#ffd700", fontWeight: "800", fontSize: '15px' }}>{formatLpAmount(referral.selfLp)}</div>
                              <div className="BoostLimt-section" style={{ fontSize: "10px", color: "#666", marginTop: "6px" }}>
                                <div className="BoostLimt-value">
                                  <span style={{ color: '#aaa' }}>Cap:</span> {referral.boostLimit && referral.boostLimit.$numberDecimal
                                  ? parseFloat(referral.boostLimit.$numberDecimal).toLocaleString()
                                  : "0"} / <span className="boot-available" style={{ color: "#00ff00", fontWeight: '700' }}>{referral.boost && referral.boost.$numberDecimal
                                    ? parseFloat(referral.boost.$numberDecimal).toLocaleString()
                                    : "0"} </span>
                                </div>
                                <div className="BoostLimt-showhover" style={{ fontSize: "9px", textTransform: "uppercase", color: "#444" }}>
                                  Liquidity Capacity
                                </div>
                              </div>
                            </td>
                            <td className={`${styles.tableCell} ${styles.lpAmount} ${styles.textRight}`}>
                              <div style={{ fontSize: '15px', fontWeight: '700' }}>{formatLpAmount(referral.teamLp)}</div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "4rem", color: '#555' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                             <Search size={40} strokeWidth={1} />
                             <span>No ecosystem nodes detected at this network depth.</span>
                          </div>
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
                      className={styles.paginationArrow}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
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
                          className={currentPage === item ? styles.activePage : styles.pageOption}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={styles.paginationArrow}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={18} />
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
