"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { motion } from "framer-motion";
import { Wallet, Droplets, TrendingUp, Activity, Plus, History, Shield, Eye, Gift, Copy } from "lucide-react";
import { FaHorse } from "react-icons/fa";
import Link from "next/link";
import StakingModal from "./StakingModal";
import NFTModal from "./NFTModal";

const RedesignedDashboard = ({
  user,
  walletAccount,
  onWalletConnect,
  onWalletDisconnect,
  onOpenAddLPModal,
  onOpenZeroRiskModal,
  onRedeem,
  ledgerDetails,
  orbitCard1,
  orbitCard2,
  orbitCard3,
  orbitCard4,
  bottomCards,
  extraHubCard,
  onConnectPhantom,
  phantomStatus,
  phantomLoading,
  phantomErrorCode,
  shortAddress: shortAddressProp,
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
  const hasWallet = walletAccount && walletAccount.trim().length > 0;
  const shortAddress = hasWallet
    ? `${walletAccount.slice(0, 6)}...${walletAccount.slice(-4)}`
    : "";

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
    navigator.clipboard.writeText(referralLink).then(() => {
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

  const [showInvestMenu, setShowInvestMenu] = React.useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = React.useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = React.useState(false);

  return (
    <div className={styles.hubContentWrapper}>
      {/* Unified Top Header Actions */}
      <div className={styles.dashboardTopHeader}>
        {/* Vault Pass (Invitation Link) - Left */}
        <div
          className={styles.vaultPassCard}
          onClick={handleCopyLink}
          style={{ cursor: 'pointer' }}
          title="Click to copy invitation link"
        >
          <div className={styles.passHeader}>
            <span className={styles.passLabel}>INVITE FRIENDS & EARN REWARDS</span>
            <div className={styles.inviteCodeBadge} onClick={handleCopyCode} title="Click to copy invite code">
              CODE: {user?.username || "---"}
            </div>
          </div>
          <div className={styles.passLinkWrapper}>
            <span className={styles.passUrl}>
              {copySuccess === "code"
                ? "CODE COPIED!"
                : copySuccess
                  ? "LINK COPIED! SHARE WITH TEAM"
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

        {/* Action Group - Right */}
        <div className={styles.topRightActions}>
          <div className={styles.headerBalanceWrapper}>
            <span className={styles.headerBalanceLabel}>Redeemable Balance:</span>
            <span className={styles.headerBalanceValue}>
              {parseFloat(ledgerDetails?.communityRewards?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </span>
          </div>
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
          <button
            type="button"
            className={styles.connectBtn}
            disabled={phantomLoading || Boolean(user?.phantomWalletAddress)}
            onClick={user?.phantomWalletAddress || phantomLoading ? undefined : onConnectPhantom}
            title={user?.phantomWalletAddress ? "Phantom Connected" : "Connect Wallet"}
          >
            <Wallet size={14} />
            {user?.phantomWalletAddress
              ? `SOL: ${user.phantomWalletAddress.slice(0, 4)}...${user.phantomWalletAddress.slice(-4)}`
              : phantomLoading
                ? "Connecting..."
                : "Connect Wallet"}
          </button>

          {phantomStatus && !user?.phantomWalletAddress && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', color: phantomErrorCode ? "#ff6666" : "#7FFF4C", textAlign: 'center', maxWidth: '200px' }}>
                {phantomStatus}
              </span>
              {phantomErrorCode && (
                <span style={{ fontSize: '9px', color: '#ffaaaa', textAlign: 'center', maxWidth: '200px', lineHeight: '1.2' }}>
                  Open Phantom, unlock or set up your wallet, then try again.
                  <br />
                  If Phantom keeps failing, check "Connected Apps" in Phantom settings and remove localhost.
                </span>
              )}
            </div>
          )}
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

      {/* Actions moved to Header */}

      <div className={styles.absoluteTop}>
        {orbitCard1} {/* Primary Wallet */}
      </div>

      <div className={styles.staticFloatTop}>
        {bottomCards}
      </div>
      <div className={styles.staticFloatLeft}>
        <div className={styles.orbitCardLeftTop}>
          {orbitCard2} {/* Stable Pool */}
        </div>
        <div className={styles.orbitCardLeftBottom}>
          {orbitCard3} {/* Community Wallet */}
        </div>
      </div>
      <div className={styles.staticFloatRight}>
        <div className={styles.orbitCardRightTop}>
          {orbitCard4} {/* Boost Wallet & Analytics */}
        </div>
        <div className={styles.orbitCardRightBottom}>
          {extraHubCard} {/* Community Growth */}
        </div>
      </div>


      {/* Central Hub */}
      <div className={styles.centralDashboard}>
        {/* Animated Fire Horse Background */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 420, height: 340, pointerEvents: 'none',
          opacity: 0.08, zIndex: 2,
          animation: 'horseFloat 6s ease-in-out infinite',
          color: '#ff6600',
          filter: 'drop-shadow(0 0 30px #ff6600)',
        }}>
          <svg viewBox="0 0 200 160" style={{ width: '100%', height: '100%', fill: 'currentColor' }}>
            {/* Body */}
            <ellipse cx="100" cy="95" rx="48" ry="30"/>
            {/* Neck */}
            <path d="M130,80 C136,63 140,50 132,38 C125,28 113,27 109,33 C105,40 109,55 112,65 C116,72 124,76 130,80Z"/>
            {/* Head */}
            <path d="M122,44 C120,36 116,27 110,23 C104,18 98,19 95,24 C92,29 94,37 97,43 C101,49 109,50 115,47Z"/>
            {/* Ear */}
            <path d="M107,21 C105,15 102,12 104,10 C106,8 110,11 109,16Z"/>
            {/* Eye */}
            <circle cx="105" cy="32" r="2.5"/>
            {/* Nostril */}
            <ellipse cx="96" cy="40" rx="2" ry="1.5"/>
            {/* Front Legs */}
            <rect x="93" y="118" width="11" height="36" rx="5"/>
            <rect x="110" y="116" width="11" height="38" rx="5"/>
            {/* Back Legs */}
            <rect x="72" y="118" width="11" height="36" rx="5"/>
            <rect x="55" y="116" width="11" height="38" rx="5"/>
            {/* Tail */}
            <path d="M55,92 C44,98 33,110 30,122 C28,130 34,136 41,133 C46,116 52,104 55,92Z"/>
            {/* Mane streaks */}
            <path d="M112,65 C120,57 125,45 122,34 C128,40 131,52 128,64 C124,72 117,74 112,72Z" style={{ opacity: 0.6 }}/>
          </svg>
        </div>
        <style>{`
          @keyframes horseFloat {
            0%, 100% { transform: translate(-50%, -60%) translateY(0px) scaleX(1); }
            25% { transform: translate(-50%, -60%) translateY(-12px) scaleX(1.01); }
            50% { transform: translate(-50%, -60%) translateY(-5px) scaleX(0.99); }
            75% { transform: translate(-50%, -60%) translateY(-15px) scaleX(1.01); }
          }
        `}</style>
        {/* Orbital Motion Background Nodes */}
        <div className={styles.orbitArea}>
          <div className={styles.orbitDot + " " + styles.largeDot}></div>
          <div className={styles.orbitDot + " " + styles.smallDot}></div>
        </div>

        <div className={styles.orbitPath + " " + styles.orbitPath1}></div>
        <div className={styles.orbitPath + " " + styles.orbitPath2}></div>
        <div className={styles.orbitPath + " " + styles.orbitPath3}></div>

        {/* Focused Single Core Engine Wrapper */}
        <div className={styles.dualCoreWrapper} style={{ gap: 0 }}>
          
          {/* CENTER CORE: STAKING ENGINE */}
          <div className={`${styles.hubWrapper} ${styles.stakingCore}`}>
            <div className={styles.techRing + " " + styles.ringStaking}></div>
            <div className={`${styles.mainCircle} ${styles.stakingCircle}`}>
              <div className={styles.hubLabelOuter} style={{ color: "#00f2ff", borderColor: "rgba(0,242,255,0.3)" }}>
                <Activity size={13} />
                STAKING ENGINE
              </div>
              
              {user?.stakingPlan?.days ? (
                <div className={styles.stakingHubCore}>
                  {/* Primary Balance Header */}
                  <div className={styles.primaryBalanceWrap}>
                    <div className={styles.hubAmount} style={{ color: "#00f2ff", fontSize: 38, marginBottom: -5 }}>
                      {parseFloat(user.stakingPlan.amount).toLocaleString()}
                    </div>
                    <div className={styles.hubCurrency} style={{ letterSpacing: 4 }}>TOKING</div>
                  </div>
                  
                  <div className={styles.hubSeparator}></div>

                  {/* Growth Analytics Grid */}
                  <div className={styles.stakingStatsDetail}>
                    <div className={styles.statDetailItem}>
                      <span className={styles.statDetailLabel}>EST. REWARDS</span>
                      <span className={styles.statDetailValue} style={{ color: "#00f2ff" }}>+{(user.stakingPlan.amount * 0.28).toFixed(2)}</span>
                    </div>
                    <div className={styles.statDetailItem}>
                      <span className={styles.statDetailLabel}>UNLOCKS ON</span>
                      <span className={styles.statDetailValue}>
                        {new Date(new Date(user.stakingPlan.startDate).getTime() + user.stakingPlan.days * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Progressive Lock Bar */}
                  <div className={styles.stakingProgressBox}>
                    <div className={styles.miniChart}>
                      <div className={styles.miniChartFill} style={{ width: '35%' }}></div>
                    </div>
                    <div className={styles.stakingDaysRemaining}>
                      {user.stakingPlan.days} DAY LOCK ENGINE
                    </div>
                  </div>

                  {/* Market Insights Footer */}
                  <div className={styles.marketStatsRow}>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TODAY</span>
                      <span className={styles.marketValue} style={{ color: "#00f2ff" }}>+{(user.stakingPlan.amount * 0.28 / 365).toFixed(4)}</span>
                    </div>
                    <div className={styles.marketStat}>
                      <span className={styles.marketLabel}>TOKEN VALUE</span>
                      <span className={styles.marketValue} style={{ color: "#00ff00" }}>
                        $0.124 <TrendingUp size={10} style={{ marginBottom: -2 }} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.noStakeWrapper}>
                  <div className={styles.hubAmount} style={{ fontSize: 24, color: "#444" }}>INACTIVE</div>
                  <div className={styles.inactiveNote}>ENGINE READY</div>
                </div>
              )}
            </div>

            {/* NEW INVEST NOW SECTION */}
            <div className={styles.investNowContainer}>
              <motion.button 
                className={styles.mainInvestBtn}
                onClick={() => setShowInvestMenu(!showInvestMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showInvestMenu ? "CLOSE MENU" : "INVEST NOW"}
              </motion.button>

              {showInvestMenu && (
                <motion.div 
                  className={styles.investSubMenu}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div 
                    onClick={() => setIsStakingModalOpen(true)} 
                    className={styles.subMenuBtn}
                    style={{ cursor: 'pointer' }}
                  >
                    <TrendingUp size={16} />
                    <span>TOKEN STAKING</span>
                    {user?.stakingPlan?.days && <span className={styles.miniUpgrade}>UPGRADE</span>}
                  </div>
                  <div 
                    onClick={() => setIsNftModalOpen(true)} 
                    className={styles.subMenuBtn + " " + styles.subMenuBtnNft}
                    style={{ cursor: 'pointer' }}
                  >
                    <FaHorse size={16} />
                    <span>HORSE NFT</span>
                    {user?.nftPackage && <span className={styles.miniUpgrade}>UPGRADE</span>}
                  </div>
                </motion.div>
              )}
            </div>
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
      <div className={styles.nftStatusBar}>
        <div className={styles.nftStatusItem}>
          <Shield size={16} color="#ffd700" />
          <span className={styles.nftStatusLabel}>ACTIVE NFT TIER:</span>
          <span className={styles.nftStatusValue}>
            {user?.stakingPlan?.days ? "GOLD ELITE" : "BRONZE BASIC"}
          </span>
        </div>
        <div className={styles.statusGlowLine}></div>
      </div>
      {children}
    </div>
  );
};

export default RedesignedDashboard;
