import React from 'react';

const CalculatorBar = ({ values = [], onClear, onRemove, formatDecimal }) => {
  const total = values.reduce((acc, cur) => acc + cur, 0);

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        borderRadius: '16px',
        border: '1px solid rgba(79, 140, 255, 0.2)',
        background: 'rgba(16,25,53,0.5)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      {values.length === 0 ? (
        <span style={{ color: '#b3baff' }}>Click a value to add it to the calculator</span>
      ) : (
        values.map((v, idx) => (
          <span
            key={idx}
            onClick={() => onRemove && onRemove(idx)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              background: 'rgba(79,140,255,0.2)',
              color: v >= 0 ? '#4f8cff' : '#ff4d4d',
              fontWeight: 600,
              cursor: onRemove ? 'pointer' : 'default',
            }}
          >
            {v >= 0 ? '+' : ''}{formatDecimal ? formatDecimal(v) : v.toFixed(6)}
          </span>
        ))
      )}

      <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#fff' }}>
        Total:&nbsp;
        <span style={{ color: total >= 0 ? '#4f8cff' : '#ff4d4d' }}>
          {formatDecimal ? formatDecimal(total) : total.toFixed(6)}
        </span>
      </span>

      {values.length > 0 && (
        <button
          onClick={onClear}
          style={{
            marginLeft: '1rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,77,77,0.4)',
            background: 'rgba(255,77,77,0.1)',
            color: '#ff4d4d',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default CalculatorBar; 
