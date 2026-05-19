"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ── Top Ticker Bar ────────────────────────────────────────────────────────
const TopTicker = () => {
  const tickerItems = [
    { text: "Live Race: Kentucky Derby", highlight: "Odds 4/1 ▲ HOT" },
    { text: "Track Rewards", highlight: "Daily Payouts" },
    { text: "Global Cup", highlight: "$50,000 Prize Pool" },
    { text: "Active Racers", highlight: "10,000+" },
    { text: "Total Prizes Paid", highlight: "$5M+" },
    { text: "Certified Security", highlight: "Audited ✓" },
    { text: "Race Uptime", highlight: "100%" },
    { text: "Settlement", highlight: "Instant ⚡" },
  ];

  return (
    <div className="navbar-top-ticker">
      <div className="ticker-fade-left" />
      <div className="ticker-fade-right" />
      <div className="ticker-scroll-content">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-dot" />
            <span className="ticker-text">{item.text}</span>
            <span className="ticker-highlight">{item.highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Navbar ─────────────────────────────────────────────────────────────
const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Affiliate", href: "#affiliate" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className={`landing-header ${scrolled ? "header-scrolled" : ""}`}>
      <TopTicker />
      
      <nav className="navbar-main">
        <div className="navbar-container">
          
          {/* Logo */}
          <Link href="/" className="navbar-logo-link">
            <motion.div 
              className="logo-wrapper"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="logo-img-container">
                <Image 
                  src="/img/main-logo.avif" 
                  alt="Toking Hoofborn Logo" 
                  fill 
                  className="object-contain object-left logo-img" 
                  priority 
                />
              </div>
              <div className="brand-text-wrapper">
                <span className="brand-name">Toking<span className="gold-text">Hoofborn</span></span>
              </div>
              <div className="logo-glint" />
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="navbar-desktop-links">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="nav-link">
                <span className="link-text">{l.label}</span>
                <span className="link-underline" />
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            <Link href="/login" className="no-underline">
              <button className="nav-btn-ghost">
                <span>LOGIN</span>
              </button>
            </Link>
            <Link href="/sign-up" className="no-underline">
              <button className="nav-btn-fire">
                GET STARTED
                <div className="btn-glow-pulse" />
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`navbar-toggle ${menuOpen ? "is-active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bar-1" />
            <span className="bar-2" />
            <span className="bar-3" />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="navbar-overlay"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="navbar-mobile-drawer"
              >
                <div className="drawer-content">
                  <div className="drawer-header">
                    <div className="logo-wrapper">
                      <div className="logo-img-container" style={{ width: '40px', height: '40px' }}>
                        <Image 
                          src="/img/main-logo.avif" 
                          alt="Toking Hoofborn Logo" 
                          fill 
                          className="object-contain object-left logo-img" 
                        />
                      </div>
                      <span className="brand-name" style={{ fontSize: '18px' }}>Toking<span className="gold-text">Hoofborn</span></span>
                    </div>
                  </div>
                  
                  <div className="drawer-links">
                    {navLinks.map((l, i) => (
                      <motion.a 
                        key={l.label} 
                        href={l.href}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.2 }}
                        onClick={() => setMenuOpen(false)}
                        className="drawer-link"
                      >
                        <span className="drawer-link-text">{l.label}</span>
                        <i className="ri-arrow-right-up-line" />
                      </motion.a>
                    ))}
                  </div>

                  <div className="drawer-footer">
                    <Link href="/login" className="no-underline w-full" onClick={() => setMenuOpen(false)}>
                      <button className="nav-btn-ghost w-full py-4 text-sm font-bold">LOGIN</button>
                    </Link>
                    <Link href="/sign-up" className="no-underline w-full" onClick={() => setMenuOpen(false)}>
                      <button className="nav-btn-fire w-full py-4 text-sm font-black">GET STARTED</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <style jsx global>{`
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 9999;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── Top Ticker ── */
        .navbar-top-ticker {
          height: 32px;
          background: #000;
          border-bottom: 1px solid rgba(255,184,0,0.08);
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          z-index: 100;
        }
        .header-scrolled .navbar-top-ticker {
          height: 0;
          opacity: 0;
          border-bottom-width: 0;
        }
        .ticker-scroll-content {
          display: flex;
          gap: 60px;
          padding: 0 40px;
          animation: tickerSlide 45s linear infinite;
          white-space: nowrap;
        }
        @keyframes tickerSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .ticker-dot {
          width: 4px;
          height: 4px;
          background: #FFB800;
          border-radius: 50%;
          box-shadow: 0 0 10px #FFB800;
        }
        .ticker-text { color: rgba(255,255,255,0.4); }
        .ticker-highlight { color: #FFB800; }
        .ticker-fade-left, .ticker-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 150px;
          z-index: 5;
          pointer-events: none;
        }
        .ticker-fade-left { left: 0; background: linear-gradient(to right, #000, transparent); }
        .ticker-fade-right { right: 0; background: linear-gradient(to left, #000, transparent); }

        /* ── Navbar Main ── */
        .navbar-main {
          padding: 32px 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .header-scrolled .navbar-main {
          padding: 16px 0;
          background: rgba(8, 8, 8, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255,184,0,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }

        .navbar-container {
          max-width: 1650px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          position: relative;
        }
        .logo-img-container {
          position: relative;
          width: 52px;
          height: 52px;
          transition: all 0.3s ease;
        }
        .header-scrolled .logo-img-container {
          width: 44px;
          height: 44px;
        }
        .brand-text-wrapper {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.5px;
          line-height: 1;
          text-transform: none;
        }
        .gold-text {
          color: #ff6600;
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
        }
        .logo-glint {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          background-size: 200% 200%;
          animation: logoGlint 4s infinite;
        }
        @keyframes logoGlint {
          0% { background-position: -200% -200%; }
          30% { background-position: 200% 200%; }
          100% { background-position: 200% 200%; }
        }

        .navbar-desktop-links {
          display: none;
          gap: 12px;
          background: rgba(255,255,255,0.03);
          padding: 6px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        @media (min-width: 1200px) {
          .navbar-desktop-links { display: flex; }
        }

        .nav-link {
          position: relative;
          padding: 10px 24px;
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-decoration: none;
          transition: all 0.3s ease;
          border-radius: 100px;
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,184,0,0.08);
        }
        .link-underline {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #FFB800;
          transition: width 0.3s ease;
          border-radius: 2px;
          box-shadow: 0 0 10px #FFB800;
        }
        .nav-link:hover .link-underline { width: 12px; }

        .navbar-actions {
          display: none;
          gap: 20px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .navbar-actions { display: flex; }
        }

        /* ── Buttons ── */
        .nav-btn-fire {
          position: relative;
          background: linear-gradient(135deg, #FFB800 0%, #FF6200 100%) !important;
          color: #000 !important;
          border: none !important;
          padding: 14px 32px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 25px rgba(255,98,0,0.3);
        }
        .nav-btn-fire:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 35px rgba(255,98,0,0.5);
        }
        .btn-glow-pulse {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          box-shadow: 0 0 20px rgba(255,184,0,0.4);
          animation: btnPulse 2s infinite;
          pointer-events: none;
        }
        @keyframes btnPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 0; }
        }

        .nav-btn-ghost {
          background: transparent !important;
          color: rgba(255,255,255,0.7) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          padding: 13px 30px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .nav-btn-ghost:hover {
          border-color: #FFB800 !important;
          color: #FFB800 !important;
          background: rgba(255,184,0,0.05) !important;
        }

        /* ── Mobile Hamburger ── */
        .navbar-toggle {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          z-index: 10000;
          transition: all 0.3s;
          position: relative;
        }
        .navbar-toggle.is-active {
          position: fixed;
          top: 32px;
          right: 30px;
          background: rgba(255,184,0,0.1);
          border-color: #FFB800;
        }
        .header-scrolled .navbar-toggle.is-active {
          top: 16px;
        }
        .navbar-toggle:hover { background: rgba(255,184,0,0.1); border-color: #FFB800; }
        @media (min-width: 1200px) {
          .navbar-toggle { display: none; }
        }
        .navbar-toggle span {
          width: 24px;
          height: 2px;
          background: #FFB800;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 2px;
        }
        .navbar-toggle.is-active .bar-1 { transform: translateY(8px) rotate(45deg); }
        .navbar-toggle.is-active .bar-2 { opacity: 0; transform: translateX(10px); }
        .navbar-toggle.is-active .bar-3 { transform: translateY(-8px) rotate(-45deg); }

        /* ── Mobile Drawer ── */
        .navbar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 9000;
        }
        .navbar-mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 320px;
          height: 100vh;
          background: rgba(5, 5, 5, 0.95);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          z-index: 9500;
          padding: 30px;
          box-shadow: -20px 0 80px rgba(0,0,0,0.9);
          border-left: 1px solid rgba(255,184,0,0.1);
          overflow-y: auto;
        }
        .drawer-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,184,0,0.1);
        }
        .drawer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 40px;
        }
        .drawer-link {
          font-size: 1.1rem;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: all 0.3s;
        }
        .drawer-link:hover { color: #FFB800; transform: translateX(10px); }
        .drawer-link i { color: #FFB800; font-size: 1.2rem; transition: all 0.3s; }
        .drawer-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-top: 40px;
        }

        @media (max-width: 480px) {
          .navbar-container { padding: 0 20px; }
          .logo-wrapper { width: 140px; }
          .navbar-mobile-drawer { max-width: 100%; padding: 30px; }
        }
      `}</style>
    </header>
  );
};

export default LandingNavbar;

