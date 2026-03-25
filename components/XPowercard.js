"use client";
import React, { useEffect, useRef, useState } from "react";

const columns = [
  { label: "X1", parts: [7, 7, 7] },
  { label: "X2", parts: [7, 7, 7] },
  { label: "X3", parts: [7, 7, 7] },
  { label: "X4", parts: [7, 7, 7] },
  { label: "X5", parts: [7, 7, 7] },
];

const leagues = ["1st Gen", "2nd Gen", "3rd Gen"];
const userColumn = "X3";
const climbOrder = ["L3", "L2", "L1", "Total"];
const ARROW_INTERVAL = 2600;

export default function XPowerTable() {
  const rootRef = useRef(null);
  const [step, setStep] = useState(0);
  const [fillPcts, setFillPcts] = useState({}); // animated fill %

  // Handle step changes (climbing arrow)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();

          const interval = setInterval(() => {
            setStep((s) => (s + 1) % climbOrder.length);
          }, ARROW_INTERVAL);

          // cleanup
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate fill percentages
  useEffect(() => {
    const interval = setInterval(() => {
      setFillPcts((prev) => {
        const newPcts = {};
        columns.forEach((col) => {
          col.parts.forEach((part, idx) => {
            const key = `${col.label}-${idx}`;
            // simple pulsing between 0 and target percent
            newPcts[key] = prev[key] === part ? 0 : part;
          });
          // Total
          const totalKey = `${col.label}-total`;
          const total = col.parts.reduce((a, b) => a + b, 0);
          newPcts[totalKey] = prev[totalKey] === total ? 0 : total;
        });
        return newPcts;
      });
    }, ARROW_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const currentLevel = climbOrder[step];

  const xpBubbleBase = {
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    lineHeight: 1,
    color: "#fff",
    textTransform: "uppercase",
    position: "relative",
    overflow: "hidden",
    boxShadow:
      "inset 0 -8px 16px rgba(0, 0, 0, .35), inset 0 8px 16px rgba(255, 255, 255, .08)",
  };
  // const maxValue = Math.max(
  //   ...columns.flatMap((c) => [...c.parts, c.parts.reduce((a, b) => a + b, 0)])
  // );

  const renderFillDiv = (value = "50", color) => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // height: `${(value / maxValue) * 100}%`,
    height: `${value}%`,

    background: `green`,
    transition: "height 1500ms ease",
    zIndex: 999,
    borderRadius: "62% 37% 55% 4%",
  });

  const cardBaseStyle = {
    overflow: "hidden",
    background: "#000000",
    color: "#ffffff",
    borderRadius: "24px",
    border: "1px solid rgba(255, 215, 0, 0.15)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    padding: "1.5rem",
  };

  return (
    <div
      style={{
        ...cardBaseStyle,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          padding: "20px",
        }}
      >
        <h5 style={{ color: "#fff", marginBottom: "16px" }}>X Power</h5>

        <div
          ref={rootRef}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {/* HEAD ROW */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "10px repeat(5, 1fr)",
              gap: "14px",
              marginBottom: "6px",
            }}
          >
            <div />
            {columns.map((c) => {
              const total = c.parts.reduce((a, b) => a + b, 0);
              const key = `${c.label}-total`;
              const fill = fillPcts[key] || 0;
              const isUser = c.label === userColumn && currentLevel === "Total";

              return (
                <div
                  key={c.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      ...xpBubbleBase,
                      width: 56,
                      height: 56,
                      fontSize: 14,
                      fontWeight: 900,
                      background: `
                        radial-gradient(circle at 30% 22%, #fff 0%, #b9e6ff 7%, transparent 8%),
                        radial-gradient(circle at 60% 70%, rgba(0, 0, 0, .45) 0 60%, transparent 61%),
                        linear-gradient(145deg, #64c9ff, #0a66ff)
                      `,
                    }}
                  >
                    {isUser && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 8px)",
                          left: "50%",
                          transform: "translate(-50%, -6px)",
                          width: 22,
                          height: 22,
                          opacity: 1,
                          animation: `arrow-pop ${ARROW_INTERVAL}ms infinite`,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          width="100%"
                          height="100%"
                        >
                          <path
                            d="M342.6 81.4C330.1 68.9 309.8 68.9 297.3 81.4L137.3 241.4C124.8 253.9 124.8 274.2 137.3 286.7C149.8 299.2 170.1 299.2 182.6 286.7L288 181.3L288 552C288 569.7 302.3 584 320 584C337.7 584 352 569.7 352 552L352 181.3L457.4 286.7C469.9 299.2 490.2 299.2 502.7 286.7C515.2 274.2 515.2 253.9 502.7 241.4L342.7 81.4z"
                            fill="#ffd166"
                          />
                        </svg>
                      </span>
                    )}
                    <span style={{ position: "relative", zIndex: "9999" }}>
                      {c.label}
                    </span>
                    <div
                      className=""
                      style={{
                        width: 54,
                        height: 49,
                        position: "absolute",
                        borderRadius: " 62% 37% 55% 4%",
                        bottom: "0px",
                        right: "0px",
                      }}
                    >
                      <div
                        style={renderFillDiv(fill, "rgba(100, 201, 255, 0.7)")}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#cfe6ff",
                    }}
                  >
                    {total}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* LEAGUE ROWS */}
          {leagues.map((lg, rIdx) => (
            <div
              key={lg}
              style={{
                display: "grid",
                gridTemplateColumns: "10px repeat(5, 1fr)",
                gap: "14px",
              }}
            >
              <div style={{ alignItems: "flex-start", marginBottom: 13 }}>
                <span
                  style={{ color: "#d7e6ff", fontWeight: 800, fontSize: 14 }}
                >
                  {lg}
                </span>
              </div>
              {columns.map((c) => {
                const part = c.parts[rIdx] ?? 0;
                const key = `${c.label}-${rIdx}`;
                const fill = fillPcts[key] || 0;
                const isUser = c.label === userColumn && currentLevel === lg;

                return (
                  <div
                    key={`${lg}-${c.label}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        ...xpBubbleBase,
                        width: 40,
                        height: 40,
                        fontSize: 10,
                        fontWeight: 400,
                        background: `
                          radial-gradient(circle at 28% 22%, #fff 0%, #ffd9fb 8%, transparent 9%),
                          radial-gradient(circle at 60% 75%, rgba(0, 0, 0, .35) 0 65%, transparent 66%),
                          linear-gradient(145deg, #ff6ddd, #a044ff)
                        `,
                      }}
                    >
                      {isUser && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 8px)",
                            left: "50%",
                            transform: "translate(-50%, -6px)",
                            width: 22,
                            height: 22,
                            opacity: 1,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            width="100%"
                            height="100%"
                          >
                            <path
                              d="M342.6 81.4C330.1 68.9 309.8 68.9 297.3 81.4L137.3 241.4C124.8 253.9 124.8 274.2 137.3 286.7C149.8 299.2 170.1 299.2 182.6 286.7L288 181.3L288 552C288 569.7 302.3 584 320 584C337.7 584 352 569.7 352 552L352 181.3L457.4 286.7C469.9 299.2 490.2 299.2 502.7 286.7C515.2 274.2 515.2 253.9 502.7 241.4L342.7 81.4z"
                              fill="#ffd166"
                            />
                          </svg>
                        </span>
                      )}
                      <span>{c.label.toLowerCase()}</span>{" "}
                      <div style={renderFillDiv(fill, "")} />
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#cfe6ff",
                      }}
                    >
                      {part}%
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
