export async function GET() {
  const explorerBase =
    process.env.NEXT_PUBLIC_BSC_EXPLORER_BASE_URL || "https://bscscan.com";

  return Response.json({
    user: {
      username: "xorgeioson",
      avatar: "/assets/img/avatar.png",
      referralLink: "https://BEPVault.io/referral/xorgeioson",
    },
    wallet: {
      swiftWallet: 0.0,
      systemWallet: "BSCScan",
      systemWalletLink: `${explorerBase}/address/0x0000000000000000000000000000000000000000`,
    },
    team: {
      directCommunity: 0,
      communitySize: 0,
      activeTier: 0,
    },
    token: {
      symbol: "USDT",
      currentPrice: 1.0,
      totalSupply: 0,
      change24h: 0,
      high: 1.0,
      low: 1.0,
      chartData: [],
    },
    airdrop: {
      status: "eligible",
      socialFollow: {
        youtube: true,
        telegram: false,
        instagram: true,
        twitter: false,
      },
    },
  });
}
