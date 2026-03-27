"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from './forgot-password.module.css';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { forgotPassword, forgotPasswordMessage, error, loading, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors from context

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    await forgotPassword(email);
  };

  return (
    <>
      <Head>
        <title>Forgot Password - BEPVault</title>
        <meta name="description" content="Reset your BEPVault account password" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.pageLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.logoContainer}>
            <Image src="/assets/img/logo-auth-page.png" alt="BEPVault Logo" width={180} height={40} className={styles.logo} />
          </div>
          <div className={styles.illustrationContainer}>
            <Image 
              src="/assets/img/illustrations/auth-character.png"
              alt="Forgot Password Character" 
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

        <div className={styles.rightColumn}>
          <div className={styles.formContainer}>
            <h2 className={styles.title}>Forgot Your Password? 🔒</h2>
            
            {forgotPasswordMessage ? (
              <div className={styles.successMessageContainer}>
                <p className={styles.subtitle}>
                  {forgotPasswordMessage}
                </p>
              </div>
            ) : (
              <>
                <p className={styles.subtitle}>
                  Enter your email and we&apos;ll send you instructions to reset your password.
                </p>

                {error && <p className={`${styles.message} ${styles.errorMessage}`}>{error}</p>}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className={styles.inputField}
                      placeholder="johndoe@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={loading}>
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            <div className={styles.backToLoginContainer}>
              <Link href="/login" className={styles.backToLoginLink}>
                <i className="bi bi-chevron-left"></i> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
