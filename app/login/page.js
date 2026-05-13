"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "@/components/landing/landingpage.css";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      top: `${(Math.random() * 100).toFixed(2)}%`,
      size: `${(1 + Math.random() * 3).toFixed(1)}px`,
      duration: `${(4 + Math.random() * 8).toFixed(1)}s`,
      delay: `${(Math.random() * 5).toFixed(1)}s`,
    }));
    setParticles(newParticles);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  return (
    <>
      <div className="signInPage">
        {/* Cinematic Background Layer */}
        <div className="backgroundCanvas">
          <div className="fireGlowTop" />
          <div className="fireGlowBottom" />
          {particles.map((p) => (
            <div
              key={p.id}
              className="fireSpark"
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mainContainer"
        >
          {/* Top Branding Section */}
          <div className="brandHeader">
            <div className="logoCircle">
              <Image src="/img/main-logo.avif" alt="Logo" width={60} height={60} className="object-contain" />
              <div className="logoGlowPulse" />
            </div>
            <h1 className="brandTitle">
              Toking<span className="goldText">Hoofborn</span>
            </h1>
          </div>

          {/* Main Login Card */}
          <div className="authCard">
            <div className="cardContent">
              
              {/* Left Side: Cinematic Visual */}
              <div className="visualSide">
                <div className="imageFrame">
                  <Image
                    src="/IMG/login-visual.png"
                    alt="Authentic Racing"
                    fill
                    className="visualImage"
                    priority
                  />
                  <div className="imageOverlay" />
                  <div className="imageTag">
                    <span className="tagDot" />
                    COMMAND CENTER
                  </div>
                </div>
              </div>

              {/* Right Side: Login Form */}
              <div className="formSide">
                <div className="formHeader">
                  <h2 className="formTitle">Welcome Back</h2>
                  <p className="formSubtitle">Access your executive racing vault</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="errorMessage"
                  >
                    <i className="ri-error-warning-fill" /> {error}
                  </motion.div>
                )}

                {activationMessage ? (
                  <div className="activationBox">
                    <h3>Activation Required</h3>
                    <p>{activationMessage}</p>
                    <button onClick={() => window.location.reload()} className="btnSecondary">Retry</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="authForm">
                    <div className="fieldGroup">
                      <label>IDENTITY ID / EMAIL</label>
                      <div className="inputWrapper">
                        <i className="ri-user-6-line" />
                        <input
                          type="text"
                          placeholder="Enter your credentials"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="fieldGroup">
                      <label>SECURITY PASSWORD</label>
                      <div className="inputWrapper">
                        <i className="ri-lock-2-line" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="visibilityToggle"
                        >
                          <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                        </button>
                      </div>
                    </div>

                    <div className="optionsRow">
                      <label className="customCheckbox">
                        <input type="checkbox" />
                        <span className="checkmark" />
                        Keep me logged in
                      </label>
                      <Link href="/forgot-password" className="forgotLink">Forgot Password?</Link>
                    </div>

                    <button
                      type="submit"
                      className="signInButton"
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <div className="loader" />
                      ) : (
                        <>
                          SECURE SIGN IN
                          <i className="ri-arrow-right-line" />
                        </>
                      )}
                    </button>

                    <div className="formFooter">
                      <span>Don't have an account?</span>
                      <Link href="/sign-up" className="signUpLink">Create Account</Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Legal Links */}
          <div className="legalLinks">
            <p>© 2026 TokingHoofborn. All Rights Reserved.</p>
            <div className="legalGap" />
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
