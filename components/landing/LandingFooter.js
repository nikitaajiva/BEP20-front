"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const FooterLink = ({ href, label }) => (
  <a href={href} style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.9rem", textDecoration:"none", transition:"color 0.3s", display:"block", marginBottom:"0.7rem" }}
    onMouseOver={e => e.currentTarget.style.color="#ffd700"}
    onMouseOut={e => e.currentTarget.style.color="rgba(255,255,255,0.5)"}
  >{label}</a>
);

const SocialIcon = ({ icon, href }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{
    width:38, height:38, borderRadius:"50%", background:"rgba(255,215,0,0.08)",
    border:"1px solid rgba(255,215,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center",
    textDecoration:"none", transition:"all 0.3s",
  }}
  onMouseOver={e => { e.currentTarget.style.background="rgba(255,215,0,0.2)"; e.currentTarget.style.borderColor="rgba(255,215,0,0.5)"; e.currentTarget.style.transform="translateY(-3px)"; }}
  onMouseOut={e => { e.currentTarget.style.background="rgba(255,215,0,0.08)"; e.currentTarget.style.borderColor="rgba(255,215,0,0.15)"; e.currentTarget.style.transform="translateY(0)"; }}>
    <i className={icon} style={{ color:"#ffd700", fontSize:"1.1rem" }} />
  </a>
);

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background:"#000", borderTop:"1px solid rgba(255,215,0,0.1)", position:"relative", overflow:"hidden" }}>
      {/* Background gradient */}
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"600px", height:"300px", background:"radial-gradient(ellipse,rgba(255,215,0,0.04) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Main Footer Content */}
      <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"5rem 24px 3rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"3rem" }} className="footer-grid">
          
          {/* Brand Column */}
          <div>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none", marginBottom:"1.5rem" }}>
              <div style={{ position:"relative", width:40, height:40, filter:"drop-shadow(0 0 8px rgba(255,215,0,0.4))" }}>
                <Image src="/bepvault_logo.png" alt="BEPVault" fill style={{ objectFit:"contain" }} />
              </div>
              <span style={{ fontSize:"1.4rem", fontWeight:900, color:"#ffd700", fontFamily:"'Saira Stencil One', sans-serif" }}>BEPVault</span>
            </Link>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.92rem", lineHeight:1.7, marginBottom:"2rem", maxWidth:"280px" }}>
              The premier BEP20 BNB liquidity platform. Earn daily returns, grow your community, and build lasting wealth on the Binance Smart Chain.
            </p>
            {/* Social icons */}
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap" }}>
              <SocialIcon icon="ri-telegram-line" href="https://t.me/BEPVaultOfficial" />
              <SocialIcon icon="ri-twitter-x-line" href="https://twitter.com/BEPVault" />
              <SocialIcon icon="ri-youtube-line" href="https://youtube.com/@BEPVault" />
              <SocialIcon icon="ri-facebook-circle-line" href="https://facebook.com/BEPVault" />
              <SocialIcon icon="ri-instagram-line" href="https://instagram.com/BEPVault" />
              <SocialIcon icon="ri-linkedin-box-line" href="https://linkedin.com/company/BEPVault" />
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ color:"#fff", fontWeight:800, fontSize:"1rem", marginBottom:"1.5rem", textTransform:"uppercase", letterSpacing:"1px" }}>Platform</h4>
            <FooterLink href="/#about" label="About BEPVault" />
            <FooterLink href="/#features" label="Key Features" />
            <FooterLink href="/#how-it-works" label="How It Works" />
            <FooterLink href="/#affiliate" label="Community Program" />
            <FooterLink href="/#faq" label="FAQ" />
          </div>

          {/* Account Links */}
          <div>
            <h4 style={{ color:"#fff", fontWeight:800, fontSize:"1rem", marginBottom:"1.5rem", textTransform:"uppercase", letterSpacing:"1px" }}>Account</h4>
            <FooterLink href="/sign-in" label="Member Login" />
            <FooterLink href="/sign-up" label="Get Started" />
            <FooterLink href="/support/dashboard" label="Dashboard" />
            <FooterLink href="https://linktr.ee/BEPVaultOfficial" label="Linktree" />
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color:"#fff", fontWeight:800, fontSize:"1rem", marginBottom:"1.5rem", textTransform:"uppercase", letterSpacing:"1px" }}>Legal</h4>
            <FooterLink href="/disclaimer" label="Disclaimer" />
            <FooterLink href="/privacy-policy" label="Privacy Policy" />
            <FooterLink href="/terms-conditions" label="Terms & Conditions" />
            {/* Newsletter mini */}
            <div style={{ marginTop:"1.5rem" }}>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.85rem", fontWeight:600, marginBottom:"0.8rem" }}>Subscribe for updates</div>
              <form onSubmit={e => { e.preventDefault(); e.target.reset(); }} style={{ display:"flex", gap:"0.5rem" }}>
                <input type="email" placeholder="your@email.com" required style={{
                  flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,215,0,0.2)",
                  borderRadius:"6px", padding:"0.55rem 0.8rem", color:"#fff", fontSize:"0.82rem",
                  outline:"none", minWidth:0,
                }} />
                <button type="submit" style={{
                  background:"linear-gradient(135deg,#ffd700,#ff8c00)", color:"#000",
                  border:"none", borderRadius:"6px", padding:"0.55rem 0.8rem",
                  fontWeight:800, fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap",
                }}>→</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop:"1px solid rgba(255,215,0,0.08)", maxWidth:"1280px", margin:"0 auto", padding:"1.8rem 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.85rem", margin:0 }}>
          © {currentYear} BEPVault. All rights reserved. Built on Binance Smart Chain.
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#00e676", display:"inline-block", boxShadow:"0 0 8px #00e676", animation:"livePulse 1.5s infinite" }} />
          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.82rem" }}>All systems operational</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
};
export default LandingFooter;
