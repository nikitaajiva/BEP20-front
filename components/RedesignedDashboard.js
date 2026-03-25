"use client";
import React from "react";
import styles from "./RedesignedDashboard.module.css";
import { motion } from "framer-motion";
import { Wallet, Droplets, TrendingUp, Activity, Plus, History, Shield, Eye, Gift, Copy } from "lucide-react";
import Link from "next/link";

const RedesignedDashboard = ({
  user,
  xummAccount,
  onXummLogin,
  onXummLogout,
  onOpenAddLPModal,
  onOpenZeroRiskModal,
  onRedeem,
  ledgerDetails,
  orbitCard1,
  orbitCard2,
  orbitCard3,
  children
}) => {
  const lpWallet = ledgerDetails?.lpWallet || {};
  const lpBalance = parseFloat(lpWallet.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lpUsed = parseFloat(lpWallet.used || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lpLimit = parseFloat(lpWallet.limit || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const autopositioningValue = parseFloat(lpWallet.autopositioning || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const xamanBalance = parseFloat(ledgerDetails?.xamanWallet?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const zeroRiskBalance = parseFloat(ledgerDetails?.zeroRisk?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const zeroRiskLimit = parseFloat(ledgerDetails?.zeroRisk?.limit || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  return (
    <div className={styles.hubContentWrapper}>
      {/* Background Sparkles */}
      <div className={styles.sparklesContainer}>
        {sparkles.map((s) => (
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

      <div className={styles.topRightActions}>
        <div className={styles.headerBalanceWrapper}>
          <span className={styles.headerBalanceLabel}>Redeemable Balance:</span>
          <span className={styles.headerBalanceValue}>
            {parseFloat(ledgerDetails?.communityRewards?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </span>
        </div>
        <button
          className={styles.redeemBtnTop}
          onClick={onRedeem}
        >
          <Gift size={14} />
          Redeem
        </button>
        <button
          className={styles.connectBtn}
          onClick={xummAccount ? onXummLogout : onXummLogin}
          title={xummAccount ? "Click to Disconnect" : "Connect Wallet"}
        >
          <Wallet size={14} />
          {xummAccount ? shortAddress : "Connect Wallet"}
          {xummAccount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(xummAccount);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: '#aaa' }}
                title="Copy Address"
              >
                <Copy size={12} />
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (onXummLogin) onXummLogin();
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
                <Plus size={14} />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Static Floating Cards (Left, Right, Bottom) */}
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
