'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './SetPassword.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function SetPasswordPage() {
  const { setPassword, error, setError, loading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // The token is now part of the path, not a query parameter.
  const token = params.token ? (Array.isArray(params.token) ? params.token[0] : params.token) : null;

  useEffect(() => {
    if (!token) {
      setError('No registration token provided. Please use the link from your welcome email.');
    }
    // Clear any previous errors on mount
    return () => setError(null);
  }, [token, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Cannot set password without a valid registration token.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError(null);
    await setPassword({ password, confirmPassword, token });
  };

  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 5
  })), []);

  return (
    <div className={styles.setPasswordPage}>
      {/* Dynamic Background */}
      <div className={styles.lightRaysContainer}>
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
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          ></div>
        ))}
      </div>

      <motion.div 
        className={styles.mainContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.logoBox}>
          <Link href="/">
            <Image
              src="/bepvault_logo.png"
              alt="BEPVault Logo"
              width={80}
              height={80}
              priority
            />
          </Link>
        </div>

        <div className={styles.formGlassCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Secure Your <span className={styles.vaultText}>Vault</span></h1>
            <p className={styles.subtitle}>Create a strong password to complete your account setup and access your rewards.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className={styles.errorMessage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AlertCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={styles.setPasswordForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Choose New Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPasswordState(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className={styles.inputField}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Security Key</label>
              <div className={styles.inputWrapper}>
                <ShieldCheck className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={styles.inputField}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !token} 
              className={styles.submitButton}
            >
              {loading ? (
                <>Securing Access...</>
              ) : (
                <>
                  Establish Password
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={12} color="#ffd700" />
            256-bit Encryption
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={12} color="#ffd700" />
            Zero-Trust Protocol
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SetPasswordPage;
 