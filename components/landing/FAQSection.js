"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "What is BEPVault?",
    a: "BEPVault is a premier decentralized community liquidity platform built exclusively on the Binance Smart Chain. Members provide BEP20 BNB liquidity to institutional-grade pools and earn up to 0.6% in daily compounded returns, plus cascading referral bonuses across 5 levels.",
  },
  {
    q: "How do I start earning with BEP20 BNB?",
    a: "Simply create your account, connect your BEP20-compatible wallet (such as MetaMask or Trust Wallet), deposit BNB, and your position is instantly activated. Daily rewards begin accumulating from your very first block confirmation.",
  },
  {
    q: "What is BEP20 BNB and why does it matter?",
    a: "BEP20 is the token standard on the Binance Smart Chain — the same standard as BNB. It offers near-instant transactions, extremely low gas fees (often under $0.01), and is natively supported by thousands of DeFi protocols, making it ideal for high-frequency liquidity operations.",
  },
  {
    q: "How does the 5-level community program work?",
    a: "When you refer someone to BEPVault, you earn a BNB bonus every time they deposit. This cascades 5 levels deep — meaning you also earn from the people your referrals bring in, and their referrals, all the way to level 5. All bonuses are paid automatically by the smart contract.",
  },
  {
    q: "When and how can I withdraw my earnings?",
    a: "Your BNB rewards are claimable at any time — 24/7, with instant on-chain settlement. There are no lock-up periods for earnings. You can choose to claim daily, reinvest for compound growth, or accumulate over time. Your principal follows the terms of your chosen LP position.",
  },
  {
    q: "What returns can I realistically expect?",
    a: "LP participants earn up to 0.6% daily returns based on real liquidity pool performance. On top of this, active community builders unlock additional BNB from the 5-tier referral system. There is no guaranteed return as performance is subject to market conditions, but the model is fully transparent.",
  },
];

const FAQItem = ({ q, a, open, onClick }) => (
  <div style={{
    background: open ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${open ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
    borderRadius: "14px", marginBottom: "0.8rem", overflow: "hidden",
    transition: "all 0.4s ease", cursor: "pointer",
  }}>
    <div onClick={onClick} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.3rem 1.8rem", userSelect:"none" }}>
      <span style={{ color: open ? "#ffd700" : "#fff", fontWeight:700, fontSize:"1rem", transition:"color 0.3s" }}>{q}</span>
      <div style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0, marginLeft:"1rem",
        background: open ? "linear-gradient(135deg,#ffd700,#ff8c00)" : "rgba(255,215,0,0.1)",
        border: open ? "none" : "1px solid rgba(255,215,0,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.3s", transform: open ? "rotate(45deg)" : "rotate(0deg)",
      }}>
        <i className="ri-add-line" style={{ fontSize:"1.1rem", color: open ? "#000" : "#ffd700" }} />
      </div>
    </div>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div style={{ padding:"0 1.8rem 1.5rem", color:"rgba(255,255,255,0.65)", fontSize:"0.97rem", lineHeight:1.75 }}>
            {a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  // Split into 2 columns
  const col1 = faqs.slice(0, Math.ceil(faqs.length / 2));
  const col2 = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <section id="faq" style={{ padding:"100px 0", position:"relative" }}>
      <div style={{ position:"absolute", bottom:"10%", left:"50%", transform:"translateX(-50%)", width:"600px", height:"400px", background:"radial-gradient(circle,rgba(255,215,0,0.04) 0%,transparent 60%)", filter:"blur(60px)", pointerEvents:"none" }} />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"5rem" }}>
          <span style={{ background:"rgba(255,215,0,0.1)", color:"#ffd700", border:"1px solid rgba(255,215,0,0.25)", borderRadius:"30px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px" }}>FAQ</span>
          <h2 style={{ fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:900, color:"#fff", marginTop:"1rem" }}>
            Common <span style={{ color:"#ffd700" }}>Questions</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"1.05rem", maxWidth:"520px", margin:"1rem auto 0", lineHeight:1.65 }}>
            Everything you need to know about earning with BEP20 BNB on BEPVault.
          </p>
        </div>

        {/* Two-column FAQ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }} className="faq-grid">
          <div>
            {col1.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} open={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? null : i)} />
            ))}
          </div>
          <div>
            {col2.map((f, i) => {
              const idx = i + col1.length;
              return (
                <FAQItem key={idx} q={f.q} a={f.a} open={openIdx === idx} onClick={() => setOpenIdx(openIdx === idx ? null : idx)} />
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop:"4rem", padding:"2.5rem 3rem", background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:"20px", textAlign:"center" }}>
          <i className="ri-customer-service-2-line" style={{ fontSize:"2.5rem", color:"#ffd700", marginBottom:"1rem", display:"block" }} />
          <h3 style={{ color:"#fff", fontWeight:800, fontSize:"1.5rem", marginBottom:"0.8rem" }}>Still have questions?</h3>
          <p style={{ color:"rgba(255,255,255,0.55)", marginBottom:"1.5rem" }}>Our community team is available 24/7 to help you get started and answer any questions.</p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://linktr.ee/BEPVaultOfficial" target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
              <button style={{ background:"linear-gradient(135deg,#ffd700,#ff8c00)", color:"#000", border:"none", padding:"0.8rem 2rem", borderRadius:"8px", fontWeight:800, fontSize:"0.95rem", cursor:"pointer" }}>
                Join Community
              </button>
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) { .faq-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};
export default FAQSection;
