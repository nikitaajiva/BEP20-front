'use client';
import dynamic from 'next/dynamic';

// Dynamically import the USDTWithdrawals component with no SSR
const USDTWithdrawals = dynamic(() => import('@/components/USDTWithdrawals'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
      Loading Withdrawals Page...
    </div>
  ),
});

export default function WithdrawalsPage() {
  return <USDTWithdrawals />;
} 
