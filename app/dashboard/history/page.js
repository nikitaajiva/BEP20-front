"use client";
import React, { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import LedgerPageContent from './LedgerPageContent';
import styles from './ledger.module.css';

export default function LedgerPage() {
  const { user, loading: authLoading, logout } = useAuth();

  if (authLoading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  if (!user) {
    return <div className={styles.loading}>Please log in to view this page.</div>;
  }

  return (
    <AuthGuard>
      <Suspense fallback={<div className={styles.loading}>Loading page...</div>}>
        <div className={styles.pageContainer}>
          <DashboardNavbar user={user} onLogout={logout} />
          <div className={styles.contentWrapper}>
            {/* <DashboardSidebar /> */}
            <main className={styles.mainContent}>
              <LedgerPageContent />
            </main>
          </div>
        </div>
      </Suspense>
    </AuthGuard>
  );
}