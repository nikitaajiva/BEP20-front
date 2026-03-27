"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ NEW: token state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activationMessage, setActivationMessage] = useState(null);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null);

  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    const localToken = localStorage.getItem("token");

    if (localToken) {
      try {
        setToken(localToken); // ✅ Save in context
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            await logout();
            return;
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Fetch user error:", err);
        await logout();
        return;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    setActivationMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.actionRequired === "ACTIVATE_ACCOUNT") {
          setActivationMessage(data.message);
          return;
        }
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token); // ✅ Set in context
      setUser(data.user);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Signup failed: status ${res.status}`);
      }

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async ({ password, confirmPassword, token }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/set-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to set password.");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token); // ✅ update token in context
      setUser(data.user);
      router.push("/dashboard");

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    setForgotPasswordMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      setForgotPasswordMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null); // ✅ Clear from context
      setUser(null);
      setError(null);
      setActivationMessage(null);
      setForgotPasswordMessage(null);
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token, // ✅ exposed
        setToken, // ✅ exposed
        loading,
        setLoading,
        error,
        login,
        signup,
        logout,
        fetchUser,
        setError,
        API_URL,
        setPassword,
        activationMessage,
        setActivationMessage,
        forgotPassword,
        forgotPasswordMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
