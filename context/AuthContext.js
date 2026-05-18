"use client";
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import safeStorage from "../utils/safeStorage";
import { getApiUrl } from "../utils/getApiUrl";
import {
  getPhantomProvider,
  getPhantomConnectErrorCode,
  getPhantomUserMessage,
  isSecureOrSupportedPhantomOrigin,
  isPrivateLanIp,
} from "../utils/phantomWallet";

const AuthContext = createContext();

// API_URL is computed dynamically per-call via getApiUrl().
// This fixes the hardcoded 192.168.x.x IP issue — any device on any IP
// will automatically reach the correct backend server.
const getAPI_URL = () => getApiUrl();

const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
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
        const res = await fetch(`${getAPI_URL()}/auth/me`, {
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
      const res = await fetch(`${getAPI_URL()}/auth/login`, {
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
      const res = await fetch(`${getAPI_URL()}/auth/signup`, {
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
      const res = await fetch(`${getAPI_URL()}/auth/set-password/${token}`, {
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
      const res = await fetch(`${getAPI_URL()}/auth/forgot-password`, {
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
      const res = await fetch(`${getAPI_URL()}/auth/me`, {
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
  }, []);

  const stakeTokens = useCallback(async (stakingData) => {
    setLoading(true);
    try {
      const localToken = safeStorage.getItem("token");
      const res = await fetch(`${getAPI_URL()}/users/stake`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stakingData),
      });

      const data = await res.json();

      if (!res.ok) {
        // 402 = insufficient internal balance (handled gracefully on frontend)
        const errMsg = data.message || "Staking failed";
        if (res.status !== 402) {
          setError(errMsg);
        }
        return { success: false, error: errMsg, status: res.status };
      }

      // Update local user state with the new staking plans array
      setUser(prev => ({
        ...prev,
        stakingPlans: data.stakingPlans
      }));
      return { success: true };
    } catch (err) {
      console.error("Staking error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseNft = useCallback(async (nftData) => {
    setLoading(true);
    try {
      const localToken = safeStorage.getItem("token");
      const res = await fetch(`${getAPI_URL()}/users/purchase-nft`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nftData),
      });

      const data = await res.json();

      if (!res.ok) {
        // 402 = insufficient internal balance (handled gracefully on frontend)
        const errMsg = data.message || "NFT purchase failed";
        if (res.status !== 402) {
          setError(errMsg);
        }
        return { success: false, error: errMsg, status: res.status };
      }

      // Update local user state with the new nftPackages array
      setUser(prev => ({
        ...prev,
        nftPackages: data.nftPackages
      }));
      return { success: true };
    } catch (err) {
      console.error("NFT purchase error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const token = safeStorage.getItem("token");
      if (token) {
        await fetch(`${getAPI_URL()}/auth/logout`, {
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
  }, [router]);

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

      if (!isSecureOrSupportedPhantomOrigin() && isPrivateLanIp()) {
        return {
          success: false,
          code: "PHANTOM_UNSUPPORTED_ORIGIN",
          error: getPhantomUserMessage("PHANTOM_UNSUPPORTED_ORIGIN"),
        };
      }

      const provider = getPhantomProvider();

      if (!provider) {
        return {
          success: false,
          code: "PHANTOM_NOT_INSTALLED",
          error: getPhantomUserMessage("PHANTOM_NOT_INSTALLED"),
        };
      }

      let connectResponse;

      try {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Phantom Debug]", {
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            hasPhantom: !!window.phantom?.solana,
            isPhantom: !!window.phantom?.solana?.isPhantom,
            isConnected: !!window.phantom?.solana?.isConnected,
            publicKey: window.phantom?.solana?.publicKey?.toString?.(),
          });
        }

        const withTimeout = (promise, ms = 30000) =>
          Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject({ code: "PHANTOM_CONNECT_TIMEOUT" }), ms)
            ),
          ]);

        try {
          connectResponse = await withTimeout(
            provider.connect({ onlyIfTrusted: false }),
            30000
          );
        } catch (e) {
           connectResponse = await withTimeout(
            provider.request({ method: "connect" }),
            30000
           );
        }

      } catch (error) {
        if (error?.code === -32002) {
          return {
            success: false,
            code: "PHANTOM_ALREADY_PENDING",
            error: "A Phantom request is already open. Please approve or cancel it in Phantom.",
          };
        }

        // Extension service worker died (update/reload) — the page must be refreshed
        if (
          error?.message?.includes("Extension context invalidated") ||
          error?.message?.includes("service worker")
        ) {
          return {
            success: false,
            code: "PHANTOM_CONTEXT_INVALIDATED",
            error: "Phantom was updated or reloaded. Please refresh the page and try again.",
          };
        }

        const errorCode = getPhantomConnectErrorCode(
          error,
          "PHANTOM_LOCKED"
        );

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
        const challengeResponse = await fetch(`${getAPI_URL()}/auth/phantom/challenge`, {
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
        const errorCode = getPhantomConnectErrorCode(
          error,
          "PHANTOM_SIGN_FAILED"
        );

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
        const verifyResponse = await fetch(`${getAPI_URL()}/auth/phantom/connect`, {
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

  const disconnectPhantomWallet = async () => {
    try {
      const currentToken =
        token ||
        (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (!currentToken) {
        return {
          success: false,
          code: "AUTH_REQUIRED",
          error: "Please log in before disconnecting your Phantom wallet.",
        };
      }

      const response = await fetch(`${getAPI_URL()}/auth/phantom/disconnect`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await readJsonSafely(response);

      if (!response.ok || !data.success) {
        return {
          success: false,
          code: data?.errorCode || "PHANTOM_DISCONNECT_FAILED",
          error:
            data?.message ||
            "Unable to disconnect Phantom wallet right now.",
        };
      }

      // Optional browser-provider disconnect.
      try {
        const provider = getPhantomProvider();

        if (provider?.disconnect) {
          await provider.disconnect();
        }
      } catch (providerError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Phantom provider disconnect warning:", providerError);
        }
      }

      setUser((prev) => ({
        ...(prev || {}),
        ...(data.user || {}),
        phantomWalletAddress: null,
        phantomWalletConnectedAt: null,
        walletAuthNonce: null,
        walletAuthNonceExpiresAt: null,
      }));

      return {
        success: true,
        message:
          data?.message || "Phantom wallet disconnected successfully.",
      };
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Disconnect Phantom wallet error:", error);
      }

      return {
        success: false,
        code: "PHANTOM_NETWORK_ERROR",
        error: "Network error while disconnecting Phantom wallet.",
      };
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
        API_URL: getAPI_URL(),
        setPassword,
        activationMessage,
        setActivationMessage,
        forgotPassword,
        forgotPasswordMessage,
        updateMe,
        updateUser,
        stakeTokens,
        purchaseNft,
        connectPhantomWallet,
        disconnectPhantomWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
