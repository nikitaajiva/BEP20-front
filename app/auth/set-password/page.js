'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// import styles from './SetPassword.module.css'; // We can create this later

//

function SetPasswordForm() {
  const { setPassword, error, setError, loading } = useAuth();
  const searchParams = useSearchParams();
  
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      setError('No registration token provided. Please use the link from your welcome email.');
    }
    // Clear any previous errors on mount
    setError(null);
  }, [searchParams, setError]);

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
    
    // The setPassword function from context will handle the API call,
    // subsequent login, and redirection on success.
    await setPassword({ password, confirmPassword, token });
  };
  
  // Reusing basic inline styles for simplicity
  const pageStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };
  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    minWidth: '300px'
  };
  const inputStyles = {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };
  const buttonStyles = {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  const errorStyles = {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center'
  };

  return (
    <div style={pageStyles}>
      <h2>Set Your Account Password</h2>
      <p>Please choose a secure password to complete your registration.</p>
      
      {error && <p style={errorStyles}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={formStyles}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPasswordState(e.target.value)}
            placeholder="Enter new password"
            required
            style={inputStyles}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            style={inputStyles}
          />
        </div>
        <button type="submit" disabled={loading || !token} style={buttonStyles}>
          {loading ? 'Setting Password...' : 'Set Password and Login'}
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SetPasswordForm />
        </Suspense>
    );
} 