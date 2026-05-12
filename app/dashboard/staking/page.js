"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaClock, FaRedo, FaCoins, FaUnlock, FaChartBar, FaChartLine, FaInfoCircle, FaShieldAlt, FaRocket, FaHistory, FaBolt, FaArrowUp } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const tiers = [
  { days: 30,  min: 5,  max: 10, badge: "Starter",  color: "#ff8c00", description: "Perfect for first-time stakers." },
  { days: 90,  min: 11, max: 18, badge: "Growth",   color: "#ff6600", description: "Balance between flexibility and yield." },
  { days: 180, min: 19, max: 22, badge: "Advanced", color: "#ff4500", description: "Maximum yield for committed investors." },
  { days: 365, min: 23, max: 28, badge: "Premium",  color: "#e63200", description: "Top-tier APY with maximum compounding." },
];

const card = {
  background: "rgba(255,102,0,0.04)",
  border: "1px solid rgba(255,102,0,0.1)",
  borderRadius: 20,
  padding: "28px 24px",
  marginBottom: 24,
};

export default function StakingPage() {
  const { user, updateMe } = useAuth();
  const [view, setView] = useState("selection"); // selection or analytics
  const [selectedTier, setSelectedTier] = useState(null);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  
  const tier = tiers.find((t) => t.days === selectedTier);

  // Sync view state with user data
  useEffect(() => {
    if (user?.stakingPlan?.days) {
      console.log("Staking Plan Detected:", user.stakingPlan);
      setView("analytics");
    }
  }, [user]);

  const activePlan = user?.stakingPlan;
  // Loose matching for tier lookup to prevent syncing screen lock
  const activeTier = tiers.find(t => 
    t.days == activePlan?.days || 
    Number(t.days) === Number(activePlan?.days)
  );

  const handleStake = async () => {
    const parsedAmount = parseFloat(amount);
    if (!selectedTier || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid staking amount.");
      return;
    }
    
    setIsStaking(true);
    try {
      const result = await updateMe({
        stakingPlan: {
          amount: parsedAmount,
          days: selectedTier,
          startDate: new Date()
        }
      });
      
      if (result.success) {
        // Force reload to sync all context data
        window.location.reload();
      } else {
        alert(result.error || "Failed to update staking plan.");
      }
    } catch (error) {
      console.error("Staking failed:", error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUpgrade = () => {
    setView("selection");
    setSelectedTier(activePlan?.days);
  };

  // --- Chart Configurations ---
  const apyChartData = {
    labels: tiers.map(t => `${t.days}D`),
    datasets: [
      {
        label: 'Min APY %',
        data: tiers.map(t => t.min),
        backgroundColor: 'rgba(255, 102, 0, 0.4)',
        borderColor: '#ff6600',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Max APY %',
        data: tiers.map(t => t.max),
        backgroundColor: 'rgba(255, 215, 0, 0.4)',
        borderColor: '#ffd700',
        borderWidth: 1,
        borderRadius: 8,
      }
    ],
  };

  // --- Dynamic Chart Calculations ---
  const getCompoundedData = (apy, customAmount) => {
    const principal = parseFloat(customAmount || amount || 0);
    if (!principal) return [0, 0, 0, 0, 0];
    const totalDays = (view === 'analytics' ? activePlan?.days : tier?.days) || 30;
    const intervals = [0, 0.25, 0.5, 0.75, 1];
    
    return intervals.map(fraction => {
      const days = totalDays * fraction;
      const ratePerDay = apy / 100 / 365;
      return (principal * Math.pow(1 + ratePerDay, days)).toFixed(6);
    });
  };

  const getChartLabels = () => {
    const totalDays = (view === 'analytics' ? activePlan?.days : tier?.days) || 30;
    if (totalDays <= 90) {
      return [0, 0.25, 0.5, 0.75, 1].map(f => `Day ${Math.round(totalDays * f)}`);
    }
    return [0, 0.25, 0.5, 0.75, 1].map(f => `Month ${Math.round((totalDays / 30) * f)}`);
  };

  const projectionData = {
    labels: getChartLabels(),
    datasets: [
      {
        label: `Min Yield`,
        data: getCompoundedData(
          view === 'analytics' ? activeTier?.min : tier?.min || 0,
          view === 'analytics' ? activePlan?.amount : amount
        ),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: `Max Yield`,
        data: getCompoundedData(
          view === 'analytics' ? activeTier?.max : tier?.max || 0,
          view === 'analytics' ? activePlan?.amount : amount
        ),
        fill: true,
        borderColor: '#ff6600',
        backgroundColor: 'rgba(255, 102, 0, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#ff6600',
        pointHoverRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        titleColor: '#ff6600',
        borderColor: 'rgba(255, 102, 0, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Balance: ${ctx.raw} TOKING`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#444', font: { size: 9, weight: '700' } } 
      },
      y: { 
        grid: { color: 'rgba(255,255,255,0.03)' }, 
        ticks: { color: '#444', font: { size: 9 } },
        grace: '10%'
      }
    }
  };

  return (
    <AuthGuard>
      <div style={{ minHeight:"100vh", background:"#000", color:"#fff", fontFamily:"'Inter',sans-serif", padding:"40px 20px 100px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Link href="/dashboard" style={{ color:"#ff6600", fontSize:13, fontWeight:700, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:28 }}>
            ← Back to Dashboard
          </Link>

          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ display:"inline-block", background:"rgba(255,102,0,0.15)", border:"1px solid rgba(255,102,0,0.3)", color:"#ff8c00", fontSize:11, fontWeight:800, letterSpacing:2, padding:"5px 16px", borderRadius:20, textTransform:"uppercase", marginBottom:16 }}>
              Investment Model 1
            </div>
            <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, margin:"0 0 16px", background:"linear-gradient(135deg,#ffd700,#ff8c00,#ff4500)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              🔥 Token Staking
            </h1>
            <p style={{ color:"#888", fontSize:15, maxWidth:560, margin:"0 auto", lineHeight:1.7 }}>
              Secure the network and earn premium yields with flexible lock-up options. 
              Our dynamic APY engine ensures sustainable returns through multi-stream revenue sharing.
            </p>
          </div>

          {/* ANALYTICS VIEW */}
          {view === "analytics" && activePlan && (
            activeTier ? (
              <div className="animate__animated animate__fadeIn">
              <div style={{ background: "rgba(255,102,0,0.02)", border: "1px solid rgba(255,102,0,0.1)", borderRadius: 32, padding: 40, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,102,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Staking Dashboard</h2>
                    <p style={{ color: "#888", fontSize: 14 }}>Real-time growth and performance for your locked assets.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ padding: "8px 16px", background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,255,0,0.2)", borderRadius: 10, color: "#00ff00", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, background: "#00ff00", borderRadius: "50%", display: "inline-block" }}></span> STAKING ACTIVE
                    </div>
                    <button onClick={handleUpgrade} style={{ padding: "12px 24px", background: "rgba(255,102,0,0.1)", border: "1px solid rgba(255,102,0,0.3)", borderRadius: 14, color: "#ff8c00", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.3s" }}>
                      🚀 Restake / Upgrade
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
                  
                  {/* Left Column: Core Stats */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Active Stake Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,102,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6600" }}>
                            <FaShieldAlt size={16} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#ccc" }}>Active Stake</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{activePlan.amount.toLocaleString()} TOKING</span>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1, background: "rgba(255,102,0,0.05)", padding: 12, borderRadius: 12 }}>
                          <div style={{ fontSize: 10, color: "#666", fontWeight: 800, marginBottom: 4 }}>LOCK PERIOD</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{activePlan.days} Days</div>
                        </div>
                        <div style={{ flex: 1, background: "rgba(255,102,0,0.05)", padding: 12, borderRadius: 12 }}>
                          <div style={{ fontSize: 10, color: "#666", fontWeight: 800, marginBottom: 4 }}>APY RANGE</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#ff6600" }}>{activeTier.min}% - {activeTier.max}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#ccc" }}>Lock-up Progress</span>
                        <span style={{ fontSize: 12, color: "#666" }}>Started: {new Date(activePlan.startDate).toLocaleDateString()}</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ width: "12%", height: "100%", background: "linear-gradient(90deg, #ff6600, #ffcc00)", boxShadow: "0 0 10px rgba(255,102,0,0.5)" }}></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", fontWeight: 700 }}>
                        <span>Day 4 of {activePlan.days}</span>
                        <span>88% Remaining</span>
                      </div>
                    </div>

                    {/* Estimated Rewards */}
                    <div style={{ background: "rgba(255,102,0,0.05)", border: "1px solid rgba(255,102,0,0.1)", padding: 24, borderRadius: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <FaBolt color="#ffd700" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Estimated Rewards</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#ff8c00" }}>+{(activePlan.amount * activeTier.max / 100 * activePlan.days / 365).toFixed(4)} TOKING</div>
                      <p style={{ fontSize: 11, color: "#666", margin: "4px 0 0" }}>Projected total by {new Date(new Date(activePlan.startDate).getTime() + activePlan.days * 86400000).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Right Column: Earnings Velocity */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Growth Velocity</h4>
                        <p style={{ fontSize: 12, color: "#666" }}>Projected compounding growth curve</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#00ff00", fontWeight: 800 }}>▲ PERFORMANCE OPTIMAL</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minHeight: 250 }}>
                      <Line data={projectionData} options={chartOptions} />
                    </div>
                    <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, color: "#666", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Daily Yield</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{(activeTier.max / 365).toFixed(4)}%</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, color: "#666", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Est. Payout</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{(activePlan.amount * activeTier.max / 100 / 365).toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:14, padding:"16px 20px" }}>
                  <div style={{ fontSize:13, color:"#ffd700", fontWeight:700, marginBottom:6, display: "flex", alignItems: "center", gap: 8 }}>
                    <FaInfoCircle size={14} /> Automatic Rewards & Withdrawal
                  </div>
                  <p style={{ fontSize:12, color:"#666", margin:0, lineHeight:1.7 }}>
                    Your rewards are distributed every 24 hours and automatically compounded for maximum efficiency. 
                    Principal and rewards can be withdrawn instantly after the lock-up period expires. 
                    Lock-up ends on: <strong>{new Date(new Date(activePlan.startDate).getTime() + activePlan.days * 86400000).toLocaleDateString()}</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
              <div style={card}>
                <h2 style={{ color: "#fff" }}>Syncing Staking Data...</h2>
                <p style={{ color: "#888" }}>Found plan for {activePlan?.amount} TOKING, matching tier settings...</p>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8, fontSize: 11, color: "#666", marginTop: 10 }}>
                  DEBUG: Days={activePlan?.days} | Tiers={tiers.map(t => t.days).join(", ")}
                </div>
                <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: "10px 20px", background: "#ff6600", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer" }}>
                  Force Sync Analytics
                </button>
              </div>
            )
          )}

          {/* SELECTION FLOW */}
          {view === "selection" && (
            <>
              {/* Step 1 */}
              <div style={card}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:6 }}>Step 1 — Choose Your Lock Period</h2>
                <p style={{ fontSize:13, color:"#666", marginBottom:24 }}>Select how long to stake. Longer periods = higher APY.</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
                  {tiers.map((t)=>(
                    <div key={t.days} onClick={()=>setSelectedTier(t.days)} style={{
                      background: selectedTier===t.days ? `rgba(255,102,0,0.1)` : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedTier===t.days ? t.color : "rgba(255,255,255,0.06)"}`,
                      borderRadius:16, padding:"18px 14px", cursor:"pointer", textAlign:"center",
                      transition:"all 0.3s ease", transform: selectedTier===t.days ? "translateY(-4px)" : "none",
                      boxShadow: selectedTier===t.days ? `0 8px 24px ${t.color}33` : "none",
                    }}>
                      <div style={{ display:"inline-block", background:t.color, color:"#000", fontSize:9, fontWeight:900, padding:"2px 10px", borderRadius:20, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>{t.badge}</div>
                      <div style={{ fontSize:44, fontWeight:900, color:t.color, lineHeight:1 }}>{t.days}</div>
                      <div style={{ fontSize:9, color:"#555", letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>DAYS</div>
                      <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:3 }}>{t.min}% – {t.max}%</div>
                      <div style={{ fontSize:9, color:"#666", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>APY</div>
                      <p style={{ fontSize:11, color:"#777", lineHeight:1.4, margin:0 }}>{t.description}</p>
                      {selectedTier===t.days && <div style={{ marginTop:10, fontSize:11, color:t.color, fontWeight:700 }}>✓ Selected</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ ...card, opacity: selectedTier ? 1 : 0.4 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:6 }}>Step 2 — Enter Stake Amount</h2>
                <p style={{ fontSize:13, color:"#666", marginBottom:20 }}>How many Toking Tokens would you like to lock?</p>
                
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ position:"relative" }}>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseFloat(val) >= 0) {
                            setAmount(val);
                          }
                        }} 
                        disabled={!selectedTier}
                        style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,102,0,0.25)", borderRadius:12, color:"#fff", fontSize:24, fontWeight:900, padding:"18px 80px 18px 20px", outline:"none", boxSizing:"border-box", transition: "0.3s" }}/>
                      <span style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", color:"#ff6600", fontWeight:900, fontSize:14 }}>TOKING</span>
                    </div>
                    
                    {/* Instant Feedback Stats */}
                    <div style={{ marginTop:20, background:"rgba(255,102,0,0.04)", border:"1px solid rgba(255,102,0,0.15)", borderRadius:16, padding:"20px" }}>
                      <div style={{ fontSize:12, fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Live Earnings Preview ({tier?.days || "—"} Days)</div>
                      
                      <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap:20, marginBottom: 20 }}>
                        {[["Minimum Return", tier?.min || 0], ["Maximum Return", tier?.max || 0]].map(([label, pct], idx) => {
                          const est = (parseFloat(amount || 0) * pct / 100 * (tier?.days || 0) / 365).toFixed(6);
                          return (
                            <div key={label}>
                              <div style={{ fontSize:11, color:"#888", marginBottom: 4 }}>{label} ({pct}%)</div>
                              <div style={{ fontSize:22, fontWeight:900, color: idx === 0 ? "#fff" : "#ff8c00" }}>
                                {est} <span style={{ fontSize: 10, opacity: 0.5 }}>TOKING</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Yield Bar */}
                      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ 
                          width: amount && tier ? `${Math.min((tier.max / 28) * 100, 100)}%` : "0%", 
                          height: "100%", 
                          background: "linear-gradient(90deg, #ff6600, #ffd700)", 
                          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 0 10px rgba(255,102,0,0.3)"
                        }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Side Tip Card */}
                  <div style={{ width: 220, background: "rgba(255,102,0,0.06)", border: "1px dashed rgba(255,102,0,0.2)", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#ff8c00", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <FaChartLine size={12} /> Optimization Tip
                    </div>
                    <p style={{ fontSize: 11, color: "#888", margin: 0, lineHeight: 1.6 }}>
                      {selectedTier === 365 
                        ? "You are already maximizing your APY! Your tokens are working at the highest possible efficiency." 
                        : "Switching to a longer lock-up period can increase your daily reward velocity by up to 2.5x."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ ...card, opacity: selectedTier && amount ? 1 : 0.4 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:20 }}>Step 3 — Confirm Your Stake</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
                  {[["Lock Period", tier ? `${tier.days} days (${tier.badge})` : "—"],["APY Range", tier ? `${tier.min}% – ${tier.max}%` : "—"],["Stake Amount", amount ? `${amount} TOKING` : "—"],["Daily Rewards","Automatic every 24 hours"],["Unlock Date", tier && amount ? new Date(Date.now()+tier.days*86400000).toLocaleDateString() : "—"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize:13, color:"#666" }}>{k}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleStake}
                  disabled={!selectedTier || !amount || isStaking} 
                  style={{
                    width:"100%", padding:16,
                    background: selectedTier && amount ? "linear-gradient(135deg,#ffd700,#ff8c00,#ff4500)" : "rgba(255,255,255,0.06)",
                    border:"none", borderRadius:14, color: selectedTier && amount ? "#000" : "#444",
                    fontSize:15, fontWeight:900, cursor: selectedTier && amount ? "pointer" : "not-allowed",
                    boxShadow: selectedTier && amount ? "0 8px 32px rgba(255,102,0,0.4)" : "none",
                    opacity: isStaking ? 0.7 : 1
                  }}
                >
                  {isStaking ? "🔄 Processing Stake..." : `🔥 Stake ${amount ? `${amount} TOKING` : "Now"}`}
                </button>
                <p style={{ fontSize:11, color:"#555", textAlign:"center", marginTop:12 }}>
                  Funds are locked until the lock-up period ends. Daily rewards start immediately.
                </p>
              </div>

              <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:14, padding:"16px 20px" }}>
                <div style={{ fontSize:13, color:"#ffd700", fontWeight:700, marginBottom:6, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaInfoCircle size={14} /> Revenue Streams & APY Sustainability
                </div>
                <p style={{ fontSize:12, color:"#666", margin:0, lineHeight:1.7 }}>
                  Returns are generated through a diversified model including platform revenue sharing, trading fees, 
                  and NFT marketplace activity. APY rates adjust dynamically based on Total Value Locked (TVL) 
                  to ensure long-term ecosystem health.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
