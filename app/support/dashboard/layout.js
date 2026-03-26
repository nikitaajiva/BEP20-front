"use client";
import React, { useState, useEffect } from 'react';
import SupportSidebar from '@/components/SupportSidebar';
import styles from '@/components/RedesignedDashboard.module.css';

export default function SupportDashboardLayout({ children }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.dashboardContainer} style={{ display: 'flex' }}>
      {/* Background Ambience Layers */}
      <div className={styles.lightRaysContainer}>
        <div className={styles.ray}></div>
        <div className={styles.ray}></div>
      </div>
      <div className={styles.ambientGlow}></div>

      {/* Admin Sidebar */}
      <SupportSidebar />

      {/* Main Content Area */}
      <main 
        className={styles.mainContentArea}
        style={{ 
          background: 'transparent',
          minHeight: '100vh',
          zIndex: 5,
          position: 'relative'
        }}
      >
        {children}
      </main>

      {/* Background Star Ambience */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
        {mounted && [...Array(10)].map((_, i) => (
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
}