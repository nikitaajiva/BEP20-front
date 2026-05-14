"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import "@/components/landing/landingpage.css";
import { useAuth } from "@/context/AuthContext";
import { COUNTRIES_DATA } from "@/utils/countries";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

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
  
  // Animation particles
  const [particles, setParticles] = useState([]);

  const filteredCountries = COUNTRIES_DATA.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    setParticles(Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`
    })));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (formData.selectedCountry && countrySearch === `${formData.selectedCountry.flag} ${formData.selectedCountry.name}`) {
      setCountrySearch("");
    }
  };

  const handleCountryInputChange = (e) => {
    setCountrySearch(e.target.value);
    if (!isDropdownOpen) setIsDropdownOpen(true);
    if (e.target.value === "") {
      setFormData((prev) => ({ ...prev, selectedCountry: null, countryCode: "" }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (!formData.email || !formData.selectedCountry) {
      setError("Please fill in all required fields including email and country.");
      return;
    }
    
    const emailParts = formData.email.split("@");
    if (!formData.email.includes("@") || emailParts.length < 2 || !emailParts[0] || !emailParts[1].includes(".")) {
      setError("Error! Please enter a valid email.");
      return;
    }

    const payload = {
      email: formData.email,
      username: emailParts[0],
      country: formData.selectedCountry.code,
      countryCode: formData.countryCode,
      whatsappContact: formData.whatsappContact,
      sponsorId: sponsorId,
    };

    const result = await signup(payload);
    if (result && result.success) setMessage(result.message);
  };

  useEffect(() => {
    if (formData.selectedCountry) {
      setCountrySearch(`${formData.selectedCountry.flag} ${formData.selectedCountry.name}`);
    } else {
      setCountrySearch("");
    }
  }, [formData.selectedCountry]);

  useEffect(() => {
    async function fetchUserCountry() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const found = COUNTRIES_DATA.find((c) => c.code.toUpperCase() === data.country.toUpperCase());
        if (found) {
          setFormData((prev) => ({ ...prev, selectedCountry: found, countryCode: found.dial_code }));
        }
      } catch (err) { console.error("Failed to fetch IP country:", err); }
    }
    fetchUserCountry();
  }, []);

  return (
    <>
      <Head>
        <title>Sign Up - TokingHoofborn</title>
        <meta name="description" content="Create your TokingHoofborn account" />
      </Head>

      <div className="signInPage">
        {/* Cinematic Background Layer */}
        <div className="backgroundCanvas">
          <div className="fireGlowTop" />
          <div className="fireGlowBottom" />
          {particles.map((p) => (
            <div
              key={p.id}
              className="fireSpark"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mainContainer"
        >
          {/* Top Branding Section */}
          <div className="brandHeader">
            <div className="logoCircle">
              <Image src="/img/toking_hoofborn_logo.png" alt="Toking Hoofborn Logo" width={220} height={55} className="object-contain" />
              <div className="logoGlowPulse" />
            </div>
            <h1 className="brandTitle">
              Toking<span className="goldText">Hoofborn</span>
            </h1>
          </div>

          {/* Main Auth Card */}
          <div className="authCard">
            <div className="cardContent">
              
              {/* Left Side: Cinematic Visual */}
              <div className="visualSide">
                <div className="imageFrame">
                  <Image
                    src="/IMG/signup-visual.png"
                    alt="Majestic White Stallion"
                    fill
                    className="visualImage"
                    priority
                  />
                  <div className="imageOverlay" />
                  <div className="imageTag">
                    <span className="tagDot" />
                    NEW RECRUIT
                  </div>
                </div>
              </div>

              {/* Right Side: Sign Up Form */}
              <div className="formSide">
                <div className="formHeader">
                  <h2 className="formTitle">Join the Elite</h2>
                  <p className="formSubtitle">Secure access to your administrative command center</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="errorMessage">
                    <i className="ri-error-warning-fill" /> {error}
                  </motion.div>
                )}

                {message ? (
                  <div className="successMessage">
                    <i className="ri-checkbox-circle-fill" style={{ fontSize: '48px' }} />
                    <h3>Welcome Aboard!</h3>
                    <p>{message}</p>
                    <Link href="/login" className="signInButton" style={{ textDecoration: 'none' }}>
                      PROCEED TO LOGIN
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="authForm">
                    <div className="fieldGroup">
                      <label>EMAIL ADDRESS</label>
                      <div className="inputWrapper">
                        <i className="ri-mail-line" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter Your Email Address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="fieldGroup">
                      <label>REFERRED BY</label>
                      <div className="inputWrapper">
                        <i className="ri-user-follow-line" />
                        <input
                          type="text"
                          value={sponsorId || ""}
                          placeholder="No referral code detected"
                          disabled
                          style={{ opacity: 0.6 }}
                        />
                      </div>
                    </div>

                    <div className="fieldGroup" ref={dropdownRef}>
                      <label>SELECT COUNTRY</label>
                      <div className="countryInputWrapper">
                        <div className="inputWrapper" style={{ width: '100%' }}>
                          <i className="ri-earth-line" />
                          <input
                            type="text"
                            placeholder="Select Country"
                            value={countrySearch}
                            onChange={handleCountryInputChange}
                            onFocus={handleCountryInputFocus}
                            autoComplete="off"
                          />
                          <i className={`ri-arrow-down-s-line dropdownChevron ${isDropdownOpen ? "dropdownChevronOpen" : ""}`}></i>
                        </div>
                        {isDropdownOpen && (
                          <ul className="countryDropdownList">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <li key={country.code} onClick={() => handleCountrySelect(country)} className="countryDropdownItem">
                                  <span>{country.flag} {country.name}</span>
                                  <span className="countryDialCode">{country.dial_code}</span>
                                </li>
                              ))
                            ) : (
                              <div className="countryDropdownNoResults">No countries found</div>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="fieldGroup">
                      <label>WHATSAPP CONTACT</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="inputWrapper countryCodeBox">
                          {formData.countryCode || "--"}
                        </div>
                        <div className="inputWrapper" style={{ flex: 1 }}>
                          <i className="ri-whatsapp-line" />
                          <input
                            type="tel"
                            name="whatsappContact"
                            placeholder="WhatsApp Number"
                            value={formData.whatsappContact}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '44px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="signInButton"
                      disabled={loading || !sponsorId}
                    >
                      {loading ? (
                        <div className="loader" />
                      ) : (
                        <>
                          SIGN UP NOW
                          <i className="ri-arrow-right-line" />
                        </>
                      )}
                    </button>

                    <p className="signInRedirect">
                      Already have an account?{" "}
                      <Link href="/login" className="signInLink">Sign in now!</Link>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Legal Links */}
          <div className="legalLinks">
            <p>© 2026 TokingHoofborn. All Rights Reserved.</p>
            <div className="legalGap" />
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="signInPage"><div className="loader" /></div>}>
      <SignUpForm />
    </Suspense>
  );
}
