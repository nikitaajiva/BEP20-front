const MAINNET_CHAIN_ID = "0x38";
const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_BSC_CHAIN_ID || MAINNET_CHAIN_ID;
const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || "";
const DEFAULT_BLOCK_EXPLORER =
  process.env.NEXT_PUBLIC_BSC_EXPLORER_BASE_URL ||
  "https://bscscan.com";

const USDT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || "";

const ADDRESS_PAD = 64;
const TRANSFER_SELECTOR = "0xa9059cbb";
const BALANCE_OF_SELECTOR = "0x70a08231";
const DECIMALS_SELECTOR = "0x313ce567";

function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

function padHex(hex, length = ADDRESS_PAD) {
  return hex.toLowerCase().replace(/^0x/, "").padStart(length, "0");
}

function toHex(value) {
  return "0x" + value.toString(16);
}

async function requestAccounts() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) {
    throw new Error("No wallet accounts available.");
  }
  return accounts;
}

async function switchToBsc(chainId = DEFAULT_CHAIN_ID) {
  if (chainId !== MAINNET_CHAIN_ID) {
    throw new Error("Only BSC mainnet (chainId 0x38) is supported.");
  }
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  const currentChainId = await ethereum.request({ method: "eth_chainId" });
  if (currentChainId === chainId) return;
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (error) {
    if (error.code !== 4902) {
      throw error;
    }
    if (!DEFAULT_RPC_URL) {
      throw new Error("BSC RPC URL is not configured.");
    }
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: "Binance Smart Chain",
          rpcUrls: [DEFAULT_RPC_URL],
          nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
          },
          blockExplorerUrls: [DEFAULT_BLOCK_EXPLORER],
        },
      ],
    });
  }
}

async function readTokenDecimals() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  const result = await ethereum.request({
    method: "eth_call",
    params: [
      {
        to: USDT_CONTRACT_ADDRESS,
        data: DECIMALS_SELECTOR,
      },
      "latest",
    ],
  });
  return parseInt(result, 16);
}

function parseUnits(amount, decimals) {
  const [whole, fraction = ""] = amount.toString().split(".");
  const sanitizedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const value = BigInt(whole + sanitizedFraction);
  return value;
}

function formatUnits(value, decimals) {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

async function readUsdtBalance(address) {
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  const decimals = await readTokenDecimals();
  const data = BALANCE_OF_SELECTOR + padHex(address);
  const result = await ethereum.request({
    method: "eth_call",
    params: [
      {
        to: USDT_CONTRACT_ADDRESS,
        data,
      },
      "latest",
    ],
  });
  const value = BigInt(result);
  return formatUnits(value, decimals);
}

async function sendUsdtTransfer({ from, to, amount }) {
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  const decimals = await readTokenDecimals();
  const value = parseUnits(amount, decimals);
  const data =
    TRANSFER_SELECTOR +
    padHex(to) +
    padHex(toHex(value), ADDRESS_PAD);

  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");

  const txHash = await ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: USDT_CONTRACT_ADDRESS,
        data,
        value: "0x0",
      },
    ],
  });
  return txHash;
}

export {
  DEFAULT_CHAIN_ID,
  DEFAULT_BLOCK_EXPLORER,
  USDT_CONTRACT_ADDRESS,
  getEthereum,
  requestAccounts,
  switchToBsc,
  readUsdtBalance,
  sendUsdtTransfer,
};
