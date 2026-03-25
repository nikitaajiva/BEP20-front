"use client";
import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import AmountEntryModal from '@/components/AmountEntryModal';
import { Xumm } from 'xumm';
import { useAuth } from '@/context/AuthContext';

// TODO: Replace with your actual API key, ideally from an environment variable
const XUMM_API_KEY = process.env.NEXT_PUBLIC_XUMM_API_KEY || '72b5fba2-b2d4-4c12-a1b8-598003f6c568'; 
const XUMM_API_SECRET = process.env.NEXT_PUBLIC_XUMM_API_SECRET || '3816f256-e44c-41c3-ba57-78a7456af2db'; 
// Function to get the correct redirect URL for dashboard
const getDashboardRedirectUrl = () => {
  // Always use the staging URL with dashboard path to ensure proper redirect
  return `${process.env.NEXT_PUBLIC_API_URL}/dashboard`;
};

// Function to ensure Xumm is properly initialized
const ensureXummInitialized = () => {
  if (!xumm) {
    const dashboardUrl = getDashboardRedirectUrl();
    xumm = new Xumm(XUMM_API_KEY, XUMM_API_SECRET, {
      pkce: {
        redirectUrl: dashboardUrl
      }
    });
    console.log("Initialized Xumm with redirect URL:", dashboardUrl);
  }
  return xumm;
};

// Initialize Xumm variable
let xumm; 

const SYSTEM_DEPOSIT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SYSTEM_DEPOSIT_WALLET_ADDRESS || 'rKHFUy7FE3pSajAcrMj7L6LEvCriNGgnUj'; // Define system deposit address

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
  const [account, setAccount] = useState('');
  const [payloadUuid, setPayloadUuid] = useState('');
  const [lastPayloadUpdate, setLastPayloadUpdate] = useState('');
  const [appName, setAppName] = useState('');
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [xamanDepositBalance, setXamanDepositBalance] = useState(0);
  const [debugMessage, setDebugMessage] = useState('');

  // State for Ledger Data
  const [ledgerDetails, setLedgerDetails] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [ledgerError, setLedgerError] = useState('');

  // Refactored and memoized fetchLedgerDetails
  const fetchLedgerDetails = useCallback(async () => {
    if (!user) { // Check if user is available before fetching
      // console.log("[fetchLedgerDetails] No user, skipping fetch.");
      // Optionally clear ledger details if user logs out, though useEffect handles this
      // setLedgerDetails(null);
      // setLoadingLedger(false); // Or true if you want to show loading until user is back
      return;
    }
    console.log("[fetchLedgerDetails] Attempting to fetch ledger details.");
    setLoadingLedger(true);
    setLedgerError('');
    const token = localStorage.getItem('token'); // Or preferably get token from AuthContext if available
    if (!token) {
      setLedgerError('Authentication token not found.');
      setLoadingLedger(false);
      return;
    }

    try {
      console.log(`[fetchLedgerDetails] Fetching ledger details from ${API_URL}/ledger`);
      const response = await fetch(`${API_URL}/ledger`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLedgerDetails(data.data);
        console.log("[fetchLedgerDetails] Ledger details fetched:", data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch ledger details');
      }
    } catch (error) {
      console.error("[fetchLedgerDetails] Error fetching ledger details:", error);
      setLedgerError(error.message);
      setLedgerDetails(null); // Or keep previous state if preferred on error
    } finally {
      setLoadingLedger(false);
    }
  }, [user, API_URL]); // Dependencies for useCallback

  // Centralized function to handle backend verification of a transaction
  const handleBackendVerification = useCallback(async (txid, userAccount) => {
    setTransactionStatus(`Transaction Signed! TXID: ${txid}. Verifying with backend...`);
    const token = localStorage.getItem('token');
    if (!token) {
      setTransactionStatus("Authentication error: No token found. Please re-login.");
      return;
    }

    try {
      const backendResponse = await fetch(`${API_URL}/deposits/USDT`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          transactionId: txid,
          USDTAddress: userAccount 
        })
      });
      const backendData = await backendResponse.json();

      if (backendData.success) {
        setTransactionStatus(` ${backendData.message || 'Deposit successfully recorded!'}`);
        if (backendData.updatedXamanBalance !== undefined) {
          setXamanDepositBalance(parseFloat(backendData.updatedXamanBalance));
        }
        // Refresh ledger details to show updated balances on dashboard
        fetchLedgerDetails();
      } else {
        setTransactionStatus(`Backend error: ${backendData.message || 'Failed to record deposit.'}`);
      }
    } catch (apiError) {
      console.error("API call to record deposit failed:", apiError);
      setTransactionStatus(`API Error: Failed to communicate with backend. ${apiError.message}`);
    }
  }, [API_URL, fetchLedgerDetails]); // Dependencies for useCallback

  useEffect(() => {
    if (user) {
      // Check for a pending payload UUID from a previous session on page load
      const pendingPayloadUuid = localStorage.getItem('pendingPayloadUuid');
      if (pendingPayloadUuid) {
        console.log("Found pending payload UUID on page load:", pendingPayloadUuid);
        setTransactionStatus("Found a pending transaction, checking its status...");
        const xummInstance = ensureXummInitialized();

        xummInstance.payload.get(pendingPayloadUuid).then(payload => {
          console.log("Status of pending payload:", payload);
          if (payload.meta.resolved) {
            if (payload.meta.signed) {
              const userAccountAddress = payload.response.account;
              handleBackendVerification(payload.response.txid, userAccountAddress);
            } else {
              setTransactionStatus("The pending transaction was rejected in Xaman.");
            }
            localStorage.removeItem('pendingPayloadUuid'); // Clean up after handling
          } else if (payload.meta.expired) {
            setTransactionStatus("The pending transaction has expired. Please try again.");
            localStorage.removeItem('pendingPayloadUuid'); // Clean up expired
          } else {
            setTransactionStatus("Your transaction is still pending. Please check your Xaman app to sign it.");
          }
        }).catch(err => {
          console.error("Error fetching status for pending payload:", err);
          setTransactionStatus("Error checking status of a pending transaction. It may have been invalid.");
          localStorage.removeItem('pendingPayloadUuid'); // Clean up on error
        });
      }

      console.log("[useEffect] User detected. Attempting to get Xaman account details silently.");
      console.log("[useEffect] Calling xumm.user.account...");
      const xummInstance = ensureXummInitialized();
      xummInstance.user.account.then(xamanAccountDetails => {
        console.log("[useEffect] xumm.user.account response:", xamanAccountDetails);
        if (typeof xamanAccountDetails === 'string' && xamanAccountDetails.startsWith('r')) {
          console.log("[useEffect] Detected valid Xaman account string:", xamanAccountDetails);
          setAccount(xamanAccountDetails);
        } else if (xamanAccountDetails && (xamanAccountDetails.account || xamanAccountDetails.address)) {
          const userAccountAddress = xamanAccountDetails.account || xamanAccountDetails.address;
          console.log("[useEffect] Detected Xaman account object, address:", userAccountAddress);
          setAccount(userAccountAddress);
        } else {
          console.log("[useEffect] No valid Xaman account details found or in unexpected format.");
          setAccount('');
        }
      }).catch(err => {
        console.warn("[useEffect] Error fetching Xumm user account silently:", err);
        setAccount('');
      });

      console.log("[useEffect] Calling xumm.environment.jwt...");
      xummInstance.environment.jwt?.then(j => {
        console.log("[useEffect] xumm.environment.jwt response:", j);
        setAppName(j?.app_name ?? '')
      }).catch(envError => {
        console.warn("[useEffect] Error fetching Xumm environment details:", envError);
      });

      if (user.xamanBalance !== undefined) {
        setXamanDepositBalance(user.xamanBalance);
      } else {
        setXamanDepositBalance(0);
      }

      // Fetch Ledger Details - now called directly
      fetchLedgerDetails();

    } else {
      if (account || appName) {
        console.log("Main user logged out, calling xumm.logout() and clearing Xaman related states.");
        xumm.logout();
        setAccount('');
        setAppName('');
        setPayloadUuid('');
        setLastPayloadUpdate('');
        setTransactionStatus('');
      }
      // Clear ledger details on logout
      setLedgerDetails(null);
      setLoadingLedger(true);
      setLedgerError('');
    }
  }, [user, API_URL, fetchLedgerDetails, handleBackendVerification]); // Added fetchLedgerDetails and new handler to dependency array

  const xamanLogin = async () => {
    console.log("Attempting Xaman login...");
    setTransactionStatus('Initiating Xaman connection...');
    setLastPayloadUpdate('');
    try {
      // Clear any existing instance and create fresh one
      xumm = null;
      const xummInstance = ensureXummInitialized();
      
      console.log("Calling xumm.authorize()...");
      await xummInstance.authorize();
      console.log("xumm.authorize() success (or no immediate error). Fetching account details...");
      console.log("Calling xumm.user.account...");
      const xamanAccountDetails = await xummInstance.user.account;
      console.log("xumm.user.account response (after authorize):", xamanAccountDetails);
      console.log("Full xamanAccountDetails object (after authorize):", JSON.stringify(xamanAccountDetails, null, 2));

      if (typeof xamanAccountDetails === 'string' && xamanAccountDetails.startsWith('r')) {
        console.log("[xamanLogin] Detected valid Xaman account string:", xamanAccountDetails);
        setAccount(xamanAccountDetails);
        console.log("[xamanLogin] setAccount called with string:", xamanAccountDetails);
      } else if (xamanAccountDetails && (xamanAccountDetails.account || xamanAccountDetails.address)) {
        const userAccountAddress = xamanAccountDetails.account || xamanAccountDetails.address;
        console.log("[xamanLogin] Extracted userAccountAddress from object:", userAccountAddress);
        setAccount(userAccountAddress ?? '');
        console.log("[xamanLogin] setAccount called with extracted address:", userAccountAddress ?? '');
      } else {
        console.log("[xamanLogin] xamanAccountDetails is null, undefined, or in an unexpected format after authorize.");
        setAccount('');
      }
      setTransactionStatus('Xaman wallet connected/authorized.');
    } catch (err) {
      console.error("Xumm authorize error:", err);
      setTransactionStatus('Failed to connect Xaman wallet.');
    }
  };

  const xamanLogout = () => {
    setTransactionStatus('Disconnecting Xaman wallet...');
    xumm.logout();
    setAccount('');
    setAppName('');
    setPayloadUuid('');
    setLastPayloadUpdate('');
    setTransactionStatus('Xaman wallet disconnected.');
  };

  const handleOpenAmountModal = () => {
    setTransactionStatus('');
    setLastPayloadUpdate('');
    setIsAmountModalOpen(true);
  };

  const createPayload = async (amountUSDT) => {
    setIsAmountModalOpen(false);
    if (!account) {
      alert("Please sign in first by connecting your Xaman wallet.");
      setDebugMessage("Debug: User not signed in with Xaman.");
      return;
    }
    if (!amountUSDT || parseFloat(amountUSDT) <= 0) {
      alert("Invalid amount provided.");
      setDebugMessage("Debug: Invalid amount for payload.");
      return;
    }

    const amountInDrops = String(parseFloat(amountUSDT) * 1000000);

    setTransactionStatus(`Preparing transaction for ${amountUSDT} USDT...`);
    setLastPayloadUpdate('');
    setDebugMessage('');

// 🧩 Step: Request the server to allocate and store a new deposit address
setTransactionStatus("Requesting deposit address from server...");
const token = localStorage.getItem("token");
const response = await fetch(`${API_URL}/deposits/address`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
});
const result = await response.json();

if (!result.success || !result.deposit_address) {
  throw new Error(result.message || "Failed to get deposit address.");
}

const { wallet_address: liveWalletAddress, destination_tag: liveDestinationTag } =
  result.deposit_address;

console.log("✅ Got live deposit address:", liveWalletAddress, liveDestinationTag);



    try {
      const xummInstance = ensureXummInitialized();
      const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;
      const payloadPayload = {
            // txjson: {
            //   TransactionType: 'Payment',
            //   Destination: SYSTEM_DEPOSIT_WALLET_ADDRESS,
            //   Account: account,
            //   Amount: amountInDrops,
            // },
          txjson: {
                    TransactionType: "Payment",
                    Destination: "rGPty1yQisw4z5soKZauz1Dc3xzeoyoMe3", //liveWalletAddress,
                    DestinationTag: liveDestinationTag,
                    Account: account,
                    Amount: amountInDrops,
                  },
            options: {
              submit: true,
              return_url: {
                app: `${DASHBOARD_URL}/dashboard`,
                web: `${DASHBOARD_URL}/dashboard`, // browser redirect
              },
            },
          };


      setLastPayloadUpdate(`Transaction Payload: ${JSON.stringify(payloadPayload, null, 2)}`);

      const subscription = await xummInstance.payload?.createAndSubscribe(
        payloadPayload,
        async event => {
          setLastPayloadUpdate(prev => `${prev}\nEvent Data: ${JSON.stringify(event.data, null, 2)}`);
          if (event.data.opened) {
            setTransactionStatus("Transaction opened in Xaman. Please check your Xaman app to sign.");
          }
          if (event.data.signed === true) {
            setTransactionStatus("Transaction signed successfully! Processing...");
          }
          if (event.data.signed === false) {
            setTransactionStatus("Transaction rejected/cancelled in Xaman.");
          }
          if (Object.prototype.hasOwnProperty.call(event.data, 'signed')) {
            return event.data;
          }
        }
      );

      if (!subscription) {
        setTransactionStatus("Failed to create Xaman payload. Please try again.");
        return;
      }

      setPayloadUuid(subscription.created.uuid);
      localStorage.setItem('pendingPayloadUuid', subscription.created.uuid);

      setTransactionStatus("Processing Xaman request... Opening Xaman app.");
      if (xummInstance.runtime.xapp) {
        xummInstance.xapp?.openSignRequest(subscription.created);
      } else if (subscription.created.next?.always) {
        const deepLinkUrl = subscription.created.next.always;
        window.open(deepLinkUrl);
      }

      const resolution = await subscription.resolved;
      setLastPayloadUpdate(prev => `${prev}\nResolution Data: ${JSON.stringify(resolution, null, 2)}`);

      if (resolution.signed) {
        let txid = resolution.txid;

        // ⏳ if txid missing, poll Xumm until it appears
        if (!txid) {
          setTransactionStatus("Waiting for transaction to be validated on USDTL...");
          for (let i = 0; i < 10; i++) {
            const payloadStatus = await xummInstance.payload.get(subscription.created.uuid);
            if (payloadStatus?.response?.txid) {
              txid = payloadStatus.response.txid;
              break;
            }
            await new Promise(r => setTimeout(r, 3000)); // wait 3s before next poll
          }
        }

        if (txid) {
          await handleBackendVerification(txid, account);

          // // ✅ Redirect after backend verification
          // window.location.href = "/dashboard"; 
          // or use Next.js router.push("/dashboard") if you want client-side navigation
        } else {
          setTransactionStatus("Error: Could not retrieve transaction ID from Xaman.");
        }
      } else {
        setTransactionStatus("Transaction was not signed or was rejected by Xaman.");
      }

      localStorage.removeItem('pendingPayloadUuid');

    } catch (error) {
      console.error("Error creating Xumm payload:", error);
      setTransactionStatus(`Error: ${error.message || "An unknown error occurred."}`);
      localStorage.removeItem('pendingPayloadUuid');
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout
        xummAccount={account}
        xummAppName={appName}
        xummLastPayloadUpdate={lastPayloadUpdate}
        xummTransactionStatus={transactionStatus}
        xummDebugMessage={debugMessage}
        onXummLogin={xamanLogin}
        onXummLogout={xamanLogout}
        onOpenAmountModal={handleOpenAmountModal}
        xamanDepositBalance={ledgerDetails?.xamanWallet?.balance || xamanDepositBalance}
        ledgerDetails={ledgerDetails}
        loadingLedger={loadingLedger}
        ledgerError={ledgerError}
        refreshLedgerDetails={fetchLedgerDetails}
      >
      </DashboardLayout>
      <AmountEntryModal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        onSubmit={createPayload}
        appName={appName}
      />
    </AuthGuard>
  );
}
