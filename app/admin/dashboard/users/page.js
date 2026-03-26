"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaEye, FaPenFancy, FaLock, FaTrash } from "react-icons/fa";
import axios from "axios";
import ThemedToggle from "../../../../components/ThemedToggle.js";
import styles from "./users.module.css";
import {
  Search, RotateCcw, ChevronLeft, ChevronRight,
  UserCheck, ShieldOff, Users, BookOpen, AlertTriangle,
  KeyRound, Mail, Wallet, ExternalLink, TrendingUp, Activity,
  UserX, UserPlus,
} from "lucide-react";
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Filler);

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const AVATAR_PALETTE = [
  { bg: "rgba(255,215,0,0.12)",   text: "#ffd700"  },
  { bg: "rgba(16,185,129,0.12)",  text: "#10b981"  },
  { bg: "rgba(99,102,241,0.12)",  text: "#818cf8"  },
  { bg: "rgba(244,63,94,0.12)",   text: "#f43f5e"  },
  { bg: "rgba(249,115,22,0.12)",  text: "#f97316"  },
  { bg: "rgba(6,182,212,0.12)",   text: "#06b6d4"  },
];
const avatarColor = (name = "") => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

/* ══════════════════════════════════════════
   MODAL — Update USDT Wallet
═══════════════════════════════════════════ */
function UpdateXrpModal({ isOpen, onClose, user, onUpdate }) {
  const [address, setAddress] = useState(user?.xrpAddress || "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => { setAddress(user?.xrpAddress || ""); setError(null); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const res  = await fetch(`${API_BASE_URL}/api/support/users/${user._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ USDTAddress: address }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");
      onUpdate(data.data); onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap} style={{ background:"rgba(255,215,0,0.1)" }}><Wallet size={20} color="#ffd700" /></div>
          <div><div className={styles.modalTitle}>Update USDT Wallet</div><div className={styles.modalSubtitle}>BEP20 Address Re-link</div></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalInputWrap}>
            <label className={styles.modalLabel}><Wallet size={10} /> USDT BEP20 Address</label>
            <input type="text" className={styles.inputField} style={{ width:"100%" }} value={address}
              onChange={(e) => setAddress(e.target.value)} placeholder="0x..." disabled={loading} />
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <div className={styles.modalBtnGroup}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.btnPrimary}>{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Delete User
═══════════════════════════════════════════ */
function DeleteUserModal({ isOpen, onClose, user, onDeleteSuccess }) {
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [ledger,       setLedger]       = useState(null);
  const [cannotDelete, setCannotDelete] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true); setError(null); setLedger(null); setCannotDelete(false);
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");
        const res  = await fetch(`${API_BASE_URL}/api/support/ledger?userId=${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.success) {
          setLedger(data.data);
          if (parseFloat(data.data.lp||"0") > 0 || parseFloat(data.data.xaman||"0") > 0) setCannotDelete(true);
        } else if (res.status === 404) { setLedger({ lp:"0", xaman:"0" }); }
        else throw new Error(data.message || "Failed to fetch ledger.");
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [isOpen, user]);

  const handleDelete = async () => {
    if (cannotDelete) { setError("Cannot delete user with active balances."); return; }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const res  = await fetch(`${API_BASE_URL}/api/support/users/${user._id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete.");
      onDeleteSuccess(user._id); onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth:500 }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap} style={{ background:"rgba(244,63,94,0.12)" }}><AlertTriangle size={20} color="#f43f5e" /></div>
          <div><div className={styles.modalTitle} style={{ color:"#f43f5e" }}>Danger Zone</div><div className={styles.modalSubtitle}>Permanent user removal</div></div>
        </div>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginBottom:18, lineHeight:1.6 }}>
          You are about to permanently delete <strong style={{ color:"#fff" }}>{user?.username}</strong>. This cannot be undone.
        </p>
        {loading && !ledger && <p style={{ color:"#ffd700", fontSize:12, textAlign:"center", marginBottom:14 }}>Validating account…</p>}
        {ledger && (
          <div className={styles.auditPanel}>
            <div className={styles.auditTitle}>Account Audit</div>
            <div className={styles.auditRow}><span className={styles.auditLabel}>LP Vault</span><span className={styles.auditValue}>{ledger.lp} USDT</span></div>
            <div className={styles.auditRow}><span className={styles.auditLabel}>Wallet Balance</span><span className={styles.auditValue}>{ledger.xaman} USDT</span></div>
            {cannotDelete && <div className={styles.warningBox}><AlertTriangle size={13} style={{ flexShrink:0, marginTop:1 }} />Account cannot be purged — balance must be 0.00 USDT.</div>}
          </div>
        )}
        {error && <div className={styles.errorMsg}>{error}</div>}
        <div className={styles.modalBtnGroup}>
          <button onClick={onClose} className={styles.btnSecondary}>Cancel</button>
          <button onClick={handleDelete} disabled={loading || cannotDelete || !ledger} className={styles.btnDanger}>
            <FaTrash size={11} />{loading ? "Purging..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   EMAIL / PASSWORD MODAL
═══════════════════════════════════════════ */
function CredentialModal({ mode, onClose, selectedUserId, API_URL }) {
  const [newEmail,    setNewEmail]    = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState(""); const [ok, setOk] = useState(false);

  const handleEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE_URL}/api/auth/reset-email/${token}`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify({ id:selectedUserId, newEmail }),
      });
      const data = await res.json();
      if (data.success) { setMsg("Email synchronized."); setOk(true); setTimeout(onClose, 1400); }
      else { setMsg(data.message || "Sync failed."); setOk(false); }
    } catch { setMsg("System error."); setOk(false); }
  };

  const handlePass = async () => {
    if (!newPass || !confirmPass) { setMsg("Both fields required."); setOk(false); return; }
    if (newPass !== confirmPass)  { setMsg("Passwords don't match."); setOk(false); return; }
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_URL}/auth/resett-password/${token}`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify({ newPassword:newPass, confirmPassword:confirmPass, id:selectedUserId }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setMsg("Reset successful."); setOk(true); setTimeout(onClose, 1400); }
      else { setMsg(data.message || "Reset failed."); setOk(false); }
    } catch { setMsg("System error."); setOk(false); }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap} style={{ background: mode==="password" ? "rgba(99,102,241,0.12)" : "rgba(255,215,0,0.1)" }}>
            {mode==="password" ? <KeyRound size={20} color="#818cf8" /> : <Mail size={20} color="#ffd700" />}
          </div>
          <div>
            <div className={styles.modalTitle}>{mode==="password" ? "Reset Password" : "Update Email"}</div>
            <div className={styles.modalSubtitle}>{mode==="password" ? "Security credential override" : "Identity registry update"}</div>
          </div>
        </div>
        {mode==="email" ? (
          <div className={styles.modalInputWrap}>
            <label className={styles.modalLabel}><Mail size={10} /> New Email Address</label>
            <input type="email" className={styles.inputField} style={{ width:"100%" }} value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} placeholder="user@example.com" />
          </div>
        ) : (
          <>
            <div className={styles.modalInputWrap}>
              <label className={styles.modalLabel}><KeyRound size={10} /> New Password</label>
              <input type="password" className={styles.inputField} style={{ width:"100%" }} value={newPass} onChange={(e)=>setNewPass(e.target.value)} placeholder="New secure password" />
            </div>
            <div className={styles.modalInputWrap}>
              <label className={styles.modalLabel}><KeyRound size={10} /> Confirm Password</label>
              <input type="password" className={styles.inputField} style={{ width:"100%" }} value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} placeholder="Confirm password" />
            </div>
          </>
        )}
        {msg && <div className={ok ? styles.successMsg : styles.errorMsg}>{msg}</div>}
        <div className={styles.modalBtnGroup}>
          <button onClick={onClose} className={styles.btnSecondary}>Cancel</button>
          <button onClick={mode==="email" ? handleEmail : handlePass} className={styles.btnPrimary}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function UsersPage() {
  const { user, loading: authLoading, API_URL, setToken, setUser } = useAuth();
  const router = useRouter();

  const [users,           setUsers]           = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [filterField,     setFilterField]     = useState("uhid");
  const [filterValue,     setFilterValue]     = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all"); // "all" | "active" | "inactive"
  const [modalUser,       setModalUser]       = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [credMode,        setCredMode]        = useState(null); // "email"|"password"|null
  const [selectedUserId,  setSelectedUserId]  = useState(null);
  const [pagination,      setPagination]      = useState(null);

  const isImpersonating = () => typeof window !== "undefined" && !!localStorage.getItem("impersonated_user");

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push("/sign-in"); return; }
      if (!["support","admin"].includes(user.userType) && !isImpersonating()) router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  /* ── Computed stats ── */
  const activeCount   = useMemo(() => users.filter(u => !u.status || u.status === "active" || u.status === "verified").length, [users]);
  const inactiveCount = useMemo(() => users.filter(u => u.status && u.status !== "active" && u.status !== "verified").length, [users]);
  const totalCount    = pagination?.totalUsers ?? users.length;

  /* ── Filtered users ── */
  const displayedUsers = useMemo(() => {
    if (statusFilter === "all")      return users;
    if (statusFilter === "active")   return users.filter(u => !u.status || u.status === "active" || u.status === "verified");
    if (statusFilter === "inactive") return users.filter(u => u.status && u.status !== "active" && u.status !== "verified");
    return users;
  }, [users, statusFilter]);

  /* ── Impersonate ── */
  const handleView = async (usr) => {
    try {
      const currentToken = localStorage.getItem("token");
      const currentUser  = localStorage.getItem("user");
      const res = await axios.post(`${API_BASE_URL}/api/auth/impersonate`, { targetUserId: usr._id }, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (res?.data?.success) {
        const { token: impToken, impersonatedUser } = res.data;
        if (!localStorage.getItem("main_user_token")) { localStorage.setItem("main_user_token", currentToken); localStorage.setItem("main_user", currentUser); }
        localStorage.setItem("impersonated_user",        JSON.stringify(impersonatedUser));
        localStorage.setItem("impersonated_user_token",  impToken);
        localStorage.setItem("token",                    impToken);
        localStorage.setItem("user",                     JSON.stringify(impersonatedUser));
        setToken(impToken); setUser(impersonatedUser);
        window.open("/dashboard", "_blank");
      }
    } catch { alert("Could not initialize impersonation terminal."); }
  };

  /* ── Fetch users ── */
  const fetchUsers = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      /* DUMMY DATA INJECTION - OVERRIDING API */
      setTimeout(() => {
        const mockUsers = Array.from({ length: 12 }).map((_, i) => {
          const statusTypes = ["verified", "active", "inactive"];
          return {
            _id: `usrmock_${i}`,
            uhid: `U100${i}X${Math.floor(Math.random() * 999)}`,
            username: `CyberUser${i + 1}`,
            email: `cyber${i + 1}@vault.com`,
            status: statusTypes[i % statusTypes.length],
            userType: "user",
            createdAt: new Date(Date.now() - i * 86400000).toISOString()
          };
        });
        setUsers(mockUsers);
        setPagination({ currentPage: page, limit: 12, totalUsers: 145, totalPages: Math.ceil(145 / 12) });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { if (user && ["support","admin"].includes(user.userType)) fetchUsers(1); }, [user]);

  const handleUpdateUser   = (u) => setUsers(prev => prev.map(p => p._id === u._id ? u : p));
  const handleDeleteSuccess= (id) => setUsers(prev => prev.filter(u => u._id !== id));

  /* ── Chart configs ── */
  const donutData = {
    labels: ["Active / Verified", "Inactive"],
    datasets: [{
      data: [activeCount, inactiveCount],
      backgroundColor: ["#10b981", "#f43f5e"],
      borderColor: "transparent",
      hoverOffset: 8,
    }],
  };
  const donutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor:"#0a0a0a", borderColor:"rgba(255,215,0,0.2)", borderWidth:1, titleColor:"#ffd700", bodyColor:"#aaa", padding:10, cornerRadius:10 },
    },
  };

  /* Build a simple status distribution bar chart from current page data */
  const typeCounts = useMemo(() => {
    const map = {};
    users.forEach(u => { const t = u.userType || "user"; map[t] = (map[t]||0) + 1; });
    return map;
  }, [users]);

  const barData = {
    labels: Object.keys(typeCounts),
    datasets: [{
      label: "Users",
      data: Object.values(typeCounts),
      backgroundColor: ["rgba(255,215,0,0.7)", "rgba(16,185,129,0.7)", "rgba(99,102,241,0.7)", "rgba(249,115,22,0.7)"],
      borderRadius: 8, barThickness: 28,
    }],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend:{ display:false }, tooltip:{ backgroundColor:"#0a0a0a", borderColor:"rgba(255,215,0,0.2)", borderWidth:1, titleColor:"#ffd700", bodyColor:"#aaa", padding:10, cornerRadius:10 } },
    scales: {
      x: { grid:{ display:false }, ticks:{ color:"#555", font:{ size:10, weight:"700" } } },
      y: { grid:{ color:"rgba(255,255,255,0.03)" }, ticks:{ color:"#555", font:{ size:10, weight:"700" } }, beginAtZero:true },
    },
  };

  if (authLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", flexDirection:"column", gap:12 }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(255,215,0,0.15)", borderTop:"3px solid #ffd700", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", fontWeight:800, letterSpacing:2 }}>AUTHENTICATING...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className={styles.container}>

      {/* ── CREDENTIAL MODAL ── */}
      {credMode && <CredentialModal mode={credMode} selectedUserId={selectedUserId} API_URL={API_URL} onClose={() => setCredMode(null)} />}

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> BEPVault Admin</div>
          <h1 className={styles.title}>User <span>Registry</span></h1>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => fetchUsers(1)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:12,
              border:"1px solid rgba(255,215,0,0.12)", background:"rgba(255,215,0,0.05)", color:"rgba(255,215,0,0.6)",
              cursor:"pointer", fontSize:12, fontWeight:800 }}>
            <RotateCcw size={13} /> Refresh
          </button>
        </div>
      </header>

      {/* ── ANALYTICS STRIP ── */}
      <div className={styles.analyticsStrip}>
        {[
          { label:"Total Users",    value: totalCount,    icon: Users,    bg:"rgba(255,215,0,0.1)",   color:"#ffd700",  sub:"Registry entries" },
          { label:"Active / Verified", value: activeCount,  icon: UserCheck,bg:"rgba(16,185,129,0.1)", color:"#10b981",  sub:"On this page" },
          { label:"Inactive",       value: inactiveCount, icon: UserX,    bg:"rgba(244,63,94,0.1)",   color:"#f43f5e",  sub:"On this page" },
          { label:"New This Page",  value: users.length,  icon: UserPlus, bg:"rgba(99,102,241,0.1)",  color:"#818cf8",  sub:`Page ${pagination?.currentPage || 1}` },
        ].map((c) => (
          <div key={c.label} className={styles.analyticCard}>
            <div className={styles.analyticIcon} style={{ background: c.bg }}>
              <c.icon size={20} color={c.color} />
            </div>
            <div className={styles.analyticBody}>
              <div className={styles.analyticLabel}>{c.label}</div>
              <div className={styles.analyticValue} style={{ color: c.color }}>{c.value}</div>
              <div className={styles.analyticSub}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── BENTO ROW: Donut | Bar | Search+Filters ── */}
      <div className={styles.bentoRow}>

        {/* Donut — active vs inactive */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            User Status Split
            <span className={styles.cardBadge}>Live</span>
          </div>
          <div className={styles.donutWrap}>
            <div style={{ position:"relative", width:170, height:170 }}>
              <Doughnut data={donutData} options={donutOpts} />
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{users.length}</div>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:2, color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>Loaded</div>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {[
                { label:"Active / Verified", color:"#10b981", count: activeCount   },
                { label:"Inactive",          color:"#f43f5e", count: inactiveCount  },
              ].map((l) => (
                <div key={l.label} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: l.color }} />
                  {l.label}
                  <span style={{ color: l.color, fontWeight: 900, marginLeft: 2 }}>{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar — user type distribution */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            User Type Distribution
            <span className={styles.cardBadge}>Current Page</span>
          </div>
          <div className={styles.chartWrap}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        {/* Search + Filter */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>Search & Filter<span className={styles.cardBadge}>Query</span></div>
          <form className={styles.searchForm} onSubmit={(e) => { e.preventDefault(); fetchUsers(1); }}>
            <div>
              <label className={styles.modalLabel}><Search size={10} /> Search Target</label>
              <div className={styles.searchRow} style={{ marginTop:4 }}>
                <select className={styles.selectField} value={filterField} onChange={(e)=>setFilterField(e.target.value)}>
                  <option value="uhid">UHID</option>
                  <option value="email">Email</option>
                  <option value="username">Username</option>
                  <option value="xrpAddress">USDT Wallet</option>
                </select>
                <input type="text" className={styles.inputField} placeholder="Search credentials..." value={filterValue} onChange={(e)=>setFilterValue(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.searchBtn}>
              {loading ? <RotateCcw size={15} style={{ animation:"spin 1s linear infinite" }} /> : <><Search size={13}/> Execute Search</>}
            </button>

            {/* Status filter chips */}
            <div>
              <label className={styles.modalLabel} style={{ marginBottom:8 }}>Filter by Status</label>
              <div className={styles.filterChips}>
                {[
                  { id:"all",      label:"All Users",  cls: statusFilter==="all"      ? `${styles.chip} ${styles.chipAll}    ${styles.chipAllOn}`      : `${styles.chip} ${styles.chipAll}`     },
                  { id:"active",   label:"Active",     cls: statusFilter==="active"   ? `${styles.chip} ${styles.chipActive}  ${styles.chipActiveOn}`   : `${styles.chip} ${styles.chipActive}`  },
                  { id:"inactive", label:"Inactive",   cls: statusFilter==="inactive" ? `${styles.chip} ${styles.chipInactive}${styles.chipInactiveOn}` : `${styles.chip} ${styles.chipInactive}` },
                ].map((c) => (
                  <button key={c.id} type="button" className={c.cls} onClick={()=>setStatusFilter(c.id)}>
                    {c.id==="active"   && <UserCheck  size={10} />}
                    {c.id==="inactive" && <ShieldOff  size={10} />}
                    {c.id==="all"      && <Activity   size={10} />}
                    {c.label}
                    {c.id==="all"      && <span style={{ marginLeft:4, fontWeight:900 }}>{users.length}</span>}
                    {c.id==="active"   && <span style={{ marginLeft:4, fontWeight:900 }}>{activeCount}</span>}
                    {c.id==="inactive" && <span style={{ marginLeft:4, fontWeight:900 }}>{inactiveCount}</span>}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* ── CARD GRID ── */}
      <div className={styles.cardGrid}>
        {displayedUsers.length > 0 ? displayedUsers.map((u) => {
          const ac      = avatarColor(u.username);
          const initials= (u.username || "?").slice(0,2).toUpperCase();
          const isActive= !u.status || u.status === "active" || u.status === "verified";

          return (
            <div key={u._id} className={`${styles.userCard} ${isActive ? styles.activeCard : styles.inactiveCard}`}>

              {/* Top row: avatar + name + badge */}
              <div className={styles.cardTopRow}>
                <div className={styles.userAvatarBlock}>
                  <div className={styles.userAvatar} style={{ background:ac.bg, color:ac.text }}>{initials}</div>
                  <div>
                    <div className={styles.userName}>{u.username}</div>
                    <div className={styles.userUhid}>UHID: {u.uhid}</div>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {isActive ? <><UserCheck size={9}/> Active</> : <><ShieldOff size={9}/> Inactive</>}
                </span>
              </div>

              {/* Meta info */}
              <div className={styles.cardMeta}>
                <div className={styles.metaRow}>
                  <Mail size={12} color="rgba(255,255,255,0.25)" className={styles.metaIcon} />
                  <span className={styles.metaText}>{u.email}</span>
                </div>
                <div className={styles.metaRow}>
                  <TrendingUp size={12} color="rgba(255,255,255,0.25)" className={styles.metaIcon} />
                  <span className={styles.metaText} style={{ color:"rgba(255,255,255,0.2)" }}>Type: {u.userType || "user"}</span>
                  {u.sponsorUserName && (
                    <>
                      <span style={{ margin:"0 6px", color:"rgba(255,255,255,0.1)" }}>·</span>
                      <span style={{ color:"rgba(255,215,0,0.4)", fontSize:11, fontWeight:700 }}>Ref: {u.sponsorUserName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.cardDivider} />

              {/* Toggle row */}
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Account State</span>
                <ThemedToggle />
              </div>

              <div className={styles.cardDivider} />

              {/* Actions */}
              <div className={styles.cardActions}>
                <button className={`${styles.actionBtn} ${styles.btnView}`} onClick={() => handleView(u)} title="Impersonate">
                  <FaEye size={11}/><ExternalLink size={10}/>
                </button>
                <button className={`${styles.actionBtn} ${styles.btnLedger}`} onClick={() => router.push(`/admin/dashboard/user-ledger?userId=${u._id}`)}>
                  <BookOpen size={11}/> Ledger
                </button>
                <button className={`${styles.actionBtn} ${styles.btnEmail}`} onClick={() => { setSelectedUserId(u._id); setCredMode("email"); }} title="Update Email">
                  <FaPenFancy size={10}/>
                </button>
                <button className={`${styles.actionBtn} ${styles.btnLock}`} onClick={() => { setSelectedUserId(u._id); setCredMode("password"); }} title="Reset Password">
                  <FaLock size={10}/>
                </button>
                <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => { setModalUser(u); setShowDeleteModal(true); }} title="Delete User">
                  <FaTrash size={10}/>
                </button>
              </div>
            </div>
          );
        }) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚡</div>
            <div className={styles.emptyText}>{loading ? "Decrypting registry..." : "No users found"}</div>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Page <span>{pagination.currentPage}</span> of <span>{pagination.totalPages}</span>
            &nbsp;·&nbsp; <span>{pagination.totalUsers}</span> total
          </div>
          <div className={styles.paginationActions}>
            <button disabled={!pagination.hasPrevPage || loading} onClick={() => fetchUsers(pagination.currentPage - 1)} className={styles.btnSecondary} style={{ padding:"9px 18px" }}>
              <ChevronLeft size={14}/> Prev
            </button>
            <button disabled={!pagination.hasNextPage || loading} onClick={() => fetchUsers(pagination.currentPage + 1)} className={styles.btnSecondary} style={{ padding:"9px 18px" }}>
              Next <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <UpdateXrpModal isOpen={showWalletModal} onClose={()=>setShowWalletModal(false)} user={modalUser} onUpdate={handleUpdateUser} />
      <DeleteUserModal isOpen={showDeleteModal} onClose={()=>{setShowDeleteModal(false);setModalUser(null);}} user={modalUser} onDeleteSuccess={handleDeleteSuccess} />

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
