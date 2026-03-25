import React from 'react';
import SupportNavbar from '@/components/SupportNavbar';
import Link from 'next/link';

export default function SupportDashboardLayout({ children }) {
  return (
    <section>
      <SupportNavbar />
      <main>{children}</main>
    </section>
  );
} 