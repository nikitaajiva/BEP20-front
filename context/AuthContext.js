"use client";
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import safeStorage from "../utils/safeStorage";

const AuthContext = createContext();

const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const API_URL = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;

const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
const PHANTOM_DOWNLOAD_URL = "https://phantom.app/";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPhantomProvider = () => {
  if (typeof window === "undefined") return null;

  const provider = window.phantom?.solana || window.solana;
  return provider?.isPhantom ? provider : null;
};

const waitForPhantomProvider = async (timeoutMs = 3000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const provider = getPhantomProvider();
    if (provider) return provider;
    await sleep(100);
  }

  return getPhantomProvider();
};

const readJsonSafely = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Invalid server response.",
    };
  }
};

const getPhantomUserMessage = (code) => {
  switch (code) {
    case "AUTH_REQUIRED":
      return "Please log in before connecting your Phantom wallet.";
    case "PHANTOM_NOT_INSTALLED":
      return "Phantom Wallet is not installed. Please install Phantom and try again.";
    case "PHANTOM_NOT_READY":
      return "Phantom Wallet is not ready yet. Please refresh the page and try again.";
    case "PHANTOM_LOCKED":
      return "Please unlock Phantom Wallet and try again.";
    case "PHANTOM_USER_REJECTED":
      return "You cancelled the Phantom Wallet request.";
    case "PHANTOM_ALREADY_PENDING":
      return "A Phantom request is already open. Please approve or cancel it in Phantom.";
    case "PHANTOM_CONNECT_TIMEOUT":
      return "Phantom did not respond. Please open/unlock Phantom and try again.";
    case "PHANTOM_NO_PUBLIC_KEY":
      return "Could not read your Phantom wallet address. Please try again.";
    case "PHANTOM_SIGN_FAILED":
      return "Could not sign the verification message. Please try again.";
    case "PHANTOM_BACKEND_CHALLENGE_FAILED":
      return "Could not create wallet verification challenge. Please try again.";
    case "PHANTOM_BACKEND_VERIFY_FAILED":
      return "Could not verify Phantom wallet. Please try again.";
    case "PHANTOM_NETWORK_ERROR":
      return "Network error while connecting Phantom wallet. Please try again.";
    default:
      return "Unable to connect Phantom wallet right now. Please try again.";
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activationMessage, setActivationMessage] = useState(null);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null);
  const phantomConnectInProgressRef = useRef(false);

  const router = useRouter();

  const updateUser = (nextUser) => {
    setUser((prev) => ({
      ...(prev || {}),
      ...(nextUser || {}),
    }));
  };

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const localToken = safeStorage.getItem("token");

    if (localToken) {
      try {
        setToken(localToken);
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
  }, []);

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
      setToken(data.token);
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
      setToken(data.token);
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

  const updateMe = useCallback(async (updatedData) => {
    setLoading(true);
    try {
      const localToken = safeStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error("Update user error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const logout = useCallback(async () => {
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
      setToken(null);
      setUser(null);
      setError(null);
      setActivationMessage(null);
      setForgotPasswordMessage(null);
      setLoading(false);
      router.push("/login");
    }
  }, [API_URL, router]);

  const connectPhantomWallet = async () => {
    if (phantomConnectInProgressRef.current) {
      return {
        success: false,
        code: "PHANTOM_ALREADY_PENDING",
        error: getPhantomUserMessage("PHANTOM_ALREADY_PENDING"),
      };
    }

    phantomConnectInProgressRef.current = true;

    try {
      const currentToken =
        token ||
        (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (!currentToken) {
        return {
          success: false,
          code: "AUTH_REQUIRED",
          error: getPhantomUserMessage("AUTH_REQUIRED"),
        };
      }

      const provider = await waitForPhantomProvider(3000);

      if (!provider) {
        return {
          success: false,
          code: "PHANTOM_NOT_INSTALLED",
          error: getPhantomUserMessage("PHANTOM_NOT_INSTALLED"),
        };
      }

      let connectResponse;

      try {
        const connectPromise = provider.connect({ onlyIfTrusted: false });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject({
              code: "PHANTOM_CONNECT_TIMEOUT",
            });
          }, 15000);
        });

        connectResponse = await Promise.race([connectPromise, timeoutPromise]);
      } catch (error) {
        const errorCode =
          error?.code === 4001
            ? "PHANTOM_USER_REJECTED"
            : error?.code === -32002
            ? "PHANTOM_ALREADY_PENDING"
            : error?.code === "PHANTOM_CONNECT_TIMEOUT"
            ? "PHANTOM_CONNECT_TIMEOUT"
            : "PHANTOM_LOCKED";

        return {
          success: false,
          code: errorCode,
          error: getPhantomUserMessage(errorCode),
        };
      }

      const walletAddress =
        connectResponse?.publicKey?.toString?.() ||
        provider?.publicKey?.toString?.();

      if (!walletAddress) {
        return {
          success: false,
          code: "PHANTOM_NO_PUBLIC_KEY",
          error: getPhantomUserMessage("PHANTOM_NO_PUBLIC_KEY"),
        };
      }

      let challengeData;

      try {
        const challengeResponse = await fetch(`${API_URL}/auth/phantom/challenge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            walletAddress,
          }),
        });

        challengeData = await readJsonSafely(challengeResponse);

        if (!challengeResponse.ok || !challengeData.success || !challengeData.message) {
          return {
            success: false,
            code:
              challengeData?.errorCode ||
              "PHANTOM_BACKEND_CHALLENGE_FAILED",
            error:
              challengeData?.message ||
              getPhantomUserMessage("PHANTOM_BACKEND_CHALLENGE_FAILED"),
          };
        }
      } catch (error) {
        return {
          success: false,
          code: "PHANTOM_NETWORK_ERROR",
          error: getPhantomUserMessage("PHANTOM_NETWORK_ERROR"),
        };
      }

      let signedMessage;

      try {
        const encodedMessage = new TextEncoder().encode(challengeData.message);
        signedMessage = await provider.signMessage(encodedMessage, "utf8");
      } catch (error) {
        const errorCode =
          error?.code === 4001
            ? "PHANTOM_USER_REJECTED"
            : error?.code === -32002
            ? "PHANTOM_ALREADY_PENDING"
            : "PHANTOM_SIGN_FAILED";

        return {
          success: false,
          code: errorCode,
          error: getPhantomUserMessage(errorCode),
        };
      }

      const signatureBytes = signedMessage?.signature;

      if (!signatureBytes) {
        return {
          success: false,
          code: "PHANTOM_SIGN_FAILED",
          error: getPhantomUserMessage("PHANTOM_SIGN_FAILED"),
        };
      }

      let verifyData;

      try {
        const verifyResponse = await fetch(`${API_URL}/auth/phantom/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            walletAddress,
            message: challengeData.message,
            signature: Array.from(signatureBytes),
          }),
        });

        verifyData = await readJsonSafely(verifyResponse);

        if (!verifyResponse.ok || !verifyData.success) {
          return {
            success: false,
            code:
              verifyData?.errorCode ||
              "PHANTOM_BACKEND_VERIFY_FAILED",
            error:
              verifyData?.message ||
              getPhantomUserMessage("PHANTOM_BACKEND_VERIFY_FAILED"),
          };
        }
      } catch (error) {
        return {
          success: false,
          code: "PHANTOM_NETWORK_ERROR",
          error: getPhantomUserMessage("PHANTOM_NETWORK_ERROR"),
        };
      }

      setUser((prev) => ({
        ...(prev || {}),
        ...(verifyData.user || {}),
        phantomWalletAddress:
          verifyData.phantomWalletAddress ||
          verifyData.user?.phantomWalletAddress ||
          walletAddress,
        phantomWalletConnectedAt:
          verifyData.phantomWalletConnectedAt ||
          verifyData.user?.phantomWalletConnectedAt ||
          new Date().toISOString(),
      }));

      return {
        success: true,
        walletAddress:
          verifyData.phantomWalletAddress ||
          verifyData.user?.phantomWalletAddress ||
          walletAddress,
        message:
          verifyData.message ||
          "Phantom wallet connected successfully.",
      };
    } finally {
      phantomConnectInProgressRef.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
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
        updateMe,
        updateUser,
        connectPhantomWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
