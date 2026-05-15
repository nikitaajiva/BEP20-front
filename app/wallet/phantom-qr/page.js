"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { createPhantomQrProvider } from "@/walletProviders";
import {
  decryptPhantomPayload,
  derivePhantomSharedSecret,
  encodeUtf8ForPhantom,
  encryptPhantomPayload,
} from "@/utils/phantomDeeplinkCrypto";
import {
  getPhantomCluster,
  getPhantomUserMessage,
  PHANTOM_PUBLIC_APP_URL,
} from "@/utils/phantomWallet";

const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const API_URL = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;
const qrProvider = createPhantomQrProvider({ API_URL });
const PUBLIC_APP_ORIGIN =
  PHANTOM_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

const buildRedirectUrl = (params) => {
  const url = new URL(
    "/wallet/phantom-qr",
    PUBLIC_APP_ORIGIN
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const buildPhantomDeeplink = (path, params) => {
  const url = new URL(`https://phantom.app/ul/v1/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const resolveFailureStatus = (errorCode, errorMessage) => {
  const message = `${errorCode || ""} ${errorMessage || ""}`.toLowerCase();
  return message.includes("reject") || message.includes("cancel")
    ? "cancelled"
    : "failed";
};

export default function PhantomQrMobilePage() {
  const [uiState, setUiState] = useState("preparing");
  const [message, setMessage] = useState("Preparing secure wallet connection...");
  const [actionUrl, setActionUrl] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const handledKeyRef = useRef("");

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        sessionId: "",
        sessionToken: "",
        stage: "start",
        errorCode: "",
        errorMessage: "",
        nonce: "",
        data: "",
        phantomEncryptionPublicKey: "",
      };
    }

    const search = new URLSearchParams(window.location.search);
    return {
      sessionId: search.get("session") || "",
      sessionToken: search.get("token") || "",
      stage: search.get("stage") || "start",
      errorCode: search.get("errorCode") || "",
      errorMessage: search.get("errorMessage") || "",
      nonce: search.get("nonce") || "",
      data: search.get("data") || "",
      phantomEncryptionPublicKey:
        search.get("phantom_encryption_public_key") || "",
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      const currentKey = JSON.stringify(params);
      if (handledKeyRef.current === currentKey) return;
      handledKeyRef.current = currentKey;

      if (!params.sessionId || !params.sessionToken) {
        setUiState("error");
        setMessage("This wallet connection link is invalid or incomplete.");
        return;
      }

      if (params.errorCode || params.errorMessage) {
        const status = resolveFailureStatus(params.errorCode, params.errorMessage);
        try {
          await qrProvider.updateStatus({
            sessionId: params.sessionId,
            sessionToken: params.sessionToken,
            status,
            errorCode: params.errorCode,
            errorMessage: params.errorMessage,
          });
        } catch (error) {
          console.error("Phantom QR status update error:", error);
        }

        setUiState(status === "cancelled" ? "cancelled" : "error");
        setMessage(
          params.errorMessage ||
            (status === "cancelled"
              ? "Wallet connection was cancelled."
              : "Wallet connection failed.")
        );
        return;
      }

      let session;

      try {
        session = await qrProvider.bootstrap({
          sessionId: params.sessionId,
          sessionToken: params.sessionToken,
        });
      } catch (error) {
        setUiState("error");
        setMessage(error.message || "Unable to restore wallet session.");
        if (/expired/i.test(error.message || "")) {
          setSessionExpired(true);
        }
        return;
      }

      if (session.status === "connected") {
        setUiState("success");
        setMessage("Wallet connected successfully. You can return to your desktop session.");
        return;
      }

      if (session.status === "expired") {
        setUiState("expired");
        setSessionExpired(true);
        setMessage(session.errorMessage || getPhantomUserMessage("PHANTOM_QR_SESSION_EXPIRED"));
        return;
      }

      if (session.status === "cancelled") {
        setUiState("cancelled");
        setMessage(session.errorMessage || "Wallet connection was cancelled.");
        return;
      }

      if (session.status === "failed") {
        setUiState("error");
        setMessage(session.errorMessage || "Wallet connection failed.");
        return;
      }

      if (params.stage === "start") {
        const redirectLink = buildRedirectUrl({
          session: params.sessionId,
          token: params.sessionToken,
          stage: "connect",
        });
        const deepLink = buildPhantomDeeplink("connect", {
          app_url: PUBLIC_APP_ORIGIN,
          dapp_encryption_public_key: session.dappEncryptionPublicKey,
          redirect_link: redirectLink,
          cluster: getPhantomCluster(),
        });

        setUiState("opening");
        setActionUrl(deepLink);
        setMessage("Opening Phantom to approve the connection request...");
        window.location.href = deepLink;
        return;
      }

      if (params.stage === "connect") {
        if (!params.data || !params.nonce || !params.phantomEncryptionPublicKey) {
          setUiState("error");
          setMessage("Missing Phantom connection data. Please scan the QR code again.");
          return;
        }

        const sharedSecret = derivePhantomSharedSecret({
          phantomEncryptionPublicKey: params.phantomEncryptionPublicKey,
          dappEncryptionSecretKey: session.dappEncryptionSecretKey,
        });
        const connectData = decryptPhantomPayload({
          data: params.data,
          nonce: params.nonce,
          sharedSecret,
        });

        const challenge = await qrProvider.createChallenge({
          sessionId: params.sessionId,
          sessionToken: params.sessionToken,
          walletAddress: connectData.public_key,
          phantomSession: connectData.session,
          phantomEncryptionPublicKey: params.phantomEncryptionPublicKey,
        });

        const encrypted = encryptPhantomPayload(
          {
            message: encodeUtf8ForPhantom(challenge.message),
            session: connectData.session,
            display: "utf8",
          },
          sharedSecret
        );

        const redirectLink = buildRedirectUrl({
          session: params.sessionId,
          token: params.sessionToken,
          stage: "sign",
        });
        const signLink = buildPhantomDeeplink("signMessage", {
          dapp_encryption_public_key: session.dappEncryptionPublicKey,
          nonce: encrypted.nonce,
          redirect_link: redirectLink,
          payload: encrypted.payload,
        });

        setUiState("signing");
        setActionUrl(signLink);
        setMessage("Opening Phantom to sign your wallet verification request...");
        window.location.href = signLink;
        return;
      }

      if (params.stage === "sign") {
        if (!params.data || !params.nonce || !session.phantomEncryptionPublicKey) {
          setUiState("error");
          setMessage("Missing Phantom signature data. Please scan the QR code again.");
          return;
        }

        const sharedSecret = derivePhantomSharedSecret({
          phantomEncryptionPublicKey: session.phantomEncryptionPublicKey,
          dappEncryptionSecretKey: session.dappEncryptionSecretKey,
        });
        const signData = decryptPhantomPayload({
          data: params.data,
          nonce: params.nonce,
          sharedSecret,
        });

        await qrProvider.verify({
          sessionId: params.sessionId,
          sessionToken: params.sessionToken,
          signature: signData.signature,
        });

        setUiState("success");
        setMessage("Wallet connected successfully. You can return to your desktop session.");
        return;
      }

      setUiState("error");
      setMessage("Unknown Phantom QR flow state.");
    };

    run().catch(async (error) => {
      console.error("Phantom QR mobile flow error:", error);

      if (params.sessionId && params.sessionToken) {
        try {
          await qrProvider.updateStatus({
            sessionId: params.sessionId,
            sessionToken: params.sessionToken,
            status: /reject|cancel/i.test(error.message || "") ? "cancelled" : "failed",
            errorCode: "PHANTOM_QR_CLIENT_ERROR",
            errorMessage: error.message || "Wallet connection failed.",
          });
        } catch (statusError) {
          console.error("Phantom QR client status error:", statusError);
        }
      }

      setUiState("error");
      setMessage(error.message || "Wallet connection failed.");
      if (/expired/i.test(error.message || "")) {
        setSessionExpired(true);
      }
    });
  }, [params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,170,0,0.15), transparent 28%), #050505",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "min(100%, 560px)",
          borderRadius: "24px",
          border: "1px solid rgba(255,184,0,0.18)",
          background:
            "linear-gradient(180deg, rgba(255,170,0,0.08) 0%, rgba(10,10,10,0.96) 18%), rgba(8,8,8,0.96)",
          padding: "28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "rgba(255,184,0,0.12)",
            color: "#ffb800",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <ShieldCheck size={26} />
        </div>

        <p
          style={{
            margin: "0 0 12px",
            color: "#ffb800",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Phantom Mobile
        </p>
        <h1 style={{ margin: "0 0 10px", fontSize: "2rem", lineHeight: 1.1 }}>
          {uiState === "success"
            ? "Wallet Connected"
            : uiState === "cancelled"
            ? "Connection Cancelled"
            : uiState === "expired"
            ? "QR Code Expired"
            : "Connect Your Wallet"}
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
          {message}
        </p>

        <div
          style={{
            marginTop: 22,
            padding: "16px 18px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.78)",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <div>1. Approve the wallet connection in Phantom.</div>
          <div>2. Approve the secure message signature.</div>
          <div>3. Return to your desktop when the connection finishes.</div>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {actionUrl ? (
            <button
              type="button"
              onClick={() => {
                window.location.href = actionUrl;
              }}
              style={{
                minHeight: 44,
                padding: "0 16px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #ffaa00 0%, #ff6a00 100%)",
                color: "#121212",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <ExternalLink size={16} />
              Open Phantom
            </button>
          ) : null}

          {(uiState === "error" || uiState === "cancelled" || sessionExpired) ? (
            <a
              href={buildRedirectUrl({
                session: params.sessionId,
                token: params.sessionToken,
              })}
              style={{
                minHeight: 44,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <RefreshCw size={16} />
              Retry
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
