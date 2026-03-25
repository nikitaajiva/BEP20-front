"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaEye, FaPenFancy, FaLock, FaTrash, FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import ThemedToggle from "../../../../components/ThemedToggle.js";
import styles from "./users.module.css";
import { Search, RotateCcw, ChevronLeft, ChevronRight, UserCheck, ShieldOff } from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

function DeleteUserModal({ isOpen, onClose, user, onDeleteSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [cannotDelete, setCannotDelete] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      setError(null);
      setLedger(null);
      setCannotDelete(false);

      const fetchLedger = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Authentication required");

          const response = await fetch(
            `${API_BASE_URL}/api/support/ledger?userId=${user._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            setLedger(data.data);
            const lp = parseFloat(data.data.wallets?.lp || "0");
            const usdt = parseFloat(data.data.wallets?.usdt || "0");
            if (lp > 0 || usdt > 0) {
              setCannotDelete(true);
            }
          } else if (response.status === 404) {
            // If ledger not found, it's safe to delete.
            setLedger({ lp: "0", usdt: "0" });
            setCannotDelete(false);
          } else {
            throw new Error(data.message || "Failed to fetch ledger details.");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchLedger();
    }
  }, [isOpen, user]);

  const handleDelete = async () => {
    if (cannotDelete) {
      setError("Cannot delete user with positive LP or USDT balance.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/api/support/users/${user._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user.");
      }

      onDeleteSuccess(user._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: 500 }}>
        <h3 className={styles.modalTitle} style={{ color: '#ff4d4d' }}>Danger Zone: Delete User</h3>
        <p style={{ color: '#888', marginBottom: '20px', textAlign: 'center' }}>
          Deleting <strong>{user?.username}</strong> is a permanent action.
        </p>
        
        {loading && !ledger && <p style={{ color: '#ffd700', textAlign: 'center' }}>Validating account state...</p>}
        
        {ledger && (
          <div
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
            }}
          >
            <h4
              style={{
                color: "#fff",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(79, 140, 255, 0.2)",
                paddingBottom: "0.5rem",
              }}
            >
              Wallet Balances
            </h4>
            <p style={{ color: "#b3baff", margin: "0.5rem 0" }}>
              <strong>LP Balance:</strong> {ledger.wallets?.lp}
            </p>
            <p style={{ color: "#b3baff", margin: "0.5rem 0" }}>
              <strong>USDT Balance:</strong> {ledger.wallets?.usdt}
            </p>
            {cannotDelete && (
              <p style={{ color: "#ff4d4d", marginTop: "15px", fontSize: '12px', padding: '10px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px' }}>
                Account cannot be purged. Wallet must be empty (0.00).
              </p>
            )}
          </div>
        )}

        {error && <p style={{ color: "#ff4d4d", fontSize: '12px', marginBottom: '15px' }}>{error}</p>}

        <div className={styles.modalBtnGroup}>
          <button onClick={onClose} className={styles.btnSecondary}>Cancel</button>
          <button 
            onClick={handleDelete} 
            disabled={loading || cannotDelete || !ledger}
            className={styles.btnDanger}
            style={{ opacity: (loading || cannotDelete || !ledger) ? 0.4 : 1 }}
          >
            {loading ? "Purging..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user, loading: authLoading, API_URL, setToken, setUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterField, setFilterField] = useState("uhid");
  const [filterValue, setFilterValue] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const isImpersonating = () => {
    return typeof window !== 'undefined' && !!localStorage.getItem("impersonated_user");
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/sign-in");
      } else if (!["support", "admin"].includes(user.userType) && !isImpersonating()) {
        router.push("/sign-in");
      }
    }
  }, [user, authLoading, router]);

  const handleView = async (usr) => {
    try {
      const currentToken = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");
      const res = await axios.post(`${API_BASE_URL}/api/auth/impersonate`, { targetUserId: usr._id }, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res?.data?.success) {
        const { token: impersonatedToken, impersonatedUser } = res.data;
        if (!localStorage.getItem("main_user_token")) {
          localStorage.setItem("main_user_token", currentToken);
          localStorage.setItem("main_user", currentUser);
        }
        localStorage.setItem("impersonated_user", JSON.stringify(impersonatedUser));
        localStorage.setItem("impersonated_user_token", impersonatedToken);
        localStorage.setItem("token", impersonatedToken);
        localStorage.setItem("user", JSON.stringify(impersonatedUser));
        setToken(impersonatedToken);
        setUser(impersonatedUser);
        window.open("/dashboard", "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("System could not initialize impersonation terminal.");
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = { filterField, filterValue, page };
      if (!filterValue) delete cleanFilters.filterValue;
      const query = new URLSearchParams(cleanFilters).toString();
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/api/support/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch users");
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Authentication required")) router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      fetchUsers(1);
    }
  }, [user]);


  const handleOpenDeleteModal = (user) => {
    setModalUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setModalUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((users) => users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
  };

  const handlePasswordReset = async () => {
    try {
      if (!newPassword || !confirmPassword) { setPasswordMessage("Fields required."); setPasswordSuccess(false); return; }
      if (newPassword !== confirmPassword) { setPasswordMessage("Passwords mismatch."); setPasswordSuccess(false); return; }
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/resett-password/${token}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword, id: selectedUserId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage("Reset successful."); setPasswordSuccess(true);
        setTimeout(() => { setShowPasswordModal(false); setPasswordMessage(""); }, 1500);
      } else { setPasswordMessage(data.message || "Reset failed."); setPasswordSuccess(false); }
    } catch (err) { setPasswordMessage("System error."); setPasswordSuccess(false); }
  };

  const handleEmailReset = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-email/${token}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUserId, newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMessage("Email synchronized.");
        setTimeout(() => { setShowEmailModal(false); setEmailMessage(""); }, 1500);
      } else { setEmailMessage(data.message || "Sync failed."); }
    } catch (err) { setEmailMessage("System error."); }
  };

  const handleDeleteSuccess = (deletedUserId) => {
    setUsers((users) => users.filter((u) => u._id !== deletedUserId));
  };

  if (authLoading) return <div className="text-center p-5 text-gold">Synchronizing...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System <span>Users Terminal</span></h1>
        <div className={styles.uhidText}>Total Authorized: {pagination?.totalUsers || 0}</div>
      </header>

      {/* Global Modals for Email/Pass */}
      {(showPasswordModal || showEmailModal) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{showPasswordModal ? "Security: Reset Password" : "Identity: Update Email"}</h3>
            
            {showPasswordModal && (
              <div className="flex flex-col gap-4">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Secure Password"
                  className={styles.inputField}
                  style={{ width: '100%', marginBottom: '10px' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={styles.inputField}
                  style={{ width: '100%', marginBottom: '10px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordMessage && <p style={{ color: passwordSuccess ? '#00ff00' : '#ff4d4d', fontSize: '12px' }}>{passwordMessage}</p>}
              </div>
            )}

            {showEmailModal && (
              <div className="flex flex-col gap-4">
                <input
                  type="email"
                  className={styles.inputField}
                  style={{ width: '100%', marginBottom: '10px' }}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New Email Address"
                />
                {emailMessage && <p style={{ color: emailMessage.includes("successfully") || emailMessage.includes("synchronized") ? '#00ff00' : '#ff4d4d', fontSize: '12px' }}>{emailMessage}</p>}
              </div>
            )}

            <div className={styles.modalBtnGroup}>
              <button 
                onClick={() => { setShowPasswordModal(false); setShowEmailModal(false); }} 
                className={styles.btnSecondary}
              >Cancel</button>
              <button 
                onClick={showPasswordModal ? handlePasswordReset : handleEmailReset}
                className={styles.btnPrimary}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter Interface */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputGroup} style={{ flex: '0 0 200px' }}>
          <label className={styles.modalLabel}><Search size={12} /> Search Target</label>
          <select className={styles.selectField} value={filterField} onChange={(e) => setFilterField(e.target.value)}>
            <option value="uhid">UHID (System ID)</option>
            <option value="email">Email Account</option>
            <option value="username">Username</option>
            <option value="wallet_address">Wallet Address</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.modalLabel}>Query Parameters</label>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Search credentials..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className={styles.searchBtn}>
          {loading ? <RotateCcw size={20} className="animate-spin" /> : "Execute Search"}
        </button>
      </form>

      {error && <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">{error}</div>}

      {/* Main Data Terminal */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(79, 140, 255, 0.2)" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                <div>Username</div>
                <div> UHID</div>
              </th>
              {/* <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Username
              </th> */}
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Referred By
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Wallet Address
              </th>

              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Inactive User
              </th>

              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Stop Transaction
              </th>

              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                View
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  color: "#4f8cff",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className={styles.usernameCell}>
                      <span style={{ fontWeight: 800, color: '#ffd700' }}>{user.username}</span>
                      <span className={styles.uhidText}>UHID: {user.uhid}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', opacity: 0.8 }}>{user.email}</span>
                      <div className="flex gap-2">
                        <FaPenFancy className={styles.actionIcon} onClick={() => { setSelectedUserId(user._id); setShowEmailModal(true); setNewEmail(user.email); }} />
                        <FaLock className={styles.actionIcon} onClick={() => { setShowPasswordModal(true); setSelectedUserId(user._id); }} />
                      </div>
                    </div>
                  </td>
                  {/* <td><span style={{ fontSize: '13px', color: '#888' }}>{user.sponsorUserName || "Genesis"}</span></td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.6 }}>{user.xrpAddress || "Not Linked"}</span>
                      <button onClick={() => handleOpenModal(user)} className={styles.btnGhost}>Re-link</button>
                    </div>
                  </td> */}
                  <td>
                    <div className="flex items-center gap-2">
                      {user.status === 'active' ? <UserCheck size={16} color="#00ff00" /> : <ShieldOff size={16} color="#ff4d4d" />}
                      <span className={styles.badge} style={{ color: user.status === 'active' ? '#00ff00' : '#ff4d4d' }}>{user.status || 'Verified'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                        <ThemedToggle />
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {user.wallet_address || "N/A"}
                  </td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button 
                        onClick={() => router.push(`/support/dashboard/user-ledger?userId=${user._id}`)}
                        className={styles.btnSecondary}
                        style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                      >Ledger</button>
                      <button 
                        onClick={() => handleOpenDeleteModal(user)} 
                        className={styles.btnDanger}
                        style={{ fontSize: '11px', padding: '6px 12px', height: '32px', width: '32px' }}
                      ><FaTrash size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#555' }}>
                  {loading ? "Decrypting database..." : "No registry entries found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Interface */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Registry Segment <span>{pagination.currentPage}</span> of <span>{pagination.totalPages}</span>
          </div>
          <div className={styles.paginationActions}>
            <button 
              disabled={!pagination.hasPrevPage || loading} 
              onClick={() => fetchUsers(pagination.currentPage - 1)}
              className={styles.btnSecondary}
              style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              disabled={!pagination.hasNextPage || loading} 
              onClick={() => fetchUsers(pagination.currentPage + 1)}
              className={styles.btnSecondary}
              style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        user={modalUser}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
