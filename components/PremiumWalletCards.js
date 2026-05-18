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
          {showPlusBtn && (
            <button type="button" className={styles.glassBtnPrimary} onClick={onDeposit}>
              {finalDepositLabel}
            </button>
          )}
          <button className={styles.glassBtnSecondary} onClick={onViewHistory}>
            <History size={14} />
            View History
          </button>
        </div >
      </div >
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
  user,
  ledgerDetails,
  onViewHistory
}) => {
  const nftPriceMap = {
    starter: 500, growth: 1000, premium: 5000,
    bronze: 500, silver: 1000, gold: 5000,
    N1: 500, N2: 1000, N3: 5000, N4: 10000, N5: 25000
  };

  const nftPackages = user?.nftPackages || [];
  // Backward compatibility
  const effectivePackages = nftPackages.length > 0 
    ? nftPackages 
    : (user?.nftPackage ? [{ tier: user.nftPackage }] : []);

  const [selectedPkgIndex, setSelectedPkgIndex] = React.useState(
    effectivePackages.length === 1 ? 0 : null
  );

  const tierNormalize = {
    starter: "bronze", growth: "silver", premium: "gold",
    bronze: "bronze", silver: "silver", gold: "gold",
  };

  const nftImages = { bronze: "🥉", silver: "🥈", gold: "🥇" };
  const packageNames = {
    bronze: "BRONZE", silver: "SILVER", gold: "GOLD",
    starter: "BRONZE", growth: "SILVER", premium: "GOLD",
  };

  const nftRoiMap   = { starter: 45, growth: 55, premium: 65, bronze: 45, silver: 55, gold: 65 };
  const nftRateMap  = { starter: 0.003, growth: 0.004, premium: 0.005, bronze: 0.003, silver: 0.004, gold: 0.005 };

  const calcTimeLeft = () => {
    const now = new Date();
    const nextMid = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const diff = nextMid - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  const [liveTimeLeft, setLiveTimeLeft] = React.useState(calcTimeLeft());
  React.useEffect(() => {
    const id = setInterval(() => setLiveTimeLeft(calcTimeLeft()), 60000);
    return () => clearInterval(id);
  }, []);

  const zeroRiskBal = parseFloat(ledgerDetails?.zeroRisk?.balance || "0");

  if (effectivePackages.length === 0) return null;

  // If no package is selected and we have multiple, show the list
  if (selectedPkgIndex === null && effectivePackages.length > 1) {
    return (
      <div className={styles.nftCardWrapper}>
        <div className={styles.nftHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.nftIconBox}><FaHorse size={20} color="#ffd700" /></div>
            <div className={styles.titleSection}>
              <h3>MY ASSETS</h3>
              <p>{effectivePackages.length} ACTIVE NFTs</p>
            </div>
          </div>
        </div>
        <div className={styles.nftListGrid}>
          {effectivePackages.map((pkg, idx) => {
            const tier = tierNormalize[pkg.tier];
            const tierColor = tier === 'gold' ? '#ffd700' : tier === 'silver' ? '#ffffff' : '#cd7f32';
            const shadowColor = tier === 'gold' ? 'rgba(255,215,0,0.3)' : tier === 'silver' ? 'rgba(255,255,255,0.3)' : 'rgba(205,127,50,0.3)';
            
            const backendPkg = ledgerDetails?.horseNFTs?.[idx];
            const price = backendPkg ? backendPkg.purchasePrice : (pkg.mintPrice && pkg.mintPrice > 0 ? pkg.mintPrice : (nftPriceMap[pkg.tier] || 0));

            return (
              <div 
                key={idx} 
                className={styles.compactNftCard} 
                onClick={() => setSelectedPkgIndex(idx)}
                style={{ 
                  borderLeft: `3px solid ${tierColor}`,
                  boxShadow: `0 4px 15px ${shadowColor}`
                }}
              >
                <div className={styles.compactNftIcon} style={{ background: `${tierColor}11`, color: tierColor }}>
                  {nftImages[tier]}
                </div>
                <div className={styles.compactNftInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.compactNftTier} style={{ color: tierColor }}>{packageNames[pkg.tier]}</div>
                    <div style={{ color: '#00ff00', fontWeight: 800, fontSize: '13px' }}>
                      {price.toLocaleString()} USDT
                    </div>
                  </div>
                  <div className={styles.compactNftDate}>Purchased: {new Date(pkg.purchaseDate || Date.now()).toLocaleDateString()}</div>
                </div>
                <div className={styles.compactNftArrow}>
                   <ArrowRight size={14} color={tierColor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Individual Detailed View
  const activePkg = effectivePackages[selectedPkgIndex || 0];
  const tier = tierNormalize[activePkg.tier];

  const backendPkg = ledgerDetails?.horseNFTs?.[selectedPkgIndex || 0];

  const roiProgress = backendPkg ? backendPkg.roiProgress : (nftRoiMap[activePkg.tier] || 0);
  const dailyRate = backendPkg ? backendPkg.dailyRate : (nftRateMap[activePkg.tier] || 0);
  const purchasePrice = backendPkg ? backendPkg.purchasePrice : (activePkg?.mintPrice && activePkg.mintPrice > 0 ? activePkg.mintPrice : (nftPriceMap[activePkg?.tier] || 0));

  const dailyYield = backendPkg ? backendPkg.dailyYield.toFixed(4) : (purchasePrice * dailyRate).toFixed(4);
  const estPayout = backendPkg ? backendPkg.estPayout.toFixed(2) : (purchasePrice * (roiProgress / 100)).toFixed(2);

  return (
    <div className={styles.nftCardWrapper}>
      <div className={styles.nftHeader}>
        <div className={styles.headerLeft}>
          {effectivePackages.length > 1 && (
            <button 
              className={styles.nftBackBtn} 
              onClick={() => setSelectedPkgIndex(null)}
              style={{ background: 'transparent', border: 'none', color: '#fff', marginRight: '10px', cursor: 'pointer', fontSize: '18px' }}
            >
              &larr;
            </button>
          )}
          <div className={styles.nftIconBox}>
            <FaHorse size={20} color="#ffd700" />
          </div>
          <div className={styles.titleSection}>
            <h3>{title}</h3>
            <p>{packageNames[activePkg.tier]}</p>
          </div>
        </div>

        <div className={styles.nftImageSmall}>
          <span>{nftImages[tier] || "🐎"}</span>
          <div className={styles.nftGlowSmall}></div>
        </div>
      </div>

      <div className={styles.nftMainBalanceLarge}>
        {purchasePrice.toLocaleString()} <span>USDT</span>
      </div>

      <div className={styles.roiProgressSection}>
        <div className={styles.roiLabelRow}>
          <span>Annual ROI Target</span>
          <span style={{ color: '#00ff00' }}>{roiProgress}%</span>
        </div>
        <div className={styles.roiProgressBar}>
          <div
            className={styles.roiProgressFill}
            style={{
              width: `${Math.min(roiProgress, 100)}%`,
              background: tier === 'gold' ? 'linear-gradient(90deg,#ffd700,#ff8c00)'
                         : tier === 'silver' ? 'linear-gradient(90deg,#c0c0c0,#808080)'
                         : 'linear-gradient(90deg,#cd7f32,#a0522d)'
            }}
          ></div>
        </div>
      </div>

      <div className={styles.nftStatsGrid}>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Daily Yield</span>
          <span className={styles.nftStatValue} style={{ color: "#00ff00" }}>{dailyYield} USDT</span>
        </div>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Est. Payout</span>
          <span className={styles.nftStatValue}>{estPayout} USDT</span>
        </div>
        <div className={styles.nftStatItem} style={{ border: 'none' }}>
          <div className={styles.nftStatLabelGroup}>
            <span className={styles.nftStatLabel}>Next Payout</span>
          </div>
          <span className={styles.nftStatValue}>{dailyYield} USDT</span>
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

export const ActiveStakesCard = ({ user, onViewHistory }) => {
  const allStakes = [
    ...(user?.stakingPlan?.amount ? [{ ...user.stakingPlan, isPrimary: true }] : []),
    ...(user?.stakingPlans || [])
  ];

  return (
    <div className={styles.rwCardWrapper} style={{ border: '1px solid rgba(255, 85, 0, 0.25)' }}>
      <div className={styles.rwHeader} style={{ borderColor: 'rgba(255, 85, 0, 0.25)', padding: '16px' }}>
        <span className={styles.rwTitle} style={{ color: '#ff5500' }}>Active Stakes</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>
          <TrendingUp size={12} color="#ff5500" />
          <span>{allStakes.length} ACTIVE</span>
        </div>
      </div>

      <div className={styles.rwBody} style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {allStakes.length > 0 ? (
          allStakes.map((stake, idx) => {
            const daysPassed = Math.max(0, Math.floor((new Date() - new Date(stake.startDate)) / 86400000));
            const progress = Math.min(100, (daysPassed / stake.days) * 100);
            
            // Precise dynamic interest system rates mapping:
            const apy = stake.days >= 365 ? 0.28 : stake.days >= 180 ? 0.22 : stake.days >= 90 ? 0.18 : 0.10;
            const dailyYield = (parseFloat(stake.amount) * apy / 365).toFixed(4);
            const totalEstReward = (parseFloat(stake.amount) * apy * stake.days / 365).toFixed(2);
            
            const daysRemaining = Math.max(0, stake.days - daysPassed);
            const tierName = stake.days >= 365 ? "Premium" : stake.days >= 180 ? "Advanced" : stake.days >= 90 ? "Growth" : "Starter";

            return (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: '0.2s'
                }}
              >
                {/* Top Row: Amount & Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,85,0,0.1)', color: '#ff5500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={12} />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>
                        {parseFloat(stake.amount).toLocaleString()} <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>USDT</span>
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: '#ff5500', background: 'rgba(255,85,0,0.1)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                    {tierName}
                  </span>
                </div>

                {/* Middle Row: Duration, Yields & Remaining Days */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</span>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{stake.days} Days</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Yield</span>
                    <span style={{ fontWeight: 950, color: '#00ff00' }}>+{dailyYield} USDT</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Est. Reward</span>
                    <span style={{ fontWeight: 950, color: '#00ff00' }}>+{totalEstReward} USDT</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Maturity</span>
                    <span style={{ fontWeight: 800, color: daysRemaining < 5 ? '#ff5500' : '#fff' }}>{daysRemaining}d left</span>
                  </div>
                </div>

                {/* Bottom Row: Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '2px' }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#ff5500', boxShadow: '0 0 8px rgba(255,85,0,0.5)' }}></div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>{progress.toFixed(0)}%</span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No active staking records found
          </div>
        )}
      </div>

    </div>
  );
};
