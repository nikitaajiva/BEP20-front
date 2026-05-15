"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const FooterLink = ({ href, label }) => (
  <a href={href} className="footer-link">{label}</a>
);

const SocialIcon = ({ icon, href }) => (
  <a href={href} target="_blank" rel="noreferrer" className="social-icon">
    <i className={icon} />
  </a>
);

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      {/* Top Gold Accent */}
      <div className="footer-top-bar" />

      {/* Main Content */}
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo-link">
              <div className="relative w-40 h-[50px]">
                <Image src="/img/main-logo.avif" alt="Toking Hoofborn Logo" fill className="object-contain object-left" />
              </div>
            </Link>
            <p className="footer-brand-desc">
              The premier elite horse racing community platform. Participate in global pools, grow your racing stable, and experience the thrill of the track.
            </p>
            <div className="footer-socials">
              <SocialIcon icon="ri-telegram-line" href="https://t.me/TokingHoofbornOfficial" />
              <SocialIcon icon="ri-twitter-x-line" href="https://twitter.com/TokingHoofborn" />
              <SocialIcon icon="ri-youtube-line" href="https://youtube.com/@TokingHoofborn" />
              <SocialIcon icon="ri-facebook-circle-line" href="https://facebook.com/TokingHoofborn" />
              <SocialIcon icon="ri-instagram-line" href="https://instagram.com/TokingHoofborn" />
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Platform</h4>
            <FooterLink href="/#about" label="About The Track" />
            <FooterLink href="/#features" label="Key Features" />
            <FooterLink href="/#how-it-works" label="How It Works" />
            <FooterLink href="/#affiliate" label="Stable Program" />
            <FooterLink href="/#faq" label="FAQ" />
          </div>

          {/* Account Links */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Account</h4>
            <FooterLink href="/login" label="Member Login" />
            <FooterLink href="/sign-up" label="Get Started" />
            <FooterLink href="/support/dashboard" label="Dashboard" />
            <FooterLink href="https://linktr.ee/TokingHoofbornOfficial" label="Community Hub" />
          </div>

          {/* Legal + Newsletter */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Legal</h4>
            <FooterLink href="/disclaimer" label="Disclaimer" />
            <FooterLink href="/privacy-policy" label="Privacy Policy" />
            <FooterLink href="/terms-conditions" label="Terms & Conditions" />

            <div className="footer-newsletter">
              <p className="newsletter-label">Stay Updated</p>
              <form onSubmit={e => { e.preventDefault(); e.target.reset(); }} className="newsletter-form">
                <input type="email" placeholder="your@email.com" required className="newsletter-input" />
                <button type="submit" className="newsletter-btn">
                  <i className="ri-arrow-right-line" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">© {currentYear} Toking Hoofborn. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot" />
            <span className="status-text">All systems operational</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .footer-section {
          background: #000;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .footer-top-bar {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 184, 0, 0.4), transparent);
        }

        .footer-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
        }
        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .footer-grid { grid-template-columns: 1.8fr 1fr 1fr 1.2fr; }
        }

        /* ── Brand Column ── */
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .footer-logo-link { display: block; text-decoration: none; }
        .footer-brand-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          line-height: 1.7;
          max-width: 280px;
          margin: 0;
        }
        .footer-socials {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .social-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFB800;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          background: rgba(255, 184, 0, 0.1);
          border-color: rgba(255, 184, 0, 0.4);
          transform: translateY(-3px);
        }

        /* ── Nav Columns ── */
        .footer-nav-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .footer-col-title {
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin: 0 0 8px 0;
        }
        .footer-link {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.3s;
          line-height: 1;
        }
        .footer-link:hover { color: #FFB800; }

        /* ── Newsletter ── */
        .footer-newsletter {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .newsletter-label {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }
        .newsletter-form {
          display: flex;
          gap: 8px;
        }
        .newsletter-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          min-width: 0;
          transition: border-color 0.3s;
        }
        .newsletter-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .newsletter-input:focus { border-color: rgba(255, 184, 0, 0.4); }
        .newsletter-btn {
          background: #FFB800;
          color: #000;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .newsletter-btn:hover {
          background: #FF6200;
          transform: translateX(2px);
        }

        /* ── Bottom Bar ── */
        .footer-bottom-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .footer-bottom-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-copyright {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.25);
          margin: 0;
        }
        .footer-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background: #00e676;
          border-radius: 50%;
          box-shadow: 0 0 8px #00e676;
          animation: blink-status 2s infinite;
        }
        .status-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.25);
        }
        @keyframes blink-status { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </footer>
  );
};

export default LandingFooter;

