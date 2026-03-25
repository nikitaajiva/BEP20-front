"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import AmountEntryModal from "@/components/AmountEntryModal";
import QrDepositModal from "@/components/QrDepositModal";
import { useAuth } from "@/context/AuthContext";
import {
  getEthereum,
  requestAccounts,
  switchToBsc,
  readUsdtBalance,
  sendUsdtTransfer,
} from "@/utils/bscWallet";

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
  const [walletAccount, setWalletAccount] = useState("");
  const [primaryVaultBalance, setPrimaryVaultBalance] = useState("0");
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [qrDisplayData, setQrDisplayData] = useState(null);
  const [qrStatus, setQrStatus] = useState("pending");
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const qrPollRef = useRef(null);
  const qrTimerRef = useRef(null);
  const qrReferenceRef = useRef("");

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
      } else {
        throw new Error(data.message || "Failed to fetch ledger details");
      }
    } catch (error) {
      setLedgerError(error.message);
      setLedgerDetails(null);
    } finally {
      setLoadingLedger(false);
    }
  }, [user, API_URL]);

  const handleBackendVerification = useCallback(
    async (txHash, userAccount) => {
      setTransactionStatus(
        `Transaction sent! TX Hash: ${txHash}. Verifying with backend...`
      );
      const token = localStorage.getItem("token");
      if (!token) {
        setTransactionStatus(
          "Authentication error: No token found. Please re-login."
        );
        return;
      }

      try {
        const backendResponse = await fetch(`${API_URL}/deposits/usdt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tx_hash: txHash,
            wallet_address: userAccount,
          }),
        });
        const backendData = await backendResponse.json();

        if (backendData.success) {
          setTransactionStatus(
            `${backendData.message || "Deposit successfully recorded!"}`
          );
          fetchLedgerDetails();
        } else {
          setTransactionStatus(
            `Backend error: ${backendData.message || "Failed to record deposit."}`
          );
        }
      } catch (apiError) {
        setTransactionStatus(
          `API Error: Failed to communicate with backend. ${apiError.message}`
        );
      }
    },
    [API_URL, fetchLedgerDetails]
  );

  const resolveDepositAddress = useCallback(async () => {
    const configured = process.env.NEXT_PUBLIC_BSC_SYSTEM_DEPOSIT_ADDRESS;
    if (configured) return configured;

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication error: No token found. Please re-login.");
    }

    const response = await fetch(`${API_URL}/deposits/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!result.success || !result.deposit_address) {
      throw new Error(result.message || "Failed to get deposit address.");
    }
    return result.deposit_address.wallet_address;
  }, [API_URL]);

  useEffect(() => {
    if (user) {
      const ethereum = getEthereum();
      if (ethereum) {
        ethereum
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            if (accounts?.length) setWalletAccount(accounts[0]);
          })
          .catch(() => {
            setWalletAccount("");
          });

        const handleAccountsChanged = (accounts) => {
          setWalletAccount(accounts?.[0] || "");
        };

        const handleChainChanged = () => {
          setTransactionStatus("Network changed. Please reconnect if needed.");
        };

        ethereum.on("accountsChanged", handleAccountsChanged);
        ethereum.on("chainChanged", handleChainChanged);

        return () => {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        };
      }

      fetchLedgerDetails();
    } else {
      setWalletAccount("");
      setPrimaryVaultBalance("0");
      setTransactionStatus("");
      setLedgerDetails(null);
      setLoadingLedger(true);
      setLedgerError("");
    }
  }, [user, API_URL, fetchLedgerDetails]);

  useEffect(() => {
    const loadPrimaryVaultBalance = async () => {
      if (!walletAccount) {
        setPrimaryVaultBalance("0");
        return;
      }
      try {
        const balance = await readUsdtBalance(walletAccount);
        setPrimaryVaultBalance(balance);
      } catch (error) {
        setPrimaryVaultBalance("0");
      }
    };

    loadPrimaryVaultBalance();
  }, [walletAccount]);

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

  useEffect(() => {
    return () => {
      stopQrPolling();
    };
  }, [stopQrPolling]);

  const connectWallet = async () => {
    setTransactionStatus("Connecting MetaMask...");
    try {
      await switchToBsc();
      const accounts = await requestAccounts();
      setWalletAccount(accounts[0]);
      setTransactionStatus("Wallet connected.");
    } catch (err) {
      setTransactionStatus(err.message || "Failed to connect wallet.");
    }
  };

  const handleOpenAmountModal = () => {
    setTransactionStatus("");
    setIsAmountModalOpen(true);
  };

  const createPayload = async (amount) => {
    setIsAmountModalOpen(false);
    if (!amount || parseFloat(amount) <= 0) {
      alert("Invalid amount provided.");
      setDebugMessage("Debug: Invalid amount for payload.");
      return;
    }
    const ethereum = getEthereum();
    if (!ethereum) {
      await startQrDeposit(amount);
      return;
    }
    if (!walletAccount) {
      alert("Please connect your wallet first.");
      setDebugMessage("Debug: Wallet not connected.");
      return;
    }

    setTransactionStatus(`Preparing transfer for ${amount} USDT...`);
    setDebugMessage("");

    try {
      await switchToBsc();
      const depositAddress = await resolveDepositAddress();
      setTransactionStatus("Please confirm the transfer in MetaMask...");

      const txHash = await sendUsdtTransfer({
        from: walletAccount,
        to: depositAddress,
        amount,
      });

      await handleBackendVerification(txHash, walletAccount);
    } catch (error) {
      setTransactionStatus(
        `Error: ${error.message || "An unknown error occurred."}`
      );
    }
  };

  const verifyQrDeposit = useCallback(
    async (referenceId) => {
      if (!referenceId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

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
        if (data.success && data.status === "completed") {
          setQrStatus("completed");
          stopQrPolling();
          fetchLedgerDetails();
          return;
        }

        if (data.status === "expired") {
          setQrStatus("expired");
          stopQrPolling();
          return;
        }

        if (data.status === "failed") {
        setQrStatus("failed");
        stopQrPolling();
      }
    } catch (error) {
      setQrStatus("failed");
      stopQrPolling();
    }
  },
  [API_URL, fetchLedgerDetails, stopQrPolling]
);

  const startQrDeposit = useCallback(
    async (amount) => {
      setTransactionStatus("No wallet detected. Generating QR deposit...");
      setQrStatus("pending");

      const token = localStorage.getItem("token");
      if (!token) {
        setTransactionStatus("Authentication error: No token found. Please re-login.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/deposits/intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            wallet_address: user?.wallet_address,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to create deposit intent.");
        }

        const payload = JSON.stringify({
          network: "BSC",
          address: data.deposit_address,
          amount: data.amount,
          referenceId: data.referenceId,
        });

        setQrPayload(payload);
        setQrDisplayData({
          amount: data.amount,
          depositAddress: data.deposit_address,
          referenceId: data.referenceId,
          network: data.network || "BSC",
        });
        setQrStatus("pending");
        setQrModalOpen(true);
        qrReferenceRef.current = data.referenceId;

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
            if (qrReferenceRef.current) {
              verifyQrDeposit(qrReferenceRef.current);
            }
          }
        };

        stopQrPolling();
        updateTimer();

        qrTimerRef.current = setInterval(updateTimer, 1000);
        qrPollRef.current = setInterval(async () => {
          await verifyQrDeposit(data.referenceId);
        }, 3000);
      } catch (error) {
        setTransactionStatus(error.message || "Failed to start QR deposit.");
        setQrStatus("failed");
      }
    },
    [API_URL, stopQrPolling, user, verifyQrDeposit]
  );

  return (
    <AuthGuard>
      <DashboardLayout
        walletAccount={walletAccount}
        walletTransactionStatus={transactionStatus}
        walletDebugMessage={debugMessage}
        onWalletConnect={connectWallet}
        onOpenAmountModal={handleOpenAmountModal}
        primaryVaultBalance={primaryVaultBalance}
        ledgerDetails={ledgerDetails}
        loadingLedger={loadingLedger}
        ledgerError={ledgerError}
        refreshLedgerDetails={fetchLedgerDetails}
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
        }}
        payload={qrPayload}
        displayData={qrDisplayData}
        status={qrStatus}
        timeLeft={qrTimeLeft}
        onRetry={() => {
          stopQrPolling();
          setQrModalOpen(false);
          if (qrDisplayData?.amount) {
            startQrDeposit(qrDisplayData.amount);
          }
        }}
      />
    </AuthGuard>
  );
}
