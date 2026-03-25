"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { user, loading, fetchUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check token and try to fetch user if not already loaded
    if (!user && !loading) {
      const token = localStorage.getItem('token');
      if (!token) {
        logout(); // Use logout instead of direct navigation
      } else {
        fetchUser();
      }
    }
  }, [user, loading, fetchUser, router, logout]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        // If still loading after timeout, perform logout
        if (!user) {
          logout();
        }
      }, 10000); // 10 seconds timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, user, logout]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
};

export default AuthGuard; 
