"use client";

/**
 * getApiUrl() — Returns the backend API base URL dynamically.
 *
 * PROBLEM WITH HARDCODED IP IN .env:
 *   NEXT_PUBLIC_API_URL=http://192.168.1.24:5001 is baked into the JS bundle
 *   at build time. When another device or system opens the app, their API
 *   requests still go to 192.168.1.24 — which may be unreachable from their
 *   network, causing infinite loading.
 *
 * SOLUTION:
 *   In local/development mode (private IP or localhost), derive the API URL
 *   from the browser's current hostname so the app always talks to the
 *   correct server regardless of which device accesses it.
 *
 *   In production (real domain like https://yourapp.com), the env URL is used.
 */

const ENV_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const API_PORT = "5001"; // Your backend port

const isLocalNetworkHostname = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  /^192\.168\./.test(hostname) ||
  /^10\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

export function getApiUrl() {
  // Server-side rendering — use env URL directly
  if (typeof window === "undefined") {
    return ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`;
  }

  const currentHostname = window.location.hostname;

  // If the current page is on a local/private IP or localhost, dynamically
  // build the API URL from the browser's hostname so all devices work.
  if (isLocalNetworkHostname(currentHostname)) {
    const dynamicBase = `http://${currentHostname}:${API_PORT}`;
    return `${dynamicBase}/api`;
  }

  // Production: use the env URL
  const base = ENV_API_URL || window.location.origin;
  return base.endsWith("/api") ? base : `${base}/api`;
}
