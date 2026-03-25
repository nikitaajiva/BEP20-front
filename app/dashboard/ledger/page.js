"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import LedgerPageContent from "./LedgerPageContent";
import styles from "./ledger.module.css";

const allowedWallets = [
  "SWIFT",
  "XAMAN",
  "LP",
  "ZERO_RISK",
  "AIRDROP",
  "BOOST",
  "COMMUNITY_REWARDS",
];

export default function LedgerPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const params = useParams();
  const router = useRouter();

  const rawWalletType = params.walletType || "";
  const walletType = rawWalletType.replace(/-/g, "_").toUpperCase();

  const [filterWallet, setFilterWallet] = useState("");

  if (authLoading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className={styles.loading}>Please log in to view this page.</div>
    );
  }

  return (
    <AuthGuard>
      <Suspense
        fallback={<div className={styles.loading}>Loading page...</div>}
      >
        <div className={styles.pageContainer}>
          <DashboardNavbar user={user} onLogout={logout} />
          <div className={styles.contentWrapper}>
            {/* <DashboardSidebar /> */}
            <main className={styles.mainContent}>
              {/* Pass wallet type as prop */}
              <LedgerPageContent walletType={walletType} />
            </main>
          </div>
        </div>
      </Suspense>
    </AuthGuard>
  );
}
