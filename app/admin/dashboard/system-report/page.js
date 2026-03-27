"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Layers, TrendingUp, BarChart2, Clock, ExternalLink,
  Users, ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";
import ExportUserReportButton from "@/components/ExportUserReportButton";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
const fmt = (val) => {
  const n = Number(val);
  if (Number.isNaN(n)) return val ?? "0";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/* ── shared chart defaults ─────────────── */
const TOOLTIP = {
  backgroundColor: "#0a0a0a", borderColor: "rgba(255,215,0,0.2)", borderWidth: 1,
  titleColor: "#ffd700", bodyColor: "#aaa", padding: 10, cornerRadius: 10,
};
const SCALES = {
  x: { grid: { display: false }, ticks: { color: "#555", font: { size: 10, weight: "700" } } },
  y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#555", font: { size: 10, weight: "700" } } },
};

/* ══════════════════════════════════════════
   METRIC CARD — premium redesign
═══════════════════════════════════════════ */
function MetricCard({ label, value, count, sub, icon: Icon, accentColor = "#ffd700", detailHref, onClick }) {
  return (
    <div
      style={{
        background: "rgba(10,10,10,0.65)",
        border: `1px solid ${accentColor}18`,
        borderRadius: 18,
        padding: "20px 22px",
        flex: "1 1 200px",
        minWidth: 185,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor: detailHref || onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(16px)",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${accentColor}40`;
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.5), 0 0 20px ${accentColor}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${accentColor}18`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* background glow */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `${accentColor}08`, pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: `${accentColor}12`, color: accentColor, flexShrink: 0 }}>
          {Icon ? <Icon size={17} /> : <BarChart2 size={17} />}
        </div>
        {detailHref && (
          <a href={detailHref} target="_blank" rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: `${accentColor}70`,
              background: `${accentColor}08`, border: `1px solid ${accentColor}15`, borderRadius: 20, padding: "3px 9px", textDecoration: "none"
            }}>
            <ExternalLink size={9} /> View
          </a>
        )}
      </div>

      <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
        {fmt(value)}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 500, marginLeft: 5 }}>USDT</span>
      </div>
      {count != null && (
        <div style={{
          marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, fontWeight: 700, color: accentColor, background: `${accentColor}10`,
          border: `1px solid ${accentColor}20`, borderRadius: 20, padding: "3px 10px"
        }}>
          <Users size={10} />
          {count} users
        </div>
      )}
      {sub && <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB BUTTON
═══════════════════════════════════════════ */
function Tab({ label, icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
        fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
        transition: "all 0.25s ease",
        background: active ? "linear-gradient(135deg,#ffd700,#ffa500)" : "rgba(255,255,255,0.04)",
        color: active ? "#000" : "rgba(255,255,255,0.4)",
        boxShadow: active ? "0 4px 16px rgba(255,215,0,0.25)" : "none",
      }}>
      <Icon size={14} />
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════ */
function SectionHeader({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: "linear-gradient(180deg,#ffd700,#ffa500)" }} />
        <span style={{ fontSize: 13, fontWeight: 900, color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>{children}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, marginLeft: 13, letterSpacing: 1 }}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   CHART CARD wrapper
═══════════════════════════════════════════ */
function ChartCard({ title, badge, children, flex = "1 1 400px" }) {
  return (
    <div style={{
      flex, background: "rgba(10,10,10,0.65)", border: "1px solid rgba(255,215,0,0.08)",
      borderRadius: 20, padding: "24px 26px", backdropFilter: "blur(16px)",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.65)" }}>{title}</div>
        {badge && <div style={{
          fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,215,0,0.55)",
          background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.12)", padding: "3px 10px", borderRadius: 12
        }}>{badge}</div>}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   DETAIL PAGE ROUTES MAP
═══════════════════════════════════════════ */
const DETAIL_MAP = {
  "Net Deposits": "/admin/dashboard/system-report/positive_lp",
  "Total Withdrawals": "/admin/dashboard/system-report/negativelp",
  "Protocol Liquidity": "/admin/dashboard/system-report/totallp",
  "5x Reward Usage": "/admin/dashboard/system-report/5xrewards",
  "Airdrop Vault": "/admin/dashboard/system-report/airdrop",
  "Booster Vault": "/admin/dashboard/system-report/totalbooster",
  "Primary Wallet": "/admin/dashboard/system-report/totalxaman",
  "Zero-Risk Vault": "/admin/dashboard/system-report/totalzerorisk",
  "Community Rewards": "/admin/dashboard/system-report/communityrewards",
  "Smart Auto-Positioning": "/admin/dashboard/system-report/autopositioning",
  "Ecosystem Fees": "/admin/dashboard/system-report/ecosystemfee",
  "Transaction Deposits": "/admin/dashboard/system-report/onchaindeposits",
  "Transaction Withdrawals": "/admin/dashboard/system-report/onchainwithdrawals",
  "Negative Withdrawals": "/admin/dashboard/system-report/withdrawals-greater",
  "Positive Deposits": "/admin/dashboard/system-report/deposits-greater",
  "Active LP": "/admin/dashboard/system-report/activeLp",
  "Daily Rewards Total": "/admin/dashboard/system-report/rewards",
  "LP Reward Allocation": "/admin/dashboard/system-report/lp",
  "Airdrop Pool Allocation": "/admin/dashboard/system-report/airdrop-rewards",
  "Booster Pool Allocation": "/admin/dashboard/system-report/booster",
  "Cascade Analytics": "/admin/dashboard/system-report/community",
  "X-Performance Rewards": "/admin/dashboard/system-report/x1",
  "Community Reward Pool": "/admin/dashboard/system-report/rewards",
};

/* ══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function SystemReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") || "wallet";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState(tabParam);

  /* sync tab from URL */
  useEffect(() => { setActiveTab(tabParam); }, [tabParam]);

  const fetchReport = async () => {
    setLoading(true); setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${API_BASE_URL}/api/support/system-report`, { headers: { Authorization: `Bearer ${token}` } });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || "Failed to fetch system report");
      
      // Flexibly extract report data from .data or root
      const reportContent = resData.data || resData.report || resData;
      setReport(reportContent);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Authentication required")) router.push("/login");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push("/login"); return; }
      if (!["support", "admin"].includes(user.userType) && user.username !== "superadmin") { router.push("/login"); return; }
      fetchReport();
    }
  }, [authLoading, user]);

  /* ── loading / error states ── */
  if (authLoading || loading) return (
    <div style={centeredStyle}>
      <div style={{
        width: 40, height: 40, border: "3px solid rgba(255,215,0,0.2)", borderTop: "3px solid #ffd700",
        borderRadius: "50%", animation: "spin 1s linear infinite"
      }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12, fontWeight: 700, letterSpacing: 2 }}>
        {authLoading ? "AUTHENTICATING..." : "LOADING REPORT..."}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ ...centeredStyle, color: "#f43f5e", fontSize: 14, fontWeight: 700 }}>
      ⚠ {error}
    </div>
  );

  if (!report) return null;

  const {
    totalPositiveLP, totalNegativeLP, totalLP, total5xUsed, totalAirdrop, totalBooster,
    totalXaman, totalZeroRisk, totalCommunityRewards, onChainDeposits, onChainWithdrawals,
    distributedLpRewards, distributedAirdropRewards, distributedBoosterRewards,
    totalCascadeRewards, totalX1Rewards, totalCommunityBoosterRewards,
    usersWithXamanGtZero, UserWithAutopositioning, userCountzeroRisk, userCountcommunityRewards,
    totalEcosystemFee, totalAutopositioning, dailyRewards, X1RewarduserCount,
    onChainDepositsToday, onChainWithdrawalsToday, LPPositioningToday, ecosystemFeesToday,
    activeLPUsers, autopositioningWallet, onChainNegativeBalance, onChainPositiveBalance,
  } = report;

  /* ── chart datasets ── */
  const walletChartData = {
    labels: ["Net Deposits", "Withdrawals", "Airdrop", "Booster", "Primary", "Zero Risk", "Community", "AutoPos", "Eco Fee"],
    datasets: [{
      label: "USDT",
      data: [+totalPositiveLP || 0, +totalNegativeLP || 0, +totalAirdrop || 0, +totalBooster || 0,
      +totalXaman || 0, +totalZeroRisk || 0, +totalCommunityRewards || 0, +totalAutopositioning || 0, +totalEcosystemFee || 0],
      backgroundColor: ["#ffd700", "#f43f5e", "#10b981", "#6366f1", "#f97316", "#06b6d4", "#8b5cf6", "#a3e635", "#fb7185"],
      borderRadius: 8, barThickness: 22,
    }],
  };

  const onChainChartData = {
    labels: ["Transaction Deposits", "Transaction Withdrawals", "Negative Withdrawals", "Positive Deposits", "Active LP", "Fixed AutoPos"],
    datasets: [{
      label: "USDT",
      data: [+(onChainDeposits - 1500000) || 0, +onChainWithdrawals || 0,
      +onChainNegativeBalance?.extraWithdrawn || 0, +onChainPositiveBalance?.extraDeposited || 0,
      +(totalPositiveLP - autopositioningWallet?.total) || 0, +autopositioningWallet?.total || 0],
      backgroundColor: ["#10b981", "#f43f5e", "#fb7185", "#34d399", "#ffd700", "#6366f1"],
      borderRadius: 8, barThickness: 22,
    }],
  };

  const donutData = {
    labels: ["Daily Yield", "Airdrop Pool", "Booster Pool", "Team Growth", "Rank Rewards", "Community Pool"],
    datasets: [{
      data: [+distributedLpRewards || 0, +distributedAirdropRewards || 0, +distributedBoosterRewards || 0,
      +totalCascadeRewards || 0, +totalX1Rewards || 0, +totalCommunityBoosterRewards || 0],
      backgroundColor: ["#ffd700", "#10b981", "#6366f1", "#f97316", "#f43f5e", "#8b5cf6"],
      borderColor: "transparent", hoverOffset: 8,
    }],
  };

  const dailyLabels = ["X-Performance Bonus", "X-Power", "Community Booster", "Daily LP Yield", "Daily Airdrop", "Daily Boost", "Daily Cascade"];

  const dailyChartData = dailyRewards ? {
    labels: dailyLabels,
    datasets: [{
      label: "Last Distribution",
      data: [+dailyRewards.x1Rewards || 0, +dailyRewards.xPowerRewards || 0,
      +dailyRewards.communityBoosterRewards || 0, +dailyRewards.dailyRewardsLp || 0,
      +dailyRewards.dailyRewardsAirdrop || 0, +dailyRewards.dailyRewardsBoost || 0, +dailyRewards.dailyCascadeRewards || 0],
      borderColor: "#ffd700",
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
        g.addColorStop(0, "rgba(255,215,0,0.3)"); g.addColorStop(1, "rgba(255,215,0,0)");
        return g;
      },
      borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#ffd700", fill: true, tension: 0.4,
    }],
  } : null;

  const chartOpts = (yCallback) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: TOOLTIP },
    scales: { ...SCALES, y: { ...SCALES.y, ticks: { ...SCALES.y.ticks, callback: yCallback || ((v) => `$${v}`) } } },
  });

  const TABS = [
    { id: "wallet", label: "Vault Summaries", icon: Layers },
    { id: "onchain", label: "Flow Audit", icon: TrendingUp },
    { id: "distribution", label: "Reward Distributions", icon: BarChart2 },
    { id: "daily", label: "Earning Hub", icon: Clock },
  ];

  /* ──────────────────────────────────────────────────────────
     RENDER TAB CONTENT
  ────────────────────────────────────────────────────────── */

  const renderWallet = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Bar chart */}
      <ChartCard title="Wallet Balances Breakdown" badge="Lifetime Totals">
        <div style={{ height: 280 }}>
          <Bar data={walletChartData} options={chartOpts()} />
        </div>
      </ChartCard>

      {/* Cards grid */}
      <SectionHeader sub="LIFETIME BALANCES ACROSS ALL USER WALLETS">Vault Repositories</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {[
          { label: "Net Deposits", value: totalPositiveLP, count: activeLPUsers, accentColor: "#10b981" },
          { label: "Total Withdrawals", value: totalNegativeLP, accentColor: "#f43f5e" },
          { label: "Protocol Liquidity", value: totalLP, accentColor: "#ffd700" },
          { label: "5x Reward Usage", value: total5xUsed, accentColor: "#f97316" },
          { label: "Airdrop Vault", value: totalAirdrop, accentColor: "#6366f1" },
          { label: "Booster Vault", value: totalBooster, accentColor: "#8b5cf6" },
          { label: "Primary Wallet", value: totalXaman, count: usersWithXamanGtZero, accentColor: "#06b6d4" },
          { label: "Zero-Risk Vault", value: totalZeroRisk, count: userCountzeroRisk, accentColor: "#a3e635" },
          { label: "Community Rewards", value: totalCommunityRewards, count: userCountcommunityRewards, accentColor: "#fb7185" },
          { label: "Smart Auto-Positioning", value: totalAutopositioning, count: UserWithAutopositioning, accentColor: "#ffd700" },
          { label: "Ecosystem Fees", value: totalEcosystemFee, sub: `Today: ${fmt(ecosystemFeesToday?.total)} USDT`, accentColor: "#ffd700" },
        ].map((c) => (
          <MetricCard key={c.label} {...c} detailHref={DETAIL_MAP[c.label]} />
        ))}
      </div>
    </div>
  );

  const renderOnChain = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="Transactions Volume Breakdown" badge="All Time" flex="1 1 500px">
          <div style={{ height: 280 }}>
            <Bar data={onChainChartData} options={chartOpts()} />
          </div>
        </ChartCard>

        {/* Today stats mini */}
        <ChartCard title="Today's Activity" badge="Live" flex="0 0 280px">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
            {[
              { label: "Deposits Today", val: onChainDepositsToday?.total, color: "#10b981", tx: onChainDepositsToday?.txCount, users: onChainDepositsToday?.userCount },
              { label: "Withdrawals Today", val: onChainWithdrawalsToday?.total, color: "#f43f5e", tx: onChainWithdrawalsToday?.txCount, users: onChainWithdrawalsToday?.userCount },
              { label: "Eco Fee Today", val: ecosystemFeesToday?.total, color: "#ffd700", tx: ecosystemFeesToday?.txCount, users: ecosystemFeesToday?.userCount },
            ].map((item) => (
              <div key={item.label} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: item.color }}>{fmt(item.val)} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>USDT</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
                  {item.tx} txns · {item.users} users
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <SectionHeader sub="AGGREGATED PROTOCOL VOLUME DATA">Asset Flow Summary</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {[
          { label: "Transaction Deposits", value: onChainDeposits - 1500000, sub: `Today: ${fmt(onChainDepositsToday?.total)} · ${onChainDepositsToday?.txCount} txns`, accentColor: "#10b981" },
          { label: "Transaction Withdrawals", value: onChainWithdrawals, sub: `Today: ${fmt(onChainWithdrawalsToday?.total)}`, accentColor: "#f43f5e" },
          { label: "Negative Withdrawals", value: onChainNegativeBalance?.extraWithdrawn, count: onChainNegativeBalance?.userCount, accentColor: "#fb7185" },
          { label: "Positive Deposits", value: onChainPositiveBalance?.extraDeposited, count: onChainPositiveBalance?.userCount, accentColor: "#34d399" },
          { label: "Active LP", value: totalPositiveLP - (autopositioningWallet?.total || 0), count: activeLPUsers, accentColor: "#ffd700" },
          // { label: "Fixed Auto Positioning", value: autopositioningWallet?.total, count: autopositioningWallet?.userCount, accentColor: "#6366f1" },
        ].map((c) => (
          <MetricCard key={c.label} {...c} detailHref={DETAIL_MAP[c.label]} />
        ))}
      </div>
    </div>
  );

  const renderDistribution = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="Allocation Share" badge="Protocol Split" flex="0 0 360px">
          <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <Doughnut
              data={donutData}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: "72%",
                plugins: { legend: { display: false }, tooltip: TOOLTIP }
              }}
              style={{ position: "absolute", inset: 0 }}
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>Total</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>ALLOCATED</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 }}>
            {["#ffd700", "#10b981", "#6366f1", "#f97316", "#f43f5e", "#8b5cf6"].map((c, i) =>
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                {donutData.labels[i]}
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Allocation Amounts" badge="Lifetime" flex="1 1 400px">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
            {[
              { label: "Daily Yield Pool", value: distributedLpRewards, color: "#ffd700", max: Math.max(distributedLpRewards, distributedAirdropRewards, distributedBoosterRewards, totalCascadeRewards, totalX1Rewards, totalCommunityBoosterRewards) || 1 },
              { label: "Free Drop Pool", value: distributedAirdropRewards, color: "#10b981" },
              { label: "Boost Reward Pool", value: distributedBoosterRewards, color: "#6366f1" },
              { label: "Team Growth Pool", value: totalCascadeRewards, color: "#f97316" },
              { label: "Rank Performance Pool", value: totalX1Rewards, color: "#f43f5e" },
              { label: "Community Bonus Pool", value: totalCommunityBoosterRewards, color: "#8b5cf6" },
            ].map((item) => {
              const maxVal = Math.max(+distributedLpRewards || 0, +distributedAirdropRewards || 0, +distributedBoosterRewards || 0, +totalCascadeRewards || 0, +totalX1Rewards || 0, +totalCommunityBoosterRewards || 0, 1);
              const pct = Math.min(((+item.value || 0) / maxVal) * 100, 100);
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: item.color }}>{fmt(item.value)} USDT</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: 3, transition: "width 1.2s ease", boxShadow: `0 0 8px ${item.color}50` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <SectionHeader sub="TOTAL PROTOCOL-WIDE REWARD ANALYTICS">Distribution Insights</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {[
          { label: "Daily Yield Allocation", value: distributedLpRewards, accentColor: "#ffd700" },
          { label: "Airdrop Pool Allocation", value: distributedAirdropRewards, accentColor: "#10b981" },
          { label: "Booster Pool Allocation", value: distributedBoosterRewards, accentColor: "#6366f1" },
          { label: "Team Growth Allocation", value: totalCascadeRewards, accentColor: "#f97316" },
          { label: "Rank Rewards Allocation", value: totalX1Rewards, count: X1RewarduserCount, accentColor: "#f43f5e" },
          { label: "Community Reward Allocation", value: totalCommunityBoosterRewards, accentColor: "#8b5cf6" },
        ].map((c) => (
          <MetricCard key={c.label} {...c} detailHref={DETAIL_MAP[c.label]} />
        ))}
      </div>
    </div>
  );

  const renderDaily = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {dailyRewards?.date ? (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 20px",
            background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.12)",
            borderRadius: 14, width: "fit-content"
          }}>
            <Clock size={14} color="#ffd700" />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Last Distribution Date</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#ffd700", marginTop: 2 }}>
                {new Date(dailyRewards.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          {dailyChartData && (
            <ChartCard title="Daily Reward Trends" badge="Last Run">
              <div style={{ height: 280 }}>
                <Line data={{ ...dailyChartData, labels: dailyLabels }} options={chartOpts()} />
              </div>
            </ChartCard>
          )}

          {/* Total highlight */}
          <div style={{
            padding: "20px 26px", background: "linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,165,0,0.04))",
            border: "1px solid rgba(255,215,0,0.2)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Total Distributed (Last Run)</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#ffd700" }}>{fmt(dailyRewards.total)} <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>USDT</span></div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,215,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={22} color="#ffd700" />
            </div>
          </div>

          <SectionHeader sub="MOST RECENT REWARD RUN • PER POOL EARNINGS">Yield Cycle Audit</SectionHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {[
              { label: "Growth Multiplier Bonus", value: dailyRewards.x1Rewards, accentColor: "#f43f5e" },
              { label: "Network X-Power", value: dailyRewards.xPowerRewards, accentColor: "#f97316" },
              { label: "Community Booster", value: dailyRewards.communityBoosterRewards, accentColor: "#8b5cf6" },
              { label: "Daily LP Yield", value: dailyRewards.dailyRewardsLp, accentColor: "#ffd700" },
              { label: "Daily Airdrop", value: dailyRewards.dailyRewardsAirdrop, accentColor: "#10b981" },
              { label: "Daily Boost", value: dailyRewards.dailyRewardsBoost, accentColor: "#6366f1" },
              { label: "Daily Cascade", value: dailyRewards.dailyCascadeRewards, accentColor: "#06b6d4" },
              { label: "Total Daily Payout", value: dailyRewards.total, accentColor: "#ffd700" },
            ].map((c) => (
              <MetricCard key={c.label} {...c} detailHref={DETAIL_MAP[c.label]} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 700 }}>
          No daily distribution data available.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh", display: "flex", flexDirection: "column", gap: 28, fontFamily: "Inter, sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 24,
        borderBottom: "1px solid rgba(255,215,0,0.08)", position: "relative"
      }}>
        <div style={{
          position: "absolute", bottom: -1, left: 0, width: 70, height: 2,
          background: "linear-gradient(90deg,#ffd700,transparent)", boxShadow: "0 0 20px rgba(255,215,0,0.5)"
        }} />
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 800, letterSpacing: 3,
            textTransform: "uppercase", color: "rgba(255,215,0,0.45)", marginBottom: 8
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981",
              animation: "blink 2s ease-in-out infinite"
            }} />
            BEPVault Admin
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
            System <span style={{ color: "#ffd700", textShadow: "0 0 30px rgba(255,215,0,0.3)" }}>Report</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: "6px 0 0", fontWeight: 500 }}>
            Full protocol analytics across all system wallets and reward pools
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ExportUserReportButton />
          <button onClick={fetchReport}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12,
              border: "1px solid rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.05)", color: "rgba(255,215,0,0.7)",
              cursor: "pointer", fontSize: 12, fontWeight: 800, transition: "all 0.2s ease"
            }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <Tab key={t.id} label={t.label} icon={t.icon} active={activeTab === t.id}
            onClick={() => { setActiveTab(t.id); router.push(t.id === "wallet" ? "/admin/dashboard/system-report" : `/admin/dashboard/system-report?tab=${t.id}`); }} />
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "wallet" && renderWallet()}
      {activeTab === "onchain" && renderOnChain()}
      {activeTab === "distribution" && renderDistribution()}
      {activeTab === "daily" && renderDaily()}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const centeredStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  minHeight: "60vh", gap: 12,
};
