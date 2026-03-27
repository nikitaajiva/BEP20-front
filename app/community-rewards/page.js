'use client';
import dynamic from 'next/dynamic';

// Dynamically import the CommunityRewards component with no SSR
const CommunityRewards = dynamic(() => import('@/components/CommunityRewards'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#101935', color: 'white' }}>
      Loading Community Rewards Page...
    </div>
  ),
});

export default function CommunityRewardsPage() {
  return <CommunityRewards />;
} 
