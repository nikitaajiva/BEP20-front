"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import styles from "../login/signin.module.css";
import fpStyles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [particles, setParticles] = useState([]);

  const {
    forgotPassword,
    forgotPasswordMessage,
    error,
    loading,
    setError,
  } = useAuth();

  // Generate background particles on client only (avoids hydration mismatch)
  useEffect(() => {
    const p = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${((i * 37 + 11) % 100).toFixed(1)}%`,
      top: `${((i * 53 + 7) % 100).toFixed(1)}%`,
      size: `${1 + (i % 3) * 0.8}px`,
      duration: `${4 + (i % 6)}s`,
      delay: `${(i % 8) * 0.7}s`,
    }));
    setParticles(p);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    await forgotPassword(email.trim());
  };

  return (
    <div className={styles.signInPage}>

      {/* Background rays */}
      <div className={styles.lightRaysContainer}>
        <div className={styles.ray} />
        <div className={styles.ray} />
      </div>
      <div className={styles.ambientGlow} />

      {/* Floating particles */}
      <div className={styles.bgAnimation}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className={styles.externalBorder}>
        <div className={styles.mainContainer}>

          {/* Glass Card */}
          <div className={`${styles.formGlassCard} ${fpStyles.narrowCard}`}>

            {/* Top logo badge */}
            <div className={styles.logoBoxTop}>
              <Image
                src="/bepvault_logo.png"
                alt="BEPVault"
                width={48}
                height={48}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Header */}
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>
                Reset <span className={styles.vaultText}>Password</span>
              </h1>
              <p className={styles.subtitle}>
                {forgotPasswordMessage
                  ? "Check your inbox for the reset link."
                  : "Enter your registered email and we'll send a reset link."}
              </p>
            </div>

            {/* Success State */}
            {forgotPasswordMessage ? (
              <div className={fpStyles.successBox}>
                <div className={fpStyles.successIcon}>✓</div>
                <p className={fpStyles.successText}>{forgotPasswordMessage}</p>
                <p className={fpStyles.successSub}>
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => handleSubmit({ preventDefault: () => {} })}
                    className={fpStyles.resendBtn}
                    disabled={loading}
                  >
                    resend
                  </button>
                  .
                </p>
                <Link href="/login" className={fpStyles.backBtn}>
                  ← Back to Sign In
                </Link>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className={styles.signInForm} noValidate>

                {/* Error */}
                {error && (
                  <div className={fpStyles.errorBox}>
                    <span className={fpStyles.errorIcon}>⚠</span> {error}
                  </div>
                )}

                {/* Email field */}
                <div className={styles.inputGroup}>
                  <label htmlFor="fp-email" className={styles.label}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    className={styles.inputField}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={styles.signInButton}
                  disabled={loading}
                  style={{ marginTop: "0.5rem" }}
                >
                  {loading ? (
                    <span className={fpStyles.btnLoading}>
                      <span className={fpStyles.spinner} /> Sending…
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                {/* Divider */}
                <div className={styles.dividerLine} style={{ marginTop: "1.5rem" }} />

                {/* Back to login */}
                <div className={styles.createAccountText}>
                  Remembered your password?{" "}
                  <Link href="/login" className={styles.createAccountLink}>
                    Sign In
                  </Link>
                </div>

              </form>
            )}
          </div>

          {/* Footer */}
          <div className={styles.loginFooter}>
            <span>© 2024 BEPVault. All rights reserved. |</span>
            <Link href="/terms" className={styles.footerLink}>Terms</Link>
            <span>|</span>
            <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
          </div>
        </div>
      </div>

      {/* Corner star */}
      <div className={styles.cornerStar}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(255,215,0,0.5)" />
        </svg>
      </div>
    </div>
  );
}
