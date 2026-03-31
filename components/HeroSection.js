"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "../../app/herosection.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useAuth } from "../../context/AuthContext";

import {
  FaYoutube,
  FaTelegram,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaMedium,
} from "react-icons/fa6";

import BlockHeroSection from "./Blogsection";
const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

// KeepGrowingText component (Enlarged and Repositioned)
const KeepGrowingText = () => {
  return (
    <div className="shape_bottom">
      <Image
        src="/assets/images/shapes/shape_ico_hero_section_bottom.svg"
        alt="Bottom Line Shape"
        width={400}
        height={100}
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
};

// Main HeroSection component
const HeroSection = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownConfig, setCountdownConfig] = useState({
    startTimestamp: 1749769230000,
    steps: [
      {
        durationHours: 72,
        percentage: 1,
      },
      {
        durationHours: 72,
        percentage: 0.8,
      },
      {
        durationHours: 72,
        percentage: 0.6,
      },
      {
        durationHours: 72,
        percentage: 0.4,
      },
      {
        durationHours: 72,
        percentage: 0.2,
      },
    ],
    serverTime: 1750328648437,
  });

  useEffect(() => {
    const fetchAirdropConfig = async () => {
      try {
        const token = localStorage.getItem("token")
          ? localStorage.getItem("token")
          : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg1MTRhODJjYzY0ZjVlYmJlMzc5NjcyIn0sImlhdCI6MTc1MDMyODIyNCwiZXhwIjoxNzUwMzM1NDI0fQ.L9H4-X1kFwQ521-NunJ1mp41ScJKyRw-dPonxyttXR0";
        if (!token) return;

        const response = await fetch(`${API_URL}/promotions/airdrop-config`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const config = await response.json();
          setCountdownConfig(config);
          
        } else {
          console.error("Failed to fetch airdrop config");
        }
      } catch (error) {
        console.error("Error fetching airdrop config:", error);
      }
    };

    fetchAirdropConfig();
  }, []);

  useEffect(() => {
    if (
      !countdownConfig ||
      !countdownConfig.steps ||
      !countdownConfig.startTimestamp
    ) {
      setTimeRemaining(null);
      return;
    }

    const calculateAndSetRemainingTime = () => {
      const { startTimestamp, steps } = countdownConfig;
      const now = new Date().getTime();

      if (now < startTimestamp) {
        setIsCountdownActive(false);
        return;
      }

      let cumulativeHours = 0;
      for (const step of steps) {
        const stepEndTimestamp =
          startTimestamp +
          (cumulativeHours + step.durationHours) * 60 * 60 * 1000;

        if (now < stepEndTimestamp) {
          const distance = stepEndTimestamp - now;
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeRemaining({ days, hours, minutes, seconds });
          setIsCountdownActive(true);
          return;
        }

        cumulativeHours += step.durationHours;
      }

      setIsCountdownActive(false);
    };

    calculateAndSetRemainingTime();
    const intervalId = setInterval(calculateAndSetRemainingTime, 1000);

    return () => clearInterval(intervalId);
  }, [countdownConfig]);

  const heroStyle = {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingtop: "10rem",
    position: "relative",
    overflow: "hidden",
    padding: "0px",
  };

  const headlineStyle = {
    fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: "1.5rem",
    zIndex: 2,
  };

  const socialIconsContainerStyle = {
    position: "absolute",
    left: "0rem",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    zIndex: 3,
    padding: "1rem 0.5rem",
    borderRadius: "10px",
  };
  const socialIconsContainerStyleicon = {
    position: "fixed",
    left: "0rem",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    zIndex: 666,
    padding: "1rem 1rem 1rem 0rem",
    borderRadius: "10px",
    background: "#000",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
  };

  // Thematic AnimatedSvgBackground (restored)
  const AnimatedSvgBackground = () => (
    <>
      <div className="decoration_item shape_globe">
        <Image
          src="/assets/images/purple-lines.svg"
          alt="Shape Globe"
          width={400}
          height={400}
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </>
  );
  const socials = [
    {
      href: "https://youtube.com/@BEPVaultChannel",
      icon: <FaYoutube style={{ width: "30px", height: "30px" }} />,
      color: "#FF0000",
    },
    {
      href: "https://t.me/BEPVaultOfficial",
      icon: <FaTelegram style={{ width: "30px", height: "30px" }} />,
      color: "#29A9EA",
    },
    {
      href: "https://facebook.com/profile.php?id=61575834347444",
      icon: <FaFacebookF style={{ width: "30px", height: "30px" }} />,
      color: "#3b5998",
    },
    {
      href: "https://instagram.com/BEPVault",
      icon: <FaInstagram style={{ width: "30px", height: "30px" }} />,
      color: "#C13584",
    },
    { href: "https://x.com/BEPVault", icon: <FaXTwitter />, color: "#000000" },
    {
      href: "https://linkedin.com/company/bepvault",
      icon: <FaLinkedinIn style={{ width: "30px", height: "30px" }} />,
      color: "#0077B5",
    },
    {
      href: "https://medium.com/@BEPVault.Com",
      icon: <FaMedium style={{ width: "30px", height: "30px" }} />,
      color: "#000000",
    },
  ];
  return (
    <>
      <div className="hero-social-icons" style={socialIconsContainerStyleicon}>
        {socials.map(({ href, icon, color }, i) => (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className=" flex items-center justify-center text-white hover:opacity-80 transition"
            style={{ backgroundColor: color }}
          >
            <span className="text-xl">{icon}</span>
          </a>
        ))}
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000 }}
        loop={true}
        pagination={{ clickable: true }}
        navigation
        className="hero-swiper"
        style={{ width: "100%" }}
      >
        {/* Slide 1 */}
        {/* <SwiperSlide>
          <section
            style={heroStyle}
            className="hero-section-container ico_hero_section heroStyle"
          >
            <div
              style={socialIconsContainerStyle}
              className="hero-social-image"
            >
              <AnimatedSvgBackground />
            </div>
            <div style={headlineStyle} className="hero-headline">
              <h1>Your Bridge to the</h1>
              <h1>New Financial Horizon.</h1>
            </div>
          </section>
        </SwiperSlide> */}

        {/* Slide 2 */}
        <SwiperSlide>
          <section className="banner_section_2" style={heroStyle}>
            <BlockHeroSection />
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section className="banner_section_3" style={heroStyle}>
            <div className=" event-section-main min-h-screen bg-black text-white flex items-center px-6 md:px-20 py-12">
              <div className="main-outer-section grid md:grid-cols-2 gap-3 items-center w-full mx-auto">
                {/* Right Content */}
                <section class="event-section">
                  <div class="event-container">
                    <div class="event-content">
                      <div className="event-content-inner">
                        <h1 class="event-title">
                          One Ripple Can Move <br></br> Oceans
                          {/* <span>2025</span> */}
                        </h1>
                      </div>
                      <p class="event-description">
                        Earn daily rewards with USDT liquidity pools—no technical
                        DeFi skills required.
                      </p>
                      <div className="mt-5">
                        {" "}
                        <button className="ico_btn_outline">
                          <a href="/sign-up">Start Earning with USDT</a>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section className="banner_section_4" style={heroStyle}>
            <div className="event-section-main min-h-screen bg-black text-white flex items-center px-6 md:px-20 py-12">
              <div className="main-outer-section grid md:grid-cols-2 gap-3 items-center w-full mx-auto">
                <section class="event-section">
                  <div class="event-container">
                    <div class="event-content">
                      <div className="event-content-inner">
                        <h1 class="event-title">
                          Bridge to the New Financial <br></br> Horizon
                        </h1>
                      </div>
                      <p class="event-description">
                        Join our global community network and earn up to 0.6%
                        returns + referral bonuses
                      </p>

                      <div className="mt-5">
                        {" "}
                        <button className="ico_btn_outline">
                          <a href="/sign-up">Join the Community Program</a>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </SwiperSlide>
      </Swiper>

      <KeepGrowingText />
    </>
  );
};

export default HeroSection;
