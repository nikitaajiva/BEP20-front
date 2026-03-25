"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { LogOut, Home, Users, FileText, Settings, Activity, PieChart, Database, Zap, Award, Layers, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const supportNavLinks = [
  { name: "Welcome", href: "/support/dashboard", icon: Home },
  { name: "Users", href: "/support/dashboard/users", icon: Users },
  { name: "User Ledger", href: "/support/dashboard/user-ledger", icon: Database },
  { name: "Team View", href: "/support/dashboard/team-view", icon: PieChart },
  { name: "Ledger Rows", href: "/support/dashboard/ledger-rows", icon: Activity },
  { name: "USDT Deposits", href: "/support/dashboard/usdt-deposits", icon: Zap },
  // { name: "Community Booster", href: "/support/dashboard/community-booster-report", icon: Award },
  // { name: "Community Rewards", href: "/support/dashboard/community-rewards", icon: Layers },
  // { name: "X1-X5 Bonus", href: "/support/dashboard/x1-bonus-report", icon: Activity },
  { name: "Users Summary", href: "/support/dashboard/users-summary", icon: FileText },
  { name: "System Report", href: "/support/dashboard/system-report", icon: Activity },
];

export default function SupportSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const settingsPath = "/support/dashboard/settings";

  return (
    <aside className={styles.sidebar}>

      <ul className={styles.sidebarNav} style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {supportNavLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <li key={link.name} className={styles.navItem}>
              <Link 
                href={link.href} 
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                style={{ 
                  color: isActive ? "#000" : "rgba(255,255,255,0.35)",
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} style={{ 
                  minWidth: "18px", 
                  opacity: isActive ? 1 : 0.6,
                  color: isActive ? "#000" : "inherit"
                }} />
                <span style={{ 
                  whiteSpace: "nowrap",
                  fontWeight: isActive ? "800" : "500"
                }}>{link.name}</span>
              </Link>
            </li>
          );
        })}
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
        <button 
          onClick={logout}
          className={styles.navLink} 
          style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", marginTop: "10px" }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
