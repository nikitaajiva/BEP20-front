"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ethers } from "ethers";
import bs58 from "bs58";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import AmountEntryModal from "@/components/AmountEntryModal";
import PhantomDepositModal from "@/components/PhantomDepositModal";
import PhantomQrDepositModal from "@/components/PhantomQrDepositModal";
import QrDepositModal from "@/components/QrDepositModal";
import WalletConnectModal from "@/components/WalletConnectModal";
import { useAuth } from "@/context/AuthContext";
import { createWalletProviders } from "@/walletProviders";
import {
  getEthereum,
  requestAccounts,
  switchToBsc,
} from "@/utils/bscWallet";
import { getPhantomProvider } from "@/utils/phantomWallet";
import safeStorage from "@/utils/safeStorage";

const getSolanaRpcUrl = () =>
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

export default function DashboardPage() {
  const {
    user,
    loading,
    logout,
    API_URL,
    connectPhantomWallet,
    disconnectPhantomWallet,
    fetchUser,
  } = useAuth();
  const usdtDecimals = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS || "18");
  const bscChainId = 56;
  const PENDING_DEPOSIT_KEY = "bep_pending_deposit";
  const [walletAccount, setWalletAccount] = useState("");
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [qrWalletPayload, setQrWalletPayload] = useState("");
  const [qrDisplayData, setQrDisplayData] = useState(null);
  const [qrStatus, setQrStatus] = useState("pending");
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [qrTxHashStatus, setQrTxHashStatus] = useState("");
  const qrPollRef = useRef(null);
  const qrTimerRef = useRef(null);
  const qrReferenceRef = useRef("");
  const qrTxHashRef = useRef("");
  const depositPollRef = useRef(null);
  const pendingDepositRef = useRef(null);
  const depositSuccessRef = useRef(false);
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);
  const [, setPendingDeposit] = useState(null);
  const [successModalTrigger, setSuccessModalTrigger] = useState(null);
  const [activeTab, setActiveTab] = useState("zeroRisk");
  const [phantomStatus, setPhantomStatus] = useState("");
  const [phantomLoading, setPhantomLoading] = useState(false);
  const [phantomDisconnectLoading, setPhantomDisconnectLoading] = useState(false);
  const [phantomErrorCode, setPhantomErrorCode] = useState("");
  const [phantomBalance, setPhantomBalance] = useState("0.000000");
  const [phantomBalanceLoading, setPhantomBalanceLoading] = useState(false);
  const [phantomBalanceError, setPhantomBalanceError] = useState("");
  const [isPhantomDepositModalOpen, setIsPhantomDepositModalOpen] =
    useState(false);
  const [phantomDepositLoading, setPhantomDepositLoading] = useState(false);
  const [phantomDepositStatus, setPhantomDepositStatus] = useState("");
  const [phantomDepositError, setPhantomDepositError] = useState("");
  const [phantomQrModalOpen, setPhantomQrModalOpen] = useState(false);
  const [phantomQrPayload, setPhantomQrPayload] = useState("");
  const [phantomQrDisplayData, setPhantomQrDisplayData] = useState(null);
  const [phantomQrStatus, setPhantomQrStatus] = useState("pending");
  const [phantomQrTimeLeft, setPhantomQrTimeLeft] = useState(0);
  const [phantomTxSignatureStatus, setPhantomTxSignatureStatus] = useState("");
  const phantomQrTimerRef = useRef(null);
  const phantomDepositIntentRef = useRef(null);
  // New self-contained Phantom SOL deposit modal state
  const [phantomDepositModalOpen, setPhantomDepositModalOpen] = useState(false);
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const [pendingWalletConnectAction, setPendingWalletConnectAction] = useState("");

  const walletProviders = useMemo(
    () =>
      createWalletProviders({
        API_URL,
        connectPhantomWallet,
        disconnectPhantomWallet,
      }),
    [API_URL, connectPhantomWallet, disconnectPhantomWallet]
  );

  const handleDisconnectPhantom = async () => {
    if (phantomDisconnectLoading) return;

    const confirmDisconnect = window.confirm(
      "Are you sure you want to disconnect your Phantom wallet?"
    );

    if (!confirmDisconnect) return;

    setPhantomDisconnectLoading(true);

    try {
      const result = await disconnectPhantomWallet();

      if (!result?.success) {
        setPhantomStatus(
          result?.error || "Failed to disconnect Phantom wallet."
        );
        setPhantomErrorCode(
          result?.code || "PHANTOM_DISCONNECT_FAILED"
        );
        return;
      }

      setPhantomStatus("Phantom wallet disconnected successfully.");
      setPhantomErrorCode("");

      setPhantomBalance("0.000000");
      setPhantomBalanceError("");
      setIsPhantomDepositModalOpen(false);
      setPhantomQrModalOpen(false);
      resetPhantomQrState();

      // Re-sync user from server so UI updates immediately without refresh
      try {
        await fetchUser();
      } catch (_) {
        // non-critical
      }
    } catch (error) {
      console.error("Dashboard Phantom disconnect error:", error);

      setPhantomStatus("Failed to disconnect Phantom wallet.");
      setPhantomErrorCode("PHANTOM_DISCONNECT_FAILED");
    } finally {
      setPhantomDisconnectLoading(false);
    }
  };

  const shortAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const stopPhantomQrTimer = useCallback(() => {
    if (phantomQrTimerRef.current) {
      clearInterval(phantomQrTimerRef.current);
      phantomQrTimerRef.current = null;
    }
  }, []);

  const resetPhantomQrState = useCallback(() => {
    stopPhantomQrTimer();
    phantomDepositIntentRef.current = null;
    setPhantomQrPayload("");
    setPhantomQrDisplayData(null);
    setPhantomQrStatus("pending");
    setPhantomQrTimeLeft(0);
    setPhantomTxSignatureStatus("");
  }, [stopPhantomQrTimer]);

  const openPhantomWalletLink = useCallback(() => {
    if (!phantomQrPayload || typeof window === "undefined") return;
    window.location.href = phantomQrPayload;
  }, [phantomQrPayload]);

  const [ledgerDetails, setLedgerDetails] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [ledgerError, setLedgerError] = useState("");

  const fetchedRef = useRef(false);

  const fetchLedgerDetails = useCallback(async () => {
    if (!user) return;
    setLoadingLedger(true);
    setLedgerError("");
    const token = safeStorage.getItem("token");
    if (!token) {
      setLedgerError("Authentication token not found.");
      setLoadingLedger(false);
      return;
    }

    try {

      const response = await fetch(`${API_URL}/ledger`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();


      if (response.ok && data.success) {
        setLedgerDetails(data.data);
      } else {
        console.error("[DashboardPage] Ledger Fetch Error:", data.message);
        throw new Error(data.message || "Failed to fetch ledger details");
      }
    } catch (error) {
      console.error("[DashboardPage] Catch error:", error.message);
      setLedgerError(error.message);
      setLedgerDetails(null);
    } finally {
      setLoadingLedger(false);
    }
  }, [user, API_URL]);

  const [portfolioDetails, setPortfolioDetails] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState("");

  const fetchPortfolioDetails = useCallback(async () => {
    if (!user) return;
    setLoadingPortfolio(true);
    setPortfolioError("");
    const token = safeStorage.getItem("token");
    if (!token) {
      setPortfolioError("Authentication token not found.");
      setLoadingPortfolio(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/active-staking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPortfolioDetails(data);
      } else {
        console.error("[DashboardPage] Portfolio Fetch Error:", data.message);
        throw new Error(data.message || "Failed to fetch portfolio details");
      }
    } catch (error) {
      console.error("[DashboardPage] Portfolio Catch error:", error.message);
      setPortfolioError(error.message);
      setPortfolioDetails(null);
    } finally {
      setLoadingPortfolio(false);
    }
  }, [user, API_URL]);

  const fetchPhantomBalance = useCallback(async () => {
    if (!user?.phantomWalletAddress) {
      setPhantomBalance("0.000000");
      return;
    }

    const localToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!localToken) {
      setPhantomBalanceError("Authentication token not found.");
      return;
    }

    setPhantomBalanceLoading(true);
    setPhantomBalanceError("");

    try {
      const response = await fetch(`${API_URL}/auth/phantom/balance`, {
        headers: {
          Authorization: `Bearer ${localToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch SOL balance.");
      }

      setPhantomBalance(data.balanceSol || data.balance || "0.000000");
    } catch (error) {
      console.error("Phantom balance fetch error:", error);
      setPhantomBalanceError(error.message || "Failed to fetch SOL balance.");
    } finally {
      setPhantomBalanceLoading(false);
    }
  }, [API_URL, user?.phantomWalletAddress]);


  const createPhantomDepositIntent = useCallback(
    async (amount, paymentMethod) => {
      const localToken = safeStorage.getItem("token");
      if (!localToken) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/phantom-deposits/intent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create Phantom deposit intent.");
      }

      return data;
    },
    [API_URL]
  );

  const confirmPhantomDeposit = useCallback(
    async (intentId, txSignature) => {
      const localToken = safeStorage.getItem("token");
      if (!localToken) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/phantom-deposits/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intentId,
          txSignature,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to confirm Phantom deposit.");
      }

      return data;
    },
    [API_URL]
  );

  const savePendingDeposit = useCallback((intent, updates = {}) => {
    if (!intent) return null;
    const next = { ...intent, ...updates };
    depositSuccessRef.current = false;
    pendingDepositRef.current = next;
    setPendingDeposit(next);
    if (typeof window !== "undefined") {
      safeStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify(next));
    }
    return next;
  }, []);

  const clearPendingDeposit = useCallback(() => {
    pendingDepositRef.current = null;
    setPendingDeposit(null);
    if (typeof window !== "undefined") {
      safeStorage.removeItem(PENDING_DEPOSIT_KEY);
    }
  }, []);

  const stopDepositPolling = useCallback(() => {
    if (depositPollRef.current) {
      clearInterval(depositPollRef.current);
      depositPollRef.current = null;
    }
  }, []);

  const stopQrPolling = useCallback(() => {
    if (qrPollRef.current) {
      clearInterval(qrPollRef.current);
      qrPollRef.current = null;
    }
    if (qrTimerRef.current) {
      clearInterval(qrTimerRef.current);
      qrTimerRef.current = null;
    }
  }, []);

  const handleDepositSuccess = useCallback(
    (payload = {}) => {
      if (depositSuccessRef.current) return;
      depositSuccessRef.current = true;
      const confirmedAmount = payload.intentAmount;
      const asset = (payload.asset || "BNB").toUpperCase();
      const txHash = payload.txHash || payload.tx_hash || "";
      const message = confirmedAmount
        ? `Your ${asset} deposit of ${confirmedAmount} ${asset} has been confirmed.`
        : "Your deposit has been confirmed.";

      setSuccessModalTrigger({
        id: `${Date.now()}-${Math.random()}`,
        title: "Deposit Successful",
        message,
        transactionHash: txHash || null,
      });
      setTransactionStatus(payload.message || "Deposit confirmed.");
      setQrStatus("completed");
      setQrTxHashStatus("");
      setQrModalOpen(false);
      setQrPayload("");
      setQrWalletPayload("");
      setQrDisplayData(null);
      stopQrPolling();
      stopDepositPolling();
      clearPendingDeposit();
      fetchLedgerDetails();
    },
    [clearPendingDeposit, fetchLedgerDetails, stopDepositPolling, stopQrPolling]
  );

  const fetchDepositVerification = useCallback(
    async (referenceId) => {
      if (!referenceId) return null;
      const token = safeStorage.getItem("token");
      if (!token) {
        setTransactionStatus("Authentication required. Please re-login.");
        return null;
      }
      try {
        const response = await fetch(
          `${API_URL}/deposits/verify?referenceId=${encodeURIComponent(referenceId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        return data;
      } catch (error) {
        setTransactionStatus(error.message || "Failed to verify deposit.");
        return null;
      }
    },
    [API_URL]
  );

  const startDepositPolling = useCallback(
    (referenceId) => {
      if (!referenceId || depositPollRef.current) return;
      const pollOnce = async () => {
        const data = await fetchDepositVerification(referenceId);
        if (!data) return;
        if (data.success && data.status === "completed") {
          handleDepositSuccess(data);
          return;
        }
        if (data.status === "expired" || data.status === "failed") {
          setTransactionStatus(data.message || "Deposit verification failed.");
          stopDepositPolling();
          clearPendingDeposit();
          return;
        }
        if (data.status === "pending_confirmations" || data.status === "pending") {
          setTransactionStatus(data.message || "Waiting for confirmations...");
        }
      };

      pollOnce();
      depositPollRef.current = setInterval(pollOnce, 10000);
    },
    [clearPendingDeposit, fetchDepositVerification, handleDepositSuccess, stopDepositPolling]
  );

  const createDepositIntent = useCallback(
    async (amount, fallbackWallet, asset) => {
      const token = safeStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication error: No token found. Please re-login.");
      }

      const response = await fetch(`${API_URL}/deposits/intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          wallet_address:
            asset === "BNB" ? "" : fallbackWallet || user?.wallet_address,
          asset,
        }),
      });

      const data = await response.json();
      if (response.status === 409 && data.intent) {
        return data.intent;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create deposit intent.");
      }

      return data;
    },
    [API_URL, user]
  );

  const [nativeBnbBalance, setNativeBnbBalance] = useState("0");

  const fetchNativeBalance = useCallback(async (account) => {
    if (!account) return;
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(account);
      const formatted = ethers.formatEther(balance);
      setNativeBnbBalance(parseFloat(formatted).toFixed(6));
    } catch (err) {
      // Silently ignore extension context errors (Phantom service worker restart)
      if (
        err?.message?.includes("Extension context invalidated") ||
        err?.message?.includes("service worker")
      ) {
        return;
      }
      console.error("Failed to fetch native balance:", err);
    }
  }, []);

  // Fetch ledger, portfolio, and phantom balance exactly once when user logs in/updates
  useEffect(() => {
    if (!user) {
      setLedgerDetails(null);
      setLoadingLedger(true);
      setLedgerError("");
      setPortfolioDetails(null);
      setLoadingPortfolio(true);
      setPortfolioError("");
      fetchedRef.current = false;
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchLedgerDetails();
    fetchPortfolioDetails();
    if (user?.phantomWalletAddress) {
      fetchPhantomBalance();
    } else {
      setPhantomBalance("0.000000");
      setPhantomBalanceLoading(false);
    }
  }, [user?._id, user?.phantomWalletAddress, fetchLedgerDetails, fetchPortfolioDetails, fetchPhantomBalance]);

  useEffect(() => {
    if (!user) {
      setWalletAccount("");
      setNativeBnbBalance("0");
      setPhantomBalance("0.000000");
      setPhantomBalanceLoading(false);
      setIsPhantomDepositModalOpen(false);
      setPhantomQrModalOpen(false);
      setPhantomDepositStatus("");
      setPhantomDepositError("");
      setTransactionStatus("");
      stopQrPolling();
      stopDepositPolling();
      clearPendingDeposit();
      resetPhantomQrState();
      return;
    }

    // Fallback to database registered wallet if available (unless manually disconnected)
    if (user?.wallet_address && !walletAccount && !isManualDisconnect) {
      setWalletAccount(user.wallet_address);
    }

    if (!isManualDisconnect) {
      // Wait for MetaMask to inject (async extension injection race condition fix)
      let ethCleanup = () => {};

      const setupEthereum = async () => {
        try {
          const { waitForEthereum: waitEth } = await import("@/utils/bscWallet");
          const ethereum = await waitEth(3000);
          if (!ethereum) return;

          const handleAccountsChanged = (accounts) => {
            if (isManualDisconnect) return;
            const account = accounts?.[0] || user?.wallet_address || "";
            setWalletAccount(account);
            if (account && account.startsWith("0x")) fetchNativeBalance(account);
          };

          const handleChainChanged = () => {
            setTransactionStatus("Network changed. Please reconnect if needed.");
          };

          ethereum.on("accountsChanged", handleAccountsChanged);
          ethereum.on("chainChanged", handleChainChanged);

          // Auto-detect already-connected accounts (no popup — silent read)
          try {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts?.length && !walletAccount && !isManualDisconnect) {
              setWalletAccount(accounts[0]);
              setIsManualDisconnect(false);
              fetchNativeBalance(accounts[0]);
            }
          } catch (_) {
            // silent — user hasn't connected yet, or extension context invalidated
          }

          // Fetch balance periodically — stop if extension context dies
          const balanceInterval = setInterval(async () => {
            if (!walletAccount || isManualDisconnect) return;
            try {
              await fetchNativeBalance(walletAccount);
            } catch (err) {
              if (
                err?.message?.includes("Extension context invalidated") ||
                err?.message?.includes("service worker")
              ) {
                clearInterval(balanceInterval);
              }
            }
          }, 30000);

          ethCleanup = () => {
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
            ethereum.removeListener("chainChanged", handleChainChanged);
            clearInterval(balanceInterval);
          };
        } catch (err) {
          // Extension context invalidated during setup — ignore, page reload required
          if (
            !err?.message?.includes("Extension context invalidated") &&
            !err?.message?.includes("service worker")
          ) {
            console.error("[setupEthereum] Unexpected error:", err);
          }
        }
      };

      setupEthereum();
      return () => ethCleanup();
    }
  }, [
    user,
    API_URL,
    clearPendingDeposit,
    fetchLedgerDetails,
    fetchPhantomBalance,
    fetchNativeBalance,
    isManualDisconnect,
    stopDepositPolling,
    stopQrPolling,
    walletAccount,
    resetPhantomQrState,
  ]);

  useEffect(() => {
    return () => {
      stopQrPolling();
      stopDepositPolling();
      stopPhantomQrTimer();
    };
  }, [stopDepositPolling, stopPhantomQrTimer, stopQrPolling]);

  const connectWallet = async () => {
    if (walletAccount) return; // Already connected

    setTransactionStatus("Connecting MetaMask...");
    try {
      const accounts = await requestAccounts();

      if (accounts?.length) {
        await switchToBsc();
        setIsManualDisconnect(false);
        setWalletAccount(accounts[0]);
        fetchNativeBalance(accounts[0]);
        setTransactionStatus("Wallet connected.");
      }
    } catch (err) {
      // User cancelled the wallet popup — clear status silently, no console spam
      if (
        err?.code === 4001 ||
        err?.message?.includes("User rejected") ||
        err?.message?.includes("user rejected") ||
        err?.message?.includes("cancelled") ||
        err?.message?.includes("cancel")
      ) {
        setTransactionStatus("");
        return;
      }
      // Extension context died — tell user to refresh
      if (
        err?.message?.includes("Extension context invalidated") ||
        err?.message?.includes("service worker")
      ) {
        setTransactionStatus("Wallet extension was reloaded. Please refresh the page.");
        return;
      }
      console.error("[connectWallet] Connection failed:", err);
      setTransactionStatus(err.message || "Failed to connect wallet.");
    }
  };

  const openWalletConnectModal = useCallback((nextAction = "") => {
    const resolvedAction = typeof nextAction === "string" ? nextAction : "";
    setPhantomStatus("");
    setPhantomErrorCode("");
    setPendingWalletConnectAction(resolvedAction);
    setWalletConnectModalOpen(true);
  }, []);

  const handleWalletConnectSuccess = useCallback(
    async ({ walletAddress }) => {
      setPhantomLoading(true);

      try {
        setPhantomStatus(`Connected: ${walletAddress}`);
        setPhantomErrorCode("");
        setWalletConnectModalOpen(false);
        await fetchUser?.();
        await fetchPhantomBalance();

        if (pendingWalletConnectAction === "open-phantom-deposit") {
          setPhantomDepositModalOpen(true);
        }
      } catch (error) {
        console.error("Wallet connect success refresh error:", error);
      } finally {
        setPendingWalletConnectAction("");
        setPhantomLoading(false);
      }
    },
    [fetchPhantomBalance, fetchUser, pendingWalletConnectAction]
  );

  const handleWalletConnectModalClose = useCallback(() => {
    setWalletConnectModalOpen(false);
    setPendingWalletConnectAction("");
  }, []);

  const handlePhantomDepositSuccess = useCallback(
    async ({ amountSol, txSignature }) => {
      setSuccessModalTrigger({
        id: `${Date.now()}-${Math.random()}`,
        title: "Deposit Successful",
        message: amountSol
          ? `Your SOL deposit of ${amountSol} SOL has been confirmed.`
          : "Your SOL deposit has been confirmed.",
        transactionHash: txSignature || null,
      });
      setPhantomDepositStatus("Deposit confirmed.");
      setPhantomDepositError("");
      setPhantomQrStatus("confirmed");
      setPhantomTxSignatureStatus("");
      setIsPhantomDepositModalOpen(false);
      setPhantomQrModalOpen(false);
      resetPhantomQrState();
      await Promise.all([fetchLedgerDetails(), fetchPhantomBalance()]);
    },
    [fetchLedgerDetails, fetchPhantomBalance, resetPhantomQrState]
  );

  const handleOpenPhantomDeposit = useCallback(() => {
    setPhantomDepositStatus("");
    setPhantomDepositError("");
    setPhantomTxSignatureStatus("");
    setIsPhantomDepositModalOpen(true);
  }, []);

  // Opens the new self-contained Phantom SOL deposit modal.
  // If wallet is not yet connected, trigger connection flow first.
  const openPhantomDepositModal = () => {
    if (!user?.phantomWalletAddress) {
      openWalletConnectModal("open-phantom-deposit");
      return;
    }
    setPhantomDepositModalOpen(true);
  };

  const handleStartPhantomQrDeposit = useCallback(
    async (amount) => {
      setPhantomDepositLoading(true);
      setPhantomDepositStatus("Creating QR deposit request...");
      setPhantomDepositError("");
      setPhantomTxSignatureStatus("");

      try {
        const data = await createPhantomDepositIntent(amount, "qr");
        const intent = data.intent;

        phantomDepositIntentRef.current = intent;
        setPhantomQrPayload(data.solanaPayUrl || "");
        setPhantomQrDisplayData(intent);
        setPhantomQrStatus(intent.status || "pending");
        setIsPhantomDepositModalOpen(false);
        setPhantomQrModalOpen(true);
        setPhantomDepositStatus("QR deposit created.");

        const expiresAt = new Date(intent.expiresAt).getTime();
        const updateTimer = () => {
          const secondsLeft = Math.max(
            0,
            Math.ceil((expiresAt - Date.now()) / 1000)
          );
          setPhantomQrTimeLeft(secondsLeft);
          if (secondsLeft <= 0) {
            stopPhantomQrTimer();
            setPhantomQrStatus("expired");
            setPhantomTxSignatureStatus("Deposit request expired.");
          }
        };

        stopPhantomQrTimer();
        updateTimer();
        phantomQrTimerRef.current = setInterval(updateTimer, 1000);
      } catch (error) {
        console.error("Create Phantom QR deposit error:", error);
        setPhantomDepositError(
          error.message || "Failed to create Phantom deposit request."
        );
      } finally {
        setPhantomDepositLoading(false);
      }
    },
    [createPhantomDepositIntent, stopPhantomQrTimer]
  );

  const handleSubmitPhantomTxSignature = useCallback(
    async (txSignature) => {
      const intentId = phantomDepositIntentRef.current?.id;

      if (!intentId) {
        setPhantomTxSignatureStatus("Missing deposit request.");
        return;
      }

      setPhantomDepositLoading(true);
      setPhantomTxSignatureStatus("Confirming Solana deposit...");
      setPhantomDepositError("");

      try {
        const data = await confirmPhantomDeposit(intentId, txSignature);
        await handlePhantomDepositSuccess({
          amountSol: data?.intent?.amountSol,
          txSignature: data?.intent?.txSignature || txSignature,
        });
      } catch (error) {
        console.error("Confirm Phantom QR deposit error:", error);
        setPhantomQrStatus("failed");
        setPhantomTxSignatureStatus(
          error.message || "Failed to confirm Solana deposit."
        );
      } finally {
        setPhantomDepositLoading(false);
      }
    },
    [confirmPhantomDeposit, handlePhantomDepositSuccess]
  );

  const handlePayWithPhantom = useCallback(
    async (amount) => {
      setPhantomDepositLoading(true);
      setPhantomDepositStatus("Preparing Phantom payment...");
      setPhantomDepositError("");

      try {
        const provider = getPhantomProvider();

        if (!provider) {
          throw new Error("Phantom Wallet is not available.");
        }

        const connectResponse = await provider.connect({ onlyIfTrusted: false });
        const connectedAddress =
          connectResponse?.publicKey?.toString?.() ||
          provider?.publicKey?.toString?.() ||
          "";

        if (!connectedAddress) {
          throw new Error("Unable to read connected Phantom wallet address.");
        }

        if (
          user?.phantomWalletAddress &&
          connectedAddress !== user.phantomWalletAddress
        ) {
          throw new Error(
            "Connected Phantom extension wallet does not match your linked wallet."
          );
        }

        const data = await createPhantomDepositIntent(amount, "extension");
        const intent = data.intent;
        const connection = new Connection(getSolanaRpcUrl(), "confirmed");
        const fromPubkey = new PublicKey(connectedAddress);
        const toPubkey = new PublicKey(intent.treasuryAddress);
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");

        const transaction = new Transaction({
          feePayer: fromPubkey,
          recentBlockhash: blockhash,
        }).add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Number(intent.amountLamports),
          })
        );

        const sendResult = await provider.signAndSendTransaction(transaction);
        const signature =
          typeof sendResult?.signature === "string"
            ? sendResult.signature
            : sendResult?.signature
            ? bs58.encode(sendResult.signature)
            : "";

        if (!signature) {
          throw new Error("Unable to read Phantom transaction signature.");
        }

        await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        const confirmData = await confirmPhantomDeposit(intent.id, signature);
        await handlePhantomDepositSuccess({
          amountSol: confirmData?.intent?.amountSol,
          txSignature: confirmData?.intent?.txSignature || signature,
        });
      } catch (error) {
        console.error("Phantom extension deposit error:", error);
        setPhantomDepositError(
          error.message || "Failed to complete Phantom deposit."
        );
      } finally {
        setPhantomDepositLoading(false);
      }
    },
    [
      confirmPhantomDeposit,
      createPhantomDepositIntent,
      handlePhantomDepositSuccess,
      user?.phantomWalletAddress,
    ]
  );

  const handleOpenAmountModal = () => {
    setTransactionStatus("");
    setIsAmountModalOpen(true);
  };

  const createPayload = async (amount) => {
    const payload =
      typeof amount === "object" && amount !== null ? amount : { amount };
    const rawAmount = `${payload.amount ?? ""}`.trim();
    const asset = `${payload.asset || "BNB"}`.toUpperCase();

    // Validation
    if (!rawAmount || !/^\d+(\.\d+)?$/.test(rawAmount)) {
      setDebugMessage("Error: Invalid amount provided.");
      return;
    }
    if (/^0+(\.0+)?$/.test(rawAmount)) {
      setDebugMessage("Error: Amount must be greater than zero.");
      return;
    }

    setIsAmountModalOpen(false); // Only close after basic validation
    const ethereum = getEthereum();
    if (!ethereum) {
      await startQrDeposit(rawAmount, asset);
      return;
    }

    const activeWallet = walletAccount || user?.wallet_address || "";

    setTransactionStatus(`Preparing deposit for ${rawAmount} ${asset}...`);
    setDebugMessage("");

    try {
      const intentData = await createDepositIntent(rawAmount, activeWallet, asset);
      const finalIntent = intentData.intent || intentData;
      const depositAddress = finalIntent.deposit_address;
      const referenceId = finalIntent.referenceId;

      if (!depositAddress || !referenceId) {
        if (finalIntent.referenceId) {
          beginQrTracking(finalIntent, "Scan QR to complete your existing deposit.");
          return;
        }
        throw new Error("Invalid response from server.");
      }

      const existingSource =
        pendingDepositRef.current?.referenceId === referenceId
          ? pendingDepositRef.current?.source
          : null;
      savePendingDeposit(
        {
          referenceId: finalIntent.referenceId,
          deposit_address: finalIntent.deposit_address,
          amount: finalIntent.amount,
          amountWei: finalIntent.amountWei,
          expiresAt: finalIntent.expiresAt,
          network: finalIntent.network,
          decimals: finalIntent.decimals,
          chainId: finalIntent.chainId,
          asset: finalIntent.asset || asset,
          tx_hash: finalIntent.tx_hash || "",
          source: existingSource || "qr",
        }
      );

      beginQrTracking(finalIntent, "Scan QR or open your wallet to pay.");
    } catch (error) {
      console.error("Deposit Intent Error:", error);
      setTransactionStatus(
        `Error: ${error.message || "An unknown error occurred."}`
      );
    }
  };

  const verifyQrDeposit = useCallback(
    async (referenceId) => {
      if (!referenceId) return;
      const data = await fetchDepositVerification(referenceId);
      if (!data) return;
      if (data.success && data.status === "completed") {
        handleDepositSuccess(data);
        return;
      }

      if (data.status === "expired") {
        setQrStatus("expired");
        stopQrPolling();
        clearPendingDeposit();
        return;
      }

      if (data.status === "failed") {
        setQrStatus("failed");
        stopQrPolling();
        clearPendingDeposit();
        return;
      }

      if (data.status === "pending_confirmations" || data.status === "pending") {
        setQrStatus("pending");
        setQrTxHashStatus(data.message || "Waiting for confirmations...");
      }
    },
    [
      clearPendingDeposit,
      fetchDepositVerification,
      handleDepositSuccess,
      stopQrPolling,
    ]
  );

  const submitQrTxHash = useCallback(
    async (txHash) => {
      if (!txHash) return;
      const referenceId = qrReferenceRef.current;
      if (!referenceId) {
        setQrTxHashStatus("Missing reference ID.");
        return;
      }
      const token = safeStorage.getItem("token");
      if (!token) {
        setQrTxHashStatus("Authentication required.");
        return;
      }
      setQrTxHashStatus("Submitting tx hash...");
      qrTxHashRef.current = txHash;
      const existing = pendingDepositRef.current || { referenceId, asset: "BNB" };
      savePendingDeposit(existing, { tx_hash: txHash });
      try {
        const backendResponse = await fetch(`${API_URL}/deposits/bnb`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tx_hash: txHash,
            referenceId,
          }),
        });
        const backendData = await backendResponse.json();
        if (backendResponse.ok && backendData.success) {
          handleDepositSuccess(backendData);
          return;
        }

        if (backendResponse.status === 202) {
          setQrStatus("pending");
          setQrTxHashStatus(backendData.message || "Waiting for confirmations.");
          startDepositPolling(referenceId);
          return;
        }

        setQrStatus("failed");
        setQrTxHashStatus(backendData.message || "Failed to process tx hash.");
        stopQrPolling();
        stopDepositPolling();
        clearPendingDeposit();
      } catch (error) {
        setQrStatus("failed");
        setQrTxHashStatus(error.message || "Failed to submit tx hash.");
        stopQrPolling();
        stopDepositPolling();
        clearPendingDeposit();
      }
    },
    [
      API_URL,
      clearPendingDeposit,
      handleDepositSuccess,
      savePendingDeposit,
      startDepositPolling,
      stopDepositPolling,
      stopQrPolling,
    ]
  );

  const beginQrTracking = useCallback(
    (data, statusMessage) => {
      setTransactionStatus(statusMessage || "Generating QR deposit...");
      setQrStatus("pending");
      setQrTxHashStatus("");

      const asset = `${data.asset || "BNB"}`.toUpperCase();
      const intentTokenContract = data.tokenContract || data.token_contract || "";
      const intentDecimals =
        Number.isFinite(Number(data.decimals)) ? Number(data.decimals) : usdtDecimals;
      const intentChainId =
        Number.isFinite(Number(data.chainId)) ? Number(data.chainId) : bscChainId;
      const chainId = intentChainId === bscChainId ? intentChainId : bscChainId;

      if (asset === "USDT" && !intentTokenContract) {
        setTransactionStatus("USDT contract is not configured. Unable to build QR.");
        setQrStatus("failed");
        return;
      }

      let checksumToken;
      let checksumDeposit;
      try {
        checksumDeposit = ethers.getAddress(data.deposit_address);
        if (asset === "USDT") {
          checksumToken = ethers.getAddress(intentTokenContract);
        }
      } catch (error) {
        setTransactionStatus("Invalid token or deposit address. Unable to build QR.");
        setQrStatus("failed");
        return;
      }

      let baseUnits;
      if (asset === "BNB" && data.amountWei) {
        baseUnits = BigInt(data.amountWei);
      } else {
        baseUnits = ethers.parseUnits(
          data.amount.toString(),
          asset === "BNB" ? 18 : Number.isFinite(intentDecimals) ? intentDecimals : 18
        );
      }

      const tokenOrNative = asset === "BNB" ? checksumDeposit : checksumToken;
      const qrPayload =
        asset === "BNB"
          ? `ethereum:${checksumDeposit}@${chainId}?value=${baseUnits.toString()}`
          : `ethereum:${tokenOrNative}@${chainId}/transfer?address=${checksumDeposit}&uint256=${baseUnits.toString()}`;
      const walletPayload =
        asset === "BNB"
          ? `ethereum:${checksumDeposit}@${chainId}?value=${baseUnits.toString()}`
          : qrPayload;
      const fallbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/deposit/intent/${data.referenceId}`
          : "";
      const encodedQrPayload = encodeURI(qrPayload);
      const encodedWalletPayload = encodeURI(walletPayload);

      setQrPayload(encodedQrPayload);
      setQrWalletPayload(encodedWalletPayload);
      setQrDisplayData({
        amount: data.amount,
        amountWei: data.amountWei,
        depositAddress: data.deposit_address,
        referenceId: data.referenceId,
        network: data.network || "BSC",
        tokenContract: asset === "USDT" ? checksumToken : "",
        decimals: intentDecimals,
        chainId: intentChainId,
        fallbackUrl,
        asset,
        txHash: data.tx_hash || "",
      });
      setQrStatus("pending");
      setQrModalOpen(true);
      qrReferenceRef.current = data.referenceId;
      qrTxHashRef.current = data.tx_hash || "";
      setQrTxHashStatus(
        data.tx_hash
          ? "Tx hash received. Waiting for confirmations..."
          : "Waiting for on-chain transfer..."
      );
      savePendingDeposit({
        referenceId: data.referenceId,
        deposit_address: data.deposit_address,
        amount: data.amount,
        amountWei: data.amountWei,
        expiresAt: data.expiresAt,
        network: data.network,
        decimals: intentDecimals,
        chainId: intentChainId,
        asset,
        tx_hash: data.tx_hash || "",
        source: "qr",
      });

      const expiresAt = new Date(data.expiresAt).getTime();
      const updateTimer = () => {
        const secondsLeft = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000)
        );
        setQrTimeLeft(secondsLeft);
        if (secondsLeft <= 0) {
          setQrStatus("expired");
          stopQrPolling();
        }
      };

      stopQrPolling();
      updateTimer();

      qrTimerRef.current = setInterval(updateTimer, 1000);
      qrPollRef.current = setInterval(async () => {
        await verifyQrDeposit(data.referenceId);
      }, 10000);
    },
    [savePendingDeposit, stopQrPolling, usdtDecimals, bscChainId, verifyQrDeposit]
  );

  const startQrDeposit = useCallback(
    async (amount, asset) => {
      setTransactionStatus("No wallet detected. Generating QR deposit...");
      setQrStatus("pending");

      try {
        const data = await createDepositIntent(amount, "", asset);
        beginQrTracking(data, "Scan QR to complete your deposit.");
      } catch (error) {
        setTransactionStatus(error.message || "Failed to start QR deposit.");
        setQrStatus("failed");
      }
    },
    [createDepositIntent, beginQrTracking]
  );

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (pendingDepositRef.current) return;
    const raw = safeStorage.getItem(PENDING_DEPOSIT_KEY);
    if (!raw) return;
    let saved;
    try {
      saved = JSON.parse(raw);
    } catch {
      return;
    }
    if (!saved?.referenceId) return;
    pendingDepositRef.current = saved;
    setPendingDeposit(saved);
    const token = safeStorage.getItem("token");
    if (!token) return;

    const resume = async () => {
      try {
        const response = await fetch(
          `${API_URL}/deposits/intent/${encodeURIComponent(saved.referenceId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok || !data.success) return;
        const intent = data.intent;
        if (intent.status === "completed") {
          handleDepositSuccess({
            success: true,
            status: "completed",
            message: "Deposit completed.",
            intentAmount: intent.amount,
            asset: intent.asset,
            txHash: intent.tx_hash,
            referenceId: intent.referenceId,
          });
          return;
        }
        if (intent.status === "expired" || intent.status === "failed") {
          setTransactionStatus(
            intent.status === "expired"
              ? "Deposit intent expired."
              : "Deposit verification failed."
          );
          clearPendingDeposit();
          return;
        }

        const merged = {
          ...saved,
          ...intent,
          referenceId: intent.referenceId,
          tx_hash: intent.tx_hash || saved.tx_hash || "",
          source: saved.source || "wallet",
        };
        savePendingDeposit(merged);
        if (merged.source === "qr") {
          beginQrTracking(intent, "Resuming QR deposit...");
          return;
        }
        setTransactionStatus("Resuming deposit verification...");
        startDepositPolling(merged.referenceId);
      } catch (error) {
        console.error("Failed to resume pending deposit:", error);
      }
    };

    resume();
  }, [
    API_URL,
    PENDING_DEPOSIT_KEY,
    beginQrTracking,
    clearPendingDeposit,
    handleDepositSuccess,
    savePendingDeposit,
    startDepositPolling,
    user,
  ]);

  const disconnectWallet = () => {
    setIsManualDisconnect(true);
    setWalletAccount("");
    setPhantomStatus("");
    setTransactionStatus("Wallet disconnected.");
    setNativeBnbBalance("0");
  };

  return (
    <AuthGuard>
      <DashboardLayout
        user={user}
        loading={loading}
        walletAccount={walletAccount}
        walletTransactionStatus={transactionStatus}
        walletDebugMessage={debugMessage}
        onWalletConnect={openWalletConnectModal}
        onConnectPhantom={openWalletConnectModal}
        onDisconnectPhantom={handleDisconnectPhantom}
        onWalletDisconnect={disconnectWallet}
        onOpenAmountModal={handleOpenAmountModal}
        onOpenPhantomDeposit={openPhantomDepositModal}
        phantomWalletAddress={user?.phantomWalletAddress || ""}
        phantomBalance={phantomBalance}
        phantomBalanceLoading={phantomBalanceLoading}
        phantomBalanceError={phantomBalanceError}
        refreshPhantomBalance={fetchPhantomBalance}
        phantomStatus={phantomStatus}
        phantomLoading={phantomLoading || phantomDisconnectLoading}
        phantomErrorCode={phantomErrorCode}
        shortAddress={shortAddress(user?.phantomWalletAddress)}
        onLogout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ledgerDetails={ledgerDetails}
        loadingLedger={loadingLedger}
        ledgerError={ledgerError}
        refreshLedgerDetails={fetchLedgerDetails}
        portfolioDetails={portfolioDetails}
        refreshPortfolioDetails={fetchPortfolioDetails}
        successModalTrigger={successModalTrigger}
        onClearSuccessModalTrigger={() => setSuccessModalTrigger(null)}
      >
        <div style={{ display: 'none' }}>
          {/* Internal state pass-through if needed, otherwise this can be empty children */}
        </div>
      </DashboardLayout>

      <WalletConnectModal
        isOpen={walletConnectModalOpen}
        onClose={handleWalletConnectModalClose}
        extensionProvider={walletProviders.phantomExtension}
        qrProvider={walletProviders.phantomQr}
        onConnected={handleWalletConnectSuccess}
      />

      <AmountEntryModal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        onSubmit={createPayload}
      />

      {/* New self-contained Phantom SOL deposit modal */}
      <PhantomDepositModal
        isOpen={phantomDepositModalOpen}
        onClose={() => setPhantomDepositModalOpen(false)}
        API_URL={API_URL}
        user={user}
        onDepositConfirmed={async (payload) => {
          setPhantomDepositModalOpen(false);

          const intent = payload?.intent || payload;
          if (intent) {
            await handlePhantomDepositSuccess({
              amountSol: intent.amountSol,
              txSignature: intent.txSignature || intent.tx_signature || intent.signature || intent.txHash || intent.tx_hash,
            });
          } else {
            await handlePhantomDepositSuccess({});
          }

          if (typeof fetchDashboardData === "function") {
            await fetchDashboardData();
          }

          if (typeof fetchUser === "function") {
            await fetchUser();
          }
        }}
      />

      <PhantomQrDepositModal
        isOpen={phantomQrModalOpen}
        onClose={() => {
          if (phantomDepositLoading) return;
          setPhantomQrModalOpen(false);
          resetPhantomQrState();
        }}
        payload={phantomQrPayload}
        displayData={phantomQrDisplayData}
        status={phantomQrStatus}
        timeLeft={phantomQrTimeLeft}
        onRetry={() => {
          const amount = phantomQrDisplayData?.amountSol;
          setPhantomQrModalOpen(false);
          resetPhantomQrState();
          if (amount) {
            handleStartPhantomQrDeposit(String(amount));
          }
        }}
        onSubmitTxSignature={handleSubmitPhantomTxSignature}
        txSignatureStatus={phantomTxSignatureStatus}
        onOpenWallet={openPhantomWalletLink}
        loading={phantomDepositLoading}
      />

      <QrDepositModal
        isOpen={qrModalOpen}
        onClose={() => {
          stopQrPolling();
          setQrModalOpen(false);
          setQrTxHashStatus("");
        }}
        payload={qrPayload}
        walletPayload={qrWalletPayload}
        displayData={qrDisplayData}
        status={qrStatus}
        timeLeft={qrTimeLeft}
        onSubmitTxHash={submitQrTxHash}
        txHashStatus={qrTxHashStatus}
        onRetry={() => {
          stopQrPolling();
          setQrModalOpen(false);
          if (qrDisplayData?.amount) {
            startQrDeposit(qrDisplayData.amount, qrDisplayData.asset);
          }
        }}
      />
    </AuthGuard>
  );
}
