"use client";
import React from "react";
import CommunityReward from "@/components/CommunityReward";

export default function CommunityRewardsPage() {
  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px' }}>
      <div className="row">
        <div className="col-12 mb-4 text-center">
           <div style={{ 
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%)',
              padding: '40px 20px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              marginBottom: '40px',
              backdropFilter: 'blur(20px)'
           }}>
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '3rem', marginBottom: '15px', letterSpacing: '2px' }}>
                  REWARDS <span style={{ color: '#ffd700' }}>JOURNEY</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                  Explore your community rewards architecture. Unlock higher tiers of passive income by expanding your network and optimizing liquidity.
              </p>
           </div>
        </div>
        
        <div className="col-12" style={{ paddingBottom: '100px' }}>
          <CommunityReward />
        </div>
      </div>
    </div>
  );
}
