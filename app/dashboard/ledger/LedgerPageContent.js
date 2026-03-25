"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import LedgerHistoryTable from "@/components/LedgerHistoryTable";
import { LEDGER_EVENT_TYPES } from "../../../constants/ledgerEventTypes";
import { 
  Activity, 
  Filter, 
  Calendar, 
  RefreshCw, 
  History,
  FileText,
  Search,
  FilterX
} from "lucide-react";
import styles from "./ledger.module.css";

const formatEventType = (type) => {
  if (!type) return "All Logs";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function LedgerPageContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTypes, setEventTypes] = useState([]);

  const [filters, setFilters] = useState({
    eventType: searchParams.get("type") || "all",
    startDate: "",
    endDate: "",
  });

  // Fetch the available event types from the backend
  useEffect(() => {
    const fetchEventTypes = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/ledger/history/event-types", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event types");
        }

        const data = await response.json();

        if (data.success) {
          setEventTypes(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch event types:", err);
      }
    };
    fetchEventTypes();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      eventType: "all",
      startDate: "",
      endDate: "",
    });
  };

  const getFilterTitle = () => {
    if (filters.eventType === "all") return "Unified Transaction Logs";
    return `${formatEventType(filters.eventType)} Log Directory`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className="spin" size={40} style={{ color: '#ffd700', animation: 'spin 2s linear infinite' }} />
        <span style={{ color: '#888', fontWeight: '700', letterSpacing: '1px', marginTop: '15px' }}>SYNCHRONIZING LEDGER...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorTitle}>SYSTEM ERROR</div>
        <p style={{ color: '#aaa' }}>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loading}>
        <span style={{ color: '#888' }}>PLEASE LOG IN TO ACCESS LEDGER archives.</span>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Ecosystem Ledger</h1>
          <p className={styles.pageSubtitle}>{getFilterTitle()}</p>
        </div>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Log Classification</label>
            <select
              id="eventType"
              name="eventType"
              className={styles.filterSelect}
              value={filters.eventType}
              onChange={handleFilterChange}
            >
              <option value="all">Comprehensive View</option>
              {LEDGER_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatEventType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Start Epoch</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className={styles.filterInput}
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>End Epoch</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className={styles.filterInput}
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <button className={styles.clearBtn} onClick={clearFilters}>
            <FilterX size={18} />
            Reset Filters
          </button>
        </div>
      </div>

      <div className={styles.ledgerTableCard}>
        <div className={styles.tableHeaderRow}>
          <h4 className={styles.tableTitle}>Transaction Archives</h4>
        </div>
        <LedgerHistoryTable filters={filters} />
      </div>
    </div>
  );
}
