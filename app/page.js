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
import { motion } from "framer-motion";

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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 184, 0, ${p.opacity})`;
        ctx.fill();

        particles.forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 184, 0, ${0.04 * (1 - dist / 120)})`;
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
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-70" />
  );
};

// ── Scrolling Ticker Bar ────────────────────────────────────────────────────
const TickerBar = () => {
  const items = [
    "Live Race: Kentucky Derby  Odds 4/1  ▲ HOT",
    "Track Rewards  Daily Payouts",
    "Global Cup  $50,000 Prize Pool",
    "Active Racers  10,000+",
    "Total Prizes Paid  $5M+",
    "Certified Security  Audited ✓",
    "Race Uptime  100%",
    "Settlement  Instant ⚡",
  ];
  const repeated = [...items, ...items];

  return (
    <div className="bg-primary/6 border-b border-primary/15 py-2.5 overflow-hidden relative z-100 mt-0">
      <div className="flex animate-tickerScroll w-max">
        {repeated.map((item, i) => (
          <span key={i} className="text-white/70 text-[0.82rem] font-semibold whitespace-nowrap px-10">
            <span className="text-primary mr-2">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Section Divider ─────────────────────────────────────────────────────────
const Divider = () => (
  <div className="max-w-[1280px] mx-auto px-6">
    <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
  </div>
);

// ── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-[#030303] text-white font-inter relative overflow-x-hidden">
      {/* Canvas Particle BG */}
      <ParticleBackground />

      {/* Background gradients */}
      <div className="fixed inset-0 h-screen bg-[radial-gradient(ellipse_at_70%_10%,rgba(255,140,0,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_20%_80%,rgba(255,184,0,0.05)_0%,transparent_55%)] pointer-events-none z-0" />

      {/* Navbar (which includes the TopTicker) */}
      <LandingNavbar />

      <main className="relative z-10 pt-20">
        <HeroSection />

        <Divider />

        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AboutBEPVaultSection />
        </motion.div>

        <Divider />

        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <KeyFeaturesSection />
        </motion.div>

        <Divider />

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HowItWorksSection />
        </motion.div>

        <Divider />

        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true, amount: 0.2 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AffiliateProgram />
        </motion.div>

        <Divider />

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
          className="final-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="final-cta-bg-glow" />
          
          <div className="final-cta-container">
            <motion.div 
              className="cta-command-center"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="command-center-inner">
                {/* Header Decoration */}
                <div className="command-header-line" />
                
                <div className="cta-content-top">
                  <div className="cta-badge-wrapper">
                    <span className="pulse-dot" />
                    <span className="badge-text">ELITE CIRCUIT ACCESS OPEN</span>
                  </div>
                  
                  <h2 className="cta-hero-title">
                    Start Your <span className="gold-text">Racing Legacy</span> Today
                  </h2>
                  
                  <p className="cta-hero-desc">
                    Join 10,000+ elite racers winning daily on the global circuit. <br />
                    Experience the next generation of digital horse racing.
                  </p>
                  
                  <div className="cta-hero-actions">
                    <Link href="/sign-up" className="no-underline">
                      <button className="btn-primary-fire">GET STARTED NOW</button>
                    </Link>
                    <Link href="https://linktr.ee/BEPVaultOfficial" target="_blank" className="no-underline">
                      <button className="btn-glass-secondary">JOIN COMMUNITY</button>
                    </Link>
                  </div>
                </div>

                {/* Bottom Trust Bar */}
                <div className="cta-trust-bar">
                  {[
                    { icon: "ri-user-add-line", label: "ACTIVE RACERS", val: "10,240+" },
                    { icon: "ri-refund-2-line", label: "TOTAL PAYOUTS", val: "SECURE" },
                    { icon: "ri-shield-check-line", label: "SYSTEM STATUS", val: "LIVE" }
                  ].map((s, i) => (
                    <div key={i} className="trust-item">
                      <i className={s.icon} />
                      <div className="trust-info">
                        <span className="trust-val">{s.val}</span>
                        <span className="trust-lbl">{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <style jsx>{`
            .final-cta-section {
              position: relative;
              padding: 140px 0;
              background: #030303;
              overflow: hidden;
            }
            .final-cta-bg-glow {
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at center, rgba(255, 184, 0, 0.08) 0%, transparent 70%);
              pointer-events: none;
            }
            .final-cta-container {
              max-width: 1320px;
              margin: 0 auto;
              padding: 0 24px;
              position: relative;
              z-index: 10;
            }

            /* ── Command Center Card ── */
            .cta-command-center {
              background: rgba(255, 255, 255, 0.02);
              backdrop-filter: blur(40px);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-radius: 48px;
              overflow: hidden;
              position: relative;
              box-shadow: 0 50px 100px rgba(0,0,0,0.6);
            }
            .command-center-inner {
              padding: 80px 40px 60px;
              text-align: center;
              position: relative;
            }
            .command-header-line {
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 200px;
              height: 4px;
              background: linear-gradient(90deg, transparent, #FFB800, transparent);
              border-radius: 0 0 10px 10px;
            }

            /* ── Content ── */
            .cta-badge-wrapper {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              background: rgba(0, 230, 118, 0.1);
              border: 1px solid rgba(0, 230, 118, 0.2);
              padding: 8px 20px;
              border-radius: 100px;
              margin-bottom: 40px;
            }
            .pulse-dot {
              width: 8px;
              height: 8px;
              background: #00e676;
              border-radius: 50%;
              box-shadow: 0 0 10px #00e676;
              animation: blink 1.5s infinite;
            }
            .badge-text {
              font-size: 10px;
              font-weight: 900;
              color: #00e676;
              letter-spacing: 2.5px;
            }
            .cta-hero-title {
              font-size: clamp(2.5rem, 6vw, 4.5rem);
              font-weight: 900;
              color: #fff;
              line-height: 1.1;
              margin-bottom: 24px;
              letter-spacing: -2.5px;
            }
            .gold-text {
              background: linear-gradient(90deg, #FFB800, #FF6200);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .cta-hero-desc {
              font-size: 1.2rem;
              color: rgba(255, 255, 255, 0.4);
              line-height: 1.7;
              margin-bottom: 56px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }

            /* ── Buttons ── */
            .cta-hero-actions {
              display: flex;
              justify-content: center;
              gap: 20px;
              flex-wrap: wrap;
              margin-bottom: 80px;
            }
            .btn-primary-fire {
              background: linear-gradient(135deg, #FFB800, #FF6200);
              color: #000;
              border: none;
              padding: 22px 56px;
              border-radius: 20px;
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 1px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 15px 40px rgba(255, 184, 0, 0.3);
            }
            .btn-primary-fire:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 50px rgba(255, 184, 0, 0.5);
            }
            .btn-glass-secondary {
              background: rgba(255, 255, 255, 0.03);
              color: #fff;
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 22px 56px;
              border-radius: 20px;
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 1px;
              cursor: pointer;
              transition: all 0.3s;
            }
            .btn-glass-secondary:hover {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.2);
              transform: translateY(-5px);
            }
            /* ── Trust Bar ── */
            .cta-trust-bar {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 0;
              padding-top: 56px;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              margin-top: 20px;
            }
            .trust-item {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 0 40px;
              position: relative;
              transition: all 0.3s ease;
            }
            .trust-item:not(:last-child)::after {
              content: '';
              position: absolute;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 1px;
              height: 30px;
              background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
            }
            .trust-item:hover {
              transform: translateY(-2px);
            }
            .trust-item:hover i {
              color: #FF6200;
              filter: drop-shadow(0 0 8px rgba(255, 98, 0, 0.4));
            }
            .trust-item i {
              font-size: 28px;
              color: #FFB800;
              transition: all 0.3s ease;
            }
            .trust-info {
              text-align: left;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .trust-val {
              display: block;
              font-size: 18px;
              font-weight: 900;
              color: #fff;
              line-height: 1;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .trust-lbl {
              font-size: 9px;
              font-weight: 800;
              color: rgba(255, 255, 255, 0.3);
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          `}</style>
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
}

