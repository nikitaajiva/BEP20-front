"use client";
import React from 'react';
import SupportNavbar from '@/components/SupportNavbar';

// This layout was causing a hydration error.
// It is now being simplified to use the new standard navbar and a clean structure.
export default function SupportLayout({ children }) {
  return (
    <section>
        {/* The old <SupportNav> and invalid <head> tag have been removed. */}
        {/* The new SupportNavbar is now used in the nested dashboard layout, so it's not needed here. */}
        {/* This file now just provides a clean root for the /support route segment. */}
        <main>{children}</main>
    </section>
  );
} 