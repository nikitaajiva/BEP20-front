"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import loginStyles from "../../login/signin.module.css";
import fpStyles from "../../forgot-password/forgot-password.module.css";
import styles from "./reset-password-token.module.css";

export default function ResetPasswordTokenPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  const router = useRouter();
  const params = useParams();
  const { API_URL, setUser } = useAuth();
  const token = params?.token;

  /* Stable particles — generated once on client */
  useEffect(() => {
    const p = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${((i * 41 + 13) % 100).toFixed(1)}%`,
      top: `${((i * 57 + 9) % 100).toFixed(1)}%`,
      size: `${1 + (i % 3) * 0.8}px`,
      duration: `${4 + (i % 6)}s`,
      delay: `${(i % 8) * 0.7}s`,
    }));
    setParticles(p);
  }, []);

  /* Password strength */
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { level: 2, label: "Fair", color: "#f59e0b" };
    return { level: 3, label: "Strong", color: "#10b981" };
  };
  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!token) {
      setLocalError("Reset token missing. Please use the link from your email.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL.replace(/\/$/, "")}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: password, confirmPassword: password }),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          if (setUser && data.user) setUser(data.user);
        }
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setLocalError(data.message || "Link is invalid or expired. Please request a new one.");
      }
    } catch {
      setLocalError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loginStyles.signInPage}>

      {/* Background */}
      <div className={loginStyles.lightRaysContainer}>
        <div className={loginStyles.ray} />
        <div className={loginStyles.ray} />
      </div>
      <div className={loginStyles.ambientGlow} />
      <div className={loginStyles.bgAnimation}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={loginStyles.particle}
            style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className={loginStyles.externalBorder}>
        <div className={loginStyles.mainContainer}>

          {/* Glass card */}
          <div className={`${loginStyles.formGlassCard} ${fpStyles.narrowCard}`}>

            {/* Logo badge */}
            <div className={loginStyles.logoBoxTop}>
              <Image
                src="/bepvault_logo.png"
                alt="BEPVault"
                width={48}
                height={48}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Header */}
            <div className={loginStyles.cardHeader}>
              <h1 className={loginStyles.title}>
                New <span className={loginStyles.vaultText}>Password</span>
              </h1>
              <p className={loginStyles.subtitle}>
                {success
                  ? "Password updated! Redirecting to sign in…"
                  : "Choose a strong password for your account."}
              </p>
            </div>

            {/* ── SUCCESS STATE ── */}
            {success ? (
              <div className={fpStyles.successBox}>
                <div className={fpStyles.successIcon}>✓</div>
                <p className={fpStyles.successText}>
                  Your password has been reset successfully.
                </p>
                <p className={fpStyles.successSub}>Taking you to the sign-in page…</p>
                <Link href="/login" className={fpStyles.backBtn}>
                  Sign In Now
                </Link>
              </div>
            ) : (
              /* ── FORM ── */
              <form onSubmit={handleSubmit} className={loginStyles.signInForm} noValidate>

                {/* Error */}
                {localError && (
                  <div className={fpStyles.errorBox}>
                    <span className={fpStyles.errorIcon}>⚠</span> {localError}
                  </div>
                )}

                {/* New password */}
                <div className={loginStyles.inputGroup}>
                  <label htmlFor="rp-password" className={loginStyles.label}>
                    NEW PASSWORD
                  </label>
                  <div className={loginStyles.passwordWrapper}>
                    <input
                      id="rp-password"
                      type={showPassword ? "text" : "password"}
                      className={loginStyles.inputField}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      className={loginStyles.eyeButton}
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className={styles.strengthWrap}>
                      <div className={styles.strengthBar}>
                        {[1, 2, 3].map((lvl) => (
                          <div
                            key={lvl}
                            className={styles.strengthSegment}
                            style={{
                              background: strength.level >= lvl ? strength.color : "rgba(255,255,255,0.08)",
                            }}
                          />
                        ))}
                      </div>
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className={loginStyles.inputGroup}>
                  <label htmlFor="rp-confirm" className={loginStyles.label}>
                    CONFIRM PASSWORD
                  </label>
                  <div className={loginStyles.passwordWrapper}>
                    <input
                      id="rp-confirm"
                      type={showConfirm ? "text" : "password"}
                      className={loginStyles.inputField}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className={loginStyles.eyeButton}
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className={styles.matchError}>Passwords don't match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className={styles.matchOk}>✓ Passwords match</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={loginStyles.signInButton}
                  disabled={loading}
                  style={{ marginTop: "0.25rem" }}
                >
                  {loading ? (
                    <span className={fpStyles.btnLoading}>
                      <span className={fpStyles.spinner} /> Resetting…
                    </span>
                  ) : (
                    "Set New Password"
                  )}
                </button>

                <div className={loginStyles.dividerLine} style={{ marginTop: "1.5rem" }} />
                <div className={loginStyles.createAccountText}>
                  <Link href="/login" className={loginStyles.createAccountLink}>
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className={loginStyles.loginFooter}>
            <span>© 2024 BEPVault. All rights reserved. |</span>
            <Link href="/terms" className={loginStyles.footerLink}>Terms</Link>
            <span>|</span>
            <Link href="/privacy" className={loginStyles.footerLink}>Privacy</Link>
          </div>
        </div>
      </div>

      {/* Corner star */}
      <div className={loginStyles.cornerStar}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(255,215,0,0.5)" />
        </svg>
      </div>
    </div>
  );
}