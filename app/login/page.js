"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./signin.module.css";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    user,
    login,
    error,
    loading: authLoading,
    setError,
    activationMessage,
  } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    await login({ email, password });
  };

  const [particles, setParticles] = useState([]);
  const [streaks, setStreaks] = useState([]);

  // Generate background animation elements
  useEffect(() => {
    const newParticles = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      top: `${(Math.random() * 100).toFixed(2)}%`,
      size: `${(1 + Math.random() * 2.5).toFixed(1)}px`,
      duration: `${(3 + Math.random() * 6).toFixed(1)}s`,
      delay: `${(Math.random() * 10).toFixed(1)}s`,
    }));
    
    const newStreaks = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 5 + 3}s`,
      delay: `${Math.random() * 10}s`,
    }));

    setParticles(newParticles);
    setStreaks(newStreaks);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  return (
    <>
      <Head>
        <title>Sign In - BEPVault</title>
        <meta name="description" content="Sign in to your BEPVault account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.signInPage}>
        {/* Animated Background */}
        <div className={styles.lightRaysContainer}>
          <div className={styles.ray}></div>
          <div className={styles.ray}></div>
        </div>
        <div className={styles.ambientGlow}></div>

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
          {streaks.map((s) => (
            <div
              key={s.id}
              className={styles.goldenStreak}
              style={{
                left: s.left,
                animationDuration: s.duration,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        <div className={styles.externalBorder}>
          <div className={styles.mainContainer}>
            {/* Glass Form Card */}
            <div className={styles.formGlassCard}>
              {/* Logo Box half-hanging outside */}
              <div className={styles.logoBoxTop}>
                <Image
                  src="/bepvault_logo.png"
                  alt="BEPVault Logo"
                  width={40}
                  height={40}
                  className={styles.logo}
                />
              </div>

              <div className={styles.cardHeader}>
                <h2 className={styles.title}>
                  <span className={styles.welcomeText}>Welcome to </span>
                  <span className={styles.vaultText}>BEPVault!</span>
                </h2>
                <p className={styles.subtitle}>
                  Secure access to your administrative command center
                </p>
              </div>

              <div className={styles.cardBody}>
                {/* Left Side: Robot */}
                <div className={styles.illustrationContainer}>
                  <div className={styles.robotWrapper}>
                    <Image
                      src="/assets/img/illustrations/bepvault-robot.png"
                      alt="BEPVault Robot"
                      width={600}
                      height={600}
                      className={styles.robotImage}
                      priority
                    />
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className={styles.formSide}>
                  {error && <div className={styles.errorMessage}>{error}</div>}

                  {activationMessage ? (
                    <div className={styles.activationMessageContainer}>
                      <h3 className={styles.activationTitle}>
                        Account Activation Required
                      </h3>
                      <p>{activationMessage}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className={styles.signInForm}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                          EMAIL | USERNAME | UHID
                        </label>
                        <input
                          type="text"
                          id="email"
                          className={styles.inputField}
                          placeholder="nikitaajiva@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                          PASSWORD
                        </label>
                        <div className={styles.passwordWrapper}>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className={styles.inputField}
                            placeholder="············"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.eyeButton}
                            tabIndex="-1"
                          >
                            <i
                              className={`bi ${
                                showPassword ? "bi-eye-slash" : "bi-eye"
                              }`}
                            ></i>
                          </button>
                        </div>
                      </div>

                      <div className={styles.formActionsRow}>
                        <div className={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            id="remember-me"
                            className={styles.checkbox}
                          />
                          <label
                            htmlFor="remember-me"
                            className={styles.checkboxLabel}
                          >
                            Remember Me
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={styles.signInButton}
                        disabled={authLoading}
                      >
                        {authLoading ? "Signing In..." : "SIGN IN"}
                      </button>

                      <div className={styles.forgotPasswordContainer}>
                        <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                          Forgot Password?
                        </Link>
                      </div>

                      <div className={styles.dividerLine}></div>

                      <div className={styles.createAccountText}>
                        New on our platform?{" "}
                        <Link href="/sign-up" className={styles.createAccountLink}>
                          Create an account
                        </Link>
                      </div>

                      <div className={styles.socialContainer}>
                        <button type="button" className={styles.socialButton}>
                          <i className="bi bi-facebook"></i>
                        </button>
                        <button type="button" className={styles.socialButton}>
                          <i className="bi bi-twitter-x"></i>
                        </button>
                        <button type="button" className={styles.socialButton}>
                          <i className="bi bi-google"></i>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              {/* Footer moved inside */}
              <div className={styles.loginFooter}>
                <span>© 2024 BEPVault. All rights reserved. | </span>
                <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
                <span> | </span>
                <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          {/* Corner Star */}
          <div className={styles.cornerStar}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(255,215,0,0.5)"/>
             </svg>
          </div>
        </div>
      </div>
    </>
  );
}
