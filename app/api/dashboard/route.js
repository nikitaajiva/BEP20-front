export async function GET() {
  return Response.json({
    user: {
      username: "xorgeioson",
      avatar: "/assets/img/avatar.png",
      referralLink: "https://BEPVault.io/referral/xorgeioson"
    },
    wallet: {
      swiftWallet: 0.0000,
      systemWallet: "XRPSCAN",
      systemWalletLink: "https://xrpscan.com/account/rBntsdo3fAS5sb3pqe7LvvxTS8qngFYAe1"
    },
    team: {
      directCommunity: 0,
      communitySize: 0,
      activeTier: 0
    },
    xrp: {
      currentPrice: 2.2988,
      totalSupply: 99986107098,
      change24h: -0.0466,
      high: 2.3359,
      low: 2.2664,
      chartData: []
    },
    airdrop: {
      status: "eligible",
      socialFollow: {
        youtube: true,
        telegram: false,
        instagram: true,
        twitter: false
      }
    }
  });
} 