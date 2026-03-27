"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

// ── Animated Step Connector SVG ──────────────────────────────────────────────
const StepConnector = () => (
  <svg width="60" height="2" style={{ margin: "0 0.5rem", opacity: 0.3, flexShrink: 0 }}>
    <line x1="0" y1="1" x2="60" y2="1" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="6,4" >
      <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
    </line>
  </svg>
);

// ── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({ num, icon, title, desc, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{
      flex: "1 1 220px", minWidth: "200px",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.1)",
      borderRadius: "20px", padding: "2.2rem 1.8rem", textAlign: "center",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: "all 0.7s ease",
      position: "relative", overflow: "hidden",
    }}>
      {/* Step number background */}
      <div style={{ position:"absolute", top:-20, right:-10, fontSize:"6rem", fontWeight:900, color:"rgba(255,215,0,0.04)", lineHeight:1, userSelect:"none" }}>{num}</div>
      {/* Icon circle */}
      <div style={{ width:70, height:70, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15))", border:"1px solid rgba(255,215,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.4rem", boxShadow:"0 0 20px rgba(255,215,0,0.15)" }}>
        <i className={icon} style={{ fontSize:"1.9rem", color:"#ffd700" }} />
      </div>
      <div style={{ background:"linear-gradient(135deg,#ffd700,#ff8c00)", width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.2rem", fontWeight:900, color:"#000", fontSize:"0.9rem" }}>{num}</div>
      <h3 style={{ color:"#fff", fontSize:"1.15rem", fontWeight:800, marginBottom:"0.7rem" }}>{title}</h3>
      <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.92rem", lineHeight:1.6, margin:0 }}>{desc}</p>
      {/* Bottom glow */}
      <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"60%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.4),transparent)" }} />
    </div>
  );
};

// ── Animated Flow Chart ──────────────────────────────────────────────────────
const FlowChart = () => {
  const [active, setActive] = useState(0);
  const steps = ["Deposit BNB", "Pool Allocation", "Liquidity Position", "Yield Generation", "Daily Payout"];
  
  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,215,0,0.1)", borderRadius:"20px", padding:"2rem", marginTop:"4rem" }}>
      <div style={{ textAlign:"center", color:"rgba(255,255,255,0.5)", fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"1.5rem" }}>Live BNB Flow Simulation</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:"0.5rem" }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              padding:"0.6rem 1.2rem", borderRadius:"20px", fontSize:"0.82rem", fontWeight:700, transition:"all 0.5s",
              background: i === active ? "linear-gradient(135deg,#ffd700,#ff8c00)" : "rgba(255,215,0,0.06)",
              color: i === active ? "#000" : "rgba(255,255,255,0.5)",
              transform: i === active ? "scale(1.1)" : "scale(1)",
              boxShadow: i === active ? "0 4px 20px rgba(255,215,0,0.4)" : "none",
              border: i === active ? "none" : "1px solid rgba(255,215,0,0.1)",
            }}>
              {s}
            </div>
            {i < steps.length - 1 && <StepConnector />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { num:1, icon:"ri-user-add-line", title:"Create Your Account", desc:"Sign up in under 60 seconds. Your secure BEPVault dashboard is ready immediately, complete with real-time portfolio tracking." },
    { num:2, icon:"ri-send-plane-2-line", title:"Deposit BEP20 BNB", desc:"Send BEP20 BNB from your wallet. Your deposit is instantly verified on-chain and allocated to active liquidity pools." },
    { num:3, icon:"ri-water-flash-line", title:"Provide Liquidity", desc:"Your BNB powers high-volume DEX pools across the Binance Smart Chain, stabilizing markets and earning pool fees." },
    { num:4, icon:"ri-coins-line", title:"Earn Daily Rewards", desc:"Watch BNB rewards compound daily at up to 0.6%. Claim, reinvest, or withdraw — the choice is always yours, always instant." },
  ];

  return (
    <section id="how-it-works" style={{ padding: "100px 0", background: "rgba(255,215,0,0.015)", position: "relative" }}>
      <div style={{ position:"absolute", bottom:"10%", left:"-5%", width:"400px", height:"400px", background:"radial-gradient(circle,rgba(255,215,0,0.05) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />

      <div className="container">
        <div style={{ textAlign:"center", marginBottom:"5rem" }}>
          <span style={{ background:"rgba(255,215,0,0.1)", color:"#ffd700", border:"1px solid rgba(255,215,0,0.25)", borderRadius:"30px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px" }}>How It Works</span>
          <h2 style={{ fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:900, color:"#fff", marginTop:"1rem", lineHeight:1.2 }}>
            Up and Earning in <span style={{ color:"#ffd700" }}>4 Simple Steps</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"1.1rem", maxWidth:"560px", margin:"1rem auto 0", lineHeight:1.65 }}>
            Getting started with BEPVault is designed to be effortless, even for DeFi beginners.
          </p>
        </div>

        <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
          {steps.map((s, i) => <StepCard key={s.num} {...s} delay={i * 150} />)}
        </div>

        <FlowChart />

        <div style={{ textAlign:"center", marginTop:"4rem" }}>
          <Link href="/sign-up" style={{ textDecoration:"none" }}>
            <button style={{
              background:"linear-gradient(135deg,#ffd700,#ff8c00)", color:"#000",
              border:"none", padding:"1.1rem 3rem", borderRadius:"8px",
              fontWeight:900, fontSize:"1.1rem", cursor:"pointer",
              boxShadow:"0 8px 30px rgba(255,215,0,0.35)", transition:"all 0.3s",
            }}
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 14px 40px rgba(255,215,0,0.55)"; }}
            onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(255,215,0,0.35)"; }}>
              Start Your BNB Journey →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default HowItWorksSection;
