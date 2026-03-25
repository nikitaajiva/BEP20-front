"use client";
import "../../app/herosection.css";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useEffect, useState } from "react";

// Styled Components
const StepIconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ color }) => `linear-gradient(135deg, ${color}, #ffc107)`};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
`;

const Section = styled.section`
  padding: 4rem 2rem;
  background-color: #000000;
  color: #e0e0e0;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: clamp(2.2rem, 4.5vw, 3.2rem);
  color: #ffffff;
  margin-bottom: 3.5rem;
  font-family: "Inter, sans-serif";
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StepCard = styled.div`
  background: #0a0a0a;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
`;

const StepTitle = styled.h3`
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  color: #ffffff;
  margin-bottom: 1rem;
  font-family: "Inter, sans-serif";
  font-weight: 600;
`;

const StepDescription = styled.p`
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  color: #888888;
  line-height: 1.6;
  font-family: "Inter, sans-serif";
`;

const StepIcon = ({ stepNumber, color = "#ffd700" }) => (
  <StepIconContainer color={color}>{stepNumber}</StepIconContainer>
);

const HowItWorksSection = () => {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await fetch("/api/steps");
        const data = await response.json();
        setSteps(data);
      } catch (error) {
        console.error("Error fetching steps:", error);
      }
    };

    fetchSteps();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = `
    {
      "symbols": [
        ["BINANCE:BTCUSDT|1Y"]
      ],
      "chartOnly": false,
      "width": "100%",
      "height": "300",
      "locale": "en",
      "colorTheme": "dark",
      "autosize": true,
      "showVolume": true,
      "showMA": true,
      "hideDateRanges": false,
      "hideMarketStatus": false,
      "hideSymbolLogo": false,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "12",
      "gridLineColor": "#2a2e39",
      "lineColor": "#2962FF",
      "topColor": "rgba(41, 98, 255, 0.3)",
      "bottomColor": "rgba(41, 98, 255, 0.0)"
    }
    `;

    const container = document.querySelector(
      ".tradingview-widget-container__widget"
    );
    if (container) {
      container.innerHTML = ""; // Clear previous
      container.appendChild(script);
    }
  }, []);

  return (
    <>
      <section
        id="id_ico_feature_section"
        className="problem_solution_section pb-0"
      >
        <div className="container">
          <div
            className="ico_heading_block text-center"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <h2 className="heading_text mb-0">
              Why Choose BEPVault’s Liquidity Provider Program?
            </h2>
          </div>
          <div
            className="ico_problem_solution_table"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="100"
          >
            <div className="column_wrapper">
              <div className="column_problem">
                <h3 className="heading_text">
                  <span className="icon">
                    <Image
                      src="/assets/icons/icon_man_question.svg"
                      alt="Icon Man With Question"
                      width={32}
                      height={32}
                    />
                  </span>
                  <span className="text">Benefits</span>
                </h3>
                <ul className="iconlist_block unordered_list_block">
                  <li>
                    <span className="iconlist_icon">
                      <Image
                        src="/assets/icons/icon_check.svg"
                        alt="Icon Check"
                        width={20}
                        height={20}
                      />
                    </span>
                    <span className="iconlist_label">
                      The BEPVault LP Program is uniquely positioned to
                      benefit users looking to maximize their profits from
                      digital asset transactions. By offering deep liquidity,
                      reduced fees, and fast transaction processing, BEPVault 
                      has established itself as a leader in the LP space.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="column_solution">
                <h3 className="heading_text">
                  <span className="icon">
                    <Image
                      src="/assets/icons/icon_bulb.svg"
                      alt="Icon Bulb"
                      width={32}
                      height={32}
                    />
                  </span>
                  <span className="text">Ecosystem</span>
                </h3>
                <ul className="iconlist_block unordered_list_block">
                  <li>
                    <span className="iconlist_icon">
                      <Image
                        src="/assets/icons/icon_check.svg"
                        alt="Icon Check"
                        width={20}
                        height={20}
                      />
                    </span>
                    <span className="iconlist_label">
                      As part of this ecosystem, affiliates have the opportunity
                      to earn commissions by introducing new users to the
                      platform, while contributing to the growth of the
                      USDT-powered liquidity pool.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ico_feature_section mt-5 section_decoration">
        <div className="container">
          <div className="row justify-content-lg-between mb-5">
            <div
              className="col-lg-5"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                className="ico_heading_block"
                data-aos="fade-up"
                data-aos-duration="600"
              >
                <h2 className="heading_text mb-0">Why BEPVault?</h2>
              </div>
              <ul className="ico_features_group unordered_list_block">
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="100"
                >
                  <div className="ico_iconbox_icon_left">
                    <div className="iconbox_icon">
                      <Image
                        src="/assets/icons/icon_dollar_3b.png"
                        alt="Icon Dollar"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="iconbox_info">
                      <h3 className="iconbox_title">
                        At BEPVault, we understand the power of community and
                        collaboration. By becoming an affiliate, you’re not just
                        promoting a product or service; you’re playing a
                        critical role in growing the global USDT liquidity pool
                        and driving adoption of a platform that aims to
                        transform digital finance.
                      </h3>
                    </div>
                  </div>
                </li>
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="200"
                >
                  <div className="ico_iconbox_icon_left mt-4">
                    <div className="iconbox_icon">
                      <Image
                        src="/assets/icons/icon_dollar_3a.png"
                        alt="Icon Chart"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="iconbox_info">
                      <h3 className="iconbox_title">
                        Our Affiliate Marketing Program is designed to offer
                        unparalleled earning potential by connecting you with a
                        network of individuals and businesses looking to enhance
                        their financial transactions. Whether you’re an
                        influencer, a financial educator, or just someone with
                        an interest in the crypto space, BEPVault gives you the
                        tools to succeed.
                      </h3>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div
              className="col-lg-6"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
              }}
            >
              <div
                className="tradingview-widget-container"
                style={{ width: "100%", marginBottom: "2rem" }}
              >
                <div className="tradingview-widget-container__widget"></div>
              </div>

              <ul className="ico_features_group unordered_list_block ">
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="300"
                >
                  <div className="ico_iconbox_icon_left">
                    <div className="iconbox_icon">
                      <Image
                        src="/assets/icons/icon_dollar_3c.png"
                        alt="Icon Gift"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="iconbox_info">
                      <h3 className="iconbox_title">
                        The Community Program – Earn While Promoting
                      </h3>
                      <p className="iconbox_description mb-0">
                        BEPVault offers one of the most rewarding affiliate
                        marketing programs in the cryptocurrency and finance
                        sector. By promoting BEPVault’s liquidity
                        services, you can earn commissions for every successful
                        referral that joins the platform.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="decoration_item shape_shadow_1">
          <Image
            src="/assets/images/shapes/shape_poligon.svg"
            alt="Shape Color Shadow"
            width={100}
            height={100}
          />
        </div>
        <div className="decoration_item shape_shadow_2">
          <Image
            src="/assets/images/shapes/shape_poligon.svg"
            alt="Shape Color Shadow"
            width={100}
            height={100}
          />
        </div>
      </section>

      <section
        id="id_ico_service_section"
        className="ico_service_section section_space pb-0 section_decoration section_shadow_top"
      >
        <div className="decoration_item shape_divider_1">
          <img
            src="assets/images/shapes/shape_section_divider_1.svg"
            alt="Shape Divider"
          />
        </div>
        <div className="container">
          <div
            className="ico_heading_block text-center mt-lg-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <h2 className="heading_text mb-0">How It Works?</h2>
          </div>
          <div className="row m-lg-0 justify-content-center">
            <div
              className="col-lg-4 p-lg-0"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
            >
              <div className="ico_service_image mt-3">
                <img src="assets/images/USDT-paper.png" alt="USDT Service Icon" />
              </div>
            </div>
            <div
              className="col-lg-4 p-lg-0 order-lg-first text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
            >
              <div className="ico_iconbox_block">
                <div className="iconbox_icon">
                  <img
                    src="assets/images/services/icon_pinpoint.png"
                    alt="Icon Pinpoint"
                  />
                </div>
                <div className="iconbox_info">
                  <h3 className="iconbox_title">Connect</h3>
                  <p className="iconbox_description mb-0">
                    Start by securely connecting your Primary Vault (USDT) to the
                    BEPVault platform. This integration allows you to interact
                    directly with our infrastructure, enabling smooth deposits,
                    real-time tracking, and full control over your digital
                    assets.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 p-lg-0 text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="300"
            >
              <div className="ico_iconbox_block">
                <div className="iconbox_icon">
                  <img
                    src="assets/icons/icon_bank_building.svg"
                    alt="Icon Bank Building"
                  />
                </div>
                <div className="iconbox_info">
                  <h3 className="iconbox_title">Deposit</h3>
                  <p className="iconbox_description mb-0">
                    Once your wallet is connected, deposit USDT into the LP
                    wallet. Your assets are used to contribute to high-liquidity
                    pools, enabling efficient transactions across the global
                    financial network. All deposits are protected with
                    institutional-grade security protocols.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 p-lg-0 text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="500"
            >
              <div className="ico_iconbox_block">
                <div className="iconbox_icon">
                  <img
                    src="assets/icons/icon_dollar_21e.png"
                    alt="Icon Dollar"
                  />
                </div>
                <div className="iconbox_info">
                  <h3 className="iconbox_title">Participate</h3>
                  <p className="iconbox_description mb-0">
                    Join real institutional liquidity pools designed to optimize
                    yield and ensure steady flow within the USDT ecosystem. By
                    participating, you support global liquidity needs while
                    tapping into sophisticated financial infrastructure.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 p-lg-0 text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="400"
            >
              <div className="ico_iconbox_block">
                <div className="iconbox_icon">
                  <img
                    src="assets/icons/icon_dollar_4a.png"
                    alt="Icon Dollar"
                  />
                </div>
                <div className="iconbox_info">
                  <h3 className="iconbox_title">Earn</h3>
                  <p className="iconbox_description mb-0">
                    Earn daily rewards automatically, based on the performance
                    and activity of the liquidity pools. Your returns are
                    calculated transparently, offering compounding benefits with
                    options including reallocation to LP or redemption,
                    depending on your financial strategy.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 p-lg-0 text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="500"
            >
              <div className="ico_iconbox_block">
                <div className="iconbox_icon">
                  <img src="assets/icons/icon_dollar_26c.png" alt="Icon Scan" />
                </div>
                <div className="iconbox_info">
                  <h3 className="iconbox_title">Redeem</h3>
                  <p className="iconbox_description mb-0">
                    Maintain full control over your funds with 24/7 access.
                    Track real-time performance, manage allocations, and Redeem
                    your earnings at any time. BEPVault is built with user
                    transparency in mind, offering tools and dashboard that
                    empower you with actionable insights.
                  </p>
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
      </section>
    </>
  );
};

export default HowItWorksSection;

