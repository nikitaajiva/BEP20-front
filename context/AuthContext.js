"use client";
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import safeStorage from "../utils/safeStorage";

const AuthContext = createContext();

const buildApiUrl = (rawApiUrl) => {
  const normalizedBaseUrl = `${rawApiUrl || ""}`.trim().replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    return "/api";
  }

  return normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;
};

const API_URL = buildApiUrl(process.env.NEXT_PUBLIC_API_URL);
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
const PHANTOM_DOWNLOAD_URL = "https://phantom.app/";
const PHANTOM_PROVIDER_TIMEOUT_MS = 4000;
const PHANTOM_PROVIDER_RETRY_INTERVAL_MS = 200;
const PHANTOM_CONNECT_TIMEOUT_MS = 20000;

const debugPhantom = (...args) => {
  if (IS_DEVELOPMENT) {
    console.debug("[Phantom]", ...args);
  }
};

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const createPhantomError = (code, userMessage) => {
  const error = new Error(code);
  error.phantomCode = code;
  error.userMessage = userMessage;
  return error;
};

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const getImmediatePhantomProvider = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const provider = window.phantom?.solana || window.solana;

  if (provider?.isPhantom === true) {
    return provider;
  }

  return null;
};

const waitForPhantomProvider = async ({
  timeoutMs = PHANTOM_PROVIDER_TIMEOUT_MS,
  intervalMs = PHANTOM_PROVIDER_RETRY_INTERVAL_MS,
} = {}) => {
  if (typeof window === "undefined") {
    return null;
  }

  const startTime = Date.now();

  while (Date.now() - startTime <= timeoutMs) {
    const provider = getImmediatePhantomProvider();

    if (provider) {
      return provider;
    }

    await wait(intervalMs);
  }

  return null;
};

const openPhantomDownloadPage = () => {
  if (typeof window !== "undefined") {
    window.open(PHANTOM_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
  }
};

const getResolvedWalletAddress = (connectResponse, provider) => {
  if (connectResponse?.publicKey?.toString) {
    return connectResponse.publicKey.toString();
  }

  if (provider?.publicKey?.toString) {
    return provider.publicKey.toString();
  }

  return "";
};

const getPhantomUserMessage = (code, fallbackMessage) => {
  switch (code) {
    case "AUTH_REQUIRED":
      return "Please log in before connecting your Phantom wallet.";
    case "PHANTOM_NOT_INSTALLED":
      return "Phantom wallet is not installed. Please install Phantom to continue.";
    case "PHANTOM_NOT_READY":
      return "Phantom wallet is not ready yet. Please open Phantom, finish setup, and try again.";
    case "PHANTOM_LOCKED":
      return "Please unlock your Phantom wallet, then try again.";
    case "PHANTOM_USER_REJECTED":
      return "The Phantom request was cancelled. Please approve the connection and signature to continue.";
    case "PHANTOM_ALREADY_PENDING":
      return "A Phantom request is already open. Please approve or cancel it in Phantom.";
    case "PHANTOM_CONNECT_TIMEOUT":
      return "Phantom took too long to respond. Please try again.";
    case "PHANTOM_NO_PUBLIC_KEY":
      return "Phantom connected, but no wallet address was returned. Please try again.";
    case "PHANTOM_SIGN_FAILED":
      return "Phantom could not sign the verification message. Please try again.";
    case "PHANTOM_BACKEND_CHALLENGE_FAILED":
      return fallbackMessage || "We could not create a wallet verification request right now. Please try again.";
    case "PHANTOM_BACKEND_VERIFY_FAILED":
      return fallbackMessage || "We could not verify your Phantom wallet. Please try again.";
    case "PHANTOM_NETWORK_ERROR":
      return "Network error while connecting Phantom wallet. Please check your connection and try again.";
    default:
      return fallbackMessage || "Failed to connect Phantom wallet.";
  }
};

const classifyPhantomProviderError = (error, phase = "connect") => {
  const message = `${error?.message || ""}`.toLowerCase();
  const code = error?.code;

  if (error?.phantomCode) {
    return error.phantomCode;
  }

  if (
    code === -32002 ||
    message.includes("already processing") ||
    message.includes("already pending") ||
    message.includes("request already pending") ||
    message.includes("resource not available")
  ) {
    return "PHANTOM_ALREADY_PENDING";
  }

  if (
    code === 4001 ||
    message.includes("user rejected") ||
    message.includes("rejected the request") ||
    message.includes("user denied") ||
    message.includes("cancelled") ||
    message.includes("canceled")
  ) {
    return "PHANTOM_USER_REJECTED";
  }

  if (message.includes("timeout")) {
    return "PHANTOM_CONNECT_TIMEOUT";
  }

  if (message.includes("locked") || message.includes("unlock")) {
    return "PHANTOM_LOCKED";
  }

  if (message.includes("not installed") || message.includes("not found")) {
    return "PHANTOM_NOT_INSTALLED";
  }

  return phase === "sign" ? "PHANTOM_SIGN_FAILED" : "PHANTOM_NOT_READY";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ NEW: token state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activationMessage, setActivationMessage] = useState(null);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null);
  const phantomConnectInFlightRef = useRef(false);

  const router = useRouter();

  const updateUser = (nextUserOrUpdater) => {
    setUser((currentUser) =>
      typeof nextUserOrUpdater === "function"
        ? nextUserOrUpdater(currentUser)
        : nextUserOrUpdater
    );
  };

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

  const updateMe = async (updatedData) => {
    setLoading(true);
    try {
      const localToken = localStorage.getItem("token");
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
  const connectPhantomWallet = async () => {
    // Note: Global setLoading(true) is omitted here to prevent dashboard UI hangs.
    // Dashboard components manage their own local walletLoading state for connection.
    setError(null);

    if (phantomConnectInFlightRef.current) {
      return {
        success: false,
        code: "PHANTOM_ALREADY_PENDING",
        error: getPhantomUserMessage("PHANTOM_ALREADY_PENDING"),
      };
    }

    if (!user) {
      return {
        success: false,
        code: "AUTH_REQUIRED",
        error: getPhantomUserMessage("AUTH_REQUIRED"),
      };
    }

    const localToken = token || safeStorage.getItem("token");

    if (!localToken) {
      return {
        success: false,
        code: "AUTH_REQUIRED",
        error: getPhantomUserMessage("AUTH_REQUIRED"),
      };
    }

    phantomConnectInFlightRef.current = true;

    try {
      const provider = await waitForPhantomProvider();

      if (!provider) {
        openPhantomDownloadPage();
        throw createPhantomError("PHANTOM_NOT_INSTALLED");
      }

      if (typeof provider.connect !== "function" || typeof provider.signMessage !== "function") {
        throw createPhantomError("PHANTOM_NOT_READY");
      }

      let connectResponse;

      try {
        connectResponse = await Promise.race([
          provider.connect({ onlyIfTrusted: false }),
          new Promise((_, reject) => {
            setTimeout(() => reject(createPhantomError("PHANTOM_CONNECT_TIMEOUT")), PHANTOM_CONNECT_TIMEOUT_MS);
          }),
        ]);
      } catch (providerError) {
        const providerCode = classifyPhantomProviderError(providerError, "connect");
        throw createPhantomError(providerCode);
      }

      const walletAddress = getResolvedWalletAddress(connectResponse, provider);

      if (!walletAddress) {
        throw createPhantomError("PHANTOM_NO_PUBLIC_KEY");
      }

      debugPhantom("Resolved wallet address", walletAddress);

      if (user?.phantomWalletAddress && user.phantomWalletAddress === walletAddress) {
        updateUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                phantomWalletAddress: walletAddress,
              }
            : currentUser
        );

        return {
          success: true,
          walletAddress,
          message: "Phantom wallet is already connected.",
        };
      }

      let challengeRes;
      let challengeData;

      try {
        challengeRes = await fetch(`${API_URL}/auth/phantom/challenge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localToken}`,
          },
          body: JSON.stringify({ walletAddress }),
        });
        challengeData = await parseJsonResponse(challengeRes);
      } catch (networkError) {
        throw createPhantomError("PHANTOM_NETWORK_ERROR");
      }

      if (!challengeRes.ok || !challengeData.success || !challengeData.message) {
        throw createPhantomError(
          "PHANTOM_BACKEND_CHALLENGE_FAILED",
          challengeData.message
        );
      }

      debugPhantom("Challenge created", challengeData);

      let signedMessageResponse;

      try {
        const encodedMessage = new TextEncoder().encode(challengeData.message);
        signedMessageResponse = await provider.signMessage(encodedMessage, "utf8");
      } catch (signError) {
        const providerCode = classifyPhantomProviderError(signError, "sign");
        throw createPhantomError(providerCode);
      }

      const signatureBytes = signedMessageResponse?.signature || signedMessageResponse;

      if (!signatureBytes) {
        throw createPhantomError("PHANTOM_SIGN_FAILED");
      }

      let verifyRes;
      let verifyData;

      try {
        verifyRes = await fetch(`${API_URL}/auth/phantom/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localToken}`,
          },
          body: JSON.stringify({
            walletAddress,
            signature: Array.from(signatureBytes),
            message: challengeData.message,
          }),
        });
        verifyData = await parseJsonResponse(verifyRes);
      } catch (networkError) {
        throw createPhantomError("PHANTOM_NETWORK_ERROR");
      }

      if (!verifyRes.ok || !verifyData.success) {
        throw createPhantomError(
          "PHANTOM_BACKEND_VERIFY_FAILED",
          verifyData.message
        );
      }

      updateUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              phantomWalletAddress:
                verifyData.phantomWalletAddress || walletAddress,
              phantomWalletConnectedAt:
                verifyData.phantomWalletConnectedAt ||
                currentUser.phantomWalletConnectedAt,
            }
          : currentUser
      );

      debugPhantom("Wallet connected", verifyData);

      return {
        success: true,
        walletAddress: verifyData.phantomWalletAddress || walletAddress,
        message: verifyData.message || "Phantom wallet connected successfully.",
      };
    } catch (err) {
      const code =
        err?.phantomCode ||
        (err?.message === "Failed to fetch"
          ? "PHANTOM_NETWORK_ERROR"
          : classifyPhantomProviderError(err, "connect"));
      const userMessage = getPhantomUserMessage(code, err?.userMessage);

      debugPhantom("Connection failed", {
        code,
        error: err,
      });

      setError(userMessage);

      return {
        success: false,
        code,
        error: userMessage,
      };
    } finally {
      phantomConnectInFlightRef.current = false;
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
        updateUser,
        setError,
        API_URL,
        setPassword,
        activationMessage,
        setActivationMessage,
        forgotPassword,
        forgotPasswordMessage,
        updateMe,
        connectPhantomWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
