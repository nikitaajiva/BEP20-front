import React from "react";
import {
  FaYoutube,
  FaTelegram,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

import Link from "next/link";
export default function SocialMediaAlert({ isOpen, onClose }) {
  if (!isOpen) return null;

  const socials = [
    {
      href: "https://youtube.com/@BEPVaultChannel",
      icon: <FaYoutube style={{ width: "30px", height: "30px" }} />,
      color: "#FF0000",
    },
    {
      href: "https://t.me/BEPVaultOfficial",
      icon: <FaTelegram style={{ width: "30px", height: "30px" }} />,
      color: "#29A9EA",
    },

    {
      href: "https://instagram.com/BEPVault",
      icon: <FaInstagram style={{ width: "30px", height: "30px" }} />,
      color: "#C13584",
    },
    { href: "https://x.com/BEPVault", icon: <FaXTwitter />, color: "#000000" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgb(0 0 0 / 90%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // 🔥 increased
        width: "100%",
      }}
      onClick={onClose}
    >
      <div
        className="hide-scrollbar"
        style={{
          background: "#000000",
          borderRadius: "22px",
          maxWidth: "1200px",
          width: "90%",
          position: "relative",
          zIndex: 10000,
          boxShadow: "0 8px 32px 0 rgba(255, 215, 0, 0.1)",
          maxHeight: "90vh",
          WebkitOverflowScrolling: "touch",
          border: "1px solid rgba(255, 215, 0, 0.2)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            marginLeft: "auto",
            display: "block",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "1rem",
            zIndex: 10001,
          }}
        >
          ×
        </button>

        {/* <div style={{ textAlign: "center" }}>
          <h4 style={{ color: "#fff", marginBottom: "1rem" }}>
            Don't Miss Important Updates! 🚀
          </h4>
          <p style={{ color: "#b3baff", marginBottom: "2rem" }}>
            Follow us on social media to stay updated with the latest news,
            announcements, and exclusive offers.
          </p>

          <div
            className="ImportantUpdates"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            {socials.map(({ href, icon, color }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className=" flex items-center justify-center text-white hover:opacity-80 transition"
                style={{ backgroundColor: color }}
              >
                <span className="text-xl">{icon}</span>
              </a>
            ))}
          </div>

          <button
            onClick={onClose}
            className="btn w-100"
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              color: "#4f8cff",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              borderRadius: "12px",
              padding: "0.75rem",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            Got it!
          </button>
        </div> */}
        {/* new social media alert     =-======================================= */}
        {/* <section className="relative  py-16 px-6  text-center overflow-hidden popupbackground">
          <div className="relative z-10">
            <img
              src="/assets/img/logo.png"
              alt="BEPVault Logo"
              width={150}
              height={40}
              style={{ objectFit: "contain" }}
            />

            <h2 className="campaign-heading mt-5">
              BEPVAULT TELEGRAM REFERRAL
            </h2>

            <h1 className="campaign-text mb-6">CAMPAIGN IS LIVE!</h1>


            <p className="campaign-subtext">
              INVITE YOUR FRIENDS. CLIMB THE LEADERBOARD. EARN USDT EVERY WEEK.{" "}
              <br className="hidden md:block" />
              TOP REFERRERS WILL TAKE HOME MASSIVE MONTHLY REWARDS.
            </p>

        
            <button className="my-1" onClick={onClose}>
              <Link
                target="_blank"
                href="https://t.me/BEPVaultOfficial"
                className="campaign-btn"
              >
                JOIN THE CAMPAIGN NOW
              </Link>
            </button>

   
            <p className="text-gray-400 text-xs mt-6">
              ENDS SEPTEMBER 17TH <br />
              REWARDS PAID IN USDT • FAIR PLAY RULES APPLY
            </p>
          </div>
        </section> */}
        <section className="relative py-12 px-6 text-center overflow-hidden popupbackground">
          <div className="relative z-10 max-w-4xl mx-auto">
            <img
              src="/assets/img/logo.png"
              alt="BEPVault Logo"
              width={140}
              height={40}
              style={{ objectFit: "contain", margin: "0 auto" }}
            />

            <h2
              style={{
                marginTop: "1.5rem",
                color: "#fff",
                fontSize: "1.8rem",
                fontWeight: "700",
              }}
            >
              BEPVault Platform Upgrade Completed
            </h2>

            <p
              style={{
                marginTop: "1.5rem",
                color: "#cfd6ff",
                lineHeight: "1.7",
                fontSize: "0.95rem",
                textAlign: "left",
              }}
            >
              Dear BEPVault Community,
              <br />
              <br />
              We are pleased to confirm that all core upgrades and system-level
              enhancements across the BEPVault platform have been successfully
              completed.
              <br />
              <br />
              Our team has implemented deep infrastructure improvements
              including IPFS optimization, security hardening, wallet
              segregation, transaction routing, load balancing, and
              on-chain/off-chain synchronization.
              <br />
              <br />
              <strong>As a result:</strong>
              <br />
              • Platform is fully updated
              <br />
              • Dashboard balances are correctly synchronized
              <br />
              • Transaction pipelines are stable and secure
              <br />
              • Performance and reliability are significantly improved
              <br />
              <br />
              <strong>
                From Sunday, 1st February 2026, BEPVault will be fully live and
                operating at full capacity.
              </strong>
              <br />
              <br />
              This was a foundational upgrade designed to future-proof BEPVault
              and deliver a safer, faster, and more resilient ecosystem.
              <br />
              <br />
              <strong>This marks a major milestone.</strong>
              <br />
              The next phase begins now.
            </p>

            <p
              style={{
                marginTop: "1.5rem",
                color: "#9aa3ff",
                fontSize: "0.85rem",
              }}
            >
              — Team BEPVault
            </p>

            <button
              onClick={onClose}
              style={{
                marginTop: "2rem",
                background: "rgba(255, 215, 0, 0.15)",
                color: "#ffd700",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                borderRadius: "12px",
                padding: "0.75rem 2rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Proceed to Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
