"use client";

import safeStorage from "@/utils/safeStorage";

const readJsonSafely = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Invalid server response.",
    };
  }
};

const withAuthHeaders = () => {
  const token = safeStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const postJson = async (url, body, headers) => {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {}),
  });

  const data = await readJsonSafely(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const createPhantomQrProvider = ({ API_URL }) => ({
  id: "phantom-qr",
  name: "Phantom QR",
  type: "qr",
  isAvailable() {
    return true;
  },
  async connect() {
    const data = await postJson(
      `${API_URL}/auth/phantom/qr/session`,
      {},
      withAuthHeaders()
    );

    return data.session;
  },
  async disconnect({ sessionId }) {
    if (!sessionId) return null;

    return postJson(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}/cancel`,
      {},
      withAuthHeaders()
    );
  },
  async signMessage() {
    throw new Error("QR session signing is handled by Phantom mobile.");
  },
  getPublicKey() {
    return "";
  },
  async getSession(sessionId) {
    const token = safeStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await readJsonSafely(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to fetch QR session.");
    }

    return data.session;
  },
  async bootstrap({ sessionId, sessionToken }) {
    const data = await postJson(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}/bootstrap`,
      { sessionToken },
      {
        "Content-Type": "application/json",
      }
    );

    return data.session;
  },
  async createChallenge({
    sessionId,
    sessionToken,
    walletAddress,
    phantomSession,
    phantomEncryptionPublicKey,
  }) {
    return postJson(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}/challenge`,
      {
        sessionToken,
        walletAddress,
        phantomSession,
        phantomEncryptionPublicKey,
      },
      {
        "Content-Type": "application/json",
      }
    );
  },
  async verify({ sessionId, sessionToken, signature }) {
    return postJson(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}/verify`,
      {
        sessionToken,
        signature,
      },
      {
        "Content-Type": "application/json",
      }
    );
  },
  async updateStatus({
    sessionId,
    sessionToken,
    status,
    errorCode,
    errorMessage,
  }) {
    return postJson(
      `${API_URL}/auth/phantom/qr/session/${encodeURIComponent(sessionId)}/status`,
      {
        sessionToken,
        status,
        errorCode,
        errorMessage,
      },
      {
        "Content-Type": "application/json",
      }
    );
  },
});
