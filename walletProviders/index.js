"use client";

import { createPhantomExtensionProvider } from "./phantomExtension";
import { createPhantomQrProvider } from "./phantomQr";

export {
  createPhantomExtensionProvider,
  createPhantomQrProvider,
};

export const createWalletProviders = ({
  API_URL,
  connectPhantomWallet,
  disconnectPhantomWallet,
}) => ({
  phantomExtension: createPhantomExtensionProvider({
    connectPhantomWallet,
    disconnectPhantomWallet,
  }),
  phantomQr: createPhantomQrProvider({
    API_URL,
  }),
});
