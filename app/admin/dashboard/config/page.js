"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, Save, RefreshCw, Download, Upload, Info, 
  Coins, Layout, Gift, Users, Cpu, TrendingUp, DollarSign, List, Database
} from 'lucide-react';
import styles from '@/app/admin/dashboard/support-dashboard.module.css'; // Reusing admin styles

const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;

const ConfigSection = ({ title, icon: Icon, children, collectionName }) => (
  <div className={styles.adminCard} style={{ marginBottom: '24px' }}>
    <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '8px', borderRadius: '8px' }}>
          <Icon size={20} color="#ffd700" />
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{title}</h3>
      </div>
      {collectionName && (
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
          Collection: {collectionName}
        </span>
      )}
    </div>
    <div className={styles.cardBody} style={{ padding: '20px' }}>
      {children}
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = "text", info, disabled }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase' }}>
      {label}
    </label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none'
      }}
    />
    {info && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{info}</p>}
  </div>
);

export default function AdminConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      setError("Failed to fetch configuration. Check console for details.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_BASE}/config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        alert("Configuration saved successfully!");
      }
    } catch (err) {
      alert("Failed to save configuration");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "ecosystem_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#ffd700' }}>Loading Configuration...</div>;
  if (!config) return <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#fff' }}>Global Configuration</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Manage ecosystem parameters and rewards algorithms</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} className={styles.actionBtn} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
            <Download size={16} /> Export Config
          </button>
          <button onClick={handleSave} className={styles.actionBtn} disabled={saving} style={{ background: '#ffd700', color: '#000', fontWeight: 800 }}>
            {saving ? <RefreshCw size={16} className={styles.spinner} /> : <Save size={16} />} 
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="row">
        <div className="col-12 col-xl-8">

          {/* 2. Token Staking */}
          <ConfigSection title="2. Token Staking" icon={Layout} collectionName="staking_tiers">
            <div className="row">
              {Object.keys(config.staking_tiers).map(days => (
                <div key={days} className="col-md-6" style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffd700', marginBottom: '15px' }}>{days} DAYS LOCK-UP</h4>
                  <div className="row">
                    <div className="col-6">
                      <InputField 
                        label="Min APY %" 
                        value={config.staking_tiers[days].min_apy} 
                        onChange={(val) => {
                          const newTiers = {...config.staking_tiers};
                          newTiers[days].min_apy = val;
                          setConfig({...config, staking_tiers: newTiers});
                        }}
                        type="number"
                      />
                    </div>
                    <div className="col-6">
                      <InputField 
                        label="Max APY %" 
                        value={config.staking_tiers[days].max_apy} 
                        onChange={(val) => {
                          const newTiers = {...config.staking_tiers};
                          newTiers[days].max_apy = val;
                          setConfig({...config, staking_tiers: newTiers});
                        }}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ConfigSection>

          {/* 3. Horse NFT Packages */}
          <ConfigSection title="3. Horse NFT Packages" icon={Gift} collectionName="nft_packages">
            {['bronze', 'silver', 'gold'].map(tier => (
              <div key={tier} style={{ marginBottom: '25px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 900, color: tier === 'gold' ? '#ffd700' : tier === 'silver' ? '#fff' : '#cd7f32', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {tier} (Starter)
                </h4>
                <div className="row">
                  <div className="col-md-3">
                    <InputField 
                      label="Price (USDT)" 
                      value={config.nft_packages[tier].price} 
                      onChange={(val) => {
                        const newNft = {...config.nft_packages};
                        newNft[tier].price = val;
                        setConfig({...config, nft_packages: newNft});
                      }}
                      type="number"
                    />
                  </div>
                  <div className="col-md-3">
                    <InputField 
                      label="Bonus Tokens" 
                      value={config.nft_packages[tier].bonus_tokens} 
                      onChange={(val) => {
                        const newNft = {...config.nft_packages};
                        newNft[tier].bonus_tokens = val;
                        setConfig({...config, nft_packages: newNft});
                      }}
                      type="number"
                    />
                  </div>
                  <div className="col-md-3">
                    <InputField 
                      label="Max Annual ROI %" 
                      value={config.nft_packages[tier].max_roi_pct} 
                      onChange={(val) => {
                        const newNft = {...config.nft_packages};
                        newNft[tier].max_roi_pct = val;
                        setConfig({...config, nft_packages: newNft});
                      }}
                      type="number"
                    />
                  </div>
                  <div className="col-md-3">
                    <InputField 
                      label="Dividend Freq" 
                      value={config.nft_packages[tier].dividend_freq} 
                      onChange={(val) => {
                        const newNft = {...config.nft_packages};
                        newNft[tier].dividend_freq = val;
                        setConfig({...config, nft_packages: newNft});
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </ConfigSection>

          {/* 5. NFT Mint Tiers */}
          <ConfigSection title="5. NFT Mint Tiers (N1-N5)" icon={Cpu} collectionName="nft_mint_tiers">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Tier</th>
                    <th style={{ padding: '10px' }}>Price (U)</th>
                    <th style={{ padding: '10px' }}>Power</th>
                    <th style={{ padding: '10px' }}>Coeff.</th>
                    <th style={{ padding: '10px' }}>Mult.</th>
                    <th style={{ padding: '10px' }}>Post-TSC</th>
                  </tr>
                </thead>
                <tbody>
                  {config.nft_mint_tiers.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{t.tier}</td>
                      <td style={{ padding: '10px' }}>
                        <input type="number" value={t.price} onChange={(e) => {
                          const newTiers = [...config.nft_mint_tiers];
                          newTiers[idx].price = parseFloat(e.target.value);
                          setConfig({...config, nft_mint_tiers: newTiers});
                        }} style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                      <td style={{ padding: '10px' }}>{t.power}</td>
                      <td style={{ padding: '10px' }}>
                         <input type="number" step="0.1" value={t.coeff} onChange={(e) => {
                          const newTiers = [...config.nft_mint_tiers];
                          newTiers[idx].coeff = parseFloat(e.target.value);
                          setConfig({...config, nft_mint_tiers: newTiers});
                        }} style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                      <td style={{ padding: '10px' }}>{t.mult}</td>
                      <td style={{ padding: '10px' }}>
                         <input type="number" step="0.1" value={t.post} onChange={(e) => {
                          const newTiers = [...config.nft_mint_tiers];
                          newTiers[idx].post = parseFloat(e.target.value);
                          setConfig({...config, nft_mint_tiers: newTiers});
                        }} style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ConfigSection>

          {/* 9. Node Rewards */}
          <ConfigSection title="9. Node Rewards (P1-P9)" icon={Database} collectionName="node_tiers">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Node</th>
                    <th style={{ padding: '8px' }}>Upg. (10K U)</th>
                    <th style={{ padding: '8px' }}>Total (10K U)</th>
                    <th style={{ padding: '8px' }}>Mining %</th>
                    <th style={{ padding: '8px' }}>Airdrop %</th>
                  </tr>
                </thead>
                <tbody>
                  {config.node_tiers.map((n, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 800 }}>{n.node}</td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" value={n.upg} onChange={(e) => {
                          const newTiers = [...config.node_tiers];
                          newTiers[idx].upg = parseFloat(e.target.value);
                          setConfig({...config, node_tiers: newTiers});
                        }} style={{ width: '50px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                      <td style={{ padding: '8px' }}>{n.total}</td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" value={n.mining} onChange={(e) => {
                          const newTiers = [...config.node_tiers];
                          newTiers[idx].mining = parseFloat(e.target.value);
                          setConfig({...config, node_tiers: newTiers});
                        }} style={{ width: '50px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" step="0.1" value={n.airdrop} onChange={(e) => {
                          const newTiers = [...config.node_tiers];
                          newTiers[idx].airdrop = parseFloat(e.target.value);
                          setConfig({...config, node_tiers: newTiers});
                        }} style={{ width: '50px', background: 'transparent', border: 'none', color: '#fff' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ConfigSection>
        </div>

        <div className="col-12 col-xl-4">
          {/* 4. Referral Config */}
          <ConfigSection title="4. Referral Commissions" icon={Users} collectionName="referral_config">
            <div className="row">
              <div className="col-6">
                <InputField 
                  label="Levels Depth" 
                  value={config.referral_config.levels} 
                  onChange={(val) => setConfig({...config, referral_config: {...config.referral_config, levels: val}})}
                  type="number"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.keys(config.referral_config.rates).map(lvl => (
                <InputField 
                  key={lvl}
                  label={`${lvl} Rate %`}
                  value={config.referral_config.rates[lvl]}
                  onChange={(val) => {
                    const newRates = {...config.referral_config.rates};
                    newRates[lvl] = val;
                    setConfig({...config, referral_config: {...config.referral_config, rates: newRates}});
                  }}
                  type="number"
                />
              ))}
            </div>
          </ConfigSection>

          {/* 6. Mining Config */}
          <ConfigSection title="6. TSC Mining Algorithm" icon={Cpu} collectionName="mining_config">
             <InputField 
              label="Daily Output Min %" 
              value={config.mining_config.daily_output_min_pct} 
              onChange={(val) => setConfig({...config, mining_config: {...config.mining_config, daily_output_min_pct: val}})}
              type="number"
            />
            <InputField 
              label="Daily Output Max %" 
              value={config.mining_config.daily_output_max_pct} 
              onChange={(val) => setConfig({...config, mining_config: {...config.mining_config, daily_output_max_pct: val}})}
              type="number"
            />
            <InputField 
              label="Withdrawal Fee %" 
              value={config.mining_config.withdrawal_fee_pct} 
              onChange={(val) => setConfig({...config, mining_config: {...config.mining_config, withdrawal_fee_pct: val}})}
              type="number"
            />
          </ConfigSection>

          {/* 7. TSC Pricing */}
          <ConfigSection title="7. TSC Pricing & Emission" icon={TrendingUp} collectionName="tsc_pricing">
            <InputField 
              label="Initial Price (USDT)" 
              value={config.tsc_pricing.initial_price} 
              onChange={(val) => setConfig({...config, tsc_pricing: {...config.tsc_pricing, initial_price: val}})}
              type="number"
            />
            <InputField 
              label="Daily Increase Min %" 
              value={config.tsc_pricing.daily_increase_min_pct} 
              onChange={(val) => setConfig({...config, tsc_pricing: {...config.tsc_pricing, daily_increase_min_pct: val}})}
              type="number"
            />
            <InputField 
              label="Monthly Emission %" 
              value={config.tsc_pricing.monthly_emission_pct} 
              onChange={(val) => setConfig({...config, tsc_pricing: {...config.tsc_pricing, monthly_emission_pct: val}})}
              type="number"
            />
          </ConfigSection>

          {/* 8. Withdrawal Config */}
          <ConfigSection title="8. Withdrawal Rules" icon={DollarSign} collectionName="withdrawal_config">
            <div className="row">
              <div className="col-6">
                <InputField 
                  label="Instant Release %" 
                  value={config.withdrawal_config.instant_pct} 
                  onChange={(val) => setConfig({...config, withdrawal_config: {...config.withdrawal_config, instant_pct: val}})}
                  type="number"
                />
              </div>
              <div className="col-6">
                <InputField 
                  label="Vested Release %" 
                  value={config.withdrawal_config.vest_pct} 
                  onChange={(val) => setConfig({...config, withdrawal_config: {...config.withdrawal_config, vest_pct: val}})}
                  type="number"
                />
              </div>
            </div>
            <InputField 
              label="Vest Period (Days)" 
              value={config.withdrawal_config.vest_days} 
              onChange={(val) => setConfig({...config, withdrawal_config: {...config.withdrawal_config, vest_days: val}})}
              type="number"
            />
          </ConfigSection>
        </div>
      </div>

      <footer style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
         <button onClick={handleSave} className={styles.actionBtn} disabled={saving} style={{ background: '#ffd700', color: '#000', fontWeight: 800, padding: '15px 40px', fontSize: '16px' }}>
            {saving ? <RefreshCw size={20} className={styles.spinner} /> : <Save size={20} />} 
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
      </footer>
    </div>
  );
}
