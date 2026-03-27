"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Award,
  Activity,
  LayoutGrid,
  Wallet,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck,
  Droplets,
  CircleDollarSign,
  BarChart3,
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
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import styles from "./support-dashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

/* ─── MOCK DATA ─────────────────────────────── */
const DATA = {
  todayDeposits:   "1,245.89",
  totalDeposits:   "452,109.43",
  todayWithdrawals:"890.12",
  totalWithdrawals:"156,782.55",
  todayRewards:    "423.50",
  totalRewards:    "89,120.40",
  activeLPCount:   "42",
  totalUsersInLP:  "1,245",
  newUsersToday:   "18",
  netFlow:         "355.77",
  ecosystemFee:    "12,480.22",
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEPOSITS_SERIES    = [450, 680, 520, 910, 780, 1200, 950];
const WITHDRAWALS_SERIES = [310, 420, 380, 600, 540, 870, 720];
const USERS_SERIES       = [12, 15, 8, 22, 18, 30, 25];

/* ────────────────────────────────────────────── */

function useCounter(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(String(target).replace(/,/g, ""));
    if (isNaN(num)) return;
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

/* ─── SPARKLINE (inline mini line chart) ──── */
function Sparkline({ data, color = "#ffd700", height = 40 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display:"block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null;
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 6) - 3;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

/* ─── STAT CARD ─────────────────────────────── */
function StatCard({ title, value, unit = "USDT", sub, icon: Icon, colorClass, iconBg, iconColor, trend, sparkData, sparkColor }) {
  return (
    <div className={`${styles.statCard} ${colorClass || ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon} style={{ background: iconBg || "rgba(255,215,0,0.08)", color: iconColor || "#ffd700" }}>
          <Icon size={18} />
        </div>
        {trend != null && (
          <div className={`${styles.cardTrend} ${trend >= 0 ? styles.trendUp : styles.trendDown}`}>
            {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardLabel}>{title}</div>
        <div className={styles.cardValue}>
          {value}
          <span className={styles.cardUnit}>{unit}</span>
        </div>
        {sub && <div className={styles.cardSub}>{sub}</div>}
      </div>
      {sparkData && (
        <div className={styles.cardSparkline}>
          <Sparkline data={sparkData} color={sparkColor || "#ffd700"} height={40} />
        </div>
      )}
    </div>
  );
}

/* ─── DONUT CHART ─────────────────────────── */
function ProtocolDonut() {
  const data = {
    labels: ["Deposits", "Withdrawals", "Rewards", "Eco-Fee"],
    datasets: [{
      data: [452109, 156782, 89120, 12480],
      backgroundColor: ["#ffd700", "#f43f5e", "#10b981", "#6366f1"],
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a0a0a",
        borderColor: "rgba(255,215,0,0.2)",
        borderWidth: 1,
        titleColor: "#ffd700",
        bodyColor: "#aaa",
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString()} USDT`,
        },
      },
    },
  };
  const LEGEND = [
    { label: "Deposits",    color: "#ffd700", val: "452K" },
    { label: "Withdrawals", color: "#f43f5e", val: "156K" },
    { label: "Rewards",     color: "#10b981", val: "89K"  },
    { label: "Eco-Fee",     color: "#6366f1", val: "12K"  },
  ];
  return (
    <div className={styles.donutWrap}>
      <div style={{ position:"relative", width: 180, height: 180 }}>
        <Doughnut data={data} options={opts} className={styles.donutSvg} />
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>708K</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 2 }}>Total USDT</div>
        </div>
      </div>
      <div className={styles.donutMeta}>
        {LEGEND.map(l => (
          <div key={l.label} className={styles.donutLegendItem}>
            <div className={styles.donutDot} style={{ background: l.color }} />
            {l.label}
            <span style={{ color: l.color, fontWeight: 900, marginLeft: 2 }}>{l.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────── */
export default function SupportDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  /* ── chart configs ─────────── */
  const baseTooltip = {
    backgroundColor: "#0a0a0a",
    borderColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
    titleColor: "#ffd700",
    bodyColor: "#aaa",
    padding: 10,
    cornerRadius: 10,
  };
  const baseScales = {
    x: { grid: { display: false }, ticks: { color: "#555", font: { size: 10, weight: "700" } } },
    y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#555", font: { size: 10, weight: "700" } } },
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: { ...baseScales, y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: v => `$${v}` } } },
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: baseScales,
  };

  const lineData = {
    labels: WEEK,
    datasets: [
      {
        label: "Deposits",
        data: DEPOSITS_SERIES,
        borderColor: "#ffd700",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, "rgba(255,215,0,0.25)");
          g.addColorStop(1, "rgba(255,215,0,0)");
          return g;
        },
        borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffd700",
        fill: true, tension: 0.4,
      },
      {
        label: "Withdrawals",
        data: WITHDRAWALS_SERIES,
        borderColor: "#f43f5e",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, "rgba(244,63,94,0.12)");
          g.addColorStop(1, "rgba(244,63,94,0)");
          return g;
        },
        borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#f43f5e",
        fill: true, tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: WEEK,
    datasets: [{
      label: "New Users",
      data: USERS_SERIES,
      backgroundColor: USERS_SERIES.map((_, i) =>
        i === USERS_SERIES.length - 1 ? "#ffd700" : "rgba(255,215,0,0.25)"
      ),
      borderRadius: 8,
      barThickness: 18,
    }],
  };

  return (
    <div className={styles.container}>

      {/* ── HERO ───────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>
            <span className={styles.eyebrowDot} />
            BEPVault Admin
          </div>
          <h1 className={styles.title}>
            Vault Protocol <span>Command Center</span>
          </h1>
          <p className={styles.heroSub}>Real-time status of the BEP20 Ecosystem Registry</p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.liveChip}>
            <span className={styles.liveDot} />
            LIVE
          </div>
          <div className={styles.heroTime}>{currentTime}</div>
          <div className={styles.heroDate}>{currentDate}</div>
        </div>
      </header>

      {/* ── TOTAL LIFETIME STRIP ────────────── */}
      <div className={styles.totalStrip}>
        {[
          { label: "Total Deposits", value: DATA.totalDeposits, icon: TrendingUp, bg: "rgba(16,185,129,0.12)", color: "#10b981" },
          { label: "Total Withdrawals", value: DATA.totalWithdrawals, icon: TrendingDown, bg: "rgba(244,63,94,0.12)", color: "#f43f5e" },
          { label: "Total Rewards", value: DATA.totalRewards, icon: Award, bg: "rgba(255,215,0,0.12)", color: "#ffd700" },
          { label: "Ecosystem Fee", value: DATA.ecosystemFee, icon: CircleDollarSign, bg: "rgba(99,102,241,0.12)", color: "#6366f1" },
          { label: "Net Flow Today", value: DATA.netFlow, icon: Zap, bg: "rgba(16,185,129,0.08)", color: "#10b981" },
        ].map((item) => (
          <div key={item.label} className={styles.totalStripCard}>
            <div className={styles.stripIcon} style={{ background: item.bg }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div className={styles.stripBody}>
              <div className={styles.stripLabel}>{item.label}</div>
              <div className={styles.stripValue}>
                {item.value}
                <span className={styles.stripUnit}>USDT</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION LABEL ───────────────────── */}
      <div className={styles.sectionLabel}>
        <Database size={12} />
        Daily Snapshot
        <div className={styles.sectionLabelLine} />
      </div>

      {/* ── 4-STAT GRID ─────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Today Deposits"
          value={DATA.todayDeposits}
          sub="Snapshot at 00:00 UTC"
          icon={TrendingUp}
          trend={12.5}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10b981"
          colorClass={styles.accentGreen}
          sparkData={DEPOSITS_SERIES}
          sparkColor="#10b981"
        />
        <StatCard
          title="Today Withdrawals"
          value={DATA.todayWithdrawals}
          sub="Validated Outflow"
          icon={TrendingDown}
          trend={-4.2}
          iconBg="rgba(244,63,94,0.12)"
          iconColor="#f43f5e"
          colorClass={styles.accentRed}
          sparkData={WITHDRAWALS_SERIES}
          sparkColor="#f43f5e"
        />
        <StatCard
          title="Today Rewards"
          value={DATA.todayRewards}
          sub="Distributed to users"
          icon={Award}
          trend={7.1}
          sparkData={[320, 380, 355, 410, 390, 423, 423]}
          sparkColor="#ffd700"
        />
        <StatCard
          title="New Users Today"
          unit="ACCOUNTS"
          value={DATA.newUsersToday}
          sub="System sync: 0.2ms"
          icon={Users}
          trend={22}
          iconBg="rgba(99,102,241,0.12)"
          iconColor="#6366f1"
          colorClass={styles.accentBlue}
          sparkData={USERS_SERIES}
          sparkColor="#6366f1"
        />
      </div>

      {/* ── BENTO ROW ────────────────────────── */}
      <div className={styles.bentoRow}>

        {/* Chart: Deposit vs Withdrawal line */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>Deposit vs Withdrawal Volume</div>
            <div className={styles.chartBadge}>7-Day View</div>
          </div>
          <div style={{ display:"flex", gap: 16, marginBottom: 16 }}>
            {[{ color:"#ffd700", label:"Deposits" }, { color:"#f43f5e", label:"Withdrawals" }].map(l => (
              <div key={l.label} style={{ display:"flex", alignItems:"center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.chartWrap}>
            <Line data={lineData} options={lineOpts} />
          </div>
        </div>

        {/* KPI: Active LP + Protocol Distribution */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap}>
              <Droplets size={20} />
            </div>
            <div className={styles.kpiStatusDot + " " + styles.dotGreen} />
          </div>
          <div className={styles.kpiLabel}>Active LP Nodes</div>
          <div className={styles.kpiValue}>
            {DATA.activeLPCount}
            <span className={styles.kpiUnit}>NODES</span>
          </div>
          <div className={styles.kpiDivider} />
          <div className={styles.kpiMetaRow}>
            <div className={styles.kpiMetaLabel}>Total Users in LP</div>
            <div className={styles.kpiMetaValue}>{DATA.totalUsersInLP}</div>
          </div>
          <div className={styles.kpiMetaRow}>
            <div className={styles.kpiMetaLabel}>Validation Status</div>
            <div className={styles.kpiMetaGreen}>LIVE SYNC ●</div>
          </div>
          <div className={styles.kpiMetaRow}>
            <div className={styles.kpiMetaLabel}>Protocol Health</div>
            <div className={styles.kpiMetaGreen}>VERIFIED ✓</div>
          </div>

          {/* Flow micro-grid */}
          <div className={styles.flowGrid}>
            <div className={styles.flowItem}>
              <div className={styles.flowLabel}>In Flow</div>
              <div className={styles.flowValue} style={{ color:"#10b981" }}>+1.2K</div>
              <div className={styles.flowBar}>
                <div className={styles.flowFill} style={{ width: "72%", background: "#10b981" }} />
              </div>
            </div>
            <div className={styles.flowItem}>
              <div className={styles.flowLabel}>Out Flow</div>
              <div className={styles.flowValue} style={{ color:"#f43f5e" }}>-890</div>
              <div className={styles.flowBar}>
                <div className={styles.flowFill} style={{ width: "48%", background: "#f43f5e" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Distribution Donut */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIconWrap} style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
              <BarChart3 size={20} />
            </div>
            <div className={styles.kpiStatusDot + " " + styles.dotGold} />
          </div>
          <div className={styles.kpiLabel}>Protocol Distribution</div>
          <div className={styles.kpiValue} style={{ fontSize: 18, marginBottom: 2 }}>
            Lifetime
            <span className={styles.kpiUnit}>USDT</span>
          </div>
          <ProtocolDonut />
        </div>
      </div>

      {/* ── SECTION LABEL ─────────────────────── */}
      <div className={styles.sectionLabel}>
        <Activity size={12} />
        Visual Audit Trail
        <div className={styles.sectionLabelLine} />
      </div>

      {/* ── BOTTOM 2-CHART ROW ──────────────────── */}
      <div className={styles.chartsRow}>
        {/* Bar: new users */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>Identity Registry Trends</div>
            <div className={styles.chartBadge}>Weekly Joins</div>
          </div>
          <div className={styles.chartWrap}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        {/* System Health summary */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>System Health Overview</div>
            <div className={styles.chartBadge}>Live</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap: 14, marginTop: 10 }}>
            {[
              { label: "Protocol Uptime",     val: 99.98, color: "#10b981" },
              { label: "API Response (avg)",   val: 0.2,   color: "#ffd700", unit:"ms", raw:"0.2ms" },
              { label: "Deposit Success Rate", val: 98.5,  color: "#10b981" },
              { label: "Withdrawal Queue",     val: 72,    color: "#6366f1" },
              { label: "Error Rate (24h)",     val: 1.5,   color: "#f43f5e" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: item.color }}>{item.raw || `${item.val}%`}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(item.val, 100)}%`, background: item.color, borderRadius: 3, transition:"width 1s ease", boxShadow:`0 0 8px ${item.color}60` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.syncBadge}>
            <Zap size={10} color="#ffd700" />
            System Sync: 0.2ms · All nodes operational
          </div>
        </div>
      </div>

    </div>
  );
}
