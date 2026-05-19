"use client";
import React from "react";
import styles from "./PremiumWalletCards.module.css";
import { Eye, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export const ReferralLevelsCard = () => {
  const dummyLevels = [
    { id: 1, name: "Level 1", members: 12, amount: 450 },
    { id: 2, name: "Level 2", members: 25, amount: 980 },
    { id: 3, name: "Level 3", members: 48, amount: 1650 },
  ];

  return (
    <div className={styles.rwCardWrapper} style={{ border: '1px solid rgba(255, 184, 0, 0.25)' }}>
      <div className={styles.rwHeader} style={{ borderColor: 'rgba(255, 184, 0, 0.25)', padding: '16px' }}>
        <span className={styles.rwTitle} style={{ color: '#FFB800' }}>Referral Levels</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>
          <Users size={12} color="#FFB800" />
          <span>{dummyLevels.reduce((acc, curr) => acc + curr.members, 0)} TOTAL MEMBERS</span>
        </div>
      </div>

      <div className={styles.rwBody} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {dummyLevels.map((level) => (
          <div
            key={level.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 184, 0, 0.05)';
              e.currentTarget.style.border = '1px solid rgba(255, 184, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>{level.name}</h4>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Members: <span style={{ color: '#fff', fontWeight: 600 }}>{level.members}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Amount</span>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#00ff00' }}>
                  ${level.amount.toLocaleString()}
                </div>
              </div>

              <Link
                href={`/dashboard/referral-levels?level=${level.id}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFB800',
                  textDecoration: 'none',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                title="View Level Details"
              >
                <Eye size={14} />
              </Link>
            </div>
          </div>
        ))}

        <Link
          href="/dashboard/referral-levels"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px',
            background: 'rgba(255, 184, 0, 0.1)',
            border: '1px solid rgba(255, 184, 0, 0.25)',
            borderRadius: '12px',
            color: '#FFB800',
            fontWeight: 800,
            fontSize: '11px',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            marginTop: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 184, 0, 0.1)'}
        >
          <span>VIEW FULL TREE</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
