"use client";
import React, { useState, useEffect } from "react";
import styles from "./WorldClock.module.css";

const timezones = [
  { name: "Local", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { name: "UTC", timezone: "UTC" },
  { name: "New York", timezone: "America/New_York" },
  { name: "London", timezone: "Europe/London" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
];

const AnalogClock = ({ time }) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondHandAngle = seconds * 6;
  const minuteHandAngle = minutes * 6 + seconds * 0.1;
  const hourHandAngle = hours * 30 + minutes * 0.5;

  return (
    <div className={styles.analogClock}>
      <div
        className={styles.hand}
        style={{
          transform: `rotate(${hourHandAngle}deg)`,
          height: "25%",
          top: "25%",
          background: "#64ffda",
        }}
      ></div>
      <div
        className={styles.hand}
        style={{
          transform: `rotate(${minuteHandAngle}deg)`,
          height: "35%",
          top: "15%",
          background: "#a1b2ff",
        }}
      ></div>
      <div
        className={styles.hand}
        style={{
          transform: `rotate(${secondHandAngle}deg)`,
          height: "40%",
          top: "10%",
          background: "#ff79c6",
        }}
      ></div>
    </div>
  );
};

const WorldClock = () => {
  const [times, setTimes] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const timer = setInterval(() => {
      const now = new Date();
      setTimes(
        timezones.map((tz) => {
          try {
            return new Date(
              now.toLocaleString("en-US", { timeZone: tz.timezone })
            );
          } catch (e) {
            console.error(`Invalid timezone: ${tz.timezone}`);
            return new Date();
          }
        })
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (times.length === 0) return null;

  const localTime = times[0];

  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.mobileToggle}
        >
          <span role="img" aria-label="globe">
            🌍
          </span>
          {localTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          (Your Time)
          <span
            className={`${styles.chevron} ${isExpanded ? styles.expanded : ""}`}
          ></span>
        </button>
        {isExpanded && (
          <div className={styles.clockGrid}>
            {times.map((time, index) => (
              <div key={timezones[index].name} className={styles.clockWrapper}>
                <AnalogClock time={time} />
                <div className={styles.digitalDisplay}>
                  <span className={styles.timezoneName}>
                    {timezones[index].name}
                  </span>
                  <span className={styles.digitalTime}>
                    {time.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop view with 3-card layout
  return (
    <div>
      {" "}
      <div className={styles.desktopContainerTimeOuter}>
        <div className="container-xxl">
          <div className={styles.desktopContainerTime}>
            {/* Left Card: Local and New York */}
            <div className={styles.clockCard}>
              {[0, 2].map((index) => (
                <div
                  key={timezones[index].name}
                  className={styles.clockWrapper}
                >
                  <AnalogClock time={times[index]} />
                  <div className={styles.digitalDisplay}>
                    <span className={styles.timezoneName}>
                      {timezones[index].name}
                    </span>
                    <span className={styles.digitalTime}>
                      {times[index].toLocaleTimeString()}
                    </span>
                    <span className={styles.digitalDate}>
                      {times[index].toDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Card: UTC */}
            <div className={`${styles.clockCard} ${styles.centerCard}`}>
              <div key={timezones[1].name} className={styles.clockWrapper}>
                <AnalogClock time={times[1]} />
                <div className={styles.digitalDisplay}>
                  <span className={styles.timezoneName}>
                    {timezones[1].name}
                  </span>
                  <span className={styles.digitalTime}>
                    {times[1].toLocaleTimeString()}
                  </span>
                  <span className={styles.digitalDate}>
                    {times[1].toDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: London and Tokyo */}
            <div className={styles.clockCard}>
              {[3, 4].map((index) => (
                <div
                  key={timezones[index].name}
                  className={styles.clockWrapper}
                >
                  <AnalogClock time={times[index]} />
                  <div className={styles.digitalDisplay}>
                    <span className={styles.timezoneName}>
                      {timezones[index].name}
                    </span>
                    <span className={styles.digitalTime}>
                      {times[index].toLocaleTimeString()}
                    </span>
                    <span className={styles.digitalDate}>
                      {times[index].toDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;
