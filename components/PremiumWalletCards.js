"use client";
import React from "react";
import styles from "./PremiumWalletCards.module.css";
import { ArrowRight, Plus, Gift, Rocket, Shield, MousePointer2, Users, History, TrendingUp, Wallet, Eye } from "lucide-react";
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
    case 'boost': return '#f038ff'; // Electric Purple
    case 'zero-risk': return '#00ff88'; // Emerald
    case 'lp': return '#4cc9f0'; // Sapphire
    case 'community': return '#ffd700'; // Gold
    case 'system': return '#00d2ff'; // Cyan
    default: return '#ffd700';
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
        <div className={styles.rwBadge}>
          {/* <Gift size={12} color="#ffd700" />
          <span>4</span> */}
        </div>
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
            <div className={styles.rwProgressFill} style={{ width: `${lpPerc}%`, background: '#4cc9f0' }}></div>
          </div>
        </div>

        <div className={styles.rwPoolItem}>
          <div className={styles.rwPoolHeader}>
            <span>Community Rewards</span>
            <span>{communityBalance} USDT</span>
          </div>
          <div className={styles.rwProgressBar}>
            <div className={styles.rwProgressFill} style={{ width: `${commPerc}%`, background: '#ffd700' }}></div>
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
          <div className={styles.mainBalance} style={{ fontSize: "22px" }}>
            {balance} <span style={{ fontSize: "13px", color: "#00ff00" }}>{displayCurrency}</span>
          </div>
          {limit && limit !== "N/A" && (
            <div className={styles.limitText} style={{ fontSize: "11px" }}>
              Limit: <span>{limit} {displayCurrency}</span>
            </div>
          )}
          {earningRate && <div className={styles.earningBannerLeft} style={{ marginTop: "5px", color: "#00ff00", fontSize: "12px" }}><TrendingUp size={12} /> Daily Earning: {earningRate}</div>}
        </div>

        <div className={styles.horizontalRight}>
          <button className={styles.glassBtnPrimary} onClick={onDeposit}>
            + {finalDepositLabel}
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
        <button className={styles.primaryBtn} onClick={onDeposit}>+ {finalDepositLabel}</button>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
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
