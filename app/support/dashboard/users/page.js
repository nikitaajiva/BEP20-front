"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaEye, FaPenFancy, FaLock } from "react-icons/fa";
import axios from "axios";
import ThemedToggle from "../../../../components/ThemedToggle.js";
// TODO: Move this URL to a .env.local file
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const inputStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(79, 140, 255, 0.2)",
  background: "rgba(79, 140, 255, 0.1)",
  color: "#fff",
  fontSize: "1rem",
  width: "100%",
};

function UpdateXrpModal({ isOpen, onClose, user, onUpdate }) {
  const [xrpAddress, setXrpAddress] = useState(user?.xrpAddress || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setXrpAddress(user?.xrpAddress || "");
    setError(null);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch(
        `${API_BASE_URL}/api/support/users/${user._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ xrpAddress }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update XRP address");
      }
      onUpdate(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          padding: "2rem",
          minWidth: 320,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        }}
      >
        <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
          Update XRP Address
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={xrpAddress}
            onChange={(e) => setXrpAddress(e.target.value)}
            style={inputStyle}
            placeholder="Enter new XRP address"
            disabled={loading}
          />
          {error && (
            <div style={{ color: "#ff4d4d", marginTop: 8 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...inputStyle,
                background: "#4f8cff",
                color: "#fff",
                border: "none",
                width: "50%",
              }}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                ...inputStyle,
                background: "rgba(79, 140, 255, 0.1)",
                color: "#4f8cff",
                border: "1px solid #4f8cff",
                width: "50%",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
            const lp = parseFloat(data.data.lp || "0");
            const xaman = parseFloat(data.data.xaman || "0");
            if (lp > 0 || xaman > 0) {
              setCannotDelete(true);
            }
          } else if (response.status === 404) {
            // If ledger not found, it's safe to delete.
            setLedger({ lp: "0", xaman: "0" });
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
      setError("Cannot delete user with positive LP or Xaman balance.");
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#181f3a",
          borderRadius: "22px",
          padding: "2rem",
          minWidth: 320,
          maxWidth: 450,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(16,25,53,0.18)",
        }}
      >
        <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
          Delete User: {user?.username}
        </h3>
        {error && (
          <div
            style={{
              color: "#ff4d4d",
              marginBottom: "1rem",
              background: "rgba(255, 77, 77, 0.1)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {loading && !ledger && (
          <div style={{ color: "#b3baff" }}>Loading wallet details...</div>
        )}

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
              <strong>LP Balance:</strong> {ledger.lp}
            </p>
            <p style={{ color: "#b3baff", margin: "0.5rem 0" }}>
              <strong>Xaman Balance:</strong> {ledger.xaman}
            </p>
            {cannotDelete && (
              <p
                style={{
                  color: "#ff4d4d",
                  marginTop: "1rem",
                  fontWeight: "bold",
                }}
              >
                This user cannot be deleted because their balances are not zero.
              </p>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={handleDelete}
            disabled={loading || cannotDelete || !ledger}
            style={{
              ...inputStyle,
              background: cannotDelete ? "#555" : "#ff4d4d",
              color: "#fff",
              border: "none",
              width: "50%",
              cursor: cannotDelete ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              ...inputStyle,
              background: "rgba(79, 140, 255, 0.1)",
              color: "#4f8cff",
              border: "1px solid #4f8cff",
              width: "50%",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user, loading: authLoading, API_URL } = useAuth();

  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterField, setFilterField] = useState("uhid");
  const [filterValue, setFilterValue] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const isImpersonating = () => {
    return !!localStorage.getItem("impersonated_user");
  };

  // Debug log for user state
  useEffect(() => {
    console.log("Auth State:", {
      user,
      authLoading,
      userType: user?.userType,
      isAuthorized: user && ["support", "admin"].includes(user.userType),
    });
  }, [user, authLoading]);

  // Check authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log("No user found, redirecting to sign-in");
        router.push("/sign-in");
      } else if (
        !["support", "admin"].includes(user.userType) &&
        !isImpersonating()
      ) {
        console.log(
          "User type not authorized and not impersonating:",
          user.userType
        );
        router.push("/sign-in");
      } else {
        console.log("User authorized:", user.userType);
      }
    }
  }, [user, authLoading, router]);

  const { setToken, setUser } = useAuth();

  const handleView = async (usr) => {
    try {
      console.log("👤 Starting impersonation for user:", usr);

      const currentToken = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/impersonate`,
        { targetUserId: usr._id },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (res?.data?.success) {
        const { token: impersonatedToken, impersonatedUser } = res.data;

        // 🔐 Save original session for restoration
        if (!localStorage.getItem("main_user_token")) {
          localStorage.setItem("main_user_token", currentToken);
          localStorage.setItem("main_user", currentUser);
        }

        // 👥 Store impersonated session
        localStorage.setItem(
          "impersonated_user",
          JSON.stringify(impersonatedUser)
        );
        localStorage.setItem("impersonated_user_token", impersonatedToken);
        localStorage.setItem("token", impersonatedToken);
        localStorage.setItem("user", JSON.stringify(impersonatedUser));

        // ✅ Update AuthContext
        setToken(impersonatedToken);
        setUser(impersonatedUser);

        alert(`✅ You are now impersonating ${impersonatedUser.username}`);
        window.open("/dashboard", "_blank");
        // router.push("/dashboard");
        // router.refresh(); // or use router.push("/dashboard") if needed
      } else {
        alert("❌ Failed to impersonate user.");
      }
    } catch (err) {
      console.error("❌ Impersonation error:", err);
      alert("Something went wrong while impersonating.");
    }
  };
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = { filterField, filterValue, page };
      if (!filterValue) {
        delete cleanFilters.filterValue;
      }
      const query = new URLSearchParams(cleanFilters).toString();

      // Get token from AuthContext's user session
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        throw new Error("Authentication required");
      }

      console.log(
        "Making API request with token:",
        token.substring(0, 10) + "..."
      );

      const response = await fetch(
        `${API_BASE_URL}/api/support/users?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("API Error:", {
          status: response.status,
          errorData,
        });
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch users");
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Fetch error:", err);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  useEffect(() => {
    if (user && ["support", "admin"].includes(user.userType)) {
      console.log("Initial fetch triggered for user type:", user.userType);
      fetchUsers(1);
    }
  }, [user]);

  const handleOpenModal = (user) => {
    setModalUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  const handleOpenDeleteModal = (user) => {
    setModalUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setModalUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((users) =>
      users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };
  const handlePasswordReset = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        setPasswordMessage("Please fill in all the fields.");
        setPasswordSuccess(false);
        return;
      }

      if (newPassword.length < 6) {
        setPasswordMessage("New password must be at least 6 characters long.");
        setPasswordSuccess(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMessage("New password and confirm password do not match.");
        setPasswordSuccess(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordMessage("No authentication token found.");
        setPasswordSuccess(false);
        return;
      }

      const payload = {
        newPassword,
        confirmPassword,
      };

      // ✅ Send selected user’s ID instead of the logged-in user
      if (selectedUserId) {
        payload.id = selectedUserId;
      }

      const res = await fetch(`${API_URL}/auth/resett-password/${token}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordMessage("Password reset successfully!");
        setPasswordSuccess(true);

        setTimeout(() => {
          setShowPasswordModal(false);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordMessage("");
          setPasswordSuccess(false);
        }, 1500);
      } else {
        setPasswordMessage(data.message || "Failed to reset password.");
        setPasswordSuccess(false);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setPasswordMessage("An error occurred while resetting the password.");
      setPasswordSuccess(false);
    }
  };

  const handleEmailReset = async () => {
    try {
      const token = localStorage.getItem("token"); // superadmin token
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_BASE_URL}/api/auth/reset-email/${token}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUserId,
          newEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setEmailMessage("Email updated successfully!");
        setTimeout(() => {
          setShowEmailModal(false);
          setNewEmail("");
          setEmailMessage("");
          // Optionally trigger a refetch of user list
        }, 1500);
      } else {
        setEmailMessage(data.message || "Failed to update email.");
      }
    } catch (err) {
      console.error(err);
      setEmailMessage("Error occurred while updating email.");
    }
  };

  const handleDeleteSuccess = (deletedUserId) => {
    setUsers((users) => users.filter((u) => u._id !== deletedUserId));
  };
  const handleRevert = () => {
    const mainToken = localStorage.getItem("main_user_token");
    const mainUser = localStorage.getItem("main_user");

    if (mainToken && mainUser) {
      // Revert session
      localStorage.setItem("token", mainToken);
      localStorage.setItem("user", mainUser);

      // Clear impersonation data
      localStorage.removeItem("impersonated_user");
      localStorage.removeItem("impersonated_user_token");
      localStorage.removeItem("main_user_token");
      localStorage.removeItem("main_user");

      // Update context
      setToken(mainToken);
      setUser(JSON.parse(mainUser));

      alert("🔁 Reverted to your original account.");
      window.location.reload(); // Or use router.push('/admin-dashboard')
    } else {
      alert("⚠️ No impersonation session to revert.");
    }
  };
  // Show loading state while checking authorization
  if (authLoading) {
    return (
      <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
        Loading authentication state...
      </div>
    );
  }

  if (
    !user ||
    (!["support", "admin"].includes(user.userType) && !isImpersonating())
  ) {
    return (
      <div style={{ textAlign: "center", color: "#ff4d4d", padding: "2rem" }}>
        Unauthorized access. Redirecting...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#181f3a",
        borderRadius: "22px",
        padding: "2rem",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", color: "#fff" }}>
        Users Management
      </h2>
      <form
        onSubmit={handleSearch}
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(79, 140, 255, 0.2)",
          background: "rgba(16,25,53,0.5)",
          display: "flex",
          gap: "1rem",
        }}
      >
        <div style={{ flex: "0 0 200px" }}>
          <select
            style={inputStyle}
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="uhid">UHID</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="xrpAddress">XRP Address</option>
          </select>
        </div>
        <div style={{ flex: "1 1 auto" }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Enter search value..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        <div style={{ flex: "0 0 120px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "rgba(79, 140, 255, 0.1)",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              color: "#4f8cff",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1,
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </form>

      {loading && (
        <div style={{ textAlign: "center", color: "#b3baff", padding: "2rem" }}>
          Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(255, 77, 77, 0.1)",
            border: "1px solid rgba(255, 77, 77, 0.2)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#ff4d4d",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderSpacing: 0,
          }}
        >
          {(showPasswordModal || showEmailModal) && (
            <div
              style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "9999",
              }}
            >
              <div
                style={{
                  background: "#1c1f2e",
                  padding: "2rem",
                  borderRadius: "8px",
                  minWidth: "300px",
                }}
              >
                <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
                  {showPasswordModal ? "Reset Password" : "Update Email"}
                </h3>

                {showPasswordModal && (
                  <>
                    {/* New Password */}
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          padding: "0.5rem",
                          width: "100%",
                          borderRadius: "4px",
                          paddingRight: "2.5rem",
                        }}
                      />
                      <span
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "0.5rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {showNewPassword ? "👁️" : "🙈"}
                      </span>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          padding: "0.5rem",
                          width: "100%",
                          borderRadius: "4px",
                          paddingRight: "2.5rem",
                        }}
                      />
                      <span
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "0.5rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {showConfirmPassword ? "👁️" : "🙈"}
                      </span>
                    </div>

                    {/* Message */}
                    {passwordMessage && (
                      <p
                        style={{
                          color: passwordMessage.includes("successfully")
                            ? "green"
                            : "red",
                          marginBottom: "1rem",
                        }}
                      >
                        {passwordMessage}
                      </p>
                    )}
                  </>
                )}

                {showEmailModal && (
                  <>
                    <input
                      type="email"
                      placeholder="New Email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={{
                        padding: "0.5rem",
                        marginBottom: "1rem",
                        width: "100%",
                        borderRadius: "4px",
                      }}
                    />
                    {emailMessage && (
                      <p
                        style={{
                          color: emailMessage.includes("successfully")
                            ? "green"
                            : "red",
                          marginBottom: "1rem",
                        }}
                      >
                        {emailMessage}
                      </p>
                    )}
                  </>
                )}

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowEmailModal(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setNewEmail("");
                      setPasswordMessage("");
                      setEmailMessage("");
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#555",
                      color: "#fff",
                      borderRadius: "4px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      showPasswordModal ? handlePasswordReset : handleEmailReset
                    }
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      borderRadius: "4px",
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

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
                XRP Address
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
                <tr
                  key={user._id}
                  style={{
                    borderBottom: "1px solid rgba(79, 140, 255, 0.1)",
                  }}
                >
                  <td style={{ padding: "1rem", color: "#fff" }}>
                    <div> {user.username}</div>
                    <div> {user.uhid}</div>
                  </td>
                  {/* <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {user.username}
                  </td> */}
                  <td
                    style={{
                      padding: "1rem",
                      color: "#b3baff",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {user.email}
                    <FaPenFancy
                      title="Edit Email"
                      style={{ cursor: "pointer", color: "#b3baff" }}
                      onClick={() => {
                        setSelectedUserId(user._id); // Ensure this sets the correct user
                        setShowEmailModal(true);
                        setNewEmail(user.email); // Optional: prefill existing email
                        setEmailMessage(""); // Reset message
                      }}
                    />

                    <FaLock
                      title="Update Password"
                      style={{ cursor: "pointer", color: "#b3baff" }}
                      onClick={() => {
                        setShowPasswordModal(true);
                        setSelectedUserId(user._id); // capture which user is being edited
                      }}
                    />
                  </td>

                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {user.sponsorUserName || "N/A"}
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    {user.xrpAddress || "N/A"}
                    <button
                      onClick={() => handleOpenModal(user)}
                      style={{
                        marginLeft: 8,
                        background: "rgba(79, 140, 255, 0.1)",
                        color: "#4f8cff",
                        border: "1px solid #4f8cff",
                        borderRadius: 8,
                        padding: "2px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Update
                    </button>
                  </td>

                  <td style={{ padding: "1rem", color: "#b3baff" }} className="custom-style-chackbox">
                    <button className="bg-green-500 text-white p-1 rounded hover:bg-green-600">
                      <input className="" type="checkbox" />
                    </button>
                  </td>

                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    <button className="bg-green-500 text-white p-1 rounded hover:bg-green-600">
                      <ThemedToggle />
                    </button>
                  </td>
                  <td style={{ padding: "1rem", color: "#b3baff" }}>
                    <button
                      title="Impersonate"
                      onClick={() => handleView(user)} // ✅ FIXED HERE
                      className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                    >
                      <FaEye />
                    </button>
                  </td>

                  <td
                    style={{
                      padding: "1rem",
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() =>
                        router.push(
                          `/support/dashboard/user-ledger?userId=${user._id}`
                        )
                      }
                      style={{
                        ...inputStyle,
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                        background: "#3b4a78",
                        border: "none",
                        width: "auto",
                      }}
                    >
                      Ledger
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(user)}
                      style={{
                        background: "#ff4d4d",
                        border: "none",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#b3baff",
                  }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <span style={{ color: "#b3baff" }}>
            Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalUsers} users)
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => fetchUsers(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              style={{
                ...inputStyle,
                width: "auto",
                opacity: !pagination.hasPrevPage || loading ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              style={{
                ...inputStyle,
                width: "auto",
                opacity: !pagination.hasNextPage || loading ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <UpdateXrpModal
        isOpen={showModal}
        onClose={handleCloseModal}
        user={modalUser}
        onUpdate={handleUpdateUser}
      />
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        user={modalUser}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
