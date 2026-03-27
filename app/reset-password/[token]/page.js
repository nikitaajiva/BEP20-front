"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import styles from './reset-password-token.module.css';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordTokenPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const { API_URL, setUser } = useAuth();

  const token = params.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
        setError("Reset token not found in URL. Please use the link from your email.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = `${API_URL.replace(/\/$/, '')}/auth/reset-password/${token}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password, confirmPassword: password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "Password has been reset successfully! Redirecting to dashboard...");
        
        localStorage.setItem('token', data.token);
        setUser(data.user);
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } else {
        setError(data.message || "Failed to reset password. The link may be invalid or expired.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An error occurred connecting to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - BEPVault</title>
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
              alt="Reset Password Character" 
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
            <h2 className={styles.title}>Set New Password</h2>
            <p className={styles.subtitle}>
              Please enter and confirm your new password below.
            </p>

            {message && <p className={`${styles.message} ${styles.successMessage}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.errorMessage}`}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={styles.inputField}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !!message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                    disabled={loading || !!message}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={styles.inputField}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading || !!message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.eyeButton}
                    disabled={loading || !!message}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                <p className={styles.passwordInstructions}>Password must be at least 6 characters long.</p>
              </div>
              <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={loading || !!message}>
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>

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