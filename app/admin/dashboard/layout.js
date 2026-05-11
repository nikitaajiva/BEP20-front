"use client";
import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '@/components/RedesignedDashboard.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PieChart, Activity, Zap, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Pre-compute stable star positions so Math.random() only runs once on client
  const stars = useMemo(() => (
    [...Array(10)].map((_, i) => ({
      id: i,
      top: `${(i * 17 + 7) % 100}%`,   // deterministic pseudo-random spread
      left: `${(i * 31 + 13) % 100}%`,
      opacity: 0.04 + (i % 5) * 0.01,
      duration: `${3 + (i % 5)}s`,
    }))
  ), []);

  useEffect(() => { setMounted(true); }, []);

  const mobileNavLinks = [
    { name: "Home", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/dashboard/users", icon: Users },
    { name: "Team", href: "/admin/dashboard/team-view", icon: PieChart },
    { name: "Ledger", href: "/admin/dashboard/ledger-rows", icon: Activity },
    { name: "Audit", href: "/admin/dashboard/users-summary", icon: Zap },
    { name: "Report", href: "/admin/dashboard/system-report", icon: BarChart2 },
    { name: "Safety", href: "/admin/dashboard/settings", icon: Settings },
    { name: "Exit", href: "/logout", icon: LogOut, isLogout: true },
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
          if (link.isLogout) {
             const Icon = link.icon;
             return (
               <button 
                key={link.name}
                onClick={logout}
                className={styles.mobileNavItem}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
               >
                 <Icon size={18} />
                 <span>{link.name}</span>
               </button>
             );
          }
          const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link 
              key={link.name}
              href={link.href} 
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Background Star Ambience - mounted only after hydration to avoid SSR mismatch */}
      {mounted && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
          {stars.map((s) => (
            <div key={s.id} style={{
              position: "absolute",
              width: "2px", height: "2px",
              backgroundColor: "#ffd700",
              borderRadius: "50%",
              top: s.top,
              left: s.left,
              opacity: s.opacity,
              animation: `pulse ${s.duration} infinite`
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
