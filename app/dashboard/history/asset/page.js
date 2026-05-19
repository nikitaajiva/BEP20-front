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
              <div className="container-fluid flex-grow-1 container-p-y py-4 px-0">
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-center align-items-center mb-2" style={{ gap: "8px" }}>
                      <span style={{ fontSize: "1.8rem" }}>🛡️</span>
                      <h2
                        className="fw-bold m-0"
                        style={{
                          background: "linear-gradient(90deg, #FFB800 0%, #FF6200 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          fontSize: "2rem",
                          fontWeight: "900",
                          textAlign: "center",
                          textTransform: "uppercase",
                          letterSpacing: "1.5px",
                          textShadow: "0 4px 20px rgba(255, 98, 0, 0.15)"
                        }}
                      >
                        My Active Asset History
                      </h2>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.3px" }}>
                      Track all your Horse NFT purchases, Mining mints, and token staking ledger entries in real time.
                    </p>
                  </div>
                </div>

                <div
                  className="p-0 mb-4"
                  style={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none"
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
