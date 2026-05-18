"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import AssetHistoryTable from "@/components/AssetHistoryTable";
import styles from "../[walletType]/ledger.module.css";

export default function AssetHistoryPage() {
  const { user, loading: authLoading, logout } = useAuth();

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
      <Suspense fallback={<div className={styles.loading}>Loading page...</div>}>
        <div className={styles.pageContainer}>
          <DashboardNavbar user={user} onLogout={logout} />
          <div className={styles.contentWrapper}>
            <main className={styles.mainContent}>
              <div className="container-xxl flex-grow-1 container-p-y py-4">
                <div className="row mb-4">
                  <div className="col-12">
                    <h2
                      className="fw-bold mb-3"
                      style={{
                        color: "#fff",
                        fontSize: "1.75rem",
                        textAlign: "center",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        textShadow: "0 2px 10px rgba(255, 165, 0, 0.2)"
                      }}
                    >
                      🛡️ My Active Asset History
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: "0.95rem" }}>
                      View all your Horse NFT purchases, Mining mints, and token staking ledger entries.
                    </p>
                  </div>
                </div>

                <div
                  className="card p-4 mb-4"
                  style={{
                    borderRadius: "22px",
                    background: "#181f3a",
                    border: "1px solid rgba(255, 165, 0, 0.15)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <AssetHistoryTable />
                </div>
              </div>
            </main>
          </div>
        </div>
      </Suspense>
    </AuthGuard>
  );
}
