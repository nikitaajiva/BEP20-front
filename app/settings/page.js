'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, loading: authLoading, updateUser, API_URL, logout } = useAuth();
  const [settings, setSettings] = useState({
    successfulDeposits: true,
    withdrawalConfirmations: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.notificationSettings) {
      setSettings(user.notificationSettings);
    }
  }, [user]);

  const handleToggle = async (settingName) => {
    const newSettings = { ...settings, [settingName]: !settings[settingName] };
    setSettings(newSettings);
    
    // Auto-save on toggle
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings.');
      }

      setMessage('Settings updated successfully!');
      if (updateUser) {
        updateUser(data.user);
      }
       // Message will disappear after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      setError(err.message);
      // Revert the toggle on error
      setSettings(settings);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Loading user data...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
        Please log in to view this page.
      </div>
    );
  }

  return (
    <AuthGuard>
      <div style={{ background: '#101935', minHeight: '100vh' }}>
        <DashboardNavbar user={user} onLogout={logout} />
        {/* <DashboardSidebar /> */}
        <main style={{ marginLeft: '90px', padding: '2rem' }}>
          <div className="container">
            <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Settings</h1>
            
            {/* Profile Settings Section */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Profile Settings</h5>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={user.username} 
                    disabled 
                    style={{ background: '#1a2035', color: '#fff', border: '1px solid #2a3042' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={user.email} 
                    disabled 
                    style={{ background: '#1a2035', color: '#fff', border: '1px solid #2a3042' }}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings Section */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Security Settings</h5>
                <div className="mb-3">
                  <label className="form-label">Two-Factor Authentication</label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={user.twoFactorEnabled} 
                      disabled 
                    />
                    <label className="form-check-label">
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    background: '#3699ff',
                    border: 'none',
                    padding: '0.65rem 1rem'
                  }}
                  onClick={() => {
                    // Add password change functionality here
                    alert('Password change functionality will be implemented soon.');
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Notification Settings</h5>
                {message && <div className={styles.successMessage}>{message}</div>}
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.settingItem}>
                  <div>
                    <h3 className={styles.settingTitle}>Successful Deposits</h3>
                    <p className={styles.settingDescription}>Receive an email confirmation for every successful deposit into your wallets.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.successfulDeposits}
                      onChange={() => handleToggle('successfulDeposits')}
                      disabled={isSubmitting}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div>
                    <h3 className={styles.settingTitle}>Withdrawal Confirmations</h3>
                    <p className={styles.settingDescription}>Receive an email confirmation when a withdrawal from your account is processed.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.withdrawalConfirmations}
                      onChange={() => handleToggle('withdrawalConfirmations')}
                      disabled={isSubmitting}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 