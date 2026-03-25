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
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 2}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 20}s`,
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
        <div className={styles.bgAnimation}>
          {particles.map((p) => (
            <div
              key={p.id}
              className={styles.particle}
              style={{
                left: p.left,
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

        <div className={styles.mainContainer}>
          {/* Glass Form Card */}
          <div className={styles.formGlassCard}>
            <div className={styles.logoContainer}>
              <Image
                src="/bepvault_logo.png"
                alt="BEPVault Logo"
                width={40}
                height={40}
                className={styles.logo}
              />
              <span className={styles.logoText}>BEPVault</span>
            </div>

            <h2 className={styles.title}>Welcome to BEPVault!</h2>
            <p className={styles.subtitle}>
              Please sign-in to your account and start the adventure
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {activationMessage ? (
              <div className={styles.activationMessageContainer}>
                <h3 className={styles.activationTitle}>
                  Account Activation Required
                </h3>
                <p>{activationMessage}</p>
                <p>
                  Please follow the instructions sent to your email to complete
                  your registration.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className={styles.signInForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>
                      EMAIL | USERNAME | UHID
                    </label>
                    <input
                      type="text"
                      id="email"
                      className={styles.inputField}
                      placeholder="Mrperfect2025@icloud.com"
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

                  <button
                    type="submit"
                    className={styles.signInButton}
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing In..." : "SIGN IN"}
                  </button>
                </form>

                <div className={styles.createAccountText}>
                  New on our platform?{" "}
                  <Link href="/sign-up" className={styles.createAccountLink}>
                    Create an account
                  </Link>
                  
                  <div className={styles.socialContainer}>
                    <button className={styles.socialButton}>
                      <i className="bi bi-facebook"></i>
                    </button>
                    <button className={styles.socialButton}>
                      <i className="bi bi-twitter-x"></i>
                    </button>
                    <button className={styles.socialButton}>
                      <i className="bi bi-google"></i>
                    </button>
                  </div>
                </div>

                <div className={styles.signUpNowContainer}>
                  <Link href="/sign-up" className={styles.signUpNowButton}>
                    SIGN UP NOW!
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Character Illustration */}
          <div className={styles.illustrationContainer}>
            <div className={styles.robotWrapper}>
              <Image
                src="/assets/img/illustrations/bepvault-robot.png"
                alt="BEPVault Robot"
                width={700}
                height={700}
                className={styles.robotImage}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
