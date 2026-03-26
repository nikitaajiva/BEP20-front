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
  readUsdtBalance,
  sendUsdtTransfer,
} from "@/utils/bscWallet";

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
  const usdtContractAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || "";
  const usdtDecimals = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS || "18");
  const bscChainId = 56;
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
    async (txHash, referenceId) => {
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
            referenceId,
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

  const createDepositIntent = useCallback(
    async (amount, fallbackWallet) => {
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
          wallet_address: fallbackWallet || user?.wallet_address,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create deposit intent.");
      }

      return data;
    },
    [API_URL, user]
  );

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
    let activeWallet = walletAccount;
    if (!activeWallet) {
      try {
        await switchToBsc();
        const accounts = await requestAccounts();
        activeWallet = accounts?.[0] || "";
        setWalletAccount(activeWallet);
      } catch (err) {
        setTransactionStatus(
          err.message || "Wallet connection was cancelled. Use QR deposit instead."
        );
        await startQrDeposit(amount);
        return;
      }
    }

    setTransactionStatus(`Preparing transfer for ${amount} USDT...`);
    setDebugMessage("");

    try {
      await switchToBsc();
      const intentData = await createDepositIntent(amount, activeWallet);
      const depositAddress = intentData.deposit_address;
      const referenceId = intentData.referenceId;
      setTransactionStatus("Please confirm the transfer in MetaMask...");

      try {
        const txHash = await sendUsdtTransfer({
          from: activeWallet,
          to: depositAddress,
          amount,
        });

        await handleBackendVerification(txHash, referenceId);
      } catch (transferError) {
        setTransactionStatus(
          transferError.message || "Wallet transfer not completed. Use QR to pay."
        );
        beginQrTracking(intentData, "Wallet transfer cancelled. Scan QR to pay.");
      }
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

  const beginQrTracking = useCallback(
    (data, statusMessage) => {
      setTransactionStatus(statusMessage || "Generating QR deposit...");
      setQrStatus("pending");

      const intentTokenContract = data.tokenContract || usdtContractAddress;
      const intentDecimals =
        Number.isFinite(Number(data.decimals)) ? Number(data.decimals) : usdtDecimals;
      const intentChainId =
        Number.isFinite(Number(data.chainId)) ? Number(data.chainId) : bscChainId;

      if (!intentTokenContract) {
        setTransactionStatus("USDT contract is not configured. Unable to build QR.");
        setQrStatus("failed");
        return;
      }

      const baseUnits = ethers.parseUnits(
        data.amount.toString(),
        Number.isFinite(intentDecimals) ? intentDecimals : 18
      );
      const payload = `ethereum:${intentTokenContract}@${intentChainId}/transfer?address=${data.deposit_address}&uint256=${baseUnits.toString()}&chainId=${intentChainId}`;

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
      }, 10000);
    },
    [stopQrPolling, verifyQrDeposit]
  );

  const startQrDeposit = useCallback(
    async (amount) => {
      setTransactionStatus("No wallet detected. Generating QR deposit...");
      setQrStatus("pending");

      try {
        const data = await createDepositIntent(amount);
        beginQrTracking(data, "Scan QR to complete your deposit.");
      } catch (error) {
        setTransactionStatus(error.message || "Failed to start QR deposit.");
        setQrStatus("failed");
      }
    },
    [createDepositIntent, beginQrTracking]
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
