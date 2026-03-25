"use client";
import { useEffect, useRef, memo } from "react";
import "../../app/herosection.css";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import Myteamsection from "./TeamSection";

// Placeholder for a feature icon (can be replaced with more specific SVGs)
const FeatureIcon = ({ color = "#ffd700" }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill={color} fillOpacity="0.2" />
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 12 12"
      to="360 12 12"
      dur="15s"
      repeatCount="indefinite"
    />
  </svg>
);

const FeatureCard = ({ title, children }) => (
  <div
    style={{
      background: "#0a0a0a",
      padding: "2rem",
      borderRadius: "12px",
      border: "1px solid rgba(255, 215, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    }}
  >
    <div style={{ marginBottom: "1rem" }}>
      <FeatureIcon />
    </div>
    <h3
      style={{
        fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
        color: "#FFFFFF",
        marginBottom: "1rem",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >
      {title}
    </h3>
    <div
      style={{
        fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
        color: "#888888",
        lineHeight: "1.6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </div>
  </div>
);

// Memoized TradingView Widget to prevent re-renders
const TradingViewWidget = memo(() => {
  const container = useRef(null);
  const scriptAppendedRef = useRef(false);
  useEffect(() => {
    if (scriptAppendedRef.current || !container.current) return;
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [["BINANCE:BTCUSDT|1Y"], ["CRYPTOCAP:USDT.D|1D"]],
      chartOnly: false,
      width: "100%",
      height: "100%", // Make widget fill container
      locale: "en",
      colorTheme: "dark",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      fontSize: "12",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      maLineColor: "#ffd700", // Custom MA line color
      maLineWidth: 1,
      maLength: 9,
      headerFontSize: "medium",
      backgroundColor: "rgba(26, 18, 46, 0)", // Transparent background for widget
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
    });
    container.current.appendChild(script);
    scriptAppendedRef.current = true;
    return () => {
      // Clean up script to prevent duplicates if component were to unmount and remount (though memoized)
      if (container.current && container.current.contains(script)) {
        container.current.removeChild(script);
      }
      scriptAppendedRef.current = false;
    };
  }, []);
  return (
    <div
      ref={container}
      style={{
        height: "450px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255, 215, 0, 0.1)",
        background: "#0a0a0a",
      }}
    ></div>
  );
});

const KeyFeaturesSection = () => {
  const sectionStyle = {
    padding: "4rem 2rem",
    backgroundColor: "#000000",
    color: "#E0E0E0",
    borderTop: "1px solid rgba(255, 215, 0, 0.1)",
  };
  const sectionTitleStyle = {
    textAlign: "center",
    fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
    color: "#FFFFFF",
    marginBottom: "3.5rem",
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    textShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", // Responsive grid
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto 3.5rem auto", // Centered with bottom margin
  };
  return (
    <section
      id="id_ico_about_section"
      className="ico_about_section section_space pt-5 section_decoration"
    >
      <div className="decoration_item shape_divider_1">
        <img
          src="assets/images/shapes/shape_section_divider_1.svg"
          alt="Shape Divider"
        />
      </div>
      <div className="container">
        <div className="row justify-content-lg-between">
          <div className="col-lg-6">
            <div
              className="ico_heading_block"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <h2 className="heading_text mb-0">About USDT & BEPVault</h2>
            </div>
            <ul className="about_ico_block unordered_list_block">
              <li
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="100"
              >
                <p className="info_description mb-0">
                  USDT is a leading digital stablecoin designed to maintain a 
                  stable value by being pegged 1:1 to the US Dollar. It provides 
                  the perfect foundation for the BEPVault liquidity ecosystem, 
                  allowing for fast, secure, and predictable transactions. 
                  BEPVault leverages this stability to offer scalable liquidity 
                  solutions across global financial platforms.
                </p>
              </li>
              <li
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="200"
              >
                <p className="info_description mb-0">
                  BEPVault's unique liquidity model and partnership networks 
                  position it as a premier entry point for institutional-grade 
                  digital asset solutions. By utilizing USDT, the platform 
                  enables real-time settlements and significantly reduces 
                  transaction overhead, making it a cornerstone of the 
                  modern digital economy.
                </p>
              </li>
              <li
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="300"
              >
                <h3 className="title_text">Benefits of USDT for BEPVault:</h3>
                <p className="info_description mb-0">
                  Stable Value: Hedged against market volatility with a 1:1 USD peg.
                </p>
                <p className="info_description mb-0">
                  Global Liquidity: Widely accepted and easily convertible across 
                  all major platforms.
                </p>
                <p className="info_description mb-0">
                  Transparent & Secure: Backed by professional audits and established 
                  blockchain protocols.
                </p>
              </li>
            </ul>
          </div>
          <div className="col-lg-5 d-lg-flex flex-lg-column-reverse">
            <ul className="about_ico_block unordered_list_block">
              <li
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="100"
              >
                <h3 className="title_text">Yield Structure</h3>
                <p className="info_description mb-0">
                  - LP Rewards: Upto 0.6% compounded
                </p>
                <p className="info_description mb-0">
                  - Performance-based yield tied to real market liquidity
                </p>
                <p className="info_description mb-0">
                  - Auto-distributed to wallet, trackable 24/7
                </p>
              </li>
            </ul>
            <div className="ico_about_image text-center">
              <div className="ripple_shape">
                <svg
                  viewBox="0 0 501 455"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M500.5 227.5C500.5 352.824 388.618 454.5 250.5 454.5C112.382 454.5 0.5 352.824 0.5 227.5C0.5 102.176 112.382 0.5 250.5 0.5C388.618 0.5 500.5 102.176 500.5 227.5Z"
                    stroke="url(#sro_paint0)"
                  />
                  <path
                    d="M463.5 247.5C463.5 361.81 368.15 454.5 250.5 454.5C132.85 454.5 37.5 361.81 37.5 247.5C37.5 133.19 132.85 40.5 250.5 40.5C368.15 40.5 463.5 133.19 463.5 247.5Z"
                    stroke="url(#sro_paint1)"
                  />
                  <path
                    d="M425.5 268C425.5 371.031 347.12 454.5 250.5 454.5C153.88 454.5 75.5 371.031 75.5 268C75.5 164.969 153.88 81.5 250.5 81.5C347.12 81.5 425.5 164.969 425.5 268Z"
                    stroke="url(#sro_paint2)"
                  />
                  <path
                    d="M379.5 268C379.5 343.5 321.715 405.5 250.5 405.5C179.285 405.5 121.5 343.97 121.5 268C121.5 192.03 179.285 130.5 250.5 130.5C321.715 130.5 379.5 192.03 379.5 268Z"
                    stroke="url(#sro_paint3)"
                  />
                  <defs>
                    <linearGradient
                      id="sro_paint0"
                      x1="250.5"
                      y1="0"
                      x2="250.5"
                      y2="455"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stop-color="#ffd700" />
                      <stop offset="1" stop-color="#ffd700" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="sro_paint1"
                      x1="250.5"
                      y1="40"
                      x2="250.5"
                      y2="455"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stop-color="#ffd700" />
                      <stop offset="1" stop-color="#ffd700" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="sro_paint2"
                      x1="250.5"
                      y1="81"
                      x2="250.5"
                      y2="455"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stop-color="#ffd700" />
                      <stop offset="1" stop-color="#ffd700" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="sro_paint3"
                      x1="250.5"
                      y1="130"
                      x2="250.5"
                      y2="406"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stop-color="#ffd700" />
                      <stop offset="1" stop-color="#ffd700" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="coin_image">
                <img
                  src="assets/images/home-hero.svg"
                  alt="BEPVault"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="decoration_item shape_shadow_1">
        <img
          src="assets/images/shapes/shape_poligon.svg"
          alt="Shape Color Shadow"
        />
      </div>
      <div className="decoration_item shape_shadow_2">
        <img
          src="assets/images/shapes/shape_poligon.svg"
          alt="Shape Color Shadow"
        />
      </div>
          <Myteamsection />
    </section>
  );
};

export default KeyFeaturesSection;
