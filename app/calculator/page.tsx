'use client';

import React, { useState } from 'react';
import styles from './calculator.module.css';

// Helper functions, adapted from the original script
const formatCurrency = (value: number) => {
  return value.toFixed(2) + " USDT";
};

const formatDateString = (dateObj: Date) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
  return dateObj.toLocaleDateString('en-US', options);
};

const getGroupKey = (date: Date, groupBy: string) => {
  switch(groupBy) {
    case 'weekly':
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${date.getFullYear()}-W${weekNumber}`;
    case 'monthly':
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    case 'yearly':
      return `${date.getFullYear()}`;
    default:
      return formatDateString(date);
  }
};

interface BreakdownRow {
  date: Date;
  balance: number;
}

interface Breakdown {
  [key: string]: BreakdownRow;
}

interface Results {
    finalBalance: number;
    profitPercent: number;
    totalEarnings: number;
    totalDays: number;
    businessDays: number;
    endDate: Date;
    breakdown: Breakdown;
    principal: number;
}

export default function CalculatorPage() {
  const [principal, setPrincipal] = useState('5000');
  const [rate, setRate] = useState('0.4');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [days, setDays] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reinvestRate, setReinvestRate] = useState('1');
  const [includeAllDays, setIncludeAllDays] = useState('yes');
  const [selectedDays, setSelectedDays] = useState({
    '1': true, '2': true, '3': true, '4': true, '5': true, '6': false, '0': false
  });
  const [contributionType, setContributionType] = useState('none');
  const [depositAmount, setDepositAmount] = useState('0');
  const [depositFrequency, setDepositFrequency] = useState('daily');
  const [oneTimeDeposit, setOneTimeDeposit] = useState('0');
  const [oneTimeDepositDate, setOneTimeDepositDate] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('0');
  const [withdrawalFrequency, setWithdrawalFrequency] = useState('weekly');
  const [groupBy, setGroupBy] = useState('daily');

  const [results, setResults] = useState<Results | null>(null);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => ({...prev, [day]: !prev[day as keyof typeof selectedDays]}));
  };

  const calculate = () => {
    const principalUSDT = parseFloat(principal);
    const interestRate = parseFloat(rate);
    const y = parseInt(years || '0');
    const m = parseInt(months || '0');
    const d = parseInt(days || '0');
    const reinvest = parseFloat(reinvestRate);

    const startDt = startDate ? new Date(startDate) : new Date();
    const endDt = new Date(startDt);
    endDt.setFullYear(endDt.getFullYear() + y);
    endDt.setMonth(endDt.getMonth() + m);
    endDt.setDate(endDt.getDate() + d);

    let balance = principalUSDT;
    let totalEarnings = 0;
    let dailyRate = interestRate / 100;
    let currentDate = new Date(startDt);
    let breakdown: Breakdown = {};

    let daysToCount = Object.keys(selectedDays).filter(k => selectedDays[k as keyof typeof selectedDays]).map(Number);

    while (currentDate <= endDt) {
      const day = currentDate.getDay();
      if (includeAllDays === "yes" || daysToCount.includes(day)) {
        let recurringDeposit = 0;
        let oneTimeDepositVal = 0;

        if (contributionType === "deposit") {
          const depositAmt = parseFloat(depositAmount || '0');
          const oneTimeDateVal = oneTimeDepositDate;
          const oneTimeAmount = parseFloat(oneTimeDeposit || '0');

          if (oneTimeDateVal && new Date(oneTimeDateVal).toDateString() === currentDate.toDateString()) {
            oneTimeDepositVal = oneTimeAmount;
          }

          if ((depositFrequency === "daily") ||
              (depositFrequency === "weekly" && currentDate.getDay() === 1) ||
              (depositFrequency === "biweekly" && Math.floor((currentDate.getTime() - startDt.getTime()) / (1000*60*60*24)) % 14 === 0) ||
              (depositFrequency === "monthly" && currentDate.getDate() === startDt.getDate())) {
            recurringDeposit = depositAmt;
          }
        }
        
        balance += recurringDeposit + oneTimeDepositVal;

        const earnings = balance * dailyRate;
        const reinvestAmt = earnings * reinvest;
        const payout = earnings - reinvestAmt;

        balance += reinvestAmt;
        totalEarnings += payout;

        const groupKey = getGroupKey(currentDate, groupBy);
        if (!breakdown[groupKey]) {
          breakdown[groupKey] = { date: new Date(currentDate), balance: 0 };
        }
        breakdown[groupKey].balance = balance;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const totalDays = Math.ceil((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const profitPercent = principalUSDT > 0 ? ((balance - principalUSDT) / principalUSDT) * 100 : 0;

    setResults({
        finalBalance: balance,
        profitPercent,
        totalEarnings: balance - principalUSDT,
        totalDays,
        businessDays: Object.keys(breakdown).length,
        endDate: endDt,
        breakdown,
        principal: principalUSDT
    });
  };

  const projectionTitle = `${years ? years + ' years ' : ''}${months ? months + ' months ' : ''}${days ? days + ' days' : ''}`.trim();

  let tableRows: {date: Date, earnings: number, totalEarnings: number, balance: number}[] = [];
  if (results) {
      let totalBalance = 0;
      let totalEarningsDisplayed = 0;
      let printedKeys = new Set();
      
      for (let key in results.breakdown) {
          if (!printedKeys.has(key)) {
              const row = results.breakdown[key];
              const earnings = totalBalance === 0 ? row.balance - results.principal : row.balance - totalBalance;
              totalEarningsDisplayed += earnings;
              tableRows.push({
                  date: row.date,
                  earnings: earnings,
                  totalEarnings: totalEarningsDisplayed,
                  balance: row.balance
              });
              totalBalance = row.balance;
              printedKeys.add(key);
          }
      }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.headerTop}>
          <img src="/bepvault_logo.png" alt="BEPVault Logo" />
          <a href="https://BEPVault.io/login" target="_blank" rel="noopener noreferrer">Dashboard</a>
        </div>

        <h1 className={styles.title}>USDT Compound Interest Calculator</h1>

        <label htmlFor="principal">USDT Deposit</label>
        <input type="number" id="principal" value={principal} onChange={e => setPrincipal(e.target.value)} min="0" />

        <label htmlFor="rate">Daily LP Rewards (%)</label>
        <input type="number" id="rate" value={rate} onChange={e => setRate(e.target.value)} step="0.01" min="0" />

        <label>Initial Deposit Duration</label>
        <div style={{display: 'flex', gap: '10px'}}>
            <input type="number" id="years" placeholder="Years" value={years} onChange={e => setYears(e.target.value)} min="0" style={{flex:1}} />
            <input type="number" id="months" placeholder="Months" value={months} onChange={e => setMonths(e.target.value)} min="0" style={{flex:1}} />
            <input type="number" id="days" placeholder="Days" value={days} onChange={e => setDays(e.target.value)} min="0" style={{flex:1}} />
        </div>
        
        <label htmlFor="start">Start Date</label>
        <input type="date" id="start" value={startDate} onChange={e => setStartDate(e.target.value)} />
        
        <label htmlFor="reinvest">Daily Reinvest Rate</label>
        <select id="reinvest" value={reinvestRate} onChange={e => setReinvestRate(e.target.value)}>
          <option value="0">0%</option>
          <option value="0.05">5%</option>
          <option value="0.1">10%</option>
          <option value="0.15">15%</option>
          <option value="0.25">25%</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
        </select>
        
        <label>Include all days of week?</label>
        <select id="allDays" value={includeAllDays} onChange={e => setIncludeAllDays(e.target.value)}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        {includeAllDays === 'no' && (
          <div id="weekdays">
            <label><input type="checkbox" value="1" checked={selectedDays['1']} onChange={() => handleDayToggle('1')} /> Monday</label>
            <label><input type="checkbox" value="2" checked={selectedDays['2']} onChange={() => handleDayToggle('2')} /> Tuesday</label>
            <label><input type="checkbox" value="3" checked={selectedDays['3']} onChange={() => handleDayToggle('3')} /> Wednesday</label>
            <label><input type="checkbox" value="4" checked={selectedDays['4']} onChange={() => handleDayToggle('4')} /> Thursday</label>
            <label><input type="checkbox" value="5" checked={selectedDays['5']} onChange={() => handleDayToggle('5')} /> Friday</label>
            <label><input type="checkbox" value="6" checked={selectedDays['6']} onChange={() => handleDayToggle('6')} /> Saturday</label>
            <label><input type="checkbox" value="0" checked={selectedDays['0']} onChange={() => handleDayToggle('0')} /> Sunday</label>
          </div>
        )}
        
        <label htmlFor="contributionType">Additional Contributions</label>
        <select id="contributionType" value={contributionType} onChange={e => setContributionType(e.target.value)}>
          <option value="none">None</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        
        {contributionType === 'deposit' && (
          <div id="depositFields">
            <label>Recurring Deposit Amount</label>
            <input type="number" id="depositAmount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} min="0" />
            <select id="depositFrequency" value={depositFrequency} onChange={e => setDepositFrequency(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <label>One-Time Additional Deposit</label>
            <input type="number" id="oneTimeDeposit" value={oneTimeDeposit} onChange={e => setOneTimeDeposit(e.target.value)} min="0" />
            <input type="date" id="oneTimeDepositDate" value={oneTimeDepositDate} onChange={e => setOneTimeDepositDate(e.target.value)} />
          </div>
        )}

        {contributionType === 'withdrawal' && (
            <div id="withdrawalFields">
                <label>Recurring Claim Amount</label>
                <input type="number" id="withdrawalAmount" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} min="0" />
                <select id="withdrawalFrequency" value={withdrawalFrequency} onChange={e => setWithdrawalFrequency(e.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
        )}

        <label htmlFor="groupBy">Earnings Breakdown</label>
        <select id="groupBy" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button onClick={calculate}>Calculate</button>
      </div>
      <div className={styles.main}>
        {results && (
            <>
                <h2 style={{ fontSize: '22px', color: '#ffffff', marginBottom: '10px', textAlign: 'left', animation: 'fadeIn 1s ease-in-out' }}>
                    Projection for {projectionTitle}
                </h2>
                <div className={styles.resultsGrid}>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '14px', fontWeight: 500, borderBottom: '1px solid white', padding: '10px 0', color: '#ffa726' }}>
                        💰 <span style={{ color: '#ffa726' }}>Initial Deposit Value</span><br /><span style={{ fontSize: '26px', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>{formatCurrency(results.finalBalance)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '14px', fontWeight: 500, borderBottom: '1px solid white', padding: '10px 0' }}>
                        📊 LP Reward Profit<br /><span style={{ fontSize: '26px', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>{results.profitPercent.toFixed(2)}%</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '14px', fontWeight: 500, borderBottom: '1px solid white', padding: '10px 0', color: '#00e676' }}>
                        📈 Total Earnings<br /><span style={{ fontSize: '26px', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>{formatCurrency(results.totalEarnings)}</span>
                    </div>
                </div>
                <div className={styles.resultsGrid}>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '13px', fontWeight: 500, color: '#ffffff', animation: 'fadeIn 1s ease-out', borderBottom: '1px solid white', padding: '8px 0' }}>
                        📆 Total Days / Business Days<br /><span style={{ fontSize: '24px', fontWeight: 'bold' }}>{results.totalDays} / {results.businessDays}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '13px', fontWeight: 500, color: '#448aff', animation: 'fadeIn 1.1s ease-out', borderBottom: '1px solid white', padding: '8px 0' }}>
                        🗓️ End Date<br /><span style={{ fontSize: '24px', fontWeight: 'bold' }}>{results.endDate.toDateString()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', fontSize: '13px', fontWeight: 500, color: '#ffffff', animation: 'fadeIn 1.3s ease-out', borderBottom: '1px solid white', padding: '8px 0' }}>
                        🏦 Initial Balance<br /><span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(results.principal)}</span>
                    </div>
                </div>

                <div style={{ border: '2px solid #2f2f2f', borderRadius: '10px', padding: '10px', marginTop: '20px', overflowX: 'auto' }}>
                    <table style={{ border: '1px solid #333', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#004080', color: '#fff', padding: '10px' }}>Date / Day</th>
                                <th style={{ background: '#2e7d32', color: '#fff', padding: '10px' }}>Earnings</th>
                                <th style={{ background: '#b71c1c', color: '#fff', padding: '10px' }}>Total Earnings</th>
                                <th style={{ background: '#1b5e20', color: '#fff', padding: '10px' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#1b1f27' }}>
                            {tableRows.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{formatDateString(row.date)}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(row.earnings)}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(row.totalEarnings)}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(row.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#263238', fontWeight: 'bold' }}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>Total</td>
                                <td colSpan={3} style={{ padding: '10px', textAlign: 'center' }}>{results.finalBalance > 0 && formatCurrency(results.finalBalance)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </>
        )}
      </div>
    </div>
  );
} 
