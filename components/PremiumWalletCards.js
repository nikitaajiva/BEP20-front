"use client";
import React from "react";
import styles from "./PremiumWalletCards.module.css";
import { ArrowRight, Plus, Gift, Rocket, Shield, MousePointer2, Users, History, TrendingUp, Wallet, Eye, Zap } from "lucide-react";
import { FaHorse, FaHammer } from "react-icons/fa";
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
  const balanceNum = parseFloat(String(balance).replace(/,/g, '')) || 0;
  const limitNum = parseFloat(String(limit).replace(/,/g, '')) || 0;
  const progressPercent = limitNum > 0 ? Math.min((balanceNum / limitNum) * 100, 100) : 0;

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

        {/* Dynamic Capacity / Limit Tracker */}
        <div className={styles.capacityContainer}>
          <div className={styles.capacityHeader}>
            <span className={styles.capacityLabel}>Limit Progress</span>
            <span className={styles.capacityValue}>{progressPercent.toFixed(1)}%</span>
          </div>
          <div className={styles.capacityTrack}>
            <div className={styles.capacityBar} style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className={styles.capacityFooter}>
            <span>Limit: {limit} USDT</span>
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
  myHorseNfts,
  onViewHistory
}) => {
  const toSafeNumber = React.useCallback((value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }, []);

  const formatUsdtAmount = React.useCallback((value, minimumFractionDigits = 2, maximumFractionDigits = minimumFractionDigits) => {
    const numericValue = toSafeNumber(value);
    return numericValue.toLocaleString(undefined, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }, [toSafeNumber]);

  const formatAnnualRoiPercent = React.useCallback((value) => {
    const numericValue = toSafeNumber(value);
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2).replace(/\.?0+$/, "");
  }, [toSafeNumber]);

  const formatCountdownFromDate = React.useCallback((targetDate) => {
    if (!targetDate) return "--:--:--";

    const diff = new Date(targetDate).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) {
      return "00:00:00";
    }

    const totalHours = Math.floor(diff / 3600000);
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const remHours = totalHours % 24;
      return `${days} Day${days > 1 ? "s" : ""}${remHours > 0 ? ` ${remHours}h` : ""}`;
    }

    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(totalHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const calculateHorseNftMetrics = React.useCallback((nft, fallbacks = {}) => {
    const packageInfo = nft?.packageInfo || {};
    const investment = toSafeNumber(
      nft?.purchasePriceUSDT ??
      packageInfo?.priceUSDT ??
      fallbacks?.price ??
      0
    );
    const annualRoiPercent = toSafeNumber(
      nft?.annualRoiPercent ??
      packageInfo?.annualRoiPercent ??
      fallbacks?.annualRoiPercent ??
      0
    );
    const dividendFrequency = (
      nft?.dividendFrequency ||
      packageInfo?.dividendFrequency ||
      fallbacks?.dividendFrequency ||
      ""
    ).toLowerCase();

    const annualPayoutUSDT = investment * annualRoiPercent / 100;
    const dailyYieldUSDT = annualPayoutUSDT / 365;
    const dailyYieldPercent = annualRoiPercent / 365;

    let periodPayoutUSDT = 0;
    if (dividendFrequency === "weekly") periodPayoutUSDT = annualPayoutUSDT / 52;
    else if (dividendFrequency === "monthly") periodPayoutUSDT = annualPayoutUSDT / 12;
    else if (dividendFrequency === "quarterly") periodPayoutUSDT = annualPayoutUSDT / 4;

    const totalPaidUSDT = toSafeNumber(nft?.totalPaidUSDT);
    const totalPayoutCount = Math.max(0, Math.trunc(toSafeNumber(nft?.totalPayoutCount)));
    const progressPercent = annualPayoutUSDT > 0 ? Math.min((totalPaidUSDT / annualPayoutUSDT) * 100, 100) : 0;

    return {
      investment,
      annualRoiPercent,
      annualPayoutUSDT,
      dailyYieldUSDT,
      dailyYieldPercent,
      periodPayoutUSDT,
      dividendFrequency,
      totalPaidUSDT,
      totalPayoutCount,
      progressPercent,
    };
  }, [toSafeNumber]);

  // ── Use live backend Horse NFT data when available ──────────────────────────
  // myHorseNfts comes from GET /api/horse-nft/my with fields:
  //   tierCode, purchasePriceUSDT, annualRoiPercent, dividendFrequency,
  //   status, paymentStatus, purchasedAt, activatedAt, totalPaidUSDT, etc.

  const activeHorseNfts = Array.isArray(myHorseNfts)
    ? myHorseNfts.filter(n => n.status === "ACTIVE" && n.paymentStatus === "PAID")
    : [];

  // Legacy fallback: user.nftPackages / user.nftPackage (only used when no Horse NFT API data)
  const legacyPackages = user?.nftPackages || [];
  const legacyEffective = legacyPackages.length > 0
    ? legacyPackages
    : (user?.nftPackage ? [{ tier: user.nftPackage }] : []);

  // Determine which data source to use
  const useBackendData = activeHorseNfts.length > 0;
  const effectivePackages = useBackendData ? activeHorseNfts : legacyEffective;

  const [selectedPkgIndex, setSelectedPkgIndex] = React.useState(
    effectivePackages.length === 1 ? 0 : null
  );

  // Reset selection when data changes
  React.useEffect(() => {
    if (effectivePackages.length === 1) setSelectedPkgIndex(0);
    else if (effectivePackages.length === 0) setSelectedPkgIndex(null);
  }, [effectivePackages.length]);

  const tierNormalize = {
    starter: "bronze", growth: "silver", premium: "gold",
    bronze: "bronze", silver: "silver", gold: "gold",
  };

  const nftImages = { bronze: "🥉", silver: "🥈", gold: "🥇" };
  const packageNames = {
    bronze: "BRONZE", silver: "SILVER", gold: "GOLD",
    starter: "BRONZE", growth: "SILVER", premium: "GOLD",
  };

  // Legacy fallback maps (only used when backend data is unavailable)
  const nftPriceMap = { starter: 500, growth: 1000, premium: 5000, bronze: 500, silver: 1000, gold: 5000 };
  const nftRoiMapLegacy = { starter: 15, growth: 25, premium: 35 };

  const calcTimeLeft = React.useCallback(() => {
    const now = new Date();
    let nextPayout = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 2, 0, 0));
    if (now.getTime() >= nextPayout.getTime()) {
      nextPayout.setUTCDate(nextPayout.getUTCDate() + 1);
    }
    const diff = nextPayout - now;
    const totalHours = Math.floor(diff / 3600000);
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const remHours = totalHours % 24;
      return `${days} Day${days > 1 ? "s" : ""}${remHours > 0 ? ` ${remHours}h` : ""}`;
    }
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(totalHours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const [liveTimeLeft, setLiveTimeLeft] = React.useState('');
  const selectedPkg = effectivePackages[selectedPkgIndex || 0] || null;

  React.useEffect(() => {
    const backendNextPayoutAt = useBackendData ? selectedPkg?.nextPayoutAt : null;

    const updateTimer = () => {
      if (backendNextPayoutAt) {
        setLiveTimeLeft(formatCountdownFromDate(backendNextPayoutAt));
        return;
      }

      setLiveTimeLeft(calcTimeLeft());
    };

    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [calcTimeLeft, formatCountdownFromDate, selectedPkg?.nextPayoutAt, useBackendData]);

  if (effectivePackages.length === 0) return null;

  // Helper: extract display values from a package (backend or legacy)
  const getPkgDisplayData = (pkg) => {
    if (useBackendData) {
      // Backend Horse NFT object
      const tierCode = (pkg.tierCode || "").toLowerCase();
      const tier = tierNormalize[tierCode] || "bronze";
      const metrics = calculateHorseNftMetrics(pkg);
      const purchaseDateStr = pkg.purchasedAt || pkg.activatedAt || pkg.createdAt || Date.now();

      return {
        tierCode,
        tier,
        tierColor: tier === 'gold' ? '#ffd700' : tier === 'silver' ? '#ffffff' : '#cd7f32',
        shadowColor: tier === 'gold' ? 'rgba(255,215,0,0.3)' : tier === 'silver' ? 'rgba(255,255,255,0.3)' : 'rgba(205,127,50,0.3)',
        price: metrics.investment,
        annualRoi: metrics.annualRoiPercent,
        dailyRate: metrics.dailyYieldPercent / 100,
        dailyYield: formatUsdtAmount(metrics.dailyYieldUSDT, 4, 4),
        estPayout: formatUsdtAmount(metrics.annualPayoutUSDT, 2, 2),
        nextPayout: formatUsdtAmount(metrics.periodPayoutUSDT, 2, 6),
        totalPaid: formatUsdtAmount(metrics.totalPaidUSDT, 2, 6),
        totalPayoutCount: metrics.totalPayoutCount,
        progressPercent: metrics.progressPercent.toFixed(2),
        annualRoiDisplay: formatAnnualRoiPercent(metrics.annualRoiPercent),
        dividendFrequency: metrics.dividendFrequency,
        dividendFrequencyLabel: metrics.dividendFrequency ? metrics.dividendFrequency.toUpperCase() : "PAYOUT",
        nextPayoutAt: pkg.nextPayoutAt || null,
        purchaseDate: purchaseDateStr,
        displayName: pkg.displayName || packageNames[tierCode] || tier.toUpperCase(),
        bonusTokens: pkg.bonusTokens || pkg.packageInfo?.bonusTokens || (metrics.investment / 0.01),
      };
    } else {
      // Legacy user.nftPackages object
      const tierCode = (pkg.tier || "").toLowerCase();
      const tier = tierNormalize[tierCode] || "bronze";
      const metrics = calculateHorseNftMetrics(pkg, {
        price: pkg.mintPrice && pkg.mintPrice > 0 ? pkg.mintPrice : (nftPriceMap[tierCode] || 0),
        annualRoiPercent: nftRoiMapLegacy[tierCode] || 15,
      });
      const purchaseDateStr = pkg.purchaseDate || Date.now();

      return {
        tierCode,
        tier,
        tierColor: tier === 'gold' ? '#ffd700' : tier === 'silver' ? '#ffffff' : '#cd7f32',
        shadowColor: tier === 'gold' ? 'rgba(255,215,0,0.3)' : tier === 'silver' ? 'rgba(255,255,255,0.3)' : 'rgba(205,127,50,0.3)',
        price: metrics.investment,
        annualRoi: metrics.annualRoiPercent,
        dailyRate: metrics.dailyYieldPercent / 100,
        dailyYield: formatUsdtAmount(metrics.dailyYieldUSDT, 4, 4),
        estPayout: formatUsdtAmount(metrics.annualPayoutUSDT, 2, 2),
        nextPayout: formatUsdtAmount(metrics.periodPayoutUSDT, 2, 6),
        totalPaid: formatUsdtAmount(metrics.totalPaidUSDT, 2, 6),
        totalPayoutCount: metrics.totalPayoutCount,
        progressPercent: metrics.progressPercent.toFixed(2),
        annualRoiDisplay: formatAnnualRoiPercent(metrics.annualRoiPercent),
        dividendFrequency: metrics.dividendFrequency,
        dividendFrequencyLabel: metrics.dividendFrequency ? metrics.dividendFrequency.toUpperCase() : "PAYOUT",
        nextPayoutAt: null,
        purchaseDate: purchaseDateStr,
        displayName: packageNames[tierCode] || tier.toUpperCase(),
        bonusTokens: pkg.bonusTokens || (metrics.investment / 0.01),
      };
    }
  };

  // If no package is selected and we have multiple, show the list
  if (selectedPkgIndex === null && effectivePackages.length > 1) {
    const sortedPackages = [...effectivePackages].sort((a, b) => {
      const dateA = new Date(useBackendData ? (a.purchasedAt || a.createdAt || 0) : (a.purchaseDate || 0));
      const dateB = new Date(useBackendData ? (b.purchasedAt || b.createdAt || 0) : (b.purchaseDate || 0));
      return dateB - dateA;
    });
    const recentPackages = sortedPackages.slice(0, 5);

    return (
      <div className={styles.nftCardWrapper}>
        <div className={styles.nftHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.nftIconBox}><FaHorse size={20} color="#ffd700" /></div>
            <div className={styles.titleSection}>
              <h3>NFT Packages</h3>
              <p>{effectivePackages.length} ACTIVE NFTs</p>
            </div>
          </div>
        </div>
        <div className={styles.nftListGrid}>
          {recentPackages.map((pkg, idx) => {
            const origIdx = effectivePackages.indexOf(pkg);
            const d = getPkgDisplayData(pkg);

            return (
              <div
                key={origIdx}
                className={styles.compactNftCard}
                onClick={() => setSelectedPkgIndex(origIdx)}
                style={{
                  borderLeft: `3px solid ${d.tierColor}`,
                  boxShadow: `0 4px 15px ${d.shadowColor}`
                }}
              >
                <div className={styles.compactNftIcon} style={{ background: `${d.tierColor}11`, color: d.tierColor }}>
                  {nftImages[d.tier]}
                </div>
                <div className={styles.compactNftInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.compactNftTier} style={{ color: d.tierColor }}>{d.displayName}</div>
                    <div style={{ color: '#00ff00', fontWeight: 800, fontSize: '13px' }}>
                      {d.price.toLocaleString()} USDT
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <div className={styles.compactNftDate}>Purchased: {new Date(d.purchaseDate || Date.now()).toLocaleDateString()}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,184,0,0.95)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>🪙</span> {Number(d.bonusTokens).toLocaleString()} TSC
                    </div>
                  </div>
                </div>
                <div className={styles.compactNftArrow}>
                  <ArrowRight size={14} color={d.tierColor} />
                </div>
              </div>
            );
          })}
        </div>

        {effectivePackages.length >= 4 && (
          <div className={styles.nftActionButtonsSimple} style={{ marginTop: '16px' }}>
            <button className={styles.nftHistoryBtnFull} onClick={onViewHistory}>
              <History size={16} />
              <span>VIEW ASSET HISTORY</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Individual Detailed View
  const activePkg = selectedPkg;
  const d = getPkgDisplayData(activePkg);

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
            <p>{d.displayName}</p>
          </div>
        </div>

        <div className={styles.nftImageSmall}>
          <span>{nftImages[d.tier] || "🐎"}</span>
          <div className={styles.nftGlowSmall}></div>
        </div>
      </div>

      <div className={styles.nftMainBalanceLarge}>
        {d.price.toLocaleString()} <span>USDT</span>
      </div>
      <div style={{ fontSize: '13px', color: '#ffb800', marginTop: '-4px', marginBottom: '14px', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
        <span>🪙</span> {Number(d.bonusTokens).toLocaleString()} TSC Tokens
      </div>

      <div className={styles.roiProgressSection}>
        <div className={styles.roiLabelRow}>
          <span>Annual ROI Target</span>
          <span style={{ color: '#00ff00' }}>
            {Number(String(d.totalPaid).replace(/,/g, '')).toFixed(2)} USDT / {Number(String(d.estPayout).replace(/,/g, '')).toFixed(2)} USDT
          </span>
        </div>
        <div
          className={styles.roiProgressBarWrap}
          data-progress-tooltip={`${d.progressPercent}%`}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.roiProgressBar}>
            <div
              className={styles.roiProgressFill}
              style={{
                width: `${Math.min(d.progressPercent, 100)}%`,
                background: d.tier === 'gold' ? 'linear-gradient(90deg,#ffd700,#ff8c00)'
                  : d.tier === 'silver' ? 'linear-gradient(90deg,#c0c0c0,#808080)'
                    : 'linear-gradient(90deg,#cd7f32,#a0522d)'
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className={styles.nftStatsGrid}>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Daily Yield</span>
          <span className={styles.nftStatValue} style={{ color: "#00ff00" }}>
            {d.dailyYield} USDT <span style={{ fontSize: '10px', color: 'rgba(0,255,0,0.75)', fontWeight: 700, marginLeft: '4px' }}>({(d.dailyRate * 100).toFixed(2)}%)</span>
          </span>
        </div>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Est. Monthly Yield</span>
          <span className={styles.nftStatValue} style={{ color: "#00ff00" }}>
            {((parseFloat(String(d.dailyYield).replace(/,/g, '')) || 0) * 30).toFixed(4)} USDT <span style={{ fontSize: '10px', color: 'rgba(0,255,0,0.75)', fontWeight: 700, marginLeft: '4px' }}>({(d.dailyRate * 100 * 30).toFixed(2)}%)</span>
          </span>
        </div>
        <div className={styles.nftStatItem}>
          <span className={styles.nftStatLabel}>Est. Annual Payout</span>
          <span className={styles.nftStatValue}>
            {d.estPayout} USDT <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginLeft: '4px' }}>({d.annualRoiDisplay}%)</span>
          </span>
        </div>
        <div className={styles.nftStatItem} style={{ border: 'none' }}>
          <div className={styles.nftStatLabelGroup}>
            <span className={styles.nftStatLabel}>Next Payout</span>
            <div style={{ fontSize: '10px', color: '#ffb800', marginTop: '2px', fontWeight: 800, letterSpacing: '1px' }}>
              IN {liveTimeLeft}
            </div>
          </div>
          <span className={styles.nftStatValue}>
            {d.nextPayout} USDT <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginLeft: '4px' }}>({d.dividendFrequencyLabel})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const ActiveStakesCard = ({ portfolioDetails, myMiningNfts, loading, onViewHistory }) => {
  const [selectedStakeIndex, setSelectedStakeIndex] = React.useState(null);

  if (loading) {
    return (
      <div className={styles.rwCardWrapper} style={{ border: '1px solid rgba(255, 85, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 85, 0, 0.1)',
            borderTopColor: '#ff5500',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Loading active stakes...
          </span>
        </div>
      </div>
    );
  }

  const tokenStakes = portfolioDetails?.tokenStaking || [];
  const miningStakes = (Array.isArray(myMiningNfts) ? myMiningNfts.filter(n => n.status === "STAKED") : []).map(nft => {
    const miningPower = parseFloat(nft.miningPower || 0);
    const powerCoefficient = parseFloat(nft.powerCoefficient || 1);
    const dailyYield = miningPower * 0.005 * powerCoefficient * 2.0 * 0.01;
    const apy = powerCoefficient * 365 * 100;
    const stakedAt = nft.stakedAt || nft.createdAt || Date.now();
    const daysPassed = Math.max(0, Math.floor((Date.now() - new Date(stakedAt).getTime()) / 86400000));
    return {
      id: nft.id || nft._id,
      amount: parseFloat(nft.mintPriceU || 0),
      tokenAmount: 0,
      dailyYield: dailyYield,
      estReward: dailyYield * 365,
      daysRemaining: "Perpetual",
      tierName: nft.tierName || `${nft.tierCode || 'N1'} Miner`,
      progress: 100,
      apy: apy,
      days: "∞",
      startDate: stakedAt,
      earnedRewards: dailyYield * daysPassed,
      isNft: true,
      nftCode: nft.tierCode,
      nftName: nft.tierName
    };
  });

  const allStakes = [...tokenStakes, ...miningStakes];
  allStakes.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  const isFromPortfolio = true;
  const displayedStakes = allStakes.slice(0, 3);

  const formatCryptoVal = (val, defaultDec = 2) => {
    const num = parseFloat(val || 0);
    if (num === 0) return "0";
    if (num < 0.000001) {
      return num.toFixed(10).replace(/\.?0+$/, '');
    }
    if (num < 0.0001) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
    if (num < 1) {
      return num.toFixed(6).replace(/\.?0+$/, '');
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: defaultDec, maximumFractionDigits: 6 });
  };

  // Detailed View Render
  if (selectedStakeIndex !== null && allStakes[selectedStakeIndex]) {
    const stake = allStakes[selectedStakeIndex];
    let amountVal, dailyYield, totalEstReward, daysRemaining, tierName, progress, apy, days, tokenAmount, earnedRewards;

    if (stake.isNft) {
      amountVal = stake.amount;
      tokenAmount = stake.tokenAmount;
      dailyYield = stake.dailyYield;
      totalEstReward = stake.estReward;
      daysRemaining = stake.daysRemaining;
      tierName = stake.tierName;
      progress = stake.progress;
      apy = typeof stake.apy === 'number' ? stake.apy.toFixed(1).replace(/\.0$/, '') : stake.apy;
      days = stake.days;
      earnedRewards = stake.earnedRewards || 0;
    } else if (isFromPortfolio) {
      amountVal = stake.amount;
      tokenAmount = stake.tokenAmount;
      dailyYield = stake.dailyYield;
      totalEstReward = stake.estReward;
      daysRemaining = stake.daysRemaining;
      tierName = stake.tierName;
      progress = stake.progress;
      apy = stake.apy < 1 ? (stake.apy * 100).toFixed(0) : stake.apy;
      days = stake.days;
      earnedRewards = stake.earnedRewards || 0;
    } else {
      const daysPassed = Math.max(0, Math.floor((new Date() - new Date(stake.startDate || Date.now())) / 86400000));
      days = stake.days;
      progress = Math.min(100, (daysPassed / stake.days) * 100);
      apy = stake.days >= 365 ? 0.28 : stake.days >= 180 ? 0.22 : stake.days >= 90 ? 0.12 : 0.10;
      amountVal = parseFloat(stake.amount || stake.stakeAmount || 0);
      tokenAmount = parseFloat(stake.tokenAmount || stake.tscAmount || (amountVal / 0.01) || 0);
      const planDate = stake.startDate ? new Date(stake.startDate).toISOString().slice(0, 10) : "";
      const todayDate = new Date().toISOString().slice(0, 10);
      const isCronRun = planDate ? planDate < todayDate : false;
      dailyYield = isCronRun ? (amountVal * apy / 365) : 0;
      totalEstReward = (amountVal * apy * stake.days / 365);
      daysRemaining = Math.max(0, stake.days - daysPassed);
      tierName = stake.days >= 365 ? "Premium" : stake.days >= 180 ? "Advanced" : stake.days >= 90 ? "Growth" : "Starter";
      apy = apy * 100;
      earnedRewards = isCronRun ? ((amountVal * (apy / 100) / 365) * daysPassed) : 0;
    }

    const startDateFormatted = new Date(stake.startDate || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const maturityDateFormatted = stake.isNft ? "Never (Perpetual)" : new Date(new Date(stake.startDate || Date.now()).getTime() + days * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    return (
      <div className={styles.rwCardWrapper} style={{ border: stake.isNft ? '1px solid rgba(189, 0, 255, 0.25)' : '1px solid rgba(255, 85, 0, 0.25)', minHeight: '380px' }}>
        <div className={styles.rwHeader} style={{ borderColor: stake.isNft ? 'rgba(189, 0, 255, 0.25)' : 'rgba(255, 85, 0, 0.25)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSelectedStakeIndex(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px 0 0',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              &larr;
            </button>
            <span className={styles.rwTitle} style={{ color: stake.isNft ? '#bd00ff' : '#ff5500' }}>{stake.isNft ? "Miner Details" : "Stake Details"}</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 900, color: stake.isNft ? '#bd00ff' : '#ff5500', background: stake.isNft ? 'rgba(189,0,255,0.1)' : 'rgba(255,85,0,0.1)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
            {tierName}
          </span>
        </div>

        <div className={styles.rwBody} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stake.isNft ? "Node Value" : "Staked Value"}</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {formatCryptoVal(amountVal, 2)} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>USDT</span>
              </div>
              {tokenAmount > 0 && (
                <div style={{ fontSize: '11px', color: 'rgba(255,184,0,0.95)', marginTop: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px' }}>🪙</span> {formatCryptoVal(tokenAmount, 2)} TSC Tokens
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(0, 255, 0, 0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 800 }}>Earned to Date</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#00ff00', lineHeight: 1 }}>
                +{formatCryptoVal(earnedRewards, 4)} <span style={{ fontSize: '14px', color: 'rgba(0, 255, 0, 0.6)', fontWeight: 500 }}>USDT</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              <span>{stake.isNft ? "PERPETUAL STATUS" : "MATURITY PROGRESS"}</span>
              <span style={{ color: stake.isNft ? '#bd00ff' : '#ff5500' }}>{stake.isNft ? "ACTIVE" : `${progress.toFixed(0)}%`}</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: stake.isNft ? 'linear-gradient(90deg, #bd00ff, #f038ff)' : 'linear-gradient(90deg, #ff5500, #ff8c00)', 
                boxShadow: stake.isNft ? '0 0 10px rgba(189,0,255,0.6)' : '0 0 10px rgba(255,85,0,0.6)' 
              }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{days === "∞" ? "Perpetual" : `${days} Days`}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>APY Rate</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: stake.isNft ? '#bd00ff' : '#ff5500' }}>{apy}% APY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Yield</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#00ff00' }}>+{formatCryptoVal(dailyYield, 4)} USDT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>{stake.isNft ? "Est. Annual Reward" : "Est. Reward"}</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#00ff00' }}>+{formatCryptoVal(totalEstReward, 2)} USDT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Staked Date</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>{startDateFormatted}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Maturity Date</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>{maturityDateFormatted}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: 'auto' }}>
            <span>Remaining Timeline:</span>
            <span style={{ fontWeight: 850, color: stake.isNft ? '#bd00ff' : (daysRemaining < 5 ? '#ff5500' : '#fff') }}>
              {stake.isNft ? "Active Forever" : `${daysRemaining} Days left`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard List View Render
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
        {displayedStakes.length > 0 ? (
          displayedStakes.map((stake, idx) => {
            let amountVal, dailyYield, totalEstReward, daysRemaining, tierName, progress, apy, days, tokenAmount, earnedRewards;

            if (stake.isNft) {
              amountVal = stake.amount;
              tokenAmount = stake.tokenAmount;
              dailyYield = stake.dailyYield;
              totalEstReward = stake.estReward;
              daysRemaining = stake.daysRemaining;
              tierName = stake.tierName;
              progress = stake.progress;
              apy = typeof stake.apy === 'number' ? stake.apy.toFixed(1).replace(/\.0$/, '') : stake.apy;
              days = stake.days;
              earnedRewards = stake.earnedRewards || 0;
            } else if (isFromPortfolio) {
              amountVal = stake.amount;
              tokenAmount = stake.tokenAmount;
              dailyYield = stake.dailyYield;
              totalEstReward = stake.estReward;
              daysRemaining = stake.daysRemaining;
              tierName = stake.tierName;
              progress = stake.progress;
              apy = stake.apy < 1 ? (stake.apy * 100).toFixed(0) : stake.apy;
              days = stake.days;
              earnedRewards = stake.earnedRewards || 0;
            } else {
              const daysPassed = Math.max(0, Math.floor((new Date() - new Date(stake.startDate)) / 86400000));
              days = stake.days;
              progress = Math.min(100, (daysPassed / stake.days) * 100);
              apy = stake.days >= 365 ? 0.28 : stake.days >= 180 ? 0.22 : stake.days >= 90 ? 0.12 : 0.10;
              amountVal = parseFloat(stake.amount || stake.stakeAmount || 0);
              tokenAmount = parseFloat(stake.tokenAmount || stake.tscAmount || (amountVal / 0.01) || 0);
              dailyYield = (amountVal * apy / 365);
              totalEstReward = (amountVal * apy * stake.days / 365);
              daysRemaining = Math.max(0, stake.days - daysPassed);
              tierName = stake.days >= 365 ? "Premium" : stake.days >= 180 ? "Advanced" : stake.days >= 90 ? "Growth" : "Starter";
              apy = apy * 100;
              earnedRewards = dailyYield * daysPassed;
            }

            return (
              <div
                key={idx}
                onClick={() => setSelectedStakeIndex(idx)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = stake.isNft ? 'rgba(189,0,255,0.04)' : 'rgba(255,85,0,0.04)';
                  e.currentTarget.style.borderColor = stake.isNft ? 'rgba(189,0,255,0.2)' : 'rgba(255,85,0,0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top Row: Amount & Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: 6, 
                      background: stake.isNft ? 'rgba(189,0,255,0.1)' : 'rgba(255,85,0,0.1)', 
                      color: stake.isNft ? '#bd00ff' : '#ff5500', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {stake.isNft ? <FaHammer size={12} style={{ transform: 'rotate(-45deg)' }} /> : <TrendingUp size={12} />}
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>
                        {formatCryptoVal(amountVal, 2)} <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>USDT</span>
                      </span>
                      {tokenAmount > 0 && (
                        <div style={{ fontSize: 10, color: 'rgba(255,184,0,0.85)', marginTop: '2px', fontWeight: 800 }}>
                          {formatCryptoVal(tokenAmount, 2)} TSC Tokens
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: 8, 
                    fontWeight: 900, 
                    color: stake.isNft ? '#bd00ff' : '#ff5500', 
                    background: stake.isNft ? 'rgba(189,0,255,0.1)' : 'rgba(255,85,0,0.1)', 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    textTransform: 'uppercase' 
                  }}>
                    {tierName}
                  </span>
                </div>

                {/* Middle Section Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Row 1: Duration & Maturity */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, borderBottom: '1px dashed rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>Duration:</span>
                      <span style={{ fontWeight: 800, color: '#fff' }}>{days === "∞" ? "Perpetual" : `${days} Days`} <span style={{ fontSize: '8px', color: stake.isNft ? '#bd00ff' : '#ff5500', fontWeight: 800 }}>({apy}% APY)</span></span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>Maturity:</span>
                      <span style={{ fontWeight: 800, color: (daysRemaining < 5 && !stake.isNft) ? '#ff5500' : '#fff' }}>
                        {stake.isNft ? "Perpetual" : `${daysRemaining}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Daily Yield, Earned & Est. Reward */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                    <div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>Daily Yield:</span>
                      <span style={{ fontWeight: 950, color: '#00ff00' }}>+{formatCryptoVal(dailyYield, 4)} USDT</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 8, color: 'rgba(0, 255, 0, 0.8)', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>Earned:</span>
                      <span style={{ fontWeight: 950, color: '#00ff00' }}>+{formatCryptoVal(earnedRewards, 4)} USDT</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>{stake.isNft ? "Est. Annual:" : "Est. Reward:"}</span>
                      <span style={{ fontWeight: 950, color: '#00ff00' }}>+{formatCryptoVal(totalEstReward, 2)} USDT</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '2px' }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: stake.isNft ? '#bd00ff' : '#ff5500', 
                      boxShadow: stake.isNft ? '0 0 8px rgba(189,0,255,0.5)' : '0 0 8px rgba(255,85,0,0.5)' 
                    }}></div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>
                    {stake.isNft ? "∞" : `${progress.toFixed(0)}%`}
                  </span>
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

      {allStakes.length > 3 && (
        <div style={{ padding: '0 12px 16px 12px' }}>
          <button
            className={styles.nftHistoryBtnFull}
            onClick={onViewHistory}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              background: 'rgba(255, 85, 0, 0.1)',
              border: '1px solid rgba(255, 85, 0, 0.25)',
              borderRadius: '12px',
              color: '#ff5500',
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <History size={14} />
            <span>VIEW STAKING HISTORY ({allStakes.length - 3} MORE)</span>
          </button>
        </div>
      )}
    </div>
  );
};
