"use client";
import React, { useRef, useEffect, memo, useState } from "react";

// ── Custom Animated BNB/USDT Canvas Chart ────────────────────────────────────
const generateCandles = (count = 60) => {
  const candles = [];
  let price = 310 + Math.random() * 20;
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

const LiveBNBChart = memo(() => {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const candlesRef = useRef(generateCandles(60));
  const [price, setPrice]   = useState(312.4);
  const [change, setChange] = useState(+2.4);
  const [tab, setTab]       = useState("1D");

  // Push a new candle every 1.8 s
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
      const basePrice = 312.4;
      const ch = +((newClose - basePrice) / (basePrice / 100)).toFixed(2);
      setPrice(+newClose.toFixed(2));
      setChange(ch);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Canvas render loop
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
      const PAD_L = 8;
      const PAD_R = 54;

      // ── Clear ──────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // ── Price scale ────────────────────────────────────────────────────
      const prices = candles.flatMap(c => [c.high, c.low]);
      const minP = Math.min(...prices) - 3;
      const maxP = Math.max(...prices) + 3;
      const range = maxP - minP || 1;
      const toY = v => CHART_H - ((v - minP) / range) * CHART_H;

      // ── Grid ───────────────────────────────────────────────────────────
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (CHART_H / 5) * i;
        ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y);
        ctx.strokeStyle = "rgba(255,215,0,0.06)"; ctx.stroke();
        // Y label
        const val = maxP - (range / 5) * i;
        ctx.fillStyle = "rgba(255,215,0,0.35)";
        ctx.font = "9px Inter,sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("$" + val.toFixed(0), W - PAD_R + 4, y + 4);
      }
      for (let i = 1; i <= 5; i++) {
        const x = PAD_L + ((W - PAD_L - PAD_R) / 6) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CHART_H);
        ctx.strokeStyle = "rgba(255,215,0,0.04)"; ctx.stroke();
      }
      ctx.setLineDash([]);

      // ── Column width ───────────────────────────────────────────────────
      const chartW = W - PAD_L - PAD_R;
      const cW = Math.max(3, chartW / candles.length - 1.2);
      const step = chartW / candles.length;

      // ── Area fill ──────────────────────────────────────────────────────
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
      aG.addColorStop(0, "rgba(255,215,0,0.14)");
      aG.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = aG;
      ctx.fill();

      // ── Candles ────────────────────────────────────────────────────────
      candles.forEach((c, i) => {
        const x   = PAD_L + i * step;
        const cx  = x + cW / 2;
        const col = c.bull ? "#00e676" : "#ff4757";
        const bTop = toY(Math.max(c.open, c.close));
        const bBot = toY(Math.min(c.open, c.close));
        const bH   = Math.max(bBot - bTop, 1.5);

        // wick
        ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.moveTo(cx, toY(c.high)); ctx.lineTo(cx, toY(c.low));
        ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();

        // body
        ctx.globalAlpha = c.bull ? 0.88 : 0.72;
        ctx.fillStyle = col;
        ctx.fillRect(x, bTop, cW, bH);
        ctx.globalAlpha = 1;
      });

      // ── Closing line ───────────────────────────────────────────────────
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = PAD_L + i * step + cW / 2;
        i === 0 ? ctx.moveTo(x, toY(c.close)) : ctx.lineTo(x, toY(c.close));
      });
      ctx.strokeStyle = "rgba(255,215,0,0.45)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Last-price horizontal dashed line ──────────────────────────────
      const lastClose = candles[candles.length - 1].close;
      const lastY = toY(lastClose);
      ctx.beginPath(); ctx.moveTo(PAD_L, lastY); ctx.lineTo(W - PAD_R, lastY);
      ctx.strokeStyle = "rgba(255,215,0,0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Last-price badge ───────────────────────────────────────────────
      const badgeX = W - PAD_R + 2;
      ctx.fillStyle = "rgba(255,215,0,0.92)";
      ctx.beginPath();
      ctx.roundRect(badgeX, lastY - 10, 48, 20, 4);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$" + lastClose.toFixed(1), badgeX + 24, lastY + 3.5);

      // ── Volume bars ────────────────────────────────────────────────────
      const maxVol = Math.max(...candles.map(c => c.vol));
      candles.forEach((c, i) => {
        const x   = PAD_L + i * step;
        const barH = (c.vol / maxVol) * (VOL_H * 0.78);
        ctx.fillStyle = c.bull ? "rgba(0,230,118,0.22)" : "rgba(255,71,87,0.22)";
        ctx.fillRect(x, H - barH, cW, barH);
      });

      // ── Time labels ────────────────────────────────────────────────────
      ctx.fillStyle = "rgba(255,215,0,0.3)";
      ctx.font = "9px Inter,sans-serif";
      ctx.textAlign = "center";
      const now  = new Date();
      const lblStep = Math.floor(candles.length / 6);
      for (let i = 0; i < 7; i++) {
        const idx = i * lblStep;
        if (idx >= candles.length) continue;
        const x = PAD_L + idx * step + cW / 2;
        const t = new Date(now - (candles.length - idx) * 900000);
        ctx.fillText(
          t.getHours().toString().padStart(2,"0") + ":" + t.getMinutes().toString().padStart(2,"0"),
          x, H - 2
        );
      }

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
    <div style={{ position:"relative" }}>
      {/* Chart header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem", flexWrap:"wrap", gap:"0.8rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#ffd700,#ff8c00)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#000", fontSize:"1rem", flexShrink:0 }}>B</div>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:"1.05rem" }}>BNB / USDT</div>
            <div style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.73rem" }}>Binance Smart Chain · BEP20</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#00e676", display:"inline-block", boxShadow:"0 0 8px #00e676", animation:"livePulse 1s infinite" }} />
            <span style={{ color:"#00e676", fontSize:"0.73rem", fontWeight:700 }}>LIVE</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"#ffd700", fontWeight:900, fontSize:"1.55rem", lineHeight:1 }}>${price.toFixed(2)}</div>
            <div style={{ color:isUp ? "#00e676" : "#ff4757", fontSize:"0.82rem", fontWeight:700, marginTop:"3px" }}>
              {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </div>
          </div>
          {/* Timeframe pills */}
          <div style={{ display:"flex", gap:"4px" }}>
            {["1H","4H","1D","1W"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:"4px 10px", borderRadius:"6px", border:"none",
                cursor:"pointer", fontSize:"0.73rem", fontWeight:700, transition:"all 0.2s",
                background: tab === t ? "linear-gradient(135deg,#ffd700,#ff8c00)" : "rgba(255,215,0,0.07)",
                color: tab === t ? "#000" : "rgba(255,255,255,0.45)",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas wrapper — transparent background */}
      <div style={{ borderRadius:"14px", overflow:"hidden", border:"1px solid rgba(255,215,0,0.08)", background:"transparent" }}>
        <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"340px" }} />
      </div>

      {/* Footer stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.8rem", marginTop:"1rem" }}>
        {[
          { l:"24h High",   v:`$${(price * 1.04).toFixed(2)}`, c:"#00e676"  },
          { l:"24h Low",    v:`$${(price * 0.97).toFixed(2)}`, c:"#ff4757"  },
          { l:"24h Vol",    v:"184.2K BNB",                    c:"rgba(255,255,255,0.7)" },
          { l:"Market Cap", v:"$47.1B",                        c:"#ffd700"  },
        ].map(s => (
          <div key={s.l} style={{ padding:"0.75rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.045)", borderRadius:"10px", textAlign:"center" }}>
            <div style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.7rem", marginBottom:"4px" }}>{s.l}</div>
            <div style={{ color:s.c, fontWeight:700, fontSize:"0.88rem" }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
LiveBNBChart.displayName = "LiveBNBChart";

// ── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, badge }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${hov ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: "20px", padding: "2rem", cursor: "default",
      transform: hov ? "translateY(-8px)" : "translateY(0)",
      boxShadow: hov ? "0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.08)" : "none",
      transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", position: "relative", overflow: "hidden",
    }}>
      {badge && (
        <div style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(255,215,0,0.15)", color:"#ffd700", fontSize:"0.7rem", fontWeight:700, padding:"3px 10px", borderRadius:"20px", border:"1px solid rgba(255,215,0,0.25)", textTransform:"uppercase" }}>{badge}</div>
      )}
      <div style={{ width:56, height:56, borderRadius:"14px", background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.4rem" }}>
        <i className={icon} style={{ fontSize:"1.8rem", color:"#ffd700" }} />
      </div>
      <h3 style={{ color:"#fff", fontSize:"1.2rem", fontWeight:800, marginBottom:"0.7rem" }}>{title}</h3>
      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.95rem", lineHeight:1.65, margin:0 }}>{desc}</p>
      {hov && <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,215,0,0.03) 0%,transparent 50%)", borderRadius:"20px", pointerEvents:"none" }} />}
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────
const KeyFeaturesSection = () => {
  const features = [
    { icon:"ri-secure-payment-line", title:"BSC-Powered Security",    desc:"Every transaction is immutably recorded on the Binance Smart Chain with institutional-grade security protocols and an independently audited smart contract.", badge:"Audited" },
    { icon:"ri-line-chart-line",     title:"Daily BNB Yields",        desc:"Earn up to 0.6% daily returns from real BEP20 liquidity activity. Your rewards are auto-distributed directly to your connected wallet — no manual claims." },
    { icon:"ri-global-line",         title:"Global LP Network",       desc:"Our decentralized liquidity routers span across all major BSC-native DEXes, ensuring maximum capital efficiency and deep market coverage 24/7.", badge:"Live" },
    { icon:"ri-team-line",           title:"Multi-Level Community",   desc:"Build your team across 5 reward tiers. Earn cascading BNB bonuses every time your referrals, and their referrals, contribute to the pool." },
    { icon:"ri-bar-chart-box-line",  title:"Live Dashboard Analytics",desc:"Track your BNB earnings, team performance, LP positions, and historical returns in real-time via your personalized dashboard." },
    { icon:"ri-flashlight-line",     title:"Instant Settlements",     desc:"No waiting periods, no lockups. Your daily BNB rewards are settled and claimable within seconds of being generated by the liquidity pool.", badge:"Fast" },
  ];

  return (
    <section id="features" style={{ padding:"100px 0", position:"relative" }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"800px", height:"600px", background:"radial-gradient(ellipse,rgba(255,215,0,0.04) 0%,transparent 70%)", pointerEvents:"none" }} />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"5rem" }}>
          <span style={{ background:"rgba(255,215,0,0.1)", color:"#ffd700", border:"1px solid rgba(255,215,0,0.25)", borderRadius:"30px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px" }}>Key Features</span>
          <h2 style={{ fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:900, color:"#fff", marginTop:"1rem", lineHeight:1.2 }}>
            Everything You Need to <span style={{ color:"#ffd700" }}>Earn More</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"1.1rem", maxWidth:"600px", margin:"1rem auto 0", lineHeight:1.65 }}>
            A complete DeFi toolkit built specifically for the BEP20 BNB ecosystem — powerful, secure, and built for growth.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1.5rem", marginBottom:"5rem" }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* Chart section */}
        <div style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,215,0,0.1)", borderRadius:"24px", padding:"2.5rem" }}>
          <div style={{ marginBottom:"1.5rem" }}>
            <h3 style={{ color:"#fff", fontWeight:800, fontSize:"1.4rem", margin:"0 0 4px" }}>Live BNB / USDT Market</h3>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.85rem", margin:0 }}>Simulated real-time BNB price action — Binance Smart Chain</p>
          </div>
          <LiveBNBChart />
        </div>
      </div>

      <style jsx global>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </section>
  );
};
export default KeyFeaturesSection;
