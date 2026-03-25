"use client";
import { useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./signin.module.css";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();

  const { login, error, loading: authLoading } = useAuth();

  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w, h, cx, cy, dpr;
    let dots = [];
    let time = 0;
    let animationId;

    /* ================= CONSTANTS ================= */
    const WAVE_SPEED = 0.2; // ⚡ animation speed
    const SPACING = 30; // distance between rings
    const POINTS = 180; // points per ring
    const GAP = 10; // 🔥 GAP between circle & dots

    /* ================= RESIZE ================= */
    function resize() {
      dpr = window.devicePixelRatio || 1;

      // ✅ width unchanged
      w = window.innerWidth * 1;
      h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 🔵 circle position (slightly lower)
      cx = w / 2;
      cy = h * 0.66;

      buildDots();
    }

    window.addEventListener("resize", resize);
    resize();

    /* ================= DOT GRID ================= */
    function buildDots() {
      dots = [];

      const BLUE_RADIUS = Math.min(w, h) * 10;
      const EFFECTIVE_RADIUS = BLUE_RADIUS - GAP;
      const RINGS = Math.floor(EFFECTIVE_RADIUS / SPACING);

      for (let r = 0; r < RINGS; r++) {
        const radius = r * SPACING + GAP; // 🔥 GAP applied
        const scale = 1 - r / RINGS;

        for (let i = 0; i < POINTS; i++) {
          const angle = (i / POINTS) * Math.PI * 2;
          dots.push({
            r: radius,
            cos: Math.cos(angle),
            sin: Math.sin(angle),
            scale,
          });
        }
      }
    }

    /* ================= ANIMATION ================= */
    function animate() {
      ctx.clearRect(0, 0, w, h);
      time += WAVE_SPEED;

      const BLUE_RADIUS = Math.min(w, h) * 10;
      const EFFECTIVE_RADIUS = BLUE_RADIUS - GAP;

      /* 🔵 Blue glow rings */
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          BLUE_RADIUS - i * 14 + Math.sin(time * 0.8) * 4,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(255, 215, 0,${0.22 - i * 0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* 🌊 Dots with CENTER → TOP SMOOTH FADE */
      for (const d of dots) {
        if (d.r > EFFECTIVE_RADIUS) continue;

        const wave =
          Math.sin(d.r * 0.055 - time * 1.4) * 7 +
          Math.sin(d.r * 0.12 - time * 0.6) * 9 * Math.exp(-d.r * 0.016);

        const x = cx + d.cos * d.r;
        const y = cy + d.sin * d.r * 0.45 - wave;

        /* 🔥 smooth opacity from center → top */
        const t = Math.max(0, Math.min(1, y / cy));
        const opacityFactor = 0.05 + Math.pow(t, 3) * 0.7;

        ctx.globalAlpha = d.scale * opacityFactor;
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffc107";
        ctx.shadowBlur = 10;

        ctx.fillRect(x, y, d.scale * 1.6, d.scale * 1.6);
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  const xamanAuthUrl =
    `https://oauth2.xumm.app/auth` +
    `?client_id=041487e6-e951-44e8-9da4-76617bb51470` +
    `&redirect_uri=${encodeURIComponent(`${DASHBOARD_URL}/auth/callback`)}` +
    `&response_type=token` +
    `&force_network=MAINNET` +
    `&signers=bf0650d4-eb0e-4cb7-9f82-ce992dc6f937`;

//  const xamanAuthUrl =
//   `https://oauth2.xumm.app/auth` +
//   `?client_id=041487e6-e951-44e8-9da4-76617bb51470` +
//   `&redirect_uri=${encodeURIComponent(
//     `https://app.bepvault.io/auth/callback`
//   )}` +
//   `&response_type=code`;

  return (
    <>
      <Head>
        <title>Sign In - BEPVault</title>
        <meta name="description" content="Sign in to your BEPVault account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.signInPage}>
        {/* LOGO */}
        <div className={styles.logoContainer}>
          <a href="/">
            <Image
              src="/assets/img/logo-auth-page.png"
              alt="BEPVault Logo"
              width={180}
              height={40}
              priority
            />
          </a>
        </div>
        {/* CENTER ORB */}
        {/* <div className={styles.centerWrappermain}> */}{" "}
        <div className={styles.centerWrapper}>
          <div className="centerWrappermain">
            <div className={styles.orb}>
              <div className={styles.formContainer}>
                <h2 className={styles.title}>Welcome to BEPVault! 👋</h2>
                <p className={styles.subtitle}>
                  Please sign in to your account and start the adventure
                </p>

                <button
                  type="button"
                  className={`${styles.button} ${styles.signInButton}`}
                  disabled={authLoading}
                  onClick={() => (window.location.href = xamanAuthUrl)}
                >
                  {authLoading ? "Redirecting..." : "Sign In with Xaman"}
                </button>

                {error && <p className={styles.errorText}>{error}</p>}
              </div>
            </div>
          </div>
          <div className="canvasmain">
            <canvas ref={canvasRef} />
          </div>
          {/* <div className="centerWrappermainimage">
            {" "}
            <img
              src="/assets/img/loganimation.gif"
              alt="BEPVault Logo"
              priority
            />
          </div> */}

          {/* HOLOGRAPHIC FLOOR */}
          {/* <div className={styles.floor}></div> */}
        </div>
      </div>
      {/* </div> */}
    </>
  );
}
