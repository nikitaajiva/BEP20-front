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

  const provider = window.phantom?.solana;

  if (provider?.isPhantom) return provider;

  return null;
};

export const isLocalhostOrigin = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

export const isPrivateLanIp = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
};

export const isSecureOrSupportedPhantomOrigin = () => {
  if (typeof window === "undefined") return false;
  return (
    window.location.protocol === "https:" ||
    isLocalhostOrigin()
  );
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
  // Phantom extension works on any origin — the browser's extension sandbox
  // enforces trust, not the page URL. We only block SSR (no window).
  if (typeof window === "undefined") return true;
  return true;
};

/** Returns true only if running on https or localhost (for informational hints). */
export const isSecureOrigin = () => {
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
    case "PHANTOM_UNSUPPORTED_ORIGIN":
      return "Phantom extension cannot reliably connect on this LAN HTTP URL. Use localhost on this computer or open the app through HTTPS.";
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

/**
 * Returns true if the given URL is a local/private network address.
 * Local IPs should NOT be used from env — instead, use the browser's actual origin
 * so QR codes work across different devices on the same network.
 */
const isLocalNetworkUrl = (url) => {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

export const buildPhantomQrHandoffUrl = ({ origin, sessionId, sessionToken }) => {
  const params = new URLSearchParams({
    session: sessionId,
    token: sessionToken,
  });

  const envUrl = PHANTOM_PUBLIC_APP_URL;

  /**
   * Determine the best base origin for the QR code.
   * 
   * 1. If we are currently on a "real" network address (IP or Domain), use it!
   *    This is the most dynamic way (Zero Config).
   * 2. If we are on localhost, but have a network IP in .env, use the .env IP.
   * 3. Last resort: use localhost.
   */
  const getBestOrigin = () => {
    const isLocalhost = (urlStr) => {
      try {
        const h = new URL(urlStr).hostname;
        return h === "localhost" || h === "127.0.0.1";
      } catch {
        return true;
      }
    };

    // If current origin is a real address (IP/Domain), use it!
    if (origin && !isLocalhost(origin)) {
      return origin;
    }

    // If we are on localhost, but env has a real IP/Domain, use env.
    if (envUrl && !isLocalhost(envUrl)) {
      return envUrl;
    }

    // Otherwise, just use what we have (likely localhost)
    return origin;
  };

  const baseOrigin = getBestOrigin();
  return `${baseOrigin}${PHANTOM_QR_ROUTE}?${params.toString()}`;
};

export const getPhantomCluster = () =>
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta";
