"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { motion } from "framer-motion";
import { Wallet, Droplets, TrendingUp, Activity, Plus, History, Shield, Eye, Gift, Copy, LogOut } from "lucide-react";
import { FaHorse, FaCoins, FaBitcoin, FaEthereum } from "react-icons/fa";
import Link from "next/link";
import StakingModal from "./StakingModal";
import NFTModal from "./NFTModal";
import PortfolioModal from "./PortfolioModal";
import { copyToClipboard } from "@/utils/clipboard";


const RedesignedDashboard = ({
  user,
  onLogout,
  onConnectPhantom,
  onDisconnectPhantom,
  phantomStatus,
  phantomLoading,
  phantomErrorCode,
  ledgerDetails,
  portfolioDetails,
  orbitCard1,
  orbitCard2,
  orbitCard3,
  orbitCard4,
  bottomCards,
  extraHubCard,
  nftTierLabel,
  onOpenAddLPModal,
  onOpenZeroRiskModal,
  onRedeem,
  ecosystemTotalBalance = 0,
  ecosystemDailyRewards = 0,
  ecosystemYieldPercent = "0.00",
  children
}) => {
  const lpWallet = ledgerDetails?.lpWallet || {};
  const lpBalance = parseFloat(lpWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2 });
  const lpAutopositioning = parseFloat(lpWallet?.autopositioning || "0").toLocaleString(undefined, { minimumFractionDigits: 2 });
  const lpPending = parseFloat(lpWallet?.pending || "0").toLocaleString(undefined, { minimumFractionDigits: 2 });


  const getRoi = (b) => {
    const val = parseFloat(b || 0);
    if (val >= 11000) return 0.6;
    if (val >= 5000) return 0.6;
    if (val >= 1000) return 0.5;
    if (val >= 9) return 0.5;
    return 0;
  };
  const lpRoi = getRoi(lpWallet?.balance);

  const internalVaultBalance = parseFloat(ledgerDetails?.bnbWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const primaryVaultBalance = internalVaultBalance;

  const zeroRiskBalance = parseFloat(ledgerDetails?.zeroRisk?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const zeroRiskLimit = zeroRiskBalance;

  // LP limit usage percentage
  const lpUsedRaw = parseFloat(lpWallet.used || "0");
  const lpLimitRaw = parseFloat(lpWallet.limit || "0");
  const lpPercent = lpLimitRaw > 0 ? Math.min((lpUsedRaw / lpLimitRaw) * 100, 100) : 0;

  const sparkles = React.useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${3 + Math.random() * 5}s`,
    delay: `${Math.random() * 5}s`,
    size: `${1 + Math.random() * 2}px`
  })), []);

  const phantomWalletAddress = user?.phantomWalletAddress || "";
  const shortPhantomAddress = phantomWalletAddress
    ? `${phantomWalletAddress.slice(0, 4)}...${phantomWalletAddress.slice(-4)}`
    : "";
  const hasPhantomWallet = phantomWalletAddress.length > 0;
  const walletButtonLabel = hasPhantomWallet
    ? `SOL: ${shortPhantomAddress}`
    : "Connect";

  const [mounted, setMounted] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const referralLink = (mounted && user?.username)
    ? `${window.location.origin}/sign-up?sponsorId=${user.username}`
    : "";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    if (!referralLink) return;
    copyToClipboard(referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!user?.username) return;
    copyToClipboard(user.username).then(() => {
      setCopySuccess("code");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyPhantomWallet = (e) => {
    e.stopPropagation();
    if (!phantomWalletAddress) return;
    copyToClipboard(phantomWalletAddress);
  };

  const [showInvestMenu, setShowInvestMenu] = React.useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = React.useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = React.useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = React.useState(false);
  const [showActiveAssetsTooltip, setShowActiveAssetsTooltip] = React.useState(false);

  const horseNFTCount = portfolioDetails?.summary 
    ? portfolioDetails.summary.totalNftAssetsCount 
    : (user?.nftPackages?.length || (user?.nftPackage ? 1 : 0));

  const stakingCount = portfolioDetails?.summary 
    ? portfolioDetails.summary.totalStakingAssetsCount 
    : (user?.stakingPlans?.length || 0);

  const totalActiveAssets = horseNFTCount + stakingCount;

  const stakingPlans = user?.stakingPlans || [];
  const totalStaked = stakingPlans.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  
  const calculateTotalRewards = () => {
    return stakingPlans.reduce((acc, p) => {
      const amt = parseFloat(p.amount || "0");
      const days = p.days || 0;
      let apy = 0;
      if (days >= 365) apy = 0.28;
      else if (days >= 180) apy = 0.22;
      else if (days >= 90) apy = 0.18;
      else if (days >= 30) apy = 0.10;
      return acc + (amt * apy * days / 365);
    }, 0);
  };

  const getEarliestUnlock = () => {
    if (stakingPlans.length === 0) return "--";
    const unlocks = stakingPlans.map(p => new Date(new Date(p.startDate).getTime() + (p.days || 0) * 86400000));
    const earliest = new Date(Math.min(...unlocks));
    return earliest.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const nftPackages = user?.nftPackages || [];
  const hasNft = Boolean(nftPackages.length > 0 || user?.nftPackage);
  const hasActiveInvestment = Boolean(hasNft || totalStaked > 0);
  return (
    <div className="min-h-screen bg-black text-white relative font-inter overflow-x-hidden">
      {/* Unified Top Header Actions */}
      <div className={styles.dashboardTopHeader}>
        {/* LEFT: Vault Pass (Invitation Link) */}
        <div className={styles.headerLeft}>
          <div
            className={styles.vaultPassCard}
            onClick={handleCopyLink}
            title="Click to copy invitation link"
          >
            <div className={styles.passHeader}>
              <span className={styles.passLabel}>INVITE &amp; EARN </span>
            </div>
            <div className={styles.passLinkWrapper}>
              <span className={styles.passUrl}>
                {copySuccess === "code"
                  ? "✓ CODE COPIED!"
                  : copySuccess
                    ? "✓ LINK COPIED!"
                    : "TAP TO COPY REFERRAL LINK"}
              </span>
              <button
                className={styles.passCopyBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
                title="Copy Invitation Link"
              >
                {copySuccess && copySuccess !== "code" ? <Activity size={12} color="#FFB800" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE: Primary Wallet */}
        {hasPhantomWallet ? (
          <div className={styles.headerCenter}>
            <div className={styles.headerWalletCard}>
              {orbitCard1}
            </div>
          </div>
        ) : null}

        {/* RIGHT: Action Buttons */}
        <div className={styles.topRightActions}>
          <div className={styles.headerActionsRow}>


            <button
              className={styles.redeemBtnTop}
              onClick={onRedeem}
            >
              <Gift size={14} />
              Redeem
            </button>

            <div className={styles.phantomWalletGroup}>
              <button
                type="button"
                className={`${styles.connectBtn} ${hasPhantomWallet ? styles.connectBtnConnected : ""}`}
                onClick={() => {
                  if (!hasPhantomWallet) {
                    onConnectPhantom?.();
                  }
                }}
                disabled={phantomLoading}
                title={hasPhantomWallet ? "Phantom Connected" : "Connect Phantom Wallet"}
              >
                <Wallet size={14} />
                <span className={styles.buttonLabel}>
                  {phantomLoading ? "Connecting..." : walletButtonLabel}
                </span>
                {hasPhantomWallet && (
                  <div className={styles.walletActions}>
                    <span onClick={handleCopyPhantomWallet} title="Copy Address">
                      <Copy size={11} />
                    </span>

                    {onDisconnectPhantom && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDisconnectPhantom?.();
                        }}
                        title="Disconnect Phantom Wallet"
                      >
                        <LogOut size={11} />
                      </span>
                    )}
                  </div>
                )}
              </button>

              {phantomStatus && !hasPhantomWallet && (
                <div className={styles.phantomStatusWrap}>
                  <span className={`${styles.phantomStatusText} ${phantomErrorCode ? styles.phantomStatusError : styles.phantomStatusSuccess}`}>
                    {phantomStatus}
                  </span>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Dynamic Background Elements */}
      <div className={styles.lightRaysContainer}>
        <div className={styles.lightRay}></div>
        <div className={styles.lightRay}></div>
        <div className={styles.lightRay}></div>
        <div className={styles.lightRay}></div>
      </div>
      <div className={styles.ambientGlow}></div>

      {/* Background Sparkles */}
      <div className={styles.sparklesContainer}>
        {mounted && sparkles.map((s) => (
          <div
            key={s.id}
            className={styles.sparkle}
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay
            }}
          ></div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainContentWrapper}>

        {/* ===== ROW 1: Horse NFT | Staking Engine | Community Wallet ===== */}
        <div className={styles.dashboardRow1}>

          {/* LEFT: Horse NFT Card / NFT Starter */}
          <div className={styles.row1Card}>
            {hasNft ? orbitCard2 : (
              <motion.div
                className={`${styles.investSelectionCard} ${styles.nftCard}`}
                onClick={() => setIsNftModalOpen(true)}
              >
                <div className={styles.multiWatermark}>
                  <FaHorse className={styles.horseObsidian} />
                  <FaHorse className={styles.horsePlatinum} />
                  <FaHorse className={styles.horseBronze} />
                  <FaHorse className={styles.horseSilver} />
                  <FaHorse className={styles.horseGold} />
                </div>
                <div className={styles.investCardContent}>
                  <div className={styles.investCardHeader}>
                    <div className={styles.investCardIcon}>
                      <FaHorse size={28} />
                    </div>
                  </div>
                  <h4>HORSE NFT</h4>
                  <p>Own premium Horse NFTs with fractional rewards. Secure your spot in the elite racing legacy with tiered assets.</p>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ background: 'rgba(255,184,0,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#FFB800' }}>ELITE ASSETS</div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#888' }}>DAILY ROI</div>
                  </div>
                  <button className={styles.investSelectBtn}>
                    <span>EXPLORE NFTs</span>
                    <span className={styles.btnArrow}>&rarr;</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* CENTER: Staking Engine Hub (Blue circle, black bg) */}
          <div className={styles.stakingHubWrapper}>
            <div className={styles.hubLabelOuter} style={{ color: "#ff5500", borderColor: "rgba(255,85,0,0.3)", position: 'relative', top: 'auto', left: 'auto', transform: 'none', marginBottom: 24 }}>
              <Activity size={13} />
              STAKING ENGINE
            </div>

            {/* The Blue Circle */}
            <div className={styles.stakingBlueCircle}>
              {/* Animated rings */}
              <div className={styles.blueRing1}></div>
              <div className={styles.blueRing2}></div>

              {/* Inner Content */}
              <div className={styles.stakingCircleInner}>
                <>
                  <div className={styles.hubAmount} style={{ color: "#ff5500", fontSize: 36 }}>
                    {ecosystemTotalBalance > 0 ? ecosystemTotalBalance.toLocaleString() : "0.00"}
                  </div>
                  <div className={styles.hubCurrency} style={{ letterSpacing: 4, marginBottom: 12 }}>ECOSYSTEM ASSETS</div>
                  <div className={styles.hubSeparator}></div>
                  <div className={styles.stakingStatsDetail} style={{ marginTop: 12 }}>
                    <div className={styles.statDetailItem}>
                      <span className={styles.statDetailLabel}>AVG. DAILY YIELD</span>
                      <span className={styles.statDetailValue} style={{ color: "#ff5500" }}>
                        {ecosystemYieldPercent}%
                      </span>
                    </div>
                    <div 
                      className={styles.statDetailItem}
                      onMouseEnter={() => setShowActiveAssetsTooltip(true)}
                      onMouseLeave={() => setShowActiveAssetsTooltip(false)}
                      style={{ position: 'relative', cursor: 'pointer' }}
                    >
                      <span className={styles.statDetailLabel}>ACTIVE ASSETS</span>
                      <span className={styles.statDetailValue}>
                        {totalActiveAssets}
                      </span>

                      {showActiveAssetsTooltip && (
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%) translateY(-10px)',
                            background: 'rgba(0, 0, 0, 0.95)',
                            border: '1px solid rgba(255, 85, 0, 0.4)',
                            boxShadow: '0 0 15px rgba(255, 85, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            zIndex: 100,
                            width: '180px',
                            pointerEvents: 'none',
                            backdropFilter: 'blur(10px)',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>Ecosystem Assets</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ff5500' }}></span>
                              Horse NFTs:
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff5500' }}>{horseNFTCount}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00ff00' }}></span>
                              Token Staking:
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#00ff00' }}>{stakingCount}</span>
                          </div>
                          <div 
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '6px solid rgba(0, 0, 0, 0.95)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.stakingProgressBox} style={{ marginTop: 12 }}>
                    <div className={styles.miniChart}>
                      <div className={styles.miniChartFill} style={{ width: ecosystemTotalBalance > 0 ? '65%' : '0%' }}></div>
                    </div>
                    <div className={styles.stakingDaysRemaining}>DIVERSIFIED PORTFOLIO</div>
                  </div>
                  <div className={styles.marketStatsRow} style={{ marginTop: 10 }}>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TODAY</span>
                      <span className={styles.marketValue} style={{ color: "#ff5500" }}>
                        +{ecosystemDailyRewards.toFixed(4)}
                      </span>
                    </div>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TOKEN</span>
                      <span className={styles.marketValue} style={{ color: "#00ff00" }}>$0.124 <TrendingUp size={10} /></span>
                    </div>
                  </div>

                  <button
                    className={styles.hubPortfolioBtn}
                    onClick={() => setIsPortfolioModalOpen(true)}
                  >
                    <History size={12} /> MY STAKES
                  </button>
                </>
              </div>
            </div>

            {/* Invest Button below circle */}
            {hasActiveInvestment && (
              <div className={styles.investNowContainer} style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', marginTop: 32, width: '100%' }}>
                <motion.button
                  className={styles.mainInvestBtn}
                  onClick={() => setShowInvestMenu(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  UPGRADE INVESTMENT
                </motion.button>
              </div>
            )}

            {/* Investment Selection Modal */}
            {showInvestMenu && (
              <div className={styles.investModalOverlay} onClick={() => setShowInvestMenu(false)}>
                <motion.div
                  className={styles.investModalContent}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                >
                  <button className={styles.investModalClose} onClick={() => setShowInvestMenu(false)}>✖</button>
                  <h3 className={styles.investModalTitle}>CHOOSE INVESTMENT TYPE</h3>
                  <p className={styles.investModalSubtitle}>Select an asset to start earning rewards</p>

                  <div className={styles.investCardsGrid}>
                    <motion.div
                      className={`${styles.investSelectionCard} ${styles.stakingCard}`}
                      onClick={() => {
                        setIsStakingModalOpen(true);
                        setShowInvestMenu(false);
                      }}
                    >
                      <div className={styles.multiWatermark}>
                        <FaBitcoin className={styles.tokenBitcoin1} />
                        <FaCoins className={styles.tokenCoins1} />
                        <FaEthereum className={styles.tokenEth} />
                        <FaCoins className={styles.tokenCoins2} />
                        <FaBitcoin className={styles.tokenBitcoin2} />
                      </div>
                      <div className={styles.investCardContent}>
                        <div className={styles.investCardHeader}>
                          <div className={styles.investCardIcon}>
                            <TrendingUp size={28} />
                          </div>
                        </div>
                        <h4>TOKEN STAKING</h4>
                        <p>Lock tokens to earn daily yields up to 28% APY.</p>
                        <button className={styles.investSelectBtn}>
                          <span>START STAKING</span>
                          <span className={styles.btnArrow}>&rarr;</span>
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      className={`${styles.investSelectionCard} ${styles.nftCard}`}
                      onClick={() => {
                        setIsNftModalOpen(true);
                        setShowInvestMenu(false);
                      }}
                    >
                      <div className={styles.multiWatermark}>
                        <FaHorse className={styles.horseObsidian} />
                        <FaHorse className={styles.horsePlatinum} />
                        <FaHorse className={styles.horseBronze} />
                        <FaHorse className={styles.horseSilver} />
                        <FaHorse className={styles.horseGold} />
                      </div>
                      <div className={styles.investCardContent}>
                        <div className={styles.investCardHeader}>
                          <div className={styles.investCardIcon}>
                            <FaHorse size={28} />
                          </div>
                        </div>
                        <h4>HORSE NFT</h4>
                        <p>Own premium Horse NFTs with fractional rewards.</p>
                        <button className={styles.investSelectBtn}>
                          <span>EXPLORE NFTs</span>
                          <span className={styles.btnArrow}>&rarr;</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* RIGHT: Community Wallet Card / Staking Starter */}
          <div className={styles.row1Card}>
            {totalStaked > 0 ? orbitCard3 : (
              <motion.div
                className={`${styles.investSelectionCard} ${styles.stakingCard}`}
                onClick={() => setIsStakingModalOpen(true)}
              >
                <div className={styles.multiWatermark}>
                  <FaBitcoin className={styles.tokenBitcoin1} />
                  <FaCoins className={styles.tokenCoins1} />
                  <FaEthereum className={styles.tokenEth} />
                  <FaCoins className={styles.tokenCoins2} />
                  <FaBitcoin className={styles.tokenBitcoin2} />
                </div>
                <div className={styles.investCardContent}>
                  <div className={styles.investCardHeader}>
                    <div className={styles.investCardIcon}>
                      <TrendingUp size={28} />
                    </div>
                  </div>
                  <h4>TOKEN STAKING</h4>
                  <p>Lock tokens to earn daily yields up to 28% APY. Experience sustainable growth with our elite staking engine.</p>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ background: 'rgba(255,85,0,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#ff5500' }}>28% APY</div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#888' }}>365 DAYS</div>
                  </div>
                  <button className={styles.investSelectBtn}>
                    <span>START STAKING</span>
                    <span className={styles.btnArrow}>&rarr;</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ===== ROW 2: Community Growth | Boost Wallet ===== */}
        <div className={styles.dashboardRow2}>
          <div className={styles.row2Card}>
            {extraHubCard} {/* Community Growth */}
          </div>
          <div className={styles.row2Card}>
            {orbitCard4} {/* Boost Wallet */}
          </div>
        </div>

        {/* Bottom Section: Bonus Cards */}
        <div className={styles.bottomCardsSection}>
          <div className={styles.staticFloatBottom}>
            {bottomCards}
          </div>
        </div>
      </div>

      {isStakingModalOpen && (
        <StakingModal
          isOpen={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
        />
      )}
      {isNftModalOpen && (
        <NFTModal
          isOpen={isNftModalOpen}
          onClose={() => setIsNftModalOpen(false)}
        />
      )}
      {isPortfolioModalOpen && (
        <PortfolioModal
          isOpen={isPortfolioModalOpen}
          onClose={() => setIsPortfolioModalOpen(false)}
          user={user}
        />
      )}

      {/* NFT Tier Footer Info */}
      {/* <div className={styles.nftStatusBar}>
        <div className={styles.nftStatusItem}>
          <Shield size={16} color={nftTierLabel && nftTierLabel !== 'NO ACTIVE PACKAGE' ? '#ffd700' : '#555'} />
          <span className={styles.nftStatusLabel}>ACTIVE NFT TIER:</span>
          <span
            className={styles.nftStatusValue}
            style={{
              color: nftTierLabel === 'PREMIUM PACK'  ? '#ffd700'
                   : nftTierLabel === 'GROWTH PACK'   ? '#00ff88'
                   : nftTierLabel === 'STARTER PACK'  ? '#4cc9f0'
                   : nftTierLabel === 'STAKING ACTIVE' ? '#f038ff'
                   : '#555'
            }}
          >
            {nftTierLabel || 'NO ACTIVE PACKAGE'}
          </span>
        </div>
        <div className={styles.statusGlowLine}></div>
      </div> */}
      {children}
    </div>
  );
};

export default RedesignedDashboard;
