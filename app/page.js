"use client";
import Head from "next/head";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AboutBEPVaultSection from "../components/landing/AboutBEPVaultSection";
import KeyFeaturesSection from "../components/landing/KeyFeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import FAQSection from "../components/landing/FAQSection";
import LandingFooter from "../components/landing/LandingFooter";
import AffiliateProgram from "../components/landing/AffiliateProgram";
// Import other sections as they are created
// import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  const sectionsAdded = 5; // Hero, About, KeyFeatures, HowItWorks, FAQ

  return (
    <div
      style={{
        backgroundColor: "#000000",
        color: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      <Head>
        <title>BEPVault | Level Up Your Financial Game</title>
        <meta
          name="description"
          content="Join BEPVault - Your gateway to the new financial horizon. Claim your airdrop and explore the future of BEP20 liquidity."
        />
        <link rel="icon" href="/favicon.ico" />{" "}
        {/* Make sure favicon exists in /public */}
      </Head>
      <LandingNavbar />
      <HeroSection />
      <AboutBEPVaultSection />
      <KeyFeaturesSection />
      <HowItWorksSection />
      <AffiliateProgram />
      <FAQSection />
      <LandingFooter />
      {/* Placeholder for page content - to be replaced by sections */}
      <main
        style={{
          padding: "2rem",
          textAlign: "center",
          display: sectionsAdded >= 5 ? "none" : "block",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Footer Coming Next!
        </h1>
        <p style={{ fontSize: "1.2rem" }}>Almost there!</p>
      </main>
      {/* Global styles can be added here or in a separate CSS file later */}
      <style jsx global>{`
        body {
          margin: 0;
          /* Updated font stack for a more modern, clean sans-serif look */
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
            "Helvetica Neue", sans-serif;
          background-color: #000000; /* Ensure body background matches */
        }
        a {
          /* Adjust link color to fit the new theme, e.g., a lighter purple/blue */
          color: #ffd700;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        /* Add a Google Font import if Inter is not locally available and if desired later */
        /* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); */
      `}</style>
    </div>
  );
}

