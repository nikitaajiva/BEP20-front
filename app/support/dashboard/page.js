"use client";
import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Zap, 
  Award, 
  ShieldCheck, 
  Activity, 
  LayoutGrid, 
  Wallet, 
  Database,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from "./support-dashboard.module.css";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MOCK_TOTALS = {
  todayDeposits: "1,245.89",
  totalDeposits: "452,109.43",
  todayWithdrawals: "890.12",
  totalWithdrawals: "156,782.55",
  todayRewards: "423.50",
  totalRewards: "89,120.40",
  activeLPCount: "42",
  totalUsersInLP: "1,245",
  newUsersToday: "18",
};

const CHART_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  deposits: [450, 680, 520, 910, 780, 1200, 950],
  users: [12, 15, 8, 22, 18, 30, 25],
};

const StatCard = ({ title, value, sub, icon: Icon, color = "#ffd700", trend }) => (
  <div className={styles.statCard}>
    <header className="flex justify-between items-start">
      <div className={styles.cardIcon} style={{ background: `${color}15`, color }}>
        <Icon size={18} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(trend)}%
        </div>
      )}
    </header>
    <div>
      <div className={styles.cardLabel}>{title}</div>
      <div className={styles.cardValue}>
        {value} <span className="text-[12px] opacity-40 font-normal ml-1">USDT</span>
      </div>
      <div className={styles.cardSub}>{sub}</div>
    </div>
  </div>
);

export default function SupportDashboardV2() {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chart Config
  const depositsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0a0a0a',
        borderColor: 'rgba(255, 215, 0, 0.2)',
        borderWidth: 1,
        titleColor: '#ffd700',
        padding: 10,
        cornerRadius: 12,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#888', font: { size: 10, weight: '700' } } },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: '#888', font: { size: 10, weight: '700' }, callback: (v) => `$${v}` } 
      }
    }
  };

  const usersConfig = {
    ...depositsConfig,
    scales: {
      ...depositsConfig.scales,
      y: { ...depositsConfig.scales.y, ticks: { ...depositsConfig.scales.y.ticks, callback: (v) => v } }
    }
  };

  const chartDataDeposits = {
    labels: CHART_DATA.labels,
    datasets: [{
      label: 'Volume',
      data: CHART_DATA.deposits,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        return gradient;
      },
      borderColor: '#ffd700',
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#ffd700',
      fill: true,
      tension: 0.4,
    }]
  };

  const chartDataUsers = {
    labels: CHART_DATA.labels,
    datasets: [{
      label: 'Identity Registry',
      data: CHART_DATA.users,
      backgroundColor: '#ffd700',
      borderRadius: 8,
      barThickness: 15,
    }]
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div>
          <h1 className={styles.title}>Vault Protocol <span>Command Center</span></h1>
          <p className="text-[14px] text-white/40 font-bold mt-2">Real-time status of the BEP20 Ecosystem Registry</p>
        </div>
      </header>

      {/* SEC 1: Financial Flux */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Database size={16} color="#ffd700" />
          <h2 className="text-[12px] font-black tracking-[2px] text-white/60">STATS OVERVIEW</h2>
        </div>
        <div className={styles.statsGrid}>
          <StatCard title="Today Deposits" value={MOCK_TOTALS.todayDeposits} sub="Snapshot at 00:00 UTC" icon={TrendingUp} color="#10b981" trend={12.5} />
          <StatCard title="Total Deposits" value={MOCK_TOTALS.totalDeposits} sub="Lifetime Protocol Inflow" icon={Wallet} />
          <StatCard title="Today Withdrawals" value={MOCK_TOTALS.todayWithdrawals} sub="Validated Outflow" icon={TrendingDown} color="#f43f5e" trend={-4.2} />
          <StatCard title="Total Withdrawals" value={MOCK_TOTALS.totalWithdrawals} sub="Lifetime Protocol Redemption" icon={RefreshCw} />
        </div>
      </section>

      {/* SEC 2: Rewards & LP Distribution */}
      <section className={styles.bentoGrid}>
        {/* Card 1: Rewards Distribution - ROBUST UI FIX */}
        <div className={styles.statCard}>
          <header className="flex justify-between items-start">
            <div className={styles.cardIcon}>
              <Award size={18} />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-2 mr-2" />
          </header>
          <div className="w-full">
            <div className={styles.cardLabel}>Today Rewards</div>
            <div className={styles.cardValue}>
              {MOCK_TOTALS.todayRewards} <span className="text-[12px] opacity-40 font-normal ml-1">USDT</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.05] pt-5 w-full">
               <div className="w-full flex justify-between items-start gap-4 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-white/30 tracking-[2px] flex-1">Total Rewards</span>
                  <span className="text-[#ffd700]/90 font-black text-right whitespace-nowrap">{MOCK_TOTALS.totalRewards} USDT</span>
               </div>
               <div className="w-full flex justify-between items-start gap-4 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-white/30 tracking-[2px] flex-1">Status</span>
                  <span className="text-emerald-500/80 font-black text-right whitespace-nowrap underline decoration-emerald-500/20 underline-offset-4 tracking-[1px]">VERIFIED ✓</span>
               </div>
            </div>
          </div>
        </div>

        {/* Card 2: Network Status - ROBUST UI FIX */}
        <div className={styles.statCard}>
          <header className="flex justify-between items-start">
            <div className={styles.cardIcon}>
              <Activity size={18} />
            </div>
            <div className="w-2 h-2 rounded-full bg-[#ffd700]/30 mt-2 mr-2" />
          </header>
          <div className="w-full">
            <div className={styles.cardLabel}>Active LP Count</div>
            <div className={styles.cardValue}>
              {MOCK_TOTALS.activeLPCount} <span className="text-[12px] opacity-40 font-normal ml-1">NODES</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.05] pt-5 w-full">
               <div className="w-full flex justify-between items-start gap-4 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-white/30 tracking-[2px] flex-1">Total Users in LP</span>
                  <span className="text-white/80 font-black text-right whitespace-nowrap">{MOCK_TOTALS.totalUsersInLP} USERS</span>
               </div>
               <div className="w-full flex justify-between items-start gap-4 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-white/30 tracking-[2px] flex-1">Validation</span>
                  <span className="text-emerald-500/80 font-black text-right whitespace-nowrap tracking-[1px]">LIVE SYNC ●</span>
               </div>
            </div>
          </div>
        </div>

        {/* Card 3: Inbound Flow Today */}
        <div className={`${styles.statCard} flex flex-col justify-between`}>
           <header className="flex justify-between items-start">
             <div className={styles.cardIcon}>
               <Users size={18} />
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-[#ffd700]/20 mr-2 mt-2" />
           </header>
           <div className="w-full">
              <div className={styles.cardLabel}>New Users Joined Today</div>
              <div className={styles.cardValue}>
                {MOCK_TOTALS.newUsersToday} <span className="text-[12px] opacity-40 font-normal ml-1">ACCOUNTS</span>
              </div>
              <div className="mt-6 py-2.5 px-3.5 bg-white/5 rounded-xl text-[9px] font-black text-[#ffd700]/60 uppercase tracking-[2.5px] inline-flex items-center gap-2">
                 <Zap size={10} color="#ffd700" className="opacity-60" /> SYSTEM SYNC: 0.2MS
              </div>
           </div>
        </div>
      </section>

      {/* SEC 3: Visual Audit (Charts) */}
      <section className={styles.visualHub}>
        <div className={styles.chartContainer}>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Protocol Volume Pulse (7 Days)</div>
            <TrendingUp size={16} color="#ffd700" />
          </header>
          <div className="h-[300px] w-full mt-4">
             <Line data={chartDataDeposits} options={depositsConfig} />
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Identity Registry Trends</div>
            <LayoutGrid size={16} color="#ffd700" />
          </header>
          <div className="h-[300px] w-full mt-4">
             <Bar data={chartDataUsers} options={usersConfig} />
          </div>
        </div>
      </section>

    </div>
  );
}