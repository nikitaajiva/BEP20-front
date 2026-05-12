"use client";
import React from "react";
import { motion } from "framer-motion";

// ── Tier Node Component ──────────────────────────────────────────────────
const TierNode = ({ level, label, bonus, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true }}
    className="affiliate-tier-card"
  >
    <div className="tier-card-inner">
      <div className="tier-level-indicator">TIER 0{level}</div>
      <div className="tier-icon-wrapper">
        <div className="tier-icon-glow" />
        <i className={icon} />
      </div>
      <div className="tier-content">
        <h4 className="tier-title">{label}</h4>
        <div className="tier-bonus-wrap">
          <span className="tier-bonus gold-text-shimmer">{bonus}</span>
          <span className="tier-bonus-label">COMMISSION</span>
        </div>
      </div>
      <div className="tier-card-flare" />
    </div>
  </motion.div>
);

const AffiliateProgram = () => {
  const tiers = [
    { level: 1, label: "Direct", bonus: "5%", icon: "ri-user-star-line" },
    { level: 2, label: "Team", bonus: "3%", icon: "ri-team-line" },
    { level: 3, label: "Growth", bonus: "2%", icon: "ri-seedling-line" },
    { level: 4, label: "Leaders", bonus: "1%", icon: "ri-award-line" },
    { level: 5, label: "Master", bonus: "0.5%", icon: "ri-vip-crown-fill" },
  ];

  return (
    <section id="affiliate" className="affiliate-section">
      <div className="affiliate-container">
        
        {/* Header */}
        <div className="affiliate-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="affiliate-badge">GROWTH ECOSYSTEM</span>
            <h2 className="affiliate-main-title">
              Expand Your <span className="gold-text">Racing Stable</span>
            </h2>
            <p className="affiliate-description">
              Build a powerful network and earn cascading rewards across 5 elite tiers. Total transparency, automated payouts, and unlimited potential.
            </p>
          </motion.div>
        </div>

        {/* Tiers Row */}
        <div className="affiliate-tiers-grid">
          {tiers.map((t, i) => (
            <TierNode key={t.level} {...t} delay={i * 0.1} />
          ))}
        </div>

        {/* Detailed Insights Box */}
        <div className="affiliate-insights">
          <div className="insights-glass">
            <div className="insights-grid">
              
              {/* Left Content */}
              <div className="insights-text">
                <h3 className="insights-title">Why Lead a <br /><span className="gold-text">Racing Stable?</span></h3>
                <div className="insights-features">
                  {[
                    { icon: "ri-infinite-line", title: "Unlimited Earning", desc: "No caps on your performance rewards." },
                    { icon: "ri-shield-check-line", title: "Secure Payouts", desc: "Automated, instant settlement protocols." },
                    { icon: "ri-bar-chart-grouped-line", title: "5-Tier Depth", desc: "Deep rewards from your entire community." },
                  ].map((f, i) => (
                    <div key={i} className="insight-feature-item">
                      <div className="feature-icon"><i className={f.icon} /></div>
                      <div className="feature-info">
                        <h5>{f.title}</h5>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Performance Chart */}
              <div className="insights-visual">
                <div className="performance-card">
                  <div className="perf-header">
                    <span className="perf-label">STABLE GROWTH ANALYSIS</span>
                    <span className="perf-status"><span className="pulse-dot" /> LIVE</span>
                  </div>
                  
                  <div className="perf-chart">
                    {[40, 65, 45, 85, 55, 75, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="chart-bar"
                      />
                    ))}
                  </div>

                  <div className="perf-stats">
                    <div className="perf-stat-item">
                      <span className="val gold-text">0.6%</span>
                      <span className="lbl">AVG YIELD</span>
                    </div>
                    <div className="perf-stat-item">
                      <span className="val">5 LEVELS</span>
                      <span className="lbl">TIERS</span>
                    </div>
                    <div className="perf-stat-item">
                      <span className="val green-text">NONE</span>
                      <span className="lbl">MAX CAP</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .affiliate-section {
          position: relative;
          padding: 120px 0;
          background: #030303;
          overflow: hidden;
        }

        .affiliate-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* ── Header ── */
        .affiliate-header {
          margin-bottom: 80px;
        }
        .affiliate-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          color: #FFB800;
          letter-spacing: 5px;
          margin-bottom: 24px;
        }
        .affiliate-main-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 24px 0;
          letter-spacing: -2px;
        }
        .affiliate-description {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.7;
          max-width: 700px;
          margin: 0 auto;
        }

        /* ── Tiers Grid ── */
        .affiliate-tiers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 100px;
        }
        @media (min-width: 768px) {
          .affiliate-tiers-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .affiliate-tiers-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .affiliate-tier-card {
          position: relative;
          height: 100%;
        }
        .tier-card-inner {
          position: relative;
          height: 100%;
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 40px;
          padding: 50px 20px;
          text-align: center;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .affiliate-tier-card:hover .tier-card-inner {
          background: rgba(15, 15, 15, 0.8);
          border-color: rgba(255, 184, 0, 0.4);
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }
        .tier-level-indicator {
          position: absolute;
          top: 30px;
          font-size: 10px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 3px;
        }
        .tier-icon-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          background: rgba(255, 184, 0, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          color: #FFB800;
          font-size: 24px;
          border: 1px solid rgba(255, 184, 0, 0.2);
          transition: transform 0.4s ease;
        }
        .affiliate-tier-card:hover .tier-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
          background: rgba(255, 184, 0, 0.2);
        }
        .tier-icon-glow {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .affiliate-tier-card:hover .tier-icon-glow { opacity: 1; }

        .tier-title {
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0 0 10px 0;
        }
        .tier-bonus-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tier-bonus {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }
        .gold-text-shimmer {
          background: linear-gradient(135deg, #FFB800, #FF6200, #FFB800);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        .tier-bonus-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.2);
        }
        .tier-card-flare {
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.05) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .affiliate-tier-card:hover .tier-card-flare { opacity: 1; }

        /* ── Insights Box ── */
        .affiliate-insights {
          position: relative;
        }
        .insights-glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 48px;
          padding: 40px;
        }
        @media (min-width: 1024px) {
          .insights-glass { padding: 80px; }
        }
        .insights-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .insights-grid { grid-template-columns: 1.1fr 0.9fr; gap: 100px; }
        }

        .insights-title {
          font-size: 3rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 48px;
          letter-spacing: -1.5px;
        }
        .insights-features {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .insight-feature-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFB800;
          font-size: 20px;
          flex-shrink: 0;
        }
        .feature-info h5 {
          font-size: 1.1rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 4px 0;
        }
        .feature-info p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        /* ── Performance Card ── */
        .performance-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 32px;
          padding: 32px;
        }
        .perf-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .perf-label {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.3);
        }
        .perf-status {
          font-size: 10px;
          font-weight: 900;
          color: #00e676;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #00e676;
          border-radius: 50%;
          box-shadow: 0 0 10px #00e676;
          animation: blink 1.5s infinite;
        }

        .perf-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
          height: 140px;
          margin-bottom: 40px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .chart-bar {
          flex: 1;
          background: linear-gradient(to top, rgba(255, 184, 0, 0.1), #FFB800);
          border-radius: 6px 6px 2px 2px;
        }

        .perf-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .perf-stat-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .perf-stat-item .val { font-size: 1.1rem; font-weight: 900; color: #fff; }
        .perf-stat-item .lbl { font-size: 8px; font-weight: 900; color: rgba(255, 255, 255, 0.3); letter-spacing: 1px; }
        .green-text { color: #00e676 !important; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </section>
  );
};

export default AffiliateProgram;

