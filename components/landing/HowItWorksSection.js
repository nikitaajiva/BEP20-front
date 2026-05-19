"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── Step Card Component ──────────────────────────────────────────────────
const StepCard = ({ num, icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    viewport={{ once: true }}
    className="process-step-card"
  >
    <div className="process-card-inner">
      <div className="process-num-box">
        <span className="process-num">{num}</span>
      </div>
      <div className="process-icon-box">
        <i className={icon} />
      </div>
      <h3 className="process-title">{title}</h3>
      <p className="process-desc">{desc}</p>
      <div className="process-card-border" />
    </div>
  </motion.div>
);

const HowItWorksSection = () => {
  const steps = [
    { num: "01", icon: "ri-user-add-line", title: "Join the Track", desc: "Create your secure member profile in under 60 seconds and gain immediate access to the elite dashboard." },
    { num: "02", icon: "ri-flag-2-line", title: "Choose Your Race", desc: "Select from professional-grade races happening 24/7 across the globe, verified for transparency." },
    { num: "03", icon: "ri-water-flash-line", title: "Participate in Pools", desc: "Fuel high-volume racing pools with your participation, ensuring market depth and professional odds." },
    { num: "04", icon: "ri-coins-line", title: "Collect Daily Winnings", desc: "Watch your rewards grow in real-time. Experience the freedom of instant settlements and payouts." },
  ];

  return (
    <section id="how-it-works" className="process-section">
      <div className="process-container">
        
        {/* Header */}
        <div className="process-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="process-badge">THE WORKFLOW</span>
            <h2 className="process-main-title">
              Up and Earning in <br />
              <span className="gold-text">4 Simple Steps</span>
            </h2>
          </motion.div>
        </div>

        {/* Steps Grid with Connection Line */}
        <div className="process-grid-wrapper">
          <div className="process-connection-line" />
          <div className="process-steps-grid">
            {steps.map((step, i) => (
              <StepCard key={step.num} {...step} delay={i * 0.15} />
            ))}
          </div>
        </div>

        {/* Live Status Tracker (Simulation) */}
        <div className="process-simulation">
          <div className="simulation-glass">
            <div className="simulation-header">
              <span className="pulse-icon" />
              <span className="simulation-label">LIVE TRACK SIMULATION</span>
            </div>
            
            <div className="simulation-flow">
              {["Setup", "Selection", "Entry", "Race", "Payout"].map((label, i) => (
                <div key={label} className="simulation-step-group">
                  <div className={`simulation-node ${i === 4 ? "active" : i < 4 ? "completed" : ""}`}>
                    <span className="node-dot" />
                    <span className="node-label">{label}</span>
                  </div>
                  {i < 4 && (
                    <div className={`simulation-line ${i < 4 ? "completed" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Action */}
        <div className="process-cta">
          <Link href="/sign-up" className="no-underline">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="process-cta-btn"
            >
              <span>START YOUR JOURNEY</span>
              <i className="ri-arrow-right-line" />
            </motion.button>
          </Link>
        </div>

      </div>

      <style jsx global>{`
        .process-section {
          position: relative;
          padding: 120px 0;
          background: #030303;
          overflow: hidden;
        }

        .process-container {
          max-width: 1650px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* ── Header ── */
        .process-header {
          margin-bottom: 80px;
        }
        .process-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          color: #FFB800;
          letter-spacing: 5px;
          margin-bottom: 24px;
        }
        .process-main-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -2px;
        }

        /* ── Steps Grid ── */
        .process-grid-wrapper {
          position: relative;
          margin-bottom: 100px;
        }
        .process-connection-line {
          position: absolute;
          top: 45px;
          left: 50px;
          right: 50px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 184, 0, 0.2), transparent);
          display: none;
        }
        @media (min-width: 1024px) {
          .process-connection-line { display: block; }
        }

        .process-steps-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 32px;
        }
        @media (min-width: 640px) {
          .process-steps-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .process-steps-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .process-step-card {
          position: relative;
        }
        .process-card-inner {
          position: relative;
          height: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          padding: 50px 30px 40px;
          transition: all 0.4s ease;
          text-align: center;
        }
        .process-step-card:hover .process-card-inner {
          background: rgba(255, 184, 0, 0.03);
          border-color: rgba(255, 184, 0, 0.3);
          transform: translateY(-10px);
        }

        .process-num-box {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          background: #000;
          border: 1px solid rgba(255, 184, 0, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        .process-num {
          font-size: 14px;
          font-weight: 900;
          color: #FFB800;
        }

        .process-icon-box {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          transition: all 0.4s ease;
        }
        .process-step-card:hover .process-icon-box {
          background: #FFB800;
          color: #000;
          transform: scale(1.1);
        }
        .process-icon-box i {
          font-size: 30px;
          color: #FFB800;
        }
        .process-step-card:hover .process-icon-box i { color: #000; }

        .process-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .process-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.7;
          margin: 0;
        }

        /* ── Simulation ── */
        .process-simulation {
          max-width: 900px;
          margin: 0 auto 100px;
        }
        .simulation-glass {
          background: rgba(10, 10, 10, 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 32px;
          padding: 40px;
          text-align: center;
        }
        .simulation-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }
        .pulse-icon {
          width: 8px;
          height: 8px;
          background: #00e676;
          border-radius: 50%;
          box-shadow: 0 0 10px #00e676;
          animation: blink 1.5s infinite;
        }
        .simulation-label {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.3);
        }

        .simulation-flow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
        }
        .simulation-step-group {
          display: flex;
          align-items: center;
        }
        .simulation-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100px;
        }
        .node-dot {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.5s ease;
        }
        .node-label {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
          transition: all 0.5s ease;
        }

        .simulation-node.completed .node-dot { background: #FFB800; box-shadow: 0 0 15px rgba(255, 184, 0, 0.4); }
        .simulation-node.completed .node-label { color: #FFB800; }
        .simulation-node.active .node-dot { 
          background: #00e676; 
          box-shadow: 0 0 20px #00e676;
          transform: scale(1.3);
        }
        .simulation-node.active .node-label { color: #00e676; font-weight: 900; }

        .simulation-line {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.05);
          position: relative;
          top: -12px;
        }
        .simulation-line.completed { background: #FFB800; opacity: 0.3; }

        /* ── CTA ── */
        .process-cta {
          text-align: center;
        }
        .process-cta-btn {
          background: linear-gradient(135deg, #FFB800, #FF6200) !important;
          color: #000 !important;
          border: none !important;
          padding: 20px 50px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 15px 40px rgba(255, 184, 0, 0.3);
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        @media (max-width: 768px) {
          .simulation-line { display: none; }
          .simulation-step-group { margin-bottom: 20px; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;

