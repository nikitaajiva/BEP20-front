"use client";
import React from 'react';
import AdminNavbar from '@/components/AdminNavbar';

// This layout was causing a hydration error.
// It is now being simplified to use the new standard navbar and a clean structure.
export default function AdminLayout({ children }) {
  return (
    <section>
        {/* The old <SupportNav> and invalid <head> tag have been removed. */}
        {/* The new AdminNavbar is now used in the nested dashboard layout, so it's not needed here. */}
        {/* This file now just provides a clean root for the /admin route segment. */}
        <main>{children}</main>
    </section>
  );
} 
