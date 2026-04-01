"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import AmountEntryModal from "@/components/AmountEntryModal";
import QrDepositModal from "@/components/QrDepositModal";
import { useAuth } from "@/context/AuthContext";
import {
  getEthereum,
  requestAccounts,
  switchToBsc,
} from "@/utils/bscWallet";

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
  const usdtDecimals = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS || "18");
  const bscChainId = 56;
  const PENDING_DEPOSIT_KEY = "bep_pending_deposit";
  const [walletAccount, setWalletAccount] = useState("");
  const [primaryVaultBalance, setPrimaryVaultBalance] = useState("0");
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

  const [ledgerDetails, setLedgerDetails] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [ledgerError, setLedgerError] = useState("");

  const fetchLedgerDetails = useCallback(async () => {
    if (!user) return;
    setLoadingLedger(true);
    setLedgerError("");
    const token = localStorage.getItem("token");
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
        if (data?.data?.bnbWallet?.balance) {
          setPrimaryVaultBalance(data.data.bnbWallet.balance);
        }
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

  const savePendingDeposit = useCallback((intent, updates = {}) => {
    if (!intent) return null;
    const next = { ...intent, ...updates };
    depositSuccessRef.current = false;
    pendingDepositRef.current = next;
    setPendingDeposit(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify(next));
    }
    return next;
  }, []);

  const clearPendingDeposit = useCallback(() => {
    pendingDepositRef.current = null;
    setPendingDeposit(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(PENDING_DEPOSIT_KEY);
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
      const token = localStorage.getItem("token");
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
      const current = pendingDepositRef.current;
      if (!referenceId || depositPollRef.current || !current?.tx_hash) return;
      const pollOnce = async () => {
        const currentIntent = pendingDepositRef.current;
        if (!currentIntent?.tx_hash) return;
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
      const token = localStorage.getItem("token");
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
      console.error("Failed to fetch native balance:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setWalletAccount("");
      setPrimaryVaultBalance("0");
      setNativeBnbBalance("0");
      setTransactionStatus("");
      setLedgerDetails(null);
      setLoadingLedger(true);
      setLedgerError("");
      stopQrPolling();
      stopDepositPolling();
      clearPendingDeposit();
      return;
    }

    // Always fetch ledger details if user exists
    fetchLedgerDetails();

    // Fallback to database registered wallet if available (unless manually disconnected)
    if (user?.wallet_address && !walletAccount && !isManualDisconnect) {
      setWalletAccount(user.wallet_address);
    }

    if (!isManualDisconnect) {
      const ethereum = getEthereum();
      if (ethereum) {
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

        // Fetch balance periodically
        const balanceInterval = setInterval(() => {
          if (walletAccount && !isManualDisconnect) fetchNativeBalance(walletAccount);
        }, 30000);

        return () => {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
          clearInterval(balanceInterval);
        };
      }
    }
  }, [
    user,
    API_URL,
    clearPendingDeposit,
    fetchLedgerDetails,
    fetchNativeBalance,
    isManualDisconnect,
    stopDepositPolling,
    stopQrPolling,
    walletAccount,
  ]);

  useEffect(() => {
    if (!ledgerDetails?.bnbWallet?.balance) return;
    setPrimaryVaultBalance(ledgerDetails.bnbWallet.balance);
  }, [ledgerDetails]);

  useEffect(() => {
    return () => {
      stopQrPolling();
      stopDepositPolling();
    };
  }, [stopDepositPolling, stopQrPolling]);

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
      console.error("[connectWallet] Connection failed error details:", err);
      setTransactionStatus(err.message || "Failed to connect wallet.");
    }
  };

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
      if (!qrTxHashRef.current) {
        setQrStatus("pending");
        setQrTxHashStatus("Awaiting tx hash...");
        return;
      }

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
      const token = localStorage.getItem("token");
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
      setQrTxHashStatus(data.tx_hash ? "Tx hash received. Waiting for confirmations..." : "");
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
    const raw = localStorage.getItem(PENDING_DEPOSIT_KEY);
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
    const token = localStorage.getItem("token");
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
        if (merged.tx_hash) {
          setTransactionStatus("Resuming deposit verification...");
          startDepositPolling(merged.referenceId);
        } else {
          setTransactionStatus("Awaiting tx hash to resume verification.");
        }
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
    setTransactionStatus("Wallet disconnected.");
    setNativeBnbBalance("0");
  };

  return (
    <AuthGuard>
      <DashboardLayout
        walletAccount={walletAccount}
        walletBalance={nativeBnbBalance}
        walletTransactionStatus={transactionStatus}
        walletDebugMessage={debugMessage}
        onWalletConnect={connectWallet}
        onWalletDisconnect={disconnectWallet}
        onOpenAmountModal={handleOpenAmountModal}
        ledgerDetails={ledgerDetails}
        loadingLedger={loadingLedger}
        ledgerError={ledgerError}
        refreshLedgerDetails={fetchLedgerDetails}
        successModalTrigger={successModalTrigger}
      ></DashboardLayout>
      <AmountEntryModal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        onSubmit={createPayload}
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
