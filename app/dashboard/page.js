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
  sendUsdtTransfer,
  sendBnbTransfer,
} from "@/utils/bscWallet";

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
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
  const [qrTxHashStatus, setQrTxHashStatus] = useState("");
  const qrPollRef = useRef(null);
  const qrTimerRef = useRef(null);
  const qrReferenceRef = useRef("");
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);

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

  const handleBackendVerification = useCallback(
    async (txHash, referenceId, asset) => {
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
        const endpoint =
          asset && asset.toUpperCase() === "BNB" ? "bnb" : "usdt";
        const backendResponse = await fetch(`${API_URL}/deposits/${endpoint}`, {
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
  }, [user, API_URL, fetchLedgerDetails, fetchNativeBalance, walletAccount, isManualDisconnect]);

  useEffect(() => {
    if (!ledgerDetails?.bnbWallet?.balance) return;
    setPrimaryVaultBalance(ledgerDetails.bnbWallet.balance);
  }, [ledgerDetails]);

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
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!ethereum) {
      await startQrDeposit(rawAmount, asset);
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
        await startQrDeposit(rawAmount, asset);
        return;
      }
    }

    setTransactionStatus(`Preparing transfer for ${rawAmount} ${asset}...`);
    setDebugMessage("");

    try {
      await switchToBsc();
      const intentData = await createDepositIntent(rawAmount, activeWallet, asset);
      const depositAddress = intentData.deposit_address || (intentData.intent && intentData.intent.deposit_address);
      const referenceId = intentData.referenceId || (intentData.intent && intentData.intent.referenceId);
      
      if (!depositAddress || !referenceId) {
         // If it's a 409, the structure might be different
         const finalData = intentData.intent || intentData;
         if (finalData.referenceId) {
            beginQrTracking(finalData, "Scan QR to complete your existing deposit.");
            return;
         }
         throw new Error("Invalid response from server.");
      }

      setTransactionStatus("Please confirm the transfer in MetaMask...");

      try {
        const txHash =
          asset === "BNB"
            ? await sendBnbTransfer({
              from: activeWallet,
              to: depositAddress,
              amount: rawAmount,
            })
            : await sendUsdtTransfer({
              from: activeWallet,
              to: depositAddress,
              amount: rawAmount,
            });

        await handleBackendVerification(txHash, referenceId, asset);
      } catch (transferError) {
        setTransactionStatus(
          transferError.message || "Wallet transfer not completed. Use QR to pay."
        );
        const finalIntent = intentData.intent || intentData;
        beginQrTracking(finalIntent, "Wallet transfer cancelled. Scan QR to pay.");
      }
    } catch (error) {
      console.error("Deposit Intent Error:", error);
      setTransactionStatus(
        `Error: ${error.message || "An unknown error occurred."}`
      );
      // Fallback: If it failed but it's an important error, maybe don't just leave a silent message
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
          setQrTxHashStatus(backendData.message || "Tx hash accepted.");
          setQrStatus("completed");
          stopQrPolling();
          fetchLedgerDetails();
          return;
        }

        if (backendResponse.status === 202) {
          setQrStatus("pending");
          setQrTxHashStatus(backendData.message || "Waiting for confirmations.");
          return;
        }

        setQrStatus("failed");
        setQrTxHashStatus(backendData.message || "Failed to process tx hash.");
      } catch (error) {
        setQrStatus("failed");
        setQrTxHashStatus(error.message || "Failed to submit tx hash.");
      }
    },
    [API_URL, fetchLedgerDetails, stopQrPolling]
  );

  const beginQrTracking = useCallback(
    (data, statusMessage) => {
      setTransactionStatus(statusMessage || "Generating QR deposit...");
      setQrStatus("pending");
      setQrTxHashStatus("");

      const asset = `${data.asset || "BNB"}`.toUpperCase();
      const intentTokenContract = data.tokenContract || "";
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

      const payload =
        asset === "BNB"
          ? `ethereum:${checksumDeposit}@${chainId}?value=${baseUnits.toString()}`
          : `ethereum:${checksumToken}@${chainId}/transfer?address=${checksumDeposit}&uint256=${baseUnits.toString()}`;
      const fallbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/deposit/intent/${data.referenceId}`
          : "";
      const encodedPayload = encodeURI(payload);

      setQrPayload(encodedPayload);
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
