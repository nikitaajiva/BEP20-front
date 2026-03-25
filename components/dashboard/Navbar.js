"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest(`.${styles.hamburger}`)){
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownRef, mobileMenuRef]);

  const userAvatarUrl = user?.avatarUrl || '/assets/img/avatars/default.png';
  const userName = user?.username || user?.email || 'User';

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLeft}>
          <button className={styles.hamburger} onClick={toggleMobileMenu} aria-label="Toggle menu">
            <i className="ri-menu-line"></i>
          </button>
          <Link href="/dashboard" className={styles.logoContainer}>
            <Image src="/assets/img/logo-white.png" alt="BEPVault Logo" width={150} height={35} className={styles.logo} />
          </Link>
        </div>

        <div className={`${styles.navLinksDesktop} ${isMobileMenuOpen ? styles.showMobileLinks : ''}`} ref={mobileMenuRef}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/dashboard/wallets" className={styles.navLink}>My Wallets</Link>
          <Link href="/dashboard/support" className={styles.navLink}>Support</Link>
        </div>

        <div className={styles.navRight}>
          <div className={styles.userMenuContainer} ref={userDropdownRef}>
            <button className={styles.userButton} onClick={toggleUserDropdown} aria-label="User menu">
              <Image src={userAvatarUrl} alt="User Avatar" width={40} height={40} className={styles.avatar} />
            </button>
            {isUserDropdownOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownHeader}>
                  <Image src={userAvatarUrl} alt="User Avatar" width={36} height={36} className={styles.dropdownAvatar} />
                  <div className={styles.dropdownUserInfo}>
                    <span className={styles.dropdownUserName}>{userName}</span>
                    {user?.email && <span className={styles.dropdownUserRole}>{user.email}</span>} 
                  </div>
                </div>
                
               
                <button onClick={onLogout} className={styles.dropdownButtonLink}>
                  <i className="ri-logout-box-r-line"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuLinks} ref={mobileMenuRef} >
          <Link href="/dashboard" className={styles.navLinkMobile} onClick={toggleMobileMenu}>Dashboard</Link>
          <Link href="/dashboard/wallets" className={styles.navLinkMobile} onClick={toggleMobileMenu}>My Wallets</Link>
          <Link href="/dashboard/support" className={styles.navLinkMobile} onClick={toggleMobileMenu}>Support</Link>
        </div>
      )}
    </nav>
  );
} 
