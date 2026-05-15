"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  MonitorSmartphone,
  QrCode,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import styles from "./WalletConnectModal.module.css";
import {
  buildPhantomQrHandoffUrl,
  getPhantomUserMessage,
  isPhantomExtensionSupportedOrigin,
  openPhantomInstallPage,
  PHANTOM_DOWNLOAD_URL,
} from "@/utils/phantomWallet";

const QR_TERMINAL_STATES = new Set(["connected", "expired", "failed", "cancelled"]);

const formatTimeLeft = (seconds) => {
  const total = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

export default function WalletConnectModal({
  isOpen,
  onClose,
  extensionProvider,
  qrProvider,
  onConnected,
}) {
  const [mode, setMode] = useState("options");
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [extensionError, setExtensionError] = useState("");
  const [qrError, setQrError] = useState("");
  const [qrState, setQrState] = useState("idle");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSession, setQrSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const isClosingRef = useRef(false);
  const extensionSupportedOrigin =
    typeof window === "undefined" ? true : isPhantomExtensionSupportedOrigin();
  const extensionAvailable =
    isOpen &&
    extensionSupportedOrigin &&
    typeof extensionProvider?.isAvailable === "function" &&
    extensionProvider.isAvailable();
  const extensionInstallUrl =
    extensionProvider?.installUrl || PHANTOM_DOWNLOAD_URL;

  const handoffUrl = useMemo(() => {
    if (!qrSession?.id || !qrSession?.sessionToken || typeof window === "undefined") {
      return "";
    }

    return buildPhantomQrHandoffUrl({
      origin: window.location.origin,
      sessionId: qrSession.id,
      sessionToken: qrSession.sessionToken,
    });
  }, [qrSession?.id, qrSession?.sessionToken]);

  const clearQrIntervals = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetQrState = useCallback(() => {
    clearQrIntervals();
    setQrState("idle");
    setQrSession(null);
    setQrDataUrl("");
    setQrError("");
    setTimeLeft(0);
  }, [clearQrIntervals]);

  const resetAllState = useCallback(() => {
    setMode("options");
    setExtensionLoading(false);
    setExtensionError("");
    resetQrState();
  }, [resetQrState]);

  const closeModal = useCallback(async () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    try {
      const activeSessionId = qrSession?.id;
      if (
        activeSessionId &&
        !QR_TERMINAL_STATES.has(qrState) &&
        typeof qrProvider?.disconnect === "function"
      ) {
        try {
          await qrProvider.disconnect({ sessionId: activeSessionId });
        } catch (error) {
          console.error("Wallet connect QR cancel warning:", error);
        }
      }
    } finally {
      resetAllState();
      onClose?.();
      isClosingRef.current = false;
    }
  }, [onClose, qrProvider, qrSession?.id, qrState, resetAllState]);

  const syncQrSession = useCallback(
    (session) => {
      if (!session) return;

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const nextSeconds = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));

      setQrSession((current) => ({
        ...(current || {}),
        ...session,
      }));
      setTimeLeft(nextSeconds);

      if (session.status === "connected") {
        setQrState("connected");
        setQrError("");

        window.setTimeout(async () => {
          await onConnected?.({
            source: "qr",
            walletAddress: session.walletAddress,
            session,
          });
          await closeModal();
        }, 700);
        return;
      }

      if (session.status === "expired") {
        clearQrIntervals();
        setQrState("expired");
        setQrError(session.errorMessage || getPhantomUserMessage("PHANTOM_QR_SESSION_EXPIRED"));
        return;
      }

      if (session.status === "failed") {
        clearQrIntervals();
        setQrState("failed");
        setQrError(session.errorMessage || "Wallet connection failed.");
        return;
      }

      if (session.status === "cancelled") {
        clearQrIntervals();
        setQrState("cancelled");
        setQrError(session.errorMessage || "Wallet connection was cancelled.");
        return;
      }

      setQrState(session.status === "waiting_for_scan" ? "waiting_for_scan" : "ready");
      setQrError("");
    },
    [clearQrIntervals, closeModal, onConnected]
  );

  const startQrPolling = useCallback(
    (sessionId) => {
      clearQrIntervals();

      timerRef.current = setInterval(() => {
        setTimeLeft((current) => {
          const next = Math.max(0, current - 1);
          if (next <= 0) {
            clearQrIntervals();
            setQrState("expired");
            setQrError(getPhantomUserMessage("PHANTOM_QR_SESSION_EXPIRED"));
          }
          return next;
        });
      }, 1000);

      pollRef.current = setInterval(async () => {
        try {
          const session = await qrProvider.getSession(sessionId);
          syncQrSession(session);
        } catch (error) {
          clearQrIntervals();
          setQrState("failed");
          setQrError(error.message || "Unable to check QR session status.");
        }
      }, 2500);
    },
    [clearQrIntervals, qrProvider, syncQrSession]
  );

  const beginQrFlow = useCallback(async () => {
    setMode("qr");
    setQrError("");
    setQrState("generating");
    setQrDataUrl("");

    try {
      if (typeof qrProvider?.connect !== "function") {
        throw new Error("QR wallet provider is unavailable right now.");
      }

      const session = await qrProvider.connect();
      syncQrSession(session);
      startQrPolling(session.id);
    } catch (error) {
      setQrState("failed");
      setQrError(error.message || "Unable to generate QR code.");
    }
  }, [qrProvider, startQrPolling, syncQrSession]);

  const handleExtensionConnect = useCallback(async () => {
    setExtensionLoading(true);
    setExtensionError("");

    try {
      if (!extensionSupportedOrigin) {
        setExtensionError(getPhantomUserMessage("PHANTOM_INSECURE_ORIGIN"));
        return;
      }

      if (typeof extensionProvider?.connect !== "function") {
        setExtensionError("Phantom extension provider is unavailable right now.");
        return;
      }

      if (!extensionAvailable) {
        openPhantomInstallPage(extensionInstallUrl);
        return;
      }

      const result = await extensionProvider.connect();

      if (!result?.success) {
        if (result?.code === "PHANTOM_NOT_INSTALLED" && extensionInstallUrl) {
          openPhantomInstallPage(extensionInstallUrl);
          return;
        }

        setExtensionError(result?.error || "Unable to connect Phantom extension.");
        return;
      }

      await onConnected?.({
        source: "extension",
        walletAddress: result.walletAddress,
        result,
      });
      await closeModal();
    } catch (error) {
      setExtensionError(error.message || "Unable to connect Phantom extension.");
    } finally {
      setExtensionLoading(false);
    }
  }, [
    closeModal,
    extensionAvailable,
    extensionInstallUrl,
    extensionProvider,
    extensionSupportedOrigin,
    onConnected,
  ]);

  useEffect(() => {
    if (!handoffUrl) {
      setQrDataUrl("");
      return undefined;
    }

    let isMounted = true;

    QRCode.toDataURL(handoffUrl, { width: 280, margin: 1 })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [handoffUrl]);

  useEffect(() => {
    if (!isOpen) {
      resetAllState();
      return undefined;
    }

    return () => {
      clearQrIntervals();
    };
  }, [clearQrIntervals, isOpen, resetAllState]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="Close wallet connect modal"
        >
          <X size={18} />
        </button>

        {mode === "options" ? (
          <>
            <div className={styles.header}>
              <p className={styles.eyebrow}>Secure Wallet Access</p>
              <h2 className={styles.title}>Connect Wallet</h2>
              <p className={styles.subtitle}>
                Choose how you want to connect your wallet.
              </p>
            </div>

            <div className={styles.optionGrid}>
              <button
                type="button"
                className={styles.optionCard}
                onClick={handleExtensionConnect}
                disabled={extensionLoading}
                aria-disabled={!extensionSupportedOrigin}
              >
                <div className={styles.optionIcon}>
                  <MonitorSmartphone size={22} />
                </div>
                <div className={styles.optionTitleRow}>
                  <h3>Connect with Extension</h3>
                  <Wallet size={16} />
                </div>
                <p>
                  {extensionSupportedOrigin
                    ? "Use Phantom browser extension on desktop."
                    : "Phantom extension needs https, localhost, or 127.0.0.1."}
                </p>
                <span className={styles.optionHint}>
                  {extensionSupportedOrigin
                    ? extensionAvailable
                      ? "Best for desktop"
                      : "Redirects to install"
                    : "Use localhost or https"}
                </span>
              </button>

              <button
                type="button"
                className={styles.optionCard}
                onClick={beginQrFlow}
              >
                <div className={styles.optionIcon}>
                  <QrCode size={22} />
                </div>
                <div className={styles.optionTitleRow}>
                  <h3>Connect with QR Code</h3>
                  <QrCode size={16} />
                </div>
                <p>Scan with Phantom mobile wallet.</p>
                <span className={styles.optionHint}>Best for mobile wallet</span>
              </button>
            </div>

            {extensionError ? (
              <div className={styles.errorBox}>
                <p>{extensionError}</p>
                {!extensionSupportedOrigin ? (
                  <p className={styles.helperText}>
                    Open this app on <strong>http://localhost:3000</strong> on the same desktop browser
                    for Phantom extension, or keep using QR on your phone.
                  </p>
                ) : null}
                {!extensionAvailable ? (
                  <a
                    className={styles.inlineLink}
                    href={PHANTOM_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Install or open Phantom
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className={styles.footerNote}>
              {extensionSupportedOrigin
                ? "Extension is best for desktop. QR code is best for mobile wallet."
                : "Extension needs localhost or https. QR code works better on this local IP for mobile wallet."}
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <p className={styles.eyebrow}>Phantom Mobile</p>
              <h2 className={styles.title}>Connect with QR Code</h2>
              <p className={styles.subtitle}>
                Scan this QR with Phantom mobile wallet to securely connect.
              </p>
            </div>

            <div className={styles.qrPanel}>
              {qrState === "generating" ? (
                <div className={styles.qrLoading}>Generating secure QR session...</div>
              ) : qrDataUrl ? (
                <img className={styles.qrImage} src={qrDataUrl} alt="Phantom wallet connect QR code" />
              ) : (
                <div className={styles.qrLoading}>Preparing QR code...</div>
              )}

              <div className={styles.qrMeta}>
                <span className={styles.qrStateBadge} data-state={qrState}>
                  {qrState === "connected"
                    ? "Connected"
                    : qrState === "expired"
                    ? "Expired"
                    : qrState === "failed"
                    ? "Failed"
                    : qrState === "cancelled"
                    ? "Cancelled"
                    : qrState === "waiting_for_scan"
                    ? "Waiting for scan"
                    : qrState === "ready"
                    ? "Ready to scan"
                    : "Generating"}
                </span>
                <span className={styles.timerLabel}>Expires in {formatTimeLeft(timeLeft)}</span>
              </div>

              <p className={styles.qrHelpText}>
                Open Phantom on your phone, scan the QR code, then approve the connection and signature request.
              </p>

              {qrError ? <div className={styles.errorBox}><p>{qrError}</p></div> : null}
            </div>

            <div className={styles.actionRow}>
              <button type="button" className={styles.secondaryButton} onClick={() => {
                resetQrState();
                setMode("options");
              }}>
                Back
              </button>

              {(qrState === "expired" || qrState === "failed" || qrState === "cancelled") ? (
                <button type="button" className={styles.primaryButton} onClick={beginQrFlow}>
                  <RefreshCw size={16} />
                  Regenerate QR
                </button>
              ) : (
                <button type="button" className={styles.secondaryButton} onClick={closeModal}>
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
