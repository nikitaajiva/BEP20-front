"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
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
  FilterX,
  ShieldCheck,
  Zap
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

  // Use local constants — no extra API call needed
  const eventTypeOptions = LEDGER_EVENT_TYPES;


  const [filters, setFilters] = useState({
    eventType: searchParams.get("type") || "all",
    startDate: "",
    endDate: "",
  });


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ eventType: "all", startDate: "", endDate: "" });
  };

  const getFilterTitle = () => {
    if (filters.eventType === "all") return "UNIFIED ARCHIVE LOGS";
    return `${formatEventType(filters.eventType)} DIRECTORY`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.ledger_loading}>
        <RefreshCw size={48} style={{ color: '#FFB800', animation: 'spin 2s linear infinite' }} />
        <span style={{ color: '#888', fontWeight: '800', letterSpacing: '2px', marginTop: '20px' }}>SYNCHRONIZING LEDGER VAULT...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ledger_error}>
        <div className={styles.ledger_errorTitle}>VAULT ACCESS DENIED</div>
        <p style={{ color: '#aaa' }}>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.ledger_refreshBtn}>
          <RefreshCw size={18} /> RETRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ledger_mainContent}>
      
      {/* ── CINEMATIC HERO BANNER ── */}
      <div className={styles.ledger_hero}>
        <Image 
          src="/img/ledger-hero.png" 
          alt="Ledger Vault" 
          fill 
          className={styles.ledger_heroImage} 
          priority 
        />
        <div className={styles.ledger_heroOverlay}>
          <div className={styles.ledger_heroBadge}>
            <span className={styles.ledger_pulseDot} />
            IMMUTABLE LEDGER
          </div>
          <h1 className={styles.ledger_heroTitle}>
            Ecosystem <span>Ledger</span>
          </h1>
          <p className={styles.ledger_heroSubtitle}>
            Reviewing cryptographically secured transaction history and protocol settlements.
          </p>
        </div>
      </div>

      <div className={styles.ledger_bentoGrid}>
        
        {/* ── FILTER GLASS CARD ── */}
        <div className={`${styles.ledger_glassCard} ${styles.ledger_filterBox}`}>
          <div className={styles.ledger_filterTitleRow}>
            <Filter size={18} className={styles.ledger_boxIcon} />
            <span className={styles.ledger_boxTitle}>{getFilterTitle()}</span>
          </div>

          <div className={styles.ledger_filterGrid}>
            <div className={styles.ledger_filterGroup}>
              <label className={styles.ledger_filterLabel}>Log Classification</label>
              <select
                id="eventType"
                name="eventType"
                className={styles.ledger_filterSelect}
                value={filters.eventType}
                onChange={handleFilterChange}
              >
                <option value="all">Comprehensive System View</option>
                {eventTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatEventType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.ledger_filterGroup}>
              <label className={styles.ledger_filterLabel}>Start Epoch</label>
              <input
                type="date"
                name="startDate"
                className={styles.ledger_filterInput}
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className={styles.ledger_filterGroup}>
              <label className={styles.ledger_filterLabel}>End Epoch</label>
              <input
                type="date"
                name="endDate"
                className={styles.ledger_filterInput}
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <button className={styles.ledger_clearBtn} onClick={clearFilters}>
              <FilterX size={18} />
              Reset Archives
            </button>
          </div>
        </div>

        {/* ── DATA TABLE GLASS CARD ── */}
        <div className={`${styles.ledger_glassCard} ${styles.ledger_tableBox}`}>
          <div className={styles.ledger_tableHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <History size={18} className={styles.ledger_boxIcon} style={{ marginRight: '10px' }} />
              <span className={styles.ledger_tableTitle}>Transaction Archives</span>
            </div>
            <div className={styles.ledger_tableLegend}>
              <div className={styles.ledger_legendItem}>
                <div className={styles.ledger_legendDot} style={{ background: '#00E5A0' }} />
                <span>CREDIT</span>
              </div>
              <div className={styles.ledger_legendItem}>
                <div className={styles.ledger_legendDot} style={{ background: '#FF4D6A' }} />
                <span>DEBIT</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
             <LedgerHistoryTable filters={filters} />
          </div>
        </div>

      </div>
    </div>
  );
}
