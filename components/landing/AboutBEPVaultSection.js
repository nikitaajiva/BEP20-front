"use client";
import "../../app/herosection.css";
import Image from "next/image";
import Link from "next/link";
// import Image from 'next/image'; // Not using Next/Image for now if SVGs are inline

// Simple Animated SVG Placeholder 1
const AnimatedAbstractIllustration1 = () => (
  <svg
    width="100%"
    height="300"
    viewBox="0 0 400 300"
    preserveAspectRatio="xMidYMid meet"
    style={{ borderRadius: "8px", border: "1px solid #3A2D66" }}
  >
    <rect width="400" height="300" fill="#1A122E" />
    {[...Array(5)].map((_, i) => (
      <circle key={i} fill="#7C3AED" opacity="0.3">
        <animate
          attributeName="cx"
          values={`${50 + i * 70}; ${350 - i * 70}; ${50 + i * 70}`}
          dur="10s"
          repeatCount="indefinite"
          begin={`${i * 0.5}s`}
        />
        <animate
          attributeName="cy"
          values={`${50 + Math.random() * 50}; ${150 + Math.random() * 50}; ${
            50 + Math.random() * 50
          }`}
          dur="8s"
          repeatCount="indefinite"
          begin={`${i * 0.7}s`}
        />
        <animate
          attributeName="r"
          values="10; 30; 10"
          dur="6s"
          repeatCount="indefinite"
          begin={`${i * 0.3}s`}
        />
      </circle>
    ))}
    <path stroke="#5D50FE" strokeWidth="2" fill="none" opacity="0.5">
      <animate
        attributeName="d"
        values="M20 150 Q 100 50 200 150 T 380 150; M20 150 Q 100 250 200 150 T 380 150; M20 150 Q 100 50 200 150 T 380 150"
        dur="7s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Simple Animated SVG Placeholder 2
const AnimatedAbstractIllustration2 = () => (
  <svg
    width="100%"
    height="300"
    viewBox="0 0 400 300"
    preserveAspectRatio="xMidYMid meet"
    style={{ borderRadius: "8px", border: "1px solid #3A2D66" }}
  >
    <rect width="400" height="300" fill="#1A122E" />
    {[...Array(3)].map((_, i) => (
      <rect key={i} fill="#5D50FE" opacity="0.4">
        <animate
          attributeName="x"
          values={`${20 + i * 120}; ${180 - i * 60}; ${20 + i * 120}`}
          dur="9s"
          repeatCount="indefinite"
          begin={`${i * 0.6}s`}
        />
        <animate
          attributeName="y"
          values="50; 150; 50"
          dur="7s"
          repeatCount="indefinite"
          begin={`${i * 0.4}s`}
        />
        <animate
          attributeName="width"
          values="80; 40; 80"
          dur="5s"
          repeatCount="indefinite"
          begin={`${i * 0.2}s`}
        />
        <animate
          attributeName="height"
          values="20; 60; 20"
          dur="6s"
          repeatCount="indefinite"
          begin={`${i * 0.5}s`}
        />
        <animate
          attributeName="rx"
          values="4; 10; 4"
          dur="8s"
          repeatCount="indefinite"
        />
      </rect>
    ))}
    <path
      stroke="#7C3AED"
      strokeWidth="1.5"
      fill="none"
      opacity="0.6"
      strokeDasharray="5,5"
    >
      <animate
        attributeName="d"
        values="M50 50 L 350 50 L 350 250 L 50 250 Z; M50 50 L 350 250 L 50 250 L 350 50 Z; M50 50 L 350 50 L 350 250 L 50 250 Z"
        dur="12s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="stroke-dashoffset"
        values="0; 1000; 0"
        dur="20s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const AboutBEPVaultSection = () => {
  const sectionStyle = {
    padding: "4rem 2rem",
    backgroundColor: "#000000",
    color: "#E0E0E0",
    borderTop: "1px solid rgba(255, 215, 0, 0.1)",
    borderBottom: "1px solid rgba(255, 215, 0, 0.1)",
  };

  const sectionTitleStyle = {
    textAlign: "center",
    fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
    color: "#FFFFFF",
    marginBottom: "3rem",
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    textShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
  };

  const contentRowStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "3.5rem", // Increased gap
    maxWidth: "1200px", // Max width for content area
    margin: "0 auto", // Center content
  };

  const aboutBlockStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "2.5rem",
    padding: "2.5rem",
    backgroundColor: "#0a0a0a",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 215, 0, 0.1)",
  };

  const aboutBlockStyleReverse = {
    ...aboutBlockStyle,
    flexDirection: "row-reverse",
  };

  const imageContainerStyle = {
    flex: "1 1 40%", // Flex basis for image
    minWidth: "300px", // Minimum width for image container
    maxWidth: "450px",
    height: "300px", // Fixed height for SVG container
  };

  const textContainerStyle = {
    flex: "1 1 60%", // Flex basis for text
  };

  const headingStyle = {
    fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
    color: "#E0D8FF", // Brighter lavender for headings
    marginBottom: "1.5rem",
    fontFamily: "Inter, sans-serif",
    fontWeight: "600",
  };

  const paragraphStyle = {
    fontSize: "clamp(0.95rem, 1.6vw, 1.05rem)",
    lineHeight: "1.75",
    color: "#C0B8FF", // Lighter paragraph text for better readability
    fontFamily: "Inter, sans-serif",
    marginBottom: "1rem",
  };

  return (
    <>
      <section
        id="id_ico_whitepaper_section"
        className="ico_whitepaper_section pb-5 section_decoration"
      >
        <div className="container">
          <div
            className="ico_heading_block text-center mt-lg-4"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <h2 className="heading_text mb-0">
              One Drop can move oceans. Be the force behind the Vault.
            </h2>
          </div>
          <div
            className="whitepaper_content mb-5"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
          >
            <div className="row m-0 align-items-center">
              <div className="col-lg-5 p-0">
                <img
                  src="assets/images/about/tobt21.jpg"
                  className="img-fluid"
                  alt="About BEPVault"
                />
              </div>
              <div className="col-lg-7 p-0">
                <div className="whitepaper_info_wrap">
                  <div className="info_wrap_1">
                    <h3 className="heading_text">About BEPVault®</h3>
                    <p>
                      BEPVault is a cutting-edge affiliate marketing platform
                      designed to bring liquidity to the global financial
                      ecosystem through strategic partnerships. As a premier
                      liquidity provider (LP) entry point, BEPVault
                      is dedicated to expanding the reach of digital
                      financial services while ensuring seamless, efficient, and
                      secure transactions for users worldwide.<br></br>
                      Whether you're a seasoned investor, a financial
                      professional, or a crypto enthusiast, the BEPVault
                      platform offers a unique opportunity to profit from
                      affiliate marketing in the growing world of digital
                      assets. Partner with us, help expand the BEPVault liquidity
                      pool, and gain access to various revenue streams and
                      benefits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="whitepaper_content mb-5"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
          >
            <div className="row m-0 align-items-center">
              <div className="col-lg-5 p-0">
                <img
                  src="assets/images/about/tobt22.jpg"
                  className="img-fluid"
                  alt="About BEPVault"
                />
              </div>
              <div className="col-lg-7 p-0">
                <div className="whitepaper_info_wrap">
                  <div className="info_wrap_2">
                    <h3 className="heading_text">About BEPVault Tech®</h3>
                    <p>
                      BEPVault Tech is a premium liquidity infrastructure
                      designed to meet the growing demand for seamless, fast,
                      and secure transactions within the digital finance space.
                      Powered by USDT, one of the world’s most efficient digital
                      currencies, BEPVault delivers high liquidity, low
                      transaction fees, and exceptional speed for cross-border
                      payments, trading, and financial operations. The platform
                      leverages trusted and widely adopted blockchain networks,
                      enabling fast settlements and improving the overall
                      efficiency of the global financial infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutBEPVaultSection;
