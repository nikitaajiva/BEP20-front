"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { motion } from "framer-motion";
import { Wallet, Droplets, TrendingUp, Activity, Plus, History, Shield, Eye, Gift, Copy, LogOut } from "lucide-react";
import { FaHorse } from "react-icons/fa";
import Link from "next/link";
import StakingModal from "./StakingModal";
import NFTModal from "./NFTModal";

const RedesignedDashboard = ({
  user,
  onLogout,
  onConnectPhantom,
  phantomStatus,
  phantomLoading,
  phantomErrorCode,
  ledgerDetails,
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
  const [randomCode, setRandomCode] = React.useState("");

  const generateRandomCode = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const all = upper + lower + digits;
    const rand = (set) => set[Math.floor(Math.random() * set.length)];
    return [
      rand(upper), rand(upper),
      rand(digits), rand(digits),
      rand(all), rand(all), rand(all), rand(all),
      rand(lower), rand(lower)
    ].join("");
  };

  const referralLink = (mounted && user?.username)
    ? `${window.location.origin}/sign-up?sponsorId=${user.username}`
    : "";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    const code = generateRandomCode();
    setRandomCode(code);
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!user?.username) return;
    navigator.clipboard.writeText(user.username).then(() => {
      setCopySuccess("code");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyPhantomWallet = (e) => {
    e.stopPropagation();
    if (!phantomWalletAddress) return;
    navigator.clipboard.writeText(phantomWalletAddress);
  };

  const [showInvestMenu, setShowInvestMenu] = React.useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = React.useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = React.useState(false);

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
                    ? `✓ COPIED: ${randomCode}`
                    : "TAP TO COPY REFERRAL LINK"}
              </span>
              <button
                className={styles.passCopyBtn}
                onClick={handleCopyLink}
                title="Copy Invitation Link"
              >
                {copySuccess && copySuccess !== "code" ? <Activity size={12} color="#FFB800" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE: Primary Wallet */}
        <div className={styles.headerCenter}>
          <div className={styles.headerWalletCard}>
            {orbitCard1}
          </div>
        </div>

        {/* RIGHT: Action Buttons */}
        <div className={styles.topRightActions}>
          <div className={styles.headerActionsRow}>
            {user?.userType === "superadmin" && (
              <Link href="/support/dashboard" className={styles.supportAdminBtn}>
                <Shield size={14} />
                Support
              </Link>
            )}

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

            {/* Logout Button */}
            {onLogout && (
              <button className={styles.logoutBtn} onClick={onLogout} title="Logout">
                <LogOut size={14} />
              </button>
            )}
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

          {/* LEFT: Horse NFT Card */}
          <div className={styles.row1Card}>
            {orbitCard2}
          </div>

          {/* CENTER: Staking Engine Hub (Blue circle, black bg) */}
          <div className={styles.stakingHubWrapper}>
            {/* Label */}
            <div className={styles.hubLabelOuter} style={{ color: "#00f2ff", borderColor: "rgba(0,242,255,0.3)", position: 'relative', top: 'auto', left: 'auto', transform: 'none', marginBottom: 24 }}>
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
                  <div className={styles.hubAmount} style={{ color: "#00f2ff", fontSize: 36 }}>
                    {parseFloat(user?.stakingPlan?.amount || "0") > 0 ? parseFloat(user.stakingPlan.amount).toLocaleString() : "0.00"}
                  </div>
                  <div className={styles.hubCurrency} style={{ letterSpacing: 4, marginBottom: 12 }}>TOKING</div>
                  <div className={styles.hubSeparator}></div>
                  <div className={styles.stakingStatsDetail} style={{ marginTop: 12 }}>
                    <div className={styles.statDetailItem}>
                      <span className={styles.statDetailLabel}>EST. REWARDS</span>
                      <span className={styles.statDetailValue} style={{ color: "#00f2ff" }}>
                        +{(parseFloat(user?.stakingPlan?.amount || "0") * 0.28).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.statDetailItem}>
                      <span className={styles.statDetailLabel}>UNLOCKS ON</span>
                      <span className={styles.statDetailValue}>
                        {user?.stakingPlan?.startDate ? new Date(new Date(user.stakingPlan.startDate).getTime() + (user.stakingPlan.days || 0) * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.stakingProgressBox} style={{ marginTop: 12 }}>
                    <div className={styles.miniChart}>
                      <div className={styles.miniChartFill} style={{ width: user?.stakingPlan?.days ? '35%' : '0%' }}></div>
                    </div>
                    <div className={styles.stakingDaysRemaining}>{user?.stakingPlan?.days || 0} DAY LOCK</div>
                  </div>
                  <div className={styles.marketStatsRow} style={{ marginTop: 10 }}>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TODAY</span>
                      <span className={styles.marketValue} style={{ color: "#00f2ff" }}>
                        +{(parseFloat(user?.stakingPlan?.amount || "0") * 0.28 / 365).toFixed(4)}
                      </span>
                    </div>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TOKEN</span>
                      <span className={styles.marketValue} style={{ color: "#00ff00" }}>$0.124 <TrendingUp size={10} /></span>
                    </div>
                  </div>
                </>
              </div>
            </div>

            {/* Invest Button below circle */}
            <div className={styles.investNowContainer} style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', marginTop: 32, width: '100%' }}>
              <motion.button
                className={styles.mainInvestBtn}
                onClick={() => setShowInvestMenu(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                INVEST NOW
              </motion.button>
            </div>

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
                  <p className={styles.investModalSubtitle}>Select a vehicle to start earning rewards</p>

                  <div className={styles.investCardsGrid}>
                    <motion.div
                      className={styles.investSelectionCard}
                      onClick={() => {
                        setIsStakingModalOpen(true);
                        setShowInvestMenu(false);
                      }}
                      whileHover={{ y: -5, borderColor: '#00f2ff' }}
                    >
                      <div className={`${styles.investCardIcon} ${styles.iconStaking}`}>
                        <TrendingUp size={40} />
                      </div>
                      <h4>TOKEN STAKING</h4>
                      <p>Lock tokens to earn daily yields up to 28% APY.</p>
                      <button className={styles.investSelectBtn}>SELECT</button>
                    </motion.div>

                    <motion.div
                      className={styles.investSelectionCard}
                      onClick={() => {
                        setIsNftModalOpen(true);
                        setShowInvestMenu(false);
                      }}
                      whileHover={{ y: -5, borderColor: '#ffd700' }}
                    >
                      <div className={`${styles.investCardIcon} ${styles.iconNft}`}>
                        <FaHorse size={40} />
                      </div>
                      <h4>HORSE NFT</h4>
                      <p>Own premium Horse NFTs with fractional rewards.</p>
                      <button className={`${styles.investSelectBtn} ${styles.btnNft}`}>SELECT</button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* RIGHT: Community Wallet Card */}
          <div className={styles.row1Card}>
            {orbitCard3}
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

      <StakingModal
        isOpen={isStakingModalOpen}
        onClose={() => setIsStakingModalOpen(false)}
      />
      <NFTModal
        isOpen={isNftModalOpen}
        onClose={() => setIsNftModalOpen(false)}
      />

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
