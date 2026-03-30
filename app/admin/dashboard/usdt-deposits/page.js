"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Wallet as WalletIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  RefreshCw,
  Hash,
  Box,
  Cpu,
  Copy
} from "lucide-react";
import styles from "./usdt-deposits.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

const depositStatuses = ["pending_verification", "completed", "failed"];

const getCurrentUTCDate = () => {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(now.getUTCDate()).padStart(2, "0");
  return `${utcYear}-${utcMonth}-${utcDay}`;
};

const endpointMap = {
  deposits: "api/support/usdt-deposits",
  withdrawals: "api/support/usdt-withdrawals",
  claimed: "api/support/usdt-claimed",
  redeemed: "api/support/usdt-redeemed",
  lppositioning: "api/support/lp-positioning",
  withdrawalerror: "api/support/usdt-withdrawalerror"
};

/* ── Avatar Palette ── */
const PALETTE = [
  { bg: "rgba(255,215,0,0.15)", text: "#ffd700" },
  { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  { bg: "rgba(244,63,94,0.15)", text: "#f43f5e" },
  { bg: "rgba(6,182,212,0.15)", text: "#06b6d4" },
];
const getAvatar = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];

function USDTTransactions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("deposits");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalRecords: 0, totalAmount: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12,
  });

  const todayUTC = getCurrentUTCDate();
  const [filters, setFilters] = useState({
    status: "",
    withdrawType: "", // Added for Withdrawals sub-filter
    walletAddress: "",
    transactionId: "",
    startDate: todayUTC,
    endDate: todayUTC,
  });

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...filters,
      });

      const endpoint = endpointMap[activeTab] || endpointMap.deposits;
      const res = await fetch(`${API_BASE_URL}${endpoint}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to fetch data");
      }

      setTransactions(resData.data || []);
      setSummary({
        totalRecords: resData.summary?.totalRecords || (resData.data?.length || 0),
        totalAmount: resData.summary?.totalAmount || 0,
      });
      setPagination(resData.pagination || {
        currentPage: page,
        totalPages: 1,
        totalEntries: resData.data?.length || 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: pagination.limit
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, pagination.limit]);

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchTransactions(1);
    }
  }, [user, activeTab, fetchTransactions]);

  useEffect(() => {
    if (!authLoading && (!user || !["support", "admin"].includes(user.userType))) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = (e) => { e.preventDefault(); fetchTransactions(1); };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTransactions([]);
    setFilters({ status: "", withdrawType: "", walletAddress: "", transactionId: "", startDate: todayUTC, endDate: todayUTC });
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={10} /> {status}</span>;
      case 'failed': return <span className={`${styles.badge} ${styles.badgeFailed}`}><AlertCircle size={10} /> {status}</span>;
      case 'pending':
      case 'pending_verification': return <span className={`${styles.badge} ${styles.badgePending}`}><Clock size={10} /> {status}</span>;
      default: return <span className={`${styles.badge} ${styles.badgeNeutral}`}>{status || 'Processed'}</span>;
    }
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,215,0,0.15)', borderTop: '3px solid #ffd700', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 800, letterSpacing: 2 }}>ESTABLISHING GATEWAY SECURE LINK...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
          <h1 className={styles.title}>Finance <span>Gateway</span></h1>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Ledger Entries</span>
            <span className={styles.summaryValue}>{summary.totalRecords.toLocaleString()}</span>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Volume Processed</span>
            <span className={styles.summaryValue}>{summary.totalAmount} <span>USDT</span></span>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className={styles.tabContainer}>
        {Object.keys(endpointMap).map((tab) => {
          let Icon = Activity;
          if (tab === 'deposits') Icon = ArrowDownLeft;
          if (tab === 'withdrawals') Icon = ArrowUpRight;
          // if (tab === 'autopositioning') Icon = Cpu;
          if (tab === 'lppositioning') Icon = ShieldCheck;

          let label = tab;
          if (tab === 'lppositioning') label = 'Liquidity Pool';
          else if (tab === 'withdrawalerror') label = 'Pending Withdrawal';
          else label = label.replace('error', ' Error').replace('positioning', ' Positioning');

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <form onSubmit={handleSearch} className={styles.filterForm}>
        <div className={styles.filterGrid}>
          {["deposits", "withdrawals"].includes(activeTab) && (
            <div className={styles.inputGroup}>
              <label><Hash size={10} /> Reference Identity</label>
              <input type="text" name="transactionId" value={filters.transactionId} onChange={handleFilterChange} placeholder="TX / Ref ID..." className={styles.inputField} />
            </div>
          )}
          {activeTab === "withdrawals" && (
            <div className={styles.inputGroup}>
              <label><ShieldCheck size={10} /> Channel Distribution</label>
              <select name="withdrawType" value={filters.withdrawType} onChange={handleFilterChange} className={styles.selectField}>
                <option value="">Legacy (Withdrawals)</option>
                <option value="claimed">Claimed Ledger</option>
                <option value="redeemed">Redeemed Ledger</option>
              </select>
            </div>
          )}
          <div className={styles.inputGroup}>
            <label><Clock size={10} /> Chronicle Start</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label><Clock size={10} /> Chronicle End</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={styles.inputField} />
          </div>
          {activeTab === "deposits" && (
            <div className={styles.inputGroup}>
              <label><ShieldCheck size={10} /> Status Vector</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.selectField}>
                <option value="">All Streams</option>
                {depositStatuses.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} className={styles.searchBtn}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Search size={14} /> Verify Trace</>}
          </button>
        </div>
      </form>

      {/* ── ERRORS ── */}
      {error && <div className={styles.errorBanner}><AlertCircle size={15} /> {error}</div>}

      {/* ── CARDS GRID ── */}
      <div className={styles.txGrid}>
        {loading && transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <RefreshCw size={30} color="rgba(255,215,0,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
            <div className={styles.emptyText}>Decrypting Ledger Packets...</div>
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => {
            const username = tx.userId?.username || tx.username || "UNKNOWN";
            const initials = username.slice(0, 2).toUpperCase();
            const ac = getAvatar(username);
            const ts = new Date(tx.ts || tx.createdAt);
            const isInternal = activeTab === "autopositioning" || activeTab === "lppositioning";

            return (
              <div key={tx._id} className={styles.txCard}>

                {/* Header: User identity & Time */}
                <div className={styles.txHeader}>
                  <div className={styles.txUser}>
                    <div className={styles.txAvatar} style={{ background: ac.bg, color: ac.text }}>{initials}</div>
                    <div>
                      <div className={styles.txName}>{username}</div>
                      <div className={styles.txUhid}>UHID: {tx.userId?.uhid || tx.uhid || "NULL"}</div>
                    </div>
                  </div>
                  <div className={styles.txTime}>
                    <div className={styles.txDateStr}>{ts.toLocaleDateString("en-GB", { timeZone: "UTC", day: '2-digit', month: 'short' })}</div>
                    <div className={styles.txTimeStr}>{ts.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className={styles.txDivider} />

                {/* Core: Amount & Status */}
                <div className={styles.txCore}>
                  <div className={styles.txAmountWrap}>
                    <div className={styles.txAmountLabel}>Volume Proceeded</div>
                    <div className={styles.txAmount}>{parseFloat(tx.amount).toFixed(6)} <span>USDT</span></div>
                  </div>
                  <div>
                    {activeTab === "deposits" || activeTab === "withdrawalerror"
                      ? getStatusBadge(tx.status)
                      : getStatusBadge('completed')
                    }
                  </div>
                </div>

                {/* Details box */}
                <div className={styles.txDetails}>
                  {!isInternal && (tx.transactionId || tx.refId) && (
                    <div className={styles.txDetailRow}>
                      <span className={styles.txDetailLabel}><Hash size={10} /> Hash / Ref</span>
                      <div className={styles.txDetailValueContainer}>
                        <span className={styles.txDetailValue} title={tx.transactionId || tx.refId}>
                          {(tx.transactionId || tx.refId).substring(0, 18)}...
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tx.transactionId || tx.refId);
                          }}
                          className={styles.copyTinyBtn}
                          title="Copy Full Hash"
                        >
                          <Copy size={8} />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "deposits" && tx.walletAddress && (
                    <div className={styles.txDetailRow}>
                      <span className={styles.txDetailLabel}><WalletIcon size={10} /> Gateway</span>
                      <span className={styles.txDetailValue} title={tx.walletAddress}>
                        {tx.walletAddress.substring(0, 18)}...
                      </span>
                    </div>
                  )}

                  {!isInternal && activeTab !== "deposits" && (
                    <>
                      <div className={styles.txDetailRow}>
                        <span className={styles.txDetailLabel}><Box size={10} /> Origin</span>
                        <span className={styles.txDetailValue} title={tx.fromWallet || 'RESERVE'}>
                          {(tx.fromWallet || "RESERVE").substring(0, 16)}...
                        </span>
                      </div>
                      <div className={styles.txDetailRow}>
                        <span className={styles.txDetailLabel}><ArrowUpRight size={10} /> Dest</span>
                        <span className={styles.txDetailValue} title={tx.toAddress || tx.walletAddress}>
                          {(tx.toAddress || tx.walletAddress || "N/A").substring(0, 16)}...
                        </span>
                      </div>
                    </>
                  )}

                  {isInternal && (
                    <div className={styles.txDetailRow}>
                      <span className={styles.txDetailLabel}><Cpu size={10} /> Operation</span>
                      <span className={styles.txDetailValue}>Internal Protocol Routing</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <Activity className={styles.emptyIcon} />
            <div className={styles.emptyText}>No synchronization segments found</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
              Try adjusting the timeframe or clearing current filter vectors.
            </div>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Segment <span>{pagination.currentPage}</span> of <span>{pagination.totalPages || 1}</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => fetchTransactions(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
            className={styles.pageBtn}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => fetchTransactions(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            className={styles.pageBtn}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}

export default function USDTTransactionsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'rgba(255,215,0,0.4)', fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>
        INITIALIZING GATEWAYS...
      </div>
    }>
      <USDTTransactions />
    </Suspense>
  );
}