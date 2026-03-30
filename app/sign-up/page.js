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
  
  // Animation state
  const [particles, setParticles] = useState([]);

  const filteredCountries = COUNTRIES_DATA.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    // Generate particles for background
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

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
        {/* Animated Background */}
        <div className={styles.lightRaysContainer}>
          <div className={styles.ray}></div>
          <div className={styles.ray}></div>
        </div>
        <div className={styles.ambientGlow}></div>

        <div className={styles.bgAnimation}>
          {particles.map((p) => (
            <div
              key={p.id}
              className={styles.particle}
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            ></div>
          ))}
        </div>

        <div className={styles.externalBorder}>
          <div className={styles.mainContainer}>
            <div className={styles.formGlassCard}>
              {/* Floating Logo Box */}
              <div className={styles.logoBoxTop}>
                <Link href="/">
                  <Image
                    src="/bepvault_logo.png"
                    alt="Logo"
                    width={45}
                    height={45}
                  />
                </Link>
              </div>

              <div className={styles.cardHeader}>
                <h1 className={styles.title}>Welcome to <span className={styles.vaultText}>BEPVault!</span></h1>
                <p className={styles.subtitle}>Secure access to your administrative command center</p>
              </div>

              <div className={styles.cardBody}>
                {/* Left Side: Illustration */}
                <div className={styles.illustrationContainer}>
                  <div className={styles.robotWrapper}>
                    <Image
                      src="/assets/img/illustrations/bepvault-robot.png"
                      alt="BEPVault Robot"
                      width={450}
                      height={450}
                      className={styles.robotImage}
                      priority
                    />
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className={styles.formSide}>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                  {message && <div className={styles.successMessage}>{message}</div>}

                  {!message && (
                    <form onSubmit={handleSubmit} className={styles.signUpForm}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>EMAIL ADDRESS</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={styles.inputField}
                          placeholder="nikitaajiva@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="sponsorId" className={styles.label}>REFERRED BY</label>
                        <input
                          type="text"
                          id="sponsorId"
                          name="sponsorId"
                          className={styles.inputField}
                          value={sponsorId || ""}
                          placeholder="No referral code detected"
                          disabled
                        />
                      </div>

                      <div className={styles.inputGroup} ref={dropdownRef}>
                        <label htmlFor="countrySearch" className={styles.label}>SELECT COUNTRY</label>
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
                        <label htmlFor="whatsappContact" className={styles.label}>WHATSAPP CONTACT</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="text"
                            className={styles.inputField}
                            style={{ width: '85px', textAlign: 'center' }}
                            value={formData.countryCode}
                            readOnly
                            disabled
                          />
                          <input
                            type="tel"
                            id="whatsappContact"
                            name="whatsappContact"
                            className={styles.inputField}
                            placeholder="WhatsApp Number"
                            value={formData.whatsappContact}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || !sponsorId}
                      >
                        {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
                      </button>

                      <p className={styles.signInRedirect}>
                        Already have an account?{" "}
                        <Link href="/login" className={styles.signInLink}>Sign in now!</Link>
                      </p>
                    </form>
                  )}
                </div>
              </div>

              {/* Footer moved outside cardBody but inside formGlassCard */}
              <div className={styles.loginFooter}>
                <span>© 2024 BEPVault. All rights reserved. | </span>
                <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
                <span> | </span>
                <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          {/* Corner Star */}
          <div className={styles.cornerStar}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(255,215,0,0.4)"/>
             </svg>
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
