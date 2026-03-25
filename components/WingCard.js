"use client";
import React, { useState, useEffect, useRef } from "react";
import "./WingCard.css";
import WingCardUnlockStatus from "./WingCardUnlockStatus";
import Mainsliderpage from "../components/mainsliderpage.js";

export default function XPowerTable({ xRank }) {
  const rootRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div>
      {/* 🔥 CLICK AREA + SLIDER */}
      <div
        ref={rootRef}
        style={{
          borderRadius: 22,
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <Mainsliderpage xRank={xRank} />
      </div>

      {/* 🔓 POPUP */}
    </div>
  );
}
