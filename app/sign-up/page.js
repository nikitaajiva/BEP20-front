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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="mainContainer"
        >
          {/* Top Branding Section */}
          <div className="brandHeader">
            <div className="logoCircle">
              <Image src="/img/main-logo.avif" alt="Toking Hoofborn Logo" width={60} height={60} className="object-contain" />
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
                    src="/img/signup-visual-premium.png"
                    alt="Majestic Cyber Stallion"
                    fill
                    className="visualImage"
                    priority
                  />
                  <div className="imageOverlay" />
                  <div className="imageTag">
                    <span className="tagDot" />
                    ELITE RECRUITMENT
                  </div>
                </div>
              </div>

              {/* Right Side: Sign Up Form */}
              <div className="formSide">
                <div className="formHeader">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="formTitle"
                  >
                    Join the Elite
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="formSubtitle"
                  >
                    Establish your legacy in the next generation of racing
                  </motion.p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="errorMessage"
                  >
                    <i className="ri-error-warning-fill" /> {error}
                  </motion.div>
                )}

                {message ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="successMessage"
                  >
                    <i className="ri-checkbox-circle-fill" style={{ fontSize: '64px', color: '#FFB800' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Legion Established</h3>
                    <p style={{ opacity: 0.8 }}>{message}</p>
                    <Link href="/login" className="signInButton" style={{ textDecoration: 'none', width: '100%' }}>
                      PROCEED TO COMMAND CENTER
                    </Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="authForm">
                    {[
                      {
                        label: "IDENTITY EMAIL",
                        icon: "ri-mail-fill",
                        name: "email",
                        type: "email",
                        placeholder: "your@legacy.com",
                        value: formData.email,
                        onChange: handleChange,
                        required: true
                      },
                      {
                        label: "COMMANDER SPONSOR",
                        icon: "ri-shield-user-fill",
                        name: "sponsorId",
                        type: "text",
                        placeholder: "No sponsor detected",
                        value: sponsorId || "",
                        disabled: true,
                        style: { opacity: 0.6 }
                      }
                    ].map((field, idx) => (
                      <motion.div 
                        key={field.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className="fieldGroup"
                      >
                        <label>{field.label}</label>
                        <div className="inputWrapper">
                          <i className={field.icon} />
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={field.disabled}
                            required={field.required}
                            style={field.style}
                          />
                        </div>
                      </motion.div>
                    ))}

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="fieldGroup" 
                      ref={dropdownRef}
                    >
                      <label>TERRITORY ORIGIN</label>
                      <div className="countryInputWrapper">
                        <div className="inputWrapper" style={{ width: '100%' }}>
                          <i className="ri-global-fill" />
                          <input
                            type="text"
                            placeholder="Select Territory"
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
                              <div className="countryDropdownNoResults">No territories found</div>
                            )}
                          </ul>
                        )}
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="fieldGroup"
                    >
                      <label>WHATSAPP SECURE CONTACT</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="inputWrapper countryCodeBox" style={{ height: '54px' }}>
                          {formData.countryCode || "--"}
                        </div>
                        <div className="inputWrapper" style={{ flex: 1 }}>
                          <i className="ri-whatsapp-fill" />
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
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      type="submit"
                      className="signInButton"
                      disabled={loading || !sponsorId}
                    >
                      {loading ? (
                        <div className="loader" />
                      ) : (
                        <>
                          ESTABLISH ACCOUNT
                          <i className="ri-arrow-right-up-line" />
                        </>
                      )}
                    </motion.button>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="signInRedirect"
                    >
                      Already a commander?{" "}
                      <Link href="/login" className="signInLink">Sign in here!</Link>
                    </motion.p>
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
