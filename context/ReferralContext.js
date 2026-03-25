"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same directory or adjust path

const ReferralContext = createContext(null);

const initialPaginationState = {
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  totalRecords: 0,
};

export const ReferralProvider = ({ children }) => {
  const { user, API_URL } = useAuth(); // Get user and API_URL from AuthContext
  const [directChildren, setDirectChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState(initialPaginationState);

  const fetchDirectChildren = useCallback(async (page = 1, limit = 10) => {
    if (!user || !API_URL) {
      setDirectChildren([]);
      setPaginationInfo(initialPaginationState);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/referrals/direct-children?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDirectChildren(data.data || []);
        setPaginationInfo(data.pagination || { ...initialPaginationState, limit, totalRecords: data.data?.length || 0, currentPage: page });
      } else {
        const errorMsg = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || 'Failed to fetch direct children');
        setError(errorMsg);
        setDirectChildren([]);
        setPaginationInfo(initialPaginationState);
      }
    } catch (err) {
      setError('Could not connect to server to fetch referral data.');
      setDirectChildren([]);
      setPaginationInfo(initialPaginationState);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const fetchTieredChildren = useCallback(async (tier, page = 1, limit = 10) => {
    if (!user || !API_URL) {
      setDirectChildren([]);
      setPaginationInfo(initialPaginationState);
      return;
    }
    if (!tier || tier < 1) {
      setError("Invalid tier requested.");
      setDirectChildren([]);
      setPaginationInfo(initialPaginationState);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/referrals/tiered-children?tier=${tier}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDirectChildren(data.data || []);
        setPaginationInfo(data.pagination || { ...initialPaginationState, limit, totalRecords: data.data?.length || 0, currentPage: page });
      } else {
        const errorMsg = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || `Failed to fetch children for tier ${tier}`);
        setError(errorMsg);
        setDirectChildren([]);
        setPaginationInfo(initialPaginationState);
      }
    } catch (err) {
      setError('Could not connect to server to fetch referral data.');
      setDirectChildren([]);
      setPaginationInfo(initialPaginationState);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  // Initial fetch when component mounts or user/API_URL changes
  // This will be controlled by XRPSwiftWallet now based on its activeTier and page state
  // So, removing the automatic fetch from here to avoid conflicts.
  // useEffect(() => {
  //   if (user && API_URL) {
  //     fetchDirectChildren(); // Fetches page 1, limit 10 by default
  //   }
  // }, [user, fetchDirectChildren, API_URL]);

  return (
    <ReferralContext.Provider value={{ directChildren, paginationInfo, loading, error, fetchDirectChildren, fetchTieredChildren }}>
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (context === null) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}; 