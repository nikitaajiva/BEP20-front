"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./settings.module.css";
import { Settings, Save, Percent, ShieldAlert, Zap, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function WithdrawDepositTableForm() {
  const [withdrawal, setWithdrawal] = useState("");
  const [deposit, setDeposit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasFetchedRef = useRef(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/support/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch settings");
      }

      const latest = data.data;
      if (latest) {
        const nextWithdrawal =
          latest.negativeWithdrawal === null ||
            latest.negativeWithdrawal === undefined
            ? ""
            : String(latest.negativeWithdrawal);
        const nextDeposit =
          latest.positiveDeposit === null ||
            latest.positiveDeposit === undefined
            ? ""
            : String(latest.positiveDeposit);

        setWithdrawal(nextWithdrawal);
        setDeposit(nextDeposit);
      }
    } catch (err) {
      console.error("Fetch settings error:", err.message);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const negativeWithdrawal = Number(withdrawal);
    const positiveDeposit = Number(deposit);

    if (!negativeWithdrawal && !positiveDeposit) {
      setError("Please enter at least one value");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        negativeWithdrawal,
        positiveDeposit,
      };

      const res = await fetch(`${API_BASE}/api/support/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update settings");
      }

      await fetchSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled =
    (!Number(withdrawal) && !Number(deposit)) || loading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System <span>Protocol Settings</span></h1>
        <p className={styles.subtitle}>Configure core financial parameters and registry segments</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        {/* Negative Withdrawals Section */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
             <ArrowDownCircle size={14} className="text-[#ff4d4d]" /> 
             <span>Negative Withdrawals Policy</span>
          </label>
          <div className={styles.inputWrapper}>
             <input
                type="number"
                step="0.001"
                value={withdrawal}
                onChange={(e) => setWithdrawal(e.target.value)}
                placeholder="0.005"
                className={styles.inputField}
             />
             <span className={styles.unit}>%</span>
          </div>
          <p className="text-[11px] opacity-30 mt-1 font-bold">Penalty percentage applied to restricted withdrawal segments.</p>
        </div>

        {/* Positive Deposits Section */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
             <ArrowUpCircle size={14} className="text-[#00ff00]" /> 
             <span>Positive Deposits Incentive</span>
          </label>
          <div className={styles.inputWrapper}>
             <input
                type="number"
                step="0.001"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="0.005"
                className={styles.inputField}
             />
             <span className={styles.unit}>%</span>
          </div>
          <p className="text-[11px] opacity-30 mt-1 font-bold">Standard bonus yield for active validator deposit nodes.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-[#ff4d4d] p-4 rounded-xl flex items-center gap-3">
             <ShieldAlert size={18} />
             <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className={styles.footer}>
           <div className="flex-1 text-[11px] text-white/20 uppercase tracking-[2px] font-black">
              <Zap size={10} className="inline mr-1" /> Registry Sync: Active
           </div>
           <button
            type="submit"
            disabled={isSaveDisabled}
            className={styles.btnPrimary}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                 <Zap size={16} className="animate-pulse" /> Updating Terminal...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                 <Save size={16} /> Execute Update
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
