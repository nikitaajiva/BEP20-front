"use client";
import React, { useState } from "react";
import styles from "./RedesignedDashboard.module.css";
import { LogOut, Home, Users, FileText, Settings, Activity, PieChart, Database, Zap, Award, ChevronDown, BarChart2, Layers, TrendingUp, Clock, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const systemReportLinks = [
  { name: "Wallet Totals",       href: "/admin/dashboard/system-report",               icon: Layers },
  { name: "Transaction Totals",  href: "/admin/dashboard/system-report?tab=onchain",   icon: TrendingUp },
  { name: "Distribution Totals", href: "/admin/dashboard/system-report?tab=distribution", icon: BarChart2 },
  { name: "Daily Distribution",  href: "/admin/dashboard/system-report?tab=daily",     icon: Clock },
];

const mainNavLinks = [
  { name: "Welcome",             href: "/admin/dashboard",              icon: Home },
  { name: "Users",               href: "/admin/dashboard/users",        icon: Users },
  { name: "User Ledger",         href: "/admin/dashboard/user-ledger",  icon: Database },
  { name: "Team View",           href: "/admin/dashboard/team-view",    icon: PieChart },
  { name: "Ledger Rows",         href: "/admin/dashboard/ledger-rows",  icon: Activity },
  { name: "Recent Transactions", href: "/admin/dashboard/usdt-deposits", icon: Zap },
  { name: "Users Summary",       href: "/admin/dashboard/users-summary", icon: FileText },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const pathname   = usePathname();
  const search     = typeof window !== "undefined" ? window.location.search : "";
  const settingsPath = "/admin/dashboard/settings";

  const isSystemReportActive = pathname.startsWith("/admin/dashboard/system-report");
  const [sysOpen, setSysOpen] = useState(isSystemReportActive);

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.sidebarNav} style={{ overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>

        {/* Regular nav links */}
        {mainNavLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <li key={link.name} className={styles.navItem}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                <Icon size={18} style={{ minWidth: "18px" }} />
                <span style={{ whiteSpace: "nowrap" }}>{link.name}</span>
              </Link>
            </li>
          );
        })}

        {/* System Report — collapsible dropdown */}
        <li className={styles.navItem}>
          <button
            onClick={() => setSysOpen((o) => !o)}
            className={`${styles.navLink} ${isSystemReportActive ? styles.navLinkActive : ""}`}
            style={{
              width: "100%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 0,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BarChart2 size={18} style={{ minWidth: "18px" }} />
              <span style={{ whiteSpace: "nowrap" }}>System Report</span>
            </span>
            <ChevronDown
              size={14}
              style={{
                transition: "transform 0.25s ease",
                transform: sysOpen ? "rotate(180deg)" : "rotate(0deg)",
                opacity: 0.5,
                flexShrink: 0,
              }}
            />
          </button>

          {/* Sub-links */}
          {sysOpen && (
            <ul style={{ listStyle: "none", padding: "4px 0 4px 18px", margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {systemReportLinks.map((sub) => {
                const SubIcon = sub.icon;
                // match active: check href + optional ?tab
                const isSubActive = pathname === "/admin/dashboard/system-report" &&
                  (sub.href.includes("?tab=")
                    ? (typeof window !== "undefined" && window.location.href.includes(sub.href.split("?")[1]))
                    : !window.location.search);

                return (
                  <li key={sub.name}>
                    <Link
                      href={sub.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "9px 14px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: isSubActive ? 800 : 500,
                        color: isSubActive ? "#ffd700" : "rgba(255,255,255,0.85)",
                        background: isSubActive ? "rgba(255,215,0,0.07)" : "transparent",
                        transition: "all 0.2s ease",
                        borderLeft: isSubActive ? "2px solid #ffd700" : "2px solid transparent",
                      }}
                    >
                      <SubIcon size={14} style={{ opacity: 0.9, flexShrink: 0 }} />
                      {sub.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>

      </ul>

      <div className={styles.sidebarFooter}>
        <div className={styles.navItem}>
          <Link
            href={settingsPath}
            className={`${styles.navLink} ${pathname === settingsPath ? styles.navLinkActive : ""}`}
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
        <div className={styles.navItem}>
          <Link
            href="/dashboard"
            className={styles.navLink}
          >
            <ArrowLeftCircle size={18} />
            Switch to User View
          </Link>
        </div>
        <button
          onClick={logout}
          className={styles.navLink}
          style={{ width: "100%", background: "transparent", cursor: "pointer", marginTop: "10px" }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
