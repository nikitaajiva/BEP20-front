"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Animated Candlestick Chart ──────────────────────────────────────────────
const CandleChart = () => {
  const [candles, setCandles] = useState([]);
  useEffect(() => {
    const gen = () => {
      const data = [];
      let price = 300;
      for (let i = 0; i < 28; i++) {
        const open = price;
        const change = (Math.random() - 0.46) * 18;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 8;
        const low = Math.min(open, close) - Math.random() * 8;
        price = close;
        data.push({ open, close, high, low, bull: close >= open });
      }
      return data;
    };
    setCandles(gen());
    const id = setInterval(() => setCandles(gen()), 3000);
    return () => clearInterval(id);
  }, []);

  if (!candles.length) return null;
  const prices = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const H = 200, W = 420;
  const toY = v => H - ((v - minP) / range) * (H - 20) - 10;
  const cW = W / candles.length;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((r, i) => (
        <line key={i} x1={0} y1={H * r} x2={W} y2={H * r}
          stroke="rgba(255,215,0,0.06)" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {candles.map((c, i) => {
        const x = i * cW + cW / 2;
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyH = Math.max(bodyBot - bodyTop, 2);
        const color = c.bull ? "#00e676" : "#ff4444";
        return (
          <g key={i} style={{ transition: "all 0.8s ease" }}>
            <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="1.5" opacity="0.7" />
            <rect x={x - cW * 0.3} y={bodyTop} width={cW * 0.6} height={bodyH} fill={color} rx="1" opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
};

// ── Blockchain Node Network Animation ──────────────────────────────────────
const BlockchainNetwork = () => {
  const nodes = [
    { x: 50, y: 50 }, { x: 160, y: 25 }, { x: 270, y: 55 }, { x: 380, y: 30 },
    { x: 100, y: 130 }, { x: 220, y: 110 }, { x: 330, y: 140 }, { x: 60, y: 200 },
    { x: 180, y: 185 }, { x: 300, y: 200 }, { x: 410, y: 170 },
  ];
  const edges = [
    [0,1],[1,2],[2,3],[0,4],[1,5],[2,5],[3,6],[4,5],[5,6],[4,7],[5,8],[6,9],[7,8],[8,9],[9,10],[6,10],[3,10]
  ];

  return (
    <svg width="100%" height="220" viewBox="0 0 460 220" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="rgba(255,215,0,0.15)" strokeWidth="1.5"
        >
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="12" fill="rgba(255,215,0,0.08)" filter="url(#glow)">
            <animate attributeName="r" values="10;14;10" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.x} cy={n.y} r="6" fill="url(#nodeGrad)" filter="url(#glow)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
};

// ── Animated Area Graph ─────────────────────────────────────────────────────
const AreaGraph = ({ color = "#ffd700", accent = "#ff8c00" }) => {
  const [points, setPoints] = useState([]);
  useEffect(() => {
    const gen = () => {
      const pts = [];
      let v = 50;
      for (let i = 0; i <= 40; i++) {
        v = Math.max(10, Math.min(90, v + (Math.random() - 0.45) * 12));
        pts.push(v);
      }
      return pts;
    };
    setPoints(gen());
    const id = setInterval(() => setPoints(gen()), 2500);
    return () => clearInterval(id);
  }, []);

  if (!points.length) return null;
  const W = 300, H = 80;
  const step = W / (points.length - 1);
  const toY = v => H - (v / 100) * H;
  const pathD = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${toY(v)}`).join(" ");
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg width="100%" height={H + 10} viewBox={`0 0 ${W} ${H + 10}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGrad_${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#areaGrad_${color})`} style={{ transition: "d 1s ease" }} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ transition: "d 1s ease" }}>
        <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="2s" fill="freeze" />
      </path>
      {/* Animated dot at last point */}
      <circle cx={(points.length - 1) * step} cy={toY(points[points.length - 1])} r="4" fill={color} filter="url(#glow)">
        <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

// ── Live Ticker ─────────────────────────────────────────────────────────────
const LiveTicker = () => {
  const [bnbPrice, setBnbPrice] = useState({ price: 312.4, change: 2.4 });
  useEffect(() => {
    const id = setInterval(() => {
      setBnbPrice(p => ({
        price: +(p.price + (Math.random() - 0.48) * 3).toFixed(2),
        change: +(Math.random() * 6 - 1.5).toFixed(2),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const isUp = bnbPrice.change >= 0;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "12px",
      background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)",
      borderRadius: "50px", padding: "0.5rem 1.2rem", marginBottom: "1.5rem",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e676", boxShadow: "0 0 8px #00e676", display: "inline-block" }}>
        <style jsx>{`span { animation: livePulse 1s infinite; } @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </span>
      <span style={{ color: "#ffd700", fontWeight: 700, fontSize: "0.9rem" }}>BNB Live</span>
      <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>${bnbPrice.price}</span>
      <span style={{ color: isUp ? "#00e676" : "#ff4444", fontWeight: 700, fontSize: "0.85rem" }}>
        {isUp ? "▲" : "▼"} {Math.abs(bnbPrice.change)}%
      </span>
    </div>
  );
};

// ── Main Hero Section ───────────────────────────────────────────────────────
const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* Particle Grid Background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%, rgba(255,140,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,215,0,0.05) 0%, transparent 50%)", zIndex: 0 }} />

      <div className="container" style={{ position: "relative", zIndex: 5, paddingTop: "100px", paddingBottom: "60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">

          {/* LEFT */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(40px)", transition: "all 1s ease" }}>
            <LiveTicker />

            <h1 style={{
              fontSize: "clamp(2.8rem, 5vw, 5rem)", fontWeight: 900, lineHeight: 1.08,
              color: "#fff", marginBottom: "1.5rem", letterSpacing: "-1px",
            }}>
              Earn Daily with<br />
              <span style={{
                background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "gradShift 4s ease infinite",
              }}>BEP20 BNB</span><br />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7em", fontWeight: 600 }}>Liquidity Network</span>
            </h1>

            <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "500px" }}>
              The world's most advanced BEP20 community platform. Provide liquidity, earn compounded daily returns, and grow your network of BNB earners all on-chain, secure, and instant.
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
              {[
                { val: "$12M+", label: "Total Liquidity" },
                { val: "0.6%", label: "Daily Returns" },
                { val: "50k+", label: "Active Members" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffd700", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Charts */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(60px)", transition: "all 1.2s ease 0.2s" }}>
            {/* Floating Coin Card */}
            <div style={{
              background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,215,0,0.15)", borderRadius: "24px",
              padding: "1.5rem", marginBottom: "1.2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.1)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ffd700,#ff8c00)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#000", fontSize: "0.9rem" }}>B</div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>BNB / USDT</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Binance Smart Chain</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ffd700", fontWeight: 800, fontSize: "1.3rem" }}>$312.40</div>
                  <div style={{ color: "#00e676", fontSize: "0.8rem", fontWeight: 700 }}>▲ +2.4%</div>
                </div>
              </div>
              <CandleChart />
            </div>

            {/* Mini Stat Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { icon: "ri-line-chart-line", label: "LP Yield", val: "+0.6%/day", col: "#00e676" },
                { icon: "ri-group-line", label: "Team Bonus", val: "5 Levels", col: "#ffd700" },
                { icon: "ri-safe-line", label: "BSC Security", val: "Audit Pass", col: "#4fc3f7" },
                { icon: "ri-timer-line", label: "Settlement", val: "Instant", col: "#ff8c00" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px", padding: "1.2rem", transition: "all 0.3s",
                }}>
                  <i className={s.icon} style={{ fontSize: "1.6rem", color: s.col, display: "block", marginBottom: "0.5rem" }} />
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{s.label}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginTop: "3px" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.5 }}>
        <span style={{ color: "#fff", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: "24px", height: "38px", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
          <div style={{ width: "4px", height: "8px", background: "#ffd700", borderRadius: "2px", animation: "scrollBob 1.5s ease infinite" }} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes scrollBob { 0%,100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(8px); opacity: 0.3; } }
        .cta-primary {
          background: linear-gradient(135deg,#ffd700,#ff8c00); color: #000; border: none;
          padding: 1rem 2.2rem; border-radius: 8px; font-weight: 900; font-size: 1rem;
          cursor: pointer; box-shadow: 0 6px 24px rgba(255,215,0,0.35); transition: all 0.3s;
        }
        .cta-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(255,215,0,0.55); }
        .cta-secondary {
          background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2);
          padding: 1rem 2.2rem; border-radius: 8px; font-weight: 700; font-size: 1rem;
          cursor: pointer; transition: all 0.3s;
        }
        .cta-secondary:hover { border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,0.05); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
