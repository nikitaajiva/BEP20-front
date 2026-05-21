"use client";
import React, { useState } from "react";
import styles from "./InvestmentSections.module.css";
import Link from "next/link";

const HorseIcon = () => (
  <svg viewBox="0 0 100 80" fill="currentColor" className={styles.horseIconSvg}>
    <path d="M85,8 C82,5 77,4 73,6 L68,9 C65,7 61,6 57,7 L52,9 C49,8 46,8 43,10 L40,13 C37,14 35,17 35,20 L36,25 C33,27 31,30 31,34 L31,40 C28,42 26,45 26,49 L27,56 C24,58 22,62 23,66 L25,70 C26,72 28,73 30,73 L35,72 C37,71 38,69 38,67 L38,60 C40,59 42,58 44,57 L44,67 C44,69 45,71 47,72 L52,73 C54,73 56,72 57,70 L57,57 C59,56 62,55 64,54 L64,67 C64,69 65,71 67,72 L72,73 C74,73 76,72 77,70 L77,57 C80,55 82,52 83,49 L84,42 C87,40 89,37 89,33 L89,27 C92,25 94,22 94,18 C94,13 90,9 85,8 Z M70,20 C68,20 67,19 67,17 C67,15 68,14 70,14 C72,14 73,15 73,17 C73,19 72,20 70,20 Z" />
  </svg>
);

const FireParticle = ({ style }) => (
  <div className={styles.fireParticle} style={style} />
);

const stakingTiers = [
  { days: 30, min: "5%", max: "10%", label: "30-Day Lock", color: "#FFD700", badge: "Starter" },
  { days: 90, min: "11%", max: "12%", label: "90-Day Lock", color: "#FFB800", badge: "Growth" },
  { days: 180, min: "19%", max: "22%", label: "180-Day Lock", color: "#FFA500", badge: "Advanced" },
  { days: 365, min: "23%", max: "28%", label: "365-Day Lock", color: "#FF6200", badge: "Premium" },
];

const nftPackages = [
  {
    id: "starter",
    name: "Starter Package",
    tier: "Bronze",
    price: "$500 USDT",
    priceNum: 500,
    nft: "1 Bronze-tier Horse NFT",
    tokens: "5,000 bonus Toking Tokens",
    roi: "Up to 15% annual ROI",
    dividends: "Quarterly dividend payments",
    extras: ["Special Bronze Tier Airdrops During Major Campaigns"],
    gradient: "linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)",
    glow: "rgba(205,127,50,0.35)",
    icon: "🥉",
    tierColor: "#cd7f32",
  },
  {
    id: "growth",
    name: "Growth Package",
    tier: "Silver",
    price: "$1,000 USDT",
    priceNum: 1000,
    nft: "1 Silver-tier Horse NFT",
    tokens: "12,000 bonus Toking Tokens",
    roi: "Up to 25% annual ROI",
    dividends: "Monthly dividend payments",
    extras: [
      "Special Bronze Tier Airdrops During Major Campaigns",
      "Invitation to Tokinghoofborn Events",
    ],
    gradient: "linear-gradient(135deg, #c0c0c0 0%, #808080 100%)",
    glow: "rgba(192,192,192,0.35)",
    icon: "🥈",
    tierColor: "#c0c0c0",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Package",
    tier: "Gold",
    price: "$5,000 USDT",
    priceNum: 5000,
    nft: "1 Gold-tier Horse NFT",
    tokens: "75,000 bonus Toking Tokens",
    roi: "Up to 35% annual ROI",
    dividends: "Weekly dividend payments",
    extras: [
      "Special Gold Tier Airdrops During Major Campaigns",
      "Invitation to Tokinghoofborn Events",
      "VIP Access to Conferences where Tokinghoofborn is participating",
    ],
    gradient: "linear-gradient(135deg, #FFB800 0%, #FF6200 100%)",
    glow: "rgba(255, 184, 0, 0.4)",
    icon: "🥇",
    tierColor: "#FFB800",
  },
];

export default function InvestmentSections() {
  const [activeStaking, setActiveStaking] = useState(null);
  const [activePackage, setActivePackage] = useState(null);

  return (
    <div className={styles.investWrapper}>
      {/* Animated Fire Horse Background */}
      <div className={styles.horseBackground}>
        <div className={styles.galloppingHorse}>
          <svg viewBox="0 0 200 160" className={styles.horseSilhouette}>
            <g className={styles.horseBody}>
              {/* Body */}
              <ellipse cx="100" cy="90" rx="45" ry="28" fill="currentColor" />
              {/* Neck */}
              <path d="M125,75 C130,60 135,50 128,40 C122,32 112,30 108,35 C104,40 108,52 110,62 C113,68 120,72 125,75Z" fill="currentColor" />
              {/* Head */}
              <path d="M120,42 C118,35 115,28 110,24 C105,20 100,20 97,24 C94,28 95,35 98,40 C101,45 107,46 112,44 Z" fill="currentColor" />
              {/* Ear */}
              <path d="M105,22 C103,17 101,14 103,12 C105,10 108,12 108,16 Z" fill="currentColor" />
              {/* Nostril */}
              <ellipse cx="97" cy="38" rx="2.5" ry="1.5" fill="rgba(0,0,0,0.4)" />
              {/* Eye */}
              <circle cx="105" cy="30" r="2" fill="rgba(0,0,0,0.5)" />
              {/* Front Legs */}
              <rect x="88" y="112" width="10" height="35" rx="4" fill="currentColor" className={styles.leg1} />
              <rect x="104" y="112" width="10" height="35" rx="4" fill="currentColor" className={styles.leg2} />
              {/* Back Legs */}
              <rect x="68" y="112" width="10" height="35" rx="4" fill="currentColor" className={styles.leg3} />
              <rect x="54" y="112" width="10" height="35" rx="4" fill="currentColor" className={styles.leg4} />
              {/* Tail */}
              <path d="M58,90 C48,95 38,105 35,115 C33,122 38,128 45,125 C50,110 55,100 58,90Z" fill="currentColor" />
              {/* Mane */}
              <path d="M110,62 C118,55 122,45 120,35 C125,40 128,50 126,60 C122,68 116,70 110,68Z" fill="rgba(255,140,0,0.7)" />
            </g>
          </svg>
          {/* Fire particles around horse */}
          {[...Array(8)].map((_, i) => (
            <FireParticle
              key={i}
              style={{
                left: `${15 + i * 10}%`,
                animationDelay: `${i * 0.3}s`,
                width: `${6 + (i % 3) * 4}px`,
                height: `${10 + (i % 3) * 6}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== SECTION 1: TOKEN STAKING ===== */}
      {/* <section className={styles.section} id="token-staking">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Investment Model 1</div>
          <h2 className={styles.sectionTitle}>
            <span className={styles.fireText}>Token Staking</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Purchase Toking Tokens and lock them in our staking protocol to earn competitive yields
            benchmarked against leading DeFi platforms.
          </p>
        </div> */}

      {/* Staking Mechanics */}
      {/* <div className={styles.mechanicsGrid}>
          {[
            { icon: "⏱️", text: "Flexible lock-up periods: 30, 90, 180, or 365 days" },
            { icon: "⚡", text: "Automatic reward distribution every 24 hours" },
            { icon: "📈", text: "Compound earnings for maximum returns" },
            { icon: "🔓", text: "Withdraw anytime after lock-up period" },
          ].map((m, i) => (
            <div key={i} className={styles.mechanicItem}>
              <span className={styles.mechanicIcon}>{m.icon}</span>
              <span className={styles.mechanicText}>{m.text}</span>
            </div>
          ))}
        </div> */}

      {/* APY Tiers */}
      {/* <div className={styles.stakingTiersGrid}>
          {stakingTiers.map((tier, i) => (
            <div
              key={tier.days}
              className={`${styles.stakingCard} ${activeStaking === i ? styles.stakingCardActive : ""}`}
              onClick={() => setActiveStaking(activeStaking === i ? null : i)}
              style={{ "--tier-color": tier.color }}
            >
              <div className={styles.stakingCardGlow} style={{ background: `radial-gradient(circle, ${tier.color}22 0%, transparent 70%)` }} />
              <div className={styles.stakingBadge} style={{ background: tier.color }}>
                {tier.badge}
              </div>
              <div className={styles.stakingDays}>{tier.days}</div>
              <div className={styles.stakingDaysLabel}>DAYS</div>
              <div className={styles.stakingApy}>
                <span className={styles.apyValue}>{tier.min} – {tier.max}</span>
                <span className={styles.apyLabel}>APY</span>
              </div>
              <div className={styles.stakingBar}>
                <div
                  className={styles.stakingBarFill}
                  style={{ width: `${(i + 1) * 25}%`, background: tier.color }}
                />
              </div>
              <Link href="/dashboard/staking" className={styles.stakingBtn} style={{ background: tier.color }}>
                Stake Now →
              </Link>
            </div>
          ))}
        </div>

        <p className={styles.stakingNote}>
          🔥 Returns generated through platform revenue sharing, trading fees, and NFT marketplace activity.
          APY rates adjust dynamically based on total value locked and platform performance.
        </p>
      </section> */}

      {/* Divider with horse */}
      {/* <div className={styles.sectionDivider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerHorse}>
          <HorseIcon />
        </div>
        <div className={styles.dividerLine} />
      </div> */}

      {/* ===== SECTION 2: HORSE NFT PACKAGES ===== */}
      {/* <section className={styles.section} id="nft-packages">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Investment Model 2</div>
          <h2 className={styles.sectionTitle}>
            <span className={styles.fireText}>Horse NFT Packages</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Fractional interests in real, registered horses. Each NFT is backed by legal ownership
            documentation, insurance, and professional management agreements.
          </p>
        </div> */}

      {/* NFT Package Cards */}
      {/* <div className={styles.nftPackagesGrid}>
          {nftPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${styles.nftCard} ${pkg.popular ? styles.nftCardPopular : ""} ${activePackage === pkg.id ? styles.nftCardActive : ""}`}
              onClick={() => setActivePackage(activePackage === pkg.id ? null : pkg.id)}
            >
              {pkg.popular && <div className={styles.popularBadge}>⭐ Most Popular</div>} */}

      {/* Glow bg */}
      {/* <div className={styles.nftCardGlow} style={{ background: `radial-gradient(circle at 50% 30%, ${pkg.glow} 0%, transparent 70%)` }} /> */}

      {/* Tier Header */}
      {/* <div className={styles.nftTierHeader} style={{ background: pkg.gradient }}>
                <span className={styles.nftTierIcon}>{pkg.icon}</span>
                <div>
                  <div className={styles.nftTierName}>{pkg.tier} Tier</div>
                  <div className={styles.nftPackageName}>{pkg.name}</div>
                </div>
              </div> */}

      {/* Price */}
      {/* <div className={styles.nftPrice} style={{ color: pkg.tierColor }}>
                {pkg.price}
              </div> */}

      {/* Features */}
      {/* <ul className={styles.nftFeatures}>
                <li className={styles.nftFeatureItem}>
                  <span className={styles.featureCheck} style={{ color: pkg.tierColor }}>🐴</span>
                  {pkg.nft}
                </li>
                <li className={styles.nftFeatureItem}>
                  <span className={styles.featureCheck} style={{ color: pkg.tierColor }}>🪙</span>
                  {pkg.tokens}
                </li>
                <li className={styles.nftFeatureItem}>
                  <span className={styles.featureCheck} style={{ color: pkg.tierColor }}>📊</span>
                  {pkg.roi} from earnings
                </li>
                <li className={styles.nftFeatureItem}>
                  <span className={styles.featureCheck} style={{ color: pkg.tierColor }}>💰</span>
                  {pkg.dividends}
                </li>
                {pkg.extras.map((extra, i) => (
                  <li key={i} className={styles.nftFeatureItem}>
                    <span className={styles.featureCheck} style={{ color: pkg.tierColor }}>✦</span>
                    {extra}
                  </li>
                ))}
              </ul> */}

      {/* Legal backing */}
      {/* <div className={styles.nftLegal}>
                <span>🔒 Legally backed ownership</span>
              </div>

              <Link
                href={`/dashboard/nft-packages?tier=${pkg.id}`}
                className={styles.nftPurchaseBtn}
                style={{
                  background: pkg.gradient,
                  boxShadow: `0 4px 20px ${pkg.glow}`,
                }}
              >
                Purchase {pkg.tier} Package →
              </Link>
            </div>
          ))}
        </div> */}

      {/* Legal Documentation */}
      {/* <div className={styles.legalDocs}>
          <div className={styles.legalTitle}>📋 Documentation Included With Every NFT</div>
          <div className={styles.legalGrid}>
            {[
              "Horse registration papers",
              "Veterinary health records",
              "Insurance documentation",
              "Training facility contracts",
              "Racing/breeding performance data",
            ].map((doc, i) => (
              <div key={i} className={styles.legalItem}>
                <span className={styles.legalCheck}>✓</span>
                {doc}
              </div>
            ))}
          </div>
        </div> */}
      {/* </section> */}
    </div >
  );
}
