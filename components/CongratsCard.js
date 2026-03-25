import React from 'react';

const socialStyles = {
  youtube: { background: '#FF0000' },
  telegram: { background: '#229ED9' },
  instagram: { background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 100%)' },
  x: { background: '#657786' },
};

export default function CongratsCard({ user, airdrop }) {
  const cardBaseStyle = {
    overflow: 'hidden',
    background: '#181f3a',
    color: '#e5e7eb',
  };

  return (
    <div className="card h-100 position-relative d-flex flex-column" style={cardBaseStyle}>
      <div className="card-body p-0 d-flex flex-column h-100" style={{ zIndex: 2, background: 'transparent', padding: '0 !important' }}>
        <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1}}>
          <h5 className="card-title" style={{fontSize: '1.4rem', fontWeight: 700, whiteSpace: 'normal', lineHeight: '1.3', color: '#fff', marginBottom: '0.75rem'}}>Congrats <span className="fw-bold">{user?.username}!</span> 🎉</h5>
          <p style={{color: '#7FFF4C', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'normal', lineHeight: '1.4', marginBottom: '1rem'}}>Follow the Social accounts to finish Airdrop 🚀</p>
          <button
            className="btn btn-primary text-white d-flex align-items-center gap-2 align-self-start"
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '10px', 
              fontSize: '0.9rem',
              fontWeight: 600,
              marginTop: '0.5rem', 
              marginBottom: '1.25rem',
            }}
          >
            <i className="ri-gift-line"></i> Claim Your Airdrop
          </button>
          <div className="d-flex gap-2 mt-auto" style={{ paddingTop: '0.75rem'}}>
            {[ 
              { href: "https://www.youtube.com/@BEPVaultChannel", icon: "ri-youtube-fill", style: socialStyles.youtube, label: "YouTube" },
              { href: "https://t.me/BEPVaultOfficial", icon: "ri-telegram-fill", style: socialStyles.telegram, label: "Telegram" },
              { href: "https://www.instagram.com/BEPVault", icon: "ri-instagram-line", style: socialStyles.instagram, label: "Instagram" },
              { href: "https://x.com/BEPVault", icon: "ri-twitter-x-fill", style: socialStyles.x, label: "X" }
            ].map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="social-icon-custom"
                style={{ 
                  ...social.style, 
                  width: '34px',
                  height: '34px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  color: '#fff',
                }}
              >
                <i className={social.icon} style={{ fontSize: 17 }}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
      <img
        src="/assets/img/illustrations/trophy.png"
        className="position-absolute card-illustration-large"
        style={{ 
            bottom: 'clamp(8px, 3%, 12px)',
            right: 'clamp(8px, 3%, 12px)',
            height: 'clamp(100px, 60%, 170px)',
            width: 'auto', 
            maxWidth: '38%',
            zIndex: 1, 
            opacity: 1 
        }}
        alt="trophy"
      />
    </div>
  );
} 
