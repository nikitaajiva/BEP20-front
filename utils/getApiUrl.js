"use client";

/**
 * getApiUrl() — Truly Dynamic API Resolver
 * 
 * This function determines the backend API URL at RUNTIME based on how the 
 * user is accessing the application. 
 * 
 * 1. If NEXT_PUBLIC_API_URL is set in .env (Production/Specific Config) -> Use it.
 * 2. If accessing via localhost -> Use http://localhost:5000/api
 * 3. If accessing via Network IP (192.168.x.x) -> Use http://<IP>:5000/api
 * 4. If accessing via Domain -> Use https://<domain>/api
 */

const ENV_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEFAULT_BACKEND_PORT = "5000"; 

export function getApiUrl() {
  // Server-side rendering fallback
  if (typeof window === "undefined") {
    return ENV_API_URL || "/api";
  }

  // 1. Priority: .env Explicit Config (Used for production)
  if (ENV_API_URL) {
    return ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`;
  }

  // 2. Truly Dynamic: Derive from browser address
  const { hostname, protocol } = window.location;
  
  // Is it a local/network address? (localhost or 192.168.x.x etc)
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || /^192\.168\./.test(hostname) || /^10\./.test(hostname);

  if (isLocal) {
    // Local dev: use the same hostname but the backend port
    return `http://${hostname}:${DEFAULT_BACKEND_PORT}/api`;
  }

  // 3. Production Fallback: Same domain with /api prefix
  return `${protocol}//${hostname}/api`;
}

