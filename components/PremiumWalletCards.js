"use client";
import React from "react";
import styles from "./PremiumWalletCards.module.css";
import { ArrowRight, Plus, Gift, Rocket, Shield, MousePointer2, Users, History, TrendingUp, Wallet, Eye } from "lucide-react";

const getIcon = (type) => {
  switch (type) {
    case 'boost': return <Rocket size={20} />;
    case 'zero-risk': return <Shield size={20} />;
    case 'lp': return <MousePointer2 size={20} />;
    case 'community': return <Users size={20} />;
    case 'system': return <Wallet size={20} />;
    default: return <Gift size={20} />;
  }
};

/**
 * Composite Rewards Card (Left Style)
 */
export const RewardsWalletCard = ({
  totalBalance,
  lpBalance,
  communityBalance,
  boostBalance,
  airdropBalance,
  currentBalance = "0.00",
  autoPositioning = "0.00",
  redeemed = "0.00",
  onAutoPosition,
  onRedeem,
  onViewHistory
}) => {
  const [whole, decimal] = totalBalance.split('.');

  // Fake calculated percentage for visual presentation (or you can calculate it based on total)
  const lpPerc = lpBalance > 0 ? 60 : 0;
  const commPerc = communityBalance > 0 ? 30 : 0;

  return (
    <div className={styles.rwCardWrapper}>
      <div className={styles.rwHeader}>
        <span className={styles.rwTitle}>REWARDS WALLET</span>
        <div className={styles.rwBadge}>
          <Gift size={12} color="#000" />
          <span>4</span>
        </div>
      </div>

      <div className={styles.rwBody}>
        <div className={styles.rwAccumulatedLabel}>TOTAL ACCUMULATED</div>
        <div className={styles.rwMassiveValue}>
          {whole}<span className={styles.rwDecimals}>.{decimal || '00'}</span>
        </div>
        <div className={styles.rwSubtext}>/ 0 USDT</div>

        <div className={styles.rwDivider}></div>

        <div className={styles.rwPoolItem}>
          <div className={styles.rwPoolHeader}>
            <span>Liquidity Pool</span>
            <span>{lpBalance} / 0.00</span>
          </div>
          <div className={styles.rwProgressBar}>
            <div className={styles.rwProgressFill} style={{ width: `${lpPerc}%` }}></div>
          </div>
        </div>

        <div className={styles.rwPoolItem}>
          <div className={styles.rwPoolHeader}>
            <span>Community Pool Rewards</span>
            <span>{communityBalance} / 0.00</span>
          </div>
          <div className={styles.rwProgressBar}>
            <div className={styles.rwProgressFill} style={{ width: `${commPerc}%` }}></div>
          </div>
        </div>

        <div className={styles.rwDivider}></div>

        <div className={styles.rwFooter}>
          <button className={styles.rwAutoPosBtn} style={{ width: '100%', flexDirection: 'row', gap: '12px', padding: '16px' }} onClick={onAutoPosition}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span style={{ fontSize: '12px' }}>AUTO POSITIONING</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Actionable Wallet Card (Right Style - e.g. Boost Wallet)
 */
export const ActionableWalletCard = ({
  title,
  balance,
  limit,
  earningRate,
  onDeposit,
  onViewHistory,
  type = 'boost',
  showPlusBtn = true,
  subtitle = "Available Balance",
  layout = "vertical"
}) => {
  if (layout === "horizontal") {
    return (
      <div className={styles.cardContainerHorizontal}>
        <div className={styles.horizontalLeft}>
          <div className={styles.iconBox} style={{ background: "transparent", border: "1px solid rgba(255, 215, 0, 0.3)", width: "42px", height: "42px" }}>
            {getIcon(type)}
            {type === 'boost' && <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "#00ff00", borderRadius: "50%", border: '1px solid #000' }}></div>}
          </div>
          <div className={styles.titleSection}>
            <h3 style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{title}</h3>
            <p style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.horizontalCenter}>
          <div className={styles.mainBalance} style={{ fontSize: "22px" }}>{balance} <span style={{ fontSize: "13px", color: "#00ff00" }}>USDT</span></div>
          {limit && limit !== "N/A" && <div className={styles.limitText} style={{ fontSize: "11px" }}>Limit: <span>{limit} USDT</span></div>}
          {earningRate && <div className={styles.earningBannerLeft} style={{ marginTop: "5px", color: "#00ff00", fontSize: "12px" }}><TrendingUp size={12} /> Daily Earning: {earningRate}</div>}
        </div>

        <div className={styles.horizontalRight}>
          <button className={styles.glassBtnPrimary} onClick={onDeposit}>
            + {title === 'System Wallet' || title === 'Primary Vault' ? 'Deposit' : 'Deposit'}
          </button>
          <button className={styles.glassBtnSecondary} onClick={onViewHistory}>
            <History size={15} />
            View History
          </button>
          {showPlusBtn && (
            <div className={styles.glassPlusBtn} onClick={onDeposit}>
              <Plus size={18} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox} style={{ background: "transparent", border: "1px solid rgba(255, 215, 0, 0.3)" }}>
            {getIcon(type)}
            {type === 'boost' && <div style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, background: "#00ff00", borderRadius: "50%", border: '2px solid #000' }}></div>}
          </div>
          <div className={styles.titleSection}>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        {showPlusBtn && (
          <div className={styles.headerRightBtn} style={{ background: "#ffd700", border: "none", color: "#000", width: 44, height: 44 }} onClick={onDeposit}>
            <Plus size={24} />
          </div>
        )}
      </div>

      <div className={styles.mainBalanceSection}>
        <div className={styles.mainBalance}>{balance} <span>USDT</span></div>
        {limit && limit !== "N/A" && <div className={styles.limitText}>Limit: <span>{limit} USDT</span></div>}
      </div>

      {earningRate && (
        <div className={styles.earningBanner}>
          <div className={styles.earningBannerLeft}>
            <TrendingUp size={20} />
            <span>Daily Earning Rate</span>
          </div>
          <div className={styles.earningRate}>{earningRate}</div>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button className={styles.primaryBtn} onClick={onDeposit}>+ {title === 'System Wallet' ? 'Connect' : 'Deposit'}</button>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
          <History size={18} />
          View History
        </button>
      </div>
    </div>
  );
};
