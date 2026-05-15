"use client";

export const PHANTOM_CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa";
export const PHANTOM_DOWNLOAD_URL = PHANTOM_CHROME_EXTENSION_URL;
export const PHANTOM_QR_ROUTE = "/wallet/phantom-qr";
export const PHANTOM_QR_SESSION_TTL_SECONDS = 120;
export const PHANTOM_PUBLIC_APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  ""
).replace(/\/$/, "");

export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getPhantomProvider = () => {
  if (typeof window === "undefined") return null;

  const provider = window.phantom?.solana || window.solana;
  return provider?.isPhantom ? provider : null;
};

export const openPhantomInstallPage = (url = PHANTOM_DOWNLOAD_URL) => {
  if (typeof window === "undefined" || !url) return;

  const installLink = document.createElement("a");
  installLink.href = url;
  installLink.target = "_blank";
  installLink.rel = "noopener noreferrer";
  installLink.style.display = "none";

  document.body.appendChild(installLink);
  installLink.click();
  document.body.removeChild(installLink);
};

export const isPhantomExtensionSupportedOrigin = () => {
  if (typeof window === "undefined") return true;

  const { protocol, hostname } = window.location;
  return (
    protocol === "https:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
};

export const waitForPhantomProvider = async (timeoutMs = 3000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const provider = getPhantomProvider();
    if (provider) return provider;
    await sleep(100);
  }

  return getPhantomProvider();
};

export const getPhantomUserMessage = (code) => {
  switch (code) {
    case "AUTH_REQUIRED":
      return "Please log in before connecting your Phantom wallet.";
    case "PHANTOM_NOT_INSTALLED":
      return "Phantom extension not found.";
    case "PHANTOM_INSECURE_ORIGIN":
      return "Phantom extension works only on https, localhost, or 127.0.0.1. This page is running on an insecure local IP.";
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
    case "PHANTOM_WALLET_ALREADY_LINKED":
      return "This Phantom wallet is already connected to another account.";
    case "PHANTOM_QR_SESSION_EXPIRED":
      return "QR code expired. Generate a new code to continue.";
    default:
      return "Unable to connect Phantom wallet right now. Please try again.";
  }
};

export const getPhantomConnectErrorCode = (error, fallback = "PHANTOM_LOCKED") => {
  if (error?.code === 4001) return "PHANTOM_USER_REJECTED";
  if (error?.code === -32002) return "PHANTOM_ALREADY_PENDING";
  if (error?.code === "PHANTOM_CONNECT_TIMEOUT") return "PHANTOM_CONNECT_TIMEOUT";
  return fallback;
};

export const buildPhantomQrHandoffUrl = ({ origin, sessionId, sessionToken }) => {
  const params = new URLSearchParams({
    session: sessionId,
    token: sessionToken,
  });

  const baseOrigin = PHANTOM_PUBLIC_APP_URL || origin;
  return `${baseOrigin}${PHANTOM_QR_ROUTE}?${params.toString()}`;
};

export const getPhantomCluster = () =>
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta";
