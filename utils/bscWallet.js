import { ethers } from "ethers";

const MAINNET_CHAIN_ID = "0x38";
const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_BSC_CHAIN_ID || MAINNET_CHAIN_ID;
const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || "";
const DEFAULT_BLOCK_EXPLORER =
  process.env.NEXT_PUBLIC_BSC_EXPLORER_BASE_URL || "https://bscscan.com";

const USDT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || "";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
];

function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

function getProvider() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  return new ethers.BrowserProvider(ethereum);
}

async function assertBscMainnet() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not available.");
  const chainId = await ethereum.request({ method: "eth_chainId" });
  if (chainId !== MAINNET_CHAIN_ID) {
    throw new Error("Please switch to BSC mainnet (chainId 0x38).");
  }
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
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  await assertBscMainnet();
  const provider = getProvider();
  const usdt = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
  return Number(await usdt.decimals());
}

async function readUsdtBalance(address) {
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  await assertBscMainnet();
  const provider = getProvider();
  const usdt = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
  const [decimals, balance] = await Promise.all([
    usdt.decimals(),
    usdt.balanceOf(address),
  ]);
  return ethers.formatUnits(balance, decimals);
}

async function sendUsdtTransfer({ from, to, amount }) {
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT contract address is not configured.");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid USDT amount.");
  }
  if (!ethers.isAddress(to)) {
    throw new Error("Invalid destination address.");
  }
  await assertBscMainnet();
  const provider = getProvider();
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  if (from && signerAddress.toLowerCase() !== from.toLowerCase()) {
    throw new Error("Connected wallet does not match the selected account.");
  }
  const usdt = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
  const decimals = await usdt.decimals();
  const value = ethers.parseUnits(amount.toString(), decimals);
  const tx = await usdt.transfer(to, value);
  return tx.hash;
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
