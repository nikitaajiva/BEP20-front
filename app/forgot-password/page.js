"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Mail, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { forgotPassword, forgotPasswordMessage, error, loading, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter registered email address.");
      return;
    }
    await forgotPassword(email.trim());
  };

  return (
    <div className={styles.authPageContainer}>
      
      {/* ── BACKGROUND ── */}
      <div className={styles.backgroundHero}>
        <Image src="/IMG/reset-hero.png" alt="Recovery" fill className={styles.heroImage} priority />
        <div className={styles.heroOverlay} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={styles.centeredContent}>
        
        {/* Header above card */}
        <div className={styles.heroHeader}>
          <h1 className={styles.heroTagline}>
            Secure <span>Protocol</span> Recovery
          </h1>
          <p className={styles.heroSubtitle}>
            Restoring access to your digital vault through cryptographically secured recovery channels.
          </p>
        </div>

        {/* ── REDESIGNED SPLIT CARD ── */}
        <div className={styles.formGlassCard}>
          
          {/* Left Side: Visual Anchor */}
          <div className={styles.cardVisualSide}>
            <div className={styles.logoBox}>
              <Image src="/img/Pnglogo.png" alt="Logo" width={80} height={80} style={{ objectFit: 'contain' }} />
            </div>
            <h3 className={styles.visualTitle}>VAULT ACCESS</h3>
            <p className={styles.visualText}>
              Verification required to authorize <br /> password reset sequence.
            </p>
            <Lock size={40} style={{ marginTop: '30px', color: 'rgba(255, 184, 0, 0.1)' }} />
          </div>

          {/* Right Side: Interaction Form */}
          <div className={styles.cardFormSide}>
            {forgotPasswordMessage ? (
              <div className={styles.formBody}>
                <div className={`${styles.statusMessage} ${styles.successState}`}>
                  <CheckCircle2 size={20} />
                  <span>{forgotPasswordMessage}</span>
                </div>
                <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                  Return to Vault
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.formBody}>
                
                {error && (
                  <div className={`${styles.statusMessage} ${styles.errorState}`}>
                    <ShieldAlert size={20} />
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>IDENTIFICATION</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      className={styles.inputControl}
                      placeholder="Registered Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <>Initiate Recovery <ArrowRight size={18} /></>
                  )}
                </button>

                <div className={styles.footerActions}>
                  <Link href="/login" className={styles.backLink}>
                    Back to <span>Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
