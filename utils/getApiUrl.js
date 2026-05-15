"use client";

/**
 * getApiUrl() — Returns the backend API base URL.
 *
 * RULE:
 *  1. If NEXT_PUBLIC_API_URL is set in .env  → always use it (you control which backend).
 *  2. If NEXT_PUBLIC_API_URL is empty        → auto-derive from browser hostname + port 5001
 *     (useful when frontend + backend both run on the same machine).
 *
 * EXAMPLES:
 *  Backend on 192.168.1.24:5001  → set NEXT_PUBLIC_API_URL=http://192.168.1.24:5001
 *  Backend on 192.168.1.4:5001   → set NEXT_PUBLIC_API_URL=http://192.168.1.4:5001
 *  Production domain              → set NEXT_PUBLIC_API_URL=https://api.yourapp.com
 *  Empty (same-machine dev only)  → auto: uses window.location.hostname:5001
 */

const ENV_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const FALLBACK_API_PORT = "5001"; // Used only when NEXT_PUBLIC_API_URL is empty

export function getApiUrl() {
  // SSR: always use env URL
  if (typeof window === "undefined") {
    if (!ENV_API_URL) return "/api"; // SSR with no env — safe fallback
    return ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`;
  }

  // If env URL is explicitly set, always use it — the developer chose this backend
  if (ENV_API_URL) {
    return ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`;
  }

  // Fallback when NEXT_PUBLIC_API_URL is empty:
  // Assume backend runs on the same machine as the frontend
  const hostname = window.location.hostname;
  return `http://${hostname}:${FALLBACK_API_PORT}/api`;
}

