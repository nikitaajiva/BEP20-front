"use client";
import React, { useEffect, useRef } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AboutBEPVaultSection from "../components/landing/AboutBEPVaultSection";
import KeyFeaturesSection from "../components/landing/KeyFeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import AffiliateProgram from "../components/landing/AffiliateProgram";
import FAQSection from "../components/landing/FAQSection";
import LandingFooter from "../components/landing/LandingFooter";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Particle Canvas Background ──────────────────────────────────────────────
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        particles.forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0, opacity: 0.7,
    }} />
  );
};

// ── Scrolling Ticker Bar ────────────────────────────────────────────────────
const TickerBar = () => {
  const items = [
    "BNB / USDT  $312.40  ▲ +2.4%",
    "BEPVault LP  0.6% Daily",
    "BSC Gas Fee  < $0.01",
    "Active Members  50,000+",
    "Total Paid Out  $12M+",
    "Smart Contract  Audited ✓",
    "Uptime  99.9%",
    "Settlement  Instant ⚡",
  ];
  const repeated = [...items, ...items];

  return (
    <div style={{
      background: "rgba(255,215,0,0.06)", borderBottom: "1px solid rgba(255,215,0,0.15)",
      padding: "0.55rem 0", overflow: "hidden", position: "relative", zIndex: 100,
      marginTop: "0px",
    }}>
      <div style={{ display: "flex", animation: "tickerScroll 35s linear infinite", width: "max-content" }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", padding: "0 2.5rem" }}>
            <span style={{ color: "#ffd700", marginRight: "0.5rem" }}>◆</span>
            {item}
          </span>
        ))}
      </div>
      <style jsx global>{`
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

// ── Section Divider ─────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
    <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)" }} />
  </div>
);

// ── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: "#030303", color: "#fff", fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Canvas Particle BG */}
      <ParticleBackground />

      {/* Background gradients — static deep color blobs */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "100vh", background: "radial-gradient(ellipse at 70% 10%, rgba(255,140,0,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(255,215,0,0.05) 0%, transparent 55%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Navbar */}
      <LandingNavbar />

      {/* Ticker Bar positioned right below navbar */}
      <div style={{ paddingTop: "75px", position: "relative", zIndex: 10 }}>
        <TickerBar />
      </div>

      <main style={{ position: "relative", zIndex: 10 }}>
        {/* HERO - Hero component should have its own internal animations */}
        <HeroSection />

        <Divider />

        {/* ABOUT */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AboutBEPVaultSection />
        </motion.div>

        <Divider />

        {/* FEATURES */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <KeyFeaturesSection />
        </motion.div>

        <Divider />

        {/* HOW IT WORKS */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HowItWorksSection />
        </motion.div>

        <Divider />

        {/* AFFILIATE */}
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AffiliateProgram />
        </motion.div>

        <Divider />

        {/* FAQ */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <FAQSection />
        </motion.div>

        {/* Final CTA Banner */}
        <motion.section 
          style={{ padding: "100px 0", textAlign: "center", position: "relative", overflow: "hidden" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <motion.div 
               style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.3)",
                borderRadius: "30px", padding: "6px 16px", marginBottom: "1.5rem",
              }}
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e676", display: "inline-block", animation: "livePulse 1s infinite" }} />
              <span style={{ color: "#00e676", fontWeight: 700, fontSize: "0.82rem" }}>Platform Accepting New Members</span>
            </motion.div>
            <motion.h2 
              style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: "1.2rem" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Start Your <span style={{ background: "linear-gradient(135deg,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BNB Journey</span><br />Today
            </motion.h2>
            <motion.p 
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.15rem", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: 1.65 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Join 50,000+ members already earning daily BNB returns with BEPVault. It's free to join and takes less than 2 minutes.
            </motion.p>
            <motion.div 
              style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="https://linktr.ee/BEPVaultOfficial" target="_blank" style={{ textDecoration: "none" }}>
                <motion.button 
                  style={{
                    background: "transparent", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)", padding: "1.1rem 3rem",
                    borderRadius: "8px", fontWeight: 700, fontSize: "1.1rem",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                  whileHover={{ scale: 1.05, borderColor: "#ffd700", color: "#ffd700", boxShadow: "0 0 20px rgba(255,215,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Community
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <LandingFooter />

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030303 !important; color: #fff; font-family: 'Inter', sans-serif; }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,215,0,0.6); }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
