"use client";
import React, { useEffect, useRef, useState } from "react";

// ── Animated Stat Counter ─────────────────────────────────────────────────
const Counter = ({ target, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(id); }
          else setCount(Math.floor(start));
        }, 20);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ── Animated Progress Bar ─────────────────────────────────────────────────
const ProgressBar = ({ label, percent, color = "#ffd700" }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setWidth(percent), 200); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [percent]);
  return (
    <div ref={ref} style={{ marginBottom: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: "0.9rem" }}>{percent}%</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`, borderRadius: "3px",
          background: `linear-gradient(90deg, ${color}, #ff8c00)`,
          boxShadow: `0 0 10px ${color}60`,
          transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
};

const AboutBEPVaultSection = () => {
  return (
    <section id="about" style={{ padding: "100px 0", position: "relative" }}>
      {/* Glow blob */}
      <div style={{ position:"absolute", top:"10%", right:"-5%", width:"500px", height:"500px", background:"radial-gradient(circle,rgba(255,140,0,0.06) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />

      <div className="container">
        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <span style={{ background:"rgba(255,215,0,0.1)", color:"#ffd700", border:"1px solid rgba(255,215,0,0.25)", borderRadius:"30px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px" }}>About Us</span>
          <h2 style={{ fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:900, color:"#fff", marginTop:"1rem", lineHeight:1.2 }}>
            Built on the Power of <span style={{ color:"#ffd700" }}>BEP20 BNB</span>
          </h2>
        </div>

        {/* Block 1 */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center", marginBottom:"5rem" }} className="about-grid">
          {/* Left - Text */}
          <div>
            <h3 style={{ fontSize:"1.9rem", fontWeight:800, color:"#fff", marginBottom:"1rem" }}>The Premier Liquidity Gateway</h3>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"1.05rem", lineHeight:1.75, marginBottom:"1.5rem" }}>
              BEPVault is a cutting-edge community driven platform engineered specifically for the Binance Smart Chain. We provide a fully decentralized gateway for BEP20 BNB liquidity — connecting everyday users with institutional-grade yield infrastructure.
            </p>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"1.05rem", lineHeight:1.75, marginBottom:"2rem" }}>
              Our model allows members across the globe to contribute to the BNB liquidity pool and earn up to <strong style={{ color:"#ffd700" }}>0.6% daily</strong>, with automatic compounding, instant settlement, and real-time tracking.
            </p>
            <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
              {[
                { n:"12,000+", l:"Daily Transactions" },
                { n:"99.9%", l:"Uptime Guaranteed" },
              ].map(s => (
                <div key={s.l} style={{ padding:"1.2rem 1.8rem", background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:"12px" }}>
                  <div style={{ color:"#ffd700", fontWeight:900, fontSize:"1.6rem" }}>{s.n}</div>
                  <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.8rem", marginTop:"3px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right - Orbit Animation */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"340px" }}>
            <div style={{ position:"relative", width:"280px", height:"280px", display:"flex", justifyContent:"center", alignItems:"center" }}>
              {/* Multi-orbit rings */}
              {[280, 210, 140].map((size, ri) => (
                <div key={ri} style={{
                  position:"absolute", width:size, height:size, borderRadius:"50%",
                  border:`1px ${ri===1?"solid":"dashed"} rgba(255,215,0,${0.08 + ri*0.05})`,
                  animation:`orbitSpin ${14 + ri * 5}s linear infinite ${ri%2===0?"":"reverse"}`,
                }}>
                  {ri === 0 && (
                    <div style={{ position:"absolute", top:"-8px", left:"50%", transform:"translateX(-50%)", width:"16px", height:"16px", borderRadius:"50%", background:"#ffd700", boxShadow:"0 0 14px 4px rgba(255,215,0,0.7)" }} />
                  )}
                  {ri === 1 && (
                    <div style={{ position:"absolute", bottom:"-7px", left:"50%", transform:"translateX(-50%)", width:"13px", height:"13px", borderRadius:"50%", background:"#ff8c00", boxShadow:"0 0 10px 3px rgba(255,140,0,0.6)" }} />
                  )}
                </div>
              ))}
              {/* Center icon */}
              <div style={{ zIndex:5, background:"linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15))", border:"1px solid rgba(255,215,0,0.3)", borderRadius:"50%", width:"90px", height:"90px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(255,215,0,0.3)", animation:"gentleFloat 4s ease-in-out infinite" }}>
                <i className="ri-database-2-fill" style={{ fontSize:"2.5rem", color:"#ffd700" }} />
              </div>
              {/* Background glow */}
              <div style={{ position:"absolute", width:"100%", height:"100%", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,215,0,0.08) 0%,transparent 65%)" }} />
            </div>
          </div>
        </div>

        {/* Block 2 — BEPVault Tech + Progress Bars */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="about-grid">
          {/* Left — Diamond Shield */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"300px" }}>
            <div style={{ position:"relative", width:"260px", height:"260px", display:"flex", justifyContent:"center", alignItems:"center" }}>
              {[220, 170, 120].map((size, i) => (
                <div key={i} style={{
                  position:"absolute", width:size, height:size,
                  border:`1px solid rgba(255,215,0,${0.06 + i*0.07})`,
                  background: i===2 ? "rgba(255,215,0,0.04)" : "transparent",
                  transform:"rotate(45deg)",
                  animation:`diamondPulse ${3+i}s ease-in-out infinite`,
                  animationDelay:`${i*0.5}s`,
                }} />
              ))}
              <div style={{ zIndex:5, animation:"pulseGlyph 2.5s ease-in-out infinite" }}>
                <i className="ri-shield-check-fill" style={{ fontSize:"3.5rem", color:"#ffd700", filter:"drop-shadow(0 0 20px rgba(255,215,0,0.9))" }} />
              </div>
            </div>
          </div>
          {/* Right — Text + Progress */}
          <div>
            <h3 style={{ fontSize:"1.9rem", fontWeight:800, color:"#fff", marginBottom:"1rem" }}>BEPVault Tech® Infrastructure</h3>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"1.05rem", lineHeight:1.75, marginBottom:"2rem" }}>
              Our platform is powered exclusively by BEP20 BNB on the Binance Smart Chain — delivering ultra-low gas fees, near-instant finality, and a battle-tested security model trusted by institutional DeFi operators worldwide.
            </p>
            <ProgressBar label="Liquidity Coverage" percent={94} color="#ffd700" />
            <ProgressBar label="Smart Contract Security" percent={99} color="#00e676" />
            <ProgressBar label="Community Satisfaction" percent={97} color="#4fc3f7" />
            <ProgressBar label="Uptime & Reliability" percent={100} color="#ff8c00" />
          </div>
        </div>
      </div>

      {/* Global animations for this section */}
      <style jsx global>{`
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes gentleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes diamondPulse { 0%,100%{transform:rotate(45deg) scale(0.95);opacity:0.6} 50%{transform:rotate(45deg) scale(1.05);opacity:1} }
        @keyframes pulseGlyph { 0%,100%{filter:drop-shadow(0 0 15px rgba(255,215,0,0.6))} 50%{filter:drop-shadow(0 0 35px rgba(255,215,0,1))} }
        @media (max-width:900px) { .about-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </section>
  );
};

export default AboutBEPVaultSection;
