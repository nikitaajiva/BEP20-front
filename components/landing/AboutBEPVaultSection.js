"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

// ── Feature Tile Component ──────────────────────────────────────────────────
const FeatureTile = ({ img, title, subtitle, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    viewport={{ once: true }}
    className="feature-tile-wrapper"
  >
    <div className="feature-tile-inner">
      <Image src={img} alt={title} fill className="feature-tile-img" />
      <div className="feature-tile-overlay" />
      <div className="feature-tile-content">
        <span className="feature-tile-subtitle">{subtitle}</span>
        <h4 className="feature-tile-title">{title}</h4>
      </div>
      <div className="feature-tile-border" />
    </div>
  </motion.div>
);

const AboutBEPVaultSection = () => {
  return (
    <section id="about" className="about-section">
      {/* Decorative Background Elements */}
      <div className="about-bg-accent-1" />
      <div className="about-bg-accent-2" />

      <div className="about-container">
        
        {/* Cinematic Section Header */}
        <div className="about-header-centered">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="section-label">THE RACING HERITAGE</span>
            <h2 className="section-title">
              Driven by Passion, <span className="gold-text-glow">Defined by Excellence</span>
            </h2>
            <p className="section-description centered">
              We are not just a platform; we are a high-performance ecosystem designed for the modern racing enthusiast who demands precision, speed, and absolute reliability.
            </p>
          </motion.div>
        </div>

        {/* Feature Tiles Grid */}
        <div className="about-tiles-grid">
          <FeatureTile 
            img="/img/photo6.png" 
            title="Unyielding Strength" 
            subtitle="THE CORE" 
            delay={0.1}
          />
          <FeatureTile 
            img="/img/photo7.webp" 
            title="Absolute Precision" 
            subtitle="THE TRACK" 
            delay={0.2}
          />
          <FeatureTile 
            img="/img/photo9.webp" 
            title="Dynamic Agility" 
            subtitle="THE SPRINT" 
            delay={0.3}
          />
          <FeatureTile 
            img="/img/racing-action.png" 
            title="Lightning Speed" 
            subtitle="THE FINISH" 
            delay={0.4}
          />
        </div>

        {/* Performance Statistics Bar */}
        {/* Performance Statistics Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="about-stats-bar"
        >
          <div className="stat-item">
            <span className="stat-value gold-text">12,000+</span>
            <span className="stat-label">Daily Sprints</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">System Uptime</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value gold-text">$5M+</span>
            <span className="stat-label">Prizes Paid</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Global Support</span>
          </div>
        </motion.div>

        {/* Bottom Detailed Content */}
        <div className="about-footer-content">
          <div className="footer-visual">
            <div className="shield-wrapper">
              <div className="shield-orbit-1" />
              <div className="shield-orbit-2" />
              <div className="shield-icon">
                <i className="ri-shield-flash-line" />
              </div>
            </div>
          </div>
          <div className="footer-text">
            <h3 className="footer-title">Enterprise-Grade Infrastructure</h3>
            <p className="footer-description">
              Our platform is built on advanced racing infrastructure, ensuring that every transaction is secure, every race is fair, and every reward is delivered instantly. Experience the next level of elite racing today.
            </p>
            <div className="footer-badges">
              <span className="badge-item"><i className="ri-checkbox-circle-fill" /> Secure Vault</span>
              <span className="badge-item"><i className="ri-checkbox-circle-fill" /> Real-time Odds</span>
              <span className="badge-item"><i className="ri-checkbox-circle-fill" /> Instant Settlement</span>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .about-section {
          position: relative;
          padding: 120px 0;
          background: #030303;
          overflow: hidden;
        }

        /* ── Background Accents ── */
        .about-bg-accent-1 {
          position: absolute;
          top: -10%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,184,0,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .about-bg-accent-2 {
          position: absolute;
          bottom: -10%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,98,0,0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .about-container {
          max-width: 1650px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* ── Header Centered ── */
        .about-header-centered {
          max-width: 900px;
          margin: 0 auto 80px auto;
          text-align: center;
        }
        .section-label {
          display: inline-block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: #FFB800;
          margin-bottom: 20px;
          position: relative;
          padding: 0 20px;
        }
        .section-label::before, .section-label::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #FFB800;
          border-radius: 50%;
          box-shadow: 0 0 10px #FFB800;
        }
        .section-label::before { left: 0; }
        .section-label::after { right: 0; }

        .section-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 24px 0;
          letter-spacing: -1.5px;
        }
        .gold-text-glow {
          background: linear-gradient(90deg, #FFB800, #FF6200, #FFB800);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 6s linear infinite;
        }

        .section-description.centered {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin: 0 auto;
          max-width: 600px;
          font-weight: 500;
        }

        /* ── Feature Tiles ── */
        .about-tiles-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
          margin-bottom: 100px;
        }
        @media (min-width: 640px) {
          .about-tiles-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .about-tiles-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .feature-tile-wrapper {
          position: relative;
          aspect-ratio: 3/4;
        }
        .feature-tile-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 40px;
          overflow: hidden;
          background: #050505;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .feature-tile-wrapper:hover .feature-tile-inner {
          transform: translateY(-15px) scale(1.02);
          border-color: rgba(255,184,0,0.4);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }
        .feature-tile-img {
          object-fit: cover;
          transition: transform 1s ease;
          opacity: 0.8;
        }
        .feature-tile-wrapper:hover .feature-tile-img {
          transform: scale(1.15);
          opacity: 1;
        }
        .feature-tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
          z-index: 2;
        }
        .feature-tile-content {
          position: absolute;
          bottom: 35px;
          left: 35px;
          right: 35px;
          z-index: 5;
        }
        .feature-tile-subtitle {
          display: block;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #FFB800;
          margin-bottom: 8px;
          opacity: 0.8;
        }
        .feature-tile-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #fff;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .feature-tile-border {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          transition: border-color 0.3s ease;
        }
        .feature-tile-wrapper:hover .feature-tile-border {
          border-color: rgba(255,184,0,0.3);
        }

        /* ── Stats Bar ── */
        .about-stats-bar {
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          padding: 40px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 120px;
        }
        @media (min-width: 1024px) {
          .about-stats-bar {
            grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
            gap: 20px;
          }
        }
        .stat-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.5px;
          font-variant-numeric: tabular-nums;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
        }
        .stat-divider {
          width: 1px;
          height: 60px;
          background: rgba(255,255,255,0.1);
          display: none;
        }
        @media (min-width: 1024px) {
          .stat-divider { display: block; }
        }

        /* ── Footer Content ── */
        .about-footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .about-footer-content {
            grid-template-columns: 0.8fr 1.2fr;
            gap: 100px;
          }
        }
        .footer-visual {
          display: flex;
          justify-content: center;
        }
        .shield-wrapper {
          position: relative;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shield-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #FFB800, #FF6200);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: #000;
          box-shadow: 0 15px 40px rgba(255,184,0,0.3);
          z-index: 10;
        }
        .shield-orbit-1, .shield-orbit-2 {
          position: absolute;
          border: 1px dashed rgba(255,184,0,0.2);
          border-radius: 50%;
        }
        .shield-orbit-1 {
          width: 100%;
          height: 100%;
          animation: spin 15s linear infinite;
        }
        .shield-orbit-2 {
          width: 70%;
          height: 70%;
          animation: spin 10s linear infinite reverse;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .footer-text {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .footer-title {
          font-size: 3rem;
          font-weight: 900;
          color: #fff;
          margin: 0;
          letter-spacing: -2px;
          line-height: 1;
        }
        .footer-description {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.8;
          margin: 0;
          max-width: 600px;
          font-weight: 500;
        }
        .footer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .badge-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          background: rgba(255,255,255,0.03);
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .badge-item i { color: #FFB800; }
      `}</style>
    </section>
  );
};

export default AboutBEPVaultSection;

