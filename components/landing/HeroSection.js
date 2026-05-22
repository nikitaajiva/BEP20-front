"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import safeStorage from "@/utils/safeStorage";

// ── Live Race Stats Component ─────────────────────────────────────────────
const LiveRaceStats = () => {
  const [activeRacers, setActiveRacers] = useState(12450);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveRacers(p => p + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-stats-container">
      <div className="hero-stat-block">
        <span className="hero-stat-label">Active Racers</span>
        <span className="hero-stat-value gold-text drop-glow">
          {activeRacers.toLocaleString()}
        </span>
      </div>
      <div className="hero-stat-divider" />
      <div className="hero-stat-block">
        <span className="hero-stat-label">Track Status</span>
        <span className="hero-stat-value track-green flex-center gap-2">
          <span className="pulse-dot" />
          OPTIMAL
        </span>
      </div>
      <div className="hero-stat-divider" />
      <div className="hero-stat-block">
        <span className="hero-stat-label">Next Race</span>
        <span className="hero-stat-value white-text">
          02:45 <span className="text-sm text-gray-400" style={{fontSize: "14px"}}>MIN</span>
        </span>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasToken(!!safeStorage.getItem("token"));
  }, []);

  return (
    <section className="hero-section">
      {/* Background Cinematic Image */}
      <div className="hero-bg-wrapper">
        <Image 
          src="/img/horseimg1.avif" 
          alt="Horse Racing Background" 
          fill 
          className="hero-bg-image"
          priority
        />
        <div className="hero-bg-overlay" />
        <div className="hero-bg-gradient" />
      </div>

      <div className="hero-content-wrapper">
        <div className="hero-grid">
          
          {/* Left Content */}
          <div className="hero-text-col">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                <span>The Elite Circuit is Live</span>
              </div>

              <h1 className="hero-title">
                <span className="hero-title-top">UNLEASH THE</span>
                <span className="hero-title-highlight">SPEED OF GOLD</span>
              </h1>

              <p className="hero-subtitle">
                Experience the adrenaline of elite horse racing. Step into an exclusive ecosystem of professional-grade analytics and real-time rewards.
              </p>

              <div className="hero-action-group">
                <Link href={mounted && (user || hasToken) ? "/dashboard" : "/sign-up"} className="no-underline">
                  <button className="hero-btn hero-btn-gold">
                    <span>START RACING NOW</span>
                    <i className="ri-arrow-right-line" />
                  </button>
                </Link>
                <Link href="#how-it-works" className="no-underline">
                  <button className="hero-btn hero-btn-glass">
                    VIEW SCHEDULE
                  </button>
                </Link>
              </div>

              <LiveRaceStats />
            </motion.div>
          </div>

          {/* Right Visual Glass Card */}
          <div className="hero-visual-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <div className="hero-glass-card">
                <div className="hero-glass-card-header">
                  <div className="hgc-live-badge">LIVE EVENT</div>
                  <div className="hgc-odds-badge">4/1 ODDS</div>
                </div>

                <div className="hero-glass-image-wrapper">
                  <Image 
                    src="/img/photo7.webp" 
                    alt="Live Race" 
                    fill 
                    className="hero-glass-image" 
                  />
                  <div className="hero-glass-image-fade" />
                  <div className="hero-glass-image-text">
                    <h3>Grand Derby Royale</h3>
                    <p>Kentucky Track • Group 1</p>
                  </div>
                </div>

                <div className="hero-glass-footer">
                  <div className="hgc-footer-item">
                    <div className="hgc-footer-icon-wrapper">
                      <Image src="/img/photo3.webp" alt="Vault" fill className="object-cover" />
                    </div>
                    <div className="hgc-footer-text">
                      <span className="hgc-footer-label">Secure Vault</span>
                      <span className="hgc-footer-val gold-text">ACTIVE</span>
                    </div>
                  </div>
                  <button className="hgc-join-btn">Place Entry</button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          padding-top: 120px;
          padding-bottom: 80px;
          overflow: hidden;
          background-color: #030303;
        }

        /* ── Background ── */
        .hero-bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .hero-bg-image {
          object-fit: cover;
          object-position: center top;
          opacity: 0.7;
          transform: scale(1.05);
          animation: slowZoom 20s infinite alternate;
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
        }
        .hero-bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 50%, #000 100%);
        }

        /* ── Layout ── */
        .hero-content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1650px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 100px;
          }
        }

        /* ── Typography & Left Content ── */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 184, 0, 0.1);
          border: 1px solid rgba(255, 184, 0, 0.3);
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 24px;
        }
        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background-color: #FFB800;
          border-radius: 50%;
          box-shadow: 0 0 12px #FFB800;
          animation: blink 2s infinite;
        }
        .hero-badge span {
          color: #FFB800;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .hero-title {
          margin: 0 0 24px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .hero-title-top {
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          letter-spacing: 6px;
          text-transform: uppercase;
        }
        
        .hero-title-highlight {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(90deg, #FFB800 0%, #FF6200 50%, #FFB800 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
          filter: drop-shadow(0 10px 20px rgba(255,184,0,0.25));
        }

        .hero-subtitle {
          font-size: clamp(1rem, 1.2vw, 1.2rem);
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          max-width: 500px;
          margin-bottom: 40px;
        }

        /* ── Buttons ── */
        .hero-action-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 48px;
        }
        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        .hero-btn-gold {
          background: linear-gradient(135deg, #FFB800 0%, #FF6200 100%) !important;
          color: #000 !important;
          box-shadow: 0 8px 25px rgba(255,184,0,0.35) !important;
        }
        .hero-btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255,184,0,0.5) !important;
        }
        .hero-btn-glass {
          background: rgba(255,255,255,0.05) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(10px);
        }
        .hero-btn-glass:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: #FFB800 !important;
        }

        /* ── Stats ── */
        .hero-stats-container {
          display: flex;
          align-items: center;
          gap: 30px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .hero-stat-block {
          display: flex;
          flex-direction: column;
        }
        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }
        .hero-stat-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .hero-stat-value {
          font-size: 22px;
          font-weight: 900;
        }
        .gold-text { color: #FFB800 !important; }
        .white-text { color: #fff !important; }
        .track-green { color: #00e676 !important; }
        .drop-glow { text-shadow: 0 0 15px rgba(255,184,0,0.35); }
        .flex-center { display: flex; align-items: center; }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #00e676;
          border-radius: 50%;
          animation: blink 1.5s infinite;
        }

        /* ── Right Visual Glass Card ── */
        .hero-glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }
        .hero-glass-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .hgc-live-badge {
          background: rgba(255, 0, 0, 0.2);
          color: #ff4d4d;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
        }
        .hgc-odds-badge {
          background: rgba(255, 184, 0, 0.12);
          color: #FFB800;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
        }
        .hero-glass-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/11;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
          background: #000;
        }
        .hero-glass-image {
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.5s ease;
          filter: contrast(1.05) brightness(1.1);
        }
        .hero-glass-card:hover .hero-glass-image {
          transform: scale(1.05);
        }
        .hero-glass-image-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 100%);
        }
        .hero-glass-image-text {
          position: absolute;
          bottom: 16px;
          left: 16px;
          z-index: 5;
        }
        .hero-glass-image-text h3 {
          color: #fff;
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .hero-glass-image-text p {
          color: rgba(255,255,255,0.6);
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .hero-glass-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .hgc-footer-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hgc-footer-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          overflow: hidden;
        }
        .hgc-footer-text {
          display: flex;
          flex-direction: column;
        }
        .hgc-footer-label {
          color: rgba(255,255,255,0.4);
          font-size: 8px;
          text-transform: uppercase;
        }
        .hgc-footer-val {
          font-size: 12px;
          font-weight: 800;
        }
        .hgc-join-btn {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
        }
        .hgc-join-btn:hover {
          background: #fff;
          color: #000;
        }

        @keyframes shine {
          to { background-position: 200% center; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 1023px) {
          .hero-section { padding-top: 140px; }
          .hero-grid { text-align: center; }
          .hero-badge, .hero-action-group, .hero-stats-container { justify-content: center; margin-left: auto; margin-right: auto; }
          .hero-subtitle { margin-left: auto; margin-right: auto; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
