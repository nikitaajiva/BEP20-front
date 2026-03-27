"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Affiliate", href: "#affiliate" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999,
        padding: scrolled ? "0.6rem 0" : "1.2rem 0",
        background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,215,0,0.15)" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ position: "relative", width: "42px", height: "42px", filter: "drop-shadow(0 0 8px rgba(255,215,0,0.4))" }}>
              <Image src="/bepvault_logo.png" alt="BEPVault" fill style={{ objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffd700", fontFamily: "'Saira Stencil One', sans-serif", letterSpacing: "1px" }}>
              BEPVault
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="nav-link-item" style={{
                color: "rgba(255,255,255,0.8)", fontSize: "0.92rem", fontWeight: 600,
                textDecoration: "none", position: "relative", transition: "color 0.3s",
              }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="nav-desktop" style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <Link href="/login" style={{ textDecoration:"none" }}>
              <button style={{
                background: "transparent", color: "#fff", border: "1px solid rgba(255,215,0,0.4)",
                padding: "0.55rem 1.4rem", borderRadius: "6px", fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer", transition: "all 0.3s",
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor="#ffd700"; e.currentTarget.style.color="#ffd700"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor="rgba(255,215,0,0.4)"; e.currentTarget.style.color="#fff"; }}>
                Login
              </button>
            </Link>
          </div>

          {/* Hamburger */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
            background: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "6px",
            padding: "0.4rem 0.6rem", cursor: "pointer", color: "#ffd700", fontSize: "1.4rem",
          }}>☰</button>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,215,0,0.15)", padding: "1.5rem 1.5rem 2rem",
            display: "flex", flexDirection: "column", gap: "1.2rem",
          }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{
                color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", fontWeight: 600,
                textDecoration: "none", borderBottom: "1px solid rgba(255,215,0,0.08)", paddingBottom: "0.8rem",
              }}>{l.label}</a>
            ))}
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
              <Link href="/login" style={{ flex: 1, textDecoration: "none" }}>
                <button style={{ width: "100%", background: "transparent", color: "#fff", border: "1px solid rgba(255,215,0,0.4)", padding: "0.7rem", borderRadius: "6px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Login</button>
              </Link>
              <Link href="/sign-up" style={{ flex: 1, textDecoration: "none" }}>
                <button style={{ width: "100%", background: "linear-gradient(135deg,#ffd700,#ff8c00)", color: "#000", border: "none", padding: "0.7rem", borderRadius: "6px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>Get Started</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <style jsx global>{`
        .nav-link-item:hover { color: #ffd700 !important; }
        .nav-link-item::after {
          content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
          background: linear-gradient(90deg,#ffd700,#ff8c00);
          transition: width 0.3s ease; border-radius: 2px;
        }
        .nav-link-item:hover::after { width: 100%; }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
        }
        @media (min-width: 901px) {
          .nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
};
export default LandingNavbar;
