"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CallbackClient() {
  const router = useRouter();
  const [status, setStatus] = useState("Redirecting to sign-in...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    setStatus("Wallet login is handled on the sign-in page.");
    const timer = setTimeout(() => router.replace("/sign-in"), 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Wallet Login</h1>
      <p>{status}</p>
    </div>
  );
}
