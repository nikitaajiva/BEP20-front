"use client";
import React from "react";
import Image from "next/image";
import "../poolbanner/Win17pro.css";

export default function Win17Pro({
  image,
  title = "Iphone 17 Pro",
  selfLP = "1000",
  teamBusiness = "15000",
  notes = [
    "(Only fresh Team Business will be calculated)",
    "(Max 5000 USDT will be counted from any single wing)",
    "(Excluding xRank Holders)",
  ],
  windowStart = "7th Dec 2025",
  windowEnd = "15th Jan 2026",
  onEligibilityClick,
}) {
  return (
    <>
      {/* ================= DESKTOP VIEW ================= */}
      <div className="desktop-view w-100">
        <div className="win-banner">
          <div className="eligibility" onClick={onEligibilityClick}>
            <span className="lock">
              <svg width="24" height="24" viewBox="0 0 17 24" fill="none">
                <path
                  d="M0 11.61C0 10.13 1.19 8.93 2.68 8.93H13.4C14.88 8.93 16.08 10.13 16.08 11.61V20.54C16.08 22.02 14.88 23.22 13.4 23.22H2.68C1.19 23.22 0 22.02 0 20.54V11.61Z"
                  fill="#D96C39"
                />
                <path
                  d="M7.14 15.18C7.14 14.69 7.54 14.29 8.04 14.29C8.53 14.29 8.93 14.69 8.93 15.18V19.65C8.93 20.14 8.53 20.54 8.04 20.54C7.54 20.54 7.14 20.14 7.14 19.65V15.18Z"
                  fill="white"
                />
                <path
                  d="M9.82 14.29C9.82 15.28 9.02 16.08 8.04 16.08C7.05 16.08 6.25 15.28 6.25 14.29C6.25 13.30 7.05 12.50 8.04 12.50C9.02 12.50 9.82 13.30 9.82 14.29Z"
                  fill="white"
                />
                <path
                  d="M1.78 9.40H4.46V4.94C4.91 2.26 11.16 1.81 11.61 4.94V9.40H14.29V4.94C13.42 -1.42 3.18 -1.86 1.78 4.94V9.40Z"
                  fill="#D96C39"
                />
              </svg>
            </span>
            Eligibilty Criteria
          </div>

          <div className="win-banner-left">
            <div>
              <Image src={image} alt={title} priority />
            </div>
          </div>

          <div className="win-banner-right">
            <h2>
              <span>Win</span>
              <span>{title}</span>
            </h2>

            <div>
              <h3>
                {selfLP} <span>USDT</span> Self LP
              </h3>

              <h3>
                {teamBusiness} <span>USDT</span> Team Business
              </h3>
            </div>

            <div>
              {notes?.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
            </div>

            <div>
              <h4>Qualification Window</h4>
              <h5>
                {windowStart} to {windowEnd}
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="USDTwinreward-banner-container mobile-view">
        <div
          className="USDTwinreward-eligibility-badge"
          onClick={onEligibilityClick}
        >
          <span className="lock">
            <svg width="24" height="24" viewBox="0 0 17 24" fill="none">
              <path
                d="M0 11.61C0 10.13 1.19 8.93 2.68 8.93H13.4C14.88 8.93 16.08 10.13 16.08 11.61V20.54C16.08 22.02 14.88 23.22 13.4 23.22H2.68C1.19 23.22 0 22.02 0 20.54V11.61Z"
                fill="#D96C39"
              />
              <path
                d="M7.14 15.18C7.14 14.69 7.54 14.29 8.04 14.29C8.53 14.29 8.93 14.69 8.93 15.18V19.65C8.93 20.14 8.53 20.54 8.04 20.54C7.54 20.54 7.14 20.14 7.14 19.65V15.18Z"
                fill="white"
              />
              <path
                d="M9.82 14.29C9.82 15.28 9.02 16.08 8.04 16.08C7.05 16.08 6.25 15.28 6.25 14.29C6.25 13.30 7.05 12.50 8.04 12.50C9.02 12.50 9.82 13.30 9.82 14.29Z"
                fill="white"
              />
              <path
                d="M1.78 9.40H4.46V4.94C4.91 2.26 11.16 1.81 11.61 4.94V9.40H14.29V4.94C13.42 -1.42 3.18 -1.86 1.78 4.94V9.40Z"
                fill="#D96C39"
              />
            </svg>
          </span>
          Eligibilty Criteria
        </div>

        <div className="USDTwinreward-main-content">
          <h2 className="USDTwinreward-headline">Win {title}</h2>

          <div className="USDTwinreward-image-container">
            <div className="USDTwinreward-img-wrapper">
              <Image src={image} alt={title} />
            </div>
          </div>

          <div className="USDTwinreward-qualification-box">
            <div className="USDTwinreward-qualification-title">
              {selfLP} <span>USDT</span> Self LP
              <br />
              {teamBusiness} <span>USDT</span> Team Business
            </div>

            <div className="USDTwinreward-qualification-notes">
              {notes?.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
            </div>

            <div className="USDTwinreward-qualification-window">
              <div className="USDTwinreward-window-title">
                Qualification Window
              </div>
              <div className="USDTwinreward-window-date">
                {windowStart} to {windowEnd}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
