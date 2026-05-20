import { getApiUrl } from "../utils/getApiUrl";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text || "Invalid response format" };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const getHorseNftPackages = async () => {
  const res = await fetch(`${getApiUrl()}/horse-nft/packages`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const purchaseHorseNft = async (tierCode) => {
  const res = await fetch(`${getApiUrl()}/horse-nft/purchase`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ tierCode }),
  });
  return handleResponse(res);
};

export const getMyHorseNfts = async ({ page = 1, limit = 20, status } = {}) => {
  let url = `${getApiUrl()}/horse-nft/my?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getHorseNftPayoutHistory = async ({ page = 1, limit = 20 } = {}) => {
  const res = await fetch(`${getApiUrl()}/horse-nft/payout-history?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const adminGetHorseNftPackages = async () => {
  const res = await fetch(`${getApiUrl()}/admin/horse-nft/packages`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const adminUpdateHorseNftPackage = async (tierCode, payload) => {
  const res = await fetch(`${getApiUrl()}/admin/horse-nft/packages/${tierCode}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const adminGetHorseNftPurchases = async ({ page = 1, limit = 20, status, tierCode, userId } = {}) => {
  let url = `${getApiUrl()}/admin/horse-nft/purchases?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (tierCode) url += `&tierCode=${tierCode}`;
  if (userId) url += `&userId=${userId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const adminGetHorseNftPayouts = async ({ page = 1, limit = 20, status, tierCode, userId } = {}) => {
  let url = `${getApiUrl()}/admin/horse-nft/payouts?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (tierCode) url += `&tierCode=${tierCode}`;
  if (userId) url += `&userId=${userId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const adminRunHorseNftPayout = async ({ dryRun, userHorseNftId } = {}) => {
  const res = await fetch(`${getApiUrl()}/admin/horse-nft/run-payout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ dryRun, userHorseNftId }),
  });
  return handleResponse(res);
};
