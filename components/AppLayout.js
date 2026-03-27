"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const username = user?.username || user?.email?.split("@")[0] || "User";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "ri-dashboard-3-fill" },

    { href: "/team-referrals", label: "Community", icon: "ri-group-2-fill" },
    { href: "/dashboard/ledger", label: "Ledger History", icon: "ri-file-list-3-fill" },
  ];

  if (user?.username === "superadmin") {
    navLinks.push({ href: "/admin/dashboard", label: "Super Admin Dashboard", icon: "ri-admin-fill" });
  }

  navLinks.push({ href: "https://t.me/BEPVaultSupportBot", label: "Help", icon: "ri-customer-service-2-fill" });

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/login") || pathname.startsWith("/sign-up") || pathname.startsWith("/forgot-password") || pathname === "/" || pathname.startsWith("/admin");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.dashboardContainer} style={{ display: 'flex' }}>
      {/* Background Motion Rays */}
      <div className={styles.lightRaysContainer}>
        <div className={styles.ray}></div>
        <div className={styles.ray}></div>
      </div>
      <div className={styles.ambientGlow}></div>

      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarLogo}>
          <div style={{ width: 45, height: 45, position: "relative" }}>
            <Image
              src="/bepvault_logo.png"
              alt="Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="d-flex flex-column">
            <span style={{ color: "#ffd700", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>BEPVault</span>
          </div>
        </Link>

        <ul className={styles.sidebarNav}>
          {navLinks.map((link) => {
            const isActive = link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);

            return (
              <li key={link.label} className={styles.navItem}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <i className={link.icon} style={{ fontSize: "20px" }}></i>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.sidebarFooter}>
          {/* User Profile Summary in Sidebar */}
          <div className="d-flex align-items-center gap-3 p-2 mb-3" style={{ background: "rgba(255,215,0,0.05)", borderRadius: "12px", border: "1px solid rgba(255,215,0,0.1)" }}>
            <div style={{ width: 35, height: 35, backgroundColor: "#ffd700", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <span style={{ color: "#000", fontWeight: 800, fontSize: 16 }}>{username[1] ? username[0].toUpperCase() : 'U'}</span>
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{username}</span>
              <span style={{ color: "#ffd700", fontSize: 10 }}>Pro Member</span>
            </div>
          </div>

          <button
            onClick={logout}
            className={styles.navLink}
            style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContentArea}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        {navLinks.map((link) => {
          const isActive = link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ""}`}
            >
              <i className={link.icon} style={{ fontSize: "20px" }}></i>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Background Ambience */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 2, height: 2,
            backgroundColor: "#ffd700",
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.1,
            animation: `pulse ${Math.random() * 5 + 3}s infinite`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default AppLayout;
