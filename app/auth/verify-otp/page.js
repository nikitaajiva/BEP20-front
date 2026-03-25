'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// import styles from './VerifyOtp.module.css'; // We can create this later

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { API_URL, error, setError, loading, setLoading, tempUserId, setTempUserId } = useAuth(); // Assuming setLoading is available
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const userIdFromQuery = searchParams.get('userId');
    if (userIdFromQuery) {
      setUserId(userIdFromQuery);
      setTempUserId(userIdFromQuery); // Also ensure it's in context if page is reloaded
    } else if (tempUserId) {
      setUserId(tempUserId);
    }
    // Clear any global errors when the page loads
    setError(null);
  }, [searchParams, tempUserId, setError, setTempUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('User ID is missing. Cannot verify OTP.');
      return;
    }
    if (!otp || otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true); // Use setLoading from AuthContext or local state
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      // OTP Verified successfully
      console.log('OTP Verified:', data.message);
      // No need to set user or token here, just redirect to set password
      router.push(`/auth/set-password?userId=${userId}`);
    } catch (err) {
      setError(err.message);
      console.error('OTP Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Basic styling for now, replace with styles.module.css later
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
      <h2>Verify Your Account</h2>
      <p>An OTP has been sent to your email. Please enter it below.</p>
      <form onSubmit={handleSubmit} style={formStyles}>
        {error && <p style={errorStyles}>{error}</p>}
        <div>
          <label htmlFor="otp">Enter 6-Digit OTP:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="------"
            required
            style={inputStyles}
          />
        </div>
        <button type="submit" disabled={loading || !userId} style={buttonStyles}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      {/* {userId && <p>Verifying for User ID (debug): {userId}</p>}  */}
    </div>
  );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm />
        </Suspense>
    )
} 