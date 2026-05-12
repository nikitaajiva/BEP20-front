"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import bs58 from "bs58";

import safeStorage from "../utils/safeStorage";

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
    const localToken = safeStorage.getItem("token");

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

      safeStorage.setItem("token", data.token);
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

      safeStorage.setItem("token", data.token);
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
      const token = safeStorage.getItem("token");
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
      safeStorage.removeItem("token");
      setToken(null); // ✅ Clear from context
      setUser(null);
      setError(null);
      setActivationMessage(null);
      setForgotPasswordMessage(null);
      setLoading(false);
      router.push("/login");
    }
  };
const getPhantomProvider = () => {
  if (typeof window === "undefined") return null;
  const provider = window.phantom?.solana || window.solana;
  if (provider?.isPhantom) return provider;
  return null;
};

const getPhantomUserMessage = (code) => {
  switch (code) {
    case "PHANTOM_NOT_INSTALLED":
      return "Phantom wallet is not installed. Please install Phantom to continue.";
    case "AUTH_REQUIRED":
      return "Please login to your account before connecting Phantom wallet.";
    case "PHANTOM_NOT_READY":
      return "Please set up your Phantom wallet first. Create or import a wallet in the Phantom extension, then try again.";
    case "PHANTOM_LOCKED":
      return "Please unlock your Phantom wallet, then try again.";
    case "PHANTOM_CANCELLED":
      return "Wallet connection was cancelled.";
    case "PHANTOM_SIGN_CANCELLED":
      return "Wallet signature was cancelled.";
    case "PHANTOM_SIGN_FAILED":
      return "Failed to sign the wallet verification message. Please try again.";
    case "PHANTOM_CONNECT_FAILED":
      return "Unable to connect Phantom wallet. Please open Phantom, make sure your wallet is ready, then try again.";
    default:
      return code || "Failed to connect Phantom wallet.";
  }
};

  const connectPhantomWallet = async () => {
    // Note: Global setLoading(true) is omitted here to prevent dashboard UI hangs.
    // Dashboard components manage their own local walletLoading state for connection.
    setError(null);

    try {
      const provider = getPhantomProvider();

      if (!provider) {
        throw new Error("PHANTOM_NOT_INSTALLED");
      }

      const localToken = safeStorage.getItem("token");
      if (!localToken) {
        throw new Error("AUTH_REQUIRED");
      }

      let walletAddress = "";

      // Requirement 7: Support already-connected Phantom or existing publicKey
      if (provider.isConnected && provider.publicKey) {
        walletAddress = provider.publicKey.toString();
        console.log("Using already connected Phantom wallet:", walletAddress);
      } else if (provider.publicKey) {
        walletAddress = provider.publicKey.toString();
        console.log("Using Phantom publicKey without reconnect:", walletAddress);
      } else {
        console.log("Before provider.connect");
        
        // Use request({ method: "connect" }) if available, fallback to connect()
        const connectionCall = provider.request 
          ? provider.request({ method: "connect" }) 
          : provider.connect({ onlyIfTrusted: false });

        const connection = await Promise.race([
          connectionCall,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("PHANTOM_CONNECT_TIMEOUT")), 20000)
          ),
        ]);

        if (!connection?.publicKey) {
          throw new Error("PHANTOM_NOT_READY");
        }

        walletAddress = connection.publicKey.toString();
        console.log("Connected Phantom wallet:", walletAddress);
      }

      // Requirement 8: After walletAddress is available, always continue to backend challenge
      if (!walletAddress) {
        throw new Error("PHANTOM_NOT_READY");
      }
      
      console.log("Phantom walletAddress resolved:", walletAddress);
      console.log("Calling challenge API");

      const challengeRes = await fetch(`${API_URL}/auth/phantom/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localToken}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const challengeData = await challengeRes.json();
      console.log("Challenge response:", challengeData);

      if (!challengeRes.ok || !challengeData.success) {
        throw new Error(challengeData.message || "Failed to create wallet verification challenge.");
      }

      console.log("Calling signMessage");
      let signedMessage;

      try {
        const encodedMessage = new TextEncoder().encode(challengeData.message);
        signedMessage = await provider.signMessage(encodedMessage, "utf8");
      } catch (signError) {
        console.error("Phantom sign message error:", signError);
        const rawMessage = String(signError?.message || signError || "").toLowerCase();

        if (
          signError?.code === 4001 ||
          rawMessage.includes("rejected") ||
          rawMessage.includes("cancel")
        ) {
          throw new Error("PHANTOM_SIGN_CANCELLED");
        }

        throw new Error("PHANTOM_SIGN_FAILED");
      }

      const bs58Module = bs58.default || bs58;
      const signature = bs58Module.encode(signedMessage.signature);

      console.log("Calling verify API");
      const verifyRes = await fetch(`${API_URL}/auth/phantom/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localToken}`,
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message: challengeData.message,
        }),
      });

      const verifyData = await verifyRes.json();
      console.log("Verify response:", verifyData);

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Failed to verify Phantom wallet.");
      }

      await fetchUser();

      return {
        success: true,
        walletAddress,
        message: "Phantom wallet connected successfully.",
      };
    } catch (err) {
      console.error("connectPhantomWallet caught error:", err);
      const code = err?.message || "PHANTOM_CONNECT_FAILED";
      const userMessage = getPhantomUserMessage(code);
      setError(userMessage);

      return {
        success: false,
        code,
        error: userMessage,
      };
    } finally {
      // Global loading remains false.
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
        connectPhantomWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
