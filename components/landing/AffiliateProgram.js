"use client";
import React, { useState, useRef, useEffect } from "react";

// ── Animated Reward Tier Card ───────────────────────────────────────────────
const TierCard = ({ level, label, bonus, icon, color, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${vis ? color + "40" : "rgba(255,255,255,0.06)"}`,
      borderRadius: "18px", padding: "1.8rem 1.5rem", textAlign: "center",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.6s ease", position: "relative", overflow: "hidden",
    }}>
      {/* Background level number */}
      <div style={{ position:"absolute", top:-10, right:5, fontSize:"5rem", fontWeight:900, color:"rgba(255,215,0,0.04)", lineHeight:1, userSelect:"none" }}>{level}</div>
      {/* Icon */}
      <div style={{ width:60, height:60, borderRadius:"50%", background:`${color}18`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.2rem" }}>
        <i className={icon} style={{ fontSize:"1.8rem", color }} />
      </div>
      <div style={{ fontSize:"0.75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(255,255,255,0.4)", marginBottom:"0.4rem" }}>Level {level}</div>
      <h4 style={{ color:"#fff", fontWeight:800, fontSize:"1.1rem", marginBottom:"0.8rem" }}>{label}</h4>
      <div style={{ fontSize:"1.8rem", fontWeight:900, color, lineHeight:1 }}>{bonus}</div>
      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.8rem", marginTop:"4px" }}>BNB Bonus</div>
      {/* Glow line */}
      <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"50%", height:"2px", background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
    </div>
  );
};

// ── Animated Earnings Chart ─────────────────────────────────────────────────
const EarningsChart = () => {
  const [heights, setHeights] = useState([40,55,70,60,85,75,95,80,100,90]);
  useEffect(() => {
    const id = setInterval(() => {
      setHeights(hs => hs.map(h => Math.max(20, Math.min(100, h + (Math.random()-0.45)*20))));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun","Mon","Tue","Wed"];
  return (
    <div style={{ paddingTop:"1rem" }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"120px", justifyContent:"center" }}>
        {heights.map((h, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
            <div style={{
              width:"100%", height:`${h}%`, maxWidth:"32px",
              background:`linear-gradient(180deg, #ffd700 0%, rgba(255,140,0,0.4) 100%)`,
              borderRadius:"4px 4px 0 0",
              transition:"height 1s cubic-bezier(0.4,0,0.2,1)",
              boxShadow:`0 -4px 12px rgba(255,215,0,${h/200})`,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginTop:"8px" }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.65rem", maxWidth:"32px" }}>{d}</div>
        ))}
      </div>
    </div>
  );
};

// ── Benefit Pill ─────────────────────────────────────────────────────────────
const BenefitPill = ({ icon, text }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:"50px", padding:"0.6rem 1.2rem" }}>
    <i className={icon} style={{ color:"#ffd700", fontSize:"1.1rem" }} />
    <span style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.88rem", fontWeight:600 }}>{text}</span>
  </div>
);

const AffiliateProgram = () => {
  const tiers = [
    { level:1, label:"Direct Referral", bonus:"5%", icon:"ri-user-star-line", color:"#ffd700", delay:0 },
    { level:2, label:"Team Bonus", bonus:"3%", icon:"ri-team-line", color:"#ff8c00", delay:100 },
    { level:3, label:"Growth Bonus", bonus:"2%", icon:"ri-seedling-line", color:"#00e676", delay:200 },
    { level:4, label:"Leadership", bonus:"1%", icon:"ri-award-line", color:"#4fc3f7", delay:300 },
    { level:5, label:"Elite Pool", bonus:"0.5%", icon:"ri-vip-crown-fill", color:"#e040fb", delay:400 },
  ];

  return (
    <section id="affiliate" style={{ padding:"100px 0", position:"relative" }}>
      <div style={{ position:"absolute", top:"20%", right:"-5%", width:"500px", height:"500px", background:"radial-gradient(circle,rgba(255,215,0,0.04) 0%,transparent 60%)", filter:"blur(80px)", pointerEvents:"none" }} />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"5rem" }}>
          <span style={{ background:"rgba(255,215,0,0.1)", color:"#ffd700", border:"1px solid rgba(255,215,0,0.25)", borderRadius:"30px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px" }}>Community Program</span>
          <h2 style={{ fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:900, color:"#fff", marginTop:"1rem", lineHeight:1.2 }}>
            Earn More by Growing <span style={{ color:"#ffd700" }}>Your Network</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"1.1rem", maxWidth:"600px", margin:"1rem auto 0", lineHeight:1.65 }}>
            Join a global community of BNB earners. Every referral you bring into BEPVault earns you cascading BNB bonuses across 5 reward levels — automatically.
          </p>
        </div>

        {/* Tier Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"1.2rem", marginBottom:"5rem" }}>
          {tiers.map(t => <TierCard key={t.level} {...t} />)}
        </div>

        {/* Why Join — 2 col */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"center", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,215,0,0.1)", borderRadius:"24px", padding:"3rem" }} className="affiliate-grid">
          {/* Left */}
          <div>
            <h3 style={{ color:"#fff", fontWeight:800, fontSize:"1.7rem", marginBottom:"1rem" }}>Why Join the<br /><span style={{ color:"#ffd700" }}>BEPVault Community?</span></h3>
            <p style={{ color:"rgba(255,255,255,0.6)", lineHeight:1.75, marginBottom:"2rem" }}>
              There's no cap on how much you can earn. The bigger your network, the bigger your daily BNB flow. Our transparent smart contract settles every bonus automatically — no middlemen, no delays.
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.8rem" }}>
              <BenefitPill icon="ri-infinite-line" text="No earning limits" />
              <BenefitPill icon="ri-shield-check-line" text="Smart contract secured" />
              <BenefitPill icon="ri-time-line" text="Instant payouts" />
              <BenefitPill icon="ri-bar-chart-grouped-line" text="5-level deep rewards" />
              <BenefitPill icon="ri-global-line" text="Global community" />
              <BenefitPill icon="ri-book-open-line" text="Training & support" />
            </div>
          </div>

          {/* Right — Animated Earnings Bar Chart */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem", alignItems:"center" }}>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.85rem", fontWeight:600 }}>Daily BNB Earnings Simulation</div>
              <div style={{ color:"#00e676", fontSize:"0.8rem", fontWeight:700, display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#00e676", display:"inline-block", animation:"livePulse 1s infinite" }} />
                Live
              </div>
            </div>
            <EarningsChart />
            {/* Bottom Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.8rem", marginTop:"1.5rem" }}>
              {[
                { val:"0.6%", label:"Daily Yield", col:"#ffd700" },
                { val:"5 Tiers", label:"Bonus Levels", col:"#ff8c00" },
                { val:"∞", label:"No Cap", col:"#00e676" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"0.9rem", background:"rgba(255,255,255,0.03)", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ color:s.col, fontWeight:900, fontSize:"1.3rem" }}>{s.val}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.72rem", marginTop:"3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) { .affiliate-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};
export default AffiliateProgram;
