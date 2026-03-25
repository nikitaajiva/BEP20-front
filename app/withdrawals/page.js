'use client';
import dynamic from 'next/dynamic';

// Dynamically import the XRPWithdrawals component with no SSR
const XRPWithdrawals = dynamic(() => import('@/components/XRPWithdrawals'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
      Loading Withdrawals Page...
    </div>
  ),
});

export default function WithdrawalsPage() {
  return <XRPWithdrawals />;
} 