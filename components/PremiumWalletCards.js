"use client";
import React from "react";
import styles from "./PremiumWalletCards.module.css";
import { ArrowRight, Plus, Gift, Rocket, Shield, MousePointer2, Users, History, TrendingUp, Wallet, Eye, Zap } from "lucide-react";
import { FaHorse } from "react-icons/fa";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getThemeColor = (type) => {
  switch (type) {
    case 'boost': return '#FFB800'; // Gold
    case 'zero-risk': return '#FFD700'; // Platinum Gold
    case 'lp': return '#FFD700'; // Sapphire Gold
    case 'community': return '#FFB800'; // Gold
    case 'system': return '#FFB800'; // Gold
    default: return '#FFB800';
  }
};

const getIcon = (type) => {
  const color = getThemeColor(type);
  switch (type) {
    case 'boost': return <Rocket size={20} color={color} />;
    case 'zero-risk': return <Shield size={20} color={color} />;
    case 'lp': return <MousePointer2 size={20} color={color} />;
    case 'community': return <Users size={20} color={color} />;
    case 'system': return <Wallet size={20} color={color} />;
    default: return <Gift size={20} color={color} />;
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

  // Calculate real percentages based on total balance if available
  const totalNum = parseFloat(totalBalance.replace(/,/g, ''));
  const lpPerc = totalNum > 0 ? (parseFloat(lpBalance.replace(/,/g, '')) / totalNum) * 100 : 0;
  const commPerc = totalNum > 0 ? (parseFloat(communityBalance.replace(/,/g, '')) / totalNum) * 100 : 0;
  const boostPerc = totalNum > 0 ? (parseFloat(boostBalance.replace(/,/g, '')) / totalNum) * 100 : 0;

  return (
    <div className={styles.rwCardWrapper}>
      <div className={styles.rwHeader}>
        <span className={styles.rwTitle}>COMMUNITY WALLET</span>
      </div>

      <div className={styles.rwBody}>
        <div className={styles.rwAccumulatedLabel}>TOTAL ACCUMULATED</div>
        <div className={styles.rwMassiveValue}>
          {whole}<span className={styles.rwDecimals}>.{decimal || '00'}</span>
        </div>
        <div className={styles.rwSubtext}>USDT WALLETS DISTRIBUTION</div>

        <div className={styles.rwDivider}></div>

        <div className={styles.rwPoolItem}>
          <div className={styles.rwPoolHeader}>
            <span>Vault (LP) Pool</span>
            <span>{lpBalance} USDT</span>
          </div>
          <div className={styles.rwProgressBar}>
            <div className={styles.rwProgressFill} style={{ width: `${lpPerc}%`, background: '#FFD700' }}></div>
          </div>
        </div>

        <div className={styles.rwPoolItem}>
          <div className={styles.rwPoolHeader}>
            <span>Community Rewards</span>
            <span>{communityBalance} USDT</span>
          </div>
          <div className={styles.rwProgressBar}>
            <div className={styles.rwProgressFill} style={{ width: `${commPerc}%`, background: '#FFB800' }}></div>
          </div>
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
  layout = "vertical",
  depositLabel,
  currency
}) => {
  const finalDepositLabel = depositLabel || (title === 'System Wallet' || title === 'Primary Vault' ? 'Connect' : 'Deposit');
  const displayCurrency = currency || (type === "system" ? "BNB" : "USDT");

  if (layout === "horizontal") {
    return (
      <div className={styles.cardContainerHorizontal}>
        {/* LEFT: Icon + Title */}
        <div className={styles.horizontalLeft}>
          <div className={styles.iconBox} style={{
            background: "rgba(255, 215, 0, 0.08)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            flexShrink: 0
          }}>
            {getIcon(type)}
          </div>
          <div className={styles.titleSection}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, whiteSpace: "nowrap", color: "#fff" }}>{title}</h3>
            <p style={{ fontSize: "10px", margin: 0, whiteSpace: "nowrap", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase" }}>{subtitle}</p>
          </div>
        </div>

        {/* CENTER: Balance */}
        <div className={styles.horizontalCenter}>
          <div className={styles.mainBalance} style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>
            {balance}
          </div>
          <span style={{ fontSize: "12px", color: "#FFB800", fontWeight: 700, marginTop: "2px" }}>{displayCurrency}</span>
        </div>

        {/* RIGHT: Action Buttons */}
        <div className={styles.horizontalRight}>
          <button type="button" className={styles.glassBtnPrimary} onClick={onDeposit}>
            + {finalDepositLabel}
          </button>
          <button className={styles.glassBtnSecondary} onClick={onViewHistory}>
            <History size={14} />
            View History
          </button>
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
        <div className={styles.mainBalance}>
          {balance} <span>{displayCurrency}</span>
        </div>
        {limit && limit !== "N/A" && (
          <div className={styles.limitText}>Limit: <span>{limit} {displayCurrency}</span></div>
        )}
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
        <button type="button" className={styles.primaryBtn} onClick={onDeposit}>+ {finalDepositLabel}</button>
        <button type="button" className={styles.secondaryBtn} onClick={onViewHistory}>
          <History size={18} />
          View History
        </button>
      </div>
    </div>
  );
};

export const BoostWalletCard = ({
  title,
  balance,
  limit,
  earningRate,
  onViewHistory,
  type = 'boost',
  subtitle = "Available Balance",
  chartData,
  chartOptions,
  plugins = []
}) => {
  return (
    <div className={styles.boostCardSplit}>
      {/* Left side: Header & Gauge */}
      <div className={styles.boostGaugeArea}>
        <div className={styles.cardHeader} style={{ marginBottom: '10px' }}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox} style={{ background: "transparent", border: "1px solid rgba(127, 255, 76, 0.2)", width: '36px', height: '36px' }}>
              {getIcon(type)}
            </div>
            <div className={styles.titleSection}>
              <h3 style={{ fontSize: '14px', color: '#fff' }}>{title}</h3>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>
            </div>
          </div>
        </div>

        <div className={styles.gaugeWrapper}>
          <div className={styles.gaugeOuter}>
            {/* Energy Ribbons & Swirls */}
            <div className={styles.energyRibbon1}></div>
            <div className={styles.energyRibbon2}></div>
            <div className={styles.energyRibbon3}></div>
            <div className={styles.pulsingGlow}></div>

            <div className={styles.gaugeInner}>
              <div className={styles.gaugeValue}>{balance}</div>
              <div className={styles.gaugeCurrency}>USDT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Chart & Button */}
      <div className={styles.boostChartArea}>
        <div className={styles.chartTitleRow}>
          <span>History</span>
          {earningRate && (
            <div className={styles.rateBadge}>
              <TrendingUp size={10} />
              <span>Rate: {earningRate}</span>
            </div>
          )}
        </div>
        <div className={styles.miniChartSection}>
          {chartData && (
            <Chart
              type="bar"
              data={chartData}
              options={chartOptions}
              plugins={plugins}
            />
          )}
        </div>
        <button className={styles.premiumActionBtn} onClick={onViewHistory}>
          <span>VIEW HISTORY</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
export const HorseNFTCard = ({
  title = "Horse NFT",
  packageType = null,
  balance,
  roiProgress = 0,
  dailyYield = "0.00",
  estPayout = "0.00",
  nextPayout = "0.00",
  timeLeft = "--h --m",
  onViewHistory
}) => {
  // Normalize DB values (starter/growth/premium) to display tier (bronze/silver/gold)
  const tierNormalize = {
    starter: "bronze",
    growth: "silver",
    premium: "gold",
    bronze: "bronze",
    silver: "silver",
    gold: "gold",
  };
  const tier = tierNormalize[packageType] || null;

  const nftImages = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
  };

  const packageNames = {
    bronze: "Bronze Tier",
    silver: "Silver Tier",
    gold: "Gold Tier",
    starter: "Starter Pack",
    growth: "Growth Pack",
    premium: "Premium Pack",
  };

  // Live countdown to next UTC midnight (ticks every minute)
  const calcTimeLeft = () => {
    const now = new Date();
    const nextMid = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1
    ));
    const diff = nextMid - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  const [liveTimeLeft, setLiveTimeLeft] = React.useState(
    timeLeft !== "--h --m" ? timeLeft : calcTimeLeft()
  );

  React.useEffect(() => {
    const id = setInterval(() => setLiveTimeLeft(calcTimeLeft()), 60000);
    return () => clearInterval(id);
  }, []);

  const isActive = !!tier;

  return (
    <div className={styles.nftCardWrapper}>
      <div className={styles.nftHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.nftIconBox}>
            <FaHorse size={20} color={isActive ? "#ffd700" : "#555"} />
          </div>
          <div className={styles.titleSection}>
            <h3>{title}</h3>
            <p style={{ color: isActive ? undefined : '#555' }}>
              {packageNames[packageType] || "No Active Package"}
            </p>
          </div>
        </div>

        {/* Compact Tier Image - Top Right */}
        <div className={styles.nftImageSmall}>
          <span style={{ opacity: isActive ? 1 : 0.3 }}>
            {nftImages[tier] || "🐎"}
          </span>
          <div className={styles.nftGlowSmall}></div>
        </div>
      </div>

      <div className={styles.nftMainBalanceLarge} style={{ color: isActive ? undefined : '#555' }}>
        {balance} <span>USDT</span>
      </div>

      <div className={styles.roiProgressSection}>
        <div className={styles.roiLabelRow}>
          <span>Annual ROI Target</span>
          <span style={{ color: roiProgress > 0 ? '#00ff00' : '#555' }}>
            {roiProgress > 0 ? `${roiProgress}%` : 'N/A'}
          </span>
        </div>
        <div className={styles.roiProgressBar}>
          <div
            className={styles.roiProgressFill}
            style={{
              width: roiProgress > 0 ? `${Math.min(roiProgress, 100)}%` : '0%',
              background: roiProgress >= 60 ? 'linear-gradient(90deg,#ffd700,#ff8c00)'
                : roiProgress >= 50 ? 'linear-gradient(90deg,#00ff88,#00d2ff)'
                  : roiProgress > 0 ? 'linear-gradient(90deg,#7fff4c,#00ff88)'
                    : 'rgba(255,255,255,0.05)'
            }}
          ></div>
        </div>
      </div>

      <div className={styles.nftStatsGrid}>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Daily Yield</span>
          <span className={styles.nftStatValue} style={{ color: isActive ? "#00ff00" : "#555" }}>
            {dailyYield} USDT
          </span>
        </div>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Est. Payout</span>
          <span className={styles.nftStatValue} style={{ color: isActive ? undefined : '#555' }}>
            {estPayout} USDT
          </span>
        </div>
        <div className={styles.nftStatItem} style={{ border: 'none' }}>
          <div className={styles.nftStatLabelGroup}>
            <span className={styles.nftStatLabel}>Next Payout</span>
            <span className={styles.nftTimeLeft} style={{ color: isActive ? undefined : '#555' }}>
              {isActive ? `${liveTimeLeft} LEFT` : '--'}
            </span>
          </div>
          <span className={styles.nftStatValue} style={{ color: isActive ? undefined : '#555' }}>
            {nextPayout} USDT
          </span>
        </div>
      </div>

      <div className={styles.nftActionButtonsSimple}>
        <button className={styles.nftHistoryBtnFull} onClick={onViewHistory}>
          <History size={16} />
          <span>VIEW ASSET HISTORY</span>
        </button>
      </div>
    </div>
  );
};
