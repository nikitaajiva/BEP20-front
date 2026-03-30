"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../terms/terms.module.css";

export default function PrivacyPage() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles for background
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      <Head>
        <title>Privacy Policy | BEPVault Protocol</title>
        <meta name="description" content="Official platform data protection and privacy service agreements for BEPVault." />
      </Head>

      <div className={styles.termsPage}>
        {/* Animated Background Layers */}
        <div className={styles.lightRaysContainer}>
          <div className={styles.ray}></div>
          <div className={styles.ray} style={{ animationDuration: '80s', opacity: 0.3 }}></div>
        </div>
        
        <div className={styles.bgAnimation}>
          {particles.map((p) => (
            <div
              key={p.id}
              className={styles.particle}
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            ></div>
          ))}
        </div>

        <div className={styles.mainContainer}>
          {/* Header Section: Hero Layout */}
          <header className={styles.headerSection}>

            {/* Tactical Emblem */}
            <div className={styles.logoBoxTop}>
              <Image
                  src="/bepvault_logo.png"
                  alt="BEPVault Logo"
                  width={60}
                  height={60}
                  priority
              />
            </div>

            <div className={styles.titleWrapper}>
              <span className={styles.portalStatus}>• SECURE DATA PORTAL •</span>
              <h1 className={styles.title}>
                PRIVACY
                <span className={styles.vaultText}>CENTER</span>
              </h1>
              <div className={styles.headerDivider}></div>
            </div>
          </header>

          {/* Grid Content: Full Width Expansion */}
          <div className={styles.contentBody}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>01</span> 
                Sovereignty Charter
              </h2>
              <p className={styles.text}>
                At BEPVault, we uphold the principle of absolute data sovereignty. We utilize high-fidelity cryptographic interfaces to ensure your self-custodial financial footprint remains autonomous and private.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>02</span> 
                Collection Logic
              </h2>
              <p className={styles.text}>
                The BEPVault gateway operates with surgical precision. We only process public blockchain addresses and minimal metadata required to maintain your active command center session across the BEP20 network.
              </p>
              <div className={styles.list}>
                <div className={styles.listItem}>Zero behavioral profiling scripts</div>
                <div className={styles.listItem}>Opaque blockchain logging</div>
                <div className={styles.listItem}>Local-only secure authentication</div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>03</span> 
                Encrypted Auth
              </h2>
              <p className={styles.text}>
                Gateway access tokens and authentication state metadata are maintained in secure Local Storage within your client. We do not transmit or store private credentials on central servers.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>04</span> 
                Public Ledgering
              </h2>
              <p className={styles.text}>
                All interactions within the BEP20 ecosystem are publicly broadcast on the blockchain. Information including balance states and transaction history is inherently public and outside the protocol's control.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>05</span> 
                Gateway Security
              </h2>
              <p className={styles.text}>
                We employ world-class encryption and decentralized gateways to ensure your session parameters remain protected from unauthorized interception within the ecosystem.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>06</span> 
                Protocol Updates
              </h2>
              <p className={styles.text}>
                We periodically refine this privacy architecture to reflect new protocol enhancements. Continued use of the BEPVault interface implies full acceptance of our localized privacy standards.
              </p>
            </div>
          </div>

          <div className={styles.cornerStar}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(255,215,0,0.5)"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
