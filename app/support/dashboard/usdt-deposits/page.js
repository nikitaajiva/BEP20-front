"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  Terminal, 
  Database, 
  Activity, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Calendar, 
  Wallet as WalletIcon, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from "lucide-react";
import styles from "./usdt-deposits.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL + "/";

const depositStatuses = ["pending_verification", "completed", "failed"];

const dropsToUSDT = (drops) => (parseFloat(drops) / 1000000).toFixed(6);
const formatAmount = (amount, isDeposit) =>
  isDeposit ? dropsToUSDT(amount) : parseFloat(amount).toFixed(6);

const getCurrentUTCDate = () => {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(now.getUTCDate()).padStart(2, "0");
  return `${utcYear}-${utcMonth}-${utcDay}`;
};

const endpointMap = {
  deposits: "USDT-deposits",
  withdrawals: "USDT-withdrawals",
  claimed: "USDT-claimed",
  redeemed: "USDT-redeemed",
  autopositioning: "USDT-autopositioning",
  lppositioning: "lp-positioning",
  withdrawalerror: "USDT-withdrawalerror"
};

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
    totalPages: 0,
    totalEntries: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  const todayUTC = getCurrentUTCDate();
  const [filters, setFilters] = useState({
    status: "",
    walletAddress: "",
    transactionId: "",
    startDate: todayUTC,
    endDate: todayUTC,
  });

  const [selectedTx, setSelectedTx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [xrplAmount, setXrplAmount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const query = new URLSearchParams({
        ...cleanFilters,
        page,
        limit: pagination.limit,
      }).toString();

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const endpoint = endpointMap[activeTab];
      const response = await fetch(`${API_BASE_URL}api/support/${endpoint}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch transactions");

      setTransactions(data.data || []);
      setPagination(data.pagination || { ...pagination, currentPage: page });
      setSummary({
        totalRecords: data.summary?.totalRecords || 0,
        totalAmount: parseFloat(data.summary?.totalAmount || 0).toFixed(6),
      });
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Authentication required")) {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, pagination.limit, router]);

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchTransactions(1);
    }
  }, [user, activeTab, fetchTransactions]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTransactions([]);
    setFilters({
      status: "",
      walletAddress: "",
      transactionId: "",
      startDate: todayUTC,
      endDate: todayUTC,
    });
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  if (authLoading) return <div className="text-center p-20 text-gold-500 animate-pulse">Synchronizing Terminal...</div>;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>Finance <span>Gateway Explorer</span></h1>
        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Ledger Entry</span>
            <span className={styles.summaryValue}>{summary.totalRecords}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Volume Processed</span>
            <span className={styles.summaryValue}>{summary.totalAmount} <span>USDT</span></span>
          </div>
        </div>
      </header>

      <div className={styles.tabContainer}>
        {Object.keys(endpointMap).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
          >
            {tab.replace('error', ' Error').replace('positioning', ' Positioning')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className={styles.filterForm}>
        <div className={styles.filterGrid}>
          {["deposits", "withdrawals","claimed","redeemed"].includes(activeTab) && (
            <div className={styles.inputGroup}>
              <label>Reference Identity</label>
              <input
                type="text"
                name="transactionId"
                value={filters.transactionId}
                onChange={handleFilterChange}
                placeholder="Transaction/Ref ID..."
                className={styles.inputField}
              />
            </div>
          )}
          <div className={styles.inputGroup}>
            <label>Chronicle Start</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label>Chronicle End</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={styles.inputField} />
          </div>
          {activeTab === "deposits" && (
            <div className={styles.inputGroup}>
              <label>Status Vector</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.selectField}>
                <option value="">All Streams</option>
                {depositStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} className={styles.searchBtn}>
            {loading ? "Decrypting..." : <><Activity size={16} className="inline mr-2" /> Verify Trace</>}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Temporal Stamp</th>
              <th>Identity Core</th>
              {(activeTab !== "autopositioning" && activeTab !== "lppositioning")  && <th>Ref ID</th>}
              <th>Volume (USDT)</th>
              {activeTab === "deposits" ? (
                <>
                  <th>Gateway Address</th>
                  <th>Status</th>
                </>
              ) : (
                (activeTab !== "autopositioning" && activeTab !== "lppositioning") && (
                  <>
                    <th>Source Repository</th>
                    <th>Destination Channel</th>
                  </>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map((tx) => (
              <tr key={tx._id} className={styles.row}>
                <td>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                      {new Date(tx.ts || tx.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}
                    </span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {new Date(tx.ts || tx.createdAt).toLocaleTimeString("en-GB", { timeZone: "UTC" })}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span style={{ fontWeight: 800, color: '#ffd700' }}>{tx.userId?.username || tx.username || "Unknown"}</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>{tx.userId?.uhid || tx.uhid || "NULL"}</span>
                  </div>
                </td>
                {(activeTab !== "autopositioning" && activeTab !== "lppositioning") && (
                  <td>
                    <span style={{ fontSize: '11px', color: '#4f8cff', textDecoration: 'underline', cursor: 'help' }} title={tx.transactionId || tx.refId}>
                      {(tx.transactionId || tx.refId || "INTERNAL").substring(0, 16)}...
                    </span>
                  </td>
                )}
                <td>
                  <span style={{ fontWeight: 800, color: '#fff' }}>{tx.amount}</span>
                  <span style={{ fontSize: '10px', color: '#ffd700', marginLeft: '4px' }}>USDT</span>
                </td>
                {activeTab === "deposits" ? (
                  <>
                    <td title={tx.walletAddress || tx.destinationAddress}>
                      <span style={{ fontSize: '11px', opacity: 0.6 }}>{(tx.walletAddress || tx.destinationAddress || "N/A").substring(0, 16)}...</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${
                        tx.status === 'completed' ? styles.badgeSuccess : 
                        tx.status === 'failed' ? styles.badgeFailed : styles.badgePending
                      }`}>
                        {tx.status || "Pending"}
                      </span>
                    </td>
                  </>
                ) : (
                  (activeTab !== "autopositioning" && activeTab !== "lppositioning") && (
                    <>
                      <td><span style={{ fontSize: '11px', opacity: 0.6 }}>{(tx.fromWallet || "RESERVE").substring(0, 16)}...</span></td>
                      <td><span style={{ fontSize: '11px', opacity: 0.6 }}>{(tx.toAddress || tx.walletAddress || "N/A").substring(0, 16)}...</span></td>
                    </>
                  )
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                  No synchronization segments found for current vector.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Registry Segment <span>{pagination.currentPage}</span> of <span>{pagination.totalPages || 1}</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => fetchTransactions(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
            className={styles.btnSecondary}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={() => fetchTransactions(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            className={styles.btnSecondary}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function USDTTransactionsPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gold-500 animate-pulse">Initializing Gateways...</div>}>
      <USDTTransactions />
    </Suspense>
  );
}
