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

  // ⏩ Redirect if already logged in
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
        {/* Left Column: Illustration */}
        <div className={styles.leftColumn}>
          <div className={styles.logoContainer}>
            <a href="/" className="">
              <Image
                src="/assets/img/logo-auth-page.png"
                alt="BEPVault Logo"
                width={180}
                height={40}
                className={styles.logo}
              />
            </a>
          </div>
          <div className={styles.illustrationContainer}>
            <Image
              src="/assets/img/illustrations/auth-character.png"
              alt="Login Character"
              width={450}
              height={450}
              className={styles.characterImage}
              priority
            />
            <Image
              src="/assets/img/illustrations/floating-sphere.png"
              alt="Floating Sphere"
              width={150}
              height={150}
              className={styles.floatingSphere}
            />
          </div>
        </div>

        {/* Right Column: Form */}
        <div className={styles.rightColumn}>
          <div className={styles.formContainer}>
            <h2 className={styles.title}>Welcome to BEPVault! 👋</h2>
            <p className={styles.subtitle}>
              Please sign-in to your account and start the adventure
            </p>

            {error && <p className={styles.errorMessage}>{error}</p>}

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
                      Email | Username | UHID
                    </label>
                    <input
                      type="text"
                      id="email"
                      className={styles.inputField}
                      placeholder="johndoe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.labelContainer}>
                      <label htmlFor="password" className={styles.label}>
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className={styles.supportLink}
                      >
                        Forgot Password?
                      </Link>
                    </div>
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
                    className={`${styles.button} ${styles.signInButton}`}
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <p className={styles.createAccountText}>
                  New on our platform?{" "}
                  <Link href="/sign-up" className={styles.createAccountLink}>
                    Create an account
                  </Link>
                </p>

                <div className={styles.dividerContainer}>
                  <hr className={styles.dividerLine} />
                  <span className={styles.dividerText}>or</span>
                  <hr className={styles.dividerLine} />
                </div>

                <div className={styles.socialLoginContainer}>
                  <button
                    className={`${styles.socialButton} ${styles.socialButtonFacebook}`}
                  >
                    <i className="bi bi-facebook"></i>
                  </button>
                  <button
                    className={`${styles.socialButton} ${styles.socialButtonTwitter}`}
                  >
                    <i className="bi bi-twitter-x"></i>
                  </button>
                  <button
                    className={`${styles.socialButton} ${styles.socialButtonGithub}`}
                  >
                    <i className="bi bi-github"></i>
                  </button>
                  <button
                    className={`${styles.socialButton} ${styles.socialButtonGoogle}`}
                  >
                    <i className="bi bi-google"></i>
                  </button>
                </div>

                <p className={styles.airdropClaimText}>
                  <Link
                    href="/sign-up"
                    className={`${styles.button} ${styles.claimButton}`}
                  >
                    Sign Up Now!
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
