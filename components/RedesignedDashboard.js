"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { motion } from "framer-motion";
import { Wallet, Droplets, TrendingUp, Activity, Plus, History, Shield, Eye, Gift, Copy } from "lucide-react";
import Link from "next/link";

const RedesignedDashboard = ({ 
  user, 
  walletAccount,
  onWalletConnect,
  onOpenAddLPModal,
  onOpenZeroRiskModal,
  onRedeem,
  ledgerDetails,
  orbitCard1,
  orbitCard2,
  orbitCard3,
  orbitCard4,
  children
}) => {
  const lpWallet = ledgerDetails?.lpWallet || {};
  const lpBalance = parseFloat(lpWallet.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lpUsed = parseFloat(lpWallet.used || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lpLimit = parseFloat(lpWallet.limit || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const autopositioningValue = parseFloat(lpWallet.autopositioning || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const primaryVaultBalance = parseFloat(ledgerDetails?.usdtWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  const shortAddress = walletAccount
    ? `${walletAccount.slice(0, 6)}...${walletAccount.slice(-4)}`
    : "";

  const [mounted, setMounted] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);

  const referralLink = (mounted && user?.username)
    ? `${window.location.protocol}//${window.location.host}/sign-up?sponsorId=${user.username}`
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
          </div>
          <div className={styles.passLinkWrapper}>
            <span className={styles.passUrl}>
              {copySuccess ? "LINK COPIED! SHARE WITH YOUR TEAM" : "CLICK TO COPY REFERRAL LINK"}
            </span>
            <button 
              className={styles.passCopyBtn} 
              title="Copy Invitation Link"
            >
              {copySuccess ? <Activity size={12} color="#7FFF4C" /> : <Copy size={12} />}
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
            className={styles.connectBtn}
            onClick={onWalletConnect}
            title="Connect Wallet"
          >
            <Wallet size={14} />
            {walletAccount ? shortAddress : "Connect Wallet"}
            {walletAccount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(walletAccount);
                  }} 
                  style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: '#aaa' }}
                  title="Copy Address"
                >
                  <Copy size={12} />
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onWalletConnect) onWalletConnect();
                  }} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '2px',
                    borderRadius: '4px'
                  }}
                  title="Add Funds"
                >
                  <Plus size={12} />
                </span>
              </div>
            )}
          </button>
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

      <div className={styles.staticFloatTop}>
        {orbitCard4} {/* Boost Wallet */}
      </div>
      <div className={styles.staticFloatLeft}>
        {orbitCard2} {/* Stable Pool */}
      </div>
      <div className={styles.staticFloatRight}>
        {orbitCard3} {/* Rewards Wallet */}
      </div>
      <div className={styles.staticFloatBottom}>
        {orbitCard1} {/* Primary Vault */}
      </div>

      {/* Central Hub */}
      <div className={styles.centralDashboard}>
        {/* Orbital Motion Background Nodes */}
        <div className={styles.orbitArea}>
          <div className={styles.orbitDot + " " + styles.largeDot}></div>
          <div className={styles.orbitDot + " " + styles.smallDot}></div>
        </div>

        <div className={styles.orbitPath + " " + styles.orbitPath1}></div>
        <div className={styles.orbitPath + " " + styles.orbitPath2}></div>

        {/* Core Hub */}
        <div className={styles.hubWrapper}>
          <div className={styles.techRing + " " + styles.ring1}></div>
          <div className={styles.techRing + " " + styles.ring2}></div>

          <div className={styles.mainCircle}>
            {/* LP Icon + Title */}
            <div className={styles.hubLabel}>
              <Droplets size={13} />
              LIQUIDITY POOL
              <Link href="/dashboard/history/lp" className={styles.historyEyeBtn} title="View LP History">
                <Eye size={15} />
              </Link>
            </div>

            {/* LP Balance - Main number */}
            <div className={styles.hubAmount}>{lpBalance}</div>
            <div className={styles.hubCurrency}>USDT</div>

            {/* LP Stats Grid */}
            <div className={styles.lpStatsGrid}>
              <div className={styles.lpStatItem}>
                <TrendingUp size={10} className={styles.lpStatIcon} />
                <span className={styles.lpStatLabel}>Used</span>
                <span className={styles.lpStatValue}>{lpUsed}</span>
              </div>
              <div className={styles.lpStatDivider}></div>
              <div className={styles.lpStatItem}>
                <Activity size={10} className={styles.lpStatIcon} />
                <span className={styles.lpStatLabel}>Limit</span>
                <span className={styles.lpStatValue}>{lpLimit}</span>
              </div>
            </div>

            {/* LP Progress Arc */}
            <div className={styles.lpProgressBar}>
              <div
                className={styles.lpProgressFill}
                style={{ width: `${lpPercent}%` }}
              ></div>
            </div>

            {/* Add Funds Action Button - Repositioned inside circle at bottom */}
            <motion.button 
              className={styles.addFundsHubBtn} 
              onClick={onOpenAddLPModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={14} strokeWidth={3} />
              Add Liquid
            </motion.button>


          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default RedesignedDashboard;
