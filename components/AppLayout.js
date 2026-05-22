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

  // ✅ All hooks must be called unconditionally — BEFORE any early returns
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const username = user?.username || user?.email?.split("@")[0] || "User";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "ri-dashboard-3-fill" },
    // { href: "/dashboard/staking", label: "Token Staking", icon: "ri-fire-fill" },
    // { href: "/dashboard/nft-packages", label: "Horse NFT Packages", icon: "ri-nft-fill" },
    { href: "/team-referrals", label: "Community", icon: "ri-group-2-fill" },
    { href: "/dashboard/ledger", label: "Ledger", icon: "ri-file-list-3-fill" },
  ];

  // Super Admin link moved to footer next to logout
  // if (user?.userType === "superadmin") {
  //   navLinks.push({ href: "/admin/dashboard", label: "Super Admin Dashboard", icon: "ri-admin-fill" });
  // }

  navLinks.push({ href: "https://t.me/TokingHoofbornSupportBot", label: "Help", icon: "ri-customer-service-2-fill" });

  // Pages that never show the sidebar (auth + public marketing/legal pages)
  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-ins") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/terms-conditions") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/disclaimer") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/calculator");

  // Also hide sidebar when user is not authenticated (logged out)
  if (isAuthPage || !user) {
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
          <div className={styles.logoImgWrapper}>
            <Image
              src="/img/main-logo.avif"
              alt="Toking Hoofborn"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={styles.sidebarBrandText}>
            <span className={styles.brandMain}>Toking<span className={styles.goldText}>Hoofborn</span></span>
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
                  title={link.label}
                >
                  <i className={link.icon} style={{ fontSize: "20px", minWidth: "20px", display: "inline-block", textAlign: "center" }}></i>
                  <span className={styles.navLabel}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.sidebarFooter}>
          {/* User Profile Summary in Sidebar */}
          <div className={`d-flex align-items-center p-2 mb-3 ${styles.profileBox}`} style={{ background: "rgba(255, 102, 0, 0.05)", borderRadius: "12px", border: "1px solid rgba(255, 102, 0, 0.15)" }}>
            <div className={styles.profileAvatar} style={{ width: 35, height: 35, backgroundColor: "#ff6600", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{username[0] ? username[0].toUpperCase() : 'U'}</span>
            </div>
            <div className={`d-flex flex-column overflow-hidden ${styles.profileText}`}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{username}</span>
              <span style={{ color: "#ff6600", fontSize: 10 }}>🐴 NFT Member</span>
            </div>
          </div>

          <div className={styles.footerButtonsContainer}>
            <button
              onClick={logout}
              className={styles.navLink}
              title="Logout"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              <LogOut size={20} style={{ minWidth: "20px" }} />
              <span className={styles.navLabel}>Logout</span>
            </button>
            {user?.userType === "superadmin" && (
              <Link
                href="/admin/dashboard"
                className={`${styles.navLink} ${styles.adminLink}`}
                title="Super Admin Dashboard"
              >
                <i className="ri-admin-fill" style={{ fontSize: "20px", minWidth: "20px" }}></i>
                <span className={styles.navLabel}>Admin Panel</span>
              </Link>
            )}
          </div>
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

      {/* Global Background Ambience - stable positions to avoid hydration mismatch */}
      {mounted && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 2, height: 2,
              backgroundColor: "#ff6600",
              borderRadius: "50%",
              top: `${(i * 19 + 11) % 100}%`,
              left: `${(i * 37 + 7) % 100}%`,
              opacity: 0.03 + (i % 4) * 0.01,
              animation: `pulse ${3 + (i % 5)}s infinite`
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppLayout;
