"use client";
import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '@/components/RedesignedDashboard.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PieChart, Activity, Zap, BarChart2 } from 'lucide-react';

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();

  const mobileNavLinks = [
    { name: "Home", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/dashboard/users", icon: Users },
    { name: "Team", href: "/admin/dashboard/team-view", icon: PieChart },
    { name: "Ledger", href: "/admin/dashboard/ledger-rows", icon: Activity },
    { name: "Audit", href: "/admin/dashboard/users-summary", icon: Zap },
    { name: "Report", href: "/admin/dashboard/system-report", icon: BarChart2 },
  ];

  return (
    <div className={styles.dashboardContainer} style={{ display: 'flex' }}>
      {/* Background Ambience Layers */}
      <div className={styles.lightRaysContainer}>
        <div className={styles.ray}></div>
        <div className={styles.ray}></div>
      </div>
      <div className={styles.ambientGlow}></div>

      {/* Admin Sidebar */}
      <AdminSidebar />

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

      {/* Mobile Bottom Navigation for Admin */}
      <div className={styles.mobileBottomNav}>
        {mobileNavLinks.map(link => {
          const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link 
              key={link.name}
              href={link.href} 
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Background Star Ambience - Rendered on Client only to avoid hydration mismatch */}
      {typeof window !== "undefined" && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ 
              position: "absolute", 
              width: "2px", height: "2px", 
              backgroundColor: "#ffd700", 
              borderRadius: "50%",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.1,
              animation: `pulse ${Math.random() * 5 + 3}s infinite`
            }}></div>
          ))}
        </div>
      )}
    </div>
  );
}
