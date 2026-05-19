"use client";

/**
 * getApiUrl() — Truly Dynamic API Resolver
 * 
 * This function determines the backend API URL at RUNTIME based on how the 
 * user is accessing the application. 
 * 
 * 1. If NEXT_PUBLIC_API_URL is set in .env (Production/Specific Config) -> Use it.
 * 2. If accessing via localhost -> Use http://localhost:<configured-port>/api
 * 3. If accessing via Network IP (192.168.x.x) -> Use http://<IP>:<configured-port>/api
 * 4. If accessing via Domain -> Use https://<domain>/api
 */

const ENV_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEFAULT_BACKEND_PORT = (() => {
  if (!ENV_API_URL) return "5000";

  try {
    const { port, protocol } = new URL(ENV_API_URL);
    if (port) return port;
    return protocol === "https:" ? "443" : "80";
  } catch {
    return "5000";
  }
})();

export function getApiUrl() {
  // Server-side rendering fallback
  if (typeof window === "undefined") {
    return ENV_API_URL || "/api";
  }

  const { hostname, protocol } = window.location;

  // 1. Priority: .env Explicit Config (Used for production)
  if (ENV_API_URL) {
    try {
      const envHostname = new URL(ENV_API_URL).hostname;
      const isEnvLan = /^(192\.168\.|10\.|172\.)/.test(envHostname);
      
      // If it's a LAN IP and doesn't match current hostname, we bypass it to let dynamic resolver handle it
      if (!isEnvLan || envHostname === hostname) {
        return ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`;
      }
    } catch (e) {
      console.warn("Invalid ENV_API_URL format:", ENV_API_URL);
    }
  }

  // 2. Truly Dynamic: Derive from browser address
  
  // Is it a local/network address or your specific production IP?
  const isIP = /^(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.)/.test(hostname) || /^[0-9.]+$/.test(hostname);

  if (isIP) {
    // If accessing via IP, reuse the configured backend port when available.
    return `http://${hostname}:${DEFAULT_BACKEND_PORT}/api`;
  }

  // 3. Production Fallback: Same domain with /api prefix
  return `${protocol}//${hostname}/api`;
}
