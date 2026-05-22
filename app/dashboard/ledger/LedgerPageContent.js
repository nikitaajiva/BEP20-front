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
  Zap,
  ChevronDown
} from "lucide-react";
import styles from "./ledger.module.css";

const formatEventType = (type) => {
  if (!type) return "All Logs";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const getEventColor = (eventType) => {
  switch (eventType) {
    case "DEPOSIT":
      return "#7FFF4C";
    case "WITHDRAWAL":
      return "#ff4d4d";
    case "STAKING_DEPOSIT":
      return "#4cc9f0";
    case "NFT_PURCHASE":
      return "#f038ff";
    case "ROI_CREDIT":
      return "#FFB800";
    case "BOOST_BONUS":
      return "#FF6200";
    case "AUTOPOSITIONING":
      return "#00E5A0";
    case "REWARDS_REDEEMED":
      return "#ffd700";
    case "AIRDROP_ACTIVATION":
      return "#e1f371";
    case "LP_DEPOSIT_FROM_USDT":
      return "#a371f3";
    case "SWIFT_TRANSFER_IN":
      return "#4f8cff";
    case "SWIFT_TRANSFER_OUT":
      return "#4f8cff";
    case "MANUAL_AIRDROP":
      return "#9a00e5";
    default:
      return "rgba(255, 255, 255, 0.4)";
  }
};

export default function LedgerPageContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Use local constants — no extra API call needed
  const eventTypeOptions = LEDGER_EVENT_TYPES;

  const [filters, setFilters] = useState({
    eventType: searchParams.get("type") || "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <span>Ledger</span>
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
              <div className={styles.ledger_customSelectWrapper} ref={dropdownRef}>
                <button
                  type="button"
                  className={`${styles.ledger_customSelectTrigger} ${dropdownOpen ? styles.ledger_customSelectTriggerActive : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className={styles.ledger_classificationDot}
                      style={{ background: getEventColor(filters.eventType === "all" ? "" : filters.eventType) }}
                    />
                    {filters.eventType === "all" ? "Comprehensive System View" : formatEventType(filters.eventType)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`${styles.ledger_chevron} ${dropdownOpen ? styles.ledger_chevronOpen : ""}`}
                  />
                </button>
                {dropdownOpen && (
                  <ul className={styles.ledger_customDropdown}>
                    <li
                      className={`${styles.ledger_dropdownItem} ${filters.eventType === "all" ? styles.ledger_dropdownItemActive : ""}`}
                      onClick={() => {
                        setFilters({ ...filters, eventType: "all" });
                        setDropdownOpen(false);
                      }}
                    >
                      <span className={styles.ledger_classificationDot} style={{ background: 'rgba(255,255,255,0.4)' }} />
                      Comprehensive System View
                    </li>
                    {eventTypeOptions.map((type) => (
                      <li
                        key={type}
                        className={`${styles.ledger_dropdownItem} ${filters.eventType === type ? styles.ledger_dropdownItemActive : ""}`}
                        onClick={() => {
                          setFilters({ ...filters, eventType: type });
                          setDropdownOpen(false);
                        }}
                      >
                        <span className={styles.ledger_classificationDot} style={{ background: getEventColor(type) }} />
                        {formatEventType(type)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
              Reset
            </button>
          </div>
        </div>

        {/* ── DATA TABLE WITHOUT GLASS CARD WRAPPER ── */}
        <div className={styles.ledger_tableBox} style={{ padding: '0 24px 24px' }}>
          <div className={styles.ledger_tableHeader} style={{ borderBottom: 'none', paddingLeft: '12px', paddingRight: '12px', paddingTop: '20px', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <History size={18} className={styles.ledger_boxIcon} style={{ marginRight: '10px' }} />
              <span className={styles.ledger_tableTitle}>Transaction Archives</span>
            </div>
          </div>
          <div style={{ padding: '0' }}>
             <LedgerHistoryTable filters={filters} />
          </div>
        </div>

      </div>
    </div>
  );
}
