"use client";
import React, { useState, useEffect } from "react";
import Win17pro from "./Win17pro";
import RewardPoolCardpopup from "./RewardPoolCardpopup";
import RewardPoolCard from "./Rewardpool";
import "../poolbanner/Win17pro.css";
import "../poolbanner/rewardpool1.css";
import Rewardwatch from "../public/assets/img/poolbanner/poolwatch.png";
import GroupPool3 from "../public/assets/img/poolbanner/Grouppool3.png";
import Car1 from "../public/assets/img/poolbanner/hyundai-i20-hyundai-i20.png";
import Car2 from "../public/assets/img/poolbanner/pngimgcomhyundai.png";
import Mercedes from "../public/assets/img/poolbanner/mercedes_PNG80179 1.png";
import RewardPoolimage from "../public/assets/img/poolbanner/Apple-iPhone-17-Pro-Max.png";
import WingCardUnlockStatus from "./WingCardUnlockStatus";
import "./mainsliderpage.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Mainsliderpage({ xRank }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("right");
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);

  /* ===========================
     POOL ELIGIBILITY STATE
  =========================== */
  const [eligibilityData, setEligibilityData] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState(null);

  /* ===========================
     FETCH ELIGIBILITY (POPUP 0)
  =========================== */
  const fetchPoolEligibility = async () => {
    try {
   
      setEligibilityLoading(true);
      setEligibilityError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const res = await fetch(
        `${API_URL}/api/ledger/checkPoolRewardEligibility`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error("Failed to fetch eligibility");
      }

      setEligibilityData(json);
    } catch (err) {
      console.error("Eligibility API error:", err);
      setEligibilityError(err.message || "Something went wrong");
    } finally {
      setEligibilityLoading(false);
    }
  };

  /* ===========================
     OPEN POPUP
  =========================== */
const hasXRank = xRank != null; // true only for X1, X2, ...

const openPopup = (i) => {
  // 🔒 Block ONLY if xRank exists
if (i > 0) return;
  if (hasXRank) return;

  setPopupIndex(i);
  setShowPopup(true);
    // 🔥 Fetch eligibility ONLY for Pool 0
    if (i === 0) {
      fetchPoolEligibility();
    }
  };

  /* ===========================
     SLIDES
  =========================== */
  const slides = [
    <Win17pro
      key="0"
      image={RewardPoolimage}
      rewardTitle="iPhone 17 Pro"
      selfLP="1000"
      teamBusiness="15000"
      windowStart="7th Dec 2025"
      windowEnd="15th Jan 2026"
      onEligibilityClick={() => openPopup(0)}
    />,
    <RewardPoolCard
      key="1"
      styleClass="poolreward1-style"
      eligibilityText="Eligibility Criteria"
      leftImage={Rewardwatch}
      rightImage={RewardPoolimage}
      rewardTitle="REWARD POOL 1"
      headingLine1="Have 3 iPhone 17 Pro"
      headingLine2="Achievers in your team"
      rewardLine="iPhone 17 Pro + Apple iWatch"
      note="3 iPhone 17 Pro winners should be from 3 different wings."
      onEligibilityClick={() => openPopup(1)}
    />,
    <RewardPoolCard
      key="2"
      styleClass="RewardPool2-style"
      eligibilityText="Eligibility Criteria"
      leftImage={GroupPool3}
      rightImage={RewardPoolimage}
      rewardTitle="REWARD POOL 2"
      headingLine1="Have 8 iPhone 17 Pro"
      headingLine2="Achievers in your team"
      rewardLine="iPhone 17 Pro + Apple iPad"
      note="Maximum 3 Iphone 17 Pro achivers will be counted from a single wing"
      onEligibilityClick={() => openPopup(2)}
    />,
    <RewardPoolCard
      key="3"
      styleClass="RewardPool3-style"
      eligibilityText="Eligibility Criteria"
      leftImage={Car1}
      rightImage={RewardPoolimage}
      rewardTitle="REWARD POOL 3"
      headingLine1="Have 25 iPhone 17 Pro"
      headingLine2="Achievers in your team"
      rewardLine="iPhone 17 Pro + Car Reward"
      rewardSubLine="Worth 7,500 USDT"
      note="Maximum 9 iPhone 17 Pro achievers will be counted from a single wing"
      onEligibilityClick={() => openPopup(3)}
    />,
    <RewardPoolCard
      key="4"
      styleClass="Rewardpool4-style"
      eligibilityText="Eligibility Criteria"
      leftImage={Car2}
      rightImage={RewardPoolimage}
      rewardTitle="REWARD POOL 4"
      headingLine1="Have 60 iPhone 17 Pro"
      headingLine2="Achievers in your team"
      rewardLine="iPhone 17 Pro + Car Reward"
      rewardSubLine="Worth 11,000 USDT"
      note="Maximum 9 iPhone 17 Pro achievers will be counted from a single wing"
      onEligibilityClick={() => openPopup(4)}
    />,
    <RewardPoolCard
      key="5"
      styleClass="pool5style"
      eligibilityText="Eligibility Criteria"
      leftImage={Mercedes}
      rewardTitle="REWARD POOL 5"
      headingLine1="Build a team with 3 achievers"
      headingLine2="each achiever qualifies"
      extraLineTop="For car reward worth 7,500 USDT"
      rewardLine="A car reward worth"
      rewardSubLine="25,000 USDT"
      note="3 achievers must be from 3 different wings"
      onEligibilityClick={() => openPopup(5)}
    />,
  ];

  /* ===========================
     AUTO SLIDER
  =========================== */
  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 10000);
    return () => clearInterval(interval);
  });

  const nextSlide = () => {
    setDirection("right");
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection("left");
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <div className="WingCard-container">
        <div className="slider-box">
          <div className={`slider-move ${direction}`} key={index}>
            {slides[index]}
          </div>

          <button className="arrow left" onClick={prevSlide}>❮</button>
          <button className="arrow right" onClick={nextSlide}>❯</button>
        </div>

        <div className="slider-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`dot ${index === i ? "active" : ""}`}
              onClick={() => {
                setDirection(i > index ? "right" : "left");
                setIndex(i);
              }}
            />
          ))}
        </div>
      </div>

      {showPopup && popupIndex !== null && (
        <div
          className="WingCard-modal-overlay"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="WingCard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="WingCard-modal-close"
              onClick={() => setShowPopup(false)}
            >
              ✖
            </button>

            {/* 🔥 POOL 0 → REAL ELIGIBILITY */}
            {popupIndex === 0 && (
              <WingCardUnlockStatus
                unlockData={eligibilityData}
                isLoading={eligibilityLoading}
                error={eligibilityError}
              />
            )}

            {/* OTHER POOLS */}
            {popupIndex > 0 && (
              <RewardPoolCardpopup
                xrankLabel={`${popupIndex}`}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
