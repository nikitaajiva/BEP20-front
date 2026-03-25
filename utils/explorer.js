const DEFAULT_EXPLORER =
  process.env.NEXT_PUBLIC_BSC_EXPLORER_BASE_URL || "https://bscscan.com";

const getTxUrl = (txHash) => `${DEFAULT_EXPLORER}/tx/${txHash}`;

export { DEFAULT_EXPLORER, getTxUrl };
