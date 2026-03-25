"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function CallbackClient() {
  const { API_URL } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("🔐 Validating Xaman connection...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const token = searchParams.get("access_token");
      const expiresIn = Number(searchParams.get("expires_in") || 86400);

      if (!token) {
        setStatus("❌ No access token received");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      try {
        // Store token
        localStorage.setItem("xaman_token", token);
        localStorage.setItem(
          "xaman_token_expiry",
          (Date.now() + expiresIn * 1000).toString()
        );

        setStatus("🔍 Fetching Xaman profile...");

        const xummRes = await axios.get(
          "https://oauth2.xumm.app/userinfo",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        localStorage.setItem(
          "XummPkceJwt",
          JSON.stringify({ jwt: token, me: xummRes.data })
        );

        setStatus("🔐 Logging you in...");

        const res = await axios.post(`${API_URL}/auth/xamanlogin`, {
          xamanToken: token,
        });

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Backend login failed");
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        window.history.replaceState(null, "", "/auth/callback");

        setStatus("✅ Login successful! Redirecting...");
        setTimeout(() => router.replace("/dashboard"), 800);
      } catch (err) {
        console.error("Xaman callback error:", err);
        setStatus("❌ Login failed");
        setTimeout(() => router.replace("/login"), 2500);
      }
    };

    run();
  }, [API_URL, router, searchParams]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Xaman Wallet</h1>
      <p>{status}</p>
    </div>
  );
}
