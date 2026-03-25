"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "./signup.module.css";
import { useAuth } from "@/context/AuthContext";
import { COUNTRIES_DATA } from "@/utils/countries";
import { useSearchParams } from "next/navigation";

function SignUpForm() {
  const { signup, error, loading, setError } = useAuth();
  const searchParams = useSearchParams();
  const sponsorId = searchParams.get("sponsorId");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    selectedCountry: null,
    countryCode: "",
    whatsappContact: "",
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  const filteredCountries = COUNTRIES_DATA.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      selectedCountry: country,
      countryCode: country.dial_code,
    }));
    setCountrySearch(`${country.flag} ${country.name}`);
    setIsDropdownOpen(false);
  };

  const handleCountryInputFocus = () => {
    setIsDropdownOpen(true);
    if (
      formData.selectedCountry &&
      countrySearch ===
        `${formData.selectedCountry.flag} ${formData.selectedCountry.name}`
    ) {
      setCountrySearch("");
    }
  };

  const handleCountryInputChange = (e) => {
    setCountrySearch(e.target.value);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
    if (e.target.value === "") {
      setFormData((prev) => ({
        ...prev,
        selectedCountry: null,
        countryCode: "",
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (!formData.email || !formData.selectedCountry) {
      setError(
        "Please fill in all required fields including email and country."
      );
      return;
    }
    const emailParts = formData.email.split("@");
    if (
      !formData.email.includes("@") ||
      emailParts.length < 2 ||
      !emailParts[0] ||
      !emailParts[1].includes(".")
    ) {
      setError("Error! Please enter a valid email.");
      return;
    }
    const derivedUsername = emailParts[0];

    const payload = {
      email: formData.email,
      username: derivedUsername,
      country: formData.selectedCountry.code,
      countryCode: formData.countryCode, 
      whatsappContact: formData.whatsappContact,
      sponsorId: sponsorId,
    };

    const result = await signup(payload);

    if (result && result.success) {
      setMessage(result.message);
    }
  };

  useEffect(() => {
    if (formData.selectedCountry) {
      setCountrySearch(
        `${formData.selectedCountry.flag} ${formData.selectedCountry.name}`
      );
    } else {
      setCountrySearch("");
    }
  }, [formData.selectedCountry]);

  useEffect(() => {
    async function fetchUserCountry() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const countryCode = data.country;

        const found = COUNTRIES_DATA.find(
          (c) => c.code.toUpperCase() === countryCode.toUpperCase()
        );

        if (found) {
          setFormData((prev) => ({
            ...prev,
            selectedCountry: found,
            countryCode: found.dial_code,
          }));
          setWasAutoDetected(true);
        }
      } catch (err) {
        console.error("Failed to fetch IP country:", err);
      }
    }

    fetchUserCountry();
  }, []);

  return (
    <>
      <Head>
        <title>Sign Up - BEPVault</title>
        <meta name="description" content="Create your BEPVault account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.signUpPage}>
        <div className={styles.leftColumn}>
          <div className={styles.logoContainer}>
            <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <Image
                src="/bepvault_logo.png"
                alt="BEPVault Logo"
                width={50}
                height={50}
                className={styles.logo}
              />
              <span style={{ color: "#ffd700", fontWeight: 800, fontSize: 24, letterSpacing: "1px" }}>BEPVault</span>
            </Link>
          </div>
          <div className={styles.illustrationContainer}>
            <Image
              src="/assets/img/illustrations/auth-signup-character.png"
              alt="Sign Up Illustration"
              width={500}
              height={500}
              className={styles.mainIllustration}
              priority
            />
            
            {/* Branded Floating Elements */}
            <div className={`${styles.floatingElement} ${styles.floatingAccountLimit}`}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="160" rx="20" fill="#0c0c0c" stroke="rgba(255,215,0,0.2)" strokeWidth="1" />
                <text x="50%" y="30" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#E0E0E0">Account Limit</text>
                <circle cx="100" cy="90" r="35" stroke="rgba(255,215,0,0.1)" strokeWidth="8" fill="none" />
                <path d="M100 55 A 35 35 0 0 1 124.7487 65.2512" stroke="#ffd700" strokeWidth="8" fill="none" strokeLinecap="round" />
                <text x="100" y="90" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="bold" fill="#ffd700">23%</text>
                <text x="100" y="135" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,215,0,0.6)">USDT Usage</text>
              </svg>
            </div>

            <Image
              src="/assets/img/illustrations/floating-sphere.png"
              alt="Floating Sphere"
              width={160}
              height={160}
              className={`${styles.floatingElement} ${styles.floatingSphere}`}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Adventure starts here 🚀</h1>
            <p className={styles.subtitle}>
              Please sign-up to your account and start the liquidity.
            </p>

            {error && <p className={styles.errorMessage}>{error}</p>}
            {message && <p className={styles.successMessage}>{message}</p>}

            {!message && (
              <form onSubmit={handleSubmit} className={styles.signUpForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Your Personal Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.inputField}
                    placeholder="johndoe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="sponsorId" className={styles.label}>Referred By</label>
                  <input
                    type="text"
                    id="sponsorId"
                    name="sponsorId"
                    className={styles.inputField}
                    placeholder="No sponsor specified"
                    value={sponsorId || ""}
                    disabled
                  />
                </div>

                <div className={styles.inputGroup} ref={dropdownRef}>
                  <label htmlFor="countrySearch" className={styles.label}>Select Country</label>
                  <input
                    type="text"
                    id="countrySearch"
                    className={styles.inputField}
                    placeholder="Select Country"
                    value={countrySearch}
                    onChange={handleCountryInputChange}
                    onFocus={handleCountryInputFocus}
                    autoComplete="off"
                    disabled={wasAutoDetected}
                  />
                  {isDropdownOpen && (
                    <ul className={styles.countryDropdownList}>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <li
                            key={country.code}
                            onClick={() => handleCountrySelect(country)}
                            className={styles.countryDropdownItem}
                          >
                            {country.flag} {country.name}
                          </li>
                        ))
                      ) : (
                        <div className={styles.countryDropdownNoResults}>No countries found</div>
                      )}
                    </ul>
                  )}
                </div> 
                
                <div className={styles.inputGroup}>
                  <label htmlFor="whatsappContact" className={styles.label}>WhatsApp Contact</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className={styles.inputField}
                      style={{ width: '80px' }}
                      value={formData.countryCode}
                      readOnly
                    />
                    <input
                      type="tel"
                      id="whatsappContact"
                      name="whatsappContact"
                      className={styles.inputField}
                      placeholder="WhatsApp Number"
                      value={formData.whatsappContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !sponsorId}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className={styles.signInRedirect}>
                  Already have an account?{" "}
                  <Link href="/sign-in" className={styles.signInLink}>Sign in instead</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
