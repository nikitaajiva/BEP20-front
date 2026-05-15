"use client";

import {
  getPhantomProvider,
  PHANTOM_DOWNLOAD_URL,
} from "@/utils/phantomWallet";

export const createPhantomExtensionProvider = ({
  connectPhantomWallet,
  disconnectPhantomWallet,
}) => ({
  id: "phantom-extension",
  name: "Phantom Extension",
  type: "extension",
  installUrl: PHANTOM_DOWNLOAD_URL,
  isAvailable() {
    return Boolean(getPhantomProvider());
  },
  async connect() {
    return connectPhantomWallet();
  },
  async disconnect() {
    return disconnectPhantomWallet();
  },
  async signMessage(message) {
    const provider = getPhantomProvider();
    if (!provider?.signMessage) {
      throw new Error("Phantom extension is not available.");
    }

    const encodedMessage =
      typeof message === "string" ? new TextEncoder().encode(message) : message;

    return provider.signMessage(encodedMessage, "utf8");
  },
  getPublicKey() {
    const provider = getPhantomProvider();
    return provider?.publicKey?.toString?.() || "";
  },
});
