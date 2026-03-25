"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ExportUserReportButton from "@/components/ExportUserReportButton";
// Base URL comes from NEXT_PUBLIC_API_URL env var
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// Numeric formatting helper
const formatValue = (val) => {
  const num = Number(val);
  if (Number.isNaN(num)) return val ?? "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// ===================== MetricCard (with clickable count -> modal) =====================
const MetricCard = ({
  label,
  value,
  count,
  usericon,
  carddetailspage,

  // optional: config for fetching list when clicking the count
  countTitle = "Users",
  countFetchUrl, // e.g. "/api/support/system-report-xaman-users"
  countRequestInit, // e.g. { headers: { Authorization: `Bearer ${token}` } }
  countFetcher, // optional custom async () => data (overrides countFetchUrl)
  renderCountResults, // optional (data) => JSX
  onChainDepositsToday,
  onChainWithdrawalsToday,
  LPPositioningToday,
  ecosystemFeesToday,
  rewardsRedeemedToday,
  claimedToday,
  fixedAutopositioning,
}) => {
  const displayValue = formatValue(value);

  const [showCountModal, setShowCountModal] = React.useState(false);
  const [countData, setCountData] = React.useState(null);
  const [countLoading, setCountLoading] = React.useState(false);
  const [countError, setCountError] = React.useState("");
  const openCountModal = async () => {
    if (!countFetchUrl && !countFetcher) return;
    setShowCountModal(true);
    setCountLoading(true);
    setCountError("");
    try {
      let result;
      if (countFetcher) {
        result = await countFetcher();
      } else {
        const res = await fetch(countFetchUrl, countRequestInit);
        const json = await res.json();
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || `Request failed: ${res.status}`);
        }
        result = json?.data ?? json;
      }
      setCountData(result);
    } catch (e) {
      setCountError(e?.message || "Failed to load data");
    } finally {
      setCountLoading(false);
    }
  };
  const detailPageMap = {
    "Total Positive LP": "/support/dashboard/system-report/positive_lp",
    "Total Negative LP": "/support/dashboard/system-report/negativelp",
    "Total LP": "/support/dashboard/system-report/totallp",
    "Total 5× Used": "/support/dashboard/system-report/5xrewards",
    "Total Airdrop": "/support/dashboard/system-report/airdrop",
    "Total Booster": "/support/dashboard/system-report/totalbooster",
    "Total Xaman": "/support/dashboard/system-report/totalxaman",
    "Total Zero Risk": "/support/dashboard/system-report/totalzerorisk",
    "Total Community Rewards":
      "/support/dashboard/system-report/communityrewards",
    "Total Autopositioning": "/support/dashboard/system-report/autopositioning",
    "Daily Rewards Total": "/support/dashboard/system-report/rewards",
    "Total Ecosystem Fee": "/support/dashboard/system-report/ecosystemfee",
    "On-Chain Deposits": "/support/dashboard/system-report/onchaindeposits",
    "On-Chain Withdrawals":
      "/support/dashboard/system-report/onchainwithdrawals",
    "Daily Cascade Rewards": "/support/dashboard/system-report/community",
    "Daily Boost Rewards": "/support/dashboard/system-report/boost",
    "Daily Airdrop Rewards": "/support/dashboard/system-report/airdrop-rewards",
    "Daily LP Rewards": "/support/dashboard/system-report/lp",
    "Community Booster Rewards":"/support/dashboard/system-report/booster",
    "X Power": "/support/dashboard/system-report/xpower",
    "X1 Rewards": "/support/dashboard/system-report/x1",
    "Fixed Auto Positioning": "/support/dashboard/system-report/autopositioning-wallets",
    "Negative Withdrawals": "/support/dashboard/system-report/withdrawals-greater",
    "Positive Deposits": "/support/dashboard/system-report/deposits-greater",
    "Active LP": "/support/dashboard/system-report/activeLp",
  };
  const handleDetailClick = (e) => {
    e.stopPropagation();
    const path = detailPageMap[label];
    if (path) {
      window.open(path, "_blank");
    }
  };

  return (
    <>
      <div
        style={{
          background: "rgba(79, 140, 255, 0.1)",
          border: "1px solid rgba(79, 140, 255, 0.2)",
          borderRadius: "16px",
          padding: "1.5rem",
          minWidth: "200px",
          flex: "1 1 200px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b3baff",
            marginBottom: "0.5rem",
          }}
        >
          <span> {label}</span>
          <span
            onClick={handleDetailClick}
            title={`Open ${label} details in new tab`}
            // onMouseEnter={(e) =>
            //   (e.currentTarget.style.backgroundColor = "rgba(79,140,255,0.35)")
            // }
            // onMouseLeave={(e) =>
            //   (e.currentTarget.style.backgroundColor = "rgba(79,140,255,0.15)")
            // }
            style={{
              marginLeft: "5px",
            }}
          >
            {carddetailspage}
          </span>
        </div>
        <div
          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff" }}
        >
          {displayValue}
        </div>

        {count != null &&
          (countFetchUrl || countFetcher ? (
            <button
              type="button"
              onClick={openCountModal}
              title="View list"
              style={{
                marginTop: "0.75rem",
                // background: "rgba(0,0,0,0.35)",
                color: "rgb(179, 186, 255)",
                // border: "1px solid rgba(255,255,255,0.15)",
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ marginRight: 3 }}>{usericon}</span>
              {count} users
            </button>
          ) : (
            <div
              style={{
                marginTop: "0.75rem",
                color: "#b3baff",
                fontSize: "0.8rem",
                opacity: 0.9,
              }}
            >
              {count} Users
            </div>
          ))}

        {/* If metric is an object (today stats) */}
        {onChainDepositsToday && (
          <div
            style={{ fontSize: "0.85rem", color: "#b3baff", lineHeight: 1.5 }}
          >
            <div>Today: {formatValue(onChainDepositsToday.total)}</div>
            <div>Tx Count: {onChainDepositsToday.txCount}</div>
            <div>Users: {onChainDepositsToday.userCount}</div>
          </div>
        )}

        <div
          className="flex flex-wrap md:flex-nowrap items-center gap-8 text-[0.9rem] leading-[1.6] text-[#b3baff] mt-3"
          style={{
            fontSize: "0.85rem",
            color: "#b3baff",
            lineHeight: 1.5,
            textAlign: "left",
            paddingLeft: "32%",
          }}
        >
          {onChainWithdrawalsToday && (
            <div className="flex items-center flex-wrap">
              <span className="mx-1 font-semibold text-white">On-chain:</span>
              <span className="mx-1">
                {formatValue(onChainWithdrawalsToday.total)}
              </span>
              <span className="mx-1 opacity-80">| Tx:</span>
              <span className="mx-1">{onChainWithdrawalsToday.txCount}</span>
              <span className="mx-1 opacity-80">| Users:</span>
              <span className="mx-1">{onChainWithdrawalsToday.userCount}</span>
            </div>
          )}

          {rewardsRedeemedToday && (
            <div className="flex items-center flex-wrap">
              <span className="mx-1 font-semibold text-white">Rewards:</span>
              <span className="mx-1">
                {formatValue(rewardsRedeemedToday.total)}
              </span>
              <span className="mx-1 opacity-80">| Tx:</span>
              <span className="mx-1">{rewardsRedeemedToday.txCount}</span>
              <span className="mx-1 opacity-80">| Users:</span>
              <span className="mx-1">{rewardsRedeemedToday.userCount}</span>
            </div>
          )}

          {claimedToday && (
            <div className="flex items-center flex-wrap">
              <span className="mx-1 font-semibold text-white">Claimed:</span>
              <span className="mx-1">{formatValue(claimedToday.total)}</span>
              <span className="mx-1 opacity-80">| Tx:</span>
              <span className="mx-1">{claimedToday.txCount}</span>
              <span className="mx-1 opacity-80">| Users:</span>
              <span className="mx-1">{claimedToday.userCount}</span>
            </div>
          )}
        </div>

        {ecosystemFeesToday && (
          <div
            style={{ fontSize: "0.85rem", color: "#b3baff", lineHeight: 1.5 }}
          >
            <div>Today: {formatValue(ecosystemFeesToday.total)}</div>
            <div>Tx Count: {ecosystemFeesToday.txCount}</div>
            <div>Users: {ecosystemFeesToday.userCount}</div>
          </div>
        )}

        {LPPositioningToday && (
          <div
            style={{
              fontSize: "0.85rem",
              color: "#b3baff",
              lineHeight: 1.5,
              marginTop: "0.75rem",
            }}
          >
            <div>
              <strong>Today</strong>:{" "}
              {formatValue(
                (
                  parseFloat(LPPositioningToday.XamanToLP || 0) +
                  parseFloat(LPPositioningToday.AutoPositioning || 0)
                ).toString()
              )}
            </div>
            <div>Xaman → LP: {formatValue(LPPositioningToday.XamanToLP)}</div>
            <div>
              AutoPositioning: {formatValue(LPPositioningToday.AutoPositioning)}
            </div>
          </div>
        )}
      </div>

      {/* Modal for count list */}
      {showCountModal && (
        <div
          onClick={() => setShowCountModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#181f3a",
              border: "1px solid #4f8cff26",
              borderRadius: "22px",
              padding: "2rem",
              boxShadow: "0 8px 32px #4f8cff1a",
              width: "80%",
              maxWidth: "80%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            className="custom-slider-table"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: "#fff", margin: 0 }}>{countTitle}</h3>
              <button
                onClick={() => setShowCountModal(false)}
                style={{
                  background: "transparent",
                  color: "#b3baff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            </div>

            {countLoading && (
              <div
                style={{ color: "#b3baff", marginTop: "1rem", fontSize: 14 }}
              >
                Loading…
              </div>
            )}
            {!countLoading && countError && (
              <div
                style={{ color: "#ff4d4f", marginTop: "1rem", fontSize: 14 }}
              >
                {countError}
              </div>
            )}

            {!countLoading &&
              !countError &&
              countData &&
              (renderCountResults ? (
                renderCountResults(countData)
              ) : (
                <DefaultUsersList
                  data={countData}
                  detailsFetcher={
                    null /* provide if you want per-row details */
                  }
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

// ===================== Users list with per-row Details (fetches from /support/system-report-xaman) =====================
function DefaultUsersList({ data, detailsFetcher }) {
  const rows = Array.isArray(data?.rows)
    ? data.rows
    : Array.isArray(data)
    ? data
    : [];

  // per-row state: { [key]: { open, loading, error, data } }
  const [state, setState] = React.useState({});

  const keyOf = (u, i) => u.userId || u._id || u.username || i;

  const handleToggle = async (u, i) => {
    const key = keyOf(u, i);
    const s = state[key];

    // toggle open if already loaded or currently loading
    if (s?.data || s?.loading || s?.error) {
      setState((prev) => ({ ...prev, [key]: { ...s, open: !s.open } }));
      return;
    }

    // first time open → fetch
    setState((prev) => ({
      ...prev,
      [key]: { open: true, loading: true, error: "", data: null },
    }));
    try {
      const result = await (detailsFetcher
        ? detailsFetcher(u)
        : Promise.reject(new Error("detailsFetcher not provided")));
      setState((prev) => ({
        ...prev,
        [key]: { open: true, loading: false, error: "", data: result },
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        [key]: {
          open: true,
          loading: false,
          error: err?.message || "Failed to load",
          data: null,
        },
      }));
    }
  };

  if (!rows.length) {
    return <div style={{ color: "#b3baff", marginTop: "1rem" }}>No data.</div>;
  }

  return (
    <div
      style={{
        marginTop: "1rem",
        border: "1px solid #4f8cff26",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr .4fr" }}>
        <div style={th}>Username</div>
        <div className="textaligncenter" style={th}>
          Amount (XRP)
        </div>

        <div style={th}></div>
      </div>

      {/* Rows */}
      {rows.map((u, i) => {
        const key = keyOf(u, i);
        const s = state[key] || {
          open: false,
          loading: false,
          error: "",
          data: null,
        };

        return (
          <div
            key={key}
            style={{ borderBottom: "1px solid rgba(79,140,255,0.08)" }}
          >
            {/* main row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 0.4fr",
                alignItems: "center",
                cursor: "pointer",
              }}
              onMouseEnter={() => handleToggle(u, i)}
              onMouseLeave={() =>
                setState((prev) => ({
                  ...prev,
                  [key]: { ...s, open: false },
                }))
              }
              className="table-row-section"
            >
              {/* Username */}
              <div style={td}>{u.username ?? "-"}</div>

              {/* Amount */}
              <div className="textaligncenter" style={td}>
                {u.amountStr ?? u.amount ?? "0"}
              </div>

              {/* Arrow button */}
              <div
                style={{ ...td, display: "flex", justifyContent: "flex-start" }}
              >
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#fff",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 200ms ease",
                      transform: `rotatex(${s.open ? 180 : 0}deg)`,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      height={16}
                      width={16}
                      fill="#fff"
                    >
                      <path d="M297.4 566.6C309.9 579.1 330.2 579.1 342.7 566.6L502.7 406.6C515.2 394.1 515.2 373.8 502.7 361.3C490.2 348.8 469.9 348.8 457.4 361.3L352 466.7L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 466.7L182.6 361.3C170.1 348.8 149.8 348.8 137.3 361.3C124.8 373.8 124.8 394.1 137.3 406.6L297.3 566.6z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* dropdown panel */}
            {s.open && (
              <div
                style={{
                  background: "rgba(79,140,255,0.05)",
                  padding: "10px 12px 14px",
                }}
                className="inner-table-row-section"
              >
                {s.loading && (
                  <div style={{ color: "#b3baff", fontSize: 13 }}>Loading…</div>
                )}
                {!s.loading && s.error && (
                  <div style={{ color: "#ff4d4f", fontSize: 13 }}>
                    {s.error}
                  </div>
                )}
                {!s.loading && !s.error && s.data && (
                  <XamanDetails data={s.data} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function X1RewardsUsersList({ data, detailsFetcher }) {
  const rows = Array.isArray(data?.rows)
    ? data.rows
    : Array.isArray(data)
    ? data
    : [];

  // per-row state: { [key]: { open, loading, error, data, page } }
  const [state, setState] = React.useState({});

  const keyOf = (u, i) => u.userId || u._id || u.username || i;

  // load specific page of details for a user
  const loadPage = async (u, i, page = 1, pageSize = 10) => {
    const key = keyOf(u, i);

    setState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), loading: true, error: "", page },
    }));

    try {
      const result = await (detailsFetcher
        ? detailsFetcher(u, page, pageSize)
        : Promise.reject(new Error("detailsFetcher not provided")));

      setState((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          open: true,
          loading: false,
          error: "",
          data: result,
          page,
        },
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          open: true,
          loading: false,
          error: err?.message || "Failed to load",
          data: null,
          page,
        },
      }));
    }
  };

  const handleToggle = (u, i) => {
    const key = keyOf(u, i);
    const s = state[key];

    if (s?.open) {
      setState((prev) => ({ ...prev, [key]: { ...s, open: false } }));
    } else {
      // first open → load page 1
      loadPage(u, i, 1, 10);
    }
  };

  if (!rows.length) {
    return <div style={{ color: "#b3baff", marginTop: "1rem" }}>No data.</div>;
  }

  return (
    <div
      style={{
        marginTop: "1rem",
        border: "1px solid #4f8cff26",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.4fr" }}
      >
        <div style={th}>Username</div>
        <div style={th}>xRank</div>
        <div style={{ ...th, textAlign: "center" }}>Earnings (XRP)</div>
        <div style={th}></div>
      </div>

      {/* Rows */}
      {rows.map((u, i) => {
        const key = keyOf(u, i);
        const s = state[key] || {
          open: false,
          loading: false,
          error: "",
          data: null,
          page: 1,
        };

        return (
          <div
            key={key}
            style={{ borderBottom: "1px solid rgba(79,140,255,0.08)" }}
          >
            {/* main row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 0.4fr",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => handleToggle(u, i)}
              className="table-row-section"
            >
              <div style={td}>{u.username ?? "-"}</div>
              <div style={td}>{u.xRank ?? "0"}</div>
              <div style={{ ...td, textAlign: "center" }}>
                {u.totalEarnings ?? "0"}
              </div>
              <div
                style={{ ...td, display: "flex", justifyContent: "flex-start" }}
              >
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#fff",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 200ms ease",
                      transform: `rotate(${s.open ? 180 : 0}deg)`,
                    }}
                  >
                    ▼
                  </span>
                </button>
              </div>
            </div>

            {/* dropdown panel */}
            {s.open && (
              <div
                style={{
                  background: "rgba(79,140,255,0.05)",
                  padding: "10px 12px 14px",
                }}
                className="inner-table-row-section"
              >
                {s.loading && (
                  <div style={{ color: "#b3baff", fontSize: 13 }}>Loading…</div>
                )}
                {!s.loading && s.error && (
                  <div style={{ color: "#ff4d4f", fontSize: 13 }}>
                    {s.error}
                  </div>
                )}
                {!s.loading && !s.error && s.data && (
                  <X1RewardsDetails
                    data={s.data}
                    currentPage={s.page}
                    onPageChange={(newPage) => loadPage(u, i, newPage, 10)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Default details renderer for /support/system-report-xaman
function XamanDetails({ data }) {
  // Accepts either { rows: [...] } or a plain array
  const rows = Array.isArray(data?.rows)
    ? data.rows
    : Array.isArray(data)
    ? data
    : [];

  // If your endpoint returns a summary like { xaman: { total, rows: [...] } }
  const list = data?.xaman?.rows || rows;
  const total = data?.xaman?.total;

  if (!list || !list.length) {
    return (
      <div style={{ color: "#c9d1ff", fontSize: 13 }}>
        <em>No details found.</em>
      </div>
    );
  }

  return (
    <div>
      {total != null && (
        <div style={{ color: "#c9d1ff", fontSize: 13, marginBottom: 8 }}>
          <strong>Total:</strong> {String(total)}
        </div>
      )}
      <div
        style={{
          border: "1px solid #4f8cff26",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
        >
          <div style={th}>Timestamp</div>
          <div style={th}>From</div>
          <div style={th}>To</div>
          <div style={th}>Amount </div>
        </div>
        {list.map((r, idx) => (
          <div
            key={r._id || idx}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              borderTop: "1px solid rgba(79,140,255,0.12)",
            }}
          >
            <div style={tdSmall}>
              {r.ts ? new Date(r.ts).toLocaleString() : "—"}
            </div>
            <div style={tdSmall}>{r.walletFrom || "—"}</div>
            <div style={tdSmall}>{r.walletTo || "—"}</div>
            <div style={tdSmall}>
              <div>
                <strong>
                  {r.amountStr ?? r.amount?.toString?.() ?? r.amount ?? "0"}
                </strong>
              </div>
              {/* <div style={{ opacity: 0.8, fontSize: 12 }}>
                {r.narrative || "—"}
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default details renderer for /support/system-report-xaman
function X1RewardsDetails({ data, currentPage = 1, onPageChange }) {
  const list = data?.rows || [];
  const totalRecords = data?.totalRecords ?? list.length;
  const total = data?.total;
  const pageSize = data?.pageSize || 10;

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (!list || !list.length) {
    return (
      <div style={{ color: "#c9d1ff", fontSize: 13 }}>
        <em>No details found.</em>
      </div>
    );
  }

  // ---- helper: build pagination numbers ----
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages - 1, start + maxVisible - 1);

    pages.push(1);
    if (start > 2) pages.push("…");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);

    return pages;
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div>
      {total != null && (
        <div style={{ color: "#c9d1ff", fontSize: 13, marginBottom: 8 }}>
          <strong>Total:</strong> {String(total)}
        </div>
      )}

      {/* Record count */}
      <div style={{ color: "#c9d1ff", fontSize: 12, marginBottom: 6 }}>
        Showing {startRecord}–{endRecord} of {totalRecords}
      </div>

      <div
        style={{
          border: "1px solid #4f8cff26",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 1fr",
          }}
        >
          <div style={th}>Timestamp</div>
          <div style={th}>Depositor</div>
          <div style={th}>Tier</div>
          <div style={th}>Rate</div>
          <div style={th}>Level</div>
          <div style={th}>Amount</div>
        </div>

        {/* Rows (already paginated by API) */}
        {list.map((r, idx) => (
          <div
            key={r._id || idx}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 1fr",
              borderTop: "1px solid rgba(79,140,255,0.12)",
            }}
          >
            <div style={tdSmall}>
              {r.ts ? new Date(r.ts).toLocaleString() : "—"}
            </div>
            <div style={tdSmall}>{r.depositorName || "—"}</div>
            <div style={tdSmall}>{r.tier || "—"}</div>
            <div style={tdSmall}>{r.rate || "—"}</div>
            <div style={tdSmall}>{r.level ? `L${r.level}` : "—"}</div>
            <div style={tdSmall}>
              <strong>
                {r.amountStr ?? r.amount?.toString?.() ?? r.amount ?? "0"}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {/* Prev */}
          <button
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "4px 8px",
              background: "transparent",
              color: "#b3baff",
              border: "1px solid #4f8cff66",
              borderRadius: 6,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((p, idx) =>
            p === "…" ? (
              <span key={`ellipsis-${idx}`} style={{ color: "#c9d1ff" }}>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                style={{
                  padding: "4px 10px",
                  background: currentPage === p ? "#4f8cff" : "transparent",
                  color: currentPage === p ? "#fff" : "#b3baff",
                  border: "1px solid #4f8cff66",
                  borderRadius: 6,
                  fontWeight: currentPage === p ? "bold" : "normal",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() =>
              onPageChange?.(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            style={{
              padding: "4px 8px",
              background: "transparent",
              color: "#b3baff",
              border: "1px solid #4f8cff66",
              borderRadius: 6,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: "10px 12px",
  background: "rgba(79,140,255,0.08)",
  color: "#b3baff",
  fontSize: 12,
  borderBottom: "1px solid rgba(79,140,255,0.2)",
};
const td = {
  padding: "10px 12px",
  color: "#fff",
  fontSize: 14,
  borderBottom: "1px solid rgba(79,140,255,0.08)",
};
const tdSmall = { ...td, fontSize: 13 };

// ===================== Page =====================
export default function SystemReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_BASE_URL}/api/support/system-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      console.log(
        data,
        "datadatadatadatadatadatadatadatadatadatadatadatadatadatadata"
      );
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch system report");
      setReport(data.data);
    } catch (err) {
      setError(err.message);
      if (
        err.message.includes("Authentication required") ||
        err.message.includes("Unauthorized")
      ) {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/sign-in");
      } else if (!["support", "admin"].includes(user.userType)) {
        router.push("/sign-in");
      } else {
        fetchReport();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
        Checking authentication...
      </div>
    );
  }

  if (!user || !["support", "admin"].includes(user.userType)) {
    return (
      <div style={{ textAlign: "center", color: "#ff4d4d", padding: "2rem" }}>
        Unauthorized access
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
        Loading system report...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "#ff4d4d", padding: "2rem" }}>
        Error: {error}
      </div>
    );
  }

  if (!report) return null;

  const {
    totalPositiveLP,
    totalNegativeLP,
    totalLP,
    total5xUsed,
    totalAirdrop,
    totalBooster,
    totalXaman,
    totalZeroRisk,
    totalCommunityRewards,
    onChainDeposits,
    onChainWithdrawals,
    distributedLpRewards,
    distributedAirdropRewards,
    distributedBoosterRewards,
    totalCascadeRewards,
    totalX1Rewards,
    totalCommunityBoosterRewards,
    usersWithXamanGtZero,
    UserWithAutopositioning,
    userCountzeroRisk,
    userCountcommunityRewards,
    totalEcosystemFee,
    totalAutopositioning,
    dailyRewards,
    X1RewarduserCount,
    onChainDepositsToday,
    onChainWithdrawalsToday,
    LPPositioningToday,
    ecosystemFeesToday,
    rewardsRedeemedToday,
    claimedToday,
    activeLPUsers,
    autopositioningWallet,
    onChainNegativeBalance,
    onChainPositiveBalance,

  } = report;
  const EYE_SVG = (
    <svg
      width={16}
      Height={16}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.05 12c2.93-5 7.05-7.5 9.95-7.5S19.02 7 21.95 12c-2.93 5-7.05 7.5-9.95 7.5S4.98 17 2.05 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EYE_SVG_PAGEVIEWE = (
    <svg
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(79, 140, 255, 0.15)",
        borderRadius: "50%",
        transition: "all 0.3s ease",
      }}
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.05 12c2.93-5 7.05-7.5 9.95-7.5S19.02 7 21.95 12c-2.93 5-7.05 7.5-9.95 7.5S4.98 17 2.05 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <div
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        padding: "2rem",
        color: "white",
      }}
    >
      <h2>System Report</h2>

      <ExportUserReportButton />

      {/* Wallet totals */}
      <h3 style={{ color: "#b3baff", marginBottom: "1rem" }}>Wallet Totals</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <MetricCard
          label="Total Positive LP"
          value={totalPositiveLP}
          usericon={EYE_SVG}
          carddetailspage={EYE_SVG_PAGEVIEWE}
          count={activeLPUsers}
          LPPositioningToday={LPPositioningToday}
          fixedAutopositioning={autopositioningWallet?.total}
        />

        <MetricCard
          label="Total Negative LP"
          value={totalNegativeLP}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total LP"
          value={totalLP}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total 5× Used"
          value={total5xUsed}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total Airdrop"
          value={totalAirdrop}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total Booster"
          value={totalBooster}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />

        {/* Xaman with clickable count -> users list + per-row details fetch */}
        <MetricCard
          label="Total Xaman"
          value={totalXaman}
          usericon={EYE_SVG}
          carddetailspage={EYE_SVG_PAGEVIEWE}
          count={usersWithXamanGtZero}
          countTitle="Users with Xaman Balance"
          countFetcher={async () => {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

            console.log("[XAMAN] Fetching users…", {
              API_BASE_URL,
              hasToken: !!token,
            });

            const res = await fetch(
              `${API_BASE_URL}/api/support/system-report-xaman-users`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            let json;
            try {
              json = await res.json();
            } catch (e) {
              console.error("[XAMAN] Failed to parse JSON:", e);
              throw e;
            }

            console.log("[XAMAN] Users response:", res.status, json);

            if (!res.ok || json?.success === false) {
              console.error("[XAMAN] Users fetch error:", json);
              throw new Error(json?.message || "Failed to fetch users");
            }

            console.log("[XAMAN] Users data:", json?.data);
            return json.data; // expects { rows: [...] }
          }}
          renderCountResults={(data) => {
            console.log("[XAMAN] renderCountResults data:", data);

            return (
              <DefaultUsersList
                data={data}
                detailsFetcher={async (u) => {
                  console.log("[XAMAN] detailsFetcher input row:", u);

                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;
                  const userId = u.userId || u._id || u.id || "";
                  const url = `${API_BASE_URL}/api/support/system-report-xaman?userId=${encodeURIComponent(
                    userId
                  )}`;

                  console.log("[XAMAN] detailsFetcher GET:", url, {
                    hasToken: !!token,
                  });

                  const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  let json;
                  try {
                    json = await res.json();
                  } catch (e) {
                    console.error(
                      "[XAMAN] detailsFetcher JSON parse error:",
                      e
                    );
                    throw e;
                  }

                  console.log(
                    "[XAMAN] detailsFetcher response:",
                    res.status,
                    json
                  );

                  if (!res.ok || json?.success === false) {
                    console.error("[XAMAN] detailsFetcher error:", json);
                    throw new Error(json?.message || "Failed to fetch details");
                  }

                  console.log("[XAMAN] detailsFetcher data:", json.data);
                  return json.data; // e.g. { xaman: { total, rows: [...] } } or { rows: [...] }
                }}
              />
            );
          }}
        />

        <MetricCard
          label="Total Zero Risk"
          value={totalZeroRisk}
          count={userCountzeroRisk}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total Community Rewards"
          value={totalCommunityRewards}
          count={userCountcommunityRewards}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Total Autopositioning"
          value={totalAutopositioning}
          count={UserWithAutopositioning}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />

        <MetricCard
          label="Total Ecosystem Fee"
          value={totalEcosystemFee}
          ecosystemFeesToday={ecosystemFeesToday}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
      </div>

      {/* On-chain aggregates */}
      <h3 style={{ color: "#b3baff", marginBottom: "1rem" }}>
        On-Chain Totals
      </h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <MetricCard
          label="On-Chain Deposits"
          value={onChainDeposits-1500000}
          onChainDepositsToday={onChainDepositsToday}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="On-Chain Withdrawals"
          value={onChainWithdrawals}
          onChainWithdrawalsToday={onChainWithdrawalsToday}
          rewardsRedeemedToday={rewardsRedeemedToday}
          claimedToday={claimedToday}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
         <MetricCard
          label="Negative Withdrawals"
          value={onChainNegativeBalance?.extraWithdrawn}
          count={onChainNegativeBalance?.userCount}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
         <MetricCard
          label="Positive Deposits"
          value={onChainPositiveBalance?.extraDeposited}
          count={onChainPositiveBalance?.userCount}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
         <MetricCard
          label="Active LP"
          value={totalPositiveLP- autopositioningWallet?.total}
          count={activeLPUsers}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
        <MetricCard
          label="Fixed Auto Positioning"
          value={autopositioningWallet?.total}
          count={autopositioningWallet?.userCount}
          carddetailspage={EYE_SVG_PAGEVIEWE}
        />
      </div>

      {/* Distribution totals */}
      <h3 style={{ color: "#b3baff", marginBottom: "1rem" }}>
        Distribution Totals
      </h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <MetricCard
          label="Distributed LP Rewards"
          value={distributedLpRewards}
        />
        <MetricCard
          label="Distributed Airdrop Rewards"
          value={distributedAirdropRewards}
        />
        <MetricCard
          label="Distributed Booster Rewards"
          value={distributedBoosterRewards}
        />
        <MetricCard label="Total Cascade" value={totalCascadeRewards} />
        <MetricCard
          label="X Bonus"
          value={totalX1Rewards}
          usericon={EYE_SVG}
          count={X1RewarduserCount}
          countTitle="Users with X1Rewards Balance"
          countFetcher={async () => {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

            console.log("[X1Rewards] Fetching users…", {
              API_BASE_URL,
              hasToken: !!token,
            });

            const res = await fetch(
              `${API_BASE_URL}/api/support/system-report-x1reawards`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            let json;
            try {
              json = await res.json();
            } catch (e) {
              console.error("[XAMAN] Failed to parse JSON:", e);
              throw e;
            }

            console.log("[X1Rewards] Users response:", res.status, json);

            if (!res.ok || json?.success === false) {
              console.error("[X1Rewards] Users fetch error:", json);
              throw new Error(json?.message || "Failed to fetch users");
            }

            console.log("[XAMAN] Users data:", json?.data);
            return json.data; // expects { rows: [...] }
          }}
          renderCountResults={(data) => {
            console.log("[XAMAN] renderCountResults data:", data);

            return (
              <X1RewardsUsersList
                data={data}
                detailsFetcher={async (u, page = 1, pageSize = 10) => {
                  console.log(
                    "[x1reawards] detailsFetcher input row:",
                    u,
                    "page:",
                    page
                  );

                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;
                  const userId = u.userId || u._id || u.id || "";

                  const url =
                    `${API_BASE_URL}/api/support/system-report-x1reawards-users?` +
                    `userId=${encodeURIComponent(userId)}` +
                    `&page=${page}&pageSize=${pageSize}`;

                  console.log("[x1reawards] detailsFetcher GET:", url, {
                    hasToken: !!token,
                  });

                  const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  let json;
                  try {
                    json = await res.json();
                  } catch (e) {
                    console.error(
                      "[x1reawards] detailsFetcher JSON parse error:",
                      e
                    );
                    throw e;
                  }

                  console.log(
                    "[x1reawards] detailsFetcher response:",
                    res.status,
                    json
                  );

                  if (!res.ok || json?.success === false) {
                    console.error("[x1reawards] detailsFetcher error:", json);
                    throw new Error(json?.message || "Failed to fetch details");
                  }

                  console.log("[x1reawards] detailsFetcher data:", json.data);
                  return json.data; // e.g. { rows, totalRecords, pageSize }
                }}
              />
            );
          }}
        />
        <MetricCard
          label="Community Booster Rewards"
          value={totalCommunityBoosterRewards}
        />
      </div>

      {/* Daily rewards for last distribution */}
      <h3 style={{ color: "#b3baff", marginBottom: "1rem" }}>
        Most Recent Daily Distribution
      </h3>
      {dailyRewards && dailyRewards.date ? (
        <>
          <p style={{ marginBottom: "1rem" }}>
            Date: {new Date(dailyRewards.date).toLocaleDateString()}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
              <MetricCard
              label="X1 Rewards"
              value={dailyRewards.x1Rewards}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="X Power"
              value={dailyRewards.xPowerRewards}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Community Booster Rewards"
              value={dailyRewards.communityBoosterRewards}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Daily LP Rewards"
              value={dailyRewards.dailyRewardsLp}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Daily Airdrop Rewards"
              value={dailyRewards.dailyRewardsAirdrop}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Daily Boost Rewards"
              value={dailyRewards.dailyRewardsBoost}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Daily Cascade Rewards"
              value={dailyRewards.dailyCascadeRewards}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
            <MetricCard
              label="Daily Rewards Total"
              value={dailyRewards.total}
              carddetailspage={EYE_SVG_PAGEVIEWE}
            />
          </div>
        </>
      ) : (
        <p>No daily rewards distributions found.</p>
      )}
    </div>
  );
}
