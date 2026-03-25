"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, loading, updateUser, API_URL } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    country: "",
    countryCode: "",
    whatsappContact: "",
    xrpAddress: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email verify modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [verifyInfoMsg, setVerifyInfoMsg] = useState("");
  const [verifyErrorMsg, setVerifyErrorMsg] = useState("");
  const [verifyInput, setVerifyInput] = useState(""); // fallback (prod)
  const [verifyProcessing, setVerifyProcessing] = useState(false);
  const [verifyDone, setVerifyDone] = useState(false);
  const [verifyToken, setVerifyToken] = useState(""); // ✅ token from API (dev)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        country: user.country?.name || "",
        countryCode: user.countryCode || "",
        whatsappContact: user.whatsappContact || "",
        xrpAddress: user.xrpAddress || "",
      });

      if (!user.country?.name) {
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => {
            setFormData((prev) => ({
              ...prev,
              country: data.country_name || "",
              countryCode: data.country_calling_code || "",
            }));
          })
          .catch((err) => {
            console.error("Error fetching IP geolocation:", err);
          });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setMessage("Profile updated successfully!");
      updateUser?.(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?._id,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordMessage("Password reset successfully!");
        setPasswordSuccess(true);

        setTimeout(() => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordMessage("");
          setPasswordSuccess(false);
        }, 1500);
      } else {
        setPasswordMessage(data.message || "Failed to reset password.");
        setPasswordSuccess(false);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setPasswordMessage("Error occurred while resetting password.");
      setPasswordSuccess(false);
    }
  };

  // Open verify modal, send email, and capture dev token (if returned)
  const openVerifyModal = async () => {
    setShowVerifyModal(true);
    setVerifyInfoMsg("");
    setVerifyErrorMsg("");
    setVerifyInput("");
    setVerifyToken("");
    setVerifyDone(false);

    try {
      setVerifySending(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/auth/send-email-verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send verification email");

      if (data.devToken) {
        // DEV mode: we can show the token and auto-verify
        setVerifyToken(data.devToken);
        setVerifyInfoMsg(
          "Verification email sent. You can verify using the token below."
        );
      } else {
        // PROD: no token returned — user must click email link (fallback input still available)
        setVerifyInfoMsg(
          "Verification email sent. Please open your inbox — clicking the email link will complete verification."
        );
      }
    } catch (e) {
      setVerifyErrorMsg(e.message || "Could not send verification email.");
    } finally {
      setVerifySending(false);
    }
  };

  // Fallback extractor (if user pasted the link in prod)
  const extractToken = (text) => {
    if (!text) return "";
    try {
      const maybeURL = new URL(text);
      const t = maybeURL.searchParams.get("token");
      if (t) return t.trim();
    } catch {}
    return text.trim();
  };

  const handleVerifyConfirm = async () => {
    setVerifyErrorMsg("");
    setVerifyInfoMsg("");
    setVerifyProcessing(true);

    try {
      // Prefer auto token from backend (dev). Else fallback to user input (prod).
      const tokenRaw = verifyToken || extractToken(verifyInput);
      if (!tokenRaw) {
        throw new Error(
          "No token available. In production, verification completes by clicking the email link."
        );
      }

      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenRaw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");

      setVerifyDone(true);
      setVerifyInfoMsg("Email verified successfully!");
      updateUser?.(data.user);

      setTimeout(() => {
        setShowVerifyModal(false);
      }, 1200);
    } catch (e) {
      setVerifyErrorMsg(e.message || "Verification failed.");
    } finally {
      setVerifyProcessing(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  if (!user) {
    return (
      <div className={styles.loading}>Please log in to view your profile.</div>
    );
  }

  const isEmailVerified = user?.isEmailVerified || false;

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.header}>My Profile</h1>
      <p className={styles.subHeader}>Update your personal details here.</p>

      <div className={styles.profileCard}>
        <form onSubmit={handleSubmit}>
          {message && <div className={styles.successMessage}>{message}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.inputField}
              disabled
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email || ""}
              className={styles.inputField}
              disabled
            />

            {!isEmailVerified && (
              <div style={{ marginTop: 8 }}>
                <small style={{ color: "#ff4d4f" }}>
                  Email not verified. Please verify to continue.{" "}
                  <button
                    type="button"
                    onClick={openVerifyModal}
                    disabled={verifySending}
                    style={{
                      background: "none",
                      border: "none",
                      color: verifySending ? "#999" : "#4f8cff",
                      textDecoration: "underline",
                      cursor: verifySending ? "default" : "pointer",
                      padding: 0,
                      marginLeft: 4,
                      fontSize: "12px",
                    }}
                  >
                    {verifySending ? "Sending..." : "Verify now"}
                  </button>
                </small>
              </div>
            )}

            {verifyInfoMsg && (
              <div
                style={{
                  fontSize: 14,
                  marginBottom: 8,
                  color: verifyInfoMsg
                    .toLowerCase()
                    .includes("email verified successfully")
                    ? "limegreen"
                    : "#b3baff",
                }}
              >
                {verifyInfoMsg}
              </div>
            )}

            {verifyErrorMsg && !showVerifyModal && (
              <div style={{ color: "#ff4d4f", marginTop: 6, fontSize: 12 }}>
                {verifyErrorMsg}
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  background: "none",
                  color: "#4f8cff",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px",
                  textDecoration: "underline",
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="xrpAddress">XRP Address</label>
            <input
              type="text"
              id="xrpAddress"
              name="xrpAddress"
              value={formData.xrpAddress}
              className={styles.inputField}
              disabled
            />
            <small>
              Your XRP Address is linked to your Xaman wallet and cannot be
              changed here.
            </small>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="whatsappContact">WhatsApp Contact</label>
            <input
              type="text"
              id="whatsappContact"
              name="whatsappContact"
              value={formData.whatsappContact}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#181f3a",
              border: "1px solid #4f8cff26",
              borderRadius: "22px",
              padding: "2.5rem",
              boxShadow: "0 8px 32px #4f8cff1a",
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#fff" }}>
              Change Password
            </h3>

            {passwordMessage && (
              <div
                style={{
                  color: passwordSuccess ? "limegreen" : "#ff4d4f",
                  marginBottom: "1rem",
                  fontSize: "14px",
                }}
              >
                {passwordMessage}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  backgroundColor: "#999",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handlePasswordReset}
                style={{
                  backgroundColor: "#4f8cff",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !verifyProcessing && setShowVerifyModal(false)}
        >
          <div
            style={{
              background: "#181f3a",
              border: "1px solid #4f8cff26",
              borderRadius: "22px",
              padding: "2rem",
              boxShadow: "0 8px 32px #4f8cff1a",
              width: "560px",
              maxWidth: "95%",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Verify your email</h3>

            {verifySending && (
              <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
                Sending verification link to your email...
              </div>
            )}

            {verifyInfoMsg && (
              <div style={{ fontSize: 14, marginBottom: 8, color: "#b3baff" }}>
                {verifyInfoMsg}
              </div>
            )}

            {verifyErrorMsg && (
              <div style={{ fontSize: 14, marginBottom: 8, color: "#ff4d4f" }}>
                {verifyErrorMsg}
              </div>
            )}

            {/* ✅ Show token if backend returned it */}
            {verifyToken ? (
              <div
                style={{
                  display: "none", // hides it but keeps in DOM
                  margin: "12px 0 16px",
                  padding: "10px 12px",
                  background: "#0f1430",
                  border: "1px solid #4f8cff26",
                  borderRadius: 8,
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#b3baff",
                }}
              >
                <strong style={{ color: "#fff" }}>This is your Token:</strong>{" "}
                {verifyToken}
              </div>
            ) : (
              // Fallback input for production
              <div className={styles.inputGroup} style={{ display: "none" }}>
                <label htmlFor="verifyInput">
                  Paste verification link or token
                </label>
                <input
                  id="verifyInput"
                  type="text"
                  className={styles.inputField}
                  placeholder="Paste the link from the email, or just the token"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                />
              </div>
            )}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
            >
              <button
                type="button"
                onClick={() => !verifyProcessing && setShowVerifyModal(false)}
                style={{
                  backgroundColor: "#999",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: verifyProcessing ? "not-allowed" : "pointer",
                  opacity: verifyProcessing ? 0.7 : 1,
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleVerifyConfirm}
                disabled={verifyProcessing}
                style={{
                  backgroundColor: verifyDone ? "limegreen" : "limegreen",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {verifyProcessing
                  ? "Verifying..."
                  : verifyDone
                  ? "Verified"
                  : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
