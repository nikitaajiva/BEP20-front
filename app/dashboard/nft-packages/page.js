"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaShieldAlt, FaChartLine, FaHorse, FaCoins, FaCalendarAlt, FaAward, FaBolt } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const packages = [
  {
    id: "starter", tier: "Bronze", price: 500, priceLabel: "$500 USDT",
    nft: "1 Bronze-tier Horse NFT", tokens: "5,000 bonus Toking Tokens",
    roi: "Up to 15% annual ROI", dividends: "Quarterly dividend payments",
    extras: ["Special Bronze Tier Airdrops During Major Campaigns"],
    gradient: "linear-gradient(135deg,#cd7f32,#a0522d)",
    glow: "rgba(205,127,50,0.35)", color: "#cd7f32", icon: "🥉",
  },
  {
    id: "growth", tier: "Silver", price: 1000, priceLabel: "$1,000 USDT",
    nft: "1 Silver-tier Horse NFT", tokens: "12,000 bonus Toking Tokens",
    roi: "Up to 25% annual ROI", dividends: "Monthly dividend payments",
    extras: ["Special Bronze Tier Airdrops During Major Campaigns","Invitation to Tokinghoofborn Events"],
    gradient: "linear-gradient(135deg,#c0c0c0,#808080)",
    glow: "rgba(192,192,192,0.35)", color: "#c0c0c0", icon: "🥈", popular: true,
  },
  {
    id: "premium", tier: "Gold", price: 5000, priceLabel: "$5,000 USDT",
    nft: "1 Gold-tier Horse NFT", tokens: "75,000 bonus Toking Tokens",
    roi: "Up to 35% annual ROI", dividends: "Weekly dividend payments",
    extras: ["Special Gold Tier Airdrops During Major Campaigns","Invitation to Tokinghoofborn Events","VIP Access to Conferences where Tokinghoofborn is participating"],
    gradient: "linear-gradient(135deg,#ffd700,#ff8c00)",
    glow: "rgba(255,215,0,0.4)", color: "#ffd700", icon: "🥇",
  },
];

const docs = ["Horse registration papers","Veterinary health records","Insurance documentation","Training facility contracts","Racing/breeding performance data"];

export default function NFTPackagesPage() {
  const { user, setUser, API_URL } = useAuth();
  const searchParams = useSearchParams();
  const defaultTier = searchParams.get("tier") || null;

  const [selected, setSelected] = useState(defaultTier);
  const [step, setStep] = useState(defaultTier ? 2 : 1);
  const [isActivating, setIsActivating] = useState(false);
  
  // If user already has a package, start at "Analytics" view (internal state 4)
  const [view, setView] = useState(user?.nftPackage ? "analytics" : "selection");

  const pkg = packages.find(p => p.id === selected);
  const activePkg = packages.find(p => p.id === user?.nftPackage);

  const handleActivate = async () => {
    setIsActivating(true);
    // Mock Activation - In production, this would be a real payment call
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ nftPackage: selected })
      });
      
      // Update local state for immediate feedback
      setUser({ ...user, nftPackage: selected });
      setView("analytics");
    } catch (err) {
      console.error("Activation failed", err);
    } finally {
      setIsActivating(false);
    }
  };

  const handleUpgrade = () => {
    setView("selection");
    setStep(1);
    setSelected(null);
  };

  // --- Chart Configurations ---
  const roiValue = activePkg ? parseInt(activePkg.roi.split(" ")[2]) : 0;
  
  const earningsData = {
    labels: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'],
    datasets: [
      {
        fill: true,
        label: 'Earnings ($)',
        data: activePkg?.id === 'premium' ? [1200, 1900, 1500, 2500, 3200, 4500] : activePkg?.id === 'growth' ? [500, 800, 700, 1200, 1500, 2000] : [200, 400, 300, 500, 600, 800],
        borderColor: '#ff6600',
        backgroundColor: 'rgba(255, 102, 0, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#ff6600',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        titleColor: '#ff6600',
        titleFont: { size: 13, weight: 'bold' },
        bodyColor: '#fff',
        bodyFont: { size: 12 },
        borderColor: 'rgba(255, 102, 0, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` Projected: $${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#444', font: { size: 10, weight: '700' } }
      },
      y: { display: false }
    }
  };

  const dividendData = {
    labels: ['Q1 26', 'Q2 26', 'Q3 26', 'Q4 26'],
    datasets: [
      {
        label: 'Dividends',
        data: activePkg?.id === 'premium' ? [450, 520, 480, 600] : activePkg?.id === 'growth' ? [120, 150, 140, 180] : [45, 55, 50, 65],
        backgroundColor: 'rgba(255, 102, 0, 0.6)',
        hoverBackgroundColor: '#ff6600',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        titleColor: '#ff8c00',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 102, 0, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Distribution: $${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#555', font: { size: 10, weight: '600' } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#555', font: { size: 10 } } }
    }
  };

  return (
    <AuthGuard>
      <div style={{ minHeight:"100vh", background:"#000", color:"#fff", fontFamily:"'Inter',sans-serif", padding:"40px 20px 100px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Link href="/dashboard" style={{ color:"#ff6600", fontSize:13, fontWeight:700, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:28 }}>
            ← Back to Dashboard
          </Link>

          {/* Page Header: Only show if not in analytics view or show smaller version */}
          <div style={{ textAlign:"center", marginBottom:view === "analytics" ? 32 : 48 }}>
            <div style={{ display:"inline-block", background:"rgba(255,102,0,0.15)", border:"1px solid rgba(255,102,0,0.3)", color:"#ff8c00", fontSize:11, fontWeight:800, letterSpacing:2, padding:"5px 16px", borderRadius:20, textTransform:"uppercase", marginBottom:16 }}>
              Investment Model 2
            </div>
            <h1 style={{ fontSize: view === "analytics" ? 32 : "clamp(28px,5vw,52px)", fontWeight:900, margin:"0 0 16px", background:"linear-gradient(135deg,#ffd700,#ff8c00,#ff4500)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              🐴 Horse NFT Packages
            </h1>
            {view !== "analytics" && (
              <p style={{ color:"#888", fontSize:15, maxWidth:580, margin:"0 auto", lineHeight:1.7 }}>
                Fractional interests in real, registered horses. Each NFT is legally backed with documentation,
                insurance, and professional management agreements.
              </p>
            )}
          </div>

          {/* Step Indicator: Only show during selection flow */}
          {view === "selection" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:48 }}>
              {[["1","Choose Package"],["2","Review Details"],["3","Purchase"]].map(([n,label],i)=>(
                <React.Fragment key={n}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{
                      width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                      background: step>i ? "linear-gradient(135deg,#ffd700,#ff8c00)" : step===i+1 ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.05)",
                      border: step===i+1 ? "2px solid #ff8c00" : step>i ? "2px solid #ffd700" : "2px solid rgba(255,255,255,0.1)",
                      color: step>i ? "#000" : step===i+1 ? "#ff8c00" : "#555",
                      fontSize:14, fontWeight:900,
                    }}>{step>i+1 ? "✓" : n}</div>
                    <span style={{ fontSize:10, color: step===i+1 ? "#ff8c00" : "#555", fontWeight:700, whiteSpace:"nowrap" }}>{label}</span>
                  </div>
                  {i<2 && <div style={{ width:60, height:2, background: step>i+1 ? "linear-gradient(to right,#ffd700,#ff8c00)" : "rgba(255,255,255,0.06)", marginBottom:22 }}/>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {view === "analytics" && activePkg && (
            <div className="animate__animated animate__fadeIn">
              <div style={{ background: "rgba(255,102,0,0.02)", border: "1px solid rgba(255,102,0,0.1)", borderRadius: 32, padding: 40, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,102,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8 }}>My Horse NFT Hub</h2>
                    <p style={{ color: "#888", fontSize: 14 }}>Real-time performance and ownership statistics for your {activePkg.tier} asset.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ padding: "8px 16px", background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,255,0,0.2)", borderRadius: 10, color: "#00ff00", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, background: "#00ff00", borderRadius: "50%", display: "inline-block" }}></span> ACTIVE
                    </div>
                    <button onClick={handleUpgrade} style={{ padding: "12px 24px", background: "rgba(255,102,0,0.1)", border: "1px solid rgba(255,102,0,0.3)", borderRadius: 14, color: "#ff8c00", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.3s" }}>
                      🚀 Upgrade Package
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
                  
                  {/* Left Column: Key Stats & Distribution */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* ROI Progress Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,102,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6600" }}>
                            <FaChartLine size={16} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#ccc" }}>Annual ROI Target</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{roiValue}%</span>
                      </div>
                      <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ 
                          width: `${roiValue}%`, 
                          height: "100%", 
                          background: "linear-gradient(90deg, #ff6600, #ffcc00)", 
                          boxShadow: "0 0 15px rgba(255,102,0,0.4)",
                          position: "relative"
                        }}>
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", animation: "shimmer 2s infinite" }}></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", fontWeight: 700 }}>
                        <span>PHASE 1 ACTIVE</span>
                        <span style={{ color: "#ff6600" }}>GOAL: {roiValue + 10}%</span>
                      </div>
                    </div>

                    {/* Dividend Distribution Bar Chart */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,102,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6600" }}>
                          <FaShieldAlt size={16} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#ccc" }}>Dividend History</span>
                      </div>
                      <div style={{ height: 120 }}>
                        <Bar data={dividendData} options={barOptions} />
                      </div>
                    </div>

                    {/* Tokens Status */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24, display: "flex", gap: 20, alignItems: "center" }}>
                      <div style={{ width: 64, height: 64 }}>
                        <Doughnut 
                          data={{
                            datasets: [{
                              data: [85, 15],
                              backgroundColor: ['#ff6600', 'rgba(255,255,255,0.05)'],
                              borderWidth: 0,
                              cutout: '80%'
                            }]
                          }}
                          options={{ plugins: { tooltip: { enabled: false } }, maintainAspectRatio: false }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{activePkg.tokens.split(" ")[0]}</div>
                        <div style={{ fontSize: 11, color: "#666", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Bonus Asset Tokens</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Earning Velocity Graph */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Earning Velocity</h4>
                        <p style={{ fontSize: 12, color: "#666" }}>Performance projection for next 6 months</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#ff6600" }}>+18.2%</div>
                        <div style={{ fontSize: 10, color: "#00ff00", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          <FaBolt size={8} /> BULLISH
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minHeight: 250 }}>
                      <Line data={earningsData} options={chartOptions} />
                    </div>
                    
                    <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "rgba(255,102,0,0.05)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,102,0,0.1)" }}>
                        <div style={{ fontSize: 10, color: "#666", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Daily Yield</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>0.041%</div>
                      </div>
                      <div style={{ background: "rgba(255,102,0,0.05)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,102,0,0.1)" }}>
                        <div style={{ fontSize: 10, color: "#666", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Est. Payout</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>$84.20</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Details */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <FaHorse color="#ff6600" /> Asset Information
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[["Horse NFT", activePkg.nft], ["Ownership Type", "Fractional Interest"], ["Legal Status", "Fully Documented"], ["Insurance", "A+ Rated Coverage"]].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#666" }}>{k}</span>
                          <span style={{ color: "#fff", fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <FaAward color="#ff6600" /> Active Benefits
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {activePkg.extras.map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "#bbb", lineHeight: 1.5 }}>
                          <span style={{ color: "#ff6600" }}>★</span> {e}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SELECTION FLOW */}
          {view === "selection" && (
            <>
              {/* STEP 1: Choose Package */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:24, textAlign:"center" }}>
                    Select Your Horse NFT Package
                  </h2>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, marginBottom:40 }}>
                    {packages.map((p)=>(
                      <div key={p.id} onClick={()=>{ setSelected(p.id); setStep(2); }}
                        style={{
                          position:"relative", background:"rgba(8,4,0,0.8)", border:`1px solid ${selected===p.id ? p.color : "rgba(255,255,255,0.08)"}`,
                          borderRadius:24, overflow:"hidden", cursor:"pointer",
                          transition:"all 0.35s ease", transform: p.popular ? "scale(1.03)" : "none",
                          boxShadow: selected===p.id ? `0 16px 48px ${p.glow}` : "none",
                          opacity: user?.nftPackage === p.id ? 0.6 : 1,
                          pointerEvents: user?.nftPackage === p.id ? "none" : "auto"
                        }}
                      >
                        {user?.nftPackage === p.id && (
                          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ background:"#ff6600", color:"#fff", padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:900 }}>CURRENTLY ACTIVE</div>
                          </div>
                        )}
                        {p.popular && (
                          <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", background:p.gradient, color:"#000", fontSize:10, fontWeight:900, padding:"4px 18px", borderRadius:"0 0 12px 12px", whiteSpace:"nowrap", zIndex:5 }}>
                            ⭐ Most Popular
                          </div>
                        )}
                        {/* Tier header */}
                        <div style={{ background:p.gradient, padding:"24px 20px 18px", display:"flex", alignItems:"center", gap:14 }}>
                          <span style={{ fontSize:36 }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize:10, fontWeight:800, color:"#000", opacity:0.7, letterSpacing:1, textTransform:"uppercase" }}>{p.tier} Tier</div>
                            <div style={{ fontSize:18, fontWeight:900, color:"#000" }}>{p.tier === "Bronze" ? "Starter" : p.tier === "Silver" ? "Growth" : "Premium"} Package</div>
                          </div>
                        </div>
                        {/* Price */}
                        <div style={{ textAlign:"center", padding:"20px 20px 8px", fontSize:36, fontWeight:900, color:p.color, textShadow:`0 0 20px ${p.color}` }}>
                          {p.priceLabel}
                        </div>
                        {/* Features */}
                        <ul style={{ listStyle:"none", padding:"0 20px", margin:"0 0 16px", display:"flex", flexDirection:"column", gap:10 }}>
                          {[["🐴",p.nft],["🪙",p.tokens],["📊",p.roi+" from earnings"],["💰",p.dividends],...p.extras.map(e=>["✦",e])].map(([icon,text],i)=>(
                            <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:12, color:"#ccc", lineHeight:1.4 }}>
                              <span style={{ color:p.color, flexShrink:0 }}>{icon}</span>{text}
                            </li>
                          ))}
                        </ul>
                        <div style={{ padding:"0 20px 20px" }}>
                          <button style={{ width:"100%", padding:"13px", background:p.gradient, border:"none", borderRadius:12, fontSize:13, fontWeight:900, color:"#000", cursor:"pointer", boxShadow:`0 4px 20px ${p.glow}` }}>
                            Select {p.tier} Package →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Legal docs */}
                  <div style={{ background:"rgba(255,102,0,0.04)", border:"1px solid rgba(255,102,0,0.12)", borderRadius:18, padding:"24px", textAlign:"center" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#ff8c00", marginBottom:16 }}>📋 Documentation Included With Every NFT</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
                      {docs.map((d,i)=>(
                        <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 14px", fontSize:12, color:"#bbb", display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ color:"#ff6600" }}>✓</span>{d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Review Details */}
              {step === 2 && pkg && (
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:24, textAlign:"center" }}>
                    Review Your {pkg.tier} Package
                  </h2>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:32 }}>
                    {/* Package summary */}
                    <div style={{ background:"rgba(8,4,0,0.8)", border:`1px solid ${pkg.color}44`, borderRadius:20, overflow:"hidden" }}>
                      <div style={{ background:pkg.gradient, padding:"20px", display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:32 }}>{pkg.icon}</span>
                        <div>
                          <div style={{ fontSize:10, color:"#000", opacity:0.7, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>{pkg.tier} Tier</div>
                          <div style={{ fontSize:20, fontWeight:900, color:"#000" }}>{pkg.priceLabel}</div>
                        </div>
                      </div>
                      <div style={{ padding:"20px" }}>
                        {[["NFT Asset",pkg.nft],["Bonus Tokens",pkg.tokens],["Annual ROI",pkg.roi],["Dividends",pkg.dividends]].map(([k,v])=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
                            <span style={{ color:"#666" }}>{k}</span>
                            <span style={{ color:"#fff", fontWeight:700 }}>{v}</span>
                          </div>
                        ))}
                        {pkg.extras.map((e,i)=>(
                          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:12, color:"#ccc" }}>
                            <span style={{ color:pkg.color }}>✦</span>{e}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ROI Projections */}
                    <div style={{ background:"rgba(255,102,0,0.04)", border:"1px solid rgba(255,102,0,0.12)", borderRadius:20, padding:"24px" }}>
                      <div style={{ fontSize:15, fontWeight:800, color:"#ff8c00", marginBottom:20 }}>📊 ROI Projections</div>
                      {[1,2,3,5].map(yr=>{
                        const rate = pkg.id==="starter"?0.15:pkg.id==="growth"?0.25:0.35;
                        const val = (pkg.price * Math.pow(1+rate,yr)).toFixed(0);
                        return (
                          <div key={yr} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ fontSize:13, color:"#666" }}>{yr} Year{yr>1?"s":""}</span>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:16, fontWeight:800, color:pkg.color }}>${parseInt(val).toLocaleString()}</div>
                              <div style={{ fontSize:10, color:"#555" }}>+${(parseInt(val)-pkg.price).toLocaleString()} earned</div>
                            </div>
                          </div>
                        );
                      })}
                      <p style={{ fontSize:11, color:"#555", marginTop:16, lineHeight:1.6 }}>
                        *Projections based on stated ROI rates. Actual returns may vary based on platform performance.
                      </p>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:14 }}>
                    <button onClick={()=>setStep(1)} style={{ flex:1, padding:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#aaa", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                      ← Change Package
                    </button>
                    <button onClick={()=>setStep(3)} style={{ flex:2, padding:14, background:pkg.gradient, border:"none", borderRadius:12, color:"#000", fontSize:14, fontWeight:900, cursor:"pointer", boxShadow:`0 8px 24px ${pkg.glow}` }}>
                      Proceed to Purchase →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Purchase */}
              {step === 3 && pkg && (
                <div style={{ maxWidth:560, margin:"0 auto" }}>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:24, textAlign:"center" }}>
                    Complete Your Purchase
                  </h2>

                  {/* Order Summary */}
                  <div style={{ background:"rgba(8,4,0,0.8)", border:`1px solid ${pkg.color}44`, borderRadius:20, overflow:"hidden", marginBottom:24 }}>
                    <div style={{ background:pkg.gradient, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:28 }}>{pkg.icon}</span>
                      <div>
                        <div style={{ fontSize:10, color:"#000", opacity:0.7, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>{pkg.tier} Package — Order Summary</div>
                        <div style={{ fontSize:20, fontWeight:900, color:"#000" }}>{pkg.priceLabel}</div>
                      </div>
                    </div>
                    <div style={{ padding:"16px 20px" }}>
                      {[["Package",`${pkg.tier} Horse NFT Package`],["Price",pkg.priceLabel],["NFT",pkg.nft],["Bonus",pkg.tokens],["Annual ROI",pkg.roi],["Dividends",pkg.dividends]].map(([k,v])=>(
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
                          <span style={{ color:"#666" }}>{k}</span>
                          <span style={{ color:"#fff", fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", fontSize:16, fontWeight:900 }}>
                        <span style={{ color:"#888" }}>Total Due</span>
                        <span style={{ color:pkg.color }}>{pkg.priceLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment info */}
                  <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:14, padding:"16px 20px", marginBottom:24 }}>
                    <div style={{ fontSize:13, color:"#ffd700", fontWeight:700, marginBottom:6 }}>💳 Payment Method: USDT (BEP20)</div>
                    <p style={{ fontSize:12, color:"#666", margin:0, lineHeight:1.7 }}>
                      Payments processed via your connected wallet. Ensure your wallet holds sufficient USDT balance before proceeding.
                      NFT will be delivered to your registered wallet address within 24 hours of payment confirmation.
                    </p>
                  </div>

                  <div style={{ background:"rgba(255,102,0,0.04)", border:"1px solid rgba(255,102,0,0.1)", borderRadius:14, padding:"16px 20px", marginBottom:24, fontSize:12, color:"#777", lineHeight:1.7 }}>
                    🔒 By purchasing, you confirm that you have read and agree to the Tokinghoofborn Terms & Conditions.
                    Each NFT represents a fractional ownership interest. Toking Hoofborn LLC is registered in the USA (Reg. No. 10308124).
                  </div>

                  <div style={{ display:"flex", gap:14 }}>
                    <button onClick={()=>setStep(2)} style={{ flex:1, padding:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#aaa", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      ← Back
                    </button>
                    <button 
                      onClick={handleActivate}
                      disabled={isActivating}
                      style={{ flex:2, padding:14, background:pkg.gradient, border:"none", borderRadius:12, color:"#000", fontSize:15, fontWeight:900, cursor:"pointer", boxShadow:`0 8px 32px ${pkg.glow}`, opacity: isActivating ? 0.7 : 1 }}
                    >
                      {isActivating ? "🔄 Activating Asset..." : `🐴 Confirm Purchase — ${pkg.priceLabel}`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

