"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "What is The Elite Track?",
    a: "The Elite Track is a premier horse racing community platform. Members participate in global racing pools and earn rewards from active race outcomes, plus cascading stable bonuses across 5 levels.",
  },
  {
    q: "How do I start earning?",
    a: "Simply create your account, choose your preferred racing pool, and your participation is instantly activated. Rewards begin accumulating as soon as the next race on the circuit completes.",
  },
  {
    q: "What are racing pools and why do they matter?",
    a: "Racing pools are global participation buckets for elite races. They ensure deep liquidity and fair odds for all participants, allowing for consistent daily rewards and professional-grade racing action.",
  },
  {
    q: "How does the 5-level stable program work?",
    a: "When you refer someone to our track, you earn a reward every time they participate. This cascades 5 levels deep — meaning you also earn from the people your referrals bring in, all the way to level 5.",
  },
  {
    q: "When and how can I withdraw my winnings?",
    a: "Your racing rewards are claimable at any time — 24/7, with instant settlement. There are no lock-up periods for winnings. You can choose to claim daily, reinvest, or accumulate over time.",
  },
  {
    q: "What returns can I realistically expect?",
    a: "Participants earn daily rewards based on real racing pool performance. On top of this, active community builders unlock additional rewards from the 5-tier stable system. Performance is subject to race conditions.",
  },
];

const FAQItem = ({ q, a, open, onClick }) => (
  <div className={`faq-item-card ${open ? "is-open" : ""}`} onClick={onClick}>
    <div className="faq-question-box">
      <span className="faq-question">{q}</span>
      <div className="faq-toggle-icon">
        <span className="icon-bar bar-1" />
        <span className="icon-bar bar-2" />
      </div>
    </div>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="faq-answer-wrapper"
        >
          <div className="faq-answer-content">
            <p>{a}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        
        {/* Header */}
        <div className="faq-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="faq-badge">INSIGHTS</span>
            <h2 className="faq-title">
              Common <span className="gold-text">Questions</span>
            </h2>
            <p className="faq-subtitle">Everything you need to know about participating on the track and earning daily rewards.</p>
          </motion.div>
        </div>

        {/* FAQ Grid */}
        <div className="faq-list">
          {faqs.map((f, i) => (
            <FAQItem 
              key={i} 
              q={f.q} 
              a={f.a} 
              open={openIdx === i} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)} 
            />
          ))}
        </div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="faq-support-box"
        >
          <div className="support-glass">
            <div className="support-icon-wrapper">
              <i className="ri-customer-service-2-fill" />
            </div>
            <h3 className="support-title">Still Have Questions?</h3>
            <p className="support-desc">Our community team is available 24/7 to help you get started and answer any questions.</p>
            <a href="https://linktr.ee/BEPVaultOfficial" target="_blank" rel="noreferrer" className="no-underline">
              <button className="support-btn">JOIN COMMUNITY HUB</button>
            </a>
          </div>
        </motion.div>

      </div>

      <style jsx global>{`
        .faq-section {
          position: relative;
          padding: 120px 0;
          background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), 
                      url('/img/faq-bg.png');
          background-attachment: fixed;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .faq-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* ── Header ── */
        .faq-header {
          margin-bottom: 80px;
        }
        .faq-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          color: #FFB800;
          letter-spacing: 5px;
          margin-bottom: 24px;
        }
        .faq-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 24px 0;
          letter-spacing: -2px;
        }
        .faq-subtitle {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.4);
          line-height: 1.7;
        }

        /* ── FAQ Items ── */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 100px;
        }

        .faq-item-card {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.4s ease;
          overflow: hidden;
        }
        .faq-item-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .faq-item-card.is-open {
          background: rgba(255, 184, 0, 0.03);
          border-color: rgba(255, 184, 0, 0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .faq-question-box {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .faq-question {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          transition: color 0.3s ease;
        }
        .faq-item-card.is-open .faq-question { color: #FFB800; }

        .faq-toggle-icon {
          position: relative;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
        .icon-bar {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.4);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bar-1 { width: 14px; height: 2px; }
        .bar-2 { width: 2px; height: 14px; }
        
        .faq-item-card.is-open .bar-1 { background: #FFB800; transform: translate(-50%, -50%) rotate(180deg); }
        .faq-item-card.is-open .bar-2 { background: #FFB800; transform: translate(-50%, -50%) rotate(90deg); opacity: 0; }

        .faq-answer-wrapper {
          overflow: hidden;
        }
        .faq-answer-content {
          padding: 0 32px 32px;
        }
        .faq-answer-content p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.8;
          margin: 0;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* ── Support Box ── */
        .faq-support-box {
          position: relative;
        }
        .support-glass {
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }
        .support-icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(255, 184, 0, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          font-size: 28px;
          color: #FFB800;
          border: 1px solid rgba(255, 184, 0, 0.2);
        }
        .support-title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .support-desc {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 40px 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .support-btn {
          background: transparent !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          padding: 16px 40px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .support-btn:hover {
          border-color: #FFB800 !important;
          color: #FFB800 !important;
          background: rgba(255, 184, 0, 0.05) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
};

export default FAQSection;

