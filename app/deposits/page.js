'use client';
import dynamic from 'next/dynamic';

// Dynamically import the USDTDeposits component with no SSR
const USDTDeposits = dynamic(() => import('@/components/USDTDeposits'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
      Loading Deposits Page...
    </div>
  ),
});

export default function DepositsPage() {
  return <USDTDeposits />;
} 
