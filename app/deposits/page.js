'use client';
import dynamic from 'next/dynamic';

// Dynamically import the XRPDeposits component with no SSR
const XRPDeposits = dynamic(() => import('@/components/XRPDeposits'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
      Loading Deposits Page...
    </div>
  ),
});

export default function DepositsPage() {
  return <XRPDeposits />;
} 