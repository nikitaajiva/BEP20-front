'use client';
import React from 'react';
import LevelRewardsTable from '@/components/LevelRewardsTable';

export default function LevelRewardsPage() {
  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <LevelRewardsTable />
        </div>
      </div>
    </div>
  );
} 
