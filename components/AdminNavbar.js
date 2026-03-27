"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiSettings } from "react-icons/fi";

const navLinks = [
  { name: "Welcome", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/dashboard/users" },
  // { name: "User Ledger", href: "/admin/dashboard/user-ledger" },
  { name: "Team View", href: "/admin/dashboard/team-view" },
  { name: "Ledger Rows", href: "/admin/dashboard/ledger-rows" },
  { name: "USDT Deposits", href: "/admin/dashboard/usdt-deposits" },
  { name: "Community Booster", href: "/admin/dashboard/community-booster-report" },
  { name: "Community Rewards", href: "/admin/dashboard/community-rewards" },
  { name: "X1-X5 Bonus", href: "/admin/dashboard/x1-bonus-report" },
  { name: "Users Summary", href: "/admin/dashboard/users-summary" },
  { name: "System Report", href: "/admin/dashboard/system-report" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const settingsPath = "/admin/dashboard/settings";

  return (
    <nav
      style={{
        background: "#000000",
        borderRadius: "22px",
        padding: "1rem 2rem",
        marginBottom: "2rem",
        boxShadow: "0 8px 32px 0 rgba(255, 215, 0, 0.1)",
        border: "1px solid rgba(255, 215, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Center Nav Links */}
      <ul
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          margin: 0,
          padding: 0,
          gap: "2rem",
          flex: 1,
        }}
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.name}>
              <Link
                href={link.href}
                style={{
                  color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontWeight: isActive ? "bold" : "500",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  background: isActive
                    ? "rgba(255, 215, 0, 0.2)"
                    : "transparent",
                  border: "1px solid",
                  borderColor: isActive
                    ? "rgba(255, 215, 0, 0.4)"
                    : "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Settings Icon */}
      <Link
        href={settingsPath}
        style={{
          color: pathname === settingsPath ? "#fff" : "rgba(255, 255, 255, 0.7)",
          padding: "0.6rem",
          borderRadius: "50%",
          background:
            pathname === settingsPath
              ? "rgba(255, 215, 0, 0.25)"
              : "transparent",
          border:
            pathname === settingsPath
              ? "1px solid rgba(255, 215, 0, 0.4)"
              : "1px solid transparent",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FiSettings size={20} />
      </Link>
    </nav>
  );
}

