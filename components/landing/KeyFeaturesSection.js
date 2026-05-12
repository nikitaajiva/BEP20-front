"use client";
import React, { useRef, useEffect, memo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Custom Animated Canvas Chart ────────────────────────────────────
const generateCandles = (count = 60) => {
  const candles = [];
  let price = 380 + Math.random() * 20;
  for (let i = 0; i < count; i++) {
    const open = price;
    const move = (Math.random() - 0.46) * 6;
    const close = Math.max(200, open + move);
    const high = Math.max(open, close) + Math.random() * 4;
    const low  = Math.min(open, close) - Math.random() * 4;
    const vol  = Math.random() * 100 + 20;
    candles.push({ open, close, high, low, vol, bull: close >= open });
    price = close;
  }
  return candles;
};

const LiveTrackChart = memo(() => {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const candlesRef = useRef(generateCandles(60));
  const [price, setPrice]   = useState(392.29);
  const [change, setChange] = useState(+25.57);
  const [tab, setTab]       = useState("1D");

  useEffect(() => {
    const id = setInterval(() => {
      const last = candlesRef.current[candlesRef.current.length - 1];
      const newClose = Math.max(200, last.close + (Math.random() - 0.47) * 4);
      candlesRef.current = [
        ...candlesRef.current.slice(-59),
        {
          open: last.close,
          close: newClose,
          high: Math.max(last.close, newClose) + Math.random() * 3,
          low:  Math.min(last.close, newClose) - Math.random() * 3,
          vol:  Math.random() * 100 + 20,
          bull: newClose >= last.close,
        },
      ];
      const basePrice = 392.29;
      const ch = +((newClose - basePrice) / (basePrice / 100)).toFixed(2);
      setPrice(+newClose.toFixed(2));
      setChange(ch);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth  || 700;
      canvas.height = 340;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const candles = candlesRef.current;
      const VOL_H = 44;
      const CHART_H = H - VOL_H - 12;
      const PAD_L = 10;
      const PAD_R = 60;

      ctx.clearRect(0, 0, W, H);

      const prices = candles.flatMap(c => [c.high, c.low]);
      const minP = Math.min(...prices) - 3;
      const maxP = Math.max(...prices) + 3;
      const range = maxP - minP || 1;
      const toY = v => CHART_H - ((v - minP) / range) * CHART_H;

      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (CHART_H / 5) * i;
        ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y);
        ctx.strokeStyle = "rgba(255,184,0,0.08)"; ctx.stroke();
        const val = maxP - (range / 5) * i;
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "10px Inter,sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("$" + val.toFixed(0), W - PAD_R + 10, y + 4);
      }
      ctx.setLineDash([]);

      const chartW = W - PAD_L - PAD_R;
      const cW = Math.max(3, chartW / candles.length - 1.5);
      const step = chartW / candles.length;

      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = PAD_L + i * step + cW / 2;
        const y = toY(c.close);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      const lastAreaX = PAD_L + (candles.length - 1) * step + cW / 2;
      ctx.lineTo(lastAreaX, CHART_H);
      ctx.lineTo(PAD_L + cW / 2, CHART_H);
      ctx.closePath();
      const aG = ctx.createLinearGradient(0, 0, 0, CHART_H);
      aG.addColorStop(0, "rgba(255,184,0,0.1)");
      aG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aG;
      ctx.fill();

      candles.forEach((c, i) => {
        const x   = PAD_L + i * step;
        const cx  = x + cW / 2;
        const col = c.bull ? "#00e676" : "#ff4d4d";
        const bTop = toY(Math.max(c.open, c.close));
        const bBot = toY(Math.min(c.open, c.close));
        const bH   = Math.max(bBot - bTop, 1.5);

        ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(cx, toY(c.high)); ctx.lineTo(cx, toY(c.low));
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.globalAlpha = c.bull ? 1 : 0.8;
        ctx.fillStyle = col;
        ctx.fillRect(x, bTop, cW, bH);
        ctx.globalAlpha = 1;
      });

      const lastClose = candles[candles.length - 1].close;
      const lastY = toY(lastClose);
      const badgeX = W - PAD_R + 8;
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.roundRect(badgeX, lastY - 12, 52, 24, 6);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "900 10px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$" + lastClose.toFixed(1), badgeX + 26, lastY + 4);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const isUp = change >= 0;

  return (
    <div className="track-chart-wrapper">
      <div className="chart-header">
        <div className="chart-title-group">
          <div className="chart-icon-box">
            <div className="chart-icon-inner">R</div>
            <div className="chart-icon-ring" />
          </div>
          <div className="chart-titles">
            <h4>TRACK PERFORMANCE</h4>
            <p>INSTITUTIONAL GRADE ANALYTICS</p>
          </div>
        </div>
        <div className="chart-metrics">
          <div className="chart-main-price">
            <span className="price-val gold-text-shimmer">${price.toFixed(2)}</span>
            <div className="price-meta">
              <span className={`price-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </span>
              <span className="live-tag"><span className="pulse-dot" /> LIVE DATA</span>
            </div>
          </div>
          <div className="chart-tabs">
            {["1H","4H","1D","1W"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-canvas-container">
        <div className="chart-bg-grid" />
        <canvas ref={canvasRef} />
        <div className="chart-overlay-gradient" />
      </div>

      <div className="chart-stats-grid">
        {[
          { l:"Top Speed",   v:"54.2 km/h", col:"#00e676", icon: "ri-speed-up-line" },
          { l:"Avg Odds",    v:"4/1",       col:"#ff4d4d", icon: "ri-swap-line" },
          { l:"Active Fans", v:"10,000+",   col:"#fff",    icon: "ri-user-heart-line" },
          { l:"Total Prize", v:"$50K",      col:"#FFB800", icon: "ri-copper-coin-line" },
        ].map(s => (
          <div key={s.l} className="chart-stat-item">
            <div className="csi-icon"><i className={s.icon} /></div>
            <div className="csi-info">
              <span className="csi-label">{s.l}</span>
              <span className="csi-value" style={{ color: s.col }}>{s.v}</span>
            </div>
            <div className="csi-glow" />
          </div>
        ))}
      </div>
    </div>
  );
});
LiveTrackChart.displayName = "LiveTrackChart";

// ── Feature Card Component ──────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, badge, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="capability-card"
  >
    <div className="cap-card-inner">
      {badge && <div className="cap-badge">{badge}</div>}
      <div className="cap-icon-box">
        <i className={icon} />
      </div>
      <h3 className="cap-title">{title}</h3>
      <p className="cap-desc">{desc}</p>
      <div className="cap-glow" />
    </div>
  </motion.div>
);

const KeyFeaturesSection = () => {
  const features = [
    { icon:"ri-shield-flash-line", title:"Certified Security", desc:"Every race outcome is secured with institutional-grade protocols and audited for complete fairness.", badge:"Audited" },
    { icon:"ri-medal-line",         title:"Daily Rewards",       desc:"Earn daily returns from active racing pools. Rewards are distributed directly with 24/7 access." },
    { icon:"ri-global-line",         title:"Global Network",      desc:"Our network spans across elite tracks worldwide, ensuring premium coverage 24/7.", badge:"Live" },
    { icon:"ri-team-line",           title:"Elite Referrals",     desc:"Build your racing stable across multiple tiers. Earn cascading bonuses from your community." },
    { icon:"ri-dashboard-3-line",    title:"Track Analytics",     desc:"Track performance and historical rewards in real-time via your professional dashboard." },
    { icon:"ri-flashlight-line",     title:"Instant Payouts",     desc:"No waiting periods. Your racing rewards are claimable instantly, keeping you in the action.", badge:"Fast" },
  ];

  return (
    <section id="features" className="capabilities-section">
      <div className="capabilities-container">
        
        {/* Header */}
        <div className="capabilities-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="capabilities-badge">CAPABILITIES</span>
            <h2 className="capabilities-title">
              Everything You Need to <br />
              <span className="gold-text">Dominate the Track</span>
            </h2>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="capabilities-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>

        {/* Performance Dashboard */}
        <div className="capabilities-dashboard">
          <div className="dashboard-glass">
            <div className="dashboard-accent-bar" />
            <LiveTrackChart />
          </div>
        </div>

      </div>

      <style jsx global>{`
        .capabilities-section {
          position: relative;
          padding: 120px 0;
          background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), 
                      url('/img/capabilities-bg.png');
          background-attachment: fixed;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .capabilities-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* ── Header ── */
        .capabilities-header {
          margin-bottom: 80px;
        }
        .capabilities-badge {
          display: inline-block;
          background: rgba(255, 184, 0, 0.1);
          color: #FFB800;
          border: 1px solid rgba(255, 184, 0, 0.3);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 4px;
          margin-bottom: 24px;
        }
        .capabilities-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -2px;
        }

        /* ── Feature Grid ── */
        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
          margin-bottom: 100px;
        }
        @media (min-width: 768px) {
          .capabilities-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .capabilities-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .capability-card {
          position: relative;
        }
        .cap-card-inner {
          position: relative;
          height: 100%;
          background: rgba(10, 10, 10, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 40px;
          transition: all 0.4s ease;
          overflow: hidden;
        }
        .capability-card:hover .cap-card-inner {
          background: rgba(15, 15, 15, 0.85);
          border-color: rgba(255, 184, 0, 0.4);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .cap-badge {
          position: absolute;
          top: 30px;
          right: 30px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: #FFB800;
          border: 1px solid rgba(255, 184, 0, 0.3);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 1.5px;
        }
        .cap-icon-box {
          width: 56px;
          height: 56px;
          background: rgba(255, 184, 0, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          transition: transform 0.4s ease;
        }
        .capability-card:hover .cap-icon-box { transform: scale(1.1) rotate(5deg); }
        .cap-icon-box i {
          font-size: 24px;
          color: #FFB800;
        }
        .cap-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .cap-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          margin: 0;
        }
        .cap-glow {
          position: absolute;
          bottom: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.05) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .capability-card:hover .cap-glow { opacity: 1; }

        /* ── Dashboard ── */
        .capabilities-dashboard {
          position: relative;
        }
        .dashboard-glass {
          background: rgba(10, 10, 10, 0.5);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 48px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 100px 150px -50px rgba(0,0,0,0.9);
        }
        @media (min-width: 1024px) {
          .dashboard-glass { padding: 60px; }
        }
        .dashboard-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 184, 0, 0.6), transparent);
          box-shadow: 0 0 15px rgba(255, 184, 0, 0.4);
        }

        /* ── Chart ── */
        .track-chart-wrapper {
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .chart-title-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .chart-icon-box {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chart-icon-inner {
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #FFB800, #FF6200);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.4rem;
          color: #000;
          z-index: 2;
        }
        .chart-icon-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 184, 0, 0.3);
          border-radius: 16px;
          animation: spin 8s linear infinite;
        }
        .chart-titles h4 {
          font-size: 1.1rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 4px 0;
          letter-spacing: 1px;
        }
        .chart-titles p {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: #FFB800;
          margin: 0;
          letter-spacing: 3px;
          opacity: 0.6;
        }

        .chart-metrics {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        .chart-main-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .price-val {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 0.9;
        }
        .price-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .price-change {
          font-size: 11px;
          font-weight: 900;
        }
        .live-tag {
          font-size: 9px;
          font-weight: 900;
          color: #00e676;
          display: flex;
          align-items: center;
          gap: 5px;
          letter-spacing: 1px;
        }
        .pulse-dot {
          width: 5px;
          height: 5px;
          background: #00e676;
          border-radius: 50%;
          box-shadow: 0 0 10px #00e676;
          animation: blink 1.5s infinite;
        }
        .price-change.up { color: #00e676; }
        .price-change.down { color: #ff4d4d; }

        .chart-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .chart-tabs button {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .chart-tabs button.active {
          background: #FFB800;
          color: #000;
          box-shadow: 0 4px 12px rgba(255, 184, 0, 0.3);
        }

        .chart-canvas-container {
          position: relative;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 24px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .chart-canvas-container canvas {
          display: block;
          width: 100%;
          height: 340px;
        }

        .chart-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .chart-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .chart-stat-item {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.4s ease;
          overflow: hidden;
        }
        .chart-stat-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 184, 0, 0.3);
          transform: translateY(-5px);
        }
        .csi-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #FFB800;
          flex-shrink: 0;
          transition: transform 0.4s ease;
        }
        .chart-stat-item:hover .csi-icon {
          transform: scale(1.1) rotate(5deg);
          background: rgba(255, 184, 0, 0.1);
        }
        .csi-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .csi-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 1px;
        }
        .csi-value {
          font-size: 1.1rem;
          font-weight: 900;
        }
        .csi-glow {
          position: absolute;
          bottom: -30px;
          right: -30px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.05) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .chart-stat-item:hover .csi-glow { opacity: 1; }
        
        .gold-text-shimmer {
          background: linear-gradient(90deg, #FFB800, #FF6200, #FFB800);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      `}</style>
    </section>
  );
};

export default KeyFeaturesSection;

