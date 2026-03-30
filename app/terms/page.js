"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "./terms.module.css";

export default function TermsPage() {
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
        <title>Terms & Conditions | BEPVault Protocol</title>
        <meta name="description" content="Official platform terms and liquidity provision service agreements for BEPVault." />
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
              <span className={styles.portalStatus}>• AUTHENTIC PROTOCOL PORTAL •</span>
              <h1 className={styles.title}>
                PROJECT
                <span className={styles.vaultText}>TERMS</span>
              </h1>
              <div className={styles.headerDivider}></div>
            </div>
          </header>

          {/* Grid Content: Full Width Expansion */}
          <div className={styles.contentBody}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>01</span> 
                THE ECOSYSTEM
              </h2>
              <p className={styles.text}>
                Welcome to the BEPVault command center. By accessing our interface, you are entering an advanced decentralized ecosystem. These terms govern your utilization of our high-fidelity BEP20 liquidity bridge.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>02</span> 
                USAGE PROTOCOL
              </h2>
              <p className={styles.text}>
                Interface access requires a verified Web3 environment. You are exclusively responsible for the integrity of your private encryption keys and session authorization within the vault.
              </p>
              <div className={styles.list}>
                <div className={styles.listItem}>Automated frequency limits enforced</div>
                <div className={styles.listItem}>Global AML/KYC standards maintained</div>
                <div className={styles.listItem}>Absolute self-custodial architecture</div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>03</span> 
                LIQUIDITY DYNAMICS
              </h2>
              <p className={styles.text}>
                Participating in liquidity provision carries inherent protocol risks and market volatility. BEPVault serves as a high-fidelity visualization layer for underlying smart contracts; we do not control network-wide liquidity flows.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>04</span> 
                TX IMMUTABILITY
              </h2>
              <p className={styles.text}>
                All BEP20 network operations are irreversible. The BEPVault protocol is technically incapable of retrieving funds sent to erroneous destinations or reversing smart contract interactions once broadcast.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>05</span> 
                GOVERNANCE ASSETS
              </h2>
              <p className={styles.text}>
                All branding, technological frameworks, and aesthetic elements featured in the BEPVault command center are the exclusive property of the protocol governance and are protected under international law.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>06</span> 
                SECURE CHANNELS
              </h2>
              <p className={styles.text}>
                For mission-critical assistance, utilize only our verified Telegram support terminal. BEPVault representatives will never initiate contact to request your secure seed phrases or private passwords.
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
